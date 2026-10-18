/**
 * Baby WonderLand - Master Application Coordinator & Sensory Particle FX Engine
 * Ultra-optimized 60-120 FPS high performance with dormant idle loop and zero GPU blurs.
 */

class ParticleFXEngine {
  constructor() {
    this.canvas = document.getElementById('fx-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.ripples = [];
    this.isLoopRunning = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const isMobile = window.innerWidth <= 768;
    // Cap DPR at 1.5 on mobile to avoid rendering millions of unnecessary pixels
    const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  startLoopIfNeeded() {
    if (!this.isLoopRunning && (this.particles.length > 0 || this.ripples.length > 0)) {
      this.isLoopRunning = true;
      requestAnimationFrame(() => this.loop());
    }
  }

  burst(x, y, type = 'sparkles', baseColor = null) {
    const isMobile = window.innerWidth <= 768;
    this.ripples.push({
      x, y,
      radius: 5,
      maxRadius: isMobile ? 60 : 85,
      alpha: 0.8,
      color: baseColor || '#FF7597'
    });

    const count = isMobile ? 12 : (type === 'confetti' ? 32 : 16);
    const colors = ['#FF6584', '#FFD166', '#06D6A0', '#118AB2', '#8338EC', '#FF9F1C'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * (isMobile ? 3.5 : 5) + 2;

      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'hearts' ? 2 : 0),
        size: Math.random() * (isMobile ? 6 : 8) + 4,
        color: baseColor || colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.025 + 0.018,
        type: type,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15
      });
    }

    this.startLoopIfNeeded();
  }

  spawnStardust(x, y, dx, dy) {
    const isMobile = window.innerWidth <= 768;
    const maxParticles = isMobile ? 20 : 60;
    if (this.particles.length > maxParticles) return;

    const colors = ['#FFF59D', '#FFD166', '#FF80AB', '#80D8FF', '#B388FF', '#A7FFEB', '#FFFFFF'];
    const count = isMobile ? 1 : (Math.random() < 0.6 ? 2 : 1);

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: -dx * 0.06 + (Math.random() - 0.5) * 1.2,
        vy: -dy * 0.06 + (Math.random() - 0.5) * 1.2 - 0.35,
        size: Math.random() * 3.5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.045 + 0.03,
        type: 'stardust',
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    this.startLoopIfNeeded();
  }

  update() {
    this.ripples.forEach(r => {
      r.radius += 3.5;
      r.alpha *= 0.92;
    });
    this.ripples = this.ripples.filter(r => r.alpha > 0.03 && r.radius < r.maxRadius);

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;

      if (p.type === 'confetti' || p.type === 'stars') {
        p.vy += 0.12;
      } else if (p.type === 'hearts') {
        p.vy -= 0.05;
      } else if (p.type === 'stardust') {
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.vy -= 0.05;
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
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();
      this.ctx.restore();
    });

    // Draw Particles - 100% fast vector paths, zero expensive shadowBlur
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rot);
      this.ctx.globalAlpha = p.alpha;

      if (p.type === 'stars') {
        const s = p.size * 1.25;
        this.ctx.fillStyle = '#FBBF24';
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const aOuter = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const aInner = aOuter + Math.PI / 5;
          if (i === 0) {
            this.ctx.moveTo(Math.cos(aOuter) * s, Math.sin(aOuter) * s);
          } else {
            this.ctx.lineTo(Math.cos(aOuter) * s, Math.sin(aOuter) * s);
          }
          this.ctx.lineTo(Math.cos(aInner) * (s * 0.45), Math.sin(aInner) * (s * 0.45));
        }
        this.ctx.closePath();
        this.ctx.fill();

        // White specular center
        this.ctx.fillStyle = '#FFFBEB';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === 'hearts') {
        const s = p.size * 1.1;
        this.ctx.fillStyle = '#F43F5E';
        this.ctx.beginPath();
        this.ctx.moveTo(0, s * 0.3);
        this.ctx.bezierCurveTo(-s * 0.6, -s * 0.5, -s, s * 0.2, 0, s);
        this.ctx.bezierCurveTo(s, s * 0.2, s * 0.6, -s * 0.5, 0, s * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (p.type === 'confetti') {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.4);
      } else if (p.type === 'stardust') {
        // Fast 4-point diamond star (No shadowBlur - 100% fast vector)
        this.ctx.fillStyle = p.color;
        const s = p.size;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -s);
        this.ctx.quadraticCurveTo(0, 0, s, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, s);
        this.ctx.quadraticCurveTo(0, 0, -s, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, -s);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Sparkle circle
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  loop() {
    this.update();
    this.draw();

    // Only continue loop if active particles exist; otherwise go dormant to save 100% CPU/GPU
    if (this.particles.length > 0 || this.ripples.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.isLoopRunning = false;
    }
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
      const isMobile = window.innerWidth <= 768;
      const throttleInterval = isMobile ? 55 : 20;
      if (now - wandThrottle < throttleInterval) return;
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
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        handleWandMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        if (window.particleFX) window.particleFX.resize();
        if (this.paint) this.paint.resizeCanvas();
        if (this.trike && this.currentTab === 'trike') this.trike.resizeCanvas();
      }, 250);
    });

    // Zero-displacement mobile viewport lock (prevents entire page from sliding left/right)
    window.addEventListener('scroll', () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
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

    // Update Tab Buttons (Safe horizontal container scroll, NEVER scrolls window)
    const navTabs = document.querySelector('.nav-tabs');
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isActive);
      if (isActive && navTabs) {
        const targetScroll = btn.offsetLeft - (navTabs.clientWidth / 2) + (btn.clientWidth / 2);
        navTabs.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
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
