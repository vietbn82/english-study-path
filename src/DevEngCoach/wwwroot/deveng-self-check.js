/**
 * DevEng Coach - Physical Self-Check Prompts Engine ("Cảm Nhận Cơ Thể")
 * Spec 013: Tactile & Kinesthetic Somatosensory Self-Checks
 *
 * Provides developers with real-time physical feedback prompts during English pronunciation practice:
 * 1. Somatosensory Catalog covering 6 major phonetic categories:
 *    - Stops (/t/, /d/, /p/, /b/, /k/, /g/)
 *    - Voiced (/d/, /z/, /ð/, /dʒ/, /v/, /b/, /g/)
 *    - Fricatives (/s/, /z/, /ʃ/, /ʒ/, /f/, /v/)
 *    - Interdentals (/θ/, /ð/)
 *    - Nasals (/m/, /n/, /ŋ/)
 *    - Vowels (tense vs lax vowels)
 * 2. Non-blocking slide-in bottom toast card with Vietnamese tactile guidance,
 *    '✅ Đã cảm nhận đúng' & '❌ Chưa đúng, thử lại' buttons, and '✕' dismiss button.
 * 3. Adaptive frequency in localStorage (`deveng_selfcheck_stats`):
 *    - After 5 consecutive correct answers: reduce frequency to every 3rd word.
 *    - After 10 consecutive correct answers: auto-hide with '✋ Kiểm tra' persistent link to re-enable.
 * 4. window.showTactileCheck(phoneme, word) + automatic hooks into speech drills,
 *    sound scoring API (/api/speech/score), and custom events.
 */

