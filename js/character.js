/**
 * Baby WonderLand - Interactive Mascot Controller ("Pip the 3D Wonder Bear")
 * Rigged Puppet: Face (Head), Eyes, and Body move smoothly according to the magic stick.
 * Action Bar: Plays trimmed CoComelon nursery rhymes (Wheels on the Bus, Baby Shark, Baa Baa Black Sheep)
 * with play/stop toggle behavior and dancing bear animations.
 */

class SongPlayer {
  constructor(mascot) {
    this.mascot = mascot;
    this.audio = new Audio();
    this.currentSongId = null;
    this.isPlaying = false;
    this.danceInterval = null;

    this.songs = {
      wheels_on_the_bus: {
        title: "Wheels on the Bus",
        icon: "🚌",
        src: "assets/audio/wheels_on_the_bus.mp3",
        phrase: "The wheels on the bus go round and round! 🚌🎶"
      },
      baby_shark: {
        title: "Baby Shark",
        icon: "🦈",
        src: "assets/audio/baby_shark.mp3",
        phrase: "Baby Shark, doo doo doo doo doo doo! 🦈🌊"
      },
      baa_baa_black_sheep: {
        title: "Baa Baa Black Sheep",
        icon: "🐑",
        src: "assets/audio/baa_baa_black_sheep.mp3",
        phrase: "Baa baa black sheep, have you any wool? 🐑✨"
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
      // If song is playing and user clicks button -> stop it!
      this.stop();
    } else {
      // Play selected song!
      this.play(songId);
    }
  }

  play(songId) {
    const song = this.songs[songId];
    if (!song) return;

    // Stop any existing playback
    this.audio.pause();
    this.audio.currentTime = 0;

    this.currentSongId = songId;
    this.isPlaying = true;
    this.audio.src = song.src;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Playback gesture note:', err);
      });
    }

    // Trigger visual feedback
    this.updateButtons();
    this.mascot.say(`${song.icon} Now Playing: ${song.title}! 🎶`);
    this.startDancing();

    if (window.particleFX) {
      window.particleFX.burst(window.innerWidth / 2, window.innerHeight * 0.45, 'stars', '#FBBF24');
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
      this.mascot.say(`Music paused! 🎵 Tap any song to play!`);
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

  startDancing() {
    this.stopDancing();
    let beat = 0;
    this.danceInterval = setInterval(() => {
      if (!this.isPlaying) return;
      beat++;
      const sway = (beat % 2 === 0 ? 7 : -7);
      if (this.mascot.head) {
        this.mascot.head.style.transform = `perspective(900px) rotateZ(${sway}deg) translateY(-8px)`;
      }
      if (this.mascot.body) {
        this.mascot.body.style.transform = `rotate(${(-sway * 0.45).toFixed(1)}deg)`;
      }
      // Floating starlight notes during dance
      if (beat % 3 === 0 && window.particleFX) {
        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 220;
        const y = window.innerHeight * 0.42 + (Math.random() - 0.5) * 80;
        window.particleFX.burst(x, y, 'stars', '#FDE047');
      }
    }, 420);
  }

  stopDancing() {
    if (this.danceInterval) {
      clearInterval(this.danceInterval);
      this.danceInterval = null;
    }
    if (this.mascot.head) this.mascot.head.style.transform = '';
    if (this.mascot.body) this.mascot.body.style.transform = '';
  }
}

