/**
 * DevEng Coach - Kinematic Vocal Tract Native Web Component
 * Component: <deveng-kinematic-tract>
 * 
 * Provides an interactive, animated 2D sagittal vocal tract diagram with:
 * - 8 anatomical articulators (#articulator-lips, #articulator-teeth, #articulator-alveolar,
 *   #articulator-tongue-tip, #articulator-tongue-blade, #articulator-velum, #articulator-vocal-cords,
 *   #articulator-pharynx, #articulator-airflow)
 * - highlight(organName) method with pulsing glow & floating badge
 * - animatePhoneme(phoneme) method with multi-phase kinematic transitions for /t/, /d/, /s/, /z/, /θ/, /ð/, /ʃ/, /dʒ/
 * - 0.5x / 1x speed toggle, visual 4-phase indicator HUD, and Web Audio API acoustic synthesis
 * - window.highlightArticulator(organ) and window.animateTractPhoneme(phoneme) global API
 */

(function () {
  'use strict';

  // =============================================================================
  // WEB AUDIO ACOUSTIC SYNTHESIS ENGINE (Zero external dependencies)
  // =============================================================================
  class TractAcousticSynth {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.noiseBuffer = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.generateNoiseBuffer();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    generateNoiseBuffer() {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }

    play(soundType, speedMultiplier = 1.0) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const durFactor = 1 / speedMultiplier;

      switch (soundType) {
        case 't-burst': {
          // Sharp plosive release burst: highpass filtered noise
          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 4200;
          filter.Q.value = 2.5;

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05 * durFactor);

          src.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(now);
          src.stop(now + 0.06 * durFactor);
          break;
        }

        case 'd-voice-burst': {
          // Voiced stop: low vocal cord murmur during hold + softer release
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(125, now);

          const oscGain = this.ctx.createGain();
          oscGain.gain.setValueAtTime(0.2, now);
          oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22 * durFactor);

          osc.connect(oscGain);
          oscGain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.23 * durFactor);

          // Transient burst at release
          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 3200;
          filter.Q.value = 2.0;

          const burstGain = this.ctx.createGain();
          burstGain.gain.setValueAtTime(0, now);
          burstGain.gain.setValueAtTime(0.25, now + 0.18 * durFactor);
          burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24 * durFactor);

          src.connect(filter);
          filter.connect(burstGain);
          burstGain.connect(this.ctx.destination);
          src.start(now + 0.18 * durFactor);
          src.stop(now + 0.25 * durFactor);
          break;
        }

        case 's-friction': {
          // High-frequency fricative hiss (narrow groove)
          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 5200;

          const gain = this.ctx.createGain();
          const dur = 0.45 * durFactor;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.25, now + 0.08 * durFactor);
          gain.gain.setValueAtTime(0.25, now + dur - 0.08 * durFactor);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

          src.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(now);
          src.stop(now + dur + 0.02);
          break;
        }

        case 'z-friction': {
          // Voiced fricative: highpass hiss + 130Hz vocal cords drone
          const dur = 0.45 * durFactor;

          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(130, now);
          const oscGain = this.ctx.createGain();
          oscGain.gain.setValueAtTime(0.001, now);
          oscGain.gain.linearRampToValueAtTime(0.18, now + 0.06 * durFactor);
          oscGain.gain.setValueAtTime(0.18, now + dur - 0.06 * durFactor);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
          osc.connect(oscGain);
          oscGain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + dur + 0.02);

          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 4800;
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.16, now + 0.08 * durFactor);
          gain.gain.setValueAtTime(0.16, now + dur - 0.08 * durFactor);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
          src.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(now);
          src.stop(now + dur + 0.02);
          break;
        }

        case 'theta-friction': {
          // Soft dental fricative: diffused mid-high noise
          const dur = 0.4 * durFactor;
          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 3500;
          filter.Q.value = 1.2;

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.08 * durFactor);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

          src.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(now);
          src.stop(now + dur + 0.02);
          break;
        }

        case 'eth-friction': {
          // Voiced dental fricative
          const dur = 0.4 * durFactor;
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120, now);
          const oscGain = this.ctx.createGain();
          oscGain.gain.setValueAtTime(0.001, now);
          oscGain.gain.linearRampToValueAtTime(0.16, now + 0.06 * durFactor);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
          osc.connect(oscGain);
          oscGain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + dur + 0.02);

          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 3200;
          filter.Q.value = 1.0;
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.08 * durFactor);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
          src.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(now);
          src.stop(now + dur + 0.02);
          break;
        }

        case 'esh-friction': {
          // Postalveolar voiceless fricative /ʃ/: lower resonance with lip cavity
          const dur = 0.5 * durFactor;
          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2700;
          filter.Q.value = 1.8;

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.24, now + 0.08 * durFactor);
          gain.gain.setValueAtTime(0.24, now + dur - 0.08 * durFactor);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

          src.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(now);
          src.stop(now + dur + 0.02);
          break;
        }

        case 'dzh-affricate': {
          // Voiced affricate /dʒ/: stop closure + voiced friction release
          const dur = 0.45 * durFactor;
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(125, now);
          const oscGain = this.ctx.createGain();
          oscGain.gain.setValueAtTime(0.15, now);
          oscGain.gain.setValueAtTime(0.15, now + 0.15 * durFactor);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
          osc.connect(oscGain);
          oscGain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + dur + 0.02);

          const src = this.ctx.createBufferSource();
          src.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2800;
          filter.Q.value = 1.6;
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.22, now + 0.12 * durFactor);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
          src.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          src.start(now + 0.12 * durFactor);
          src.stop(now + dur + 0.02);
          break;
        }
      }
    }
  }

  // =============================================================================
  // ARTICULATOR METADATA & REPERTOIRE
  // =============================================================================
  const ARTICULATORS_DATA = {
    'lips': {
      id: 'articulator-lips',
      nameEn: 'Upper & Lower Lips',
      nameVi: 'Môi trên & Môi dưới (Labial)',
      coords: { x: 135, y: 215 },
      desc: 'Điểm khép kín hoàn toàn cho các âm bật hai môi /p/, /b/, mím lại cho /m/, hoặc chu tròn nhô ra phía trước cho /ʃ/, /tʃ/, /dʒ/, /w/.',
      targets: '/p/, /b/, /m/, /w/, /ʃ/, /dʒ/'
    },
    'teeth': {
      id: 'articulator-teeth',
      nameEn: 'Upper & Lower Incisors',
      nameVi: 'Răng cửa (Dental)',
      coords: { x: 152, y: 215 },
      desc: 'Răng cửa trên và dưới. Đầu lưỡi thò nhẹ qua kẽ răng tạo khe hẹp thoát khí êm dịu cho phụ âm răng /θ/ (think) và /ð/ (this).',
      targets: '/θ/, /ð/, /f/, /v/'
    },
    'alveolar': {
      id: 'articulator-alveolar',
      nameEn: 'Alveolar Ridge',
      nameVi: 'Gờ Lợi Sau Chân Răng (Alveolar)',
      coords: { x: 185, y: 190 },
      desc: 'Vùng gồ ghề cứng ngay sau răng cửa trên. Điểm tựa quan trọng nhất của tiếng Anh: chặn hoàn toàn tạo /t/, /d/, rãnh hẹp 1mm tạo /s/, /z/, hoặc dẫn khí hai bên tạo /l/.',
      targets: '/t/, /d/, /s/, /z/, /n/, /l/'
    },
    'tongue-tip': {
      id: 'articulator-tongue-tip',
      nameEn: 'Tongue Tip (Apex)',
      nameVi: 'Đầu Lưỡi (Tongue Tip)',
      coords: { x: 185, y: 245 },
      desc: 'Bộ phận chuyển động linh hoạt nhất. Bật nổ dứt khoát tại gờ lợi cho /t/, /d/, xì rãnh cho /s/, hoặc kẹp giữa hai răng cho /θ/, /ð/.',
      targets: '/t/, /d/, /θ/, /ð/, /n/, /l/'
    },
    'tongue-blade': {
      id: 'articulator-tongue-blade',
      nameEn: 'Tongue Blade & Body',
      nameVi: 'Thân & Lưng Lưỡi (Blade & Body)',
      coords: { x: 235, y: 235 },
      desc: 'Vùng thân lưỡi sau đầu lưỡi. Nâng sát gờ lợi tạo rãnh thoát khí hẹp cho /s/, /z/. Nâng cong về phía sau tạo âm sau gờ lợi /ʃ/, /ʒ/, /dʒ/.',
      targets: '/s/, /z/, /ʃ/, /ʒ/, /tʃ/, /dʒ/'
    },
    'velum': {
      id: 'articulator-velum',
      nameEn: 'Velum / Soft Palate & Uvula',
      nameVi: 'Ngạc Mềm & Lưỡi Gà (Velum)',
      coords: { x: 325, y: 215 },
      desc: 'Van cơ đóng mở đường thông lên mũi. Nâng lên ép sát vách họng để chặn khí lên mũi cho toàn bộ âm miệng (/t/, /s/, /d/...). Hạ xuống cho khí thoát lên mũi ở âm /m/, /n/, /ŋ/.',
      targets: '/k/, /g/, /ŋ/, Phụ âm miệng'
    },
    'vocal-cords': {
      id: 'articulator-vocal-cords',
      nameEn: 'Vocal Cords / Folds (Glottis)',
      nameVi: 'Dây Thanh Âm (Vocal Folds)',
      coords: { x: 295, y: 405 },
      desc: 'Nằm trong thanh quản. Khép hờ và rung động tần số cao tạo âm HỮU THANH (Voiced: /d/, /z/, /ð/, /dʒ/, nguyên âm). Mở rộng cho khí đi qua tự do không rung tạo âm VÔ THANH (Voiceless: /t/, /s/, /θ/, /ʃ/).',
      targets: 'Voiced vs Voiceless distinction'
    },
    'pharynx': {
      id: 'articulator-pharynx',
      nameEn: 'Pharyngeal Wall',
      nameVi: 'Vách Họng Sau (Pharynx Wall)',
      coords: { x: 345, y: 290 },
      desc: 'Vách cơ phía sau khoang miệng và họng. Cùng với ngạc mềm tạo van đóng mở khẩu hầu, định hướng luồng áp suất khí từ phổi đi lên.',
      targets: 'Cột cộng hưởng họng'
    },
    'airflow': {
      id: 'articulator-airflow',
      nameEn: 'Airflow Vector & Pressure Wave',
      nameVi: 'Vectơ Luồng Khí & Sóng Áp Suất',
      coords: { x: 210, y: 215 },
      desc: 'Thể hiện động học luồng khí thở: tích tụ nén khí khi gặp điểm tắc (Stop/Plosive closure) và giải phóng nổ mạnh mẽ (Burst), hoặc thoát liên tục qua khe hẹp tạo ma sát (Fricative).',
      targets: 'Plosive Burst / Fricative Turbulence'
    }
  };

  // Canonical Bezier tongue paths for 2D sagittal kinematics
  const TONGUE_PATHS = {
    // 1. Natural Resting baseline
    rest: 'M 165 270 C 172 255, 178 248, 185 248 C 210 248, 240 240, 270 255 C 295 275, 300 315, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 270 Z',
    // 2. Alveolar Contact (/t/, /d/ closure)
    alveolarContact: 'M 165 265 C 170 230, 175 205, 185 192 C 205 194, 235 220, 265 240 C 290 260, 300 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z',
    // 3. Alveolar Release snap down (/t/, /d/ release)
    alveolarRelease: 'M 165 268 C 172 245, 178 232, 185 230 C 208 232, 238 232, 268 248 C 292 268, 298 305, 290 358 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 268 Z',
    // 4. Narrow Alveolar Groove (/s/, /z/ 1mm constriction)
    alveolarFricative: 'M 165 265 C 170 235, 176 210, 185 200 C 208 200, 230 205, 265 235 C 290 258, 300 298, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z',
    // 5. Interdental protrusion (/θ/, /ð/)
    interdental: 'M 155 265 C 145 245, 135 225, 140 216 C 158 214, 205 225, 255 242 C 285 262, 300 300, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 155 265 Z',
    // 6. Postalveolar dome (/ʃ/, /dʒ/)
    postalveolar: 'M 165 265 C 170 240, 175 225, 185 215 C 205 200, 220 188, 260 215 C 285 245, 300 295, 290 355 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 265 Z'
  };

  // Landmark point positions for Tip and Blade across states
  const LANDMARKS = {
    rest: { tip: { x: 185, y: 248 }, blade: { x: 235, y: 240 } },
    alveolarContact: { tip: { x: 185, y: 192 }, blade: { x: 235, y: 215 } },
    alveolarRelease: { tip: { x: 185, y: 230 }, blade: { x: 235, y: 230 } },
    alveolarFricative: { tip: { x: 185, y: 200 }, blade: { x: 230, y: 204 } },
    interdental: { tip: { x: 140, y: 216 }, blade: { x: 220, y: 230 } },
    postalveolar: { tip: { x: 185, y: 215 }, blade: { x: 220, y: 188 } }
  };

  // Phoneme configuration table
  const PHONEME_DATA = {
    '/t/': {
      symbol: '/t/',
      name: 'Voiceless Alveolar Plosive (Stop)',
      voicing: false,
      place: 'Alveolar Ridge (Gờ lợi trên)',
      manner: 'Plosive / Stop (Tắc nổ)',
      steps: [
        '1. Tiếp cận: Đầu lưỡi nâng lên ép kín gờ lợi trên',
        '2. Nén khí: Giữ 200ms đóng kín, tích tụ áp suất khí sau lưỡi',
        '3. Giật nổ: Đầu lưỡi giật nhanh xuống giải phóng luồng nổ (Pop burst)',
        '4. Dây thanh: Hoàn toàn đứng yên (Không rung)'
      ],
      soundType: 't-burst'
    },
    '/d/': {
      symbol: '/d/',
      name: 'Voiced Alveolar Plosive (Stop)',
      voicing: true,
      place: 'Alveolar Ridge (Gờ lợi trên)',
      manner: 'Voiced Plosive / Stop (Tắc nổ hữu thanh)',
      steps: [
        '1. Tiếp cận: Đầu lưỡi nâng lên ép kín gờ lợi trên',
        '2. Nén khí: Giữ 200ms đóng kín, áp suất tích tụ',
        '3. Giật nổ: Đầu lưỡi hạ xuống giải phóng âm nổ',
        '4. Dây thanh: RUNG MẠNH (Voiced) xuyên suốt pha nén & nổ'
      ],
      soundType: 'd-voice-burst'
    },
    '/s/': {
      symbol: '/s/',
      name: 'Voiceless Alveolar Fricative',
      voicing: false,
      place: 'Alveolar Ridge (Gờ lợi trên)',
      manner: 'Fricative (Xát vô thanh)',
      steps: [
        '1. Định vị: Thân lưỡi nâng sát gờ lợi tạo rãnh hẹp ~1mm',
        '2. Luồng khí: Khí thổi liên tục với tốc độ cao qua rãnh hẹp',
        '3. Ma sát: Luồng khí va đập vào mép răng cửa tạo tiếng xì sắc nét',
        '4. Dây thanh: Mở tự do, không rung'
      ],
      soundType: 's-friction'
    },
    '/z/': {
      symbol: '/z/',
      name: 'Voiced Alveolar Fricative',
      voicing: true,
      place: 'Alveolar Ridge (Gờ lợi trên)',
      manner: 'Voiced Fricative (Xát hữu thanh)',
      steps: [
        '1. Định vị: Thân lưỡi tạo rãnh hẹp 1mm như âm /s/',
        '2. Luồng khí: Khí thổi liên tục qua khe hẹp tạo ma sát',
        '3. Dây thanh: RUNG MẠNH liên tục, hòa trộn tiếng vo ve cùng tiếng xì',
        '4. Cảm nhận: Rung mạnh khi đặt ngón tay lên hõm cổ họng'
      ],
      soundType: 'z-friction'
    },
    '/θ/': {
      symbol: '/θ/',
      name: 'Voiceless Dental Fricative ("th" in think)',
      voicing: false,
      place: 'Interdental (Răng cửa trên & dưới)',
      manner: 'Fricative (Xát răng vô thanh)',
      steps: [
        '1. Định vị: Đầu lưỡi thò nhẹ 2-3mm ra giữa 2 hàng răng cửa',
        '2. Tiếp xúc: Răng trên chạm nhẹ mặt trên đầu lưỡi, không cắn chặt',
        '3. Luồng khí: Thổi nhẹ nhàng qua khe hở giữa răng và lưỡi',
        '4. Dây thanh: Không rung (Voiceless)'
      ],
      soundType: 'theta-friction'
    },
    '/ð/': {
      symbol: '/ð/',
      name: 'Voiced Dental Fricative ("th" in this)',
      voicing: true,
      place: 'Interdental (Răng cửa trên & dưới)',
      manner: 'Voiced Fricative (Xát răng hữu thanh)',
      steps: [
        '1. Định vị: Đầu lưỡi thò nhẹ ra giữa hai hàng răng cửa như /θ/',
        '2. Tiếp xúc: Không cắn chặt, để hở khe nhỏ thoát khí',
        '3. Dây thanh: RUNG MẠNH tạo âm rung dừ dừ đặc trưng',
        '4. Thoát âm: Luồng khí hữu thanh thoát êm dịu qua kẽ răng'
      ],
      soundType: 'eth-friction'
    },
    '/ʃ/': {
      symbol: '/ʃ/',
      name: 'Voiceless Postalveolar Fricative ("sh")',
      voicing: false,
      place: 'Postalveolar & Rounded Lips (Sau gờ lợi & Môi chu)',
      manner: 'Fricative (Xát sau gờ lợi)',
      steps: [
        '1. Môi: Nhô tròn rõ rệt về phía trước (Lip rounding)',
        '2. Thân lưỡi: Nâng vồng lên vùng sau gờ lợi (Postalveolar)',
        '3. Luồng khí: Thổi qua kênh rộng hơn /s/, tạo tiếng xì dày và trầm hơn',
        '4. Dây thanh: Không rung'
      ],
      soundType: 'esh-friction'
    },
    '/dʒ/': {
      symbol: '/dʒ/',
      name: 'Voiced Postalveolar Affricate ("j" in job)',
      voicing: true,
      place: 'Postalveolar (Sau gờ lợi & Môi hơi chu)',
      manner: 'Affricate (Tắc xát hữu thanh)',
      steps: [
        '1. Pha tắc: Thân lưỡi đóng kín vùng sau gờ lợi, môi hơi nhô tròn',
        '2. Dây thanh: Rung ngay trong lúc nén khí',
        '3. Pha xát: Đầu lưỡi từ từ hạ nhẹ tạo khe hở hẹp giải phóng âm xát',
        '4. Tổng hợp: Tắc nổ nhanh chuyển mượt sang xát hữu thanh'
      ],
      soundType: 'dzh-affricate'
    }
  };

  // =============================================================================
  // WEB COMPONENT DEFINITION: <deveng-kinematic-tract>
  // =============================================================================
  class DevEngKinematicTract extends HTMLElement {
    constructor() {
      super();
      this.speed = 1.0; // 1.0 or 0.5
      this.currentPhoneme = null;
      this.activeOrgan = null;
      this.animTimeoutIds = [];
      this.audio = new TractAcousticSynth();
    }

    connectedCallback() {
      this.render();
      this.cacheElements();
      this.bindEvents();
      this.resetToRest();
    }

    disconnectedCallback() {
      this.clearAllTimers();
    }

    clearAllTimers() {
      this.animTimeoutIds.forEach(id => clearTimeout(id));
      this.animTimeoutIds = [];
    }

    render() {
      this.innerHTML = `
        <style>
          deveng-kinematic-tract {
            display: block;
            width: 100%;
            background-color: #0b1120;
            border: 1px solid #1e293b;
            border-radius: 1rem;
            color: #f8fafc;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
          }

          .tract-container {
            display: flex;
            flex-direction: column;
            width: 100%;
          }

          /* Header / Toolbar */
          .tract-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.85rem 1.25rem;
            background: #0f172a;
            border-bottom: 1px solid #1e293b;
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .tract-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.1rem;
            font-weight: 700;
            color: #38bdf8;
            font-family: 'Fira Code', monospace;
          }

          .tract-badge-tech {
            font-size: 0.75rem;
            padding: 0.15rem 0.5rem;
            border-radius: 0.25rem;
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.3);
          }

          .tract-controls-top {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .tract-btn {
            padding: 0.4rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 0.8rem;
            font-family: 'Fira Code', monospace;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
            background: #1e293b;
            color: #94a3b8;
            border: 1px solid #334155;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
          }

          .tract-btn:hover {
            color: #f8fafc;
            border-color: #38bdf8;
            background: #243247;
          }

          .tract-btn.active {
            background: rgba(56, 189, 248, 0.2);
            color: #38bdf8;
            border-color: #38bdf8;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
          }

          /* Phoneme Selector Row */
          .phoneme-selector-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.65rem 1.25rem;
            background: #090d16;
            border-bottom: 1px solid #1e293b;
            overflow-x: auto;
            scrollbar-width: thin;
          }

          .phoneme-label-tag {
            font-size: 0.75rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
          }

          .phoneme-pill {
            padding: 0.35rem 0.75rem;
            border-radius: 0.375rem;
            background: #131c31;
            border: 1px solid #23334e;
            color: #e2e8f0;
            font-family: 'Fira Code', monospace;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
            white-space: nowrap;
          }

          .phoneme-pill:hover {
            border-color: #38bdf8;
            color: #38bdf8;
            transform: translateY(-1px);
          }

          .phoneme-pill.active {
            background: #0284c7;
            color: #ffffff;
            border-color: #38bdf8;
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
          }

          /* Main Body Grid */
          .tract-main-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }

          @media (min-width: 960px) {
            .tract-main-grid {
              grid-template-columns: 7fr 5fr;
            }
          }

          /* SVG Viewport Container */
          .tract-canvas-wrapper {
            position: relative;
            background: radial-gradient(circle at 40% 40%, #131c31 0%, #080d1a 100%);
            border: 1px solid #1e293b;
            border-radius: 0.75rem;
            padding: 0.75rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .tract-svg {
            width: 100%;
            height: auto;
            max-height: 480px;
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
          }

          /* Interactive Articulator Element Styles */
          .articulator-part {
            cursor: pointer;
            transition: all 0.25s ease;
          }

          .articulator-part:hover {
            filter: drop-shadow(0 0 8px #38bdf8);
          }

          /* Pulsing Glow Animation */
          @keyframes articulator-pulse-glow {
            0% {
              filter: drop-shadow(0 0 4px #38bdf8) drop-shadow(0 0 10px #38bdf8);
              stroke-width: 4px;
            }
            50% {
              filter: drop-shadow(0 0 12px #38bdf8) drop-shadow(0 0 20px #0284c7);
              stroke-width: 6px;
            }
            100% {
              filter: drop-shadow(0 0 4px #38bdf8) drop-shadow(0 0 10px #38bdf8);
              stroke-width: 4px;
            }
          }

          .is-highlighted {
            animation: articulator-pulse-glow 1.4s infinite ease-in-out !important;
          }

          /* Tongue Path Animation */
          #svg-tongue-shape {
            transition: d 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Vocal Cords Vibration Keyframes */
          @keyframes cords-vibrate {
            0% { transform: scale(1, 1); opacity: 0.7; }
            50% { transform: scale(1.15, 1.25); opacity: 1.0; filter: drop-shadow(0 0 12px #ef4444); }
            100% { transform: scale(1, 1); opacity: 0.7; }
          }

          .vocal-vibrating {
            animation: cords-vibrate 0.12s infinite ease-in-out !important;
            transform-origin: 295px 405px;
          }

          /* Airflow stream dash animation */
          @keyframes airflow-dash {
            to { stroke-dashoffset: -40; }
          }

          .airflow-active-stream {
            animation: airflow-dash 0.8s linear infinite;
          }

          /* Airflow burst pop ripple */
          @keyframes burst-ripple-anim {
            0% { r: 6px; opacity: 1; stroke-width: 3px; }
            100% { r: 35px; opacity: 0; stroke-width: 0.5px; }
          }

          .burst-popping {
            animation: burst-ripple-anim 0.35s ease-out forwards;
          }

          /* Right Panel - Information & Kinematic HUD */
          .tract-info-panel {
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
          }

          /* Active Phoneme Card */
          .phoneme-status-card {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 0.75rem;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
          }

          .phoneme-status-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .phoneme-main-badge {
            display: flex;
            align-items: baseline;
            gap: 0.6rem;
          }

          .phoneme-symbol-text {
            font-size: 1.65rem;
            font-weight: 800;
            color: #38bdf8;
            font-family: 'Fira Code', monospace;
          }

          .phoneme-classification {
            font-size: 0.85rem;
            color: #94a3b8;
            font-weight: 600;
          }

          .voicing-indicator {
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-family: 'Fira Code', monospace;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
          }

          .voicing-voiced {
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border: 1px solid rgba(34, 197, 94, 0.4);
            box-shadow: 0 0 8px rgba(34, 197, 94, 0.25);
          }

          .voicing-voiceless {
            background: rgba(148, 163, 184, 0.12);
            color: #cbd5e1;
            border: 1px solid rgba(148, 163, 184, 0.3);
          }

          /* 4-Phase Kinematic Progression Bar */
          .kinematic-phases-box {
            background: #090d16;
            border: 1px solid #1e293b;
            border-radius: 0.5rem;
            padding: 0.75rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .phases-title {
            font-size: 0.75rem;
            font-weight: 700;
            color: #38bdf8;
            text-transform: uppercase;
            font-family: 'Fira Code', monospace;
            display: flex;
            justify-content: space-between;
          }

          .phase-step-item {
            font-size: 0.8rem;
            padding: 0.4rem 0.6rem;
            border-radius: 0.375rem;
            background: #131c31;
            border: 1px solid #1e293b;
            color: #94a3b8;
            transition: all 0.2s ease;
          }

          .phase-step-item.active-step {
            background: rgba(56, 189, 248, 0.15);
            border-color: #38bdf8;
            color: #ffffff;
            font-weight: 600;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
            transform: translateX(4px);
          }

          /* Highlighted Organ Callout Card */
          .organ-callout-card {
            background: #0f172a;
            border: 1px solid #0284c7;
            border-radius: 0.75rem;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            position: relative;
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
          }

          .organ-callout-badge {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .organ-badge-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #38bdf8;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }

          .organ-badge-desc {
            font-size: 0.82rem;
            line-height: 1.45;
            color: #cbd5e1;
          }

          .organ-badge-targets {
            font-size: 0.75rem;
            font-family: 'Fira Code', monospace;
            color: #a855f7;
            background: rgba(168, 85, 247, 0.1);
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            border: 1px solid rgba(168, 85, 247, 0.25);
          }

          /* 8 Articulator Chips Bar */
          .organ-chips-section {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
          }

          .organ-chips-title {
            font-size: 0.75rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .organ-chips-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.4rem;
          }

          @media (min-width: 640px) {
            .organ-chips-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }

          .organ-chip-btn {
            padding: 0.45rem 0.5rem;
            border-radius: 0.375rem;
            background: #0f172a;
            border: 1px solid #1e293b;
            color: #94a3b8;
            font-size: 0.75rem;
            font-family: 'Fira Code', monospace;
            font-weight: 600;
            text-align: center;
            cursor: pointer;
            transition: all 0.15s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .organ-chip-btn:hover {
            color: #38bdf8;
            border-color: #38bdf8;
            background: #172554;
          }

          .organ-chip-btn.active {
            background: #0369a1;
            color: #ffffff;
            border-color: #38bdf8;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
          }
        </style>

        <div class="tract-container">
          <!-- Top Header Toolbar -->
          <div class="tract-header">
            <div class="tract-title">
              <span>🗣️ Sagittal Vocal Tract</span>
              <span class="tract-badge-tech">Kinematic 2D</span>
            </div>

            <div class="tract-controls-top">
              <!-- Speed Toggle -->
              <button class="tract-btn speed-btn" data-speed="0.5" id="speed-btn-half" title="Tua chậm 0.5x để quan sát chuyển động">0.5x Slow</button>
              <button class="tract-btn speed-btn active" data-speed="1.0" id="speed-btn-normal" title="Tốc độ nói tự nhiên 1x">1.0x</button>
              
              <!-- Sound Toggle -->
              <button class="tract-btn" id="sound-toggle-btn" title="Bật/Tắt âm thanh tổng hợp">🔊 Audio: ON</button>

              <!-- Reset to Rest Position -->
              <button class="tract-btn" id="btn-tract-rest" title="Trở về vị trí nghỉ tự nhiên">⟲ Rest</button>
            </div>
          </div>

          <!-- Phoneme Quick Selector Bar -->
          <div class="phoneme-selector-bar">
            <span class="phoneme-label-tag">Phonemes:</span>
            <button class="phoneme-pill" data-phoneme="/t/">/t/</button>
            <button class="phoneme-pill" data-phoneme="/d/">/d/</button>
            <button class="phoneme-pill" data-phoneme="/s/">/s/</button>
            <button class="phoneme-pill" data-phoneme="/z/">/z/</button>
            <button class="phoneme-pill" data-phoneme="/θ/">/θ/</button>
            <button class="phoneme-pill" data-phoneme="/ð/">/ð/</button>
            <button class="phoneme-pill" data-phoneme="/ʃ/">/ʃ/</button>
            <button class="phoneme-pill" data-phoneme="/dʒ/">/dʒ/</button>
          </div>

          <!-- Main Grid (SVG Left, HUD Right) -->
          <div class="tract-main-grid">
            <!-- Left Canvas: Vector Sagittal Anatomy Diagram -->
            <div class="tract-canvas-wrapper">
              <svg viewBox="0 0 640 480" class="tract-svg" id="kinematic-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <!-- Head Profile Gradient -->
                  <linearGradient id="headSkinGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#0f172a" />
                    <stop offset="100%" stop-color="#020617" />
                  </linearGradient>

                  <!-- Cavity gradient -->
                  <linearGradient id="cavityDarkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1e293b" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
                  </linearGradient>

                  <!-- Tongue Gradient -->
                  <linearGradient id="tongueBodyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f43f5e" />
                    <stop offset="100%" stop-color="#be123c" />
                  </linearGradient>

                  <!-- Glow Filter for highlighting & burst -->
                  <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <!-- Arrowhead Markers -->
                  <marker id="arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                  <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                </defs>

                <!-- 1. Anatomical Head & Skull Silhouette -->
                <path id="svg-head-contour" d="M 200 45 C 160 70, 140 100, 135 115 L 85 155 L 122 168 C 130 174, 132 180, 124 188 C 122 194, 130 200, 145 200 M 145 235 C 130 235, 120 244, 126 254 C 130 262, 124 272, 120 285 C 116 305, 135 328, 170 340 C 200 350, 215 380, 215 470 L 480 470 C 480 410, 470 330, 485 270 C 515 200, 520 120, 475 65 C 410 20, 280 15, 200 45 Z" fill="url(#headSkinGrad)" stroke="#334155" stroke-width="2.5" />

                <!-- 2. Nasal Cavity -->
                <path id="svg-nasal-cavity" d="M 130 135 C 180 105, 260 105, 330 135 C 350 155, 360 180, 360 215 L 315 215 C 315 180, 260 165, 150 165 Z" fill="url(#cavityDarkGrad)" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3" />

                <!-- 3. Pharyngeal Wall Articulator (#articulator-pharynx) -->
                <g id="articulator-pharynx" class="articulator-part" data-organ="pharynx">
                  <path id="svg-pharynx-wall" d="M 360 215 C 362 260, 362 330, 345 425 L 315 425 C 330 340, 330 260, 315 215 Z" fill="#1e293b" stroke="#475569" stroke-width="2" />
                  <text x="375" y="290" fill="#94a3b8" font-size="10" font-family="monospace">Vách họng</text>
                </g>

                <!-- 4. Hard Palate & Alveolar Ridge Articulator (#articulator-alveolar) -->
                <path id="svg-hard-palate" d="M 200 190 C 235 180, 275 185, 305 202" fill="none" stroke="#a855f7" stroke-width="4.5" stroke-linecap="round" />
                <g id="articulator-alveolar" class="articulator-part" data-organ="alveolar">
                  <path id="svg-alveolar-curve" d="M 160 202 C 170 202, 185 196, 200 190" fill="none" stroke="#38bdf8" stroke-width="5.5" stroke-linecap="round" />
                  <circle cx="185" cy="190" r="4" fill="#38bdf8" />
                  <text x="175" y="165" fill="#38bdf8" font-size="11" font-weight="bold" font-family="monospace">Gờ Lợi (Alveolar)</text>
                  <line x1="185" y1="170" x2="185" y2="185" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 2" />
                </g>

                <!-- 5. Velum / Soft Palate Articulator (#articulator-velum) -->
                <g id="articulator-velum" class="articulator-part" data-organ="velum">
                  <path id="svg-velum-body" d="M 305 202 C 322 205, 340 212, 348 215 C 344 225, 330 220, 305 212 Z" fill="#eab308" stroke="#ca8a04" stroke-width="2" />
                  <text x="355" y="210" fill="#eab308" font-size="10" font-weight="bold" font-family="monospace">Ngạc mềm (Velum)</text>
                </g>

                <!-- 6. Teeth Articulator (#articulator-teeth) -->
                <g id="articulator-teeth" class="articulator-part" data-organ="teeth">
                  <!-- Upper Incisor -->
                  <rect id="svg-teeth-upper" x="146" y="196" width="12" height="18" rx="2" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" />
                  <!-- Lower Incisor -->
                  <rect id="svg-teeth-lower" x="146" y="234" width="12" height="18" rx="2" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" />
                  <text x="95" y="195" fill="#f8fafc" font-size="10" font-family="monospace">Răng (Teeth)</text>
                  <line x1="140" y1="195" x2="146" y2="202" stroke="#94a3b8" stroke-width="1.5" />
                </g>

                <!-- 7. Lips Articulator (#articulator-lips) -->
                <g id="articulator-lips" class="articulator-part" data-organ="lips">
                  <path id="svg-lip-upper" d="M 124 188 C 122 194, 130 200, 146 200" fill="none" stroke="#fb7185" stroke-width="4.5" stroke-linecap="round" />
                  <path id="svg-lip-lower" d="M 146 235 C 130 235, 120 244, 126 254" fill="none" stroke="#fb7185" stroke-width="4.5" stroke-linecap="round" />
                  <text x="75" y="230" fill="#fb7185" font-size="10" font-family="monospace">Môi (Lips)</text>
                </g>

                <!-- 8. Complete Dynamic Tongue Muscular Body -->
                <path id="svg-tongue-shape" d="M 165 270 C 172 255, 178 248, 185 248 C 210 248, 240 240, 270 255 C 295 275, 300 315, 290 360 C 275 385, 245 390, 230 380 C 215 350, 190 310, 165 270 Z" fill="url(#tongueBodyGrad)" stroke="#e11d48" stroke-width="2.5" />

                <!-- Tongue Blade Articulator (#articulator-tongue-blade) -->
                <g id="articulator-tongue-blade" class="articulator-part" data-organ="tongue-blade">
                  <circle id="marker-tongue-blade" cx="235" cy="240" r="5" fill="#a855f7" stroke="#ffffff" stroke-width="1.5" />
                  <text id="label-tongue-blade" x="245" y="230" fill="#a855f7" font-size="10" font-weight="bold" font-family="monospace">Thân lưỡi</text>
                </g>

                <!-- Tongue Tip Articulator (#articulator-tongue-tip) -->
                <g id="articulator-tongue-tip" class="articulator-part" data-organ="tongue-tip">
                  <circle id="marker-tongue-tip" cx="185" cy="248" r="5.5" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
                  <text id="label-tongue-tip" x="125" y="275" fill="#38bdf8" font-size="10" font-weight="bold" font-family="monospace">Đầu lưỡi (Tip)</text>
                  <line id="line-tongue-tip" x1="160" y1="270" x2="182" y2="252" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 2" />
                </g>

                <!-- 9. Vocal Cords Articulator (#articulator-vocal-cords) -->
                <g id="articulator-vocal-cords" class="articulator-part" data-organ="vocal-cords">
                  <ellipse id="svg-vocal-cords" cx="295" cy="405" rx="14" ry="7" fill="#ef4444" fill-opacity="0.6" stroke="#ef4444" stroke-width="2.5" />
                  <!-- Vibration Radiating Waves -->
                  <path id="svg-cord-wave-1" d="M 275 398 Q 295 390 315 398" stroke="#f43f5e" stroke-width="2" fill="none" opacity="0" />
                  <path id="svg-cord-wave-2" d="M 275 412 Q 295 420 315 412" stroke="#f43f5e" stroke-width="2" fill="none" opacity="0" />
                  <text x="325" y="410" fill="#ef4444" font-size="11" font-weight="bold" font-family="monospace">Dây thanh âm</text>
                  <!-- Trachea -->
                  <path d="M 280 415 L 280 465 M 310 415 L 310 465" stroke="#475569" stroke-width="2" stroke-dasharray="4 3" />
                </g>

                <!-- 10. Airflow Vector & Burst Group (#articulator-airflow) -->
                <g id="articulator-airflow" class="articulator-part" data-organ="airflow">
                  <!-- Pressure chamber glow behind closure -->
                  <ellipse id="svg-airflow-pocket" cx="210" cy="215" rx="22" ry="14" fill="#f59e0b" fill-opacity="0" filter="url(#glow-filter)" />
                  <!-- Continuous streamline -->
                  <path id="svg-airflow-stream" d="M 275 385 C 270 310, 250 230, 190 200 L 135 200 L 85 200" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" opacity="0" />
                  <!-- Plosive burst ripple -->
                  <circle id="svg-burst-circle" cx="185" cy="192" r="6" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0" />
                  <!-- Burst Pop Rays -->
                  <g id="svg-burst-rays" opacity="0">
                    <line x1="185" y1="192" x2="170" y2="175" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
                    <line x1="185" y1="192" x2="160" y2="195" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" />
                    <line x1="185" y1="192" x2="172" y2="212" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
                  </g>
                </g>

                <!-- Dynamic Articulator Pin Highlighter Ring -->
                <circle id="svg-highlight-ring" cx="0" cy="0" r="16" fill="none" stroke="#38bdf8" stroke-width="3" opacity="0" filter="url(#glow-filter)" />
              </svg>
            </div>

            <!-- Right Panel: HUD, Voicing, Phases, and Articulator Info -->
            <div class="tract-info-panel">
              <!-- Active Phoneme Status Card -->
              <div class="phoneme-status-card" id="phoneme-card">
                <div class="phoneme-status-header">
                  <div class="phoneme-main-badge">
                    <span class="phoneme-symbol-text" id="status-phoneme-symbol">/t/</span>
                    <span class="phoneme-classification" id="status-phoneme-class">Voiceless Alveolar Plosive</span>
                  </div>
                  <div class="voicing-indicator voicing-voiceless" id="status-voicing-badge">
                    <span id="status-voicing-dot">●</span>
                    <span id="status-voicing-text">Voiceless (Không rung)</span>
                  </div>
                </div>

                <!-- 4-Phase Kinematic Progression Bar -->
                <div class="kinematic-phases-box">
                  <div class="phases-title">
                    <span>🧭 4 Pha Động Học Cấu Âm:</span>
                    <span id="active-speed-label" class="text-cyan-400">Tốc độ: 1.0x</span>
                  </div>
                  <div class="phase-step-item" id="phase-step-1">1. Chuẩn bị (Approach): Nâng đầu lưỡi</div>
                  <div class="phase-step-item" id="phase-step-2">2. Nén khí (Compression): Giữ 200ms đóng kín</div>
                  <div class="phase-step-item" id="phase-step-3">3. Giật nổ (Release Burst): Bật mạnh luồng khí</div>
                  <div class="phase-step-item" id="phase-step-4">4. Hồi phục (Recovery): Trở về vị trí nghỉ</div>
                </div>
              </div>

              <!-- Articulator Spotlight Callout Card -->
              <div class="organ-callout-card" id="organ-callout-card">
                <div class="organ-callout-badge">
                  <span class="organ-badge-title" id="organ-callout-title">📍 Gờ Lợi (Alveolar Ridge)</span>
                  <span class="organ-badge-targets" id="organ-callout-targets">/t/, /d/, /s/, /z/, /n/, /l/</span>
                </div>
                <div class="organ-badge-desc" id="organ-callout-desc">
                  Vùng gồ ghề cứng ngay sau răng cửa trên. Điểm tựa quan trọng nhất của tiếng Anh: chặn hoàn toàn tạo /t/, /d/, rãnh hẹp 1mm tạo /s/, /z/, hoặc dẫn khí hai bên tạo /l/.
                </div>
              </div>

              <!-- Quick Articulator Chips Bar (8 Organs) -->
              <div class="organ-chips-section">
                <div class="organ-chips-title">8 Cơ Quan Cấu Âm (Click để highlight):</div>
                <div class="organ-chips-grid">
                  <button class="organ-chip-btn" data-organ="lips">1. Môi (Lips)</button>
                  <button class="organ-chip-btn" data-organ="teeth">2. Răng (Teeth)</button>
                  <button class="organ-chip-btn active" data-organ="alveolar">3. Gờ lợi (Alveolar)</button>
                  <button class="organ-chip-btn" data-organ="tongue-tip">4. Đầu lưỡi (Tip)</button>
                  <button class="organ-chip-btn" data-organ="tongue-blade">5. Thân lưỡi (Blade)</button>
                  <button class="organ-chip-btn" data-organ="velum">6. Ngạc mềm (Velum)</button>
                  <button class="organ-chip-btn" data-organ="vocal-cords">7. Dây thanh (Vocal)</button>
                  <button class="organ-chip-btn" data-organ="airflow">8. Luồng khí (Airflow)</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    cacheElements() {
      this.svgTongue = this.querySelector('#svg-tongue-shape');
      this.markerTip = this.querySelector('#marker-tongue-tip');
      this.labelTip = this.querySelector('#label-tongue-tip');
      this.lineTip = this.querySelector('#line-tongue-tip');
      this.markerBlade = this.querySelector('#marker-tongue-blade');
      this.labelBlade = this.querySelector('#label-tongue-blade');
      this.vocalCords = this.querySelector('#svg-vocal-cords');
      this.cordWave1 = this.querySelector('#svg-cord-wave-1');
      this.cordWave2 = this.querySelector('#svg-cord-wave-2');
      this.lipUpper = this.querySelector('#svg-lip-upper');
      this.lipLower = this.querySelector('#svg-lip-lower');
      this.velumBody = this.querySelector('#svg-velum-body');

      // Airflow
      this.airflowPocket = this.querySelector('#svg-airflow-pocket');
      this.airflowStream = this.querySelector('#svg-airflow-stream');
      this.burstCircle = this.querySelector('#svg-burst-circle');
      this.burstRays = this.querySelector('#svg-burst-rays');
      this.highlightRing = this.querySelector('#svg-highlight-ring');

      // Status HUD
      this.phonemeSymbol = this.querySelector('#status-phoneme-symbol');
      this.phonemeClass = this.querySelector('#status-phoneme-class');
      this.voicingBadge = this.querySelector('#status-voicing-badge');
      this.voicingText = this.querySelector('#status-voicing-text');
      this.speedLabel = this.querySelector('#active-speed-label');

      // Phase Steps
      this.phaseSteps = [
        this.querySelector('#phase-step-1'),
        this.querySelector('#phase-step-2'),
        this.querySelector('#phase-step-3'),
        this.querySelector('#phase-step-4')
      ];

      // Organ Callout
      this.organTitle = this.querySelector('#organ-callout-title');
      this.organDesc = this.querySelector('#organ-callout-desc');
      this.organTargets = this.querySelector('#organ-callout-targets');
    }

    bindEvents() {
      // Speed Toggle
      this.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const spd = parseFloat(btn.dataset.speed);
          this.setSpeed(spd);
        });
      });

      // Sound Toggle
      const soundBtn = this.querySelector('#sound-toggle-btn');
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          this.audio.muted = !this.audio.muted;
          soundBtn.textContent = this.audio.muted ? '🔇 Audio: OFF' : '🔊 Audio: ON';
          if (!this.audio.muted) {
            this.audio.init();
          }
        });
      }

      // Rest Button
      const restBtn = this.querySelector('#btn-tract-rest');
      if (restBtn) {
        restBtn.addEventListener('click', () => {
          this.resetToRest();
        });
      }

      // Phoneme Selector Pills
      this.querySelectorAll('.phoneme-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const ph = btn.dataset.phoneme;
          this.animatePhoneme(ph);
        });
      });

      // Organ Chips
      this.querySelectorAll('.organ-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const organ = btn.dataset.organ;
          this.highlight(organ);
        });
      });

      // SVG Click to Highlight
      this.querySelectorAll('.articulator-part').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const organ = el.dataset.organ || el.id.replace('articulator-', '');
          if (organ) this.highlight(organ);
        });
      });
    }

    setSpeed(spd) {
      this.speed = spd;
      this.querySelectorAll('.speed-btn').forEach(b => {
        b.classList.toggle('active', parseFloat(b.dataset.speed) === spd);
      });
      if (this.speedLabel) {
        this.speedLabel.textContent = `Tốc độ: ${spd}x`;
      }
    }

    setActivePhaseStep(index) {
      this.phaseSteps.forEach((el, i) => {
        if (el) el.classList.toggle('active-step', i === index);
      });
    }

    // =============================================================================
    // METHOD 2: highlight(organName)
    // =============================================================================
    highlight(organName) {
      if (!organName) return;

      // Normalize organ key
      const key = organName.toLowerCase()
        .replace(/^articulator-/, '')
        .replace(/[\s_-]+/g, '-');

      let normalized = 'alveolar';
      if (key.includes('lip') || key.includes('môi')) normalized = 'lips';
      else if (key.includes('teeth') || key.includes('răng')) normalized = 'teeth';
      else if (key.includes('alveolar') || key.includes('lợi')) normalized = 'alveolar';
      else if (key.includes('tip') || key.includes('đầu')) normalized = 'tongue-tip';
      else if (key.includes('blade') || key.includes('body') || key.includes('thân')) normalized = 'tongue-blade';
      else if (key.includes('velum') || key.includes('palate') || key.includes('ngạc')) normalized = 'velum';
      else if (key.includes('cord') || key.includes('vocal') || key.includes('thanh')) normalized = 'vocal-cords';
      else if (key.includes('pharynx') || key.includes('họng')) normalized = 'pharynx';
      else if (key.includes('air') || key.includes('khí')) normalized = 'airflow';

      const data = ARTICULATORS_DATA[normalized];
      if (!data) return;

      this.activeOrgan = normalized;

      // 1. Remove previous highlights
      this.querySelectorAll('.articulator-part').forEach(p => p.classList.remove('is-highlighted'));
      this.querySelectorAll('.organ-chip-btn').forEach(b => b.classList.remove('active'));

      // 2. Add pulsing glow class to element
      const targetEl = this.querySelector(`#${data.id}`) || this.querySelector(`[data-organ="${normalized}"]`);
      if (targetEl) {
        targetEl.classList.add('is-highlighted');
      }

      // 3. Highlight chip button
      const chip = this.querySelector(`.organ-chip-btn[data-organ="${normalized}"]`);
      if (chip) chip.classList.add('active');

      // 4. Update Organ Callout Card Badge
      if (this.organTitle) this.organTitle.textContent = `📍 ${data.nameVi}`;
      if (this.organDesc) this.organDesc.textContent = data.desc;
      if (this.organTargets) this.organTargets.textContent = data.targets;

      // 5. Position SVG highlight ring
      if (this.highlightRing && data.coords) {
        this.highlightRing.setAttribute('cx', data.coords.x);
        this.highlightRing.setAttribute('cy', data.coords.y);
        this.highlightRing.setAttribute('opacity', '1');
      }
    }

    // =============================================================================
    // METHOD 3: animatePhoneme(phoneme)
    // =============================================================================
    animatePhoneme(phoneme) {
      if (!phoneme) return;

      // Normalize string (handle 't', '/t/', etc.)
      let ph = phoneme.trim();
      if (!ph.startsWith('/')) ph = `/${ph}`;
      if (!ph.endsWith('/')) ph = `${ph}/`;

      const data = PHONEME_DATA[ph];
      if (!data) return;

      this.currentPhoneme = ph;
      this.clearAllTimers();

      // Update phoneme selector button states
      this.querySelectorAll('.phoneme-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.phoneme === ph);
      });

      // Update HUD info
      if (this.phonemeSymbol) this.phonemeSymbol.textContent = data.symbol;
      if (this.phonemeClass) this.phonemeClass.textContent = data.name;

      // Update Voicing indicator
      if (this.voicingBadge) {
        this.voicingBadge.className = data.voicing
          ? 'voicing-indicator voicing-voiced'
          : 'voicing-indicator voicing-voiceless';
      }
      if (this.voicingText) {
        this.voicingText.textContent = data.voicing ? '⚡ Voiced (Dây thanh rung)' : '🔇 Voiceless (Không rung)';
      }

      // Update Phase text labels
      if (data.steps) {
        data.steps.forEach((stepText, idx) => {
          if (this.phaseSteps[idx]) this.phaseSteps[idx].textContent = stepText;
        });
      }

      // Set speed scale factor (durations double at 0.5x)
      const scale = 1 / this.speed;

      // Reset transforms
      this.resetArticulatorTransforms();

      // Dispatch specific phoneme kinematics
      switch (ph) {
        case '/t/':
          this.executePlosiveKinematics(false, scale, data.soundType);
          break;
        case '/d/':
          this.executePlosiveKinematics(true, scale, data.soundType);
          break;
        case '/s/':
          this.executeFricativeKinematics(false, scale, data.soundType);
          break;
        case '/z/':
          this.executeFricativeKinematics(true, scale, data.soundType);
          break;
        case '/θ/':
          this.executeInterdentalKinematics(false, scale, data.soundType);
          break;
        case '/ð/':
          this.executeInterdentalKinematics(true, scale, data.soundType);
          break;
        case '/ʃ/':
          this.executePostalveolarKinematics(false, scale, data.soundType);
          break;
        case '/dʒ/':
          this.executeAffricateKinematics(true, scale, data.soundType);
          break;
      }
    }

    // Kinematics Implementation: /t/ and /d/
    executePlosiveKinematics(isVoiced, scale, soundType) {
      // Highlight Primary Articulator
      this.highlight('alveolar');

      // Phase 1: Approach (0 -> 240ms * scale)
      this.setActivePhaseStep(0);
      this.setTongueState('alveolarContact');

      // Velum seals nasal port
      this.velumBody.setAttribute('transform', 'rotate(-3, 305, 202)');

      // Phase 2: Compression & Hold for 200ms (240ms -> 440ms * scale)
      const tHold = setTimeout(() => {
        this.setActivePhaseStep(1);
        // Pressure builds behind tongue occlusion
        this.airflowPocket.setAttribute('fill-opacity', '0.75');

        // If voiced (/d/), vocal cords vibrate with pulsing glow
        if (isVoiced) {
          this.setVocalCordsVoicing(true);
        }
      }, 240 * scale);
      this.animTimeoutIds.push(tHold);

      // Phase 3: Snap Down Release + Burst (440ms * scale)
      const tRelease = setTimeout(() => {
        this.setActivePhaseStep(2);
        this.airflowPocket.setAttribute('fill-opacity', '0');

        // Tongue snaps down rapidly
        this.setTongueState('alveolarRelease');

        // Trigger Plosive Burst Ripple & Rays
        this.triggerBurstPop(185, 192);

        // Acoustic audio synth
        this.audio.play(soundType, this.speed);
      }, 440 * scale);
      this.animTimeoutIds.push(tRelease);

      // Phase 4: Recovery back to rest (850ms * scale)
      const tRecovery = setTimeout(() => {
        this.setActivePhaseStep(3);
        this.setVocalCordsVoicing(false);
      }, 850 * scale);
      this.animTimeoutIds.push(tRecovery);

      // Settle at Rest
      const tRest = setTimeout(() => {
        this.resetToRest();
      }, 1250 * scale);
      this.animTimeoutIds.push(tRest);
    }

    // Kinematics Implementation: /s/ and /z/
    executeFricativeKinematics(isVoiced, scale, soundType) {
      this.highlight('tongue-blade');

      // Phase 1: Positioning narrow 1mm constriction
      this.setActivePhaseStep(0);
      this.setTongueState('alveolarFricative');

      // Phase 2: Continuous turbulent airstream
      const tStream = setTimeout(() => {
        this.setActivePhaseStep(1);
        this.setAirflowStreaming(true);

        if (isVoiced) {
          this.setVocalCordsVoicing(true);
        }

        this.audio.play(soundType, this.speed);
      }, 250 * scale);
      this.animTimeoutIds.push(tStream);

      // Phase 3: Sustain friction
      const tSustain = setTimeout(() => {
        this.setActivePhaseStep(2);
      }, 550 * scale);
      this.animTimeoutIds.push(tSustain);

      // Phase 4: Relax to rest
      const tRelax = setTimeout(() => {
        this.setActivePhaseStep(3);
        this.setAirflowStreaming(false);
        this.setVocalCordsVoicing(false);
      }, 850 * scale);
      this.animTimeoutIds.push(tRelax);

      const tRest = setTimeout(() => {
        this.resetToRest();
      }, 1200 * scale);
      this.animTimeoutIds.push(tRest);
    }

    // Kinematics Implementation: /θ/ and /ð/
    executeInterdentalKinematics(isVoiced, scale, soundType) {
      this.highlight('teeth');

      // Phase 1: Tongue tip protrudes between teeth
      this.setActivePhaseStep(0);
      this.setTongueState('interdental');

      // Phase 2: Gentle airflow escapes
      const tEscape = setTimeout(() => {
        this.setActivePhaseStep(1);
        this.setAirflowStreaming(true);

        if (isVoiced) {
          this.setVocalCordsVoicing(true);
        }

        this.audio.play(soundType, this.speed);
      }, 280 * scale);
      this.animTimeoutIds.push(tEscape);

      const tSustain = setTimeout(() => {
        this.setActivePhaseStep(2);
      }, 580 * scale);
      this.animTimeoutIds.push(tSustain);

      const tRelax = setTimeout(() => {
        this.setActivePhaseStep(3);
        this.setAirflowStreaming(false);
        this.setVocalCordsVoicing(false);
      }, 900 * scale);
      this.animTimeoutIds.push(tRelax);

      const tRest = setTimeout(() => {
        this.resetToRest();
      }, 1300 * scale);
      this.animTimeoutIds.push(tRest);
    }

    // Kinematics Implementation: /ʃ/ (postalveolar fricative)
    executePostalveolarKinematics(isVoiced, scale, soundType) {
      this.highlight('lips');

      // Phase 1: Lip rounding + Postalveolar elevation
      this.setActivePhaseStep(0);
      this.setLipRounding(true);
      this.setTongueState('postalveolar');

      // Phase 2: Broad turbulent flow through rounded lips
      const tFlow = setTimeout(() => {
        this.setActivePhaseStep(1);
        this.setAirflowStreaming(true);
        if (isVoiced) this.setVocalCordsVoicing(true);
        this.audio.play(soundType, this.speed);
      }, 280 * scale);
      this.animTimeoutIds.push(tFlow);

      const tSustain = setTimeout(() => {
        this.setActivePhaseStep(2);
      }, 620 * scale);
      this.animTimeoutIds.push(tSustain);

      const tRelax = setTimeout(() => {
        this.setActivePhaseStep(3);
        this.setAirflowStreaming(false);
        this.setLipRounding(false);
        this.setVocalCordsVoicing(false);
      }, 950 * scale);
      this.animTimeoutIds.push(tRelax);

      const tRest = setTimeout(() => {
        this.resetToRest();
      }, 1350 * scale);
      this.animTimeoutIds.push(tRest);
    }

    // Kinematics Implementation: /dʒ/ (postalveolar affricate)
    executeAffricateKinematics(isVoiced, scale, soundType) {
      this.highlight('tongue-blade');

      // Phase 1: Stop closure in postalveolar area + lips rounded
      this.setActivePhaseStep(0);
      this.setLipRounding(true);
      this.setTongueState('postalveolar');
      this.setVocalCordsVoicing(true);

      // Phase 2: Compression hold
      const tHold = setTimeout(() => {
        this.setActivePhaseStep(1);
        this.airflowPocket.setAttribute('fill-opacity', '0.6');
      }, 200 * scale);
      this.animTimeoutIds.push(tHold);

      // Phase 3: Friction release
      const tRelease = setTimeout(() => {
        this.setActivePhaseStep(2);
        this.airflowPocket.setAttribute('fill-opacity', '0');
        this.setAirflowStreaming(true);
        this.audio.play(soundType, this.speed);
      }, 350 * scale);
      this.animTimeoutIds.push(tRelease);

      const tRelax = setTimeout(() => {
        this.setActivePhaseStep(3);
        this.setAirflowStreaming(false);
        this.setLipRounding(false);
        this.setVocalCordsVoicing(false);
      }, 850 * scale);
      this.animTimeoutIds.push(tRelax);

      const tRest = setTimeout(() => {
        this.resetToRest();
      }, 1300 * scale);
      this.animTimeoutIds.push(tRest);
    }

    // Kinematic Helpers
    setTongueState(stateKey) {
      const pathD = TONGUE_PATHS[stateKey];
      if (pathD && this.svgTongue) {
        this.svgTongue.setAttribute('d', pathD);
      }

      const lmk = LANDMARKS[stateKey];
      if (lmk) {
        if (this.markerTip) {
          this.markerTip.setAttribute('cx', lmk.tip.x);
          this.markerTip.setAttribute('cy', lmk.tip.y);
        }
        if (this.lineTip) {
          this.lineTip.setAttribute('x2', lmk.tip.x);
          this.lineTip.setAttribute('y2', lmk.tip.y);
        }
        if (this.markerBlade) {
          this.markerBlade.setAttribute('cx', lmk.blade.x);
          this.markerBlade.setAttribute('cy', lmk.blade.y);
        }
      }
    }

    setVocalCordsVoicing(active) {
      if (!this.vocalCords) return;
      if (active) {
        this.vocalCords.classList.add('vocal-vibrating');
        if (this.cordWave1) this.cordWave1.setAttribute('opacity', '0.9');
        if (this.cordWave2) this.cordWave2.setAttribute('opacity', '0.9');
      } else {
        this.vocalCords.classList.remove('vocal-vibrating');
        if (this.cordWave1) this.cordWave1.setAttribute('opacity', '0');
        if (this.cordWave2) this.cordWave2.setAttribute('opacity', '0');
      }
    }

    setAirflowStreaming(active) {
      if (!this.airflowStream) return;
      if (active) {
        this.airflowStream.setAttribute('opacity', '0.85');
        this.airflowStream.classList.add('airflow-active-stream');
      } else {
        this.airflowStream.setAttribute('opacity', '0');
        this.airflowStream.classList.remove('airflow-active-stream');
      }
    }

    triggerBurstPop(cx, cy) {
      if (this.burstCircle) {
        this.burstCircle.setAttribute('cx', cx);
        this.burstCircle.setAttribute('cy', cy);
        this.burstCircle.setAttribute('opacity', '1');
        this.burstCircle.classList.remove('burst-popping');
        // Force reflow
        void this.burstCircle.offsetWidth;
        this.burstCircle.classList.add('burst-popping');
      }

      if (this.burstRays) {
        this.burstRays.setAttribute('opacity', '1');
        setTimeout(() => {
          this.burstRays.setAttribute('opacity', '0');
        }, 150);
      }
    }

    setLipRounding(isRounded) {
      if (this.lipUpper && this.lipLower) {
        if (isRounded) {
          this.lipUpper.setAttribute('transform', 'translate(-8, 0) scale(1.15, 1)');
          this.lipLower.setAttribute('transform', 'translate(-8, 0) scale(1.15, 1)');
        } else {
          this.lipUpper.removeAttribute('transform');
          this.lipLower.removeAttribute('transform');
        }
      }
    }

    resetArticulatorTransforms() {
      this.setLipRounding(false);
      this.setVocalCordsVoicing(false);
      this.setAirflowStreaming(false);
      if (this.airflowPocket) this.airflowPocket.setAttribute('fill-opacity', '0');
      if (this.burstCircle) this.burstCircle.setAttribute('opacity', '0');
      if (this.burstRays) this.burstRays.setAttribute('opacity', '0');
      if (this.velumBody) this.velumBody.removeAttribute('transform');
    }

    resetToRest() {
      this.clearAllTimers();
      this.resetArticulatorTransforms();
      this.setTongueState('rest');
      this.setActivePhaseStep(-1);

      this.querySelectorAll('.phoneme-pill').forEach(b => b.classList.remove('active'));

      if (this.phonemeSymbol) this.phonemeSymbol.textContent = 'REST';
      if (this.phonemeClass) this.phonemeClass.textContent = 'Natural Baseline Tract (Vị trí nghỉ)';
      if (this.voicingBadge) this.voicingBadge.className = 'voicing-indicator voicing-voiceless';
      if (this.voicingText) this.voicingText.textContent = 'Neutral (Nghỉ)';

      this.highlight('alveolar');
    }
  }

  // =============================================================================
  // GLOBAL WINDOW EXPOSURES (Requirement 4)
  // =============================================================================
  window.highlightArticulator = function (organ) {
    const tract = document.querySelector('deveng-kinematic-tract');
    if (tract && typeof tract.highlight === 'function') {
      tract.highlight(organ);
    }
  };

  window.animateTractPhoneme = function (phoneme) {
    const tract = document.querySelector('deveng-kinematic-tract');
    if (tract && typeof tract.animatePhoneme === 'function') {
      tract.animatePhoneme(phoneme);
    }
  };

  // Self-register custom element
  if (!customElements.get('deveng-kinematic-tract')) {
    customElements.define('deveng-kinematic-tract', DevEngKinematicTract);
  }
})();
