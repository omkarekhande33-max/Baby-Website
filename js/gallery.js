/**
 * Baby WonderLand - Sticker Book & Saved Artworks Gallery
 * Connects frontend display with backend SQLite persistent storage
 */

class BabyGalleryManager {
  constructor() {
    this.artworksContainer = document.getElementById('gallery-grid');
    this.stickersContainer = document.getElementById('stickers-grid');
    this.profileNameInput = document.getElementById('baby-name-input');
    this.profileAgeInput = document.getElementById('baby-age-input');
    this.profileColorPicker = document.getElementById('baby-color-picker');
    this.saveProfileBtn = document.getElementById('save-profile-btn');

    this.init();
  }

  async init() {
    await this.loadProfile();
    await this.loadArtworks();
    await this.loadStickers();

    if (this.saveProfileBtn) {
      this.saveProfileBtn.addEventListener('click', () => this.saveProfile());
    }
  }

  async loadProfile() {
    if (!window.babyAPI) return;
    const profile = await window.babyAPI.getProfile();
    if (profile) {
      if (this.profileNameInput) this.profileNameInput.value = profile.name;
      if (this.profileAgeInput) this.profileAgeInput.value = profile.age_months;
      if (this.profileColorPicker) this.profileColorPicker.value = profile.favorite_color;

      // Update greeting in brand title or welcome banner if present
      const welcome = document.getElementById('baby-welcome-name');
      if (welcome) welcome.textContent = profile.name;
    }
  }

  async saveProfile() {
    if (!window.babyAPI) return;
    const name = this.profileNameInput ? this.profileNameInput.value : 'Little Sunshine';
    const age = this.profileAgeInput ? parseInt(this.profileAgeInput.value) : 12;
    const color = this.profileColorPicker ? this.profileColorPicker.value : '#FF6584';

    const updated = await window.babyAPI.updateProfile({
      name,
      age_months: age,
      favorite_color: color
    });

    if (updated) {
      window.babyAudio.playArpeggio(3, 4, 90);
      if (window.particleFX) {
        const rect = this.saveProfileBtn.getBoundingClientRect();
        window.particleFX.burst(rect.left + rect.width / 2, rect.top, 'hearts');
      }
      const welcome = document.getElementById('baby-welcome-name');
      if (welcome) welcome.textContent = updated.name;
    }
  }

  async loadArtworks() {
    if (!this.artworksContainer || !window.babyAPI) return;
    const artworks = await window.babyAPI.getArtworks();

    this.artworksContainer.innerHTML = '';
    if (artworks.length === 0) {
      this.artworksContainer.innerHTML = `
        <div class="empty-gallery-card">
          <span style="font-size: 3rem;">🎨</span>
          <p>No saved paintings yet!</p>
          <small>Go to Finger Paints and tap "💾 Save Art" to keep your baby's memories!</small>
        </div>
      `;
      return;
    }

    artworks.forEach(art => {
      const card = document.createElement('div');
      card.className = 'artwork-frame-card';
      const formattedDate = new Date(art.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      card.innerHTML = `
        <div class="artwork-canvas-preview">
          <img src="${art.image_data}" alt="${art.title}" loading="lazy"/>
        </div>
        <div class="artwork-card-info">
          <h4>${art.title || "Baby Masterpiece"}</h4>
          <span class="artwork-date">${formattedDate}</span>
          <div class="artwork-actions">
            <a href="${art.image_data}" download="baby_artwork_${art.id}.png" class="art-action-btn download-btn" title="Download Image">⬇️ Download</a>
            <button class="art-action-btn delete-btn" data-id="${art.id}" title="Delete Painting">🗑️</button>
          </div>
        </div>
      `;

      card.querySelector('.delete-btn').addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        await window.babyAPI.deleteArtwork(id);
        window.babyAudio.playPop();
        this.loadArtworks();
      });

      this.artworksContainer.appendChild(card);
    });
  }

  async loadStickers() {
    if (!this.stickersContainer || !window.babyAPI) return;
    const stickers = await window.babyAPI.getStickers();

    this.stickersContainer.innerHTML = '';
    stickers.forEach(stk => {
      const badge = document.createElement('div');
      badge.className = 'sticker-badge-item';
      badge.innerHTML = `
        <div class="sticker-badge-icon">${stk.icon}</div>
        <div class="sticker-badge-details">
          <h5>${stk.title}</h5>
          <p>${stk.description || ''}</p>
        </div>
      `;
      badge.addEventListener('pointerdown', (e) => {
        window.babyAudio.playChime(4, 1.2);
        if (window.particleFX) {
          window.particleFX.burst(e.clientX, e.clientY, 'sparkles', '#F59E0B');
        }
      });
      this.stickersContainer.appendChild(badge);
    });
  }
}

window.BabyGalleryManager = BabyGalleryManager;
