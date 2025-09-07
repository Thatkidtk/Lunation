import React from 'react';
import * as Sentry from '@sentry/react';

export default function CrashScreen() {
  const eventId = Sentry.lastEventId?.() || Sentry.lastEventId || '';
  const [details, setDetails] = React.useState(null);
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lunation:last_error');
      if (raw) setDetails(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const copyId = async () => {
    try { await navigator.clipboard.writeText(String(eventId || '')); } catch {}
  };
  const report = () => {
    try { if (eventId) Sentry.showReportDialog({ eventId: String(eventId) }); } catch (_) {}
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
          <button className="btn btn-secondary" onClick={report} aria-label="Report this error">Report this error</button>
      </div>
        {eventId ? (
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Error id: {String(eventId)}</div>
        ) : null}

        {details ? (
          <div style={{ marginTop: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => setShowDetails((v) => !v)} aria-expanded={showDetails}>
              {showDetails ? 'Hide technical details' : 'Show technical details'}
            </button>
            {showDetails && (
              <pre style={{ textAlign: 'left', background: 'var(--surface)', padding: '0.75rem', borderRadius: 8, marginTop: '0.5rem', overflowX: 'auto' }}>
{(details.message || '') + (details.stack ? `\n${details.stack}` : '')}
              </pre>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
