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

    // Robot Song Player State (Toggleable background songs for the 6 buttons)
    this.activeRobotSong = null;
    this.robotSongTimer = null;
    this.robotSongStep = 0;
    this.robotSongTimeouts = [];
    this.onRobotSongStep = null;
    this.onRobotSongEnd = null;
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

  /**
   * Play a single synthesizer note with envelope
   */
  playSynthNote(freq, duration = 0.3, type = 'sine', volume = 0.22, detune = 0) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (detune) osc.detune.setValueAtTime(detune, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'square' ? 1800 : 3000, now);

    // Smooth envelope: soft attack, gentle exponential release
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Play or Toggle Songs for the 6 Robot Companion Buttons
   * @param {string} trackId - 'hello' | 'tickle' | 'dance' | 'peekaboo' | 'highfive' | 'lullaby'
   * @param {function} onStep - Callback on each musical note for dancing / visualizer
   * @param {function} onEnd - Callback when song ends
   */
  playRobotSong(trackId, onStep = null, onEnd = null) {
    this.ensureContext();
    this.stopRobotSong();

    this.activeRobotSong = trackId;
    this.onRobotSongStep = onStep;
    this.onRobotSongEnd = onEnd;
    this.robotSongStep = 0;

    // Note frequencies table
    const N = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
      C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98
    };

    // Score sheets for the 6 songs
    const songs = {
      // 1. Say Hello: Welcoming, joyful sunbeam melody
      hello: {
        tempo: 260,
        loop: true,
        notes: [
          { freq: N.C5, dur: 0.28, type: 'triangle' },
          { freq: N.E5, dur: 0.28, type: 'sine' },
          { freq: N.G5, dur: 0.32, type: 'triangle' },
          { freq: N.C6, dur: 0.55, type: 'sine' },
          { freq: N.G5, dur: 0.28, type: 'triangle' },
          { freq: N.A5, dur: 0.32, type: 'sine' },
          { freq: N.F5, dur: 0.28, type: 'triangle' },
          { freq: N.G5, dur: 0.55, type: 'sine' },
          { freq: N.E5, dur: 0.28, type: 'triangle' },
          { freq: N.F5, dur: 0.28, type: 'sine' },
          { freq: N.D5, dur: 0.35, type: 'triangle' },
          { freq: N.C5, dur: 0.70, type: 'sine' }
        ]
      },
      // 2. Tickle Me: Staccato, giggly, bouncing melody with cute chirp intervals
      tickle: {
        tempo: 160,
        loop: true,
        notes: [
          { freq: N.G5, dur: 0.14, type: 'square' },
          { freq: N.E5, dur: 0.14, type: 'triangle' },
          { freq: N.G5, dur: 0.14, type: 'square' },
          { freq: N.A5, dur: 0.18, type: 'triangle' },
          { freq: N.G5, dur: 0.14, type: 'square' },
          { freq: N.C6, dur: 0.28, type: 'sine' },
          { freq: N.A5, dur: 0.14, type: 'triangle' },
          { freq: N.G5, dur: 0.16, type: 'square' },
          { freq: N.E5, dur: 0.14, type: 'triangle' },
          { freq: N.D5, dur: 0.18, type: 'square' },
          { freq: N.C5, dur: 0.32, type: 'sine' },
          { freq: N.E5, dur: 0.14, type: 'triangle' }
        ]
      },
      // 3. Dance Party: Catchy, syncopated electronic funk groove with bass and upbeat leads
      dance: {
        tempo: 190,
        loop: true,
        notes: [
          { freq: N.C4, dur: 0.22, type: 'triangle', bass: true },
          { freq: N.C5, dur: 0.18, type: 'square' },
          { freq: N.E5, dur: 0.18, type: 'sine' },
          { freq: N.G5, dur: 0.22, type: 'square' },
          { freq: N.A5, dur: 0.22, type: 'sine' },
          { freq: N.G4, dur: 0.22, type: 'triangle', bass: true },
          { freq: N.G5, dur: 0.18, type: 'square' },
          { freq: N.F5, dur: 0.18, type: 'sine' },
          { freq: N.E5, dur: 0.22, type: 'square' },
          { freq: N.D5, dur: 0.22, type: 'sine' },
          { freq: N.F4, dur: 0.22, type: 'triangle', bass: true },
          { freq: N.A4, dur: 0.18, type: 'square' },
          { freq: N.C5, dur: 0.18, type: 'sine' },
          { freq: N.E5, dur: 0.24, type: 'square' },
          { freq: N.D5, dur: 0.18, type: 'sine' },
          { freq: N.C5, dur: 0.45, type: 'square' }
        ]
      },
      // 4. Peekaboo: Playful mystery ascending scale followed by bright celebratory fanfare
      peekaboo: {
        tempo: 280,
        loop: true,
        notes: [
          { freq: N.C5, dur: 0.22, type: 'triangle' },
          { freq: N.D5, dur: 0.22, type: 'sine' },
          { freq: N.E5, dur: 0.25, type: 'triangle' },
          { freq: N.F5, dur: 0.25, type: 'sine' },
          { freq: N.G5, dur: 0.30, type: 'triangle' },
          { freq: N.A5, dur: 0.45, type: 'sine' },
          // Dramatic pause
          { freq: 0, dur: 0.35, type: 'rest' },
          // "PEEKABOO!"
          { freq: N.C6, dur: 0.45, type: 'square' },
          { freq: N.G5, dur: 0.25, type: 'sine' },
          { freq: N.E5, dur: 0.25, type: 'triangle' },
          { freq: N.C6, dur: 0.65, type: 'sine' }
        ]
      },
      // 5. High Five: Heroic, celebratory victory fanfare
      highfive: {
        tempo: 220,
        loop: true,
        notes: [
          { freq: N.G4, dur: 0.16, type: 'triangle' },
          { freq: N.C5, dur: 0.16, type: 'square' },
          { freq: N.E5, dur: 0.18, type: 'triangle' },
          { freq: N.G5, dur: 0.32, type: 'square' },
          { freq: N.E5, dur: 0.16, type: 'triangle' },
          { freq: N.G5, dur: 0.22, type: 'square' },
          { freq: N.C6, dur: 0.60, type: 'sine' },
          { freq: N.B5, dur: 0.20, type: 'triangle' },
          { freq: N.C6, dur: 0.80, type: 'sine' }
        ]
      },
      // 6. Lullaby: Soothing, gentle bedtime music box
      lullaby: {
        tempo: 580,
        loop: true,
        notes: [
          { freq: N.C5, dur: 0.9, type: 'sine' },
          { freq: N.C5, dur: 0.9, type: 'sine' },
          { freq: N.G5, dur: 0.9, type: 'sine' },
          { freq: N.G5, dur: 0.9, type: 'sine' },
          { freq: N.A5, dur: 0.9, type: 'sine' },
          { freq: N.A5, dur: 0.9, type: 'sine' },
          { freq: N.G5, dur: 1.4, type: 'sine' },
          { freq: N.F5, dur: 0.9, type: 'sine' },
          { freq: N.F5, dur: 0.9, type: 'sine' },
          { freq: N.E5, dur: 0.9, type: 'sine' },
          { freq: N.E5, dur: 0.9, type: 'sine' },
          { freq: N.D5, dur: 0.9, type: 'sine' },
          { freq: N.D5, dur: 0.9, type: 'sine' },
          { freq: N.C5, dur: 1.6, type: 'sine' }
        ]
      }
    };

    const song = songs[trackId] || songs.hello;

    const playStep = () => {
      if (this.activeRobotSong !== trackId) return;

      const idx = this.robotSongStep % song.notes.length;
      const note = song.notes[idx];

      if (note && note.type !== 'rest' && note.freq > 0) {
        this.playSynthNote(note.freq, note.dur, note.type, note.bass ? 0.32 : 0.22);
      }

      if (this.onRobotSongStep) {
        this.onRobotSongStep(trackId, this.robotSongStep, note);
      }

      this.robotSongStep++;

      // Check if finished and whether to loop or end
      if (this.robotSongStep >= song.notes.length && !song.loop) {
        this.stopRobotSong();
        if (this.onRobotSongEnd) this.onRobotSongEnd(trackId);
        return;
      }

      this.robotSongTimer = setTimeout(playStep, song.tempo);
    };

    playStep();
    return true;
  }

  /**
   * Stop any active Robot Song
   */
  stopRobotSong() {
    if (this.robotSongTimer) {
      clearTimeout(this.robotSongTimer);
      this.robotSongTimer = null;
    }
    this.robotSongTimeouts.forEach(t => clearTimeout(t));
    this.robotSongTimeouts = [];

    const stoppedTrack = this.activeRobotSong;
    this.activeRobotSong = null;

    if (this.onRobotSongEnd && stoppedTrack) {
      this.onRobotSongEnd(stoppedTrack);
    }
    return stoppedTrack;
  }

  /**
   * Check if a specific track (or any track) is currently playing
   */
  isRobotSongPlaying(trackId = null) {
    if (!this.activeRobotSong) return false;
    return trackId ? this.activeRobotSong === trackId : true;
  }
}

// Global instance
window.babyAudio = new BabyAudioEngine();
