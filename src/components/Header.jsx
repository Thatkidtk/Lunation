import React from 'react';

function Header() {
  return (
    <header className="header" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: '2rem', top: '1rem', opacity: 0.3 }} aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
          <defs>
            <radialGradient id="gmoon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#c6cde8"/>
            </radialGradient>
          </defs>
          <circle cx="60" cy="40" r="26" fill="url(#gmoon)" />
          <circle cx="68" cy="40" r="26" fill="#0b1020" />
        </svg>
      </div>
      <h1 style={{ marginBottom: '0.25rem' }}>🌙 Lunation</h1>
      <p style={{ margin: 0, opacity: 0.9 }}>Revolutionary AI-powered cycle tracking</p>
    </header>
  );
}

export default Header;
