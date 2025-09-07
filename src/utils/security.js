// Security and resilience utilities

// Sanitize a value for safe inclusion in CSV files.
// - Escapes quotes by doubling them
// - Wraps every cell in quotes
// - Prevents CSV formula injection by prefixing a single quote
//   if the value starts with =, +, -, or @ (common spreadsheet triggers)
export function sanitizeCSVCell(value) {
  let str = value == null ? '' : String(value);

  // Trim BOM or control chars that could confuse parsers
  const stripLeading = (s) => {
    let i = 0;
    while (i < s.length) {
      const c = s.charCodeAt(i);
      if ((c >= 0 && c <= 31) || c === 0xFEFF) i++;
      else break;
    }
    return s.slice(i);
  };
  str = stripLeading(str);

  // Prevent formula injection
  if (/^[=+\-@]/.test(str)) {
    str = `'` + str;
  }

  // Escape quotes by doubling
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

// Safely parse JSON, falling back if malformed
export function safeJSONParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (_) {
    return fallback;
  }
}

// Safely stringify and persist to localStorage
export function safeLocalStorageSet(key, data) {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (_) {
    return false;
  }
}

export const STORAGE_KEY = 'lunation-data';
export const SCHEMA_VERSION = 1;

// --- Encryption helpers (PBKDF2 + AES-GCM) ---

const ITERATIONS = 200000;
const IV_LENGTH = 12; // AES-GCM recommended 96-bit IV
const SALT_LENGTH = 16;

function getSubtle() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  throw new Error('Web Crypto API not available');
}

function getRandomBytes(len) {
  const arr = new Uint8Array(len);
  window.crypto.getRandomValues(arr);
  return arr;
}

function strToUint8(str) {
  return new TextEncoder().encode(str);
}

function abToB64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function b64ToAb(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(passphrase, salt) {
  const subtle = getSubtle();
  const keyMaterial = await subtle.importKey(
    'raw',
    strToUint8(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptJSONWithPassphrase(obj, passphrase) {
  const subtle = getSubtle();
  const salt = getRandomBytes(SALT_LENGTH);
  const iv = getRandomBytes(IV_LENGTH);
  const key = await deriveKey(passphrase, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(obj));
  const ciphertext = await subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return {
    _enc: true,
    v: 1,
    algo: 'AES-GCM',
    kdf: 'PBKDF2',
    hash: 'SHA-256',
    iter: ITERATIONS,
    salt: abToB64(salt.buffer),
    iv: abToB64(iv.buffer),
    data: abToB64(ciphertext),
    ts: new Date().toISOString()
  };
}

export async function decryptJSONWithPassphrase(payload, passphrase) {
  const subtle = getSubtle();
  if (!payload || payload._enc !== true) throw new Error('Not an encrypted payload');
  const salt = new Uint8Array(b64ToAb(payload.salt));
  const iv = new Uint8Array(b64ToAb(payload.iv));
  const key = await deriveKey(passphrase, salt);
  const dataBuf = b64ToAb(payload.data);
  const plaintext = await subtle.decrypt({ name: 'AES-GCM', iv }, key, dataBuf);
  const decoded = new TextDecoder().decode(plaintext);
  return JSON.parse(decoded);
}
