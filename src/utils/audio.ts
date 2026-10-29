/**
 * Procedural Web Audio API Sound Effects for WILDLANDS
 * Zero external asset dependencies (No 404s)
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  // Play a soft natural footstep (grass / stone crunch)
  public playFootstep(isSprinting: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isSprinting ? 80 : 65, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Play an ethereal mystical relic chime when interacting with an ancient artifact
  public playRelicPickup() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // Arpeggiated resonant chord: D5 (587Hz), F#5 (739Hz), A5 (880Hz), D6 (1174Hz)
      const freqs = [587.33, 739.99, 880.00, 1174.66];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(0, t + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 1.0);
      });
    } catch {
      // safe fallback
    }
  }

  // Heavy ancient stone slab sliding / grinding open
  public playStoneDoorOpen() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(140, t);
      filter.frequency.linearRampToValueAtTime(220, t + 1.2);
      filter.Q.setValueAtTime(3.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 1.5);
    } catch {
      // safe fallback
    }
  }

  // Chest unlock clink & squeak
  public playChestOpen() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(750, t + 0.25);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.36);
    } catch {
      // safe fallback
    }
  }

  // UI / Button click
  public playUiClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // safe fallback
    }
  }

  // Quest completed fanfare
  public playQuestComplete() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A Major triumphant
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.12);

        gain.gain.setValueAtTime(0.01, t + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.14, t + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.12);
        osc.stop(t + idx * 0.12 + 0.8);
      });
    } catch {
      // safe fallback
    }
  }
}

export const soundManager = new SoundManager();
