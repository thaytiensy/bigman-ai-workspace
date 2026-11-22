"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Cloud,
  Copy,
  KeyRound,
  Laptop,
  Mail,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { BRAND_CONFIG, buildMailtoLink } from "@/config/brand";
import { DEPARTMENTS } from "@/config/departments";
import {
  CLOUD_TIERS,
  DESKTOP_EDITION,
  HYBRID_COMPARISON_ROWS,
  formatVnd,
  getYearlyMonthlyPrice,
} from "@/config/plans";

export function HybridComparison() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [aiSourceMode, setAiSourceMode] = useState<"byok" | "credits">("byok");
  const [selectedEdition, setSelectedEdition] = useState<string>(
    "Pro Team Cloud (24/7, 10 Bot — BYOK 499.000đ/tháng)"
  );
  const [selectedIndustry, setSelectedIndustry] = useState<string>(DEPARTMENTS[0].name);
  const [customerNote, setCustomerNote] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const requestSummary = [
    `[Đăng ký ${BRAND_CONFIG.name}]`,
    `- Phiên bản / Gói quan tâm: ${selectedEdition}`,
    `- Chu kỳ thanh toán (gói Cloud): ${billingCycle === "yearly" ? "Theo năm (giảm 20%)" : "Theo tháng"}`,
    `- Ngành / Phòng ban ưu tiên: ${selectedIndustry}`,
    customerNote.trim() ? `- Ghi chú nhu cầu: ${customerNote.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const mailtoUrl = buildMailtoLink(
    `Đăng ký ${selectedEdition} — ${BRAND_CONFIG.name}`,
    requestSummary
  );

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(requestSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="bang-gia"
      className="scroll-mt-20 border-t border-slate-200 bg-slate-50/70 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80">
            <Zap className="h-3.5 w-3.5" />
            Mô hình Kép (Hybrid): Bắt đầu 0đ — Nâng cấp mượt 24/7
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Chọn Bản Cài Máy (0đ) hoặc Thuê Web Cloud chạy tự động 24/7
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base">
            Minh bạch toàn bộ giới hạn của Bản Cài Máy và bảng giá Thuê Web Cloud theo từng quy mô
            đội bot của <strong>{BRAND_CONFIG.name}</strong>. Giảm ngay 20% khi thanh toán theo năm.
          </p>
        </div>

        {/* Side-by-Side Hero Comparison */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Desktop Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <Laptop className="h-3.5 w-3.5" />
                  {DESKTOP_EDITION.badge}
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  Miễn phí 0đ
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{DESKTOP_EDITION.name}</h3>
              <div className="mt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-950">0đ</span>
                <span className="text-xs font-medium text-slate-500">
                  · hoặc{" "}
                  <strong className="text-indigo-700">
                    {DESKTOP_EDITION.proLicenseName} {formatVnd(DESKTOP_EDITION.proLicensePriceVnd)}
                    /máy
                  </strong>
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {DESKTOP_EDITION.subtitle}
              </p>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Lợi ích nổi bật
                </p>
                <ul className="mt-2.5 space-y-2">
                  {DESKTOP_EDITION.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Giới hạn của Bản Cài Máy Miễn Phí
                </p>
                <ul className="mt-2 space-y-1.5">
                  {DESKTOP_EDITION.intentionalLimits.map((lim) => (
                    <li key={lim} className="text-xs leading-relaxed text-amber-950">
                      • {lim}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 pt-2 sm:flex-row">
              <a
                href="#dang-ky"
                onClick={() =>
                  setSelectedEdition("Bản Cài Máy Miễn Phí (Desktop Free — 0đ, tối đa 2 Bot)")
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
              >
                <Laptop className="h-4 w-4" />
                {DESKTOP_EDITION.ctaLabel}
              </a>
              <a
                href="#dang-ky"
                onClick={() =>
                  setSelectedEdition("Desktop Pro License (1.890.000đ/máy)")
                }
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Mua Pro License
              </a>
            </div>
          </div>

          {/* Cloud Highlight Card */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-indigo-600 bg-white p-6 shadow-md shadow-indigo-600/10 sm:p-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  <Cloud className="h-3.5 w-3.5" />
                  Khuyên dùng · Chạy tự động 24/7
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Từ {formatVnd(CLOUD_TIERS[0].byokMonthlyVnd)}/tháng · Giảm 20% gói năm
                </span>
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Bản Thuê Web SaaS Cloud 24/7
              </h3>
              <p className="mt-1 text-sm font-semibold text-indigo-700">
                Chọn linh hoạt BYOK (tự gắn API key) hoặc trọn gói kèm sẵn 3M – 30M AI Credits
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Giải phóng hoàn toàn máy tính cá nhân. Đội ngũ nhân viên AI làm việc liên tục trên
                máy chủ Cloud kể cả khi bạn đang ngủ, đi công tác hay chỉ cầm điện thoại.
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  "Chạy tự động 24/7 không phụ thuộc cấu hình máy tính yếu hay mạnh",
                  "Mở khóa 5 Bot (Starter), 10 Bot (Pro Team) hoặc Không giới hạn Bot (Business)",
                  "Đồng bộ tức thì trên máy tính, máy tính bảng và điện thoại",
                  "Cài sẵn Kho 4 Đội Bot theo ngành — vào dùng ngay không cần thiết lập",
                  "Thanh toán nhanh qua VietQR · Giảm ngay 20% khi thanh toán theo năm",
                  "Chuyển mượt toàn bộ cấu hình từ Bản Cài Máy lên Cloud bất cứ lúc nào",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-800">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 pt-2 sm:flex-row">
              <a
                href={BRAND_CONFIG.contact.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
              >
                <MessageCircle className="h-4 w-4" />
                Tư vấn thuê Cloud (Zalo)
              </a>
              <a
                href={mailtoUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                <Mail className="h-4 w-4" />
                Gửi Email
              </a>
            </div>
          </div>
        </div>

        {/* Cloud Tiers Grid */}
        <div className="mt-14">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Bảng giá Thuê Web Cloud 24/7 — {BRAND_CONFIG.name}
              </h3>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Mỗi gói đều có 2 lựa chọn nguồn AI: <strong>BYOK (tự gắn API key)</strong> hoặc{" "}
                <strong>kèm sẵn AI Credits</strong>. Giảm 20% khi thanh toán theo năm.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
                role="group"
                aria-label="Chọn nguồn AI BYOK hoặc kèm AI Credits"
              >
                <button
                  type="button"
                  onClick={() => setAiSourceMode("byok")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    aiSourceMode === "byok"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Dùng API Key (BYOK)
                </button>
                <button
                  type="button"
                  onClick={() => setAiSourceMode("credits")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    aiSourceMode === "credits"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Kèm AI Credits
                </button>
              </div>

              <div
                className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
                role="group"
                aria-label="Chọn chu kỳ thanh toán tháng hoặc năm"
              >
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    billingCycle === "monthly"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Theo tháng
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    billingCycle === "yearly"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Theo năm (-20%)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {CLOUD_TIERS.map((tier) => {
              const baseMonthly =
                aiSourceMode === "byok" ? tier.byokMonthlyVnd : tier.creditsMonthlyVnd;
              const altMonthly =
                aiSourceMode === "byok" ? tier.creditsMonthlyVnd : tier.byokMonthlyVnd;

              const displayPrice =
                billingCycle === "yearly" ? getYearlyMonthlyPrice(baseMonthly) : baseMonthly;
              const altDisplayPrice =
                billingCycle === "yearly" ? getYearlyMonthlyPrice(altMonthly) : altMonthly;

              const yearlySavings = (baseMonthly - getYearlyMonthlyPrice(baseMonthly)) * 12;
              const modeLabel = aiSourceMode === "byok" ? "BYOK" : tier.creditsLabel;

              return (
                <div
                  key={tier.id}
                  className={`flex flex-col justify-between rounded-2xl border bg-white p-6 ${
                    tier.popular
                      ? "border-indigo-600 shadow-md ring-2 ring-indigo-600/15"
                      : "border-slate-200 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-lg font-bold text-slate-900">{tier.name}</h4>
                      {tier.popular && (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                          Phổ biến nhất
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-indigo-700">
                      {tier.botCapacityLabel}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{tier.tagline}</p>

                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {formatVnd(displayPrice)}
                      </span>
                      <span className="text-xs font-medium text-slate-500">/ tháng</span>
                    </div>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      Đang xem: {aiSourceMode === "byok" ? "Bản BYOK (tự gắn API key)" : `Bản ${tier.creditsLabel}`}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {aiSourceMode === "byok"
                        ? `Hoặc ${formatVnd(altDisplayPrice)}/tháng (${tier.creditsLabel})`
                        : `Hoặc ${formatVnd(altDisplayPrice)}/tháng (BYOK tự gắn API key)`}
                    </p>

                    {billingCycle === "yearly" && (
                      <p className="mt-1.5 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Tiết kiệm {formatVnd(yearlySavings)}/năm (-20%)
                      </p>
                    )}

                    <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
                      {tier.limits.map((lim) => (
                        <li key={lim} className="flex items-start gap-2 text-sm text-slate-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                          <span>{lim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#dang-ky"
                    onClick={() =>
                      setSelectedEdition(
                        `${tier.name} (${tier.botCapacityLabel} — ${modeLabel} ${formatVnd(baseMonthly)}/tháng)`
                      )
                    }
                    className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      tier.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {tier.ctaLabel}
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              Bảng so sánh chi tiết: Bản Cài Máy vs Bản Thuê Web Cloud
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5 font-semibold sm:px-6">Tiêu chí</th>
                  <th className="px-5 py-3.5 font-semibold sm:px-6">
                    Bản Cài Máy (Desktop Free / Pro)
                  </th>
                  <th className="bg-indigo-50/70 px-5 py-3.5 font-bold text-indigo-800 sm:px-6">
                    Bản Thuê Web Cloud 24/7
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {HYBRID_COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 sm:px-6">
                      {row.feature}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 sm:px-6">{row.desktop}</td>
                    <td
                      className={`px-5 py-3.5 sm:px-6 ${
                        row.highlightCloud
                          ? "bg-indigo-50/30 font-semibold text-indigo-950"
                          : "bg-indigo-50/20 text-slate-800"
                      }`}
                    >
                      {row.cloud}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Conversion / Registration Box */}
        <div
          id="dang-ky"
          className="mt-14 scroll-mt-24 rounded-2xl border border-indigo-200 bg-white p-6 shadow-md sm:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                Đăng ký nhanh trong 30 giây
              </span>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                Nhận Bản Cài Máy (0đ) hoặc kích hoạt đội bot Cloud 24/7 ngay hôm nay
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                Chọn sẵn gói &amp; phòng ban bạn cần, sau đó gửi trực tiếp cho Admin qua Zalo hoặc
                Email chính thức để nhận link cài đặt và lịch cấu hình 1-1.
              </p>

              <div className="mt-5 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-bold text-slate-900">{BRAND_CONFIG.contact.adminLabel}</p>
                <p className="text-slate-700">
                  Zalo trực tiếp:{" "}
                  <a
                    href={BRAND_CONFIG.contact.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-indigo-700 underline underline-offset-2"
                  >
                    {BRAND_CONFIG.contact.zaloPhone}
                  </a>
                </p>
                <p className="text-slate-700">
                  Email:{" "}
                  <a
                    href={BRAND_CONFIG.contact.emailHref}
                    className="font-semibold text-indigo-700 underline underline-offset-2"
                  >
                    {BRAND_CONFIG.contact.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="select-edition"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    1. Chọn phiên bản / gói muốn dùng
                  </label>
                  <select
                    id="select-edition"
                    value={selectedEdition}
                    onChange={(e) => setSelectedEdition(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Bản Cài Máy Miễn Phí (Desktop Free — 0đ, tối đa 2 Bot)">
                      Bản Cài Máy Miễn Phí — 0đ (Tối đa 2 Bot, BYOK)
                    </option>
                    <option value="Desktop Pro License (1.890.000đ/máy)">
                      Desktop Pro License — 1.890.000đ/máy
                    </option>
                    <option value="Starter Cloud (24/7, 5 Bot — BYOK 199.000đ/tháng)">
                      Starter Cloud (5 Bot) — 199.000đ/tháng (BYOK)
                    </option>
                    <option value="Starter Cloud (24/7, 5 Bot — gồm 3M AI Credits 349.000đ/tháng)">
                      Starter Cloud (5 Bot) — 349.000đ/tháng (3M Credits)
                    </option>
                    <option value="Pro Team Cloud (24/7, 10 Bot — BYOK 499.000đ/tháng)">
                      Pro Team Cloud (10 Bot) — 499.000đ/tháng (BYOK)
                    </option>
                    <option value="Pro Team Cloud (24/7, 10 Bot — gồm 10M AI Credits 799.000đ/tháng)">
                      Pro Team Cloud (10 Bot) — 799.000đ/tháng (10M Credits)
                    </option>
                    <option value="Business Cloud (Không giới hạn Bot, 10 tài khoản — BYOK 1.290.000đ/tháng)">
                      Business Cloud (Không giới hạn Bot) — 1.290.000đ/tháng (BYOK)
                    </option>
                    <option value="Business Cloud (Không giới hạn Bot, 10 tài khoản — gồm 30M AI Credits 1.990.000đ/tháng)">
                      Business Cloud (Không giới hạn Bot) — 1.990.000đ/tháng (30M Credits)
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="select-industry"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    2. Kho đội bot ngành ưu tiên
                  </label>
                  <select
                    id="select-industry"
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                    <option value="Thiết kế phòng ban AI riêng theo doanh nghiệp">
                      Thiết kế phòng ban AI riêng theo doanh nghiệp
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="customer-note"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  3. Mô tả ngắn nhu cầu của bạn (tuỳ chọn)
                </label>
                <input
                  id="customer-note"
                  type="text"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Ví dụ: Shop có 2 gian hàng TikTok, cần chạy lịch báo cáo 24/7..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Nội dung yêu cầu soạn sẵn
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBrief}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Đã sao chép!" : "Sao chép nhanh"}
                  </button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700">
                  {requestSummary}
                </pre>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={BRAND_CONFIG.contact.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  Mở Zalo {BRAND_CONFIG.contact.zaloPhone} gửi Admin
                </a>
                <a
                  href={mailtoUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                >
                  <Mail className="h-4 w-4 text-indigo-600" />
                  Gửi qua Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
