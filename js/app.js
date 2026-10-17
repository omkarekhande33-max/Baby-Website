/**
 * Baby WonderLand - Master Application Coordinator & Sensory Particle FX Engine
 */

class ParticleFXEngine {
  constructor() {
    this.canvas = document.getElementById('fx-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.ripples = [];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  burst(x, y, type = 'sparkles', baseColor = null) {
    // Add an expanding sensory ripple ring
    this.ripples.push({
      x, y,
      radius: 5,
      maxRadius: 85,
      alpha: 0.8,
      color: baseColor || '#FF7597'
    });

    const count = type === 'confetti' ? 36 : (type === 'stars' ? 14 : 18);
    const colors = ['#FF6584', '#FFD166', '#06D6A0', '#118AB2', '#8338EC', '#FF9F1C'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 5 + 2.5;

      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'hearts' ? 2 : 0),
        size: Math.random() * 8 + 5,
        color: baseColor || colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.02 + 0.015,
        type: type, // 'sparkles', 'stars', 'hearts', 'confetti', 'stardust'
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15
      });
    }
  }

  spawnStardust(x, y, dx, dy) {
    // Keep high performance: max 80 particles
    if (this.particles.length > 80) return;

    const colors = ['#FFF59D', '#FFD166', '#FF80AB', '#80D8FF', '#B388FF', '#A7FFEB', '#FFFFFF'];
    const count = Math.random() < 0.6 ? 2 : 1;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: -dx * 0.08 + (Math.random() - 0.5) * 1.6,
        vy: -dy * 0.08 + (Math.random() - 0.5) * 1.6 - 0.4, // Gentle float upward
        size: Math.random() * 4.5 + 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.035 + 0.022,
        type: 'stardust',
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25
      });
    }
  }

  update() {
    // Ripples
    this.ripples.forEach(r => {
      r.radius += 3.5;
      r.alpha *= 0.93;
    });
    this.ripples = this.ripples.filter(r => r.alpha > 0.02 && r.radius < r.maxRadius);

    // Particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;

      if (p.type === 'confetti' || p.type === 'stars') {
        p.vy += 0.12; // Gentle gravity
      } else if (p.type === 'hearts') {
        p.vy -= 0.05; // Float upwards
      } else if (p.type === 'stardust') {
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vy -= 0.06; // Fairy float upward
      }

      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);
    });

    this.particles = this.particles.filter(p => p.life > 0);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Expanding Ripples
    this.ripples.forEach(r => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = r.color;
      this.ctx.globalAlpha = r.alpha;
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      this.ctx.restore();
    });

    // Draw Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rot);
      this.ctx.globalAlpha = p.alpha;

      if (p.type === 'stars') {
        this.ctx.font = `${p.size * 2.2}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⭐', 0, 0);
      } else if (p.type === 'hearts') {
        this.ctx.font = `${p.size * 2.2}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('💖', 0, 0);
      } else if (p.type === 'confetti') {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.5);
      } else if (p.type === 'stardust') {
        // Glowing Fairy Stardust Diamond Star
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color;
        const s = p.size;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -s);
        this.ctx.quadraticCurveTo(0, 0, s, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, s);
        this.ctx.quadraticCurveTo(0, 0, -s, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, -s);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Glowing Sparkles
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

class AppCoordinator {
  constructor() {
    this.currentTab = 'mascot';
    this.isNightMode = false;
    this.isBabyLocked = false;
  }

