/**
 * Baby WonderLand - Finger Paints Canvas & Interactive Shapes
 * Touch-optimized sensory drawing, glowing neon trails, stamp art, and chime feedback.
 */

class FingerPaintsEngine {
  constructor() {
    this.canvas = document.getElementById('paint-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.currentColor = '#FF6584';
    this.currentMode = 'glow'; // 'glow', 'rainbow', 'bubbles', 'stamp'
    this.currentStamp = '⭐';
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.hue = 0;

    // Track active touch identifiers for multi-touch drawing
    this.activeTouches = new Map();

    this.colors = [
      '#FF6584', // Coral Pink
      '#FFB703', // Sunshine Yellow
      '#06D6A0', // Mint Green
      '#118AB2', // Ocean Blue
      '#8338EC', // Bright Violet
      '#FF9F1C'  // Tangerine
    ];

    this.stamps = ['⭐', '🐥', '🐾', '🌸', '💖', '🎈'];

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Helper for canvas-relative coordinates
    this.getCoords = (cx, cy) => {
      const rect = this.canvas.getBoundingClientRect();
      return { x: cx - rect.left, y: cy - rect.top };
    };

    // Mouse Listeners
    this.canvas.addEventListener('mousedown', (e) => {
      const pt = this.getCoords(e.clientX, e.clientY);
      this.handlePointerDown(pt.x, pt.y);
    });
    this.canvas.addEventListener('mousemove', (e) => {
      const pt = this.getCoords(e.clientX, e.clientY);
      this.handlePointerMove(pt.x, pt.y);
    });
    window.addEventListener('mouseup', () => this.handlePointerUp());

    // Touch Listeners (Multi-touch support for baby fingers!)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const pt = this.getCoords(touch.clientX, touch.clientY);
        this.activeTouches.set(touch.identifier, pt);
        this.handlePointerDown(pt.x, pt.y);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const pt = this.getCoords(touch.clientX, touch.clientY);
        const prev = this.activeTouches.get(touch.identifier) || pt;
        this.drawSegment(prev.x, prev.y, pt.x, pt.y);
        this.activeTouches.set(touch.identifier, pt);
      }
    }, { passive: false });

    const endTouches = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        this.activeTouches.delete(e.changedTouches[i].identifier);
      }
    };
    this.canvas.addEventListener('touchend', endTouches);
    this.canvas.addEventListener('touchcancel', endTouches);

    this.initFloatingBalloons();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    // Save existing drawing
    let tempCanvas = null;
    if (this.canvas.width > 0 && this.canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
    }

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = parent.clientWidth * dpr;
    this.canvas.height = parent.clientHeight * dpr;
    this.canvas.style.width = `${parent.clientWidth}px`;
    this.canvas.style.height = `${parent.clientHeight}px`;

    this.ctx.scale(dpr, dpr);

    if (tempCanvas) {
      this.ctx.drawImage(tempCanvas, 0, 0, parent.clientWidth, parent.clientHeight);
    }
  }

  handlePointerDown(x, y) {
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;

    // Pitch note based on vertical position (higher on screen = higher chime!)
    const scaleLen = window.babyAudio.pentatonicScale.length;
    const noteIdx = Math.floor((1 - (y / window.innerHeight)) * scaleLen);
    window.babyAudio.playChime(noteIdx, 1.2);

    if (this.currentMode === 'stamp') {
      this.drawStamp(x, y);
    } else {
      this.drawSegment(x - 0.5, y - 0.5, x, y);
    }

    // Trigger visual ripple burst
    if (window.particleFX) {
      window.particleFX.burst(x, y, 'sparkles', this.currentColor);
    }
  }

  handlePointerMove(x, y) {
    if (!this.isDrawing) return;
    this.drawSegment(this.lastX, this.lastY, x, y);
    this.lastX = x;
    this.lastY = y;
  }

  handlePointerUp() {
    this.isDrawing = false;
  }

  drawSegment(x1, y1, x2, y2) {
    if (this.currentMode === 'stamp') return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.currentMode === 'glow') {
      this.ctx.lineWidth = 18;
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.shadowBlur = 24;
      this.ctx.shadowColor = this.currentColor;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();

      // Inner bright core
      this.ctx.lineWidth = 8;
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.shadowBlur = 0;
      this.ctx.stroke();

    } else if (this.currentMode === 'rainbow') {
      this.hue = (this.hue + 8) % 360;
      const rainbowColor = `hsl(${this.hue}, 90%, 60%)`;
      this.ctx.lineWidth = 16;
      this.ctx.strokeStyle = rainbowColor;
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = rainbowColor;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();

      // Floating sparkle dot alongside the stroke
      if (Math.random() > 0.4) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        const offsetX = (Math.random() - 0.5) * 25;
        const offsetY = (Math.random() - 0.5) * 25;
        this.ctx.arc(x2 + offsetX, y2 + offsetY, Math.random() * 4 + 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

    } else if (this.currentMode === 'bubbles') {
      // Soft translucent bubbles trail
      const radius = Math.random() * 22 + 10;
      const grad = this.ctx.createRadialGradient(x2 - radius/3, y2 - radius/3, radius * 0.1, x2, y2, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.4, this.currentColor + '88');
      grad.addColorStop(1, this.currentColor + '22');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(x2, y2, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Bubble rim highlight
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawStamp(x, y) {
    this.ctx.save();
    this.ctx.font = '48px "Fredoka", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Random rotation for playful natural stamping
    const angle = (Math.random() - 0.5) * 0.4;
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.fillText(this.currentStamp, 0, 0);
    this.ctx.restore();

    window.babyAudio.playPop();
  }

  clearCanvas() {
    window.babyAudio.playPop();
    const width = this.canvas.parentElement.clientWidth;
    const height = this.canvas.parentElement.clientHeight;

    // Splash clear animation
    this.ctx.clearRect(0, 0, width, height);

    if (window.particleFX) {
      window.particleFX.burst(width / 2, height / 2, 'confetti');
    }
  }

  async saveCanvas() {
    if (!this.canvas) return;
    const dataUrl = this.canvas.toDataURL('image/png');
    
    if (window.babyAPI) {
      const modeName = this.currentMode.charAt(0).toUpperCase() + this.currentMode.slice(1);
      const res = await window.babyAPI.saveArtwork(`Baby's ${modeName} Painting`, dataUrl, this.currentMode);
      
      // Unlock achievement
      await window.babyAPI.unlockSticker(
        'creative_artist',
        'Creative Artist',
        'Saved a colorful painting to the Baby Gallery!',
        '🎨'
      );
    }

    window.babyAudio.playArpeggio(2, 5, 80);
    const width = this.canvas.parentElement.clientWidth;
    const height = this.canvas.parentElement.clientHeight;
    if (window.particleFX) {
      window.particleFX.burst(width / 2, height / 2, 'confetti');
    }

    // Refresh gallery if manager exists
    if (window.app && window.app.gallery) {
      window.app.gallery.loadArtworks();
      window.app.gallery.loadStickers();
    }
  }

  setColor(color) {
    this.currentColor = color;
  }

  setMode(mode) {
    this.currentMode = mode;
  }

  setStamp(stamp) {
    this.currentStamp = stamp;
    this.currentMode = 'stamp';
  }

  initFloatingBalloons() {
    const stage = document.getElementById('paint-stage');
    if (!stage) return;

    const balloonColors = ['#FF6584', '#FFD166', '#06D6A0', '#118AB2', '#8338EC'];
    const count = 5;

    for (let i = 0; i < count; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'floating-balloon';
      balloon.style.background = balloonColors[i % balloonColors.length];
      balloon.style.left = `${15 + i * 18}%`;
      balloon.style.bottom = `${12 + (i % 3) * 14}%`;

      // Floating animation with staggered durations
      balloon.style.animation = `wiggle ${4 + i}s infinite ease-in-out`;

      balloon.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playPop();
        window.babyAudio.playChime(i * 2, 1.5);
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'confetti', balloon.style.background);
        }
        balloon.style.transform = 'scale(1.5)';
        balloon.style.opacity = '0';
        setTimeout(() => {
          balloon.style.left = `${Math.random() * 80 + 10}%`;
          balloon.style.bottom = `${10 + Math.random() * 30}%`;
          balloon.style.transform = 'scale(1)';
          balloon.style.opacity = '1';
        }, 1800);
      });

      stage.appendChild(balloon);
    }
  }
}

window.FingerPaintsEngine = FingerPaintsEngine;
