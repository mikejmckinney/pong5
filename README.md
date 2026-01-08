# 🏓 Retro Pong

A modern web-based Pong game optimized for mobile devices with a retro arcade aesthetic inspired by 80s arcades and synthwave culture.

## 🎮 Play Now

**Live Demo**: [https://mikejmckinney.github.io/pong5](https://mikejmckinney.github.io/pong5)

## ✨ Features

### Completed Phases

#### Phase 1: Core Game ✅
- Classic Pong gameplay mechanics
- Single-player mode vs AI opponent
- 4 AI difficulty levels (Easy, Medium, Hard, Impossible)
- Smooth 60fps gameplay
- Ball physics with angle-based bouncing
- Score tracking (first to 11 wins)
- Keyboard controls (W/S, Arrow keys)
- Game states: Menu, Playing, Paused, Game Over

#### Phase 2: Mobile Optimization ✅
- Touch-friendly drag controls for paddle movement
- Responsive canvas that scales to any screen size
- Portrait and landscape orientation support
- Progressive Web App (PWA) - installable on mobile
- Offline play support via Service Worker
- Disabled browser gestures during gameplay

### Upcoming Phases
- **Phase 3**: Synthwave visuals, animations, and sound effects
- **Phase 4**: Power-ups and special game modes
- **Phase 5**: Local multiplayer (two players, same device)
- **Phase 6-8**: Online multiplayer with Supabase + Railway backend
- **Phase 9-10**: Final polish and deployment

## 🕹️ Controls

### Desktop
| Key | Action |
|-----|--------|
| W / ↑ | Move paddle up |
| S / ↓ | Move paddle down |
| Space | Start game / Restart |
| ESC | Pause / Resume |
| 1-4 | Select AI difficulty |

### Mobile
- **Touch & Drag**: Slide finger up/down to move paddle
- **Tap**: Start game / Navigate menus

## 🛠️ Tech Stack

- **Frontend**: HTML5 Canvas, CSS3, Vanilla JavaScript
- **PWA**: Service Worker for offline support
- **Deployment**: GitHub Pages

## 📱 Installation (PWA)

1. Open the game in Chrome (Android) or Safari (iOS)
2. Tap "Add to Home Screen" from the browser menu
3. Launch the game like a native app!

## 🚀 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/mikejmckinney/pong5.git
   cd pong5
   ```

2. Serve with any static file server:
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx serve
   ```

3. Open `http://localhost:8080` in your browser

## 📁 Project Structure

```
pong5/
├── index.html              # Main game page
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline support
├── css/
│   └── main.css            # Core styles
├── js/
│   ├── config.js           # Game configuration
│   ├── game.js             # Core game logic
│   ├── renderer.js         # Canvas rendering
│   ├── controls.js         # Keyboard input
│   ├── controls-mobile.js  # Touch input
│   ├── ai.js               # AI opponent
│   └── utils.js            # Helper functions
└── assets/
    └── icons/              # PWA icons
```

## 📄 License

MIT License - feel free to use, modify, and distribute!

---

Made with ❤️ and synthwave vibes 🌆