import { BRAND_CONFIG } from "./brand";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Bản Cài Máy và Bản Thuê Cloud 24/7 khác nhau điểm nào quan trọng nhất?",
    answer:
      "Bản Cài Máy (Windows/macOS) giúp bạn trải nghiệm nhanh trên máy cá nhân với chi phí khởi điểm thấp, nhưng có giới hạn tối đa 3 bot, chỉ chạy khi mở máy và dùng API key riêng. Bản Thuê Web Cloud chạy trực tiếp trên máy chủ đám mây 24/7 kể cả khi bạn tắt máy, mở được trên cả điện thoại, hỗ trợ nhiều bot/phòng ban cùng lúc và được cài sẵn đội bot theo ngành.",
  },
  {
    question: "Máy tính cấu hình yếu hoặc chỉ dùng điện thoại có sử dụng được không?",
    answer:
      "Hoàn toàn được. Với Bản Thuê Web Cloud, toàn bộ quá trình xử lý của đội ngũ bot diễn ra trên máy chủ đám mây. Bạn chỉ cần mở trình duyệt trên máy tính văn phòng cấu hình nhẹ hoặc điện thoại di động để giao việc, xem báo cáo và duyệt kết quả.",
  },
  {
    question: "Người không rành lập trình hay công nghệ có cài đặt và sử dụng được không?",
    answer:
      "Nền tảng được thiết kế riêng cho chủ shop, giáo viên, marketer và chủ doanh nghiệp SME không chuyên kỹ thuật. Các đội bot theo ngành đã được cấu hình sẵn vai trò và quy trình phối hợp; bạn chỉ cần chọn ngành nghề, gõ yêu cầu bằng tiếng Việt tự nhiên và nhận kết quả.",
  },
  {
    question: "Tôi có thể bắt đầu từ Bản Cài Máy rồi sau này nâng cấp lên Cloud không?",
    answer:
      "Có. Cả Bản Cài Máy và Bản Thuê Cloud đều dùng chung 1 cấu trúc lõi thống nhất. Khi công việc tăng lên và bạn cần chạy lịch 24/7 hoặc mở thêm phòng ban, toàn bộ cấu hình bot và quy trình làm việc có thể chuyển lên gói Cloud nhanh chóng mà không phải thiết lập lại từ đầu.",
  },
  {
    question: "Chi phí AI hoạt động ra sao? Tôi có bắt buộc phải mua API key riêng không?",
    answer:
      "Ở Bản Cài Máy, bạn tự gắn API key AI cá nhân để kiểm soát chi phí trực tiếp. Ở Bản Thuê Cloud, bạn được chọn linh hoạt giữa việc gắn API key riêng hoặc dùng gói thuê bao đã tích hợp sẵn hạn mức AI tiện lợi, không cần tự đăng ký thẻ quốc tế phức tạp.",
  },
  {
    question: "Dữ liệu cửa hàng, khách hàng và tài liệu nội bộ có được bảo mật không?",
    answer:
      "Mỗi khách hàng được tách biệt không gian dữ liệu riêng, không dùng chung ngữ cảnh giữa các gian hàng hay doanh nghiệp khác nhau. Mọi thao tác nhạy cảm như gửi email, đổi giá khuyến mãi hoặc xuất bản nội dung đều có cơ chế trình duyệt trước để bạn xác nhận.",
  },
  {
    question: "Hệ thống đã có sản phẩm thực tế nào để tôi kiểm chứng chất lượng chưa?",
    answer: `Có. Bạn có thể bấm trực tiếp vào cổng trải nghiệm tương tác ngay trên trang này, hoặc mở ứng dụng thực tế Trợ lý GVCN tại ${BRAND_CONFIG.liveDemos.gvcnApp.url} — sản phẩm cùng hệ sinh thái đang phục vụ giáo viên chủ nhiệm hằng ngày.`,
  },
  {
    question: "Làm thế nào để đăng ký nhận Bản Cài Máy hoặc thuê gói Cloud ngay hôm nay?",
    answer: `Bạn chỉ cần bấm nút đăng ký trên trang hoặc nhắn trực tiếp Admin qua Zalo ${BRAND_CONFIG.contact.zaloPhone} (${BRAND_CONFIG.contact.zaloUrl}) hoặc gửi email về ${BRAND_CONFIG.contact.email}. Admin sẽ hỗ trợ chọn đúng gói, kích hoạt nhanh và cài sẵn đội bot đúng ngành của bạn.`,
  },
];
