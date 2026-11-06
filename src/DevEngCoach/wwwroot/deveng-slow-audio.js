/**
 * DevEng Coach - Spec 012: Slow-Motion Phoneme Playback
 * Native Web Component & Speech Audio Controller: <deveng-speed-badge>
 *
 * Capabilities:
 *  1. Global Playback Speed State:
 *     - Supported: 0.5x, 0.75x, 1x (1.0x), 1.25x
 *     - Default: 1.0x
 *     - Persistent in localStorage ('deveng_playback_speed')
 *     - API: window.getPlaybackSpeed(), window.setPlaybackSpeed(speed), window.cyclePlaybackSpeed()
 *     - Event: 'deveng:speedchange' (detail: { speed, previousSpeed, speeds })
 *
 *  2. Slow Speech Synthesis Player:
 *     - API: window.speakWordSlow(text, customRate = 0.5)
 *     - Uses Web Speech Synthesis API (SpeechSynthesisUtterance.rate = customRate)
 *     - Auto-cancels prior utterances to eliminate audio collisions
 *     - Anti-garbage collection reference tracking for Chromium
 *
 *  3. Click Delegation:
 *     - Intercepts clicks on any button with .speak-btn-slow or [data-word-slow]
 *     - Cancels active speech, extracts word, and plays at 0.5x
 *
 *  4. Contrastive Minimal Pair Slow Comparison:
 *     - API: window.playContrastiveSlow(wordA, wordB, onStep)
 *     - Plays wordA at 0.5x -> waits 500ms silence -> plays wordB at 0.5x
 *     - Triggers onStep(step, currentWord, info) for reactive UI highlighting
 *     - Click delegation on .btn-contrastive-slow or [data-contrastive-slow]
 *
 *  5. Auto-Mounting Header Speed Badge:
 *     - Custom Element: <deveng-speed-badge>
 *     - Renders '🐢 0.5x | 0.75x | 1x | 1.25x' with active speed highlighted
 *     - Cycles through speeds on click; directly selects speed on chip click
 *     - Auto-mounts into the application header on startup
 */

