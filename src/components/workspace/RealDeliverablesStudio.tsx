'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';
import {
  auditComplianceAndSeo,
  buildComplianceWordDoc,
  buildTeacherKitWordDoc,
  buildTikTokProfitCsv,
  buildVideoKocWordDoc,
  calculateTikTokProfit,
  formatVnd,
  generateTeacherParentKit,
  generateVideoAndKocKit,
  type ComplianceAuditInput,
  type TeacherKitInput,
  type TikTokProfitInput,
  type VideoKocInput,
} from '@/lib/deliverables/realWorkEngine';
import type { TeamDeliverableFile, WorkspaceUiTheme } from '@/types/workspace';

type StudioToolId = 'profit' | 'compliance' | 'video_koc' | 'teacher';

interface RealDeliverablesStudioProps {
  uiTheme: WorkspaceUiTheme;
  onRecordFile: (file: Omit<TeamDeliverableFile, 'id' | 'createdAt'>) => void;
  onOpenTeamFiles: () => void;
}

function triggerBrowserDownload(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function slugFilePart(text: string): string {
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 36) || 'thanh-pham'
  );
}

export const RealDeliverablesStudio: React.FC<RealDeliverablesStudioProps> = ({
  uiTheme,
  onRecordFile,
  onOpenTeamFiles,
}) => {
  const isLight = uiTheme === 'light';
  const [activeTool, setActiveTool] = useState<StudioToolId>('profit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 1. State: Lan — Tính giá bán & Chống lỗ ngầm TikTok Shop
  const [profitInput, setProfitInput] = useState<TikTokProfitInput>({
    productName: 'Áo khoác chống nắng UV nữ form rộng',
    cogs: 85000,
    listPrice: 249000,
    flashSalePct: 18,
    shopVoucher: 15000,
    platformFeePct: 11.5,
    kocCommissionPct: 12,
    packagingCost: 7000,
    returnRatePct: 6,
    adsPerOrder: 22000,
  });

  // 2. State: Nam — Quét từ khóa cấm & Chuẩn hóa SEO
  const [complianceInput, setComplianceInput] = useState<ComplianceAuditInput>({
    title: 'Kem dưỡng trắng bật tông sau 1 lần cam kết 100% hàng siêu cấp ib riêng Zalo 0912345678',
    description:
      'Sản phẩm đặc trị nám tàn nhang chữa khỏi 100%, tốt nhất Việt Nam. Mua ngoài chuyển khoản riêng hoặc nhắn Facebook để giảm giá sâu!!!!',
    primaryKeyword: 'kem dưỡng sáng da',
    platform: 'tiktok_shop',
  });

  // 3. State: Trang & Hùng — Kịch bản Video 45s + Tin nhắn mời KOC
  const [videoInput, setVideoInput] = useState<VideoKocInput>({
    productName: 'Bình giữ nhiệt Inox 316 cao cấp 900ml',
    targetAudience: 'dân văn phòng và mẹ bỉm sữa',
    coreBenefit: 'giữ lạnh 24 giờ, không đọng sương, ống hút silicone an toàn',
    pricePoint: '189.000đ',
    commissionPct: 14,
    offerNote: 'gửi mẫu miễn phí trong 24h + mã giảm riêng cho kênh',
  });

  // 4. State: Phong & Vy — Trợ lý Giáo dục / GVCN
  const [teacherInput, setTeacherInput] = useState<TeacherKitInput>({
    className: 'Lớp 5A',
    teacherName: 'Cô Minh Anh',
    weekLabel: 'Tuần 12',
    focusTopic: 'Ôn tập kiểm tra giữa học kỳ I & rèn nề nếp tự học buổi tối',
    studentHighlight: '95% học sinh đi học đúng giờ, tích cực phát biểu xây dựng bài',
    reminderNote: 'Nhờ phụ huynh kiểm tra góc học tập và nhắc con ngủ trước 21h30',
    tone: 'am_ap',
  });

  const profitResult = useMemo(() => calculateTikTokProfit(profitInput), [profitInput]);
  const complianceResult = useMemo(() => auditComplianceAndSeo(complianceInput), [complianceInput]);
  const videoResult = useMemo(() => generateVideoAndKocKit(videoInput), [videoInput]);
  const teacherResult = useMemo(() => generateTeacherParentKit(teacherInput), [teacherInput]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 4000);
  };

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast('Trình duyệt chặn copy tự động — bạn có thể bôi đen và Ctrl+C.');
    }
  };

  const handleExportProfitCsv = () => {
    const csv = buildTikTokProfitCsv(profitInput, profitResult);
    const fileName = `tinh-gia-tiktok-${slugFilePart(profitInput.productName)}.csv`;
    const mime = 'text/csv;charset=utf-8;';
    triggerBrowserDownload(fileName, csv, mime);
    onRecordFile({
      title: `Bảng tính giá chống lỗ ngầm: ${profitInput.productName}`,
      fileName,
      format: 'csv',
      mimeType: mime,
      content: csv,
      createdByName: 'Lan',
      createdByRole: 'AI Tài chính & Shop',
      botId: 'bot-sunny',
      summary: `Lãi ròng ${formatVnd(profitResult.netProfit)}/đơn (${profitResult.netMarginPct}%) · ${profitResult.riskLabel}`,
    });
    showToast(`Đã tải file Excel (${fileName}) và lưu vào Tệp của nhóm!`);
  };

  const handleExportComplianceDoc = () => {
    const doc = buildComplianceWordDoc(complianceInput, complianceResult);
    const fileName = `bao-cao-quet-tu-khoa-seo-${slugFilePart(complianceInput.primaryKeyword || 'san-pham')}.doc`;
    const mime = 'application/msword;charset=utf-8;';
    triggerBrowserDownload(fileName, doc, mime);
    onRecordFile({
      title: `Báo cáo quét từ khóa cấm & SEO (${complianceResult.seoScore}/100)`,
      fileName,
      format: 'doc',
      mimeType: mime,
      content: doc,
      createdByName: 'Nam',
      createdByRole: 'AI SEO & Chống vi phạm',
      botId: 'bot-listing-pro',
      summary: `Phát hiện ${complianceResult.flaggedIssues.length} từ rủi ro · Điểm SEO ${complianceResult.seoScore}/100`,
    });
    showToast(`Đã tải file Word (${fileName}) và lưu vào Tệp của nhóm!`);
  };

  const handleExportVideoKocDoc = () => {
    const doc = buildVideoKocWordDoc(videoInput, videoResult);
    const fileName = `kich-ban-45s-va-koc-${slugFilePart(videoInput.productName)}.doc`;
    const mime = 'application/msword;charset=utf-8;';
    triggerBrowserDownload(fileName, doc, mime);
    onRecordFile({
      title: `Kịch bản Video 45s & Mẫu mời KOC: ${videoInput.productName}`,
      fileName,
      format: 'doc',
      mimeType: mime,
      content: doc,
      createdByName: 'Trang & Hùng',
      createdByRole: 'AI Content & Affiliate',
      botId: 'bot-echo',
      summary: `3 Hook 3 giây đầu · 5 phân cảnh 45s · 2 mẫu mời KOC hoa hồng ${videoInput.commissionPct}%`,
    });
    showToast(`Đã tải file Word (${fileName}) và lưu vào Tệp của nhóm!`);
  };

  const handleExportTeacherDoc = () => {
    const doc = buildTeacherKitWordDoc(teacherInput, teacherResult);
    const fileName = `ho-so-gvcn-${slugFilePart(teacherInput.className)}-${slugFilePart(teacherInput.weekLabel)}.doc`;
    const mime = 'application/msword;charset=utf-8;';
    triggerBrowserDownload(fileName, doc, mime);
    onRecordFile({
      title: `Hồ sơ GVCN ${teacherInput.weekLabel} — ${teacherInput.className}`,
      fileName,
      format: 'doc',
      mimeType: mime,
      content: doc,
      createdByName: 'Phong & Vy',
      createdByRole: 'AI Trợ lý Giáo dục',
      summary: `Kế hoạch tuần + 3 mẫu Zalo phụ huynh + nhận xét chuẩn Thông tư 27`,
    });
    showToast(`Đã tải file Word (${fileName}) và lưu vào Tệp của nhóm!`);
  };

  const toolCards: Array<{
    id: StudioToolId;
    botLabel: string;
    title: string;
    outputBadge: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [
    {
      id: 'profit',
      botLabel: 'Lan · Tài chính',
      title: 'Tính Giá Chống Lỗ Ngầm',
      outputBadge: 'Xuất Excel (.csv)',
      icon: Calculator,
    },
    {
      id: 'compliance',
      botLabel: 'Nam · SEO & Luật sàn',
      title: 'Quét Từ Khóa Cấm',
      outputBadge: 'Xuất Word (.doc)',
      icon: ShieldCheck,
    },
    {
      id: 'video_koc',
      botLabel: 'Trang & Hùng · Tăng trưởng',
      title: 'Kịch Bản 45s & Mời KOC',
      outputBadge: 'Xuất Word (.doc)',
      icon: Video,
    },
    {
      id: 'teacher',
      botLabel: 'Phong & Vy · Giáo dục',
      title: 'Trợ Lý GVCN & Phụ Huynh',
      outputBadge: 'Xuất Word (.doc)',
      icon: GraduationCap,
    },
  ];

  const cardSurface = isLight
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-slate-900/80 border-slate-800';
  const inputSurface = isLight
    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
    : 'bg-slate-950 border-slate-700 text-white focus:border-emerald-400';

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-7 ${
        isLight ? 'bg-[#f4f6f9] text-slate-900' : 'bg-[#030b17] text-slate-100'
      }`}
    >
      <div className="max-w-6xl w-full mx-auto space-y-5">
        {/* HERO BANNER */}
        <div
          className={`rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 ${
            isLight
              ? 'bg-gradient-to-r from-emerald-50 via-white to-cyan-50 border-emerald-200 shadow-sm'
              : 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/40 border-emerald-500/35'
          }`}
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white">
                <Sparkles size={12} /> DÙNG NGAY · KHÔNG CẦN API KEY
              </span>
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-300">
                Hướng 1 · Ra File Excel &amp; Word Thật Trong 10 Giây
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Xưởng Việc Thật — Tổ Chức Nhân Viên AI
            </h1>
            <p className={`text-xs max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Chọn đúng nhân viên phụ trách bên dưới, nhập số liệu hoặc nội dung thực tế của bạn và bấm xuất thẳng{' '}
              <strong>file Excel (.csv)</strong> hoặc <strong>Word (.doc)</strong>. Mọi thành phẩm tự động lưu lại trong{' '}
              <strong>Tệp của nhóm</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTeamFiles}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText size={14} className="text-emerald-500" /> Xem Kho Thành Phẩm Đã Xuất
          </button>
        </div>

        {/* TOAST FEEDBACK */}
        {toastMessage && (
          <div className="rounded-xl px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 4 TOOL SELECTOR TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {toolCards.map((card) => {
            const Icon = card.icon;
            const active = activeTool === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveTool(card.id)}
                className={`text-left rounded-2xl border p-3.5 transition flex flex-col justify-between gap-2 ${
                  active
                    ? isLight
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-emerald-500/20 text-white border-emerald-400 shadow-lg shadow-emerald-950/40'
                    : `${cardSurface} hover:border-emerald-400/70`
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      active ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-300'
                    }`}
                  >
                    {card.botLabel}
                  </span>
                  <Icon
                    size={16}
                    className={active ? 'text-white' : 'text-emerald-500'}
                  />
                </div>
                <div>
                  <div className="text-sm font-extrabold">{card.title}</div>
                  <div
                    className={`text-[10px] mt-1 font-semibold ${
                      active ? 'text-emerald-100' : isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {card.outputBadge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ================================================================
         * TOOL 1: LAN — TÍNH GIÁ BÁN & CHỐNG LỖ NGẦM TIKTOK SHOP
         * ============================================================== */}
        {activeTool === 'profit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Inputs */}
            <div className={`lg:col-span-5 rounded-2xl border p-5 space-y-3.5 ${cardSurface}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black flex items-center gap-2">
                  <Calculator size={16} className="text-emerald-500" />
                  Thông Số Sản Phẩm (SKU)
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setProfitInput({
                      productName: 'Set dưỡng da Combo 3 món',
                      cogs: 120000,
                      listPrice: 229000,
                      flashSalePct: 22,
                      shopVoucher: 15000,
                      platformFeePct: 12,
                      kocCommissionPct: 15,
                      packagingCost: 8000,
                      returnRatePct: 8,
                      adsPerOrder: 25000,
                    })
                  }
                  className="text-[11px] font-bold text-rose-500 hover:underline"
                >
                  Thử ca lỗ ngầm
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={profitInput.productName}
                    onChange={(e) =>
                      setProfitInput((p) => ({ ...p, productName: e.target.value }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold mb-1">Giá vốn (VNĐ)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={profitInput.cogs}
                      onChange={(e) =>
                        setProfitInput((p) => ({ ...p, cogs: Number(e.target.value) || 0 }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Giá niêm yết (VNĐ)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={profitInput.listPrice}
                      onChange={(e) =>
                        setProfitInput((p) => ({ ...p, listPrice: Number(e.target.value) || 0 }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold mb-1">Flash Sale (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={90}
                      value={profitInput.flashSalePct}
                      onChange={(e) =>
                        setProfitInput((p) => ({ ...p, flashSalePct: Number(e.target.value) || 0 }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Voucher Shop (VNĐ)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={profitInput.shopVoucher}
                      onChange={(e) =>
                        setProfitInput((p) => ({ ...p, shopVoucher: Number(e.target.value) || 0 }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold mb-1">Phí sàn + thuế (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.5}
                      value={profitInput.platformFeePct}
                      onChange={(e) =>
                        setProfitInput((p) => ({
                          ...p,
                          platformFeePct: Number(e.target.value) || 0,
                        }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Hoa hồng KOC (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={profitInput.kocCommissionPct}
                      onChange={(e) =>
                        setProfitInput((p) => ({
                          ...p,
                          kocCommissionPct: Number(e.target.value) || 0,
                        }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Đóng gói (đ)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={profitInput.packagingCost}
                      onChange={(e) =>
                        setProfitInput((p) => ({
                          ...p,
                          packagingCost: Number(e.target.value) || 0,
                        }))
                      }
                      className={`w-full rounded-xl border px-2.5 py-2 outline-none ${inputSurface}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Hoàn (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={profitInput.returnRatePct}
                      onChange={(e) =>
                        setProfitInput((p) => ({
                          ...p,
                          returnRatePct: Number(e.target.value) || 0,
                        }))
                      }
                      className={`w-full rounded-xl border px-2.5 py-2 outline-none ${inputSurface}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Ads/đơn (đ)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={profitInput.adsPerOrder}
                      onChange={(e) =>
                        setProfitInput((p) => ({
                          ...p,
                          adsPerOrder: Number(e.target.value) || 0,
                        }))
                      }
                      className={`w-full rounded-xl border px-2.5 py-2 outline-none ${inputSurface}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Profit Result & Export */}
            <div className={`lg:col-span-7 rounded-2xl border p-5 flex flex-col justify-between gap-4 ${cardSurface}`}>
              <div className="space-y-4">
                {/* Risk Status Banner */}
                <div
                  className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
                    profitResult.riskLevel === 'danger'
                      ? 'bg-rose-500/15 border-rose-500/45 text-rose-600 dark:text-rose-300'
                      : profitResult.riskLevel === 'warn'
                        ? 'bg-amber-500/15 border-amber-500/45 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-500/15 border-emerald-500/45 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {profitResult.riskLevel === 'healthy' ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}
                    <div>
                      <div className="text-xs font-extrabold uppercase">{profitResult.riskLabel}</div>
                      <div className="text-[11px] opacity-85">
                        Giá thực thu sau KM: {formatVnd(profitResult.effectivePrice)} · Tổng chi phí:{' '}
                        {formatVnd(profitResult.totalCost)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black">
                      {profitResult.netProfit >= 0 ? '+' : ''}
                      {formatVnd(profitResult.netProfit)}
                    </div>
                    <div className="text-[11px] font-bold">Biên ròng {profitResult.netMarginPct}%</div>
                  </div>
                </div>

                {/* 4 KPI Cells */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className={`rounded-xl border p-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
                    <div className="text-[10px] opacity-65">Phí sàn + Thuế</div>
                    <div className="text-sm font-black mt-0.5">{formatVnd(profitResult.platformFeeAmount)}</div>
                  </div>
                  <div className={`rounded-xl border p-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
                    <div className="text-[10px] opacity-65">Hoa hồng KOC</div>
                    <div className="text-sm font-black mt-0.5">{formatVnd(profitResult.kocFeeAmount)}</div>
                  </div>
                  <div className={`rounded-xl border p-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
                    <div className="text-[10px] opacity-65">ROAS hòa vốn</div>
                    <div className="text-sm font-black mt-0.5 text-cyan-600 dark:text-cyan-300">
                      {profitResult.breakEvenRoas ? `${profitResult.breakEvenRoas}x` : 'Âm trước Ads'}
                    </div>
                  </div>
                  <div className={`rounded-xl border p-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
                    <div className="text-[10px] opacity-65">Giá an toàn (20%)</div>
                    <div className="text-sm font-black mt-0.5 text-emerald-600 dark:text-emerald-300">
                      {formatVnd(profitResult.suggestedSafePrice)}
                    </div>
                  </div>
                </div>

                {/* Warnings & Recommendations */}
                <div className="space-y-2 text-xs">
                  {profitResult.warnings.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-200"
                    >
                      ⚠️ {w}
                    </div>
                  ))}
                  {profitResult.recommendations.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-800 dark:text-cyan-200"
                    >
                      💡 <strong>Lan khuyến nghị:</strong> {r}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] opacity-70">
                  Mở trực tiếp bằng Microsoft Excel / Google Sheets không lỗi font tiếng Việt.
                </span>
                <button
                  type="button"
                  onClick={handleExportProfitCsv}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
                >
                  <FileSpreadsheet size={15} /> Xuất File Excel (.csv) Ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
         * TOOL 2: NAM — QUÉT TỪ KHÓA CẤM & CHUẨN HÓA SEO
         * ============================================================== */}
        {activeTool === 'compliance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className={`lg:col-span-5 rounded-2xl border p-5 space-y-3 text-xs ${cardSurface}`}>
              <h2 className="text-sm font-black flex items-center gap-2">
                <ShieldAlert size={16} className="text-emerald-500" />
                Nội Dung Cần Nam Kiểm Duyệt
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1">Nền tảng</label>
                  <select
                    value={complianceInput.platform}
                    onChange={(e) =>
                      setComplianceInput((p) => ({
                        ...p,
                        platform: e.target.value as ComplianceAuditInput['platform'],
                      }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                  >
                    <option value="tiktok_shop">TikTok Shop</option>
                    <option value="shopee">Shopee</option>
                    <option value="google_seo">Google SEO / Website</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Từ khóa SEO chính</label>
                  <input
                    type="text"
                    value={complianceInput.primaryKeyword}
                    onChange={(e) =>
                      setComplianceInput((p) => ({ ...p, primaryKeyword: e.target.value }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Tiêu đề sản phẩm / bài viết</label>
                <textarea
                  rows={3}
                  value={complianceInput.title}
                  onChange={(e) => setComplianceInput((p) => ({ ...p, title: e.target.value }))}
                  className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={5}
                  value={complianceInput.description}
                  onChange={(e) =>
                    setComplianceInput((p) => ({ ...p, description: e.target.value }))
                  }
                  className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                />
              </div>
            </div>

            <div className={`lg:col-span-7 rounded-2xl border p-5 flex flex-col justify-between gap-4 ${cardSurface}`}>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-300">
                      Kết quả kiểm duyệt bởi Nam
                    </div>
                    <div className="text-sm font-black mt-0.5">{complianceResult.riskLabel}</div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/35 text-center">
                    <div className="text-[10px] font-semibold opacity-75">Điểm SEO</div>
                    <div className="text-xl font-black text-cyan-600 dark:text-cyan-300">
                      {complianceResult.seoScore}/100
                    </div>
                  </div>
                </div>

                {/* Flagged Words */}
                <div className="space-y-2">
                  <div className="text-xs font-bold">
                    Từ khóa bị gắn cờ ({complianceResult.flaggedIssues.length})
                  </div>
                  {complianceResult.flaggedIssues.length === 0 ? (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                      ✅ Tuyệt vời! Không phát hiện từ khóa vi phạm chính sách sàn.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {complianceResult.flaggedIssues.map((issue, idx) => (
                        <div
                          key={`${issue.phrase}-${idx}`}
                          className={`p-2.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
                            issue.severity === 'high'
                              ? 'bg-rose-500/10 border-rose-500/30'
                              : 'bg-amber-500/10 border-amber-500/30'
                          }`}
                        >
                          <div>
                            <span className="font-black text-rose-600 dark:text-rose-300">
                              “{issue.phrase}”
                            </span>{' '}
                            <span className="text-[10px] opacity-75">
                              ({issue.category} · {issue.location})
                            </span>
                            <div className="text-[11px] opacity-80">{issue.reason}</div>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 font-bold">
                            Đổi → {issue.replacement}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auto Cleaned Version */}
                <div className={`rounded-xl border p-3.5 space-y-2 text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-300">
                      Bản sạch gợi ý sẵn sàng đăng
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          'cleaned-copy',
                          `${complianceResult.cleanedTitle}\n\n${complianceResult.cleanedDescription}`
                        )
                      }
                      className="text-[11px] font-bold flex items-center gap-1 text-cyan-600 dark:text-cyan-300 hover:underline"
                    >
                      {copiedKey === 'cleaned-copy' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === 'cleaned-copy' ? 'Đã chép' : 'Chép bản sạch'}
                    </button>
                  </div>
                  <div className="font-bold">{complianceResult.cleanedTitle}</div>
                  <div className="opacity-80 whitespace-pre-line">{complianceResult.cleanedDescription}</div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleExportComplianceDoc}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
                >
                  <Download size={15} /> Xuất Báo Cáo Word (.doc) Ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
         * TOOL 3: TRANG & HÙNG — KỊCH BẢN VIDEO 45S & MỜI KOC AFFILIATE
         * ============================================================== */}
        {activeTool === 'video_koc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className={`lg:col-span-5 rounded-2xl border p-5 space-y-3 text-xs ${cardSurface}`}>
              <h2 className="text-sm font-black flex items-center gap-2">
                <Video size={16} className="text-emerald-500" />
                Thông Tin Chiến Dịch Video &amp; KOC
              </h2>
              <div>
                <label className="block font-semibold mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  value={videoInput.productName}
                  onChange={(e) => setVideoInput((p) => ({ ...p, productName: e.target.value }))}
                  className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Khách hàng mục tiêu</label>
                <input
                  type="text"
                  value={videoInput.targetAudience}
                  onChange={(e) => setVideoInput((p) => ({ ...p, targetAudience: e.target.value }))}
                  className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Điểm mạnh nổi bật (USP)</label>
                <textarea
                  rows={2}
                  value={videoInput.coreBenefit}
                  onChange={(e) => setVideoInput((p) => ({ ...p, coreBenefit: e.target.value }))}
                  className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1">Mức giá bán</label>
                  <input
                    type="text"
                    value={videoInput.pricePoint}
                    onChange={(e) => setVideoInput((p) => ({ ...p, pricePoint: e.target.value }))}
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Hoa hồng KOC (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={videoInput.commissionPct}
                    onChange={(e) =>
                      setVideoInput((p) => ({ ...p, commissionPct: Number(e.target.value) || 10 }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Chính sách hỗ trợ KOC</label>
                <input
                  type="text"
                  value={videoInput.offerNote}
                  onChange={(e) => setVideoInput((p) => ({ ...p, offerNote: e.target.value }))}
                  className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                />
              </div>
            </div>

            <div className={`lg:col-span-7 rounded-2xl border p-5 flex flex-col justify-between gap-4 text-xs ${cardSurface}`}>
              <div className="space-y-4">
                <div>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-300 mb-1.5">
                    1. 3 Hook 3 giây đầu (Trang đề xuất)
                  </div>
                  <div className="space-y-1.5">
                    {videoResult.hooks.map((h, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}
                      >
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-300 mb-1.5">
                    2. Phân cảnh Video 45 giây chuẩn chuyển đổi
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {videoResult.scenes.map((s) => (
                      <div
                        key={s.time}
                        className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}
                      >
                        <div className="font-bold text-cyan-600 dark:text-cyan-300">
                          {s.time} · {s.onScreenText}
                        </div>
                        <div className="opacity-85 mt-0.5">{s.voiceover}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border space-y-1.5 ${isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/25 border-emerald-500/30'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold">3. Mẫu tin nhắn mời KOC (Hùng soạn)</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('koc-msg', videoResult.kocMessageStandard)}
                      className="text-[11px] font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-300 hover:underline"
                    >
                      {copiedKey === 'koc-msg' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === 'koc-msg' ? 'Đã chép' : 'Chép tin nhắn'}
                    </button>
                  </div>
                  <p className="whitespace-pre-line opacity-90">{videoResult.kocMessageStandard}</p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleExportVideoKocDoc}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
                >
                  <Download size={15} /> Xuất Kịch Bản &amp; Mẫu KOC (.doc)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
         * TOOL 4: PHONG & VY — TRỢ LÝ GIÁO DỤC / GVCN
         * ============================================================== */}
        {activeTool === 'teacher' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className={`lg:col-span-5 rounded-2xl border p-5 space-y-3 text-xs ${cardSurface}`}>
              <h2 className="text-sm font-black flex items-center gap-2">
                <GraduationCap size={16} className="text-emerald-500" />
                Thông Tin Lớp Học &amp; Tuần Chủ Nhiệm
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1">Tên lớp</label>
                  <input
                    type="text"
                    value={teacherInput.className}
                    onChange={(e) => setTeacherInput((p) => ({ ...p, className: e.target.value }))}
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tuần học</label>
                  <input
                    type="text"
                    value={teacherInput.weekLabel}
                    onChange={(e) => setTeacherInput((p) => ({ ...p, weekLabel: e.target.value }))}
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1">Giáo viên chủ nhiệm</label>
                  <input
                    type="text"
                    value={teacherInput.teacherName}
                    onChange={(e) => setTeacherInput((p) => ({ ...p, teacherName: e.target.value }))}
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Giọng văn Zalo</label>
                  <select
                    value={teacherInput.tone}
                    onChange={(e) =>
                      setTeacherInput((p) => ({
                        ...p,
                        tone: e.target.value as TeacherKitInput['tone'],
                      }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                  >
                    <option value="am_ap">Ấm áp, gần gũi</option>
                    <option value="trang_trong">Trang trọng, chuẩn mực</option>
                    <option value="ngan_gon">Ngắn gọn, đi thẳng ý</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Trọng tâm tuần học</label>
                <input
                  type="text"
                  value={teacherInput.focusTopic}
                  onChange={(e) => setTeacherInput((p) => ({ ...p, focusTopic: e.target.value }))}
                  className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Điểm sáng đáng khen của lớp</label>
                <input
                  type="text"
                  value={teacherInput.studentHighlight}
                  onChange={(e) =>
                    setTeacherInput((p) => ({ ...p, studentHighlight: e.target.value }))
                  }
                  className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nội dung nhờ phụ huynh phối hợp</label>
                <textarea
                  rows={2}
                  value={teacherInput.reminderNote}
                  onChange={(e) => setTeacherInput((p) => ({ ...p, reminderNote: e.target.value }))}
                  className={`w-full rounded-xl border px-3 py-2 outline-none ${inputSurface}`}
                />
              </div>
            </div>

            <div className={`lg:col-span-7 rounded-2xl border p-5 flex flex-col justify-between gap-4 text-xs ${cardSurface}`}>
              <div className="space-y-4">
                <div className={`p-3.5 rounded-xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-300">
                      1. Thông báo Zalo nhóm phụ huynh (sẵn sàng gửi)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('zalo-cls', teacherResult.zaloClassBroadcast)}
                      className="text-[11px] font-bold flex items-center gap-1 text-cyan-600 dark:text-cyan-300 hover:underline"
                    >
                      {copiedKey === 'zalo-cls' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === 'zalo-cls' ? 'Đã chép' : 'Chép gửi Zalo'}
                    </button>
                  </div>
                  <p className="whitespace-pre-line opacity-90">{teacherResult.zaloClassBroadcast}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
                    <div className="font-bold mb-1">2. Tin khen ngợi riêng</div>
                    <p className="whitespace-pre-line opacity-85 line-clamp-5">{teacherResult.zaloPraiseMessage}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'}`}>
                    <div className="font-bold mb-1">3. Tin nhắc nhở tinh tế</div>
                    <p className="whitespace-pre-line opacity-85 line-clamp-5">{teacherResult.zaloGentleReminder}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleExportTeacherDoc}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
                >
                  <Download size={15} /> Xuất Bộ Hồ Sơ GVCN (.doc)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
