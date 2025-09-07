// Passkey Authentication for Lunation
// Using WebAuthn API for secure, passwordless authentication

export class PasskeyAuth {
  constructor() {
    this.isSupported = this.checkSupport();
  }

  // Check if WebAuthn/Passkeys are supported
  checkSupport() {
    return !!(
      window.PublicKeyCredential &&
      window.navigator.credentials &&
      typeof window.navigator.credentials.create === 'function' &&
      typeof window.navigator.credentials.get === 'function'
    );
  }

  // Generate a random challenge for authentication
  generateChallenge() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array;
  }

  // Convert ArrayBuffer to Base64URL
  bufferToBase64URL(buffer) {
    const bytes = new Uint8Array(buffer);
    let str = '';
    bytes.forEach(byte => str += String.fromCharCode(byte));
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Convert Base64URL to ArrayBuffer
  base64URLToBuffer(base64url) {
    const base64 = base64url
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padding = base64.length % 4;
    const padded = base64 + '='.repeat((4 - padding) % 4);
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  // Register a new passkey for the user
  async register(userInfo = {}) {
    if (!this.isSupported) {
      throw new Error('Passkeys are not supported in this browser');
    }

    const challenge = this.generateChallenge();
    
    const publicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Lunation',
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(userInfo.id || 'lunation-user'),
        name: userInfo.name || 'Lunation User',
        displayName: userInfo.displayName || 'Lunation User',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Prefer platform authenticators
        userVerification: 'required',
        residentKey: 'required'
      },
      timeout: 60000,
      attestation: 'direct'
    };

    try {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Store credential info securely in localStorage
      const credentialData = {
        id: credential.id,
        rawId: this.bufferToBase64URL(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: this.bufferToBase64URL(credential.response.attestationObject),
          clientDataJSON: this.bufferToBase64URL(credential.response.clientDataJSON),
        },
        createdAt: new Date().toISOString(),
        userInfo
      };

      localStorage.setItem('lunation-passkey-credential', JSON.stringify(credentialData));
      localStorage.setItem('lunation-auth-status', 'authenticated');
      
      return {
        success: true,
        credentialId: credential.id,
        userInfo
      };
    } catch (error) {
      console.error('Passkey registration failed:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  // Authenticate using an existing passkey
  async authenticate() {
    if (!this.isSupported) {
      throw new Error('Passkeys are not supported in this browser');
    }

    const savedCredential = localStorage.getItem('lunation-passkey-credential');
    if (!savedCredential) {
      throw new Error('No passkey found. Please register first.');
    }

    const credentialData = JSON.parse(savedCredential);
    const challenge = this.generateChallenge();

    const publicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [{
        id: this.base64URLToBuffer(credentialData.rawId),
        type: 'public-key',
        transports: ['internal', 'hybrid']
      }],
      userVerification: 'required',
      timeout: 60000
    };

    try {
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (!assertion) {
        throw new Error('Authentication failed');
      }

      // Update last authentication time
      credentialData.lastAuth = new Date().toISOString();
      localStorage.setItem('lunation-passkey-credential', JSON.stringify(credentialData));
      localStorage.setItem('lunation-auth-status', 'authenticated');

      return {
        success: true,
        credentialId: assertion.id,
        userInfo: credentialData.userInfo
      };
    } catch (error) {
      console.error('Passkey authentication failed:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Check if user is currently authenticated
  isAuthenticated() {
    const authStatus = localStorage.getItem('lunation-auth-status');
    const credential = localStorage.getItem('lunation-passkey-credential');
    return authStatus === 'authenticated' && credential;
  }

  // Get current user info
  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }

    const credentialData = JSON.parse(localStorage.getItem('lunation-passkey-credential'));
    return credentialData.userInfo || null;
  }

  // Sign out the user
  signOut() {
    localStorage.removeItem('lunation-auth-status');
    // Keep the credential for future logins
    return { success: true };
  }

  // Delete all auth data (complete removal)
  deleteAccount() {
    localStorage.removeItem('lunation-auth-status');
    localStorage.removeItem('lunation-passkey-credential');
    // Optionally clear all Lunation data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('lunation-')) {
        localStorage.removeItem(key);
      }
    });
    return { success: true };
  }

  // Get authentication stats
  getAuthStats() {
    const credential = localStorage.getItem('lunation-passkey-credential');
    if (!credential) {
      return null;
    }

    const data = JSON.parse(credential);
    return {
      credentialId: data.id,
      createdAt: data.createdAt,
      lastAuth: data.lastAuth,
      userInfo: data.userInfo
    };
  }
}

// Export singleton instance
export const passkeyAuth = new PasskeyAuth();