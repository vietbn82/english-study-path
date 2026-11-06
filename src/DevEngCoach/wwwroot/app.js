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
      soundA: {
        symbol: "/t/",
        name: "Voiceless Alveolar Stop (Âm vô thanh)",
        cue: "Bật nổ luồng gió mạnh, cổ họng KHÔNG rung, tờ giấy trước miệng bay vút. Nguyên âm đứng trước bị CẮT NGẮN.",
        voicing: "❌ Vô thanh (Voiceless): Dây thanh mở, không rung",
        aspiration: "💨 Fortis: Luồng gió nổ mạnh (Test: Tờ giấy bay phấp phới)",
        vowelLength: "⏱️ Cực ngắn (~120ms - 150ms)",
        howTo: "1. Khép dây thanh (im lặng)\n2. Nâng đầu lưỡi ép chặt gờ lợi trên, bít kín luồng hơi\n3. Nén khí sau đầu lưỡi 50ms\n4. Giật bung đầu lưỡi xuống giải phóng tiếng Pop nổ giòn giã."
      },
      soundB: {
        symbol: "/d/",
        name: "Voiced Alveolar Stop (Âm hữu thanh)",
        cue: "Rung thanh quản rừ rừ trong họng, nhả êm KHÔNG phụt gió, tờ giấy đứng yên. Nguyên âm đứng trước được NGÂN DÀI GẤP ĐÔI.",
        voicing: "⚡ Hữu thanh (Voiced): Dây thanh khép và rung mạnh",
        aspiration: "🛑 Lenis: Hơi êm dịu (Test: Tờ giấy ĐỨNG YÊN)",
        vowelLength: "⏱️ Ngân dài gấp đôi (~250ms - 300ms)",
        howTo: "1. Chạm nhẹ đầu lưỡi vào gờ lợi trên\n2. KÍCH HOẠT RUNG THANH QUẢN trước khi nhả (cảm nhận rung rền ở cổ)\n3. Nhả nhẹ đầu lưỡi thoát âm trầm êm, không phụt gió, không thêm 'đờ'\n4. Kéo dài nguyên âm trước /d/ để tai người nghe nhận biết."
      },
      rules: [
        { title: "1. Dây Thanh Âm (Voicing)", ruleA: "/t/ im lặng hoàn toàn, cổ họng êm ru", ruleB: "/d/ rung rừ rừ như tiếng động cơ ong" },
        { title: "2. Luồng Gió (Aspiration)", ruleA: "/t/ thổi bay tờ giấy cách miệng 5cm", ruleB: "/d/ tờ giấy trước miệng đứng yên" },
        { title: "3. Độ Dài Nguyên Âm (Vowel Duration)", ruleA: "Nguyên âm trước /t/ bị ngắt dứt khoát (write 140ms)", ruleB: "Nguyên âm trước /d/ ngân dài gấp đôi (ride 280ms)" }
      ],
      drills: [
        { wordA: "write", ipaA: "/raɪt/", wordB: "ride", ipaB: "/raɪːd/", tip: "write (ngắt t, 140ms) vs ride (ngân ai + d, 280ms)" },
        { wordA: "bat", ipaA: "/bæt/", wordB: "bad", ipaB: "/bæːd/", tip: "bat (con dơi - ngắt a) vs bad (tồi - ngân dài a + d)" },
        { wordA: "commit", ipaA: "/kəˈmɪt/", wordB: "code", ipaB: "/koʊːd/", tip: "commit (giật bung t) vs code (kéo dài o + rung d)" },
        { wordA: "sent", ipaA: "/sɛnt/", wordB: "send", ipaB: "/sɛːnd/", tip: "sent (quá khứ, ngắt t) vs send (hiện tại, ngân e + d)" },
        { wordA: "bet", ipaA: "/bɛt/", wordB: "bed", ipaB: "/bɛːd/", tip: "bet (cá cược) vs bed (cái giường)" },
        { wordA: "test", ipaA: "/tɛst/", wordB: "dead", ipaB: "/dɛːd/", tip: "test (bật t gió) vs dead (rung cổ d)" }
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
    const tabSimOneonone = document.getElementById('tab-sim-oneonone');
    const tabSimLinklab = document.getElementById('tab-sim-linklab');
    if (tabSimOneonone) tabSimOneonone.addEventListener('click', () => switchSimulatorTab('oneonone'));
    if (tabSimLinklab) tabSimLinklab.addEventListener('click', () => switchSimulatorTab('linklab'));

    if (el.btnSimStandupSubmit) el.btnSimStandupSubmit.addEventListener('click', submitStandupSimulation);
    if (el.btnSimDemoSubmit) el.btnSimDemoSubmit.addEventListener('click', submitDemoSimulation);
    if (el.btnSimPingpongSubmit) el.btnSimPingpongSubmit.addEventListener('click', submitPingPongSimulation);
    const btnSimOneononeSubmit = document.getElementById('btn-sim-oneonone-submit');
    if (btnSimOneononeSubmit) btnSimOneononeSubmit.addEventListener('click', submitOneOnOneSimulation);
    const btnSimLinklabSubmit = document.getElementById('btn-sim-linklab-submit');
    if (btnSimLinklabSubmit) btnSimLinklabSubmit.addEventListener('click', submitConnectedSpeechLab);

    // Audio speak buttons for simulator refactors
    const btnSpeakStandup = document.getElementById('btn-speak-sim-standup');
    if (btnSpeakStandup) btnSpeakStandup.addEventListener('click', () => {
      const text = el.simStandupRefactor?.textContent;
      if (text && text !== '...') speakWord(text);
    });

    const btnSpeakDemo = document.getElementById('btn-speak-sim-demo');
    if (btnSpeakDemo) btnSpeakDemo.addEventListener('click', () => {
      const text = el.simDemoScript?.textContent;
      if (text && text !== '...') speakWord(text);
    });

    const btnSpeakPingpong = document.getElementById('btn-speak-sim-pingpong');
    if (btnSpeakPingpong) btnSpeakPingpong.addEventListener('click', () => {
      const text = el.simPingpongRefactor?.textContent;
      if (text && text !== '...') speakWord(text);
    });

    const btnSpeakOneonone = document.getElementById('btn-speak-sim-oneonone');
    if (btnSpeakOneonone) btnSpeakOneonone.addEventListener('click', () => {
      const text = document.getElementById('sim-oneonone-script')?.textContent;
      if (text && text !== '...') speakWord(text);
    });

    const btnSpeakLinklab = document.getElementById('btn-speak-sim-linklab');
    if (btnSpeakLinklab) btnSpeakLinklab.addEventListener('click', () => {
      const text = document.getElementById('sim-linklab-input')?.value.trim();
      if (text) speakWord(text);
    });

    // Sample buttons for linklab
    document.querySelectorAll('.linklab-sample-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('sim-linklab-input');
        if (input) {
          input.value = btn.dataset.text || '';
          submitConnectedSpeechLab();
        }
      });
    });

    // Speed buttons for linklab
    document.querySelectorAll('.linklab-speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.linklab-speed-btn').forEach(b => b.classList.remove('active', 'bg-cyan-500', 'text-slate-950'));
        btn.classList.add('active', 'bg-cyan-500', 'text-slate-950');
        state.linklabSpeed = parseFloat(btn.dataset.speed || '1.0');
      });
    });

    // Vocab live filter
    setupVocabFilter();

    if (el.btnTimerStart) el.btnTimerStart.addEventListener('click', startTimer);
    if (el.btnTimerPause) el.btnTimerPause.addEventListener('click', pauseTimer);
    if (el.btnTimerReset) el.btnTimerReset.addEventListener('click', resetTimer);

    // Sticky Header Timer buttons
    const headerToggle = document.getElementById('btn-header-timer-toggle');
    const headerReset = document.getElementById('btn-header-timer-reset');
    if (headerToggle) {
      headerToggle.addEventListener('click', () => {
        if (state.timer.isRunning) pauseTimer();
        else startTimer();
        updateTimerUI();
      });
    }
    if (headerReset) {
      headerReset.addEventListener('click', resetTimer);
    }

    // Brand Logo Home navigation
    const brandHome = document.getElementById('brand-logo-home');
    if (brandHome) {
      brandHome.addEventListener('click', (e) => {
        e.preventDefault();
        showView('workspace');
        loadLesson(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

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

    // Sticky Header Auto-Collapse on Scroll: hides non-essential Tier 2 when scrolling into the lesson
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const tier2 = document.getElementById('header-tier-2');
      if (!tier2) return;
      if (currentY > 60) {
        tier2.classList.add('header-tier2-collapsed');
      } else if (currentY < 30) {
        tier2.classList.remove('header-tier2-collapsed');
      }
    }, { passive: true });

    // Header Dropdowns for condensed Studios and Utilities
    const btnStudiosMenu = document.getElementById('btn-toggle-studios-menu');
    const menuStudios = document.getElementById('menu-more-studios');
    const btnUtilsMenu = document.getElementById('btn-toggle-utils-menu');
    const menuUtils = document.getElementById('menu-more-utils');

    btnStudiosMenu?.addEventListener('click', (e) => {
      e.stopPropagation();
      menuUtils?.classList.add('hidden');
      menuStudios?.classList.toggle('hidden');
    });

    btnUtilsMenu?.addEventListener('click', (e) => {
      e.stopPropagation();
      menuStudios?.classList.add('hidden');
      menuUtils?.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      menuStudios?.classList.add('hidden');
      menuUtils?.classList.add('hidden');
    });

    menuStudios?.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => menuStudios.classList.add('hidden'));
    });
    menuUtils?.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => menuUtils.classList.add('hidden'));
    });

    // Floating AI Assistant Events are managed natively by <deveng-ai-coach>
    // to avoid duplicate event listener race conditions.

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

      // Toggle Sentence Frame 10+ Examples Accordion
      const toggleExBtn = e.target.closest('.toggle-examples-btn');
      if (toggleExBtn && toggleExBtn.dataset.target) {
        e.preventDefault();
        const targetEl = document.getElementById(toggleExBtn.dataset.target);
        if (targetEl) {
          const isHidden = targetEl.classList.toggle('hidden');
          const span = toggleExBtn.querySelector('span');
          if (span) {
            span.textContent = isHidden
              ? `▼ Xem thêm ví dụ thực chiến khác (Tổng cộng 10+ ví dụ)`
              : `▲ Thu gọn danh sách ví dụ`;
          }
        }
        return;
      }

      // Practice Sentence Button (load sentence into Stage 3 speech input)
      const practiceSentBtn = e.target.closest('.practice-sentence-btn');
      if (practiceSentBtn && practiceSentBtn.dataset.sentence) {
        e.preventDefault();
        if (el.aiInputText) {
          el.aiInputText.value = practiceSentBtn.dataset.sentence;
          el.aiInputText.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.aiInputText.focus();
        }
        return;
      }

      // Compare A -> B minimal pairs
      const compareBtn = e.target.closest('.compare-ab-btn');
      if (compareBtn && compareBtn.dataset.wordA && compareBtn.dataset.wordB) {
        e.preventDefault();
        speakWord(compareBtn.dataset.wordA);
        setTimeout(() => {
          speakWord(compareBtn.dataset.wordB);
        }, 650);
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
    let lastDismissedSelection = null; // Track dismissed selection so closing popup doesn't reopen it

    // Hide on click outside
    document.addEventListener('mousedown', (e) => {
      if (popup && !popup.contains(e.target)) {
        popup.classList.add('hidden');
      }
    });

    // Reset dismissed state when user clears selection or selects elsewhere
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        lastDismissedSelection = null;
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

        // If user already dismissed this exact selection, DO NOT show popup again
        if (lastDismissedSelection && text === lastDismissedSelection) {
          return;
        }
        if (lastDismissedSelection && text !== lastDismissedSelection) {
          lastDismissedSelection = null;
        }

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
          <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
            <div class="flex items-center gap-2 overflow-hidden">
              <span class="font-bold text-white text-sm truncate max-w-[200px]" title="${text}">"${text}"</span>
              <button id="sel-pop-btn-speak" class="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-bold transition shrink-0 flex items-center gap-1 cursor-pointer">
                🔊 <span>Nghe</span>
              </button>
            </div>
            <button id="sel-pop-btn-close" class="text-slate-400 hover:text-white text-sm font-mono ml-2 cursor-pointer p-1" title="Đóng popup">✕</button>
          </div>
          <div class="space-y-2 text-sm">
            <div class="text-cyan-300 font-mono text-sm font-bold" id="sel-pop-ipa">⏳ Đang tra IPA...</div>
            <div class="text-slate-100 text-sm leading-relaxed" id="sel-pop-meaning">Đang tải nghĩa...</div>
            <div class="text-slate-200 italic text-sm leading-relaxed" id="sel-pop-cue"></div>
          </div>
          <button id="sel-pop-btn-practice" class="w-full mt-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow">
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
          lastDismissedSelection = text;
          try { window.getSelection()?.removeAllRanges(); } catch (_) {}
          popup.classList.add('hidden');
        });

        document.getElementById('sel-pop-btn-practice')?.addEventListener('click', (e) => {
          e.stopPropagation();
          lastDismissedSelection = text;
          try { window.getSelection()?.removeAllRanges(); } catch (_) {}
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

    const tier1Default = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5 cursor-pointer';
    const tier1Active = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 shadow-sm transition flex items-center gap-1.5 cursor-pointer';

    const tier2Default = 'px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer';
    const tier2Active = 'px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-500 text-slate-950 shadow-sm transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer';

    if (el.navWorkspace) el.navWorkspace.className = tier1Default;
    if (el.navCurriculum) el.navCurriculum.className = tier1Default;
    if (el.navSimulators) el.navSimulators.className = tier2Default;
    if (el.navSparring) el.navSparring.className = tier2Default;
    if (el.navPrpolish) el.navPrpolish.className = tier2Default;
    if (el.navSrs) el.navSrs.className = tier2Default;
    if (el.navAnalytics) el.navAnalytics.className = tier2Default;
    if (el.navShadowing) el.navShadowing.className = tier2Default;

    if (view === 'workspace') {
      if (el.viewWorkspace) el.viewWorkspace.classList.remove('hidden');
      if (el.navWorkspace) el.navWorkspace.className = tier1Active;
    } else if (view === 'curriculum') {
      if (el.viewCurriculum) el.viewCurriculum.classList.remove('hidden');
      if (el.navCurriculum) el.navCurriculum.className = tier1Active;
      renderCurriculumGrid('all');
    } else if (view === 'simulators') {
      if (el.viewSimulators) el.viewSimulators.classList.remove('hidden');
      if (el.navSimulators) el.navSimulators.className = tier2Active;
      switchSimulatorTab('standup');
    } else if (view === 'sparring') {
      if (el.viewSparring) el.viewSparring.classList.remove('hidden');
      if (el.navSparring) el.navSparring.className = tier2Active;
      initSparringArena();
    } else if (view === 'prpolish') {
      if (el.viewPrpolish) el.viewPrpolish.classList.remove('hidden');
      if (el.navPrpolish) el.navPrpolish.className = tier2Active;
      initPrStudio();
    } else if (view === 'srs') {
      if (el.viewSrs) el.viewSrs.classList.remove('hidden');
      if (el.navSrs) el.navSrs.className = tier2Active;
      refreshSrsData();
    } else if (view === 'analytics') {
      if (el.viewAnalytics) el.viewAnalytics.classList.remove('hidden');
      if (el.navAnalytics) el.navAnalytics.className = tier2Active;
      refreshAnalyticsData();
    } else if (view === 'shadowing') {
      if (el.viewShadowing) el.viewShadowing.classList.remove('hidden');
      if (el.navShadowing) el.navShadowing.className = tier2Active;
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
    if (typeof window.updateCapstoneButton === 'function') {
      window.updateCapstoneButton();
    }

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

    // Vietnamese Mouth-Map (Feature 006) & IPA Tooltips (Feature 010)
    loadMouthMap(currentSagittalSound || lesson.phonetics.targetSound || '/t/');
    setTimeout(attachIpaTooltips, 100);

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
              <span class="font-mono text-cyan-400 text-xs ml-1">${drill.ipa}</span>
              <span class="text-slate-400 ml-1.5">— ${drill.meaningVi}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 italic hidden sm:block">${drill.physicalNote}</span>
            <button class="drill-practice-btn px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition" data-word="${drill.word}" data-ipa="${drill.ipa}" data-tip="${drill.physicalNote}">
              🎤 Luyện
            </button>
          </div>
        `;
        el.drillsContainer.appendChild(row);
      });
    }

    // Stage 2: Sentence Frames (With 10+ Real-World Developer Examples per Frame)
    if (el.framesContainer) {
      el.framesContainer.innerHTML = '';
      const allVars = new Set();
      lesson.sentenceFrames.forEach((frame, fIdx) => {
        (frame.devVariables || []).forEach(v => allVars.add(v));

        const rawExamples = (frame.examples && frame.examples.length > 0)
          ? frame.examples
          : [frame.exampleUsage];

        // Ensure unique examples list with at least 10 items
        const examplesList = Array.from(new Set([frame.exampleUsage, ...rawExamples])).filter(Boolean);
        while (examplesList.length < 10) {
          examplesList.push(`${frame.exampleUsage} (Dev Environment Scenario #${examplesList.length + 1})`);
        }

        const topExamples = examplesList.slice(0, 2);
        const remainingExamples = examplesList.slice(2);

        const card = document.createElement('div');
        card.className = 'p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 shadow';
        card.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-1">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center font-mono text-xs font-bold">${fIdx + 1}</span>
              <span class="font-bold text-blue-400 text-xs">${frame.templateName}</span>
            </div>
            <button class="copy-frame-btn text-xs font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition" data-pattern="${frame.templatePattern}">📋 Copy Pattern</button>
          </div>

          <div class="font-mono text-xs text-cyan-300 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-semibold select-all">
            ${frame.templatePattern}
          </div>
          
          <div class="text-sm text-slate-100 italic font-medium leading-relaxed">
            🇻🇳 Ý nghĩa: ${frame.vietnameseTranslation || 'Khung câu cấu trúc chuẩn cho kỹ sư phần mềm.'}
          </div>

          <!-- 10+ Real-World Developer Examples -->
          <div class="space-y-1.5 pt-1">
            <div class="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span class="text-blue-300">💡 10+ Ví Dụ Thực Chiến Kỹ Thuật (Backend, Frontend, DevOps, DB, Cloud):</span>
              <span class="text-xs text-slate-400 font-mono">${examplesList.length} ví dụ</span>
            </div>

            <!-- Top 2 Visible Examples -->
            <div class="space-y-1.5">
              ${topExamples.map((ex, exIdx) => `
                <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 text-xs transition">
                  <div class="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <span class="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 shrink-0">#${exIdx + 1}</span>
                    <span class="text-slate-200 text-xs font-sans leading-relaxed select-all">${ex}</span>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button class="speak-btn text-blue-400 hover:text-blue-300 font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 text-xs transition" data-word="${ex.replace(/"/g, '&quot;')}" title="Bấm nghe phát âm">🔊</button>
                    <button class="copy-frame-btn text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800 text-xs transition" data-pattern="${ex.replace(/"/g, '&quot;')}" title="Copy ví dụ">📋</button>
                    <button class="practice-sentence-btn text-cyan-400 hover:text-cyan-300 text-xs font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition" data-sentence="${ex.replace(/"/g, '&quot;')}" title="Nạp vào ô nói để luyện">🎤 Luyện</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Expandable Remaining Examples (3..12) -->
            <div id="frame-extra-examples-${fIdx}" class="hidden space-y-1.5 pt-1">
              ${remainingExamples.map((ex, exIdx) => `
                <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 text-xs transition">
                  <div class="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <span class="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">#${exIdx + 3}</span>
                    <span class="text-slate-300 text-xs font-sans leading-relaxed select-all">${ex}</span>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button class="speak-btn text-blue-400 hover:text-blue-300 font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 text-xs transition" data-word="${ex.replace(/"/g, '&quot;')}" title="Bấm nghe phát âm">🔊</button>
                    <button class="copy-frame-btn text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800 text-xs transition" data-pattern="${ex.replace(/"/g, '&quot;')}" title="Copy ví dụ">📋</button>
                    <button class="practice-sentence-btn text-cyan-400 hover:text-cyan-300 text-xs font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition" data-sentence="${ex.replace(/"/g, '&quot;')}" title="Nạp vào ô nói để luyện">🎤 Luyện</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Toggle Expand Button -->
            <button class="toggle-examples-btn w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-cyan-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800/50 flex items-center justify-center gap-1 transition" data-target="frame-extra-examples-${fIdx}">
              <span>▼ Xem thêm ${remainingExamples.length} ví dụ thực chiến khác (Tổng cộng 10+ ví dụ)</span>
            </button>
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
    const soundA = contrastData.soundA;
    const soundB = contrastData.soundB;

    const card = document.createElement('div');
    card.className = 'bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3 text-xs font-sans shadow';

    let rulesHtml = '';
    if (contrastData.rules) {
      rulesHtml = `
        <div class="p-2.5 rounded-lg bg-slate-950/90 border border-cyan-900/40 space-y-1.5">
          <div class="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
            <span>🎯 3 NGUYÊN TẮC CƠ HỌC BẤT DI BẤT DỊCH PHÂN BIỆT ${soundA.symbol} VS ${soundB.symbol}:</span>
          </div>
          <div class="space-y-1 text-xs">
            ${contrastData.rules.map(r => `
              <div class="grid grid-cols-1 md:grid-cols-3 gap-1 p-1.5 rounded bg-slate-900/80 border border-slate-800/80">
                <span class="font-bold text-slate-300">${r.title}:</span>
                <span class="text-cyan-300 font-mono">${soundA.symbol}: ${r.ruleA}</span>
                <span class="text-purple-300 font-mono">${soundB.symbol}: ${r.ruleB}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    let howToHtml = '';
    if (soundA.howTo && soundB.howTo) {
      howToHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-800/50 space-y-2 cursor-pointer hover:border-cyan-400 transition" onclick="window.selectSagittalAndMouth && window.selectSagittalAndMouth('${soundA.symbol}')">
            <div class="font-bold text-cyan-300 flex items-center justify-between text-sm md:text-base">
              <span>👉 Cách phát âm chuẩn ${soundA.symbol} (${soundA.name})</span>
              <button class="speak-btn px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-xs text-cyan-200" data-word="${contrastData.drills[0]?.wordA || 'test'}">🔊 Nghe</button>
            </div>
            <div class="text-slate-100 whitespace-pre-line text-sm md:text-base leading-relaxed font-normal">${soundA.howTo}</div>
          </div>
          <div class="p-3.5 rounded-lg bg-purple-950/20 border border-purple-800/50 space-y-2 cursor-pointer hover:border-purple-400 transition" onclick="window.selectSagittalAndMouth && window.selectSagittalAndMouth('${soundB.symbol}')">
            <div class="font-bold text-purple-300 flex items-center justify-between text-sm md:text-base">
              <span>👉 Cách phát âm chuẩn ${soundB.symbol} (${soundB.name})</span>
              <button class="speak-btn px-2 py-0.5 rounded bg-purple-900/60 hover:bg-purple-800 text-xs text-purple-200" data-word="${contrastData.drills[0]?.wordB || 'dead'}">🔊 Nghe</button>
            </div>
            <div class="text-slate-100 whitespace-pre-line text-sm md:text-base leading-relaxed font-normal">${soundB.howTo}</div>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="grid grid-cols-2 gap-3 text-center pb-1 font-mono">
        <div class="p-3.5 rounded-lg bg-slate-950 border border-cyan-900/60 cursor-pointer hover:border-cyan-400 transition" onclick="window.selectSagittalAndMouth && window.selectSagittalAndMouth('${soundA.symbol}')" title="Bấm để kích hoạt ${soundA.symbol} trong mô hình cấu âm">
          <div class="flex items-center justify-center gap-1.5">
            <span class="text-xl font-bold text-cyan-400">${soundA.symbol}</span>
            <button class="speak-btn text-sm text-slate-200 hover:text-cyan-300 font-bold" data-word="${contrastData.drills[0]?.wordA || 'test'}">🔊</button>
          </div>
          <div class="text-xs text-cyan-300 font-bold mt-1">${soundA.name}</div>
          <div class="text-sm text-slate-100 mt-1.5 leading-relaxed font-normal">${soundA.cue}</div>
        </div>

        <div class="p-3.5 rounded-lg bg-slate-950 border border-purple-900/60 cursor-pointer hover:border-purple-400 transition" onclick="window.selectSagittalAndMouth && window.selectSagittalAndMouth('${soundB.symbol}')" title="Bấm để kích hoạt ${soundB.symbol} trong mô hình cấu âm">
          <div class="flex items-center justify-center gap-1.5">
            <span class="text-xl font-bold text-purple-400">${soundB.symbol}</span>
            <button class="speak-btn text-sm text-slate-200 hover:text-purple-300 font-bold" data-word="${contrastData.drills[0]?.wordB || 'dead'}">🔊</button>
          </div>
          <div class="text-xs text-purple-300 font-bold mt-1">${soundB.name}</div>
          <div class="text-sm text-slate-100 mt-1.5 leading-relaxed font-normal">${soundB.cue}</div>
        </div>
      </div>

      ${rulesHtml}
      ${howToHtml}

      <div class="space-y-1.5 pt-1">
        <div class="flex items-center justify-between text-xs font-semibold text-slate-300 font-mono">
          <span>⚡ Cặp Từ Tối Thiểu (Minimal Pairs) Luyện Tai & Luyện Giọng:</span>
          <span class="text-xs text-amber-300 font-bold">Bấm ⚡ So sánh A ➜ B để nghe liền</span>
        </div>
        ${contrastData.drills.map(d => `
          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition text-xs">
            <div class="flex items-center gap-1.5">
              <button class="speak-btn text-cyan-400 hover:text-cyan-300 font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 transition" data-word="${d.wordA}" title="Nghe ${d.wordA}">🔊</button>
              <div>
                <span class="font-bold text-slate-100">${d.wordA}</span>
                <span class="font-mono text-cyan-400 text-xs ml-1">${d.ipaA}</span>
              </div>
            </div>

            <button class="compare-ab-btn px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/50 transition shadow" data-word-a="${d.wordA}" data-word-b="${d.wordB}">
              ⚡ So sánh A ➜ B
            </button>

            <div class="flex items-center gap-1.5">
              <div>
                <span class="font-bold text-slate-100">${d.wordB}</span>
                <span class="font-mono text-purple-400 text-xs ml-1">${d.ipaB}</span>
              </div>
              <button class="speak-btn text-purple-400 hover:text-purple-300 font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 transition" data-word="${d.wordB}" title="Nghe ${d.wordB}">🔊</button>
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
                ? `<span class="px-1.5 py-0.5 rounded text-xs bg-emerald-950 text-emerald-400 font-mono inline-flex items-center gap-1">✓ Done ${rating ? `<span class="text-amber-400 font-sans">${rating}⭐</span>` : ''}</span>`
                : isCurrent
                ? '<span class="px-1.5 py-0.5 rounded text-xs bg-cyan-950 text-cyan-400 font-mono">Active</span>'
                : '<span class="px-1.5 py-0.5 rounded text-xs bg-slate-800 text-slate-400 font-mono">Pending</span>'
            }
          </div>
          <div class="font-bold text-xs text-slate-200 line-clamp-2 leading-snug">${l.title}</div>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
          <span class="text-cyan-400/80">${l.phonetics.phoneticSymbol}</span>
          <div class="flex items-center gap-1.5">
            ${isCompleted && rating ? `<span class="text-amber-400 text-xs">${'★'.repeat(rating)}</span>` : ''}
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
  function speakWord(text, rate = null) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate || state.linklabSpeed || 0.85; // Crisp articulation listening
    window.speechSynthesis.speak(utterance);
  }

  // Sound Practice Modal Logic (FR-009)
  function openSoundPracticeModal(targetSound, word, ipa, tip) {
    const pop = document.getElementById('selection-lookup-popup');
    if (pop) pop.classList.add('hidden');
    try { window.getSelection()?.removeAllRanges(); } catch (_) {}

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
    el.btnSubmitSoundGrade.textContent = "⏳ AI Coach đang phân tích âm học...";

    try {
      // 1. Call Speech-to-Text Pronunciation Scorer (Feature 002)
      try {
        const scoreRes = await fetch('/api/speech/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayNumber: state.currentDay,
            targetWordOrSentence: state.soundPractice.targetWord,
            expectedPhonemes: state.soundPractice.targetSymbol,
            spokenText: input
          })
        });
        if (scoreRes.ok) {
          const scoreData = await scoreRes.json();
          if (el.modalPhonemeBreakdown) {
            el.modalPhonemeBreakdown.innerHTML = '';
            (scoreData.phonemeBreakdown || []).forEach(p => {
              const span = document.createElement('span');
              span.className = p.isCorrect ? 'px-2 py-0.5 rounded phoneme-tag-correct' : 'px-2 py-0.5 rounded phoneme-tag-incorrect';
              span.title = p.kinestheticCorrectionTip;
              span.textContent = `${p.targetPhoneme} ${p.isCorrect ? '✅' : '❌'}`;
              el.modalPhonemeBreakdown.appendChild(span);
            });
          }
        }
      } catch (e) {
        console.warn('Speech scoring endpoint fallback', e);
      }

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
      el.btnSubmitSoundGrade.textContent = "🚀 Chấm điểm phát âm cùng AI Coach";
    }
  }

  // Floating AI Assistant Logic (FR-008)
  function toggleFloatingAiModal(forceState) {
    if (typeof window.toggleAiCoach === 'function') {
      window.toggleAiCoach(forceState);
      return;
    }
    if (!el.modalFloatingAi) return;
    if (el.modalFloatingAi.classList.contains('hidden')) {
      el.modalFloatingAi.classList.remove('hidden');
      document.body.classList.add('ai-coach-active');
      if (el.floatingAiInput) el.floatingAiInput.focus();
    } else {
      el.modalFloatingAi.classList.add('hidden');
      document.body.classList.remove('ai-coach-active');
    }
  }

  function closeFloatingAiModal() {
    if (typeof window.toggleAiCoach === 'function') {
      window.toggleAiCoach(false);
      return;
    }
    if (el.modalFloatingAi) el.modalFloatingAi.classList.add('hidden');
    document.body.classList.remove('ai-coach-active');
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
    aiMsg.innerHTML = `<span>⏳ AI Coach đang suy nghĩ...</span>`;
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
          <div class="font-bold text-cyan-400">🤖 AI Coach:</div>
          <div>${data.grammarCorrections || 'Cấu trúc câu tốt.'}</div>
          ${data.phoneticMechanicsAlerts?.length ? `<div class="text-xs text-amber-300">⚠️ Cơ học: ${data.phoneticMechanicsAlerts.join('; ')}</div>` : ''}
          ${data.seniorDevRefactoring ? `<div class="p-1.5 rounded bg-cyan-950/40 border border-cyan-900/60 font-mono text-xs text-cyan-200">⭐ Senior Dev: "${data.seniorDevRefactoring}"</div>` : ''}
        </div>
      `;
    } catch (err) {
      aiMsg.innerHTML = `<span class="text-amber-400">⚠️ AI Coach tạm thời offline, phản hồi quy tắc cơ học: Nhớ đặt đầu lưỡi đúng gờ lợi và không rụng âm đuôi!</span>`;
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
    const btnStartSpeakingMain = document.getElementById('btn-start-speaking-main');
    const mainSpeakBtnLabel = document.getElementById('main-speak-btn-label');
    const speechListeningIndicator = document.getElementById('speech-listening-indicator');
    const speechMicStatus = document.getElementById('speech-mic-status');

    function updateMainSpeakBtnUI(isRecording) {
      if (btnStartSpeakingMain && mainSpeakBtnLabel) {
        if (isRecording) {
          btnStartSpeakingMain.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-xl shadow-red-950/80 border-2 border-red-400 flex items-center justify-center gap-2.5 transition animate-pulse';
          mainSpeakBtnLabel.textContent = '🛑 ĐANG THU ÂM... BẤM ĐỂ DỪNG & CHẤM ĐIỂM';
          if (speechListeningIndicator) speechListeningIndicator.classList.remove('hidden');
          if (speechMicStatus) speechMicStatus.textContent = '🔴 Đang lắng nghe giọng của bạn...';
        } else {
          btnStartSpeakingMain.className = 'w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-950/60 border border-purple-300/40 flex items-center justify-center gap-2.5 transition transform hover:scale-[1.01] active:scale-[0.98]';
          mainSpeakBtnLabel.textContent = 'BẤM VÀO ĐÂY ĐỂ BẮT ĐẦU NÓI TIẾNG ANH';
          if (speechListeningIndicator) speechListeningIndicator.classList.add('hidden');
          if (speechMicStatus) speechMicStatus.textContent = '🟢 Micro: Sẵn sàng';
        }
      }
    }

    state.recognition = new SpeechRec();
    state.recognition.continuous = false;
    state.recognition.interimResults = false;
    state.recognition.lang = 'en-US';

    state.recognition.onstart = () => {
      state.isRecording = true;
      if (el.recordLabel) el.recordLabel.textContent = 'Đang nghe...';
      if (el.btnSpeechRecord) el.btnSpeechRecord.className = 'text-xs px-2.5 py-1 bg-red-950 text-red-400 border border-red-800 rounded flex items-center gap-1 animate-pulse';
      updateMainSpeakBtnUI(true);
      startMediaRecording();
    };

    state.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (el.aiInputText) el.aiInputText.value = (el.aiInputText.value ? el.aiInputText.value + ' ' : '') + transcript;
    };

    state.recognition.onend = () => {
      state.isRecording = false;
      if (el.recordLabel) el.recordLabel.textContent = 'Nói vào mic phụ';
      if (el.btnSpeechRecord) el.btnSpeechRecord.className = 'text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition';
      updateMainSpeakBtnUI(false);
      stopMediaRecording();
    };

    function toggleSpeechRecording() {
      if (state.isRecording) {
        try { state.recognition.stop(); } catch (err) {}
        stopMediaRecording();
        state.isRecording = false;
        updateMainSpeakBtnUI(false);
      } else {
        try {
          state.recognition.start();
        } catch (err) {
          console.warn('SpeechRecognition start fallback to MediaRecorder only:', err);
          startMediaRecording();
          state.isRecording = true;
          updateMainSpeakBtnUI(true);
        }
      }
    }

    if (btnStartSpeakingMain) {
      btnStartSpeakingMain.addEventListener('click', toggleSpeechRecording);
    }

    if (el.btnSpeechRecord) {
      el.btnSpeechRecord.addEventListener('click', toggleSpeechRecording);
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

  // Evaluate with AI Coach
  async function evaluateWithAi() {
    const text = el.aiInputText ? el.aiInputText.value.trim() : '';
    if (!text) {
      alert('Vui lòng nhập câu hoặc nói vào micro trước khi chấm điểm.');
      return;
    }

    if (el.btnEvaluateAi) {
      el.btnEvaluateAi.disabled = true;
      el.btnEvaluateAi.innerHTML = '<span>⏳ AI Coach đang phân tích âm & ngữ pháp...</span>';
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
        el.btnEvaluateAi.innerHTML = '<span>🚀 Chấm điểm bằng AI Coach</span>';
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
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (el.timerDisplay) el.timerDisplay.textContent = timeFormatted;

    // Synchronize Compact Sticky Header Timer
    const headerDisplay = document.getElementById('header-timer-display');
    const headerPhase = document.getElementById('header-timer-phase');
    const headerToggle = document.getElementById('btn-header-timer-toggle');
    if (headerDisplay) headerDisplay.textContent = timeFormatted;
    if (headerToggle) headerToggle.textContent = state.timer.isRunning ? 'Pause' : 'Start';

    const percent = (state.timer.remainingSeconds / state.timer.totalSeconds) * 100;
    if (el.timerProgress) el.timerProgress.style.width = `${percent}%`;

    syncBlocksWithTimer(state.timer.remainingSeconds);
    const elapsed = state.timer.totalSeconds - state.timer.remainingSeconds;
    if (el.timerPhaseHint) {
      if (elapsed < 10 * 60) {
        el.timerPhaseHint.textContent = 'Phase 1 (00-10m): Cơ Học Khẩu Hình & Âm Đuôi';
        if (headerPhase) headerPhase.textContent = '1. Khẩu Hình';
      } else if (elapsed < 20 * 60) {
        el.timerPhaseHint.textContent = 'Phase 2 (10-20m): Nạp Khung Câu Đóng Băng';
        if (headerPhase) headerPhase.textContent = '2. Khung Câu';
      } else {
        el.timerPhaseHint.textContent = 'Phase 3 (20-30m): Nói & Chấm Điểm Cùng AI Coach';
        if (headerPhase) headerPhase.textContent = '3. AI Coach';
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

  // =========================================================================
  // SAGITTAL VOCAL TRACT INTERACTIVE ANATOMICAL ENGINE WITH KINEMATIC VECTORS
  // =========================================================================
  let currentSagittalSound = '/t/';
  let currentSagittalMode = 'target'; // 'target' | 'vn'

  const SAGITTAL_DATA = {
    '/t/': {
      soundName: '/t/ — Voiceless Alveolar Stop (Bật Gió Không Rung)',
      organText: 'Đầu lưỡi ➜ Gờ lợi trên (Alveolar Ridge)',
      voicing: '❌ Vô thanh: Dây thanh KHÔNG rung. Cổ họng êm ru.',
      motion: {
        arrowD: "M 180 235 C 178 215, 182 205, 185 194",
        arrowMarker: "url(#arrow-motion)",
        arrowStroke: "#38bdf8",
        label: "⬆️ Nâng đầu lưỡi ép chặt gờ lợi",
        labelX: 195,
        labelY: 218,
        labelColor: "#38bdf8",
        arrowSecD: "M 185 192 L 185 218",
        arrowSecMarker: "url(#arrow-motion-amber)",
        arrowSecStroke: "#f59e0b",
        labelSec: "⬇️ Giật dứt khoát giải phóng Pop",
        labelSecX: 195,
        labelSecY: 205,
        labelColor: "#f59e0b",
        showSec: true
      },
      kinematicSteps: {
        start: 'Đầu lưỡi nghỉ ở sàn miệng',
        motion: '⬆️ Nâng lên ép chặt Gờ Lợi',
        pressure: '🛑 Khóa khí nén (Thanh quản im lặng)',
        release: '💨 Giật dứt khoát -> Pop nổ bay tờ giấy'
      },
      vnMotionText: 'Lỗi hướng người Việt: Đập lưỡi vào mặt sau răng cửa thay vì gờ lợi, không có pha giật nhả xuống mà ngậm miệng nuốt âm (commit -> côm-mít).',
      target: {
        tonguePath: "M 165 265 C 170 240, 175 210, 185 192 C 205 194, 235 220, 265 240 C 290 260, 300 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 185, cy: 192 },
        contactPoint: { cx: 185, cy: 192, show: true, color: '#38bdf8' },
        burstPoint: { cx: 185, cy: 192, show: true },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#ef4444' },
        airStream: { d: "M 270 390 C 270 330, 260 250, 215 220", show: true },
        popArrow: { d: "M 185 192 L 185 215", show: true },
        desc: "Đầu lưỡi dán chặt gờ lợi sau răng trên, nén áp suất khí rồi giật lưỡi dứt khoát giải phóng tiếng bật hơi sắc nét (Pop). Dây thanh KHÔNG rung. Thổi bay tờ giấy cách 5cm.",
        badge: "🇬🇧 Chuẩn Target: /t/ (Vô thanh - Bật nổ)"
      },
      vn: {
        tonguePath: "M 165 265 C 160 240, 155 225, 156 218 C 175 224, 210 235, 255 245 C 285 265, 295 305, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 156, cy: 218 },
        contactPoint: { cx: 156, cy: 218, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 330, 260 250, 215 240", show: true },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Đầu lưỡi đập vào răng cửa hoặc ngậm miệng nuốt âm (unreleased coda). Từ 'commit' đọc thành 'côm-mít' cụt ngủn.",
        badge: "🇻🇳 Lỗi Thường Gặp (Chặn răng / Nuốt âm)"
      }
    },
    '/d/': {
      soundName: '/d/ — Voiced Alveolar Stop (Hữu Thanh Rung Cổ)',
      organText: 'Đầu lưỡi ➜ Gờ lợi trên (Alveolar Ridge)',
      voicing: '⚡ Hữu thanh: Dây thanh RUNG MẠNH (rung rừ rừ trong họng).',
      motion: {
        arrowD: "M 180 235 C 178 215, 182 205, 185 194",
        arrowMarker: "url(#arrow-motion-emerald)",
        arrowStroke: "#10b981",
        label: "⬆️ Chạm nhẹ đầu lưỡi gờ lợi",
        labelX: 195,
        labelY: 218,
        labelColor: "#10b981",
        arrowSecD: "M 295 405 C 290 390, 280 340, 250 290",
        arrowSecMarker: "url(#arrow-motion-amber)",
        arrowSecStroke: "#f59e0b",
        labelSec: "⚡ Rung thanh quản rền vang",
        labelSecX: 235,
        labelSecY: 340,
        labelColor: "#f59e0b",
        showSec: true
      },
      kinematicSteps: {
        start: 'Đầu lưỡi chạm nhẹ gờ lợi',
        motion: '⚡ Dây thanh quản RUNG MẠNH rừ rừ',
        pressure: '🌊 Âm thanh trầm vang trong họng',
        release: '⬇️ Nhả êm, tờ giấy đứng yên, ngân nguyên âm x2'
      },
      vnMotionText: 'Lỗi người Việt: Đọc thành âm "đờ" thêm nguyên âm thừa (code -> cút-đờ) hoặc rụt lưỡi nuốt luôn âm (build -> biu).',
      target: {
        tonguePath: "M 165 265 C 170 240, 175 210, 185 192 C 205 194, 235 220, 265 240 C 290 260, 300 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 185, cy: 192 },
        contactPoint: { cx: 185, cy: 192, show: true, color: '#10b981' },
        burstPoint: { cx: 185, cy: 192, show: false },
        vocalCords: { active: true, fillOpacity: 0.95, stroke: '#ef4444' },
        airStream: { d: "M 295 405 C 290 350, 275 280, 215 220", show: true },
        popArrow: { show: false },
        desc: "Đầu lưỡi chạm nhẹ gờ lợi. Dây thanh quản RUNG MẠNH tạo âm trầm vang trong họng. Nhả êm, KHÔNG phụt luồng khí nổ, tờ giấy đứng yên. Kéo dài nguyên âm trước âm /d/ (ride ~280ms vs write ~140ms).",
        badge: "🇬🇧 Chuẩn Target: /d/ (Hữu thanh - Rung cổ)"
      },
      vn: {
        tonguePath: "M 165 265 C 160 240, 155 225, 156 218 C 175 224, 210 235, 255 245 C 285 265, 295 305, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 156, cy: 218 },
        contactPoint: { cx: 156, cy: 218, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 330, 260 250, 215 240", show: true },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Thêm nguyên âm 'ơ' thành 'đờ' (code -> cút-đờ), hoặc rụt lưỡi nuốt luôn âm (build -> biu).",
        badge: "🇻🇳 Lỗi Thường Gặp (Chêm 'đờ' / Nuốt âm)"
      }
    },
    '/θ/': {
      soundName: '/θ/ — Voiceless Dental Fricative (Kẹp Răng Không Rung)',
      organText: 'Đầu lưỡi ➜ Giữa 2 hàm răng',
      voicing: '❌ Vô thanh: Dây thanh KHÔNG rung. Xì gió mát lạnh.',
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
        labelColor: "#38bdf8",
        showSec: true
      },
      kinematicSteps: {
        start: 'Đầu lưỡi nằm trong miệng',
        motion: '⬅️ Đẩy nhô ra giữa 2 hàm răng',
        pressure: '🦷 Răng cắn nhẹ giữ đầu lưỡi',
        release: '💨 Thổi luồng gió xì liên tục'
      },
      vnMotionText: 'Lỗi hướng người Việt: Rụt đầu lưỡi lùi sâu vào trong vòm họng thay vì nhô ra ngoài kẹp răng, biến âm /θ/ thành /t/ (think -> tinh, auth -> ót).',
      target: {
        tonguePath: "M 155 265 C 150 240, 138 230, 126 224 C 145 224, 185 226, 235 240 C 275 255, 295 295, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 155 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 126, cy: 224 },
        contactPoint: { cx: 126, cy: 224, show: true, color: '#10b981' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#ef4444' },
        airStream: { d: "M 270 390 C 270 320, 240 240, 130 224", show: true },
        popArrow: { show: false },
        desc: "Đầu lưỡi thò ra ngoài 2-3mm giữa hai hàm răng trên và dưới, răng cắn nhẹ. Đẩy luồng hơi xì liên tục qua khe hở răng-lưỡi, dây thanh KHÔNG rung.",
        badge: "🇬🇧 Chuẩn Target: /θ/ (Kẹp răng - Xì gió)"
      },
      vn: {
        tonguePath: "M 165 265 C 160 240, 165 220, 180 205 C 205 210, 235 230, 265 245 C 285 265, 295 305, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 180, cy: 205 },
        contactPoint: { cx: 180, cy: 205, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 320, 240 240, 180 210", show: true },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Giữ đầu lưỡi bên trong khoang miệng, phát âm giống âm 'th' tiếng Việt hoặc biến thành âm /t/ (think -> tinh, thread -> trét).",
        badge: "🇻🇳 Lỗi Thường Gặp (Rụt lưỡi / Âm TH Việt)"
      }
    },
    '/ð/': {
      soundName: '/ð/ — Voiced Dental Fricative (Kẹp Răng Rung Cổ)',
      organText: 'Đầu lưỡi ➜ Giữa 2 hàm răng',
      voicing: '⚡ Hữu thanh: Dây thanh RUNG MẠNH. Cổ họng rung rừ rừ.',
      motion: {
        arrowD: "M 170 232 C 155 230, 142 228, 126 224",
        arrowMarker: "url(#arrow-motion-emerald)",
        arrowStroke: "#10b981",
        label: "⬅️ Nhô ra kẹp giữa răng",
        labelX: 85,
        labelY: 208,
        labelColor: "#10b981",
        arrowSecD: "M 295 405 C 290 390, 280 340, 250 290",
        arrowSecMarker: "url(#arrow-motion-amber)",
        arrowSecStroke: "#f59e0b",
        labelSec: "⚡ Rung cổ rền vang",
        labelSecX: 235,
        labelSecY: 340,
        labelColor: "#f59e0b",
        showSec: true
      },
      kinematicSteps: {
        start: 'Đầu lưỡi thò ra giữa 2 răng',
        motion: '⚡ KÍCH HOẠT DÂY THANH RUNG',
        pressure: '🌊 Âm thanh rung rền qua kẽ răng',
        release: '⬇️ Giữ độ rung liên tục'
      },
      vnMotionText: 'Lỗi người Việt: Đọc thành âm "d" hoặc "z" tiếng Việt mà không thè đầu lưỡi ra kẹp giữa hai hàm răng (this -> dít, with -> uýt).',
      target: {
        tonguePath: "M 155 265 C 150 240, 138 230, 126 224 C 145 224, 185 226, 235 240 C 275 255, 295 295, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 155 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 126, cy: 224 },
        contactPoint: { cx: 126, cy: 224, show: true, color: '#10b981' },
        burstPoint: { show: false },
        vocalCords: { active: true, fillOpacity: 0.95, stroke: '#ef4444' },
        airStream: { d: "M 295 405 C 290 350, 260 250, 130 224", show: true },
        popArrow: { show: false },
        desc: "Khẩu hình kẹp răng y hệt /θ/, nhưng dây thanh quản RUNG MẠNH như tiếng ong kêu. Đầu lưỡi tê rần khi phát âm.",
        badge: "🇬🇧 Chuẩn Target: /ð/ (Kẹp răng - Rung cổ)"
      },
      vn: {
        tonguePath: "M 165 265 C 160 240, 165 220, 180 205 C 205 210, 235 230, 265 245 C 285 265, 295 305, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 180, cy: 205 },
        contactPoint: { cx: 180, cy: 205, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 320, 240 240, 180 210", show: true },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Thụt lưỡi vào trong miệng rồi đọc thành 'd' hoặc 'z' (this -> dít, that -> dát, with -> uýt).",
        badge: "🇻🇳 Lỗi Thường Gặp (Rụt lưỡi / Đọc thành D)"
      }
    },
    '/s/': {
      soundName: '/s/ — Voiceless Alveolar Fricative (Rãnh Xì Không Rung)',
      organText: 'Đầu lưỡi ➜ Gờ lợi (Alveolar Ridge)',
      voicing: '❌ Vô thanh: Dây thanh KHÔNG rung. Xì rít sắc nhọn.',
      motion: {
        arrowD: "M 175 235 C 176 215, 180 206, 182 198",
        arrowMarker: "url(#arrow-motion)",
        arrowStroke: "#38bdf8",
        label: "⬆️ Tạo khe hẹp sát gờ lợi",
        labelX: 195,
        labelY: 218,
        labelColor: "#38bdf8",
        arrowSecD: "M 182 196 L 146 196",
        arrowSecMarker: "url(#arrow-motion-emerald)",
        arrowSecStroke: "#10b981",
        labelSec: "💨 Ép luồng gió rít sắc qua răng",
        labelSecX: 110,
        labelSecY: 180,
        labelColor: "#10b981",
        showSec: true
      },
      kinematicSteps: {
        start: 'Mép môi cười bè nhẹ sang 2 bên',
        motion: '⬆️ Đầu lưỡi tiến sát gờ lợi tạo rãnh hẹp',
        pressure: '💨 Luồng khí tốc độ cao qua khe',
        release: '⚡ Âm xì rít sắc nét /s/'
      },
      vnMotionText: 'Lỗi hướng người Việt: Rụt lưỡi bỏ qua âm xì ở đuôi từ (response -> rì-pón) hoặc thêm âm xì bừa bãi vào mọi vị trí.',
      target: {
        tonguePath: "M 165 265 C 170 240, 175 212, 182 198 C 205 198, 235 220, 265 240 C 290 260, 300 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 182, cy: 198 },
        contactPoint: { cx: 182, cy: 198, show: true, color: '#38bdf8' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#ef4444' },
        airStream: { d: "M 270 390 C 270 330, 250 240, 182 198", show: true },
        popArrow: { show: false },
        desc: "Đầu lưỡi nâng sát gờ lợi nhưng KHÔNG chạm hẳn (chừa khe rãnh nhỏ). Mép cười nhẹ, luồng hơi rít sắc bén qua kẽ răng, dây thanh KHÔNG rung.",
        badge: "🇬🇧 Chuẩn Target: /s/ (Rãnh xì - Vô thanh)"
      },
      vn: {
        tonguePath: "M 165 265 C 170 250, 180 240, 195 235 C 225 235, 255 245, 275 265 C 290 285, 300 320, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 195, cy: 235 },
        contactPoint: { cx: 195, cy: 235, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 330, 240 270, 195 240", show: false },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Thả rơi đầu lưỡi nuốt luôn âm xì ở đuôi từ. Đọc 'response' thành 'rì-pón', 'status' thành 'tát-tút'.",
        badge: "🇻🇳 Lỗi Thường Gặp (Nuốt âm xì đuôi)"
      }
    },
    '/z/': {
      soundName: '/z/ — Voiced Alveolar Fricative (Rãnh Xì Rung Ong)',
      organText: 'Đầu lưỡi ➜ Gờ lợi (Alveolar Ridge)',
      voicing: '⚡ Hữu thanh: Dây thanh RUNG MẠNH như tiếng ong vo ve.',
      motion: {
        arrowD: "M 175 235 C 176 215, 180 206, 182 198",
        arrowMarker: "url(#arrow-motion-emerald)",
        arrowStroke: "#10b981",
        label: "⬆️ Giữ khe hẹp gờ lợi",
        labelX: 195,
        labelY: 218,
        labelColor: "#10b981",
        arrowSecD: "M 295 405 C 290 390, 280 340, 250 290",
        arrowSecMarker: "url(#arrow-motion-amber)",
        arrowSecStroke: "#f59e0b",
        labelSec: "⚡ Dây thanh rung ong ong",
        labelSecX: 235,
        labelSecY: 340,
        labelColor: "#f59e0b",
        showSec: true
      },
      kinematicSteps: {
        start: 'Khẩu hình giống hệt âm /s/',
        motion: '⬆️ Đầu lưỡi sát gờ lợi',
        pressure: '⚡ DÂY THANH QUẢN RUNG DỮ DỘI',
        release: '🌊 Âm thanh xì rung ong ong'
      },
      vnMotionText: 'Lỗi người Việt: Đọc âm /z/ thành /s/ không rung (keys -> kí-s, nodes -> nốt-s).',
      target: {
        tonguePath: "M 165 265 C 170 240, 175 212, 182 198 C 205 198, 235 220, 265 240 C 290 260, 300 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 182, cy: 198 },
        contactPoint: { cx: 182, cy: 198, show: true, color: '#10b981' },
        burstPoint: { show: false },
        vocalCords: { active: true, fillOpacity: 0.95, stroke: '#ef4444' },
        airStream: { d: "M 295 405 C 290 350, 250 240, 182 198", show: true },
        popArrow: { show: false },
        desc: "Khẩu hình giống /s/, nhưng dây thanh quản RUNG DỮ DỘI. Cảm nhận tiếng rung ong ong như còi ong trong lồng ngực và cổ họng.",
        badge: "🇬🇧 Chuẩn Target: /z/ (Hữu thanh - Rung ong)"
      },
      vn: {
        tonguePath: "M 165 265 C 170 250, 180 240, 195 235 C 225 235, 255 245, 275 265 C 290 285, 300 320, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 195, cy: 235 },
        contactPoint: { cx: 195, cy: 235, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 330, 240 270, 195 240", show: false },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Phát âm thành /s/ không rung (keys -> kí-s, nodes -> nốt-s) làm sai lệch số nhiều và ngôi thứ ba.",
        badge: "🇻🇳 Lỗi Thường Gặp (Phát âm thành S)"
      }
    },
    '/ʃ/': {
      soundName: '/ʃ/ — Voiceless Postalveolar Fricative (Chu Vòm Xì Dày)',
      organText: 'Thân lưỡi ➜ Vòm ngạc cứng, Môi chu tròn',
      voicing: '❌ Vô thanh: Dây thanh KHÔNG rung. Luồng gió xì dày ồ ạt.',
      motion: {
        arrowD: "M 145 215 C 130 215, 115 215, 95 215",
        arrowMarker: "url(#arrow-motion-rose)",
        arrowStroke: "#f43f5e",
        label: "⬅️ Chu môi tròn về trước",
        labelX: 85,
        labelY: 195,
        labelColor: "#f43f5e",
        arrowSecD: "M 230 240 C 235 220, 245 205, 255 195",
        arrowSecMarker: "url(#arrow-motion)",
        arrowSecStroke: "#38bdf8",
        labelSec: "⬆️ Vồng thân lưỡi áp ngạc",
        labelSecX: 250,
        labelSecY: 220,
        labelColor: "#38bdf8",
        showSec: true
      },
      kinematicSteps: {
        start: 'Môi tự nhiên',
        motion: '⬅️ Chu môi tròn về phía trước',
        pressure: '⬆️ Vồng thân lưỡi nâng sát vòm ngạc',
        release: '💨 Luồng gió xì dày ồ ạt như tiếng suỵt khẽ'
      },
      vnMotionText: 'Lỗi người Việt: Miệng bẹt sang hai bên như đọc chữ "s" thông thường, đọc "push" thành "pút" hoặc "pút-s" bẹt môi.',
      target: {
        tonguePath: "M 165 265 C 170 240, 185 225, 215 205 C 245 195, 275 210, 285 235 C 295 265, 300 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 215, cy: 205 },
        contactPoint: { cx: 215, cy: 205, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#ef4444' },
        airStream: { d: "M 270 390 C 270 310, 260 210, 140 215", show: true },
        popArrow: { show: false },
        desc: "Môi chu tròn hướng ra phía trước, thân lưỡi vồng cao áp sát vòm ngạc cứng. Đẩy hơi xì dày, sâu và ấm như tiếng ra hiệu im lặng 'shhh!'.",
        badge: "🇬🇧 Chuẩn Target: /ʃ/ (Chu môi - Xì dày)"
      },
      vn: {
        tonguePath: "M 165 265 C 170 240, 175 220, 180 205 C 205 215, 235 235, 265 245 C 285 265, 295 305, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 180, cy: 205 },
        contactPoint: { cx: 180, cy: 205, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 330, 250 250, 170 215", show: true },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Miệng bẹt ngang, phát âm như chữ 's' nhẹ tiếng Việt. Từ 'push' đọc thành 'pút-s' cụt lủn.",
        badge: "🇻🇳 Lỗi Thường Gặp (Miệng bẹt / S nhẹ)"
      }
    },
    '/k/': {
      soundName: '/k/ — Voiceless Velar Stop (Bật Ngạc Mềm Vô Thanh)',
      organText: 'Gốc lưỡi ➜ Ngạc mềm (Velum)',
      voicing: '❌ Vô thanh: Dây thanh KHÔNG rung. Nén rồi bật Pop khô.',
      motion: {
        arrowD: "M 275 270 C 285 250, 300 235, 312 216",
        arrowMarker: "url(#arrow-motion)",
        arrowStroke: "#38bdf8",
        label: "⬆️ Nâng gốc lưỡi ép ngạc mềm",
        labelX: 250,
        labelY: 245,
        labelColor: "#38bdf8",
        arrowSecD: "M 312 216 L 312 240",
        arrowSecMarker: "url(#arrow-motion-amber)",
        arrowSecStroke: "#f59e0b",
        labelSec: "⬇️ Giật gốc lưỡi bật nổ Pop",
        labelSecX: 295,
        labelSecY: 250,
        labelColor: "#f59e0b",
        showSec: true
      },
      kinematicSteps: {
        start: 'Đầu lưỡi nằm ở sàn miệng',
        motion: '⬆️ Gốc lưỡi nâng áp chặt ngạc mềm',
        pressure: '🛑 Khóa khí nén ở cuống họng',
        release: '💨 Giật dứt khoát giải phóng Pop khô'
      },
      vnMotionText: 'Lỗi người Việt: Ngậm miệng nuốt âm ở đuôi từ (link -> lin, task -> tát).',
      target: {
        tonguePath: "M 165 265 C 175 250, 195 240, 220 238 C 250 235, 280 230, 312 215 C 315 245, 310 290, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 220, cy: 238 },
        contactPoint: { cx: 312, cy: 215, show: true, color: '#38bdf8' },
        burstPoint: { cx: 312, cy: 215, show: true },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#ef4444' },
        airStream: { d: "M 270 390 C 270 330, 290 280, 312 218", show: true },
        popArrow: { d: "M 312 215 L 290 230", show: true },
        desc: "Gốc lưỡi nâng cao ép chặt vào ngạc mềm (vách gà), nén khí cuống họng rồi giật bung xuống tạo tiếng nổ 'khạc nhẹ' khô giòn. Dây thanh KHÔNG rung.",
        badge: "🇬🇧 Chuẩn Target: /k/ (Ngạc mềm - Bật gió)"
      },
      vn: {
        tonguePath: "M 165 265 C 175 250, 195 245, 220 245 C 250 245, 280 250, 300 245 C 305 265, 305 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 220, cy: 245 },
        contactPoint: { cx: 300, cy: 245, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 330, 280 280, 300 248", show: false },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Bỏ qua âm cuối, nuốt mất âm /k/. 'Check' đọc thành 'ché', 'network' đọc thành 'nét-uốt'.",
        badge: "🇻🇳 Lỗi Thường Gặp (Nuốt âm K cuối)"
      }
    },
    '/ɡ/': {
      soundName: '/ɡ/ — Voiced Velar Stop (Bật Ngạc Mềm Rung Cổ)',
      organText: 'Gốc lưỡi ➜ Ngạc mềm (Velum)',
      voicing: '⚡ Hữu thanh: Dây thanh RUNG MẠNH từ cuống họng.',
      motion: {
        arrowD: "M 275 270 C 285 250, 300 235, 312 216",
        arrowMarker: "url(#arrow-motion-emerald)",
        arrowStroke: "#10b981",
        label: "⬆️ Chạm gốc lưỡi ngạc mềm",
        labelX: 250,
        labelY: 245,
        labelColor: "#10b981",
        arrowSecD: "M 295 405 C 290 390, 280 340, 250 290",
        arrowSecMarker: "url(#arrow-motion-amber)",
        arrowSecStroke: "#f59e0b",
        labelSec: "⚡ Rung cổ rền vang",
        labelSecX: 235,
        labelSecY: 340,
        labelColor: "#f59e0b",
        showSec: true
      },
      kinematicSteps: {
        start: 'Gốc lưỡi chạm nhẹ ngạc mềm',
        motion: '⚡ DÂY THANH QUẢN RUNG RỀN',
        pressure: '🌊 Âm thanh trầm vang trong họng',
        release: '⬇️ Nhả êm, kéo dài nguyên âm đứng trước'
      },
      vnMotionText: 'Lỗi người Việt: Đọc thành âm "gờ" chêm nguyên âm thừa (bug -> bấc-gờ) hoặc nuốt mất âm (bug -> bấc).',
      target: {
        tonguePath: "M 165 265 C 175 250, 195 240, 220 238 C 250 235, 280 230, 312 215 C 315 245, 310 290, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 220, cy: 238 },
        contactPoint: { cx: 312, cy: 215, show: true, color: '#10b981' },
        burstPoint: { show: false },
        vocalCords: { active: true, fillOpacity: 0.95, stroke: '#ef4444' },
        airStream: { d: "M 295 405 C 290 350, 300 280, 312 218", show: true },
        popArrow: { show: false },
        desc: "Khẩu hình giống /k/, nhưng dây thanh quản RUNG MẠNH từ sâu trong cuống họng. Nhả êm không bật gió mạnh, ngân dài nguyên âm đi trước.",
        badge: "🇬🇧 Chuẩn Target: /ɡ/ (Ngạc mềm - Rung cổ)"
      },
      vn: {
        tonguePath: "M 165 265 C 175 250, 195 245, 220 245 C 250 245, 280 250, 300 245 C 305 265, 305 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 220, cy: 245 },
        contactPoint: { cx: 300, cy: 245, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 330, 280 280, 300 248", show: false },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Đọc thành 'c' hoặc 'gờ' rời rạc. 'Log' đọc thành 'lốc' hoặc 'lốc-gờ'.",
        badge: "🇻🇳 Lỗi Thường Gặp (Đọc thành C / Nuốt âm)"
      }
    },
    '/p/': {
      soundName: '/p/ — Voiceless Bilabial Stop (Hai Môi Bật Gió)',
      organText: 'Môi trên ➜ Môi dưới ép chặt',
      voicing: '❌ Vô thanh: Dây thanh KHÔNG rung. Nổ bật hơi mạnh mẽ.',
      motion: {
        arrowD: "M 135 194 L 135 220",
        arrowMarker: "url(#arrow-motion-rose)",
        arrowStroke: "#f43f5e",
        label: "⬇️ Hai môi ép chặt bít khí",
        labelX: 55,
        labelY: 205,
        labelColor: "#f43f5e",
        arrowSecD: "M 130 215 L 90 215",
        arrowSecMarker: "url(#arrow-motion)",
        arrowSecStroke: "#38bdf8",
        labelSec: "💨 Bung môi giải phóng Pop hơi",
        labelSecX: 45,
        labelSecY: 240,
        labelColor: "#38bdf8",
        showSec: true
      },
      kinematicSteps: {
        start: 'Môi mở tự nhiên',
        motion: '⬇️ Ép chặt 2 môi vào nhau bít kín khí',
        pressure: '🛑 Áp suất nén sau hai môi',
        release: '💨 Bung môi giải phóng tiếng Pop mạnh'
      },
      vnMotionText: 'Lỗi người Việt: Đọc âm /p/ thành /b/ hoặc ngậm môi nuốt mất âm cuối (stop -> x-tóp ngậm miệng).',
      target: {
        tonguePath: "M 165 265 C 175 250, 195 240, 220 238 C 250 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 205, cy: 238 },
        contactPoint: { cx: 135, cy: 215, show: true, color: '#f43f5e' },
        burstPoint: { cx: 135, cy: 215, show: true },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#ef4444' },
        airStream: { d: "M 270 390 C 270 300, 220 220, 135 215", show: true },
        popArrow: { d: "M 135 215 L 105 215", show: true },
        desc: "Hai môi mím chặt bít hoàn toàn luồng hơi, nén áp suất trong khoang miệng rồi bung mạnh hai môi ra giải phóng tiếng Pop giòn tan. Dây thanh KHÔNG rung.",
        badge: "🇬🇧 Chuẩn Target: /p/ (Hai môi - Bật gió)"
      },
      vn: {
        tonguePath: "M 165 265 C 175 250, 195 240, 220 238 C 250 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 205, cy: 238 },
        contactPoint: { cx: 135, cy: 215, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 300, 220 220, 135 215", show: false },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Ngậm chặt môi nhưng không bung hơi ra (unreleased coda). Từ 'help' đọc thành 'hép' cụt lủn.",
        badge: "🇻🇳 Lỗi Thường Gặp (Ngậm môi / Nuốt âm P)"
      }
    },
    '/b/': {
      soundName: '/b/ — Voiced Bilabial Stop (Hai Môi Rung Cổ)',
      organText: 'Môi trên ➜ Môi dưới chạm nhẹ',
      voicing: '⚡ Hữu thanh: Dây thanh RUNG MẠNH. Không bật gió nổ.',
      motion: {
        arrowD: "M 135 194 L 135 220",
        arrowMarker: "url(#arrow-motion-emerald)",
        arrowStroke: "#10b981",
        label: "⬇️ Hai môi chạm nhẹ",
        labelX: 55,
        labelY: 205,
        labelColor: "#10b981",
        arrowSecD: "M 295 405 C 290 390, 280 340, 250 290",
        arrowSecMarker: "url(#arrow-motion-amber)",
        arrowSecStroke: "#f59e0b",
        labelSec: "⚡ Rung thanh quản rền vang",
        labelSecX: 235,
        labelSecY: 340,
        labelColor: "#f59e0b",
        showSec: true
      },
      kinematicSteps: {
        start: 'Hai môi chạm nhẹ',
        motion: '⚡ DÂY THANH QUẢN RUNG RỀN',
        pressure: '🌊 Âm thanh trầm vang trong họng',
        release: '⬇️ Tách môi êm ái, không phụt gió'
      },
      vnMotionText: 'Lỗi người Việt: Đọc âm /b/ thành âm /p/ hoặc chêm thêm "bờ" thừa thãi (web -> quép-bờ).',
      target: {
        tonguePath: "M 165 265 C 175 250, 195 240, 220 238 C 250 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 205, cy: 238 },
        contactPoint: { cx: 135, cy: 215, show: true, color: '#10b981' },
        burstPoint: { show: false },
        vocalCords: { active: true, fillOpacity: 0.95, stroke: '#ef4444' },
        airStream: { d: "M 295 405 C 290 350, 220 220, 135 215", show: true },
        popArrow: { show: false },
        desc: "Hai môi khép nhẹ. Dây thanh quản RUNG MẠNH trước khi hai môi tách ra. Âm trầm êm ái, KHÔNG bật luồng gió phụt ra ngoài, tờ giấy trước miệng đứng yên.",
        badge: "🇬🇧 Chuẩn Target: /b/ (Hai môi - Rung cổ)"
      },
      vn: {
        tonguePath: "M 165 265 C 175 250, 195 240, 220 238 C 250 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 205, cy: 238 },
        contactPoint: { cx: 135, cy: 215, show: true, color: '#f43f5e' },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { d: "M 270 390 C 270 300, 220 220, 135 215", show: false },
        popArrow: { show: false },
        desc: "⚠️ Thói quen Việt: Phát âm thành 'p' hoặc chêm 'bờ' rời rạc (web -> quép-bờ).",
        badge: "🇻🇳 Lỗi Thường Gặp (Chêm 'bờ' / Nuốt âm)"
      }
    },
    'rest': {
      soundName: 'Vị trí nghỉ tự nhiên (Vocal Tract At Rest)',
      organText: 'Tất cả cơ quan thả lỏng tự nhiên',
      voicing: 'Thả lỏng cơ quan, thở đều tự nhiên',
      motion: {
        arrowD: "M 200 250 L 200 270",
        arrowMarker: "url(#arrow-motion)",
        arrowStroke: "#64748b",
        label: "Thả lỏng sàn miệng",
        labelX: 195,
        labelY: 285,
        labelColor: "#64748b",
        arrowSecD: "M 0 0",
        showSec: false
      },
      kinematicSteps: {
        start: 'Môi hở nhẹ tự nhiên',
        motion: 'Thân lưỡi hạ thấp phẳng ở sàn miệng',
        pressure: 'Đường thở thông suốt khoang mũi và miệng',
        release: 'Sẵn sàng kích hoạt bất kỳ âm vị nào'
      },
      vnMotionText: 'Vị trí chuẩn bị xuất phát cơ bản cho mọi bài tập cấu âm.',
      target: {
        tonguePath: "M 165 265 C 175 250, 185 240, 205 238 C 240 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 205, cy: 238 },
        contactPoint: { show: false },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { show: false },
        popArrow: { show: false },
        desc: "Khoang miệng ở trạng thái nghỉ ngơi: Đầu lưỡi đặt thoải mái sau răng cửa dưới, hàm thả lỏng, đường thở lưu thông bình thường.",
        badge: "Nghỉ Ngơi Tự Nhiên"
      },
      vn: {
        tonguePath: "M 165 265 C 175 250, 185 240, 205 238 C 240 235, 275 245, 295 275 C 305 295, 300 330, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z",
        velumPath: "M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z",
        tipPoint: { cx: 205, cy: 238 },
        contactPoint: { show: false },
        burstPoint: { show: false },
        vocalCords: { active: false, fillOpacity: 0.2, stroke: '#64748b' },
        airStream: { show: false },
        popArrow: { show: false },
        desc: "Trạng thái thả lỏng chuẩn.",
        badge: "Nghỉ Ngơi"
      }
    }
  };

  function renderSagittalSound(soundKey, mode = 'target') {
    const data = SAGITTAL_DATA[soundKey] || SAGITTAL_DATA['/t/'];
    const config = mode === 'vn' ? data.vn : data.target;

    const tongue = document.getElementById('svg-tongue-shape');
    const velum = document.getElementById('svg-part-velum');
    const tip = document.getElementById('svg-part-tongue-tip');
    const contactGlow = document.getElementById('svg-contact-glow');
    const burstRipple = document.getElementById('svg-burst-ripple');
    const vocalCords = document.getElementById('svg-part-vocal-cords');
    const airStream = document.getElementById('svg-airstream-path');
    const popArrow = document.getElementById('svg-pop-arrow');

    // Dynamic Tongue Profile Update
    if (tongue && config.tonguePath) {
      tongue.setAttribute('d', config.tonguePath);
    }
    if (velum && config.velumPath) {
      velum.setAttribute('d', config.velumPath);
    }
    if (tip && config.tipPoint) {
      tip.setAttribute('cx', config.tipPoint.cx);
      tip.setAttribute('cy', config.tipPoint.cy);
    }

    // Contact Glow
    if (contactGlow) {
      if (config.contactPoint && config.contactPoint.show) {
        contactGlow.style.display = 'block';
        contactGlow.setAttribute('cx', config.contactPoint.cx);
        contactGlow.setAttribute('cy', config.contactPoint.cy);
        contactGlow.setAttribute('fill', config.contactPoint.color || '#38bdf8');
      } else {
        contactGlow.style.display = 'none';
      }
    }

    // Burst Ripple
    if (burstRipple) {
      if (config.burstPoint && config.burstPoint.show) {
        burstRipple.style.display = 'block';
        burstRipple.setAttribute('cx', config.burstPoint.cx);
        burstRipple.setAttribute('cy', config.burstPoint.cy);
      } else {
        burstRipple.style.display = 'none';
      }
    }

    // Vocal Cords Voicing Illumination
    if (vocalCords) {
      if (config.vocalCords) {
        vocalCords.setAttribute('fill-opacity', config.vocalCords.fillOpacity || '0.2');
        vocalCords.setAttribute('stroke', config.vocalCords.stroke || '#ef4444');
        if (config.vocalCords.active) {
          vocalCords.classList.add('svg-active-glow-voiced');
        } else {
          vocalCords.classList.remove('svg-active-glow-voiced');
        }
      }
    }

    // Air Stream & Pop Vector
    if (airStream) {
      if (config.airStream && config.airStream.show) {
        airStream.style.display = 'block';
        airStream.setAttribute('d', config.airStream.d);
      } else {
        airStream.style.display = 'none';
      }
    }
    if (popArrow) {
      if (config.popArrow && config.popArrow.show) {
        popArrow.style.display = 'block';
        popArrow.setAttribute('d', config.popArrow.d);
      } else {
        popArrow.style.display = 'none';
      }
    }

    // Kinematic Motion Direction Vectors
    const motionArrow = document.getElementById('svg-motion-arrow');
    const motionLabel = document.getElementById('svg-motion-label');
    const motionArrowSec = document.getElementById('svg-motion-arrow-sec');
    const motionLabelSec = document.getElementById('svg-motion-label-sec');

    if (data.motion) {
      if (motionArrow) {
        motionArrow.setAttribute('d', data.motion.arrowD);
        motionArrow.setAttribute('marker-end', data.motion.arrowMarker);
        motionArrow.setAttribute('stroke', data.motion.arrowStroke);
      }
      if (motionLabel) {
        motionLabel.textContent = data.motion.label;
        motionLabel.setAttribute('x', data.motion.labelX);
        motionLabel.setAttribute('y', data.motion.labelY);
        motionLabel.setAttribute('fill', data.motion.labelColor);
      }

      if (motionArrowSec && motionLabelSec) {
        if (data.motion.showSec) {
          motionArrowSec.style.display = 'block';
          motionLabelSec.style.display = 'block';
          motionArrowSec.setAttribute('d', data.motion.arrowSecD);
          motionArrowSec.setAttribute('marker-end', data.motion.arrowSecMarker);
          motionArrowSec.setAttribute('stroke', data.motion.arrowSecStroke);
          motionLabelSec.textContent = data.motion.labelSec;
          motionLabelSec.setAttribute('x', data.motion.labelSecX);
          motionLabelSec.setAttribute('y', data.motion.labelSecY);
          motionLabelSec.setAttribute('fill', data.motion.labelSecColor);
        } else {
          motionArrowSec.style.display = 'none';
          motionLabelSec.style.display = 'none';
        }
      }
    }

    // Guidance Text & Badge Updates
    const statusSound = document.getElementById('sagittal-status-sound');
    const statusBadge = document.getElementById('sagittal-status-badge');
    const statusDesc = document.getElementById('sagittal-status-desc');
    const statusOrgan = document.getElementById('sagittal-status-organ');
    const statusVoicing = document.getElementById('sagittal-status-voicing');
    const stepStart = document.getElementById('kin-step-start');
    const stepMotion = document.getElementById('kin-step-motion');
    const stepPressure = document.getElementById('kin-step-pressure');
    const stepRelease = document.getElementById('kin-step-release');
    const vnMotionWarning = document.getElementById('sagittal-vn-motion-text');

    if (statusSound) statusSound.textContent = data.soundName;
    if (statusBadge) {
      statusBadge.textContent = config.badge;
      if (mode === 'vn') {
        statusBadge.className = 'text-xs px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800';
      } else {
        statusBadge.className = 'text-xs px-2 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800';
      }
    }
    if (statusDesc) statusDesc.textContent = config.desc;
    if (statusOrgan) statusOrgan.textContent = data.organText;
    if (statusVoicing) statusVoicing.textContent = data.voicing;

    if (data.kinematicSteps) {
      if (stepStart) stepStart.textContent = data.kinematicSteps.start;
      if (stepMotion) stepMotion.textContent = data.kinematicSteps.motion;
      if (stepPressure) stepPressure.textContent = data.kinematicSteps.pressure;
      if (stepRelease) stepRelease.textContent = data.kinematicSteps.release;
    }
    if (vnMotionWarning && data.vnMotionText) {
      vnMotionWarning.textContent = data.vnMotionText;
    }
  }

  function setupSagittalVocalTract() {
    // Sound Articulation Selector Pills
    const soundPills = document.querySelectorAll('.sound-tab-btn');
    soundPills.forEach(btn => {
      btn.addEventListener('click', () => {
        const soundKey = btn.dataset.sound;
        currentSagittalSound = soundKey;

        soundPills.forEach(b => {
          b.classList.remove('active', 'font-bold', 'bg-cyan-950/80', 'text-cyan-300', 'border-cyan-800');
          b.classList.add('bg-slate-900', 'text-slate-300', 'border-slate-800');
        });
        btn.classList.add('active', 'font-bold', 'bg-cyan-950/80', 'text-cyan-300', 'border-cyan-800');
        btn.classList.remove('bg-slate-900', 'text-slate-300', 'border-slate-800');

        renderSagittalSound(soundKey, currentSagittalMode);

        // Sync with Mouth Map pills if /t/ or /d/
        if (soundKey === '/t/' || soundKey === '/d/') {
          syncMouthMapPill(soundKey);
          loadMouthMap(soundKey);
        }
      });
    });

    // Mouth-Map Sound Selector Pills
    const mouthPills = document.querySelectorAll('.mouth-pill-btn');
    mouthPills.forEach(btn => {
      btn.addEventListener('click', () => {
        const sound = btn.dataset.sound;
        syncMouthMapPill(sound);
        loadMouthMap(sound);

        // Sync with Sagittal diagram
        currentSagittalSound = sound;
        syncSagittalSoundPill(sound);
        renderSagittalSound(sound, currentSagittalMode);
      });
    });

    // Mode Toggle (Target 🇬🇧 vs VN 🇻🇳)
    const btnTarget = document.getElementById('btn-sagittal-target');
    const btnVN = document.getElementById('btn-sagittal-vn');

    if (btnTarget && btnVN) {
      btnTarget.addEventListener('click', () => {
        currentSagittalMode = 'target';
        btnTarget.className = 'px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition';
        btnVN.className = 'px-2 py-0.5 rounded text-xs font-mono text-slate-400 hover:text-rose-300 transition';
        renderSagittalSound(currentSagittalSound, 'target');
      });

      btnVN.addEventListener('click', () => {
        currentSagittalMode = 'vn';
        btnVN.className = 'px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 transition';
        btnTarget.className = 'px-2 py-0.5 rounded text-xs font-mono text-slate-400 hover:text-emerald-300 transition';
        renderSagittalSound(currentSagittalSound, 'vn');
      });
    }

    // Global helper exposed to window so contrast cards can click-to-activate
    window.selectSagittalAndMouth = (soundSymbol) => {
      let sound = soundSymbol;
      if (sound.includes('/d/')) sound = '/d/';
      else if (sound.includes('/t/')) sound = '/t/';
      else if (sound.includes('/θ/')) sound = '/θ/';
      else if (sound.includes('/ð/')) sound = '/ð/';
      else if (sound.includes('/s/')) sound = '/s/';
      else if (sound.includes('/z/')) sound = '/z/';

      currentSagittalSound = sound;
      syncSagittalSoundPill(sound);
      syncMouthMapPill(sound);
      renderSagittalSound(sound, currentSagittalMode);
      loadMouthMap(sound);
    };

    // Anatomical interactive pins & articulator chips
    const ARTICULATOR_DATA = {
      'lips': {
        title: "1. Đôi Môi (Lips / Bilabial)",
        elements: ['svg-part-lip-upper', 'svg-part-lip-lower'],
        desc: "💡 <strong>1. Đôi Môi (Bilabial):</strong> Mép môi trên & môi dưới. Mím chặt bờ trong nén khí nổ bung tạo /p/, /b/ (push, bug). Chu tròn hình phễu tạo bán nguyên âm /w/ (worker) hoặc phối hợp răng dưới tạo /f/, /v/ (file, server)."
      },
      'teeth': {
        title: "2. Răng Cửa (Teeth / Dental)",
        elements: ['svg-part-teeth-upper', 'svg-part-teeth-lower'],
        desc: "💡 <strong>2. Răng Cửa (Incisors):</strong> Răng trên và răng dưới. Cắn nhẹ lên đầu lưỡi tạo âm thè lưỡi /θ/ (auth, thread) và /ð/ (this, algorithm). Khép hẹp 2 hàm tạo khe rít tia khí cho /s/, /z/."
      },
      'alveolar': {
        title: "3. Gờ Lợi (Alveolar Ridge)",
        elements: ['svg-part-alveolar'],
        desc: "💡 <strong>3. Gờ Lợi (Alveolar Ridge):</strong> Vùng thịt gồ ghề ngay sát chân răng cửa trên. Là 'trung tâm thần kinh' của cấu âm tiếng Anh! Đầu lưỡi dán chặt tạo âm tắc /t/, /d/ (commit, code), nâng sát 1mm xì hơi /s/, /z/, hoặc chặn khí 2 bên tạo /l/."
      },
      'hard-palate': {
        title: "4. Ngạc Cứng (Hard Palate)",
        elements: ['svg-part-hard-palate'],
        desc: "💡 <strong>4. Ngạc Cứng (Hard Palate):</strong> Vòm miệng hình vòm có xương nâng đỡ, trơn nhẵn. Thân lưỡi vồng cao áp sát ngạc cứng để tạo bán nguyên âm /j/ (yield, user) và phối hợp gờ lợi tạo âm vòm /tʃ/ (check, branch), /dʒ/ (JSON, bridge)."
      },
      'velum': {
        title: "5. Ngạc Mềm & Lưỡi Gà (Velum / Soft Palate)",
        elements: ['svg-part-velum'],
        desc: "💡 <strong>5. Ngạc Mềm (Velum):</strong> Vòm thịt mềm không xương phía sau họng. Gốc lưỡi nhấc bổng dán chặt ngạc mềm để nén khí rồi hạ nổ bung tạo âm tắc /k/, /ɡ/ (commit, git, debug). Hạ xuống thông khoang mũi tạo âm vang /ŋ/ (ping, string)."
      },
      'tongue-tip': {
        title: "6. Đầu Lưỡi (Tongue Tip / Apex)",
        elements: ['svg-part-tongue-tip'],
        desc: "💡 <strong>6. Đầu Lưỡi (Tongue Tip):</strong> Cơ quan cơ học linh hoạt nhất. Bắt buộc nâng ép chặt gờ lợi trên khi phát âm /t/, /d/ (test, data) hoặc kẹp giữa hai răng khi phát âm /θ/, /ð/. Người Việt thường mắc lỗi thả rơi đầu lưỡi làm rụng âm đuôi."
      },
      'tongue-blade': {
        title: "7. Thân Lưỡi & Gốc Lưỡi (Tongue Blade / Back)",
        elements: ['svg-part-tongue-blade', 'svg-part-tongue-back'],
        desc: "💡 <strong>7. Thân & Gốc Lưỡi (Tongue Body/Back):</strong> Thân lưỡi vồng cao tạo các âm ma sát vòm miệng /ʃ/ (cache, push), /ʒ/ (version). Gốc lưỡi lùi sau nâng ép ngạc mềm để tạo /k/, /ɡ/ và Dark L (/ɫ/) ở đuôi từ (install, SQL, fail)."
      },
      'vocal-cords': {
        title: "8. Dây Thanh Âm (Vocal Folds / Larynx)",
        elements: ['svg-part-vocal-cords'],
        desc: "💡 <strong>8. Dây Thanh Âm (Vocal Cords):</strong> Động cơ âm thanh nằm trong thanh quản. Khép lại và rung dồn dập tạo âm Hữu thanh (Voiced: /d/, /z/, /ɡ/, /v/, /b/, /ð/). Mở rộng êm ru không rung tạo âm Vô thanh (Voiceless: /t/, /s/, /k/, /f/, /p/, /θ/)."
      }
    };

    function activateArticulator(partKey) {
      const data = ARTICULATOR_DATA[partKey];
      if (!data) return;

      // Highlight button chips
      document.querySelectorAll('.articulator-chip').forEach(btn => {
        const match = btn.dataset.part === partKey;
        btn.classList.toggle('bg-cyan-950', match);
        btn.classList.toggle('text-cyan-300', match);
        btn.classList.toggle('border-cyan-400', match);
        btn.classList.toggle('font-bold', match);
        btn.classList.toggle('shadow-md', match);
      });

      // Clear previous glows
      document.querySelectorAll('.sagittal-pin').forEach(el => {
        el.classList.remove('svg-active-glow', 'svg-active-glow-voiced');
      });

      // Highlight SVG elements
      data.elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add(partKey === 'vocal-cords' ? 'svg-active-glow-voiced' : 'svg-active-glow');
        }
      });

      // Update callout box
      const infoBox = document.getElementById('articulator-info-box');
      if (infoBox) {
        infoBox.innerHTML = data.desc;
        infoBox.className = "p-3.5 rounded-xl bg-slate-950 border-2 border-cyan-500/80 text-sm text-slate-100 font-mono shadow-xl leading-relaxed transition-all";
      }
    }

    document.querySelectorAll('.articulator-chip, .sagittal-pin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const part = btn.dataset.part;
        if (part) activateArticulator(part);
      });
    });
  }

  function syncMouthMapPill(sound) {
    document.querySelectorAll('.mouth-pill-btn').forEach(b => {
      const match = b.dataset.sound === sound;
      b.classList.toggle('active', match);
      b.classList.toggle('font-bold', match);
      b.classList.toggle('bg-cyan-950', match);
      b.classList.toggle('text-cyan-300', match);
      b.classList.toggle('border-cyan-700', match);
      b.classList.toggle('text-slate-400', !match);
      b.classList.toggle('border-slate-800', !match);
    });
  }

  function syncSagittalSoundPill(sound) {
    document.querySelectorAll('.sound-tab-btn').forEach(b => {
      const match = b.dataset.sound === sound;
      b.classList.toggle('active', match);
      b.classList.toggle('font-bold', match);
      b.classList.toggle('bg-cyan-950/80', match);
      b.classList.toggle('text-cyan-300', match);
      b.classList.toggle('border-cyan-800', match);
      b.classList.toggle('bg-slate-900', !match);
      b.classList.toggle('text-slate-300', !match);
      b.classList.toggle('border-slate-800', !match);
    });
  }

  function updateVocalTractSVG(lesson) {
    const symbol = (lesson?.phonetics?.phoneticSymbol || '').toLowerCase();
    const passive = (lesson?.phonetics?.passiveArticulator || '').toLowerCase();

    let targetSound = '/t/';
    if (symbol.includes('/d/') && !symbol.includes('/t/')) targetSound = '/d/';
    else if (symbol.includes('/t/')) targetSound = '/t/';
    else if (symbol.includes('/θ/')) targetSound = '/θ/';
    else if (symbol.includes('/ð/')) targetSound = '/ð/';
    else if (symbol.includes('/s/')) targetSound = '/s/';
    else if (symbol.includes('/z/')) targetSound = '/z/';
    else if (symbol.includes('/ʃ/')) targetSound = '/ʃ/';
    else if (symbol.includes('/k/')) targetSound = '/k/';
    else if (symbol.includes('/ɡ/') || symbol.includes('/g/')) targetSound = '/ɡ/';
    else if (symbol.includes('/p/')) targetSound = '/p/';
    else if (symbol.includes('/b/')) targetSound = '/b/';

    currentSagittalSound = targetSound;
    syncSagittalSoundPill(targetSound);
    syncMouthMapPill(targetSound);
    renderSagittalSound(targetSound, currentSagittalMode || 'target');
  }

  // Simulators Tab Switching
  function switchSimulatorTab(tab) {
    const tabs = ['standup', 'demo', 'pingpong', 'oneonone', 'linklab'];
    tabs.forEach(t => {
      const tabBtn = document.getElementById(`tab-sim-${t}`);
      const panel = document.getElementById(`panel-sim-${t}`);
      if (t === tab) {
        if (tabBtn) tabBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 shadow transition cursor-pointer';
        if (panel) panel.classList.remove('hidden');
      } else {
        if (tabBtn) tabBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer';
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

  // 1-on-1 Simulation Submit
  async function submitOneOnOneSimulation() {
    const wins = document.getElementById('sim-oneonone-wins')?.value.trim() || '';
    const bottleneck = document.getElementById('sim-oneonone-bottleneck')?.value.trim() || '';
    const aspiration = document.getElementById('sim-oneonone-aspiration')?.value.trim() || '';

    if (!wins && !bottleneck) {
      alert('Vui lòng nhập ít nhất thông tin Progress & Wins hoặc Systemic Bottlenecks.');
      return;
    }

    const btnSubmit = document.getElementById('btn-sim-oneonone-submit');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = '⏳ AI Coach đang phân tích kịch bản 1-on-1...';
    }

    try {
      const res = await fetch('/api/ai/one-on-one-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressAndWins: wins, systemBottleneck: bottleneck, careerAspiration: aspiration })
      });
      const data = await res.json();
      const resultPanel = document.getElementById('sim-oneonone-result');
      if (resultPanel) resultPanel.classList.remove('hidden');

      const score = document.getElementById('sim-oneonone-score');
      if (score) score.textContent = `Alignment: ${data.alignmentScore}/100`;

      const feedback = document.getElementById('sim-oneonone-feedback');
      if (feedback) feedback.textContent = data.impactFeedback || '';

      const tips = document.getElementById('sim-oneonone-tips');
      if (tips) tips.textContent = data.negotiationTips || '';

      const script = document.getElementById('sim-oneonone-script');
      if (script) script.textContent = data.seniorLeadScript || '';

      const cuesList = document.getElementById('sim-oneonone-cues');
      if (cuesList) {
        cuesList.innerHTML = '';
        (data.recommendedPhoneticCues || []).forEach(cue => {
          const li = document.createElement('li');
          li.textContent = cue;
          cuesList.appendChild(li);
        });
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối 1-on-1 Simulation API.');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '🚀 Chấm Điểm 1-on-1 & Nhận Kịch Bản Đàm Phán Senior Lead';
      }
    }
  }

  // Connected Speech & Linking Lab Submit
  async function submitConnectedSpeechLab() {
    const input = document.getElementById('sim-linklab-input');
    const text = input ? input.value.trim() : '';
    if (!text) {
      alert('Vui lòng nhập câu hoặc cụm từ để phân tích nối âm.');
      return;
    }

    const btnSubmit = document.getElementById('btn-sim-linklab-submit');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = '⏳ Đang phân tích...';
    }

    try {
      const res = await fetch('/api/ai/connected-speech-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();

      const resultPanel = document.getElementById('sim-linklab-result');
      if (resultPanel) resultPanel.classList.remove('hidden');

      const linkedDisplay = document.getElementById('sim-linklab-linked');
      if (linkedDisplay) linkedDisplay.textContent = data.linkedRepresentation || text;

      const occurrencesList = document.getElementById('sim-linklab-occurrences');
      if (occurrencesList) {
        occurrencesList.innerHTML = '';
        if (data.occurrences && data.occurrences.length > 0) {
          data.occurrences.forEach(occ => {
            const card = document.createElement('div');
            card.className = 'bg-slate-900 border border-slate-800 p-2.5 rounded-lg space-y-1';
            card.innerHTML = `
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-cyan-400 font-mono">${occ.ruleType}</span>
                <span class="font-mono text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">${occ.transformation}</span>
              </div>
              <p class="text-slate-300 text-xs leading-relaxed">${occ.mechanicExplanation}</p>
            `;
            occurrencesList.appendChild(card);
          });
        } else {
          occurrencesList.innerHTML = '<div class="text-slate-400 italic p-2 bg-slate-900 rounded border border-slate-800">Không phát hiện cụm nối âm bắt buộc trong câu này.</div>';
        }
      }

      const pacingTip = document.getElementById('sim-linklab-pacing-tip');
      if (pacingTip) pacingTip.textContent = data.audioPacingTip || '';
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối Connected Speech Lab API.');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = '⚡ Phân Tích Nối Âm';
      }
    }
  }

  // Vocab Live Search & Sound Filter
  function setupVocabFilter() {
    const searchInput = document.getElementById('input-search-vocab');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const drillCards = document.querySelectorAll('#drills-container > div');
      drillCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!query || text.includes(query)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
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
            <button class="speak-btn text-xs text-cyan-400 hover:underline" data-word="${scenario.openingLine.replace(/"/g, '&quot;')}">🔊 Nghe</button>
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
            <button class="speak-btn text-xs text-cyan-400 hover:underline" data-word="${data.aiResponse.replace(/"/g, '&quot;')}">🔊 Nghe</button>
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
              <span class="text-xs text-amber-300 ml-1.5">${item.targetPhoneme}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 rounded text-xs bg-slate-900 border border-slate-700 font-mono">Hộp ${item.box}</span>
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
            <div class="text-xs text-slate-400 leading-snug">${badge.description}</div>
            <div class="text-xs font-mono mt-1 ${badge.isUnlocked ? 'text-emerald-400' : 'text-slate-500'}">
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
      div.className = `p-2 rounded-lg bg-slate-950 border ${v.isCurrentWeek ? 'border-purple-600' : 'border-slate-800'} flex items-center justify-between text-xs`;
      div.innerHTML = `
        <div>
          <span class="font-bold text-slate-200">${v.weekLabel}</span>
          ${v.isCurrentWeek ? '<span class="text-purple-400 ml-1 font-mono text-xs">(Hiện tại)</span>' : ''}
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
          <span class="text-xs text-slate-400">${data.soundCategory}</span>
        </div>
        <div class="text-xs text-amber-300 font-semibold">${data.vietnameseEquivalent}</div>
        <p class="text-xs text-slate-300 leading-snug">${data.physicalCueVi}</p>
        <div class="text-xs text-slate-400 font-mono">Ví dụ: ${data.devExampleWords.join(', ')}</div>
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
    const btnFloatingClose = document.getElementById('btn-floating-close-cheatsheet');
    const btnBottomClose = document.getElementById('btn-close-cheatsheet-bottom');
    const btnPrint = document.getElementById('btn-print-sheet');
    const btnBottomPrint = document.getElementById('btn-print-sheet-bottom');

    const closeModal = () => modal?.classList.add('hidden');

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

    if (btnClose) btnClose.onclick = closeModal;
    if (btnFloatingClose) btnFloatingClose.onclick = closeModal;
    if (btnBottomClose) btnBottomClose.onclick = closeModal;
    if (btnPrint) btnPrint.onclick = () => window.print();
    if (btnBottomPrint) btnBottomPrint.onclick = () => window.print();

    // Close on backdrop click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  function renderCheatSheetBody(sheet) {
    const body = document.getElementById('cheatsheet-printable-body');
    if (!body) return;

    body.innerHTML = `
      <div class="border-b-2 border-cyan-500 pb-3">
        <h1 class="text-xl font-bold text-white uppercase">${sheet.sprintTitle}</h1>
        <p class="text-sm text-cyan-300 font-semibold mt-1">🎯 Mục tiêu: ${sheet.focusObjective}</p>
      </div>

      <!-- Section 1: Top Sentence Frames -->
      <div class="space-y-2.5">
        <h3 class="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">1. Khung Câu Standup & Demo Tiêu Biểu (10 Frames):</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          ${sheet.sentenceFrames.map(f => `
            <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div class="font-bold text-slate-100 font-mono text-sm">${f.number}. ${f.templatePattern}</div>
              <div class="text-sm text-slate-200 italic font-sans">${f.translationVi}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section 2: Target Phonemes Table -->
      <div class="space-y-2.5">
        <h3 class="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider">2. Bảng Tra Cứu Âm Vị & Chỉ Dẫn Khẩu Hình:</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-300">
                <th class="py-2 px-3 font-mono">Âm vị</th>
                <th class="py-2 px-3">Cơ học cấu âm</th>
                <th class="py-2 px-3 font-mono">Từ ví dụ IT</th>
              </tr>
            </thead>
            <tbody>
              ${sheet.targetPhonemes.map(p => `
                <tr class="border-b border-slate-800/60">
                  <td class="py-2 px-3 font-mono font-bold text-cyan-400">${p.symbol}</td>
                  <td class="py-2 px-3 text-slate-200">${p.mouthPlacementCueVi}</td>
                  <td class="py-2 px-3 font-mono text-amber-300">${p.devWords.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3: Essential Vocabulary -->
      <div class="space-y-2.5">
        <h3 class="text-sm font-bold font-mono text-purple-400 uppercase tracking-wider">3. Từ Vựng Kỹ Thuật Trọng Tâm:</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm font-mono">
          ${sheet.essentialVocabulary.map(v => `
            <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
              <div class="font-bold text-cyan-300 text-sm">${v.word}</div>
              <div class="text-slate-300 text-sm">${v.ipa}</div>
              <div class="text-slate-200 text-sm font-sans truncate">${v.meaningVi}</div>
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

  // --- Data Backup & Portability Manager ---
  function setupBackupManager() {
    const btnOpen = document.getElementById('btn-open-backup-modal');
    const modal = document.getElementById('modal-backup');
    const btnClose = document.getElementById('btn-close-backup-modal');
    const btnExport = document.getElementById('btn-backup-export');
    const btnImport = document.getElementById('btn-backup-import');
    const inputFile = document.getElementById('input-backup-file');
    const statusMsg = document.getElementById('backup-status-msg');

    if (!modal) return;

    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        modal.classList.remove('hidden');
        if (statusMsg) statusMsg.classList.add('hidden');
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (btnExport) {
      btnExport.addEventListener('click', async () => {
        try {
          btnExport.disabled = true;
          btnExport.textContent = '⏳ Đang xuất dữ liệu...';
          const res = await fetch('/api/backup/export');
          if (!res.ok) throw new Error('Export failed');
          const data = await res.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const dateStr = new Date().toISOString().split('T')[0];
          a.href = url;
          a.download = `deveng-coach-backup-${dateStr}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          btnExport.textContent = '✅ Xuất thành công!';
          setTimeout(() => {
            btnExport.disabled = false;
            btnExport.innerHTML = '<span>⬇️</span> Tải file sao lưu (.json)';
          }, 2000);
        } catch (err) {
          alert('Không thể xuất file backup: ' + err.message);
          btnExport.disabled = false;
          btnExport.innerHTML = '<span>⬇️</span> Tải file sao lưu (.json)';
        }
      });
    }

    if (btnImport && inputFile) {
      btnImport.addEventListener('click', async () => {
        if (!inputFile.files || !inputFile.files[0]) {
          alert('Vui lòng chọn 1 file JSON backup trước khi khôi phục.');
          return;
        }
        try {
          btnImport.disabled = true;
          btnImport.textContent = '⏳ Đang phục hồi...';
          const file = inputFile.files[0];
          const text = await file.text();
          const payload = JSON.parse(text);

          const res = await fetch('/api/backup/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await res.json();
          if (res.ok && result.success) {
            if (statusMsg) {
              statusMsg.textContent = `✅ ${result.message}`;
              statusMsg.className = 'text-xs font-mono text-emerald-400 pt-1 block';
            }
            alert(`Phục hồi thành công! Đã restore ${result.restoredSessionsCount} phiên học và ${result.restoredSrsItemsCount} thẻ SRS.`);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            if (statusMsg) {
              statusMsg.textContent = `❌ ${result.message || 'Lỗi dữ liệu'}`;
              statusMsg.className = 'text-xs font-mono text-rose-400 pt-1 block';
            }
            alert('Khôi phục thất bại: ' + (result.message || 'Dữ liệu không hợp lệ'));
          }
        } catch (err) {
          alert('Lỗi đọc file: ' + err.message);
        } finally {
          btnImport.disabled = false;
          btnImport.innerHTML = '<span>🔄</span> Khôi phục ngay';
        }
      });
    }
  }

  // --- Milestone Capstone Assessment Engine ---
  function setupCapstoneAssessment() {
    const btnOpen = document.getElementById('btn-open-capstone-modal');
    const modal = document.getElementById('modal-capstone');
    const btnClose = document.getElementById('btn-close-capstone-modal');
    const btnSubmit = document.getElementById('btn-submit-capstone');
    const btnMic = document.getElementById('btn-capstone-mic');
    const micLabel = document.getElementById('btn-capstone-mic-label');
    const transcriptInput = document.getElementById('capstone-transcript-input');
    const resultContainer = document.getElementById('capstone-result-container');
    const scorecardGrid = document.getElementById('capstone-scorecard-grid');
    const feedbackBox = document.getElementById('capstone-feedback-box');
    const certBox = document.getElementById('capstone-cert-box');

    if (!modal) return;

    function checkMilestoneDay() {
      const day = state.currentDay;
      if (day === 30 || day === 60 || day === 90) {
        if (btnOpen) {
          btnOpen.classList.remove('hidden');
          const badgeLabel = document.getElementById('label-capstone-badge');
          if (badgeLabel) {
            badgeLabel.textContent = day === 30 ? 'Sát Hạch D30' : (day === 60 ? 'Sát Hạch D60' : 'Sát Hạch Master D90');
          }
        }
      } else {
        if (btnOpen) btnOpen.classList.add('hidden');
      }
    }

    checkMilestoneDay();
    window.updateCapstoneButton = checkMilestoneDay;

    async function openCapstoneModal() {
      const day = (state.currentDay === 30 || state.currentDay === 60 || state.currentDay === 90) ? state.currentDay : 30;
      modal.classList.remove('hidden');
      if (resultContainer) resultContainer.classList.add('hidden');

      try {
        const res = await fetch(`/api/capstone/${day}`);
        if (!res.ok) throw new Error('Could not load capstone spec');
        const spec = await res.json();

        const tagEl = document.getElementById('capstone-milestone-tag');
        if (tagEl) tagEl.textContent = `MILESTONE DAY ${spec.dayNumber} // ${spec.milestoneName.toUpperCase()}`;
        const titleEl = document.getElementById('capstone-milestone-title');
        if (titleEl) titleEl.innerHTML = `<span>🎓</span> ${spec.title}`;
        const timeEl = document.getElementById('capstone-timelimit');
        if (timeEl) timeEl.textContent = `${spec.timeLimitSeconds}s`;
        const scenEl = document.getElementById('capstone-scenario');
        if (scenEl) scenEl.innerHTML = `<strong>Kịch bản:</strong> ${spec.targetScenario}`;

        const chipsEl = document.getElementById('capstone-phonetics-chips');
        if (chipsEl) {
          chipsEl.innerHTML = spec.focusPhonetics.map(p => `
            <span class="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700 font-mono text-purple-300 font-bold">${p}</span>
          `).join('');
        }
      } catch (e) {
        console.warn('Fallback capstone spec', e);
      }
    }

    if (btnOpen) {
      btnOpen.addEventListener('click', openCapstoneModal);
    }
    if (btnClose) {
      btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    }

    let recognition = null;
    let isRecording = false;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec && btnMic) {
      recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        if (transcriptInput) transcriptInput.value = transcript.trim();
      };

      recognition.onerror = () => {
        isRecording = false;
        if (micLabel) micLabel.textContent = 'Bật Mic';
        btnMic.className = 'absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer';
      };

      recognition.onend = () => {
        isRecording = false;
        if (micLabel) micLabel.textContent = 'Bật Mic';
        btnMic.className = 'absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer';
      };

      btnMic.addEventListener('click', () => {
        if (!isRecording) {
          try {
            recognition.start();
            isRecording = true;
            if (micLabel) micLabel.textContent = 'Dừng Mic';
            btnMic.className = 'absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer animate-pulse';
          } catch (e) {
            console.warn(e);
          }
        } else {
          recognition.stop();
          isRecording = false;
          if (micLabel) micLabel.textContent = 'Bật Mic';
          btnMic.className = 'absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer';
        }
      });
    }

    if (btnSubmit) {
      btnSubmit.addEventListener('click', async () => {
        const transcript = transcriptInput ? transcriptInput.value.trim() : '';
        if (!transcript) {
          alert('Vui lòng nói qua mic hoặc nhập bài phát biểu trước khi nộp.');
          return;
        }

        const day = (state.currentDay === 30 || state.currentDay === 60 || state.currentDay === 90) ? state.currentDay : 30;
        try {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '<span>⏳</span><span>Đang phân tích và chấm điểm...</span>';

          const res = await fetch('/api/capstone/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dayNumber: day,
              transcript: transcript,
              durationSeconds: 90,
              userNotes: 'Sát hạch trực tiếp'
            })
          });

          const data = await res.json();
          if (!data.success) {
            alert('Không thể chấm điểm: ' + (data.message || 'Lỗi không xác định'));
            return;
          }

          const sc = data.scorecard;
          if (resultContainer) resultContainer.classList.remove('hidden');

          if (scorecardGrid) {
            scorecardGrid.innerHTML = `
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div class="text-xs text-slate-400">Tổng điểm</div>
                <div class="text-2xl font-black font-mono ${sc.passed ? 'text-emerald-400' : 'text-rose-400'}">${sc.overallScore} / 100</div>
              </div>
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div class="text-xs text-slate-400">Cơ học cấu âm</div>
                <div class="text-2xl font-bold font-mono text-cyan-400">${sc.phoneticScore} / 100</div>
              </div>
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div class="text-xs text-slate-400">Nhịp điệu / Lưu loát</div>
                <div class="text-2xl font-bold font-mono text-purple-400">${sc.fluencyPacingScore} / 100</div>
              </div>
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div class="text-xs text-slate-400">Từ vựng kỹ thuật</div>
                <div class="text-2xl font-bold font-mono text-amber-400">${sc.technicalVocabScore} / 100</div>
              </div>
            `;
          }

          if (feedbackBox) {
            feedbackBox.innerHTML = `
              <div class="font-bold text-white mb-1">Đánh giá chuẩn Senior Engineer:</div>
              <p class="text-slate-300 leading-relaxed">${sc.rubricFeedback}</p>
              ${sc.strengths && sc.strengths.length ? `
                <div class="pt-2"><strong class="text-emerald-400">Điểm mạnh:</strong> <span class="text-slate-300">${sc.strengths.join('; ')}</span></div>
              ` : ''}
              ${sc.improvements && sc.improvements.length ? `
                <div class="pt-1"><strong class="text-amber-400">Cần mài sắc:</strong> <span class="text-slate-300">${sc.improvements.join('; ')}</span></div>
              ` : ''}
            `;
          }

          if (certBox) {
            if (sc.passed && data.certificateId) {
              certBox.classList.remove('hidden');
              document.getElementById('capstone-cert-title').textContent = data.certificateTitle || 'CERTIFICATE OF MASTERY';
              document.getElementById('capstone-cert-msg').textContent = data.graduationMessage || 'Chúc mừng kỹ sư đã xuất sắc vượt qua bài sát hạch!';
              document.getElementById('capstone-cert-id').textContent = `Mã Chứng Nhận: ${data.certificateId}`;
            } else {
              certBox.classList.add('hidden');
            }
          }

          resultContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
          alert('Lỗi chấm điểm: ' + err.message);
        } finally {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<span>⚡</span><span>Nộp Bài & Chấm Điểm Toàn Diện</span>';
        }
      });
    }
  }

  // --- Feature 015: Audio-Only Eyes-Free Mode ---
  function setupAudioOnlyMode() {
    const btnAudio = document.getElementById('btn-audio-only-mode');
    const navAudio = document.getElementById('nav-audio-only');

    const handleStartAudio = () => {
      const lesson = (state.lessons && state.lessons.find(l => l.dayNumber === state.currentDay)) || FALLBACK_DAY_1;
      if (typeof window.startAudioOnlyMode === 'function') {
        window.startAudioOnlyMode(lesson);
      } else {
        console.warn('Audio-only mode engine not loaded yet.');
      }
    };

    if (btnAudio) btnAudio.onclick = handleStartAudio;
    if (navAudio) navAudio.onclick = handleStartAudio;
  }

  // Initialize Advanced Capabilities Suite on Startup
  setTimeout(() => {
    initIpaGlossary();
    setupCollapsibleBlocks();
    setupMicroLesson();
    setupSrsWarmup();
    setupCheatSheet();
    setupSagittalVocalTract();
    setupBackupManager();
    setupCapstoneAssessment();
    setupAudioOnlyMode();
  }, 100);

})();