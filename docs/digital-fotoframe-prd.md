# Digital FotoFrame Product Requirements Document (PRD)

## Document Control
- **Product Name:** Digital FotoFrame (Android TV PWA)
- **Version:** 1.0
- **Author / Owner:** Product Owner
- **Last Updated:** 2025-11-01
- **Status:** Draft for review

## 1. Product Vision
Digital FotoFrame transforms any Android TV into an intelligent ambient display for personal memories. By seamlessly surfacing photos from USB storage or Google Photos, enhancing them with subtle motion effects, and overlaying contextual information like weather and time, the product delivers a hands-free, minimalist experience that feels native to the living room.

## 2. Goals & Objectives
1. Deliver a distraction-free, full-screen slideshow optimized for Android TV remotes.
2. Provide an onboarding experience that completes within three remote interactions, featuring QR-based Google account linking.
3. Support persistent multi-user sessions with per-user customization.
4. Offer extensive personalization for transitions, overlays, audio, and theming.
5. Integrate real-time weather data and local time overlays without compromising immersion.
6. Ensure offline usability for USB/local media and robust caching for online sources.

## 3. Target Audience
- **Households and Families:** Display shared Google Photos albums in communal spaces.
- **Hospitality & Retail:** Use curated playlists for ambient brand or promotional content.
- **Photographers & Creators:** Showcase portfolios during events or installations.

## 4. Product Scope & Features
### 4.1 Landing / Welcome Screen
- Full-screen launch animation displaying the Digital FotoFrame logo.
- Prominent tile-based options sized for TV navigation:
  1. **Select Folder (USB/Local Storage)**
  2. **Connect Google Photos Account (QR Login)**
- Persistent top bar containing:
  - Left: **Customize** button (gear icon)
  - Right: **Theme Toggle** (light/dark)

### 4.2 USB / Local Storage Source
- Auto-detect connected USB storage devices and enumerate the folder hierarchy.
- Allow selection of one or more folders, with optional recursive scanning.
- Initiate slideshow automatically after confirmation.
- Cache thumbnails/previews to maintain smooth transitions during offline playback.

### 4.3 Google Photos Integration (No Middleware)
- Display a QR code linking to a hosted OAuth consent flow; support mobile device sign-in.
- Store OAuth tokens securely in IndexedDB/localStorage with refresh token encryption.
- Allow album discovery and selection, with the ability to include multiple albums per account.
- Support multiple Google accounts with switch capability and persistent sessions across reboots.
- Perform incremental sync every 15 minutes to pull newly added photos.

### 4.4 Slideshow Experience
- Transition repertoire: **Fade, Pan, Zoom, Slide, Ken Burns** with configurable easing.
- Default interval: 8 seconds; adjustable between 3–30 seconds.
- Pre-fetch the next N (configurable) photos for stutter-free playback.
- Adaptive background color based on current theme.
- Optional ambient music playback with looped preset tracks; user toggleable.

### 4.5 Customization Panel
Accessible from any screen via the top-left **Customize** button or remote menu key.

| Category        | Settings                                                                 |
|-----------------|--------------------------------------------------------------------------|
| Clock           | Show/hide, corner position (4 options), analog/digital, 12/24-hour       |
| Font & Display  | Font family (2–3 curated options), font size slider                      |
| Transitions     | Enable/disable individual transition types                               |
| Interval        | Slider or selector for 3–30 second display duration                      |
| Visuals         | Brightness, contrast, overlay transparency sliders                       |
| Startup         | Toggle auto-start slideshow on app launch or TV boot                     |
| Audio           | Ambient music enable/disable, preset track selection                     |
| Weather Widget  | On/off toggle and location preferences                                   |
| Account         | Logout current Google account                                            |

### 4.6 Weather Widget
- Integrate with OpenWeatherMap using client-side fetch (API key stored securely locally).
- Determine location via HTML5 geolocation with manual override for city name.
- Display temperature, weather condition icon, and last updated timestamp.
- Refresh cadence: every 15 minutes, with graceful degradation on API failure.

### 4.7 Theming & Accessibility
- Global light/dark theme toggle stored per user profile.
- Ensure UI components maintain WCAG AA contrast ratios in both themes.
- Support font scaling and minimal motion mode (disable advanced transitions).

