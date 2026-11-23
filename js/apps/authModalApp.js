// ==============================================================================
// ParrotCloud OS - Authentication Modal Application
// Login, Register, Forgot Password, Password Visibility Toggles & Form Validation
// ==============================================================================

class AuthModalApp {
  constructor() {
    this.activeTab = 'login'; // 'login' | 'register' | 'forgot' | 'reset'
    this.container = null;
    this.windowInstance = null;
    this.resetEmail = '';
    this.resetToken = '';
  }

  open(initialTab = 'login') {
    this.activeTab = initialTab;

    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

    const container = document.createElement('div');
    container.className = 'auth-modal-wrapper';
    this.container = container;

    this.render();

    this.windowInstance = window.windowManager.createWindow({
      id: 'auth-modal',
      title: 'Security Portal – Login & Registration',
      icon: iconSvg,
      width: 480,
      height: 600,
      content: container,
      onClose: () => {
        this.container = null;
        this.windowInstance = null;
      }
    });
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="auth-card">
        <!-- Card Header -->
        <div class="auth-header">
          <div class="auth-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div>
            <div class="auth-title">PARROTCLOUD SECURITY PORTAL</div>
            <div class="auth-subtitle">AUTHENTICATED ACCESS CONTROL</div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="auth-tabs">
          <button class="auth-tab-btn ${this.activeTab === 'login' ? 'active' : ''}" data-tab="login">Sign In</button>
          <button class="auth-tab-btn ${this.activeTab === 'register' ? 'active' : ''}" data-tab="register">Register</button>
          <button class="auth-tab-btn ${this.activeTab === 'forgot' || this.activeTab === 'reset' ? 'active' : ''}" data-tab="forgot">Recovery</button>
        </div>

        <!-- Dynamic Form Content -->
        <div class="auth-body" id="auth-form-content">
          ${this.getFormHtml()}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  getFormHtml() {
    if (this.activeTab === 'login') {
      return `
        <div id="auth-alert-box"></div>
        <form id="form-login" onsubmit="return false;">
          <div class="auth-input-group">
            <label class="auth-label">Email or Username</label>
            <div class="auth-input-wrapper">
              <input type="text" class="auth-input" id="login-identifier" placeholder="admin@parrotcloud.io or student" required autocomplete="username" />
            </div>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Password</label>
            <div class="auth-input-wrapper with-toggle">
              <input type="password" class="auth-input" id="login-password" placeholder="••••••••" required autocomplete="current-password" />
              <button type="button" class="auth-pw-toggle" data-target="login-password" title="Toggle password visibility">
                ${this.getEyeSvg()}
              </button>
            </div>
          </div>

          <div class="auth-row-options">
            <label class="auth-checkbox-label">
              <input type="checkbox" id="login-remember" checked />
              <span>Remember login session</span>
            </label>
            <a class="auth-link" id="link-forgot-pass">Forgot password?</a>
          </div>

          <button type="submit" class="auth-btn-primary" id="btn-submit-login">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            <span>Log In to CloudOS</span>
          </button>
        </form>

        <div class="auth-demo-hint">
          <strong>Default Demonstration Accounts:</strong><br>
          • <strong>Administrator:</strong> <code>admin@parrotcloud.io</code> | <code>Admin@123456</code><br>
          • <strong>Student User:</strong> <code>student@parrotcloud.io</code> | <code>Student@123456</code>
        </div>
      `;
    }

    if (this.activeTab === 'register') {
      return `
        <div id="auth-alert-box"></div>
        <form id="form-register" onsubmit="return false;">
          <div class="auth-input-group">
            <label class="auth-label">Username</label>
            <div class="auth-input-wrapper">
              <input type="text" class="auth-input" id="reg-username" placeholder="cyber_student" required autocomplete="username" />
            </div>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Email Address</label>
            <div class="auth-input-wrapper">
              <input type="email" class="auth-input" id="reg-email" placeholder="student@example.com" required autocomplete="email" />
            </div>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Account Role</label>
            <div class="auth-input-wrapper">
              <select class="auth-input" id="reg-role" style="background:#090e16; cursor:pointer;">
                <option value="student">Student / Cyber Practitioner</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>
          </div>

          <div class="auth-input-group" id="reg-admin-secret-group" style="display:none;">
            <label class="auth-label" style="color:var(--parrot-yellow);">Admin Verification Key</label>
            <div class="auth-input-wrapper">
              <input type="password" class="auth-input" id="reg-admin-key" placeholder="Enter parrot_admin_secure_2026" />
            </div>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Password (Min. 8 characters)</label>
            <div class="auth-input-wrapper with-toggle">
              <input type="password" class="auth-input" id="reg-password" placeholder="••••••••" required autocomplete="new-password" />
              <button type="button" class="auth-pw-toggle" data-target="reg-password" title="Toggle password visibility">
                ${this.getEyeSvg()}
              </button>
            </div>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Confirm Password</label>
            <div class="auth-input-wrapper with-toggle">
              <input type="password" class="auth-input" id="reg-confirm-password" placeholder="••••••••" required autocomplete="new-password" />
              <button type="button" class="auth-pw-toggle" data-target="reg-confirm-password" title="Toggle password visibility">
                ${this.getEyeSvg()}
              </button>
            </div>
          </div>

          <div class="auth-row-options">
            <label class="auth-checkbox-label">
              <input type="checkbox" id="reg-agree" checked required />
              <span>I agree to Ethical Hacking Guidelines</span>
            </label>
          </div>

          <button type="submit" class="auth-btn-primary" id="btn-submit-register">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            <span>Create New Account</span>
          </button>
        </form>
      `;
    }

    if (this.activeTab === 'forgot') {
      return `
        <div id="auth-alert-box"></div>
        <p style="font-size:12px; color:#8b949e; line-height:1.5; margin-top:0;">
          Enter your registered email address below. A cryptographic password reset token will be issued.
        </p>
        <form id="form-forgot" onsubmit="return false;">
          <div class="auth-input-group">
            <label class="auth-label">Account Email Address</label>
            <div class="auth-input-wrapper">
              <input type="email" class="auth-input" id="forgot-email" placeholder="student@parrotcloud.io" required />
            </div>
          </div>

          <button type="submit" class="auth-btn-primary" id="btn-submit-forgot">
            <span>Send Reset Token →</span>
          </button>
        </form>

        <div style="margin-top:16px; text-align:center;">
          <a class="auth-link" id="link-back-login">← Back to Sign In</a>
        </div>
      `;
    }

    if (this.activeTab === 'reset') {
      return `
        <div id="auth-alert-box"></div>
        <div class="auth-alert info">
          Token verified! Please choose a new secure password for your account.
        </div>
        <form id="form-reset" onsubmit="return false;">
          <div class="auth-input-group">
            <label class="auth-label">Recovery Token</label>
            <div class="auth-input-wrapper">
              <input type="text" class="auth-input" id="reset-token" value="${this.resetToken}" required style="font-family:var(--font-mono);" />
            </div>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">New Password (Min. 8 characters)</label>
            <div class="auth-input-wrapper with-toggle">
              <input type="password" class="auth-input" id="reset-new-password" placeholder="••••••••" required />
              <button type="button" class="auth-pw-toggle" data-target="reset-new-password">
                ${this.getEyeSvg()}
              </button>
            </div>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Confirm New Password</label>
            <div class="auth-input-wrapper with-toggle">
              <input type="password" class="auth-input" id="reset-confirm-password" placeholder="••••••••" required />
              <button type="button" class="auth-pw-toggle" data-target="reset-confirm-password">
                ${this.getEyeSvg()}
              </button>
            </div>
          </div>

          <button type="submit" class="auth-btn-primary" id="btn-submit-reset">
            <span>Update Password & Log In</span>
          </button>
        </form>
      `;
    }
  }

  bindEvents() {
    // Tab switching
    this.container.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      };
    });

    // Password visibility toggle buttons
    this.container.querySelectorAll('.auth-pw-toggle').forEach(btn => {
      btn.onclick = () => {
        const targetId = btn.getAttribute('data-target');
        const input = this.container.querySelector(`#${targetId}`);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword ? this.getEyeOffSvg() : this.getEyeSvg();
      };
    });

    // Login Form Submission
    const loginForm = this.container.querySelector('#form-login');
    if (loginForm) {
      loginForm.onsubmit = () => this.handleLogin();
    }

    // Register Form Submission
    const regForm = this.container.querySelector('#form-register');
    const roleSelect = this.container.querySelector('#reg-role');
    const adminKeyGroup = this.container.querySelector('#reg-admin-secret-group');

    if (roleSelect && adminKeyGroup) {
      roleSelect.onchange = () => {
        adminKeyGroup.style.display = roleSelect.value === 'admin' ? 'block' : 'none';
      };
    }

    if (regForm) {
      regForm.onsubmit = () => this.handleRegister();
    }

    // Forgot Password Form Submission
    const forgotForm = this.container.querySelector('#form-forgot');
    if (forgotForm) {
      forgotForm.onsubmit = () => this.handleForgotPassword();
    }

    // Reset Password Form Submission
    const resetForm = this.container.querySelector('#form-reset');
    if (resetForm) {
      resetForm.onsubmit = () => this.handleResetPassword();
    }

    // Links
    const forgotLink = this.container.querySelector('#link-forgot-pass');
    if (forgotLink) {
      forgotLink.onclick = () => {
        this.activeTab = 'forgot';
        this.render();
      };
    }

    const backLoginLink = this.container.querySelector('#link-back-login');
    if (backLoginLink) {
      backLoginLink.onclick = () => {
        this.activeTab = 'login';
        this.render();
      };
    }
  }

  async handleLogin() {
    const idInput = this.container.querySelector('#login-identifier');
    const passInput = this.container.querySelector('#login-password');
    const remInput = this.container.querySelector('#login-remember');
    const alertBox = this.container.querySelector('#auth-alert-box');

    const identifier = idInput ? idInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const rememberMe = remInput ? remInput.checked : true;

    if (!identifier || !password) {
      this.showAlert(alertBox, 'Please provide both email/username and password.', 'error');
      return;
    }

    try {
      this.showAlert(alertBox, 'Authenticating credentials with security gateway...', 'info');
      const user = await window.authManager.login(identifier, password, rememberMe);

      this.showAlert(alertBox, `Authentication successful! Welcome, ${user.username}.`, 'success');

      if (window.notifications) {
        window.notifications.show('Signed In', `Welcome back, ${user.username}! Role: ${user.role.toUpperCase()}`, 'info');
      }

      setTimeout(() => {
        if (this.windowInstance) {
          window.windowManager.closeWindow('auth-modal');
        }
        // Open User Dashboard on successful sign in
        if (typeof window.openUserDashboardApp === 'function') {
          window.openUserDashboardApp();
        }
      }, 500);
    } catch (err) {
      this.showAlert(alertBox, err.message, 'error');
    }
  }

  async handleRegister() {
    const userInput = this.container.querySelector('#reg-username');
    const emailInput = this.container.querySelector('#reg-email');
    const roleSelect = this.container.querySelector('#reg-role');
    const keyInput = this.container.querySelector('#reg-admin-key');
    const passInput = this.container.querySelector('#reg-password');
    const confInput = this.container.querySelector('#reg-confirm-password');
    const agreeInput = this.container.querySelector('#reg-agree');
    const alertBox = this.container.querySelector('#auth-alert-box');

    const username = userInput ? userInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const role = roleSelect ? roleSelect.value : 'student';
    const adminKey = keyInput ? keyInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const confirm = confInput ? confInput.value : '';

    if (!username || !email || !password) {
      this.showAlert(alertBox, 'All fields are required.', 'error');
      return;
    }

    if (!/^[a-z0-9_]{3,30}$/i.test(username)) {
      this.showAlert(alertBox, 'Username must be 3-30 alphanumeric characters.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.showAlert(alertBox, 'Please provide a valid email address.', 'error');
      return;
    }

    if (password.length < 8) {
      this.showAlert(alertBox, 'Password must be at least 8 characters long.', 'error');
      return;
    }

    if (password !== confirm) {
      this.showAlert(alertBox, 'Passwords do not match.', 'error');
      return;
    }

    if (agreeInput && !agreeInput.checked) {
      this.showAlert(alertBox, 'Please agree to ethical hacking terms.', 'error');
      return;
    }

    try {
      this.showAlert(alertBox, 'Registering account and provisioning secure workspace...', 'info');
      const user = await window.authManager.register(username, email, password, role, adminKey);

      this.showAlert(alertBox, `Account created! Logged in as ${user.username}.`, 'success');

      if (window.notifications) {
        window.notifications.show('Account Registered', `Welcome to ParrotCloud OS, ${user.username}!`, 'info');
      }

      setTimeout(() => {
        if (this.windowInstance) {
          window.windowManager.closeWindow('auth-modal');
        }
        if (typeof window.openUserDashboardApp === 'function') {
          window.openUserDashboardApp();
        }
      }, 600);
    } catch (err) {
      this.showAlert(alertBox, err.message, 'error');
    }
  }

  async handleForgotPassword() {
    const emailInput = this.container.querySelector('#forgot-email');
    const alertBox = this.container.querySelector('#auth-alert-box');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      this.showAlert(alertBox, 'Please enter your account email address.', 'error');
      return;
    }

    try {
      this.showAlert(alertBox, 'Generating password reset token...', 'info');
      const res = await window.authManager.forgotPassword(email);
      this.resetToken = res.resetToken || '';
      this.activeTab = 'reset';
      this.render();
    } catch (err) {
      this.showAlert(alertBox, err.message, 'error');
    }
  }

  async handleResetPassword() {
    const tokenInput = this.container.querySelector('#reset-token');
    const newPassInput = this.container.querySelector('#reset-new-password');
    const confPassInput = this.container.querySelector('#reset-confirm-password');
    const alertBox = this.container.querySelector('#auth-alert-box');

    const token = tokenInput ? tokenInput.value.trim() : '';
    const newPass = newPassInput ? newPassInput.value : '';
    const confPass = confPassInput ? confPassInput.value : '';

    if (!token || !newPass) {
      this.showAlert(alertBox, 'Token and new password are required.', 'error');
      return;
    }

    if (newPass.length < 8) {
      this.showAlert(alertBox, 'Password must be at least 8 characters.', 'error');
      return;
    }

    if (newPass !== confPass) {
      this.showAlert(alertBox, 'Passwords do not match.', 'error');
      return;
    }

    try {
      this.showAlert(alertBox, 'Updating account password hash...', 'info');
      await window.authManager.resetPassword(token, newPass);

      this.showAlert(alertBox, 'Password updated successfully! Redirecting to login...', 'success');
      setTimeout(() => {
        this.activeTab = 'login';
        this.render();
      }, 1200);
    } catch (err) {
      this.showAlert(alertBox, err.message, 'error');
    }
  }

  showAlert(container, message, type = 'error') {
    if (!container) return;
    container.innerHTML = `
      <div class="auth-alert ${type}">
        ${type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️'}
        <span>${message}</span>
      </div>
    `;
  }

  getEyeSvg() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  }

  getEyeOffSvg() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
  }
}

// Global Singleton
window.authModalApp = new AuthModalApp();
window.openAuthApp = (tab) => window.authModalApp.open(tab);
