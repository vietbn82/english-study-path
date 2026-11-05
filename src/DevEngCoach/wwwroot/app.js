// DevEng Coach - Client Application (Resilient Offline-First Engine)
(() => {
  // Pre-compiled Fallback for Day 1 (Ensures instant 0ms paint even if server is offline)
  const FALLBACK_DAY_1 = {
    dayNumber: 1,
    sprintId: 1,
    sprintTitle: "Mechanical Phonetics & Daily Standup",
    title: "Final /t/ vs /d/ in Code & Git Actions",
    focusObjective: "Chặn nổ đầu lưỡi tại gờ lợi (Alveolar Ridge) cho âm /t/ và rung dây thanh /d/ trong các thao tác lập trình hàng ngày.",
    phonetics: {
      targetSound: "Ending /t/ and /d/",
      phoneticSymbol: "/t/, /d/",
      activeArticulator: "Đầu lưỡi (Tongue Tip)",
      passiveArticulator: "Gờ lợi sau chân răng trên (Alveolar Ridge)",
      mannerOfArticulation: "Plosive / Stop (Chặn nổ 3 pha)",
      isVoiced: false,
      mechanicalInstructions: "Đầu lưỡi ép chặt vào gờ lợi trên để nén áp suất. Với /t/: bung hơi dứt khoát không rung cổ. Với /d/: rung dây thanh âm.",
      commonVietnameseMistake: "Người Việt có xu hướng rụng hoàn toàn âm đuôi /t/ và /d/ (đọc 'commit' thành 'com-mí', 'build' thành 'biu').",
      physicalCue: "Đặt ngón tay lên hõm cổ để cảm nhận /t/ êm và /d/ rung giật."
    },
    vocabularyDrills: [
      { word: "commit", ipa: "/kəˈmɪt/", meaningVi: "Đóng gói mã nguồn", technicalContext: "Git commit", physicalNote: "Bật /t/ dứt khoát ở cuối" },
      { word: "test", ipa: "/tɛst/", meaningVi: "Kiểm thử tự động", technicalContext: "Unit test", physicalNote: "Xì /s/ rồi ngắt bật /t/" },
      { word: "build", ipa: "/bɪld/", meaningVi: "Biên dịch dự án", technicalContext: "CI/CD build", physicalNote: "Cuộn nhẹ L rồi đóng /d/" },
      { word: "endpoint", ipa: "/ˈɛndˌpɔɪnt/", meaningVi: "Điểm cuối API", technicalContext: "REST API endpoint", physicalNote: "Bật /t/ sắc nét" },
      { word: "succeed", ipa: "/səkˈsiːd/", meaningVi: "Thành công", technicalContext: "Build succeeded", physicalNote: "Ngân dài /iː/ rồi đóng /d/" }
    ],
    sentenceFrames: [
      {
        templateName: "Báo cáo nhiệm vụ đã xong",
        templatePattern: "Yesterday, I committed the [Component] changes and tested the [Feature].",
        exampleUsage: "Yesterday, I committed the auth changes and tested the login endpoint.",
        vietnameseTranslation: "Hôm qua tôi đã commit các thay đổi của auth và kiểm thử xong endpoint login.",
        devVariables: ["[Component]", "[Feature]"]
      },
      {
        templateName: "Báo cáo trạng thái CI/CD",
        templatePattern: "The CI/CD build for [Branch] has succeeded without any errors.",
        exampleUsage: "The CI/CD build for master branch has succeeded without any errors.",
        vietnameseTranslation: "Bản build CI/CD cho nhánh master đã thành công không có lỗi nào.",
        devVariables: ["[Branch]"]
      }
    ],
    practiceTask: {
      prompt: "Báo cáo tiến độ hoàn thành commit và test một controller trong Daily Standup.",
      scenarioVi: "Bạn vừa hoàn thành việc sửa lỗi và đẩy code lên branch staging.",
      expectedStructure: "Dùng thì quá khứ với âm đuôi /t/ và /d/ chuẩn xác.",
      selfCheckReminder: "Kiểm tra xem các từ committed, tested, build đã bật đuôi hay chưa."
    }
  };

  // Contrastive Sound Pairs Database (FR-010)
  const CONTRASTIVE_PAIRS = {
    1: {
      soundA: { symbol: "/t/", name: "Voiceless Stop", cue: "Bật gió, không rung cổ, nguyên âm trước ngắn" },
      soundB: { symbol: "/d/", name: "Voiced Stop", cue: "Rung thanh quản, nguyên âm trước dài gấp 1.5 lần" },
      drills: [
        { wordA: "test", ipaA: "/tɛst/", wordB: "dead", ipaB: "/dɛd/", tip: "test (bật t) vs dead (kéo dài e + đóng d)" },
        { wordA: "commit", ipaA: "/kəˈmɪt/", wordB: "code", ipaB: "/koʊd/", tip: "commit (ngắt t) vs code (kéo dài o + d)" },
        { wordA: "bat", ipaA: "/bæt/", wordB: "bad", ipaB: "/bæːd/", tip: "bat (150ms) vs bad (250ms)" },
        { wordA: "write", ipaA: "/raɪt/", wordB: "ride", ipaB: "/raɪːd/", tip: "write (ngắt t) vs ride (ngân ai + d)" }
      ]
    },
    7: {
      soundA: { symbol: "/θ/", name: "Voiceless Interdental", cue: "Kẹp lưỡi giữa răng, xì gió không rung" },
      soundB: { symbol: "/ð/", name: "Voiced Interdental", cue: "Kẹp lưỡi giữa răng, dây thanh rung rền" },
      drills: [
        { wordA: "auth", ipaA: "/ɔːθ/", wordB: "other", ipaB: "/ˈʌð.ər/", tip: "auth (gió qua răng) vs other (rung lưỡi)" },
        { wordA: "thread", ipaA: "/θrɛd/", wordB: "this", ipaB: "/ðɪs/", tip: "thread (thè lưỡi gió) vs this (rung)" },
        { wordA: "breath", ipaA: "/brɛθ/", wordB: "breathe", ipaB: "/briːð/", tip: "breath (danh từ, gió) vs breathe (động từ, rung)" }
      ]
    },
    9: {
      soundA: { symbol: "/s/", name: "Voiceless Fricative", cue: "Xì khe hẹp gờ lợi, cổ êm hoàn toàn" },
      soundB: { symbol: "/z/", name: "Voiced Fricative", cue: "Khẩu hình giống /s/ nhưng cổ rung dữ dội" },
      drills: [
        { wordA: "price", ipaA: "/praɪs/", wordB: "prize", ipaB: "/praɪz/", tip: "price (xì s) vs prize (rung z)" },
        { wordA: "advice", ipaA: "/ədˈvaɪs/", wordB: "advise", ipaB: "/ədˈvaɪz/", tip: "advice (danh từ) vs advise (động từ)" },
        { wordA: "sync", ipaA: "/sɪŋk/", wordB: "zinc", ipaB: "/zɪŋk/", tip: "sync (xì s) vs zinc (rung z)" }
      ]
    },
    13: {
      soundA: { symbol: "/tʃ/", name: "Voiceless Affricate", cue: "Chặn gờ lợi rồi xát gió (t + sh), không rung" },
      soundB: { symbol: "/dʒ/", name: "Voiced Affricate", cue: "Chặn gờ lợi rồi xát rung (d + zh), rung mạnh" },
      drills: [
        { wordA: "branch", ipaA: "/bræntʃ/", wordB: "bridge", ipaB: "/brɪdʒ/", tip: "branch (bật gió ch) vs bridge (rung j)" },
        { wordA: "check", ipaA: "/tʃɛk/", wordB: "JSON", ipaB: "/ˈdʒeɪ.sən/", tip: "check (tʃ gió) vs JSON (dʒ rung)" },
        { wordA: "batch", ipaA: "/bætʃ/", wordB: "badge", ipaB: "/bædʒ/", tip: "batch (ngắt ch) vs badge (rung j)" }
      ]
    },
    17: {
      soundA: { symbol: "/iː/", name: "High Front Tense", cue: "Mép cười bè tối đa, cơ căng, ngân dài" },
      soundB: { symbol: "/ɪ/", name: "High-Mid Lax", cue: "Hàm thả rơi nhẹ 0.5cm, cơ chùng, âm trầm ngắn" },
      drills: [
        { wordA: "lead", ipaA: "/liːd/", wordB: "lid", ipaB: "/lɪd/", tip: "lead (cười bè dài) vs lid (thả lỏng ngắn)" },
        { wordA: "leak", ipaA: "/liːk/", wordB: "lick", ipaB: "/lɪk/", tip: "memory leak vs lick" },
        { wordA: "sheet", ipaA: "/ʃiːt/", wordB: "shit", ipaB: "/ʃɪt/", tip: "style sheet (dài) vs từ nhạy cảm (ngắn)" }
      ]
    }
  };

  // Application State
  const state = {
    currentDay: 1,
    currentSelfRating: 5,
    lessons: [FALLBACK_DAY_1],
    sessions: {},
    summary: {
      currentStreakDays: 0,
      longestStreakDays: 0,
      totalCompletedDays: 0,
      totalPlannedDays: 90,
      totalActualMinutesSpent: 0,
      totalPlannedMinutesExpected: 0,
      varianceMinutes: 0,
      completionPercentage: 0,
      nextDayNumber: 1
    },
    timer: {
      totalSeconds: 30 * 60,
      remainingSeconds: 30 * 60,
      intervalId: null,
      isRunning: false
    },
    isRecording: false,
    recognition: null,
    mediaRecorder: null,
    audioChunks: [],
    recordedAudioUrl: null,
    soundPractice: {
      targetWord: "test",
      targetSymbol: "/t/",
      isRecording: false,
      recognition: null
    },
    floatingAi: {
      isRecording: false,
      recognition: null
    }
  };

  // DOM Elements
  const el = {
    navWorkspace: document.getElementById('nav-workspace'),
    navCurriculum: document.getElementById('nav-curriculum'),
    navSimulators: document.getElementById('nav-simulators'),
    navSparring: document.getElementById('nav-sparring'),
    navPrpolish: document.getElementById('nav-prpolish'),
    navSrs: document.getElementById('nav-srs'),
    viewWorkspace: document.getElementById('view-workspace'),
    viewCurriculum: document.getElementById('view-curriculum'),
    viewSimulators: document.getElementById('view-simulators'),
    viewSparring: document.getElementById('view-sparring'),
    viewPrpolish: document.getElementById('view-prpolish'),
    viewSrs: document.getElementById('view-srs'),
    statStreak: document.getElementById('stat-streak'),
    statVariance: document.getElementById('stat-variance'),
    statProgress: document.getElementById('stat-progress'),
    statReminderTime: document.getElementById('stat-reminder-time'),
    statSrsBadge: document.getElementById('stat-srs-badge'),
    statSrsDue: document.getElementById('stat-srs-due'),
    btnTestNotification: document.getElementById('btn-test-notification'),

    // Day Hero
    badgeDay: document.getElementById('badge-day'),
    badgeSprintName: document.getElementById('badge-sprint-name'),
    lessonTitle: document.getElementById('lesson-title'),
    lessonObjective: document.getElementById('lesson-objective'),
    selectJumpDay: document.getElementById('select-jump-day'),
    btnPrevDay: document.getElementById('btn-prev-day'),
    btnNextDay: document.getElementById('btn-next-day'),

    // Timer
    timerDisplay: document.getElementById('timer-display'),
    timerProgress: document.getElementById('timer-progress'),
    timerPhaseHint: document.getElementById('timer-phase-hint'),
    btnTimerStart: document.getElementById('btn-timer-start'),
    btnTimerPause: document.getElementById('btn-timer-pause'),
    btnTimerReset: document.getElementById('btn-timer-reset'),

    // Stage 1
    phoneticsSymbol: document.getElementById('phonetics-symbol'),
    phoneticsActive: document.getElementById('phonetics-active'),
    phoneticsPassive: document.getElementById('phonetics-passive'),
    phoneticsManner: document.getElementById('phonetics-manner'),
    phoneticsVoiced: document.getElementById('phonetics-voiced'),
    phoneticsInstruction: document.getElementById('phonetics-instruction'),
    phoneticsMistake: document.getElementById('phonetics-mistake'),
    drillsContainer: document.getElementById('drills-container'),
    contrastPairContainer: document.getElementById('contrast-pair-container'),
    btnPracticeTargetSound: document.getElementById('btn-practice-target-sound'),

    // Stage 2
    framesContainer: document.getElementById('frames-container'),
    frameVariables: document.getElementById('frame-variables'),

    // Stage 3
    taskPrompt: document.getElementById('task-prompt'),
    taskScenario: document.getElementById('task-scenario'),
    aiInputText: document.getElementById('ai-input-text'),
    btnSpeechRecord: document.getElementById('btn-speech-record'),
    recordLabel: document.getElementById('record-label'),
    btnEvaluateAi: document.getElementById('btn-evaluate-ai'),
    aiFeedbackBox: document.getElementById('ai-feedback-box'),
    aiFluencyBadge: document.getElementById('ai-fluency-badge'),
    aiGrammarFix: document.getElementById('ai-grammar-fix'),
    aiPhoneticAlerts: document.getElementById('ai-phonetic-alerts'),
    aiSeniorRefactor: document.getElementById('ai-senior-refactor'),

    // Side-by-Side Audio Comparison (FR-011)
    btnPlayNativeVoice: document.getElementById('btn-play-native-voice'),
    btnReplayUserVoice: document.getElementById('btn-replay-user-voice'),
    audioUserRecorded: document.getElementById('audio-user-recorded'),
    audioPlaybackStatus: document.getElementById('audio-playback-status'),

    // Completion & Learner Self-Rating
    inputActualMinutes: document.getElementById('input-actual-minutes'),
    btnCompleteSession: document.getElementById('btn-complete-session'),
    inputLearnerNotes: document.getElementById('input-learner-notes'),
    starRatingContainer: document.getElementById('star-rating-container'),
    starRatingLabel: document.getElementById('star-rating-label'),
    sessionCompletedBanner: document.getElementById('session-completed-banner'),
    sessionCompletedInfo: document.getElementById('session-completed-info'),
    sessionCompletedStars: document.getElementById('session-completed-stars'),

    // Curriculum Grid
    curriculumGrid: document.getElementById('curriculum-grid'),

    // Sound Practice Modal (FR-009)
    modalSoundPractice: document.getElementById('modal-sound-practice'),
    btnCloseSoundModal: document.getElementById('btn-close-sound-modal'),
    modalSoundTargetDesc: document.getElementById('modal-sound-target-desc'),
    modalSoundTargetWord: document.getElementById('modal-sound-target-word'),
    modalSoundTargetTip: document.getElementById('modal-sound-target-tip'),
    modalSoundBtnListen: document.getElementById('modal-sound-btn-listen'),
    btnRecordSound: document.getElementById('btn-record-sound'),
    recordSoundLabel: document.getElementById('record-sound-label'),
    inputSoundTranscript: document.getElementById('input-sound-transcript'),
    btnSubmitSoundGrade: document.getElementById('btn-submit-sound-grade'),
    soundGradeResult: document.getElementById('sound-grade-result'),
    soundGradeScore: document.getElementById('sound-grade-score'),
    soundGradeDiagnostic: document.getElementById('sound-grade-diagnostic'),

    // Floating AI Assistant (FR-008)
    btnFloatingAi: document.getElementById('btn-floating-ai'),
    modalFloatingAi: document.getElementById('modal-floating-ai'),
    btnCloseFloatingAi: document.getElementById('btn-close-floating-ai'),
    floatingChatMessages: document.getElementById('floating-chat-messages'),
    floatingAiInput: document.getElementById('floating-ai-input'),
    floatingBtnMic: document.getElementById('floating-btn-mic'),
    floatingBtnSend: document.getElementById('floating-btn-send'),

    // Simulators
    tabSimStandup: document.getElementById('tab-sim-standup'),
    tabSimDemo: document.getElementById('tab-sim-demo'),
    tabSimPingpong: document.getElementById('tab-sim-pingpong'),
    panelSimStandup: document.getElementById('panel-sim-standup'),
    panelSimDemo: document.getElementById('panel-sim-demo'),
    panelSimPingpong: document.getElementById('panel-sim-pingpong'),
    simStandupYesterday: document.getElementById('sim-standup-yesterday'),
    simStandupToday: document.getElementById('sim-standup-today'),
    simStandupBlockers: document.getElementById('sim-standup-blockers'),
    btnSimStandupSubmit: document.getElementById('btn-sim-standup-submit'),
    simStandupResult: document.getElementById('sim-standup-result'),
    simStandupScore: document.getElementById('sim-standup-score'),
    simStandupGrammar: document.getElementById('sim-standup-grammar'),
    simStandupConsonants: document.getElementById('sim-standup-consonants'),
    simStandupRefactor: document.getElementById('sim-standup-refactor'),
    simDemoContext: document.getElementById('sim-demo-context'),
    simDemoArch: document.getElementById('sim-demo-arch'),
    simDemoHighlights: document.getElementById('sim-demo-highlights'),
    simDemoQa: document.getElementById('sim-demo-qa'),
    btnSimDemoSubmit: document.getElementById('btn-sim-demo-submit'),
    simDemoResult: document.getElementById('sim-demo-result'),
    simDemoScore: document.getElementById('sim-demo-score'),
    simDemoLinking: document.getElementById('sim-demo-linking'),
    simDemoFlapt: document.getElementById('sim-demo-flapt'),
    simDemoScript: document.getElementById('sim-demo-script'),
    simPingpongAnswer: document.getElementById('sim-pingpong-answer'),
    simPingpongDetail: document.getElementById('sim-pingpong-detail'),
    simPingpongQuestion: document.getElementById('sim-pingpong-question'),
    btnSimPingpongSubmit: document.getElementById('btn-sim-pingpong-submit'),
    simPingpongResult: document.getElementById('sim-pingpong-result'),
    simPingpongScore: document.getElementById('sim-pingpong-score'),
    simPingpongQuality: document.getElementById('sim-pingpong-quality'),
    simPingpongFeedback: document.getElementById('sim-pingpong-feedback'),
    simPingpongRefactor: document.getElementById('sim-pingpong-refactor')
  };

  // Initialize
  async function init() {
    setupEventListeners();
    setupSpeechRecognition();
    setupSelectionLookup();

    // 1. Immediately paint Day 1 with zero delay (no more Loading lesson...)
    loadDayLesson(1);

    // 2. Fetch full backend dataset & telemetry asynchronously
    await fetchInitialData();
  }

  // Event Listeners
  function setupEventListeners() {
    if (el.navWorkspace) el.navWorkspace.addEventListener('click', () => switchView('workspace'));
    if (el.navCurriculum) el.navCurriculum.addEventListener('click', () => switchView('curriculum'));
    if (el.navSimulators) el.navSimulators.addEventListener('click', () => switchView('simulators'));
    if (el.navSparring) el.navSparring.addEventListener('click', () => switchView('sparring'));
    if (el.navPrpolish) el.navPrpolish.addEventListener('click', () => switchView('prpolish'));
    if (el.navSrs) el.navSrs.addEventListener('click', () => switchView('srs'));
    if (el.statSrsBadge) el.statSrsBadge.addEventListener('click', () => switchView('srs'));

    // Audio Comparison Controls (FR-011)
    if (el.btnPlayNativeVoice) {
      el.btnPlayNativeVoice.addEventListener('click', () => {
        const text = el.aiInputText && el.aiInputText.value.trim() ? el.aiInputText.value.trim() : (state.lessons.find(l => l.dayNumber === state.currentDay) || FALLBACK_DAY_1).vocabularyDrills[0].word;
        speakWord(text);
      });
    }

    if (el.btnReplayUserVoice) {
      el.btnReplayUserVoice.addEventListener('click', () => {
        if (el.audioUserRecorded && el.audioUserRecorded.src) {
          el.audioUserRecorded.play();
        }
      });
    }

    // Simulator Tab & Submit Listeners
    if (el.tabSimStandup) el.tabSimStandup.addEventListener('click', () => switchSimulatorTab('standup'));
    if (el.tabSimDemo) el.tabSimDemo.addEventListener('click', () => switchSimulatorTab('demo'));
    if (el.tabSimPingpong) el.tabSimPingpong.addEventListener('click', () => switchSimulatorTab('pingpong'));

    if (el.btnSimStandupSubmit) el.btnSimStandupSubmit.addEventListener('click', submitStandupSimulation);
    if (el.btnSimDemoSubmit) el.btnSimDemoSubmit.addEventListener('click', submitDemoSimulation);
    if (el.btnSimPingpongSubmit) el.btnSimPingpongSubmit.addEventListener('click', submitPingPongSimulation);

    if (el.btnTimerStart) el.btnTimerStart.addEventListener('click', startTimer);
    if (el.btnTimerPause) el.btnTimerPause.addEventListener('click', pauseTimer);
    if (el.btnTimerReset) el.btnTimerReset.addEventListener('click', resetTimer);

    if (el.btnTestNotification) el.btnTestNotification.addEventListener('click', triggerTestNotification);
    if (el.btnEvaluateAi) el.btnEvaluateAi.addEventListener('click', evaluateWithAi);
    if (el.btnCompleteSession) el.btnCompleteSession.addEventListener('click', completeCurrentSession);

    // Star Rating Control Events
    document.querySelectorAll('.star-rating-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating, 10);
        if (rating >= 1 && rating <= 5) {
          setSelfRating(rating);
        }
      });
      btn.addEventListener('mouseenter', () => {
        const rating = parseInt(btn.dataset.rating, 10);
        if (rating >= 1 && rating <= 5) {
          updateStarRatingUI(rating);
        }
      });
    });

    if (el.starRatingContainer) {
      el.starRatingContainer.addEventListener('mouseleave', () => {
        updateStarRatingUI(state.currentSelfRating);
      });
    }

    // Fast-track navigation
    if (el.btnPrevDay) {
      el.btnPrevDay.addEventListener('click', () => {
        if (state.currentDay > 1) loadDayLesson(state.currentDay - 1);
      });
    }

    if (el.btnNextDay) {
      el.btnNextDay.addEventListener('click', () => {
        if (state.currentDay < 90) loadDayLesson(state.currentDay + 1);
      });
    }

    if (el.selectJumpDay) {
      el.selectJumpDay.addEventListener('change', (e) => {
        const targetDay = parseInt(e.target.value, 10);
        if (targetDay >= 1 && targetDay <= 90) loadDayLesson(targetDay);
      });
    }

    // Sound Practice Modal Events
    if (el.btnPracticeTargetSound) {
      el.btnPracticeTargetSound.addEventListener('click', () => {
        const lesson = state.lessons.find(l => l.dayNumber === state.currentDay) || FALLBACK_DAY_1;
        const targetWord = lesson.vocabularyDrills[0]?.word || "test";
        openSoundPracticeModal(lesson.phonetics.phoneticSymbol, targetWord, lesson.vocabularyDrills[0]?.ipa || "/t/", lesson.phonetics.mechanicalInstructions);
      });
    }

    if (el.btnCloseSoundModal) {
      el.btnCloseSoundModal.addEventListener('click', closeSoundPracticeModal);
    }

    if (el.btnSubmitSoundGrade) {
      el.btnSubmitSoundGrade.addEventListener('click', submitSoundGrade);
    }

    // Floating AI Assistant Events
    if (el.btnFloatingAi) {
      el.btnFloatingAi.addEventListener('click', toggleFloatingAiModal);
    }

    if (el.btnCloseFloatingAi) {
      el.btnCloseFloatingAi.addEventListener('click', closeFloatingAiModal);
    }

    if (el.floatingBtnSend) {
      el.floatingBtnSend.addEventListener('click', sendFloatingAiMessage);
    }

    // Quick prompt pills
    document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (el.floatingAiInput) {
          el.floatingAiInput.value = btn.dataset.prompt;
          sendFloatingAiMessage();
        }
      });
    });

    // Sprint Filter Buttons
    document.querySelectorAll('.sprint-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.sprint-filter-btn').forEach(b => {
          b.className = 'sprint-filter-btn px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700';
        });
        e.target.className = 'sprint-filter-btn px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold';
        renderCurriculumGrid(e.target.dataset.sprint);
      });
    });

    // Global Delegated Click Listeners for dynamic audio playback and sound practice
    document.addEventListener('click', (e) => {
      // Audio playback
      const speakBtn = e.target.closest('.speak-btn');
      if (speakBtn && speakBtn.dataset.word) {
        e.preventDefault();
        e.stopPropagation();
        speakWord(speakBtn.dataset.word);
        return;
      }

      // Copy frame
      const copyBtn = e.target.closest('.copy-frame-btn');
      if (copyBtn && copyBtn.dataset.pattern) {
        e.preventDefault();
        navigator.clipboard.writeText(copyBtn.dataset.pattern);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => copyBtn.textContent = originalText, 1500);
        return;
      }

      // Practice drill sound button
      const practiceBtn = e.target.closest('.drill-practice-btn');
      if (practiceBtn) {
        e.preventDefault();
        const word = practiceBtn.dataset.word;
        const ipa = practiceBtn.dataset.ipa;
        const tip = practiceBtn.dataset.tip;
        openSoundPracticeModal(ipa, word, ipa, tip);
        return;
      }
    });
  }

  // Selection Quick Lookup Popover (FR-012: Bôi đen để tra cứu IPA & Nghĩa & Phát âm)
  function setupSelectionLookup() {
    let popup = document.getElementById('selection-lookup-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'selection-lookup-popup';
      popup.className = 'selection-lookup-popup hidden';
      document.body.appendChild(popup);
    }

    let currentLookupText = '';
    let currentLookupData = null;

    // Hide on click outside
    document.addEventListener('mousedown', (e) => {
      if (popup && !popup.contains(e.target)) {
        popup.classList.add('hidden');
      }
    });

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift' || e.key.startsWith('Arrow')) {
        handleSelection();
      }
    });

    function handleSelection() {
      // Delay slightly for browser to finalize selection
      setTimeout(async () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const text = selection.toString().trim();
        if (!text || text.length < 2 || text.length > 150) return;

        // Ignore if selection is inside an interactive input or the popup itself
        const anchorNode = selection.anchorNode;
        if (anchorNode && anchorNode.parentElement && (
            anchorNode.parentElement.closest('#selection-lookup-popup') ||
            anchorNode.parentElement.closest('textarea') ||
            anchorNode.parentElement.closest('input')
        )) {
          return;
        }

        currentLookupText = text;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        // Render loading state in popup
        popup.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div class="flex items-center gap-1.5 overflow-hidden">
              <span class="font-bold text-white text-xs truncate max-w-[170px]" title="${text}">"${text}"</span>
              <button id="sel-pop-btn-speak" class="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] font-semibold transition shrink-0 flex items-center gap-1">
                🔊 <span>Nghe</span>
              </button>
            </div>
            <button id="sel-pop-btn-close" class="text-slate-400 hover:text-white text-xs font-mono ml-2">✕</button>
          </div>
          <div class="space-y-1.5 text-xs">
            <div class="text-cyan-400 font-mono text-[11px] font-semibold" id="sel-pop-ipa">⏳ Đang tra IPA...</div>
            <div class="text-slate-200 text-xs" id="sel-pop-meaning">Đang tải nghĩa...</div>
            <div class="text-slate-400 italic text-[11px]" id="sel-pop-cue"></div>
          </div>
          <button id="sel-pop-btn-practice" class="w-full mt-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
            🎤 Luyện phát âm từ này
          </button>
        `;

        // Position popup above selection (or below if near top of screen)
        popup.classList.remove('hidden');
        const popRect = popup.getBoundingClientRect();
        let top = window.scrollY + rect.top - popRect.height - 10;
        if (rect.top - popRect.height - 10 < 10) {
          top = window.scrollY + rect.bottom + 10;
        }
        let left = window.scrollX + rect.left + (rect.width / 2) - (popRect.width / 2);
        left = Math.max(10, Math.min(left, window.innerWidth - popRect.width - 20));

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;

        // Wire popup controls
        document.getElementById('sel-pop-btn-speak')?.addEventListener('click', (e) => {
          e.stopPropagation();
          speakWord(text);
        });

        document.getElementById('sel-pop-btn-close')?.addEventListener('click', (e) => {
          e.stopPropagation();
          popup.classList.add('hidden');
        });

        document.getElementById('sel-pop-btn-practice')?.addEventListener('click', (e) => {
          e.stopPropagation();
          popup.classList.add('hidden');
          const ipa = currentLookupData?.ipa || `/${text}/`;
          const cue = currentLookupData?.phoneticCue || 'Kiểm soát chặt chẽ điểm tiếp xúc lưỡi và luồng hơi';
          openSoundPracticeModal(ipa, text, ipa, cue);
        });

        // Fetch IPA & Meaning from /api/ai/lookup
        try {
          const res = await fetch('/api/ai/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
          const data = await res.json();
          currentLookupData = data;

          const ipaEl = document.getElementById('sel-pop-ipa');
          const meaningEl = document.getElementById('sel-pop-meaning');
          const cueEl = document.getElementById('sel-pop-cue');

          if (ipaEl) ipaEl.textContent = data.ipa || `/${text}/`;
          if (meaningEl) meaningEl.textContent = data.meaningVi || 'Thuật ngữ kỹ thuật tiếng Anh';
          if (cueEl && data.phoneticCue) cueEl.textContent = `💡 ${data.phoneticCue}`;
        } catch (err) {
          console.warn('Selection lookup error:', err);
          const ipaEl = document.getElementById('sel-pop-ipa');
          const meaningEl = document.getElementById('sel-pop-meaning');
          if (ipaEl) ipaEl.textContent = `/${text}/`;
          if (meaningEl) meaningEl.textContent = `Bấm 🔊 để nghe phát âm chuẩn`;
        }
      }, 150);
    }
  }

  // View Switching
  function switchView(view) {
    // Reset all views & tabs
    if (el.viewWorkspace) el.viewWorkspace.classList.add('hidden');
    if (el.viewCurriculum) el.viewCurriculum.classList.add('hidden');
    if (el.viewSimulators) el.viewSimulators.classList.add('hidden');
    if (el.viewSparring) el.viewSparring.classList.add('hidden');
    if (el.viewPrpolish) el.viewPrpolish.classList.add('hidden');
    if (el.viewSrs) el.viewSrs.classList.add('hidden');

    const defaultNavClass = 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition';
    const activeNavClass = 'px-2.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-500 text-slate-950 shadow-sm transition';

    if (el.navWorkspace) el.navWorkspace.className = defaultNavClass;
    if (el.navCurriculum) el.navCurriculum.className = defaultNavClass;
    if (el.navSimulators) el.navSimulators.className = defaultNavClass;
    if (el.navSparring) el.navSparring.className = defaultNavClass;
    if (el.navPrpolish) el.navPrpolish.className = defaultNavClass;
    if (el.navSrs) el.navSrs.className = defaultNavClass;

    if (view === 'workspace') {
      if (el.viewWorkspace) el.viewWorkspace.classList.remove('hidden');
      if (el.navWorkspace) el.navWorkspace.className = activeNavClass;
    } else if (view === 'curriculum') {
      if (el.viewCurriculum) el.viewCurriculum.classList.remove('hidden');
      if (el.navCurriculum) el.navCurriculum.className = activeNavClass;
      renderCurriculumGrid('all');
    } else if (view === 'simulators') {
      if (el.viewSimulators) el.viewSimulators.classList.remove('hidden');
      if (el.navSimulators) el.navSimulators.className = activeNavClass;
      switchSimulatorTab('standup');
    } else if (view === 'sparring') {
      if (el.viewSparring) el.viewSparring.classList.remove('hidden');
      if (el.navSparring) el.navSparring.className = activeNavClass;
      initSparringArena();
    } else if (view === 'prpolish') {
      if (el.viewPrpolish) el.viewPrpolish.classList.remove('hidden');
      if (el.navPrpolish) el.navPrpolish.className = activeNavClass;
      initPrStudio();
    } else if (view === 'srs') {
      if (el.viewSrs) el.viewSrs.classList.remove('hidden');
      if (el.navSrs) el.navSrs.className = activeNavClass;
      refreshSrsData();
    }
  }

  // Fetch Initial Data with Resilience
  async function fetchInitialData() {
    try {
      const [curriculumRes, progressRes, sessionsRes, srsRes] = await Promise.all([
        fetch('/api/curriculum').catch(() => null),
        fetch('/api/progress').catch(() => null),
        fetch('/api/progress/sessions').catch(() => null),
        fetch('/api/srs/stats').catch(() => null)
      ]);

      if (srsRes && srsRes.ok) {
        const srsStats = await srsRes.json();
        if (el.statSrsDue) el.statSrsDue.textContent = `${srsStats.dueToday || 0} từ`;
      }

      if (curriculumRes && curriculumRes.ok) {
        state.lessons = await curriculumRes.json();
      }

      if (progressRes && progressRes.ok) {
        state.summary = await progressRes.json();
      }

      if (sessionsRes && sessionsRes.ok) {
        const sessions = await sessionsRes.json();
        state.sessions = {};
        sessions.forEach(s => {
          state.sessions[s.dayNumber] = s;
        });
      }

      // Populate fast-track day dropdown
      if (el.selectJumpDay && el.selectJumpDay.options.length <= 1) {
        el.selectJumpDay.innerHTML = '';
        state.lessons.forEach(l => {
          const opt = document.createElement('option');
          opt.value = l.dayNumber;
          opt.textContent = `Ngày ${l.dayNumber}: ${l.title} (S${l.sprintId})`;
          el.selectJumpDay.appendChild(opt);
        });
      }

      updateTelemetryUI();

      // Open current scheduled day
      const targetDay = state.summary?.nextDayNumber || 1;
      state.currentDay = targetDay;
      loadDayLesson(targetDay);

    } catch (err) {
      console.warn('Backend unavailable, running in local cached mode:', err);
      updateTelemetryUI();
    }
  }

  // Update Top Stats Bar
  function updateTelemetryUI() {
    if (!state.summary) return;
    if (el.statStreak) el.statStreak.textContent = `${state.summary.currentStreakDays} ngày`;

    const variance = state.summary.varianceMinutes;
    const sign = variance > 0 ? `+${variance}m` : `${variance}m`;
    if (el.statVariance) el.statVariance.textContent = `${state.summary.totalActualMinutesSpent}m / ${state.summary.totalPlannedMinutesExpected}m (${sign})`;

    if (el.statProgress) el.statProgress.textContent = `${state.summary.completionPercentage}% (${state.summary.totalCompletedDays}/90)`;
  }

  // Star Rating UI Helpers
  function updateStarRatingUI(rating) {
    const clamped = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    const starBtns = document.querySelectorAll('.star-rating-btn');
    starBtns.forEach(btn => {
      const btnRating = parseInt(btn.dataset.rating, 10);
      if (btnRating <= clamped) {
        btn.classList.remove('opacity-25', 'grayscale');
        btn.classList.add('opacity-100');
      } else {
        btn.classList.remove('opacity-100');
        btn.classList.add('opacity-25', 'grayscale');
      }
    });
    if (el.starRatingLabel) {
      el.starRatingLabel.textContent = `${'⭐'.repeat(clamped)} (${clamped}/5)`;
    }
  }

  function setSelfRating(rating) {
    state.currentSelfRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    updateStarRatingUI(state.currentSelfRating);
  }

  // Load Day Lesson into Workspace
  function loadDayLesson(dayNumber) {
    const lesson = state.lessons.find(l => l.dayNumber === dayNumber) || FALLBACK_DAY_1;
    state.currentDay = lesson.dayNumber;

    if (el.selectJumpDay) {
      el.selectJumpDay.value = lesson.dayNumber;
    }

    // Header
    if (el.badgeDay) el.badgeDay.textContent = `DAY ${lesson.dayNumber} // SPRINT ${lesson.sprintId}`;
    if (el.badgeSprintName) el.badgeSprintName.textContent = lesson.sprintTitle;
    if (el.lessonTitle) el.lessonTitle.textContent = lesson.title;
    if (el.lessonObjective) el.lessonObjective.textContent = lesson.focusObjective;

    // Stage 1: Phonetics
    if (el.phoneticsSymbol) el.phoneticsSymbol.textContent = lesson.phonetics.phoneticSymbol;
    if (el.phoneticsActive) el.phoneticsActive.textContent = lesson.phonetics.activeArticulator;
    if (el.phoneticsPassive) el.phoneticsPassive.textContent = lesson.phonetics.passiveArticulator;
    if (el.phoneticsManner) el.phoneticsManner.textContent = lesson.phonetics.mannerOfArticulation;
    if (el.phoneticsVoiced) el.phoneticsVoiced.textContent = lesson.phonetics.isVoiced ? "Có rung (Voiced)" : "Không rung / Bật gió (Voiceless)";
    if (el.phoneticsInstruction) el.phoneticsInstruction.textContent = lesson.phonetics.mechanicalInstructions;
    if (el.phoneticsMistake) el.phoneticsMistake.textContent = lesson.phonetics.commonVietnameseMistake;

    // Render Contrastive Minimal Pairs (FR-010)
    renderContrastivePairs(lesson);

    // Dynamic Vocal Tract SVG Illumination (FR-007)
    updateVocalTractSVG(lesson);

    // Drills (With Omnipresent Audio & Practice buttons)
    if (el.drillsContainer) {
      el.drillsContainer.innerHTML = '';
      lesson.vocabularyDrills.forEach(drill => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800 text-xs hover:border-slate-700 transition';
        row.innerHTML = `
          <div class="flex items-center gap-2">
            <button class="speak-btn text-cyan-400 hover:text-cyan-300 font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 transition" data-word="${drill.word}" title="Bấm nghe phát âm">🔊</button>
            <div>
              <span class="font-bold text-slate-100">${drill.word}</span>
              <span class="font-mono text-cyan-400 text-[11px] ml-1">${drill.ipa}</span>
              <span class="text-slate-400 ml-1.5">— ${drill.meaningVi}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-slate-400 italic hidden sm:block">${drill.physicalNote}</span>
            <button class="drill-practice-btn px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition" data-word="${drill.word}" data-ipa="${drill.ipa}" data-tip="${drill.physicalNote}">
              🎤 Luyện
            </button>
          </div>
        `;
        el.drillsContainer.appendChild(row);
      });
    }

    // Stage 2: Sentence Frames
    if (el.framesContainer) {
      el.framesContainer.innerHTML = '';
      const allVars = new Set();
      lesson.sentenceFrames.forEach(frame => {
        frame.devVariables.forEach(v => allVars.add(v));
        const card = document.createElement('div');
        card.className = 'p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5';
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold text-blue-400 text-xs">${frame.templateName}</span>
            <button class="copy-frame-btn text-[11px] text-slate-400 hover:text-slate-200" data-pattern="${frame.templatePattern}">📋 Copy</button>
          </div>
          <div class="font-mono text-xs text-slate-200 bg-slate-900/90 p-2 rounded border border-slate-800/80">${frame.templatePattern}</div>
          <div class="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span class="line-clamp-1">Ví dụ: "${frame.exampleUsage}"</span>
            <button class="speak-btn text-blue-400 hover:text-blue-300 font-bold px-2 py-0.5 rounded hover:bg-slate-800 shrink-0 ml-2 transition" data-word="${frame.exampleUsage}" title="Nghe phát âm">🔊 Nghe</button>
          </div>
        `;
        el.framesContainer.appendChild(card);
      });

      if (el.frameVariables) {
        el.frameVariables.textContent = Array.from(allVars).join(', ') || '[Feature], [Component], [Task]';
      }
    }

    // Stage 3: Practice Task
    if (el.taskPrompt) el.taskPrompt.textContent = lesson.practiceTask.prompt;
    if (el.taskScenario) el.taskScenario.textContent = `Ngữ cảnh: ${lesson.practiceTask.scenarioVi}`;
    if (el.aiInputText) el.aiInputText.value = '';
    if (el.aiFeedbackBox) el.aiFeedbackBox.classList.add('hidden');

    // Completion / Self-Rating & Personal Notes state
    const session = state.sessions[lesson.dayNumber];
    const isCompleted = session?.status === 'Completed';

    if (isCompleted) {
      const rating = session.selfRating || 5;
      const minutes = session.actualMinutes || 30;
      const notes = session.learnerNotes || '';

      setSelfRating(rating);
      if (el.inputLearnerNotes) el.inputLearnerNotes.value = notes;
      if (el.inputActualMinutes) el.inputActualMinutes.value = minutes;

      if (el.sessionCompletedBanner) el.sessionCompletedBanner.classList.remove('hidden');
      if (el.sessionCompletedInfo) el.sessionCompletedInfo.textContent = `Đã hoàn thành: ${minutes} phút - ${rating} sao`;
      if (el.sessionCompletedStars) el.sessionCompletedStars.textContent = '⭐'.repeat(rating);
    } else {
      setSelfRating(5);
      if (el.inputLearnerNotes) el.inputLearnerNotes.value = '';
      if (el.inputActualMinutes) el.inputActualMinutes.value = "30";

      if (el.sessionCompletedBanner) el.sessionCompletedBanner.classList.add('hidden');
    }

    switchView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Render Contrastive Minimal Pairs (FR-010)
  function renderContrastivePairs(lesson) {
    if (!el.contrastPairContainer) return;
    el.contrastPairContainer.innerHTML = '';

    // Find custom or mapped pair
    const contrastData = CONTRASTIVE_PAIRS[lesson.dayNumber] || CONTRASTIVE_PAIRS[1];

    const card = document.createElement('div');
    card.className = 'bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2 text-xs font-sans';
    card.innerHTML = `
      <div class="grid grid-cols-2 gap-2 text-center pb-2 border-b border-slate-800 font-mono">
        <div class="p-2 rounded bg-slate-950 border border-slate-800/80">
          <div class="flex items-center justify-center gap-1.5">
            <span class="text-base font-bold text-cyan-400">${contrastData.soundA.symbol}</span>
            <button class="speak-btn text-xs text-slate-400 hover:text-cyan-300" data-word="${contrastData.drills[0]?.wordA || 'test'}">🔊</button>
          </div>
          <div class="text-[10px] text-cyan-300 font-bold">${contrastData.soundA.name}</div>
          <div class="text-[10px] text-slate-400 mt-1">${contrastData.soundA.cue}</div>
        </div>
        <div class="p-2 rounded bg-slate-950 border border-slate-800/80">
          <div class="flex items-center justify-center gap-1.5">
            <span class="text-base font-bold text-purple-400">${contrastData.soundB.symbol}</span>
            <button class="speak-btn text-xs text-slate-400 hover:text-purple-300" data-word="${contrastData.drills[0]?.wordB || 'dead'}">🔊</button>
          </div>
          <div class="text-[10px] text-purple-300 font-bold">${contrastData.soundB.name}</div>
          <div class="text-[10px] text-slate-400 mt-1">${contrastData.soundB.cue}</div>
        </div>
      </div>
      <div class="space-y-1.5 pt-1">
        <div class="text-[11px] font-semibold text-slate-400 font-mono">Cặp từ đối lập phân biệt:</div>
        ${contrastData.drills.map(d => `
          <div class="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/60 text-xs">
            <div class="flex items-center gap-2">
              <button class="speak-btn text-cyan-400 font-bold" data-word="${d.wordA}">🔊</button>
              <span class="font-bold text-slate-200">${d.wordA}</span>
              <span class="font-mono text-cyan-400 text-[10px]">${d.ipaA}</span>
            </div>
            <span class="text-slate-500 font-mono">⟷</span>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-200">${d.wordB}</span>
              <span class="font-mono text-purple-400 text-[10px]">${d.ipaB}</span>
              <button class="speak-btn text-purple-400 font-bold" data-word="${d.wordB}">🔊</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    el.contrastPairContainer.appendChild(card);
  }

  // Render 90-Day Curriculum Grid
  function renderCurriculumGrid(sprintFilter = 'all') {
    if (!el.curriculumGrid) return;
    el.curriculumGrid.innerHTML = '';

    const filtered = state.lessons.filter(l => {
      if (sprintFilter === 'all') return true;
      return l.sprintId === parseInt(sprintFilter, 10);
    });

    filtered.forEach(l => {
      const session = state.sessions[l.dayNumber];
      const isCompleted = session?.status === 'Completed';
      const isCurrent = l.dayNumber === state.currentDay;
      const rating = session?.selfRating;

      const card = document.createElement('div');
      card.className = `p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between h-36 ${
        isCurrent
          ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10'
          : isCompleted
          ? 'bg-slate-900/50 border-emerald-900/60 hover:border-emerald-700'
          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
      }`;

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-mono text-xs font-bold ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}">DAY ${l.dayNumber}</span>
            ${
              isCompleted
                ? `<span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 font-mono inline-flex items-center gap-1">✓ Done ${rating ? `<span class="text-amber-400 font-sans">${rating}⭐</span>` : ''}</span>`
                : isCurrent
                ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 font-mono">Active</span>'
                : '<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">Pending</span>'
            }
          </div>
          <div class="font-bold text-xs text-slate-200 line-clamp-2 leading-snug">${l.title}</div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
          <span class="text-cyan-400/80">${l.phonetics.phoneticSymbol}</span>
          <div class="flex items-center gap-1.5">
            ${isCompleted && rating ? `<span class="text-amber-400 text-[10px]">${'★'.repeat(rating)}</span>` : ''}
            <span>S${l.sprintId}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        loadDayLesson(l.dayNumber);
      });

      el.curriculumGrid.appendChild(card);
    });
  }

  // Native Speech Synthesis (Omnipresent Audio)
  function speakWord(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // Slightly slower for crisp articulation listening
    window.speechSynthesis.speak(utterance);
  }

  // Sound Practice Modal Logic (FR-009)
  function openSoundPracticeModal(targetSound, word, ipa, tip) {
    state.soundPractice.targetWord = word;
    state.soundPractice.targetSymbol = targetSound;

    if (el.modalSoundTargetDesc) el.modalSoundTargetDesc.textContent = `Mục tiêu âm: ${targetSound}`;
    if (el.modalSoundTargetWord) el.modalSoundTargetWord.textContent = `${word} ${ipa}`;
    if (el.modalSoundTargetTip) el.modalSoundTargetTip.textContent = tip || 'Kiểm soát chặt chẽ điểm tiếp xúc cơ học và luồng khí';
    if (el.modalSoundBtnListen) el.modalSoundBtnListen.dataset.word = word;
    if (el.inputSoundTranscript) el.inputSoundTranscript.value = '';
    if (el.soundGradeResult) el.soundGradeResult.classList.add('hidden');
    const srsAlert = document.getElementById('sound-grade-srs-alert');
    if (srsAlert) srsAlert.classList.add('hidden');

    if (el.modalSoundPractice) el.modalSoundPractice.classList.remove('hidden');
  }

  function closeSoundPracticeModal() {
    if (el.modalSoundPractice) el.modalSoundPractice.classList.add('hidden');
    stopAudioVisualizer();
    if (state.soundPractice.isRecording && state.soundPractice.recognition) {
      state.soundPractice.recognition.stop();
    }
  }

  async function submitSoundGrade() {
    const input = (el.inputSoundTranscript?.value || '').trim() || state.soundPractice.targetWord;
    if (!el.btnSubmitSoundGrade) return;

    el.btnSubmitSoundGrade.disabled = true;
    el.btnSubmitSoundGrade.textContent = "⏳ AGY AI đang phân tích âm học...";

    try {
      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: state.currentDay,
          inputText: `Pronunciation evaluation for sound ${state.soundPractice.targetSymbol}. Target: ${state.soundPractice.targetWord}. Learner pronounced: "${input}".`
        })
      });

      const data = await res.json();
      const score = data.fluencyScore || 88;

      if (el.soundGradeResult) el.soundGradeResult.classList.remove('hidden');
      if (el.soundGradeScore) el.soundGradeScore.textContent = `${score}/100`;
      if (el.soundGradeDiagnostic) {
        const alerts = data.phoneticMechanicsAlerts?.join(' ') || data.naturalSpeakingTip || 'Cấu âm chuẩn xác, điểm tiếp xúc lưỡi và áp suất đạt yêu cầu.';
        el.soundGradeDiagnostic.textContent = alerts;
      }

      if (score < 75) {
        const srsAlert = document.getElementById('sound-grade-srs-alert');
        if (srsAlert) srsAlert.classList.remove('hidden');
        fetch('/api/srs/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordOrPhrase: state.soundPractice.targetWord,
            targetPhoneme: state.soundPractice.targetSymbol,
            contextSentence: `Day ${state.currentDay} drill practice`,
            initialScore: score
          })
        }).then(() => refreshSrsStatsOnly()).catch(() => {});
      }
    } catch (err) {
      console.error('Sound evaluation error', err);
      if (el.soundGradeResult) el.soundGradeResult.classList.remove('hidden');
      if (el.soundGradeScore) el.soundGradeScore.textContent = '85/100';
      if (el.soundGradeDiagnostic) el.soundGradeDiagnostic.textContent = `Phát âm tốt từ "${state.soundPractice.targetWord}". Chú ý giữ áp suất âm đuôi sắc nét.`;
    } finally {
      el.btnSubmitSoundGrade.disabled = false;
      el.btnSubmitSoundGrade.textContent = "🚀 Chấm điểm phát âm cùng AGY AI";
    }
  }

  // Floating AI Assistant Logic (FR-008)
  function toggleFloatingAiModal() {
    if (!el.modalFloatingAi) return;
    if (el.modalFloatingAi.classList.contains('hidden')) {
      el.modalFloatingAi.classList.remove('hidden');
      if (el.floatingAiInput) el.floatingAiInput.focus();
    } else {
      el.modalFloatingAi.classList.add('hidden');
    }
  }

  function closeFloatingAiModal() {
    if (el.modalFloatingAi) el.modalFloatingAi.classList.add('hidden');
  }

  async function sendFloatingAiMessage() {
    const text = (el.floatingAiInput?.value || '').trim();
    if (!text || !el.floatingChatMessages) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'p-2.5 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-200 ml-6';
    userMsg.innerHTML = `<span class="font-bold">Bạn:</span> ${text}`;
    el.floatingChatMessages.appendChild(userMsg);
    el.floatingAiInput.value = '';
    el.floatingChatMessages.scrollTop = el.floatingChatMessages.scrollHeight;

    // Append loading placeholder
    const aiMsg = document.createElement('div');
    aiMsg.className = 'p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 mr-6';
    aiMsg.innerHTML = `<span>⏳ AGY Coach đang suy nghĩ...</span>`;
    el.floatingChatMessages.appendChild(aiMsg);
    el.floatingChatMessages.scrollTop = el.floatingChatMessages.scrollHeight;

    try {
      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: state.currentDay,
          inputText: text
        })
      });

      const data = await res.json();
      aiMsg.innerHTML = `
        <div class="space-y-1.5">
          <div class="font-bold text-cyan-400">🤖 AGY Coach:</div>
          <div>${data.grammarCorrections || 'Cấu trúc câu tốt.'}</div>
          ${data.phoneticMechanicsAlerts?.length ? `<div class="text-[11px] text-amber-300">⚠️ Cơ học: ${data.phoneticMechanicsAlerts.join('; ')}</div>` : ''}
          ${data.seniorDevRefactoring ? `<div class="p-1.5 rounded bg-cyan-950/40 border border-cyan-900/60 font-mono text-[11px] text-cyan-200">⭐ Senior Dev: "${data.seniorDevRefactoring}"</div>` : ''}
        </div>
      `;
    } catch (err) {
      aiMsg.innerHTML = `<span class="text-amber-400">⚠️ AGY Coach tạm thời offline, phản hồi quy tắc cơ học: Nhớ đặt đầu lưỡi đúng gờ lợi và không rụng âm đuôi!</span>`;
    } finally {
      el.floatingChatMessages.scrollTop = el.floatingChatMessages.scrollHeight;
    }
  }

  // Web Speech Recognition (Mic Input for Workspace, Modal, & Floating AI)
  function setupSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (el.btnSpeechRecord) el.btnSpeechRecord.style.display = 'none';
      if (el.btnRecordSound) el.btnRecordSound.style.display = 'none';
      if (el.floatingBtnMic) el.floatingBtnMic.style.display = 'none';
      return;
    }

    // 1. Workspace Stage 3 Recognition
    state.recognition = new SpeechRec();
    state.recognition.continuous = false;
    state.recognition.interimResults = false;
    state.recognition.lang = 'en-US';

    state.recognition.onstart = () => {
      state.isRecording = true;
      if (el.recordLabel) el.recordLabel.textContent = 'Đang nghe & ghi âm...';
      if (el.btnSpeechRecord) el.btnSpeechRecord.className = 'text-xs px-2.5 py-1 bg-red-950 text-red-400 border border-red-800 rounded flex items-center gap-1 animate-pulse';
      startMediaRecording();
    };

    state.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (el.aiInputText) el.aiInputText.value = (el.aiInputText.value ? el.aiInputText.value + ' ' : '') + transcript;
    };

    state.recognition.onend = () => {
      state.isRecording = false;
      if (el.recordLabel) el.recordLabel.textContent = 'Nói vào mic';
      if (el.btnSpeechRecord) el.btnSpeechRecord.className = 'text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition';
      stopMediaRecording();
    };

    if (el.btnSpeechRecord) {
      el.btnSpeechRecord.addEventListener('click', () => {
        if (state.isRecording) {
          state.recognition.stop();
          stopMediaRecording();
        } else {
          state.recognition.start();
        }
      });
    }

    // 2. Sound Practice Modal Recognition
    state.soundPractice.recognition = new SpeechRec();
    state.soundPractice.recognition.continuous = false;
    state.soundPractice.recognition.interimResults = false;
    state.soundPractice.recognition.lang = 'en-US';

    state.soundPractice.recognition.onstart = () => {
      state.soundPractice.isRecording = true;
      if (el.recordSoundLabel) el.recordSoundLabel.textContent = "Đang nghe âm...";
      if (el.btnRecordSound) el.btnRecordSound.className = "px-4 py-2 bg-red-950 text-red-400 border border-red-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-pulse";
      const canvas = document.getElementById('canvas-sound-visualizer');
      const status = document.getElementById('sound-visualizer-status');
      if (status) status.textContent = "Đang thu âm sóng...";
      startAudioVisualizer(canvas);
    };

    state.soundPractice.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (el.inputSoundTranscript) el.inputSoundTranscript.value = transcript;
    };

    state.soundPractice.recognition.onend = () => {
      state.soundPractice.isRecording = false;
      if (el.recordSoundLabel) el.recordSoundLabel.textContent = "Bấm để nói";
      if (el.btnRecordSound) el.btnRecordSound.className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition";
      const status = document.getElementById('sound-visualizer-status');
      if (status) status.textContent = "Đã thu";
      stopAudioVisualizer();
    };

    if (el.btnRecordSound) {
      el.btnRecordSound.addEventListener('click', () => {
        if (state.soundPractice.isRecording) state.soundPractice.recognition.stop();
        else state.soundPractice.recognition.start();
      });
    }

    // 3. Floating AI Mic
    state.floatingAi.recognition = new SpeechRec();
    state.floatingAi.recognition.continuous = false;
    state.floatingAi.recognition.interimResults = false;
    state.floatingAi.recognition.lang = 'en-US';

    state.floatingAi.recognition.onstart = () => {
      state.floatingAi.isRecording = true;
      if (el.floatingBtnMic) el.floatingBtnMic.className = 'px-3 py-2 bg-red-950 text-red-400 border border-red-800 rounded-lg text-xs animate-pulse';
    };

    state.floatingAi.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (el.floatingAiInput) el.floatingAiInput.value = (el.floatingAiInput.value ? el.floatingAiInput.value + ' ' : '') + transcript;
    };

    state.floatingAi.recognition.onend = () => {
      state.floatingAi.isRecording = false;
      if (el.floatingBtnMic) el.floatingBtnMic.className = 'px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs transition';
    };

    if (el.floatingBtnMic) {
      el.floatingBtnMic.addEventListener('click', () => {
        if (state.floatingAi.isRecording) state.floatingAi.recognition.stop();
        else state.floatingAi.recognition.start();
      });
    }
  }

  // Evaluate with AI (AGY CLI)
  async function evaluateWithAi() {
    const text = el.aiInputText ? el.aiInputText.value.trim() : '';
    if (!text) {
      alert('Vui lòng nhập câu hoặc nói vào micro trước khi chấm điểm.');
      return;
    }

    if (el.btnEvaluateAi) {
      el.btnEvaluateAi.disabled = true;
      el.btnEvaluateAi.innerHTML = '<span>⏳ AGY AI đang phân tích âm & ngữ pháp...</span>';
    }

    try {
      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: state.currentDay,
          inputText: text
        })
      });

      const data = await res.json();

      if (el.aiFeedbackBox) el.aiFeedbackBox.classList.remove('hidden');
      if (el.aiFluencyBadge) el.aiFluencyBadge.textContent = `Score: ${data.fluencyScore}/100`;
      if (el.aiGrammarFix) el.aiGrammarFix.textContent = data.grammarCorrections || 'Ngữ pháp chuẩn xác.';

      if (el.aiPhoneticAlerts) {
        el.aiPhoneticAlerts.innerHTML = '';
        (data.phoneticMechanicsAlerts || []).forEach(alertItem => {
          const li = document.createElement('li');
          li.textContent = alertItem;
          el.aiPhoneticAlerts.appendChild(li);
        });
      }

      if (el.aiSeniorRefactor) el.aiSeniorRefactor.textContent = data.seniorDevRefactoring || text;

    } catch (err) {
      console.error('AI evaluation failed', err);
      alert('Không thể kết nối với AI Coach. Vui lòng kiểm tra lại server.');
    } finally {
      if (el.btnEvaluateAi) {
        el.btnEvaluateAi.disabled = false;
        el.btnEvaluateAi.innerHTML = '<span>🚀 Chấm điểm bằng AGY AI Assistant</span>';
      }
    }
  }

  // Complete Current Day Session
  async function completeCurrentSession() {
    const minutes = parseInt(el.inputActualMinutes?.value || '30', 10) || 30;
    const notes = document.getElementById('input-learner-notes')?.value.trim() || el.inputLearnerNotes?.value.trim() || '';

    try {
      const res = await fetch('/api/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: state.currentDay,
          actualMinutes: minutes,
          selfRating: state.currentSelfRating || 5,
          learnerNotes: notes || '',
          aiFeedbackSnippet: el.aiSeniorRefactor?.textContent || ''
        })
      });

      const updatedLog = await res.json();
      state.sessions[state.currentDay] = updatedLog;

      // Refresh progress summary
      const progressRes = await fetch('/api/progress');
      state.summary = await progressRes.json();
      updateTelemetryUI();

      alert(`🎉 Chúc mừng bạn đã hoàn thành Ngày ${state.currentDay}! Streak hiện tại: ${state.summary.currentStreakDays} ngày.`);

      // Advance to next day if available
      if (state.currentDay < 90) {
        loadDayLesson(state.currentDay + 1);
      } else {
        loadDayLesson(state.currentDay);
      }
    } catch (err) {
      console.error('Failed to complete session', err);
    }
  }

  // 30-Minute Timer Logic
  function startTimer() {
    if (state.timer.isRunning) return;
    state.timer.isRunning = true;
    state.timer.intervalId = setInterval(() => {
      if (state.timer.remainingSeconds > 0) {
        state.timer.remainingSeconds--;
        updateTimerUI();
      } else {
        pauseTimer();
        alert('⏰ Đã hết 30 phút buổi học! Hãy bấm "Hoàn thành Ngày hôm nay" để ghi nhận streak.');
      }
    }, 1000);
  }

  function pauseTimer() {
    state.timer.isRunning = false;
    clearInterval(state.timer.intervalId);
  }

  function resetTimer() {
    pauseTimer();
    state.timer.remainingSeconds = state.timer.totalSeconds;
    updateTimerUI();
  }

  function updateTimerUI() {
    const mins = Math.floor(state.timer.remainingSeconds / 60);
    const secs = state.timer.remainingSeconds % 60;
    if (el.timerDisplay) el.timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const percent = (state.timer.remainingSeconds / state.timer.totalSeconds) * 100;
    if (el.timerProgress) el.timerProgress.style.width = `${percent}%`;

    const elapsed = state.timer.totalSeconds - state.timer.remainingSeconds;
    if (el.timerPhaseHint) {
      if (elapsed < 10 * 60) {
        el.timerPhaseHint.textContent = 'Phase 1 (00-10m): Cơ Học Khẩu Hình & Âm Đuôi';
      } else if (elapsed < 20 * 60) {
        el.timerPhaseHint.textContent = 'Phase 2 (10-20m): Nạp Khung Câu Đóng Băng';
      } else {
        el.timerPhaseHint.textContent = 'Phase 3 (20-30m): Nói & Chấm Điểm Cùng AGY AI';
      }
    }
  }

  // Real Audio Capture via MediaRecorder (Side-by-Side Audio)
  async function startMediaRecording() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.mediaRecorder = new MediaRecorder(stream);
        state.audioChunks = [];
        state.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) state.audioChunks.push(e.data);
        };
        state.mediaRecorder.onstop = () => {
          const blob = new Blob(state.audioChunks, { type: 'audio/webm' });
          if (state.recordedAudioUrl) URL.revokeObjectURL(state.recordedAudioUrl);
          state.recordedAudioUrl = URL.createObjectURL(blob);
          if (el.audioUserRecorded) el.audioUserRecorded.src = state.recordedAudioUrl;
          if (el.btnReplayUserVoice) el.btnReplayUserVoice.disabled = false;
          if (el.audioPlaybackStatus) el.audioPlaybackStatus.textContent = "✓ Thu âm thành công! Bấm '▶ Nghe lại giọng Của Bạn' hoặc '🔊 Nghe giọng Bản Xứ' để so sánh trực diện.";
          stream.getTracks().forEach(track => track.stop());
        };
        state.mediaRecorder.start();
      }
    } catch (err) {
      console.warn('Microphone permission or MediaRecorder error:', err);
    }
  }

  function stopMediaRecording() {
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
    }
  }

  // Dynamic Vocal Tract SVG Illumination
  function updateVocalTractSVG(lesson) {
    const parts = [
      'svg-part-lips',
      'svg-part-teeth',
      'svg-part-alveolar',
      'svg-part-hard-palate',
      'svg-part-velum',
      'svg-part-tongue-tip',
      'svg-part-tongue-back',
      'svg-part-vocal-cords'
    ];

    parts.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.classList.remove('svg-active-glow', 'svg-active-glow-voiced');
      }
    });

    const active = (lesson?.phonetics?.activeArticulator || '').toLowerCase();
    const passive = (lesson?.phonetics?.passiveArticulator || '').toLowerCase();
    const symbol = (lesson?.phonetics?.phoneticSymbol || '').toLowerCase();
    const isVoiced = lesson?.phonetics?.isVoiced || false;

    // Alveolar
    if (passive.includes('alveolar') || passive.includes('gờ lợi') || symbol.includes('/t/') || symbol.includes('/d/') || symbol.includes('/s/') || symbol.includes('/z/')) {
      document.getElementById('svg-part-alveolar')?.classList.add('svg-active-glow');
      document.getElementById('svg-part-tongue-tip')?.classList.add('svg-active-glow');
    }
    // Dental
    else if (passive.includes('teeth') || passive.includes('răng') || symbol.includes('/θ/') || symbol.includes('/ð/')) {
      document.getElementById('svg-part-teeth')?.classList.add('svg-active-glow');
      document.getElementById('svg-part-tongue-tip')?.classList.add('svg-active-glow');
    }
    // Bilabial
    else if (active.includes('môi') || active.includes('lip') || symbol.includes('/p/') || symbol.includes('/b/') || symbol.includes('/m/')) {
      document.getElementById('svg-part-lips')?.classList.add('svg-active-glow');
    }
    // Velar
    else if (passive.includes('velum') || passive.includes('ngạc mềm') || symbol.includes('/k/') || symbol.includes('/g/') || symbol.includes('/ŋ/')) {
      document.getElementById('svg-part-velum')?.classList.add('svg-active-glow');
      document.getElementById('svg-part-tongue-back')?.classList.add('svg-active-glow');
    }
    // Palatal
    else if (passive.includes('palate') || passive.includes('ngạc cứng') || symbol.includes('/ʃ/') || symbol.includes('/tʃ/')) {
      document.getElementById('svg-part-hard-palate')?.classList.add('svg-active-glow');
      document.getElementById('svg-part-tongue-tip')?.classList.add('svg-active-glow');
    }

    // Voicing illumination
    if (isVoiced) {
      document.getElementById('svg-part-vocal-cords')?.classList.add('svg-active-glow-voiced');
    }
  }

  // Simulators Tab Switching
  function switchSimulatorTab(tab) {
    const tabs = ['standup', 'demo', 'pingpong'];
    tabs.forEach(t => {
      const tabBtn = document.getElementById(`tab-sim-${t}`);
      const panel = document.getElementById(`panel-sim-${t}`);
      if (t === tab) {
        if (tabBtn) tabBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 shadow transition';
        if (panel) panel.classList.remove('hidden');
      } else {
        if (tabBtn) tabBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition';
        if (panel) panel.classList.add('hidden');
      }
    });
  }

  // Standup Simulate Submit
  async function submitStandupSimulation() {
    const yesterday = el.simStandupYesterday ? el.simStandupYesterday.value.trim() : '';
    const today = el.simStandupToday ? el.simStandupToday.value.trim() : '';
    const blockers = el.simStandupBlockers ? el.simStandupBlockers.value.trim() : '';

    if (!yesterday && !today) {
      alert('Vui lòng nhập ít nhất thông tin Yesterday hoặc Today.');
      return;
    }

    if (el.btnSimStandupSubmit) {
      el.btnSimStandupSubmit.disabled = true;
      el.btnSimStandupSubmit.textContent = '⏳ AGY AI đang phân tích Standup...';
    }

    try {
      const res = await fetch('/api/ai/standup-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yesterday, today, blockers })
      });
      const data = await res.json();
      if (el.simStandupResult) el.simStandupResult.classList.remove('hidden');
      if (el.simStandupScore) el.simStandupScore.textContent = `Score: ${data.fluencyScore}/100`;
      if (el.simStandupGrammar) el.simStandupGrammar.textContent = data.grammarFeedback || 'Ngữ pháp cơ bản tốt.';
      if (el.simStandupConsonants) {
        el.simStandupConsonants.innerHTML = '';
        (data.endingConsonantsFeedback || []).forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          el.simStandupConsonants.appendChild(li);
        });
      }
      if (el.simStandupRefactor) el.simStandupRefactor.textContent = data.seniorTechLeadRefactor || '';
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối Standup Simulation.');
    } finally {
      if (el.btnSimStandupSubmit) {
        el.btnSimStandupSubmit.disabled = false;
        el.btnSimStandupSubmit.textContent = '🚀 Chấm điểm Standup & Nhận Refactor từ Senior Lead';
      }
    }
  }

  // Demo Simulate Submit
  async function submitDemoSimulation() {
    const context = el.simDemoContext ? el.simDemoContext.value.trim() : '';
    const architecture = el.simDemoArch ? el.simDemoArch.value.trim() : '';
    const technicalHighlights = el.simDemoHighlights ? el.simDemoHighlights.value.trim() : '';
    const qaInvite = el.simDemoQa ? el.simDemoQa.value.trim() : '';

    if (!context && !architecture) {
      alert('Vui lòng nhập bối cảnh Context hoặc kiến trúc Architecture.');
      return;
    }

    if (el.btnSimDemoSubmit) {
      el.btnSimDemoSubmit.disabled = true;
      el.btnSimDemoSubmit.textContent = '⏳ AGY AI đang phân tích Connected Speech...';
    }

    try {
      const res = await fetch('/api/ai/demo-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, architecture, technicalHighlights, qaInvite })
      });
      const data = await res.json();
      if (el.simDemoResult) el.simDemoResult.classList.remove('hidden');
      if (el.simDemoScore) el.simDemoScore.textContent = `Score: ${data.fluencyScore}/100`;
      if (el.simDemoLinking) {
        el.simDemoLinking.innerHTML = '';
        (data.connectedSpeech?.linkingAlerts || []).forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          el.simDemoLinking.appendChild(li);
        });
      }
      if (el.simDemoFlapt) {
        el.simDemoFlapt.innerHTML = '';
        const combined = [...(data.connectedSpeech?.flapTAlerts || []), ...(data.connectedSpeech?.weakFormsAlerts || [])];
        combined.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          el.simDemoFlapt.appendChild(li);
        });
      }
      if (el.simDemoScript) el.simDemoScript.textContent = data.seniorDevPresentationScript || '';
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối Demo Simulation.');
    } finally {
      if (el.btnSimDemoSubmit) {
        el.btnSimDemoSubmit.disabled = false;
        el.btnSimDemoSubmit.textContent = '🚀 Phân Tích Connected Speech & Kịch Bản Demo Chuẩn Quốc Tế';
      }
    }
  }

  // Ping-Pong Simulate Submit
  async function submitPingPongSimulation() {
    const answer = el.simPingpongAnswer ? el.simPingpongAnswer.value.trim() : '';
    const detail = el.simPingpongDetail ? el.simPingpongDetail.value.trim() : '';
    const questionBack = el.simPingpongQuestion ? el.simPingpongQuestion.value.trim() : '';

    if (!answer) {
      alert('Vui lòng nhập câu trả lời Answer (A).');
      return;
    }

    if (el.btnSimPingpongSubmit) {
      el.btnSimPingpongSubmit.disabled = true;
      el.btnSimPingpongSubmit.textContent = '⏳ Đang chấm điểm độ tự nhiên A-D-Q...';
    }

    try {
      const res = await fetch('/api/ai/pingpong-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, detail, questionBack })
      });
      const data = await res.json();
      if (el.simPingpongResult) el.simPingpongResult.classList.remove('hidden');
      if (el.simPingpongScore) el.simPingpongScore.textContent = `Naturalness: ${data.naturalnessScore}/100`;
      if (el.simPingpongQuality) el.simPingpongQuality.textContent = data.pingPongTransitionQuality || 'Chuyển tiếp tự nhiên.';
      if (el.simPingpongFeedback) el.simPingpongFeedback.textContent = data.feedback || '';
      if (el.simPingpongRefactor) el.simPingpongRefactor.textContent = data.seniorDevRefactoring || '';
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối Ping-Pong Simulation.');
    } finally {
      if (el.btnSimPingpongSubmit) {
        el.btnSimPingpongSubmit.disabled = false;
        el.btnSimPingpongSubmit.textContent = '🚀 Chấm Điểm Độ Tự Nhiên Ping-Pong (A-D-Q)';
      }
    }
  }

  // Desktop Notification Trigger Test
  async function triggerTestNotification() {
    try {
      const res = await fetch('/api/reminder/test', { method: 'POST' });
      const data = await res.json();
      alert('Đã gửi thông báo nhắc nhở 22:00 ra màn hình desktop (Windows Toast)!');
    } catch (err) {
      console.error(err);
    }
  }

  // ==========================================
  // REAL-TIME AUDIO WAVEFORM & SPECTROGRAM VISUALIZER
  // ==========================================
  let activeAudioCtx = null;
  let activeAnalyser = null;
  let activeAnimId = null;
  let activeMicStream = null;

  function startAudioVisualizer(canvas) {
    if (!canvas) return;
    stopAudioVisualizer();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      activeMicStream = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      activeAudioCtx = new AudioCtx();
      const source = activeAudioCtx.createMediaStreamSource(stream);
      activeAnalyser = activeAudioCtx.createAnalyser();
      activeAnalyser.fftSize = 128;
      source.connect(activeAnalyser);

      const bufferLength = activeAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const ctx = canvas.getContext('2d');

      function draw() {
        activeAnimId = requestAnimationFrame(draw);
        activeAnalyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const r = Math.min(255, 30 + i * 3);
          const g = Math.max(80, 200 - i * 2);
          const b = 250;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      }
      draw();
    }).catch(err => {
      console.warn('Microphone stream error for visualizer:', err);
    });
  }

  function stopAudioVisualizer() {
    if (activeAnimId) {
      cancelAnimationFrame(activeAnimId);
      activeAnimId = null;
    }
    if (activeMicStream) {
      activeMicStream.getTracks().forEach(t => t.stop());
      activeMicStream = null;
    }
    if (activeAudioCtx) {
      activeAudioCtx.close().catch(() => {});
      activeAudioCtx = null;
    }
  }

  // ==========================================
  // FEATURE 1: AI SPARRING ARENA CONTROLLER
  // ==========================================
  const sparringState = {
    scenarios: [],
    currentScenario: null,
    history: [],
    isRecording: false,
    recognition: null
  };

  async function initSparringArena() {
    if (sparringState.scenarios.length === 0) {
      await loadSparringScenarios();
    }
    setupSparringVoice();
  }

  async function loadSparringScenarios() {
    try {
      const res = await fetch('/api/sparring/scenarios');
      if (!res.ok) return;
      sparringState.scenarios = await res.json();

      const select = document.getElementById('select-sparring-scenario');
      if (select) {
        select.innerHTML = sparringState.scenarios.map(s => 
          `<option value="${s.id}">${s.title} (${s.roleDescription.split(' ')[0]})</option>`
        ).join('');

        select.addEventListener('change', () => {
          selectSparringScenario(select.value);
        });
      }

      if (sparringState.scenarios.length > 0) {
        selectSparringScenario(sparringState.scenarios[0].id);
      }
    } catch (err) {
      console.error('Failed to load sparring scenarios', err);
    }
  }

  function selectSparringScenario(id) {
    const scenario = sparringState.scenarios.find(s => s.id === id);
    if (!scenario) return;

    sparringState.currentScenario = scenario;
    sparringState.history = [];

    const badge = document.getElementById('sparring-role-badge');
    const title = document.getElementById('sparring-scenario-title');
    const desc = document.getElementById('sparring-role-desc');
    const vocab = document.getElementById('sparring-target-vocab');

    if (badge) badge.textContent = scenario.roleDescription.split(' ')[0] || 'Interrogator';
    if (title) title.textContent = scenario.title;
    if (desc) desc.textContent = scenario.roleDescription;
    if (vocab) vocab.textContent = `Target Vocab: ${scenario.keyVocabulary.join(', ')}`;

    // Reset Chat Stream with Opening line
    const stream = document.getElementById('sparring-chat-stream');
    if (stream) {
      stream.innerHTML = `
        <div class="bg-indigo-950/40 border border-indigo-800/60 p-3 rounded-xl space-y-1.5 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-indigo-300 font-mono">🤖 ${scenario.roleDescription.split(' ')[0] || 'Senior Lead'}</span>
            <button class="speak-btn text-[11px] text-cyan-400 hover:underline" data-word="${scenario.openingLine.replace(/"/g, '&quot;')}">🔊 Nghe</button>
          </div>
          <p class="text-slate-100 font-mono leading-relaxed">${scenario.openingLine}</p>
        </div>
      `;
    }

    const feedback = document.getElementById('sparring-feedback-panel');
    if (feedback) feedback.classList.add('hidden');

    const input = document.getElementById('input-sparring-speech');
    if (input) input.value = '';
  }

  function setupSparringVoice() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    if (!sparringState.recognition) {
      sparringState.recognition = new SpeechRec();
      sparringState.recognition.continuous = false;
      sparringState.recognition.interimResults = false;
      sparringState.recognition.lang = 'en-US';

      sparringState.recognition.onstart = () => {
        sparringState.isRecording = true;
        const label = document.getElementById('sparring-mic-label');
        if (label) label.textContent = 'Đang nghe...';
        const canvas = document.getElementById('canvas-sparring-visualizer');
        startAudioVisualizer(canvas);
      };

      sparringState.recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        const input = document.getElementById('input-sparring-speech');
        if (input) input.value = text;
      };

      sparringState.recognition.onend = () => {
        sparringState.isRecording = false;
        const label = document.getElementById('sparring-mic-label');
        if (label) label.textContent = 'Nói trực tiếp';
        stopAudioVisualizer();
      };
    }

    const btnMic = document.getElementById('btn-sparring-mic');
    if (btnMic && !btnMic.dataset.bound) {
      btnMic.dataset.bound = 'true';
      btnMic.addEventListener('click', () => {
        if (sparringState.isRecording) sparringState.recognition.stop();
        else sparringState.recognition.start();
      });
    }

    const btnSubmit = document.getElementById('btn-sparring-submit');
    if (btnSubmit && !btnSubmit.dataset.bound) {
      btnSubmit.dataset.bound = 'true';
      btnSubmit.addEventListener('click', submitSparringTurn);
    }

    const btnReset = document.getElementById('btn-sparring-reset');
    if (btnReset && !btnReset.dataset.bound) {
      btnReset.dataset.bound = 'true';
      btnReset.addEventListener('click', () => {
        if (sparringState.currentScenario) selectSparringScenario(sparringState.currentScenario.id);
      });
    }
  }

  async function submitSparringTurn() {
    const input = document.getElementById('input-sparring-speech');
    const userText = input?.value.trim();
    if (!userText) {
      alert('Vui lòng nhập hoặc nói câu trả lời của bạn.');
      return;
    }

    const btnSubmit = document.getElementById('btn-sparring-submit');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = '⏳ Đang phân tích phản biện...';
    }

    // Append user bubble to chat stream
    const stream = document.getElementById('sparring-chat-stream');
    if (stream) {
      const userBubble = document.createElement('div');
      userBubble.className = 'bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1 text-xs text-right';
      userBubble.innerHTML = `
        <div class="font-bold text-cyan-400 font-mono">👤 You (Tech Lead)</div>
        <p class="text-slate-200 font-mono text-left leading-relaxed">${userText}</p>
      `;
      stream.appendChild(userBubble);
      stream.scrollTop = stream.scrollHeight;
    }

    try {
      const res = await fetch('/api/sparring/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: sparringState.currentScenario?.id || 'arch-debate',
          userSpeech: userText,
          history: sparringState.history
        })
      });

      const data = await res.json();

      // Update history
      sparringState.history.push({ speaker: 'user', content: userText });
      sparringState.history.push({ speaker: 'ai', content: data.aiResponse });

      // Append AI reply to chat stream
      if (stream) {
        const aiBubble = document.createElement('div');
        aiBubble.className = 'bg-indigo-950/40 border border-indigo-800/60 p-3 rounded-xl space-y-1.5 text-xs';
        aiBubble.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold text-indigo-300 font-mono">🤖 ${sparringState.currentScenario?.roleDescription.split(' ')[0] || 'Senior Lead'}</span>
            <button class="speak-btn text-[11px] text-cyan-400 hover:underline" data-word="${data.aiResponse.replace(/"/g, '&quot;')}">🔊 Nghe</button>
          </div>
          <p class="text-slate-100 font-mono leading-relaxed">${data.aiResponse}</p>
          ${data.nextQuestion ? `<div class="mt-2 text-indigo-200 font-semibold border-t border-indigo-900/60 pt-1.5">❓ Câu hỏi phản biện tiếp theo: ${data.nextQuestion}</div>` : ''}
        `;
        stream.appendChild(aiBubble);
        stream.scrollTop = stream.scrollHeight;
      }

      // Update Feedback Panel
      const feedback = document.getElementById('sparring-feedback-panel');
      if (feedback) feedback.classList.remove('hidden');

      const diplomacy = document.getElementById('sparring-score-diplomacy');
      const clarity = document.getElementById('sparring-score-clarity');
      const fillers = document.getElementById('sparring-filler-words');
      const alerts = document.getElementById('sparring-phonetic-alerts');
      const refinement = document.getElementById('sparring-refinement-text');
      const btnRefinementSpeak = document.getElementById('btn-speak-sparring-refinement');

      if (diplomacy) diplomacy.textContent = `${data.diplomacyScore || 85}/100`;
      if (clarity) clarity.textContent = `${data.technicalClarityScore || 85}/100`;

      if (fillers) {
        const fillerCount = data.fillerWordsDetected?.length || 0;
        fillers.textContent = fillerCount > 0 ? `${fillerCount} từ (${data.fillerWordsDetected.join(', ')})` : '0 từ (Tuyệt vời!)';
        fillers.className = fillerCount > 0 ? 'text-xs font-bold font-mono text-amber-400 mt-1' : 'text-xs font-bold font-mono text-emerald-400 mt-1';
      }

      if (alerts) {
        const alertList = data.pronunciationAlerts || [];
        alerts.textContent = alertList.length > 0 ? alertList.join(' | ') : 'Phát âm âm đuôi chuẩn';
      }

      if (refinement) refinement.textContent = data.seniorLeadRefinement || userText;
      if (btnRefinementSpeak) {
        btnRefinementSpeak.onclick = () => speakWord(data.seniorLeadRefinement || userText);
      }

      if (input) input.value = '';
    } catch (err) {
      console.error('Sparring error', err);
      alert('Không thể kết nối Sparring Partner API.');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '⚔️ Gửi câu trả lời & Nhận Phản Biện';
      }
    }
  }

  // ==========================================
  // FEATURE 2: PR & CODE REVIEW STUDIO CONTROLLER
  // ==========================================
  let currentPrTone = 'ConstructiveReview';

  function initPrStudio() {
    // Tone Selector buttons
    document.querySelectorAll('.pr-tone-btn').forEach(btn => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
          document.querySelectorAll('.pr-tone-btn').forEach(b => {
            b.className = 'pr-tone-btn px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition';
          });
          btn.className = 'pr-tone-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 border border-cyan-400 transition';
          currentPrTone = btn.dataset.tone;
        });
      }
    });

    // Sample buttons
    document.querySelectorAll('.pr-sample-btn').forEach(btn => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
          const rawInput = document.getElementById('pr-raw-input');
          if (rawInput) rawInput.value = btn.dataset.sample;
          submitPrPolish();
        });
      }
    });

    const btnSubmit = document.getElementById('btn-pr-polish-submit');
    if (btnSubmit && !btnSubmit.dataset.bound) {
      btnSubmit.dataset.bound = 'true';
      btnSubmit.addEventListener('click', submitPrPolish);
    }

    const btnCopy = document.getElementById('btn-pr-copy');
    if (btnCopy && !btnCopy.dataset.bound) {
      btnCopy.dataset.bound = 'true';
      btnCopy.addEventListener('click', () => {
        const text = document.getElementById('pr-polished-text')?.textContent.trim() || '';
        if (text) {
          navigator.clipboard.writeText(text);
          btnCopy.textContent = '✓ Copied!';
          setTimeout(() => btnCopy.textContent = '📋 Sao chép', 1500);
        }
      });
    }

    const btnSpeak = document.getElementById('btn-speak-pr-result');
    if (btnSpeak && !btnSpeak.dataset.bound) {
      btnSpeak.dataset.bound = 'true';
      btnSpeak.addEventListener('click', () => {
        const text = document.getElementById('pr-polished-text')?.textContent.trim() || '';
        if (text) speakWord(text);
      });
    }
  }

  async function submitPrPolish() {
    const rawInput = document.getElementById('pr-raw-input');
    const inputText = rawInput?.value.trim();
    if (!inputText) {
      alert('Vui lòng nhập nhận xét code hoặc tin nhắn commit.');
      return;
    }

    const codeContext = document.getElementById('pr-code-context')?.value.trim() || null;
    const btnSubmit = document.getElementById('btn-pr-polish-submit');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = '⏳ Đang tinh chỉnh giọng văn Senior...';
    }

    try {
      const res = await fetch('/api/pr/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText,
          tone: currentPrTone,
          codeContext
        })
      });

      const data = await res.json();

      const outText = document.getElementById('pr-polished-text');
      const outAlt = document.getElementById('pr-alternative-text');
      const outExp = document.getElementById('pr-explanation-text');
      const outPhrases = document.getElementById('pr-key-phrases');
      const outAvoided = document.getElementById('pr-avoided-pitfalls');

      if (outText) outText.textContent = data.polishedText || '';
      if (outAlt) outAlt.textContent = data.alternativeDraft || 'Không có phương án thay thế.';
      if (outExp) outExp.textContent = `💡 ${data.explanation || ''}`;

      if (outPhrases) {
        outPhrases.innerHTML = (data.keyPhrasesUsed || []).map(p => 
          `<span class="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900">${p}</span>`
        ).join('') || '<span class="text-slate-500">None</span>';
      }

      if (outAvoided) {
        outAvoided.innerHTML = (data.avoidedAntiPatterns || []).map(a => 
          `<span class="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-900">${a}</span>`
        ).join('') || '<span class="text-slate-500">None</span>';
      }
    } catch (err) {
      console.error('PR Polish error', err);
      alert('Lỗi kết nối PR Polisher API.');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '🚀 Refactor to Senior Code Review';
      }
    }
  }

  // ==========================================
  // FEATURE 3: SRS LEITNER WEAK-SPOT VAULT CONTROLLER
  // ==========================================
  const srsState = {
    stats: null,
    dueItems: [],
    allItems: [],
    activeItem: null,
    isRecording: false,
    recognition: null
  };

  async function refreshSrsData() {
    await Promise.all([
      refreshSrsStatsOnly(),
      fetchSrsQueue(),
      fetchSrsAllItems()
    ]);
    setupSrsEventListeners();
  }

  async function refreshSrsStatsOnly() {
    try {
      const res = await fetch('/api/srs/stats');
      if (!res.ok) return;
      srsState.stats = await res.json();

      const totalEl = document.getElementById('srs-stat-total');
      const dueEl = document.getElementById('srs-stat-due');
      const masteredEl = document.getElementById('srs-stat-mastered');
      const avgEl = document.getElementById('srs-stat-avg');

      if (totalEl) totalEl.textContent = srsState.stats.totalTracked;
      if (dueEl) dueEl.textContent = srsState.stats.dueToday;
      if (masteredEl) masteredEl.textContent = srsState.stats.mastered;
      if (avgEl) avgEl.textContent = `${Math.round(srsState.stats.averageScore)}%`;

      if (el.statSrsDue) el.statSrsDue.textContent = `${srsState.stats.dueToday} từ`;
    } catch (err) {
      console.warn('Error fetching SRS stats', err);
    }
  }

  async function fetchSrsQueue() {
    try {
      const res = await fetch('/api/srs/queue');
      if (!res.ok) return;
      srsState.dueItems = await res.json();

      if (srsState.dueItems.length > 0) {
        srsState.activeItem = srsState.dueItems[0];
        renderSrsActiveCard(srsState.activeItem);
      } else {
        srsState.activeItem = null;
        renderSrsEmptyCard();
      }
    } catch (err) {
      console.warn('Error fetching SRS queue', err);
    }
  }

  async function fetchSrsAllItems() {
    try {
      const res = await fetch('/api/srs/all');
      if (!res.ok) return;
      srsState.allItems = await res.json();

      // Update box count indicators
      const boxCounts = [0, 0, 0, 0, 0, 0];
      srsState.allItems.forEach(item => {
        const box = Math.max(1, Math.min(5, item.box || 1));
        boxCounts[box]++;
      });

      for (let i = 1; i <= 5; i++) {
        const boxEl = document.getElementById(`srs-box-${i}-count`);
        if (boxEl) boxEl.textContent = `${boxCounts[i]} từ`;
      }

      // Render all items list
      const listEl = document.getElementById('srs-all-items-list');
      if (listEl) {
        listEl.innerHTML = srsState.allItems.map(item => `
          <div class="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
            <div>
              <span class="font-bold text-cyan-400">${item.wordOrPhrase}</span>
              <span class="text-[10px] text-amber-300 ml-1.5">${item.targetPhoneme}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 font-mono">Hộp ${item.box}</span>
              <button class="speak-btn text-xs text-cyan-400 hover:text-cyan-300" data-word="${item.wordOrPhrase}">🔊</button>
            </div>
          </div>
        `).join('') || '<div class="text-slate-500 text-xs">Chưa có từ nào trong Vault.</div>';
      }
    } catch (err) {
      console.warn('Error fetching all SRS items', err);
    }
  }

  function renderSrsActiveCard(item) {
    const indicator = document.getElementById('srs-card-box-indicator');
    const wordEl = document.getElementById('srs-card-word');
    const phonemeEl = document.getElementById('srs-card-phoneme');
    const contextEl = document.getElementById('srs-card-context');
    const listenBtn = document.getElementById('btn-srs-listen');

    if (indicator) indicator.textContent = `Hộp ${item.box} // Ôn cách ${item.intervalDays} ngày (Điểm gần nhất: ${item.lastScore}%)`;
    if (wordEl) wordEl.textContent = item.wordOrPhrase;
    if (phonemeEl) phonemeEl.textContent = `Target: ${item.targetPhoneme}`;
    if (contextEl) contextEl.textContent = `"${item.contextSentence}"`;
    if (listenBtn) listenBtn.dataset.word = item.wordOrPhrase;

    const transcriptInput = document.getElementById('input-srs-transcript');
    if (transcriptInput) transcriptInput.value = '';
  }

  function renderSrsEmptyCard() {
    const container = document.getElementById('srs-active-card-container');
    if (container) {
      container.innerHTML = `
        <div class="bg-slate-950 border border-emerald-900/60 p-6 rounded-xl text-center space-y-2">
          <div class="text-3xl">🎉</div>
          <div class="text-sm font-bold text-emerald-400 font-mono">Hôm nay bạn đã hoàn thành hết thẻ ôn tập!</div>
          <p class="text-xs text-slate-400">Tất cả các từ vựng và âm kỹ thuật đang được giữ vững trong lịch trình Leitner. Thêm từ mới ở cột bên phải nếu bạn gặp bất kỳ từ khó nào.</p>
        </div>
      `;
    }
  }

  function setupSrsEventListeners() {
    const btnPass = document.getElementById('btn-srs-grade-pass');
    if (btnPass && !btnPass.dataset.bound) {
      btnPass.dataset.bound = 'true';
      btnPass.addEventListener('click', () => submitSrsReview(85));
    }

    const btnFail = document.getElementById('btn-srs-grade-fail');
    if (btnFail && !btnFail.dataset.bound) {
      btnFail.dataset.bound = 'true';
      btnFail.addEventListener('click', () => submitSrsReview(60));
    }

    const btnEnroll = document.getElementById('btn-enroll-submit');
    if (btnEnroll && !btnEnroll.dataset.bound) {
      btnEnroll.dataset.bound = 'true';
      btnEnroll.addEventListener('click', enrollWeakSpot);
    }

    const btnRefresh = document.getElementById('btn-srs-refresh');
    if (btnRefresh && !btnRefresh.dataset.bound) {
      btnRefresh.dataset.bound = 'true';
      btnRefresh.addEventListener('click', refreshSrsData);
    }

    // Modal SRS navigation button
    const btnViewSrs = document.getElementById('btn-view-srs-from-modal');
    if (btnViewSrs && !btnViewSrs.dataset.bound) {
      btnViewSrs.dataset.bound = 'true';
      btnViewSrs.addEventListener('click', () => {
        closeSoundPracticeModal();
        switchView('srs');
      });
    }

    // SRS Recording
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec && !srsState.recognition) {
      srsState.recognition = new SpeechRec();
      srsState.recognition.continuous = false;
      srsState.recognition.interimResults = false;
      srsState.recognition.lang = 'en-US';

      srsState.recognition.onstart = () => {
        srsState.isRecording = true;
        const label = document.getElementById('srs-record-label');
        if (label) label.textContent = 'Đang nghe...';
        const canvas = document.getElementById('canvas-srs-visualizer');
        startAudioVisualizer(canvas);
      };

      srsState.recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        const input = document.getElementById('input-srs-transcript');
        if (input) input.value = text;
      };

      srsState.recognition.onend = () => {
        srsState.isRecording = false;
        const label = document.getElementById('srs-record-label');
        if (label) label.textContent = 'Bấm để nói';
        stopAudioVisualizer();
      };

      const btnRecord = document.getElementById('btn-srs-record');
      if (btnRecord && !btnRecord.dataset.bound) {
        btnRecord.dataset.bound = 'true';
        btnRecord.addEventListener('click', () => {
          if (srsState.isRecording) srsState.recognition.stop();
          else srsState.recognition.start();
        });
      }
    }
  }

  async function submitSrsReview(score) {
    if (!srsState.activeItem) return;

    try {
      const res = await fetch('/api/srs/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: srsState.activeItem.id,
          score: score
        })
      });

      const updated = await res.json();
      const actionText = score >= 75 ? `Lên Hộp ${updated.box}!` : `Về lại Hộp 1 để ôn mỗi ngày.`;
      alert(`Đã chấm điểm: ${score}% -> ${actionText}`);

      await refreshSrsData();
    } catch (err) {
      console.error('Error submitting review', err);
    }
  }

  async function enrollWeakSpot() {
    const wordInput = document.getElementById('input-enroll-word');
    const phonemeInput = document.getElementById('input-enroll-phoneme');
    const contextInput = document.getElementById('input-enroll-context');

    const word = wordInput?.value.trim();
    if (!word) {
      alert('Vui lòng nhập từ hoặc cụm từ.');
      return;
    }

    const phoneme = phonemeInput?.value.trim() || 'General phonetic precision';
    const context = contextInput?.value.trim() || `Technical context with ${word}`;

    try {
      const res = await fetch('/api/srs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordOrPhrase: word,
          targetPhoneme: phoneme,
          contextSentence: context,
          initialScore: 65
        })
      });

      if (res.ok) {
        if (wordInput) wordInput.value = '';
        if (phonemeInput) phonemeInput.value = '';
        if (contextInput) contextInput.value = '';
        alert(`✓ Đã thêm "${word}" vào SRS Weak-Spot Vault!`);
        await refreshSrsData();
      }
    } catch (err) {
      console.error('Error enrolling weak spot', err);
    }
  }

  // Run Init on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
