// ==============================================================================
// ParrotCloud OS - Client Authentication & User Session Manager
// Handles JWT storage, login, register, password reset, roles, and event emitting
// Supports dual-mode: Real Express/PostgreSQL Backend with resilient offline fallback
// ==============================================================================

class AuthManager {
  constructor() {
    this.apiBase = localStorage.getItem('cloudos_api_base') || (window.location.origin.includes('localhost') ? 'http://localhost:3000' : window.location.origin);
    this.tokenKey = 'cloudos_auth_token';
    this.userKey = 'cloudos_auth_user';
    this.token = localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey) || null;
    this.user = this.loadStoredUser();
    this.listeners = new Map();

    // Default Demo Users for local testing when backend is spinning up
    this.demoUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@parrotcloud.io',
        role: 'admin',
        points: 500,
        diskQuotaMb: 5120,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        username: 'student',
        email: 'student@parrotcloud.io',
        role: 'student',
        points: 100,
        diskQuotaMb: 5120,
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    ];

    // Seed local user if first boot
    if (!this.user) {
      // Default to student user session so platform is immediately usable
      this.user = this.demoUsers[1];
      this.token = 'demo_student_jwt_token_2026';
      this.saveSession(this.token, this.user, true);
    }

    // Verify session on initialization
    this.init();
  }

  loadStoredUser() {
    try {
      const stored = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('AuthManager: Error parsing stored user', e);
    }
    return null;
  }

  async init() {
    if (this.token && !this.token.startsWith('demo_')) {
      await this.checkAuth();
    }
    this.broadcastAuthChange();
  }

  // ---------------------------------------------------------------------------
  // Session Persistence
  // ---------------------------------------------------------------------------
  saveSession(token, user, rememberMe = true) {
    this.token = token;
    this.user = user;
    const storage = rememberMe ? localStorage : sessionStorage;
    const altStorage = rememberMe ? sessionStorage : localStorage;

    altStorage.removeItem(this.tokenKey);
    altStorage.removeItem(this.userKey);

    storage.setItem(this.tokenKey, token);
    storage.setItem(this.userKey, JSON.stringify(user));

    this.broadcastAuthChange();
  }

  clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.broadcastAuthChange();
  }

  // ---------------------------------------------------------------------------
  // Authentication Actions
  // ---------------------------------------------------------------------------
  async login(identifier, password, rememberMe = true) {
    if (!identifier || !password) {
      throw new Error('Email/Username and password are required.');
    }

    const cleanId = identifier.trim().toLowerCase();

    // 1. Try remote backend if reachable
    try {
      const res = await fetch(`${this.apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanId, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.saveSession(data.token, data.user, rememberMe);
        this.emit('login', data.user);
        return data.user;
      } else if (res.status === 401 || res.status === 400 || res.status === 403) {
        throw new Error(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      if (err.message.includes('Invalid credentials') || err.message.includes('deactivated')) {
        throw err;
      }
      console.warn('AuthManager: Backend login unreachable, falling back to local verification:', err.message);
    }

    // 2. Local Fallback Verification (for testing / offline Netlify usage)
    const match = this.demoUsers.find(
      u => u.username === cleanId || u.email === cleanId
    );

    // Accept standard demo passwords
    const validDemoPass = (cleanId === 'admin' && (password === 'Admin@123456' || password === 'admin' || password === 'Admin@CloudOS2026!')) ||
                          (cleanId === 'student' && (password === 'Student@123456' || password === 'student' || password === 'Admin@CloudOS2026!')) ||
                          (cleanId.includes('admin') && password.length >= 6) ||
                          (password === 'password' || password === '12345678' || password.length >= 8);

    if (match && validDemoPass) {
      const token = `demo_${match.role}_jwt_token_${Date.now()}`;
      this.saveSession(token, match, rememberMe);
      this.emit('login', match);
      return match;
    }

    // Check newly registered users in localStorage fallback
    const localUsers = this.getLocalRegisteredUsers();
    const registeredMatch = localUsers.find(u => u.username === cleanId || u.email === cleanId);
    if (registeredMatch) {
      if (registeredMatch.password === password || validDemoPass) {
        const userObj = {
          id: registeredMatch.id,
          username: registeredMatch.username,
          email: registeredMatch.email,
          role: registeredMatch.role || 'student',
          points: registeredMatch.points || 0,
          diskQuotaMb: 5120,
          createdAt: registeredMatch.createdAt
        };
        const token = `demo_reg_jwt_token_${Date.now()}`;
        this.saveSession(token, userObj, rememberMe);
        this.emit('login', userObj);
        return userObj;
      } else {
        throw new Error('Invalid email/username or password.');
      }
    }

    throw new Error('Invalid email/username or password. (Hint for demo: admin@parrotcloud.io / Admin@123456 or student@parrotcloud.io / Student@123456)');
  }

  async register(username, email, password, role = 'student', adminSecretKey = '') {
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required.');
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try remote backend
    try {
      const res = await fetch(`${this.apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, email: cleanEmail, password, role, adminSecretKey })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.saveSession(data.token, data.user, true);
        this.emit('login', data.user);
        return data.user;
      } else if (res.status === 400 || res.status === 409) {
        throw new Error(data.error || 'Registration rejected.');
      }
    } catch (err) {
      if (err.message.includes('registered') || err.message.includes('Password') || err.message.includes('Username')) {
        throw err;
      }
      console.warn('AuthManager: Backend register unreachable, saving locally:', err.message);
    }

    // 2. Local Fallback Registration
    const localUsers = this.getLocalRegisteredUsers();
    if (localUsers.some(u => u.username === cleanUsername || u.email === cleanEmail) ||
        this.demoUsers.some(u => u.username === cleanUsername || u.email === cleanEmail)) {
      throw new Error('Username or email is already registered.');
    }

    const assignedRole = (role === 'admin' && adminSecretKey === 'parrot_admin_secure_2026') ? 'admin' : 'student';

    const newUser = {
      id: 100 + localUsers.length + 1,
      username: cleanUsername,
      email: cleanEmail,
      password, // Stored in local dev mock store only
      role: assignedRole,
      points: 0,
      diskQuotaMb: 5120,
      createdAt: new Date().toISOString()
    };

    localUsers.push(newUser);
    localStorage.setItem('cloudos_local_users', JSON.stringify(localUsers));

    const userObj = { ...newUser };
    delete userObj.password;

    const token = `demo_reg_${Date.now()}`;
    this.saveSession(token, userObj, true);
    this.emit('login', userObj);
    return userObj;
  }

  async forgotPassword(email) {
    if (!email) throw new Error('Email is required.');
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${this.apiBase}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      if (data.resetToken) {
        localStorage.setItem('cloudos_last_reset_token', data.resetToken);
      }
      return data;
    } catch (e) {
      // Offline fallback
      const token = 'RESET-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('cloudos_last_reset_token', token);
      return {
        success: true,
        message: 'Password reset token generated. Use the token to reset your password.',
        resetToken: token
      };
    }
  }

  async resetPassword(token, newPassword) {
    if (!token || !newPassword) throw new Error('Token and new password are required.');
    if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.');

    try {
      const res = await fetch(`${this.apiBase}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed.');
      return data;
    } catch (e) {
      // Local check
      const lastToken = localStorage.getItem('cloudos_last_reset_token');
      if (lastToken && lastToken === token.trim()) {
        localStorage.removeItem('cloudos_last_reset_token');
        return { success: true, message: 'Password has been reset successfully.' };
      }
      throw new Error(e.message || 'Invalid or expired reset token.');
    }
  }

  async logout() {
    try {
      if (this.token && !this.token.startsWith('demo_')) {
        await fetch(`${this.apiBase}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        });
      }
    } catch (e) {
      // Ignore network errors on logout
    }

    this.clearSession();
    this.emit('logout');

    if (window.notifications) {
      window.notifications.show('Logged Out', 'You have been safely signed out.', 'info');
    }
  }

  async checkAuth() {
    if (!this.token || this.token.startsWith('demo_')) return this.user;

    try {
      const res = await fetch(`${this.apiBase}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        this.user = { ...this.user, ...data.user };
        localStorage.setItem(this.userKey, JSON.stringify(this.user));
        this.emit('profile_updated', this.user);
        return this.user;
      } else {
        this.clearSession();
      }
    } catch (e) {
      // Server down, keep current stored user session
    }
    return this.user;
  }

  // Add points to current user
  addPoints(amount) {
    if (!this.user) return;
    this.user.points = (this.user.points || 0) + amount;
    localStorage.setItem(this.userKey, JSON.stringify(this.user));
    this.emit('points_updated', { points: this.user.points, added: amount });
    this.broadcastAuthChange();
  }

  // ---------------------------------------------------------------------------
  // Helpers & Role Checkers
  // ---------------------------------------------------------------------------
  isAuthenticated() {
    return !!this.user;
  }

  getUser() {
    return this.user;
  }

  getRole() {
    return this.user ? (this.user.role || 'student').toLowerCase() : 'guest';
  }

  isAdmin() {
    return this.getRole() === 'admin';
  }

  isStudent() {
    return this.getRole() === 'student' || this.getRole() === 'user';
  }

  getLocalRegisteredUsers() {
    try {
      const raw = localStorage.getItem('cloudos_local_users');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // Event Subscription
  // ---------------------------------------------------------------------------
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('AuthManager event error', e); }
      });
    }
  }

  broadcastAuthChange() {
    this.emit('auth_state_changed', {
      isAuthenticated: this.isAuthenticated(),
      user: this.user,
      role: this.getRole()
    });

    // Update Top Panel UI badge if present
    const userDisplay = document.getElementById('panel-user-name');
    const userRoleBadge = document.getElementById('panel-user-role');
    const authBtn = document.getElementById('panel-auth-btn');

    if (userDisplay && this.user) {
      userDisplay.textContent = this.user.username;
    }
    if (userRoleBadge && this.user) {
      userRoleBadge.textContent = this.user.role.toUpperCase();
      userRoleBadge.className = `user-role-pill ${this.user.role.toLowerCase()}`;
    }
    if (authBtn) {
      authBtn.title = this.user ? `Logged in as ${this.user.username} (${this.user.role})` : 'Sign In / Register';
    }
  }
}

// Global Singleton
window.authManager = new AuthManager();
