/**
 * A small generative instrumental, made live with the Web Audio API (no audio
 * files, nothing licensed): a soft four-chord pad, a plucked arpeggio with an
 * echo, and a warm bass, through a short synthetic reverb.
 */

const BPM = 80;
const EIGHTH = 60 / BPM / 2;
/** Fmaj7 → Em7 → Dm7 → Cmaj7, each held for one bar (8 eighths). */
const CHORDS = [
  [53, 57, 60, 64],
  [52, 55, 59, 62],
  [50, 53, 57, 60],
  [48, 52, 55, 59],
];
const ARP = [0, 2, 1, 3, 2, 1, 3, 2];
const VOLUME = 0.32;

const hz = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

export class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private echo: GainNode | null = null;
  private timer = 0;
  private stopTimer = 0;
  private next = 0;
  private step = 0;

  get playing(): boolean {
    return this.timer !== 0;
  }

  private init(): void {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Gentle top-end roll-off so it sits in the background.
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2400;
    tone.connect(master);

    // Synthetic reverb: decaying noise as an impulse response.
    const len = Math.floor(ctx.sampleRate * 2.6);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
    }
    const verb = ctx.createConvolver();
    verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.32;
    verb.connect(wet).connect(tone);

    const bus = ctx.createGain();
    bus.connect(tone);
    bus.connect(verb);

    // Dotted-eighth echo for the arpeggio.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = EIGHTH * 1.5;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const echo = ctx.createGain();
    echo.gain.value = 0.28;
    echo.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(bus);

    this.ctx = ctx;
    this.master = master;
    this.bus = bus;
    this.echo = echo;
  }

  private voice(
    t: number,
    freq: number,
    type: OscillatorType,
    peak: number,
    attack: number,
    hold: number,
    release: number,
    detune = 0,
    toEcho = false,
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.bus) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    osc.connect(g).connect(this.bus);
    if (toEcho && this.echo) g.connect(this.echo);
    osc.start(t);
    osc.stop(t + attack + hold + release + 0.05);
  }

  private schedule = (): void => {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.next < ctx.currentTime + 0.3) {
      const t = this.next;
      const bar = Math.floor(this.step / 8) % CHORDS.length;
      const beat = this.step % 8;
      const chord = CHORDS[bar] ?? CHORDS[0] ?? [];

      if (beat === 0) {
        // Pad: two slightly detuned voices per note, long swell.
        for (const n of chord) {
          this.voice(t, hz(n), "triangle", 0.045, 1.1, EIGHTH * 8 - 1.1, 1.6, -7);
          this.voice(t, hz(n), "sine", 0.04, 1.1, EIGHTH * 8 - 1.1, 1.6, 7);
        }
      }
      if (beat === 0 || beat === 5) {
        this.voice(t, hz((chord[0] ?? 48) - 12), "sine", 0.16, 0.02, 0.1, 1.3);
      }
      // Plucked arpeggio an octave up, softer on the off-beats.
      const note = chord[ARP[beat] ?? 0] ?? 60;
      this.voice(t, hz(note + 12), "sine", beat % 2 ? 0.05 : 0.08, 0.006, 0.02, 0.55, 0, true);

      this.next += EIGHTH;
      this.step++;
    }
  };

  start(): void {
    if (!this.ctx) this.init();
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    window.clearTimeout(this.stopTimer);
    void ctx.resume();
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(VOLUME, now + 1.8);
    if (!this.timer) {
      this.next = now + 0.05;
      this.timer = window.setInterval(this.schedule, 60);
      this.schedule();
    }
  }

  stop(): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.7);
    window.clearInterval(this.timer);
    this.timer = 0;
    this.stopTimer = window.setTimeout(() => void ctx.suspend(), 900);
  }
}
