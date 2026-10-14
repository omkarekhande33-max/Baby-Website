/**
 * Baby WonderLand - Web Audio Engine
 * Pure mathematical sound synthesis for baby-safe, warm, gentle frequencies.
 * Zero external audio dependencies.
 */

class BabyAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.isMuted = false;
    this.volume = 0.65;
    this.isLullabyPlaying = false;
    this.lullabyTimer = null;
    this.lullabyStep = 0;

    // Soothing Pentatonic Frequencies (C Major Pentatonic across 2 octaves)
    // C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6
    this.pentatonicScale = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00, 1046.50
    ];

    // Twinkle Twinkle / Lullaby melody note indexes in pentatonic scale
    this.lullabyNotes = [
      0, 0, 4, 4, 5, 5, 4, // Twinkle twinkle little star
      3, 3, 2, 2, 1, 1, 0, // How I wonder what you are
      4, 4, 3, 3, 2, 2, 1, // Up above the world so high
      4, 4, 3, 3, 2, 2, 1, // Like a diamond in the sky
      0, 0, 4, 4, 5, 5, 4, // Twinkle twinkle little star
      3, 3, 2, 2, 1, 1, 0  // How I wonder what you are
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // Master Dynamics Compressor to guarantee safe, comfortable decibels for babies
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  /**
   * Play a heavenly, soft pentatonic chime note
   * @param {number|null} scaleIndex - Index in pentatonic scale, or random if omitted
   * @param {number} duration - note sustain duration
   */
  playChime(scaleIndex = null, duration = 1.4) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const idx = scaleIndex !== null 
      ? Math.abs(scaleIndex) % this.pentatonicScale.length 
      : Math.floor(Math.random() * this.pentatonicScale.length);
    const freq = this.pentatonicScale[idx];

    const now = this.ctx.currentTime;

    // Dual oscillator: sine fundamental + warm triangle harmonic (music box / celesta)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now); // Sweet upper harmonic

    // Warm Low-pass filter to keep sound rounded and gentle
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    // Envelope: instant soft attack, gentle bell-like exponential decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  /**
   * Play an upward arpeggio of chimes (for swipes, bursts, achievements)
   */
  playArpeggio(startIdx = 0, count = 4, intervalMs = 90) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playChime((startIdx + i) % this.pentatonicScale.length, 1.2);
      }, i * intervalMs);
    }
  }

  /**
   * Bubble / Balloon Pop sound
   */
  playPop() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency sweeps down rapidly for cartoon pop
    osc.frequency.setValueAtTime(800 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Cheerful bicycle bell "Ding-Ding!" for the Lightning Trike
   */
  playBell() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const ring = (timeOffset, freq) => {
      const t = this.ctx.currentTime + timeOffset;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.76, t); // Metallic clang ratio

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.compressor);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.55);
      osc2.stop(t + 0.55);
    };

    ring(0, 1568);     // First bell ding (G6)
    ring(0.12, 1760);  // Second bell ding (A6)
  }

  /**
   * Trike bouncy jump sound
   */
  playJump() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.22);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Joyful Baby Giggle Synthesizer
   */
  playGiggle() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const bursts = 4;
    for (let i = 0; i < bursts; i++) {
      const delay = i * 0.11;
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const startPitch = 500 + i * 40;
        osc.frequency.setValueAtTime(startPitch, t);
        osc.frequency.linearRampToValueAtTime(startPitch + 150, t + 0.05);
        osc.frequency.linearRampToValueAtTime(startPitch + 50, t + 0.09);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(gain);
        gain.connect(this.compressor);

        osc.start(t);
        osc.stop(t + 0.09);
      }, delay * 1000);
    }
  }

  /**
   * Robot bleeps and bloops
   */
  playRobotBleep(mood = 'happy') {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const pitches = mood === 'happy' 
      ? [523, 659, 784, 1046]
      : mood === 'curious'
      ? [440, 554, 880]
      : mood === 'love'
      ? [392, 523, 659, 784]
      : [350, 440, 523];

    pitches.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square'; // Classic retro friendly robot tone
        osc.frequency.setValueAtTime(freq, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor);

        osc.start(t);
        osc.stop(t + 0.1);
      }, idx * 75);
    });
  }

  /**
   * Continuous Music Box Lullaby (Calm, Sleepy, Pentatonic)
   */
  toggleLullaby() {
    this.ensureContext();
    this.isLullabyPlaying = !this.isLullabyPlaying;

    if (this.isLullabyPlaying) {
      this.lullabyStep = 0;
      this.playNextLullabyNote();
    } else {
      if (this.lullabyTimer) {
        clearTimeout(this.lullabyTimer);
        this.lullabyTimer = null;
      }
    }
    return this.isLullabyPlaying;
  }

  playNextLullabyNote() {
    if (!this.isLullabyPlaying) return;

    const noteIdx = this.lullabyNotes[this.lullabyStep % this.lullabyNotes.length];
    this.playChime(noteIdx, 1.8);

    this.lullabyStep++;
    // Gentle lullaby tempo (650ms per beat)
    this.lullabyTimer = setTimeout(() => {
      this.playNextLullabyNote();
    }, 650);
  }
}

// Global instance
window.babyAudio = new BabyAudioEngine();
