import Link from "next/link";
import { Mail, MessageCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white">
                {BRAND_CONFIG.logoMark}
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                {BRAND_CONFIG.name}
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Nền tảng Đội Ngũ Nhân Sự AI Đa Bot thương mại tại Việt Nam theo mô hình Kép: dùng Bản
              Cài Máy cơ bản để trải nghiệm nhanh hoặc nâng cấp Thuê Web Cloud chạy tự động 24/7
              không phụ thuộc cấu hình máy.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              100% mã nguồn sạch · Sẵn sàng tùy biến thương hiệu &amp; phòng ban riêng
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Điều hướng nhanh
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/#workspace-demo" className="transition-colors hover:text-white">
                  Trải nghiệm Workspace trực tiếp
                </Link>
              </li>
              <li>
                <Link href="/kho-doi-bot" className="transition-colors hover:text-white">
                  4 Kho mẫu Đội Bot theo ngành
                </Link>
              </li>
              <li>
                <Link
                  href="/so-sanh-cai-may-va-cloud"
                  className="transition-colors hover:text-white"
                >
                  So sánh Bản Cài Máy vs Thuê Cloud
                </Link>
              </li>
              <li>
                <Link href="/#bang-gia" className="transition-colors hover:text-white">
                  Bảng giá &amp; Nâng cấp 24/7
                </Link>
              </li>
              <li>
                <a
                  href={BRAND_CONFIG.liveDemos.gvcnApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 transition-colors hover:text-sky-300"
                >
                  Demo thực tế: {BRAND_CONFIG.liveDemos.gvcnApp.name}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              {BRAND_CONFIG.contact.adminLabel}
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={BRAND_CONFIG.contact.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-slate-200 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span>
                    Zalo: <strong className="font-semibold">{BRAND_CONFIG.contact.zaloPhone}</strong>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONFIG.contact.emailHref}
                  className="flex items-center gap-2.5 text-slate-200 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{BRAND_CONFIG.contact.email}</span>
                </a>
              </li>
              <li className="text-xs text-slate-400">
                Hỗ trợ cài đặt &amp; kích hoạt gói Cloud: {BRAND_CONFIG.contact.workingHours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {BRAND_CONFIG.name}. Mọi quyền được bảo lưu.
          </p>
          <p>
            Kênh hỗ trợ chính thức duy nhất: Zalo {BRAND_CONFIG.contact.zaloPhone} ·{" "}
            {BRAND_CONFIG.contact.email}
          </p>
        </div>
      </div>
    </footer>
  );
}
