# 🌐 Wisp Portfolio

A modern, responsive developer portfolio built with pure HTML, CSS, and JavaScript — focused on clean UI, system-driven design, and real project presentation.

## 🚀 Overview

This site represents more than just visuals — it showcases:

- 🧠 System thinking
- 🎯 Intentional UI/UX
- 🧩 Structured frontend architecture
- 📈 Continuous improvement as a developer

Built as a multi-page static site, optimized for performance, clarity, and scalability.

## ✨ Features

### 🎨 UI / Design

- Modern glass + layered UI aesthetic
- Responsive layout (mobile → desktop)
- Smooth reveal animations
- Card-based modular design
- Interactive hover + tilt effects

### ⚙️ Core Systems

#### 🔧 Theme Lab (Settings System)

- Theme switching (Dark, Light, Midnight)
- Surface modes (Glass / Solid)
- Font scaling
- Animation intensity
- Border radius control

All settings:

- Saved in `localStorage`
- Applied dynamically via class system

#### 🧩 Custom UI Components

- Custom dropdown system (replaces `<select>`)
- Custom slider system (replaces `<input type="range">`)
- Settings panel with live preview + apply/reset
- Floating action button (FAB)

#### 🎬 Animation System

- `IntersectionObserver`-based reveal system
- Optimized for performance (unobserves after trigger)
- Motion scaling support (reduced → dynamic)

### 📦 Project Loader

Dynamic portfolio system:

```js
fetch("projects.json")
```

- Auto-generates project cards
- Supports:
  - Tags
  - Tech stack
  - Multiple links
  - Live preview support

### 🖥️ Live Preview Overlay

- Opens projects inside iframe
- Uses `data-preview="url"`
- Clean modal-style experience
- Escape key + click-outside support

### 🧠 UX Enhancements

- Smooth page transitions
- Scroll-based header state
- Back-to-top button
- Mobile nav toggle
- Dev grid mode (`G` key)
- Reduced motion detection

## 📁 Project Structure

```
Wisp-Portfolio/
├── index.html        # Home page
├── portfolio.html    # Project showcase
├── about.html        # About section
├── contact.html      # Contact + socials
├── styles.css        # Main styling system
├── script.js         # Core logic + systems
├── projects.json     # Dynamic project data
└── assets/           # Images / icons (optional)
```
