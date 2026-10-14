/**
 * Baby WonderLand - Toy Robot Companion ("Robo-Pal")
 * Animated companion with LED facial expressions, synthesized voice, and playful routines.
 */

class ToyRobotCompanion {
  constructor() {
    this.robotContainer = document.getElementById('robot-container');
    this.faceScreen = document.getElementById('robot-face');
    this.speechCard = document.getElementById('robot-speech');
    this.antennaLight = document.getElementById('antenna-light');

    this.speechTimer = null;
    this.isDancing = false;
    this.danceInterval = null;

    this.expressions = {
      happy: '( ^ _ ^ )',
      love: '( ♥ _ ♥ )',
      sparkle: '( * _ * )',
      wink: '( ^ . ~ )',
      giggle: '( > _ < )',
      surprised: '( O _ O )',
      sleepy: '( - _ - ) zZ',
      music: '( ♫ _ ♫ )'
    };

    this.init();
  }

  init() {
    if (!this.robotContainer) return;

    // Direct robot taps
    this.robotContainer.addEventListener('pointerdown', (e) => {
      this.tickle();
    });

    // Hook up interaction buttons
    const btnHello = document.getElementById('robo-btn-hello');
    const btnTickle = document.getElementById('robo-btn-tickle');
    const btnDance = document.getElementById('robo-btn-dance');
    const btnPeekaboo = document.getElementById('robo-btn-peekaboo');
    const btnHighFive = document.getElementById('robo-btn-highfive');
    const btnLullaby = document.getElementById('robo-btn-lullaby');

    if (btnHello) btnHello.addEventListener('click', () => this.sayHello());
    if (btnTickle) btnTickle.addEventListener('click', () => this.tickle());
    if (btnDance) btnDance.addEventListener('click', () => this.danceParty());
    if (btnPeekaboo) btnPeekaboo.addEventListener('click', () => this.peekaboo());
    if (btnHighFive) btnHighFive.addEventListener('click', () => this.highFive());
    if (btnLullaby) btnLullaby.addEventListener('click', () => this.singLullaby());
  }

  setFace(mood, color = '#38BDF8') {
    if (!this.faceScreen) return;
    this.faceScreen.textContent = this.expressions[mood] || this.expressions.happy;
    this.faceScreen.style.color = color;
    this.faceScreen.style.borderColor = color;
    this.faceScreen.style.textShadow = `0 0 12px ${color}`;

    if (this.antennaLight) {
      this.antennaLight.style.fill = color;
      this.antennaLight.style.filter = `drop-shadow(0 0 8px ${color})`;
    }
  }

  speak(text, mood = 'happy') {
    this.setFace(mood, mood === 'love' ? '#F43F5E' : mood === 'sparkle' ? '#FBBF24' : '#38BDF8');
    window.babyAudio.playRobotBleep(mood);

    if (this.speechCard) {
      this.speechCard.textContent = text;
      this.speechCard.style.opacity = '1';
      this.speechCard.style.transform = 'translateX(-50%) scale(1.05)';

      if (this.speechTimer) clearTimeout(this.speechTimer);
      this.speechTimer = setTimeout(() => {
        this.speechCard.style.transform = 'translateX(-50%) scale(1)';
      }, 200);
    }

    // Try SpeechSynthesis with high cute pitch if available
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[^\w\s!?,]/g, ''));
        utterance.pitch = 1.7; // Sweet cute robot pitch
        utterance.rate = 1.05;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        // SpeechSynthesis restrictions caught gracefully
      }
    }
  }

  sayHello() {
    this.speak("Beep-boop! Hello little sunshine! Let's play!", 'happy');
    if (window.particleFX) {
      const rect = this.robotContainer.getBoundingClientRect();
      window.particleFX.burst(rect.left + rect.width / 2, rect.top + 80, 'stars', '#38BDF8');
    }
  }

  tickle() {
    this.speak("Hehehe! That tickles my funny circuits!", 'giggle');
    window.babyAudio.playGiggle();

    // Wiggle animation
    this.robotContainer.style.transition = 'transform 0.1s ease-in-out';
    let shakes = 0;
    const interval = setInterval(() => {
      const angle = (shakes % 2 === 0 ? 1 : -1) * 8;
      this.robotContainer.style.transform = `rotate(${angle}deg) scale(1.08)`;
      shakes++;
      if (shakes > 6) {
        clearInterval(interval);
        this.robotContainer.style.transform = 'rotate(0deg) scale(1)';
        this.setFace('love', '#F43F5E');
      }
    }, 90);

    if (window.particleFX) {
      const rect = this.robotContainer.getBoundingClientRect();
      window.particleFX.burst(rect.left + rect.width / 2, rect.top + 180, 'hearts');
    }
  }

  danceParty() {
    if (this.isDancing) return;
    this.isDancing = true;

    this.speak("Dance party time! Wiggle and bounce!", 'music');
    window.babyAudio.playArpeggio(2, 6, 120);

    let step = 0;
    const colors = ['#F43F5E', '#FBBF24', '#34D399', '#38BDF8', '#A855F7'];

    this.danceInterval = setInterval(() => {
      const color = colors[step % colors.length];
      this.setFace('music', color);
      const dy = step % 2 === 0 ? -25 : 5;
      const rot = step % 2 === 0 ? -12 : 12;
      this.robotContainer.style.transform = `translateY(${dy}px) rotate(${rot}deg) scale(1.06)`;

      if (window.particleFX) {
        const rect = this.robotContainer.getBoundingClientRect();
        window.particleFX.burst(
          rect.left + Math.random() * rect.width,
          rect.top + Math.random() * 100,
          'sparkles',
          color
        );
      }

      step++;
      if (step > 10) {
        clearInterval(this.danceInterval);
        this.danceInterval = null;
        this.isDancing = false;
        this.robotContainer.style.transform = 'translateY(0) rotate(0deg) scale(1)';
        this.setFace('happy');
      }
    }, 220);
  }

  peekaboo() {
    this.speak("Where did Robo go...? 🙈", 'surprised');
    if (this.faceScreen) {
      this.faceScreen.textContent = '( x _ x )';
      this.faceScreen.style.color = '#475569';
      this.faceScreen.style.textShadow = 'none';
    }

    setTimeout(() => {
      this.speak("PEEK-A-BOO! I see you! 🎉", 'sparkle');
      window.babyAudio.playPop();
      window.babyAudio.playChime(6, 1.5);

      if (window.particleFX) {
        const rect = this.robotContainer.getBoundingClientRect();
        window.particleFX.burst(rect.left + rect.width / 2, rect.top + 100, 'confetti');
      }
    }, 1200);
  }

  highFive() {
    this.speak("High five, super champion! ⭐", 'love');
    window.babyAudio.playBell();

    this.robotContainer.style.transform = 'scale(1.15) translateY(-15px)';
    setTimeout(() => {
      this.robotContainer.style.transform = 'scale(1) translateY(0)';
    }, 300);

    if (window.particleFX) {
      const rect = this.robotContainer.getBoundingClientRect();
      window.particleFX.burst(rect.left + rect.width / 2, rect.top + 60, 'stars', '#FBBF24');
    }
  }

  singLullaby() {
    this.speak("Time to get cozy... night night, sweet baby! 🌙", 'sleepy');
    this.setFace('sleepy', '#818CF8');
    window.babyAudio.toggleLullaby();
  }
}

window.ToyRobotCompanion = ToyRobotCompanion;
