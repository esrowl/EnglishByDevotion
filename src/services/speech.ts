/**
 * Speech synthesis utility for native English word and sentence pronunciation.
 * Offline availability depends on installed browser/OS voices.
 */
class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private finishCurrent: (() => void) | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public speak(text: string, rate: number = 0.9): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.stop(); // Also settle the previous button's pending promise.

      const utterance = new SpeechSynthesisUtterance(text);
      this.utterance = utterance;
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick best English voice if available (e.g. Samantha, Daniel, Google US/UK)
      if (this.voices.length === 0) {
        this.voices = this.synth.getVoices();
      }

      const preferredVoice = this.voices.find(
        (v) =>
          (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) &&
          (v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Daniel'))
      ) || this.voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      const timeout = window.setTimeout(() => { this.stop(); }, Math.max(15000, text.length * 150));
      const finish = () => {
        window.clearTimeout(timeout);
        if (this.finishCurrent === finish) { this.finishCurrent = null; this.utterance = null; }
        resolve();
      };
      this.finishCurrent = finish;
      utterance.onend = finish;
      utterance.onerror = finish;
      try { this.synth.speak(utterance); } catch { finish(); }
    });
  }

  public stop() {
    this.finishCurrent?.();
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
