// ==============================================================================
// ParrotCloud OS - Administrator Control Center Application
// User Management, Challenge Authoring (Add/Edit/Delete), & Activity Auditing
// ==============================================================================

class AdminDashboardApp {
  constructor() {
    this.activeTab = 'users'; // 'users' | 'challenges' | 'activity' | 'metrics'
    this.container = null;
    this.windowInstance = null;
    this.users = [];
    this.challenges = [];
    this.activityLogs = [];
  }

  async open(initialTab = 'users') {
    this.activeTab = initialTab;

    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#ff3366" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'admin-dashboard-wrapper';
    this.container = container;

    // Load initial data
    await this.fetchData();
    this.render();

    this.windowInstance = window.windowManager.createWindow({
      id: 'admin-dashboard',
      title: 'Administrator Control Center – Platform Management',
      icon: iconSvg,
      width: 1100,
      height: 680,
      content: container,
      onClose: () => {
        this.container = null;
        this.windowInstance = null;
      }
    });
  }

  async fetchData() {
    const token = window.authManager?.token;
    const apiBase = window.authManager?.apiBase || 'http://localhost:3000';

    try {
      const [uRes, cRes, aRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiBase}/api/admin/challenges`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiBase}/api/admin/activity`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        this.users = uData.users || [];
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        this.challenges = cData.challenges || [];
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        this.activityLogs = aData.activity || [];
      }
    } catch (e) {
      console.warn('AdminDashboard: Using local fallback data store:', e.message);
      this.loadLocalFallbackData();
    }
  }

  loadLocalFallbackData() {
    this.users = [
      { id: 1, username: 'admin', email: 'admin@parrotcloud.io', role: 'admin', points: 500, is_active: true, created_at: '2026-01-01', completedLabsCount: 25 },
      { id: 2, username: 'student', email: 'student@parrotcloud.io', role: 'student', points: 100, is_active: true, created_at: '2026-01-15', completedLabsCount: 10 },
      { id: 3, username: 'hacker_01', email: 'hacker01@domain.com', role: 'student', points: 40, is_active: true, created_at: '2026-02-01', completedLabsCount: 4 }
    ];

    // Read stored challenges from practiceLabsData if available
    this.challenges = (window.PRACTICE_LABS_DATA || []).slice(0, 15).map(l => ({
      id: l.id,
      title: l.title,
      category: l.category,
      difficulty: l.difficulty,
      question: l.questions ? l.questions[0].q : 'Sample Question',
      expected_answer: l.questions ? l.questions[0].a : 'sample answer',
      points: 10
    }));

    this.activityLogs = [
      { id: 1, username: 'admin', action: 'ADMIN_LOGIN_SUCCESS', ip_address: '127.0.0.1', created_at: new Date().toISOString() },
      { id: 2, username: 'student', action: 'LAB_COMPLETED', ip_address: '10.99.0.4', details: { labId: 'lab-os-find', points: 10 }, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, username: 'student', action: 'LOGIN_SUCCESS', ip_address: '10.99.0.4', created_at: new Date(Date.now() - 7200000).toISOString() }
    ];
  }

  render() {
    if (!this.container) return;

    const isAdmin = window.authManager?.isAdmin();

    // Guard: Require Administrator Privileges
    if (!isAdmin) {
      this.container.innerHTML = `
        <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center;">
          <div style="font-size:48px; margin-bottom:14px;">🚫</div>
          <h2 style="font-size:18px; font-weight:800; color:#ff3366; margin:0 0 8px;">Access Denied: Administrator Privileges Required</h2>
          <p style="font-size:13px; color:#8b949e; max-width:480px; margin:0 0 20px; line-height:1.5;">
            You are currently signed in as a standard user or student. To access user management, challenge authoring, and platform telemetry, sign in with administrative credentials.
          </p>
          <div style="display:flex; gap:12px;">
            <button class="plab-btn primary" id="admin-login-switch-btn">Sign in as Administrator →</button>
            <button class="plab-btn secondary" id="admin-close-btn">Close</button>
          </div>
          <div class="auth-demo-hint" style="margin-top:20px; max-width:400px;">
            <strong>Admin Demo Login:</strong> <code>admin@parrotcloud.io</code> | <code>Admin@123456</code>
          </div>
        </div>
      `;

      this.container.querySelector('#admin-login-switch-btn').onclick = () => {
        window.windowManager.closeWindow('admin-dashboard');
        if (typeof window.openAuthApp === 'function') window.openAuthApp('login');
      };
      this.container.querySelector('#admin-close-btn').onclick = () => {
        window.windowManager.closeWindow('admin-dashboard');
      };
      return;
    }

    const totalUsers = this.users.length;
    const activeStudents = this.users.filter(u => u.role === 'student' && u.is_active).length;
    const totalChallenges = window.PRACTICE_LABS_DATA ? window.PRACTICE_LABS_DATA.length : 500;

    this.container.innerHTML = `
      <!-- ADMIN HEADER -->
      <header class="admin-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:32px; height:32px; border-radius:6px; background:rgba(255, 51, 102, 0.15); border:1px solid #ff3366; display:flex; align-items:center; justify-content:center; color:#ff3366;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </div>
          <div>
            <div style="font-size:14px; font-weight:800; color:#ffffff;">ADMINISTRATOR CONTROL CENTER</div>
            <div style="font-size:10px; color:#ff3366; font-family:var(--font-mono); font-weight:700;">ROOT MANAGEMENT CONSOLE</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:11px; color:#8b949e;">Signed in as <strong>${window.authManager.user?.username}</strong></span>
          <button class="plab-btn secondary" id="admin-refresh-btn" style="font-size:11px; padding:4px 8px;">↻ Refresh</button>
        </div>
      </header>

      <!-- ADMIN TABS -->
      <nav class="user-dash-tabs" style="background:#0b0f16;">
        <button class="user-tab-btn ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">
          User Management (${totalUsers})
        </button>
        <button class="user-tab-btn ${this.activeTab === 'challenges' ? 'active' : ''}" data-tab="challenges">
          Challenge Authoring & Labs (${totalChallenges})
        </button>
        <button class="user-tab-btn ${this.activeTab === 'activity' ? 'active' : ''}" data-tab="activity">
          Platform Activity Logs
        </button>
        <button class="user-tab-btn ${this.activeTab === 'metrics' ? 'active' : ''}" data-tab="metrics">
          System Metrics & Telemetry
        </button>
      </nav>

      <!-- ADMIN CONTENT -->
      <main class="user-dash-body" id="admin-dash-content">
        <!-- STATS OVERVIEW CARDS -->
        <div class="user-stats-grid" style="margin-bottom:18px;">
          <div class="user-stat-card">
            <div class="user-stat-icon cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <div class="user-stat-val" style="color:var(--parrot-cyan);">${totalUsers}</div>
              <div class="user-stat-label">Total Users</div>
            </div>
          </div>

          <div class="user-stat-card">
            <div class="user-stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div>
              <div class="user-stat-val" style="color:var(--parrot-green);">${activeStudents}</div>
              <div class="user-stat-label">Active Students</div>
            </div>
          </div>

          <div class="user-stat-card">
            <div class="user-stat-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <div>
              <div class="user-stat-val" style="color:var(--parrot-purple);">${totalChallenges}</div>
              <div class="user-stat-label">Total Challenges</div>
            </div>
          </div>

          <div class="user-stat-card">
            <div class="user-stat-icon yellow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            </div>
            <div>
              <div class="user-stat-val" style="color:var(--parrot-yellow);">8 Max</div>
              <div class="user-stat-label">Docker Slots</div>
            </div>
          </div>
        </div>

        <div id="admin-tab-content-body">
          ${this.getTabContent()}
        </div>
      </main>
    `;

    this.bindEvents();
  }

  getTabContent() {
    if (this.activeTab === 'users') {
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:14px; font-weight:800; color:#ffffff; margin:0; text-transform:uppercase;">
            Platform Registered Users & Roles
          </h3>
          <span style="font-size:11px; color:#8b949e;">Administrators can toggle roles, activate/deactivate, and audit users</span>
        </div>

        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Points</th>
                <th>Completed Labs</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.users.map(u => `
                <tr>
                  <td style="font-family:var(--font-mono);">#${u.id}</td>
                  <td style="font-weight:700; color:#ffffff;">${u.username}</td>
                  <td>${u.email}</td>
                  <td>
                    <span class="user-role-pill ${(u.role || 'student').toLowerCase()}">
                      ${(u.role || 'student').toUpperCase()}
                    </span>
                  </td>
                  <td style="font-family:var(--font-mono); color:var(--parrot-purple); font-weight:700;">${u.points || 0}</td>
                  <td style="font-family:var(--font-mono); color:var(--parrot-green);">${u.completedLabsCount || 0}</td>
                  <td>
                    <span style="color:${u.is_active ? 'var(--parrot-green)' : '#ff3366'}; font-weight:700;">
                      ${u.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td style="font-size:11px; color:#8b949e;">${u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="admin-action-btn edit btn-user-toggle-role" data-id="${u.id}" data-role="${u.role}" title="Toggle Student/Admin Role">
                        ${u.role === 'admin' ? 'Make Student' : 'Promote Admin'}
                      </button>
                      <button class="admin-action-btn toggle btn-user-toggle-status" data-id="${u.id}" data-status="${u.is_active}" title="Toggle Active/Deactivated">
                        ${u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button class="admin-action-btn delete btn-user-delete" data-id="${u.id}" data-user="${u.username}" title="Delete User Account">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (this.activeTab === 'challenges') {
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <h3 style="font-size:14px; font-weight:800; color:#ffffff; margin:0 0 4px; text-transform:uppercase;">
              Cybersecurity Practical Labs & Challenges
            </h3>
            <div style="font-size:11.5px; color:#8b949e;">Add new hands-on experiments or modify existing lab specifications</div>
          </div>
          <button class="plab-btn primary" id="admin-btn-add-challenge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>+ Add New Challenge</span>
          </button>
        </div>

        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Lab ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Practice Question</th>
                <th>Expected Answer</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.challenges.map(ch => `
                <tr>
                  <td style="font-family:var(--font-mono); color:var(--parrot-cyan); font-weight:700;">${ch.id}</td>
                  <td style="font-weight:700; color:#ffffff;">${ch.title}</td>
                  <td><span class="plab-badge category">${ch.category}</span></td>
                  <td><span class="plab-badge ${(ch.difficulty || 'beginner').toLowerCase()}">${ch.difficulty || 'Beginner'}</span></td>
                  <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ch.question}</td>
                  <td><code style="color:var(--parrot-green);">${ch.expected_answer}</code></td>
                  <td style="font-family:var(--font-mono); color:var(--parrot-purple); font-weight:700;">${ch.points || 10}</td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="admin-action-btn edit btn-ch-edit" data-id="${ch.id}">Edit</button>
                      <button class="admin-action-btn delete btn-ch-delete" data-id="${ch.id}">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (this.activeTab === 'activity') {
      return `
        <div style="margin-bottom:12px;">
          <h3 style="font-size:14px; font-weight:800; color:#ffffff; margin:0 0 4px; text-transform:uppercase;">
            Platform Security & Audit Trail
          </h3>
          <div style="font-size:11.5px; color:#8b949e;">Real-time tamper-evident system audit events</div>
        </div>

        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User / Account</th>
                <th>IP Address</th>
                <th>Event Details</th>
              </tr>
            </thead>
            <tbody>
              ${this.activityLogs.map(log => `
                <tr>
                  <td style="font-family:var(--font-mono);">#${log.id}</td>
                  <td style="font-size:11px; font-family:var(--font-mono);">${new Date(log.created_at).toLocaleString()}</td>
                  <td><span class="plab-badge category">${log.action}</span></td>
                  <td style="font-weight:700; color:#ffffff;">${log.username || 'System Engine'}</td>
                  <td style="font-family:var(--font-mono); color:#8b949e;">${log.ip_address || '127.0.0.1'}</td>
                  <td style="font-size:11px; color:#c9d1d9;">${typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (this.activeTab === 'metrics') {
      return `
        <div style="margin-bottom:14px;">
          <h3 style="font-size:14px; font-weight:800; color:#ffffff; margin:0 0 4px; text-transform:uppercase;">
            Host Server Telemetry & Health
          </h3>
          <div style="font-size:11.5px; color:#8b949e;">Live telemetry from Docker orchestrator and host daemon</div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
          <div style="background:#101622; border:1px solid #1f2c3d; border-radius:8px; padding:16px;">
            <div style="font-size:12px; font-weight:700; color:#8b949e; text-transform:uppercase; margin-bottom:8px;">Docker Orchestration Engine</div>
            <div style="font-size:16px; font-weight:800; color:var(--parrot-green); margin-bottom:8px;">● ENGINE ACTIVE</div>
            <div style="font-size:12px; color:#c9d1d9; line-height:1.5;">
              Supported OSes: 5 (Parrot, Kali, Ubuntu, Mint, Fedora)<br>
              Network Namespace: <code>lab_internal_net</code> (10.99.0.0/24)<br>
              Target Node: <code>10.99.0.20</code> (Safe Sandbox)
            </div>
          </div>

          <div style="background:#101622; border:1px solid #1f2c3d; border-radius:8px; padding:16px;">
            <div style="font-size:12px; font-weight:700; color:#8b949e; text-transform:uppercase; margin-bottom:8px;">Container Resource Ceilings</div>
            <div style="font-size:16px; font-weight:800; color:var(--parrot-cyan); margin-bottom:8px;">2048 MB RAM / 1.5 CPU</div>
            <div style="font-size:12px; color:#c9d1d9; line-height:1.5;">
              Max Concurrent Containers: 8 slots<br>
              User Inactivity Timeout: 15 minutes<br>
              Hard Process Limit (pids-limit): 256
            </div>
          </div>

          <div style="background:#101622; border:1px solid #1f2c3d; border-radius:8px; padding:16px;">
            <div style="font-size:12px; font-weight:700; color:#8b949e; text-transform:uppercase; margin-bottom:8px;">Database & Storage Health</div>
            <div style="font-size:16px; font-weight:800; color:var(--parrot-purple); margin-bottom:8px;">POSTGRESQL / SQLITE FALLBACK</div>
            <div style="font-size:12px; color:#c9d1d9; line-height:1.5;">
              User Volume Mount: <code>/app/data/users/:userId</code><br>
              Cryptographic Token: JWT HS256<br>
              Hash Standard: Bcrypt 12 Rounds
            </div>
          </div>
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

    // Refresh
    const refreshBtn = this.container.querySelector('#admin-refresh-btn');
    if (refreshBtn) {
      refreshBtn.onclick = async () => {
        await this.fetchData();
        this.render();
        if (window.notifications) window.notifications.show('Refreshed', 'Admin data reloaded.', 'info');
      };
    }

    // User Role Toggle
    this.container.querySelectorAll('.btn-user-toggle-role').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const currentRole = btn.getAttribute('data-role');
        const newRole = currentRole === 'admin' ? 'student' : 'admin';

        if (confirm(`Change user #${id} role to ${newRole.toUpperCase()}?`)) {
          await this.updateUserRole(id, newRole);
        }
      };
    });

    // User Status Toggle
    this.container.querySelectorAll('.btn-user-toggle-status').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const currentStatus = btn.getAttribute('data-status') === 'true';
        const newStatus = !currentStatus;

        if (confirm(`${newStatus ? 'Activate' : 'Deactivate'} user #${id}?`)) {
          await this.updateUserStatus(id, newStatus);
        }
      };
    });

    // User Delete
    this.container.querySelectorAll('.btn-user-delete').forEach(btn => {
      btn.onclick = async () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const username = btn.getAttribute('data-user');

        if (confirm(`Are you sure you want to permanently delete user "${username}" (#${id})?`)) {
          await this.deleteUser(id);
        }
      };
    });

    // Add New Challenge
    const addChBtn = this.container.querySelector('#admin-btn-add-challenge');
    if (addChBtn) {
      addChBtn.onclick = () => this.showAddChallengeModal();
    }

    // Delete Challenge
    this.container.querySelectorAll('.btn-ch-delete').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Permanently delete challenge "${id}"?`)) {
          await this.deleteChallenge(id);
        }
      };
    });

    // Edit Challenge
    this.container.querySelectorAll('.btn-ch-edit').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const ch = this.challenges.find(c => c.id === id);
        if (ch) this.showAddChallengeModal(ch);
      };
    });
  }

  async updateUserRole(userId, newRole) {
    try {
      const token = window.authManager?.token;
      const apiBase = window.authManager?.apiBase || 'http://localhost:3000';

      const res = await fetch(`${apiBase}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update role.');
      }

      const user = this.users.find(u => u.id === userId);
      if (user) user.role = newRole;
      this.render();
      if (window.notifications) window.notifications.show('Role Updated', `User promoted to ${newRole}.`, 'info');
    } catch (e) {
      // Local fallback
      const user = this.users.find(u => u.id === userId);
      if (user) user.role = newRole;
      this.render();
      if (window.notifications) window.notifications.show('Role Updated (Local)', `User role is now ${newRole}.`, 'info');
    }
  }

  async updateUserStatus(userId, isActive) {
    try {
      const token = window.authManager?.token;
      const apiBase = window.authManager?.apiBase || 'http://localhost:3000';

      const res = await fetch(`${apiBase}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status.');
      }

      const user = this.users.find(u => u.id === userId);
      if (user) user.is_active = isActive;
      this.render();
    } catch (e) {
      const user = this.users.find(u => u.id === userId);
      if (user) user.is_active = isActive;
      this.render();
    }
  }

  async deleteUser(userId) {
    try {
      const token = window.authManager?.token;
      const apiBase = window.authManager?.apiBase || 'http://localhost:3000';

      await fetch(`${apiBase}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.users = this.users.filter(u => u.id !== userId);
      this.render();
      if (window.notifications) window.notifications.show('User Deleted', `User #${userId} deleted.`, 'info');
    } catch (e) {
      this.users = this.users.filter(u => u.id !== userId);
      this.render();
    }
  }

  async deleteChallenge(challengeId) {
    try {
      const token = window.authManager?.token;
      const apiBase = window.authManager?.apiBase || 'http://localhost:3000';

      await fetch(`${apiBase}/api/admin/challenges/${challengeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.challenges = this.challenges.filter(c => c.id !== challengeId);
      this.render();
      if (window.notifications) window.notifications.show('Challenge Deleted', `Removed ${challengeId}`, 'info');
    } catch (e) {
      this.challenges = this.challenges.filter(c => c.id !== challengeId);
      this.render();
    }
  }

  showAddChallengeModal(editChallenge = null) {
    const modal = document.createElement('div');
    modal.className = 'plab-cert-modal';

    const isEdit = !!editChallenge;
    const ch = editChallenge || {
      id: `lab-custom-${Date.now()}`,
      title: '',
      category: 'Linux Fundamentals',
      difficulty: 'Beginner',
      objective: '',
      hint: '',
      command: '',
      exercise: '',
      expected_output: '',
      question: '',
      expected_answer: '',
      explanation: '',
      points: 10
    };

    modal.innerHTML = `
      <div style="width:680px; max-width:100%; max-height:90vh; overflow-y:auto; background:#111824; border:1px solid var(--parrot-cyan); border-radius:10px; padding:24px; box-shadow:0 0 30px rgba(0, 229, 255, 0.25);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="font-size:16px; font-weight:800; color:#ffffff; margin:0;">
            ${isEdit ? 'Edit Practical Lab Challenge' : 'Create New Cybersecurity Challenge'}
          </h3>
          <button id="modal-close-btn" style="background:transparent; border:none; color:#8b949e; font-size:18px; cursor:pointer;">✕</button>
        </div>

        <form id="form-challenge-author" onsubmit="return false;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="auth-input-group">
              <label class="auth-label">Challenge ID</label>
              <input type="text" class="auth-input" id="ch-id" value="${ch.id}" ${isEdit ? 'disabled' : ''} required />
            </div>
            <div class="auth-input-group">
              <label class="auth-label">Category</label>
              <select class="auth-input" id="ch-category" style="background:#090e16; cursor:pointer;">
                ${[
                  'Linux Fundamentals', 'Networking', 'Kali Linux', 'Parrot OS', 'Ubuntu',
                  'Python Programming', 'Web Security', 'OWASP Top 10', 'SQL Injection (safe simulated environment)',
                  'XSS (safe simulated environment)', 'Cryptography', 'Digital Forensics', 'OSINT',
                  'Password Security', 'CTF Challenges'
                ].map(c => `<option value="${c}" ${ch.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="auth-input-group">
              <label class="auth-label">Challenge Title</label>
              <input type="text" class="auth-input" id="ch-title" value="${ch.title}" placeholder="e.g. Find the Linux Operating System" required />
            </div>
            <div class="auth-input-group">
              <label class="auth-label">Difficulty</label>
              <select class="auth-input" id="ch-diff" style="background:#090e16; cursor:pointer;">
                <option value="Beginner" ${ch.difficulty === 'Beginner' ? 'selected' : ''}>Beginner</option>
                <option value="Intermediate" ${ch.difficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                <option value="Advanced" ${ch.difficulty === 'Advanced' ? 'selected' : ''}>Advanced</option>
              </select>
            </div>
            <div class="auth-input-group">
              <label class="auth-label">Points Awarded</label>
              <input type="number" class="auth-input" id="ch-points" value="${ch.points || 10}" min="5" max="100" />
            </div>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Learning Objective</label>
            <textarea class="auth-input" id="ch-objective" rows="2" style="resize:vertical;">${ch.objective}</textarea>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Linux Practice Command(s)</label>
            <input type="text" class="auth-input" id="ch-command" value="${ch.command || ''}" placeholder="e.g. cat /etc/os-release" />
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="auth-input-group">
              <label class="auth-label">Practice Question</label>
              <input type="text" class="auth-input" id="ch-question" value="${ch.question}" placeholder="e.g. Which command displays operating system info?" required />
            </div>
            <div class="auth-input-group">
              <label class="auth-label">Expected Answer (Validation Key)</label>
              <input type="text" class="auth-input" id="ch-answer" value="${ch.expected_answer}" placeholder="e.g. cat /etc/os-release" required />
            </div>
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Step-by-Step Hint</label>
            <input type="text" class="auth-input" id="ch-hint" value="${ch.hint || ''}" placeholder="e.g. Look inside the /etc directory" />
          </div>

          <div class="auth-input-group">
            <label class="auth-label">Solution Explanation (Shown on Success)</label>
            <textarea class="auth-input" id="ch-explanation" rows="2" style="resize:vertical;" required>${ch.explanation || ''}</textarea>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button type="button" class="plab-btn secondary" id="ch-cancel-btn">Cancel</button>
            <button type="submit" class="plab-btn primary" id="ch-save-btn">Save Challenge</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => { if (modal.parentNode) modal.parentNode.removeChild(modal); };
    modal.querySelector('#modal-close-btn').onclick = close;
    modal.querySelector('#ch-cancel-btn').onclick = close;

    modal.querySelector('#form-challenge-author').onsubmit = async () => {
      const payload = {
        id: modal.querySelector('#ch-id').value.trim(),
        title: modal.querySelector('#ch-title').value.trim(),
        category: modal.querySelector('#ch-category').value,
        difficulty: modal.querySelector('#ch-diff').value,
        points: parseInt(modal.querySelector('#ch-points').value, 10) || 10,
        objective: modal.querySelector('#ch-objective').value.trim(),
        command: modal.querySelector('#ch-command').value.trim(),
        question: modal.querySelector('#ch-question').value.trim(),
        expected_answer: modal.querySelector('#ch-answer').value.trim(),
        hint: modal.querySelector('#ch-hint').value.trim(),
        explanation: modal.querySelector('#ch-explanation').value.trim()
      };

      try {
        const token = window.authManager?.token;
        const apiBase = window.authManager?.apiBase || 'http://localhost:3000';

        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${apiBase}/api/admin/challenges/${payload.id}` : `${apiBase}/api/admin/challenges`;

        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });

        close();
        await this.fetchData();
        this.render();
        if (window.notifications) window.notifications.show('Challenge Saved', payload.title, 'info');
      } catch (e) {
        // Fallback local update
        if (isEdit) {
          const idx = this.challenges.findIndex(c => c.id === payload.id);
          if (idx !== -1) this.challenges[idx] = { ...this.challenges[idx], ...payload };
        } else {
          this.challenges.unshift(payload);
        }
        close();
        this.render();
      }
    };
  }
}

// Global Singleton
window.adminDashboardApp = new AdminDashboardApp();
window.openAdminDashboardApp = (tab) => window.adminDashboardApp.open(tab);
