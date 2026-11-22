# Tổ Chức Nhân Viên AI — Nền tảng Đội Ngũ Nhân Sự AI Đa Bot (Hybrid)

Dự án web thương mại chuẩn Technical SEO Top Google và Cổng Trải Nghiệm Tương Tác cho thương hiệu chính thức **Tổ Chức Nhân Viên AI** (sở hữu 100% mã nguồn sạch, mô hình Kép: **Bản Cài Máy Desktop** + **Bản Thuê Web SaaS Cloud 24/7**).

## 1. Cấu trúc mã nguồn gọn nhẹ & dễ mở rộng Đợt 2

- `src/config/brand.ts`: **Tệp cấu hình thương hiệu tập trung duy nhất** — quản lý tên thương hiệu **Tổ Chức Nhân Viên AI**, logo, domain, thông tin liên hệ Admin (Zalo `0353205414`, Email `thaytiensy@gmail.com`) và SEO metadata tại 1 nơi.
- `src/config/departments.ts`: Dữ liệu 4 Kho mẫu Đội Bot theo ngành (TikTok Shop/TMĐT, Marketing & SEO Đa Kênh, Trợ lý Giáo viên & Nhà trường liên kết `https://lop-nhe.vercel.app`, Văn phòng SME Tự động), kịch bản giao việc chéo & lịch chạy tự động.
- `src/config/plans.ts`: Bảng giá chính thức Đợt 1 (Desktop Free `0đ` tối đa 2 Bot / Desktop Pro License `1.890.000đ/máy` · Starter Cloud `199k/349k` · Pro Team Cloud `499k/799k` · Business Cloud `1.290k/1.990k`, giảm 20% theo năm).
- `src/config/faq.ts`: Bộ 8 câu hỏi thường gặp dùng chung cho giao diện và JSON-LD `FAQPage`.
- `src/app/`: Next.js App Router (SSG chuẩn SEO) gồm `/`, `/so-sanh-cai-may-va-cloud`, `/kho-doi-bot`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`.

## 2. Chạy cục bộ & kiểm thử

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run start
```

## 3. Kênh liên hệ chính thức

- **Liên hệ Admin · Zalo:** `0353205414` (`https://zalo.me/0353205414`)
- **Email:** `thaytiensy@gmail.com`
