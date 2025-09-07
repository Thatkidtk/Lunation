import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './styles/responsive.css';
import App from './App';
import CrashScreen from './components/CrashScreen';
import { ToastHost } from './ui/Toast';
import { LiveRegion } from './ui/aria/LiveRegion';
import * as Sentry from '@sentry/react';
import { migrateStorage } from './lib/storage';

migrateStorage();

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  release: `lunation@${import.meta.env.VITE_APP_VERSION ?? 'dev'}`,
  environment: import.meta.env.MODE,
});

// Forward unhandled promise rejections to Sentry
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason ?? new Error('Unhandled rejection'));
  });
  // Capture uncaught errors as well
  window.addEventListener('error', (event) => {
    // Avoid double-reporting react boundary errors by checking for Event.error
    if (event?.message) {
      Sentry.captureException(event.error || new Error(String(event.message)));
    }
  });

  // Tag anonymous tester/user to correlate reports
  try {
    const key = 'lunation:user_id';
    let uid = localStorage.getItem(key);
    if (!uid) { uid = crypto.randomUUID(); localStorage.setItem(key, uid); }
    Sentry.setUser({ id: uid });
    Sentry.setContext('client', {
      userAgent: navigator.userAgent,
      platform: navigator.platform || 'web',
    });
  } catch (_) {}
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Sentry.ErrorBoundary fallback={<CrashScreen /> }>
    <React.StrictMode>
      <App />
      <ToastHost />
      <LiveRegion />
    </React.StrictMode>
  </Sentry.ErrorBoundary>
);

// Register service worker for PWA/offline support in production builds
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Optional: listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available; refresh prompt could be added here
              // console.log('New version available');
            }
          });
        });
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
  });
}
