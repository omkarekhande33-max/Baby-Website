/**
 * Baby WonderLand - Interactive Mascot Controller ("Pip the Dancing Cartoon Wonder Bear")
 * Clean, Simple & Highly Engaging:
 * 1. Follows the Magic Stick / Cursor with fluid, expressive 3D perspective spring physics.
 * 2. Joyfully dances when any nursery rhyme song is played (Baby Shark, Wheels on the Bus, Baa Baa Black Sheep).
 * 3. Streams colorful floating musical notes and stars while dancing.
 * 4. Taps & clicks trigger cheerful giggles, heart bursts, and playful hop-bounces.
 */

class SongPlayer {
  constructor(mascot) {
    this.mascot = mascot;
    this.audio = new Audio();
    this.currentSongId = null;
    this.isPlaying = false;
    this.noteEmitterInterval = null;

    this.songs = {
      wheels_on_the_bus: {
        title: "Wheels on the Bus",
        icon: "🚌",
        src: "assets/audio/wheels_on_the_bus.mp3",
        phrase: "The wheels on the bus go round and round! 🚌🎶",
        danceClass: "dance-bus"
      },
      baby_shark: {
        title: "Baby Shark",
        icon: "🦈",
        src: "assets/audio/baby_shark.mp3",
        phrase: "Baby Shark, doo doo doo doo doo doo! 🦈🌊",
        danceClass: "dance-shark"
      },
      baa_baa_black_sheep: {
        title: "Baa Baa Black Sheep",
        icon: "🐑",
        src: "assets/audio/baa_baa_black_sheep.mp3",
        phrase: "Baa baa black sheep, have you any wool? 🐑✨",
        danceClass: "dance-sheep"
      }
    };

    this.audio.addEventListener('ended', () => {
      this.stop();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback notice:', e);
      this.stop();
    });
  }

  toggle(songId) {
    if (this.isPlaying && this.currentSongId === songId) {
      // Toggle off when current song is clicked again
      this.stop();
    } else {
      // Play selected song
      this.play(songId);
    }
  }

