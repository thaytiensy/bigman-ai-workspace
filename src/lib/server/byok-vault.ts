/**
 * byok-vault.ts
 * Bring-Your-Own-Key (BYOK) Security Vault & Zero-Leak Redactor
 * Implements AES-256-GCM encryption for stored keys, prevents key exposure in logs, errors, and SSE chunks.
 */

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export class BYOKVault {
  private masterKey: Buffer;

  constructor(masterKeyHex?: string) {
    if (masterKeyHex) {
      this.masterKey = Buffer.from(masterKeyHex, 'hex');
    } else {
      // 32-byte deterministic key for testing/default
      this.masterKey = crypto.scryptSync('bigman-ai-workspace-salt', 'workspace-byok-salt', 32);
    }
  }

  /**
   * Encrypts a plaintext API key.
   */
  public encryptKey(plainKey: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv);
    let encrypted = cipher.update(plainKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts an encrypted key payload.
   */
  public decryptKey(payload: string): string {
    const parts = payload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted key payload structure');
    }
    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Redacts any API key patterns from log strings or debug output.
   * Matches OpenAI (sk-...), Anthropic (sk-ant-...), Google (AIza...), DeepSeek (sk-...), etc.
   */
  public static sanitizeString(text: string): string {
    if (!text) return text;
    return text
      // OpenAI / DeepSeek / General sk- keys
      .replace(/(sk-[a-zA-Z0-9_-]{8})[a-zA-Z0-9_-]{12,}/g, '$1...[REDACTED]')
      // Anthropic sk-ant- keys
      .replace(/(sk-ant-[a-zA-Z0-9_-]{8})[a-zA-Z0-9_-]{12,}/g, '$1...[REDACTED]')
      // Google AI Studio AIzaSy keys
      .replace(/(AIzaSy[a-zA-Z0-9_-]{6})[a-zA-Z0-9_-]{20,}/g, '$1...[REDACTED]')
      // Bearer tokens in headers or strings
      .replace(/(Bearer\s+)[a-zA-Z0-9._-]{16,}/gi, '$1[TOKEN_REDACTED]');
  }

  /**
   * Cleans sensitive fields from an object (e.g. request body, metadata, error details).
   */
  public static sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const cloned = JSON.parse(JSON.stringify(obj));
    for (const key of Object.keys(cloned)) {
      if (/api_?key|secret|password|auth_?token|credential/i.test(key)) {
        if (typeof cloned[key] === 'string' && cloned[key].length > 6) {
          cloned[key] = cloned[key].slice(0, 4) + '...[REDACTED]';
        } else {
          cloned[key] = '[REDACTED]';
        }
      } else if (typeof cloned[key] === 'object' && cloned[key] !== null) {
        cloned[key] = this.sanitizeObject(cloned[key]);
      } else if (typeof cloned[key] === 'string') {
        cloned[key] = this.sanitizeString(cloned[key]);
      }
    }
    return cloned;
  }

  /**
   * Sanitizes an Error object to ensure no keys leak through error messages or stack traces.
   */
  public static sanitizeError(err: Error): Error {
    const safeError = new Error(this.sanitizeString(err.message));
    safeError.name = err.name;
    if (err.stack) {
      safeError.stack = this.sanitizeString(err.stack);
    }
    return safeError;
  }
}
