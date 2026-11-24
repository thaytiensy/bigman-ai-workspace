import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Cloud, Laptop, LayoutGrid, MessageCircle } from "lucide-react";
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
    images: [
      {
        url: "/images/infographic-cai-may-vs-cloud.jpg",
        width: 1200,
        height: 1600,
        alt: `Infographic so sánh Bản Cài Máy vs Bản Thuê Cloud 24/7 — ${BRAND_CONFIG.name}`,
      },
    ],
  },
};

export default function CompareHybridPage() {
  return (
    <>
      <JsonLd includeFaq />

      <section className="bg-hero-aurora border-b border-slate-200 py-12 sm:py-16">
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
                phòng họp cơ bản, mở lên dùng ngay khi đang bật máy tính — hoặc nâng cấp bản quyền
                Desktop Pro License 1.890.000đ/máy.
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
                trên điện thoại (chọn Trọn gói sẵn AI Credits dùng ngay hoặc Hạ tầng tiết kiệm, giảm 20% theo năm).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INFOGRAPHIC 3:4 SO SÁNH BẢN CÀI MÁY VS CLOUD 24/7 (ZERO CLS) */}
      <section className="border-b border-slate-200 bg-slate-50/70 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
              Infographic Tổng Quan 1 Trang
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Đối chiếu trực quan Bản Cài Máy (0đ) vs Bản Thuê Cloud 24/7
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
              Lưu hoặc chia sẻ nhanh cho đội ngũ của bạn để chọn đúng mô hình vận hành AI đa bot
              tiết kiệm nhất.
            </p>
          </div>

          <figure className="mx-auto mt-8 max-w-2xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-2 shadow-2xl shadow-slate-900/15">
              <Image
                src="/images/infographic-cai-may-vs-cloud.jpg"
                alt="Infographic Tổ Chức Nhân Viên AI — So sánh Mô hình Kép Bản Cài Máy 0đ và Bản Thuê Cloud 24/7 từ 199.000đ/tháng"
                width={1200}
                height={1600}
                priority
                className="block aspect-[3/4] h-auto w-full rounded-2xl object-contain"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs text-slate-500">
              Infographic chính thức của {BRAND_CONFIG.name} · Zalo hỗ trợ{" "}
              {BRAND_CONFIG.contact.zaloPhone} · Email {BRAND_CONFIG.contact.email}
            </figcaption>
          </figure>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <LayoutGrid className="h-4 w-4" />
              Dùng thử Workspace ngay
            </Link>
            <a
              href="/images/infographic-cai-may-vs-cloud.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
            >
              Xem ảnh Infographic độ phân giải gốc
            </a>
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
