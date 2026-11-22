import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  HelpCircle,
  Layers,
  ListTree,
  Mail,
  MessageCircle,
  Scale,
  Sparkles,
  Tag,
  UserCheck,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import {
  formatVietnameseDate,
  getAllBlogPosts,
  getAllBlogSlugs,
  getBlogPostBySlug,
  HERO_IMAGE,
} from "@/lib/blog";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Không tìm thấy bài viết" };
  }

  const canonicalPath = `/blog/${post.slug}`;
  const canonicalUrl = `${BRAND_CONFIG.siteUrl}${canonicalPath}`;

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      locale: BRAND_CONFIG.seo.locale,
      url: canonicalUrl,
      siteName: BRAND_CONFIG.name,
      title: post.metaTitle,
      description: post.metaDescription,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.keywords,
      images: [
        {
          url: post.coverImage,
          width: HERO_IMAGE.width,
          height: HERO_IMAGE.height,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.coverImage],
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts.filter((item) => item.slug !== post.slug);
  const articleUrl = `${BRAND_CONFIG.siteUrl}/blog/${post.slug}`;
  const absoluteImageUrl = `${BRAND_CONFIG.siteUrl}${post.coverImage}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    alternativeHeadline: post.metaTitle,
    description: post.metaDescription,
    image: [absoluteImageUrl],
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "vi-VN",
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    author: {
      "@type": "Organization",
      name: post.author,
      url: BRAND_CONFIG.siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND_CONFIG.name,
      url: BRAND_CONFIG.siteUrl,
      email: post.contact.email,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  const faqJsonLd =
    post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ARTICLE HEADER */}
      <section className="bg-grid-subtle border-b border-slate-200 pb-10 pt-8 sm:pb-12 sm:pt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm"
          >
            <Link href="/" className="transition-colors hover:text-indigo-600">
              Trang chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link href="/blog" className="transition-colors hover:text-indigo-600">
              Kiến thức SEO
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate font-semibold text-slate-900">{post.category}</span>
          </nav>

          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <BookOpen className="h-3.5 w-3.5" />
              {post.category}
            </span>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-4xl sm:leading-[1.18]">
              {post.title}
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-lg">
              {post.metaDescription}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                Cập nhật {formatVietnameseDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Khoảng {post.readingTimeMinutes} phút đọc
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <Tag className="mr-1 h-3.5 w-3.5 text-slate-400" />
              {post.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Hero Image */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={HERO_IMAGE.width}
              height={HERO_IMAGE.height}
              priority
              className="block aspect-[1376/768] h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ARTICLE BODY + STICKY TOC SIDEBAR */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Mobile Quick TOC */}
          {post.toc.length > 0 && (
            <details className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 lg:hidden">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-slate-900">
                <span className="inline-flex items-center gap-2">
                  <ListTree className="h-4 w-4 text-indigo-600" />
                  Mục lục đọc nhanh ({post.toc.length} mục)
                </span>
                <span className="text-xs font-semibold text-indigo-600">Mở / Đóng</span>
              </summary>
              <nav aria-label="Mục lục bài viết" className="mt-3 border-t border-slate-200 pt-3">
                <ul className="space-y-2 text-sm">
                  {post.toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                      <a
                        href={`#${item.id}`}
                        className="block text-slate-600 transition-colors hover:text-indigo-700"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                  {post.faq.length > 0 && (
                    <li>
                      <a
                        href="#cau-hoi-thuong-gap"
                        className="block font-semibold text-indigo-700 hover:underline"
                      >
                        Câu hỏi thường gặp (FAQ)
                      </a>
                    </li>
                  )}
                </ul>
              </nav>
            </details>
          )}

          <div className="grid gap-10 lg:grid-cols-12">
            {/* MAIN ARTICLE CONTENT */}
            <article className="min-w-0 lg:col-span-8">
              <MarkdownRenderer blocks={post.blocks} />

              {/* FAQ SECTION MATCHING FAQPage JSON-LD */}
              {post.faq.length > 0 && (
                <section
                  id="cau-hoi-thuong-gap"
                  className="mt-12 scroll-mt-24 rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-6 sm:p-8"
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
                    <HelpCircle className="h-4 w-4" />
                    Giải đáp nhanh (FAQ)
                  </div>
                  <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                    Câu hỏi thường gặp về nội dung bài viết
                  </h2>

                  <div className="mt-6 space-y-4">
                    {post.faq.map((item, idx) => (
                      <div
                        key={item.question}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs"
                      >
                        <h3 className="text-base font-bold text-slate-950">
                          {idx + 1}. {item.question}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* INTERNAL CONVERSION CTA BLOCK */}
              <div className="mt-10 overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-lg sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  Triển khai ngay cùng {BRAND_CONFIG.name}
                </span>
                <h2 className="mt-3 text-xl font-extrabold tracking-tight sm:text-2xl">
                  Chọn đúng mô hình &amp; kích hoạt đội ngũ nhân sự AI của bạn
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Bắt đầu miễn phí 0đ với Bản Cài Máy (tối đa 2 Bot) hoặc nâng cấp Cloud chạy ngầm
                  24/7 từ 199.000đ/tháng. Admin hỗ trợ trực tiếp qua Zalo &amp; Email.
                </p>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                  <Link
                    href="/so-sanh-cai-may-va-cloud"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-100 transition-colors hover:border-indigo-400 hover:bg-slate-800 sm:text-sm"
                  >
                    <Scale className="h-4 w-4 text-sky-400" />
                    So sánh Cài Máy vs Cloud
                  </Link>
                  <Link
                    href="/kho-doi-bot"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-100 transition-colors hover:border-indigo-400 hover:bg-slate-800 sm:text-sm"
                  >
                    <Layers className="h-4 w-4 text-emerald-400" />
                    Xem Kho Đội Bot
                  </Link>
                  <Link
                    href="/#dang-ky"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-slate-100 sm:text-sm"
                  >
                    Đăng ký triển khai
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-800 pt-4 sm:flex-row">
                  <a
                    href={post.contact.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-400"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Zalo tư vấn: {post.contact.zalo}
                  </a>
                  <a
                    href={`mailto:${post.contact.email}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-800"
                  >
                    <Mail className="h-4 w-4 text-emerald-400" />
                    {post.contact.email}
                  </a>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại danh mục Kiến thức SEO
                </Link>
              </div>
            </article>

            {/* STICKY SIDEBAR (DESKTOP) */}
            <aside className="space-y-6 lg:col-span-4">
              <div className="space-y-6 lg:sticky lg:top-24">
                {/* TOC Card */}
                {post.toc.length > 0 && (
                  <div className="hidden rounded-2xl border border-slate-200 bg-slate-50/80 p-5 lg:block">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                      <ListTree className="h-4 w-4 text-indigo-600" />
                      Mục lục đọc nhanh
                    </div>
                    <nav aria-label="Mục lục bài viết" className="mt-3.5">
                      <ul className="space-y-2 text-xs leading-relaxed">
                        {post.toc.map((item) => (
                          <li
                            key={item.id}
                            className={item.level === 3 ? "pl-3.5 text-slate-500" : "font-semibold text-slate-800"}
                          >
                            <a
                              href={`#${item.id}`}
                              className="block rounded-md py-0.5 transition-colors hover:text-indigo-600"
                            >
                              {item.text}
                            </a>
                          </li>
                        ))}
                        {post.faq.length > 0 && (
                          <li className="border-t border-slate-200 pt-2 font-semibold text-indigo-700">
                            <a href="#cau-hoi-thuong-gap" className="block hover:underline">
                              Câu hỏi thường gặp ({post.faq.length} FAQ)
                            </a>
                          </li>
                        )}
                      </ul>
                    </nav>
                  </div>
                )}

                {/* Quick Conversion Actions */}
                <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-2xs">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Bắt đầu nhanh
                  </p>
                  <h2 className="mt-1.5 text-base font-extrabold text-slate-950">
                    Triển khai {BRAND_CONFIG.name}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    Dùng miễn phí 0đ trên máy cá nhân hoặc chạy tự động 24/7 trên Cloud từ
                    199.000đ/tháng.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href="/#dang-ky"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                    >
                      Đăng ký nhận Bản Cài Máy / Cloud
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/so-sanh-cai-may-va-cloud"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      So sánh Cài Máy vs Cloud
                    </Link>
                    <Link
                      href="/kho-doi-bot"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      Khám phá Kho Đội Bot dựng sẵn
                    </Link>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <a
                      href={post.contact.zaloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-semibold text-indigo-700 hover:underline"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Zalo Admin: {post.contact.zalo}
                    </a>
                    <a
                      href={`mailto:${post.contact.email}`}
                      className="mt-1.5 flex items-center gap-2 text-slate-600 hover:text-indigo-700"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {post.contact.email}
                    </a>
                  </div>
                </div>

                {/* Cross-linked Related Pillar Articles */}
                {relatedPosts.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bài Pillar liên quan
                    </p>
                    <ul className="mt-3 space-y-3.5">
                      {relatedPosts.map((related) => (
                        <li
                          key={related.slug}
                          className="border-b border-slate-100 pb-3.5 last:border-b-0 last:pb-0"
                        >
                          <span className="text-[11px] font-semibold text-indigo-600">
                            {related.category}
                          </span>
                          <Link
                            href={`/blog/${related.slug}`}
                            className="mt-1 block text-sm font-bold leading-snug text-slate-900 transition-colors hover:text-indigo-700"
                          >
                            {related.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* BOTTOM CROSS-LINKING SECTION */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50/70 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Liên kết nội bộ chuỗi Pillar SEO
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                  Đọc tiếp các bài hướng dẫn chuyên sâu khác
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 sm:inline-flex"
              >
                Tất cả bài viết
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md"
                >
                  <div>
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {related.category}
                    </span>
                    <h3 className="mt-3 text-lg font-extrabold leading-snug text-slate-950 transition-colors group-hover:text-indigo-700">
                      {related.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {related.metaDescription}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                    Đọc bài viết này
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
