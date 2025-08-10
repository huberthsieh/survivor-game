# 🎮 Survivor Game

A modern browser-based survival game showcasing clean architecture and functional programming principles.

**🎯 Goal:** Survive for 60 seconds against increasingly aggressive enemies!

## ✨ Features

### 🎮 Ga**me Mechanics**
- **Survival Challenge** — 60-second timer with victory condition
- **Dynamic Difficulty** — Enemy spawn rate increases over time
- **Collision System** — Damage with invulnerability frames
- **Score Tracking** — Points for survival time and enemy encounters
- **Pause/Resume** — Full game state management

### 🏗️ Technical Highlights
- **Functional Programming** — Pure functions for game logic
- **Event-Driven Architecture** — Map-based event handling system
- **Type Safety** — Full TypeScript implementation
- **Clean Separation** — Game logic independent of rendering
- **Testable Design** — Pure functions with comprehensive testing

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Game Engine** | Phaser.js | 2D rendering and physics |
| **Language** | TypeScript | Type safety and developer experience |
| **UI Framework** | React | HUD and game interface |
| **State Management** | Zustand | Minimal global state |
| **Build Tool** | Vite | Fast development and optimized builds |
| **Testing** | Vitest | Unit testing for game logic |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser and play!
# → http://localhost:5173
```

### 🎮 Controls
- **Movement:** WASD or Arrow Keys
- **Pause:** Spacebar or Pause button
- **Restart:** R key or Restart button

## 📂 Project Structure

```
src/
├── game/
│   ├── logic/          # 🧠 Pure functions (game rules)
│   │   ├── state.ts    #    Event-driven state management
│   │   ├── collision.ts#    Collision detection & handling
│   │   ├── spawn.ts    #    Enemy generation logic
│   │   └── ...         #    Other game mechanics
│   ├── adapters/       # 🎨 Phaser integration layer
│   │   └── phaser.ts   #    World creation & sprite management
│   └── scenes/         # 🎬 Thin scene orchestration
│       └── GameScene.ts#    Main game loop
├── ui/                 # ⚛️ React components
│   └── HUD.tsx         #    Game interface & overlays
└── store/              # 🗃️ Global state management
    └── gameStore.ts    #    Zustand store configuration
```

## 🧪 Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Type-check and create production build |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run test suite once |
| `npm run test:watch` | Run tests in watch mode |

## 🏛️ Architecture Philosophy

### 🎯 Design Principles
- **Functional Core, Imperative Shell** — Pure game logic with side-effect boundaries
- **Event Sourcing** — All state changes through typed events
- **Dependency Inversion** — Game logic doesn't depend on Phaser
- **Single Responsibility** — Each module has one clear purpose

### 🔄 Data Flow
```
User Input → Game Events → State Reducers → UI Updates
     ↓
Phaser Rendering ← Adapter Layer ← Game State
```

## 🎨 Game Design

### 🎮 Core Loop
1. **Move** — Navigate with responsive controls
2. **Survive** — Avoid enemy collisions
3. **Progress** — Watch difficulty scale over time
4. **Achieve** — Reach 60-second survival goal

### 📈 Difficulty Scaling
- **Time-based** — Enemy spawn rate increases every 10 seconds
- **Adaptive** — Spawn interval decreases from 0.7s to 0.5s minimum
- **Engaging** — Maintains challenge without overwhelming players

## 🧑‍💻 Contributing

This project demonstrates modern game development patterns. Feel free to:

- 🐛 Report bugs via Issues
- 💡 Suggest features or improvements
- 🔧 Submit Pull Requests
- 📖 Improve documentation

## 📄 License

MIT License - feel free to use this code for learning or your own projects!

---

**💫 Built with modern web technologies and clean architecture principles**

*Created as a learning project showcasing TypeScript, functional programming, and game development best practices.*