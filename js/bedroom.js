/**
 * Baby WonderLand - Cozy Bedroom & Playful Music Box Controller
 * Track 1, Concept B: Soft, tactile, nostalgic nursery toys.
 */

class BedroomController {
  constructor() {
    this.tension = 75;
    this.isPlaying = false;
    this.playTimer = null;
    this.starsCount = 12;
    this.ambientSound = null;
    this.storyIndex = 0;

    this.melodies = [
      { note: 'C5', time: 400 }, { note: 'C5', time: 400 },
      { note: 'G5', time: 400 }, { note: 'G5', time: 400 },
      { note: 'A5', time: 400 }, { note: 'A5', time: 400 },
      { note: 'G5', time: 800 },
      { note: 'F5', time: 400 }, { note: 'F5', time: 400 },
      { note: 'E5', time: 400 }, { note: 'E5', time: 400 },
      { note: 'D5', time: 400 }, { note: 'D5', time: 400 },
      { note: 'C5', time: 800 }
    ];

    this.storyPages = [
      {
        title: "1. Dusk in the Cozy Bedroom",
        img: "assets/pip_cozy_bedroom.jpg",
        desc: "As dusk settled softly over the rooftops, Pip the little bear stretched his sleepy paws, put on his striped nightcap, and smiled at the evening stars."
      },
      {
        title: "2. The Moonlit Rooftops",
        img: "assets/bedroom.jpg",
        desc: "Pip climbed aboard his fluffy cloud pillow with his warm brass lantern, floating quietly over sleeping chimneys and resting houses."
      },
      {
        title: "3. Gathering Starlight",
        img: "assets/pip_gathering_stars.jpg",
        desc: "Twinkling starlight drifted from the moon. Pip wound his antique music box, catching golden beams to turn them into peaceful bedtime lullabies."
      },
      {
        title: "4. Sweet Dreams to All",
        img: "assets/whimsical_music_box.jpg",
        desc: "Pip sprinkled the gentle lullaby notes over all the sleeping forest creatures—the baby fox, sleepy owl, and every resting child. Goodnight, world!"
      }
    ];

    this.milestones = {
      12: { title: 'First Sweet Giggle (12")', icon: '🧸', desc: 'Pip let out his very first gentle chime giggle!' },
      18: { title: 'Star Catcher (18")', icon: '⭐', desc: 'Reached out little paws to catch twinkling nightlight beams.' },
      24: { title: 'Master Block Builder (24")', icon: '🪵', desc: 'Stacked a 3-block tower and celebrated with giggles!' },
      30: { title: 'Lullaby Dream Engineer (30")', icon: '🎵', desc: 'Wound the brass key and filled the room with music.' },
      36: { title: 'Celestial Explorer (36")', icon: '🌙', desc: 'Guiding sweet dreams across the starry midnight sky.' }
    };

    this.init();
  }

  init() {
    this.initMusicBox();
    this.initWoodenBlocks();
    this.initRattle();
    this.initStorybook();
    this.initGrowthChart();
    this.initAmbientAudio();
  }

