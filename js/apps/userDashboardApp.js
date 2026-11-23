// ==============================================================================
// ParrotCloud OS - User Profile & Security Dashboard Application
// Profile Management, 5 OS Environments, Lab Progress, Points & Activity Feed
// ==============================================================================

class UserDashboardApp {
  constructor() {
    this.activeTab = 'os-envs'; // 'os-envs' | 'progress' | 'activity' | 'settings'
    this.container = null;
    this.windowInstance = null;
  }

  open(initialTab = 'os-envs') {
    this.activeTab = initialTab;

    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

    const container = document.createElement('div');
    container.className = 'user-dashboard-wrapper';
    this.container = container;

    this.render();

    this.windowInstance = window.windowManager.createWindow({
      id: 'user-dashboard',
      title: 'User Profile & Learning Dashboard',
      icon: iconSvg,
      width: 1040,
      height: 640,
      content: container,
      onClose: () => {
        this.container = null;
        this.windowInstance = null;
      }
    });

    // Subscribe to auth events
    if (window.authManager) {
      window.authManager.on('auth_state_changed', () => {
        if (this.container) this.render();
      });
      window.authManager.on('points_updated', () => {
        if (this.container) this.render();
      });
    }
  }

  render() {
    if (!this.container) return;

    const user = window.authManager?.getUser() || {
      username: 'Guest User',
      email: 'guest@parrotcloud.io',
      role: 'student',
      points: 0,
      diskQuotaMb: 5120
    };

    const role = (user.role || 'student').toLowerCase();
    const isAdmin = role === 'admin';
    const totalLabs = window.PRACTICE_LABS_DATA ? window.PRACTICE_LABS_DATA.length : 500;

    // Get completed count from practiceLabsApp state or local storage
    let completedLabsCount = 0;
    try {
      const state = JSON.parse(localStorage.getItem('parrotcloud_practice_labs_state') || '{}');
      completedLabsCount = Object.keys(state.completedLabs || {}).length;
    } catch (e) {}

    const pendingLabsCount = Math.max(0, totalLabs - completedLabsCount);
    const totalPoints = (user.points || 0) + (completedLabsCount * 10);
    const rank = this.calculateRank(totalPoints);
    const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Nov 2026';

    this.container.innerHTML = `
      <!-- TOP HEADER -->
      <header class="user-dash-header">
        <div class="user-dash-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;color:var(--parrot-cyan);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>User Security Dashboard</span>
          <span class="user-role-pill ${role}">${role.toUpperCase()}</span>
        </div>

        <div style="display:flex; align-items:center; gap:10px;">
          ${isAdmin ? `
            <button class="plab-btn danger" id="user-btn-open-admin" style="font-size:11px; padding:4px 10px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>Administrator Portal</span>
            </button>
          ` : ''}
          <button class="plab-btn secondary" id="user-btn-switch-account" style="font-size:11px; padding:4px 10px;">Switch User</button>
          <button class="plab-btn secondary" id="user-btn-logout" style="font-size:11px; padding:4px 10px; color:#ff3366;">Log Out</button>
        </div>
      </header>

      <!-- NAVIGATION TABS -->
      <nav class="user-dash-tabs">
        <button class="user-tab-btn ${this.activeTab === 'os-envs' ? 'active' : ''}" data-tab="os-envs">
          Operating Systems (5 OSes)
        </button>
        <button class="user-tab-btn ${this.activeTab === 'progress' ? 'active' : ''}" data-tab="progress">
          Learning Progress & Labs (${completedLabsCount}/${totalLabs})
        </button>
        <button class="user-tab-btn ${this.activeTab === 'activity' ? 'active' : ''}" data-tab="activity">
          Recent Activity Feed
        </button>
        <button class="user-tab-btn ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
          Security & Password
        </button>
      </nav>

      <!-- BODY VIEWPORT -->
      <main class="user-dash-body" id="user-dash-content">
        <!-- USER PROFILE HERO BANNER -->
        <div class="user-hero-card">
          <div class="user-hero-left">
            <div class="user-avatar-circle">
              ${user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="user-hero-name">Welcome back, ${user.username}!</div>
              <div class="user-hero-meta">
                <span>📧 ${user.email}</span>
                <span>•</span>
                <span>🗓️ Member since ${joinedDate}</span>
                <span>•</span>
                <span style="color:var(--parrot-cyan);">💾 Storage: 128 MB / ${user.diskQuotaMb || 5120} MB</span>
              </div>
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:11px; color:#8b949e; text-transform:uppercase; letter-spacing:0.5px;">Proficiency Rank</div>
            <div style="font-size:15px; font-weight:800; color:${rank.color};">${rank.title}</div>
          </div>
        </div>

        <!-- 4 STAT METRIC CARDS -->
        <div class="user-stats-grid">
          <div class="user-stat-card">
            <div class="user-stat-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div>
              <div class="user-stat-val" style="color:var(--parrot-purple);">${totalPoints}</div>
              <div class="user-stat-label">Total Points / Score</div>
            </div>
          </div>

          <div class="user-stat-card">
            <div class="user-stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <div class="user-stat-val" style="color:var(--parrot-green);">${completedLabsCount}</div>
              <div class="user-stat-label">Completed Labs</div>
            </div>
          </div>

          <div class="user-stat-card">
            <div class="user-stat-icon yellow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            </div>
            <div>
              <div class="user-stat-val" style="color:var(--parrot-yellow);">${pendingLabsCount}</div>
              <div class="user-stat-label">Pending Challenges</div>
            </div>
          </div>

          <div class="user-stat-card">
            <div class="user-stat-icon cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <div>
              <div class="user-stat-val" style="color:var(--parrot-cyan);">5 OS</div>
              <div class="user-stat-label">Operating Systems</div>
            </div>
          </div>
        </div>

        <!-- TAB BODY CONTENT -->
        <div id="user-tab-content-body">
          ${this.getTabContent(user, completedLabsCount, totalLabs)}
        </div>
      </main>
    `;

    this.bindEvents();
  }

