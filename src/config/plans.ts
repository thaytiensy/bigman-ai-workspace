export interface ComparisonRow {
  feature: string;
  desktop: string;
  cloud: string;
  highlightCloud?: boolean;
}

export interface CloudTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPriceVnd: number;
  yearlyMonthlyPriceVnd: number;
  popular?: boolean;
  ctaLabel: string;
  limits: string[];
}

export const DESKTOP_EDITION = {
  id: "desktop-local",
  badge: "Phễu trải nghiệm · Cài trực tiếp lên máy",
  name: "Bản Cài Máy (Windows / macOS)",
  priceLabel: "Miễn phí trải nghiệm / Bản quyền cơ bản",
  subtitle:
    "Phù hợp cá nhân muốn dùng thử ngay quy trình đa bot, lưu dữ liệu ngay trên máy tính cá nhân và dùng API key AI riêng.",
  benefits: [
    "Cài đặt gọn nhẹ trên Windows & macOS, làm quen giao diện nhanh",
    "Dữ liệu hội thoại & ghi chú lưu cục bộ trên máy tính cá nhân",
    "Tự do gắn API key AI riêng (BYOK) kiểm soát chi phí trực tiếp",
    "Trải nghiệm sẵn 1 phòng ban mẫu theo ngành",
  ],
  intentionalLimits: [
    "Giới hạn tối đa 3 bot hoạt động đồng thời",
    "Chỉ chạy khi máy tính đang bật và mở ứng dụng",
    "Phụ thuộc cấu hình RAM/CPU và kết nối mạng của máy cá nhân",
    "Chưa có lịch chạy tự động 24/7 khi tắt máy & chưa đồng bộ điện thoại",
  ],
  ctaLabel: "Đăng ký nhận Bản Cài Máy",
};

export const CLOUD_TIERS: CloudTier[] = [
  {
    id: "cloud-starter",
    name: "Cloud Cá Nhân 24/7",
    tagline: "Cho chủ shop nhỏ, giáo viên hoặc freelancer cần bot chạy xuyên suốt kể cả khi tắt máy.",
    monthlyPriceVnd: 299000,
    yearlyMonthlyPriceVnd: 239000,
    ctaLabel: "Tư vấn gói Cloud Cá Nhân",
    limits: [
      "Tối đa 6 bot hoạt động đồng thời (2 phòng ban)",
      "Chạy tự động 24/7 trên máy chủ Cloud, không cần máy mạnh",
      "Đồng bộ mượt trên máy tính, máy tính bảng và điện thoại",
      "Hỗ trợ cài sẵn 1 Kho Đội Bot theo ngành + thanh toán VietQR",
    ],
  },
  {
    id: "cloud-pro",
    name: "Cloud Đội Nhóm Pro",
    tagline: "Lựa chọn tối ưu cho chủ shop đa kênh, team Marketing SEO và văn phòng SME.",
    monthlyPriceVnd: 690000,
    yearlyMonthlyPriceVnd: 550000,
    popular: true,
    ctaLabel: "Nâng cấp Cloud Pro qua Zalo",
    limits: [
      "Mở khóa tới 16 bot & đủ 4 Phòng ban AI dựng sẵn",
      "Lịch chạy tự động 24/7 không giới hạn khung giờ (Cron chuẩn)",
      "Hỗ trợ gắn API key riêng hoặc mua kèm hạn mức AI trọn gói",
      "Hỗ trợ cấu hình 1-1 qua Zalo & chuyển dữ liệu từ Bản Cài Máy trong 1 chạm",
    ],
  },
  {
    id: "cloud-business",
    name: "Cloud Doanh Nghiệp Riêng",
    tagline: "Triển khai không gian làm việc riêng biệt, tùy biến phòng ban & tích hợp quy trình nội bộ.",
    monthlyPriceVnd: 1990000,
    yearlyMonthlyPriceVnd: 1590000,
    ctaLabel: "Đặt lịch thiết kế riêng",
    limits: [
      "Không giới hạn số bot, phòng ban & phân quyền nhiều thành viên",
      "Hạ tầng tách biệt, gắn tên miền thương hiệu riêng (White-label)",
      "Thiết kế kịch bản tự động hóa riêng cho TikTok Shop / CRM / Nội bộ",
      "Hỗ trợ kỹ thuật ưu tiên trực tiếp từ Admin & đội kỹ sư",
    ],
  },
];

export const HYBRID_COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Số lượng bot hoạt động đồng thời",
    desktop: "Tối đa 3 bot (giới hạn có chủ đích)",
    cloud: "6 – 16+ bot / Đa phòng ban không giới hạn",
    highlightCloud: true,
  },
  {
    feature: "Khả năng chạy tự động 24/7 (Lịch Cron)",
    desktop: "Chỉ chạy khi máy tính đang bật",
    cloud: "Chạy ngầm 24/7 trên Cloud kể cả khi tắt máy",
    highlightCloud: true,
  },
  {
    feature: "Yêu cầu cấu hình máy tính",
    desktop: "Phụ thuộc CPU / RAM máy cá nhân",
    cloud: "Không cần máy mạnh — mở trình duyệt là chạy",
    highlightCloud: true,
  },
  {
    feature: "Đồng bộ đa thiết bị (PC, Laptop, Điện thoại)",
    desktop: "Chỉ dùng trên 1 máy đã cài",
    cloud: "Đồng bộ tức thì mọi thiết bị mọi lúc mọi nơi",
    highlightCloud: true,
  },
  {
    feature: "Nguồn AI (API Key / Hạn mức AI)",
    desktop: "Tự cấu hình API key riêng (BYOK)",
    cloud: "Linh hoạt: chọn gói kèm sẵn AI hoặc gắn API key riêng",
  },
  {
    feature: "Kho 4 Đội Bot dựng sẵn theo ngành",
    desktop: "Trải nghiệm 1 phòng ban mẫu cơ bản",
    cloud: "Mở khóa đủ 4 ngành + cài sẵn theo yêu cầu",
    highlightCloud: true,
  },
  {
    feature: "Nâng cấp & chuyển đổi dữ liệu",
    desktop: "Chuyển nguyên cấu hình bot lên Cloud bất cứ lúc nào",
    cloud: "Kích hoạt nhanh qua VietQR / hỗ trợ trực tiếp từ Admin",
  },
];

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}
