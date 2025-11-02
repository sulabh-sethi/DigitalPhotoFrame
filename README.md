# 🖼️ Digital FotoFrame
*A Progressive Web App for Android TV that turns your screen into a smart, connected digital photo frame.*

---

## 🌟 Overview
**Digital FotoFrame** is a React + TypeScript PWA designed for Android TV browsers and WebViews. It transforms any large screen into a rich photo frame capable of playing offline USB folders or live Google Photos albums with weather, clock, theming, and ambient music overlays.

The application aligns with the production PRD by providing:
- 📁 **USB / Local Storage** folder browsing via the File System Access API.
- ☁️ **Google Photos** device-linking flow with album selection & auto-sync.
- ☀️ **OpenWeatherMap** widget with automatic or manual location support.
- 🕓 **Customizable overlays** (clock positions, formats, transitions, ambient audio, brightness, etc.).
- ⚙️ **Persisted preferences** in IndexedDB/local storage for seamless restarts.
- 📱 **PWA installability** and offline caching for local slideshows.

---

## 🚀 Key Capabilities
- 🔗 **QR-based Google Photos Login** using OAuth device flow with polling.
- 📷 **Full-screen slideshow engine** powered by Framer Motion transitions (fade, slide, pan, zoom, Ken Burns).
- 💾 **Recursive USB scanning** with automatic caching and preloading for stutter-free playback.
- 🎚️ **Settings side panel** covering fonts, transitions, intervals, visuals, startup behaviour, audio, and weather options.
- 🎵 **Ambient soundscapes** generated via Web Audio to avoid bundling large media files.
- ☁️ **Live weather overlay** refreshing on a schedule with metric/imperial unit support.
- 🌙 **Theme toggle** persisted across sessions with light/dark gradients tuned for TV viewing.
- 🧭 **DPAD-friendly UI** with large focusable tiles, overlays, and button spacing.

---

## 🧱 Tech Stack
| Layer              | Technology                                              |
|--------------------|---------------------------------------------------------|
| Build Tooling      | [Vite](https://vitejs.dev/) + SWC React plugin          |
| Language           | TypeScript + React 18                                   |
| State/Settings     | React Context + IndexedDB (`idb-keyval`)                |
| Animations         | Framer Motion                                           |
| Google Integration | Google Photos REST API + OAuth 2.0 device flow          |
| Weather            | OpenWeatherMap Current Weather API                      |
| Storage            | File System Access API for local folders                |
| PWA                | Custom service worker + web manifest                    |

---

## 📁 Project Structure
```
DigitalPhotoFrame/
├── index.html                # Vite entry point
├── package.json
├── public/
│   ├── icons/                # PWA icons
│   └── service-worker.js     # Simple cache-first service worker
├── src/
│   ├── App.tsx               # Root composition & routing between views
│   ├── components/           # UI components (slideshow, widgets, google manager, etc.)
│   ├── contexts/             # Settings context & theme helpers
│   ├── hooks/                # Local folder, Google Photos, weather, slideshow logic
│   ├── services/             # Google Photos, weather, and storage helpers
│   ├── styles/               # Global + feature CSS
│   └── utils/                # Shared types
└── docs/                     # Product PRD and supporting documentation
```

---

## ⚙️ Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables** (copy `.env.example` to `.env` and adjust values):
   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
  | `VITE_GOOGLE_CLIENT_ID` | OAuth 2.0 client ID with Google Photos API enabled (optional if set via Customize → Integrations). |
  | `VITE_GOOGLE_CLIENT_SECRET` *(optional)* | Required only when using refresh tokens on web. |
  | `VITE_OPEN_WEATHER_API_KEY` | OpenWeatherMap API key for the weather widget. |

  > **Tip:** The customization panel allows entering the Google client ID, weather API key, or manual city per device if you prefer not to bake them into the build.

3. **Run locally**
   ```bash
   npm run dev
   ```
   Visit the printed URL (e.g., `http://localhost:5173`) from a Chromium-based Android TV browser.

4. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🔐 Google Photos Device Linking
1. From the welcome screen choose **Connect Google Photos** to open the Google manager overlay.
2. Generate a QR code and scan it from a mobile device (or visit the verification URL manually).
3. Once authenticated, pick the albums to include. The app stores encrypted tokens in IndexedDB for offline persistence.
4. Press **Start slideshow** to begin playback. New photos added to the selected albums are fetched automatically during syncs.

> **Note:** For production you should proxy token refreshes through a secure backend. This demo stores refresh tokens locally for simplicity.

---

## ☁️ Weather Integration
- Requires an OpenWeatherMap API key (`VITE_OPEN_WEATHER_API_KEY` or via settings panel).
- Choose between auto geolocation or manual city entry.
- Refresh cadence is configurable (default 15 minutes).

---

## 🎵 Ambient Audio
Ambient soundscapes are synthesised with the Web Audio API to keep the bundle lightweight. Playback may require an initial click/tap on some browsers due to auto-play restrictions; the in-app prompt handles this gracefully.

---

## 📦 Offline & PWA Notes
- Local/USB slideshows continue to work offline; images are streamed directly from the File System Access handles.
- The included service worker precaches the shell (`index.html`, manifest) and caches network requests opportunistically for quick restarts.
- Install via the Android TV browser’s “Add to Home Screen” option to run as a fullscreen PWA.

---

## 🧪 Testing
No automated tests are included yet. You can run `npm run build` to ensure the TypeScript compilation succeeds and the bundle is production-ready.

---

## 📄 License
This project is provided as-is for demonstration purposes aligned with the supplied PRD.
