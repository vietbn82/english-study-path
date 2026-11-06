/**
 * DevEng Coach - Developer-First Spotlight Command Palette & Hotkey Navigation
 * Native Web Component: <deveng-command-palette>
 *
 * Key Capabilities:
 *  - Hotkeys:
 *      * Ctrl+K / Cmd+K: Toggle Command Palette overlay
 *      * Escape: Close Palette
 *      * Space: (when not focused on input/editable) Toggle speech recording (dock, sparring, or Stage 3 mic)
 *      * 1, 2, 3: (when not focused on input) Quick jump/scroll to Stage 1 (Phonetics), Stage 2 (Sentence Frames), or Stage 3 (AI Output)
 *      * Ctrl+Enter: Submit active simulation/practice form
 *  - Instant Fuzzy Search:
 *      * 90 Days Curriculum (Titles, Focus Sounds, Objectives, Sprints)
 *      * IPA Glossary Symbols (/t/, /d/, /θ/, /s/, /z/, /ʃ/, etc., acoustic mechanics, example words)
 *      * Quick Actions ('Go to Simulators', 'Go to Standup Simulator', 'Go to 1-on-1 Simulator', 'Go to Sparring', 'Go to SRS Flashcards', 'Open Handbook', 'Toggle AI Coach', etc.)
 *  - Modern Dark Developer Theme: Slate-900 surface, cyan/emerald accents, glowing focus rings, `<kbd>` badges.
 */

