/**
 * DevEng Coach - Spec 014: 'Bắt Đầu Ngay' One-Tap Start Hero Component
 * Native Web Component: <deveng-one-tap-hero>
 *
 * Key Capabilities:
 *  - Distraction-Free Hero Start Card Overlay centered inside workspace.
 *  - Visual Badges: Day Title, Sprint Badge, Current Streak Badge ('🔥 14 ngày liên tiếp').
 *  - Giant Primary CTA: '▶ Bắt Đầu Ngày [N] (30 phút)' (min 54px height, glowing cyan/emerald accent).
 *  - Secondary Button: '⚡ Quick 10min' (triggers micro-lesson modal).
 *  - Subtle Dismiss Link: 'Bỏ qua → Xem bài học' (dismisses without starting timer).
 *  - One-Tap Start Automation:
 *      1. Smooth fade-out dismissal.
 *      2. Automatically starts 30-minute Pomodoro timer (window.startPomodoroTimer()).
 *      3. Expands Block 1 (Phonetics) in the accordion, collapsing others and scrolling into view.
 *      4. If SRS due items exist (>0), chains the 2-minute SRS Warm-Up modal first.
 *  - Strict Gating Logic:
 *      * Checks sessionStorage ('deveng_hero_dismissed_day'). Shows once per session for the current day.
 *      * Does NOT show if today's session is already completed.
 */

