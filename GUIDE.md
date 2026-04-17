Lume: Project Overview
Lume is a premium macOS "Dynamic Island" utility designed specifically for the Mac notch. It follows a "Quiet Luxury" aesthetic—minimalist, high-performance, and native-feeling. Unlike competitors (like Alcove), Lume is positioned as a one-time purchase ($5) to appeal to users who hate subscriptions.
1. The VisionThe Problem:
 The Mac notch is "dead space," and current utilities that make it useful are either too expensive or require monthly payments.The Solution: A lightweight, non-intrusive HUD (Heads-Up Display) that provides instant access to media, system stats, and utility tools with a simple hover gesture.The Vibe: Dark mode by default, glassmorphism (frosted glass), smooth spring animations, and subtle neon-purple accents.
 2. Core Features (The MVP)
 FeatureDescriptionAdaptive NotchA small "pill" that sits under the camera and expands smoothly on hover.Universal Media HUDDisplays "Now Playing" info from Spotify, Apple Music, and Browsers (YouTube/Netflix).System Quick-ViewReal-time battery levels (Mac & AirPods) and simple CPU/RAM meters.Clipboard SnapshotHover to see the last text you copied for quick reference.One-Time LicenseIntegrated "Pro" activation for users who purchase from nawmain.dev.
 3. The Tech StackFramework: 
 Electron + Vite + TypeScript (High performance, type-safe).UI: React 19 + Tailwind CSS v4 (Modern, fast styling).Physics: Framer Motion (For the "squishy" Apple-style animations).Persistence: SQLite (Offline-first storage for settings and license state).Distribution: Lemon Squeezy (Merchant of Record for global sales and licensing).
 4. User Experience (The Flow)
 Idle State: A tiny, nearly invisible black bar tucked under the notch.
 Interaction: User moves the cursor to the top-center.
 Expansion: The bar "blooms" downward (like a Dynamic Island) to reveal information.
 Action: User can play/pause music, check battery, or click a "Pro" button to enter their license key.
 5. Roadmap to Launch
 Step 1: The Anchor. (Done) Setting up the transparent, always-on-top window.
 Step 2: The Visuals. Designing the "Pill" and "Expanded" states with Framer Motion.
 Step 3: The Data. Connecting to macOS system APIs (Media, Battery).
 Step 4: The Paywall. Building the license key verification screen.
 Step 5: The Website. Launching the landing page on nawmain.dev for $5 downloads.

 ✅ Included in Lume (The "Must-Haves")
These are the features that make people actually want to pay for a notch utility:

Media HUD: The "Now Playing" pill for Spotify, Apple Music, and YouTube (in browsers). This is the #1 reason people use Alcove.

Battery Status: Showing your Mac's percentage and, crucially, connected AirPods/Bluetooth battery levels.

Simple Logic: A "One-Time Purchase" license screen to unlock the full features.

Visual Polish: The "Dynamic Island" squishy animations and frosted glass (vibrancy) look.