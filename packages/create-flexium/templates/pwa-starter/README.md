# Flexium PWA Starter

A production-ready Progressive Web App (PWA) template for Flexium applications with offline support, installability, and push notifications.

## Features

- Progressive Web App capabilities
- Service Worker for offline functionality
- Install to home screen support
- Push notifications
- Background sync
- Responsive design
- LocalStorage persistence
- Online/Offline detection
- TypeScript support
- Vite for fast development

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## PWA Features

### Offline Support

The app works offline thanks to the service worker that caches essential resources. Try:
1. Load the app while online
2. Disconnect from the internet
3. The app still works!

### Install to Home Screen

On supported browsers, you'll see an install prompt. After installing:
- App launches in standalone mode (no browser UI)
- Appears in your app drawer/home screen
- Faster startup times

### Push Notifications

Click "Enable Notifications" to receive push notifications. The app demonstrates:
- Notification permission requests
- Basic notification API
- Service worker notification handling

### Background Sync

The service worker supports background sync for offline actions. Implement your sync logic in `public/sw.js`.

## Project Structure

```
.
├── public/
│   ├── icons/           # PWA icons (add your own)
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
├── src/
│   ├── App.tsx         # Main app component
│   ├── App.css         # App styles
│   ├── pwa.ts          # PWA utilities
│   └── main.ts         # Entry point
├── index.html
├── vite.config.ts      # Vite + PWA config
└── package.json
```

## Adding Icons

Replace the placeholder icons in `public/icons/` with your app icons:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

You can generate these from a single source image using tools like:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Customizing

### Manifest

Edit `public/manifest.json` to customize:
- App name and description
- Theme and background colors
- Display mode
- Orientation preferences

### Service Worker

Edit `public/sw.js` to customize:
- Cache strategy
- Cached resources
- Background sync behavior
- Push notification handling

## Testing PWA Features

### Chrome DevTools

1. Open DevTools (F12)
2. Go to "Application" tab
3. Check:
   - Manifest
   - Service Workers
   - Cache Storage
   - Clear Site Data

### Lighthouse

Run Lighthouse audit for PWA score:
1. Open DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"

## Deployment

Deploy to any static hosting service:

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### GitHub Pages

```bash
npm run build
# Deploy the dist/ folder
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Partial support (no install prompt)
- iOS Safari: Add to Home Screen manually

## Learn More

- [Flexium Documentation](https://github.com/Wick-Lim/flexium.js)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
