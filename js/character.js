/**
 * Baby WonderLand - Interactive Mascot Controller ("Pip the 3D Wonder Bear")
 * Rigged Puppet: Face (Head), Eyes, and Body move smoothly according to the magic stick.
 */

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

    // Action bar buttons
    this.tickleBtn = document.getElementById('mascot-tickle-btn');
    this.singBtn = document.getElementById('mascot-sing-btn');
    this.peekBtn = document.getElementById('mascot-peek-btn');

    this.speechTimer = null;
    this.blinkTimer = null;
    this.isGiggling = false;
    this.isSinging = false;

    this.phrases = [
      "Peek-a-boo! 🥰",
      "I see your magic stick! ✨",
      "Giggle giggle! 🐻",
      "High five, baby star! 🌟",
      "Boop my nose! 👃",
      "Tickle my honey pot! 🍯",
      "You're so magical! 🪄",
      "Yay, let's play! 🎈"
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

    // Action Bar: Tickle Pip
    if (this.tickleBtn) {
      this.tickleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleMascotClick(e);
      });
    }

    // Action Bar: Sing a Song
    if (this.singBtn) {
      this.singBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.singSong();
      });
    }

    // Action Bar: Peek-a-boo!
    if (this.peekBtn) {
      this.peekBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.peekABoo();
      });
    }

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
    if (this.isGiggling || this.isSinging) return;

    // Center of the head on screen
    const headRect = this.head.getBoundingClientRect();
    const headCenterX = headRect.left + headRect.width / 2;
    const headCenterY = headRect.top + headRect.height * 0.6;

    // Normalized offset from head center (-1 to +1)
    const normX = Math.max(-1, Math.min(1, (x - headCenterX) / (window.innerWidth / 2.2)));
    const normY = Math.max(-1, Math.min(1, (y - headCenterY) / (window.innerHeight / 2.2)));

    // 1. FACE / HEAD 3D MOVEMENT:
    // Face turns left/right (yaw): up to ±22°
    const yaw = normX * 22;
    // Face looks up/down (pitch): when wand is up (normY negative), face looks up
    const pitch = -normY * 16;
    // Cute baby head tilt (roll): up to ±7°
    const roll = normX * 7;
    // Subtle neck translation towards wand tip
    const neckX = normX * 10;
    const neckY = normY * 6;

    this.head.style.transform = `perspective(900px) translate3d(${neckX.toFixed(1)}px, ${neckY.toFixed(1)}px, 15px) rotateY(${yaw.toFixed(1)}deg) rotateX(${pitch.toFixed(1)}deg) rotateZ(${roll.toFixed(1)}deg)`;

    // 2. BODY GENTLE SWAY:
    // Torso leans subtly with baby weight (about 1/4th of head angle)
    const bodyTilt = normX * 4.5;
    const bodyX = normX * 5;
    this.body.style.transform = `rotate(${bodyTilt.toFixed(1)}deg) translateX(${bodyX.toFixed(1)}px)`;

    // 3. EYES PUPIL TRACKING:
    // Pupils calculate direct trigonometry toward the magic stick tip
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

  singSong() {
    if (this.isSinging) return;
    this.isSinging = true;

    this.say("Lullaby dreams! 🎵 Sing with me!");
    if (window.particleFX) {
      window.particleFX.burst(window.innerWidth / 2, window.innerHeight * 0.45, 'stars', '#FBBF24');
    }

    // Melodic notes sequence
    const notes = [1, 3, 5, 6, 5, 3, 1];
    notes.forEach((note, i) => {
      setTimeout(() => {
        window.babyAudio.playChime(note, 1.2);
        // Head sways to the music
        if (this.head) {
          const sway = (i % 2 === 0 ? 8 : -8);
          this.head.style.transform = `perspective(900px) rotateZ(${sway}deg) translateY(-8px)`;
        }
      }, i * 360);
    });

    setTimeout(() => {
      if (this.head) this.head.style.transform = '';
      this.isSinging = false;
    }, notes.length * 360 + 400);
  }

  peekABoo() {
    if (!this.head) return;
    this.isGiggling = true;

    // Cover eyes / duck down
    const eyelids = document.querySelectorAll('.pip-eyelid');
    eyelids.forEach(lid => lid.classList.add('closed'));
    this.head.style.transition = 'transform 0.3s ease-in';
    this.head.style.transform = 'perspective(900px) translateY(40px) scale(0.92)';
    this.say("Where is Pip? 🙈");

    setTimeout(() => {
      // Pop up with big smile!
      window.babyAudio.playPop();
      window.babyAudio.playChime(5, 1.5);
      eyelids.forEach(lid => lid.classList.remove('closed'));

      this.head.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
      this.head.style.transform = 'perspective(900px) translateY(-22px) scale(1.12)';
      this.say("PEEK-A-BOO! 🥰 Here I am!");

      if (window.particleFX) {
        window.particleFX.burst(window.innerWidth / 2, window.innerHeight * 0.4, 'sparkles', '#EC4899');
      }

      setTimeout(() => {
        this.head.style.transform = '';
        this.head.style.transition = '';
        this.isGiggling = false;
      }, 900);
    }, 900);
  }

  say(text) {
    if (!this.speechBubble) return;
    this.speechBubble.textContent = text;
    this.speechBubble.classList.add('visible');

    if (this.speechTimer) clearTimeout(this.speechTimer);
    this.speechTimer = setTimeout(() => {
      this.speechBubble.classList.remove('visible');
    }, 2400);
  }
}

window.MascotController = MascotController;