(function () {
  'use strict';

  // =============================================================================
  // SEED / FALLBACK DATA (Guarantees 0ms Instant Search before API completes)
  // =============================================================================
  const DEFAULT_IPA_GLOSSARY = [
    {
      symbol: "/t/",
      soundCategory: "Voiceless Alveolar Plosive",
      vietnameseEquivalent: "Bật nén hơi nổ (release) dứt khoát, không nuốt âm",
      physicalCueVi: "Đầu lưỡi ép chặt gờ lợi sau răng trên, nén khí rồi giật lưỡi xả hơi.",
      devExampleWords: ["commit", "test", "request", "format", "git"],
      commonMistake: "Ngậm miệng lại (unreleased) nuốt mất âm cuối."
    },
    {
      symbol: "/d/",
      soundCategory: "Voiced Alveolar Plosive",
      vietnameseEquivalent: "Rung cổ họng mạnh, nhả nhẹ nhàng",
      physicalCueVi: "Chặn gờ lợi như /t/, rung dây thanh quản trước khi nhả hơi nhẹ.",
      devExampleWords: ["build", "thread", "payload", "node", "prod"],
      commonMistake: "Đọc thành /t/ hoặc chèn thêm âm 'đờ'."
    },
    {
      symbol: "/θ/",
      soundCategory: "Voiceless Dental Fricative",
      vietnameseEquivalent: "Khác hoàn toàn âm 'th' tiếng Việt - kẹp lưỡi rít gió",
      physicalCueVi: "Đầu lưỡi thè ra giữa 2 hàm răng 2mm, kẹp nhẹ, đẩy hơi xát rít qua khe răng.",
      devExampleWords: ["auth", "method", "thread", "throughput", "path"],
      commonMistake: "Đọc thành 'th' thụt lưỡi tiếng Việt hoặc đọc thành 't'."
    },
    {
      symbol: "/ð/",
      soundCategory: "Voiced Dental Fricative",
      vietnameseEquivalent: "Kẹp lưỡi rung cổ họng như còi ong",
      physicalCueVi: "Đầu lưỡi kẹp giữa 2 hàm răng, rung mạnh dây thanh âm trong khi xát gió.",
      devExampleWords: ["this", "that", "with", "other", "another"],
      commonMistake: "Đọc thành 'd' hoặc 'z' bẹt lưỡi."
    },
    {
      symbol: "/s/",
      soundCategory: "Voiceless Alveolar Fricative",
      vietnameseEquivalent: "Xát gió gờ lợi sắc nét - âm sống còn của số nhiều & ngôi thứ 3",
      physicalCueVi: "Đầu lưỡi nâng sát gờ lợi trên, đẩy luồng khí sắc nhọn qua rãnh giữa lưỡi.",
      devExampleWords: ["status", "server", "script", "stack", "response"],
      commonMistake: "Nuốt âm s cuối câu hoặc phát âm yếu ớt."
    },
    {
      symbol: "/z/",
      soundCategory: "Voiced Alveolar Fricative",
      vietnameseEquivalent: "Xát rung cổ họng mạnh",
      physicalCueVi: "Khẩu hình giống /s/ nhưng rung dây thanh quản liên tục.",
      devExampleWords: ["users", "keys", "apis", "nodes", "services"],
      commonMistake: "Đọc thành /s/ câm hoặc bỏ hẳn âm đuôi."
    },
    {
      symbol: "/ʃ/",
      soundCategory: "Voiceless Postalveolar Fricative",
      vietnameseEquivalent: "Chu môi tròn dài xát gió (như 'S' nặng miền Nam)",
      physicalCueVi: "Chu môi tròn về phía trước, hai mép thân lưỡi ép răng hàm trên, xát gió mạnh.",
      devExampleWords: ["push", "crash", "publish", "cache", "shell"],
      commonMistake: "Bẹt mép đọc như âm 's' thông thường."
    },
    {
      symbol: "/tʃ/",
      soundCategory: "Voiceless Postalveolar Affricate",
      vietnameseEquivalent: "Chặn hơi gờ lợi rồi bật chu môi dứt khoát",
      physicalCueVi: "Chặn hơi như /t/ rồi giật mạnh chu môi xát /ʃ/ dứt khoát.",
      devExampleWords: ["branch", "check", "batch", "switch", "patch"],
      commonMistake: "Đọc nông thành 'ch' tiếng Việt không có độ nén giật."
    },
    {
      symbol: "/dʒ/",
      soundCategory: "Voiced Postalveolar Affricate",
      vietnameseEquivalent: "Bật nén hữu thanh chu môi rung mạnh",
      physicalCueVi: "Chặn /d/ rồi giật rung /ʒ/ với môi chu tròn.",
      devExampleWords: ["merge", "edge", "bridge", "json", "stage"],
      commonMistake: "Đọc thành /z/ hoặc /s/ bẹt mép làm mất độ nén."
    },
    {
      symbol: "/ə/",
      soundCategory: "Schwa (Weak Central Vowel)",
      vietnameseEquivalent: "Nguyên âm yếu nhất và quan trọng nhất trong nhịp điệu tiếng Anh",
      physicalCueVi: "Hàm và lưỡi hoàn toàn thả lỏng ở vị trí trung tính, phát âm rất nhanh và nhẹ.",
      devExampleWords: ["server", "docker", "cluster", "controller", "buffer"],
      commonMistake: "Nhấn quá mạnh hoặc đọc rõ thành 'ơ' hay 'e' Việt Nam."
    },
    {
      symbol: "/iː/",
      soundCategory: "Long Front Vowel",
      vietnameseEquivalent: "Âm 'I' căng bè mép cười, ngân dài",
      physicalCueVi: "Mép miệng cười bẹt tối đa sang hai bên, cơ mặt căng, ngân dài gấp đôi âm ngắn.",
      devExampleWords: ["lead", "leak", "sheet", "read", "clean"],
      commonMistake: "Đọc ngắn làm biến 'sheet' thành từ nhạy cảm."
    },
    {
      symbol: "/ɪ/",
      soundCategory: "Short Front Vowel",
      vietnameseEquivalent: "Âm 'i' thả lỏng, hơi hướng 'ê'",
      physicalCueVi: "Hàm thả rơi nhẹ 0.5cm, cơ miệng hoàn toàn chùng, phát âm trầm và ngắn.",
      devExampleWords: ["commit", "build", "lid", "bit", "init"],
      commonMistake: "Bè mép cười quá mức biến thành /iː/ dài."
    },
    {
      symbol: "/æ/",
      soundCategory: "Short Open Front Vowel",
      vietnameseEquivalent: "Âm 'a bẹt' mở hàm sâu",
      physicalCueVi: "Hạ hàm dưới xuống hết cỡ, lưỡi ép phẳng dưới đáy miệng, phát âm 'a' lai 'e'.",
      devExampleWords: ["patch", "crash", "stack", "cache", "packet"],
      commonMistake: "Đọc thành 'a' nông hoặc 'e' ngắn tiếng Việt."
    },
    {
      symbol: "/ŋ/",
      soundCategory: "Velar Nasal",
      vietnameseEquivalent: "Âm mũi ngạc mềm cuối từ (ng)",
      physicalCueVi: "Gốc lưỡi nâng áp chặt ngạc mềm hạ xuống, dồn âm thanh hoàn toàn lên khoang mũi.",
      devExampleWords: ["string", "ping", "running", "blocking", "tuning"],
      commonMistake: "Chèn thêm âm /k/ hoặc /g/ thừa ở cuối."
    }
  ];

  const QUICK_ACTIONS = [
    {
      id: "act-simulators",
      title: "Go to Simulators",
      subtitle: "Daily Standup, Sprint Demo, Technical Ping-Pong & 1-on-1 Practice",
      category: "Navigation",
      icon: "🎮",
      badge: "Simulators",
      keywords: ["simulator", "standup", "demo", "pingpong", "oneonone", "practice"],
      handler: () => {
        document.getElementById('nav-simulators')?.click();
      }
    },
    {
      id: "act-standup",
      title: "Go to Standup Simulator",
      subtitle: "3-Bullet Agile Status (Yesterday, Today, Blockers)",
      category: "Navigation",
      icon: "☕",
      badge: "Standup",
      keywords: ["standup", "scrum", "agile", "yesterday", "today", "blockers"],
      handler: () => {
        document.getElementById('nav-simulators')?.click();
        setTimeout(() => document.getElementById('tab-sim-standup')?.click(), 50);
      }
    },
    {
      id: "act-oneonone",
      title: "Go to 1-on-1 Simulator",
      subtitle: "Engineering 1-on-1 with Staff/Lead Architect",
      category: "Navigation",
      icon: "🤝",
      badge: "1-on-1",
      keywords: ["1-on-1", "one on one", "lead", "manager", "career", "performance"],
      handler: () => {
        document.getElementById('nav-simulators')?.click();
        setTimeout(() => document.getElementById('tab-sim-oneonone')?.click(), 50);
      }
    },
    {
      id: "act-sparring",
      title: "Go to Sparring",
      subtitle: "Defend Architectural Decisions against Staff Architect",
      category: "Navigation",
      icon: "⚔️",
      badge: "Arena",
      keywords: ["sparring", "arena", "debate", "architect", "argument", "defend"],
      handler: () => {
        document.getElementById('nav-sparring')?.click();
      }
    },
    {
      id: "act-srs",
      title: "Go to SRS Flashcards",
      subtitle: "Spaced Repetition System for IT Phonetics & Vocabulary",
      category: "Navigation",
      icon: "🧠",
      badge: "SRS",
      keywords: ["srs", "flashcard", "review", "anki", "vocabulary", "repetition"],
      handler: () => {
        document.getElementById('nav-srs')?.click();
      }
    },
    {
      id: "act-handbook",
      title: "Open Handbook",
      subtitle: "Interactive Pronunciation & Kinesthetic Mechanics Fundamentals",
      category: "Navigation",
      icon: "📖",
      badge: "Handbook ↗",
      keywords: ["handbook", "cam nang", "fundamentals", "theory", "guide"],
      handler: () => {
        window.open('fundamentals.html', '_blank');
      }
    },
    {
      id: "act-aicoach",
      title: "Toggle AI Coach",
      subtitle: "Senior Technical English AI Mentor Dock & Chat Assistant",
      category: "AI Mentor",
      icon: "🤖",
      badge: "AI Coach",
      keywords: ["ai coach", "mentor", "chat", "assistant", "feedback", "ask"],
      handler: () => {
        if (typeof window.toggleAiCoach === 'function') {
          window.toggleAiCoach();
        } else {
          document.getElementById('btn-floating-ai')?.click();
        }
      }
    },
    {
      id: "act-stage-1",
      title: "Jump to Stage 1: Phonetics",
      subtitle: "Anatomical Vocal Tract, Active Articulator & Sound Mechanics",
      category: "Curriculum Stage",
      icon: "🔬",
      badge: "Key 1",
      shortcut: "1",
      keywords: ["stage 1", "phonetics", "vocal tract", "sound", "khau hinh"],
      handler: (palette) => palette.jumpToStage(1)
    },
    {
      id: "act-stage-2",
      title: "Jump to Stage 2: Sentence Frames",
      subtitle: "Plug-and-play Agile & Technical Sentence Architecture",
      category: "Curriculum Stage",
      icon: "📐",
      badge: "Key 2",
      shortcut: "2",
      keywords: ["stage 2", "sentence frames", "mau cau", "structure", "formula"],
      handler: (palette) => palette.jumpToStage(2)
    },
    {
      id: "act-stage-3",
      title: "Jump to Stage 3: AI Speech Output",
      subtitle: "Live Speech Recording, Acoustic Scoring & AI Refactoring",
      category: "Curriculum Stage",
      icon: "🎙️",
      badge: "Key 3",
      shortcut: "3",
      keywords: ["stage 3", "speech", "recording", "ai output", "scoring"],
      handler: (palette) => palette.jumpToStage(3)
    },
    {
      id: "act-record-toggle",
      title: "Toggle Speech Recording",
      subtitle: "Record voice input via Audio Dock, Stage 3 Mic, or Sparring",
      category: "Media",
      icon: "🔴",
      badge: "Space",
      shortcut: "Space",
      keywords: ["record", "mic", "speech", "voice", "thu am"],
      handler: (palette) => palette.toggleSpeechRecording()
    },
    {
      id: "act-submit-form",
      title: "Submit Active Practice / Simulation",
      subtitle: "Submit current active speech test, Standup, PR or Sparring turn",
      category: "Action",
      icon: "🚀",
      badge: "Ctrl+Enter",
      shortcut: "Ctrl+↵",
      keywords: ["submit", "evaluate", "send", "turn", "cham diem"],
      handler: (palette) => palette.submitActiveForm()
    },
    {
      id: "act-warmup",
      title: "Open Spaced Repetition 2-Min Warm-up",
      subtitle: "Rapid-fire pronunciation drill before starting your work day",
      category: "Practice",
      icon: "⚡",
      badge: "Warm-up",
      keywords: ["warmup", "khoi dong", "2 minute", "rapid", "srs"],
      handler: () => {
        document.getElementById('btn-open-warmup')?.click();
      }
    },
    {
      id: "act-linklab",
      title: "Open Connected Speech Link Lab",
      subtitle: "Analyze Linking, Elision, Flap-T & Assimilation in tech sentences",
      category: "Practice",
      icon: "🔗",
      badge: "Link Lab",
      keywords: ["link lab", "connected speech", "linking", "flap t", "elision"],
      handler: () => {
        document.getElementById('nav-simulators')?.click();
        setTimeout(() => document.getElementById('tab-sim-linklab')?.click(), 50);
      }
    },
    {
      id: "act-prpolish",
      title: "Go to PR Polisher",
      subtitle: "Refactor GitHub Pull Request summaries & comments with diplomatic tone",
      category: "Navigation",
      icon: "🐙",
      badge: "PR Polish",
      keywords: ["pr", "pull request", "polish", "github", "git", "review"],
      handler: () => {
        document.getElementById('nav-prpolish')?.click();
      }
    },
    {
      id: "act-analytics",
      title: "Go to Analytics & Velocity",
      subtitle: "Burndown chart, 90-day consistency heatmap & pronunciation badges",
      category: "Navigation",
      icon: "📊",
      badge: "Analytics",
      keywords: ["analytics", "burndown", "heatmap", "velocity", "badges", "progress"],
      handler: () => {
        document.getElementById('nav-analytics')?.click();
      }
    }
  ];

  // Helper to test if currently focused element is text input / editable
  function isInputFocused() {
    const el = document.activeElement;
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (el.getAttribute('role') === 'textbox') return true;
    return false;
  }

  // =============================================================================
  // COMMAND PALETTE NATIVE WEB COMPONENT
  // =============================================================================
  class DevEngCommandPalette extends HTMLElement {
    constructor() {
      super();
      this.isOpen = false;
      this.curriculum = [];
      this.ipaGlossary = [...DEFAULT_IPA_GLOSSARY];
      this.filteredResults = [];
      this.selectedIndex = 0;
      this.activeFilter = 'all'; // 'all' | 'actions' | 'curriculum' | 'ipa'
      this._boundOnKeyDown = this.handleGlobalKeyDown.bind(this);
    }

    connectedCallback() {
      if (this._isInitialized) return;
      this._isInitialized = true;

      this.injectStyles();
      this.render();
      this.initDOMElements();
      this.initEvents();

      // Asynchronously fetch live backend datasets
      this.loadDatasets();
    }

    disconnectedCallback() {
      window.removeEventListener('keydown', this._boundOnKeyDown, true);
    }

    // ---------------------------------------------------------------------------
    // DATA FETCHING & SYNCHRONIZATION
    // ---------------------------------------------------------------------------
    async loadDatasets() {
      // 1. Fetch 90 days curriculum
      try {
        const curriculumRes = await fetch('/api/curriculum').catch(() => null);
        if (curriculumRes && curriculumRes.ok) {
          const list = await curriculumRes.json();
          if (Array.isArray(list) && list.length > 0) {
            this.curriculum = list;
          }
        }
      } catch (_) {}

      // Fallback to window.state if already loaded by app.js
      if (this.curriculum.length === 0 && window.state && Array.isArray(window.state.lessons)) {
        this.curriculum = window.state.lessons;
      }

      // If still empty, synthesize an instant 90-day skeleton from sprint metadata
      if (this.curriculum.length === 0) {
        this.curriculum = this.buildSkeletonCurriculum();
      }

      // 2. Fetch IPA Glossary
      try {
        const ipaRes = await fetch('/api/ipa/glossary').catch(() => null);
        if (ipaRes && ipaRes.ok) {
          const glossaryData = await ipaRes.json();
          const items = Array.isArray(glossaryData) ? glossaryData : Object.values(glossaryData);
          if (items.length > 0) {
            // Merge with default list avoiding duplicates
            const symbolMap = new Map();
            DEFAULT_IPA_GLOSSARY.forEach(item => symbolMap.set(item.symbol, item));
            items.forEach(item => {
              if (item && item.symbol) symbolMap.set(item.symbol, { ...symbolMap.get(item.symbol), ...item });
            });
            this.ipaGlossary = Array.from(symbolMap.values());
          }
        }
      } catch (_) {}
    }

    buildSkeletonCurriculum() {
      const list = [];
      for (let day = 1; day <= 90; day++) {
        const sprintId = day <= 30 ? 1 : (day <= 60 ? 2 : 3);
        const sprintTitle = sprintId === 1
          ? "Sprint 1: Mechanical Phonetics & Daily Standup"
          : (sprintId === 2 ? "Sprint 2: Sentence Architecture & PR / Tech Talk" : "Sprint 3: System Design & Architectural Sparring");
        list.push({
          dayNumber: day,
          sprintId: sprintId,
          sprintTitle: sprintTitle,
          title: `Day ${day}: Deep Technical English Mastery`,
          focusObjective: `Sprint ${sprintId} Day ${day} Core workplace engineering fluency & phonetic precision.`,
          phonetics: {
            targetSound: sprintId === 1 ? "Consonant & Vowel Precision" : "Intonation & Connected Speech",
            phoneticSymbol: sprintId === 1 ? "/t/, /d/, /θ/, /ð/" : "/ə/, linking, flaps"
          }
        });
      }
      return list;
    }

    // ---------------------------------------------------------------------------
    // STYLES & RENDERING
    // ---------------------------------------------------------------------------
    injectStyles() {
      if (document.getElementById('deveng-command-palette-styles')) return;
      const style = document.createElement('style');
      style.id = 'deveng-command-palette-styles';
      style.textContent = `
        deveng-command-palette {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          z-index: 99999;
        }
        .deveng-palette-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(2, 6, 23, 0.82);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 3rem 1rem 1rem 1rem;
          opacity: 0;
          pointer-events: none;
          transition: opacity 160ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .deveng-palette-overlay.is-active {
          opacity: 1;
          pointer-events: auto;
        }
        .deveng-palette-container {
          width: 100%;
          max-width: 44rem;
          background: #090e1a;
          border: 1px solid rgba(51, 65, 85, 0.7);
          box-shadow: 0 25px 50px -12px rgba(6, 182, 212, 0.15), 0 0 0 1px rgba(6, 182, 212, 0.1);
          border-radius: 1rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transform: scale(0.97) translateY(-10px);
          transition: transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 82vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .deveng-palette-overlay.is-active .deveng-palette-container {
          transform: scale(1) translateY(0);
        }
        .deveng-palette-input {
          caret-color: #22d3ee;
        }
        .deveng-palette-item {
          transition: all 120ms ease;
        }
        .deveng-palette-item.is-selected {
          background: rgba(8, 47, 73, 0.65);
          border-left: 3px solid #22d3ee;
          padding-left: calc(0.75rem - 3px);
        }
        .deveng-palette-item.is-selected .item-title {
          color: #38bdf8;
        }
        .deveng-palette-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .deveng-palette-scroll::-webkit-scrollbar-track {
          background: #090e1a;
        }
        .deveng-palette-scroll::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 9999px;
        }
        .deveng-palette-scroll::-webkit-scrollbar-thumb:hover {
          background: #0ea5e9;
        }
        .deveng-kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fira Code', monospace;
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.15rem 0.45rem;
          border-radius: 0.375rem;
          background: #0f172a;
          color: #94a3b8;
          border: 1px solid #334155;
          box-shadow: 0 1px 2px rgba(0,0,0,0.4);
          letter-spacing: 0.025em;
        }
        .deveng-badge-pill {
          font-size: 0.6875rem;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `;
      document.head.appendChild(style);
    }

    render() {
      this.innerHTML = `
        <div id="deveng-palette-overlay" class="deveng-palette-overlay" aria-hidden="true">
          <div class="deveng-palette-container" role="dialog" aria-modal="true" aria-label="Command Palette">
            
            <!-- Top Search Header -->
            <div class="flex items-center px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/95 gap-3">
              <div class="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-mono text-sm font-bold shadow-inner shrink-0">
                ⌘
              </div>
              <input type="text" 
                     id="deveng-palette-input"
                     class="deveng-palette-input flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base font-mono focus:outline-none"
                     placeholder="Search 90 days, IPA symbols (/θ/, /t/...), or actions..."
                     autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="deveng-kbd">ESC</span>
              </div>
            </div>

            <!-- Category Filter Bar -->
            <div class="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/60 bg-slate-950/70 text-xs overflow-x-auto no-scrollbar">
              <button type="button" data-filter="all" class="filter-tab px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500 text-slate-950 transition cursor-pointer">
                All
              </button>
              <button type="button" data-filter="actions" class="filter-tab px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer">
                ⚡ Quick Actions
              </button>
              <button type="button" data-filter="curriculum" class="filter-tab px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer">
                🗺️ 90 Days
              </button>
              <button type="button" data-filter="ipa" class="filter-tab px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer">
                🗣️ IPA Glossary
              </button>
            </div>

            <!-- Results List Container -->
            <div id="deveng-palette-results" class="deveng-palette-scroll flex-1 overflow-y-auto p-2 space-y-1" style="max-height: 52vh; min-height: 180px;">
              <!-- Dynamically populated by updateResults() -->
            </div>

            <!-- Bottom Statusbar & Keyboard Legend -->
            <div class="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
              <div class="flex items-center gap-3 text-[11px] font-mono">
                <span class="flex items-center gap-1.5"><span class="deveng-kbd">↑↓</span> navigate</span>
                <span class="flex items-center gap-1.5"><span class="deveng-kbd">↵</span> select</span>
                <span class="flex items-center gap-1.5"><span class="deveng-kbd">ESC</span> close</span>
              </div>
              <div class="hidden sm:flex items-center gap-3 text-[11px] font-mono">
                <span class="flex items-center gap-1"><span class="deveng-kbd text-cyan-400">1 / 2 / 3</span> stages</span>
                <span class="flex items-center gap-1"><span class="deveng-kbd text-emerald-400">Space</span> mic</span>
                <span class="flex items-center gap-1"><span class="deveng-kbd text-purple-400">Ctrl+↵</span> submit</span>
              </div>
            </div>

          </div>
        </div>
      `;
    }

    initDOMElements() {
      this.overlay = this.querySelector('#deveng-palette-overlay');
      this.input = this.querySelector('#deveng-palette-input');
      this.resultsContainer = this.querySelector('#deveng-palette-results');
      this.filterTabs = this.querySelectorAll('.filter-tab');
    }

    initEvents() {
      // Global hotkey router
      window.addEventListener('keydown', this._boundOnKeyDown, true);

      // Search input changes
      this.input?.addEventListener('input', () => {
        this.selectedIndex = 0;
        this.updateResults();
      });

      // Filter tabs click
      this.filterTabs?.forEach(tab => {
        tab.addEventListener('click', () => {
          this.activeFilter = tab.dataset.filter || 'all';
          this.updateFilterTabStyles();
          this.selectedIndex = 0;
          this.updateResults();
          this.input?.focus();
        });
      });

      // Close on clicking backdrop
      this.overlay?.addEventListener('mousedown', (e) => {
        if (e.target === this.overlay) {
          this.closePalette();
        }
      });
    }

    updateFilterTabStyles() {
      this.filterTabs?.forEach(tab => {
        if (tab.dataset.filter === this.activeFilter) {
          tab.className = 'filter-tab px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500 text-slate-950 transition cursor-pointer shadow-sm';
        } else {
          tab.className = 'filter-tab px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer';
        }
      });
    }

    // ---------------------------------------------------------------------------
    // GLOBAL KEYBOARD ROUTER
    // ---------------------------------------------------------------------------
    handleGlobalKeyDown(e) {
      // 1. Ctrl+K / Cmd+K: Spotlight Toggle
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        this.togglePalette();
        return;
      }

      // 2. Escape: Close palette if active
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        e.stopPropagation();
        this.closePalette();
        return;
      }

      // When Palette is OPEN: capture navigation keys
      if (this.isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.moveSelection(1);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.moveSelection(-1);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
          return;
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          this.cycleFilterTab(e.shiftKey ? -1 : 1);
          return;
        }
        return;
      }

      // When Palette is CLOSED:
      // Ctrl+Enter: Submit active practice / simulation form (works in or out of inputs)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.submitActiveForm();
        return;
      }

      // Shortcuts strictly when NOT focused on input/textarea/editable
      if (!isInputFocused()) {
        // Space: Toggle speech recording (mic)
        if (e.code === 'Space' || e.key === ' ') {
          e.preventDefault();
          this.toggleSpeechRecording();
          return;
        }

        // 1, 2, 3: Quick stage jump
        if (e.key === '1') {
          e.preventDefault();
          this.jumpToStage(1);
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          this.jumpToStage(2);
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          this.jumpToStage(3);
          return;
        }
      }
    }

    // ---------------------------------------------------------------------------
    // COMMAND PALETTE ACTIONS & CONTROLS
    // ---------------------------------------------------------------------------
    togglePalette() {
      if (this.isOpen) {
        this.closePalette();
      } else {
        this.openPalette();
      }
    }

    openPalette() {
      this.isOpen = true;
      this.overlay?.classList.add('is-active');
      this.overlay?.setAttribute('aria-hidden', 'false');
      this.selectedIndex = 0;
      this.updateResults();
      setTimeout(() => {
        this.input?.focus();
        this.input?.select();
      }, 50);
    }

    closePalette() {
      this.isOpen = false;
      this.overlay?.classList.remove('is-active');
      this.overlay?.setAttribute('aria-hidden', 'true');
      this.input?.blur();
    }

    cycleFilterTab(direction = 1) {
      const filters = ['all', 'actions', 'curriculum', 'ipa'];
      let idx = filters.indexOf(this.activeFilter);
      idx = (idx + direction + filters.length) % filters.length;
      this.activeFilter = filters[idx];
      this.updateFilterTabStyles();
      this.selectedIndex = 0;
      this.updateResults();
    }

    moveSelection(delta) {
      if (!this.filteredResults.length) return;
      this.selectedIndex = (this.selectedIndex + delta + this.filteredResults.length) % this.filteredResults.length;
      this.highlightItem(this.selectedIndex);
    }

    highlightItem(index) {
      const items = this.resultsContainer?.querySelectorAll('.deveng-palette-item');
      if (!items) return;
      items.forEach((item, idx) => {
        if (idx === index) {
          item.classList.add('is-selected');
          item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          item.classList.remove('is-selected');
        }
      });
    }

    executeSelected() {
      const item = this.filteredResults[this.selectedIndex];
      if (!item) return;
      this.closePalette();
      this.triggerItemAction(item);
    }

    triggerItemAction(item) {
      if (item.type === 'action' && typeof item.handler === 'function') {
        item.handler(this);
      } else if (item.type === 'curriculum') {
        this.jumpToCurriculumDay(item.dayNumber);
      } else if (item.type === 'ipa') {
        this.activateIpaSymbol(item);
      }
    }

    // ---------------------------------------------------------------------------
    // DOM JUMP & HARDWARE MIC / FORM TRIGGER HANDLERS
    // ---------------------------------------------------------------------------
    jumpToStage(stageNum) {
      // 1. Ensure we are viewing the Workspace
      const navWorkspace = document.getElementById('nav-workspace');
      const viewWorkspace = document.getElementById('view-workspace');
      if (navWorkspace && viewWorkspace && viewWorkspace.classList.contains('hidden')) {
        navWorkspace.click();
      }

      const cardId = `stage-${stageNum}-card`;
      const card = document.getElementById(cardId);
      if (!card) return;

      // Expand card if collapsed
      const body = card.querySelector('.stage-body');
      if (body && body.classList.contains('hidden')) {
        const toggleBtn = document.getElementById(`btn-toggle-stage-${stageNum}`);
        if (toggleBtn) toggleBtn.click();
      }

      // Scroll smoothly
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Pulse highlight ring
      card.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-950');
      setTimeout(() => {
        card.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-slate-950');
      }, 1200);
    }

    jumpToCurriculumDay(dayNumber) {
      // Switch to Workspace
      const navWorkspace = document.getElementById('nav-workspace');
      if (navWorkspace) navWorkspace.click();

      // Trigger day selection via select-jump-day
      const selectJumpDay = document.getElementById('select-jump-day');
      if (selectJumpDay) {
        selectJumpDay.value = dayNumber;
        selectJumpDay.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // If loadDayLesson is accessible, call it as well
      if (typeof window.loadDayLesson === 'function') {
        window.loadDayLesson(dayNumber);
      }

      // Scroll to top / Stage 1
      this.jumpToStage(1);
    }

    activateIpaSymbol(ipaItem) {
      // 1. Pronounce primary example word
      if (ipaItem.devExampleWords && ipaItem.devExampleWords.length > 0 && typeof window.speakWord === 'function') {
        window.speakWord(ipaItem.devExampleWords[0]);
      }

      // 2. Select in Sagittal Vocal Tract & Mouth Map if available
      if (typeof window.selectSagittalAndMouth === 'function') {
        window.selectSagittalAndMouth(ipaItem.symbol);
      }

      // 3. If in workspace, scroll to vocal tract section
      const vocalCard = document.getElementById('stage-1-card');
      if (vocalCard && !document.getElementById('view-workspace')?.classList.contains('hidden')) {
        vocalCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    toggleSpeechRecording() {
      // Priority 1: If DevEng Audio Recorder Dock is active/visible, trigger its record toggle
      const recorderDock = document.getElementById('deveng-recorder-dock') || document.querySelector('deveng-recorder-dock');
      const dockBtn = document.getElementById('btn-dock-record-toggle');
      if (recorderDock && !recorderDock.classList.contains('hidden') && dockBtn) {
        dockBtn.click();
        return;
      }

      // Priority 2: Sparring Arena Mic
      const sparringView = document.getElementById('view-sparring');
      const sparringMic = document.getElementById('btn-sparring-mic');
      if (sparringView && !sparringView.classList.contains('hidden') && sparringMic) {
        sparringMic.click();
        return;
      }

      // Priority 3: Stage 3 Main Speaking Button in Workspace
      const workspaceView = document.getElementById('view-workspace');
      const stage3MainSpeak = document.getElementById('btn-start-speaking-main');
      if (workspaceView && !workspaceView.classList.contains('hidden') && stage3MainSpeak) {
        stage3MainSpeak.click();
        return;
      }

      // Priority 4: Open Audio Recorder Dock globally
      if (typeof window.openRecorderDock === 'function') {
        window.openRecorderDock();
      } else if (dockBtn) {
        dockBtn.click();
      } else if (stage3MainSpeak) {
        stage3MainSpeak.click();
      }
    }

    submitActiveForm() {
      const active = document.activeElement;

      // 1. Sparring Submit
      const sparringView = document.getElementById('view-sparring');
      const isSparringVisible = sparringView && !sparringView.classList.contains('hidden');
      if (active?.id === 'input-sparring-speech' || active?.closest('#view-sparring') || isSparringVisible) {
        const btn = document.getElementById('btn-sparring-submit');
        if (btn) { btn.click(); return; }
      }

      // 2. PR Polish Submit
      const prView = document.getElementById('view-prpolish');
      const isPrVisible = prView && !prView.classList.contains('hidden');
      if (active?.closest('#view-prpolish') || isPrVisible) {
        const btn = document.getElementById('btn-pr-polish-submit');
        if (btn) { btn.click(); return; }
      }

      // 3. Simulators: Standup, Demo, Pingpong, 1-on-1, Linklab
      const simView = document.getElementById('view-simulators');
      const isSimVisible = simView && !simView.classList.contains('hidden');
      if (active?.closest('#view-simulators') || isSimVisible) {
        // Find whichever simulator sub-panel is currently active & not hidden
        const activePanel = document.querySelector('#view-simulators [id^="panel-sim-"]:not(.hidden)');
        if (activePanel) {
          const submitBtn = activePanel.querySelector('button[id$="-submit"]');
          if (submitBtn) { submitBtn.click(); return; }
        }
      }

      // 4. Stage 3 Speech / Practice Evaluation
      const workspaceView = document.getElementById('view-workspace');
      const isWorkspaceVisible = workspaceView && !workspaceView.classList.contains('hidden');
      if (active?.id === 'ai-input-text' || active?.closest('#stage-3-card') || isWorkspaceVisible) {
        const btn = document.getElementById('btn-evaluate-ai');
        if (btn) { btn.click(); return; }
      }

      // 5. Generic fallback submit button in visible viewport
      const genericBtn = document.querySelector('button[id*="submit"]:not([disabled]), #btn-evaluate-ai:not([disabled])');
      if (genericBtn) genericBtn.click();
    }

    // ---------------------------------------------------------------------------
    // FUZZY SEARCH ENGINE
    // ---------------------------------------------------------------------------
    fuzzyScore(query, text) {
      if (!query || !text) return 0;
      const q = query.toLowerCase().trim();
      const t = text.toLowerCase();

      if (t === q) return 1000;
      if (t.startsWith(q)) return 850 + (50 - Math.min(t.length, 50));
      if (t.includes(q)) return 600 + (50 - Math.min(t.length, 50));

      // Subsequence match
      let qIdx = 0;
      let score = 0;
      let consecutive = 0;
      for (let i = 0; i < t.length && qIdx < q.length; i++) {
        if (t[i] === q[qIdx]) {
          qIdx++;
          score += 15 + (consecutive * 6);
          consecutive++;
        } else {
          consecutive = 0;
        }
      }
      return qIdx === q.length ? score : 0;
    }

    updateResults() {
      const query = (this.input?.value || '').trim();
      let pool = [];

      // A. Actions
      if (this.activeFilter === 'all' || this.activeFilter === 'actions') {
        QUICK_ACTIONS.forEach(act => {
          let score = query ? 0 : 50;
          if (query) {
            const sTitle = this.fuzzyScore(query, act.title);
            const sSub = this.fuzzyScore(query, act.subtitle);
            const sKey = act.keywords ? Math.max(...act.keywords.map(k => this.fuzzyScore(query, k))) : 0;
            score = Math.max(sTitle * 1.5, sSub, sKey * 1.3);
          }
          if (score > 0) {
            pool.push({
              type: 'action',
              score,
              item: act,
              title: act.title,
              subtitle: act.subtitle,
              badge: act.badge || 'Action',
              shortcut: act.shortcut || null,
              icon: act.icon,
              handler: act.handler
            });
          }
        });
      }

      // B. Curriculum (90 Days)
      if (this.activeFilter === 'all' || this.activeFilter === 'curriculum') {
        this.curriculum.forEach(lesson => {
          let score = query ? 0 : 20;
          const dayNum = lesson.dayNumber || lesson.DayNumber;
          const title = lesson.title || lesson.Title || '';
          const objective = lesson.focusObjective || lesson.FocusObjective || '';
          const sprintTitle = lesson.sprintTitle || lesson.SprintTitle || `Sprint ${lesson.sprintId || lesson.SprintId}`;
          const sound = lesson.phonetics?.targetSound || lesson.Phonetics?.TargetSound || '';
          const symbol = lesson.phonetics?.phoneticSymbol || lesson.Phonetics?.PhoneticSymbol || '';

          if (query) {
            const queryClean = query.replace(/^d(ay)?\s*/i, '');
            const isDayMatch = String(dayNum) === queryClean || `day ${dayNum}`.includes(query.toLowerCase());
            const sDay = isDayMatch ? 900 : 0;
            const sTitle = this.fuzzyScore(query, title);
            const sSound = this.fuzzyScore(query, `${sound} ${symbol}`);
            const sObj = this.fuzzyScore(query, objective);
            score = Math.max(sDay, sTitle * 1.4, sSound * 1.5, sObj);
          }

          if (score > 0) {
            pool.push({
              type: 'curriculum',
              score,
              dayNumber: dayNum,
              title: `Day ${dayNum}: ${title}`,
              subtitle: `${sprintTitle} • Focus: ${sound || symbol || 'Phonetics'}`,
              badge: `Day ${dayNum}`,
              shortcut: `↵ Jump`,
              icon: '📅'
            });
          }
        });
      }

      // C. IPA Glossary
      if (this.activeFilter === 'all' || this.activeFilter === 'ipa') {
        this.ipaGlossary.forEach(ipa => {
          let score = query ? 0 : 30;
          const sym = ipa.symbol || '';
          const cat = ipa.soundCategory || '';
          const eq = ipa.vietnameseEquivalent || '';
          const words = (ipa.devExampleWords || []).join(', ');

          if (query) {
            const cleanQuery = query.startsWith('/') && query.endsWith('/') ? query : `/${query}/`;
            const sExactSym = sym.toLowerCase() === cleanQuery.toLowerCase() ? 1000 : 0;
            const sSym = this.fuzzyScore(query, sym);
            const sWords = this.fuzzyScore(query, words);
            const sCat = this.fuzzyScore(query, cat);
            const sEq = this.fuzzyScore(query, eq);
            score = Math.max(sExactSym, sSym * 2, sWords * 1.3, sCat, sEq);
          }

          if (score > 0) {
            pool.push({
              type: 'ipa',
              score,
              symbol: sym,
              devExampleWords: ipa.devExampleWords || [],
              title: `${sym} ${cat}`,
              subtitle: `${eq} • Dev words: ${(ipa.devExampleWords || []).slice(0, 4).join(', ')}`,
              badge: 'IPA',
              shortcut: '🔊 Sound',
              icon: '🗣️'
            });
          }
        });
      }

      // Sort by relevance score
      pool.sort((a, b) => b.score - a.score);

      // Cap at 40 top matches for smooth rendering
      this.filteredResults = pool.slice(0, 40);

      // Keep selection index valid
      if (this.selectedIndex >= this.filteredResults.length) {
        this.selectedIndex = Math.max(0, this.filteredResults.length - 1);
      }

      this.renderResults();
    }

    renderResults() {
      if (!this.resultsContainer) return;

      if (this.filteredResults.length === 0) {
        this.resultsContainer.innerHTML = `
          <div class="p-8 text-center space-y-2">
            <div class="text-3xl">🔍</div>
            <div class="text-sm font-semibold text-slate-300">Không tìm thấy kết quả phù hợp</div>
            <div class="text-xs text-slate-500 font-mono">Thử tìm theo ngày (ví dụ: Day 12), ký tự IPA (/θ/, /t/), hoặc tính năng (Standup, Sparring...)</div>
          </div>
        `;
        return;
      }

      let html = '';
      this.filteredResults.forEach((item, index) => {
        const isSelected = index === this.selectedIndex;
        const selectedClass = isSelected ? 'is-selected' : '';

        // Badge styling
        let badgeColors = 'bg-slate-800 text-slate-300 border border-slate-700';
        if (item.type === 'action') {
          badgeColors = 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60';
        } else if (item.type === 'curriculum') {
          badgeColors = 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60';
        } else if (item.type === 'ipa') {
          badgeColors = 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60';
        }

        html += `
          <div class="deveng-palette-item ${selectedClass} flex items-center justify-between p-2.5 rounded-xl cursor-pointer select-none"
               data-index="${index}"
               role="option"
               aria-selected="${isSelected}">
            
            <div class="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <div class="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-sm shrink-0 shadow-sm">
                ${item.icon}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="item-title font-bold text-sm text-slate-100 truncate">${this.escapeHtml(item.title)}</span>
                  <span class="deveng-badge-pill ${badgeColors}">${this.escapeHtml(item.badge)}</span>
                </div>
                <div class="text-xs text-slate-400 truncate mt-0.5">${this.escapeHtml(item.subtitle)}</div>
              </div>
            </div>

            <div class="shrink-0 flex items-center gap-1.5">
              ${item.shortcut ? `<span class="deveng-kbd">${this.escapeHtml(item.shortcut)}</span>` : `<span class="deveng-kbd">↵</span>`}
            </div>

          </div>
        `;
      });

      this.resultsContainer.innerHTML = html;

      // Attach click events on results
      this.resultsContainer.querySelectorAll('.deveng-palette-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index, 10);
          if (!isNaN(idx)) {
            this.selectedIndex = idx;
            this.executeSelected();
          }
        });
        el.addEventListener('mouseenter', () => {
          const idx = parseInt(el.dataset.index, 10);
          if (!isNaN(idx)) {
            this.selectedIndex = idx;
            this.highlightItem(this.selectedIndex);
          }
        });
      });
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }

  // =============================================================================
  // REGISTER CUSTOM ELEMENT & AUTO-MOUNT COMPONENT
  // =============================================================================
  if (typeof customElements !== 'undefined' && !customElements.get('deveng-command-palette')) {
    customElements.define('deveng-command-palette', DevEngCommandPalette);
  }

  // Global helper on window to toggle palette programmatically
  window.toggleDevEngCommandPalette = function () {
    let palette = document.querySelector('deveng-command-palette');
    if (!palette) {
      palette = document.createElement('deveng-command-palette');
      document.body.appendChild(palette);
    }
    palette.togglePalette();
  };

  // Self-instantiate safely if not declared in markup
  if (typeof document !== 'undefined') {
    const ensurePaletteMounted = () => {
      if (!document.querySelector('deveng-command-palette')) {
        const palette = document.createElement('deveng-command-palette');
        document.body.appendChild(palette);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensurePaletteMounted);
    } else {
      ensurePaletteMounted();
    }
  }

})();
