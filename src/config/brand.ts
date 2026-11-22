/**
 * CẤU HÌNH THƯƠNG HIỆU & LIÊN HỆ TẬP TRUNG (SINGLE SOURCE OF TRUTH)
 * Đổi tên thương hiệu, logo, domain, thông tin liên hệ tại đúng 1 file này
 * để tự động đồng bộ trên toàn bộ giao diện, Meta SEO và JSON-LD.
 */

export const BRAND_CONFIG = {
  /** Tên thương hiệu chính thức */
  name: "Tổ Chức Nhân Viên AI",
  shortName: "Tổ Chức Nhân Viên AI",
  logoMark: "AI",
  badge: "Nền tảng AI Đa Bot Hybrid · Bản Cài Máy + Cloud 24/7",

  /** Định vị thương mại cốt lõi */
  headline: "Tổ Chức Nhân Viên AI — Nền tảng Đội Ngũ Nhân Sự AI Đa Bot cho Cá nhân, Chủ shop & Doanh nghiệp Việt",
  subheadline:
    "Bắt đầu miễn phí 0đ với Bản Cài Máy (tối đa 2 Bot, dùng API key riêng) hoặc nâng cấp Thuê Web Cloud chạy tự động 24/7 không phụ thuộc cấu hình máy. Tích hợp sẵn 4 Phòng ban AI theo ngành — bấm 1 chạm là làm việc.",

  /** Tên miền chính thức (tự cập nhật khi gắn tên miền riêng qua biến môi trường) */
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://bigman-ai-workspace.vercel.app",

  /** Thông tin liên hệ chính thức duy nhất toàn hệ thống */
  contact: {
    adminLabel: "Liên hệ Admin",
    zaloPhone: "0353205414",
    zaloDisplay: "0353 205 414",
    zaloUrl: "https://zalo.me/0353205414",
    email: "thaytiensy@gmail.com",
    emailHref: "mailto:thaytiensy@gmail.com",
    workingHours: "08:00 – 22:00 hằng ngày (GMT+7)",
    location: "Việt Nam",
  },

  /** Liên kết sản phẩm thực tế đang vận hành trong hệ sinh thái */
  liveDemos: {
    gvcnApp: {
      name: "Trợ lý GVCN",
      url: "https://lop-nhe.vercel.app",
      description:
        "Ứng dụng Trợ lý Giáo viên Chủ nhiệm đang chạy live thực tế: điểm danh, quản lý chuyên cần, kế hoạch bài dạy và liên lạc phụ huynh.",
    },
  },

  /** Cấu hình SEO mặc định chuẩn Top Google */
  seo: {
    defaultTitle:
      "Tổ Chức Nhân Viên AI — Nền tảng Đội Ngũ Nhân Sự AI Đa Bot (Bản Cài Máy & Thuê Cloud 24/7)",
    titleTemplate: "%s | Tổ Chức Nhân Viên AI",
    description:
      "Tổ Chức Nhân Viên AI — Nền tảng đội ngũ nhân sự AI đa bot giao việc chéo & chạy lịch tự động 24/7 tại Việt Nam. Dùng Bản Cài Máy miễn phí 0đ (2 Bot) hoặc nâng cấp Thuê Cloud 24/7 từ 199.000đ/tháng cho TikTok Shop, Marketing SEO, Giáo viên & SME.",
    keywords: [
      "Tổ Chức Nhân Viên AI",
      "nền tảng AI đa bot",
      "đội ngũ nhân sự AI",
      "phần mềm AI cài máy",
      "thuê bot AI cloud 24/7",
      "tự động hóa TikTok Shop bằng AI",
      "AI marketing SEO đa kênh",
      "trợ lý AI giáo viên chủ nhiệm",
      "tự động hóa văn phòng SME",
      "multi-agent workspace Việt Nam",
    ],
    locale: "vi_VN",
  },

  /** Điểm nối sẵn cho Đợt 2 (Ada / Lin / Pixel / Dev / Listing Pro) */
  wave2Hooks: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
    desktopDownloadStatus: "early-access" as const,
    cloudProvisioningMode: "assisted-zalo" as const,
  },
} as const;

export function buildMailtoLink(subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body });
  return `${BRAND_CONFIG.contact.emailHref}?${params.toString()}`;
}
