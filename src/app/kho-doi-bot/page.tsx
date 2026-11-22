import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { HomeClient } from "@/components/HomeClient";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "4 Kho Mẫu Đội Bot AI Theo Ngành — TikTok Shop, Marketing SEO, Giáo viên & SME",
  description:
    "Khám phá và chạy thử tương tác 4 Kho mẫu Đội Bot AI dựng sẵn theo ngành tại Việt Nam: Vận hành TikTok Shop, Marketing SEO Đa Kênh, Trợ lý Giáo viên (lop-nhe.vercel.app) và Văn phòng SME.",
  alternates: {
    canonical: "/kho-doi-bot",
  },
  openGraph: {
    title: `4 Kho Mẫu Đội Bot AI Theo Ngành | ${BRAND_CONFIG.name}`,
    description:
      "Bấm 1 chạm để kích hoạt nguyên phòng ban AI làm việc cho TikTok Shop, Marketing SEO, Giáo viên và SME.",
    url: `${BRAND_CONFIG.siteUrl}/kho-doi-bot`,
  },
};

export default function BotTemplatesPage() {
  return (
    <>
      <JsonLd includeFaq={false} />

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
              4 Kho Mẫu Đội Bot AI Dựng Sẵn Theo Ngành Tại Việt Nam
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Trải nghiệm trực tiếp cách từng phòng ban AI tự phân việc, kiểm tra chéo và chạy lịch
              tự động hằng ngày. Hoạt động trên cả Bản Cài Máy (giới hạn 3 bot) và Bản Thuê Cloud
              24/7 (mở khóa toàn bộ).
            </p>
          </div>
        </div>
      </section>

      <HomeClient />
    </>
  );
}
