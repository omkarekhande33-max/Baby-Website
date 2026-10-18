/**
 * Baby WonderLand - 3D Toy Robot Companion ("Robo-Pal")
 * Features:
 * 1. Premium 3D Glossy Toy Robot with Interactive SVG Cyber-LED Eyes,
 *    Pulsing Antenna Crystal, Glowing Ear-Dials, Articulated Waving Arms & Dancing Equalizer.
 * 2. 6 Thematic Toggleable Music Tracks for Bottom Buttons:
 *    - Click once to play the button's unique synthesized song & dance routine.
 *    - Click again during playback to immediately stop the music!
 */

class ToyRobotCompanion {
  constructor() {
    this.robotContainer = document.getElementById('robot-container');
    this.speechCard = document.getElementById('robot-speech');
    this.speechText = document.getElementById('robot-speech-text') || this.speechCard;
    this.antennaLight = document.getElementById('antenna-light');
    this.antennaCorona = document.getElementById('antenna-corona');
    this.earLedLeft = document.getElementById('ear-led-left');
    this.earLedRight = document.getElementById('ear-led-right');
    this.leftArm = document.getElementById('robot-left-arm');
    this.rightArm = document.getElementById('robot-right-arm');
    this.eyeLeft = document.getElementById('eye-left-path');
    this.eyeRight = document.getElementById('eye-right-path');
    this.cheekLeft = document.getElementById('cheek-left');
    this.cheekRight = document.getElementById('cheek-right');
    this.heartShape = document.getElementById('robot-heart-shape');

    this.speechTimer = null;
    this.blinkTimer = null;
    this.isBlinking = false;
    this.currentMood = 'happy';

    // Active playing music track id ('hello', 'tickle', 'dance', 'peekaboo', 'highfive', 'lullaby' or null)
    this.activeTrack = null;

    // SVG Eye Path Definitions for Expressive Cyber-LED Eyes
    this.eyePaths = {
      happy: 'M -16 -4 Q 0 -18 16 -4', // Happy smiling arch
      blink: 'M -16 0 L 16 0',          // Closed eyelid line
      love: 'M 0 -10 C -6 -16 -16 -8 -8 0 L 0 9 L 8 0 C 16 -8 6 -16 0 -10 Z', // Heart eye
      sparkle: 'M 0 -14 L 3 -4 L 14 0 L 3 4 L 0 14 L -3 4 L -14 0 L -3 -4 Z', // 8-point Star
      giggle: 'M -14 -10 L 0 0 L -14 10', // Squeezed laughing arrow (Left: >, Right: <)
      giggleRight: 'M 14 -10 L 0 0 L 14 10',
      music: 'M -6 -12 L 8 -16 L 8 4 A 6 5 0 1 1 2 -1 L 2 -10 L -6 -8 Z', // Musical note
      winkRight: 'M -14 0 L 14 0', // Wink (Left eye stays open, right eye winks)
      sleepy: 'M -16 2 L 16 2',
      peekaboo: 'M -12 0 A 12 12 0 1 1 12 0 A 12 12 0 1 1 -12 0' // Wide curious open circle
    };

    // Button Track Mapping
    this.trackButtons = {
      hello: document.getElementById('robo-btn-hello'),
      tickle: document.getElementById('robo-btn-tickle'),
      dance: document.getElementById('robo-btn-dance'),
      peekaboo: document.getElementById('robo-btn-peekaboo'),
      highfive: document.getElementById('robo-btn-highfive'),
      lullaby: document.getElementById('robo-btn-lullaby')
    };

    this.init();
  }

