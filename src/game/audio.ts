export class GameAudio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  music: GainNode | null = null;
  sfx: GainNode | null = null;
  muted = false;
  private drone: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private heart: number | null = null;
  private lastStep = 0;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music.gain.value = 0.22;
      this.sfx.gain.value = 0.55;
      this.master.gain.value = this.muted ? 0 : 1;
      this.music.connect(this.master);
      this.sfx.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.startDrone();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.03);
    }
  }

  private startDrone() {
    if (!this.ctx || !this.music) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 46;
    g.gain.value = 0.08;
    osc.connect(g);
    g.connect(this.music);
    osc.start();
    this.drone = osc;
    this.droneGain = g;
  }

  setTension(t: number, spotted: boolean) {
    if (!this.ctx || !this.drone || !this.droneGain) return;
    const now = this.ctx.currentTime;
    this.drone.frequency.setTargetAtTime(46 + t * 38 + (spotted ? 20 : 0), now, 0.12);
    this.droneGain.gain.setTargetAtTime(0.06 + t * 0.12, now, 0.12);
  }

  foot(xPan: number, sprint: boolean) {
    if (!this.ctx || !this.sfx) return;
    const now = this.ctx.currentTime;
    const gap = sprint ? 0.22 : 0.38;
    if (now - this.lastStep < gap) return;
    this.lastStep = now;
    const buf = this.noise(0.06);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(sprint ? 0.22 : 0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    const pan = this.ctx.createStereoPanner();
    pan.pan.value = Math.max(-0.8, Math.min(0.8, xPan));
    src.connect(g);
    g.connect(pan);
    pan.connect(this.sfx);
    src.start();
  }

  sting() {
    if (!this.ctx || !this.sfx) return;
    const now = this.ctx.currentTime;
    for (const f of [220, 233]) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f, now);
      o.frequency.exponentialRampToValueAtTime(90, now + 0.4);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      o.connect(g);
      g.connect(this.sfx);
      o.start();
      o.stop(now + 0.5);
    }
  }

  pickup() {
    this.blip(880, 0.12, "square");
  }

  win() {
    this.blip(523, 0.18, "triangle");
    setTimeout(() => this.blip(659, 0.2, "triangle"), 90);
    setTimeout(() => this.blip(784, 0.28, "triangle"), 180);
  }

  caught() {
    if (!this.ctx || !this.sfx) return;
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(140, now);
    o.frequency.exponentialRampToValueAtTime(40, now + 0.8);
    g.gain.setValueAtTime(0.28, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    o.connect(g);
    g.connect(this.sfx);
    o.start();
    o.stop(now + 0.9);
  }

  private blip(freq: number, dur: number, type: OscillatorType) {
    if (!this.ctx || !this.sfx) return;
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.16, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.connect(g);
    g.connect(this.sfx);
    o.start();
    o.stop(now + dur + 0.02);
  }

  private noise(dur: number) {
    const ctx = this.ctx!;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
}

export const audio = new GameAudio();
