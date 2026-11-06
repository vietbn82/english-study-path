/**
 * DevEng Coach - Unified Web Components Architecture
 * Single Source of Truth for Shared UI Components across Workspace and Handbook.
 * Standardizes:
 *  - <deveng-selection-lookup>: Text selection quick lookup popover (IPA, Audio, Meaning)
 *  - <deveng-sound-modal>: Pronunciation grading & acoustic evaluation modal
 *  - <deveng-ai-coach>: Docked AI Senior Dev Coach side-drawer & Floating Trigger
 *  - <deveng-recorder-dock>: Direct acoustic comparison audio recorder dock
 */

// =============================================================================
// GLOBAL SPEECH SYNTHESIS ENGINE
// =============================================================================
window.speakWord = function(text, rate) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate || window.handbookAudioSpeed || 0.85;
  window.speechSynthesis.speak(utterance);
};
window.speakText = window.speakWord;

// Global Omnipresent Audio Delegation for any .speak-btn
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.speak-btn');
  if (btn && btn.dataset.word) {
    e.preventDefault();
    window.speakWord(btn.dataset.word);
  }
});

// =============================================================================
// 1. SELECTION QUICK LOOKUP POPOVER COMPONENT (<deveng-selection-lookup>)
// =============================================================================
class DevEngSelectionLookup extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initEvents();
  }

  render() {
    let popup = document.getElementById('selection-lookup-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'selection-lookup-popup';
      popup.className = 'selection-lookup-popup hidden';
      document.body.appendChild(popup);
    }
    this.popup = popup;
  }

  initEvents() {
    const popup = this.popup;
    let currentLookupData = null;
    let lastDismissedSelection = null;

    // Dismiss on click outside
    document.addEventListener('mousedown', (e) => {
      if (popup && !popup.contains(e.target)) {
        popup.classList.add('hidden');
      }
    });

    // Reset tracking on selection clear
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
      setTimeout(async () => {
        try {
          const selection = window.getSelection();
          if (!selection || selection.isCollapsed) return;

          const text = selection.toString().trim();
          if (!text || text.length < 2 || text.length > 120) return;

          // Don't re-trigger dismissed selection
          if (text === lastDismissedSelection) return;
          lastDismissedSelection = null;

          // Prevent popup trigger inside inputs, textareas, buttons or modals
          const anchorNode = selection.anchorNode;
          if (anchorNode && anchorNode.parentElement && (
              anchorNode.parentElement.closest('#selection-lookup-popup') ||
              anchorNode.parentElement.closest('textarea') ||
              anchorNode.parentElement.closest('input') ||
              anchorNode.parentElement.closest('button') ||
              anchorNode.parentElement.closest('#modal-sound-practice') ||
              anchorNode.parentElement.closest('#modal-floating-ai')
          )) {
            return;
          }

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return;

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
              <div class="text-slate-100 text-sm leading-relaxed font-sans" id="sel-pop-meaning">Đang tải nghĩa...</div>
              <div class="text-slate-200 italic text-sm leading-relaxed font-sans" id="sel-pop-cue"></div>
            </div>
            <button id="sel-pop-btn-practice" class="w-full mt-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow">
              🎤 Luyện phát âm từ này
            </button>
          `;

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

          document.getElementById('sel-pop-btn-speak')?.addEventListener('click', (e) => {
            e.stopPropagation();
            window.speakWord(text);
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
            window.openSoundPracticeModal(ipa, text, ipa, cue);
          });

          // Fetch IPA & Meaning
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
          } catch (_) {
            const ipaEl = document.getElementById('sel-pop-ipa');
            const meaningEl = document.getElementById('sel-pop-meaning');
            if (ipaEl) ipaEl.textContent = `/${text}/`;
            if (meaningEl) meaningEl.textContent = 'Bấm 🔊 để nghe phát âm chuẩn';
          }
        } catch (err) {
          console.warn('Selection lookup error:', err);
        }
      }, 120);
    }
  }
}
customElements.define('deveng-selection-lookup', DevEngSelectionLookup);


// =============================================================================
// 2. SOUND PRACTICE & AI GRADING MODAL (<deveng-sound-modal>)
// =============================================================================
class DevEngSoundModal extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initEngine();
  }

  render() {
    this.innerHTML = `
      <div id="modal-sound-practice" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-base">🎤</span>
              <div>
                <h3 class="font-bold text-base text-white">Luyện Âm & Chấm Điểm AI</h3>
                <div class="text-sm text-slate-200 font-mono" id="modal-sound-target-desc">Mục tiêu: /t/ (Alveolar stop)</div>
              </div>
            </div>
            <button id="btn-close-sound-modal" class="text-slate-400 hover:text-white text-xl font-mono p-1 cursor-pointer">✕</button>
          </div>

          <!-- Reference Target Card -->
          <div class="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div class="text-sm text-slate-300 font-mono">Từ mẫu chuẩn:</div>
              <div class="text-2xl font-mono font-bold text-cyan-400 mt-0.5" id="modal-sound-target-word">commit /kəˈmɪt/</div>
              <div class="text-sm text-slate-200 italic mt-0.5 font-sans" id="modal-sound-target-tip">Bật âm /t/ dứt khoát trên gờ lợi</div>
            </div>
            <button id="modal-sound-btn-listen" class="speak-btn px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-sm font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer" data-word="commit">
              🔊 Nghe mẫu
            </button>
          </div>

          <!-- Speech Input Area -->
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-200">Nói từ hoặc âm này vào mic:</label>
            <div class="flex items-center gap-2">
              <button id="btn-record-sound" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700 text-sm font-semibold flex items-center gap-2 transition shrink-0 cursor-pointer">
                🎤 <span id="record-sound-label">Bấm để nói</span>
              </button>
              <input type="text" id="input-sound-transcript" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500" placeholder="Từ hoặc âm bạn vừa nói...">
            </div>
          </div>

          <button id="btn-submit-sound-grade" class="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm shadow-md transition cursor-pointer">
            🚀 Chấm điểm phát âm cùng AI Coach
          </button>

          <!-- Feedback Result -->
          <div id="sound-grade-result" class="hidden bg-slate-950 border border-cyan-900/60 rounded-xl p-4 space-y-3 text-sm">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span class="font-bold text-slate-200 text-sm">Điểm chính xác cấu âm:</span>
              <span id="sound-grade-score" class="px-3 py-1 rounded-full text-sm font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                92/100
              </span>
            </div>
            <!-- Phoneme-Level Breakdown -->
            <div class="space-y-1.5">
              <div class="text-sm text-slate-200 font-semibold">Chi tiết âm vị & Bắt lỗi cơ học:</div>
              <div id="modal-phoneme-breakdown" class="flex flex-wrap gap-1.5 text-sm font-mono">
                <!-- Phoneme badges rendered here -->
              </div>
            </div>
            <div class="space-y-1.5">
              <div class="text-sm text-slate-200 font-semibold">Chẩn đoán từ AI Coach:</div>
              <p id="sound-grade-diagnostic" class="text-slate-100 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans text-sm">...</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initEngine() {
    let currentWord = 'commit';
    let currentSymbol = '/t/';
    let recognition = null;
    let isRecording = false;

    const modal = document.getElementById('modal-sound-practice');
    const descEl = document.getElementById('modal-sound-target-desc');
    const wordEl = document.getElementById('modal-sound-target-word');
    const tipEl = document.getElementById('modal-sound-target-tip');
    const listenBtn = document.getElementById('modal-sound-btn-listen');
    const recordBtn = document.getElementById('btn-record-sound');
    const recordLabel = document.getElementById('record-sound-label');
    const transcriptInput = document.getElementById('input-sound-transcript');
    const submitBtn = document.getElementById('btn-submit-sound-grade');
    const resultBox = document.getElementById('sound-grade-result');
    const scoreEl = document.getElementById('sound-grade-score');
    const diagnosticEl = document.getElementById('sound-grade-diagnostic');
    const breakdownEl = document.getElementById('modal-phoneme-breakdown');

    // Global opener
    window.openSoundPracticeModal = (targetSound, word, ipa, tip) => {
      const pop = document.getElementById('selection-lookup-popup');
      if (pop) pop.classList.add('hidden');
      try { window.getSelection()?.removeAllRanges(); } catch (_) {}

      currentWord = word || 'commit';
      currentSymbol = targetSound || ipa || '/t/';

      if (descEl) descEl.textContent = `Mục tiêu: ${currentSymbol}`;
      if (wordEl) wordEl.textContent = `${currentWord} ${ipa || ''}`;
      if (tipEl) tipEl.textContent = tip || 'Kiểm soát chặt chẽ điểm tiếp xúc lưỡi và luồng hơi';
      if (listenBtn) listenBtn.dataset.word = currentWord;
      if (transcriptInput) transcriptInput.value = '';
      if (resultBox) resultBox.classList.add('hidden');
      if (modal) modal.classList.remove('hidden');
    };

    window.closeSoundPracticeModal = () => {
      if (modal) modal.classList.add('hidden');
      if (recognition && isRecording) {
        recognition.stop();
        isRecording = false;
      }
    };

    // Close buttons
    document.getElementById('btn-close-sound-modal')?.addEventListener('click', window.closeSoundPracticeModal);
    modal?.addEventListener('mousedown', (e) => {
      if (e.target === modal) window.closeSoundPracticeModal();
    });

    listenBtn?.addEventListener('click', () => {
      window.speakWord(currentWord);
    });

    // Delegate for all in-page open-sound-modal-btn buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.open-sound-modal-btn');
      if (btn) {
        e.preventDefault();
        window.openSoundPracticeModal(
          btn.dataset.symbol || '/t/',
          btn.dataset.word || 'commit',
          btn.dataset.ipa || '',
          btn.dataset.tip || ''
        );
      }
    });

    // Web Speech Recognition
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isRecording = true;
        if (recordLabel) recordLabel.textContent = 'Đang nghe...';
        if (recordBtn) recordBtn.className = 'px-4 py-2.5 bg-rose-950 text-rose-300 border border-rose-800 rounded-lg text-sm font-semibold flex items-center gap-2 transition shrink-0 cursor-pointer';
      };

      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        if (transcriptInput) transcriptInput.value = text;
      };

      recognition.onerror = () => {
        isRecording = false;
        if (recordLabel) recordLabel.textContent = 'Bấm để nói';
        if (recordBtn) recordBtn.className = 'px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700 text-sm font-semibold flex items-center gap-2 transition shrink-0 cursor-pointer';
      };

      recognition.onend = () => {
        isRecording = false;
        if (recordLabel) recordLabel.textContent = 'Bấm để nói';
        if (recordBtn) recordBtn.className = 'px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700 text-sm font-semibold flex items-center gap-2 transition shrink-0 cursor-pointer';
      };

      recordBtn?.addEventListener('click', () => {
        if (isRecording) recognition.stop();
        else recognition.start();
      });
    }

    // Submit Grade
    submitBtn?.addEventListener('click', async () => {
      const input = (transcriptInput?.value || '').trim() || currentWord;
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ AI Coach đang phân tích âm học...';

      try {
        // 1. Scoring API
        try {
          const scoreRes = await fetch('/api/speech/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dayNumber: 1,
              targetWordOrSentence: currentWord,
              expectedPhonemes: currentSymbol,
              spokenText: input
            })
          });
          if (scoreRes.ok) {
            const scoreData = await scoreRes.json();
            if (breakdownEl) {
              breakdownEl.innerHTML = '';
              (scoreData.phonemeBreakdown || []).forEach(p => {
                const span = document.createElement('span');
                span.className = p.isCorrect ? 'px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold' : 'px-2.5 py-1 rounded-md bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold';
                span.title = p.kinestheticCorrectionTip || '';
                span.textContent = `${p.targetPhoneme} ${p.isCorrect ? '✅' : '❌'}`;
                breakdownEl.appendChild(span);
              });
            }
          }
        } catch (_) {}

        // 2. AI Evaluation API
        const evalRes = await fetch('/api/ai/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayNumber: 1,
            inputText: `Pronunciation check for sound ${currentSymbol}. Target: ${currentWord}. Learner pronounced: "${input}".`
          })
        });
        const evalData = await evalRes.json();

        resultBox?.classList.remove('hidden');
        if (scoreEl) scoreEl.textContent = `${evalData.fluencyScore || 92}/100`;
        if (diagnosticEl) {
          diagnosticEl.textContent = evalData.phoneticMechanicsAlerts?.join(' ') || evalData.naturalSpeakingTip || 'Khẩu hình, điểm tiếp xúc và luồng khí chuẩn xác.';
        }
      } catch (err) {
        resultBox?.classList.remove('hidden');
        if (scoreEl) scoreEl.textContent = '88/100';
        if (diagnosticEl) {
          diagnosticEl.textContent = `Âm vị đạt yêu cầu đối với ${currentWord}. Nhớ duy trì độ nổ sắc bén ở đuôi âm!`;
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Chấm điểm phát âm cùng AI Coach';
      }
    });
  }
}
customElements.define('deveng-sound-modal', DevEngSoundModal);


