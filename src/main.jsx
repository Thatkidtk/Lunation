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

// Best-effort storage migration; never let this crash the app
try { migrateStorage(); } catch (_) {}

// Cross-browser UUID generator (fallback if crypto.randomUUID missing)
function safeUUID() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
      const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }
  } catch (_) {}
  return `uid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
}

try {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      typeof Sentry.browserTracingIntegration === 'function' ? Sentry.browserTracingIntegration() : undefined,
      typeof Sentry.replayIntegration === 'function' ? Sentry.replayIntegration() : undefined,
    ].filter(Boolean),
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    release: `lunation@${import.meta.env.VITE_APP_VERSION ?? 'dev'}`,
    environment: import.meta.env.MODE,
  });
} catch (_) {}

// Forward unhandled promise rejections to Sentry
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason ?? new Error('Unhandled rejection'));
  });
  // Capture uncaught errors as well
  window.addEventListener('error', (event) => {
    // Avoid double-reporting react boundary errors by checking for Event.error
    if (event?.message) {
      try {
        const serialized = JSON.stringify({
          message: String(event.message || ''),
          stack: event?.error?.stack || null,
          filename: event?.filename || null,
          lineno: event?.lineno || null,
          colno: event?.colno || null,
        });
        sessionStorage.setItem('lunation:last_error', serialized);
      } catch (_) {}
      Sentry.captureException(event.error || new Error(String(event.message)));
    }
  });

  // Tag anonymous tester/user to correlate reports
  try {
    const key = 'lunation:user_id';
    let uid = localStorage.getItem(key);
    if (!uid) { uid = safeUUID(); localStorage.setItem(key, uid); }
    const testerCode = localStorage.getItem('lunation:tester_code') || undefined;
    Sentry.setUser({ id: uid, username: testerCode });
    if (testerCode) Sentry.setTag('tester_code', testerCode);
    Sentry.setContext('client', {
      userAgent: navigator.userAgent,
      platform: navigator.platform || 'web',
    });
  } catch (_) {}
}

function mount() {
  const el = document.getElementById('root');
  if (!el) { return; }
  const root = ReactDOM.createRoot(el);
  root.render(
    <Sentry.ErrorBoundary fallback={<CrashScreen /> }>
      <React.StrictMode>
        <App />
        <ToastHost />
        <LiveRegion />
      </React.StrictMode>
    </Sentry.ErrorBoundary>
  );
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}

// Register service worker for PWA/offline support in production builds
if (import.meta.env.MODE === 'production' && 'serviceWorker' in navigator) {
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
