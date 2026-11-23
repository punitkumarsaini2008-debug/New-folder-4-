// ==============================================================================
// ParrotCloud OS - Cyber Security Practice Lab Application (500 Labs)
// Comprehensive Hands-on Academy with 500 Unique Practical Labs, Dual-Pane
// Workspace, Realistic Terminal Execution, Interactive Assessment & Quizzes
// ==============================================================================

class PracticeLabsApp {
  constructor() {
    this.storageKey = 'parrotcloud_practice_labs_state';
    this.state = this.loadState();
    this.currentView = 'dashboard';
    this.activeCategory = 'All';
    this.activeDifficulty = 'All';
    this.searchQuery = '';
    this.currentPage = 1;
    this.pageSize = 24;
    this.activeLab = null;
    this.terminalHistory = [];
    this.historyIndex = -1;
    this.terminalOutput = [];
    this.quizState = null;
    this.container = null;
    this.windowInstance = null;

    // Initialize shell engine
    if (typeof window.LinuxShellEngine === 'function') {
      try {
        this.shell = new window.LinuxShellEngine();
      } catch (e) {
        this.shell = null;
      }
    } else {
      this.shell = null;
    }
  }

  // Load persistence state from LocalStorage
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          completedLabs: parsed.completedLabs || {},
          userAnswers: parsed.userAnswers || {},
          recentLabs: parsed.recentLabs || [],
          quizScore: parsed.quizScore || 0,
          userName: parsed.userName || 'Cyber Cadet',
          badges: parsed.badges || []
        };
      }
    } catch (e) {
      console.warn('PracticeLabs: LocalStorage load error', e);
    }
    return {
      completedLabs: {},
      userAnswers: {},
      recentLabs: [],
      quizScore: 0,
      userName: 'Cyber Cadet',
      badges: []
    };
  }

  // Save persistence state
  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('PracticeLabs: LocalStorage save error', e);
    }
  }

  // Check and unlock achievement badges
  checkBadges() {
    const completedCount = Object.keys(this.state.completedLabs).length;
    const unlocked = new Set(this.state.badges || []);

    const rules = [
      { id: 'first_lab', name: 'First Steps', req: completedCount >= 1 },
      { id: 'linux_10', name: 'Linux Initiate', req: this.getCompletedCountByCategory('Linux Fundamentals') >= 10 },
      { id: 'terminal_20', name: 'Terminal Warrior', req: this.getCompletedCountByCategory('Linux Terminal Commands') >= 20 },
      { id: 'networking_15', name: 'Network Scout', req: this.getCompletedCountByCategory('Networking Fundamentals') >= 15 },
      { id: 'scripting_15', name: 'Automation Novice', req: (this.getCompletedCountByCategory('Python for Cyber Security') + this.getCompletedCountByCategory('Bash Scripting')) >= 15 },
      { id: 'web_sec_20', name: 'Web Defender', req: this.getCompletedCountByCategory('Web Security') >= 20 },
      { id: 'crypto_10', name: 'Cryptographer', req: this.getCompletedCountByCategory('Cryptography') >= 10 },
      { id: 'forensics_10', name: 'Forensics Specialist', req: this.getCompletedCountByCategory('Digital Forensics') >= 10 },
      { id: 'osint_10', name: 'OSINT Hunter', req: this.getCompletedCountByCategory('OSINT') >= 10 },
      { id: 'defense_20', name: 'Incident Responder', req: this.getCompletedCountByCategory('Defensive Security and Incident Response') >= 20 },
      { id: 'halfway_250', name: 'Halfway Hacker', req: completedCount >= 250 },
      { id: 'centurion_500', name: 'Cyber Sentinel Master', req: completedCount >= 500 }
    ];

    let newlyUnlocked = false;
    rules.forEach(rule => {
      if (rule.req && !unlocked.has(rule.id)) {
        unlocked.add(rule.id);
        newlyUnlocked = true;
        if (window.notifications && typeof window.notifications.show === 'function') {
          window.notifications.show('Badge Unlocked!', `Achievement: ${rule.name}`, 'info');
        }
      }
    });

    if (newlyUnlocked) {
      this.state.badges = Array.from(unlocked);
      this.saveState();
    }
  }

  getCompletedCountByCategory(catName) {
    if (!window.PRACTICE_LABS_DATA) return 0;
    return window.PRACTICE_LABS_DATA.filter(l => l.category === catName && this.state.completedLabs[l.id]).length;
  }

  getUserRank(completedCount) {
    if (completedCount >= 500) return { title: 'Cyber Sentinel Master', level: 10, color: '#ff3366' };
    if (completedCount >= 350) return { title: 'Principal Security Architect', level: 9, color: '#bb86fc' };
    if (completedCount >= 250) return { title: 'Lead Penetration Tester', level: 8, color: '#00e5ff' };
    if (completedCount >= 150) return { title: 'Senior Security Analyst', level: 7, color: '#05d550' };
    if (completedCount >= 100) return { title: 'Cyber Defense Operator', level: 6, color: '#58a6ff' };
    if (completedCount >= 50)  return { title: 'Linux Systems Specialist', level: 5, color: '#ffcc00' };
    if (completedCount >= 25)  return { title: 'Junior Security Engineer', level: 4, color: '#7ee787' };
    if (completedCount >= 10)  return { title: 'Security Apprentice', level: 3, color: '#79c0ff' };
    if (completedCount >= 1)   return { title: 'Terminal Recruit', level: 2, color: '#c9d1d9' };
    return { title: 'Initiate (Level 1)', level: 1, color: '#8b949e' };
  }

  // Open the Practice Labs window
  open(targetLabId = null) {
    if (!window.PRACTICE_LABS_DATA || window.PRACTICE_LABS_DATA.length === 0) {
      if (window.notifications) {
        window.notifications.show('Loading Labs', 'Initializing 500 practical lab repository...', 'info');
      }
      return;
    }

    const iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'plab-wrapper';
    this.container = container;

    this.renderAppShell();

    this.windowInstance = window.windowManager.createWindow({
      id: 'practice-labs',
      title: 'Cyber Security Practice Lab – 500 Hands-on Experiments',
      icon: iconSvg,
      width: 1100,
      height: 680,
      content: container,
      onClose: () => {
        this.container = null;
        this.windowInstance = null;
      }
    });

    if (targetLabId) {
      this.openLab(targetLabId);
    } else {
      this.switchView('dashboard');
    }
  }

  // Render main application shell
  renderAppShell() {
    if (!this.container) return;

    const completedCount = Object.keys(this.state.completedLabs).length;
    const totalCount = window.PRACTICE_LABS_DATA ? window.PRACTICE_LABS_DATA.length : 500;

    this.container.innerHTML = `
      <!-- LEFT SIDEBAR -->
      <aside class="plab-sidebar">
        <div class="plab-sidebar-header">
          <div class="plab-sidebar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div>
            <div class="plab-sidebar-title">CYBER LAB 500</div>
            <div class="plab-sidebar-subtitle">PRACTICAL ACADEMY</div>
          </div>
        </div>

        <nav class="plab-sidebar-nav" id="plab-sidebar-nav">
          <div class="plab-nav-group-title">Overview</div>
          <div class="plab-nav-item active" data-nav="dashboard">
            <div class="plab-nav-item-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Dashboard</span>
            </div>
          </div>
          <div class="plab-nav-item" data-nav="catalog-all">
            <div class="plab-nav-item-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>All 500 Labs</span>
            </div>
            <span class="plab-nav-count">${totalCount}</span>
          </div>

          <div class="plab-nav-group-title">Difficulty Levels</div>
          <div class="plab-nav-item" data-nav="diff-Beginner">
            <div class="plab-nav-item-left">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#05d550;"></span>
              <span>Beginner Labs</span>
            </div>
            <span class="plab-nav-count" id="nav-count-beginner">178</span>
          </div>
          <div class="plab-nav-item" data-nav="diff-Intermediate">
            <div class="plab-nav-item-left">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ffcc00;"></span>
              <span>Intermediate Labs</span>
            </div>
            <span class="plab-nav-count" id="nav-count-intermediate">192</span>
          </div>
          <div class="plab-nav-item" data-nav="diff-Advanced">
            <div class="plab-nav-item-left">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff3366;"></span>
              <span>Advanced Labs</span>
            </div>
            <span class="plab-nav-count" id="nav-count-advanced">130</span>
          </div>

          <div class="plab-nav-group-title">15 Categories</div>
          <div id="plab-nav-categories-list">
            ${this.renderCategoryNavItems()}
          </div>

          <div class="plab-nav-group-title">Assessment & Credentials</div>
          <div class="plab-nav-item" data-nav="completed">
            <div class="plab-nav-item-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="#05d550" stroke-width="2" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Completed Labs</span>
            </div>
            <span class="plab-nav-count" id="nav-count-completed">${completedCount}</span>
          </div>
          <div class="plab-nav-item" data-nav="quiz">
            <div class="plab-nav-item-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"></circle><polygon points="12 6 12 12 16 14"></polygon></svg>
              <span>Practice Quiz</span>
            </div>
          </div>
          <div class="plab-nav-item" data-nav="badges">
            <div class="plab-nav-item-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="#bb86fc" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              <span>Badges & Certificate</span>
            </div>
          </div>
        </nav>
      </aside>

      <!-- MAIN CONTENT VIEW -->
      <main class="plab-main" id="plab-main-viewport">
        <!-- Top Action Bar -->
        <header class="plab-topbar">
          <div class="plab-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="plab-search-input" id="plab-global-search" placeholder="Search 500 labs, commands, tools, or topics..." />
          </div>
          <div class="plab-topbar-actions">
            <button class="plab-btn secondary" id="plab-btn-random" title="Start Random Uncompleted Lab">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
              <span>Random Lab</span>
            </button>
            <button class="plab-btn primary" id="plab-btn-daily" title="Open Today's Featured Lab Challenge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>Daily Challenge</span>
            </button>
          </div>
        </header>

        <!-- Dynamic Body Container -->
        <div class="plab-content-body" id="plab-content-body"></div>
      </main>
    `;

    this.bindAppShellEvents();
  }

  renderCategoryNavItems() {
    if (!window.PRACTICE_LABS_CATEGORIES) return '';
    return window.PRACTICE_LABS_CATEGORIES.map(cat => `
      <div class="plab-nav-item" data-nav="cat-${encodeURIComponent(cat.name)}">
        <div class="plab-nav-item-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;opacity:0.7;"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span style="font-size:11.5px;">${cat.name}</span>
        </div>
        <span class="plab-nav-count">${cat.count}</span>
      </div>
    `).join('');
  }

  bindAppShellEvents() {
    // Navigation item clicks
    const navItems = this.container.querySelectorAll('.plab-nav-item');
    navItems.forEach(item => {
      item.onclick = () => {
        const target = item.getAttribute('data-nav');
        if (!target) return;
        this.handleNavClick(target);
      };
    });

    // Global Search input
    const searchInput = this.container.querySelector('#plab-global-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.currentPage = 1;
        this.switchView('catalog');
      };
    }

    // Top buttons
    const randomBtn = this.container.querySelector('#plab-btn-random');
    if (randomBtn) {
      randomBtn.onclick = () => this.startRandomLab();
    }

    const dailyBtn = this.container.querySelector('#plab-btn-daily');
    if (dailyBtn) {
      dailyBtn.onclick = () => this.startDailyChallenge();
    }
  }

  handleNavClick(target) {
    // Update active class in sidebar
    this.container.querySelectorAll('.plab-nav-item').forEach(i => i.classList.remove('active'));
    const clickedEl = this.container.querySelector(`[data-nav="${target}"]`);
    if (clickedEl) clickedEl.classList.add('active');

    if (target === 'dashboard') {
      this.switchView('dashboard');
    } else if (target === 'catalog-all') {
      this.activeCategory = 'All';
      this.activeDifficulty = 'All';
      this.searchQuery = '';
      this.currentPage = 1;
      this.switchView('catalog');
    } else if (target.startsWith('diff-')) {
      this.activeCategory = 'All';
      this.activeDifficulty = target.replace('diff-', '');
      this.currentPage = 1;
      this.switchView('catalog');
    } else if (target.startsWith('cat-')) {
      this.activeCategory = decodeURIComponent(target.replace('cat-', ''));
      this.activeDifficulty = 'All';
      this.currentPage = 1;
      this.switchView('catalog');
    } else if (target === 'completed') {
      this.activeCategory = 'Completed';
      this.activeDifficulty = 'All';
      this.currentPage = 1;
      this.switchView('catalog');
    } else if (target === 'quiz') {
      this.switchView('quiz');
    } else if (target === 'badges') {
      this.switchView('badges');
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    const bodyEl = this.container.querySelector('#plab-content-body');
    if (!bodyEl) return;

    if (viewName === 'dashboard') {
      this.renderDashboard(bodyEl);
    } else if (viewName === 'catalog') {
      this.renderCatalog(bodyEl);
    } else if (viewName === 'workspace') {
      this.renderWorkspace(bodyEl);
    } else if (viewName === 'quiz') {
      this.renderQuiz(bodyEl);
    } else if (viewName === 'badges') {
      this.renderBadges(bodyEl);
    }
  }

  // ==============================================================================
  // 1. DASHBOARD VIEW
  // ==============================================================================
  renderDashboard(targetEl) {
    const total = window.PRACTICE_LABS_DATA ? window.PRACTICE_LABS_DATA.length : 500;
    const completedCount = Object.keys(this.state.completedLabs).length;
    const remainingCount = total - completedCount;
    const progressPercent = ((completedCount / total) * 100).toFixed(1);
    const rank = this.getUserRank(completedCount);
    const totalScore = completedCount * 100 + (this.state.quizScore || 0);

    targetEl.innerHTML = `
      <!-- METRIC CARDS -->
      <div class="plab-dashboard-grid">
        <div class="plab-stat-card">
          <div class="plab-stat-icon cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          </div>
          <div>
            <div class="plab-stat-val">${total}</div>
            <div class="plab-stat-label">Total Practical Labs</div>
          </div>
        </div>

        <div class="plab-stat-card">
          <div class="plab-stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div>
            <div class="plab-stat-val" style="color:var(--parrot-green);">${completedCount}</div>
            <div class="plab-stat-label">Labs Completed</div>
          </div>
        </div>

        <div class="plab-stat-card">
          <div class="plab-stat-icon yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          </div>
          <div>
            <div class="plab-stat-val">${remainingCount}</div>
            <div class="plab-stat-label">Remaining Labs</div>
          </div>
        </div>

        <div class="plab-stat-card">
          <div class="plab-stat-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div>
            <div class="plab-stat-val" style="color:var(--parrot-purple);">${totalScore}</div>
            <div class="plab-stat-label">Total Points / Score</div>
          </div>
        </div>
      </div>

      <!-- PROGRESS & RANK BANNER -->
      <div style="background:#111822; border:1px solid #202b3a; border-radius:8px; padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div style="flex:1; min-width:260px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:700; color:#ffffff;">OVERALL ACADEMY PROGRESS</span>
            <span style="font-size:12px; font-family:var(--font-mono); color:var(--parrot-cyan); font-weight:700;">${completedCount} / ${total} (${progressPercent}%)</span>
          </div>
          <div class="plab-progress-track" style="height:10px;">
            <div class="plab-progress-bar" style="width:${progressPercent}%;"></div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="text-align:right;">
            <div style="font-size:10px; color:#8b949e; text-transform:uppercase; letter-spacing:0.5px;">Current Rank</div>
            <div style="font-size:14px; font-weight:800; color:${rank.color};">${rank.title}</div>
          </div>
          <button class="plab-btn primary" id="dash-cert-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
            <span>View Certificate</span>
          </button>
        </div>
      </div>

      <!-- CATEGORY MASTERY GRID (15 Categories) -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.6px; color:#ffffff; margin:0;">
          Category Mastery & Tracks
        </h3>
        <span style="font-size:11px; color:#8b949e;">Click any track to explore</span>
      </div>

      <div class="plab-cat-cards-grid">
        ${this.renderDashboardCategoryCards()}
      </div>

      <!-- RECENTLY PRACTICED LABS -->
      <div style="margin-top:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.6px; color:#ffffff; margin:0;">
            Recently Practiced Labs
          </h3>
          <button class="plab-btn secondary" id="dash-view-all-btn" style="font-size:11px; padding:4px 8px;">Explore All 500 Labs →</button>
        </div>
        <div id="dash-recent-labs-list">
          ${this.renderRecentLabsList()}
        </div>
      </div>
    `;

    // Bind dashboard events
    targetEl.querySelectorAll('.plab-cat-card').forEach(card => {
      card.onclick = () => {
        const catName = card.getAttribute('data-cat');
        if (catName) {
          this.activeCategory = catName;
          this.activeDifficulty = 'All';
          this.currentPage = 1;
          this.switchView('catalog');
        }
      };
    });

    const certBtn = targetEl.querySelector('#dash-cert-btn');
    if (certBtn) {
      certBtn.onclick = () => this.showCertificateModal();
    }

    const viewAllBtn = targetEl.querySelector('#dash-view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.onclick = () => {
        this.activeCategory = 'All';
        this.activeDifficulty = 'All';
        this.switchView('catalog');
      };
    }

    targetEl.querySelectorAll('.dash-recent-item').forEach(item => {
      item.onclick = () => {
        const labId = item.getAttribute('data-lab');
        if (labId) this.openLab(labId);
      };
    });
  }

  renderDashboardCategoryCards() {
    if (!window.PRACTICE_LABS_CATEGORIES) return '';

    return window.PRACTICE_LABS_CATEGORIES.map(cat => {
      const completed = this.getCompletedCountByCategory(cat.name);
      const pct = ((completed / cat.count) * 100).toFixed(0);

      return `
        <div class="plab-cat-card" data-cat="${encodeURIComponent(cat.name)}">
          <div class="plab-cat-card-header">
            <span class="plab-cat-card-title">${cat.name}</span>
            <span class="plab-cat-card-count">${completed}/${cat.count}</span>
          </div>
          <div style="font-size:11px; color:#8b949e; margin-bottom:6px;">${cat.count} Hands-on Experiments</div>
          <div class="plab-progress-track">
            <div class="plab-progress-bar" style="width:${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderRecentLabsList() {
    if (!this.state.recentLabs || this.state.recentLabs.length === 0) {
      return `
        <div style="background:#111822; border:1px solid #202b3a; border-radius:6px; padding:24px; text-align:center; color:#8b949e; font-size:12px;">
          No recent labs practiced yet. Click "Start Random Lab" or select a category above to begin hands-on experiments!
        </div>
      `;
    }

    const recentItems = this.state.recentLabs
      .map(id => window.PRACTICE_LABS_DATA.find(l => l.id === id))
      .filter(Boolean)
      .slice(0, 5);

    return `
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${recentItems.map(lab => {
          const isDone = !!this.state.completedLabs[lab.id];
          return `
            <div class="dash-recent-item" data-lab="${lab.id}" style="background:#111722; border:1px solid #202b3a; border-radius:6px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:all 0.15s ease;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="plab-badge category">${lab.category}</span>
                <span style="font-size:12.5px; font-weight:700; color:#ffffff;">${lab.title}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="plab-badge ${lab.difficulty.toLowerCase()}">${lab.difficulty}</span>
                <span class="plab-badge ${isDone ? 'beginner' : 'time'}">${isDone ? '✓ Completed' : 'Resume →'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ==============================================================================
  // 2. CATALOG VIEW (PAGINATED WITH SEARCH & FILTERS)
  // ==============================================================================
  renderCatalog(targetEl) {
    if (!window.PRACTICE_LABS_DATA) return;

    let filtered = window.PRACTICE_LABS_DATA;

    // Filter by category
    if (this.activeCategory === 'Completed') {
      filtered = filtered.filter(l => !!this.state.completedLabs[l.id]);
    } else if (this.activeCategory && this.activeCategory !== 'All') {
      filtered = filtered.filter(l => l.category === this.activeCategory);
    }

    // Filter by difficulty
    if (this.activeDifficulty && this.activeDifficulty !== 'All') {
      filtered = filtered.filter(l => l.difficulty === this.activeDifficulty);
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(l => {
        const query = this.searchQuery;
        return (
          l.title.toLowerCase().includes(query) ||
          l.id.toLowerCase().includes(query) ||
          l.category.toLowerCase().includes(query) ||
          l.objective.toLowerCase().includes(query) ||
          (l.commands && l.commands.some(c => c.toLowerCase().includes(query))) ||
          (l.tools && l.tools.some(t => t.toLowerCase().includes(query)))
        );
      });
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const currentLabs = filtered.slice(startIndex, startIndex + this.pageSize);

    targetEl.innerHTML = `
      <!-- CATALOG HEADER CONTROLS -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <h2 style="font-size:15px; font-weight:800; color:#ffffff; margin:0;">
            ${this.activeCategory === 'All' ? 'All Practical Labs' : this.activeCategory}
          </h2>
          <span class="plab-badge category">${totalFiltered} Labs Found</span>
        </div>

        <!-- Difficulty Quick Filters -->
        <div style="display:flex; gap:6px;">
          ${['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => `
            <button class="plab-btn ${this.activeDifficulty === diff ? 'primary' : 'secondary'} cat-diff-btn" data-diff="${diff}" style="font-size:11px; padding:4px 8px;">
              ${diff}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- CARDS GRID -->
      ${totalFiltered === 0 ? `
        <div style="background:#111822; border:1px solid #202b3a; border-radius:8px; padding:40px 20px; text-align:center; color:#8b949e;">
          <div style="font-size:16px; font-weight:700; color:#ffffff; margin-bottom:8px;">No labs match your filter</div>
          <div style="font-size:12px; margin-bottom:16px;">Try clearing search keywords or resetting difficulty filter.</div>
          <button class="plab-btn primary" id="cat-reset-filters-btn">Reset All Filters</button>
        </div>
      ` : `
        <div class="plab-catalog-grid">
          ${currentLabs.map(lab => this.renderLabCard(lab)).join('')}
        </div>

        <!-- PAGINATION BAR -->
        <div class="plab-pagination">
          <button class="plab-btn secondary" id="plab-page-prev" ${this.currentPage === 1 ? 'disabled' : ''}>← Previous</button>
          <span style="font-size:12px; font-family:var(--font-mono); color:#c9d1d9;">Page ${this.currentPage} of ${totalPages} (${totalFiltered} Labs)</span>
          <button class="plab-btn secondary" id="plab-page-next" ${this.currentPage === totalPages ? 'disabled' : ''}>Next →</button>
        </div>
      `}
    `;

    // Bind Catalog events
    targetEl.querySelectorAll('.cat-diff-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeDifficulty = btn.getAttribute('data-diff');
        this.currentPage = 1;
        this.renderCatalog(targetEl);
      };
    });

    const resetBtn = targetEl.querySelector('#cat-reset-filters-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        this.activeCategory = 'All';
        this.activeDifficulty = 'All';
        this.searchQuery = '';
        this.currentPage = 1;
        const globalSearch = this.container.querySelector('#plab-global-search');
        if (globalSearch) globalSearch.value = '';
        this.renderCatalog(targetEl);
      };
    }

    const prevBtn = targetEl.querySelector('#plab-page-prev');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderCatalog(targetEl);
          targetEl.scrollTop = 0;
        }
      };
    }

    const nextBtn = targetEl.querySelector('#plab-page-next');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderCatalog(targetEl);
          targetEl.scrollTop = 0;
        }
      };
    }

    targetEl.querySelectorAll('.plab-card-launch-btn').forEach(btn => {
      btn.onclick = () => {
        const labId = btn.getAttribute('data-lab');
        if (labId) this.openLab(labId);
      };
    });
  }

  renderLabCard(lab) {
    const isCompleted = !!this.state.completedLabs[lab.id];

    return `
      <div class="plab-card ${isCompleted ? 'completed' : ''}" data-lab="${lab.id}">
        <div>
          <div class="plab-card-top">
            <span class="plab-card-id">${lab.id.toUpperCase()}</span>
            <span class="plab-badge time">${lab.time}</span>
          </div>
          <div class="plab-card-title">${lab.title}</div>
          <div class="plab-card-desc">${lab.objective}</div>
          <div class="plab-card-meta">
            <span class="plab-badge ${lab.difficulty.toLowerCase()}">${lab.difficulty}</span>
            <span class="plab-badge category">${lab.category}</span>
          </div>
        </div>
        <div class="plab-card-actions">
          <span style="font-size:11px; font-weight:700; color:${isCompleted ? 'var(--parrot-green)' : '#8b949e'};">
            ${isCompleted ? '✓ Completed' : 'Ready'}
          </span>
          <button class="plab-btn ${isCompleted ? 'secondary' : 'primary'} plab-card-launch-btn" data-lab="${lab.id}" style="padding:4px 10px; font-size:11px;">
            ${isCompleted ? 'Review Lab' : 'Start Lab →'}
          </button>
        </div>
      </div>
    `;
  }

  // Open specific Lab into Workspace
  openLab(labId) {
    if (!window.PRACTICE_LABS_DATA) return;
    const lab = window.PRACTICE_LABS_DATA.find(l => l.id === labId);
    if (!lab) return;

    this.activeLab = lab;

    // Track recently practiced
    if (!this.state.recentLabs) this.state.recentLabs = [];
    this.state.recentLabs = [lab.id, ...this.state.recentLabs.filter(id => id !== lab.id)].slice(0, 10);
    this.saveState();

    this.switchView('workspace');
  }

  // ==============================================================================
  // 3. WORKSPACE VIEW (DUAL PANE: GUIDE & REALISTIC TERMINAL)
  // ==============================================================================
  renderWorkspace(targetEl) {
    const lab = this.activeLab;
    if (!lab) {
      this.switchView('catalog');
      return;
    }

    const isCompleted = !!this.state.completedLabs[lab.id];
    const userAns = this.state.userAnswers[lab.id] || {};

    targetEl.innerHTML = `
      <div class="plab-workspace">
        <!-- WORKSPACE HEADER -->
        <header class="plab-ws-header">
          <div class="plab-ws-title-group">
            <button class="plab-btn secondary" id="ws-back-btn" style="padding:4px 8px; font-size:11px;">
              ← Back to Catalog
            </button>
            <span class="plab-card-id" style="font-size:12px;">${lab.id.toUpperCase()}</span>
            <h2 style="font-size:14px; font-weight:800; color:#ffffff; margin:0;">${lab.title}</h2>
            <span class="plab-badge ${lab.difficulty.toLowerCase()}">${lab.difficulty}</span>
            <span class="plab-badge category">${lab.category}</span>
            <span class="plab-badge time">${lab.time}</span>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <button class="plab-btn ${isCompleted ? 'success' : 'secondary'}" id="ws-toggle-completed-btn">
              ${isCompleted ? '✓ Completed' : 'Mark Completed'}
            </button>
            <button class="plab-btn secondary" id="ws-prev-lab-btn" title="Previous Lab">‹ Prev</button>
            <button class="plab-btn primary" id="ws-next-lab-btn" title="Next Lab">Next ›</button>
          </div>
        </header>

        <!-- SPLIT PANES -->
        <div class="plab-ws-panes">
          <!-- LEFT PANE: LAB INSTRUCTIONS & QUESTIONS -->
          <div class="plab-ws-left">
            <!-- SECTION 1: OBJECTIVE & TOOLS -->
            <div class="plab-section-card">
              <div class="plab-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 12 8"></polygon></svg>
                <span>Practical Objective</span>
              </div>
              <p style="font-size:12.5px; line-height:1.5; color:#c9d1d9; margin:0 0 10px;">${lab.objective}</p>
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                <span style="font-size:11px; color:#8b949e; font-weight:700;">REQUIRED TOOLS:</span>
                ${(lab.tools || ['bash', 'linux-core']).map(t => `<span class="plab-badge time" style="color:var(--parrot-cyan);">${t}</span>`).join('')}
              </div>
            </div>

            <!-- SECTION 2: STEP-BY-STEP INSTRUCTIONS -->
            <div class="plab-section-card">
              <div class="plab-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                <span>Step-by-Step Instructions</span>
              </div>
              <ol style="margin:0; padding-left:18px; font-size:12px; line-height:1.6; color:#c9d1d9;">
                ${(lab.instructions || []).map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>

            <!-- SECTION 3: COMMANDS TO EXECUTE -->
            <div class="plab-section-card">
              <div class="plab-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
                <span>Practical Commands (Click to Run)</span>
              </div>
              ${(lab.commands || []).map(cmd => `
                <div class="plab-cmd-box">
                  <code>${cmd}</code>
                  <div style="display:flex; gap:6px;">
                    <button class="plab-btn primary ws-cmd-run-btn" data-cmd="${encodeURIComponent(cmd)}" style="padding:2px 8px; font-size:10px;">
                      Run In Terminal ▶
                    </button>
                    <button class="plab-copy-btn ws-cmd-copy-btn" data-cmd="${encodeURIComponent(cmd)}" title="Copy Command">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- SECTION 4: EXERCISE & EXPECTED OUTPUT -->
            <div class="plab-section-card">
              <div class="plab-sec-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                <span>Hands-on Exercise & Expected Output</span>
              </div>
              <p style="font-size:12px; color:#c9d1d9; margin-top:0;">${lab.exercise}</p>
              <div style="background:#070a0f; border:1px solid #1f2c3d; border-radius:5px; padding:10px; font-family:var(--font-mono); font-size:11px; color:#7ee787; white-space:pre-wrap; max-height:140px; overflow-y:auto;">${lab.expectedOutput}</div>
            </div>

            <!-- SECTION 5: 3 PRACTICE QUESTIONS & VALIDATION -->
            <div class="plab-section-card" style="border-color:rgba(0, 229, 255, 0.3);">
              <div class="plab-sec-title" style="color:var(--parrot-cyan); justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <span>Practice Questions (Answer all 3 to master)</span>
                </div>
                <span style="font-size:10px; color:#8b949e;">Interactive Verification</span>
              </div>

              ${(lab.questions || []).map((q, idx) => `
                <div class="plab-question-card" id="plab-qcard-${idx}">
                  <div class="plab-q-title">Q${idx + 1}: ${q.q}</div>
                  <div class="plab-q-input-row">
                    <input type="text" class="plab-q-input" id="plab-qinput-${idx}" placeholder="Type your answer here..." value="${userAns[idx] || ''}" />
                    <button class="plab-btn primary ws-check-btn" data-idx="${idx}">Check My Answer</button>
                    <button class="plab-btn secondary ws-hint-btn" data-idx="${idx}">Show Hint</button>
                    <button class="plab-btn secondary ws-ans-btn" data-idx="${idx}">Show Answer</button>
                  </div>
                  <div class="plab-q-feedback" id="plab-qfeedback-${idx}"></div>
                </div>
              `).join('')}

              <!-- COMPLETE SOLUTION COLLAPSIBLE -->
              <details style="margin-top:14px; background:#0e141d; border:1px solid #222f42; border-radius:6px; padding:8px 12px; font-size:12px;">
                <summary style="cursor:pointer; font-weight:700; color:var(--parrot-yellow); user-select:none;">
                  ▶ View Complete Solution Walkthrough
                </summary>
                <div style="margin-top:10px; font-size:12px; color:#c9d1d9; line-height:1.5; white-space:pre-wrap;">${lab.solution}</div>
              </details>
            </div>
          </div>

          <!-- RIGHT PANE: REALISTIC INTERACTIVE TERMINAL -->
          <div class="plab-ws-right">
            <div class="plab-term-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#05d550;"></span>
                <span style="font-family:var(--font-mono); font-weight:700; color:#ffffff;">root@parrot-lab:~# [Sandbox Shell Engine]</span>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="plab-btn secondary" id="ws-term-clear-btn" style="padding:2px 8px; font-size:10px;">Clear</button>
                <button class="plab-btn secondary" id="ws-term-copy-btn" style="padding:2px 8px; font-size:10px;">Copy Output</button>
                <button class="plab-btn secondary" id="ws-term-reset-btn" style="padding:2px 8px; font-size:10px;">Reset Lab</button>
              </div>
            </div>

            <!-- Terminal Screen -->
            <div class="plab-term-screen" id="ws-term-screen">
              <div style="color:#8b949e; margin-bottom:8px;">
                ParrotCloud OS Interactive Lab Terminal [Version 6.0]<br>
                Target Environment: Isolated POSIX Linux Practice Container<br>
                Type commands or click "Run In Terminal" from the guide.<br>
                ----------------------------------------------------------------------
              </div>
              <div id="ws-term-log"></div>
            </div>

            <!-- Terminal Input Bar -->
            <div class="plab-term-input-bar">
              <span class="plab-term-prompt">root@parrot-lab:~#</span>
              <input type="text" class="plab-term-input" id="ws-term-input" placeholder="Type Linux command (e.g. ls -la, nmap, chmod 755)..." autocomplete="off" spellcheck="false" />
              <button class="plab-btn primary" id="ws-term-exec-btn" style="padding:4px 10px; font-size:11px;">Enter ↵</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindWorkspaceEvents(targetEl, lab);
  }

  bindWorkspaceEvents(targetEl, lab) {
    // Back to Catalog
    const backBtn = targetEl.querySelector('#ws-back-btn');
    if (backBtn) {
      backBtn.onclick = () => this.switchView('catalog');
    }

    // Toggle Completed
    const toggleCompletedBtn = targetEl.querySelector('#ws-toggle-completed-btn');
    if (toggleCompletedBtn) {
      toggleCompletedBtn.onclick = () => {
        if (this.state.completedLabs[lab.id]) {
          delete this.state.completedLabs[lab.id];
          toggleCompletedBtn.className = 'plab-btn secondary';
          toggleCompletedBtn.textContent = 'Mark Completed';
        } else {
          this.state.completedLabs[lab.id] = { completedAt: new Date().toISOString(), score: 100 };
          toggleCompletedBtn.className = 'plab-btn success';
          toggleCompletedBtn.textContent = '✓ Completed';
          this.checkBadges();
          if (window.notifications) {
            window.notifications.show('Lab Completed!', `Mastered: ${lab.title}`, 'info');
          }
        }
        this.saveState();
        this.updateNavCounters();
      };
    }

    // Prev / Next Lab Navigation
    const allLabs = window.PRACTICE_LABS_DATA || [];
    const currentIdx = allLabs.findIndex(l => l.id === lab.id);

    const prevBtn = targetEl.querySelector('#ws-prev-lab-btn');
    if (prevBtn) {
      prevBtn.disabled = currentIdx <= 0;
      prevBtn.onclick = () => {
        if (currentIdx > 0) this.openLab(allLabs[currentIdx - 1].id);
      };
    }

    const nextBtn = targetEl.querySelector('#ws-next-lab-btn');
    if (nextBtn) {
      nextBtn.disabled = currentIdx >= allLabs.length - 1;
      nextBtn.onclick = () => {
        if (currentIdx < allLabs.length - 1) this.openLab(allLabs[currentIdx + 1].id);
      };
    }

    // Run Command in Terminal buttons
    targetEl.querySelectorAll('.ws-cmd-run-btn').forEach(btn => {
      btn.onclick = () => {
        const cmd = decodeURIComponent(btn.getAttribute('data-cmd'));
        this.executeTerminalCommand(cmd);
      };
    });

    // Copy command buttons
    targetEl.querySelectorAll('.ws-cmd-copy-btn').forEach(btn => {
      btn.onclick = () => {
        const cmd = decodeURIComponent(btn.getAttribute('data-cmd'));
        navigator.clipboard.writeText(cmd).then(() => {
          if (window.notifications) window.notifications.show('Copied!', cmd, 'info');
        }).catch(() => {});
      };
    });

    // Practice Questions: Check Answer buttons
    targetEl.querySelectorAll('.ws-check-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.checkQuestionAnswer(lab, idx);
      };
    });

    // Practice Questions: Show Hint buttons
    targetEl.querySelectorAll('.ws-hint-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.showQuestionHint(lab, idx);
      };
    });

    // Practice Questions: Show Answer buttons
    targetEl.querySelectorAll('.ws-ans-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.showQuestionAnswer(lab, idx);
      };
    });

    // Input Enter trigger for questions
    for (let i = 0; i < 3; i++) {
      const qInput = targetEl.querySelector(`#plab-qinput-${i}`);
      if (qInput) {
        qInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.checkQuestionAnswer(lab, i);
          }
        });
      }
    }

    // Terminal controls
    const termInput = targetEl.querySelector('#ws-term-input');
    const termExec = targetEl.querySelector('#ws-term-exec-btn');
    const termClear = targetEl.querySelector('#ws-term-clear-btn');
    const termCopy = targetEl.querySelector('#ws-term-copy-btn');
    const termReset = targetEl.querySelector('#ws-term-reset-btn');

    if (termExec && termInput) {
      termExec.onclick = () => {
        const cmd = termInput.value.trim();
        if (cmd) {
          termInput.value = '';
          this.executeTerminalCommand(cmd);
        }
      };
    }

    if (termInput) {
      termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = termInput.value.trim();
          if (cmd) {
            termInput.value = '';
            this.executeTerminalCommand(cmd);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.terminalHistory.length > 0) {
            if (this.historyIndex === -1) {
              this.historyIndex = this.terminalHistory.length - 1;
            } else if (this.historyIndex > 0) {
              this.historyIndex--;
            }
            termInput.value = this.terminalHistory[this.historyIndex] || '';
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.terminalHistory.length > 0 && this.historyIndex !== -1) {
            if (this.historyIndex < this.terminalHistory.length - 1) {
              this.historyIndex++;
              termInput.value = this.terminalHistory[this.historyIndex];
            } else {
              this.historyIndex = -1;
              termInput.value = '';
            }
          }
        }
      });
    }

    if (termClear) {
      termClear.onclick = () => {
        const termLog = targetEl.querySelector('#ws-term-log');
        if (termLog) termLog.innerHTML = '';
      };
    }

    if (termCopy) {
      termCopy.onclick = () => {
        const termScreen = targetEl.querySelector('#ws-term-screen');
        if (termScreen) {
          navigator.clipboard.writeText(termScreen.innerText).then(() => {
            if (window.notifications) window.notifications.show('Copied!', 'Terminal buffer copied to clipboard.', 'info');
          });
        }
      };
    }

    if (termReset) {
      termReset.onclick = () => {
        if (confirm('Reset this lab? Your questions input and terminal buffer will be cleared.')) {
          if (this.state.userAnswers[lab.id]) {
            delete this.state.userAnswers[lab.id];
            this.saveState();
          }
          this.renderWorkspace(targetEl);
          if (window.notifications) window.notifications.show('Lab Reset', 'Environment ready.', 'info');
        }
      };
    }
  }

  // Question Answer Validation
  checkQuestionAnswer(lab, questionIndex) {
    if (!lab || !lab.questions || !lab.questions[questionIndex]) return;
    const qObj = lab.questions[questionIndex];
    const inputEl = this.container.querySelector(`#plab-qinput-${questionIndex}`);
    const feedbackEl = this.container.querySelector(`#plab-qfeedback-${questionIndex}`);
    if (!inputEl || !feedbackEl) return;

    const userAns = inputEl.value.trim();
    if (!userAns) {
      feedbackEl.className = 'plab-q-feedback incorrect';
      feedbackEl.textContent = 'Please enter an answer before checking.';
      return;
    }

    // Save user answer
    if (!this.state.userAnswers[lab.id]) this.state.userAnswers[lab.id] = {};
    this.state.userAnswers[lab.id][questionIndex] = userAns;
    this.saveState();

    const normalize = (str) => {
      return String(str || '')
        .toLowerCase()
        .replace(/^[`'"]+|[`'"]+$/g, '')
        .replace(/^\$\s*/, '')
        .replace(/^#\s*/, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const expected = normalize(qObj.a);
    const userNorm = normalize(userAns);

    const isMatch = (
      userNorm === expected ||
      (expected.length > 3 && userNorm.includes(expected)) ||
      (userNorm.length > 3 && expected.includes(userNorm))
    );

    if (isMatch) {
      feedbackEl.className = 'plab-q-feedback correct';
      feedbackEl.innerHTML = `<strong>✓ Correct!</strong> Great job: <code>${qObj.a}</code>`;

      // Check if all 3 questions answered correctly
      this.checkLabCompletionStatus(lab);
    } else {
      feedbackEl.className = 'plab-q-feedback incorrect';
      feedbackEl.innerHTML = `<strong>✗ Not quite right.</strong> Check syntax or click "Show Hint".`;
    }
  }

  showQuestionHint(lab, questionIndex) {
    if (!lab || !lab.questions || !lab.questions[questionIndex]) return;
    const qObj = lab.questions[questionIndex];
    const feedbackEl = this.container.querySelector(`#plab-qfeedback-${questionIndex}`);
    if (!feedbackEl) return;

    feedbackEl.className = 'plab-q-feedback hint';
    feedbackEl.innerHTML = `<strong>💡 Hint:</strong> ${qObj.hint || 'Review the practical commands and execution steps above.'}`;
  }

  showQuestionAnswer(lab, questionIndex) {
    if (!lab || !lab.questions || !lab.questions[questionIndex]) return;
    const qObj = lab.questions[questionIndex];
    const feedbackEl = this.container.querySelector(`#plab-qfeedback-${questionIndex}`);
    const inputEl = this.container.querySelector(`#plab-qinput-${questionIndex}`);
    if (!feedbackEl) return;

    feedbackEl.className = 'plab-q-feedback hint';
    feedbackEl.innerHTML = `<strong>Correct Answer:</strong> <code>${qObj.a}</code>`;
    if (inputEl) inputEl.value = qObj.a;
  }

  checkLabCompletionStatus(lab) {
    let allCorrect = true;
    for (let i = 0; i < 3; i++) {
      const feedbackEl = this.container.querySelector(`#plab-qfeedback-${i}`);
      if (!feedbackEl || !feedbackEl.classList.contains('correct')) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      this.state.completedLabs[lab.id] = { completedAt: new Date().toISOString(), score: 100 };
      this.saveState();
      this.checkBadges();
      this.updateNavCounters();

      const toggleBtn = this.container.querySelector('#ws-toggle-completed-btn');
      if (toggleBtn) {
        toggleBtn.className = 'plab-btn success';
        toggleBtn.textContent = '✓ Completed';
      }

      if (window.notifications) {
        window.notifications.show('Lab Completed!', `All 3 questions mastered for ${lab.title}`, 'info');
      }
    }
  }

  // Realistic Terminal Execution
  async executeTerminalCommand(commandLine) {
    const termLog = this.container ? this.container.querySelector('#ws-term-log') : null;
    const termScreen = this.container ? this.container.querySelector('#ws-term-screen') : null;
    if (!termLog) return;

    const trimmed = commandLine.trim();
    if (!trimmed) return;

    this.terminalHistory.push(trimmed);
    this.historyIndex = -1;

    // Append prompt line
    const promptEntry = document.createElement('div');
    promptEntry.style.marginBottom = '4px';
    promptEntry.innerHTML = `<span style="color:#00e5ff;">root@parrot-lab</span>:<span style="color:#58a6ff;">~</span># <span style="color:#ffffff;">${this.escapeHtml(trimmed)}</span>`;
    termLog.appendChild(promptEntry);

    // Try Shell Engine if available
    let outputText = '';
    if (this.shell && typeof this.shell.execute === 'function') {
      try {
        outputText = await this.shell.execute(trimmed);
      } catch (e) {
        outputText = '';
      }
    }

    // If shell engine returned no response or wasn't loaded, emulate realistic cybersecurity tool response
    if (!outputText) {
      outputText = this.emulateCommandResponse(trimmed);
    }

    if (outputText) {
      const outEntry = document.createElement('div');
      outEntry.style.color = '#7ee787';
      outEntry.style.whiteSpace = 'pre-wrap';
      outEntry.style.marginBottom = '8px';
      outEntry.innerHTML = this.ansiToHtml(outputText);
      termLog.appendChild(outEntry);
    }

    if (termScreen) {
      termScreen.scrollTop = termScreen.scrollHeight;
    }
  }

  emulateCommandResponse(cmd) {
    const parts = cmd.split(' ');
    const binary = parts[0].toLowerCase();

    if (cmd === 'clear') {
      const log = this.container.querySelector('#ws-term-log');
      if (log) log.innerHTML = '';
      return '';
    }

    if (binary === 'pwd') return '/home/parrot/workspace';
    if (binary === 'whoami') return 'root';
    if (binary === 'id') return 'uid=0(root) gid=0(root) groups=0(root),27(sudo),1000(parrot)';
    if (binary === 'uname' || binary === 'uname -a') return 'Linux parrot-lab 6.5.0-parrot-amd64 #1 SMP PREEMPT_DYNAMIC GNU/Linux';
    if (binary === 'ip' && parts[1] === 'addr') {
      return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\\n    inet 127.0.0.1/8 scope host lo\\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\\n    inet 10.99.0.42/24 brd 10.99.0.255 scope global eth0';
    }
    if (binary === 'ls') {
      return 'drwxr-xr-x 4 root root 4096 Nov 23 12:00 .\ndrwxr-xr-x 8 root root 4096 Nov 23 11:30 ..\n-rw-r--r-- 1 root root  512 Nov 23 12:05 notes.txt\n-rwxr-xr-x 1 root root 1024 Nov 23 12:08 exploit.py\n-rw-r--r-- 1 root root 2048 Nov 23 12:10 report.json';
    }
    if (binary === 'cat') {
      const file = parts[1] || '';
      return `[+] File contents of ${file || 'sample.txt'}:\n# Security audit parameters\nTARGET_HOST="10.99.0.20"\nSTATUS="AUTHORIZED_PRACTICE"\nFLAG="FLAG{parrot_academy_lab_validated_9482}"`;
    }
    if (binary === 'nmap') {
      const target = parts.slice(1).join(' ') || '10.99.0.20';
      return `Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-23 12:00 UTC\nNmap scan report for ${target}\nHost is up (0.00042s latency).\nNot shown: 997 closed tcp ports\nPORT     STATE SERVICE VERSION\n22/tcp   open  ssh     OpenSSH 9.2p1 Debian 2+deb12u2\n80/tcp   open  http    Apache httpd 2.4.57\n443/tcp  open  ssl/http Apache httpd 2.4.57\nNmap done: 1 IP address (1 host up) scanned in 1.45 seconds`;
    }
    if (binary === 'masscan') {
      return `Starting masscan 1.3.2 (http://bit.ly/14GZzcT) at 2026-11-23 12:00:00 GMT\nDiscovered open port 80/tcp on 10.99.0.20\nDiscovered open port 443/tcp on 10.99.0.20\nDiscovered open port 22/tcp on 10.99.0.20`;
    }
    if (binary === 'python3') {
      return `Python 3.12.3 (main, Apr 10 2026, 10:00:00) [GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> [Execution completed successfully with exit code 0]`;
    }
    if (binary === 'chmod' || binary === 'chown') {
      return `[+] Permissions updated successfully for specified targets.\n[+] Mode verified: -rwxr-xr-x`;
    }
    if (binary === 'curl' || binary === 'wget') {
      return `HTTP/1.1 200 OK\nDate: Mon, 23 Nov 2026 12:00:00 GMT\nServer: Apache/2.4.57 (Debian)\nX-Powered-By: PHP/8.2.7\nContent-Type: text/html; charset=UTF-8\n\n<!DOCTYPE html><html><body><h1>Cyber Security Lab Endpoint</h1></body></html>`;
    }
    if (binary === 'nikto') {
      return `- Nikto v2.5.0\n+ Target IP: 10.99.0.20\n+ Target Host: lab-target.local\n+ Target Port: 80\n+ Server: Apache/2.4.57\n+ Retrieved x-powered-by header: PHP/8.2.7\n+ 0 error(s) and 4 item(s) reported on remote host`;
    }

    return `[+] Command executed: ${cmd}\n[+] Exit code: 0 (SUCCESS)\n[+] State verified and audit log recorded.`;
  }

  // ==============================================================================
  // 4. PRACTICE QUIZ VIEW (10 QUESTIONS DRAWN FROM 1500 POOL)
  // ==============================================================================
  renderQuiz(targetEl) {
    if (!this.quizState) {
      this.initNewQuiz();
    }

    const { questions, currentIdx, answers, finished } = this.quizState;

    if (finished) {
      const score = answers.filter(a => a.isCorrect).length;
      const pct = Math.round((score / questions.length) * 100);

      targetEl.innerHTML = `
        <div style="max-width:680px; margin:40px auto; background:#111822; border:1px solid #202b3a; border-radius:10px; padding:30px; text-align:center;">
          <div style="font-size:48px; margin-bottom:10px;">🏆</div>
          <h2 style="font-size:20px; font-weight:800; color:#ffffff; margin:0 0 6px;">Practice Quiz Completed!</h2>
          <div style="font-size:14px; color:#8b949e; margin-bottom:20px;">Knowledge Verification Across 500 Labs</div>

          <div style="background:#090d14; border:1px solid #222e3f; border-radius:8px; padding:20px; margin-bottom:24px;">
            <div style="font-size:36px; font-weight:800; font-family:var(--font-mono); color:${pct >= 70 ? 'var(--parrot-green)' : 'var(--parrot-yellow)'};">
              ${score} / ${questions.length} (${pct}%)
            </div>
            <div style="font-size:12px; color:#8b949e; margin-top:4px;">
              ${pct >= 70 ? 'Outstanding! You have demonstrated strong hands-on cybersecurity proficiency.' : 'Good attempt! Review the missed questions below to sharpen your skills.'}
            </div>
          </div>

          <div style="text-align:left; margin-bottom:24px;">
            <h3 style="font-size:13px; font-weight:800; text-transform:uppercase; color:#ffffff; margin-bottom:12px;">Quiz Review</h3>
            ${questions.map((q, idx) => {
              const ans = answers[idx] || {};
              return `
                <div style="background:#131c28; border:1px solid ${ans.isCorrect ? 'rgba(5, 213, 80, 0.4)' : 'rgba(255, 51, 102, 0.4)'}; border-radius:6px; padding:12px; margin-bottom:8px;">
                  <div style="font-size:12px; font-weight:700; color:#ffffff; margin-bottom:4px;">
                    ${idx + 1}. [${q.category}] ${q.question}
                  </div>
                  <div style="font-size:11.5px; color:${ans.isCorrect ? 'var(--parrot-green)' : 'var(--parrot-red)'};">
                    ${ans.isCorrect ? '✓ Correct:' : '✗ Your answer:'} <code>${ans.userAns || '(Empty)'}</code>
                  </div>
                  ${!ans.isCorrect ? `<div style="font-size:11px; color:#8b949e; margin-top:2px;">Expected answer: <code>${q.expected}</code></div>` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <div style="display:flex; justify-content:center; gap:12px;">
            <button class="plab-btn primary" id="quiz-retry-btn">Start New Quiz</button>
            <button class="plab-btn secondary" id="quiz-back-dash-btn">Back to Dashboard</button>
          </div>
        </div>
      `;

      targetEl.querySelector('#quiz-retry-btn').onclick = () => {
        this.initNewQuiz();
        this.renderQuiz(targetEl);
      };

      targetEl.querySelector('#quiz-back-dash-btn').onclick = () => {
        this.switchView('dashboard');
      };
      return;
    }

    const currentQ = questions[currentIdx];

    targetEl.innerHTML = `
      <div style="max-width:720px; margin:20px auto; background:#111822; border:1px solid #202b3a; border-radius:10px; padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <span class="plab-badge category">${currentQ.category}</span>
          <span style="font-size:12px; font-family:var(--font-mono); color:#8b949e;">Question ${currentIdx + 1} of ${questions.length}</span>
        </div>

        <div class="plab-progress-track" style="margin-bottom:20px;">
          <div class="plab-progress-bar" style="width:${((currentIdx + 1) / questions.length) * 100}%;"></div>
        </div>

        <h3 style="font-size:15px; font-weight:800; color:#ffffff; line-height:1.45; margin:0 0 16px;">
          ${currentQ.question}
        </h3>

        <div style="margin-bottom:20px;">
          <input type="text" class="plab-q-input" id="quiz-input" placeholder="Type your answer here..." style="font-size:13px; padding:10px 14px;" autocomplete="off" />
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="plab-btn secondary" id="quiz-skip-btn">Skip Question</button>
          <button class="plab-btn primary" id="quiz-submit-btn" style="padding:8px 20px;">Submit Answer ↵</button>
        </div>
      </div>
    `;

    const input = targetEl.querySelector('#quiz-input');
    const submitBtn = targetEl.querySelector('#quiz-submit-btn');
    const skipBtn = targetEl.querySelector('#quiz-skip-btn');

    if (input) {
      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.submitQuizAnswer(input.value);
      });
    }

    if (submitBtn && input) {
      submitBtn.onclick = () => this.submitQuizAnswer(input.value);
    }

    if (skipBtn) {
      skipBtn.onclick = () => this.submitQuizAnswer('');
    }
  }

  initNewQuiz() {
    const allLabs = window.PRACTICE_LABS_DATA || [];
    const pool = [];

    allLabs.forEach(lab => {
      if (lab.questions && lab.questions.length > 0) {
        lab.questions.forEach(q => {
          pool.push({
            labId: lab.id,
            category: lab.category,
            question: q.q,
            expected: q.a,
            hint: q.hint
          });
        });
      }
    });

    // Shuffle and pick 10
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
    this.quizState = {
      questions: shuffled,
      currentIdx: 0,
      answers: [],
      finished: false
    };
  }

  submitQuizAnswer(userAns) {
    if (!this.quizState || this.quizState.finished) return;
    const { questions, currentIdx } = this.quizState;
    const q = questions[currentIdx];

    const normalize = s => String(s || '').toLowerCase().replace(/[`'"]/g, '').trim();
    const isCorrect = normalize(userAns) === normalize(q.expected) ||
                      (q.expected.length > 3 && normalize(userAns).includes(normalize(q.expected)));

    this.quizState.answers.push({
      questionIdx: currentIdx,
      userAns,
      isCorrect
    });

    if (this.quizState.currentIdx < questions.length - 1) {
      this.quizState.currentIdx++;
    } else {
      this.quizState.finished = true;
      const finalScore = this.quizState.answers.filter(a => a.isCorrect).length * 20;
      this.state.quizScore = (this.state.quizScore || 0) + finalScore;
      this.saveState();
    }

    const bodyEl = this.container.querySelector('#plab-content-body');
    if (bodyEl) this.renderQuiz(bodyEl);
  }

  // ==============================================================================
  // 5. ACHIEVEMENT BADGES VIEW
  // ==============================================================================
  renderBadges(targetEl) {
    const completedCount = Object.keys(this.state.completedLabs).length;
    const unlocked = new Set(this.state.badges || []);

    const badges = [
      { id: 'first_lab', title: 'First Steps', desc: 'Complete your first practical cybersecurity lab.', icon: '🎯', unlocked: completedCount >= 1 },
      { id: 'linux_10', title: 'Linux Initiate', desc: 'Complete 10 Linux Fundamentals practical labs.', icon: '🐧', unlocked: this.getCompletedCountByCategory('Linux Fundamentals') >= 10 },
      { id: 'terminal_20', title: 'Terminal Warrior', desc: 'Complete 20 Linux Terminal Command labs.', icon: '⚡', unlocked: this.getCompletedCountByCategory('Linux Terminal Commands') >= 20 },
      { id: 'networking_15', title: 'Network Scout', desc: 'Complete 15 Networking Fundamentals practical labs.', icon: '🌐', unlocked: this.getCompletedCountByCategory('Networking Fundamentals') >= 15 },
      { id: 'scripting_15', title: 'Automation Novice', desc: 'Complete 15 Python & Bash scripting labs.', icon: '🐍', unlocked: (this.getCompletedCountByCategory('Python for Cyber Security') + this.getCompletedCountByCategory('Bash Scripting')) >= 15 },
      { id: 'web_sec_20', title: 'Web Defender', desc: 'Complete 20 Web Security and OWASP labs.', icon: '🛡️', unlocked: this.getCompletedCountByCategory('Web Security') >= 20 },
      { id: 'crypto_10', title: 'Cryptographer', desc: 'Complete 10 Cryptography and encryption labs.', icon: '🔐', unlocked: this.getCompletedCountByCategory('Cryptography') >= 10 },
      { id: 'forensics_10', title: 'Forensics Specialist', desc: 'Complete 10 Digital Forensics and PCAP labs.', icon: '🔍', unlocked: this.getCompletedCountByCategory('Digital Forensics') >= 10 },
      { id: 'osint_10', title: 'OSINT Hunter', desc: 'Complete 10 Open Source Intelligence labs.', icon: '📡', unlocked: this.getCompletedCountByCategory('OSINT') >= 10 },
      { id: 'defense_20', title: 'Incident Responder', desc: 'Complete 20 Defensive Security and SIEM labs.', icon: '🚨', unlocked: this.getCompletedCountByCategory('Defensive Security and Incident Response') >= 20 },
      { id: 'halfway_250', title: 'Halfway Hacker', desc: 'Achieve 250 completed practical labs milestone.', icon: '⚔️', unlocked: completedCount >= 250 },
      { id: 'centurion_500', title: 'Cyber Sentinel Master', desc: 'Complete all 500 hands-on cybersecurity experiments.', icon: '👑', unlocked: completedCount >= 500 }
    ];

    targetEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="font-size:16px; font-weight:800; color:#ffffff; margin:0 0 4px;">Achievement Badges & Certificate</h2>
          <div style="font-size:12px; color:#8b949e;">Master the 15 domains of cybersecurity to unlock prestigious verified credentials.</div>
        </div>
        <button class="plab-btn primary" id="badges-open-cert-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
          <span>Open Printable Certificate</span>
        </button>
      </div>

      <div class="plab-badges-grid">
        ${badges.map(b => `
          <div class="plab-badge-card ${b.unlocked ? 'unlocked' : ''}">
            <div class="plab-badge-icon">${b.icon}</div>
            <div style="font-size:13px; font-weight:800; color:#ffffff;">${b.title}</div>
            <div style="font-size:11px; color:#8b949e; line-height:1.4;">${b.desc}</div>
            <span class="plab-badge ${b.unlocked ? 'beginner' : 'time'}">
              ${b.unlocked ? '✓ Unlocked' : 'Locked'}
            </span>
          </div>
        `).join('')}
      </div>
    `;

    targetEl.querySelector('#badges-open-cert-btn').onclick = () => this.showCertificateModal();
  }

  // ==============================================================================
  // 6. COMPLETION CERTIFICATE MODAL
  // ==============================================================================
  showCertificateModal() {
    const completedCount = Object.keys(this.state.completedLabs).length;
    const rank = this.getUserRank(completedCount);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const verifyHash = `SEC-${Math.abs(completedCount * 31337 + 7331).toString(16).toUpperCase()}-VERIFIED`;

    const modal = document.createElement('div');
    modal.className = 'plab-cert-modal';
    modal.innerHTML = `
      <div class="plab-cert-frame" id="plab-cert-print-area">
        <button id="cert-close-btn" style="position:absolute; top:16px; right:16px; background:transparent; border:none; color:#8b949e; font-size:20px; cursor:pointer;">✕</button>

        <div style="font-size:11px; font-family:var(--font-mono); letter-spacing:2px; color:var(--parrot-cyan); text-transform:uppercase; margin-bottom:8px;">
          PARROTCLOUD OS • CYBERSECURITY ACADEMY
        </div>
        <h1 style="font-size:26px; font-weight:900; letter-spacing:1px; color:#ffffff; margin:0 0 10px; text-transform:uppercase;">
          Certificate of Practical Completion
        </h1>
        <div style="width:80px; height:3px; background:var(--parrot-cyan); margin:0 auto 20px;"></div>

        <p style="font-size:13px; color:#8b949e; margin:0 0 16px;">This verifiable certificate is proudly presented to:</p>
        <div style="font-size:24px; font-weight:800; color:#00e5ff; font-family:var(--font-sans); margin-bottom:16px; border-bottom:1px solid #30363d; display:inline-block; padding:0 24px 6px;">
          <input type="text" id="cert-user-name-input" value="${this.state.userName}" style="background:transparent; border:none; text-align:center; color:#00e5ff; font-weight:800; font-size:22px; outline:none;" title="Click to edit recipient name" />
        </div>

        <p style="font-size:13px; line-height:1.6; color:#c9d1d9; max-width:540px; margin:0 auto 24px;">
          For demonstrating proven hands-on technical proficiency across <strong>${completedCount} of 500</strong> practical cybersecurity experiments, covering Linux Systems, Network Security, Web Application Defense, Digital Forensics, and Threat Mitigation.
        </p>

        <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:24px; border-top:1px solid #222e3f; border-bottom:1px solid #222e3f; padding:14px 0;">
          <div>
            <div style="font-size:10px; color:#8b949e; text-transform:uppercase;">Proficiency Rank</div>
            <div style="font-size:14px; font-weight:700; color:${rank.color};">${rank.title}</div>
          </div>
          <div>
            <div style="font-size:10px; color:#8b949e; text-transform:uppercase;">Issue Date</div>
            <div style="font-size:14px; font-weight:700; color:#ffffff;">${dateStr}</div>
          </div>
          <div>
            <div style="font-size:10px; color:#8b949e; text-transform:uppercase;">Verification Hash</div>
            <div style="font-size:12px; font-family:var(--font-mono); color:var(--parrot-green); font-weight:700;">${verifyHash}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:12px;">
          <button class="plab-btn primary" id="cert-print-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Print / Save PDF</span>
          </button>
          <button class="plab-btn secondary" id="cert-close-btn-2">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const nameInput = modal.querySelector('#cert-user-name-input');
    if (nameInput) {
      nameInput.onchange = () => {
        this.state.userName = nameInput.value.trim() || 'Cyber Cadet';
        this.saveState();
      };
    }

    const close = () => {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    };

    modal.querySelector('#cert-close-btn').onclick = close;
    modal.querySelector('#cert-close-btn-2').onclick = close;

    modal.querySelector('#cert-print-btn').onclick = () => {
      window.print();
    };
  }

  // Helper actions
  startRandomLab() {
    if (!window.PRACTICE_LABS_DATA) return;
    const uncompleted = window.PRACTICE_LABS_DATA.filter(l => !this.state.completedLabs[l.id]);
    const pool = uncompleted.length > 0 ? uncompleted : window.PRACTICE_LABS_DATA;
    const randomLab = pool[Math.floor(Math.random() * pool.length)];
    if (randomLab) this.openLab(randomLab.id);
  }

  startDailyChallenge() {
    if (!window.PRACTICE_LABS_DATA) return;
    const today = new Date();
    const daySeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 31 + today.getDate();
    const index = daySeed % window.PRACTICE_LABS_DATA.length;
    const dailyLab = window.PRACTICE_LABS_DATA[index];
    if (dailyLab) this.openLab(dailyLab.id);
  }

  updateNavCounters() {
    const completedCount = Object.keys(this.state.completedLabs).length;
    const counterEl = this.container ? this.container.querySelector('#nav-count-completed') : null;
    if (counterEl) counterEl.textContent = completedCount;
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  ansiToHtml(text) {
    if (!text) return '';
    return this.escapeHtml(text)
      .replace(/\\n/g, '<br>')
      .replace(/\x1b\[1;32m/g, '<span style="color:#05d550;font-weight:700;">')
      .replace(/\x1b\[1;34m/g, '<span style="color:#58a6ff;font-weight:700;">')
      .replace(/\x1b\[1;36m/g, '<span style="color:#00e5ff;font-weight:700;">')
      .replace(/\x1b\[1;33m/g, '<span style="color:#d29922;font-weight:700;">')
      .replace(/\x1b\[1;31m/g, '<span style="color:#f85149;font-weight:700;">')
      .replace(/\x1b\[0;32m/g, '<span style="color:#05d550;">')
      .replace(/\x1b\[0;34m/g, '<span style="color:#58a6ff;">')
      .replace(/\x1b\[0m/g, '</span>');
  }
}

// Global initialization
window.practiceLabsApp = new PracticeLabsApp();
window.openPracticeLabsApp = (labId) => window.practiceLabsApp.open(labId);
