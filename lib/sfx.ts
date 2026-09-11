// WebAudio sound engine — all effects synthesized, no audio files needed.
// Handles browser autoplay policy: ctx created on first user gesture.

export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = true;

  private ensure(): boolean {
    if (!this.enabled) return false;
    if (!this.ctx) {
      try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx!.createGain();
        this.master.gain.value = 0.35;
        this.master.connect(this.ctx!.destination);
      } catch {
        return false;
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return !!this.ctx;
  }

  private tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 1, delay = 0) {
    if (!this.ensure() || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, vol = 0.3, delay = 0) {
    if (!this.ensure() || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(g);
    g.connect(this.master);
    src.start(t0);
  }

  footstep() {
    this.noise(0.06, 0.12);
  }

  // monitor beep — rate controlled by caller
  monitorBeep(urgent = false) {
    this.tone(urgent ? 988 : 880, 0.09, "sine", 0.5);
  }

  uiClick() {
    this.tone(660, 0.05, "square", 0.15);
  }

  // results are ready — pleasant two-tone
  ding() {
    this.tone(784, 0.12, "sine", 0.6);
    this.tone(1175, 0.15, "sine", 0.5, 0.12);
  }

  // harm state fired — urgent alarm
  alarm() {
    for (let i = 0; i < 3; i++) {
      this.tone(740, 0.14, "square", 0.5, i * 0.22);
      this.tone(554, 0.14, "square", 0.5, i * 0.22 + 0.11);
    }
  }

  success() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => this.tone(f, 0.18, "triangle", 0.55, i * 0.13));
  }

  fail() {
    const notes = [392, 330, 262];
    notes.forEach((f, i) => this.tone(f, 0.25, "sawtooth", 0.4, i * 0.18));
  }

  doorOpen() {
    this.tone(330, 0.1, "triangle", 0.4);
    this.tone(392, 0.12, "triangle", 0.4, 0.1);
  }

  pageSound() {
    this.tone(1047, 0.07, "sine", 0.4);
    this.tone(1047, 0.07, "sine", 0.4, 0.15);
  }
}

export const sfx = new Sfx();
