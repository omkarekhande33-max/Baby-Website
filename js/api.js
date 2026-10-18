/**
 * Baby WonderLand - Frontend REST API Client
 * Hybrid Online/Offline Architecture:
 * - Connects to FastAPI backend if available
 * - Automatically falls back to LocalStorage when deployed statically on Vercel / GitHub Pages
 * - Supports custom remote backend via window.BABY_BACKEND_URL
 */

class BabyAPIClient {
  constructor() {
    this.customUrl = window.BABY_BACKEND_URL || null;

    if (this.customUrl) {
      this.baseUrl = this.customUrl.replace(/\/+$/, '');
    } else if (window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null') {
      this.baseUrl = 'http://127.0.0.1:8000/api';
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      this.baseUrl = `${window.location.origin}/api`;
    } else {
      // On Vercel / Production: attempt relative /api, with automatic LocalStorage fallback
      this.baseUrl = `${window.location.origin}/api`;
    }

    this.backendAvailable = null; // null = untested, true = online, false = offline fallback
    this.initLocalStorageDefaults();
  }

  initLocalStorageDefaults() {
    if (!localStorage.getItem('baby_profile')) {
      localStorage.setItem('baby_profile', JSON.stringify({
        id: 1,
        baby_name: 'Little Sunshine',
        baby_age_months: 14,
        sensory_color: '#38BDF8',
        created_at: new Date().toISOString()
      }));
    }

    if (!localStorage.getItem('baby_artworks')) {
      localStorage.setItem('baby_artworks', JSON.stringify([]));
    }

    if (!localStorage.getItem('baby_stickers')) {
      localStorage.setItem('baby_stickers', JSON.stringify([
        {
          id: 1,
          sticker_id: 'first_sparkle',
          title: 'First Magic Sparkle',
          description: 'Created your very first glowing sensory finger painting!',
          icon: '✨',
          unlocked_at: new Date().toISOString()
        }
      ]));
    }

    if (!localStorage.getItem('baby_trike_stats')) {
      localStorage.setItem('baby_trike_stats', JSON.stringify({
        total_runs: 0,
        best_stars: 0,
        total_stars: 0,
        total_distance: 0
      }));
    }
  }

  async fetchJson(endpoint, options = {}) {
    // If backend was already tested and confirmed offline, skip network request
    if (this.backendAvailable === false) {
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout for fast fallback

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: controller.signal,
        ...options
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 404 || res.status >= 500) {
          this.backendAvailable = false;
        }
        return null;
      }