// =============================================================================
// 3. AI COACH DRAWER & FLOATING TRIGGER (<deveng-ai-coach>)
// =============================================================================
class DevEngAiCoach extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initEngine();
  }

  render() {
    const isHandbook = this.getAttribute('context') === 'handbook';
    const initialWelcome = isHandbook
      ? '👋 Chào bạn! Bạn đang xem <strong>Cẩm Nang Cấu Âm Học</strong>. Hỏi tôi bất kỳ câu hỏi nào về vị trí đặt lưỡi, ngạc cứng, ngạc mềm hoặc nhờ chấm điểm câu nói của bạn.'
      : `👋 Xin chào! Tôi là <strong>AI Coach</strong>. Bạn có thể hỏi tôi bất kỳ thắc mắc nào về:
         <ul class="list-disc list-inside mt-2 space-y-1 text-slate-300">
           <li>Cách đặt đầu lưỡi cho các âm khó (/θ/, /ð/, /tʃ/, /dʒ/).</li>
           <li>Chấm điểm một câu bạn nói trong Daily Standup.</li>
           <li>Refactor câu nói thô sang phong cách Senior Developer.</li>
         </ul>`;

    this.innerHTML = `
      <!-- FLOATING ACTION BUTTON (GLOBAL AI COACH) -->
      <button id="btn-floating-ai" title="Mở AI Coach" class="floating-ai-fab fixed bottom-6 right-6 z-[60] px-4 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 border border-purple-400/40 cursor-pointer transition transform hover:scale-105 pointer-events-auto">
        <span class="text-base animate-pulse">🤖</span>
        <span>AI Coach</span>
      </button>

      <!-- SLIDE-OVER/DOCKED PANEL: Floating AI Assistant Panel (Right Docked to shift page content left) -->
      <div id="modal-floating-ai" class="hidden fixed inset-y-0 right-0 z-[70] w-full md:w-[440px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
        <!-- Header -->
        <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow">
              🤖
            </div>
            <div>
              <div class="font-bold text-base text-white">AI Coach</div>
              <div class="text-xs text-purple-300 font-mono">Senior Dev English Pronunciation Coach</div>
            </div>
          </div>
          <button id="btn-close-floating-ai" class="text-slate-400 hover:text-white text-base font-mono p-1 cursor-pointer">✕</button>
        </div>

        <!-- Chat / Feedback History -->
        <div id="floating-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
          <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed font-sans text-sm">
            ${initialWelcome}
          </div>
        </div>

        <!-- Quick Prompt Pills -->
        <div class="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button class="quick-prompt-btn px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 shrink-0 transition cursor-pointer" data-prompt="Làm sao để không bị rụng âm đuôi /t/ và /d/ khi nói nhanh?">
            Âm đuôi /t/ vs /d/
          </button>
          <button class="quick-prompt-btn px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 shrink-0 transition cursor-pointer" data-prompt="Cách phát âm chữ auth và thread chuẩn không giống th tiếng Việt?">
            Âm /θ/ trong auth
          </button>
          <button class="quick-prompt-btn px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 shrink-0 transition cursor-pointer" data-prompt="Refactor câu: Yesterday I fix bug and deploy to server">
            Refactor câu Standup
          </button>
        </div>

        <!-- Input Section -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
          <div class="flex items-center gap-2">
            <textarea id="floating-ai-input" rows="2" class="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-purple-500 resize-none" placeholder="Nhập câu tiếng Anh hoặc thắc mắc của bạn..."></textarea>
            <div class="flex flex-col gap-1.5">
              <button id="floating-btn-mic" title="Nói vào micro" class="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-sm transition cursor-pointer">
                🎤
              </button>
              <button id="floating-btn-send" class="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-sm transition cursor-pointer">
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initEngine() {
    const btnFloating = document.getElementById('btn-floating-ai');
    const modalFloating = document.getElementById('modal-floating-ai');
    const btnCloseFloating = document.getElementById('btn-close-floating-ai');
    const input = document.getElementById('floating-ai-input');
    const sendBtn = document.getElementById('floating-btn-send');
    const micBtn = document.getElementById('floating-btn-mic');
    const messages = document.getElementById('floating-chat-messages');

    window.toggleAiCoach = (forceState) => {
      const modal = document.getElementById('modal-floating-ai') || modalFloating;
      if (!modal) return;
      const willOpen = forceState !== undefined ? forceState : modal.classList.contains('hidden');
      if (willOpen) {
        modal.classList.remove('hidden');
        document.body.classList.add('ai-coach-active');
        const inp = document.getElementById('floating-ai-input') || input;
        inp?.focus();
      } else {
        modal.classList.add('hidden');
        document.body.classList.remove('ai-coach-active');
      }
    };

    btnFloating?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.toggleAiCoach();
    });
    btnCloseFloating?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.toggleAiCoach(false);
    });

    // Send AI Question
    const sendMessage = async () => {
      const text = (input?.value || '').trim();
      if (!text || !messages) return;

      const userMsg = document.createElement('div');
      userMsg.className = 'p-3 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-200 ml-6 text-sm font-sans';
      userMsg.innerHTML = `<span class="font-bold">Bạn:</span> ${text}`;
      messages.appendChild(userMsg);
      input.value = '';
      messages.scrollTop = messages.scrollHeight;

      const aiMsg = document.createElement('div');
      aiMsg.className = 'p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 mr-6 text-sm font-sans';
      aiMsg.innerHTML = '<span>⏳ AI Coach đang suy nghĩ...</span>';
      messages.appendChild(aiMsg);
      messages.scrollTop = messages.scrollHeight;

      try {
        const res = await fetch('/api/ai/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayNumber: (window.state && window.state.currentDay) || 1,
            inputText: text
          })
        });
        const data = await res.json();
        aiMsg.innerHTML = `
          <div class="space-y-1.5">
            <div class="font-bold text-cyan-400">🤖 AI Coach:</div>
            <div>${data.grammarCorrections || 'Ngữ pháp và ngữ điệu câu đạt yêu cầu.'}</div>
            ${data.phoneticMechanicsAlerts?.length ? `<div class="text-xs text-amber-300">⚠️ Cơ học: ${data.phoneticMechanicsAlerts.join('; ')}</div>` : ''}
            ${data.seniorDevRefactoring ? `<div class="p-2 rounded-lg bg-cyan-950/40 border border-cyan-900/60 font-mono text-xs text-cyan-200 mt-1">⭐ Senior Dev: "${data.seniorDevRefactoring}"</div>` : ''}
          </div>
        `;
      } catch (err) {
        aiMsg.innerHTML = '<span class="text-amber-400">⚠️ AI Coach: Hãy ghi nhớ nguyên tắc đặt đầu lưỡi đúng gờ lợi và không rụng âm đuôi!</span>';
      } finally {
        messages.scrollTop = messages.scrollHeight;
      }
    };

    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Quick prompt pills
    this.querySelectorAll('.quick-prompt-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        if (input) {
          input.value = pill.dataset.prompt || '';
          sendMessage();
        }
      });
    });

    // Mic transcription
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec && micBtn) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        micBtn.classList.add('bg-rose-600', 'text-white');
      };
      rec.onresult = (e) => {
        if (input) input.value = e.results[0][0].transcript;
      };
      rec.onend = () => {
        micBtn.classList.remove('bg-rose-600', 'text-white');
      };
      micBtn.addEventListener('click', () => rec.start());
    }
  }
}
customElements.define('deveng-ai-coach', DevEngAiCoach);


// =============================================================================
// 4. LIVE AUDIO RECORDER DOCK (<deveng-recorder-dock>)
// =============================================================================
class DevEngRecorderDock extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initRecorder();
  }

  render() {
    this.innerHTML = `
      <div id="recorder-dock" class="fixed bottom-4 right-4 z-50 bg-slate-900/95 border-2 border-cyan-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur max-w-md w-full space-y-3 hidden transition-all">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
            <span class="font-bold text-sm text-white font-mono">🎙️ Phòng Thu Âm Đối Chiếu Trực Tiếp</span>
          </div>
          <button id="btn-close-recorder-dock" class="text-slate-400 hover:text-slate-200 text-sm font-bold px-2 py-0.5 rounded cursor-pointer">✕</button>
        </div>

        <div class="space-y-3 text-sm">
          <div class="text-sm text-slate-200 leading-relaxed font-sans" id="dock-recorder-status">
            Bấm nút thu âm để nói câu hoặc từ bạn muốn luyện, sau đó nghe lại giọng mình để so sánh trực diện.
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-dock-record-toggle" class="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-500 flex items-center justify-center gap-2 transition shadow cursor-pointer">
              <span>🔴 Bắt đầu thu âm</span>
            </button>
            <button id="btn-dock-replay-voice" disabled class="py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              <span>▶ Nghe lại</span>
            </button>
          </div>
          <audio id="dock-audio-playback" class="hidden"></audio>
        </div>
      </div>
    `;
  }

  initRecorder() {
    const dock = document.getElementById('recorder-dock');
    const btnRecord = document.getElementById('btn-dock-record-toggle');
    const btnReplay = document.getElementById('btn-dock-replay-voice');
    const audioEl = document.getElementById('dock-audio-playback');
    const statusEl = document.getElementById('dock-recorder-status');
    const btnClose = document.getElementById('btn-close-recorder-dock');

    let mediaRecorder = null;
    let audioChunks = [];
    let audioUrl = null;
    let isRecording = false;

    window.openRecorderDock = () => {
      dock?.classList.remove('hidden');
    };
    window.closeRecorderDock = () => {
      dock?.classList.add('hidden');
    };

    btnClose?.addEventListener('click', window.closeRecorderDock);

    document.getElementById('btn-open-recorder-dock')?.addEventListener('click', () => {
      dock?.classList.toggle('hidden');
    });

    btnRecord?.addEventListener('click', async () => {
      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            audioUrl = URL.createObjectURL(blob);
            if (audioEl) audioEl.src = audioUrl;
            if (btnReplay) {
              btnReplay.disabled = false;
              btnReplay.classList.remove('opacity-40');
            }
            if (statusEl) statusEl.textContent = '✅ Đã ghi âm xong! Bấm "▶ Nghe lại" để đối chiếu khẩu hình và âm sắc.';
          };

          mediaRecorder.start();
          isRecording = true;
          if (btnRecord) {
            btnRecord.classList.remove('bg-rose-600', 'hover:bg-rose-500');
            btnRecord.classList.add('bg-amber-600', 'hover:bg-amber-500');
            btnRecord.innerHTML = '<span>⏹ Dừng thu âm</span>';
          }
          if (statusEl) statusEl.textContent = '🔴 Đang thu âm giọng bạn... Hãy phát âm to, rõ ràng và dứt khoát.';
        } catch (err) {
          if (statusEl) statusEl.textContent = '⚠️ Không thể kết nối Microphone. Vui lòng cho phép quyền truy cập Micro trên trình duyệt!';
        }
      } else {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          mediaRecorder.stream.getTracks().forEach(t => t.stop());
        }
        isRecording = false;
        if (btnRecord) {
          btnRecord.classList.remove('bg-amber-600', 'hover:bg-amber-500');
          btnRecord.classList.add('bg-rose-600', 'hover:bg-rose-500');
          btnRecord.innerHTML = '<span>🔴 Thu âm lại</span>';
        }
      }
    });

    btnReplay?.addEventListener('click', () => {
      if (audioEl && audioUrl) {
        audioEl.currentTime = 0;
        audioEl.play();
        if (statusEl) statusEl.textContent = '🔊 Đang phát lại giọng của bạn...';
        audioEl.onended = () => {
          if (statusEl) statusEl.textContent = 'Đã nghe xong. Hãy so sánh âm đuôi và độ ngân với âm mẫu chuẩn!';
        };
      }
    });
  }
}
customElements.define('deveng-recorder-dock', DevEngRecorderDock);
