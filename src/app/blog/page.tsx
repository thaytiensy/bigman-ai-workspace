import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  HelpCircle,
  Layers,
  Mail,
  MessageCircle,
  Scale,
  Sparkles,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import {
  formatVietnameseDate,
  getAllBlogPosts,
  HERO_IMAGE,
} from "@/lib/blog";

const BLOG_INDEX_TITLE = "Kiến thức SEO & Cẩm nang Tổ Chức Nhân Viên AI";
const BLOG_INDEX_DESCRIPTION =
  "Tổng hợp chuỗi bài Pillar chuyên sâu từ Tổ Chức Nhân Viên AI: cách xây dựng đội ngũ nhân sự AI đa bot, so sánh AI Cài Máy vs Thuê Cloud 24/7 và 5 phòng ban AI dựng sẵn cho chủ shop, giáo viên & SME.";

export const metadata: Metadata = {
  title: BLOG_INDEX_TITLE,
  description: BLOG_INDEX_DESCRIPTION,
  keywords: [
    "kiến thức SEO AI",
    "Tổ Chức Nhân Viên AI",
    "đội ngũ nhân sự AI đa bot",
    "so sánh AI cài máy và thuê cloud 24/7",
    "5 phòng ban AI dựng sẵn",
    "tự động hóa TikTok Shop bằng AI",
    "trợ lý AI cho giáo viên và SME",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    locale: BRAND_CONFIG.seo.locale,
    url: `${BRAND_CONFIG.siteUrl}/blog`,
    siteName: BRAND_CONFIG.name,
    title: `${BLOG_INDEX_TITLE} | ${BRAND_CONFIG.name}`,
    description: BLOG_INDEX_DESCRIPTION,
    images: [
      {
        url: HERO_IMAGE.src,
        width: HERO_IMAGE.width,
        height: HERO_IMAGE.height,
        alt: HERO_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BLOG_INDEX_TITLE} | ${BRAND_CONFIG.name}`,
    description: BLOG_INDEX_DESCRIPTION,
    images: [HERO_IMAGE.src],
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${BLOG_INDEX_TITLE} — ${BRAND_CONFIG.name}`,
    description: BLOG_INDEX_DESCRIPTION,
    url: `${BRAND_CONFIG.siteUrl}/blog`,
    inLanguage: "vi-VN",
    image: `${BRAND_CONFIG.siteUrl}${HERO_IMAGE.src}`,
    publisher: {
      "@type": "Organization",
      name: BRAND_CONFIG.name,
      url: BRAND_CONFIG.siteUrl,
      email: BRAND_CONFIG.contact.email,
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription,
      url: `${BRAND_CONFIG.siteUrl}/blog/${post.slug}`,
      datePublished: post.date,
      author: {
        "@type": "Organization",
        name: post.author,
      },
      image: `${BRAND_CONFIG.siteUrl}${post.coverImage}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: BRAND_CONFIG.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Kiến thức SEO",
        item: `${BRAND_CONFIG.siteUrl}/blog`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* HERO BANNER */}
      <section className="bg-grid-subtle border-b border-slate-200 pb-12 pt-8 sm:pb-16 sm:pt-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm"
          >
            <Link href="/" className="transition-colors hover:text-indigo-600">
              Trang chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">Kiến thức SEO</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700">
                <BookOpen className="h-3.5 w-3.5" />
                Chuỗi bài Pillar SEO thực chiến · {BRAND_CONFIG.name}
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl sm:leading-[1.15]">
                Kiến thức SEO &amp; Cẩm nang vận hành{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  Đội Ngũ Nhân Sự AI Đa Bot
                </span>
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                Hướng dẫn từng bước từ A–Z cho chủ shop TikTok Shop, giáo viên và doanh nghiệp
                SME Việt Nam: kiến trúc 4 khối phòng ban AI, bảng so sánh Bản Cài Máy (0đ) vs Thuê
                Cloud 24/7 và 5 phòng ban dựng sẵn giúp tiết kiệm 3 giờ mỗi ngày.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/so-sanh-cai-may-va-cloud"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <Scale className="h-4 w-4" />
                  So sánh Cài Máy vs Cloud
                </Link>
                <Link
                  href="/kho-doi-bot"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                >
                  <Layers className="h-4 w-4 text-indigo-600" />
                  Xem Kho Đội Bot
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 shadow-xl ring-1 ring-slate-900/5">
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
        </div>
      </section>

      {/* ARTICLE LIST */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {posts.length} bài viết trụ cột (Pillar Content)
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Đọc chuyên sâu theo lộ trình triển khai
              </h2>
            </div>
            <Link
              href="/#dang-ky"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Sparkles className="h-4 w-4" />
              Nhận tư vấn cài đặt 1-1 ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {posts.map((post, idx) => (
              <article
                key={post.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative block overflow-hidden bg-slate-950"
                >
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    width={HERO_IMAGE.width}
                    height={HERO_IMAGE.height}
                    className="block aspect-[1376/768] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-sky-300 backdrop-blur-xs">
                    Pillar #{idx + 1} · {post.category}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatVietnameseDate(post.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {post.readingTimeMinutes} phút đọc
                    </span>
                    {post.faq.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-indigo-600">
                        <HelpCircle className="h-3.5 w-3.5" />
                        {post.faq.length} FAQ
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-extrabold leading-snug text-slate-950 transition-colors group-hover:text-indigo-700">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">
                    {post.metaDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.keywords.slice(0, 3).map((kw) => (
                      <span
                        key={kw}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-800"
                    >
                      Đọc bài chi tiết
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONVERSION & INTERNAL LINKS CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Triển khai thực tế cùng {BRAND_CONFIG.name}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Muốn dùng thử Bản Cài Máy 0đ hoặc kích hoạt đội Bot Cloud 24/7?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Liên hệ trực tiếp Admin để được cài đặt đúng phòng ban theo ngành hàng (TikTok
                  Shop, Marketing SEO, Giáo viên, SME) — nhận tài liệu &amp; demo trực tiếp trong
                  ngày.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-semibold">
                  <Link
                    href="/so-sanh-cai-may-va-cloud"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 transition-colors hover:border-indigo-400 hover:text-white"
                  >
                    Bảng so sánh Cài Máy vs Cloud →
                  </Link>
                  <Link
                    href="/kho-doi-bot"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 transition-colors hover:border-indigo-400 hover:text-white"
                  >
                    Khám phá 4 Kho Đội Bot →
                  </Link>
                  <Link
                    href="/#dang-ky"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 transition-colors hover:border-indigo-400 hover:text-white"
                  >
                    Đăng ký nhanh trên trang chủ →
                  </Link>
                </div>
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