      this.backendAvailable = true;
      return await res.json();
    } catch (err) {
      this.backendAvailable = false;
      return null;
    }
  }

  // =========================================================================
  // Baby Profile
  // =========================================================================
  async getProfile() {
    const remote = await this.fetchJson('/profile');
    if (remote) return remote;

    try {
      return JSON.parse(localStorage.getItem('baby_profile'));
    } catch (e) {
      return { baby_name: 'Little Sunshine', baby_age_months: 14, sensory_color: '#38BDF8' };
    }
  }

  async updateProfile(profileData) {
    const remote = await this.fetchJson('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (remote) return remote;

    try {
      const current = JSON.parse(localStorage.getItem('baby_profile')) || {};
      const updated = { ...current, ...profileData, updated_at: new Date().toISOString() };
      localStorage.setItem('baby_profile', JSON.stringify(updated));
      return updated;
    } catch (e) {
      return profileData;
    }
  }

  // =========================================================================
  // Artwork Gallery
  // =========================================================================
  async getArtworks() {
    const remote = await this.fetchJson('/artworks');
    if (remote && Array.isArray(remote)) return remote;

    try {
      return JSON.parse(localStorage.getItem('baby_artworks')) || [];
    } catch (e) {
      return [];
    }
  }

  async saveArtwork(title, imageData, brushMode = 'glow') {
    const remote = await this.fetchJson('/artworks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        image_data: imageData,
        brush_mode: brushMode
      })
    });
    if (remote) return remote;

    try {
      const artworks = JSON.parse(localStorage.getItem('baby_artworks')) || [];
      const newArtwork = {
        id: Date.now(),
        title: title || `Magic Art #${artworks.length + 1}`,
        image_data: imageData,
        brush_mode: brushMode,
        created_at: new Date().toISOString()
      };
      artworks.unshift(newArtwork);
      localStorage.setItem('baby_artworks', JSON.stringify(artworks.slice(0, 50))); // Keep latest 50
      return newArtwork;
    } catch (e) {
      return null;
    }
  }

  async deleteArtwork(artworkId) {
    const remote = await this.fetchJson(`/artworks/${artworkId}`, {
      method: 'DELETE'
    });
    if (remote) return remote;

    try {
      let artworks = JSON.parse(localStorage.getItem('baby_artworks')) || [];
      artworks = artworks.filter(a => a.id !== artworkId && a.id !== Number(artworkId));
      localStorage.setItem('baby_artworks', JSON.stringify(artworks));
      return { success: true, deleted_id: artworkId };
    } catch (e) {
      return { success: false };
    }
  }

  // =========================================================================
  // Trike Game & High Scores
  // =========================================================================
  async saveTrikeScore(starsCollected, distance = 0) {
    const remote = await this.fetchJson('/games/trike/score', {
      method: 'POST',
      body: JSON.stringify({
        stars_collected: starsCollected,
        distance: distance
      })
    });
    if (remote) return remote;

    try {
      const stats = JSON.parse(localStorage.getItem('baby_trike_stats')) || {
        total_runs: 0, best_stars: 0, total_stars: 0, total_distance: 0
      };
      stats.total_runs++;
      stats.total_stars += starsCollected;
      stats.total_distance += distance;
      if (starsCollected > stats.best_stars) {
        stats.best_stars = starsCollected;
      }
      localStorage.setItem('baby_trike_stats', JSON.stringify(stats));

      // Check milestones in localStorage
      if (starsCollected >= 5) {
        await this.unlockSticker('star_rider', 'Super Star Rider', 'Collected 5+ stars in Lightning Trike!', '⚡');
      }
      if (starsCollected >= 15) {
        await this.unlockSticker('trike_champion', 'Grand Prix Baby', 'Collected 15+ stars in a single run!', '🏆');
      }

      return { stats, stars_collected: starsCollected };
    } catch (e) {
      return null;
    }
  }

  async getTrikeStats() {
    const remote = await this.fetchJson('/games/trike/stats');
    if (remote) return remote;

    try {
      return JSON.parse(localStorage.getItem('baby_trike_stats'));
    } catch (e) {
      return { total_runs: 0, best_stars: 0, total_stars: 0, total_distance: 0 };
    }
  }

  // =========================================================================
  // Stickers & Achievements
  // =========================================================================
  async getStickers() {
    const remote = await this.fetchJson('/games/stickers');
    if (remote && Array.isArray(remote)) return remote;

    try {
      return JSON.parse(localStorage.getItem('baby_stickers')) || [];
    } catch (e) {
      return [];
    }
  }

  async unlockSticker(stickerId, title, description, icon) {
    const remote = await this.fetchJson('/games/stickers/unlock', {
      method: 'POST',
      body: JSON.stringify({
        sticker_id: stickerId,
        title,
        description,
        icon
      })
    });
    if (remote) return remote;

    try {
      const stickers = JSON.parse(localStorage.getItem('baby_stickers')) || [];
      if (!stickers.some(s => s.sticker_id === stickerId)) {
        const newSticker = {
          id: Date.now(),
          sticker_id: stickerId,
          title,
          description,
          icon: icon || '🌟',
          unlocked_at: new Date().toISOString()
        };
        stickers.push(newSticker);
        localStorage.setItem('baby_stickers', JSON.stringify(stickers));
        return newSticker;
      }
      return stickers.find(s => s.sticker_id === stickerId);
    } catch (e) {
      return null;
    }
  }
}

window.babyAPI = new BabyAPIClient();