  init() {
    if (!this.robotContainer) return;

    // Direct robot tap / tickle
    this.robotContainer.addEventListener('pointerdown', (e) => {
      this.handleRobotDirectTap();
    });

    // Setup 6 Bottom Music Toggle Buttons
    Object.entries(this.trackButtons).forEach(([trackId, btnEl]) => {
      if (!btnEl) return;
      btnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTrack(trackId);
      });
    });

    // Start natural random blinking cycle
    this.scheduleNextBlink();

    // Default cheerful expression
    this.setExpression('happy', '#38BDF8');
  }

  // =========================================================================
  // TOGGLEABLE MUSIC PLAY / STOP ENGINE (The 6 Bottom Buttons)
  // =========================================================================
  toggleTrack(trackId) {
    // If the clicked track is ALREADY playing, STOP IT!
    if (this.activeTrack === trackId) {
      this.stopCurrentSong(true);
      return;
    }

    // Otherwise, start playing this track
    this.playTrack(trackId);
  }

  playTrack(trackId) {
    // Stop any existing song first
    this.stopCurrentSong(false);

    this.activeTrack = trackId;

    // Highlight the active button
    const activeBtn = this.trackButtons[trackId];
    if (activeBtn) {
      activeBtn.classList.add('is-playing');
      activeBtn.setAttribute('title', 'Playing music — Click again to Stop!');
    }

    // Call BabyAudioEngine to start synthesized song
    if (window.babyAudio) {
      window.babyAudio.playRobotSong(
        trackId,
        (tId, step, note) => this.onMusicStep(tId, step, note),
        (tId) => this.onMusicEnd(tId)
      );
    }

    // Trigger thematic reaction, expression & speech
    switch (trackId) {
      case 'hello':
        this.speak("Beep-boop! Hello little sunshine! Let's play! 🤖🎶", 'happy', '#38BDF8');
        this.waveArms();
        break;

      case 'tickle':
        this.speak("Hehehe! That tickles my funny circuits! 😂🎵", 'giggle', '#F59E0B');
        this.shakeGiggle();
        break;

      case 'dance':
        this.speak("Dance party time! Wiggle and bounce! 💃🕺", 'dance', '#EC4899');
        this.startDanceMoves();
        break;

      case 'peekaboo':
        this.speak("Where did Robo go...? PEEKABOO! I see you! 🙈🎉", 'peekaboo', '#10B981');
        this.celebratePeekaboo();
        break;

      case 'highfive':
        this.speak("High five, super champion! ⭐🖐️", 'sparkle', '#8B5CF6');
        this.raiseHighFive();
        break;

      case 'lullaby':
        this.speak("Time to get cozy... night night, sweet baby! 🌙⭐", 'sleepy', '#6366F1');
        this.softLullabySway();
        break;
    }

    // Particle burst on song start
    if (window.particleFX && this.robotContainer) {
      const rect = this.robotContainer.getBoundingClientRect();
      const pColor = trackId === 'dance' ? '#EC4899' : (trackId === 'tickle' ? '#F59E0B' : '#38BDF8');
      window.particleFX.burst(rect.left + rect.width / 2, rect.top + 100, 'stars', pColor);
    }
  }

  stopCurrentSong(userTriggered = false) {
    if (!this.activeTrack) return;

    const stoppedTrack = this.activeTrack;
    this.activeTrack = null;

    // Halt audio engine
    if (window.babyAudio) {
      window.babyAudio.stopRobotSong();
    }

    // Remove is-playing class from all buttons
    Object.values(this.trackButtons).forEach(btn => {
      if (btn) {
        btn.classList.remove('is-playing');
        btn.setAttribute('title', 'Click to play / stop music');
      }
    });

    // Reset robot physical posture & equalizer
    this.resetPostures();
    this.setExpression('happy', '#38BDF8');

    if (userTriggered) {
      this.speak("Music paused! Tap any button to play again! 🎶", 'happy', '#38BDF8');
    }
  }

  // Musical note step callback (Visualizer & Dance Sync)
  onMusicStep(trackId, step, note) {
    // 1. Animate Chest Equalizer Bars
    const eqBars = [
      document.getElementById('eq-b1'),
      document.getElementById('eq-b2'),
      document.getElementById('eq-b3'),
      document.getElementById('eq-b4'),
      document.getElementById('eq-b5')
    ];

    eqBars.forEach((bar, i) => {
      if (bar) {
        const h = Math.floor(Math.random() * 18 + 6);
        bar.setAttribute('height', h);
        bar.setAttribute('y', -h);
      }
    });

    // 2. Pulse heart & antenna on beat
    if (this.heartShape) {
      this.heartShape.style.transform = step % 2 === 0 ? 'scale(1.22)' : 'scale(1)';
      this.heartShape.style.transition = 'transform 0.1s ease';
    }

    // 3. Rhythm dance movements
    if (trackId === 'dance' || trackId === 'tickle' || trackId === 'hello') {
      const rot = (step % 2 === 0 ? 1 : -1) * (trackId === 'dance' ? 10 : 5);
      const dy = (step % 2 === 0 ? -16 : 4);
      if (this.robotContainer) {
        this.robotContainer.style.transform = `translateY(${dy}px) rotate(${rot}deg) scale(1.04)`;
        this.robotContainer.style.transition = 'transform 0.14s ease';
      }

      // Rhythmically bounce arms
      if (this.leftArm && this.rightArm) {
        const armAngle1 = (step % 2 === 0 ? -25 : 20);
        const armAngle2 = (step % 2 === 0 ? 20 : -25);
        this.leftArm.style.transform = `rotate(${armAngle1}deg)`;
        this.rightArm.style.transform = `rotate(${armAngle2}deg)`;
        this.leftArm.style.transition = 'transform 0.14s ease';
        this.rightArm.style.transition = 'transform 0.14s ease';
      }
    }
  }

  onMusicEnd(trackId) {
    if (this.activeTrack === trackId) {
      this.stopCurrentSong(false);
    }
  }

  // =========================================================================
  // 3D CYBER-LED EXPRESSIVE FACE & EYE ENGINE
  // =========================================================================
  setExpression(mood, color = '#38BDF8') {
    this.currentMood = mood;

    if (!this.eyeLeft || !this.eyeRight) return;

    // Left & Right eye paths
    let leftD = this.eyePaths[mood] || this.eyePaths.happy;
    let rightD = this.eyePaths[mood] || this.eyePaths.happy;

    if (mood === 'giggle') {
      leftD = this.eyePaths.giggle;
      rightD = this.eyePaths.giggleRight;
    } else if (mood === 'wink') {
      leftD = this.eyePaths.happy;
      rightD = this.eyePaths.winkRight;
    }

    // Fill vs Stroke modes for SVG shapes
    const isFilled = (mood === 'love' || mood === 'sparkle' || mood === 'peekaboo');

    [this.eyeLeft, this.eyeRight].forEach((eyeEl, idx) => {
      eyeEl.setAttribute('d', idx === 0 ? leftD : rightD);
      eyeEl.style.transition = 'stroke 0.25s, fill 0.25s, d 0.2s';
      if (isFilled) {
        eyeEl.setAttribute('fill', color);
        eyeEl.setAttribute('stroke', color);
        eyeEl.setAttribute('stroke-width', '1');
      } else {
        eyeEl.setAttribute('fill', 'none');
        eyeEl.setAttribute('stroke', color);
        eyeEl.setAttribute('stroke-width', '5.5');
      }
    });

    // Update Neon Lights (Antenna & Headphone Earpieces)
    if (this.antennaLight) {
      this.antennaLight.setAttribute('fill', color);
      this.antennaLight.style.transition = 'fill 0.3s';
    }
    if (this.antennaCorona) {
      this.antennaCorona.setAttribute('fill', color);
    }
    if (this.earLedLeft) {
      this.earLedLeft.setAttribute('stroke', color);
    }
    if (this.earLedRight) {
      this.earLedRight.setAttribute('stroke', color);
    }
  }

  scheduleNextBlink() {
    const delay = Math.random() * 2500 + 3500;
    this.blinkTimer = setTimeout(() => {
      this.blink();
      this.scheduleNextBlink();
    }, delay);
  }

  blink() {
    if (this.isBlinking || this.currentMood === 'sleepy') return;
    this.isBlinking = true;

    if (this.eyeLeft && this.eyeRight) {
      this.eyeLeft.setAttribute('d', this.eyePaths.blink);
      this.eyeRight.setAttribute('d', this.eyePaths.blink);
      this.eyeLeft.setAttribute('fill', 'none');
      this.eyeRight.setAttribute('fill', 'none');
      this.eyeLeft.setAttribute('stroke-width', '4');
      this.eyeRight.setAttribute('stroke-width', '4');
    }

    setTimeout(() => {
      this.isBlinking = false;
      this.setExpression(this.currentMood);
    }, 180);
  }

  // =========================================================================
  // ANIMATIONS & ROBOT PHYSICAL ROUTINES
  // =========================================================================
  resetPostures() {
    if (this.robotContainer) {
      this.robotContainer.style.transform = 'translateY(0) rotate(0deg) scale(1)';
      this.robotContainer.style.transition = 'transform 0.3s ease';
    }
    if (this.leftArm) {
      this.leftArm.style.transform = 'rotate(0deg)';
      this.leftArm.style.transition = 'transform 0.3s ease';
    }
    if (this.rightArm) {
      this.rightArm.style.transform = 'rotate(0deg)';
      this.rightArm.style.transition = 'transform 0.3s ease';
    }
    if (this.heartShape) {
      this.heartShape.style.transform = 'scale(1)';
    }
  }

  waveArms() {
    if (!this.leftArm || !this.rightArm) return;
    this.rightArm.style.transform = 'rotate(-65deg)';
    this.rightArm.style.transition = 'transform 0.3s var(--bounce-spring)';
    setTimeout(() => {
      if (this.activeTrack === 'hello') {
        this.rightArm.style.transform = 'rotate(-40deg)';
      }
    }, 350);
  }

  shakeGiggle() {
    let shakes = 0;
    const interval = setInterval(() => {
      if (this.activeTrack !== 'tickle') {
        clearInterval(interval);
        return;
      }
      const angle = (shakes % 2 === 0 ? 1 : -1) * 9;
      this.robotContainer.style.transform = `rotate(${angle}deg) scale(1.06)`;
      shakes++;
      if (shakes > 8) {
        clearInterval(interval);
      }
    }, 85);
  }

  startDanceMoves() {
    // Continuous dance movements driven by onMusicStep
  }

  celebratePeekaboo() {
    // Hide eyes first
    this.setExpression('sleepy', '#475569');
    if (this.leftArm && this.rightArm) {
      this.leftArm.style.transform = 'rotate(-45deg)';
      this.rightArm.style.transform = 'rotate(45deg)';
    }

    setTimeout(() => {
      if (this.activeTrack === 'peekaboo') {
        this.setExpression('peekaboo', '#10B981');
        this.resetPostures();
        this.robotContainer.style.transform = 'scale(1.15) translateY(-20px)';
        setTimeout(() => {
          this.robotContainer.style.transform = 'scale(1.04) translateY(0)';
        }, 300);

        if (window.particleFX && this.robotContainer) {
          const rect = this.robotContainer.getBoundingClientRect();
          window.particleFX.burst(rect.left + rect.width / 2, rect.top + 80, 'confetti');
        }
      }
    }, 1200);
  }

  raiseHighFive() {
    if (this.rightArm) {
      this.rightArm.style.transform = 'rotate(-85deg)';
      this.rightArm.style.transition = 'transform 0.3s var(--bounce-spring)';
    }
    if (this.robotContainer) {
      this.robotContainer.style.transform = 'translateY(-18px) scale(1.08)';
    }
  }

  softLullabySway() {
    let step = 0;
    const sway = setInterval(() => {
      if (this.activeTrack !== 'lullaby') {
        clearInterval(sway);
        return;
      }
      const angle = Math.sin(step * 0.3) * 4;
      this.robotContainer.style.transform = `rotate(${angle}deg) translateY(-4px)`;
      step++;
    }, 200);
  }

  handleRobotDirectTap() {
    if (this.activeTrack === 'tickle') {
      this.stopCurrentSong(true);
    } else {
      this.toggleTrack('tickle');
    }
  }

  // =========================================================================
  // SPEECH BUBBLE & SPEECH SYNTHESIS
  // =========================================================================
  speak(text, mood = 'happy', color = '#38BDF8') {
    this.setExpression(mood, color);

    if (this.speechText) {
      this.speechText.textContent = text;
    }
    if (this.speechCard) {
      this.speechCard.style.transform = 'translateX(-50%) scale(1.06)';
      if (this.speechTimer) clearTimeout(this.speechTimer);
      this.speechTimer = setTimeout(() => {
        if (this.speechCard) {
          this.speechCard.style.transform = 'translateX(-50%) scale(1)';
        }
      }, 220);
    }

    // High cute robot voice synthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[^\w\s!?,]/g, '').trim();
        if (cleanText) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.pitch = 1.7; // Sweet, cute robot voice
          utterance.rate = 1.05;
          utterance.volume = 0.85;
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        // Handled safely
      }
    }
  }
}

window.ToyRobotCompanion = ToyRobotCompanion;
