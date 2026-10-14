/**
 * Baby WonderLand - Lightning Trike Mini-Game
 * Smooth 60fps parallax runner with happy jumps, star collection, bicycle bell, and lightning trails.
 * Pure sensory delight: zero game-overs, always rewarding!
 */

class LightningTrikeGame {
  constructor() {
    this.canvas = document.getElementById('trike-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.isRunning = false;
    this.animId = null;

    // Game State
    this.score = 0;
    this.speed = 4;
    this.baseSpeed = 4;
    this.boostTimer = 0;
    this.distance = 0;

    // Trike Physics
    this.trike = {
      x: 160,
      y: 0,
      groundY: 0,
      vy: 0,
      gravity: 0.55,
      isGrounded: true,
      jumpForce: -13,
      wheelAngle: 0,
      bobAngle: 0
    };

    // Collectible Stars
    this.stars = [];
    this.starSpawnTimer = 0;

    // Lightning Trail Sparkles
    this.particles = [];

    // Background Hill Layers for Parallax
    this.hillsLayer1 = 0;
    this.hillsLayer2 = 0;
    this.clouds = [
      { x: 80, y: 70, size: 45, speed: 0.4 },
      { x: 340, y: 110, size: 55, speed: 0.3 },
      { x: 620, y: 60, size: 40, speed: 0.5 },
      { x: 900, y: 95, size: 50, speed: 0.35 }
    ];

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Tap/Click to jump anywhere on the game canvas
    this.canvas.addEventListener('pointerdown', (e) => {
      // Don't trigger if clicked on HUD or buttons
      if (e.target.closest('.trike-controls')) return;
      this.jump();
    });

    // Keyboard support: Space/Up for Jump, B for Bell
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.jump();
      } else if (e.code === 'KeyB') {
        this.ringBell();
      }
    });

    // Control Buttons
    const jumpBtn = document.getElementById('trike-jump-btn');
    const bellBtn = document.getElementById('trike-bell-btn');
    const turboBtn = document.getElementById('trike-turbo-btn');

    if (jumpBtn) jumpBtn.addEventListener('click', () => this.jump());
    if (bellBtn) bellBtn.addEventListener('click', () => this.ringBell());
    if (turboBtn) turboBtn.addEventListener('click', () => this.turboBoost());
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
    const dpr = window.devicePixelRatio || 1;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.groundY = this.height - 110;
    this.trike.groundY = this.groundY;
    if (this.trike.isGrounded) {
      this.trike.y = this.groundY;
    }
  }

  jump() {
    if (!this.trike.isGrounded) return;
    this.trike.vy = this.trike.jumpForce;
    this.trike.isGrounded = false;
    window.babyAudio.playJump();

    // Burst stars on jump
    if (window.particleFX) {
      window.particleFX.burst(this.trike.x, this.trike.y - 20, 'sparkles', '#38BDF8');
    }
  }

  ringBell() {
    window.babyAudio.playBell();
    if (window.particleFX) {
      window.particleFX.burst(this.trike.x + 35, this.trike.y - 45, 'stars', '#F59E0B');
    }
  }

  turboBoost() {
    window.babyAudio.playArpeggio(4, 5, 60);
    this.speed = this.baseSpeed * 2.2;
    this.boostTimer = 180; // ~3 seconds of boost

    if (window.particleFX) {
      window.particleFX.burst(this.trike.x, this.trike.y, 'confetti');
    }
  }

  update() {
    // Boost countdown
    if (this.boostTimer > 0) {
      this.boostTimer--;
      if (this.boostTimer === 0) {
        this.speed = this.baseSpeed;
      }
    }

    this.distance += this.speed;

    // Physics
    this.trike.y += this.trike.vy;
    this.trike.vy += this.trike.gravity;

    if (this.trike.y >= this.trike.groundY) {
      this.trike.y = this.trike.groundY;
      this.trike.vy = 0;
      this.trike.isGrounded = true;
    }

    this.trike.wheelAngle += this.speed * 0.08;
    this.trike.bobAngle += 0.12;

    // Parallax Hills
    this.hillsLayer1 = (this.hillsLayer1 + this.speed * 0.4) % (this.width + 200);
    this.hillsLayer2 = (this.hillsLayer2 + this.speed * 0.8) % (this.width + 200);

    // Clouds
    this.clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x < -100) c.x = this.width + 100;
    });

    // Trail Sparkles
    if (Math.random() > 0.3) {
      this.particles.push({
        x: this.trike.x - 30,
        y: this.trike.y - 12 + (Math.random() - 0.5) * 10,
        vx: -(this.speed * 0.7 + Math.random() * 2),
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        color: this.boostTimer > 0 ? '#F43F5E' : (Math.random() > 0.5 ? '#FBBF24' : '#38BDF8'),
        size: Math.random() * 7 + 4
      });
    }

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      p.size *= 0.96;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    // Stars Spawning
    this.starSpawnTimer++;
    if (this.starSpawnTimer > 75) {
      this.starSpawnTimer = 0;
      const isHigh = Math.random() > 0.45;
      this.stars.push({
        x: this.width + 50,
        y: isHigh ? this.groundY - 110 : this.groundY - 45,
        size: 26,
        collected: false
      });
    }

    // Stars Collection
    this.stars.forEach(star => {
      star.x -= this.speed;

      // Collision check with trike
      const dx = star.x - this.trike.x;
      const dy = star.y - (this.trike.y - 30);
      const dist = Math.hypot(dx, dy);

      if (dist < 52 && !star.collected) {
        star.collected = true;
        this.score++;
        this.updateScoreUI();
        window.babyAudio.playChime(this.score % window.babyAudio.pentatonicScale.length, 1.2);

        if (window.particleFX) {
          window.particleFX.burst(star.x, star.y, 'stars', '#F59E0B');
        }

        // Milestone achievement celebrations
        if (this.score === 5 || this.score === 15) {
          window.babyAudio.playArpeggio(3, 5, 80);
          if (window.particleFX) {
            window.particleFX.burst(this.trike.x, this.trike.y - 40, 'confetti');
          }
        }
      }
    });

    this.stars = this.stars.filter(s => !s.collected && s.x > -60);
  }

  updateScoreUI() {
    const scoreEl = document.getElementById('trike-score-val');
    if (scoreEl) {
      scoreEl.textContent = this.score;
      scoreEl.style.transform = 'scale(1.35)';
      setTimeout(() => scoreEl.style.transform = 'scale(1)', 150);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sky & Sun
    this.drawSky();

    // 2. Clouds
    this.drawClouds();

    // 3. Parallax Rolling Hills
    this.drawHills();

    // 4. Rainbow Ground Road
    this.drawRoad();

    // 5. Stars
    this.drawStars();

    // 6. Lightning Trail Particles
    this.drawParticles();

    // 7. Lightning Trike & Rider
    this.drawTrike();
  }

  drawSky() {
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#BAE6FD');
    skyGrad.addColorStop(0.6, '#E0F2FE');
    skyGrad.addColorStop(1, '#FEF9C3');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawClouds() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.clouds.forEach(c => {
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      this.ctx.arc(c.x + c.size * 0.7, c.y - c.size * 0.2, c.size * 0.8, 0, Math.PI * 2);
      this.ctx.arc(c.x - c.size * 0.6, c.y + c.size * 0.1, c.size * 0.65, 0, Math.PI * 2);
      this.ctx.arc(c.x + c.size * 1.3, c.y + c.size * 0.2, c.size * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawHills() {
    // Back Hills (Soft Lavender / Mint)
    this.ctx.fillStyle = '#C7D2FE';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width + 40; x += 40) {
      const y = (this.height - 180) + Math.sin((x + this.hillsLayer1) * 0.005) * 50;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(this.width, this.height);
    this.ctx.fill();

    // Mid Hills (Pastel Green)
    this.ctx.fillStyle = '#A7F3D0';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    for (let x = 0; x <= this.width + 40; x += 40) {
      const y = (this.height - 140) + Math.cos((x + this.hillsLayer2) * 0.008) * 35;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(this.width, this.height);
    this.ctx.fill();
  }

  drawRoad() {
    // Grass Bank
    this.ctx.fillStyle = '#34D399';
    this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    // Colorful Rainbow Track
    const roadY = this.groundY + 12;
    const colors = ['#F43F5E', '#FB923C', '#FACC15', '#4ADE80', '#38BDF8', '#C084FC'];
    const trackHeight = 18;

    colors.forEach((col, idx) => {
      this.ctx.fillStyle = col;
      this.ctx.fillRect(0, roadY + idx * 3, this.width, 3);
    });

    // Little pastel flowers on grass
    this.ctx.font = '16px sans-serif';
    for (let x = 20; x < this.width; x += 130) {
      const fx = (x - (this.distance % 130));
      this.ctx.fillText('🌸', fx, this.groundY + 45);
      this.ctx.fillText('🌼', fx + 65, this.groundY + 48);
    }
  }

  drawStars() {
    this.stars.forEach(star => {
      this.ctx.save();
      this.ctx.translate(star.x, star.y);
      this.ctx.font = '32px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('⭐', 0, 0);

      // Gentle glow ring
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 22, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      this.ctx.restore();
    });
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawTrike() {
    this.ctx.save();
    const bob = Math.sin(this.trike.bobAngle) * 3;
    const x = this.trike.x;
    const y = this.trike.y + bob;

    this.ctx.translate(x, y);

    // 1. Back Wheels (Dual rear tires)
    this.drawWheel(-28, -8, 14);

    // 2. Trike Frame (Bright Turbo Yellow & Red)
    this.ctx.strokeStyle = '#EF4444';
    this.ctx.lineWidth = 7;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(-28, -8);
    this.ctx.lineTo(0, -22); // seat post
    this.ctx.lineTo(26, -10); // front fork
    this.ctx.stroke();

    // Handlebar Stem
    this.ctx.strokeStyle = '#3B82F6';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.moveTo(26, -10);
    this.ctx.lineTo(20, -42);
    this.ctx.lineTo(28, -44);
    this.ctx.stroke();

    // Shiny Bell
    this.ctx.fillStyle = '#F59E0B';
    this.ctx.beginPath();
    this.ctx.arc(22, -45, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Headlight (Glowing cone of light)
    this.ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    this.ctx.beginPath();
    this.ctx.moveTo(26, -38);
    this.ctx.lineTo(80, -48);
    this.ctx.lineTo(80, -28);
    this.ctx.closePath();
    this.ctx.fill();

    // 3. Front Big Wheel
    this.drawWheel(26, -10, 19);

    // 4. Little Cute Rider (Baby Bunny with Flapping Goggles!)
    this.drawRider(0, -26);

    this.ctx.restore();
  }

  drawWheel(cx, cy, r) {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.trike.wheelAngle);

    // Outer Tire
    this.ctx.fillStyle = '#1E293B';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
    this.ctx.fill();

    // Rim
    this.ctx.fillStyle = '#FBBF24';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
    this.ctx.fill();

    // Wheel Spokes
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(-r * 0.6, 0);
      this.ctx.lineTo(r * 0.6, 0);
      this.ctx.stroke();
      this.ctx.rotate(Math.PI / 4);
    }

    // Hub
    this.ctx.fillStyle = '#DC2626';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawRider(rx, ry) {
    this.ctx.save();
    this.ctx.translate(rx, ry);

    // Fluttering Cape / Scarf
    this.ctx.fillStyle = '#F43F5E';
    this.ctx.beginPath();
    this.ctx.moveTo(-10, -10);
    this.ctx.lineTo(-30 - Math.sin(this.distance * 0.1) * 8, -6);
    this.ctx.lineTo(-26, -18);
    this.ctx.closePath();
    this.ctx.fill();

    // Baby Body (Cozy Blue Onesie)
    this.ctx.fillStyle = '#38BDF8';
    this.ctx.beginPath();
    this.ctx.ellipse(0, -8, 14, 18, 0.2, 0, Math.PI * 2);
    this.ctx.fill();

    // Cute Bunny Head
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(6, -28, 15, 0, Math.PI * 2);
    this.ctx.fill();

    // Bunny Long Ears
    this.ctx.beginPath();
    this.ctx.ellipse(0, -44, 4, 12, -0.2, 0, Math.PI * 2);
    this.ctx.ellipse(10, -45, 4, 12, 0.1, 0, Math.PI * 2);
    this.ctx.fill();

    // Pink Inner Ears
    this.ctx.fillStyle = '#F472B6';
    this.ctx.beginPath();
    this.ctx.ellipse(0, -44, 2, 8, -0.2, 0, Math.PI * 2);
    this.ctx.ellipse(10, -45, 2, 8, 0.1, 0, Math.PI * 2);
    this.ctx.fill();

    // Cool Aviator Goggles
    this.ctx.fillStyle = '#1E293B';
    this.ctx.fillRect(0, -32, 16, 6);
    this.ctx.fillStyle = '#FDE047';
    this.ctx.beginPath();
    this.ctx.arc(5, -29, 4, 0, Math.PI * 2);
    this.ctx.arc(13, -29, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Cheerful Smile & Pink Cheeks
    this.ctx.fillStyle = '#FB7185';
    this.ctx.beginPath();
    this.ctx.arc(4, -23, 3, 0, Math.PI * 2);
    this.ctx.arc(14, -23, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  }
}

window.LightningTrikeGame = LightningTrikeGame;
