/**
 * Baby WonderLand - Interactive Mascot Controller ("Pip the Big 3D Wonder Bear")
 * Real-time eye tracking, cursor 3D-tilt physics, and delightful baby micro-reactions.
 */

class MascotController {
  constructor() {
    this.container = document.getElementById('mascot-container');
    this.speechBubble = document.getElementById('mascot-speech');
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

    this.speechTimer = null;
    this.blinkTimer = null;
    this.isGiggling = false;

    this.phrases = [
      "Peek-a-boo! 🥰",
      "I see you! 👀✨",
      "Giggle giggle! 🐻",
      "High five, baby! 🖐️",
      "You're doing great! 🌟",
      "Boop my nose! 👃",
      "Tickle my honey pot! 🍯",
      "Yay, so bright! 🌈"
    ];

    this.init();
  }

  init() {
    if (!this.container) return;

    // Track mouse & touch movements across window
    window.addEventListener('mousemove', (e) => this.handlePointerMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Mascot main click interaction
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
        this.say("Boop! 👃 You touched my nose! 🥰");
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
    if (!this.container) return;
    if (this.isGiggling) return;

    // Center of the mascot on screen
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate normalized offset from center (-1 to 1)
    const normX = (x - centerX) / (window.innerWidth / 2);
    const normY = (y - centerY) / (window.innerHeight / 2);

    // 3D Tilt: gentle rotational perspective lean towards pointer
    const tiltDegY = Math.max(-12, Math.min(12, normX * 10));
    const tiltDegX = Math.max(-10, Math.min(10, -normY * 8));
    const tiltY = Math.max(-10, Math.min(10, normY * 6));
    this.container.style.transform = `perspective(1000px) rotateY(${tiltDegY.toFixed(2)}deg) rotateX(${tiltDegX.toFixed(2)}deg) translateY(${tiltY.toFixed(2)}px)`;

    // Pupil Eye Tracking with trigonometry
    if (this.pupilLeft && this.pupilRight) {
      this.trackEye(this.pupilLeft, 0.361 * rect.width, 0.317 * rect.height, x, y, rect);
      this.trackEye(this.pupilRight, 0.552 * rect.width, 0.298 * rect.height, x, y, rect);
    }
  }

  trackEye(pupilEl, eyeRelX, eyeRelY, targetX, targetY, mascotRect) {
    const eyeGlobalX = mascotRect.left + eyeRelX;
    const eyeGlobalY = mascotRect.top + eyeRelY;

    const dx = targetX - eyeGlobalX;
    const dy = targetY - eyeGlobalY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.hypot(dx, dy);

    // Max travel distance for pupils inside eye sockets (pixels)
    const maxDistance = 5;
    const travel = Math.min(distance / 25, maxDistance);

    const pupilX = Math.cos(angle) * travel;
    const pupilY = Math.sin(angle) * travel;

    pupilEl.style.transform = `translate(${pupilX.toFixed(2)}px, ${pupilY.toFixed(2)}px)`;
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
    const eyelids = document.querySelectorAll('.eyelid');
    eyelids.forEach(lid => lid.style.opacity = '1');
    setTimeout(() => {
      eyelids.forEach(lid => lid.style.opacity = '0');
    }, 160);
  }

  wiggleEar(side) {
    window.babyAudio.playChime(side === 'left' ? 3 : 5, 0.9);
    const ear = side === 'left' ? this.earLeft : this.earRight;
    if (ear) {
      ear.style.transform = side === 'left' ? 'scale(1.25) rotate(-18deg)' : 'scale(1.25) rotate(18deg)';
      setTimeout(() => {
        ear.style.transform = '';
      }, 300);
    }
    this.say(side === 'left' ? "My ear tickles! 🐰" : "Wiggle wiggle! ✨");
  }

  bounce() {
    this.container.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
    this.container.style.transform = 'perspective(1000px) scale(1.1) translateY(-24px)';
    setTimeout(() => {
      this.container.style.transform = '';
      setTimeout(() => {
        this.container.style.transition = '';
      }, 200);
    }, 350);
  }

  handleMascotClick(e) {
    if (this.isGiggling) return;
    this.isGiggling = true;

    // Trigger baby giggle sound
    window.babyAudio.playGiggle();

    // Trigger heart particle burst at tap location
    if (window.particleFX) {
      window.particleFX.burst(e.clientX, e.clientY, 'hearts');
    }

    // Cute blush illumination
    if (this.blushLeft && this.blushRight) {
      this.blushLeft.style.opacity = '1';
      this.blushRight.style.opacity = '1';
      this.blushLeft.style.transform = 'scale(1.4)';
      this.blushRight.style.transform = 'scale(1.4)';
    }

    // Bounce mascot
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
    }, 2400);
  }
}

window.MascotController = MascotController;
