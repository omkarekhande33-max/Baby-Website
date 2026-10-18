/**
 * Baby WonderLand - Lightning Trike Mini-Game
 * Premium 3D Toy-Style Parallax Runner with Volumetric Depth,
 * 3D Faceted Rotating Stars, High-Speed Star Dash Boost, Clay-Sculpted Bunny,
 * Tubular Chrome Trike, Volumetric Light Beams & Multi-Layer 3D Rolling Hills.
 * 
 * 100% Zero-Lag Hardware Accelerated Canvas Rendering.
 */

class LightningTrikeGame {
  constructor() {
    this.canvas = document.getElementById('trike-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.isRunning = false;
    this.animId = null;

    // Game State & Speeds
    this.score = 0;
    this.baseSpeed = 5.2; // Energetic, smooth cruising speed
    this.speed = 5.2;
    this.boostTimer = 0; // Lightning turbo button
    this.starBoostTimer = 0; // Star Dash Boost when touching stars!
    this.distance = 0;

    // Trike Physics & 3D Character State
    this.trike = {
      x: 180,
      y: 0,
      groundY: 0,
      vy: 0,
      gravity: 0.58,
      isGrounded: true,
      jumpForce: -13.5,
      wheelAngle: 0,
      bobAngle: 0,
      pedalAngle: 0,
      earFlex: 0,
      capeWave: 0
    };

    // 3D Collectible Stars
    this.stars = [];
    this.starSpawnTimer = 0;

    // Floating 3D Score Popups ("+1 ⭐")
    this.scorePopups = [];

    // Local 3D Speed Lines & Sparkles
    this.particles = [];
    this.speedStreaks = [];

    // Background 3D Parallax Environment
    this.hillsLayer1 = 0;
    this.hillsLayer2 = 0;
    this.hillsLayer3 = 0;

    // 3D Volumetric Clouds
    this.clouds = [
      { x: 120, y: 70, scale: 1.1, speed: 0.35, puffs: [
        { dx: 0, dy: 0, r: 42 },
        { dx: 36, dy: -12, r: 34 },
        { dx: -34, dy: 6, r: 28 },
        { dx: 68, dy: 8, r: 26 },
        { dx: 22, dy: 14, r: 24 }
      ]},
      { x: 480, y: 110, scale: 0.9, speed: 0.25, puffs: [
        { dx: 0, dy: 0, r: 48 },
        { dx: 42, dy: -10, r: 38 },
        { dx: -38, dy: 8, r: 32 },
        { dx: 72, dy: 10, r: 30 }
      ]},
      { x: 820, y: 65, scale: 1.25, speed: 0.45, puffs: [
        { dx: 0, dy: 0, r: 52 },
        { dx: 45, dy: -14, r: 40 },
        { dx: -42, dy: 8, r: 36 },
        { dx: 82, dy: 12, r: 32 }
      ]},
      { x: 1200, y: 95, scale: 0.85, speed: 0.28, puffs: [
        { dx: 0, dy: 0, r: 40 },
        { dx: 32, dy: -8, r: 30 },
        { dx: -30, dy: 6, r: 25 },
        { dx: 58, dy: 8, r: 24 }
      ]}
    ];

    // Floating 3D Hot Air Balloon in Far Background
    this.balloon = {
      x: 750,
      y: 90,
      vy: 0.05,
      bob: 0
    };

    // Pre-allocated star points geometry for lightning-fast 3D facet calculations
    this.starPoints = this.calculateStarGeometry();

    this.init();
  }

  calculateStarGeometry() {
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const aOuter = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const aInner = aOuter + Math.PI / 5;
      pts.push({
        outerX: Math.cos(aOuter),
        outerY: Math.sin(aOuter),
        innerX: Math.cos(aInner) * 0.46,
        innerY: Math.sin(aInner) * 0.46
      });
    }
    return pts;
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Tap/Click anywhere on the game canvas to jump
    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.trike-controls')) return;
      this.jump();
    });

    // Keyboard support: Space/Up for Jump, B for Bell, T for Turbo
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.jump();
      } else if (e.code === 'KeyB') {
        this.ringBell();
      } else if (e.code === 'KeyT') {
        this.turboBoost();
      }
    });

    // Control Buttons with instant touch response
    const jumpBtn = document.getElementById('trike-jump-btn');
    const bellBtn = document.getElementById('trike-bell-btn');
    const turboBtn = document.getElementById('trike-turbo-btn');

    const bindAction = (btn, action) => {
      if (!btn) return;
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        action();
      });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    };

    bindAction(jumpBtn, () => this.jump());
    bindAction(bellBtn, () => this.ringBell());
    bindAction(turboBtn, () => this.turboBoost());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.resizeCanvas();
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.score > 0 && window.babyAPI) {
      window.babyAPI.saveTrikeScore(this.score, Math.round(this.distance));
    }
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for blazing 60-120fps performance
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.groundY = this.height - 115;
    this.trike.groundY = this.groundY;
    if (this.trike.isGrounded) {
      this.trike.y = this.groundY;
    }
  }

  jump() {
    if (!this.trike.isGrounded) return;
    this.trike.vy = this.trike.jumpForce;
    this.trike.isGrounded = false;
    this.trike.earFlex = 0.5;

    if (window.babyAudio) {
      window.babyAudio.playJump();
    }

    // Burst 3D dust puffs & star sparkles at takeoff point
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.trike.x - 20 + (Math.random() - 0.5) * 20,
        y: this.groundY + 8,
        vx: -(this.speed * 0.4 + Math.random() * 3),
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 8 + 6,
        life: 1.0,
        color: '#BAE6FD',
        type: 'dust'
      });
    }

    if (window.particleFX) {
      window.particleFX.burst(this.trike.x, this.trike.y - 20, 'sparkles', '#38BDF8');
    }
  }

  ringBell() {
    if (window.babyAudio) {
      window.babyAudio.playBell();
    }
    this.bellRinging = 15;

    // Golden sound wave ripples from the brass bell
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.trike.x + 36,
        y: this.trike.y - 48,
        vx: Math.cos(i * 0.8) * 3 + 2,
        vy: Math.sin(i * 0.8) * 3 - 2,
        size: 5,
        life: 1.0,
        color: '#F59E0B',
        type: 'bell-note'
      });
    }

    if (window.particleFX) {
      window.particleFX.burst(this.trike.x + 36, this.trike.y - 48, 'stars', '#F59E0B');
    }
  }

  turboBoost() {
    if (window.babyAudio) {
      window.babyAudio.playArpeggio(4, 5, 55);
    }
    // High-speed supersonic dash!
    this.speed = this.baseSpeed * 2.3;
    this.boostTimer = 180; // ~3 seconds of boost

    // Spawn turbo shockwave burst
    for (let i = 0; i < 18; i++) {
      this.particles.push({
        x: this.trike.x - 30,
        y: this.trike.y - 15 + (Math.random() - 0.5) * 20,
        vx: -(Math.random() * 9 + 4),
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 10 + 6,
        life: 1.0,
        color: Math.random() > 0.5 ? '#F43F5E' : '#38BDF8',
        type: 'spark'
      });
    }

    if (window.particleFX) {
      window.particleFX.burst(this.trike.x, this.trike.y, 'confetti');
    }
  }

  update() {
    // -------------------------------------------------------------
    // SPEED LOGIC: Star Dash Acceleration & Lightning Turbo Boost
    // -------------------------------------------------------------
    // If Lightning Turbo is active, it takes priority
    if (this.boostTimer > 0) {
      this.boostTimer--;
      if (this.boostTimer === 0) {
        this.speed = this.starBoostTimer > 0 
          ? this.baseSpeed + (3.0 * (this.starBoostTimer / 45)) 
          : this.baseSpeed;
      }
    } else if (this.starBoostTimer > 0) {
      // Star Dash Boost: smoothly decays back to base speed
      this.starBoostTimer--;
      const boostCurve = Math.pow(this.starBoostTimer / 45, 0.7);
      this.speed = this.baseSpeed + (3.2 * boostCurve);
    } else {
      // Normal cruising speed
      this.speed = this.baseSpeed;
    }

    this.distance += this.speed;

    // Trike Vertical Physics (Jump & Gravity)
    this.trike.y += this.trike.vy;
    this.trike.vy += this.trike.gravity;

    if (this.trike.y >= this.trike.groundY) {
      if (!this.trike.isGrounded) {
        // Landing bounce
        this.trike.earFlex = -0.35;
      }
      this.trike.y = this.trike.groundY;
      this.trike.vy = 0;
      this.trike.isGrounded = true;
    }

    // Wheel, pedal & character micro-animations
    this.trike.wheelAngle += this.speed * 0.085;
    this.trike.pedalAngle += this.speed * 0.085;
    this.trike.bobAngle += 0.14;
    this.trike.capeWave += 0.22 + (this.speed * 0.03);
    this.trike.earFlex *= 0.88; // Damping spring

    if (this.bellRinging > 0) this.bellRinging--;

    // Parallax Hills Layers
    this.hillsLayer1 = (this.hillsLayer1 + this.speed * 0.2) % (this.width + 400);
    this.hillsLayer2 = (this.hillsLayer2 + this.speed * 0.45) % (this.width + 400);
    this.hillsLayer3 = (this.hillsLayer3 + this.speed * 0.85) % (this.width + 400);

    // 3D Volumetric Clouds Drift
    this.clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x < -180) c.x = this.width + 180;
    });

    // Far 3D Hot Air Balloon Floating
    this.balloon.bob += 0.03;
    this.balloon.y = 85 + Math.sin(this.balloon.bob) * 12;
    this.balloon.x -= 0.15;
    if (this.balloon.x < -100) this.balloon.x = this.width + 120;

    // -------------------------------------------------------------
    // 3D Speed Lines & Comet Exhaust Trail Particles
    // -------------------------------------------------------------
    const isBoosting = this.boostTimer > 0 || this.starBoostTimer > 0;

    // Rear wheel / exhaust particle generation
    if (Math.random() > (isBoosting ? 0.08 : 0.25)) {
      const pColor = this.boostTimer > 0 
        ? (Math.random() > 0.4 ? '#F43F5E' : '#FB7185') 
        : (this.starBoostTimer > 0 
            ? (Math.random() > 0.3 ? '#FBBF24' : '#FDE047') 
            : (Math.random() > 0.5 ? '#38BDF8' : '#7DD3FC'));

      this.particles.push({
        x: this.trike.x - 36,
        y: this.trike.y - 14 + (Math.random() - 0.5) * 10,
        vx: -(this.speed * 0.8 + Math.random() * 3.5),
        vy: (Math.random() - 0.5) * 2.2,
        life: 1.0,
        color: pColor,
        size: Math.random() * 7 + (isBoosting ? 6 : 3),
        type: isBoosting ? 'star-trail' : 'spark'
      });
    }

    // High-speed horizontal wind streaks during Star Boost or Turbo
    if (isBoosting && Math.random() > 0.3) {
      this.speedStreaks.push({
        x: this.width + 50,
        y: Math.random() * (this.height - 150) + 40,
        len: Math.random() * 90 + 50,
        speed: this.speed * 1.8 + Math.random() * 5,
        alpha: Math.random() * 0.4 + 0.3,
        color: this.boostTimer > 0 ? '#F43F5E' : '#FBBF24'
      });
    }

    // Update Particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.038;
      p.size *= 0.96;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    // Update Speed Streaks
    this.speedStreaks.forEach(s => {
      s.x -= s.speed;
      s.alpha -= 0.015;
    });
    this.speedStreaks = this.speedStreaks.filter(s => s.x > -s.len && s.alpha > 0);

    // Update Floating Score Popups (+1)
    this.scorePopups.forEach(sp => {
      sp.y += sp.vy;
      sp.life -= 0.03;
      sp.scale = Math.min(1.4, 0.8 + (1 - sp.life) * 0.8);
    });
    this.scorePopups = this.scorePopups.filter(sp => sp.life > 0);

    // -------------------------------------------------------------
    // 3D Collectible Stars Spawning & High-Speed Star Dash Collision
    // -------------------------------------------------------------
    this.starSpawnTimer++;
    if (this.starSpawnTimer > 68) {
      this.starSpawnTimer = 0;
      const isHigh = Math.random() > 0.45;
      this.stars.push({
        x: this.width + 60,
        y: isHigh ? this.groundY - 115 : this.groundY - 48,
        size: 26,
        rotY: Math.random() * Math.PI * 2,
        rotSpeed: 0.065,
        bobPhase: Math.random() * Math.PI * 2,
        collected: false
      });
    }

    // Star Collision Check
    this.stars.forEach(star => {
      star.x -= this.speed;
      star.rotY += star.rotSpeed + (isBoosting ? 0.06 : 0);

      // Smooth collision bounding check
      const dx = star.x - this.trike.x;
      const dy = (star.y + Math.sin(this.distance * 0.06 + star.bobPhase) * 5) - (this.trike.y - 32);
      const dist = Math.hypot(dx, dy);

      if (dist < 56 && !star.collected) {
        star.collected = true;
        this.score++;
        this.updateScoreUI();

        // =========================================================
        // FIX FOR "when cycle touch to star cycles speed very slow":
        // Touching a star triggers an EXHILARATING STAR DASH BOOST!
        // Instead of slowing down, the trike surges forward joyfully!
        // =========================================================
        this.starBoostTimer = 45; // ~0.75 seconds of star speed boost
        this.speed = Math.min(this.baseSpeed + 3.2, 9.4);

        // Play gentle, harmonious pentatonic chime
        if (window.babyAudio) {
          window.babyAudio.playChime(this.score % window.babyAudio.pentatonicScale.length, 1.2);
        }

        // Spawn floating 3D "+1" score popup
        this.scorePopups.push({
          x: star.x,
          y: star.y - 12,
          vy: -2.4,
          life: 1.0,
          scale: 0.8
        });

        // Spawn 3D golden star shards & radiant sparkles
        for (let i = 0; i < 12; i++) {
          const a = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.3;
          const spd = Math.random() * 5 + 3.5;
          this.particles.push({
            x: star.x,
            y: star.y,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            size: Math.random() * 7 + 4,
            life: 1.0,
            color: Math.random() > 0.4 ? '#FDE047' : '#F59E0B',
            type: 'star-shard'
          });
        }

        if (window.particleFX) {
          window.particleFX.burst(star.x, star.y, 'stars', '#F59E0B');
        }

        // Milestone achievement celebration
        if (this.score === 5 || this.score === 15) {
          if (window.babyAudio) {
            window.babyAudio.playArpeggio(3, 5, 75);
          }
          if (window.particleFX) {
            window.particleFX.burst(this.trike.x, this.trike.y - 45, 'confetti');
          }
        }
      }
    });

    this.stars = this.stars.filter(s => !s.collected && s.x > -80);
  }

  updateScoreUI() {
    const scoreEl = document.getElementById('trike-score-val');
    if (scoreEl) {
      scoreEl.textContent = this.score;
      scoreEl.style.transform = 'scale(1.4)';
      setTimeout(() => scoreEl.style.transform = 'scale(1)', 160);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const isNight = document.body.classList.contains('night-mode');

    // 1. 3D Atmospheric Sky Dome with Sun / Moon & God Rays
    this.draw3DSky(isNight);

    // 2. Far 3D Hot Air Balloon & Background Elements
    this.draw3DHotAirBalloon(isNight);

    // 3. 3D Volumetric Fluffy Clouds
    this.draw3DClouds(isNight);

    // 4. Multi-Layer 3D Rolling Parallax Hills
    this.draw3DHills(isNight);

    // 5. 3D Beveled Rainbow Highway Ribbon & Grassy Banks
    this.draw3DRoad(isNight);

    // 6. 3D Faceted Rotating Golden Stars
    this.draw3DStars();

    // 7. Speed Streaks & Comet Trail Particles
    this.drawSpeedStreaks();
    this.drawParticles();

    // 8. 3D Dynamic Contact Shadow on Road
    this.draw3DContactShadow();

    // 9. 3D Chunky Toy Tricycle & Sculpted Clay Bunny Rider
    this.draw3DTrikeAndRider(isNight);

    // 10. Floating 3D Score Popups (+1)
    this.drawScorePopups();
  }

  // =========================================================================
  // 1. 3D ATMOSPHERIC SKY & CELESTIAL BODIES
  // =========================================================================
  draw3DSky(isNight) {
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    if (isNight) {
      skyGrad.addColorStop(0, '#0F172A');
      skyGrad.addColorStop(0.55, '#1E1B4B');
      skyGrad.addColorStop(1, '#312E81');
    } else {
      skyGrad.addColorStop(0, '#7DD3FC');
      skyGrad.addColorStop(0.5, '#BAE6FD');
      skyGrad.addColorStop(0.85, '#E0F2FE');
      skyGrad.addColorStop(1, '#FEF9C3');
    }
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (isNight) {
      // 3D Glowing Crescent Moon
      const mx = this.width - 130;
      const my = 90;
      
      // Outer Lunar Glow
      const moonGlow = this.ctx.createRadialGradient(mx, my, 10, mx, my, 70);
      moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      moonGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.15)');
      moonGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
      this.ctx.fillStyle = moonGlow;
      this.ctx.beginPath();
      this.ctx.arc(mx, my, 70, 0, Math.PI * 2);
      this.ctx.fill();

      // Crescent Moon Body
      this.ctx.fillStyle = '#FEF08A';
      this.ctx.beginPath();
      this.ctx.arc(mx, my, 32, 0, Math.PI * 2);
      this.ctx.fill();

      // Cutout for Crescent
      this.ctx.fillStyle = '#1E1B4B';
      this.ctx.beginPath();
      this.ctx.arc(mx + 12, my - 6, 26, 0, Math.PI * 2);
      this.ctx.fill();

      // Twinkling Background 3D Diamond Stars
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 137.5 + this.hillsLayer1 * 0.1) % this.width);
        const sy = (i * 29) % (this.groundY - 140) + 20;
        const sSize = (i % 3 === 0) ? 3.5 : 2;
        const twinkle = 0.5 + Math.sin(this.distance * 0.05 + i) * 0.4;
        
        this.ctx.save();
        this.ctx.translate(sx, sy);
        this.ctx.fillStyle = `rgba(254, 249, 195, ${twinkle})`;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -sSize);
        this.ctx.lineTo(sSize, 0);
        this.ctx.lineTo(0, sSize);
        this.ctx.lineTo(-sSize, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      }
    } else {
      // 3D Radiant Sun with Corona & God Rays
      const sunX = this.width - 140;
      const sunY = 95;

      const sunGlow = this.ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 120);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
      sunGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.25)');
      sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      this.ctx.fillStyle = sunGlow;
      this.ctx.beginPath();
      this.ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
      this.ctx.fill();

      // Sun Core with 3D Sphere Shading
      const sunCore = this.ctx.createRadialGradient(sunX - 10, sunY - 10, 5, sunX, sunY, 36);
      sunCore.addColorStop(0, '#FFFFFF');
      sunCore.addColorStop(0.3, '#FEF08A');
      sunCore.addColorStop(0.85, '#F59E0B');
      sunCore.addColorStop(1, '#D97706');
      this.ctx.fillStyle = sunCore;
      this.ctx.beginPath();
      this.ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // =========================================================================
  // 2. 3D VOLUMETRIC HOT AIR BALLOON (Far Background)
  // =========================================================================
  draw3DHotAirBalloon(isNight) {
    if (isNight) return;
    const b = this.balloon;
    this.ctx.save();
    this.ctx.translate(b.x, b.y);

    // Balloon Sphere Volume
    const bGrad = this.ctx.createRadialGradient(-8, -12, 4, 0, 0, 28);
    bGrad.addColorStop(0, '#FFF1F2');
    bGrad.addColorStop(0.4, '#FB7185');
    bGrad.addColorStop(1, '#BE123C');
    this.ctx.fillStyle = bGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
    this.ctx.fill();

    // Vertical Curved Stripes (Perspective foreshortening)
    this.ctx.strokeStyle = '#FEF08A';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 12, 23.5, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Little 3D Wicker Basket
    this.ctx.fillStyle = '#B45309';
    this.ctx.fillRect(-6, 32, 12, 9);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(-4, 24);
    this.ctx.lineTo(-4, 32);
    this.ctx.moveTo(4, 24);
    this.ctx.lineTo(4, 32);
    this.ctx.stroke();

    this.ctx.restore();
  }

  // =========================================================================
  // 3. 3D VOLUMETRIC CLOUDS (Multi-shaded Puffy Spheres)
  // =========================================================================
  draw3DClouds(isNight) {
    this.clouds.forEach(c => {
      this.ctx.save();
      this.ctx.translate(c.x, c.y);
      this.ctx.scale(c.scale, c.scale);

      // Render each sphere puff with soft top-left key lighting and ambient underbelly
      c.puffs.forEach(puff => {
        const cx = puff.dx;
        const cy = puff.dy;
        const r = puff.r;

        const puffGrad = this.ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
        if (isNight) {
          puffGrad.addColorStop(0, 'rgba(226, 232, 240, 0.45)');
          puffGrad.addColorStop(0.7, 'rgba(148, 163, 184, 0.35)');
          puffGrad.addColorStop(1, 'rgba(71, 85, 105, 0.25)');
        } else {
          puffGrad.addColorStop(0, '#FFFFFF');
          puffGrad.addColorStop(0.55, '#F8FAFC');
          puffGrad.addColorStop(0.85, '#E2E8F0');
          puffGrad.addColorStop(1, '#CBD5E1'); // Underbelly volume shadow
        }

        this.ctx.fillStyle = puffGrad;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();

        // Top Sunlight Rim Highlight
        if (!isNight) {
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          this.ctx.lineWidth = 2.5;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, r - 1.5, Math.PI * 1.1, Math.PI * 1.8);
          this.ctx.stroke();
        }
      });

      this.ctx.restore();
    });
  }

  // =========================================================================
  // 4. 3D MULTI-LAYER ROLLING PARALLAX HILLS
  // =========================================================================
  draw3DHills(isNight) {
    // -------------------------------------------------------------
    // Layer 1: Distant Misty Mountain Ridges (Lavender / Cosmic Indigo)
    // -------------------------------------------------------------
    const hillGrad1 = this.ctx.createLinearGradient(0, this.height - 240, 0, this.height);
    if (isNight) {
      hillGrad1.addColorStop(0, '#312E81');
      hillGrad1.addColorStop(1, '#1E1B4B');
    } else {
      hillGrad1.addColorStop(0, '#C7D2FE');
      hillGrad1.addColorStop(0.6, '#A5B4FC');
      hillGrad1.addColorStop(1, '#818CF8');
    }
    this.ctx.fillStyle = hillGrad1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width + 40; x += 40) {
      const y = (this.height - 200) + Math.sin((x + this.hillsLayer1) * 0.0035) * 65;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(this.width, this.height);
    this.ctx.fill();

    // -------------------------------------------------------------
    // Layer 2: Mid-Distance Rolling Hills (Mint Jade / Deep Teal)
    // -------------------------------------------------------------
    const hillGrad2 = this.ctx.createLinearGradient(0, this.height - 180, 0, this.height);
    if (isNight) {
      hillGrad2.addColorStop(0, '#065F46');
      hillGrad2.addColorStop(1, '#022C22');
    } else {
      hillGrad2.addColorStop(0, '#A7F3D0');
      hillGrad2.addColorStop(0.5, '#6EE7B7');
      hillGrad2.addColorStop(1, '#34D399');
    }
    this.ctx.fillStyle = hillGrad2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width + 30; x += 30) {
      const y = (this.height - 155) + Math.cos((x + this.hillsLayer2) * 0.006) * 45;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(this.width, this.height);
    this.ctx.fill();

    // Layer 2 Top Sunlit Bevel Rim
    this.ctx.strokeStyle = isNight ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.65)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // -------------------------------------------------------------
    // Layer 3: Vibrant Foreground Rolling Hills (Emerald Spring Green)
    // -------------------------------------------------------------
    const hillGrad3 = this.ctx.createLinearGradient(0, this.height - 130, 0, this.height);
    if (isNight) {
      hillGrad3.addColorStop(0, '#047857');
      hillGrad3.addColorStop(1, '#064E3B');
    } else {
      hillGrad3.addColorStop(0, '#4ADE80');
      hillGrad3.addColorStop(0.4, '#22C55E');
      hillGrad3.addColorStop(1, '#16A34A');
    }
    this.ctx.fillStyle = hillGrad3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width + 30; x += 30) {
      const y = (this.height - 120) + Math.sin((x + this.hillsLayer3) * 0.009) * 28;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(this.width, this.height);
    this.ctx.fill();
  }

  // =========================================================================
  // 5. 3D RAINBOW HIGHWAY & VOLUMETRIC SCENERY (Road, Flowers, Mushrooms)
  // =========================================================================
  draw3DRoad(isNight) {
    const roadY = this.groundY + 12;
    const roadHeight = 22;

    // 3D Grassy Meadow Bank (Under the track)
    const grassGrad = this.ctx.createLinearGradient(0, this.groundY, 0, this.height);
    if (isNight) {
      grassGrad.addColorStop(0, '#064E3B');
      grassGrad.addColorStop(1, '#022C22');
    } else {
      grassGrad.addColorStop(0, '#10B981');
      grassGrad.addColorStop(0.4, '#059669');
      grassGrad.addColorStop(1, '#047857');
    }
    this.ctx.fillStyle = grassGrad;
    this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    // 3D Curved Road Curb / Top Rim (Glossy white pipe reflection)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    this.ctx.fillRect(0, roadY - 3, this.width, 3);

    // 6-Band Vibrant 3D Cylindrical Rainbow Highway
    const rainbowColors = [
      { top: '#FB7185', bot: '#E11D48' }, // Pink-Red
      { top: '#FB923C', bot: '#EA580C' }, // Warm Orange
      { top: '#FDE047', bot: '#CA8A04' }, // Turbo Yellow
      { top: '#4ADE80', bot: '#16A34A' }, // Emerald Green
      { top: '#38BDF8', bot: '#0284C7' }, // Electric Cyan
      { top: '#C084FC', bot: '#7E22CE' }  // Cosmic Violet
    ];

    const stripeH = roadHeight / rainbowColors.length;
    rainbowColors.forEach((band, idx) => {
      const sy = roadY + idx * stripeH;
      const bGrad = this.ctx.createLinearGradient(0, sy, 0, sy + stripeH);
      bGrad.addColorStop(0, band.top);
      bGrad.addColorStop(1, band.bot);
      this.ctx.fillStyle = bGrad;
      this.ctx.fillRect(0, sy, this.width, stripeH);
    });

    // Glassy Specular Surface Sheen across the rainbow road
    const sheenGrad = this.ctx.createLinearGradient(0, roadY, 0, roadY + roadHeight);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    sheenGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.15)');
    sheenGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.05)');
    sheenGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    this.ctx.fillStyle = sheenGrad;
    this.ctx.fillRect(0, roadY, this.width, roadHeight);

    // Bottom Road Curb Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.fillRect(0, roadY + roadHeight, this.width, 4);

    // Dynamic Moving Highway Dashes (Emphasizes forward speed)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const dashSpacing = 70;
    const dashOffset = (this.distance * 1.2) % dashSpacing;
    for (let dx = -dashSpacing; dx < this.width + dashSpacing; dx += dashSpacing) {
      this.ctx.fillRect(dx - dashOffset, roadY + (roadHeight / 2) - 1.5, 24, 3);
    }

    // -------------------------------------------------------------
    // 3D Clay Flowers & Polka-Dot Mushrooms Along Grassy Bank
    // (Vector drawn: 100% zero emoji overhead for max FPS)
    // -------------------------------------------------------------
    const propSpacing = 160;
    const propOffset = this.distance % propSpacing;
    for (let px = -propSpacing; px < this.width + propSpacing; px += propSpacing) {
      const flowerX = px - propOffset + 35;
      const flowerY = this.groundY + 54;
      this.draw3DFlower(flowerX, flowerY);

      const mushX = px - propOffset + 115;
      const mushY = this.groundY + 56;
      this.draw3DMushroom(mushX, mushY);
    }
  }

  draw3DFlower(x, y) {
    this.ctx.save();
    this.ctx.translate(x, y);

    // Stem
    this.ctx.strokeStyle = '#059669';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.quadraticCurveTo(4, 10, 2, 18);
    this.ctx.stroke();

    // 5 Volumetric 3D Petals
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5;
      const px = Math.cos(a) * 9;
      const py = Math.sin(a) * 9;

      const pGrad = this.ctx.createRadialGradient(px - 2, py - 2, 1, px, py, 6);
      pGrad.addColorStop(0, '#FFF1F2');
      pGrad.addColorStop(0.6, '#F472B6');
      pGrad.addColorStop(1, '#DB2777');
      this.ctx.fillStyle = pGrad;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 5.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3D Spherical Pistil Center (Yellow button with specular shine)
    const cGrad = this.ctx.createRadialGradient(-2, -2, 1, 0, 0, 5.5);
    cGrad.addColorStop(0, '#FEF08A');
    cGrad.addColorStop(0.7, '#F59E0B');
    cGrad.addColorStop(1, '#B45309');
    this.ctx.fillStyle = cGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  draw3DMushroom(x, y) {
    this.ctx.save();
    this.ctx.translate(x, y);

    // Stem
    this.ctx.fillStyle = '#FEF3C7';
    this.ctx.beginPath();
    this.ctx.moveTo(-3, 0);
    this.ctx.lineTo(-4, 14);
    this.ctx.lineTo(4, 14);
    this.ctx.lineTo(3, 0);
    this.ctx.closePath();
    this.ctx.fill();

    // 3D Red Mushroom Dome Cap
    const capGrad = this.ctx.createRadialGradient(-3, -6, 2, 0, -2, 12);
    capGrad.addColorStop(0, '#FDA4AF');
    capGrad.addColorStop(0.4, '#EF4444');
    capGrad.addColorStop(1, '#991B1B');
    this.ctx.fillStyle = capGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 11, Math.PI, 0);
    this.ctx.closePath();
    this.ctx.fill();

    // White Polka Dots
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(0, -6, 2.2, 0, Math.PI * 2);
    this.ctx.arc(-5, -3, 1.8, 0, Math.PI * 2);
    this.ctx.arc(5, -3, 1.8, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // =========================================================================
  // 6. 3D FACETED ROTATING GOLDEN STARS
  // =========================================================================
  draw3DStars() {
    this.stars.forEach(star => {
      const bob = Math.sin(this.distance * 0.06 + star.bobPhase) * 6;
      this.drawSingle3DStar(star.x, star.y + bob, star.size, star.rotY);
    });
  }

  drawSingle3DStar(cx, cy, size, rotY) {
    this.ctx.save();
    this.ctx.translate(cx, cy);

    // 1. Soft Pulsing 3D Golden Aura Halo
    const auraGrad = this.ctx.createRadialGradient(0, 0, size * 0.4, 0, 0, size * 1.4);
    auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    auraGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
    auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    this.ctx.fillStyle = auraGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. 3D Faceted Polygonal Star Projected Around Y-Axis
    // We compute 5 points with raised center ridge (Z-axis extrusion)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const zExtrusion = size * 0.38;

    // Light direction vector: [-0.4, -0.8, 0.8]
    const lx = -0.4;
    const ly = -0.8;
    const lz = 0.8;

    // Center apex projected
    const centerApexX = 0;
    const centerApexY = 0;
    const centerApexZ = zExtrusion * cosY;

    // Project each of the 5 points & inner vertices
    const projPoints = [];
    for (let i = 0; i < 5; i++) {
      const pt = this.starPoints[i];
      // Outer Tip
      const ox = pt.outerX * size;
      const oy = pt.outerY * size;
      const px = ox * cosY;
      const pz = ox * sinY;

      // Inner Valley
      const ix = pt.innerX * size;
      const iy = pt.innerY * size;
      const vix = ix * cosY;
      const viz = ix * sinY;

      projPoints.push({
        outerX: px,
        outerY: oy,
        outerZ: pz,
        innerX: vix,
        innerY: iy,
        innerZ: viz
      });
    }

    // Draw the 10 3D facets (Left & Right facets for each tip)
    for (let i = 0; i < 5; i++) {
      const curr = projPoints[i];
      const prevInner = projPoints[(i + 4) % 5];
      const nextInner = curr;

      // Left Facet (prevInner -> outer -> centerApex)
      this.drawStarFacet(
        prevInner.innerX, prevInner.innerY,
        curr.outerX, curr.outerY,
        centerApexX, centerApexY,
        true, cosY
      );

      // Right Facet (centerApex -> outer -> nextInner)
      this.drawStarFacet(
        centerApexX, centerApexY,
        curr.outerX, curr.outerY,
        nextInner.innerX, nextInner.innerY,
        false, cosY
      );
    }

    // 3. Central Specular Star Glint (Twinkling light star on top)
    const glintSize = size * 0.42;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -glintSize);
    this.ctx.quadraticCurveTo(0, 0, glintSize, 0);
    this.ctx.quadraticCurveTo(0, 0, 0, glintSize);
    this.ctx.quadraticCurveTo(0, 0, -glintSize, 0);
    this.ctx.quadraticCurveTo(0, 0, 0, -glintSize);
    this.ctx.closePath();
    this.ctx.fill();

    // 4. Orbiting Fairy Stardust Orbs in 3D perspective
    for (let j = 0; j < 2; j++) {
      const orbAngle = rotY * 1.5 + j * Math.PI;
      const orbR = size * 1.25;
      const ox = Math.cos(orbAngle) * orbR;
      const oy = Math.sin(orbAngle) * (orbR * 0.4);

      this.ctx.fillStyle = '#FEF08A';
      this.ctx.beginPath();
      this.ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawStarFacet(x1, y1, x2, y2, x3, y3, isLeft, cosY) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.closePath();

    // 3D Shading calculation based on rotation and facet orientation
    let brightness = isLeft ? 0.75 + (cosY * 0.25) : 0.55 - (cosY * 0.25);
    brightness = Math.max(0.3, Math.min(1.0, brightness));

    if (brightness > 0.8) {
      this.ctx.fillStyle = '#FFFBEB'; // Bright specular shine
    } else if (brightness > 0.65) {
      this.ctx.fillStyle = '#FDE047'; // Vivid metallic gold
    } else if (brightness > 0.48) {
      this.ctx.fillStyle = '#F59E0B'; // Warm amber gold
    } else {
      this.ctx.fillStyle = '#D97706'; // Deep warm shadow
    }

    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    this.ctx.lineWidth = 0.6;
    this.ctx.stroke();
  }

  // =========================================================================
  // 7. SPEED STREAKS & COMET DUST PARTICLES
  // =========================================================================
  drawSpeedStreaks() {
    this.speedStreaks.forEach(s => {
      this.ctx.save();
      this.ctx.strokeStyle = s.color;
      this.ctx.globalAlpha = s.alpha;
      this.ctx.lineWidth = 2.5;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(s.x + s.len, s.y);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.life);

      if (p.type === 'star-shard') {
        this.ctx.fillStyle = p.color;
        this.ctx.translate(p.x, p.y);
        const s = p.size;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -s);
        this.ctx.lineTo(s * 0.7, 0);
        this.ctx.lineTo(0, s);
        this.ctx.lineTo(-s * 0.7, 0);
        this.ctx.closePath();
        this.ctx.fill();
      } else if (p.type === 'star-trail') {
        const sGrad = this.ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.size);
        sGrad.addColorStop(0, '#FFFFFF');
        sGrad.addColorStop(0.5, p.color);
        sGrad.addColorStop(1, 'rgba(255,255,255,0)');
        this.ctx.fillStyle = sGrad;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  // =========================================================================
  // 8. 3D DYNAMIC CONTACT SHADOW ON ROAD (Height-sensitive)
  // =========================================================================
  draw3DContactShadow() {
    const heightAboveGround = Math.max(0, this.groundY - this.trike.y);
    const shadowY = this.groundY + 8;
    const shadowX = this.trike.x + 2;

    // When jumping higher, shadow expands, softens, and reduces opacity
    const scaleFactor = 1 + (heightAboveGround * 0.005);
    const rx = 36 * scaleFactor;
    const ry = Math.max(4, 9 - heightAboveGround * 0.02);
    const alpha = Math.max(0.12, 0.45 - heightAboveGround * 0.0028);

    const sGrad = this.ctx.createRadialGradient(shadowX, shadowY, 2, shadowX, shadowY, rx);
    sGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
    sGrad.addColorStop(0.5, `rgba(0, 0, 0, ${alpha * 0.5})`);
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = sGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(shadowX, shadowY, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // =========================================================================
  // 9. 3D CHUNKY TOY TRICYCLE & SCULPTED CLAY BUNNY RIDER
  // =========================================================================
  draw3DTrikeAndRider(isNight) {
    this.ctx.save();
    const bob = Math.sin(this.trike.bobAngle) * 3.5;
    const x = this.trike.x;
    const y = this.trike.y + bob;

    this.ctx.translate(x, y);

    // -------------------------------------------------------------
    // A. Rear Dual Wheels (Volumetric 3D Tires & Chrome Rims)
    // -------------------------------------------------------------
    this.draw3DWheel(-32, -10, 16, this.trike.wheelAngle);

    // -------------------------------------------------------------
    // B. Glossy 3D Tubular Trike Frame (Cherry Turbo Red)
    // -------------------------------------------------------------
    // Rear Axle to Seat Post Tube
    this.draw3DTube(-32, -10, 0, -25, '#EF4444', 8);
    // Seat Post to Front Fork Tube
    this.draw3DTube(0, -25, 28, -12, '#EF4444', 8);

    // Ergonomic 3D Saddle Seat (Plush dark leather cushion)
    const seatGrad = this.ctx.createRadialGradient(-3, -29, 2, 0, -27, 14);
    seatGrad.addColorStop(0, '#334155');
    seatGrad.addColorStop(0.6, '#1E293B');
    seatGrad.addColorStop(1, '#0F172A');
    this.ctx.fillStyle = seatGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(0, -27, 13, 6, -0.15, 0, Math.PI * 2);
    this.ctx.fill();

    // -------------------------------------------------------------
    // C. 3D Handlebar Column & Chrome Bell
    // -------------------------------------------------------------
    this.draw3DTube(28, -12, 22, -45, '#0284C7', 6);
    this.draw3DTube(22, -45, 30, -47, '#0284C7', 6);

    // Handlebar Rubber Grips
    this.ctx.fillStyle = '#0F172A';
    this.ctx.beginPath();
    this.ctx.ellipse(32, -47, 5, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 3D Brass Bell with gleam reflection
    const bellGrad = this.ctx.createRadialGradient(23, -51, 1, 24, -49, 7);
    bellGrad.addColorStop(0, '#FEF08A');
    bellGrad.addColorStop(0.5, '#F59E0B');
    bellGrad.addColorStop(1, '#B45309');
    this.ctx.fillStyle = bellGrad;
    this.ctx.beginPath();
    this.ctx.arc(24, -49, 7, 0, Math.PI * 2);
    this.ctx.fill();

    if (this.bellRinging > 0) {
      // Vibration rings
      this.ctx.strokeStyle = '#FEF08A';
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();
      this.ctx.arc(24, -49, 10 + (15 - this.bellRinging) * 0.8, -Math.PI * 0.8, -Math.PI * 0.1);
      this.ctx.stroke();
    }

    // -------------------------------------------------------------
    // D. 3D Headlight & Volumetric Conical Light Beam
    // -------------------------------------------------------------
    this.draw3DHeadlight(28, -39, isNight);

    // -------------------------------------------------------------
    // E. Front Big Wheel (Large Chunky Tire, Gold Rim & Spokes)
    // -------------------------------------------------------------
    this.draw3DWheel(28, -12, 21, this.trike.wheelAngle);

    // -------------------------------------------------------------
    // F. Animated Pedals & Cranks (Synchronized with wheel angle)
    // -------------------------------------------------------------
    this.draw3DPedals(28, -12, this.trike.pedalAngle);

    // -------------------------------------------------------------
    // G. Turbo Thruster Exhaust & Plasma Flame (Behind seat)
    // -------------------------------------------------------------
    this.draw3DThruster(-14, -22);

    // -------------------------------------------------------------
    // H. 3D Sculpted Clay Bunny Rider (Head, Ears, Onesie, Cape)
    // -------------------------------------------------------------
    this.draw3DBunnyRider(0, -29);

    this.ctx.restore();
  }

  draw3DWheel(cx, cy, r, angle) {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(angle);

    // Outer Thick 3D Rubber Tire with Depth Bevel
    const tireGrad = this.ctx.createRadialGradient(0, 0, r * 0.65, 0, 0, r);
    tireGrad.addColorStop(0, '#334155');
    tireGrad.addColorStop(0.4, '#1E293B');
    tireGrad.addColorStop(0.85, '#0F172A');
    tireGrad.addColorStop(1, '#020617');
    this.ctx.fillStyle = tireGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    this.ctx.fill();

    // Tire Tread Grooves
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(r * 0.82, 0);
      this.ctx.lineTo(r, 0);
      this.ctx.stroke();
      this.ctx.rotate(Math.PI / 4);
    }

    // 3D Metallic Golden Rim with Inset Shadow
    const rimGrad = this.ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r * 0.68);
    rimGrad.addColorStop(0, '#FEF08A');
    rimGrad.addColorStop(0.45, '#FBBF24');
    rimGrad.addColorStop(0.85, '#F59E0B');
    rimGrad.addColorStop(1, '#B45309');
    this.ctx.fillStyle = rimGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    this.ctx.fill();

    // Chrome Spokes (4 crossing pairs)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(-r * 0.62, 0);
      this.ctx.lineTo(r * 0.62, 0);
      this.ctx.stroke();
      this.ctx.rotate(Math.PI / 4);
    }

    // 3D Chrome Center Axle Hub
    const hubGrad = this.ctx.createRadialGradient(-2, -2, 1, 0, 0, r * 0.26);
    hubGrad.addColorStop(0, '#FFFFFF');
    hubGrad.addColorStop(0.3, '#E2E8F0');
    hubGrad.addColorStop(0.7, '#EF4444');
    hubGrad.addColorStop(1, '#991B1B');
    this.ctx.fillStyle = hubGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r * 0.26, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  draw3DTube(x1, y1, x2, y2, color, thickness) {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();

    // 3D Cylindrical Highlight Streak (White gloss along the top of tube)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    this.ctx.lineWidth = thickness * 0.32;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1 - 1.5);
    this.ctx.lineTo(x2, y2 - 1.5);
    this.ctx.stroke();

    this.ctx.restore();
  }

  draw3DHeadlight(hx, hy, isNight) {
    this.ctx.save();

    // Chrome Housing Bucket
    const bucketGrad = this.ctx.createRadialGradient(hx - 2, hy - 2, 1, hx, hy, 9);
    bucketGrad.addColorStop(0, '#FFFFFF');
    bucketGrad.addColorStop(0.4, '#CBD5E1');
    bucketGrad.addColorStop(1, '#475569');
    this.ctx.fillStyle = bucketGrad;
    this.ctx.beginPath();
    this.ctx.arc(hx, hy, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Rounded Glass Lens
    this.ctx.fillStyle = '#FEF9C3';
    this.ctx.beginPath();
    this.ctx.ellipse(hx + 5, hy, 3, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Volumetric Conical Light Beam
    const beamLen = isNight ? 220 : 130;
    const beamGrad = this.ctx.createLinearGradient(hx + 6, hy, hx + beamLen, hy);
    beamGrad.addColorStop(0, isNight ? 'rgba(254, 240, 138, 0.75)' : 'rgba(254, 240, 138, 0.45)');
    beamGrad.addColorStop(0.35, isNight ? 'rgba(254, 240, 138, 0.35)' : 'rgba(254, 240, 138, 0.15)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

    this.ctx.fillStyle = beamGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(hx + 6, hy - 4);
    this.ctx.lineTo(hx + beamLen, hy - 36);
    this.ctx.lineTo(hx + beamLen, hy + 38);
    this.ctx.lineTo(hx + 6, hy + 4);
    this.ctx.closePath();
    this.ctx.fill();

    // Floating Dust Motes inside the light beam
    if (isNight) {
      for (let i = 0; i < 5; i++) {
        const mx = hx + 20 + ((this.distance * 1.5 + i * 35) % (beamLen - 40));
        const my = hy + Math.sin(this.distance * 0.1 + i) * 14;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  draw3DPedals(cx, cy, angle) {
    this.ctx.save();
    this.ctx.translate(cx, cy);

    const crankR = 9;
    const px1 = Math.cos(angle) * crankR;
    const py1 = Math.sin(angle) * crankR;
    const px2 = -px1;
    const py2 = -py1;

    // Chrome Crank Arms
    this.ctx.strokeStyle = '#E2E8F0';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(px2, py2);
    this.ctx.lineTo(px1, py1);
    this.ctx.stroke();

    // Rubber Pedal Blocks (Stay horizontal while orbiting)
    this.ctx.fillStyle = '#0F172A';
    this.ctx.fillRect(px1 - 4, py1 - 2, 8, 4);
    this.ctx.fillRect(px2 - 4, py2 - 2, 8, 4);

    this.ctx.restore();
  }

  draw3DThruster(tx, ty) {
    const isBoosting = this.boostTimer > 0 || this.starBoostTimer > 0;
    this.ctx.save();
    this.ctx.translate(tx, ty);

    // Chrome Rocket Exhaust Nozzle
    this.ctx.fillStyle = '#475569';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -6);
    this.ctx.lineTo(-10, -8);
    this.ctx.lineTo(-10, 8);
    this.ctx.lineTo(0, 6);
    this.ctx.closePath();
    this.ctx.fill();

    // High-Speed Plasma Jet Flames when boosting
    if (isBoosting) {
      const flameLen = this.boostTimer > 0 ? 34 : 22;
      const fGrad = this.ctx.createLinearGradient(0, 0, -flameLen, 0);
      fGrad.addColorStop(0, '#FFFFFF');
      fGrad.addColorStop(0.3, '#38BDF8');
      fGrad.addColorStop(0.7, '#F43F5E');
      fGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');

      this.ctx.fillStyle = fGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(-10, -7);
      this.ctx.lineTo(-10 - flameLen - Math.random() * 8, 0);
      this.ctx.lineTo(-10, 7);
      this.ctx.closePath();
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  draw3DBunnyRider(rx, ry) {
    this.ctx.save();
    this.ctx.translate(rx, ry);

    // -------------------------------------------------------------
    // 1. Dynamic 3D Hero Cape (Flows with wind & speed)
    // -------------------------------------------------------------
    const isBoosting = this.boostTimer > 0 || this.starBoostTimer > 0;
    const capeLen = isBoosting ? 44 : 32;
    const capeWave = Math.sin(this.trike.capeWave) * 8;

    const capeGrad = this.ctx.createLinearGradient(0, -10, -capeLen, 0);
    capeGrad.addColorStop(0, '#FB7185');
    capeGrad.addColorStop(0.5, '#F43F5E');
    capeGrad.addColorStop(1, '#BE123C');
    this.ctx.fillStyle = capeGrad;

    this.ctx.beginPath();
    this.ctx.moveTo(-6, -12);
    this.ctx.quadraticCurveTo(-capeLen * 0.5, -16 + capeWave, -capeLen, -6 + capeWave * 1.4);
    this.ctx.lineTo(-capeLen * 0.85, -2 + capeWave);
    this.ctx.quadraticCurveTo(-capeLen * 0.4, -4, -4, -6);
    this.ctx.closePath();
    this.ctx.fill();

    // -------------------------------------------------------------
    // 2. 3D Sculpted Onesie Body (Cozy Sky-Blue Clay Torso)
    // -------------------------------------------------------------
    const bodyGrad = this.ctx.createRadialGradient(-3, -12, 3, 0, -8, 16);
    bodyGrad.addColorStop(0, '#BAE6FD');
    bodyGrad.addColorStop(0.4, '#38BDF8');
    bodyGrad.addColorStop(0.85, '#0284C7');
    bodyGrad.addColorStop(1, '#0369A1');
    this.ctx.fillStyle = bodyGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(0, -8, 15, 17, 0.22, 0, Math.PI * 2);
    this.ctx.fill();

    // 3D Arms Reaching to Handlebars
    this.ctx.strokeStyle = '#38BDF8';
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(4, -12);
    this.ctx.quadraticCurveTo(16, -18, 30, -18);
    this.ctx.stroke();

    // Little White Bunny Paws Gripping Handlebar
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(30, -18, 4.5, 0, Math.PI * 2);
    this.ctx.fill();

    // -------------------------------------------------------------
    // 3. 3D Volumetric Sculpted Bunny Head (Clay Sphere)
    // -------------------------------------------------------------
    const headX = 6;
    const headY = -30;
    const headR = 16;

    const headGrad = this.ctx.createRadialGradient(headX - 5, headY - 6, 3, headX, headY, headR);
    headGrad.addColorStop(0, '#FFFFFF');
    headGrad.addColorStop(0.55, '#F8FAFC');
    headGrad.addColorStop(0.85, '#E2E8F0');
    headGrad.addColorStop(1, '#CBD5E1'); // Ambient occlusion under chin
    this.ctx.fillStyle = headGrad;
    this.ctx.beginPath();
    this.ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    this.ctx.fill();

    // -------------------------------------------------------------
    // 4. 3D Floppy Bunny Long Ears (Reactive spring flex physics)
    // -------------------------------------------------------------
    const earTilt = -0.18 + (this.trike.earFlex * 0.4) - (this.speed * 0.02);

    // Left Ear
    this.draw3DEar(headX - 6, headY - 14, 5, 14, earTilt - 0.12);
    // Right Ear
    this.draw3DEar(headX + 4, headY - 15, 5, 14, earTilt + 0.1);

    // -------------------------------------------------------------
    // 5. 3D Aviator Goggles (Chrome rim, amber glass, specular reflection)
    // -------------------------------------------------------------
    // Dark Leather Strap
    this.ctx.fillStyle = '#0F172A';
    this.ctx.fillRect(headX - 14, headY - 5, 28, 5);

    // Left Lens
    this.draw3DGoggleLens(headX - 4, headY - 3, 5);
    // Right Lens
    this.draw3DGoggleLens(headX + 7, headY - 3, 5);

    // -------------------------------------------------------------
    // 6. Cute Rosy Cheeks, Happy Smile & Cute Bunny Nose
    // -------------------------------------------------------------
    // Rosy Pink Airbrushed Cheeks
    this.ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
    this.ctx.beginPath();
    this.ctx.arc(headX - 4, headY + 5, 3.5, 0, Math.PI * 2);
    this.ctx.arc(headX + 9, headY + 5, 3.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Tiny Pink Button Nose
    this.ctx.fillStyle = '#FB7185';
    this.ctx.beginPath();
    this.ctx.ellipse(headX + 3, headY + 4, 2.5, 1.8, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Cheerful Smile
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1.4;
    this.ctx.beginPath();
    this.ctx.arc(headX + 3, headY + 5, 3.2, 0.1, Math.PI * 0.9);
    this.ctx.stroke();

    this.ctx.restore();
  }

  draw3DEar(ex, ey, rx, ry, angle) {
    this.ctx.save();
    this.ctx.translate(ex, ey);
    this.ctx.rotate(angle);

    // Outer Soft White Ear Volume
    const earGrad = this.ctx.createRadialGradient(-rx * 0.3, -ry * 0.3, 2, 0, 0, ry);
    earGrad.addColorStop(0, '#FFFFFF');
    earGrad.addColorStop(0.7, '#F1F5F9');
    earGrad.addColorStop(1, '#CBD5E1');
    this.ctx.fillStyle = earGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(0, -ry * 0.7, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Deep Pink Inner Ear Cavity
    const innerGrad = this.ctx.createRadialGradient(0, -ry * 0.6, 1, 0, -ry * 0.6, ry * 0.6);
    innerGrad.addColorStop(0, '#F472B6');
    innerGrad.addColorStop(1, '#DB2777');
    this.ctx.fillStyle = innerGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(0, -ry * 0.7, rx * 0.55, ry * 0.7, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  draw3DGoggleLens(lx, ly, r) {
    // Chrome Metallic Rim
    this.ctx.fillStyle = '#CBD5E1';
    this.ctx.beginPath();
    this.ctx.arc(lx, ly, r + 1.2, 0, Math.PI * 2);
    this.ctx.fill();

    // Amber Tinted Glass Lens
    const lensGrad = this.ctx.createRadialGradient(lx - 2, ly - 2, 1, lx, ly, r);
    lensGrad.addColorStop(0, '#FEF08A');
    lensGrad.addColorStop(0.6, '#F59E0B');
    lensGrad.addColorStop(1, '#D97706');
    this.ctx.fillStyle = lensGrad;
    this.ctx.beginPath();
    this.ctx.arc(lx, ly, r, 0, Math.PI * 2);
    this.ctx.fill();

    // Angled Specular Glare Reflection Line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.lineWidth = 1.4;
    this.ctx.beginPath();
    this.ctx.moveTo(lx - r * 0.5, ly - r * 0.4);
    this.ctx.lineTo(lx + r * 0.3, ly + r * 0.5);
    this.ctx.stroke();
  }

  // =========================================================================
  // 10. FLOATING 3D SCORE POPUPS (+1 ⭐)
  // =========================================================================
  drawScorePopups() {
    this.scorePopups.forEach(sp => {
      this.ctx.save();
      this.ctx.translate(sp.x, sp.y);
      this.ctx.scale(sp.scale, sp.scale);
      this.ctx.globalAlpha = Math.max(0, sp.life);

      // 3D Drop Shadow
      this.ctx.font = 'bold 22px "Outfit", "Inter", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      this.ctx.fillText('+1 ⭐', 1.5, 2.5);

      // Thick White 3D Border
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 4.5;
      this.ctx.lineJoin = 'round';
      this.ctx.strokeText('+1 ⭐', 0, 0);

      // Radiant Gold Fill
      this.ctx.fillStyle = '#F59E0B';
      this.ctx.fillText('+1 ⭐', 0, 0);

      this.ctx.restore();
    });
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  }
}

window.LightningTrikeGame = LightningTrikeGame;
