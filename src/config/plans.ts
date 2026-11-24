export interface ComparisonRow {
  feature: string;
  desktop: string;
  cloud: string;
  highlightCloud?: boolean;
}

export interface CloudTier {
  id: string;
  name: string;
  botCapacityLabel: string;
  tagline: string;
  /** Giá gói BYOK (tự gắn API key riêng) theo tháng */
  byokMonthlyVnd: number;
  /** Giá gói kèm sẵn AI Credits trọn gói theo tháng */
  creditsMonthlyVnd: number;
  creditsLabel: string;
  popular?: boolean;
  ctaLabel: string;
  limits: string[];
}

export const YEARLY_DISCOUNT_RATE = 0.2;

export function getYearlyMonthlyPrice(monthlyVnd: number): number {
  return Math.round(monthlyVnd * (1 - YEARLY_DISCOUNT_RATE));
}

export const DESKTOP_EDITION = {
  id: "desktop-free",
  badge: "Phễu trải nghiệm · Cài trực tiếp lên máy",
  name: "Bản Cài Máy Miễn Phí (Desktop Free)",
  freePriceVnd: 0,
  freePriceLabel: "0đ (Miễn phí trải nghiệm)",
  proLicenseName: "Desktop Pro License",
  proLicensePriceVnd: 1890000,
  proLicenseLabel: "1.890.000đ / máy (Bản quyền vĩnh viễn theo máy)",
  subtitle:
    "Bắt đầu hoàn toàn miễn phí ngay trên máy Windows/macOS cá nhân, dữ liệu lưu cục bộ ngay trên máy và mở lên dùng ngay không cần thiết lập rườm rà.",
  benefits: [
    "Desktop Free 0đ: cài nhanh trên Windows & macOS, trải nghiệm ngay 1 phòng họp cơ bản",
    "Dữ liệu hội thoại & ghi chú lưu cục bộ ngay trên máy tính cá nhân",
    "Mở lên dùng ngay trên máy cá nhân, không mất phí thuê bao hằng tháng",
    "Có thể nâng cấp lên Desktop Pro License (1.890.000đ/máy) nếu muốn dùng lâu dài trên máy mạnh",
  ],
  intentionalLimits: [
    "Desktop Free giới hạn tối đa 2 Bot hoạt động đồng thời & 1 phòng họp cơ bản",
    "Chỉ chạy khi máy tính đang bật và mở ứng dụng",
    "Phụ thuộc cấu hình RAM/CPU và kết nối mạng của máy cá nhân",
    "Chưa có lịch chạy tự động ngầm 24/7 khi tắt máy & chưa đồng bộ điện thoại",
  ],
  ctaLabel: "Đăng ký nhận Bản Cài Máy (0đ)",
};

