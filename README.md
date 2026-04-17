# Lume

Premium macOS Dynamic Island utility for the Mac notch.

![Lume](https://img.shields.io/badge/version-1.0.0-purple)
![License](https://img.shields.io/badge/license-Proprietary-purple)

## Features

- **Adaptive Notch** - A sleek pill that expands smoothly on hover with spring animations
- **Universal Media HUD** - Display "Now Playing" from Spotify, Apple Music, and browsers
- **System Quick-View** - Real-time battery levels and CPU/RAM meters
- **Clipboard Snapshot** - Quick preview of your last copied text
- **Pro License** - One-time $5 purchase activation

## Tech Stack

- **Framework**: Electron + Vite + TypeScript
- **UI**: React 19 + Tailwind CSS v4
- **Animations**: Framer Motion (Apple-style spring physics)
- **Persistence**: SQLite (offline-first storage)
- **Distribution**: Lemon Squeezy (licensing)

## Design Philosophy

**Quiet Luxury** aesthetic:
- Dark mode by default
- Glassmorphism (frosted glass effect)
- Smooth spring animations
- Subtle neon-purple accents
- Minimalist, native-feeling UI

## Installation

```bash
$ npm install
```

## Development

```bash
$ npm run dev
```

### Keyboard Shortcut

Press `Cmd+Shift+L` to toggle visibility.

## Building

```bash
# For macOS
$ npm run build:mac

# For Windows
$ npm run build:win

# For Linux
$ npm run build:linux
```

## Project Structure

```
lume/
├── src/
│   ├── main/          # Electron main process
│   ├── preload/       # Preload scripts (context bridge)
│   └── renderer/      # React UI components
├── resources/         # App icons and assets
└── build/             # Build configuration
```

## License

Proprietary software. Purchase at [nawmain.dev](https://nawmain.dev)
