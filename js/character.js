/**
 * Baby WonderLand - Interactive Cartoon Mascot ("Pip the Bear")
 * Real-time eye tracking, cursor-tilt body physics, and delightful micro-reactions.
 */

class MascotController {
  constructor() {
    this.container = document.getElementById('mascot-container');
    this.speechBubble = document.getElementById('mascot-speech');
    this.pupilLeft = document.getElementById('pupil-left');
    this.pupilRight = document.getElementById('pupil-right');
    this.mouth = document.getElementById('mascot-mouth');
    this.blushLeft = document.getElementById('blush-left');
    this.blushRight = document.getElementById('blush-right');
    this.earLeft = document.getElementById('ear-left');
    this.earRight = document.getElementById('ear-right');

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
      "Tickle my tummy! 🎈",
      "Yay, so bright! 🌈"
    ];

    this.init();
  }

  init() {
    if (!this.container) return;

    // Track mouse & touch movements across window
    window.addEventListener('mousemove', (e) => this.handlePointerMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Mascot click interactions
    this.container.addEventListener('pointerdown', (e) => this.handleMascotClick(e));

    // Ear and nose specific boops
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

    const nose = document.getElementById('mascot-nose');
    if (nose) {
      nose.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playPop();
        window.babyAudio.playChime(4, 1.4);
        window.particleFX.burst(e.clientX, e.clientY, 'hearts', '#FF6584');
        this.say("Boop! 👃 You touched my nose! 🥰");
        this.wiggleEar('left');
        this.wiggleEar('right');
      });
    }

    const pom = document.querySelector('.nightcap-pom');
    if (pom) {
      pom.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playPop();
        window.particleFX.burst(e.clientX, e.clientY, 'stars', '#818CF8');
        this.say("My cozy nightcap! 🌙 Bedtime starry dreams!");
      });
    }

    // Start natural blinking routine
    this.scheduleNextBlink();
  }

  handlePointerMove(x, y) {
    if (!this.container || !this.pupilLeft || !this.pupilRight) return;
    if (this.isGiggling) return;

    // Center of the mascot on screen
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate normalized offset from center (-1 to 1)
    const normX = (x - centerX) / (window.innerWidth / 2);
    const normY = (y - centerY) / (window.innerHeight / 2);

    // Body Tilt: gentle rotational lean towards pointer
    const tiltDeg = Math.max(-10, Math.min(10, normX * 8));
    const tiltY = Math.max(-8, Math.min(8, normY * 5));
    this.container.style.transform = `rotate(${tiltDeg}deg) translateY(${tiltY}px)`;

    // Pupil Tracking with trigonometry
    this.trackEye(this.pupilLeft, 115, 140, x, y, rect);
    this.trackEye(this.pupilRight, 185, 140, x, y, rect);
  }

  trackEye(pupilEl, eyeLocalX, eyeLocalY, targetX, targetY, mascotRect) {
    // Exact eye coordinate on screen
    const eyeGlobalX = mascotRect.left + (eyeLocalX / 300) * mascotRect.width;
    const eyeGlobalY = mascotRect.top + (eyeLocalY / 300) * mascotRect.height;

    const dx = targetX - eyeGlobalX;
    const dy = targetY - eyeGlobalY;
    const angle = Math.atan2(dy, dx);
    const distance = Math.hypot(dx, dy);

    // Max travel distance for pupils inside eye sockets (SVG units)
    const maxDistance = 7;
    const travel = Math.min(distance / 25, maxDistance);

    const pupilX = Math.cos(angle) * travel;
    const pupilY = Math.sin(angle) * travel;

    pupilEl.setAttribute('transform', `translate(${pupilX.toFixed(2)}, ${pupilY.toFixed(2)})`);
  }

  scheduleNextBlink() {
    const delay = 3000 + Math.random() * 4000;
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
    }, 180);
  }

  wiggleEar(side) {
    window.babyAudio.playChime(side === 'left' ? 3 : 5, 0.8);
    const ear = side === 'left' ? this.earLeft : this.earRight;
    if (ear) {
      ear.style.transition = 'transform 0.15s ease-in-out';
      ear.style.transform = side === 'left' ? 'rotate(-25deg)' : 'rotate(25deg)';
      setTimeout(() => {
        ear.style.transform = side === 'left' ? 'rotate(15deg)' : 'rotate(-15deg)';
        setTimeout(() => {
          ear.style.transform = 'rotate(0deg)';
        }, 150);
      }, 150);
    }
    this.say(side === 'left' ? "My ear tickles! 🐰" : "Wiggle wiggle! ✨");
  }

  handleMascotClick(e) {
    if (this.isGiggling) return;
    this.isGiggling = true;

    // Trigger baby giggle sound
    window.babyAudio.playGiggle();

    // Trigger particle burst at tap location
    if (window.particleFX) {
      window.particleFX.burst(e.clientX, e.clientY, 'hearts');
    }

    // Cute blush pulse
    if (this.blushLeft && this.blushRight) {
      this.blushLeft.style.fill = '#FF4D79';
      this.blushRight.style.fill = '#FF4D79';
      this.blushLeft.style.transform = 'scale(1.3)';
      this.blushRight.style.transform = 'scale(1.3)';
    }

    // Happy open mouth
    if (this.mouth) {
      this.mouth.setAttribute('d', 'M 130 185 Q 150 215 170 185 Z');
      this.mouth.style.fill = '#FF4081';
    }

    // Bounce mascot
    this.container.style.transition = 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)';
    this.container.style.transform = 'scale(1.15) translateY(-20px)';

    // Random cute phrase
    const phrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
    this.say(phrase);

    setTimeout(() => {
      this.container.style.transform = 'scale(1) translateY(0)';
      if (this.mouth) {
        this.mouth.setAttribute('d', 'M 135 185 Q 150 200 165 185');
        this.mouth.style.fill = 'none';
      }
      if (this.blushLeft && this.blushRight) {
        this.blushLeft.style.fill = '#FFB6C1';
        this.blushRight.style.fill = '#FFB6C1';
        this.blushLeft.style.transform = 'scale(1)';
        this.blushRight.style.transform = 'scale(1)';
      }
      this.container.style.transition = '';
      this.isGiggling = false;
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