class MascotController {
  constructor() {
    this.container = document.getElementById('mascot-container');
    this.head = document.getElementById('pip-head');
    this.body = document.getElementById('pip-body');
    this.eyeSocketLeft = document.getElementById('eye-socket-left');
    this.eyeSocketRight = document.getElementById('eye-socket-right');
    this.pupilLeft = document.getElementById('pupil-left');
    this.pupilRight = document.getElementById('pupil-right');
    this.blushLeft = document.getElementById('blush-left');
    this.blushRight = document.getElementById('blush-right');
    this.earLeft = document.getElementById('ear-left');
    this.earRight = document.getElementById('ear-right');
    this.nose = document.getElementById('mascot-nose');
    this.honey = document.getElementById('mascot-honey');
    this.pawLeft = document.getElementById('mascot-paw-left');
    this.pawRight = document.getElementById('mascot-paw-right');
    this.speechBubble = document.getElementById('mascot-speech');

    this.speechTimer = null;
    this.blinkTimer = null;
    this.isGiggling = false;

    // Song Player instance
    this.songPlayer = new SongPlayer(this);

    this.phrases = [
      "Peek-a-boo! 🥰",
      "I see your magic stick! ✨",
      "Giggle giggle! 🐻",
      "High five, baby star! 🌟",
      "Boop my nose! 👃",
      "Tickle my honey pot! 🍯",
      "You're so magical! 🪄",
      "Let's sing nursery rhymes! 🎶"
    ];

    this.init();
  }

  init() {
    if (!this.container) return;

    // Track magic wand / mouse & touch movements across window
    window.addEventListener('mousemove', (e) => this.handlePointerMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Mascot main body click
    this.container.addEventListener('pointerdown', (e) => this.handleMascotClick(e));

    // Ear wiggles
    if (this.earLeft) {
      this.earLeft.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.wiggleEar('left');
      });
    }