(function () {
  'use strict';

  // Constant storage key
  const STORAGE_DISMISSED_KEY = 'deveng_hero_dismissed_day';

  // =============================================================================
  // GLOBAL TIMER STARTER HELPER (Expose window.startPomodoroTimer if not present)
  // =============================================================================
  if (typeof window.startPomodoroTimer !== 'function') {
    window.startPomodoroTimer = function () {
      try {
        // Priority 1: Sticky header timer toggle button
        const headerToggle = document.getElementById('btn-header-timer-toggle');
        if (headerToggle) {
          const text = headerToggle.textContent.trim().toLowerCase();
          // Only click if not currently running / is paused / says 'start'
          if (text === 'start' || text === 'bắt đầu' || !text.includes('pause')) {
            headerToggle.click();
            return true;
          }
        }

        // Priority 2: In-page timer start button
        const btnStart = document.getElementById('btn-timer-start');
        if (btnStart) {
          btnStart.click();
          return true;
        }
      } catch (err) {
        console.warn('[OneTapStart] Error starting Pomodoro timer:', err);
      }
      return false;
    };
  }

  // =============================================================================
  // WEB COMPONENT: <deveng-one-tap-hero>
  // =============================================================================
  class DevEngOneTapHero extends HTMLElement {
    constructor() {
      super();
      this._isVisible = false;
      this._currentDay = 1;
      this._lessonData = { dayNumber: 1 };
      this._observer = null;
      this._handleKeyDown = this._handleKeyDown.bind(this);
    }

    connectedCallback() {
      this.initStyles();
      this.render();
      this.bindEvents();
      this.observeDOMChanges();
      this.syncWithWorkspace();
      fetchAndPopulateHero(this);
    }

    disconnectedCallback() {
      document.removeEventListener('keydown', this._handleKeyDown);
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }

    // Embed self-contained animation & glow styles
    initStyles() {
      if (document.getElementById('deveng-one-tap-styles')) return;

      const style = document.createElement('style');
      style.id = 'deveng-one-tap-styles';
      style.textContent = `
        deveng-one-tap-hero {
          display: block;
          margin-bottom: 1.5rem;
        }

        .deveng-hero-backdrop {
          display: none;
          width: 100%;
          transition: all 300ms ease;
        }

        .deveng-hero-backdrop.is-active {
          display: block;
        }

        .deveng-hero-card {
          position: relative;
          width: 100%;
          max-width: 100%;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 28, 55, 0.95) 100%);
          border: 1px solid rgba(6, 182, 212, 0.35);
          border-radius: 1.25rem;
          padding: 1.75rem 1.5rem;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(6, 182, 212, 0.08);
          overflow: hidden;
          text-align: center;
          transform: translateY(0);
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .deveng-hero-backdrop.is-active .deveng-hero-card {
          transform: translateY(0);
        }

        /* Ambient glow spots */
        .deveng-hero-glow-cyan {
          position: absolute;
          top: -4rem;
          left: -4rem;
          width: 14rem;
          height: 14rem;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(6, 182, 212, 0) 70%);
          border-radius: 9999px;
          pointer-events: none;
        }

        .deveng-hero-glow-emerald {
          position: absolute;
          bottom: -4rem;
          right: -4rem;
          width: 14rem;
          height: 14rem;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%);
          border-radius: 9999px;
          pointer-events: none;
        }

        /* Giant Primary CTA Button */
        .deveng-hero-primary-btn {
          min-height: 54px;
          height: 58px;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
          color: #020617;
          font-family: inherit;
          font-size: 1.125rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          border: none;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.35), 0 4px 12px rgba(16, 185, 129, 0.25);
          transition: all 200ms ease;
        }

        .deveng-hero-primary-btn:hover {
          background: linear-gradient(135deg, #22d3ee 0%, #34d399 100%);
          box-shadow: 0 0 35px rgba(6, 182, 212, 0.55), 0 6px 18px rgba(16, 185, 129, 0.4);
          transform: translateY(-1px) scale(1.01);
        }

        .deveng-hero-primary-btn:active {
          transform: translateY(1px) scale(0.99);
        }

        /* Milestone & SRS Header Badges */
        .deveng-hero-milestone-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 800;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.35) 100%);
          color: #fde68a;
          border: 1px solid rgba(251, 191, 36, 0.75);
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }

        .deveng-hero-milestone-badge[hidden] {
          display: none !important;
        }

        .deveng-hero-srs-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 700;
          background: rgba(88, 28, 135, 0.45);
          color: #e9d5ff;
          border: 1px solid rgba(168, 85, 247, 0.45);
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }

        /* Secondary Quick 10m Button */
        .deveng-hero-quick-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.875rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(71, 85, 105, 0.6);
          color: #fcd34d;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 180ms ease;
        }

        .deveng-hero-quick-btn:hover {
          background: rgba(51, 65, 85, 0.9);
          border-color: rgba(251, 191, 36, 0.5);
          color: #fef08a;
          transform: translateY(-1px);
        }

        /* Secondary Eyes-Free Audio CTA Button */
        .deveng-hero-audio-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.875rem;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(56, 189, 248, 0.45);
          color: #7dd3fc;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 180ms ease;
        }

        .deveng-hero-audio-btn:hover {
          background: rgba(12, 74, 110, 0.55);
          border-color: rgba(56, 189, 248, 0.8);
          color: #e0f2fe;
          transform: translateY(-1px);
        }

        /* Subtle text link */
        .deveng-hero-skip-link {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.35rem 0.75rem;
          border-radius: 0.5rem;
          transition: color 180ms ease;
          text-decoration: none;
        }

        .deveng-hero-skip-link:hover {
          color: #e2e8f0;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
      `;
      document.head.appendChild(style);
    }

    render() {
      this.innerHTML = `
        <div id="deveng-hero-overlay" class="deveng-hero-backdrop" role="dialog" aria-modal="true" aria-labelledby="deveng-hero-title">
          <div class="deveng-hero-card">
            <!-- Glow Accents -->
            <div class="deveng-hero-glow-cyan"></div>
            <div class="deveng-hero-glow-emerald"></div>

            <!-- Top Badges Header -->
            <div class="flex items-center justify-center gap-2 flex-wrap mb-4">
              <!-- Sprint Badge -->
              <span id="deveng-hero-sprint-badge" class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 flex items-center gap-1.5 shadow-sm">
                <span>⚡</span>
                <span id="deveng-hero-sprint-text">SPRINT 1</span>
              </span>

              <!-- Streak Badge -->
              <span id="deveng-hero-streak-badge" class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/70 text-amber-300 border border-amber-800/80 flex items-center gap-1.5 shadow-sm">
                <span id="deveng-hero-streak-text">🔥 0 ngày liên tiếp</span>
              </span>

              <!-- SRS Due Badge -->
              <span id="deveng-hero-srs-badge" class="deveng-hero-srs-badge shadow-sm">🧠 0 từ cần ôn</span>

              <!-- Milestone Badge (Days 30, 60, 90) -->
              <span id="deveng-hero-milestone-badge" class="deveng-hero-milestone-badge hidden" hidden>🏆 Sát Hạch Milestone Ngày 30</span>
            </div>

            <!-- Pre-title context -->
            <div class="text-xs font-mono tracking-widest text-slate-400 uppercase font-semibold mb-1">
              BUỔI HỌC HÔM NAY // DAILY FOCUS
            </div>

            <!-- Main Day Title -->
            <h2 id="deveng-hero-day-title" class="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug mb-2">
              Loading lesson...
            </h2>

            <!-- Focus Objective Snippet -->
            <p id="deveng-hero-day-objective" class="text-xs sm:text-sm text-slate-400 max-w-md mx-auto line-clamp-2 mb-6">
              Nạp phản xạ tiếng Anh kỹ thuật qua 3 chặng Pomodoro 30 phút.
            </p>

            <!-- Actions Cluster -->
            <div class="hero-actions space-y-3 w-full max-w-md mx-auto">
              <!-- Giant Primary CTA -->
              <button id="deveng-hero-btn-primary" class="deveng-hero-primary-btn" title="Bắt đầu buổi học 30 phút ngay bây giờ">
                <span class="text-xl">▶</span>
                <span id="deveng-hero-btn-label">Bắt Đầu Ngày 1 (30 phút)</span>
              </button>

              <!-- Secondary Action Buttons Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <!-- Secondary Quick 10m Button -->
                <button id="deveng-hero-btn-quick" class="deveng-hero-quick-btn" title="Chế độ học nhanh 10 phút">
                  <span>⚡</span>
                  <span>Quick 10min</span>
                </button>

                <!-- Secondary Eyes-Free Audio CTA Button -->
                <button id="deveng-hero-btn-audio" class="deveng-hero-audio-btn" title="Chế độ Nghe không cần nhìn màn hình (Eyes-Free)">
                  <span>🎧 Chế độ Nghe (Eyes-Free)</span>
                </button>
              </div>

              <!-- Subtle Skip Link -->
              <div class="pt-1">
                <button id="deveng-hero-link-skip" class="deveng-hero-skip-link" title="Bỏ qua màn hình này để tự do khám phá bài học">
                  Bỏ qua → Xem bài học
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    bindEvents() {
      const btnPrimary = this.querySelector('#deveng-hero-btn-primary');
      const btnQuick = this.querySelector('#deveng-hero-btn-quick');
      const btnAudio = this.querySelector('#deveng-hero-btn-audio');
      const linkSkip = this.querySelector('#deveng-hero-link-skip');
      const overlay = this.querySelector('#deveng-hero-overlay');

      if (btnPrimary) {
        btnPrimary.addEventListener('click', () => this.handleOneTapStart());
      }

      if (btnQuick) {
        btnQuick.addEventListener('click', () => this.handleQuickTenMin());
      }

      if (btnAudio) {
        btnAudio.addEventListener('click', () => this.startEyesFreeSession());
      }

      if (linkSkip) {
        linkSkip.addEventListener('click', () => this.handleSkip());
      }

      // Close on backdrop click
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            this.handleSkip();
          }
        });
      }

      // Keyboard support: Escape closes without timer
      document.addEventListener('keydown', this._handleKeyDown);
    }

    _handleKeyDown(e) {
      if (e.key === 'Escape' && this._isVisible) {
        e.preventDefault();
        this.handleSkip();
      }
    }

    // ===========================================================================
    // GATING & DATA EXTRACTION
    // ===========================================================================

    getCurrentDay() {
      // 1. Try reading value from jump dropdown
      const selectJump = document.getElementById('select-jump-day');
      if (selectJump && selectJump.value) {
        const val = parseInt(selectJump.value, 10);
        if (!isNaN(val) && val > 0) return val;
      }

      // 2. Try parsing badge-day text ("DAY 1 // SPRINT 1")
      const badgeDay = document.getElementById('badge-day');
      if (badgeDay && badgeDay.textContent) {
        const match = badgeDay.textContent.match(/DAY\s*(\d+)/i);
        if (match) {
          const val = parseInt(match[1], 10);
          if (!isNaN(val) && val > 0) return val;
        }
      }

      return this._currentDay || 1;
    }

    isTodayCompleted() {
      // If completed banner is visible (not hidden)
      const banner = document.getElementById('session-completed-banner');
      if (banner && !banner.classList.contains('hidden')) {
        return true;
      }
      return false;
    }

    isDismissedForDay(dayNumber) {
      try {
        const dismissed = sessionStorage.getItem(STORAGE_DISMISSED_KEY);
        return dismissed !== null && String(dismissed) === String(dayNumber);
      } catch (_) {
        return false;
      }
    }

    markDismissed(dayNumber) {
      try {
        sessionStorage.setItem(STORAGE_DISMISSED_KEY, String(dayNumber));
      } catch (_) {}
    }

    syncWithWorkspace() {
      const day = this.getCurrentDay();
      this._currentDay = day;

      // Gating Check 1: Already dismissed for current scheduled day
      if (this.isDismissedForDay(day)) {
        this.hideOverlay(false);
        return;
      }

      // Gating Check 2: Today's session is already completed
      if (this.isTodayCompleted()) {
        this.hideOverlay(false);
        return;
      }

      // Populate Visual Elements
      this.populateVisuals(day);

      // Show overlay
      this.showOverlay();
    }

    populateVisuals(dayNumber) {
      // 1. Day Title
      const titleEl = document.getElementById('lesson-title');
      const heroTitleEl = this.querySelector('#deveng-hero-day-title');
      let title = titleEl?.textContent?.trim() || '';
      if (!title || title === 'Loading lesson...') {
        title = `Ngày ${dayNumber}: Luyện Phản Xạ Cấu Âm`;
      }
      if (heroTitleEl) heroTitleEl.textContent = title;

      // 2. Sprint Badge
      const sprintNameEl = document.getElementById('badge-sprint-name');
      const heroSprintTextEl = this.querySelector('#deveng-hero-sprint-text');
      let sprintText = sprintNameEl?.textContent?.trim() || '';
      if (!sprintText) {
        const sprintId = Math.ceil(dayNumber / 10);
        sprintText = `SPRINT ${sprintId}`;
      } else if (!sprintText.toUpperCase().includes('SPRINT')) {
        const sprintId = Math.ceil(dayNumber / 10);
        sprintText = `SPRINT ${sprintId} // ${sprintText}`;
      }
      if (heroSprintTextEl) heroSprintTextEl.textContent = sprintText;

      // 3. Current Streak Badge
      const streakEl = document.getElementById('stat-streak');
      const heroStreakTextEl = this.querySelector('#deveng-hero-streak-text');
      let streakStr = streakEl?.textContent?.trim() || '';
      let streakNum = parseInt(streakStr.replace(/[^\d]/g, ''), 10) || 0;
      if (heroStreakTextEl) {
        heroStreakTextEl.textContent = `🔥 ${streakNum} ngày liên tiếp`;
      }

      // 4. Objective Snippet
      const objEl = document.getElementById('lesson-objective');
      const heroObjEl = this.querySelector('#deveng-hero-day-objective');
      if (objEl && objEl.textContent?.trim() && heroObjEl) {
        heroObjEl.textContent = objEl.textContent.trim();
      }

      // 5. Giant Primary CTA label
      const btnLabel = this.querySelector('#deveng-hero-btn-label');
      if (btnLabel) {
        btnLabel.textContent = `▶ Bắt Đầu Ngày ${dayNumber} (30 phút)`;
      }

      // 6. Read SRS due count from DOM if available and update Milestone + SRS badges
      const srsDueEl = document.getElementById('stat-srs-due');
      let domSrsDue = undefined;
      if (srsDueEl && srsDueEl.textContent) {
        const parsedDue = parseInt(srsDueEl.textContent.replace(/[^\d]/g, ''), 10);
        if (!isNaN(parsedDue)) domSrsDue = parsedDue;
      }

      this.updateContent({
        dayNumber,
        srsDueCount: domSrsDue
      });
    }

    updateContent(data = {}) {
      const dayNum = Number(data?.dayNumber ?? data?.day ?? this._currentDay ?? 1);
      this._currentDay = dayNum;
      this._lessonData = {
        ...(this._lessonData || {}),
        ...data,
        dayNumber: dayNum
      };

      // Update Day Title if provided
      if (data.title || data.topic) {
        const heroTitleEl = this.querySelector('#deveng-hero-day-title');
        if (heroTitleEl) {
          heroTitleEl.textContent = data.title || data.topic;
        }
      }

      // Update Objective if provided
      if (data.objective || data.focusObjective) {
        const heroObjEl = this.querySelector('#deveng-hero-day-objective');
        if (heroObjEl) {
          heroObjEl.textContent = data.objective || data.focusObjective;
        }
      }

      // Update Sprint Badge if provided
      if (data.sprintName || data.sprintId) {
        const heroSprintTextEl = this.querySelector('#deveng-hero-sprint-text');
        if (heroSprintTextEl) {
          const sprintId = data.sprintId || Math.ceil(dayNum / 10);
          heroSprintTextEl.textContent = data.sprintName
            ? (String(data.sprintName).toUpperCase().includes('SPRINT') ? data.sprintName : `SPRINT ${sprintId} // ${data.sprintName}`)
            : `SPRINT ${sprintId}`;
        }
      }

      // Update Streak Badge if provided
      const streakVal = typeof data.currentStreak === 'number' ? data.currentStreak : data.streak;
      if (typeof streakVal === 'number') {
        const heroStreakTextEl = this.querySelector('#deveng-hero-streak-text');
        if (heroStreakTextEl) {
          heroStreakTextEl.textContent = `🔥 ${streakVal} ngày liên tiếp`;
        }
      }

      // Update Primary CTA Label
      const btnLabel = this.querySelector('#deveng-hero-btn-label');
      if (btnLabel) {
        btnLabel.textContent = `▶ Bắt Đầu Ngày ${dayNum} (30 phút)`;
      }

      // Milestone Badge (Days 30, 60, 90)
      const milestoneBadge = this.querySelector('#deveng-hero-milestone-badge');
      if (milestoneBadge) {
        if (dayNum === 30 || dayNum === 60 || dayNum === 90) {
          milestoneBadge.textContent = `🏆 Sát Hạch Milestone Ngày ${dayNum}`;
          milestoneBadge.hidden = false;
          milestoneBadge.classList.remove('hidden');
        } else {
          milestoneBadge.hidden = true;
          milestoneBadge.classList.add('hidden');
        }
      }

      // SRS Due Badge
      const srsBadge = this.querySelector('#deveng-hero-srs-badge');
      if (srsBadge && typeof data.srsDueCount === 'number') {
        srsBadge.textContent = `🧠 ${data.srsDueCount} từ cần ôn`;
      }
    }

    dismiss() {
      const day = this._lessonData?.dayNumber || this.getCurrentDay();
      this.markDismissed(day);
      this.hideOverlay(true);
    }

    showOverlay() {
      const overlay = this.querySelector('#deveng-hero-overlay');
      if (overlay) {
        overlay.classList.add('is-active');
        this._isVisible = true;
      }
    }

    hideOverlay(smooth = true) {
      const overlay = this.querySelector('#deveng-hero-overlay');
      if (!overlay) return;

      this._isVisible = false;
      if (smooth) {
        overlay.classList.remove('is-active');
      } else {
        overlay.style.transition = 'none';
        overlay.classList.remove('is-active');
        // Restore transition for next potential opening
        requestAnimationFrame(() => {
          overlay.style.transition = '';
        });
      }
    }

    // ===========================================================================
    // ACTIONS
    // ===========================================================================

    // 1. One-Tap Start Action
    async handleOneTapStart() {
      this.dismiss();

      // A. Automatically start Pomodoro 30m timer
      if (typeof window.startPomodoroTimer === 'function') {
        window.startPomodoroTimer();
      }

      // B. Expand Block 1 (Phonetics) in the accordion
      this.expandPhoneticsBlock();

      // C. If SRS due items exist (>0), chain the 2-minute SRS Warm-Up modal first
      await this.chainSrsWarmUpIfNeeded();
    }

    // 2. Secondary Quick 10m Action
    handleQuickTenMin() {
      this.dismiss();

      // Trigger micro-lesson mode
      const btnOpenMicro = document.getElementById('btn-open-microlesson')
        || document.getElementById('btn-quick-10m-inline');

      if (btnOpenMicro) {
        btnOpenMicro.click();
      } else {
        const modal = document.getElementById('modal-microlesson');
        if (modal) modal.classList.remove('hidden');
      }
    }

    // 3. Secondary Eyes-Free Audio Action
    startEyesFreeSession() {
      const dayNumber = this._lessonData?.dayNumber || this.getCurrentDay() || 1;
      this.dismiss();

      this.dispatchEvent(
        new CustomEvent('deveng-one-tap-audio', {
          bubbles: true,
          composed: true,
          detail: { dayNumber }
        })
      );

      if (typeof window.startAudioOnlyMode === 'function' && window.state?.currentLesson) {
        window.startAudioOnlyMode(window.state.currentLesson);
      } else {
        document.getElementById('nav-audio-only')?.click();
      }

      window.showDevEngToast?.('🎧 Đang khởi động chế độ Nghe (Eyes-Free)...', 'info');
    }

    // 4. Subtle Skip Link
    handleSkip() {
      this.dismiss();
    }

    // Accordion Expansion Helper
    expandPhoneticsBlock() {
      const card1 = document.getElementById('stage-1-card');
      const card2 = document.getElementById('stage-2-card');
      const card3 = document.getElementById('stage-3-card');
      const btn1 = document.getElementById('btn-toggle-stage-1');
      const btn2 = document.getElementById('btn-toggle-stage-2');
      const btn3 = document.getElementById('btn-toggle-stage-3');

      // Expand Stage 1
      if (card1) {
        card1.classList.remove('collapsed');
        if (btn1) btn1.textContent = '▼';
      }

      // Collapse Stage 2 & 3
      if (card2) {
        card2.classList.add('collapsed');
        if (btn2) btn2.textContent = '▶';
      }
      if (card3) {
        card3.classList.add('collapsed');
        if (btn3) btn3.textContent = '▶';
      }

      // Update phase indicator if available
      const phaseLabel = document.getElementById('active-phase-indicator');
      if (phaseLabel) {
        phaseLabel.textContent = "Chặng 1: 0-10m Cơ Học Khẩu Hình";
      }

      // Smooth scroll down to Stage 1 card
      if (card1) {
        setTimeout(() => {
          card1.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }

    // SRS Warm-Up Chain Helper
    async chainSrsWarmUpIfNeeded() {
      try {
        let dueCount = 0;

        // Check DOM stat badge first
        const srsDueEl = document.getElementById('stat-srs-due');
        if (srsDueEl && srsDueEl.textContent) {
          dueCount = parseInt(srsDueEl.textContent.replace(/[^\d]/g, ''), 10) || 0;
        }

        // If not found in DOM or 0, query API to be certain
        if (dueCount <= 0) {
          const res = await fetch('/api/srs/stats').catch(() => null);
          if (res && res.ok) {
            const stats = await res.json();
            dueCount = stats?.dueToday || 0;
          }
        }

        if (dueCount > 0) {
          const btnWarmup = document.getElementById('btn-open-warmup');
          if (btnWarmup) {
            btnWarmup.click();
          } else {
            const modal = document.getElementById('modal-srs-warmup');
            if (modal) modal.classList.remove('hidden');
          }
        }
      } catch (err) {
        console.warn('[OneTapStart] Failed checking SRS warmup:', err);
      }
    }

    // Live DOM observation to sync with day changes and completion state
    observeDOMChanges() {
      // 1. Observe changes on lesson title or completed banner
      const titleEl = document.getElementById('lesson-title');
      const bannerEl = document.getElementById('session-completed-banner');
      const badgeDayEl = document.getElementById('badge-day');

      if (window.MutationObserver) {
        this._observer = new MutationObserver(() => {
          this.syncWithWorkspace();
        });

        if (titleEl) {
          this._observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
        }
        if (bannerEl) {
          this._observer.observe(bannerEl, { attributes: true, attributeFilter: ['class'] });
        }
        if (badgeDayEl) {
          this._observer.observe(badgeDayEl, { childList: true, characterData: true, subtree: true });
        }
      }

      // 2. Listen to day jump switcher dropdown
      const selectJump = document.getElementById('select-jump-day');
      if (selectJump) {
        selectJump.addEventListener('change', () => {
          setTimeout(() => {
            this.syncWithWorkspace();
            fetchAndPopulateHero(this);
          }, 60);
        });
      }

      // 3. Listen to Prev / Next day buttons
      const btnPrev = document.getElementById('btn-prev-day');
      const btnNext = document.getElementById('btn-next-day');
      if (btnPrev) {
        btnPrev.addEventListener('click', () => setTimeout(() => {
          this.syncWithWorkspace();
          fetchAndPopulateHero(this);
        }, 80));
      }
      if (btnNext) {
        btnNext.addEventListener('click', () => setTimeout(() => {
          this.syncWithWorkspace();
          fetchAndPopulateHero(this);
        }, 80));
      }
    }
  }

  // =============================================================================
  // DATA FETCHER FOR HERO OVERLAY (/api/progress, /api/lessons/{day}, /api/srs/due)
  // =============================================================================
  async function fetchAndPopulateHero(heroEl) {
    if (!heroEl || typeof heroEl.updateContent !== 'function') return;

    try {
      const progressRes = await fetch('/api/progress').catch(() => null);
      const progress = progressRes && progressRes.ok
        ? await progressRes.json().catch(() => null)
        : null;

      const selectJump = document.getElementById('select-jump-day');
      const jumpDay = selectJump && selectJump.value ? parseInt(selectJump.value, 10) : null;
      const currentDay = (jumpDay && !isNaN(jumpDay) && jumpDay > 0)
        ? jumpDay
        : (progress?.currentDay || heroEl.getCurrentDay?.() || 1);

      const [lessonRes, srsDueRes] = await Promise.all([
        fetch(`/api/lessons/${currentDay}`).catch(() => null),
        fetch('/api/srs/due').catch(() => null)
      ]);

      const lesson = lessonRes && lessonRes.ok
        ? await lessonRes.json().catch(() => null)
        : null;
      const srsDueData = srsDueRes && srsDueRes.ok
        ? await srsDueRes.json().catch(() => null)
        : null;

      let srsDueCount = 0;
      if (Array.isArray(srsDueData)) {
        srsDueCount = srsDueData.length;
      } else if (srsDueData && typeof srsDueData.count === 'number') {
        srsDueCount = srsDueData.count;
      } else if (srsDueData && typeof srsDueData.dueToday === 'number') {
        srsDueCount = srsDueData.dueToday;
      }

      heroEl.updateContent({
        dayNumber: lesson?.dayNumber || currentDay,
        title: lesson?.title || lesson?.topic,
        objective: lesson?.focusObjective || lesson?.objective,
        sprintId: lesson?.sprintId,
        sprintName: lesson?.sprintName,
        currentStreak: progress?.currentStreak ?? progress?.streakDays,
        srsDueCount
      });
    } catch (err) {
      console.warn('[OneTapStart] Failed fetching hero data:', err);
    }
  }

  window.fetchAndPopulateHero = fetchAndPopulateHero;

  // =============================================================================
  // REGISTER CUSTOM ELEMENT & AUTO-MOUNT COMPONENT
  // =============================================================================
  if (typeof customElements !== 'undefined' && !customElements.get('deveng-one-tap-hero')) {
    customElements.define('deveng-one-tap-hero', DevEngOneTapHero);
  }

  // Global helper on window to control or test the hero overlay
  window.showDevEngOneTapHero = function () {
    let hero = document.querySelector('deveng-one-tap-hero');
    if (!hero) {
      const workspace = document.getElementById('view-workspace') || document.body;
      hero = document.createElement('deveng-one-tap-hero');
      workspace.prepend(hero);
    }
    hero.showOverlay();
  };

  window.dismissDevEngOneTapHero = function () {
    const hero = document.querySelector('deveng-one-tap-hero');
    if (hero) hero.hideOverlay(true);
  };

  // Auto-mount inside #view-workspace when DOM is ready
  function ensureOneTapHeroMounted() {
    const workspace = document.getElementById('view-workspace');
    if (!workspace) {
      return; // Not on workspace view or page, exit cleanly without looping
    }

    if (!document.querySelector('deveng-one-tap-hero')) {
      const hero = document.createElement('deveng-one-tap-hero');
      workspace.prepend(hero);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureOneTapHeroMounted);
  } else {
    ensureOneTapHeroMounted();
  }

})();
