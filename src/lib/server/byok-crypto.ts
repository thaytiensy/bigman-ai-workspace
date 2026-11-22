/**
 * ==============================================================================
 * BẢO MẬT MÃ HÓA KHÓA API BYOK (AES-256-GCM)
 * DỰ ÁN: TỔ CHỨC NHÂN VIÊN AI
 * LIÊN HỆ: Zalo 0353205414 | Email: thaytiensy@gmail.com
 * ==============================================================================
 * Cơ chế mã hóa khóa đối xứng chuẩn quân đội AES-256-GCM:
 * - Bảo đảm tính bảo mật (Confidentiality)
 * - Bảo đảm tính toàn vẹn (Integrity) thông qua Authentication Tag (128-bit)
 * - Tuyệt đối không bao giờ trả raw key về client hoặc ghi ra file log.
 */

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV tiêu chuẩn cho GCM
const AUTH_TAG_LENGTH = 16; // 128-bit Authentication Tag

export interface EncryptedPayload {
  ciphertext: string; // Hex encoded
  iv: string;         // Hex encoded
  authTag: string;    // Hex encoded
}

/**
 * Trích xuất khóa mã hóa 256-bit (32 bytes) từ biến môi trường
 */
function getMasterKey(): Buffer {
  const envKey = process.env.BYOK_ENCRYPTION_KEY;
  if (!envKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'CRITICAL: BYOK_ENCRYPTION_KEY chưa được cấu hình trên môi trường Production! Vui lòng kiểm tra Vercel Environment Variables.'
      );
    }
    // Khóa phát triển cục bộ (chỉ dùng cho local dev/test)
    return crypto.createHash('sha256').update('to-chuc-nhan-vien-ai-dev-master-key-32b').digest();
  }

  // Nếu là chuỗi Hex 64 ký tự (32 bytes)
  if (envKey.length === 64) {
    return Buffer.from(envKey, 'hex');
  }

  // Hash SHA-256 để chuẩn hóa về đúng 32 bytes
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Mã hóa API Key của người dùng trước khi lưu xuống PostgreSQL
 */
export function encryptApiKey(plainKey: string): EncryptedPayload {
  if (!plainKey || typeof plainKey !== 'string') {
    throw new Error('API Key không hợp lệ để mã hóa.');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plainKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

/**
 * Giải mã API Key phía Server để thực thi lệnh gọi LLM (OpenAI, Gemini, DeepSeek...)
 */
export function decryptApiKey(payload: EncryptedPayload): string {
  if (!payload || !payload.ciphertext || !payload.iv || !payload.authTag) {
    throw new Error('Gói dữ liệu mã hóa BYOK bị thiếu hoặc sai định dạng.');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getMasterKey(),
    Buffer.from(payload.iv, 'hex'),
    { authTagLength: AUTH_TAG_LENGTH }
  );

  decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

  let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Rút gọn hiển thị an toàn trên giao diện (Masking)
 * Ví dụ: 'sk-proj-1234567890abcdef' -> 'sk-proj-...cdef'
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '********';
  const prefix = key.slice(0, 7);
  const suffix = key.slice(-4);
  return `${prefix}...${suffix}`;
}
