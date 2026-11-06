/**
 * DevEng Coach - Spec 015: Audio-Only Eyes-Free Mode (Chế độ Nghe Nhắm Mắt)
 * Allows exhausted learners (especially at 22:00) to practice with their eyes closed.
 * Generates an automated dual-language narration script (vi-VN instructions + en-US targets),
 * synthesizes Web Audio chimes for practice pauses, provides an OLED-friendly high-contrast HUD,
 * tap gestures (single tap pause, double tap repeat), and auto-completes with SessionMode="AudioOnly".
 */

(function (window) {
  'use strict';

  // --- AUDIO SYNTHESIS & CHIME ENGINE (Web Audio API) ---
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Soft ascending chime signaling learner's turn to speak
  function playPracticeChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Two-tone gentle bell chime: D5 (587.33Hz) -> A5 (880Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.65);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch (e) {
      console.warn('[AudioOnly] Chime playback note:', e);
    }
  }

  // Subtle confirmation beep for tap / pause / resume
  function playConfirmationBeep(freq = 520, duration = 0.08) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Ignored
    }
  }

  // --- SCRIPT COMPILER: LESSON -> AUDIOSCRIPT ---
  function compileLessonToAudioScript(lesson) {
    if (!lesson) {
      throw new Error('Lesson cannot be null or undefined.');
    }

    const day = lesson.dayNumber ?? lesson.DayNumber ?? 1;
    const title = lesson.title ?? lesson.Title ?? `Ngày ${day}`;
    const objective = lesson.focusObjective ?? lesson.FocusObjective ?? '';
    const phonetics = lesson.phonetics ?? lesson.Phonetics ?? {};
    const targetSound = phonetics.targetSound ?? phonetics.TargetSound ?? '';
    const phoneticSymbol = phonetics.phoneticSymbol ?? phonetics.PhoneticSymbol ?? '';
    const mechanical = phonetics.mechanicalInstructions ?? phonetics.MechanicalInstructions ?? '';
    const commonMistake = phonetics.commonVietnameseMistake ?? phonetics.CommonVietnameseMistake ?? '';
    const physicalCue = phonetics.physicalCue ?? phonetics.PhysicalCue ?? '';

    const vocab = lesson.vocabularyDrills ?? lesson.VocabularyDrills ?? [];
    const frames = lesson.sentenceFrames ?? lesson.SentenceFrames ?? [];
    const task = lesson.practiceTask ?? lesson.PracticeTask ?? null;

    const segments = [];

    function addSegment(seg) {
      segments.push({
        id: segments.length + 1,
        type: seg.type || 'Instruction',
        text: seg.text || '',
        lang: seg.lang || 'vi-VN',
        rate: seg.rate || (seg.lang === 'en-US' ? 0.95 : 1.0),
        pauseDurationMs: seg.pauseDurationMs || 0,
        playChime: Boolean(seg.playChime),
        itemIndex: seg.itemIndex ?? segments.length,
        display: {
          phase: seg.display?.phase || 'Chế độ Nghe',
          progress: seg.display?.progress || `Ngày ${day}`,
          largeText: seg.display?.largeText || title,
          subText: seg.display?.subText || objective || 'Lắng nghe hướng dẫn...'
        }
      });
    }

    // 1. INTRO / WELCOME
    addSegment({
      type: 'Instruction',
      lang: 'vi-VN',
      text: `Chào bạn. Chào mừng bạn đến với phiên học nghe nhắm mắt, Ngày ${day}: ${title}. ${objective ? 'Mục tiêu hôm nay: ' + objective + '.' : ''}`,
      display: {
        phase: 'Giới thiệu',
        progress: `Ngày ${day} · Mở đầu`,
        largeText: `Ngày ${day}: ${title}`,
        subText: objective || 'Nhắm mắt và lắng nghe hướng dẫn'
      }
    });

    // 2. PHONETICS MECHANICS
    if (targetSound || phoneticSymbol || mechanical) {
      addSegment({
        type: 'Instruction',
        lang: 'vi-VN',
        text: `Phần một: Cơ học khẩu hình cho âm ${targetSound} ${phoneticSymbol}. ${mechanical}`,
        display: {
          phase: 'Khẩu hình',
          progress: `Âm ${targetSound} ${phoneticSymbol}`,
          largeText: `${targetSound} ${phoneticSymbol}`,
          subText: mechanical
        }
      });

      if (physicalCue) {
        addSegment({
          type: 'Instruction',
          lang: 'vi-VN',
          text: `Mẹo cảm giác: ${physicalCue}`,
          display: {
            phase: 'Khẩu hình',
            progress: `Mẹo cơ học`,
            largeText: `Mẹo: ${physicalCue}`,
            subText: 'Cảm nhận vị trí đặt lưỡi và hơi thở'
          }
        });
      }

      if (commonMistake) {
        addSegment({
          type: 'Instruction',
          lang: 'vi-VN',
          text: `Lưu ý lỗi người Việt hay gặp: ${commonMistake}`,
          display: {
            phase: 'Khẩu hình',
            progress: `Lưu ý lỗi sai`,
            largeText: `Tránh lỗi: ${commonMistake}`,
            subText: 'Kiểm soát khẩu hình chuẩn xác'
          }
        });
      }
    }

    // 3. VOCABULARY DRILLS
    if (vocab.length > 0) {
      addSegment({
        type: 'Instruction',
        lang: 'vi-VN',
        text: `Tiếp theo là phần luyện tập ${vocab.length} từ vựng kỹ thuật. Sau mỗi từ, bạn sẽ nghe âm mẫu tiếng Anh, một tiếng chuông và 3 giây để bạn tự phát âm lại.`,
        display: {
          phase: 'Từ vựng',
          progress: `0/${vocab.length} từ`,
          largeText: 'Luyện Từ Vựng Kỹ Thuật',
          subText: `Gồm ${vocab.length} từ quan trọng`
        }
      });

      vocab.forEach((drill, index) => {
        const word = drill.word ?? drill.Word ?? '';
        const ipa = drill.ipa ?? drill.Ipa ?? '';
        const meaning = drill.meaningVi ?? drill.MeaningVi ?? '';
        const physical = drill.physicalNote ?? drill.PhysicalNote ?? '';
        const itemIdx = segments.length;

        // (a) Vietnamese announcement
        addSegment({
          type: 'DrillWord',
          lang: 'vi-VN',
          itemIndex: itemIdx,
          text: `Từ thứ ${index + 1}: ${word}${meaning ? ', nghĩa là ' + meaning : ''}.${physical ? ' Mẹo phát âm: ' + physical + '.' : ''}`,
          display: {
            phase: 'Từ vựng',
            progress: `Từ ${index + 1}/${vocab.length} · Giới thiệu`,
            largeText: word,
            subText: `${ipa} ${meaning ? '— ' + meaning : ''}`
          }
        });

        // (b) English pronunciation target
        addSegment({
          type: 'DrillWord',
          lang: 'en-US',
          itemIndex: itemIdx,
          text: word,
          display: {
            phase: 'Từ vựng',
            progress: `Từ ${index + 1}/${vocab.length} · Lắng nghe mẫu`,
            largeText: word,
            subText: `${ipa} (English en-US)`
          }
        });

        // (c) Cue instruction
        addSegment({
          type: 'Instruction',
          lang: 'vi-VN',
          itemIndex: itemIdx,
          text: `Bây giờ bạn nói: ${word}`,
          display: {
            phase: 'Từ vựng',
            progress: `Từ ${index + 1}/${vocab.length} · Luyện tập`,
            largeText: word,
            subText: 'Chuẩn bị phát âm sau tiếng chuông'
          }
        });

        // (d) 3-second practice pause with chime
        addSegment({
          type: 'Pause',
          lang: 'vi-VN',
          itemIndex: itemIdx,
          pauseDurationMs: 3000,
          playChime: true,
          display: {
            phase: 'Từ vựng',
            progress: `Từ ${index + 1}/${vocab.length} · Thực hành (3s)`,
            largeText: '🗣️ Bây giờ bạn nói...',
            subText: word
          }
        });
      });
    }

    // 4. SENTENCE FRAMES
    if (frames.length > 0) {
      addSegment({
        type: 'Instruction',
        lang: 'vi-VN',
        text: `Phần hai: Khung câu kỹ thuật cho họp Daily Standup và thảo luận nhóm. Bạn sẽ nghe mẫu câu tiếng Anh và có 3 giây để luyện nói.`,
        display: {
          phase: 'Khung câu',
          progress: `0/${frames.length} mẫu câu`,
          largeText: 'Khung Câu Kỹ Thuật',
          subText: `${frames.length} mẫu câu giao tiếp kỹ thuật`
        }
      });

      frames.forEach((frame, index) => {
        const name = frame.templateName ?? frame.TemplateName ?? `Khung câu ${index + 1}`;
        const pattern = frame.templatePattern ?? frame.TemplatePattern ?? '';
        const example = frame.exampleUsage ?? frame.ExampleUsage ?? pattern;
        const translation = frame.vietnameseTranslation ?? frame.VietnameseTranslation ?? '';
        const itemIdx = segments.length;

        // (a) Vietnamese context
        addSegment({
          type: 'SentenceFrame',
          lang: 'vi-VN',
          itemIndex: itemIdx,
          text: `Khung câu thứ ${index + 1}: ${name}.${translation ? ' Nghĩa là: ' + translation + '.' : ''}`,
          display: {
            phase: 'Khung câu',
            progress: `Khung câu ${index + 1}/${frames.length}`,
            largeText: name,
            subText: translation
          }
        });

        // (b) English TTS example
        addSegment({
          type: 'SentenceFrame',
          lang: 'en-US',
          itemIndex: itemIdx,
          text: example || pattern,
          display: {
            phase: 'Khung câu',
            progress: `Khung câu ${index + 1}/${frames.length} · Nghe mẫu`,
            largeText: example || pattern,
            subText: translation
          }
        });

        // (c) Prompt
        addSegment({
          type: 'Instruction',
          lang: 'vi-VN',
          itemIndex: itemIdx,
          text: `Bây giờ bạn lặp lại khung câu này:`,
          display: {
            phase: 'Khung câu',
            progress: `Khung câu ${index + 1}/${frames.length} · Luyện tập`,
            largeText: example || pattern,
            subText: 'Luyện nói sau tiếng chuông'
          }
        });

        // (d) 3-second practice pause with chime
        addSegment({
          type: 'Pause',
          lang: 'vi-VN',
          itemIndex: itemIdx,
          pauseDurationMs: 3000,
          playChime: true,
          display: {
            phase: 'Khung câu',
            progress: `Khung câu ${index + 1}/${frames.length} · Thực hành (3s)`,
            largeText: '🗣️ Nói khung câu của bạn...',
            subText: example || pattern
          }
        });
      });
    }

    // 5. PRACTICE TASK / LESSON SUMMARY
    if (task) {
      const prompt = task.prompt ?? task.Prompt ?? '';
      const scenario = task.scenarioVi ?? task.ScenarioVi ?? '';
      addSegment({
        type: 'Summary',
        lang: 'vi-VN',
        text: `Phần ba: Bài tập ứng dụng Standup. ${prompt}. ${scenario ? 'Tình huống: ' + scenario : ''}`,
        display: {
          phase: 'Thực hành',
          progress: 'Tình huống Standup',
          largeText: 'Tình huống Standup',
          subText: prompt || scenario
        }
      });

      addSegment({
        type: 'Pause',
        lang: 'vi-VN',
        pauseDurationMs: 3000,
        playChime: true,
        display: {
          phase: 'Thực hành',
          progress: 'Thực hành Standup (3s)',
          largeText: '🗣️ Nói tóm tắt cập nhật của bạn...',
          subText: scenario || prompt
        }
      });
    }

    // 6. COMPLETION CONGRATULATIONS
    addSegment({
      type: 'Completion',
      lang: 'vi-VN',
      text: `Xong! Ngày ${day} hoàn thành chế độ nghe. Bạn đã hoàn thành buổi học hôm nay một cách xuất sắc. Hãy nghỉ ngơi, ngày mai gặp lại lúc 22:00!`,
      display: {
        phase: 'Hoàn thành',
        progress: `Ngày ${day} Hoàn Tất 🎉`,
        largeText: `🎉 Hoàn Thành Ngày ${day}!`,
        subText: 'Đang lưu kết quả Audio-Only...'
      }
    });

    // Provide both array and object-like accessors
    segments.dayNumber = day;
    segments.lesson = lesson;
    segments.segments = segments;
    return segments;
  }

  // --- AUDIO-ONLY HUD OVERLAY & SESSION RUNNER ---
  class AudioOnlySession {
    constructor(lesson) {
      this.lesson = lesson;
      this.script = compileLessonToAudioScript(lesson);
      this.currentIndex = 0;
      this.isPaused = false;
      this.isStopped = false;
      this.activeTimeout = null;
      this.dimTimeout = null;
      this.lastTapTime = 0;
      this.singleTapTimeout = null;

      this.hudOverlay = null;
      this.elLargeText = null;
      this.elSubText = null;
      this.elProgress = null;
      this.elPhase = null;
      this.elBtnPause = null;
      this.elBtnRepeat = null;
      this.elBtnSkip = null;
      this.elStatus = null;

      this.currentUtterance = null;
      this.pauseRemainingMs = 0;
      this.pauseStartedAt = 0;
    }

    start() {
      this.createHUD();
      this.resetDimTimer();
      this.playSegment(0);
    }

    createHUD() {
      // Remove any existing HUD
      const existing = document.getElementById('audio-only-hud');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'audio-only-hud';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Chế độ luyện nghe nhắm mắt (Eyes-Free Audio Mode)');

      // Fullscreen minimal eyes-free styles
      overlay.className = 'fixed inset-0 z-[9999] flex flex-col justify-between bg-black text-white p-6 sm:p-10 select-none transition-opacity duration-1000';
      overlay.style.backgroundColor = '#020617';

      overlay.innerHTML = `
        <!-- Top Bar: Progress & Exit -->
        <div class="w-full flex items-center justify-between pointer-events-auto">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs font-mono text-indigo-300 font-bold tracking-wider">
              <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span id="hud-phase-label">CHẾ ĐỘ NGHE</span>
            </span>
            <span id="hud-progress-label" class="text-xs font-mono text-slate-400">Ngày ${this.script.dayNumber}</span>
          </div>

          <button id="hud-btn-close" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-mono transition cursor-pointer flex items-center gap-1.5" title="Thoát chế độ nghe">
            <span>✕</span>
            <span>Thoát</span>
          </button>
        </div>

        <!-- Center: High-Contrast 32px Typography Visual Secondary Glance HUD -->
        <div class="my-auto w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-4 py-8 pointer-events-none">
          <div id="hud-status-badge" class="mb-4 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 font-semibold tracking-wider">
            🎧 Đang phát âm...
          </div>

          <!-- 32px High-contrast central text -->
          <div id="hud-large-text" class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wide leading-tight min-h-[96px] flex items-center justify-center break-words drop-shadow-md" style="font-size: 32px; line-height: 1.35;">
            Đang tải...
          </div>

          <!-- 20px cyan / high-contrast subtext -->
          <div id="hud-sub-text" class="text-lg sm:text-xl text-cyan-300/90 font-medium tracking-normal mt-4 max-w-xl mx-auto min-h-[32px] break-words">
            Lắng nghe hướng dẫn
          </div>
        </div>

        <!-- Bottom: Physical-Friendly Large Touch Targets (Repeat 60px, Pause 80px, Skip 60px) -->
        <div class="w-full flex flex-col items-center gap-5 pointer-events-auto pb-4">
          <div class="flex items-center justify-center gap-8 sm:gap-12">
            <!-- 60px Repeat Button -->
            <button id="hud-btn-repeat" class="w-[60px] h-[60px] rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-200 border-2 border-slate-700/80 shadow-lg flex items-center justify-center transition cursor-pointer" title="Lặp lại mục này (Double Tap)" aria-label="Lặp lại">
              <span class="text-2xl">🔄</span>
            </button>

            <!-- 80px Center Pause/Resume Button -->
            <button id="hud-btn-pause" class="w-20 h-20 rounded-full bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black shadow-2xl shadow-cyan-500/40 border-4 border-cyan-300 flex items-center justify-center transition cursor-pointer" title="Tạm dừng / Tiếp tục (Tap)" aria-label="Tạm dừng / Tiếp tục" style="width: 80px; height: 80px;">
              <span id="hud-pause-icon" class="text-3xl">⏸</span>
            </button>

            <!-- 60px Skip Button -->
            <button id="hud-btn-skip" class="w-[60px] h-[60px] rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-200 border-2 border-slate-700/80 shadow-lg flex items-center justify-center transition cursor-pointer" title="Bỏ qua sang mục tiếp theo" aria-label="Bỏ qua">
              <span class="text-2xl">⏭</span>
            </button>
          </div>

          <p class="text-[11px] sm:text-xs text-slate-500 font-mono text-center tracking-wide">
            Chạm 1 lần để Tạm dừng/Tiếp tục · Chạm 2 lần để Lặp lại · Tự tối màn sau 30s
          </p>
        </div>
      `;

      document.body.appendChild(overlay);
      this.hudOverlay = overlay;

      // Cache DOM references
      this.elLargeText = overlay.querySelector('#hud-large-text');
      this.elSubText = overlay.querySelector('#hud-sub-text');
      this.elProgress = overlay.querySelector('#hud-progress-label');
      this.elPhase = overlay.querySelector('#hud-phase-label');
      this.elBtnPause = overlay.querySelector('#hud-btn-pause');
      this.elBtnRepeat = overlay.querySelector('#hud-btn-repeat');
      this.elBtnSkip = overlay.querySelector('#hud-btn-skip');
      this.elStatus = overlay.querySelector('#hud-status-badge');
      this.elPauseIcon = overlay.querySelector('#hud-pause-icon');

      // Wire direct button clicks (stopPropagation prevents background tap handling)
      this.elBtnPause.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetDimTimer();
        this.togglePause();
      });

      this.elBtnRepeat.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetDimTimer();
        this.repeatCurrentItem();
      });

      this.elBtnSkip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetDimTimer();
        this.skipNext();
      });

      overlay.querySelector('#hud-btn-close').addEventListener('click', (e) => {
        e.stopPropagation();
        this.stop();
      });

      // Background Tap Gesture Controls:
      // Single tap -> Pause / Resume
      // Double tap -> Repeat current item
      overlay.addEventListener('click', (e) => {
        this.resetDimTimer();
        const now = Date.now();
        const delta = now - this.lastTapTime;
        this.lastTapTime = now;

        if (delta < 280) {
          // Double-tap detected
          if (this.singleTapTimeout) {
            clearTimeout(this.singleTapTimeout);
            this.singleTapTimeout = null;
          }
          this.repeatCurrentItem();
        } else {
          // Wait briefly to distinguish single tap from start of double tap
          this.singleTapTimeout = setTimeout(() => {
            this.togglePause();
            this.singleTapTimeout = null;
          }, 280);
        }
      });

      // Reset OLED dim timer on any interaction
      ['touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach((evt) => {
        overlay.addEventListener(evt, () => this.resetDimTimer(), { passive: true });
      });

      // Keyboard navigation
      this.keydownHandler = (e) => {
        if (e.code === 'Space') {
          e.preventDefault();
          this.togglePause();
        } else if (e.key === 'r' || e.key === 'R') {
          this.repeatCurrentItem();
        } else if (e.key === 'n' || e.key === 'N' || e.code === 'ArrowRight') {
          this.skipNext();
        } else if (e.code === 'Escape') {
          this.stop();
        }
      };
      window.addEventListener('keydown', this.keydownHandler);
    }

    resetDimTimer() {
      if (this.hudOverlay) {
        this.hudOverlay.style.opacity = '1';
        this.hudOverlay.style.backgroundColor = '#020617';
      }
      if (this.dimTimeout) clearTimeout(this.dimTimeout);

      // FR-009 / Acceptance 74: 30-second OLED auto-dim to near-black
      this.dimTimeout = setTimeout(() => {
        if (this.hudOverlay && !this.isStopped) {
          this.hudOverlay.style.backgroundColor = '#000000';
          this.hudOverlay.style.opacity = '0.12'; // Ultra-dim for OLED battery and eyes-free rest
        }
      }, 30000);
    }

    playSegment(index) {
      if (this.isStopped) return;

      if (index >= this.script.length) {
        this.onComplete();
        return;
      }

      this.currentIndex = index;
      const segment = this.script[index];
      this.updateHUDDisplay(segment);

      // Handle Pause Segments (timed practice silence + chime)
      if (segment.type === 'Pause') {
        if (segment.playChime) {
          playPracticeChime();
        }

        const duration = segment.pauseDurationMs || 3000;
        this.pauseRemainingMs = duration;
        this.pauseStartedAt = Date.now();

        this.activeTimeout = setTimeout(() => {
          this.playSegment(this.currentIndex + 1);
        }, duration);
        return;
      }

      // Handle TTS Speech Segments
      if (!('speechSynthesis' in window)) {
        console.warn('[AudioOnly] Web Speech Synthesis not supported in this browser.');
        // Advance after estimated duration
        this.activeTimeout = setTimeout(() => {
          this.playSegment(this.currentIndex + 1);
        }, 2500);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.lang = segment.lang || 'vi-VN';
      utterance.rate = segment.rate || (segment.lang === 'en-US' ? 0.95 : 1.0);

      // Try selecting native voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          if (segment.lang === 'vi-VN') {
            const viVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('vi'));
            if (viVoice) utterance.voice = viVoice;
          } else if (segment.lang === 'en-US') {
            const enVoice = voices.find(v => v.lang && (v.lang === 'en-US' || v.lang.startsWith('en')));
            if (enVoice) utterance.voice = enVoice;
          }
        }
      } catch (err) {
        // Voice lookup error non-blocking
      }

      let advanced = false;
      const advance = () => {
        if (advanced) return;
        advanced = true;
        this.currentUtterance = null;
        if (!this.isPaused && !this.isStopped) {
          this.playSegment(this.currentIndex + 1);
        }
      };

      utterance.onend = advance;
      utterance.onerror = (err) => {
        console.warn('[AudioOnly] Utterance error:', err);
        advance();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }

    updateHUDDisplay(segment) {
      if (!this.hudOverlay) return;

      const d = segment.display || {};
      if (this.elPhase) this.elPhase.textContent = d.phase || 'CHẾ ĐỘ NGHE';
      if (this.elProgress) this.elProgress.textContent = d.progress || `Ngày ${this.script.dayNumber}`;
      if (this.elLargeText) this.elLargeText.textContent = d.largeText || segment.text || '';
      if (this.elSubText) this.elSubText.textContent = d.subText || '';

      if (this.elStatus) {
        if (segment.type === 'Pause') {
          this.elStatus.textContent = '🗣️ Đến lượt bạn luyện nói...';
          this.elStatus.className = 'mb-4 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-xs font-mono text-emerald-300 font-semibold tracking-wider animate-pulse';
        } else if (segment.type === 'Completion') {
          this.elStatus.textContent = '🎉 Hoàn tất buổi học!';
          this.elStatus.className = 'mb-4 px-3 py-1 rounded-full bg-purple-950 border border-purple-700 text-xs font-mono text-purple-300 font-semibold tracking-wider';
        } else {
          this.elStatus.textContent = segment.lang === 'en-US' ? '🔊 Đọc mẫu tiếng Anh' : '🎧 Đang phát hướng dẫn...';
          this.elStatus.className = 'mb-4 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 font-semibold tracking-wider';
        }
      }
    }

    togglePause() {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    }

    pause() {
      if (this.isPaused || this.isStopped) return;
      this.isPaused = true;
      playConfirmationBeep(440, 0.08);

      if (this.elPauseIcon) this.elPauseIcon.textContent = '▶';
      if (this.elStatus) {
        this.elStatus.textContent = '⏸ Đã tạm dừng';
        this.elStatus.className = 'mb-4 px-3 py-1 rounded-full bg-amber-950 border border-amber-700 text-xs font-mono text-amber-300 font-semibold tracking-wider';
      }

      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
      }

      if (this.activeTimeout) {
        clearTimeout(this.activeTimeout);
        this.activeTimeout = null;
        const elapsed = Date.now() - this.pauseStartedAt;
        this.pauseRemainingMs = Math.max(200, this.pauseRemainingMs - elapsed);
      }
    }

    resume() {
      if (!this.isPaused || this.isStopped) return;
      this.isPaused = false;
      playConfirmationBeep(660, 0.08);

      if (this.elPauseIcon) this.elPauseIcon.textContent = '⏸';

      const currentSeg = this.script[this.currentIndex];
      if (currentSeg && currentSeg.type === 'Pause') {
        this.pauseStartedAt = Date.now();
        this.activeTimeout = setTimeout(() => {
          this.playSegment(this.currentIndex + 1);
        }, this.pauseRemainingMs || 1000);
      } else if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        // Fallback re-play if synthesis did not resume cleanly
        this.playSegment(this.currentIndex);
      }
    }

    repeatCurrentItem() {
      playConfirmationBeep(580, 0.09);
      if (this.activeTimeout) {
        clearTimeout(this.activeTimeout);
        this.activeTimeout = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.isPaused = false;
      if (this.elPauseIcon) this.elPauseIcon.textContent = '⏸';

      // Find the start of the current logical item (drill word or sentence frame group)
      const current = this.script[this.currentIndex];
      const targetIndex = current && current.itemIndex !== undefined ? current.itemIndex : this.currentIndex;
      this.playSegment(targetIndex);
    }

    skipNext() {
      playConfirmationBeep(720, 0.07);
      if (this.activeTimeout) {
        clearTimeout(this.activeTimeout);
        this.activeTimeout = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.isPaused = false;
      if (this.elPauseIcon) this.elPauseIcon.textContent = '⏸';

      // Skip forward to the next itemIndex or next block
      const current = this.script[this.currentIndex];
      let nextIdx = this.currentIndex + 1;
      if (current && current.itemIndex !== undefined) {
        while (nextIdx < this.script.length && this.script[nextIdx].itemIndex === current.itemIndex) {
          nextIdx++;
        }
      }
      this.playSegment(nextIdx);
    }

    async onComplete() {
      // Play completion congratulations sequence
      playPracticeChime();

      if (this.elLargeText) this.elLargeText.textContent = `🎉 Hoàn thành Ngày ${this.script.dayNumber}!`;
      if (this.elSubText) this.elSubText.textContent = 'Đã lưu tiến độ với Chế độ Nghe (AudioOnly). Hãy nghỉ ngơi thật tốt!';
      if (this.elStatus) {
        this.elStatus.textContent = '✅ Đã hoàn thành';
        this.elStatus.className = 'mb-4 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-xs font-mono text-emerald-300 font-semibold tracking-wider';
      }

      // Persist completion to backend with SessionMode = "AudioOnly"
      try {
        await fetch('/api/progress/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            DayNumber: this.script.dayNumber,
            ActualMinutes: 30,
            SelfRating: 5,
            LearnerNotes: 'Hoàn thành phiên Chế độ Nghe nhắm mắt (Audio-Only Eyes-Free Mode)',
            AiFeedbackSnippet: 'Đã hoàn thành toàn bộ bài luyện nghe nhắm mắt.',
            SessionMode: 'AudioOnly'
          })
        });

        // Trigger dashboard stats refresh if available
        if (typeof window.fetchProgressSummary === 'function') {
          window.fetchProgressSummary();
        }
      } catch (err) {
        console.warn('[AudioOnly] Error auto-completing session:', err);
      }

      // Automatically close after 8 seconds or allow user tap to exit
      this.activeTimeout = setTimeout(() => {
        this.stop();
      }, 8000);
    }

    stop() {
      this.isStopped = true;
      if (this.activeTimeout) clearTimeout(this.activeTimeout);
      if (this.dimTimeout) clearTimeout(this.dimTimeout);
      if (this.singleTapTimeout) clearTimeout(this.singleTapTimeout);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      if (this.keydownHandler) {
        window.removeEventListener('keydown', this.keydownHandler);
      }

      if (this.hudOverlay) {
        this.hudOverlay.remove();
        this.hudOverlay = null;
      }
    }
  }

  // --- GLOBAL SINGLETON STATE & PUBLIC API ---
  let activeAudioSession = null;

  function startAudioOnlyMode(lesson) {
    if (activeAudioSession) {
      activeAudioSession.stop();
      activeAudioSession = null;
    }

    if (!lesson) {
      console.error('[AudioOnly] Cannot start audio-only mode without a valid lesson object.');
      return null;
    }

    activeAudioSession = new AudioOnlySession(lesson);
    activeAudioSession.start();
    return activeAudioSession;
  }

  function stopAudioOnlyMode() {
    if (activeAudioSession) {
      activeAudioSession.stop();
      activeAudioSession = null;
    }
  }

  // Export to window
  window.compileLessonToAudioScript = compileLessonToAudioScript;
  window.startAudioOnlyMode = startAudioOnlyMode;
  window.stopAudioOnlyMode = stopAudioOnlyMode;
  window.DevEngAudioOnly = {
    compileLessonToAudioScript,
    startAudioOnlyMode,
    stopAudioOnlyMode,
    playPracticeChime,
    playConfirmationBeep
  };

})(typeof window !== 'undefined' ? window : globalThis);
