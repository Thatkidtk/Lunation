import React, { useState } from 'react';
import { useCycle } from '../contexts/CycleContext';
import { passkeyAuth } from '../utils/passkeyAuth';
import AuthModal from './AuthModal';
import * as Sentry from '@sentry/react';
import { toast } from '../ui/Toast';
import { ariaAnnounce } from '../ui/aria/LiveRegion';

function Settings() {
  const { encryption, unlock, enableEncryption, disableEncryption, changePassphrase } = useCycle();

  const [enableForm, setEnableForm] = useState({ pass1: '', pass2: '' });
  const [unlockPass, setUnlockPass] = useState('');
  const [changeForm, setChangeForm] = useState({ oldPass: '', newPass1: '', newPass2: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => passkeyAuth.getCurrentUser());
  const [testerCode, setTesterCode] = useState(() => {
    try { return localStorage.getItem('lunation:tester_code') || ''; } catch (_) { return ''; }
  });
  const [forceCrash, setForceCrash] = useState(false);

  if (forceCrash) {
    // Force a render-time error so ErrorBoundary captures it
    throw new Error('Test crash triggered from Settings');
  }

  const handleEnable = async (e) => {
    e.preventDefault();
    setError('');
    if (!enableForm.pass1 || enableForm.pass1 !== enableForm.pass2) {
      setError('Passphrases do not match');
      return;
    }
    setBusy(true);
    try {
      await enableEncryption(enableForm.pass1);
      setEnableForm({ pass1: '', pass2: '' });
    } catch (err) {
      setError('Failed to enable encryption');
    } finally {
      setBusy(false);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    if (!unlockPass) return;
    setBusy(true);
    try {
      await unlock(unlockPass);
      setUnlockPass('');
    } catch (err) {
      setError('Incorrect passphrase');
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    const pass = prompt('Enter your passphrase to disable encryption:');
    if (!pass) return;
    setBusy(true);
    setError('');
    try {
      await disableEncryption(pass);
    } catch (err) {
      setError('Failed to disable encryption');
    } finally {
      setBusy(false);
    }
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
    setError('');
    if (!changeForm.newPass1 || changeForm.newPass1 !== changeForm.newPass2) {
      setError('New passphrases do not match');
      return;
    }
    setBusy(true);
    try {
      await changePassphrase(changeForm.oldPass, changeForm.newPass1);
      setChangeForm({ oldPass: '', newPass1: '', newPass2: '' });
    } catch (err) {
      setError('Failed to change passphrase (check old passphrase)');
    } finally {
      setBusy(false);
    }
  };

  const handleAuthSuccess = (userInfo) => {
    setCurrentUser(userInfo);
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    passkeyAuth.signOut();
    setCurrentUser(null);
  };

  const saveTesterCode = () => {
    try {
      localStorage.setItem('lunation:tester_code', testerCode.trim());
      const uid = localStorage.getItem('lunation:user_id') || undefined;
      Sentry.setUser({ id: uid, username: testerCode.trim() || undefined });
      if (testerCode.trim()) Sentry.setTag('tester_code', testerCode.trim());
      toast.success('Tester code saved');
      ariaAnnounce('Tester code saved');
    } catch (_) {
      // best-effort
    }
  };

  const sendTestEvent = () => {
    Sentry.captureMessage('tester.send_test_event', { level: 'info' });
    toast.info('Test event sent');
    ariaAnnounce('Test event sent');
  };

  return (
    <div className="card">
      <h2>⚙️ Settings</h2>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Testing & Diagnostics */}
        <div style={{ background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🧪 Testing & Diagnostics
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
            <label style={{ fontWeight: 600 }}>Tester Code (optional)</label>
            <input
              type="text"
              value={testerCode}
              onChange={(e) => setTesterCode(e.target.value)}
              placeholder="e.g. QA-001, Alice, Device-3"
              style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn" type="button" onClick={saveTesterCode}>Save Tester Code</button>
              <button className="btn btn-secondary" type="button" onClick={sendTestEvent}>Send Test Event</button>
              <button className="btn btn-secondary" type="button" onClick={() => setForceCrash(true)} style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>Crash App (test)</button>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              Saved code is attached to error reports to identify your device/tester.
            </div>
          </div>
        </div>
        {/* Account Authentication */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', 
          padding: '1.5rem', 
          borderRadius: 12,
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔐 Account & Authentication
          </h3>
          
          {currentUser ? (
            <div>
              <div style={{ 
                background: 'var(--success-light)',
                border: '1px solid var(--success)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {currentUser.local ? '🏠' : '🔐'}
                  </span>
                  <div>
                    <div style={{ color: 'var(--text)', fontWeight: 'bold' }}>
                      {currentUser.local ? 'Local Account' : 'Passkey Account'}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                      Signed in as: {currentUser.name}
                    </div>
                  </div>
                </div>
                {!currentUser.local && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                    Protected with device biometrics or security key
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {currentUser.local && (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    🔐 Upgrade to Passkey
                  </button>
                )}
                
                <button
                  onClick={handleSignOut}
                  style={{
                    background: 'transparent',
                    color: 'var(--muted)',
                    border: '1px solid var(--border)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
                Set up secure authentication to protect your Lunation data across devices.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                🔐 Set Up Authentication
              </button>
            </div>
          )}
        </div>

        {/* Data Privacy */}
        <div style={{ background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', padding: '1rem', borderRadius: 12 }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>🔒 Data Privacy & Encryption</h3>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Your data is stored locally in this browser. You can enable optional encryption with a passphrase to protect it at rest.
          </p>
        </div>

        {/* Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 12 }}>
            <div><strong>Status:</strong> {encryption.enabled ? (encryption.locked ? 'Encrypted (Locked)' : 'Encrypted (Unlocked)') : 'Not Encrypted'}</div>
            <div><strong>Sessions:</strong> Passphrase is kept only in memory for this session.</div>
          </div>
        </div>

        {/* Enable encryption */}
        {!encryption.enabled && (
          <form onSubmit={handleEnable} style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 12 }}>
            <h4 style={{ marginTop: 0 }}>Enable Encryption</h4>
            <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
              <input type="password" placeholder="Passphrase" value={enableForm.pass1} onChange={(e) => setEnableForm({ ...enableForm, pass1: e.target.value })} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd' }} />
              <input type="password" placeholder="Confirm passphrase" value={enableForm.pass2} onChange={(e) => setEnableForm({ ...enableForm, pass2: e.target.value })} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd' }} />
              <button disabled={busy} className="btn" type="submit" style={{ width: 'fit-content' }}>{busy ? 'Working…' : 'Enable'}</button>
            </div>
          </form>
        )}

        {/* Unlock */}
        {encryption.enabled && encryption.locked && (
          <form onSubmit={handleUnlock} style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 12 }}>
            <h4 style={{ marginTop: 0 }}>Unlock Data</h4>
            <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
              <input type="password" placeholder="Passphrase" value={unlockPass} onChange={(e) => setUnlockPass(e.target.value)} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd' }} />
              <button disabled={busy} className="btn" type="submit" style={{ width: 'fit-content' }}>{busy ? 'Unlocking…' : 'Unlock'}</button>
            </div>
          </form>
        )}

        {/* Manage encryption */}
        {encryption.enabled && !encryption.locked && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <form onSubmit={handleChangePass} style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 12 }}>
              <h4 style={{ marginTop: 0 }}>Change Passphrase</h4>
              <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
                <input type="password" placeholder="Current passphrase" value={changeForm.oldPass} onChange={(e) => setChangeForm({ ...changeForm, oldPass: e.target.value })} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd' }} />
                <input type="password" placeholder="New passphrase" value={changeForm.newPass1} onChange={(e) => setChangeForm({ ...changeForm, newPass1: e.target.value })} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd' }} />
                <input type="password" placeholder="Confirm new passphrase" value={changeForm.newPass2} onChange={(e) => setChangeForm({ ...changeForm, newPass2: e.target.value })} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd' }} />
                <button disabled={busy} className="btn" type="submit" style={{ width: 'fit-content' }}>{busy ? 'Working…' : 'Change Passphrase'}</button>
              </div>
            </form>

            <div style={{ background: 'linear-gradient(135deg, #fff5f5, #fed7d7)', padding: '1rem', borderRadius: 12, border: '1px solid #feb2b2' }}>
              <h4 style={{ marginTop: 0, color: '#e53e3e' }}>Disable Encryption</h4>
              <p style={{ color: '#744210' }}>This will write your data in plaintext to this browser. Not recommended.</p>
              <button disabled={busy} className="btn" onClick={handleDisable} style={{ background: '#e53e3e' }}>Disable Encryption</button>
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={handleAuthSuccess} 
        />
      )}
    </div>
  );
}

export default Settings;
