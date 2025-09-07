import React from 'react';
import * as Sentry from '@sentry/react';

export default function CrashScreen() {
  const eventId = Sentry.lastEventId?.() || Sentry.lastEventId || '';

  const copyId = async () => {
    try { await navigator.clipboard.writeText(String(eventId || '')); } catch {}
  };

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          An unexpected error occurred. You can try reloading the app.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn" onClick={() => window.location.reload()} aria-label="Reload app">Reload</button>
          <button className="btn btn-secondary" onClick={copyId} aria-label="Copy error id">Copy error id</button>
        </div>
        {eventId ? (
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Error id: {String(eventId)}</div>
        ) : null}
      </div>
    </div>
  );
}

