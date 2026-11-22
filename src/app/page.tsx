import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cloud,
  Cpu,
  ExternalLink,
  Laptop,
  LayoutGrid,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { getAllBlogPosts, HERO_IMAGE } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { HomeClient } from "@/components/HomeClient";
import { HybridComparison } from "@/components/HybridComparison";
import { FaqSection } from "@/components/FaqSection";

const VALUE_PILLARS = [
  {
    icon: Workflow,
    title: "Đội ngũ AI biết giao việc chéo cho nhau",
    description:
      "Thay vì chat đơn lẻ từng câu với 1 chatbot, bạn có Trưởng phòng AI tự phân việc cho các bot chuyên môn, kiểm tra chéo và trả về 1 bản tổng hợp duy nhất.",
  },
  {
    icon: Cloud,
    title: "Mô hình Kép: Cài Máy 0đ — Nâng cấp Cloud 24/7",
    description:
      "Bắt đầu miễn phí 0đ với Bản Cài Máy (tối đa 2 Bot, 1 phòng họp cơ bản), rồi nâng cấp lên Bản Thuê Cloud từ 199.000đ/tháng bất cứ lúc nào khi cần chạy tự động 24/7.",
  },
  {
    icon: Cpu,
    title: "Không cần máy mạnh, không cần biết lập trình",
    description:
      "Bản Thuê Web Cloud chạy trực tiếp trên trình duyệt điện thoại & máy tính cấu hình nhẹ. Bấm chọn đúng Kho Đội Bot theo ngành là triển khai ngay.",
  },
  {
    icon: ShieldCheck,
    title: "100% mã nguồn sạch & kiểm soát an toàn",
    description:
      "Tách biệt dữ liệu giữa từng cửa hàng/doanh nghiệp. Mọi hành động nhạy cảm (đổi giá, gửi email, đăng bài) đều trình bạn duyệt trước khi thực thi.",
  },
];

export default function HomePage() {
  const blogPosts = getAllBlogPosts();

  return (
    <>
      <JsonLd includeFaq />

      {/* HERO SECTION */}
      <section className="bg-grid-subtle relative overflow-hidden pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/90 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" />
              {BRAND_CONFIG.badge}
            </span>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.15]">
              {BRAND_CONFIG.name} —{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                Đội Ngũ Nhân Sự AI Đa Bot Cài Máy 0đ &amp; Thuê Cloud 24/7
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {BRAND_CONFIG.subheadline}
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/workspace"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 sm:text-base"
              >
                <LayoutGrid className="h-4 w-4" />
                Dùng thử Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#bang-gia"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-2xs transition-colors hover:bg-slate-50 sm:text-base"
              >
                <Laptop className="h-4 w-4 text-slate-600" />
                Xem bảng giá Cài Máy vs Cloud
              </a>
            </div>
          </div>

          {/* Official Brand Hero Showcase (Zero CLS) */}
          <div className="mx-auto mt-10 max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-950 p-1.5 shadow-2xl shadow-slate-900/15 sm:p-2">
              <div className="overflow-hidden rounded-2xl bg-slate-950">
                <Image
                  src={HERO_IMAGE.src}
                  alt={HERO_IMAGE.alt}
                  width={HERO_IMAGE.width}
                  height={HERO_IMAGE.height}
                  priority
                  className="block aspect-[1376/768] h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Quick Proof Strip */}
          <div className="mx-auto mt-8 max-w-5xl">
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 text-left shadow-sm sm:grid-cols-4 sm:gap-4 sm:p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Kho dựng sẵn
                </p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">4 Phòng ban AI</p>
                <p className="text-xs text-slate-500">TikTok, SEO, GVCN, SME</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bản Cài Máy Free
                </p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">0đ · Tối đa 2 Bot</p>
                <p className="text-xs text-slate-500">Windows/macOS · BYOK</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Thuê Cloud 24/7
                </p>
                <p className="mt-1 text-lg font-extrabold text-indigo-700">Từ 199k/tháng</p>
                <p className="text-xs text-slate-500">5–10+ Bot · Giảm 20%/năm</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Sản phẩm Live
                </p>
                <a
                  href={BRAND_CONFIG.liveDemos.gvcnApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-lg font-extrabold text-sky-700 hover:underline"
                >
                  Trợ lý GVCN
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="text-xs text-slate-500">Kiểm chứng thực tế ngay</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PILLARS */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 text-base font-bold text-slate-900">{pillar.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE WORKSPACE DEMO + 4 INDUSTRY TEMPLATES */}
      <HomeClient />

      {/* HYBRID COMPARISON + PRICING + QUICK REGISTRATION */}
      <HybridComparison />

      {/* SEO RESOURCES / INTERNAL NAVIGATION CARDS */}
      <section className="border-t border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Hướng dẫn chọn mô hình
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Nên chọn Bản Cài Máy (0đ) hay Thuê Web Cloud 24/7?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Phân tích chi tiết chi phí, cấu hình máy, giới hạn 2 Bot của Desktop Free và thời
                điểm phù hợp để nâng cấp lên Starter / Pro Team / Business Cloud 24/7.
              </p>
              <Link
                href="/so-sanh-cai-may-va-cloud"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Xem bài so sánh chi tiết
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Thư viện triển khai nhanh
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Khám phá chi tiết 4 Kho Đội Bot theo ngành
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Xem đầy đủ danh sách từng vai trò bot, lịch chạy tự động và đầu ra thực tế cho
                TikTok Shop, Marketing SEO, Giáo viên &amp; Văn phòng SME.
              </p>
              <Link
                href="/kho-doi-bot"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Mở thư viện 4 Kho Đội Bot
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Pillar SEO Knowledge Hub */}
          {blogPosts.length > 0 && (
            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                    <BookOpen className="h-3.5 w-3.5" />
                    Kiến thức SEO &amp; Cẩm nang thực chiến
                  </span>
                  <h2 className="mt-1.5 text-xl font-extrabold text-slate-950 sm:text-2xl">
                    Chuỗi bài chuyên sâu từ {BRAND_CONFIG.name}
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-900"
                >
                  Xem toàn bộ mục Kiến thức SEO
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {blogPosts.map((post, idx) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-sm"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                        Pillar #{idx + 1} · {post.category}
                      </span>
                      <h3 className="mt-2 text-base font-bold leading-snug text-slate-950 group-hover:text-indigo-700">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {post.metaDescription}
                      </p>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                      Đọc bài viết ({post.readingTimeMinutes} phút)
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ SECTION */}
      <FaqSection />

      {/* FINAL COMMERCIAL CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Hỗ trợ cài đặt trực tiếp tại Việt Nam
                </span>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Sẵn sàng xây dựng {BRAND_CONFIG.name} làm việc 24/7 cho riêng bạn?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Liên hệ trực tiếp Admin để nhận Bản Cài Máy Miễn Phí (0đ) hoặc kích hoạt gói Thuê
                  Cloud 24/7 có cài sẵn đúng phòng ban ngành của bạn.
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:col-span-5">
                <a
                  href={BRAND_CONFIG.contact.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-400"
                >
                  <MessageCircle className="h-4 w-4" />
                  Nhắn Zalo Admin: {BRAND_CONFIG.contact.zaloPhone}
                </a>
                <a
                  href={BRAND_CONFIG.contact.emailHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-800"
                >
                  <Mail className="h-4 w-4 text-emerald-400" />
                  Email: {BRAND_CONFIG.contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
