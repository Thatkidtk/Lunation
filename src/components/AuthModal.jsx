import React, { useState } from 'react';
import { passkeyAuth } from '../utils/passkeyAuth';

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '',
    displayName: '',
    id: `user_${Date.now()}`
  });

  const handleRegister = async () => {
    if (!userInfo.name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await passkeyAuth.register({
        ...userInfo,
        displayName: userInfo.displayName || userInfo.name
      });

      if (result.success) {
        onAuthSuccess(result.userInfo);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await passkeyAuth.authenticate();
      
      if (result.success) {
        onAuthSuccess(result.userInfo);
        onClose();
      }
    } catch (err) {
      setError(err.message);
      // If no passkey found, suggest registration
      if (err.message.includes('No passkey found')) {
        setAuthMode('register');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔐</div>
          <h2 style={{ 
            color: 'var(--accent)', 
            marginBottom: '0.5rem',
            fontSize: '2rem'
          }}>
            {authMode === 'register' ? 'Secure Your Lunation' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: '1.5' }}>
            {authMode === 'register' 
              ? 'Set up passwordless authentication with your device\'s biometrics or security key'
              : 'Use your device\'s biometrics or security key to sign in'
            }
          </p>
        </div>

        {!passkeyAuth.isSupported && (
          <div style={{
            background: 'var(--warning-light)',
            border: '1px solid var(--warning)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            color: 'var(--text)'
          }}>
            <strong>⚠️ Passkeys Not Supported</strong>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Your browser doesn't support passkeys. You can still use Lunation with local storage.
            </p>
          </div>
        )}

        {authMode === 'register' && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Your Name *
              </label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: 'var(--text)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Display Name (optional)
              </label>
              <input
                type="text"
                value={userInfo.displayName}
                onChange={(e) => setUserInfo(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="How should we display your name?"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'var(--danger-light)',
            border: '1px solid var(--danger)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--text)',
            fontSize: '0.9rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {passkeyAuth.isSupported && (
            <button
              onClick={authMode === 'register' ? handleRegister : handleLogin}
              disabled={isLoading || (authMode === 'register' && !userInfo.name.trim())}
              style={{
                background: isLoading || (authMode === 'register' && !userInfo.name.trim())
                  ? 'var(--muted)' 
                  : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                cursor: isLoading || (authMode === 'register' && !userInfo.name.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  {authMode === 'register' ? 'Creating Passkey...' : 'Authenticating...'}
                </>
              ) : (
                <>
                  {authMode === 'register' ? '🔐 Create Passkey' : '🔓 Sign in with Passkey'}
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              // Continue without auth (local storage only)
              onAuthSuccess({ name: 'Guest User', local: true });
              onClose();
            }}
            style={{
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Continue without Account (Local Only)
          </button>

          {authMode === 'login' && (
            <button
              onClick={() => setAuthMode('register')}
              style={{
                background: 'transparent',
                color: 'var(--accent)',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Don't have a passkey? Create one
            </button>
          )}

          {authMode === 'register' && (
            <button
              onClick={() => setAuthMode('login')}
              style={{
                background: 'transparent',
                color: 'var(--accent)',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              Already have a passkey? Sign in
            </button>
          )}
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--surface-2)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ color: 'var(--text)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            🔒 What are Passkeys?
          </h4>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', lineHeight: '1.4', margin: 0 }}>
            Passkeys are a secure, passwordless way to sign in using your device's biometrics (Face ID, Touch ID, fingerprint) 
            or security keys. They're more secure than passwords and unique to each site.
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontSize: '1.5rem',
            padding: '0.5rem',
            borderRadius: '50%',
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AuthModal;