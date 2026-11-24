import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import {
  hashOwnerPasskey,
  normalizeOwnerPasskey,
  sha256Hex,
  verifyOwnerPasskey,
} from '@/lib/ownerAccess';

describe('Owner / Creator Unlimited Access', () => {
  const originalEnv = process.env.OWNER_ACCESS_CODE;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.OWNER_ACCESS_CODE;
    } else {
      process.env.OWNER_ACCESS_CODE = originalEnv;
    }
  });

  it('computes FIPS 180-4 SHA-256 identically to Node crypto', () => {
    const samples = [
      '',
      'abc',
      'hello world',
      'Tổ Chức Nhân Viên AI — Văn phòng 3D không giới hạn',
      'a'.repeat(128),
    ];

    for (const s of samples) {
      const expected = createHash('sha256').update(s, 'utf8').digest('hex');
      expect(sha256Hex(s)).toBe(expected);
    }
  });

  it('normalizes and hashes passkeys deterministically and case-insensitively', () => {
    expect(normalizeOwnerPasskey('  sample-owner-key  ')).toBe('SAMPLE-OWNER-KEY');
    expect(hashOwnerPasskey('sample-owner-key')).toBe(hashOwnerPasskey('  SAMPLE-OWNER-KEY '));
    expect(hashOwnerPasskey('sample-owner-key')).toHaveLength(64);
  });

  it('verifies env-configured owner passkey case-insensitively and rejects invalid inputs', () => {
    process.env.OWNER_ACCESS_CODE = 'TEST-FOUNDER-CODE-99';

    expect(verifyOwnerPasskey('TEST-FOUNDER-CODE-99')).toBe(true);
    expect(verifyOwnerPasskey('  test-founder-code-99 ')).toBe(true);
    expect(verifyOwnerPasskey('')).toBe(false);
    expect(verifyOwnerPasskey(null)).toBe(false);
    expect(verifyOwnerPasskey(undefined)).toBe(false);
    expect(verifyOwnerPasskey('12345')).toBe(false);
    expect(verifyOwnerPasskey('WRONG-PASSKEY-9999')).toBe(false);
  });
});
