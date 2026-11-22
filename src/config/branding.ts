/**
 * CẤU HÌNH THƯƠNG HIỆU TẬP TRUNG (UNIFIED BRANDING ABSTRACTION)
 * Đồng bộ trực tiếp từ BRAND_CONFIG cho cả Frontend (/workspace) và Backend (/api/v1/*).
 * KHÔNG hardcode thông tin tài khoản ngân hàng cá nhân — đọc 100% từ biến môi trường.
 */

import { BRAND_CONFIG } from "@/config/brand";

export const BRANDING = {
  /** Tương thích cả Frontend (name) và Backend (appName) */
  name: BRAND_CONFIG.name,
  appName: BRAND_CONFIG.name,
  shortName: "Nhân Viên AI",
  tagline: "Hệ Điều Hành Nhân Viên AI Đa Nhiệm & Tự Động Hóa 24/7",
  slogan:
    "Đội ngũ nhân viên AI đa nhiệm vận hành 24/7 cho cá nhân, chủ shop & doanh nghiệp Việt",
  description: BRAND_CONFIG.seo.description,
  domain: BRAND_CONFIG.siteUrl,
  companyName: `${BRAND_CONFIG.name} Việt Nam`,

  /** Kênh liên hệ & hỗ trợ thương mại chính thức duy nhất */
  contact: {
    email: BRAND_CONFIG.contact.email,
    zalo: BRAND_CONFIG.contact.zaloPhone,
    zaloUrl: BRAND_CONFIG.contact.zaloUrl,
    zaloLink: BRAND_CONFIG.contact.zaloUrl,
    hotline: BRAND_CONFIG.contact.zaloDisplay,
    website: BRAND_CONFIG.siteUrl,
    address: BRAND_CONFIG.contact.location,
  },

  /** Tiền tố mã đơn thanh toán (không lưu STK/tên chủ TK cố định trong mã nguồn) */
  payment: {
    prefixOrderCode: "NVAI",
    qrTemplate: "compact",
  },

  /** Tham số hệ thống & hạn mức gói */
  system: {
    version: "v2.5.0-hybrid",
    releaseDate: "2026-11-22",
    desktopMaxFreeBots: 2,
    cloudStarterBots: 5,
    cloudProBots: 10,
    cloudBusinessBots: 16,
  },

  /** Hạn mức an toàn tác vụ AI */
  safety: {
    maxLoopIterations: 15,
    maxTokensPerRequest: 8192,
    requestTimeoutMs: 60000,
  },
} as const;
