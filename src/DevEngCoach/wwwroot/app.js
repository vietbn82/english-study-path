// DevEng Coach - Client Application
(() => {
  // Application State
  const state = {
    currentDay: 1,
    lessons: [],
    sessions: {},
    summary: null,
    timer: {
      totalSeconds: 30 * 60,
      remainingSeconds: 30 * 60,
      intervalId: null,
      isRunning: false
    },
    isRecording: false,
    recognition: null
  };

  // DOM Elements
  const el = {
    navWorkspace: document.getElementById('nav-workspace'),
    navCurriculum: document.getElementById('nav-curriculum'),
    viewWorkspace: document.getElementById('view-workspace'),
    viewCurriculum: document.getElementById('view-curriculum'),
    statStreak: document.getElementById('stat-streak'),
    statVariance: document.getElementById('stat-variance'),
    statProgress: document.getElementById('stat-progress'),
    statReminderTime: document.getElementById('stat-reminder-time'),
    btnTestNotification: document.getElementById('btn-test-notification'),
    
    // Day Hero
    badgeDay: document.getElementById('badge-day'),
    badgeSprintName: document.getElementById('badge-sprint-name'),
    lessonTitle: document.getElementById('lesson-title'),
    lessonObjective: document.getElementById('lesson-objective'),
    
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
    
    // Completion
    inputActualMinutes: document.getElementById('input-actual-minutes'),
    btnCompleteSession: document.getElementById('btn-complete-session'),
    
    // Curriculum Grid
    curriculumGrid: document.getElementById('curriculum-grid')
  };

  // Initialize
  async function init() {
    setupEventListeners();
    setupSpeechRecognition();
    await fetchInitialData();
  }

  // Event Listeners
  function setupEventListeners() {
    el.navWorkspace.addEventListener('click', () => switchView('workspace'));
    el.navCurriculum.addEventListener('click', () => switchView('curriculum'));

    el.btnTimerStart.addEventListener('click', startTimer);
    el.btnTimerPause.addEventListener('click', pauseTimer);
    el.btnTimerReset.addEventListener('click', resetTimer);

    el.btnTestNotification.addEventListener('click', triggerTestNotification);
    el.btnEvaluateAi.addEventListener('click', evaluateWithAi);
    el.btnCompleteSession.addEventListener('click', completeCurrentSession);

    // Day Switcher Controls (Prev / Next / Direct Jump)
    const btnPrevDay = document.getElementById('btn-prev-day');
    const btnNextDay = document.getElementById('btn-next-day');
    const selectJumpDay = document.getElementById('select-jump-day');

    if (btnPrevDay) {
      btnPrevDay.addEventListener('click', () => {
        if (state.currentDay > 1) {
          loadDayLesson(state.currentDay - 1);
        }
      });
    }

    if (btnNextDay) {
      btnNextDay.addEventListener('click', () => {
        if (state.currentDay < 90) {
          loadDayLesson(state.currentDay + 1);
        }
      });
    }

    if (selectJumpDay) {
      selectJumpDay.addEventListener('change', (e) => {
        const targetDay = parseInt(e.target.value, 10);
        if (targetDay >= 1 && targetDay <= 90) {
          loadDayLesson(targetDay);
        }
      });
    }

    // Global Delegated Click Listeners for dynamic audio playback and copying
    document.addEventListener('click', (e) => {
      const speakBtn = e.target.closest('.speak-btn');
      if (speakBtn && speakBtn.dataset.word) {
        e.preventDefault();
        e.stopPropagation();
        speakWord(speakBtn.dataset.word);
        return;
      }

      const copyBtn = e.target.closest('.copy-frame-btn');
      if (copyBtn && copyBtn.dataset.pattern) {
        e.preventDefault();
        navigator.clipboard.writeText(copyBtn.dataset.pattern);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => copyBtn.textContent = originalText, 1500);
      }
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
  }

  // View Switching
  function switchView(view) {
    if (view === 'workspace') {
      el.viewWorkspace.classList.remove('hidden');
      el.viewCurriculum.classList.add('hidden');
      el.navWorkspace.className = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500 text-slate-950 shadow-sm transition';
      el.navCurriculum.className = 'px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition';
    } else {
      el.viewWorkspace.classList.add('hidden');
      el.viewCurriculum.classList.remove('hidden');
      el.navWorkspace.className = 'px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition';
      el.navCurriculum.className = 'px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500 text-slate-950 shadow-sm transition';
      renderCurriculumGrid('all');
    }
  }

  // Fetch Initial Data
  async function fetchInitialData() {
    try {
      const [curriculumRes, progressRes, sessionsRes] = await Promise.all([
        fetch('/api/curriculum'),
        fetch('/api/progress'),
        fetch('/api/progress/sessions')
      ]);

      state.lessons = await curriculumRes.json();
      state.summary = await progressRes.json();
      const sessions = await sessionsRes.json();

      state.sessions = {};
      sessions.forEach(s => {
        state.sessions[s.dayNumber] = s;
      });

      // Populate day selector options
      const selectJumpDay = document.getElementById('select-jump-day');
      if (selectJumpDay && selectJumpDay.options.length === 0) {
        state.lessons.forEach(l => {
          const opt = document.createElement('option');
          opt.value = l.dayNumber;
          opt.textContent = `Ngày ${l.dayNumber}: ${l.title} (S${l.sprintId})`;
          selectJumpDay.appendChild(opt);
        });
      }

      updateTelemetryUI();

      // Open current / next scheduled day
      state.currentDay = state.summary.nextDayNumber || 1;
      loadDayLesson(state.currentDay);

    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  }

  // Update Top Stats Bar
  function updateTelemetryUI() {
    if (!state.summary) return;
    el.statStreak.textContent = `${state.summary.currentStreakDays} ngày`;
    
    const variance = state.summary.varianceMinutes;
    const sign = variance > 0 ? `+${variance}m` : `${variance}m`;
    el.statVariance.textContent = `${state.summary.totalActualMinutesSpent}m / ${state.summary.totalPlannedMinutesExpected}m (${sign})`;
    
    el.statProgress.textContent = `${state.summary.completionPercentage}% (${state.summary.totalCompletedDays}/90)`;
  }

  // Load Day Lesson into Workspace
  function loadDayLesson(dayNumber) {
    const lesson = state.lessons.find(l => l.dayNumber === dayNumber);
    if (!lesson) return;

    state.currentDay = dayNumber;

    const selectJumpDay = document.getElementById('select-jump-day');
    if (selectJumpDay) {
      selectJumpDay.value = dayNumber;
    }

    // Header
    el.badgeDay.textContent = `DAY ${lesson.dayNumber} // SPRINT ${lesson.sprintId}`;
    el.badgeSprintName.textContent = lesson.sprintTitle;
    el.lessonTitle.textContent = lesson.title;
    el.lessonObjective.textContent = lesson.focusObjective;

    // Stage 1: Phonetics
    el.phoneticsSymbol.textContent = lesson.phonetics.phoneticSymbol;
    el.phoneticsActive.textContent = lesson.phonetics.activeArticulator;
    el.phoneticsPassive.textContent = lesson.phonetics.passiveArticulator;
    el.phoneticsManner.textContent = lesson.phonetics.mannerOfArticulation;
    el.phoneticsVoiced.textContent = lesson.phonetics.isVoiced ? "Có rung (Voiced)" : "Không rung / Bật gió (Voiceless)";
    el.phoneticsInstruction.textContent = lesson.phonetics.mechanicalInstructions;
    el.phoneticsMistake.textContent = lesson.phonetics.commonVietnameseMistake;

    // Drills
    el.drillsContainer.innerHTML = '';
    lesson.vocabularyDrills.forEach(drill => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800 text-xs';
      row.innerHTML = `
        <div class="flex items-center gap-2">
          <button class="speak-btn text-cyan-400 hover:text-cyan-300 font-bold px-1 py-0.5 rounded hover:bg-slate-800" data-word="${drill.word}" title="Nghe phát âm">🔊</button>
          <div>
            <span class="font-bold text-slate-100">${drill.word}</span>
            <span class="font-mono text-cyan-400 text-[11px] ml-1">${drill.ipa}</span>
            <span class="text-slate-400 ml-1.5">— ${drill.meaningVi}</span>
          </div>
        </div>
        <div class="text-[11px] text-slate-400 italic hidden sm:block">${drill.physicalNote}</div>
      `;
      el.drillsContainer.appendChild(row);
    });

    // Stage 2: Sentence Frames
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
          <button class="speak-btn text-blue-400 hover:text-blue-300 font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 shrink-0 ml-2" data-word="${frame.exampleUsage}" title="Nghe phát âm mẫu">🔊 Nghe</button>
        </div>
      `;
      el.framesContainer.appendChild(card);
    });

    el.frameVariables.textContent = Array.from(allVars).join(', ') || '[Feature], [Component], [Task]';

    // Stage 3: Practice Task
    el.taskPrompt.textContent = lesson.practiceTask.prompt;
    el.taskScenario.textContent = `Ngữ cảnh: ${lesson.practiceTask.scenarioVi}`;
    el.aiInputText.value = '';
    el.aiFeedbackBox.classList.add('hidden');

    // Pre-populate actual minutes
    el.inputActualMinutes.value = "30";

    // Switch view to workspace
    switchView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Render 90-Day Curriculum Grid
  function renderCurriculumGrid(sprintFilter = 'all') {
    el.curriculumGrid.innerHTML = '';

    const filtered = state.lessons.filter(l => {
      if (sprintFilter === 'all') return true;
      return l.sprintId === parseInt(sprintFilter, 10);
    });

    filtered.forEach(l => {
      const isCompleted = state.sessions[l.dayNumber]?.status === 'Completed';
      const isCurrent = l.dayNumber === state.currentDay;

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
                ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 font-mono">✓ Done</span>'
                : isCurrent
                ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 font-mono">Active</span>'
                : '<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">Pending</span>'
            }
          </div>
          <div class="font-bold text-xs text-slate-200 line-clamp-2 leading-snug">${l.title}</div>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
          <span class="text-cyan-400/80">${l.phonetics.phoneticSymbol}</span>
          <span>S${l.sprintId}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        loadDayLesson(l.dayNumber);
      });

      el.curriculumGrid.appendChild(card);
    });
  }

  // Native Speech Synthesis (Audio Output)
  function speakWord(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for crisp articulation listening
    window.speechSynthesis.speak(utterance);
  }

  // Web Speech Recognition (Mic Input)
  function setupSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      el.btnSpeechRecord.style.display = 'none';
      return;
    }

    state.recognition = new SpeechRec();
    state.recognition.continuous = false;
    state.recognition.interimResults = false;
    state.recognition.lang = 'en-US';

    state.recognition.onstart = () => {
      state.isRecording = true;
      el.recordLabel.textContent = 'Đang nghe...';
      el.btnSpeechRecord.className = 'text-xs px-2.5 py-1 bg-red-950 text-red-400 border border-red-800 rounded flex items-center gap-1 animate-pulse';
    };

    state.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      el.aiInputText.value = (el.aiInputText.value ? el.aiInputText.value + ' ' : '') + transcript;
    };

    state.recognition.onend = () => {
      state.isRecording = false;
      el.recordLabel.textContent = 'Nói vào mic';
      el.btnSpeechRecord.className = 'text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition';
    };

    el.btnSpeechRecord.addEventListener('click', () => {
      if (state.isRecording) {
        state.recognition.stop();
      } else {
        state.recognition.start();
      }
    });
  }

  // Evaluate with AI (AGY CLI)
  async function evaluateWithAi() {
    const text = el.aiInputText.value.trim();
    if (!text) {
      alert('Vui lòng nhập câu hoặc nói vào micro trước khi chấm điểm.');
      return;
    }

    el.btnEvaluateAi.disabled = true;
    el.btnEvaluateAi.innerHTML = '<span>⏳ AGY AI đang phân tích âm & ngữ pháp...</span>';

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

      el.aiFeedbackBox.classList.remove('hidden');
      el.aiFluencyBadge.textContent = `Score: ${data.fluencyScore}/100`;
      el.aiGrammarFix.textContent = data.grammarCorrections || 'Ngữ pháp chuẩn xác.';
      
      el.aiPhoneticAlerts.innerHTML = '';
      (data.phoneticMechanicsAlerts || []).forEach(alertItem => {
        const li = document.createElement('li');
        li.textContent = alertItem;
        el.aiPhoneticAlerts.appendChild(li);
      });

      el.aiSeniorRefactor.textContent = data.seniorDevRefactoring || text;

    } catch (err) {
      console.error('AI evaluation failed', err);
      alert('Không thể kết nối với AI Coach. Vui lòng thử lại.');
    } finally {
      el.btnEvaluateAi.disabled = false;
      el.btnEvaluateAi.innerHTML = '<span>🚀 Chấm điểm bằng AGY AI Assistant</span>';
    }
  }

  // Complete Current Day Session
  async function completeCurrentSession() {
    const minutes = parseInt(el.inputActualMinutes.value, 10) || 30;

    try {
      const res = await fetch('/api/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: state.currentDay,
          actualMinutes: minutes,
          selfRating: 5,
          learnerNotes: el.aiInputText.value.trim() || 'Completed daily routine.',
          aiFeedbackSnippet: el.aiSeniorRefactor.textContent
        })
      });

      const updatedLog = await res.json();
      state.sessions[state.currentDay] = updatedLog;

      // Refresh progress summary
      const progressRes = await fetch('/api/progress');
      state.summary = await progressRes.json();
      // Populate day selector options
      const selectJumpDay = document.getElementById('select-jump-day');
      if (selectJumpDay && selectJumpDay.options.length === 0) {
        state.lessons.forEach(l => {
          const opt = document.createElement('option');
          opt.value = l.dayNumber;
          opt.textContent = `Ngày ${l.dayNumber}: ${l.title} (S${l.sprintId})`;
          selectJumpDay.appendChild(opt);
        });
      }

      updateTelemetryUI();

      alert(`🎉 Chúc mừng bạn đã hoàn thành Ngày ${state.currentDay}! Streak hiện tại: ${state.summary.currentStreakDays} ngày.`);

      // Advance to next day if available
      if (state.currentDay < 90) {
        loadDayLesson(state.currentDay + 1);
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
    el.timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const percent = (state.timer.remainingSeconds / state.timer.totalSeconds) * 100;
    el.timerProgress.style.width = `${percent}%`;

    const elapsed = state.timer.totalSeconds - state.timer.remainingSeconds;
    if (elapsed < 10 * 60) {
      el.timerPhaseHint.textContent = 'Phase 1 (00-10m): Cơ Học Khẩu Hình & Âm Đuôi';
    } else if (elapsed < 20 * 60) {
      el.timerPhaseHint.textContent = 'Phase 2 (10-20m): Nạp Khung Câu Đóng Băng';
    } else {
      el.timerPhaseHint.textContent = 'Phase 3 (20-30m): Nói & Chấm Điểm Cùng AGY AI';
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

  // Run Init
  document.addEventListener('DOMContentLoaded', init);
})();
