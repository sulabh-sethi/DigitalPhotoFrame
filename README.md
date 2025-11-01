# 🖼️ Digital FotoFrame  
*A Progressive Web App for Android TV that turns your screen into a smart, connected digital photo frame.*

---

## 🌟 Overview
**Digital FotoFrame** is a minimalist React-based PWA built for Android TV.  
It lets users display beautiful, auto-playing photo slideshows from:
- 📁 **USB / Local Storage**
- ☁️ **Google Photos Albums** (via QR-based device login)

The app runs natively in a TV browser or WebView, supports light/dark themes, live weather, clocks, and full-screen transitions — creating an elegant always-on ambient experience.

---

## 🚀 Key Features
- 🔗 **QR-Code Login** — Connect Google Photos without typing on TV  
- 📷 **Auto Slideshows** — Begin automatically after selecting a folder or album  
- 💾 **USB Support** — Browse & select local folders recursively  
- 👥 **Multi-User Accounts** — Switch between linked Google accounts  
- 🕓 **Customizable Clock** — Position, format (12/24 hr), analog/digital  
- 🎨 **Transitions & Themes** — Ken Burns, fade, zoom + light/dark mode  
- 🔊 **Ambient Music** — Optional background tracks  
- ☁️ **Live Weather Widget** — Powered by OpenWeatherMap  
- 💡 **Auto-Start on Boot** — Resume slideshow automatically  
- 💾 **Offline Mode** — Full functionality for local photos  

---

## 🧱 Tech Stack
| Layer | Technology |
|-------|-------------|
| **Frontend** | React + TypeScript |
| **UI** | Tailwind CSS / Material UI |
| **Routing** | React Router |
| **Storage** | IndexedDB (local tokens & cache) |
| **Auth & Photos** | Google Photos API + OAuth 2.0 (Device Flow) |
| **Weather** | OpenWeatherMap API |
| **PWA Features** | Service Worker, offline cache, installable manifest |
| **TV Navigation** | DPAD Events (`react-tv-navigation`) |

---

## 🧭 Project Structure