  play(songId) {
    const song = this.songs[songId];
    if (!song) return;

    // Reset current audio playback
    this.audio.pause();
    this.audio.currentTime = 0;

    this.currentSongId = songId;
    this.isPlaying = true;
    this.audio.src = song.src;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Audio playback interaction note:', err);
      });
    }

    // Update buttons & speech
    this.updateButtons();
    this.mascot.say(`${song.icon} Now Dancing: ${song.title}! 🎶`);
    this.startDancing(song);

    if (window.particleFX) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.45;
      window.particleFX.burst(cx, cy, 'stars', '#FBBF24');
      window.particleFX.burst(cx, cy, 'confetti', '#FF4081');
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    const stoppedSong = this.songs[this.currentSongId];
    this.isPlaying = false;
    this.currentSongId = null;

    this.updateButtons();
    this.stopDancing();

    if (stoppedSong) {
      this.mascot.say(`Music paused! 🎵 Tap any song to dance!`);
    }
  }

  updateButtons() {
    ['wheels_on_the_bus', 'baby_shark', 'baa_baa_black_sheep'].forEach(id => {
      const btn = document.querySelector(`[data-song="${id}"]`);
      if (!btn) return;
      const badge = btn.querySelector('.song-state-badge');
      if (this.isPlaying && this.currentSongId === id) {
        btn.classList.add('is-playing');
        if (badge) badge.textContent = '⏹ Stop';
      } else {
        btn.classList.remove('is-playing');
        if (badge) badge.textContent = '▶';
      }
    });
  }

  startDancing(song) {
    this.stopDancing();

    if (!this.mascot.container) return;

    // Apply active dance classes to trigger energetic 60fps CSS animation
    this.mascot.container.classList.add('is-dancing');
    this.mascot.container.classList.add(song.danceClass);

    // Fast dynamic floating musical notes emitter (every 220ms)
    const notes = ['🎵', '🎶', '🎼', '🌟', '✨', '💖', '⭐', '🎈'];
    const colors = ['#FF4081', '#FFB703', '#06D6A0', '#118AB2', '#8338EC', '#FF006E', '#3A86FF'];
    let beatCount = 0;

    this.noteEmitterInterval = setInterval(() => {
      if (!this.isPlaying) return;
      beatCount++;

      this.emitMusicNote(notes, colors);

      // Periodic celebratory stardust burst
      if (beatCount % 4 === 0 && window.particleFX) {
        const stageRect = this.mascot.container.getBoundingClientRect();
        const randX = stageRect.left + stageRect.width * (0.2 + Math.random() * 0.6);
        const randY = stageRect.top + stageRect.height * (0.2 + Math.random() * 0.5);
        window.particleFX.burst(randX, randY, beatCount % 8 === 0 ? 'stars' : 'sparkles');
      }
    }, 220);
  }

  emitMusicNote(notes, colors) {
    if (!this.mascot.notesContainer) return;

    const note = document.createElement('div');
    note.className = 'pip-floating-note';
    note.textContent = notes[Math.floor(Math.random() * notes.length)];

    const color = colors[Math.floor(Math.random() * colors.length)];
    note.style.color = color;
    note.style.textShadow = `0 0 14px ${color}`;

    // Randomize initial position around bear's chest and paws
    const startLeft = 15 + Math.random() * 70;
    const startTop = 30 + Math.random() * 40;
    const driftX = (Math.random() - 0.5) * 120;
    const rot = (Math.random() - 0.5) * 50;

    note.style.left = `${startLeft}%`;
    note.style.top = `${startTop}%`;
    note.style.setProperty('--note-drift-x', `${driftX}px`);
    note.style.setProperty('--note-rot', `${rot}deg`);

    this.mascot.notesContainer.appendChild(note);

    setTimeout(() => {
      if (note.parentNode) {
        note.parentNode.removeChild(note);
      }
    }, 1300);
  }

  stopDancing() {
    if (this.noteEmitterInterval) {
      clearInterval(this.noteEmitterInterval);
      this.noteEmitterInterval = null;
    }

    if (this.mascot.container) {
      this.mascot.container.classList.remove('is-dancing', 'dance-bus', 'dance-shark', 'dance-sheep');
    }

    if (this.mascot.notesContainer) {
      this.mascot.notesContainer.innerHTML = '';
    }
  }
}

class MascotController {
  constructor() {
    this.container = document.getElementById('mascot-container');
    this.stage = document.getElementById('pip-character');
    this.img = document.getElementById('pip-bear-img');
    this.notesContainer = document.getElementById('pip-music-notes');
    this.speechBubble = document.getElementById('mascot-speech');

    // Backward compatibility aliases
    this.head = this.stage;
    this.body = this.stage;

    this.speechTimer = null;
    this.isBouncing = false;

    // 60 FPS Physics & Motion Tracking
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.targetRoll = 0;
    this.targetX = 0;
    this.targetY = 0;

    this.currentYaw = 0;
    this.currentPitch = 0;
    this.currentRoll = 0;
    this.currentX = 0;
    this.currentY = 0;

    // Song Player instance
    this.songPlayer = new SongPlayer(this);

    this.phrases = [
      "Peek-a-boo! 🥰",
      "I follow your magic stick! ✨",
      "Giggle giggle! 🐻",
      "Give me a high-five! 🐾",
      "Let's dance together! 🎶",
      "You're so magical! 🪄",
      "Tap any song to watch me dance! 💃",
      "I love singing with you! 🌟"
    ];

    this.init();
    this.startRenderLoop();
  }

