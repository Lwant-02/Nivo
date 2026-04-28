# Nivo

Premium macOS Dynamic Island utility for the Mac notch. Nivo transforms your MacBook's notch into a sleek, interactive, and intelligent "Live Activity" hub that feels like a native part of macOS.

![Nivo](https://img.shields.io/badge/version-1.1.0-purple)
![License](https://img.shields.io/badge/license-Proprietary-purple)

## ✨ Main Features

### 🎵 Universal Media Control

- **Intelligent Sync**: Pulls real-time media info from Spotify, Apple Music, YouTube, and all major browsers.
- **Rich Visuals**: Displays high-quality album artwork and a live animated waveform visualizer.
- **Quick Controls**: Play, pause, skip tracks, and adjust volume directly from the expanded Notch.
- **Audio Output**: Displays your active audio device (Speakers, AirPods, or Headsets) with high-fidelity 3D icons.

### 🌤️ Atmospheric Aura (Weather)

- **Real-time Reactions**: The Notch background and indicators react to your local weather with beautiful "Atmospheric Aura" animations (Rain, Snow, Sun, Night, Golden Hour).
- **Privacy-First**: No GPS tracking or sensitive API keys required. Nivo uses coarse, privacy-preserving geo-location via your IP to fetch local conditions.
- **Visual Indicators**: A subtle glowing ring in the collapsed view indicates the current temperature and atmospheric state.

### 🗓️ Smart Calendar & Meetings

- **Quiet Assistant**: Pulls upcoming events from your macOS Calendar via a high-performance native AppleScript bridge.
- **Integrated Weather**: View your daily agenda alongside real-time weather forecasts in the expanded Calendar Pane.
- **Click-to-Join**: Detects Zoom, Google Meet, and Microsoft Teams links for one-click joining directly from the Notch.
- **Smart Reminders**: Auto-expands the Notch before a meeting starts with a gentle "Nivo Toast" notification.

### 🧘‍♂️ Zen Bar (Productivity)

- **Focus Timer**: Integrated Pomodoro & Focus Timer with a subtle glowing progress bar at the base of the Notch.
- **Tactile Feedback**: Every session completion is reinforced with high-quality haptic feedback and custom system notifications.
- **Session Tracking**: Customizable durations to fit your deep-work workflow.

### 🔊 Sonic Feedback

- **Acoustic Experience**: High-fidelity mechanical keyboard clicks that provide satisfying auditory confirmation for every keystroke.
- **Multi-Pack Soundboard**: Choose from 10+ professional mechanical keyboard sound packs, including CherryMX (Black, Blue, Brown, Red), EG Crystal Purple, and Oreo.
- **System-Wide Integration**: Works across all applications on macOS, transforming any keyboard into a premium mechanical typing experience.
- **Ultra-Low Latency**: Built with the Web Audio API for near-zero delay, ensuring the sound perfectly syncs with your typing speed.
- **Personalized Audio**: Seamlessly toggled within the Nivo settings panel for a focused or immersive workspace.

### 🔋 System Intelligence & Customization

- **Adaptive Themes**: 16+ curated premium themes (Obsidian, Nebula, Cyber, Prism, and more) for both the Notch Style and App Accents.
- **Haptic Feedback**: Subtle, tactile taps via Force Touch trackpads for every interaction, from swipes to button clicks.
- **Fullscreen Stability**: Configurable visibility that allows Nivo to stay active even when you're working in fullscreen apps.

## 🛠️ Tech Stack

- **Engine**: Electron + Vite + TypeScript
- **UI Architecture**: React 19 + Tailwind CSS v4
- **Animation Engine**: Framer Motion (Apple-style spring physics)
- **Data Persistence**: SQLite (offline-first local storage)
- **Weather Provider**: Privacy-focused Open-Meteo Integration
- **Licensing**: Integrated activation via Lemon Squeezy

## 🎨 Design Philosophy: "Quiet Luxury"

Nivo is designed to be felt, not just seen. It follows a minimalist aesthetic characterized by:

- **Glassmorphism**: Sophisticated frosted glass effects with dynamic backdrop blurs.
- **Apple-Style Physics**: Every movement uses high-stiffness, low-damping springs for a snappy, organic feel.
- **Non-Intrusive**: Automatically hides when recording your screen to preserve privacy, with toggleable fullscreen persistence.

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
nivo/
├── src/
│   ├── main/          # Electron main process (Services, Database, IPC)
│   ├── preload/       # Preload scripts (Context Bridge & API Types)
│   └── renderer/      # React UI components, Hooks, and Styles
├── resources/         # High-res app icons and native assets
└── build/             # Electron builder configuration
```

## 📄 License

Proprietary software. Purchase at [nawmain.dev](https://nawmain.dev)
