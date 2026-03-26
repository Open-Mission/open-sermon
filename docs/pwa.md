# Progressive Web App (PWA) Implementation

This document describes the PWA implementation for Open Sermon, enabling mobile installation and offline functionality.

## Core Components

### 1. Web App Manifest (`public/manifest.json`)
The manifest file provides metadata about the application for browsers and mobile devices.
- **Display**: `standalone` (removes browser UI when installed).
- **Orientation**: `portrait-primary`.
- **Icons**: A set of icons ranging from 48x48 to 512x512, located in `public/icons/`.
- **Theme Color**: `#ffffff` (light) / `#000000` (dark transitions).

### 2. Service Worker (`public/sw.js`)
A custom service worker handles asset caching and offline requests.
- **Cache Name**: `open-sermon-cache-v1`.
- **Static Assets**: Caches core bundles, fonts, and icons on install.
- **Stale-While-Revalidate**: For common navigation and assets.
- **Network-First**: For API calls to ensure data freshness when online.
- **Offline Fallback**: Intercepts failed navigation requests and serves `/offline`.

### 3. Service Worker Registration (`components/service-worker-registration.tsx`)
A client-side component that registers the service worker.
- Included in the root layout.
- Only executes in production and supported browsers.

### 4. Offline Page (`app/offline/page.tsx`)
A dedicated page shown when the user has no internet connection and tries to navigate to a non-cached route.
- Provides a "Try Again" button.
- Consistent styling with the rest of the app.

## Middleware Adjustments
The `proxy.ts` middleware is configured to exempt the offline route from internationalization redirects to ensure it's always accessible by the service worker.

## Metadata
Meta tags for PWA are included in the root `layout.tsx`:
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- `theme-color`