  init() {
    if (!this.container) return;

    // Expressive Magic Stick / Mouse & Touch Tracking
    window.addEventListener('mousemove', (e) => this.handlePointerMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Mascot click / tap
    this.container.addEventListener('pointerdown', (e) => this.handleMascotClick(e));

    // Song Action Buttons
    document.querySelectorAll('.song-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = btn.getAttribute('data-song');
        if (songId) {
          this.songPlayer.toggle(songId);
        }
      });
    });

    // Floating Interactive Bubbles popping
    document.querySelectorAll('.floating-bubble').forEach((bubble, idx) => {
      bubble.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playPop();
        window.babyAudio.playChime(idx * 2 + 1, 1.3);
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'sparkles', '#38BDF8');
        }
        bubble.style.transform = 'scale(0)';
        setTimeout(() => {
          bubble.style.transform = '';
        }, 1800);
      });
    });

    // Floating Starlight Orbs
    document.querySelectorAll('.floating-star-orb').forEach((star, idx) => {
      star.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playChime(idx * 3 + 2, 1.5);
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'stars', '#F59E0B');
        }
        this.say("Twinkling star! ✨ Catch the dream!");
      });
    });
  }

  handlePointerMove(clientX, clientY) {
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * 0.45;

    // Normalized coordinates (-1 to 1)
    const normX = Math.max(-1, Math.min(1, (clientX - centerX) / (window.innerWidth * 0.45)));
    const normY = Math.max(-1, Math.min(1, (clientY - centerY) / (window.innerHeight * 0.45)));

    const isDancing = this.songPlayer && this.songPlayer.isPlaying;

    // Expressive 3D Euler angles & translation towards the magic stick
    this.targetYaw = normX * (isDancing ? 12 : 22);      // Head & body turn left/right
    this.targetPitch = -normY * (isDancing ? 8 : 16);   // Look up/down
    this.targetRoll = normX * (isDancing ? 4 : 7);       // Cute playful tilt
    this.targetX = normX * (isDancing ? 12 : 32);        // Translate towards stick
    this.targetY = normY * (isDancing ? 6 : 18);
  }

  startRenderLoop() {
    const loop = () => {
      // Smooth spring lerp physics (fast 0.16 factor)
      const lerp = 0.16;
      this.currentYaw += (this.targetYaw - this.currentYaw) * lerp;
      this.currentPitch += (this.targetPitch - this.currentPitch) * lerp;
      this.currentRoll += (this.targetRoll - this.currentRoll) * lerp;
      this.currentX += (this.targetX - this.currentX) * lerp;
      this.currentY += (this.targetY - this.currentY) * lerp;

      const isDancing = this.songPlayer && this.songPlayer.isPlaying;

      if (this.container && !this.isBouncing) {
        if (!isDancing) {
          // Full 3D motion following the magic wand
          this.container.style.transform = `perspective(1000px) rotateY(${this.currentYaw.toFixed(2)}deg) rotateX(${this.currentPitch.toFixed(2)}deg) rotateZ(${this.currentRoll.toFixed(2)}deg) translate3d(${this.currentX.toFixed(1)}px, ${this.currentY.toFixed(1)}px, 0)`;
        } else {
          // When dancing, combine dance bounce with smooth leaning towards magic stick
          this.container.style.transform = `perspective(1000px) rotateY(${(this.currentYaw * 0.4).toFixed(2)}deg) translate3d(${(this.currentX * 0.4).toFixed(1)}px, 0, 0)`;
        }
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  bounceQuick() {
    if (!this.stage) return;
    this.stage.classList.remove('bouncing');
    void this.stage.offsetWidth; // trigger reflow
    this.stage.classList.add('bouncing');

    setTimeout(() => {
      this.stage.classList.remove('bouncing');
    }, 380);
  }

  handleMascotClick(e) {
    if (this.isBouncing) return;
    this.isBouncing = true;

    // Trigger cheerful sound
    window.babyAudio.playGiggle();
    window.babyAudio.playPop();

    // Trigger heart & star bursts at click location
    const clientX = e.clientX || window.innerWidth / 2;
    const clientY = e.clientY || window.innerHeight / 2;
    if (window.particleFX) {
      window.particleFX.burst(clientX, clientY, 'hearts');
      window.particleFX.burst(clientX, clientY, 'stars', '#FBBF24');
    }

    // Playful quick bounce
    this.bounceQuick();

    // Random cheerful phrase
    const phrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
    this.say(phrase);

    setTimeout(() => {
      this.isBouncing = false;
    }, 500);
  }

  say(text) {
    if (!this.speechBubble) return;
    this.speechBubble.textContent = text;
    this.speechBubble.classList.add('visible');

    if (this.speechTimer) clearTimeout(this.speechTimer);
    this.speechTimer = setTimeout(() => {
      this.speechBubble.classList.remove('visible');
    }, 2800);
  }
}

window.MascotController = MascotController;
