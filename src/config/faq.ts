import { BRAND_CONFIG } from "./brand";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Bản Cài Máy và Bản Thuê Cloud 24/7 khác nhau điểm nào quan trọng nhất?",
    answer:
      "Bản Cài Máy Miễn Phí (Desktop Free — 0đ) giúp bạn trải nghiệm ngay trên máy tính Windows/macOS cá nhân, nhưng giới hạn tối đa 2 Bot, 1 phòng họp cơ bản, chỉ chạy khi bật máy và tự gắn API key riêng (hoặc mua Desktop Pro License 1.890.000đ/máy). Bản Thuê Web Cloud (từ 199.000đ/tháng) chạy trực tiếp trên máy chủ đám mây 24/7 kể cả khi tắt máy, mở được trên điện thoại, mở khóa 5–10 đến không giới hạn Bot và có tùy chọn kèm sẵn AI Credits.",
  },
  {
    question: "Máy tính cấu hình yếu hoặc chỉ dùng điện thoại có sử dụng được Tổ Chức Nhân Viên AI không?",
    answer:
      "Hoàn toàn được. Với Bản Thuê Web Cloud (Starter, Pro Team hoặc Business Cloud), toàn bộ quá trình xử lý của đội ngũ nhân viên AI diễn ra trên máy chủ đám mây. Bạn chỉ cần mở trình duyệt trên máy tính văn phòng cấu hình nhẹ hoặc điện thoại di động để giao việc, xem báo cáo và duyệt kết quả.",
  },
  {
    question: "Người không rành lập trình hay công nghệ có cài đặt và sử dụng được không?",
    answer:
      "Tổ Chức Nhân Viên AI được thiết kế riêng cho chủ shop, giáo viên, marketer và chủ doanh nghiệp SME không chuyên kỹ thuật. Các đội bot theo ngành đã được cấu hình sẵn vai trò và quy trình phối hợp; bạn chỉ cần chọn ngành nghề, gõ yêu cầu bằng tiếng Việt tự nhiên và nhận kết quả.",
  },
  {
    question: "Tôi có thể bắt đầu từ Bản Cài Máy Miễn Phí (0đ) rồi sau này nâng cấp lên Cloud không?",
    answer:
      "Có. Cả Bản Cài Máy và Bản Thuê Cloud đều dùng chung 1 cấu trúc lõi thống nhất. Khi công việc tăng lên và bạn cần hơn 2 Bot, chạy lịch ngầm 24/7 hoặc đồng bộ điện thoại, toàn bộ cấu hình bot và quy trình làm việc có thể chuyển lên gói Cloud nhanh chóng mà không phải thiết lập lại từ đầu.",
  },
  {
    question: "Chi phí AI hoạt động ra sao? Gói BYOK và gói kèm AI Credits khác nhau thế nào?",
    answer:
      "Với BYOK (tự gắn API key riêng), bạn chỉ trả phí hạ tầng từ 199.000đ/tháng trên Cloud (hoặc 0đ trên Desktop Free) và chủ động thanh toán trực tiếp cho nhà cung cấp AI theo mức dùng. Nếu muốn trọn gói tiện lợi không cần thẻ quốc tế, bạn chọn gói kèm sẵn AI Credits: Starter 349.000đ/tháng (3M Credits), Pro Team 799.000đ/tháng (10M Credits) hoặc Business 1.990.000đ/tháng (30M Credits) — giảm thêm 20% khi đóng theo năm.",
  },
  {
    question: "Dữ liệu cửa hàng, khách hàng và tài liệu nội bộ có được bảo mật không?",
    answer:
      "Mỗi khách hàng được tách biệt không gian dữ liệu riêng, không dùng chung ngữ cảnh giữa các gian hàng hay doanh nghiệp khác nhau. Mọi thao tác nhạy cảm như gửi email, đổi giá khuyến mãi hoặc xuất bản nội dung đều có cơ chế trình duyệt trước để bạn xác nhận.",
  },
  {
    question: "Hệ sinh thái Tổ Chức Nhân Viên AI đã có sản phẩm thực tế nào để kiểm chứng chưa?",
    answer: `Có. Bạn có thể bấm trực tiếp vào cổng trải nghiệm tương tác ngay trên trang này, hoặc mở ứng dụng thực tế Trợ lý GVCN tại ${BRAND_CONFIG.liveDemos.gvcnApp.url} — sản phẩm cùng hệ sinh thái đang phục vụ giáo viên chủ nhiệm hằng ngày.`,
  },
  {
    question: "Làm thế nào để đăng ký nhận Bản Cài Máy 0đ hoặc thuê gói Cloud 24/7 ngay hôm nay?",
    answer: `Bạn chỉ cần chọn gói ở mục đăng ký trên trang hoặc nhắn trực tiếp Admin qua Zalo ${BRAND_CONFIG.contact.zaloPhone} (${BRAND_CONFIG.contact.zaloUrl}) hoặc gửi email về ${BRAND_CONFIG.contact.email}. Admin sẽ hỗ trợ chọn đúng gói, kích hoạt nhanh qua VietQR và cài sẵn đội bot đúng ngành của bạn.`,
  },
];