(function () {
  'use strict';

  // =============================================================================
  // CONSTANTS & CATALOG OF TACTILE CHECKS
  // =============================================================================
  const STORAGE_KEY = 'deveng_selfcheck_stats';

  const TACTILE_CATALOG = {
    stops: {
      id: 'stops',
      name: 'Âm nổ (Stops)',
      shortName: 'Âm nổ',
      icon: '💥',
      phonemes: ['/t/', '/d/', '/p/', '/b/', '/k/', '/g/'],
      symbols: ['t', 'd', 'p', 'b', 'k', 'g'],
      instruction: '✋ Đặt lòng bàn tay trước miệng cách 5cm — nhả hơi phải có luồng GIÓ MẠNH phả vào tay.',
      keyCue: 'luồng GIÓ MẠNH',
      highlightWord: 'GIÓ MẠNH',
      actionHint: 'Nén luồng khí sau răng/vòm miệng rồi bung ra dứt khoát'
    },
    voiced: {
      id: 'voiced',
      name: 'Âm hữu thanh (Voiced)',
      shortName: 'Hữu thanh',
      icon: '🔊',
      phonemes: ['/d/', '/z/', '/ð/', '/dʒ/', '/v/', '/b/', '/g/'],
      symbols: ['d', 'z', 'ð', 'dʒ', 'v', 'b', 'g'],
      instruction: '✋ Đặt 2 ngón tay lên hõm cổ họng — phải cảm nhận RUNG giật nhẹ.',
      keyCue: 'RUNG giật nhẹ',
      highlightWord: 'RUNG',
      actionHint: 'Dây thanh quản khép và rung động trước khi thoát khí'
    },
    fricatives: {
      id: 'fricatives',
      name: 'Âm xát (Fricatives)',
      shortName: 'Âm xát',
      icon: '💨',
      phonemes: ['/s/', '/z/', '/ʃ/', '/ʒ/', '/f/', '/v/'],
      symbols: ['s', 'z', 'ʃ', 'ʒ', 'f', 'v'],
      instruction: '✋ Đặt ngón tay trước miệng — luồng gió rít LIÊN TỤC không ngắt quãng.',
      keyCue: 'luồng gió rít LIÊN TỤC',
      highlightWord: 'LIÊN TỤC',
      actionHint: 'Duy trì khe hẹp cấu âm, khí xát đều và mịn không ngắt nhịp'
    },
    interdentals: {
      id: 'interdentals',
      name: 'Âm kẹp răng (Interdentals)',
      shortName: 'Kẹp răng',
      icon: '👅',
      phonemes: ['/θ/', '/ð/'],
      symbols: ['θ', 'ð', 'th'],
      instruction: '✋ Nhìn gương — đầu lưỡi THÈ RA giữa 2 hàm răng 2-3mm, kẹp nhẹ.',
      keyCue: 'đầu lưỡi THÈ RA',
      highlightWord: 'THÈ RA',
      actionHint: 'Không thụt lưỡi vào trong; răng kẹp nhẹ cho khí lách qua hai mép'
    },
    nasals: {
      id: 'nasals',
      name: 'Âm mũi (Nasals)',
      shortName: 'Âm mũi',
      icon: '👃',
      phonemes: ['/m/', '/n/', '/ŋ/'],
      symbols: ['m', 'n', 'ŋ', 'ng'],
      instruction: '✋ Bịt mũi nói thử — nếu âm bị chặn nghẹt hoàn toàn = bạn làm đúng.',
      keyCue: 'chặn nghẹt hoàn toàn',
      highlightWord: 'CHẶN NGHẸT',
      actionHint: 'Ngạc mềm hạ xuống cho toàn bộ âm thanh thoát qua khoang mũi'
    },
    vowels: {
      id: 'vowels',
      name: 'Nguyên âm (Vowels)',
      shortName: 'Nguyên âm',
      icon: '👄',
      phonemes: ['/iː/', '/ɪ/', '/e/', '/æ/', '/ɑː/', '/ʌ/', '/ɔː/', '/ʊ/', '/uː/', '/ɜː/', '/ə/', '/aɪ/', '/eɪ/', '/ɔɪ/', '/aʊ/', '/oʊ/', '/əʊ/', '/ɪə/', '/eə/', '/ʊə/'],
      symbols: ['iː', 'ɪ', 'e', 'æ', 'ɑː', 'ʌ', 'ɔː', 'ʊ', 'uː', 'ɜː', 'ə', 'aɪ', 'eɪ', 'ɔɪ', 'aʊ', 'oʊ', 'əʊ', 'i', 'u', 'a', 'o'],
      instruction: '✋ Đặt 2 ngón tay dưới cằm — kiểm tra cơ hàm căng (/iː/) hay chùng (/ɪ/).',
      keyCue: 'cơ hàm căng (/iː/) hay chùng (/ɪ/)',
      highlightWord: 'CƠ HÀM CĂNG / CHÙNG',
      actionHint: 'Cảm nhận độ giãn cơ dưới cằm: cơ căng cứng hay thả lỏng'
    }
  };

  // Known tech word heuristics for automatic phonetic categorization
  const WORD_CATEGORY_HEURISTICS = {
    interdentals: ['auth', 'method', 'thread', 'path', 'throughput', 'algorithm', 'with', 'this', 'that', 'other', 'another', 'theme'],
    nasals: ['admin', 'domain', 'login', 'name', 'span', 'ping', 'routing', 'spring', 'runtime', 'token', 'npm', 'json', 'clean'],
    stops: ['commit', 'test', 'git', 'endpoint', 'packet', 'post', 'put', 'get', 'input', 'output', 'byte', 'script', 'docker', 'react'],
    fricatives: ['status', 'server', 'service', 'session', 'cache', 'push', 'shell', 'hash', 'flush', 'fetch', 'schema', 'slash'],
    voiced: ['build', 'node', 'prod', 'payload', 'shard', 'load', 'merge', 'bridge', 'edge', 'version', 'drive', 'variable', 'env']
  };

  // =============================================================================
  // ADAPTIVE FREQUENCY & PERSISTENCE ENGINE (localStorage)
  // =============================================================================
  function getStoredStats() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return {};
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('DevEngSelfCheck: Could not read localStorage', e);
      return {};
    }
  }

  function saveStoredStats(stats) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('DevEngSelfCheck: Could not write localStorage', e);
    }
  }

  function getCategoryStats(catId) {
    const stats = getStoredStats();
    if (!stats[catId]) {
      stats[catId] = {
        consecutiveCorrect: 0,
        totalChecks: 0,
        correctCount: 0,
        incorrectCount: 0,
        wordEncounterCount: 0,
        autoHidden: false,
        lastUpdated: Date.now()
      };
    }
    return { all: stats, current: stats[catId] };
  }

  function updateCategoryFeedback(catId, isCorrect) {
    const { all, current } = getCategoryStats(catId);
    current.totalChecks = (current.totalChecks || 0) + 1;
    current.lastUpdated = Date.now();

    if (isCorrect) {
      current.consecutiveCorrect = (current.consecutiveCorrect || 0) + 1;
      current.correctCount = (current.correctCount || 0) + 1;
      // Requirement 3: After 10 consecutive correct answers, auto-hide for that category
      if (current.consecutiveCorrect >= 10) {
        current.autoHidden = true;
      }
    } else {
      // Requirement: Reset consecutive streak on incorrect answer
      current.consecutiveCorrect = 0;
      current.incorrectCount = (current.incorrectCount || 0) + 1;
      current.autoHidden = false; // Immediately re-enable regular frequency
    }

    all[catId] = current;
    saveStoredStats(all);
    return current;
  }

  function reEnableCategory(catId) {
    const { all, current } = getCategoryStats(catId);
    current.autoHidden = false;
    // Set streak to 4 so it's fully active (100% frequency) or reset streak
    current.consecutiveCorrect = Math.min(current.consecutiveCorrect || 0, 4);
    current.wordEncounterCount = 0;
    current.lastUpdated = Date.now();
    all[catId] = current;
    saveStoredStats(all);
    return current;
  }

  function resetCategoryStats(catId) {
    const all = getStoredStats();
    if (catId) {
      all[catId] = {
        consecutiveCorrect: 0,
        totalChecks: 0,
        correctCount: 0,
        incorrectCount: 0,
        wordEncounterCount: 0,
        autoHidden: false,
        lastUpdated: Date.now()
      };
    } else {
      Object.keys(TACTILE_CATALOG).forEach(k => {
        all[k] = {
          consecutiveCorrect: 0,
          totalChecks: 0,
          correctCount: 0,
          incorrectCount: 0,
          wordEncounterCount: 0,
          autoHidden: false,
          lastUpdated: Date.now()
        };
      });
    }
    saveStoredStats(all);
    return all;
  }

  // =============================================================================
  // PHONETIC RESOLVER & CATEGORY MATCHER
  // =============================================================================
  function resolveCategory(phonemeOrInput, word) {
    if (!phonemeOrInput && !word) return TACTILE_CATALOG.stops;

    const rawInput = (phonemeOrInput || '').toString().trim().toLowerCase();
    const cleanPhoneme = rawInput.replace(/[\/\[\]\\]/g, '').trim();

    // 1. Direct Category ID match
    if (TACTILE_CATALOG[cleanPhoneme]) {
      return TACTILE_CATALOG[cleanPhoneme];
    }
    if (cleanPhoneme === 'stop' || cleanPhoneme === 'plosive' || cleanPhoneme === 'plosives') return TACTILE_CATALOG.stops;
    if (cleanPhoneme === 'fricative') return TACTILE_CATALOG.fricatives;
    if (cleanPhoneme === 'interdental' || cleanPhoneme === 'dental') return TACTILE_CATALOG.interdentals;
    if (cleanPhoneme === 'nasal') return TACTILE_CATALOG.nasals;
    if (cleanPhoneme === 'vowel') return TACTILE_CATALOG.vowels;

    // 2. Exact IPA symbol matching with priority resolution
    // Priority: Interdentals (/θ/, /ð/) > Nasals (/m/, /n/, /ŋ/) > Stops (/t/, /p/, /k/, /b/, /d/, /g/) > Fricatives > Voiced > Vowels
    if (cleanPhoneme.includes('θ') || cleanPhoneme.includes('ð') || cleanPhoneme === 'th') {
      return TACTILE_CATALOG.interdentals;
    }
    if (cleanPhoneme.includes('ŋ') || cleanPhoneme === 'm' || cleanPhoneme === 'n' || cleanPhoneme === 'ng') {
      return TACTILE_CATALOG.nasals;
    }
    if (['t', 'p', 'k'].includes(cleanPhoneme) || cleanPhoneme === 'tʃ') {
      return TACTILE_CATALOG.stops;
    }
    if (['s', 'ʃ', 'f', 'ʒ'].includes(cleanPhoneme)) {
      return TACTILE_CATALOG.fricatives;
    }
    if (cleanPhoneme === 'dʒ') {
      return TACTILE_CATALOG.voiced;
    }
    // Ambivalent sounds (/d/, /b/, /g/ are both stops and voiced; /z/, /v/ are fricatives and voiced)
    if (['b', 'd', 'g'].includes(cleanPhoneme)) {
      return TACTILE_CATALOG.stops;
    }
    if (['z', 'v'].includes(cleanPhoneme)) {
      return TACTILE_CATALOG.fricatives;
    }

    // Vowels check
    const vowelSymbols = ['iː', 'ɪ', 'e', 'æ', 'ɑː', 'ʌ', 'ɔː', 'ʊ', 'uː', 'ɜː', 'ə', 'aɪ', 'eɪ', 'ɔɪ', 'aʊ', 'oʊ', 'əʊ', 'ɪə', 'eə', 'ʊə'];
    if (vowelSymbols.some(v => cleanPhoneme.includes(v)) || ['i', 'u', 'a', 'o'].includes(cleanPhoneme)) {
      return TACTILE_CATALOG.vowels;
    }

    // 3. Word Heuristics Fallback
    if (word) {
      const lowerWord = word.toLowerCase().trim();
      for (const [catId, words] of Object.entries(WORD_CATEGORY_HEURISTICS)) {
        if (words.some(w => lowerWord === w || lowerWord.includes(w))) {
          return TACTILE_CATALOG[catId];
        }
      }
      if (lowerWord.includes('th')) return TACTILE_CATALOG.interdentals;
      if (lowerWord.endsWith('t') || lowerWord.endsWith('d') || lowerWord.endsWith('k') || lowerWord.endsWith('p')) return TACTILE_CATALOG.stops;
      if (lowerWord.endsWith('s') || lowerWord.endsWith('sh') || lowerWord.endsWith('z')) return TACTILE_CATALOG.fricatives;
      if (lowerWord.endsWith('ing') || lowerWord.endsWith('m') || lowerWord.endsWith('n')) return TACTILE_CATALOG.nasals;
    }

    // Default fallback
    return TACTILE_CATALOG.stops;
  }

  // =============================================================================
  // UI TOAST CARD & RE-ENABLE CHIP INJECTION
  // =============================================================================
  const STYLES_ID = 'deveng-tactile-selfcheck-styles';
  const TOAST_ID = 'deveng-tactile-toast';
  const REOPEN_CHIP_ID = 'deveng-tactile-reopen-chip';

  function injectStyles() {
    if (typeof document === 'undefined' || document.getElementById(STYLES_ID)) return;
    const style = document.createElement('style');
    style.id = STYLES_ID;
    style.textContent = `
      #${TOAST_ID} {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translate(-50%, 120%);
        width: calc(100% - 32px);
        max-width: 580px;
        background: rgba(15, 23, 42, 0.96);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(6, 182, 212, 0.35);
        border-radius: 16px;
        padding: 16px 20px;
        color: #f1f5f9;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        z-index: 99999;
        box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(6, 182, 212, 0.18);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        opacity: 0;
        pointer-events: none;
      }
      #${TOAST_ID}.deveng-visible {
        transform: translate(-50%, 0);
        opacity: 1;
        pointer-events: auto;
      }
      #${TOAST_ID} .deveng-toast-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid rgba(51, 65, 85, 0.6);
        padding-bottom: 8px;
      }
      #${TOAST_ID} .deveng-badge-cat {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #22d3ee;
        background: rgba(8, 51, 68, 0.7);
        border: 1px solid rgba(6, 182, 212, 0.4);
        padding: 3px 8px;
        border-radius: 6px;
      }
      #${TOAST_ID} .deveng-badge-word {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
        font-weight: 600;
        color: #a5f3fc;
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.2);
        padding: 2px 7px;
        border-radius: 6px;
      }
      #${TOAST_ID} .deveng-badge-streak {
        font-size: 11px;
        font-weight: 600;
        color: #fbbf24;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }
      #${TOAST_ID} .deveng-btn-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 6px;
        line-height: 1;
        border-radius: 6px;
        transition: color 0.15s, background 0.15s;
      }
      #${TOAST_ID} .deveng-btn-close:hover {
        color: #f1f5f9;
        background: rgba(51, 65, 85, 0.6);
      }
      #${TOAST_ID} .deveng-toast-body {
        font-size: 14.5px;
        line-height: 1.5;
        color: #e2e8f0;
        margin-bottom: 14px;
      }
      #${TOAST_ID} .deveng-highlight-word {
        color: #38bdf8;
        font-weight: 800;
        text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        border-bottom: 1.5px dashed rgba(56, 189, 248, 0.6);
        padding-bottom: 1px;
      }
      #${TOAST_ID} .deveng-toast-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      #${TOAST_ID} .deveng-btn-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        padding: 9px 16px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        border: none;
        outline: none;
      }
      #${TOAST_ID} .deveng-btn-correct {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
      }
      #${TOAST_ID} .deveng-btn-correct:hover {
        background: linear-gradient(135deg, #047857 0%, #059669 100%);
        box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35);
        transform: translateY(-1px);
      }
      #${TOAST_ID} .deveng-btn-retry {
        background: rgba(30, 41, 59, 0.9);
        border: 1px solid rgba(244, 63, 94, 0.4);
        color: #fca5a5;
      }
      #${TOAST_ID} .deveng-btn-retry:hover {
        background: rgba(51, 65, 85, 0.9);
        border-color: rgba(244, 63, 94, 0.7);
        color: #ffe4e6;
        transform: translateY(-1px);
      }
      #${TOAST_ID} .deveng-toast-feedback {
        margin-top: 10px;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12.5px;
        display: none;
        animation: devengFadeIn 0.2s ease;
      }
      #${TOAST_ID} .deveng-toast-feedback.deveng-fb-success {
        display: block;
        background: rgba(6, 78, 59, 0.6);
        border: 1px solid rgba(16, 185, 129, 0.4);
        color: #a7f3d0;
      }
      #${TOAST_ID} .deveng-toast-feedback.deveng-fb-retry {
        display: block;
        background: rgba(69, 10, 10, 0.6);
        border: 1px solid rgba(244, 63, 94, 0.4);
        color: #fecdd3;
      }
      #${TOAST_ID} .deveng-reenable-banner {
        margin-top: 8px;
        font-size: 11.5px;
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      #${TOAST_ID} .deveng-reenable-btn {
        background: transparent;
        border: none;
        color: #38bdf8;
        text-decoration: underline;
        cursor: pointer;
        font-size: 11.5px;
        padding: 0;
      }
      #${REOPEN_CHIP_ID} {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: auto;
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(6, 182, 212, 0.45);
        color: #38bdf8;
        padding: 7px 14px;
        border-radius: 9999px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        z-index: 48;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.25);
        display: none;
        align-items: center;
        gap: 6px;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #${REOPEN_CHIP_ID}:hover {
        background: rgba(8, 47, 73, 0.95);
        border-color: #38bdf8;
        color: #ffffff;
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.4);
      }
      #${REOPEN_CHIP_ID}.deveng-chip-visible {
        display: flex;
      }
      @keyframes devengFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (max-width: 640px) {
        #${TOAST_ID} {
          bottom: 12px;
          padding: 14px 16px;
        }
        #${TOAST_ID} .deveng-btn-action {
          width: 100%;
        }
        #${REOPEN_CHIP_ID} {
          bottom: 16px;
          left: 16px;
          right: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  let toastElement = null;
  let reopenChipElement = null;
  let activeCategory = null;
  let activeWord = '';
  let activePhoneme = '';
  let hideTimeoutId = null;

  function ensureElements() {
    if (typeof document === 'undefined') return;
    injectStyles();

    // Reopen chip
    if (!document.getElementById(REOPEN_CHIP_ID)) {
      reopenChipElement = document.createElement('button');
      reopenChipElement.id = REOPEN_CHIP_ID;
      reopenChipElement.setAttribute('type', 'button');
      reopenChipElement.setAttribute('title', 'Bấm để mở tự kiểm tra cảm nhận cơ thể');
      reopenChipElement.innerHTML = `✋ <span id="${REOPEN_CHIP_ID}-text">Kiểm tra</span>`;
      document.body.appendChild(reopenChipElement);

      reopenChipElement.addEventListener('click', () => {
        if (activeCategory) {
          showTactileCheck(activeCategory.id, activeWord || null, { force: true });
        } else {
          // Open last tested category or default stops
          const stats = getStoredStats();
          const firstHidden = Object.keys(stats).find(k => stats[k].autoHidden) || 'stops';
          showTactileCheck(firstHidden, null, { force: true });
        }
      });
    } else {
      reopenChipElement = document.getElementById(REOPEN_CHIP_ID);
    }

    // Main Toast Card
    if (!document.getElementById(TOAST_ID)) {
      toastElement = document.createElement('div');
      toastElement.id = TOAST_ID;
      toastElement.setAttribute('role', 'region');
      toastElement.setAttribute('aria-label', 'Cảm nhận cơ thể - Physical Self-Check');
      toastElement.innerHTML = `
        <div class="deveng-toast-header">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="deveng-badge-cat" id="deveng-toast-cat-badge">✋ CẢM NHẬN CƠ THỂ</span>
            <span class="deveng-badge-word" id="deveng-toast-word-badge" style="display: none;"></span>
          </div>
          <span class="deveng-badge-streak" id="deveng-toast-streak">🔥 0/5</span>
          <button class="deveng-btn-close" id="deveng-toast-btn-close" title="Đóng (Escape)">✕</button>
        </div>
        <div class="deveng-toast-body" id="deveng-toast-instruction">
          ✋ Đặt lòng bàn tay trước miệng cách 5cm — nhả hơi phải có luồng GIÓ MẠNH phả vào tay.
        </div>
        <div class="deveng-toast-actions">
          <button class="deveng-btn-action deveng-btn-correct" id="deveng-toast-btn-correct">
            ✅ Đã cảm nhận đúng
          </button>
          <button class="deveng-btn-action deveng-btn-retry" id="deveng-toast-btn-retry">
            ❌ Chưa đúng, thử lại
          </button>
        </div>
        <div class="deveng-toast-feedback" id="deveng-toast-feedback"></div>
        <div class="deveng-reenable-banner" id="deveng-toast-reenable-row" style="display: none;">
          <span>Nhóm này đã thành thục (≥10).</span>
          <button class="deveng-reenable-btn" id="deveng-toast-btn-reenable">✋ Bật lại nhắc nhở thường xuyên</button>
        </div>
      `;
      document.body.appendChild(toastElement);

      // Event handlers with safe querySelector
      const btnClose = toastElement.querySelector('#deveng-toast-btn-close');
      if (btnClose) btnClose.addEventListener('click', hideTactileToast);
      
      const btnCorrect = toastElement.querySelector('#deveng-toast-btn-correct');
      if (btnCorrect) {
        btnCorrect.addEventListener('click', () => {
          handleUserFeedback(true);
        });
      }

      const btnRetry = toastElement.querySelector('#deveng-toast-btn-retry');
      if (btnRetry) {
        btnRetry.addEventListener('click', () => {
          handleUserFeedback(false);
        });
      }

      const btnReenable = toastElement.querySelector('#deveng-toast-btn-reenable');
      if (btnReenable) {
        btnReenable.addEventListener('click', () => {
          if (activeCategory) {
            reEnableCategory(activeCategory.id);
            const feedbackEl = toastElement.querySelector('#deveng-toast-feedback');
            if (feedbackEl) {
              feedbackEl.className = 'deveng-toast-feedback deveng-fb-success';
              feedbackEl.textContent = `🔄 Đã bật lại nhắc nhở thường xuyên cho nhóm ${activeCategory.name}.`;
              feedbackEl.style.display = 'block';
            }
            const reenableRow = toastElement.querySelector('#deveng-toast-reenable-row');
            if (reenableRow) reenableRow.style.display = 'none';
            updateStreakUI(activeCategory.id);
          }
        });
      }

      // Escape key to dismiss
      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && toastElement && toastElement.classList && toastElement.classList.contains('deveng-visible')) {
            hideTactileToast();
          }
        });
      }
    } else {
      toastElement = document.getElementById(TOAST_ID);
    }
  }

  function formatInstructionHtml(category) {
    const raw = category.instruction;
    if (!category.highlightWord) return raw;
    const regex = new RegExp(`(${category.highlightWord})`, 'g');
    return raw.replace(regex, `<span class="deveng-highlight-word">$1</span>`);
  }

  function updateStreakUI(catId) {
    const { current } = getCategoryStats(catId);
    const streakEl = document.getElementById('deveng-toast-streak');
    if (!streakEl) return;

    const streak = current.consecutiveCorrect || 0;
    if (streak >= 10) {
      streakEl.innerHTML = `🏆 Chuỗi: ${streak} (Đã ẩn)`;
      streakEl.style.color = '#34d399';
    } else if (streak >= 5) {
      streakEl.innerHTML = `🔥 Chuỗi: ${streak}/10 (Mỗi 3 từ)`;
      streakEl.style.color = '#38bdf8';
    } else {
      streakEl.innerHTML = `🔥 Chuỗi: ${streak}/5`;
      streakEl.style.color = '#fbbf24';
    }

    const reenableRow = document.getElementById('deveng-toast-reenable-row');
    if (reenableRow) {
      reenableRow.style.display = current.autoHidden ? 'flex' : 'none';
    }
  }

  function handleUserFeedback(isCorrect) {
    if (!activeCategory) return;
    const catId = activeCategory.id;
    const updated = updateCategoryFeedback(catId, isCorrect);
    updateStreakUI(catId);

    const feedbackEl = document.getElementById('deveng-toast-feedback');
    if (!feedbackEl) return;

    if (isCorrect) {
      feedbackEl.className = 'deveng-toast-feedback deveng-fb-success';
      const streak = updated.consecutiveCorrect;
      if (streak >= 10) {
        feedbackEl.innerHTML = `🎉 <b>Hoàn hảo!</b> Bạn đã cảm nhận đúng ${streak} lần liên tiếp. Nhóm này sẽ tự động ẩn để tránh làm phiền!`;
      } else if (streak >= 5) {
        feedbackEl.innerHTML = `✅ <b>Tuyệt vời!</b> Chuỗi cảm nhận đúng: ${streak}. Tần suất hiển thị giảm xuống mỗi 3 từ.`;
      } else {
        feedbackEl.innerHTML = `✅ <b>Chính xác!</b> Cảm giác cơ học đã được nơ-ron vận động ghi nhớ. Chuỗi: ${streak}/5.`;
      }
      feedbackEl.style.display = 'block';

      // Auto-slide out after brief celebratory delay
      clearTimeout(hideTimeoutId);
      hideTimeoutId = setTimeout(() => {
        hideTactileToast();
      }, 1600);
    } else {
      feedbackEl.className = 'deveng-toast-feedback deveng-fb-retry';
      feedbackEl.innerHTML = `💡 <b>Gợi ý cơ học:</b> ${activeCategory.actionHint}. Hãy thở sâu, phát âm chậm 0.5x và thử lại.`;
      feedbackEl.style.display = 'block';

      // Reset auto-hidden status in UI if needed
      const reenableRow = document.getElementById('deveng-toast-reenable-row');
      if (reenableRow) reenableRow.style.display = 'none';

      // Keep toast open so user can retry
      clearTimeout(hideTimeoutId);
    }

    // Refresh reopen chip status
    updateReopenChipVisibility();
  }

  function hideTactileToast() {
    clearTimeout(hideTimeoutId);
    if (toastElement) {
      toastElement.classList.remove('deveng-visible');
    }
  }

  function updateReopenChipVisibility() {
    if (!reopenChipElement) return;
    const stats = getStoredStats();
    const hasAnyAutoHidden = Object.keys(stats).some(k => stats[k].autoHidden);

    if (hasAnyAutoHidden) {
      reopenChipElement.classList.add('deveng-chip-visible');
      const textSpan = document.getElementById(`${REOPEN_CHIP_ID}-text`);
      if (textSpan) {
        if (activeCategory && stats[activeCategory.id]?.autoHidden) {
          textSpan.textContent = `Kiểm tra ${activeCategory.shortName}`;
        } else {
          textSpan.textContent = 'Kiểm tra';
        }
      }
    } else {
      reopenChipElement.classList.remove('deveng-chip-visible');
    }
  }

  // =============================================================================
  // MAIN API: window.showTactileCheck(phoneme, word, options)
  // =============================================================================
  /**
   * Displays the non-blocking tactile prompt for a given phoneme or word.
   * Respects adaptive frequency in localStorage unless options.force is true.
   *
   * @param {string} phoneme - IPA string, category name, or symbol (e.g. '/t/', 'stops', 'interdentals')
   * @param {string} [word] - Optional target practice word (e.g. 'commit', 'auth')
   * @param {object} [options] - Optional settings: { force: boolean, category: string }
   * @returns {object} Status object { shown: boolean, category: string, reason: string }
   */
  function showTactileCheck(phoneme, word, options = {}) {
    ensureElements();
    if (typeof document === 'undefined') return { shown: false, reason: 'no-dom' };

    const category = resolveCategory(options.category || phoneme, word);
    activeCategory = category;
    activeWord = word || '';
    activePhoneme = phoneme || category.phonemes[0];

    const { all, current } = getCategoryStats(category.id);

    // Increment word encounter count
    current.wordEncounterCount = (current.wordEncounterCount || 0) + 1;
    all[category.id] = current;
    saveStoredStats(all);

    // Adaptive frequency checks (Requirement 3)
    // 1. If 10 consecutive correct: auto-hide with small link '✋ Kiểm tra'
    if (current.consecutiveCorrect >= 10 && current.autoHidden && !options.force) {
      updateReopenChipVisibility();
      return { shown: false, category: category.id, reason: 'auto_hidden', streak: current.consecutiveCorrect };
    }

    // 2. If 5 consecutive correct: reduce frequency to every 3rd word
    if (current.consecutiveCorrect >= 5 && !options.force) {
      const isThird = (current.wordEncounterCount % 3 === 0);
      if (!isThird) {
        return {
          shown: false,
          category: category.id,
          reason: 'frequency_reduced_every_3rd_word',
          encounter: current.wordEncounterCount,
          streak: current.consecutiveCorrect
        };
      }
    }

    // Prepare toast content
    const catBadge = document.getElementById('deveng-toast-cat-badge');
    if (catBadge) {
      catBadge.innerHTML = `✋ ${category.name.toUpperCase()}`;
    }

    const wordBadge = document.getElementById('deveng-toast-word-badge');
    if (wordBadge) {
      if (word || (phoneme && phoneme !== category.id)) {
        const wordText = word ? `${word}` : '';
        const phoneText = phoneme && phoneme !== category.id ? (phoneme.startsWith('/') ? phoneme : `/${phoneme}/`) : '';
        const combo = [phoneText, wordText].filter(Boolean).join(' • ');
        wordBadge.textContent = combo;
        wordBadge.style.display = combo ? 'inline-block' : 'none';
      } else {
        wordBadge.style.display = 'none';
      }
    }

    const instructionEl = document.getElementById('deveng-toast-instruction');
    if (instructionEl) {
      instructionEl.innerHTML = formatInstructionHtml(category);
    }

    const feedbackEl = document.getElementById('deveng-toast-feedback');
    if (feedbackEl) {
      feedbackEl.style.display = 'none';
      feedbackEl.innerHTML = '';
    }

    updateStreakUI(category.id);

    // Slide in
    clearTimeout(hideTimeoutId);
    toastElement.classList.add('deveng-visible');

    return { shown: true, category: category.id, reason: options.force ? 'forced' : 'regular' };
  }

  // =============================================================================
  // AUTOMATIC HOOKS INTO SPEECH DRILLS & SPEECH SCORING RESULTS
  // =============================================================================
  function setupSpeechHooks() {
    if (typeof window === 'undefined') return;

    // 1. Hook into window.fetch for /api/speech/score and /api/ai/evaluate
    const originalFetch = window.fetch;
    if (originalFetch && !window._devengSelfCheckFetchHooked) {
      window._devengSelfCheckFetchHooked = true;
      window.fetch = async function (...args) {
        const res = await originalFetch.apply(this, args);
        try {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
          if (url && (url.includes('/api/speech/score') || url.includes('/api/ai/evaluate'))) {
            const reqOptions = args[1];
            if (reqOptions && reqOptions.body && typeof reqOptions.body === 'string') {
              const payload = JSON.parse(reqOptions.body);
              const expectedPhoneme = payload.expectedPhonemes || '';
              const targetWord = payload.targetWordOrSentence || '';
              
              if (expectedPhoneme || targetWord) {
                // Delay slightly so score breakdown renders first
                setTimeout(() => {
                  showTactileCheck(expectedPhoneme, targetWord);
                }, 650);
              } else if (payload.inputText && payload.inputText.includes('Pronunciation evaluation for sound')) {
                const match = payload.inputText.match(/sound\s+([^.]+)\.\s+Target:\s+([^.]+)/i);
                if (match) {
                  const p = match[1].trim();
                  const w = match[2].trim();
                  setTimeout(() => {
                    showTactileCheck(p, w);
                  }, 650);
                }
              }
            }
          }
        } catch (_) {
          // Silent catch to guarantee 0 side effects on user network calls
        }
        return res;
      };
    }

    // 2. DOM Event Delegation for speech drill context tracking (without blocking modal on open)
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const practiceBtn = e.target.closest('.drill-practice-btn');
        if (practiceBtn) {
          activeWord = practiceBtn.dataset.word || '';
          activePhoneme = practiceBtn.dataset.ipa || '';
          return;
        }
      });

      // 3. Custom Event Listeners
      window.addEventListener('deveng:speech-scored', (e) => {
        if (e && e.detail) {
          showTactileCheck(e.detail.phoneme || e.detail.expectedPhonemes, e.detail.word || e.detail.targetWord);
        }
      });

      window.addEventListener('deveng:tactile-check', (e) => {
        if (e && e.detail) {
          showTactileCheck(e.detail.phoneme, e.detail.word, e.detail.options);
        }
      });
    }
  }

  // =============================================================================
  // GLOBAL EXPORTS & INITIALIZATION
  // =============================================================================
  const DevEngSelfCheck = {
    catalog: TACTILE_CATALOG,
    show: showTactileCheck,
    hide: hideTactileToast,
    getStats: (catId) => (catId ? getCategoryStats(catId).current : getStoredStats()),
    updateFeedback: updateCategoryFeedback,
    reEnable: reEnableCategory,
    resetStats: resetCategoryStats,
    resolveCategory: resolveCategory
  };

  if (typeof window !== 'undefined') {
    window.showTactileCheck = showTactileCheck;
    window.DevEngSelfCheck = DevEngSelfCheck;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        ensureElements();
        setupSpeechHooks();
        updateReopenChipVisibility();
      });
    } else {
      ensureElements();
      setupSpeechHooks();
      updateReopenChipVisibility();
    }
  }

  // Export for testing environments (Node.js/Jest/Vitest)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      TACTILE_CATALOG,
      STORAGE_KEY,
      resolveCategory,
      getCategoryStats,
      updateCategoryFeedback,
      reEnableCategory,
      resetCategoryStats,
      showTactileCheck,
      DevEngSelfCheck
    };
  }
})();
