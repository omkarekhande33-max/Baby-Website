# 🧸 Baby WonderLand

> A sensory-rich interactive web playground and digital toy for babies and toddlers featuring real-time eye-tracking cartoon characters, finger painting, soothing pentatonic chimes, parallax runner adventures, and a friendly toy robot.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://python.org)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg?style=flat&logo=sqlite&logoColor=white)](https://sqlite.org)
[![HTML5](https://img.shields.io/badge/Frontend-HTML5%20%2F%20Vanilla%20JS-E34F26.svg?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org)
[![CSS3](https://img.shields.io/badge/Design%20System-CSS3%20Glassmorphism-1572B6.svg?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org)

---

## ✨ Features & Interactive Zones

### 1. 🐻 Pip the Bear (Cursor & Touch Tracking Mascot)
- **Eye & Pupil Tracking:** Uses trigonometric angle calculations to make Pip's pupils follow the mouse cursor or touch point across the screen.
- **Dynamic Leaning Physics:** Mascot body tilts and leans towards cursor position with smooth spring easing.
- **Micro-Interactions:** Click or tap Pip to trigger baby giggles, boop his nose, wiggle his ears, or make him peek-a-boo and sing songs.
- **Natural Blinking:** Automatic randomized eyelid blinking routine.

### 2. 🎨 Finger Paints (Sensory Canvas)
- **Multi-Touch Drawing:** Supports multiple baby fingers simultaneously with smooth bezier brush strokes.
- **Creative Brush Modes:**
  - ✨ **Glow:** Radiant neon strokes with intense glowing halos and bright white cores.
  - 🌈 **Rainbow:** Dynamic HSL color cycling with floating sparkle dust.
  - 🫧 **Bubbles:** Translucent gradient bubbles trailing behind finger movements.
  - 🌟 **Stamps:** Playful stamp selector (stars, ducks, paw prints, flowers).
- **Interactive Floaters:** Floating background balloons that pop with confetti bursts and musical tones when tapped.
- **Direct Gallery Saving:** Saves creations directly to the backend database with instant download and delete controls.

### 3. ⚡ Lightning Trike (Parallax Runner Mini-Game)
- **Smooth 60 FPS Parallax Engine:** Multi-layered scrolling hills, animated clouds, and a rainbow track.
- **Joyful Jumping Mechanics:** Tap anywhere or press Space/Up to jump and collect twinkling stars.
- **Sensory Bicycle Bell:** Realistic metallic bicycle bell ("ding-ding!") on tap or `B` key.
- **Lightning Turbo Boost:** High-speed star rush with celebratory particle explosions and speed trails.
- **Achievement Unlocks:** Reaching 5 and 15 stars unlocks custom collectible sticker badges.

### 4. 🤖 Toy Robot Companion ("Robo-Pal")
- **LED Expressive Face Screen:** Dynamic animated faces (`( ^ _ ^ )`, `( ♥ _ ♥ )`, `( * _ * )`, `( > _ < )`, `( - _ - ) zZ`).
- **Interactive Voice Synthesis:** Synthesized cute robot tones paired with browser speech capabilities.
- **Companion Activities:** Tap Robo-Pal or trigger quick routines: Say Hello, Tickle Me, Dance Party, Peekaboo, High Five, and Lullaby.

### 5. 🎵 Magic Chime Web Audio Engine
- **Pure Mathematical Synthesis:** 100% synthesized in real-time with the Web Audio API (`AudioContext`). Zero external audio asset dependencies.
- **Baby-Safe Sound Design:** Master dynamic compression guarantees soothing, comfortable volume levels.
- **Harmonic Pentatonic Scale:** C-Major pentatonic notes (261.63 Hz – 1046.50 Hz) that always harmonize pleasingly regardless of where or how fast the baby taps.
- **Bedtime Music Box Lullaby:** Calming "Twinkle Twinkle Little Star" music box sequence for winding down.

### 6. 🌟 Baby Sticker Book & Saved Artworks Gallery
- **Profile Customization:** Personalize the baby's name, age in months, and favorite sensory theme color.
- **Art Showcase:** Review all saved paintings with creation timestamps and high-resolution PNG download links.
- **Milestone Badges:** Automatically unlocked achievements saved permanently to the database.

### 7. 🔒 Baby-Lock Mode & 🌙 Bedtime Night Mode
- **Baby-Lock Mode:** Fullscreen lock mode that minimizes accidental window closures or accidental navigation during baby play.
- **Day / Night Celestial Toggle:** Switches the entire aesthetic from sunny morning pastels to a gentle, starry deep-indigo night sky accompanied by a soft lullaby.

---

## 🛠️ Architecture & Tech Stack

```
Baby Website/
├── backend/                  # FastAPI REST API & Database Layer
│   ├── database.py           # SQLite connection and table initialization
│   ├── main.py               # FastAPI application, static mounting & CORS
│   ├── models.py             # Pydantic data schemas
│   └── routers/              # Modular API endpoints
│       ├── artwork.py        # Artwork CRUD endpoints
│       ├── audio.py          # Sound presets & scale endpoints
│       ├── games.py          # Trike scores & sticker unlocks
│       └── profile.py        # Baby profile settings
├── assets/                   # 3D illustration badges and icons
├── css/
│   └── style.css             # Vanilla CSS design system (glassmorphism & tokens)
├── js/                       # Modular ES6 frontend modules
│   ├── api.js                # REST client for backend communication
│   ├── app.js                # Master coordinator & Particle FX engine
│   ├── audio.js              # Web Audio API sound synthesis engine
│   ├── character.js          # Pip the Bear mascot physics & eye tracking
│   ├── gallery.js            # Gallery, profile & sticker book manager
│   ├── paint.js              # Finger paint canvas & multi-touch engine
│   ├── robot.js              # Toy robot companion interactions
│   └── trike.js              # Lightning trike parallax runner game
├── index.html                # Main single-page web playground
├── requirements.txt          # Python dependencies
└── run_server.py             # One-click full-stack launcher
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- Any modern web browser (Chrome, Edge, Firefox, Safari)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/omkarekhande33-max/Baby-Website.git
   cd Baby-Website
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server:**
   ```bash
   python run_server.py
   ```

4. **Open in browser:**
   - **Frontend Application:** [http://localhost:8000](http://localhost:8000)
   - **Interactive API Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check & feature flags |
| `GET` | `/api/profile` | Retrieve baby profile details |
| `PUT` | `/api/profile` | Update baby profile (name, age, sensory color) |
| `GET` | `/api/artworks` | List all saved finger paintings |
| `POST` | `/api/artworks` | Save a new finger painting (base64 PNG) |
| `DELETE` | `/api/artworks/{id}` | Delete a saved painting |
| `POST` | `/api/games/trike/score` | Record trike stars & check achievement unlocks |
| `GET` | `/api/games/trike/stats` | Retrieve total stars collected and best run stats |
| `GET` | `/api/games/stickers` | Fetch all unlocked sticker badges |
| `POST` | `/api/games/stickers/unlock` | Unlock a new milestone sticker |
| `GET` | `/api/audio/presets` | Get scale presets and musical frequencies |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
