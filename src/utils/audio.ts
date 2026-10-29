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

  // Surface-specific randomized footstep synthesizer (Grass, Stone, Water, Wood)
  public playSurfaceFootstep(
    surface: 'Grass' | 'Stone' | 'Water' | 'Wood' = 'Grass',
    isSprinting: boolean = false,
    foot: 'Left' | 'Right' = 'Left'
  ) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // Procedural pitch and volume jitter (analogous to UE5 MetaSound / SoundCue randomizer)
      const pitchJitter = 0.92 + Math.random() * 0.16; // ±8% pitch variation
      const volJitter = 0.90 + Math.random() * 0.15;
      const baseVol = (isSprinting ? 0.08 : 0.05) * volJitter;
      const footPitchMod = foot === 'Left' ? 1.0 : 0.96; // subtle left/right asymmetry

      if (surface === 'Stone') {
        // CRISP GRANITE / RUINS CLICK + SLIGHT RESONANCE
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        const startFreq = (isSprinting ? 280 : 220) * pitchJitter * footPitchMod;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(160, t);

        gain.gain.setValueAtTime(baseVol * 1.2, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

        // Stone tap noise transient
        const noiseBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.03), this.ctx.sampleRate);
        const noiseData = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / 150);
        }
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(baseVol * 0.8, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noiseSrc.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.08);
        noiseSrc.start(t);
        noiseSrc.stop(t + 0.04);
      } else if (surface === 'Water') {
        // LIQUID SPLASH + DROPLET TRANSIENT
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450 * pitchJitter, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

        gain.gain.setValueAtTime(baseVol * 0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

        const noiseBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.1), this.ctx.sampleRate);
        const noiseData = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
        }
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100 * pitchJitter, t);
        filter.Q.setValueAtTime(2.0, t);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(baseVol * 0.9, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        noiseSrc.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.14);
        noiseSrc.start(t);
        noiseSrc.stop(t + 0.12);
      } else if (surface === 'Wood') {
        // HOLLOW WOODEN THUD
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180 * pitchJitter * footPitchMod, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.09);

        gain.gain.setValueAtTime(baseVol * 1.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.11);
      } else {
        // SOFT FOREST GRASS / DAMP EARTH CRUNCH
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        const startFreq = (isSprinting ? 95 : 75) * pitchJitter * footPitchMod;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380 * pitchJitter, t);

        gain.gain.setValueAtTime(baseVol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.1);
      }
    } catch {
      // AudioContext policy fallback
    }
  }

  // Play a soft natural footstep (compatibility fallback)
  public playFootstep(isSprinting: boolean = false) {
    this.playSurfaceFootstep('Grass', isSprinting, 'Left');
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