  getTabContent(user, completedCount, totalCount) {
    if (this.activeTab === 'os-envs') {
      const osList = [
        {
          id: 'parrot',
          name: 'Parrot Security OS 6.0',
          edition: 'Security & Cloud Pentesting Edition',
          desc: 'Debian 12 base with full reconnaissance, Anonsurf, Tor routing, and cryptography toolset.',
          accent: '#00e5ff',
          status: 'Container Node Ready'
        },
        {
          id: 'kali',
          name: 'Kali Linux Rolling',
          edition: 'Penetration Testing Arsenal',
          desc: 'Offensive security workspace loaded with Metasploit, Nmap, Burp Suite, Hydra, and Wireshark.',
          accent: '#2a7fff',
          status: 'Container Node Ready'
        },
        {
          id: 'ubuntu',
          name: 'Ubuntu 24.04 LTS',
          edition: 'Noble Numbat Workstation',
          desc: 'Enterprise GNU/Linux distribution with systemd, GCC 13, Python 3.12, and Docker toolchain.',
          accent: '#E95420',
          status: 'Container Node Ready'
        },
        {
          id: 'mint',
          name: 'Linux Mint 22',
          edition: 'Cinnamon Edition',
          desc: 'User-friendly, high-stability Linux desktop ideal for shell scripting and security fundamentals.',
          accent: '#87cf3e',
          status: 'Container Node Ready'
        },
        {
          id: 'fedora',
          name: 'Fedora Security Lab 40',
          edition: 'Digital Forensics & Security Spin',
          desc: 'RPM-based forensics testing environment with memory analysis and network auditing tools.',
          accent: '#51a2da',
          status: 'Container Node Ready'
        }
      ];

      return `
        <div style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:14px; font-weight:800; color:#ffffff; margin:0; text-transform:uppercase;">
            Available Cloud Linux Environments
          </h3>
          <span style="font-size:11px; color:#8b949e;">Each container runs in an isolated user network namespace</span>
        </div>

        <div class="os-grid-cards">
          ${osList.map(os => `
            <div class="os-launch-card" data-os="${os.id}">
              <div>
                <div class="os-launch-top">
                  <div class="os-launch-icon" style="background:${os.accent}22; border:1px solid ${os.accent}; color:${os.accent};">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path></svg>
                  </div>
                  <div>
                    <div class="os-launch-name">${os.name}</div>
                    <div class="os-launch-edition">${os.edition}</div>
                  </div>
                </div>
                <p style="font-size:11.5px; color:#c9d1d9; line-height:1.45; margin:0 0 10px;">${os.desc}</p>
                <div style="font-size:10px; font-family:var(--font-mono); color:var(--parrot-green); display:flex; align-items:center; gap:6px;">
                  <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#05d550;"></span>
                  <span>${os.status}</span>
                </div>
              </div>

              <div class="os-launch-actions">
                <button class="plab-btn primary user-os-launch-btn" data-os="${os.id}" style="flex:1; justify-content:center;">
                  Launch Lab Terminal ▶
                </button>
                <button class="plab-btn secondary user-os-vnc-btn" data-os="${os.id}" title="Launch noVNC Desktop">
                  noVNC GUI
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'progress') {
      const categories = [
        { name: 'Linux Fundamentals', total: 50, icon: '🐧' },
        { name: 'Networking', total: 40, icon: '🌐' },
        { name: 'Kali Linux', total: 40, icon: '🐉' },
        { name: 'Parrot OS', total: 40, icon: '🦜' },
        { name: 'Ubuntu', total: 30, icon: '🟠' },
        { name: 'Python Programming', total: 30, icon: '🐍' },
        { name: 'Web Security', total: 40, icon: '🛡️' },
        { name: 'OWASP Top 10', total: 25, icon: '🔒' },
        { name: 'SQL Injection (safe simulated environment)', total: 25, icon: '💉' },
        { name: 'XSS (safe simulated environment)', total: 25, icon: '⚡' },
        { name: 'Cryptography', total: 25, icon: '🔐' },
        { name: 'Digital Forensics', total: 25, icon: '🔍' },
        { name: 'OSINT', total: 25, icon: '📡' },
        { name: 'Password Security', total: 30, icon: '🔑' },
        { name: 'CTF Challenges', total: 50, icon: '🚩' }
      ];

      return `
        <div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="font-size:14px; font-weight:800; color:#ffffff; margin:0 0 4px; text-transform:uppercase;">
              Learning Progress Across 15 Core Domains
            </h3>
            <div style="font-size:12px; color:#8b949e;">Completed: ${completedCount} / ${totalCount} Hands-On Labs (${((completedCount / totalCount) * 100).toFixed(1)}%)</div>
          </div>
          <button class="plab-btn primary" id="user-btn-open-500-labs">Open 500 Labs Academy →</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(290px, 1fr)); gap:12px; margin-bottom:24px;">
          ${categories.map(cat => {
            const completedInCat = Math.min(cat.total, Math.round((completedCount / totalCount) * cat.total));
            const pct = Math.round((completedInCat / cat.total) * 100);

            return `
              <div style="background:#101622; border:1px solid #1f2c3d; border-radius:6px; padding:12px 14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-size:12.5px; font-weight:700; color:#ffffff;">${cat.icon} ${cat.name}</span>
                  <span style="font-size:11px; font-family:var(--font-mono); color:var(--parrot-cyan);">${completedInCat}/${cat.total}</span>
                </div>
                <div class="plab-progress-track" style="height:6px;">
                  <div class="plab-progress-bar" style="width:${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'activity') {
      const activities = [
        { title: 'User Signed In', desc: `Session authenticated for ${user.username}`, time: 'Just now', icon: '🔑', color: 'cyan' },
        { title: 'Terminal Shell Connected', desc: 'Active session on safe practice container', time: '10 mins ago', icon: '💻', color: 'green' },
        { title: 'Practice Lab Solved: Find the Linux OS', desc: 'Executed cat /etc/os-release (+10 points)', time: '25 mins ago', icon: '🏆', color: 'purple' },
        { title: 'Achievement Unlocked: First Steps', desc: 'Completed first hands-on cybersecurity experiment', time: '1 hour ago', icon: '🎯', color: 'yellow' },
        { title: 'Security Portal Registered', desc: 'Account created with standard persistent volume', time: 'Yesterday', icon: '🛡️', color: 'cyan' }
      ];

      return `
        <div style="margin-bottom:14px;">
          <h3 style="font-size:14px; font-weight:800; color:#ffffff; margin:0 0 4px; text-transform:uppercase;">
            Recent Security & Training Activities
          </h3>
          <div style="font-size:12px; color:#8b949e;">Logged platform events for user ID #${user.id || 1}</div>
        </div>

        <div class="activity-feed-list">
          ${activities.map(act => `
            <div class="activity-feed-item">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:16px;">${act.icon}</span>
                <div>
                  <div style="font-weight:700; color:#ffffff;">${act.title}</div>
                  <div style="font-size:11px; color:#8b949e;">${act.desc}</div>
                </div>
              </div>
              <span style="font-size:11px; font-family:var(--font-mono); color:#8b949e;">${act.time}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.activeTab === 'settings') {
      return `
        <div style="max-width:560px;">
          <div style="margin-bottom:16px;">
            <h3 style="font-size:14px; font-weight:800; color:#ffffff; margin:0 0 4px; text-transform:uppercase;">
              Account Security & Password Management
            </h3>
            <div style="font-size:12px; color:#8b949e;">Update your access credentials or modify your profile.</div>
          </div>

          <div id="user-settings-alert"></div>

          <form id="form-user-change-password" onsubmit="return false;" style="background:#101622; border:1px solid #1f2c3d; border-radius:8px; padding:18px;">
            <div class="auth-input-group">
              <label class="auth-label">Registered Username</label>
              <input type="text" class="auth-input" value="${user.username}" disabled style="opacity:0.7;" />
            </div>

            <div class="auth-input-group">
              <label class="auth-label">Email Address</label>
              <input type="email" class="auth-input" id="set-email" value="${user.email}" />
            </div>

            <div class="auth-input-group">
              <label class="auth-label">Current Password</label>
              <input type="password" class="auth-input" id="set-current-pass" placeholder="••••••••" required />
            </div>

            <div class="auth-input-group">
              <label class="auth-label">New Password (Min. 8 characters)</label>
              <input type="password" class="auth-input" id="set-new-pass" placeholder="••••••••" required />
            </div>

            <div class="auth-input-group">
              <label class="auth-label">Confirm New Password</label>
              <input type="password" class="auth-input" id="set-confirm-pass" placeholder="••••••••" required />
            </div>

            <button type="submit" class="plab-btn primary" id="btn-save-settings" style="width:100%; justify-content:center; padding:10px;">
              Update Security Credentials
            </button>
          </form>
        </div>
      `;
    }
  }