  // --- 1. Music Box ---
  initMusicBox() {
    const windBtn = document.getElementById('wind-music-box-btn');
    const playBtn = document.getElementById('play-lullaby-btn');
    const tines = document.querySelectorAll('.tine-btn');

    if (windBtn) {
      windBtn.addEventListener('click', () => {
        this.windKey();
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.togglePlay();
      });
    }

    tines.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pitch = btn.getAttribute('data-pitch') || 'C5';
        this.playTine(pitch, e.clientX, e.clientY);
      });
    });

    const miniPip = document.getElementById('mini-pip-toy');
    if (miniPip) {
      miniPip.addEventListener('click', (e) => {
        this.playTine('C6', e.clientX, e.clientY);
        miniPip.classList.add('pirouette');
        setTimeout(() => miniPip.classList.remove('pirouette'), 1200);
      });
    }
  }

  windKey() {
    window.babyAudio.playPop();
    this.tension = Math.min(100, this.tension + 15);
    this.updateTensionUI();
    const btn = document.getElementById('wind-music-box-btn');
    if (btn) {
      btn.style.transform = 'scale(0.92) rotate(45deg)';
      setTimeout(() => btn.style.transform = '', 200);
    }
  }

  updateTensionUI() {
    const val = document.getElementById('tension-percent-val');
    const fill = document.getElementById('tension-bar-fill');
    if (val) val.textContent = `${Math.round(this.tension)}%`;
    if (fill) fill.style.width = `${this.tension}%`;
  }

  playTine(pitch, clientX = null, clientY = null) {
    const freqs = {
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
      G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50
    };
    const freq = freqs[pitch] || 523.25;

    // Use Web Audio API
    if (window.babyAudio && window.babyAudio.ctx) {
      const ctx = window.babyAudio.ctx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.7);
    }

    if (clientX && clientY && window.particleFX) {
      window.particleFX.burst(clientX, clientY, 'sparkles', '#FFD166');
    }

    // Add star point
    this.addStar();
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const playBtn = document.getElementById('play-lullaby-btn');
    const playIcon = document.getElementById('play-btn-icon');
    const playText = document.getElementById('play-btn-text');

    if (this.isPlaying) {
      if (this.tension <= 5) this.tension = 50;
      this.updateTensionUI();
      if (playIcon) playIcon.textContent = '⏸';
      if (playText) playText.textContent = 'Pause';
      this.startMelodyLoop(0);
    } else {
      if (playIcon) playIcon.textContent = '▶';
      if (playText) playText.textContent = 'Play Lullaby';
      if (this.playTimer) clearTimeout(this.playTimer);
    }
  }

  startMelodyLoop(idx) {
    if (!this.isPlaying || this.tension <= 0) {
      this.isPlaying = false;
      this.togglePlay();
      return;
    }

    const item = this.melodies[idx % this.melodies.length];
    this.playTine(item.note);

    this.tension = Math.max(0, this.tension - 2);
    this.updateTensionUI();

    const miniPip = document.getElementById('mini-pip-toy');
    if (miniPip) miniPip.classList.add('pirouette');

    this.playTimer = setTimeout(() => {
      this.startMelodyLoop(idx + 1);
    }, item.time);
  }

  addStar() {
    this.starsCount++;
    const badge = document.getElementById('starlight-count-val');
    if (badge) badge.textContent = this.starsCount;
  }

  // --- 2. Wooden Blocks ---
  initWoodenBlocks() {
    const blocks = document.querySelectorAll('.wooden-block');
    blocks.forEach(block => {
      block.addEventListener('click', (e) => {
        this.bounceBlock(block, e.clientX, e.clientY);
      });
    });

    const tumbleBtn = document.getElementById('tumble-blocks-btn');
    if (tumbleBtn) {
      tumbleBtn.addEventListener('click', () => {
        this.tumbleBlocks();
      });
    }
  }

  bounceBlock(block, x, y) {
    // Play wood clack
    this.playWoodClack(1.2);
    block.style.transform = `translateY(-30px) rotate(${(Math.random() - 0.5) * 15}deg) scale(1.1)`;
    setTimeout(() => {
      block.style.transform = '';
    }, 280);

    if (window.particleFX) {
      window.particleFX.burst(x, y, 'sparkles', '#E2A76F');
    }
    this.addStar();
  }

  tumbleBlocks() {
    this.playWoodClack(0.9);
    setTimeout(() => this.playWoodClack(1.3), 80);
    setTimeout(() => this.playWoodClack(1.0), 160);

    const blocks = document.querySelectorAll('.wooden-block');
    blocks.forEach(block => {
      const rx = (Math.random() - 0.5) * 35;
      const ry = (Math.random() - 0.5) * 20;
      const rot = (Math.random() - 0.5) * 45;
      block.style.transform = `translate(${rx}px, ${ry}px) rotate(${rot}deg)`;
      setTimeout(() => {
        block.style.transform = '';
      }, 700);
    });

    if (window.particleFX) {
      window.particleFX.burst(window.innerWidth / 2, window.innerHeight / 2, 'confetti');
    }
  }

  playWoodClack(pitch = 1) {
    if (!window.babyAudio || !window.babyAudio.ctx) return;
    const ctx = window.babyAudio.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

    filter.type = 'bandpass';
    filter.frequency.value = 850 * pitch;

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // --- 3. Baby Rattle ---
  initRattle() {
    const rattle = document.getElementById('baby-rattle-widget');
    if (!rattle) return;

    rattle.addEventListener('click', (e) => {
      this.playRattleSound();
      rattle.classList.add('rattle-shake');
      setTimeout(() => rattle.classList.remove('rattle-shake'), 450);
      if (window.particleFX) {
        window.particleFX.burst(e.clientX, e.clientY, 'stars', '#F4D06F');
      }
      this.addStar();
    });
  }

  playRattleSound() {
    if (!window.babyAudio || !window.babyAudio.ctx) return;
    const ctx = window.babyAudio.ctx;
    const now = ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const burstTime = now + i * 0.035;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400 + Math.random() * 800, burstTime);
      gain.gain.setValueAtTime(0.12, burstTime);
      gain.gain.exponentialRampToValueAtTime(0.001, burstTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(burstTime);
      osc.stop(burstTime + 0.04);
    }
  }

  // --- 4. Storybook ---
  initStorybook() {
    const prevBtn = document.getElementById('story-prev-btn');
    const nextBtn = document.getElementById('story-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.storyIndex > 0) {
          this.storyIndex--;
          this.updateStoryUI();
          this.playPageRustle();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.storyIndex < this.storyPages.length - 1) {
          this.storyIndex++;
          this.updateStoryUI();
          this.playPageRustle();
          this.addStar();
        }
      });
    }
  }

  updateStoryUI() {
    const page = this.storyPages[this.storyIndex];
    const img = document.getElementById('story-current-img');
    const title = document.getElementById('story-page-title');
    const desc = document.getElementById('story-page-desc');
    const indicator = document.getElementById('story-page-indicator');
    const prevBtn = document.getElementById('story-prev-btn');
    const nextBtn = document.getElementById('story-next-btn');

    if (img) img.src = page.img;
    if (title) title.textContent = page.title;
    if (desc) desc.textContent = page.desc;
    if (indicator) indicator.textContent = `Page ${this.storyIndex + 1} of ${this.storyPages.length}`;

    if (prevBtn) prevBtn.disabled = this.storyIndex === 0;
    if (nextBtn) nextBtn.disabled = this.storyIndex === this.storyPages.length - 1;
  }

  playPageRustle() {
    if (!window.babyAudio || !window.babyAudio.ctx) return;
    const ctx = window.babyAudio.ctx;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.1;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.1);
  }

  // --- 5. Growth Chart ---
  initGrowthChart() {
    const notches = document.querySelectorAll('.ruler-notch');
    notches.forEach(notch => {
      notch.addEventListener('click', (e) => {
        const inch = notch.getAttribute('data-inch');
        notches.forEach(n => n.classList.remove('active'));
        notch.classList.add('active');

        const data = this.milestones[inch];
        if (data) {
          const title = document.getElementById('growth-milestone-title');
          const desc = document.getElementById('growth-milestone-desc');
          if (title) title.textContent = data.title;
          if (desc) desc.textContent = data.desc;
        }

        window.babyAudio.playChime(5, 1.4);
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'confetti', '#FFD166');
        }
        this.addStar();
      });
    });
  }

  // --- 6. Ambient Sounds ---
  initAmbientAudio() {
    const rainBtn = document.getElementById('ambient-rain-btn');
    const breezeBtn = document.getElementById('ambient-breeze-btn');

    if (rainBtn) {
      rainBtn.addEventListener('click', () => {
        this.toggleAmbient('rain', rainBtn);
      });
    }

    if (breezeBtn) {
      breezeBtn.addEventListener('click', () => {
        this.toggleAmbient('breeze', breezeBtn);
      });
    }
  }

  toggleAmbient(type, btn) {
    if (this.ambientSound === type) {
      this.stopAmbient();
      btn.classList.remove('active');
      this.ambientSound = null;
      return;
    }

    this.stopAmbient();
    document.querySelectorAll('.ambient-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.ambientSound = type;

    // Web Audio Noise Generator
    if (window.babyAudio && window.babyAudio.ctx) {
      const ctx = window.babyAudio.ctx;
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.0;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 400;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      this.ambientNode = noise;
    }
  }

  stopAmbient() {
    if (this.ambientNode) {
      try {
        this.ambientNode.stop();
        this.ambientNode.disconnect();
      } catch (err) {}
      this.ambientNode = null;
    }
  }
}

window.BedroomController = BedroomController;
