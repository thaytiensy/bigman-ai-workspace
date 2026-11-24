/**
 * Owner / Creator Unlimited Access helper.
 *
 * Allows the application creator to use Tổ Chức Nhân Viên AI on any browser or
 * desktop device with zero tier/bot/routine/upgrade limits while keeping the
 * standard freemium experience intact for regular visitors.
 *
 * Plaintext passkeys are never stored in client code — only a salted SHA-256
 * digest is verified synchronously.
 */

export const OWNER_ACCESS_STORAGE_KEY = 'tochuc_nvai_owner_unlimited_v1';
export const OWNER_URL_PARAMS = ['owner', 'founder', 'key'] as const;

const OWNER_SALT = 'tochuc-nvai-owner-v1:';
const OWNER_KEY_DIGEST_HEX =
  '9159d424c3bb4a51899f7abff013d76585fd155f03860a987d7f394ba510f362';

export interface StoredOwnerAccess {
  unlocked: boolean;
  unlockedAt: string;
  digest: string;
}

/**
 * Pure synchronous SHA-256 (FIPS 180-4) returning lowercase hex.
 * Works identically in browser (HTTP/HTTPS), Tauri WebView, Node.js, and Edge.
 */
export function sha256Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, '0'))
    .join('');
}

export function normalizeOwnerPasskey(raw: string): string {
  return raw.trim().toUpperCase();
}

export function hashOwnerPasskey(raw: string): string {
  return sha256Hex(`${OWNER_SALT}${normalizeOwnerPasskey(raw)}`);
}

/**
 * Verifies a creator/owner passkey against the salted SHA-256 digest
 * (or optional server-side OWNER_ACCESS_CODE env override).
 */
export function verifyOwnerPasskey(raw: string | null | undefined): boolean {
  if (!raw || typeof raw !== 'string') return false;
  const normalized = normalizeOwnerPasskey(raw);
  if (normalized.length < 6) return false;

  if (hashOwnerPasskey(normalized) === OWNER_KEY_DIGEST_HEX) {
    return true;
  }

  // Optional server-side environment override (never exposed to browser bundle)
  if (typeof process !== 'undefined' && process.env?.OWNER_ACCESS_CODE) {
    const envCode = normalizeOwnerPasskey(process.env.OWNER_ACCESS_CODE);
    if (envCode.length >= 6 && normalized === envCode) {
      return true;
    }
  }

  return false;
}

export function loadOwnerAccess(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(OWNER_ACCESS_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<StoredOwnerAccess>;
    return Boolean(parsed.unlocked && parsed.digest === OWNER_KEY_DIGEST_HEX);
  } catch {
    return false;
  }
}

export function saveOwnerAccess(passkey: string): boolean {
  if (!verifyOwnerPasskey(passkey)) return false;
  if (typeof window !== 'undefined') {
    try {
      const payload: StoredOwnerAccess = {
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        digest: OWNER_KEY_DIGEST_HEX,
      };
      window.localStorage.setItem(OWNER_ACCESS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }
  return true;
}

export function clearOwnerAccess(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(OWNER_ACCESS_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Checks URL query params (?owner=... / ?founder=... / ?key=...), activates
 * persistent owner access when valid, and strips the sensitive query param from
 * the browser address bar so it never leaks in screenshots or shared links.
 */
export function resolveOwnerAccessFromUrl(): {
  isOwner: boolean;
  justActivated: boolean;
} {
  if (typeof window === 'undefined') {
    return { isOwner: false, justActivated: false };
  }

  try {
    const url = new URL(window.location.href);
    let candidate: string | null = null;
    let foundParam = false;

    for (const key of OWNER_URL_PARAMS) {
      const val = url.searchParams.get(key);
      if (val !== null) {
        foundParam = true;
        if (!candidate && val.trim()) {
          candidate = val;
        }
        url.searchParams.delete(key);
      }
    }

    if (foundParam) {
      const cleanPath =
        url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') + url.hash;
      window.history.replaceState({}, '', cleanPath);
    }

    if (candidate && saveOwnerAccess(candidate)) {
      return { isOwner: true, justActivated: true };
    }
  } catch {
    // Ignore malformed URLs
  }

  return { isOwner: loadOwnerAccess(), justActivated: false };
}
