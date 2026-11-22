# Bigman AI Workspace — Nền tảng Đội Ngũ Nhân Sự AI Đa Bot (Hybrid)

Dự án web thương mại chuẩn Technical SEO Top Google và Cổng Trải Nghiệm Tương Tác cho nền tảng **Bigman AI Workspace** (sở hữu 100% mã nguồn sạch, mô hình Kép: **Bản Cài Máy Desktop** + **Bản Thuê Web SaaS Cloud 24/7**).

## 1. Cấu trúc mã nguồn gọn nhẹ & dễ mở rộng Đợt 2

- `src/config/brand.ts`: **Tệp cấu hình thương hiệu tập trung duy nhất** — đổi tên dự án, logo, domain, thông tin liên hệ Admin (Zalo `0353205414`, Email `thaytiensy@gmail.com`), SEO metadata tại 1 nơi.
- `src/config/departments.ts`: Dữ liệu 4 Kho mẫu Đội Bot theo ngành (TikTok Shop/TMĐT, Marketing & SEO Đa Kênh, Trợ lý Giáo viên & Nhà trường liên kết `https://lop-nhe.vercel.app`, Văn phòng SME Tự động), kịch bản giao việc chéo & lịch chạy tự động.
- `src/config/plans.ts`: Bảng so sánh Bản Cài Máy vs Bản Thuê Web Cloud & các gói giá mở bán sớm (sẵn sàng cập nhật theo bảng giá chốt từ `Sunny`).
- `src/config/faq.ts`: Bộ 8 câu hỏi thường gặp dùng chung cho giao diện và JSON-LD `FAQPage`.
- `src/app/`: Next.js App Router (SSG chuẩn SEO) gồm `/`, `/so-sanh-cai-may-va-cloud`, `/kho-doi-bot`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`.

## 2. Điểm nối chờ tích hợp Đợt 2

- **Spec kiến trúc (`Ada`) & Backend (`Lin`):** Nối `BRAND_CONFIG.wave2Hooks.apiBaseUrl` và thêm route `/api/*` + `/workspace` xác thực đa khách hàng, bộ đếm quota & webhook VietQR.
- **Giao diện lõi (`Pixel`) & Đóng gói Desktop (`Dev`):** Chia sẻ trực tiếp bộ cấu hình phòng ban/gói cước trong `src/config/`.
- **Nội dung SEO Top Google (`Listing Pro` & `Echo`):** Bổ sung route bài Pillar `/giai-phap/*` hoặc `/blog/*` vào `src/app/sitemap.ts` và cập nhật bộ từ khóa trong `src/config/brand.ts`.

## 3. Chạy cục bộ & kiểm thử

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run start
```

## 4. Kênh liên hệ chính thức

- **Liên hệ Admin · Zalo:** `0353205414` (`https://zalo.me/0353205414`)
- **Email:** `thaytiensy@gmail.com`