export const CLOUD_TIERS: CloudTier[] = [
  {
    id: "starter-cloud",
    name: "Starter Cloud",
    botCapacityLabel: "24/7 · Tối đa 5 Bot",
    tagline:
      "Cho chủ shop nhỏ, giáo viên hoặc freelancer cần đội bot chạy xuyên suốt 24/7 kể cả khi tắt máy.",
    byokMonthlyVnd: 199000,
    creditsMonthlyVnd: 349000,
    creditsLabel: "gồm 3M AI Credits",
    ctaLabel: "Chọn Starter Cloud",
    limits: [
      "Tối đa 5 Bot hoạt động đồng thời, chạy tự động 24/7 trên Cloud",
      "Không cần máy mạnh — mở trình duyệt máy tính hoặc điện thoại là dùng",
      "Chọn linh hoạt: 349.000đ/tháng (Trọn gói 3M AI Credits) hoặc 199.000đ/tháng (Hạ tầng tiết kiệm)",
      "Hỗ trợ cài sẵn 1 Kho Đội Bot theo ngành + kích hoạt nhanh qua VietQR",
    ],
  },
  {
    id: "pro-team-cloud",
    name: "Pro Team Cloud",
    botCapacityLabel: "24/7 · Tối đa 10 Bot",
    tagline:
      "Gói phổ biến nhất cho chủ shop TikTok Shop/TMĐT, team Marketing SEO và văn phòng SME tăng tốc.",
    byokMonthlyVnd: 499000,
    creditsMonthlyVnd: 799000,
    creditsLabel: "gồm 10M AI Credits",
    popular: true,
    ctaLabel: "Nâng cấp Pro Team Cloud",
    limits: [
      "Mở khóa tới 10 Bot & nhiều phòng ban phối hợp giao việc chéo 24/7",
      "Lịch chạy tự động (Cron) 24/7 không giới hạn khung giờ theo giờ Việt Nam",
      "Chọn linh hoạt: 799.000đ/tháng (Trọn gói 10M AI Credits) hoặc 499.000đ/tháng (Hạ tầng tiết kiệm)",
      "Hỗ trợ cài sẵn đủ 4 Kho Đội Bot theo ngành & chuyển dữ liệu từ Bản Cài Máy",
    ],
  },
  {
    id: "business-cloud",
    name: "Business Cloud",
    botCapacityLabel: "24/7 · Không giới hạn Bot · 10 tài khoản",
    tagline:
      "Dành cho doanh nghiệp, agency và chuỗi gian hàng cần vận hành đa phòng ban, phân quyền đội nhóm.",
    byokMonthlyVnd: 1290000,
    creditsMonthlyVnd: 1990000,
    creditsLabel: "gồm 30M AI Credits",
    ctaLabel: "Triển khai Business Cloud",
    limits: [
      "Không giới hạn số lượng Bot & hỗ trợ tới 10 tài khoản nhân sự dùng chung",
      "Không gian dữ liệu tách biệt theo phòng ban, sẵn sàng gắn tên miền riêng",
      "Chọn linh hoạt: 1.990.000đ/tháng (Trọn gói 30M AI Credits) hoặc 1.290.000đ/tháng (Hạ tầng tiết kiệm)",
      "Hỗ trợ thiết kế quy trình riêng & ưu tiên kỹ thuật trực tiếp từ Admin",
    ],
  },
];

export const HYBRID_COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Chi phí khởi điểm",
    desktop: "Desktop Free 0đ (hoặc Desktop Pro License 1.890.000đ/máy)",
    cloud: "Từ 199.000đ/tháng (Hạ tầng) hoặc 349.000đ/tháng (Trọn gói sẵn AI) · Giảm 20% gói năm",
    highlightCloud: true,
  },
  {
    feature: "Số lượng Bot hoạt động đồng thời",
    desktop: "Desktop Free: tối đa 2 Bot & 1 phòng họp cơ bản",
    cloud: "5 Bot (Starter) · 10 Bot (Pro Team) · Không giới hạn Bot (Business)",
    highlightCloud: true,
  },
  {
    feature: "Khả năng chạy tự động 24/7 (Lịch Cron)",
    desktop: "Chỉ chạy khi máy tính đang bật",
    cloud: "Chạy ngầm 24/7 trên máy chủ Cloud kể cả khi tắt máy",
    highlightCloud: true,
  },
  {
    feature: "Yêu cầu cấu hình máy tính",
    desktop: "Phụ thuộc CPU / RAM máy cá nhân",
    cloud: "Không cần máy mạnh — mở trình duyệt PC hoặc điện thoại là chạy",
    highlightCloud: true,
  },
  {
    feature: "Đồng bộ đa thiết bị & tài khoản nhóm",
    desktop: "Chỉ sử dụng cục bộ trên 1 máy đã cài",
    cloud: "Đồng bộ tức thì mọi thiết bị · Business hỗ trợ tới 10 tài khoản",
    highlightCloud: true,
  },
  {
    feature: "Gói vận hành & Hạn mức AI",
    desktop: "Xử lý trực tiếp trên máy cá nhân, mở lên dùng ngay",
    cloud: "Trọn gói sẵn 3M / 10M / 30M AI Credits (Không cần thiết lập) hoặc Hạ tầng tiết kiệm",
    highlightCloud: true,
  },
  {
    feature: "Nâng cấp & chuyển đổi dữ liệu",
    desktop: "Chuyển nguyên cấu hình bot lên Cloud bất cứ lúc nào",
    cloud: "Kích hoạt nhanh qua VietQR / hỗ trợ cài sẵn 1-1 qua Zalo Admin",
  },
];

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}