## 5. User Flows
### 5.1 First-Time Experience
```
Welcome Screen → Choose Source → (USB Folder Selection | Google Photos QR) → Slideshow
```

### 5.2 Google Login Flow
```
QR Display on TV → Mobile Scan → Google OAuth Consent → Success Redirect → Token Stored → Album Selection → Slideshow
```

### 5.3 Customization Flow
```
Slideshow → Open Customization Panel → Adjust Settings → Auto-Save Preferences → Resume Slideshow
```

## 6. UX Design Principles
- **Minimalist Ambient Display:** Full-bleed imagery with overlays appearing only on demand.
- **Remote-First Navigation:** Large focusable tiles and DPAD-friendly layout (48 px minimum height).
- **Smooth Motion:** Utilize `react-spring` or `framer-motion` for transitions at 60 FPS.
- **Responsive:** Optimize for 1080p and 4K resolutions with safe area consideration.
- **Typography:** High-contrast sans-serif fonts curated for readability at distance.

## 7. Technical Architecture
| Layer / Concern            | Decision                                                                 |
|----------------------------|--------------------------------------------------------------------------|
| Frontend Framework         | React + TypeScript                                                       |
| UI Toolkit                 | Tailwind CSS or Material UI (evaluate based on TV focus management)      |
| Navigation                 | React Router + `react-tv-navigation` for DPAD focus handling             |
| Data Storage               | IndexedDB (settings, tokens, image cache metadata)                       |
| Authentication             | Google OAuth 2.0 device linking (QR)                                     |
| APIs                       | Google Photos REST API, OpenWeatherMap API                               |
| Caching & Offline Support  | PWA service worker, Cache Storage, Background Sync                       |
| Media Handling             | Web FileSystem Access API for USB, progressive image loading             |
| Deployment                 | Hosted HTTPS PWA installable on Android TV browser                       |

## 8. Non-Functional Requirements
| Category        | Requirement                                                                   |
|----------------|-------------------------------------------------------------------------------|
| Performance     | App load ≤ 3 seconds on cold start; maintain ≥ 60 FPS during transitions      |
| Reliability     | Resume last active slideshow (source + settings) after restart                |
| Security        | Encrypt refresh tokens at rest; secure storage best practices                |
| Offline Support | Full functionality for USB/local sources without internet connectivity       |
| Scalability     | Support up to 10,000 images per playlist with efficient memory usage         |
| Compatibility   | Android TV OS 10+, Chromium-based WebView                                     |
| Localization    | English (v1) with architecture supporting future i18n                         |
| Accessibility   | Font scaling, high contrast, optional reduced motion                          |
| Logging         | Local-only diagnostic logging, no third-party analytics                       |

## 9. Roadmap & Future Enhancements
- AI-powered face clustering and smart album filters.
- Voice control integration with Google Assistant.
- Additional cloud storage integrations (OneDrive, Dropbox).
- Seasonal or event-based smart album rotation.
- Companion mobile app for remote configuration and notifications.

## 10. Acceptance Criteria Summary
| Feature            | Acceptance Criteria                                                      |
|--------------------|--------------------------------------------------------------------------|
| Google Login       | QR-based OAuth completes on mobile; session persists after reboot        |
| Slideshow          | Begins automatically post source selection; transitions render smoothly  |
| USB Access         | User can browse/select folders; handles device hot-plug gracefully       |
| Customization      | Changes apply immediately and persist across sessions                    |
| Theme Toggle       | Immediate theme switch; state saved to local storage                     |
| Weather Widget     | Displays accurate data refreshed every 15 minutes; fails gracefully      |
| Multi-User Support | Users can switch Google accounts without reinstalling the app            |
| Offline Mode       | USB/local slideshows function fully without network connectivity         |
| Auto Sync          | New Google Photos appear in slideshow within 15 minutes                  |

## 11. Representative User Stories
1. As a user, I scan a QR code on my TV to sign into Google Photos without typing credentials.
2. As a user, I select specific Google Photos albums to include in the slideshow.
3. As a user, I adjust transitions and interval speed to match my ambience preferences.
4. As a user, I enable clock and weather overlays that remain unobtrusive during playback.
5. As a user, I configure the app to auto-start the slideshow whenever the TV boots up.

