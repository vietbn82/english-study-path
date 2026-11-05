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
    navAnalytics: document.getElementById('nav-analytics'),
    navShadowing: document.getElementById('nav-shadowing'),
    viewAnalytics: document.getElementById('view-analytics'),
    viewShadowing: document.getElementById('view-shadowing'),
    burndownPaceBadge: document.getElementById('burndown-pace-badge'),
    svgBurndown: document.getElementById('svg-burndown'),
    heatmapGrid: document.getElementById('heatmap-grid'),
    heatmapTooltipInfo: document.getElementById('heatmap-tooltip-info'),
    badgesShelf: document.getElementById('badges-shelf'),
    velocityContainer: document.getElementById('velocity-container'),
    shadowSentenceText: document.getElementById('shadow-sentence-text'),
    shadowPhoneticCue: document.getElementById('shadow-phonetic-cue'),
    btnShadowRefPlay: document.getElementById('btn-shadow-ref-play'),
    btnShadowRecord: document.getElementById('btn-shadow-record'),
    shadowRecordLabel: document.getElementById('shadow-record-label'),
    btnShadowCompareB2b: document.getElementById('btn-shadow-compare-b2b'),
    btnShadowToggleAb: document.getElementById('btn-shadow-toggle-ab'),
    shadowActiveTrack: document.getElementById('shadow-active-track'),
    shadowRefDuration: document.getElementById('shadow-ref-duration'),
    shadowUserDuration: document.getElementById('shadow-user-duration'),
    canvasShadowRef: document.getElementById('canvas-shadow-ref'),
    canvasShadowUser: document.getElementById('canvas-shadow-user'),
    btnShadowAiFeedback: document.getElementById('btn-shadow-ai-feedback'),
    shadowPacingScore: document.getElementById('shadow-pacing-score'),
    shadowPacingDiagnosis: document.getElementById('shadow-pacing-diagnosis'),
    shadowStressTip: document.getElementById('shadow-stress-tip'),
    shadowAlertsList: document.getElementById('shadow-alerts-list'),
    modalPhonemeBreakdown: document.getElementById('modal-phoneme-breakdown'),
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
    if (el.navAnalytics) el.navAnalytics.addEventListener('click', () => switchView('analytics'));
    if (el.navShadowing) el.navShadowing.addEventListener('click', () => switchView('shadowing'));

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
    if (el.viewAnalytics) el.viewAnalytics.classList.add('hidden');
    if (el.viewShadowing) el.viewShadowing.classList.add('hidden');

    const defaultNavClass = 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition';
    const activeNavClass = 'px-2.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-500 text-slate-950 shadow-sm transition';

    if (el.navWorkspace) el.navWorkspace.className = defaultNavClass;
    if (el.navCurriculum) el.navCurriculum.className = defaultNavClass;
    if (el.navSimulators) el.navSimulators.className = defaultNavClass;
    if (el.navSparring) el.navSparring.className = defaultNavClass;
    if (el.navPrpolish) el.navPrpolish.className = defaultNavClass;
    if (el.navSrs) el.navSrs.className = defaultNavClass;
    if (el.navAnalytics) el.navAnalytics.className = defaultNavClass;
    if (el.navShadowing) el.navShadowing.className = defaultNavClass;

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
    } else if (view === 'analytics') {
      if (el.viewAnalytics) el.viewAnalytics.classList.remove('hidden');
      if (el.navAnalytics) el.navAnalytics.className = activeNavClass;
      refreshAnalyticsData();
    } else if (view === 'shadowing') {
      if (el.viewShadowing) el.viewShadowing.classList.remove('hidden');
      if (el.navShadowing) el.navShadowing.className = activeNavClass;
      initShadowingStudio();
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

    // =========================================================================
  // SAGITTAL VOCAL TRACT INTERACTIVE ANATOMICAL ENGINE WITH KINEMATIC VECTORS
  // =========================================================================
  let currentSagittalSound = '/t/';
  let currentSagittalMode = 'target'; // 'target' | 'vn'

  const SAGITTAL_DATA = {
    '/t/': {
      soundName: '/t/, /d/ — Alveolar Stop (Âm Gờ Lợi)',
      organText: 'Đầu lưỡi ➜ Gờ lợi trên',
      voicing: 'Vô thanh /t/ (Gió) | Hữu thanh /d/ (Rung cổ)',
      motion: {
        arrowD: "M 180 235 C 178 215, 182 205, 185 194",
        arrowMarker: "url(#arrow-motion)",
        arrowStroke: "#38bdf8",
        label: "⬆️ Nâng đầu lưỡi lên gờ lợi",
        labelX: 195,
        labelY: 218,
        labelColor: "#38bdf8",
        arrowSecD: "M 185 192 L 185 218",
        arrowSecMarker: "url(#arrow-motion-amber)",
        arrowSecStroke: "#f59e0b",
        labelSec: "⬇️ Giật dứt khoát giải phóng Pop",
        labelSecX: 195,
        labelSecY: 205,
        labelSecColor: "#f59e0b",
        showSec: true
      },
      kinematicSteps: {
        start: 'Đầu lưỡi nghỉ ở sàn miệng',
        motion: '⬆️ Nâng lên ép chặt Gờ Lợi',
        pressure: '🛑 Khóa khí nén sau đầu lưỡi',
        release: '⬇️ Giật dứt khoát giải phóng Pop'
      },
      vnMotionText: 'Lỗi hướng người Việt: Đập lưỡi vào mặt sau răng cửa thay vì gờ lợi, không có pha giật nhả xuống mà ngậm miệng nuốt âm (commit -> côm-mít).',
      target: {
        tonguePath: "M 165 265 C 170 240, 175 210, 185 192 C 205 194, 235 220, 265 240 C 290 260, 300 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 185, cy: 192 },
        contactPoint: { cx: 185, cy: 192, show: true, color: '#38bdf8' },
        burstPoint: { cx: 185, cy: 192, show: true },
        airStream: { d: "M 270 390 C 270 330, 260 250, 215 220", show: true },
        popArrow: { d: "M 185 192 L 185 215", show: true },
        desc: "Đầu lưỡi dán chặt gờ lợi sau răng trên, nén áp suất khí rồi giật lưỡi dứt khoát giải phóng tiếng bật hơi sắc nét (Pop).",
        badge: "🇬🇧 Chuẩn Target (Ép gờ lợi -> Bật nổ)"
      },
      vn: {
        tonguePath: "M 165 265 C 160 240, 155 225, 156 218 C 175 224, 210 235, 255 245 C 285 265, 295 305, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 156, cy: 218 },
        contactPoint: { cx: 156, cy: 218, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        airStream: { d: "M 270 390 C 270 330, 260 250, 215 240", show: true },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Đầu lưỡi đập vào răng cửa hoặc ngậm miệng nuốt âm (unreleased coda). Từ 'commit' đọc thành 'côm-mít' cụt ngủn.",
        badge: "🇻🇳 Lỗi Thường Gặp (Chặn răng / Nuốt âm)"
      }
    },
    '/θ/': {
      soundName: '/θ/, /ð/ — Interdental Fricative (Âm Kẹp Răng)',
      organText: 'Đầu lưỡi ➜ Giữa 2 hàm răng',
      voicing: 'Vô thanh /θ/ (Xì gió) | Hữu thanh /ð/ (Rung họng)',
      motion: {
        arrowD: "M 170 232 C 155 230, 142 228, 126 224",
        arrowMarker: "url(#arrow-motion-emerald)",
        arrowStroke: "#10b981",
        label: "⬅️ Đẩy nhô ra trước 2-3mm",
        labelX: 85,
        labelY: 208,
        labelColor: "#10b981",
        arrowSecD: "M 124 224 L 95 224",
        arrowSecMarker: "url(#arrow-motion)",
        arrowSecStroke: "#38bdf8",
        labelSec: "💨 Xì hơi liên tục qua kẽ răng",
        labelSecX: 60,
        labelSecY: 240,
        labelSecColor: "#38bdf8",
        showSec: true
      },
      kinematicSteps: {
        start: 'Đầu lưỡi nằm trong miệng',
        motion: '⬅️ Đẩy nhô ra giữa 2 hàm răng',
        pressure: '🦷 Răng cắn nhẹ giữ đầu lưỡi',
        release: '💨 Thổi luồng gió xì liên tục'
      },
      vnMotionText: 'Lỗi hướng người Việt: Rụt đầu lưỡi lùi sâu vào trong vòm họng thay vì nhô ra ngoài kẹp răng (think -> tinh, auth -> ót).',
      target: {
        tonguePath: "M 165 265 C 150 250, 138 238, 130 224 C 140 216, 160 218, 190 226 C 235 235, 270 250, 290 280 C 300 305, 298 335, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 130, cy: 224 },
        contactPoint: { cx: 130, cy: 224, show: true, color: '#10b981' },
        burstPoint: { show: false },
        airStream: { d: "M 270 390 C 260 300, 210 230, 120 224", show: true },
        popArrow: { show: false },
        desc: "Thè đầu lưỡi ra giữa 2 hàm răng 2-3mm, cắn nhẹ bằng răng cửa, đẩy hơi rít liên tục qua khe răng - lưỡi (không rung cổ với /θ/, rung cổ với /ð/).",
        badge: "🇬🇧 Chuẩn Target (Thè kẹp răng)"
      },
      vn: {
        tonguePath: "M 165 265 C 170 250, 172 238, 175 230 C 190 232, 225 236, 260 245 C 285 265, 295 305, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 175, cy: 230 },
        contactPoint: { cx: 175, cy: 230, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        airStream: { d: "M 270 390 C 270 300, 230 235, 145 220", show: true },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Rụt lưỡi sâu trong miệng, phát âm thành âm 'th' hoặc 't' tiếng Việt (think -> tinh, auth -> ót, with -> uýt).",
        badge: "🇻🇳 Lỗi Thường Gặp (Rụt lưỡi / Nói th-t)"
      }
    },
    '/s/': {
      soundName: '/s/, /z/ — Alveolar Fricative (Âm Rãnh Xì)',
      organText: 'Đầu lưỡi ➜ Sát gờ lợi (Rãnh 1mm)',
      voicing: 'Vô thanh /s/ (Rít gió sắc) | Hữu thanh /z/ (Rung ong)',
      motion: {
        arrowD: "M 180 235 C 178 215, 180 205, 182 198",
        arrowMarker: "url(#arrow-motion)",
        arrowStroke: "#06b6d4",
        label: "⬆️ Nâng sát gờ lợi 1mm",
        labelX: 195,
        labelY: 218,
        labelColor: "#06b6d4",
        arrowSecD: "M 182 198 C 170 205, 155 210, 130 215",
        arrowSecMarker: "url(#arrow-motion-amber)",
        arrowSecStroke: "#f59e0b",
        labelSec: "➡️ Tia khí xì qua kẽ răng",
        labelSecX: 105,
        labelSecY: 235,
        labelSecColor: "#f59e0b",
        showSec: true
      },
      kinematicSteps: {
        start: 'Mép môi cười nhẹ sang hai bên',
        motion: '⬆️ Nâng đầu lưỡi sát gờ lợi 1mm',
        pressure: '🔬 Hai rìa lưỡi áp chặt răng hàm',
        release: '➡️ Phun tia khí sắc bén qua kẽ răng'
      },
      vnMotionText: 'Lỗi hướng người Việt: Bỏ quên hướng nâng đầu lưỡi ở cuối từ, nuốt hoàn toàn âm đuôi s-z (response -> rì-pón).',
      target: {
        tonguePath: "M 165 265 C 170 240, 176 215, 182 198 C 195 204, 225 220, 260 240 C 285 265, 298 305, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 182, cy: 198 },
        contactPoint: { cx: 182, cy: 198, show: true, color: '#06b6d4' },
        burstPoint: { show: false },
        airStream: { d: "M 270 390 C 260 300, 220 210, 135 215", show: true },
        popArrow: { show: false },
        desc: "Mép môi hơi bè như cười nhẹ, đầu lưỡi nâng sát gờ lợi tạo rãnh hẹp, luồng hơi rít mạnh sắc bén qua kẽ răng.",
        badge: "🇬🇧 Chuẩn Target (Rãnh xì sắc nét)"
      },
      vn: {
        tonguePath: "M 165 265 C 175 250, 185 240, 205 238 C 240 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 190, cy: 240 },
        contactPoint: { show: false },
        burstPoint: { show: false },
        airStream: { show: false },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Thường xuyên nuốt âm đuôi /s/, /z/ (response -> 'rì-pón', database -> 'đây-tơ-bây').",
        badge: "🇻🇳 Lỗi Thường Gặp (Rụng đuôi s-z)"
      }
    },
    '/ʃ/': {
      soundName: '/ʃ/, /ʒ/ — Postalveolar Fricative (Âm Chu Vòm)',
      organText: 'Phiến lưỡi ➜ Sau gờ lợi + Chu môi',
      voicing: 'Vô thanh /ʃ/ (Suỵt gió dày) | Hữu thanh /ʒ/ (Rung dày)',
      motion: {
        arrowD: "M 230 240 C 225 225, 220 215, 215 202",
        arrowMarker: "url(#arrow-motion-rose)",
        arrowStroke: "#a855f7",
        label: "↗️ Thân lưỡi vồng cao",
        labelX: 225,
        labelY: 220,
        labelColor: "#a855f7",
        arrowSecD: "M 124 195 L 105 195 M 124 245 L 105 245",
        arrowSecMarker: "url(#arrow-motion-rose)",
        arrowSecStroke: "#f43f5e",
        labelSec: "⬅️ Môi chu tròn về trước",
        labelSecX: 70,
        labelSecY: 185,
        labelSecColor: "#f43f5e",
        showSec: true
      },
      kinematicSteps: {
        start: 'Miệng thả lỏng',
        motion: '⬅️ Chu môi phễu + ↗️ Vồng thân lưỡi',
        pressure: '💨 Khoang miệng cộng hưởng âm sâu',
        release: '🌊 Thổi luồng gió suỵt dày đục'
      },
      vnMotionText: 'Lỗi hướng người Việt: Miệng bẹt sang hai bên thay vì chu tròn về phía trước, biến /ʃ/ thành /s/ thông thường.',
      target: {
        tonguePath: "M 165 265 C 172 245, 185 225, 215 202 C 240 205, 265 225, 285 255 C 298 285, 300 325, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 215, cy: 202 },
        contactPoint: { cx: 215, cy: 202, show: true, color: '#a855f7' },
        burstPoint: { show: false },
        airStream: { d: "M 270 390 C 260 290, 225 215, 120 210", show: true },
        popArrow: { show: false },
        desc: "Môi chu tròn hướng ra phía trước (như huýt sáo), thân lưỡi vồng cao về ngạc cứng đẩy luồng gió dày đục (âm suỵt bảo im lặng).",
        badge: "🇬🇧 Chuẩn Target (Chu môi + Vồng vòm)"
      },
      vn: {
        tonguePath: "M 165 265 C 170 240, 176 215, 182 198 C 195 204, 225 220, 260 240 C 285 265, 298 305, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 182, cy: 198 },
        contactPoint: { cx: 182, cy: 198, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        airStream: { d: "M 270 390 C 260 300, 220 210, 135 215", show: true },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Miệng bẹt, đọc âm /ʃ/ thành /s/ bình thường (push đọc thành 'pút-s' thay vì chu mỏ xì dày).",
        badge: "🇻🇳 Lỗi Thường Gặp (Miệng bẹt thành s)"
      }
    },
    '/k/': {
      soundName: '/k/, /ɡ/ — Velar Stop (Âm Ngạc Mềm)',
      organText: 'Gốc lưỡi ➜ Ngạc mềm (Velum)',
      voicing: 'Vô thanh /k/ (Nổ cộc) | Hữu thanh /ɡ/ (Rung họng)',
      motion: {
        arrowD: "M 260 250 C 275 240, 285 225, 295 205",
        arrowMarker: "url(#arrow-motion-amber)",
        arrowStroke: "#eab308",
        label: "↗️ Gốc lưỡi ép ngạc mềm",
        labelX: 235,
        labelY: 238,
        labelColor: "#eab308",
        arrowSecD: "M 295 205 L 270 230",
        arrowSecMarker: "url(#arrow-motion)",
        arrowSecStroke: "#38bdf8",
        labelSec: "↙️ Hạ nhanh bung nổ",
        labelSecX: 240,
        labelSecY: 215,
        labelSecColor: "#38bdf8",
        showSec: true
      },
      kinematicSteps: {
        start: 'Đầu lưỡi nằm yên ở sàn miệng',
        motion: '↗️ Nhấc bổng gốc lưỡi ép ngạc mềm',
        pressure: '🛑 Chặn kín luồng hơi trong họng',
        release: '↙️ Hạ nhanh gốc lưỡi nổ bật âm cộc'
      },
      vnMotionText: 'Lỗi hướng người Việt: Ép gốc lưỡi lại rồi khóa chặt cổ họng không nhả, nuốt mất tiếng nổ bật (network -> nét-uốc ngậm họng).',
      target: {
        tonguePath: "M 165 265 C 175 260, 185 255, 205 255 C 235 255, 270 230, 295 205 C 310 225, 310 270, 300 320 C 290 355, 275 385, 245 390 C 230 380, 215 350, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 185, cy: 255 },
        contactPoint: { cx: 295, cy: 205, show: true, color: '#eab308' },
        burstPoint: { cx: 295, cy: 205, show: true },
        airStream: { d: "M 270 390 C 275 320, 285 250, 295 205", show: true },
        popArrow: { d: "M 295 205 L 265 230", show: true },
        desc: "Gốc lưỡi phía sau nâng cao ép chặt vào vòm ngạc mềm chặn hoàn toàn khí, sau đó hạ nhanh gốc lưỡi nổ bật âm /k/ sắc nét.",
        badge: "🇬🇧 Chuẩn Target (Ép ngạc mềm -> Nổ)"
      },
      vn: {
        tonguePath: "M 165 265 C 175 260, 185 255, 205 255 C 235 255, 270 230, 295 205 C 310 225, 310 270, 300 320 C 290 355, 275 385, 245 390 C 230 380, 215 350, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 185, cy: 255 },
        contactPoint: { cx: 295, cy: 205, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        airStream: { show: false },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Ép lưỡi lại rồi khóa chặt cổ họng không nhả (network -> 'nét-uốc' ngậm họng, ngắt âm bất thình lình).",
        badge: "🇻🇳 Lỗi Thường Gặp (Khóa họng / Nuốt cộc)"
      }
    },
    '/p/': {
      soundName: '/p/, /b/ — Bilabial Stop (Âm Hai Môi)',
      organText: 'Môi trên ➜ Môi dưới ép chặt',
      voicing: 'Vô thanh /p/ (Bật gió nổ) | Hữu thanh /b/ (Rung môi nổ)',
      motion: {
        arrowD: "M 124 188 L 132 208 M 126 250 L 132 222",
        arrowMarker: "url(#arrow-motion-rose)",
        arrowStroke: "#f43f5e",
        label: "↕️ Hai môi mím chặt",
        labelX: 140,
        labelY: 215,
        labelColor: "#f43f5e",
        arrowSecD: "M 132 215 L 100 215",
        arrowSecMarker: "url(#arrow-motion)",
        arrowSecStroke: "#38bdf8",
        labelSec: "⬅️ Bung mở nổ áp suất",
        labelSecX: 75,
        labelSecY: 235,
        labelSecColor: "#38bdf8",
        showSec: true
      },
      kinematicSteps: {
        start: 'Môi mở tự nhiên',
        motion: '↕️ Hai môi mím dán chặt bờ trong',
        pressure: '🛑 Áp suất dồn ứ sau bờ môi',
        release: '⬅️ Bung mở đột ngột nổ tiếng Pop'
      },
      vnMotionText: 'Lỗi hướng người Việt: Không có pha mím nén bật hơi dứt khoát, dễ lẫn /p/ thành /b/ hoặc ngậm môi nuốt luôn âm cuối.',
      target: {
        tonguePath: "M 165 265 C 175 250, 185 240, 205 238 C 240 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 190, cy: 240 },
        contactPoint: { cx: 132, cy: 215, show: true, color: '#f43f5e' },
        burstPoint: { cx: 132, cy: 215, show: true },
        airStream: { d: "M 270 390 C 260 300, 200 230, 135 215", show: true },
        popArrow: { d: "M 132 215 L 105 215", show: true },
        desc: "Mím chặt 2 bờ môi lại, nén luồng khí dồn sau khoang miệng rồi mở bung hai môi giải phóng âm bật /p/ như mở nắp chai sâm-panh.",
        badge: "🇬🇧 Chuẩn Target (Nén hai môi -> Bật)"
      },
      vn: {
        tonguePath: "M 165 265 C 175 250, 185 240, 205 238 C 240 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 190, cy: 240 },
        contactPoint: { cx: 132, cy: 215, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        airStream: { show: false },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Biến âm /p/ ở đầu từ thành âm /b/ (people -> 'bi-bồ'), hoặc ở đuôi thì ngậm môi không bật (help -> 'hép' cụt).",
        badge: "🇻🇳 Lỗi Thường Gặp (Biến p thành b)"
      }
    },
    'rest': {
      soundName: 'Trạng Thái Tự Nhiên (Rest / Neutral)',
      organText: 'Khoang miệng thả lỏng',
      voicing: 'Thanh quản mở tự nhiên',
      motion: {
        arrowD: "M 0 0",
        label: "",
        showSec: false
      },
      kinematicSteps: {
        start: 'Khoang miệng ở vị trí nghỉ sinh lý',
        motion: 'Cơ hàm và lưỡi hoàn toàn thả lỏng',
        pressure: 'Không có nén khí',
        release: 'Hít thở tự nhiên qua mũi'
      },
      vnMotionText: 'Trạng thái thư giãn bình thường.',
      target: {
        tonguePath: "M 165 265 C 175 250, 185 240, 205 238 C 240 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 320 215, 330 235, 326 255 C 323 262, 318 262, 316 255 C 314 240, 310 220, 300 208 Z",
        tipPoint: { cx: 190, cy: 240 },
        contactPoint: { show: false },
        burstPoint: { show: false },
        airStream: { show: false },
        popArrow: { show: false },
        desc: "Khoang miệng và lưỡi ở vị trí nghỉ sinh lý. Đầu lưỡi hạ thấp dưới răng cửa dưới, ngạc mềm hạ nhẹ thông với mũi.",
        badge: "Vị trí nghỉ tự nhiên"
      },
      vn: {
        tonguePath: "M 165 265 C 175 250, 185 240, 205 238 C 240 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 320 215, 330 235, 326 255 C 323 262, 318 262, 316 255 C 314 240, 310 220, 300 208 Z",
        tipPoint: { cx: 190, cy: 240 },
        contactPoint: { show: false },
        burstPoint: { show: false },
        airStream: { show: false },
        popArrow: { show: false },
        desc: "Khoang miệng và lưỡi ở vị trí nghỉ sinh lý.",
        badge: "Vị trí nghỉ tự nhiên"
      }
    }
  };

  const ARTICULATOR_INFO = {
    'alveolar': {
      title: '3. Gờ Lợi (Alveolar Ridge) — Trọng tâm số 1 tiếng Anh',
      desc: 'Dải thịt gồ ghề ngay sát chân răng cửa trên. Đây là điểm tựa cấu âm của /t/, /d/, /s/, /z/, /n/, /l/. Người Việt thường đập vào răng cửa (sai) thay vì ép chặt gờ lợi.',
      organ: 'Đầu lưỡi ➜ Gờ lợi trên',
      voicing: '/t/, /s/: Vô thanh | /d/, /z/: Hữu thanh'
    },
    'tongue-tip': {
      title: 'Đầu Lưỡi (Tongue Tip / Apex)',
      desc: 'Cơ quan cấu âm chủ động linh hoạt nhất. Đầu lưỡi chịu trách nhiệm tạo âm gờ lợi (/t/, /d/), kẹp răng (/θ/, /ð/), và âm xì (/s/, /z/). Cần cảm nhận rõ vị trí đặt lưỡi trước khi bật hơi.',
      organ: 'Đầu lưỡi (Active Articulator)',
      voicing: 'Tùy thuộc âm vị'
    },
    'velum': {
      title: '5. Ngạc Mềm & Lưỡi Gà (Soft Palate / Velum)',
      desc: 'Chiếc van cơ học đóng mở khoang mũi. Khi nâng lên đóng kín: tạo các âm miệng (/k/, /g/, /p/, /t/). Khi hạ xuống mở thông: hơi thoát lên mũi tạo /m/, /n/, /ŋ/.',
      organ: 'Gốc lưỡi ➜ Ngạc mềm',
      voicing: '/k/: Vô thanh | /ɡ/, /ŋ/: Hữu thanh'
    },
    'vocal-cords': {
      title: 'Dây Thanh Âm (Vocal Folds) — Cảm ứng rung thanh quản',
      desc: 'Nằm trong sụn thanh quản (trái cổ). Khép rung dữ dội = Âm Hữu Thanh (Voiced: /d/, /z/, /ɡ/, /b/, /v/). Mở rộng chỉ có luồng gió = Âm Vô Thanh (Voiceless: /t/, /s/, /k/, /p/, /f/, /θ/).',
      organ: 'Dây thanh âm (Glottis)',
      voicing: 'Máy phát rung âm thanh'
    },
    'hard-palate': {
      title: '4. Ngạc Cứng (Hard Palate) — Vòm họng cứng',
      desc: 'Phần mái vòm hình cung có xương nâng đỡ, trơn láng. Thân lưỡi nâng ép sát vòm ngạc cứng để tạo âm /j/ (yes, user) và phối hợp với gờ lợi tạo /ʃ/, /tʃ/, /dʒ/.',
      organ: 'Thân lưỡi ➜ Vòm ngạc cứng',
      voicing: '/j/: Hữu thanh | /ʃ/: Vô thanh'
    },
    'lips': {
      title: '1. Môi (Lips) — Âm Hai Môi (Bilabial)',
      desc: 'Môi trên và môi dưới mím chặt chặn kín luồng khí nén sau miệng rồi bung ra tạo /p/, /b/, hoặc khép ngân tạo /m/. Người Việt hay lẫn lộn /p/ thành /b/.',
      organ: 'Môi trên ➜ Môi dưới',
      voicing: '/p/: Vô thanh | /b/, /m/: Hữu thanh'
    },
    'teeth': {
      title: '2. Răng Cửa (Incisors) — Âm Răng & Kẹp Răng',
      desc: 'Răng cửa trên và dưới đóng vai trò chướng ngại vật tạo tiếng rít sắc cho /s/, /z/, hoặc kẹp đầu lưỡi ở giữa tạo /θ/, /ð/.',
      organ: 'Răng cửa trên & dưới',
      voicing: 'Cơ quan thụ động'
    }
  };

  function renderSagittalSound(soundKey, mode) {
    currentSagittalSound = soundKey || currentSagittalSound || '/t/';
    currentSagittalMode = mode || currentSagittalMode || 'target';

    const soundCfg = SAGITTAL_DATA[currentSagittalSound] || SAGITTAL_DATA['/t/'];
    const modeCfg = soundCfg[currentSagittalMode] || soundCfg.target;

    // 1. Update Buttons Active States
    document.querySelectorAll('.sound-tab-btn').forEach(btn => {
      const match = btn.getAttribute('data-sound') === currentSagittalSound;
      btn.classList.toggle('active', match);
    });

    const btnTarget = document.getElementById('btn-sagittal-target');
    const btnVn = document.getElementById('btn-sagittal-vn');
    if (btnTarget && btnVn) {
      if (currentSagittalMode === 'target') {
        btnTarget.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm transition';
        btnVn.className = 'px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-rose-300 transition';
      } else {
        btnTarget.className = 'px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-emerald-300 transition';
        btnVn.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm transition';
      }
    }

    // 2. Update Tongue & Velum SVG Paths
    const tongueShape = document.getElementById('svg-tongue-shape');
    if (tongueShape && modeCfg.tonguePath) {
      tongueShape.setAttribute('d', modeCfg.tonguePath);
    }

    const velum = document.getElementById('svg-part-velum');
    if (velum && modeCfg.velumPath) {
      velum.setAttribute('d', modeCfg.velumPath);
    }

    // 3. Update Tongue Tip Marker
    const tipMarker = document.getElementById('svg-part-tongue-tip');
    if (tipMarker && modeCfg.tipPoint) {
      tipMarker.setAttribute('cx', modeCfg.tipPoint.cx);
      tipMarker.setAttribute('cy', modeCfg.tipPoint.cy);
    }

    // 4. Update Contact Glow Point
    const contactGlow = document.getElementById('svg-contact-glow');
    if (contactGlow) {
      if (modeCfg.contactPoint && modeCfg.contactPoint.show) {
        contactGlow.style.display = 'block';
        contactGlow.setAttribute('cx', modeCfg.contactPoint.cx);
        contactGlow.setAttribute('cy', modeCfg.contactPoint.cy);
        contactGlow.setAttribute('fill', modeCfg.contactPoint.color || '#38bdf8');
      } else {
        contactGlow.style.display = 'none';
      }
    }

    // 5. Update Burst Ripple
    const burstRipple = document.getElementById('svg-burst-ripple');
    if (burstRipple) {
      if (modeCfg.burstPoint && modeCfg.burstPoint.show) {
        burstRipple.style.display = 'block';
        burstRipple.setAttribute('cx', modeCfg.burstPoint.cx);
        burstRipple.setAttribute('cy', modeCfg.burstPoint.cy);
      } else {
        burstRipple.style.display = 'none';
      }
    }

    // 6. Update Airstream Path & Pop Arrow
    const airstream = document.getElementById('svg-airstream-path');
    if (airstream) {
      if (modeCfg.airStream && modeCfg.airStream.show) {
        airstream.style.display = 'block';
        airstream.setAttribute('d', modeCfg.airStream.d);
      } else {
        airstream.style.display = 'none';
      }
    }

    const popArrow = document.getElementById('svg-pop-arrow');
    if (popArrow) {
      if (modeCfg.popArrow && modeCfg.popArrow.show) {
        popArrow.style.display = 'block';
        popArrow.setAttribute('d', modeCfg.popArrow.d);
      } else {
        popArrow.style.display = 'none';
      }
    }

    // 7. Update Vocal Cords Voicing Class
    const vocalCords = document.getElementById('svg-part-vocal-cords');
    if (vocalCords) {
      const isVoicedSound = currentSagittalSound.includes('/d/') || currentSagittalSound.includes('/ð/') || currentSagittalSound.includes('/z/') || currentSagittalSound.includes('/ɡ/') || currentSagittalSound.includes('/b/');
      if (isVoicedSound) {
        vocalCords.classList.add('sagittal-vibrate');
        vocalCords.setAttribute('fill', '#c084fc');
        vocalCords.setAttribute('stroke', '#a855f7');
      } else {
        vocalCords.classList.remove('sagittal-vibrate');
        vocalCords.setAttribute('fill', '#ef4444');
        vocalCords.setAttribute('stroke', '#ef4444');
      }
    }

    // 8. Update Motion Direction Vector Arrows and Text
    const motionArrow = document.getElementById('svg-motion-arrow');
    const motionLabel = document.getElementById('svg-motion-label');
    const motionArrowSec = document.getElementById('svg-motion-arrow-sec');
    const motionLabelSec = document.getElementById('svg-motion-label-sec');

    const motionCfg = soundCfg.motion;
    if (motionCfg && motionCfg.label && currentSagittalMode === 'target') {
      if (motionArrow) {
        motionArrow.style.display = 'block';
        motionArrow.setAttribute('d', motionCfg.arrowD);
        motionArrow.setAttribute('marker-end', motionCfg.arrowMarker);
        motionArrow.setAttribute('stroke', motionCfg.arrowStroke);
      }
      if (motionLabel) {
        motionLabel.style.display = 'block';
        motionLabel.textContent = motionCfg.label;
        motionLabel.setAttribute('x', motionCfg.labelX);
        motionLabel.setAttribute('y', motionCfg.labelY);
        motionLabel.setAttribute('fill', motionCfg.labelColor);
      }
      if (motionCfg.showSec) {
        if (motionArrowSec) {
          motionArrowSec.style.display = 'block';
          motionArrowSec.setAttribute('d', motionCfg.arrowSecD);
          motionArrowSec.setAttribute('marker-end', motionCfg.arrowSecMarker);
          motionArrowSec.setAttribute('stroke', motionCfg.arrowSecStroke);
        }
        if (motionLabelSec) {
          motionLabelSec.style.display = 'block';
          motionLabelSec.textContent = motionCfg.labelSec;
          motionLabelSec.setAttribute('x', motionCfg.labelSecX);
          motionLabelSec.setAttribute('y', motionCfg.labelSecY);
          motionLabelSec.setAttribute('fill', motionCfg.labelSecColor);
        }
      } else {
        if (motionArrowSec) motionArrowSec.style.display = 'none';
        if (motionLabelSec) motionLabelSec.style.display = 'none';
      }
    } else {
      if (motionArrow) motionArrow.style.display = 'none';
      if (motionLabel) motionLabel.style.display = 'none';
      if (motionArrowSec) motionArrowSec.style.display = 'none';
      if (motionLabelSec) motionLabelSec.style.display = 'none';
    }

    // 9. Update Kinematic Step Guide & VN Mistake Warning Text
    const stepStart = document.getElementById('kin-step-start');
    const stepMotion = document.getElementById('kin-step-motion');
    const stepPressure = document.getElementById('kin-step-pressure');
    const stepRelease = document.getElementById('kin-step-release');
    const vnMotionAlert = document.getElementById('sagittal-vn-motion-text');

    if (soundCfg.kinematicSteps) {
      if (stepStart) stepStart.textContent = soundCfg.kinematicSteps.start;
      if (stepMotion) stepMotion.textContent = soundCfg.kinematicSteps.motion;
      if (stepPressure) stepPressure.textContent = soundCfg.kinematicSteps.pressure;
      if (stepRelease) stepRelease.textContent = soundCfg.kinematicSteps.release;
    }
    if (vnMotionAlert) {
      vnMotionAlert.textContent = soundCfg.vnMotionText || 'Lỗi người Việt: Đặt sai vị trí cơ quan tiếp xúc.';
    }

    // 10. Update Information Panel Text
    const statusSound = document.getElementById('sagittal-status-sound');
    const statusBadge = document.getElementById('sagittal-status-badge');
    const statusDesc = document.getElementById('sagittal-status-desc');
    const statusOrgan = document.getElementById('sagittal-status-organ');
    const statusVoicing = document.getElementById('sagittal-status-voicing');

    if (statusSound) statusSound.textContent = soundCfg.soundName;
    if (statusBadge) {
      statusBadge.textContent = modeCfg.badge;
      if (currentSagittalMode === 'target') {
        statusBadge.className = 'text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800';
      } else {
        statusBadge.className = 'text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800';
      }
    }
    if (statusDesc) statusDesc.textContent = modeCfg.desc;
    if (statusOrgan) statusOrgan.textContent = soundCfg.organText;
    if (statusVoicing) statusVoicing.textContent = soundCfg.voicing;

    // 11. Sync with Side-by-Side Mouth-Map card (Feature 006)
    loadMouthMap(currentSagittalSound);
  }

  function showArticulatorDetails(partKey) {
    const info = ARTICULATOR_INFO[partKey];
    if (!info) return;

    // Highlight chip
    document.querySelectorAll('.articulator-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-part') === partKey);
    });

    const statusSound = document.getElementById('sagittal-status-sound');
    const statusBadge = document.getElementById('sagittal-status-badge');
    const statusDesc = document.getElementById('sagittal-status-desc');
    const statusOrgan = document.getElementById('sagittal-status-organ');
    const statusVoicing = document.getElementById('sagittal-status-voicing');

    if (statusSound) statusSound.textContent = info.title;
    if (statusBadge) {
      statusBadge.textContent = '📍 Cơ quan giải phẫu';
      statusBadge.className = 'text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800';
    }
    if (statusDesc) statusDesc.textContent = info.desc;
    if (statusOrgan) statusOrgan.textContent = info.organ;
    if (statusVoicing) statusVoicing.textContent = info.voicing;
  }

  function animateMouthMotion() {
    const soundKey = currentSagittalSound || '/t/';
    const btn = document.getElementById('btn-animate-mouth');
    if (btn) btn.textContent = '⏳ Đang phát âm...';

    const burstRipple = document.getElementById('svg-burst-ripple');
    const popArrow = document.getElementById('svg-pop-arrow');
    const contactGlow = document.getElementById('svg-contact-glow');

    if (burstRipple) burstRipple.style.display = 'none';
    if (popArrow) popArrow.style.display = 'none';

    // Step 2: Full Contact (400ms)
    setTimeout(() => {
      renderSagittalSound(soundKey, 'target');
      if (contactGlow) contactGlow.style.display = 'block';
    }, 400);

    // Step 3: Burst / Explosion (900ms)
    setTimeout(() => {
      if (burstRipple) {
        burstRipple.style.display = 'block';
        burstRipple.style.stroke = '#38bdf8';
      }
      if (popArrow) popArrow.style.display = 'block';
      if (soundKey === '/t/' || soundKey === '/d/') speakWord('commit');
      else if (soundKey === '/θ/') speakWord('auth');
      else if (soundKey === '/s/') speakWord('response');
      else if (soundKey === '/k/') speakWord('network');
      else if (soundKey === '/p/') speakWord('push');
      else if (soundKey === '/ʃ/') speakWord('crash');
    }, 900);

    // Step 4: Complete
    setTimeout(() => {
      if (btn) btn.textContent = '▶️ Xem chuyển động';
      renderSagittalSound(soundKey, currentSagittalMode);
    }, 2000);
  }

  function setupSagittalVocalTract() {
    // Sound tabs
    document.querySelectorAll('.sound-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sound = btn.getAttribute('data-sound');
        if (sound) renderSagittalSound(sound, currentSagittalMode);
      });
    });

    // Target vs VN Error toggle
    const btnTarget = document.getElementById('btn-sagittal-target');
    const btnVn = document.getElementById('btn-sagittal-vn');

    if (btnTarget) {
      btnTarget.addEventListener('click', () => {
        renderSagittalSound(currentSagittalSound, 'target');
      });
    }

    if (btnVn) {
      btnVn.addEventListener('click', () => {
        renderSagittalSound(currentSagittalSound, 'vn');
      });
    }

    // Articulator chips & svg pins
    document.querySelectorAll('.articulator-chip, .sagittal-pin').forEach(el => {
      el.addEventListener('click', (e) => {
        const part = el.getAttribute('data-part');
        if (part) showArticulatorDetails(part);
      });
    });

    // Animate button
    const btnAnimate = document.getElementById('btn-animate-mouth');
    if (btnAnimate) {
      btnAnimate.addEventListener('click', animateMouthMotion);
    }

    // Initial render
    renderSagittalSound('/t/', 'target');
  }
  // Dynamic Vocal Tract SVG Illumination & Sagittal Posture Sync
  function updateVocalTractSVG(lesson) {
    const symbol = (lesson?.phonetics?.phoneticSymbol || '').toLowerCase();
    const passive = (lesson?.phonetics?.passiveArticulator || '').toLowerCase();

    let targetSound = '/t/';
    if (symbol.includes('/θ/') || symbol.includes('/ð/') || passive.includes('teeth')) targetSound = '/θ/';
    else if (symbol.includes('/s/') || symbol.includes('/z/')) targetSound = '/s/';
    else if (symbol.includes('/ʃ/') || symbol.includes('/ʒ/')) targetSound = '/ʃ/';
    else if (symbol.includes('/k/') || symbol.includes('/g/') || symbol.includes('/ɡ/')) targetSound = '/k/';
    else if (symbol.includes('/p/') || symbol.includes('/b/') || symbol.includes('/m/')) targetSound = '/p/';

    renderSagittalSound(targetSound, currentSagittalMode || 'target');
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
      el.btnSimStandupSubmit.textContent = '⏳ AI Coach đang phân tích Standup...';
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
      el.btnSimDemoSubmit.textContent = '⏳ AI Coach đang phân tích Connected Speech...';
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

  // ==========================================
  // FEATURE 003: Analytics & Burndown Dashboard
  // ==========================================
  async function refreshAnalyticsData() {
    try {
      const [burndownRes, heatmapRes, badgesRes, velocityRes] = await Promise.all([
        fetch('/api/analytics/burndown').then(r => r.json()).catch(() => null),
        fetch('/api/analytics/heatmap').then(r => r.json()).catch(() => null),
        fetch('/api/analytics/badges').then(r => r.json()).catch(() => null),
        fetch('/api/analytics/velocity').then(r => r.json()).catch(() => null)
      ]);

      if (burndownRes) renderBurndownSvg(burndownRes);
      if (heatmapRes) renderHeatmapGrid(heatmapRes);
      if (badgesRes) renderBadgesShelf(badgesRes);
      if (velocityRes) renderVelocityList(velocityRes);
    } catch (err) {
      console.error('Failed to load analytics data', err);
    }
  }

  function renderBurndownSvg(data) {
    if (!el.svgBurndown) return;
    if (el.burndownPaceBadge) {
      el.burndownPaceBadge.textContent = data.paceStatus || 'Đúng tiến độ';
    }

    const svg = el.svgBurndown;
    svg.innerHTML = '';

    const width = 600;
    const height = 240;
    const padding = 35;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const points = data.points || [];
    const totalDays = data.totalDays || 90;

    // Grid lines & sprint demarcation
    const boundaries = data.sprintBoundaries || [30, 60, 90];
    boundaries.forEach(bDay => {
      const x = padding + (bDay / totalDays) * chartW;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', padding);
      line.setAttribute('x2', x);
      line.setAttribute('y2', padding + chartH);
      line.setAttribute('stroke', '#334155');
      line.setAttribute('stroke-dasharray', '4,4');
      svg.appendChild(line);
    });

    // Ideal Line: (Day 1 -> 90) down to (Day 90 -> 0)
    const idealPath = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    idealPath.setAttribute('x1', padding);
    idealPath.setAttribute('y1', padding);
    idealPath.setAttribute('x2', padding + chartW);
    idealPath.setAttribute('y2', padding + chartH);
    idealPath.setAttribute('stroke', '#64748b');
    idealPath.setAttribute('stroke-dasharray', '6,6');
    idealPath.setAttribute('stroke-width', '2');
    svg.appendChild(idealPath);

    // Actual Line
    if (points.length > 0) {
      let d = '';
      points.forEach((pt, idx) => {
        const x = padding + (pt.dayNumber / totalDays) * chartW;
        const y = padding + (1 - pt.actualRemainingDays / totalDays) * chartH;
        d += (idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
      });

      const actualPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      actualPath.setAttribute('d', d);
      actualPath.setAttribute('fill', 'none');
      actualPath.setAttribute('stroke', '#22d3ee');
      actualPath.setAttribute('stroke-width', '3');
      actualPath.setAttribute('stroke-linecap', 'round');
      svg.appendChild(actualPath);
    }
  }

  function renderHeatmapGrid(cells) {
    if (!el.heatmapGrid) return;
    el.heatmapGrid.innerHTML = '';

    (cells || []).forEach(cell => {
      const div = document.createElement('div');
      div.className = `heatmap-cell heatmap-intensity-${cell.intensityLevel}`;
      div.title = `Ngày ${cell.dayNumber} (${cell.dateIso}): ${cell.actualMinutes}m // ${cell.status}`;
      div.addEventListener('mouseenter', () => {
        if (el.heatmapTooltipInfo) {
          el.heatmapTooltipInfo.textContent = `Ngày ${cell.dayNumber}: ${cell.actualMinutes}m (${cell.selfRating > 0 ? cell.selfRating + '★' : cell.status})`;
        }
      });
      el.heatmapGrid.appendChild(div);
    });
  }

  function renderBadgesShelf(badges) {
    if (!el.badgesShelf) return;
    el.badgesShelf.innerHTML = '';

    (badges || []).forEach(badge => {
      const div = document.createElement('div');
      div.className = `badge-card p-3 rounded-xl border ${badge.isUnlocked ? 'unlocked' : 'locked border-slate-800 bg-slate-950/60'}`;
      div.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="text-2xl">${badge.emoji}</div>
          <div>
            <div class="font-bold text-xs ${badge.isUnlocked ? 'text-amber-300' : 'text-slate-400'}">${badge.name}</div>
            <div class="text-[10px] text-slate-400 leading-snug">${badge.description}</div>
            <div class="text-[9px] font-mono mt-1 ${badge.isUnlocked ? 'text-emerald-400' : 'text-slate-500'}">
              ${badge.isUnlocked ? 'ĐÃ MỞ KHÓA' : `Cần chuỗi ${badge.requiredStreak} ngày`}
            </div>
          </div>
        </div>
      `;
      el.badgesShelf.appendChild(div);
    });
  }

  function renderVelocityList(velocity) {
    if (!el.velocityContainer) return;
    el.velocityContainer.innerHTML = '';

    (velocity || []).forEach(v => {
      const div = document.createElement('div');
      div.className = `p-2 rounded-lg bg-slate-950 border ${v.isCurrentWeek ? 'border-purple-600' : 'border-slate-800'} flex items-center justify-between text-[11px]`;
      div.innerHTML = `
        <div>
          <span class="font-bold text-slate-200">${v.weekLabel}</span>
          ${v.isCurrentWeek ? '<span class="text-purple-400 ml-1 font-mono text-[9px]">(Hiện tại)</span>' : ''}
        </div>
        <div class="font-mono text-slate-300 flex items-center gap-2">
          <span>${v.sessionsCompleted}/7 buổi</span>
          <span class="text-cyan-400 font-bold">${v.totalMinutes}m</span>
        </div>
      `;
      el.velocityContainer.appendChild(div);
    });
  }

  // ==========================================
  // FEATURE 004: Shadowing Studio & Waveforms
  // ==========================================
  const shadowingState = {
    targetSentence: "Yesterday, I focused on the deployment pipeline, specifically optimizing the build cache.",
    speed: 1.0,
    refDuration: 3.5,
    userDuration: 0,
    mediaRecorder: null,
    audioChunks: [],
    userAudioBlob: null,
    userAudioUrl: null,
    activeTrack: 'reference'
  };

  async function initShadowingStudio() {
    try {
      const refData = await fetch(`/api/shadowing/reference/${state.currentDay}`).then(r => r.json());
      if (refData && refData.sentenceFrame) {
        shadowingState.targetSentence = refData.sentenceFrame;
        shadowingState.refDuration = refData.targetDurationSeconds || 3.5;
        if (el.shadowSentenceText) el.shadowSentenceText.textContent = `"${refData.sentenceFrame}"`;
        if (el.shadowPhoneticCue) el.shadowPhoneticCue.textContent = `Âm trọng tâm: ${refData.phoneticGuide || '/coda/'}`;
        if (el.shadowRefDuration) el.shadowRefDuration.textContent = `${shadowingState.refDuration}s`;
      }
    } catch (e) {
      console.warn('Fallback reference shadowing data', e);
    }

    drawWaveform(el.canvasShadowRef, '#22d3ee', [20, 45, 60, 30, 75, 90, 40, 20, 65, 80, 50, 30, 70, 85, 25]);
    drawWaveform(el.canvasShadowUser, '#f59e0b', [10, 15, 20, 15, 10, 25, 30, 15, 10, 20, 25, 10]);

    setupShadowingControls();
  }

  function drawWaveform(canvas, color, samplePoints) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Center line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Bars
    ctx.fillStyle = color;
    const numBars = samplePoints.length * 3;
    const barW = Math.max(2, w / numBars - 2);

    for (let i = 0; i < numBars; i++) {
      const val = samplePoints[i % samplePoints.length];
      const barH = (val / 100) * (h * 0.8);
      const x = i * (barW + 2);
      const y = (h - barH) / 2;
      ctx.fillRect(x, y, barW, barH);
    }
  }

  function setupShadowingControls() {
    // Speed buttons
    document.querySelectorAll('.shadow-speed-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.shadow-speed-btn').forEach(b => b.classList.remove('active', 'bg-cyan-500', 'text-slate-950'));
        btn.classList.add('active', 'bg-cyan-500', 'text-slate-950');
        shadowingState.speed = parseFloat(btn.dataset.speed || '1.0');
      };
    });

    // Reference Play
    if (el.btnShadowRefPlay) {
      el.btnShadowRefPlay.onclick = () => playShadowingReference();
    }

    // User Record
    if (el.btnShadowRecord) {
      el.btnShadowRecord.onclick = () => toggleShadowingRecording();
    }

    // B2B Compare
    if (el.btnShadowCompareB2b) {
      el.btnShadowCompareB2b.onclick = () => playBackToBack();
    }

    // Toggle A/B
    if (el.btnShadowToggleAb) {
      el.btnShadowToggleAb.onclick = () => toggleShadowingAb();
    }

    // AI Feedback
    if (el.btnShadowAiFeedback) {
      el.btnShadowAiFeedback.onclick = () => evaluateShadowingWithAi();
    }
  }

  function playShadowingReference() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(shadowingState.targetSentence);
    u.lang = 'en-US';
    u.rate = shadowingState.speed;
    window.speechSynthesis.speak(u);
  }

  async function toggleShadowingRecording() {
    if (shadowingState.mediaRecorder && shadowingState.mediaRecorder.state === 'recording') {
      shadowingState.mediaRecorder.stop();
      if (el.shadowRecordLabel) el.shadowRecordLabel.textContent = 'Thu âm giọng bạn';
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      shadowingState.mediaRecorder = new MediaRecorder(stream);
      shadowingState.audioChunks = [];
      const startTime = Date.now();

      shadowingState.mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) shadowingState.audioChunks.push(e.data);
      };

      shadowingState.mediaRecorder.onstop = () => {
        const duration = Math.round((Date.now() - startTime) / 100) / 10;
        shadowingState.userDuration = duration;
        if (el.shadowUserDuration) el.shadowUserDuration.textContent = `${duration}s`;

        shadowingState.userAudioBlob = new Blob(shadowingState.audioChunks, { type: 'audio/webm' });
        shadowingState.userAudioUrl = URL.createObjectURL(shadowingState.userAudioBlob);

        // Render dynamic wave
        drawWaveform(el.canvasShadowUser, '#f59e0b', [25, 55, 75, 45, 80, 95, 60, 35, 70, 85, 40, 20]);
        stream.getTracks().forEach(t => t.stop());
      };

      shadowingState.mediaRecorder.start();
      if (el.shadowRecordLabel) el.shadowRecordLabel.textContent = 'Đang thu... Bấm để dừng';
    } catch (e) {
      console.warn('Microphone error', e);
      alert('Không thể truy cập microphone. Vui lòng cấp quyền trong trình duyệt.');
    }
  }

  function playBackToBack() {
    playShadowingReference();
    const refDurationMs = (shadowingState.refDuration / shadowingState.speed) * 1000;
    setTimeout(() => {
      if (shadowingState.userAudioUrl) {
        const audio = new Audio(shadowingState.userAudioUrl);
        audio.play();
      }
    }, refDurationMs + 500);
  }

  function toggleShadowingAb() {
    if (shadowingState.activeTrack === 'reference') {
      shadowingState.activeTrack = 'user';
      if (el.shadowActiveTrack) el.shadowActiveTrack.textContent = 'Giọng bạn 🔊';
      if (shadowingState.userAudioUrl) {
        const audio = new Audio(shadowingState.userAudioUrl);
        audio.play();
      }
    } else {
      shadowingState.activeTrack = 'reference';
      if (el.shadowActiveTrack) el.shadowActiveTrack.textContent = 'Mẫu 🔊';
      playShadowingReference();
    }
  }

  async function evaluateShadowingWithAi() {
    if (!el.btnShadowAiFeedback) return;
    el.btnShadowAiFeedback.disabled = true;
    el.btnShadowAiFeedback.textContent = '⏳ Đang phân tích nhịp điệu...';

    try {
      const res = await fetch('/api/shadowing/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: state.currentDay,
          targetSentence: shadowingState.targetSentence,
          referenceDurationSeconds: shadowingState.refDuration,
          userDurationSeconds: shadowingState.userDuration || shadowingState.refDuration * 0.85
        })
      });

      const data = await res.json();
      if (el.shadowPacingScore) el.shadowPacingScore.textContent = `${data.pacingScore || 90}/100`;
      if (el.shadowPacingDiagnosis) el.shadowPacingDiagnosis.textContent = `${data.pacingDiagnosis} (Tỷ lệ: ${data.speedRatio}x)`;
      if (el.shadowStressTip) el.shadowStressTip.textContent = data.stressTimingTip || '';

      if (el.shadowAlertsList) {
        el.shadowAlertsList.innerHTML = '';
        (data.articulatoryAlerts || []).forEach(alert => {
          const p = document.createElement('p');
          p.textContent = `⚠️ ${alert}`;
          el.shadowAlertsList.appendChild(p);
        });
      }
    } catch (e) {
      console.error('Shadowing feedback error', e);
    } finally {
      el.btnShadowAiFeedback.disabled = false;
      el.btnShadowAiFeedback.textContent = '⚡ Phân Tích Nhịp Điệu Cùng AI';
    }
  }


  // =========================================================================
  // FEATURES 005 - 011: ADVANCED CAPABILITIES SUITE
  // =========================================================================

  // --- Feature 010: IPA Glossary Tooltip Engine ---
  let ipaGlossary = {};
  let ipaPopoverEl = null;

  async function initIpaGlossary() {
    try {
      ipaGlossary = await fetch('/api/ipa/glossary').then(r => r.json());
      createGlobalIpaPopover();
      attachIpaTooltips();
    } catch (e) {
      console.warn('Failed to load IPA glossary', e);
    }
  }

  function createGlobalIpaPopover() {
    if (document.getElementById('global-ipa-popover')) return;
    ipaPopoverEl = document.createElement('div');
    ipaPopoverEl.id = 'global-ipa-popover';
    ipaPopoverEl.className = 'hidden';
    document.body.appendChild(ipaPopoverEl);
  }

  function attachIpaTooltips() {
    document.querySelectorAll('.ipa-interactive, [data-ipa]').forEach(el => {
      el.onmouseenter = e => showIpaPopover(e.target, el.dataset.ipa || el.textContent);
      el.onmouseleave = hideIpaPopover;
    });
  }

  function showIpaPopover(target, text) {
    if (!ipaPopoverEl) return;
    const cleanSym = (text.match(/\/[^/]+\//) || [text])[0];
    const data = ipaGlossary[cleanSym] || {
      symbol: cleanSym,
      soundCategory: 'Âm vị tiếng Anh',
      vietnameseEquivalent: 'Âm chuẩn giao tiếp kỹ thuật',
      physicalCueVi: 'Đặt lưỡi chính xác và giữ luồng hơi nén dứt khoát.',
      devExampleWords: ['code', 'data']
    };

    ipaPopoverEl.innerHTML = `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between border-b border-slate-700 pb-1">
          <span class="font-mono font-bold text-cyan-400 text-xs">${data.symbol}</span>
          <span class="text-[10px] text-slate-400">${data.soundCategory}</span>
        </div>
        <div class="text-[10px] text-amber-300 font-semibold">${data.vietnameseEquivalent}</div>
        <p class="text-[10px] text-slate-300 leading-snug">${data.physicalCueVi}</p>
        <div class="text-[10px] text-slate-400 font-mono">Ví dụ: ${data.devExampleWords.join(', ')}</div>
      </div>
    `;

    const rect = target.getBoundingClientRect();
    ipaPopoverEl.style.top = `${rect.bottom + window.scrollY + 6}px`;
    ipaPopoverEl.style.left = `${Math.max(10, rect.left + window.scrollX - 60)}px`;
    ipaPopoverEl.classList.remove('hidden');
  }

  function hideIpaPopover() {
    if (ipaPopoverEl) ipaPopoverEl.classList.add('hidden');
  }

  // --- Feature 006: Vietnamese Mouth-Map Loader ---
  async function loadMouthMap(targetSound) {
    try {
      const data = await fetch(`/api/mouthmap/${encodeURIComponent(targetSound || '/t/')}`).then(r => r.json());
      if (data) {
        const vnTitle = document.getElementById('mouth-vn-title');
        const vnDesc = document.getElementById('mouth-vn-desc');
        const enTitle = document.getElementById('mouth-en-title');
        const enDesc = document.getElementById('mouth-en-desc');
        const alertBox = document.getElementById('mouth-alert-box');

        if (vnTitle) vnTitle.textContent = data.vietnameseHabitTitle;
        if (vnDesc) vnDesc.textContent = data.vietnameseHabitDescription;
        if (enTitle) enTitle.textContent = data.englishTargetTitle;
        if (enDesc) enDesc.textContent = data.englishTargetDescription;
        if (alertBox) alertBox.innerHTML = `${data.commonMistakeAlertVi} <strong>Giải pháp cơ học:</strong> ${data.kinestheticFixInstruction}`;
      }
    } catch (e) {
      console.warn('Mouth map load fallback', e);
    }
  }

  // --- Feature 011: Collapsible Accordion Blocks ---
  function setupCollapsibleBlocks() {
    const btnToggle1 = document.getElementById('btn-toggle-stage-1');
    const btnToggle2 = document.getElementById('btn-toggle-stage-2');
    const btnToggle3 = document.getElementById('btn-toggle-stage-3');
    const btnToggleAll = document.getElementById('btn-toggle-all-blocks');

    const card1 = document.getElementById('stage-1-card');
    const card2 = document.getElementById('stage-2-card');
    const card3 = document.getElementById('stage-3-card');

    const toggle = (card, btn) => {
      if (!card) return;
      const isCollapsed = card.classList.toggle('collapsed');
      if (btn) btn.textContent = isCollapsed ? '▶' : '▼';
    };

    if (btnToggle1) btnToggle1.onclick = () => toggle(card1, btnToggle1);
    if (btnToggle2) btnToggle2.onclick = () => toggle(card2, btnToggle2);
    if (btnToggle3) btnToggle3.onclick = () => toggle(card3, btnToggle3);

    let allCollapsed = false;
    if (btnToggleAll) {
      btnToggleAll.onclick = () => {
        allCollapsed = !allCollapsed;
        [card1, card2, card3].forEach(c => {
          if (c) {
            if (allCollapsed) c.classList.add('collapsed');
            else c.classList.remove('collapsed');
          }
        });
        [btnToggle1, btnToggle2, btnToggle3].forEach(b => {
          if (b) b.textContent = allCollapsed ? '▶' : '▼';
        });
      };
    }
  }

  // Timer Phase Sync: Auto expand block based on 30m Pomodoro
  function syncBlocksWithTimer(remainingSeconds) {
    const card1 = document.getElementById('stage-1-card');
    const card2 = document.getElementById('stage-2-card');
    const card3 = document.getElementById('stage-3-card');
    const phaseLabel = document.getElementById('active-phase-indicator');

    if (!card1 || !card2 || !card3) return;

    if (remainingSeconds > 20 * 60) {
      // 0 - 10 mins: Phonetics
      card1.classList.remove('collapsed');
      card2.classList.add('collapsed');
      card3.classList.add('collapsed');
      if (phaseLabel) phaseLabel.textContent = "Chặng 1: 0-10m Cơ Học Khẩu Hình";
    } else if (remainingSeconds > 10 * 60) {
      // 10 - 20 mins: Frames
      card1.classList.add('collapsed');
      card2.classList.remove('collapsed');
      card3.classList.add('collapsed');
      if (phaseLabel) phaseLabel.textContent = "Chặng 2: 10-20m Khung Câu Kỹ Thuật";
    } else {
      // 20 - 30 mins: Output & AI
      card1.classList.add('collapsed');
      card2.classList.add('collapsed');
      card3.classList.remove('collapsed');
      if (phaseLabel) phaseLabel.textContent = "Chặng 3: 20-30m Luyện Nói & Chấm Điểm AI";
    }
  }

  // --- Feature 005: Micro-Lesson Mode ---
  function setupMicroLesson() {
    const modal = document.getElementById('modal-microlesson');
    const btnOpen1 = document.getElementById('btn-open-microlesson');
    const btnOpen2 = document.getElementById('btn-quick-10m-inline');
    const btnClose = document.getElementById('btn-close-microlesson');

    const open = () => modal?.classList.remove('hidden');
    const close = () => modal?.classList.add('hidden');

    if (btnOpen1) btnOpen1.onclick = open;
    if (btnOpen2) btnOpen2.onclick = open;
    if (btnClose) btnClose.onclick = close;

    document.querySelectorAll('.micro-block-choice').forEach(btn => {
      btn.onclick = async () => {
        const block = btn.dataset.block || 'Phonetics';
        try {
          const res = await fetch('/api/progress/micro-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dayNumber: state.currentDay,
              selectedBlock: block,
              actualMinutes: 10
            })
          });
          const data = await res.json();
          alert(data.message || `Đã hoàn thành chặng 10m (${block})!`);
          close();
          fetchInitialData();
        } catch (e) {
          console.error('Micro complete error', e);
        }
      };
    });
  }

  // --- Feature 007: Spaced Repetition 2-Minute Warm-Up ---
  let warmupBatch = [];
  let warmupIndex = 0;
  let warmupTimerId = null;
  let warmupSecondsLeft = 120;

  function setupSrsWarmup() {
    const btnOpen = document.getElementById('btn-open-warmup');
    const modal = document.getElementById('modal-srs-warmup');
    const btnSkip = document.getElementById('btn-skip-warmup');
    const btnPass = document.getElementById('btn-warmup-pass');
    const btnFail = document.getElementById('btn-warmup-fail');
    const btnListen = document.getElementById('btn-warmup-listen');

    if (btnOpen) btnOpen.onclick = startWarmupRound;
    if (btnSkip) btnSkip.onclick = closeWarmupModal;

    if (btnListen) {
      btnListen.onclick = () => {
        const item = warmupBatch[warmupIndex];
        if (item && window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(item.wordOrPhrase);
          u.lang = 'en-US';
          window.speechSynthesis.speak(u);
        }
      };
    }

    if (btnPass) {
      btnPass.onclick = () => recordWarmupItem(100);
    }
    if (btnFail) {
      btnFail.onclick = () => recordWarmupItem(40);
    }
  }

  async function startWarmupRound() {
    try {
      const batch = await fetch('/api/srs/warmup').then(r => r.json());
      if (batch.shouldSkipWarmup || !batch.items || batch.items.length === 0) {
        alert('Không có từ vựng cần ôn tập hôm nay! Hệ thống sẵn sàng vào thẳng bài học.');
        return;
      }
      warmupBatch = batch.items;
      warmupIndex = 0;
      warmupSecondsLeft = 120;

      const modal = document.getElementById('modal-srs-warmup');
      modal?.classList.remove('hidden');

      renderWarmupCard();
      startWarmupTimer();
    } catch (e) {
      console.warn('Warmup fetch error', e);
    }
  }

  function renderWarmupCard() {
    if (warmupIndex >= warmupBatch.length) {
      closeWarmupModal();
      alert('🎯 Hoàn thành khởi động 2 phút! Sẵn sàng vào bài học hôm nay.');
      return;
    }
    const item = warmupBatch[warmupIndex];
    const wordEl = document.getElementById('warmup-word');
    const phonemeEl = document.getElementById('warmup-phoneme');
    const contextEl = document.getElementById('warmup-context');
    const stepEl = document.getElementById('warmup-step-indicator');

    if (wordEl) wordEl.textContent = item.wordOrPhrase;
    if (phonemeEl) phonemeEl.textContent = `Âm mục tiêu: ${item.targetPhoneme}`;
    if (contextEl) contextEl.textContent = `"${item.contextSentence}"`;
    if (stepEl) stepEl.textContent = `Từ ${warmupIndex + 1} / ${warmupBatch.length} // Hộp ${item.box}`;
  }

  async function recordWarmupItem(score) {
    const item = warmupBatch[warmupIndex];
    if (item) {
      fetch('/api/srs/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.itemId, score: score })
      }).catch(() => {});
    }
    warmupIndex++;
    renderWarmupCard();
  }

  function startWarmupTimer() {
    clearInterval(warmupTimerId);
    const timerEl = document.getElementById('warmup-timer');
    warmupTimerId = setInterval(() => {
      warmupSecondsLeft--;
      if (warmupSecondsLeft <= 0) {
        clearInterval(warmupTimerId);
        closeWarmupModal();
        alert("⏰ Hết 2 phút khởi động! Hãy bắt đầu buổi học chính.");
      } else {
        const m = String(Math.floor(warmupSecondsLeft / 60)).padStart(2, '0');
        const s = String(warmupSecondsLeft % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
      }
    }, 1000);
  }

  function closeWarmupModal() {
    clearInterval(warmupTimerId);
    document.getElementById('modal-srs-warmup')?.classList.add('hidden');
  }

  // --- Feature 008: Printable Sprint Cheat Sheet ---
  function setupCheatSheet() {
    const btnOpen = document.getElementById('btn-open-cheatsheet');
    const modal = document.getElementById('modal-cheatsheet');
    const btnClose = document.getElementById('btn-close-cheatsheet');
    const btnPrint = document.getElementById('btn-print-sheet');

    if (btnOpen) {
      btnOpen.onclick = async () => {
        const sprintId = state.currentDay <= 30 ? 1 : state.currentDay <= 60 ? 2 : 3;
        try {
          const sheet = await fetch(`/api/cheatsheet/${sprintId}`).then(r => r.json());
          renderCheatSheetBody(sheet);
          modal?.classList.remove('hidden');
        } catch (e) {
          console.error('Cheat sheet error', e);
        }
      };
    }

    if (btnClose) btnClose.onclick = () => modal?.classList.add('hidden');
    if (btnPrint) btnPrint.onclick = () => window.print();
  }

  function renderCheatSheetBody(sheet) {
    const body = document.getElementById('cheatsheet-printable-body');
    if (!body) return;

    body.innerHTML = `
      <div class="border-b-2 border-cyan-500 pb-3">
        <h1 class="text-xl font-bold text-white uppercase">${sheet.sprintTitle}</h1>
        <p class="text-xs text-cyan-300 font-semibold mt-1">🎯 Mục tiêu: ${sheet.focusObjective}</p>
      </div>

      <!-- Section 1: Top Sentence Frames -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">1. Khung Câu Standup & Demo Tiêu Biểu (10 Frames):</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          ${sheet.sentenceFrames.map(f => `
            <div class="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div class="font-bold text-slate-100 font-mono text-[11px]">${f.number}. ${f.templatePattern}</div>
              <div class="text-[10px] text-slate-400 italic">${f.translationVi}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section 2: Target Phonemes Table -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">2. Bảng Tra Cứu Âm Vị & Chỉ Dẫn Khẩu Hình:</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400">
                <th class="py-1 px-2 font-mono">Âm vị</th>
                <th class="py-1 px-2">Cơ học cấu âm</th>
                <th class="py-1 px-2 font-mono">Từ ví dụ IT</th>
              </tr>
            </thead>
            <tbody>
              ${sheet.targetPhonemes.map(p => `
                <tr class="border-b border-slate-800/60">
                  <td class="py-1 px-2 font-mono font-bold text-cyan-400">${p.symbol}</td>
                  <td class="py-1 px-2 text-slate-200">${p.mouthPlacementCueVi}</td>
                  <td class="py-1 px-2 font-mono text-amber-300">${p.devWords.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3: Essential Vocabulary -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold font-mono text-purple-400 uppercase tracking-wider">3. Từ Vựng Kỹ Thuật Trọng Tâm:</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
          ${sheet.essentialVocabulary.map(v => `
            <div class="p-1.5 rounded bg-slate-950 border border-slate-800">
              <div class="font-bold text-cyan-300">${v.word}</div>
              <div class="text-slate-400">${v.ipa}</div>
              <div class="text-slate-500 text-[9px] truncate">${v.meaningVi}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- Feature 009: 70% Good Enough Auto-Complete Checker ---
  async function checkAutoCompleteThreshold(totalWords, correctWords, failedWords, targetPhoneme) {
    try {
      const res = await fetch('/api/drill/check-threshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: state.currentDay,
          totalWordsCount: totalWords,
          correctWordsCount: correctWords,
          failedWords: failedWords,
          targetPhoneme: targetPhoneme
        })
      });

      const data = await res.json();
      if (data.thresholdReached) {
        const celebration = document.getElementById('autocomplete-celebration');
        const msg = document.getElementById('autocomplete-msg');
        if (celebration && msg) {
          msg.textContent = data.celebrationMessage;
          celebration.classList.remove('hidden');

          document.getElementById('btn-close-autocomplete').onclick = () => celebration.classList.add('hidden');
          document.getElementById('btn-finish-now').onclick = () => {
            celebration.classList.add('hidden');
            fetchInitialData();
          };
          document.getElementById('btn-keep-going').onclick = () => celebration.classList.add('hidden');
        }
      }
    } catch (e) {
      console.warn('Auto complete check fallback', e);
    }
  }

  // Initialize Advanced Capabilities Suite on Startup
  setTimeout(() => {
    initIpaGlossary();
    setupCollapsibleBlocks();
    setupMicroLesson();
    setupSrsWarmup();
    setupCheatSheet();
    setupSagittalVocalTract();
  }, 100);

})();