  init() {
    // 1. Initialize Visual FX
    window.particleFX = new ParticleFXEngine();

    // 2. Initialize Subsystems
    this.mascot = new window.MascotController();
    this.paint = new window.FingerPaintsEngine();
    this.trike = new window.LightningTrikeGame();
    this.robot = new window.ToyRobotCompanion();
    if (window.BedroomController) {
      this.bedroom = new window.BedroomController();
    }
    if (window.BabyGalleryManager) {
      this.gallery = new window.BabyGalleryManager();
    }

    // Magic Wand Stardust Trail Engine
    let lastWandX = null;
    let lastWandY = null;
    let wandThrottle = 0;

    const handleWandMove = (clientX, clientY) => {
      const now = performance.now();
      if (now - wandThrottle < 18) return;
      wandThrottle = now;

      if (lastWandX !== null) {
        const dx = clientX - lastWandX;
        const dy = clientY - lastWandY;
        const dist = Math.hypot(dx, dy);
        if (dist > 2) {
          window.particleFX.spawnStardust(clientX, clientY, dx, dy);
        }
      }
      lastWandX = clientX;
      lastWandY = clientY;
    };

    window.addEventListener('mousemove', (e) => handleWandMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleWandMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // 3. Navigation Tabs
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // 4. Night Mode / Celestial Body Toggle
    const celestialBtn = document.getElementById('celestial-toggle');
    const nightModeBtn = document.getElementById('night-mode-btn');
    if (celestialBtn) celestialBtn.addEventListener('click', () => this.toggleNightMode());
    if (nightModeBtn) nightModeBtn.addEventListener('click', () => this.toggleNightMode());

    // 5. Sound Mute Toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = window.babyAudio.toggleMute();
        soundBtn.textContent = isMuted ? '🔇' : '🔊';
        soundBtn.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
      });
    }

    // 6. Baby Lock Mode (Fullscreen Protection)
    const lockBtn = document.getElementById('baby-lock-btn');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => this.toggleBabyLock());
    }

    // 7. Paint Toolbar Controls
    this.initPaintToolbar();

    // 8. Global Sensory Ambient Audio on click
    window.addEventListener('pointerdown', (e) => {
      window.babyAudio.ensureContext();
      // Only trigger ambient chime if not clicking on interactive buttons
      if (!e.target.closest('button, input, .nav-tabs, .mascot-container, #paint-canvas, #trike-canvas, #robot-container, .floating-balloon')) {
        const noteIdx = Math.floor((1 - (e.clientY / window.innerHeight)) * window.babyAudio.pentatonicScale.length);
        window.babyAudio.playChime(noteIdx, 1.2);
        window.particleFX.burst(e.clientX, e.clientY, 'sparkles');
      }
    });

    // 9. Floating ambient clouds click
    document.querySelectorAll('.floating-cloud').forEach((cloud, idx) => {
      cloud.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playChime(idx * 3, 1.4);
        window.babyAudio.playPop();
        window.particleFX.burst(e.clientX, e.clientY, 'sparkles', '#60A5FA');
      });
    });

    // Mascot extra action buttons
    const tickleBtn = document.getElementById('mascot-tickle-btn');
    const singBtn = document.getElementById('mascot-sing-btn');
    const peekBtn = document.getElementById('mascot-peek-btn');

    if (tickleBtn) tickleBtn.addEventListener('click', (e) => this.mascot.handleMascotClick(e));
    if (singBtn) singBtn.addEventListener('click', () => {
      window.babyAudio.playArpeggio(1, 5, 110);
      this.mascot.say("La la la! 🎵 Singing with you!");
    });
    if (peekBtn) peekBtn.addEventListener('click', () => {
      this.mascot.say("Peek-a-boo! I see your bright smile! ⭐");
      window.babyAudio.playPop();
    });

    // 10. Creative 3D badge tap interactions
    document.querySelectorAll('.creative-mascot-badge, .creative-trike-badge, .creative-robot-badge, .creative-sticker-card').forEach(badge => {
      badge.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        window.babyAudio.playChime(Math.floor(Math.random() * 8), 1.2);
        window.babyAudio.playPop();
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'stars', '#F59E0B');
        }
      });
    });
  }

  switchTab(tabId) {
    if (this.currentTab === tabId) return;

    window.babyAudio.playChime(3, 1.0);

    // Stop trike game loop if leaving trike tab
    if (this.currentTab === 'trike') {
      this.trike.stop();
    }

    this.currentTab = tabId;

    // Update Tab Buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update Views
    document.querySelectorAll('.play-view').forEach(view => {
      const isTarget = view.id === `view-${tabId}`;
      view.classList.toggle('active', isTarget);
    });

    // Start trike game if entering trike tab
    if (tabId === 'trike') {
      setTimeout(() => this.trike.start(), 150);
    } else if (tabId === 'paint') {
      setTimeout(() => this.paint.resizeCanvas(), 100);
    } else if (tabId === 'gallery') {
      if (this.gallery) {
        this.gallery.loadArtworks();
        this.gallery.loadStickers();
        this.gallery.loadProfile();
      }
    }
  }

  toggleNightMode() {
    this.isNightMode = !this.isNightMode;
    document.body.classList.toggle('night-mode', this.isNightMode);

    const nightBtn = document.getElementById('night-mode-btn');
    if (nightBtn) {
      nightBtn.textContent = this.isNightMode ? '☀️' : '🌙';
    }

    if (this.isNightMode) {
      // Bedtime Lullaby Starts!
      if (!window.babyAudio.isLullabyPlaying) {
        window.babyAudio.toggleLullaby();
      }
      this.robot.setFace('sleepy', '#818CF8');
    } else {
      if (window.babyAudio.isLullabyPlaying) {
        window.babyAudio.toggleLullaby();
      }
      this.robot.setFace('happy');
    }

    window.babyAudio.playChime(4, 1.6);
  }

  toggleBabyLock() {
    this.isBabyLocked = !this.isBabyLocked;
    const banner = document.getElementById('baby-lock-banner');
    const lockBtn = document.getElementById('baby-lock-btn');

    if (this.isBabyLocked) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      if (banner) {
        banner.classList.add('active');
        setTimeout(() => banner.classList.remove('active'), 3500);
      }
      if (lockBtn) lockBtn.textContent = '🔒';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      if (lockBtn) lockBtn.textContent = '🔓';
    }
    window.babyAudio.playPop();
  }

  initPaintToolbar() {
    // Color Swatches
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const color = swatch.getAttribute('data-color');
        this.paint.setColor(color);
        window.babyAudio.playChime(2, 0.8);
      });
    });

    // Brush Modes
    const modeBtns = document.querySelectorAll('.brush-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.stamp-btn').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        this.paint.setMode(mode);
        window.babyAudio.playPop();
      });
    });

    // Stamps
    const stampBtns = document.querySelectorAll('.stamp-btn');
    stampBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        stampBtns.forEach(b => b.classList.remove('active'));
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const stamp = btn.getAttribute('data-stamp');
        this.paint.setStamp(stamp);
        window.babyAudio.playPop();
      });
    });

    // Clear Canvas
    const clearBtn = document.getElementById('clear-canvas-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.paint.clearCanvas();
      });
    }

    // Save Canvas to Backend Gallery
    const saveBtn = document.getElementById('save-canvas-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.paint.saveCanvas();
      });
    }
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppCoordinator();
  window.app.init();
});
