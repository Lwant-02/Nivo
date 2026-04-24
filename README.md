# Lume

Premium macOS Dynamic Island utility for the Mac notch. Lume transforms your MacBook's notch into a sleek, interactive, and intelligent "Live Activity" hub that feels like a native part of macOS.

![Lume](https://img.shields.io/badge/version-1.0.0-purple)
![License](https://img.shields.io/badge/license-Proprietary-purple)

## ✨ Main Features

### 🎵 Universal Media Control
*   **Intelligent Sync**: Pulls real-time media info from Spotify, Apple Music, YouTube, and all major browsers.
*   **Rich Visuals**: Displays high-quality album artwork and a live animated waveform visualizer.
*   **Quick Controls**: Play, pause, skip tracks, and adjust volume directly from the expanded Notch.
*   **Audio Output**: Displays your active audio device (Speakers, AirPods, or Headsets) with high-fidelity 3D icons.

### 🗓️ Smart Calendar & Meetings
*   **Quiet Assistant**: Pulls upcoming events from your macOS Calendar.
*   **Meeting Reminders**: Auto-expands the Notch 5–15 minutes before a meeting starts with a gentle "Lume Toast" notification.
*   **Click-to-Join**: Detects Zoom, Google Meet, and Microsoft Teams links for one-click joining.

### 🚶‍♂️ Idle Visualizer (Lottie)
*   **Always Alive**: When nothing is playing, Lume keeps your Notch lively with high-performance vector animations.
*   **Custom Styles**: Choose from 5 different Lottie animation styles (including walking characters and abstract physics).
*   **Seamless Transitions**: Animations stay active across the top even when the Notch is expanded.

### 🧭 Intuitive Gestures
*   **Swipe Right**: Skip to the next track.
*   **Swipe Left**: Go back to the previous track.
*   **Hover to Expand**: Native Apple-style spring animations for smooth expansion and collapse.

### 🔋 System Intelligence
*   **Adaptive Theme**: 6 curated themes (Midnight, Graphite, Ocean, Forest, Sunset, Berry) to match your setup.
*   **Haptic Feedback**: Subtle, tactile taps via Force Touch trackpads for every interaction.

## 🛠️ Tech Stack

*   **Engine**: Electron + Vite + TypeScript
*   **UI Architecture**: React 19 + Tailwind CSS v4
*   **Animation Engine**: Framer Motion (Apple-style spring physics)
*   **Data Persistence**: SQLite (offline-first local storage)
*   **Licensing**: Integrated activation via Lemon Squeezy

## 🎨 Design Philosophy: "Quiet Luxury"

Lume is designed to be felt, not just seen. It follows a minimalist aesthetic characterized by:
*   **Glassmorphism**: Sophisticated frosted glass effects with dynamic backdrop blurs.
*   **Apple-Style Physics**: Every movement uses high-stiffness, low-damping springs for a snappy, organic feel.
*   **Non-Intrusive**: Automatically hides in fullscreen or when recording your screen to preserve privacy.

## 🚀 Getting Started

### Installation
```bash
$ npm install
```

### Development
```bash
$ npm run dev
```

### Keyboard Shortcut
Press `Cmd+Shift+L` to toggle visibility or open settings.

## 📦 Building

```bash
# For macOS (Universal)
$ npm run build:mac
```

## 📂 Project Structure

```
lume/
├── src/
│   ├── main/          # Electron main process (Services, Database, IPC)
│   ├── preload/       # Preload scripts (Context Bridge & API Types)
│   └── renderer/      # React UI components, Hooks, and Styles
├── resources/         # High-res app icons and native assets
└── build/             # Electron builder configuration
```

## 📄 License

Proprietary software. Purchase at [nawmain.dev](https://nawmain.dev)
