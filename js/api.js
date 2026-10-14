/**
 * Baby WonderLand - Frontend REST API Client
 * Seamless asynchronous communication with FastAPI Backend & SQLite database
 */

class BabyAPIClient {
  constructor() {
    if (window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null') {
      this.baseUrl = 'http://127.0.0.1:8000/api';
    } else {
      this.baseUrl = `${window.location.origin}/api`;
    }
  }

  async fetchJson(endpoint, options = {}) {
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      if (!res.ok) {
        console.warn(`API call failed: ${res.status} ${res.statusText}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.warn(`API network error on ${endpoint}:`, err);
      return null;
    }
  }

  // Baby Profile
  async getProfile() {
    return await this.fetchJson('/profile');
  }

  async updateProfile(profileData) {
    return await this.fetchJson('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Artwork Gallery
  async getArtworks() {
    return await this.fetchJson('/artworks') || [];
  }

  async saveArtwork(title, imageData, brushMode = 'glow') {
    return await this.fetchJson('/artworks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        image_data: imageData,
        brush_mode: brushMode
      })
    });
  }

  async deleteArtwork(artworkId) {
    return await this.fetchJson(`/artworks/${artworkId}`, {
      method: 'DELETE'
    });
  }

  // Trike Game & High Scores
  async saveTrikeScore(starsCollected, distance = 0) {
    return await this.fetchJson('/games/trike/score', {
      method: 'POST',
      body: JSON.stringify({
        stars_collected: starsCollected,
        distance: distance
      })
    });
  }

  async getTrikeStats() {
    return await this.fetchJson('/games/trike/stats');
  }

  // Stickers & Achievements
  async getStickers() {
    return await this.fetchJson('/games/stickers') || [];
  }

  async unlockSticker(stickerId, title, description, icon) {
    return await this.fetchJson('/games/stickers/unlock', {
      method: 'POST',
      body: JSON.stringify({
        sticker_id: stickerId,
        title,
        description,
        icon
      })
    });
  }
}

window.babyAPI = new BabyAPIClient();