  bindEvents() {
    // Tab switching
    this.container.querySelectorAll('.user-tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      };
    });

    // Logout button
    const logoutBtn = this.container.querySelector('#user-btn-logout');
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        if (confirm('Are you sure you want to log out of your session?')) {
          await window.authManager?.logout();
          if (this.windowInstance) {
            window.windowManager.closeWindow('user-dashboard');
          }
          if (typeof window.openAuthApp === 'function') {
            window.openAuthApp('login');
          }
        }
      };
    }

    // Switch User button
    const switchUserBtn = this.container.querySelector('#user-btn-switch-account');
    if (switchUserBtn) {
      switchUserBtn.onclick = () => {
        if (typeof window.openAuthApp === 'function') {
          window.openAuthApp('login');
        }
      };
    }

    // Open Admin Dashboard button
    const adminBtn = this.container.querySelector('#user-btn-open-admin');
    if (adminBtn) {
      adminBtn.onclick = () => {
        if (typeof window.openAdminDashboardApp === 'function') {
          window.openAdminDashboardApp();
        }
      };
    }

    // OS Launch buttons
    this.container.querySelectorAll('.user-os-launch-btn').forEach(btn => {
      btn.onclick = () => {
        const osId = btn.getAttribute('data-os');
        if (typeof window.openCyberLabApp === 'function') {
          window.openCyberLabApp();
          if (window.cyberLabApp) {
            window.cyberLabApp.selectOs(osId);
          }
        }
      };
    });

    this.container.querySelectorAll('.user-os-vnc-btn').forEach(btn => {
      btn.onclick = () => {
        if (typeof window.openNoVNCApp === 'function') {
          window.openNoVNCApp();
        }
      };
    });

    // Open 500 Labs button
    const openLabsBtn = this.container.querySelector('#user-btn-open-500-labs');
    if (openLabsBtn) {
      openLabsBtn.onclick = () => {
        if (typeof window.openPracticeLabsApp === 'function') {
          window.openPracticeLabsApp();
        }
      };
    }

    // Password change form
    const pwdForm = this.container.querySelector('#form-user-change-password');
    if (pwdForm) {
      pwdForm.onsubmit = async () => {
        const curPass = this.container.querySelector('#set-current-pass')?.value;
        const newPass = this.container.querySelector('#set-new-pass')?.value;
        const confPass = this.container.querySelector('#set-confirm-pass')?.value;
        const email = this.container.querySelector('#set-email')?.value;
        const alertBox = this.container.querySelector('#user-settings-alert');

        if (newPass && newPass.length < 8) {
          alertBox.innerHTML = '<div class="auth-alert error">New password must be at least 8 characters.</div>';
          return;
        }

        if (newPass && newPass !== confPass) {
          alertBox.innerHTML = '<div class="auth-alert error">Passwords do not match.</div>';
          return;
        }

        try {
          alertBox.innerHTML = '<div class="auth-alert info">Updating profile...</div>';
          const token = window.authManager?.token;
          const res = await fetch(`${window.authManager.apiBase}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword: curPass, newPassword: newPass, email })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Update failed.');

          alertBox.innerHTML = '<div class="auth-alert success">Credentials updated successfully!</div>';
          if (window.notifications) {
            window.notifications.show('Profile Updated', 'Your security settings have been saved.', 'info');
          }
        } catch (e) {
          alertBox.innerHTML = `<div class="auth-alert error">${e.message}</div>`;
        }
      };
    }
  }

  calculateRank(points) {
    if (points >= 1000) return { title: 'Cyber Sentinel Master (Level 10)', color: '#ff3366' };
    if (points >= 750)  return { title: 'Principal Security Architect (Level 9)', color: '#bb86fc' };
    if (points >= 500)  return { title: 'Lead Penetration Tester (Level 8)', color: '#00e5ff' };
    if (points >= 350)  return { title: 'Senior Security Analyst (Level 7)', color: '#05d550' };
    if (points >= 200)  return { title: 'Cyber Defense Operator (Level 6)', color: '#58a6ff' };
    if (points >= 100)  return { title: 'Linux Systems Specialist (Level 5)', color: '#ffcc00' };
    if (points >= 50)   return { title: 'Junior Security Engineer (Level 4)', color: '#7ee787' };
    if (points >= 20)   return { title: 'Security Apprentice (Level 3)', color: '#79c0ff' };
    if (points >= 10)   return { title: 'Terminal Recruit (Level 2)', color: '#c9d1d9' };
    return { title: 'Initiate (Level 1)', color: '#8b949e' };
  }
}

// Global Singleton
window.userDashboardApp = new UserDashboardApp();
window.openUserDashboardApp = (tab) => window.userDashboardApp.open(tab);