    if (this.earRight) {
      this.earRight.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.wiggleEar('right');
      });
    }

    // Nose boop interaction
    if (this.nose) {
      this.nose.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playPop();
        window.babyAudio.playChime(4, 1.4);
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'hearts', '#FF6584');
        }
        this.say("Boop! 👃 You touched my cute button nose! 🥰");
        this.wiggleEar('left');
        this.wiggleEar('right');
      });
    }

    // Honey Pot tummy tickle
    if (this.honey) {
      this.honey.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playGiggle();
        window.babyAudio.playChime(2, 1.2);
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'stars', '#FFD166');
        }
        this.say("Yummy sweet honey! 🍯 Tickle tickle!");
        this.bounce();
      });
    }

    // Paws high-fives
    if (this.pawLeft) {
      this.pawLeft.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playPop();
        window.babyAudio.playChime(5, 1.2);
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'sparkles', '#FF7597');
        }
        this.say("High five, little friend! 🐾");
      });
    }

    if (this.pawRight) {
      this.pawRight.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playPop();
        window.babyAudio.playChime(6, 1.2);
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'sparkles', '#FF7597');
        }
        this.say("High five, baby star! 🌟");
      });
    }

    // Action Bar: 3 Song Buttons
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

    // Start natural blinking routine
    this.scheduleNextBlink();
  }

  handlePointerMove(x, y) {
    if (!this.head || !this.body) return;
    if (this.isGiggling) return;
    // When singing/dancing, only face yaw & pitch react gently
    const isDancing = this.songPlayer && this.songPlayer.isPlaying;

    // Center of the head on screen
    const headRect = this.head.getBoundingClientRect();
    const headCenterX = headRect.left + headRect.width / 2;
    const headCenterY = headRect.top + headRect.height * 0.6;

    // Normalized offset from head center (-1 to +1)
    const normX = Math.max(-1, Math.min(1, (x - headCenterX) / (window.innerWidth / 2.2)));
    const normY = Math.max(-1, Math.min(1, (y - headCenterY) / (window.innerHeight / 2.2)));

    // 1. FACE / HEAD 3D MOVEMENT:
    const yaw = normX * (isDancing ? 12 : 22);
    const pitch = -normY * (isDancing ? 10 : 16);
    const roll = normX * (isDancing ? 4 : 7);
    const neckX = normX * (isDancing ? 6 : 10);
    const neckY = normY * (isDancing ? 4 : 6);

    if (!isDancing) {
      this.head.style.transform = `perspective(900px) translate3d(${neckX.toFixed(1)}px, ${neckY.toFixed(1)}px, 15px) rotateY(${yaw.toFixed(1)}deg) rotateX(${pitch.toFixed(1)}deg) rotateZ(${roll.toFixed(1)}deg)`;

      // 2. BODY GENTLE SWAY:
      const bodyTilt = normX * 4.5;
      const bodyX = normX * 5;
      this.body.style.transform = `rotate(${bodyTilt.toFixed(1)}deg) translateX(${bodyX.toFixed(1)}px)`;
    }

    // 3. EYES PUPIL TRACKING:
    if (this.pupilLeft && this.eyeSocketLeft) {
      this.trackEyeElement(this.pupilLeft, this.eyeSocketLeft, x, y);
    }
    if (this.pupilRight && this.eyeSocketRight) {
      this.trackEyeElement(this.pupilRight, this.eyeSocketRight, x, y);
    }
  }

  trackEyeElement(pupilEl, socketEl, targetX, targetY) {
    const rect = socketEl.getBoundingClientRect();
    const eyeGlobalX = rect.left + rect.width / 2;
    const eyeGlobalY = rect.top + rect.height / 2;

    const dx = targetX - eyeGlobalX;
    const dy = targetY - eyeGlobalY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.hypot(dx, dy);

    // Max travel distance for pupils inside eye socket
    const maxDistance = Math.min(rect.width * 0.26, 6);
    const travel = Math.min(distance / 20, maxDistance);

    const pupilX = Math.cos(angle) * travel;
    const pupilY = Math.sin(angle) * travel;

    pupilEl.style.transform = `translate(${pupilX.toFixed(1)}px, ${pupilY.toFixed(1)}px)`;
  }

  scheduleNextBlink() {
    const delay = 2800 + Math.random() * 3500;
    this.blinkTimer = setTimeout(() => {
      this.blink();
      this.scheduleNextBlink();
    }, delay);
  }

  blink() {
    if (this.isGiggling) return;
    const eyelids = document.querySelectorAll('.pip-eyelid');
    eyelids.forEach(lid => lid.classList.add('closed'));
    setTimeout(() => {
      eyelids.forEach(lid => lid.classList.remove('closed'));
    }, 160);
  }

  wiggleEar(side) {
    window.babyAudio.playChime(side === 'left' ? 3 : 5, 0.9);
    const ear = side === 'left' ? this.earLeft : this.earRight;
    if (ear) {
      ear.style.transform = side === 'left' ? 'scale(1.25) rotate(-16deg)' : 'scale(1.25) rotate(16deg)';
      setTimeout(() => {
        ear.style.transform = '';
      }, 300);
    }
    this.say(side === 'left' ? "My ear tickles! 🐰" : "Wiggle wiggle! ✨");
  }

  bounce() {
    if (!this.head || !this.body) return;
    this.head.style.transition = 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)';
    this.body.style.transition = 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)';

    this.head.style.transform = 'perspective(900px) scale(1.08) translateY(-18px) rotate(3deg)';
    this.body.style.transform = 'scale(1.05) translateY(-10px)';

    setTimeout(() => {
      this.head.style.transform = '';
      this.body.style.transform = '';
      setTimeout(() => {
        this.head.style.transition = '';
        this.body.style.transition = '';
      }, 200);
    }, 380);
  }

  handleMascotClick(e) {
    if (this.isGiggling) return;
    this.isGiggling = true;

    // Trigger baby giggle sound
    window.babyAudio.playGiggle();

    // Trigger heart particle burst at tap location
    const clientX = e.clientX || window.innerWidth / 2;
    const clientY = e.clientY || window.innerHeight / 2;
    if (window.particleFX) {
      window.particleFX.burst(clientX, clientY, 'hearts');
    }

    // Cute blush illumination
    if (this.blushLeft && this.blushRight) {
      this.blushLeft.style.opacity = '1';
      this.blushRight.style.opacity = '1';
      this.blushLeft.style.transform = 'scale(1.4)';
      this.blushRight.style.transform = 'scale(1.4)';
    }

    // Bounce puppet
    this.bounce();

    // Random cute phrase
    const phrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
    this.say(phrase);

    setTimeout(() => {
      if (this.blushLeft && this.blushRight) {
        this.blushLeft.style.opacity = '0';
        this.blushRight.style.opacity = '0';
        this.blushLeft.style.transform = '';
        this.blushRight.style.transform = '';
      }
      this.isGiggling = false;
    }, 950);
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
