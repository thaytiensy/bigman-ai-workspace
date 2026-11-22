import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Cloud, Laptop, MessageCircle } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { HybridComparison } from "@/components/HybridComparison";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "So sánh Bản Cài Máy (0đ) vs Bản Thuê Web Cloud 24/7",
  description:
    "So sánh chi tiết Bản Cài Máy Miễn Phí (0đ, tối đa 2 Bot) / Desktop Pro License (1.890.000đ) và Bản Thuê Web Cloud 24/7 từ 199.000đ/tháng của Tổ Chức Nhân Viên AI.",
  alternates: {
    canonical: "/so-sanh-cai-may-va-cloud",
  },
  openGraph: {
    title: `So sánh Bản Cài Máy vs Bản Thuê Cloud 24/7 | ${BRAND_CONFIG.name}`,
    description:
      "Nên dùng Bản Cài Máy Miễn Phí 0đ (2 Bot) hay nâng cấp Starter / Pro Team / Business Cloud chạy tự động 24/7? Xem bảng đối chiếu đầy đủ và đăng ký ngay.",
    url: `${BRAND_CONFIG.siteUrl}/so-sanh-cai-may-va-cloud`,
  },
};

export default function CompareHybridPage() {
  return (
    <>
      <JsonLd includeFaq />

      <section className="bg-grid-subtle border-b border-slate-200 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Trang chủ {BRAND_CONFIG.name}
          </Link>

          <div className="mt-5 max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              So sánh chi tiết Bản Cài Máy vs Bản Thuê Web Cloud 24/7
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              <strong>{BRAND_CONFIG.name}</strong> xây dựng trên mô hình Kép (Hybrid) để ai cũng có
              thể bắt đầu miễn phí 0đ từ máy tính cá nhân, và nâng cấp mượt lên Cloud 24/7 ngay khi
              cần tự động hóa liên tục mà không phụ thuộc cấu hình máy.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Laptop className="h-5 w-5 text-slate-700" />
                Khi nào nên bắt đầu bằng Bản Cài Máy (0đ / Pro License)?
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Bạn là cá nhân muốn trải nghiệm quy trình đa bot miễn phí 0đ với tối đa 2 Bot và 1
                phòng họp cơ bản, đã có sẵn API key AI riêng (BYOK) và chỉ cần chạy khi đang mở máy
                tính — hoặc mua bản quyền Desktop Pro License 1.890.000đ/máy.
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-950">
                <Cloud className="h-5 w-5 text-indigo-600" />
                Khi nào nên nâng cấp Thuê Web Cloud 24/7 (từ 199k/tháng)?
              </div>
              <p className="mt-2 text-sm leading-relaxed text-indigo-900">
                Bạn cần đội ngũ 5–10+ nhân viên AI tự quét đơn hàng, chạy báo cáo sáng, trực SEO và
                CSKH 24/7 kể cả khi tắt máy, máy tính cá nhân cấu hình yếu, hoặc muốn quản lý ngay
                trên điện thoại (chọn BYOK hoặc gói kèm sẵn AI Credits, giảm 20% theo năm).
              </p>
            </div>
          </div>
        </div>
      </section>

      <HybridComparison />

      <FaqSection />

      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white">
            <h2 className="text-xl font-bold sm:text-2xl">
              Cần Admin tư vấn chọn đúng gói theo ngân sách thực tế?
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Nhắn trực tiếp Zalo {BRAND_CONFIG.contact.zaloPhone} hoặc gửi Email{" "}
              {BRAND_CONFIG.contact.email} để nhận phân tích nhu cầu miễn phí.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href={BRAND_CONFIG.contact.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
              >
                <MessageCircle className="h-4 w-4" />
                Tư vấn qua Zalo ({BRAND_CONFIG.contact.zaloPhone})
              </a>
              <Link
                href="/kho-doi-bot"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Xem 4 Kho Đội Bot theo ngành
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
