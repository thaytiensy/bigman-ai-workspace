"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, MessageCircle, Sparkles, LayoutGrid } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

const NAV_LINKS = [
  { href: "/workspace", label: "Dùng thử Workspace" },
  { href: "/kho-doi-bot", label: "Kho Đội Bot" },
  { href: "/so-sanh-cai-may-va-cloud", label: "Cài Máy vs Cloud" },
  { href: "/blog", label: "Kiến thức SEO" },
  { href: "/#bang-gia", label: "Bảng giá" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-slate-900 transition-opacity hover:opacity-90"
          aria-label={`Trang chủ ${BRAND_CONFIG.name}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold tracking-tight text-white shadow-sm">
            {BRAND_CONFIG.logoMark}
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-slate-900">
              {BRAND_CONFIG.name}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Cài Máy &amp; Cloud 24/7
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Điều hướng chính">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100"
          >
            <LayoutGrid className="h-4 w-4 text-indigo-600" />
            Dùng thử Workspace
          </Link>
          <a
            href={BRAND_CONFIG.contact.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <MessageCircle className="h-4 w-4" />
            Zalo {BRAND_CONFIG.contact.zaloPhone}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu điều hướng"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Điều hướng di động">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
            <Link
              href="/workspace"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700"
            >
              <LayoutGrid className="h-4 w-4 text-indigo-600" />
              Dùng thử Workspace
            </Link>
            <Link
              href="/#dang-ky"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Đăng ký nhận Bản Cài Máy
            </Link>
            <a
              href={BRAND_CONFIG.contact.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Tư vấn Cloud qua Zalo ({BRAND_CONFIG.contact.zaloPhone})
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