(function () {
  'use strict';

  // =============================================================================
  // CONSTANTS & CONFIGURATION
  // =============================================================================
  const STORAGE_KEY = 'deveng_playback_speed';
  const SUPPORTED_SPEEDS = [0.5, 0.75, 1.0, 1.25];
  const DEFAULT_SPEED = 1.0;

  // Track active utterance to avoid Chromium garbage collection bug
  let activeUtterance = null;

  // Track active contrastive comparison token for clean cancellation
  let activeContrastiveToken = 0;

  // =============================================================================
  // 1. GLOBAL PLAYBACK SPEED STATE & PERSISTENCE
  // =============================================================================

  /**
   * Safely read initial speed from localStorage
   */
  function readSavedSpeed() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          const parsed = parseFloat(saved);
          if (!isNaN(parsed) && SUPPORTED_SPEEDS.includes(parsed)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[deveng-slow-audio] Failed to read speed from localStorage:', e);
    }
    return DEFAULT_SPEED;
  }

  /**
   * Safely persist speed to localStorage
   */
  function persistSpeed(speed) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, String(speed));
      }
    } catch (e) {
      console.warn('[deveng-slow-audio] Failed to save speed to localStorage:', e);
    }
  }

  let currentSpeed = readSavedSpeed();

  /**
   * Dispatches 'deveng:speedchange' on window and document
   */
  function dispatchSpeedChangeEvent(newSpeed, previousSpeed) {
    const detail = {
      speed: newSpeed,
      previousSpeed: previousSpeed,
      speeds: [...SUPPORTED_SPEEDS]
    };

    const evt = new CustomEvent('deveng:speedchange', {
      detail,
      bubbles: true,
      composed: true
    });

    try {
      window.dispatchEvent(evt);
      if (typeof document !== 'undefined') {
        document.dispatchEvent(evt);
      }
    } catch (e) {
      console.error('[deveng-slow-audio] Error dispatching deveng:speedchange:', e);
    }
  }

  /**
   * Get current playback speed (number: 0.5, 0.75, 1.0, 1.25)
   */
  function getPlaybackSpeed() {
    return currentSpeed;
  }

  /**
   * Set playback speed, persist to localStorage, and dispatch event
   * @param {number|string} speed
   * @returns {number} The updated speed
   */
  function setPlaybackSpeed(speed) {
    const parsed = typeof speed === 'string' ? parseFloat(speed) : speed;
    if (isNaN(parsed) || typeof parsed !== 'number') {
      return currentSpeed;
    }

    // Match exact supported speed or find closest
    let targetSpeed = parsed;
    if (!SUPPORTED_SPEEDS.includes(targetSpeed)) {
      targetSpeed = SUPPORTED_SPEEDS.reduce((prev, curr) =>
        Math.abs(curr - parsed) < Math.abs(prev - parsed) ? curr : prev
      );
    }

    if (currentSpeed !== targetSpeed) {
      const previous = currentSpeed;
      currentSpeed = targetSpeed;
      persistSpeed(currentSpeed);
      dispatchSpeedChangeEvent(currentSpeed, previous);
    }

    return currentSpeed;
  }

  /**
   * Cycles to the next supported speed: 0.5x -> 0.75x -> 1.0x -> 1.25x -> 0.5x
   * @returns {number} The new speed
   */
  function cyclePlaybackSpeed() {
    const currentIndex = SUPPORTED_SPEEDS.indexOf(currentSpeed);
    const nextIndex = (currentIndex + 1) % SUPPORTED_SPEEDS.length;
    return setPlaybackSpeed(SUPPORTED_SPEEDS[nextIndex]);
  }

  // Expose global speed APIs
  window.getPlaybackSpeed = getPlaybackSpeed;
  window.setPlaybackSpeed = setPlaybackSpeed;
  window.cyclePlaybackSpeed = cyclePlaybackSpeed;
  window.DEVENG_SPEEDS = SUPPORTED_SPEEDS;

  // =============================================================================
  // 2. SLOW SPEECH SYNTHESIS ENGINE
  // =============================================================================

  /**
   * Selects best available en-US voice
   */
  function getBestEnglishVoice() {
    if (!window.speechSynthesis) return null;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      return (
        voices.find(v => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0]
      );
    } catch (_) {
      return null;
    }
  }

  /**
   * Speak a word or phrase slowly using Web Speech Synthesis
   * @param {string} text - Word or phrase to pronounce
   * @param {number} [customRate=0.5] - Speech rate (defaults to 0.5x)
   * @returns {Promise<void>} Resolves when speech finishes
   */
  function speakWordSlow(text, customRate = 0.5) {
    return new Promise((resolve) => {
      if (!text || typeof text !== 'string') {
        resolve();
        return;
      }

      const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
      if (!cleanText) {
        resolve();
        return;
      }

      if (!('speechSynthesis' in window)) {
        console.warn('[deveng-slow-audio] SpeechSynthesis is not supported in this browser.');
        resolve();
        return;
      }

      try {
        // Immediate cancellation of any prior utterances
        window.speechSynthesis.cancel();

        // Resume if browser paused synthesis
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';

        const safeRate = typeof customRate === 'number' && !isNaN(customRate) && customRate > 0
          ? customRate
          : 0.5;

        utterance.rate = safeRate;
        utterance.pitch = 1.0;

        const voice = getBestEnglishVoice();
        if (voice) {
          utterance.voice = voice;
        }

        // Retain reference to prevent garbage collection mid-speech
        activeUtterance = utterance;

        let finished = false;
        const cleanup = () => {
          if (!finished) {
            finished = true;
            if (activeUtterance === utterance) {
              activeUtterance = null;
            }
            resolve();
          }
        };

        utterance.onend = cleanup;
        utterance.onerror = (err) => {
          console.warn('[deveng-slow-audio] Utterance error:', err);
          cleanup();
        };

        // Safety fallback timeout in case TTS engine stalls
        const maxDurationMs = Math.max(3000, cleanText.length * 500);
        setTimeout(cleanup, maxDurationMs);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('[deveng-slow-audio] Error in speakWordSlow:', err);
        resolve();
      }
    });
  }

  window.speakWordSlow = speakWordSlow;

  // =============================================================================
  // 3. CONTRASTIVE MINIMAL PAIR SLOW COMPARISON
  // =============================================================================

  /**
   * Stop active contrastive comparison playback immediately
   */
  function stopContrastiveSlow() {
    activeContrastiveToken++;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Plays Sound A at 0.5x, waits 500ms, plays Sound B at 0.5x,
   * invoking onStep callback on each step for UI highlighting.
   *
   * @param {string} wordA - First word (e.g. "test")
   * @param {string} wordB - Second word (e.g. "dead")
   * @param {function} [onStep] - Callback (stepNumber, currentWord, metadata)
   *                              step 1: playing wordA
   *                              step 'pause': waiting 500ms
   *                              step 2: playing wordB
   *                              step 0: complete / idle
   * @returns {Promise<void>} Resolves when contrastive comparison completes
   */
  async function playContrastiveSlow(wordA, wordB, onStep) {
    if (!wordA && !wordB) return;

    // Invalidate any ongoing contrastive sequence
    const currentToken = ++activeContrastiveToken;

    // Stop existing audio immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      // Step 1: Play wordA at 0.5x
      if (wordA) {
        if (currentToken !== activeContrastiveToken) return;
        if (typeof onStep === 'function') {
          onStep(1, wordA, { step: 1, word: wordA, index: 0, status: 'playing' });
        }
        await speakWordSlow(wordA, 0.5);
      }

      // 500ms Pause Between Contrastive Sounds
      if (currentToken !== activeContrastiveToken) return;
      if (typeof onStep === 'function') {
        onStep('pause', null, { step: 'pause', delayMs: 500, status: 'waiting' });
      }
      await new Promise(r => setTimeout(r, 500));

      // Step 2: Play wordB at 0.5x
      if (wordB) {
        if (currentToken !== activeContrastiveToken) return;
        if (typeof onStep === 'function') {
          onStep(2, wordB, { step: 2, word: wordB, index: 1, status: 'playing' });
        }
        await speakWordSlow(wordB, 0.5);
      }

      // Step 0: Done / Reset
      if (currentToken !== activeContrastiveToken) return;
      if (typeof onStep === 'function') {
        onStep(0, null, { step: 0, status: 'done' });
      }
    } catch (err) {
      console.error('[deveng-slow-audio] Error during contrastive playback:', err);
      if (currentToken === activeContrastiveToken && typeof onStep === 'function') {
        onStep(0, null, { step: 0, status: 'error', error: err });
      }
    }
  }

  window.playContrastiveSlow = playContrastiveSlow;
  window.stopContrastiveSlow = stopContrastiveSlow;

  // =============================================================================
  // 4. CLICK EVENT DELEGATION
  // =============================================================================

  /**
   * Extracts clean word from element attributes or child text
   */
  function extractWordFromElement(el) {
    if (!el) return '';
    return (
      el.getAttribute('data-word-slow') ||
      el.getAttribute('data-word') ||
      el.getAttribute('data-target-word') ||
      el.dataset?.wordSlow ||
      el.dataset?.word ||
      el.textContent.replace(/[🐢🔊👂⚡]/g, '').trim()
    );
  }

  /**
   * Global click delegation listener
   */
  document.addEventListener('click', function (event) {
    const target = event.target;
    if (!target || !(target instanceof Element)) return;

    // Check for Contrastive Slow Comparison Trigger
    const contrastiveBtn = target.closest('.btn-contrastive-slow, [data-contrastive-slow], [data-pair-slow]');
    if (contrastiveBtn) {
      event.preventDefault();
      event.stopPropagation();

      const wordA = contrastiveBtn.getAttribute('data-word-a') ||
                    contrastiveBtn.getAttribute('data-sound-a') ||
                    '';
      const wordB = contrastiveBtn.getAttribute('data-word-b') ||
                    contrastiveBtn.getAttribute('data-sound-b') ||
                    '';

      // Visual pulse on the button
      contrastiveBtn.classList.add('deveng-slow-playing');

      playContrastiveSlow(wordA, wordB, (step, currentWord) => {
        // Highlight corresponding target elements if present in surrounding DOM
        const container = contrastiveBtn.closest('.contrastive-card, [data-contrastive-container]') || document;
        const targetA = container.querySelector('[data-contrastive-target="a"], .contrastive-target-a');
        const targetB = container.querySelector('[data-contrastive-target="b"], .contrastive-target-b');

        if (step === 1) {
          targetA?.classList.add('deveng-step-active');
          targetB?.classList.remove('deveng-step-active');
        } else if (step === 2) {
          targetA?.classList.remove('deveng-step-active');
          targetB?.classList.add('deveng-step-active');
        } else if (step === 0 || step === 'done') {
          targetA?.classList.remove('deveng-step-active');
          targetB?.classList.remove('deveng-step-active');
          contrastiveBtn.classList.remove('deveng-slow-playing');
        }
      });
      return;
    }

    // Check for Slow Playback Button: .speak-btn-slow or [data-word-slow]
    const slowBtn = target.closest('.speak-btn-slow, [data-word-slow]');
    if (slowBtn) {
      event.preventDefault();
      event.stopPropagation();

      const word = extractWordFromElement(slowBtn);
      if (!word) return;

      // Check optional custom rate on the element
      const customRateAttr = slowBtn.getAttribute('data-rate');
      const rate = customRateAttr ? parseFloat(customRateAttr) : 0.5;

      // Stop any audio playing immediately
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Visual pulse
      slowBtn.classList.add('deveng-slow-playing');
      const pulseCleanup = () => slowBtn.classList.remove('deveng-slow-playing');

      speakWordSlow(word, rate).then(pulseCleanup).catch(pulseCleanup);
    }
  });

  // =============================================================================
  // 5. NATIVE WEB COMPONENT: <deveng-speed-badge>
  // =============================================================================

  class DevEngSpeedBadge extends HTMLElement {
    constructor() {
      super();
      this._handleSpeedChange = this._handleSpeedChange.bind(this);
      this._handleBadgeClick = this._handleBadgeClick.bind(this);
    }

    connectedCallback() {
      this.render();
      window.addEventListener('deveng:speedchange', this._handleSpeedChange);
      this.addEventListener('click', this._handleBadgeClick);
    }

    disconnectedCallback() {
      window.removeEventListener('deveng:speedchange', this._handleSpeedChange);
      this.removeEventListener('click', this._handleBadgeClick);
    }

    _handleSpeedChange(event) {
      const speed = event.detail?.speed;
      if (typeof speed === 'number') {
        this.updateActiveChip(speed);
      } else {
        this.render();
      }
    }

    _handleBadgeClick(event) {
      const chip = event.target.closest('[data-speed-val]');
      if (chip) {
        event.stopPropagation();
        const speedVal = parseFloat(chip.getAttribute('data-speed-val'));
        if (!isNaN(speedVal)) {
          setPlaybackSpeed(speedVal);
          return;
        }
      }

      // Clicking anywhere else on the badge cycles to the next speed
      cyclePlaybackSpeed();
    }

    formatSpeedLabel(speed) {
      return speed === 1.0 ? '1x' : `${speed}x`;
    }

    updateActiveChip(speed) {
      const chips = this.querySelectorAll('[data-speed-val]');
      chips.forEach(chip => {
        const val = parseFloat(chip.getAttribute('data-speed-val'));
        const isActive = val === speed;
        chip.classList.toggle('active', isActive);
        chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    render() {
      const current = getPlaybackSpeed();

      // Render: 🐢 0.5x | 0.75x | 1x | 1.25x
      const chipsHtml = SUPPORTED_SPEEDS.map((spd, idx) => {
        const label = this.formatSpeedLabel(spd);
        const isActive = spd === current;
        const separator = idx < SUPPORTED_SPEEDS.length - 1
          ? '<span class="deveng-speed-sep text-slate-600 select-none">|</span>'
          : '';

        return `
          <button type="button"
                  data-speed-val="${spd}"
                  class="deveng-speed-chip ${isActive ? 'active' : ''}"
                  title="Đặt tốc độ ${label}"
                  aria-pressed="${isActive ? 'true' : 'false'}">
            ${label}
          </button>
          ${separator}
        `;
      }).join('');

      this.innerHTML = `
        <div class="deveng-speed-badge-wrap"
             role="group"
             aria-label="Tốc độ phát âm (Click để đổi)"
             title="Tốc độ phát âm: ${this.formatSpeedLabel(current)} (Click để chuyển tốc độ)">
          <span class="deveng-speed-icon select-none" aria-hidden="true">🐢</span>
          <div class="deveng-speed-options">
            ${chipsHtml}
          </div>
        </div>
      `;
    }
  }

  // Register Custom Element
  if (typeof customElements !== 'undefined' && !customElements.get('deveng-speed-badge')) {
    customElements.define('deveng-speed-badge', DevEngSpeedBadge);
  }

  // =============================================================================
  // 6. INJECT SELF-CONTAINED CSS STYLES
  // =============================================================================
  function injectComponentStyles() {
    if (typeof document === 'undefined' || !document.head) return;
    if (document.getElementById && document.getElementById('deveng-slow-audio-styles')) return;
    if (document.querySelector && document.querySelector('#deveng-slow-audio-styles')) return;

    const style = document.createElement('style');
    style.id = 'deveng-slow-audio-styles';
    style.textContent = `
      /* DevEng Speed Badge Component Styles */
      deveng-speed-badge {
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
      }

      .deveng-speed-badge-wrap {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.15rem 0.5rem;
        background-color: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(51, 65, 85, 0.8);
        border-radius: 9999px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.75rem;
        line-height: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(8px);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        user-select: none;
      }

      .deveng-speed-badge-wrap:hover {
        border-color: rgba(6, 182, 212, 0.6);
        box-shadow: 0 0 12px rgba(6, 182, 212, 0.25);
      }

      .deveng-speed-icon {
        font-size: 0.85rem;
        line-height: 1;
        transition: transform 0.2s ease;
      }

      .deveng-speed-badge-wrap:hover .deveng-speed-icon {
        transform: scale(1.15);
      }

      .deveng-speed-options {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      .deveng-speed-sep {
        color: #475569;
        font-size: 0.7rem;
        margin: 0 -0.05rem;
      }

      .deveng-speed-chip {
        background: transparent;
        border: none;
        padding: 0.1rem 0.3rem;
        border-radius: 0.25rem;
        font-size: 0.72rem;
        font-family: inherit;
        font-weight: 500;
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .deveng-speed-chip:hover {
        color: #f1f5f9;
        background-color: rgba(51, 65, 85, 0.5);
      }

      .deveng-speed-chip.active {
        color: #22d3ee;
        background-color: rgba(6, 182, 212, 0.2);
        border: 1px solid rgba(34, 211, 238, 0.4);
        font-weight: 700;
        box-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
      }

      /* Slow Button Visual Pulse on Active Click */
      .deveng-slow-playing {
        outline: 2px solid #22d3ee !important;
        outline-offset: 1px;
        animation: deveng-slow-pulse 0.8s infinite alternate ease-in-out;
      }

      @keyframes deveng-slow-pulse {
        from {
          box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.6);
        }
        to {
          box-shadow: 0 0 0 6px rgba(34, 211, 238, 0);
        }
      }

      /* Minimal Pair Highlight During Contrastive Sequential Playback */
      .deveng-step-active {
        outline: 2px solid #10b981 !important;
        background-color: rgba(16, 185, 129, 0.2) !important;
        transform: scale(1.02);
        transition: all 0.2s ease-in-out;
      }
    `;

    document.head.appendChild(style);
  }

  // =============================================================================
  // 7. AUTO-MOUNTING LOGIC FOR HEADER SPEED BADGE
  // =============================================================================

  /**
   * Mounts <deveng-speed-badge> into an optimal header position
   * @param {string|Element} [targetContainer] Optional explicit mount point
   */
  function autoMountSpeedBadge(targetContainer) {
    if (document.querySelector('deveng-speed-badge')) {
      return; // Already present in the document
    }

    const badge = document.createElement('deveng-speed-badge');
    badge.id = 'header-speed-badge';

    if (targetContainer) {
      const container = typeof targetContainer === 'string'
        ? document.querySelector(targetContainer)
        : targetContainer;
      if (container) {
        container.appendChild(badge);
        return;
      }
    }

    // Auto-detect best header placement:
    // Priority 1: Right next to #sticky-header-timer container
    const timer = typeof document.getElementById === 'function'
      ? document.getElementById('sticky-header-timer')
      : (typeof document.querySelector === 'function' ? document.querySelector('#sticky-header-timer') : null);
    if (timer && timer.parentElement) {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center ml-2';
      wrapper.appendChild(badge);
      timer.parentElement.appendChild(wrapper);
      return;
    }

    // Priority 2: Inside telemetry cluster
    const telemetryCluster = document.querySelector('.hidden.lg\\:flex.items-center.gap-2');
    if (telemetryCluster) {
      telemetryCluster.insertBefore(badge, telemetryCluster.firstChild);
      return;
    }

    // Priority 3: Inside primary header container
    const header = document.querySelector('header');
    if (header) {
      const headerFlex = header.querySelector('.flex.items-center.justify-between') || header;
      headerFlex.appendChild(badge);
      return;
    }

    // Fallback: Floating badge top right
    badge.style.position = 'fixed';
    badge.style.top = '12px';
    badge.style.right = '12px';
    badge.style.zIndex = '9999';
    document.body.appendChild(badge);
  }

  window.mountSpeedBadge = autoMountSpeedBadge;

  // Initialize once DOM is ready
  function initialize() {
    injectComponentStyles();
    autoMountSpeedBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
