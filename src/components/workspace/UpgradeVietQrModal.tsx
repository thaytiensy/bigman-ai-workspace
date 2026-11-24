'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  ArrowLeft,
  MessageCircle,
  KeyRound,
} from 'lucide-react';
import { PRICING_PLANS } from '@/data/mockWorkspaceData';
import { BRANDING } from '@/config/branding';
import { PricingBillingCycle, PricingBillingMode, PricingPlan } from '@/types/workspace';

interface UpgradeVietQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUpgrade: () => void;
  onActivateOwner?: (passkey: string) => boolean;
}

const VIETQR_BANK_BIN = (process.env.NEXT_PUBLIC_VIETQR_BANK_BIN || '').trim();
const VIETQR_BANK_NAME = (process.env.NEXT_PUBLIC_VIETQR_BANK_NAME || '').trim();
const VIETQR_ACCOUNT_NO = (process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '').trim();
const VIETQR_ACCOUNT_NAME = (process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || '').trim();
const VIETQR_TEMPLATE = (process.env.NEXT_PUBLIC_VIETQR_TEMPLATE || 'compact2').trim();

const IS_VIETQR_CONFIGURED = Boolean(
  VIETQR_BANK_BIN && VIETQR_BANK_NAME && VIETQR_ACCOUNT_NO && VIETQR_ACCOUNT_NAME
);

export const UpgradeVietQrModal: React.FC<UpgradeVietQrModalProps> = ({
  isOpen,
  onClose,
  onSuccessUpgrade,
  onActivateOwner,
}) => {
  const [billingCycle, setBillingCycle] = useState<PricingBillingCycle>('monthly');
  const [billingMode, setBillingMode] = useState<PricingBillingMode>('all_in_one');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[1]); // Default Pro Team
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
  const [orderCode, setOrderCode] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(900); // 15 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOwnerUnlock, setShowOwnerUnlock] = useState(false);
  const [ownerKeyInput, setOwnerKeyInput] = useState('');
  const [ownerKeyError, setOwnerKeyError] = useState<string | null>(null);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setCountdown(900);
      setIsVerifying(false);
      setShowOwnerUnlock(false);
      setOwnerKeyInput('');
      setOwnerKeyError(null);
      setOrderCode(`NVAI${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen]);

  // Countdown timer for VietQR order
  useEffect(() => {
    if (step !== 'payment' || !IS_VIETQR_CONFIGURED) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Format countdown mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate price based on selected cycle and mode
  const getPrice = (plan: PricingPlan) => {
    if (plan.id === 'desktop_pro') {
      return plan.priceMonthlyByok; // 1.890.000đ lifetime
    }
    if (billingCycle === 'monthly') {
      return billingMode === 'byok' ? plan.priceMonthlyByok : plan.priceMonthlyAllInOne;
    } else {
      return billingMode === 'byok' ? plan.priceYearlyByok : plan.priceYearlyAllInOne;
    }
  };
  const mapPlanToBackendTier = (plan: PricingPlan): string => {
    if (plan.id === 'desktop_pro') return 'desktop_pro';
    if (plan.id === 'starter') return billingMode === 'byok' ? 'starter_byok' : 'starter_credits';
    if (plan.id === 'pro') return billingMode === 'byok' ? 'pro_team_byok' : 'pro_team_credits';
    if (plan.id === 'business') return billingMode === 'byok' ? 'business_byok' : 'business_credits';
    return 'pro_team_byok';
  };

  const handleSelectPlanForPayment = async (plan: PricingPlan) => {
    setSelectedPlan(plan);
    const fallbackCode = `NVAI${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCode(fallbackCode);
    setStep('payment');

    try {
      const res = await fetch('/api/v1/billing/vietqr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: '00000000-0000-0000-0000-000000000001',
          planId: mapPlanToBackendTier(plan),
          billingCycle,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.order?.orderCode) {
          setOrderCode(data.order.orderCode);
        }
      }
    } catch {
      // Giữ fallback orderCode khi ngoại tuyến
    }
  };

  const handleCopy = (field: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Confirm VietQR or switch demo workspace to Cloud 24/7 preview
  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');
      onSuccessUpgrade();
    }, 1000);
  };

  const handleOwnerKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onActivateOwner) return;
    const ok = onActivateOwner(ownerKeyInput);
    if (!ok) {
      setOwnerKeyError('Mã kích hoạt không hợp lệ. Vui lòng kiểm tra lại.');
    } else {
      setOwnerKeyError(null);
      setOwnerKeyInput('');
    }
  };

  if (!isOpen) return null;

  const currentPrice = getPrice(selectedPlan);
  const formattedPriceVnd = new Intl.NumberFormat('vi-VN').format(currentPrice) + ' đ';

  // Only build VietQR Quick Image URL when all bank env vars are explicitly configured
  const vietQrUrl = IS_VIETQR_CONFIGURED
    ? `https://img.vietqr.io/image/${encodeURIComponent(VIETQR_BANK_BIN)}-${encodeURIComponent(VIETQR_ACCOUNT_NO)}-${encodeURIComponent(VIETQR_TEMPLATE)}.png?amount=${currentPrice}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(VIETQR_ACCOUNT_NAME)}`
    : null;

  const activationSummaryText = `Đăng ký ${BRANDING.name} | Gói: ${selectedPlan.name} (${selectedPlan.id === 'desktop_pro' ? 'Trọn đời 1 máy' : billingCycle === 'monthly' ? 'Hàng tháng' : 'Theo năm'}, ${billingMode === 'byok' ? 'Hạ tầng tiết kiệm' : 'Trọn gói sẵn AI'}) | Giá: ${formattedPriceVnd} | Mã đơn: ${orderCode}`;

  const mailtoActivationHref = `mailto:${BRANDING.contact.email}?subject=${encodeURIComponent(`[${BRANDING.name}] Yêu cầu mã QR kích hoạt gói ${selectedPlan.name} - ${orderCode}`)}&body=${encodeURIComponent(`Xin chào Admin,\n\nTôi muốn nhận mã QR kích hoạt gói dịch vụ sau:\n${activationSummaryText}\n\nXin cảm ơn!`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Zap size={18} className="fill-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-white">
                {step === 'payment'
                  ? IS_VIETQR_CONFIGURED
                    ? 'Thanh Toán VietQR Tự Động 24/7'
                    : 'Nhận Mã QR Kích Hoạt Từ Admin'
                  : step === 'success'
                  ? 'Kích Hoạt Thành Công!'
                  : 'Nâng Cấp Tổ Chức Nhân Viên AI'}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 'payment'
                  ? IS_VIETQR_CONFIGURED
                    ? 'Quét mã để kích hoạt hạ tầng Cloud 24/7 ngay lập tức'
                    : 'Liên hệ trực tiếp Admin để nhận mã QR thanh toán & kích hoạt đúng gói'
                  : 'Giải phóng sức lao động, vận hành chuỗi bot tự động 24/7'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ nâng cấp"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          {/* STEP 1: PLAN SELECTION & PRICING MATRIX */}
          {step === 'select' && (
            <div>
              {/* BILLING CONTROLS (Cycle & Engine Mode) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-8">
                {/* BILLING CYCLE TOGGLE (Monthly vs Yearly 20% off) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Kỳ hạn:</span>
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        billingCycle === 'monthly'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Hàng Tháng
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('yearly')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        billingCycle === 'yearly'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow'
                          : 'text-amber-400 hover:text-amber-300'
                      }`}
                    >
                      <span>Theo Năm</span>
                      <span className="text-[10px] bg-slate-950/80 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                        Tiết kiệm 20%
                      </span>
                    </button>
                  </div>
                </div>

                {/* AI ENGINE MODE TOGGLE (Standard vs All-in-One Credits) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Gói AI:</span>
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setBillingMode('byok')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        billingMode === 'byok'
                          ? 'bg-slate-700 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Hạ Tầng Tiết Kiệm
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingMode('all_in_one')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        billingMode === 'all_in_one'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-indigo-400 hover:text-indigo-300'
                      }`}
                    >
                      <Sparkles size={12} />
                      <span>Trọn Gói Sẵn AI (Không cần API)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 CLOUD TIERS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {PRICING_PLANS.slice(0, 3).map((plan) => {
                  const price = getPrice(plan);
                  const isHero = plan.isHero;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                        isHero
                          ? 'bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500 shadow-2xl shadow-indigo-950/80 ring-1 ring-indigo-500/50'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* HERO BADGE */}
                      {plan.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-black shadow-md uppercase tracking-wider">
                          {plan.badge}
                        </div>
                      )}

                      <div>
                        {/* TITLE & SUBTITLE */}
                        <h4 className="text-lg font-black text-white">{plan.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                          {plan.subtitle}
                        </p>

                        {/* PRICE DISPLAY */}
                        <div className="mt-5 pb-5 border-b border-slate-800">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl md:text-3xl font-black text-white tracking-tight">
                              {new Intl.NumberFormat('vi-VN').format(price)}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                              đ / {billingCycle === 'monthly' ? 'tháng' : 'năm'}
                            </span>
                          </div>
                          <div className="text-[11px] text-indigo-300 mt-1">
                            {billingMode === 'all_in_one' ? (
                              <span>Tặng sẵn {new Intl.NumberFormat('vi-VN').format(plan.monthlyCredits)} Credits/tháng</span>
                            ) : (
                              <span>Gói hạ tầng tiết kiệm, vận hành linh hoạt</span>
                            )}
                          </div>
                        </div>

                        {/* HIGHLIGHTED CAPACITY PILLS */}
                        <div className="my-4 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Số Bot kích hoạt:</span>
                            <span className="font-bold text-white">{plan.maxBots}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Phòng họp đa bot:</span>
                            <span className="font-semibold text-slate-200">{plan.maxRooms}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Lịch tự động 24/7:</span>
                            <span className="font-semibold text-slate-200">{plan.maxRoutines}</span>
                          </div>
                        </div>

                        {/* FEATURES LIST */}
                        <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA UPGRADE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleSelectPlanForPayment(plan)}
                        className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                          isHero
                            ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white hover:brightness-110 shadow-indigo-600/30 active:scale-[0.98]'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-[0.98]'
                        }`}
                      >
                        <Zap size={14} />
                        <span>Chọn Gói {plan.name}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP PRO LIFETIME LICENSE BANNER */}
              <div className="mt-8 p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-slate-800 text-slate-300 flex-shrink-0">
                    <Laptop size={22} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-white text-sm md:text-base">
                        Bản Quyền Cài Máy Vĩnh Viễn (Desktop Pro License)
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        1.890.000 đ / trọn đời 1 máy
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dành cho người không thích trả thuê bao định kỳ: Mở khóa toàn bộ bot trên máy tính cá nhân, lưu trữ dữ liệu 100% cục bộ và dùng trọn đời.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlanForPayment(PRICING_PLANS[3])}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition"
                >
                  Mua Bản Quyền Trọn Đời
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VIETQR (KHI ĐÃ CẤU HÌNH ENV) HOẶC HỘP HƯỚNG DẪN LIÊN HỆ ADMIN (KHI CHƯA CẤU HÌNH ENV) */}
          {step === 'payment' && (
            <div className="max-w-2xl mx-auto py-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
              >
                <ArrowLeft size={14} />
                <span>Quay lại chọn gói khác</span>
              </button>

              {IS_VIETQR_CONFIGURED && vietQrUrl ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* LEFT: VIETQR CODE IMAGE (ONLY WHEN ENV CONFIGURED) */}
                  <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-2xl text-slate-900 border border-slate-200">
                    <div className="text-center mb-3">
                      <div className="text-xs font-bold tracking-wider uppercase text-slate-500">
                        Mã Thanh Toán Tự Động
                      </div>
                      <div className="text-sm font-black text-indigo-900">
                        {VIETQR_BANK_NAME}
                      </div>
                    </div>

                    <div className="w-56 h-56 bg-slate-100 rounded-2xl p-2 flex items-center justify-center border border-slate-200 shadow-inner">
                      <Image
                        src={vietQrUrl}
                        alt={`VietQR ${VIETQR_BANK_NAME}`}
                        width={224}
                        height={224}
                        unoptimized
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>

                    <div className="mt-3 text-center">
                      <span className="text-[11px] text-slate-500 block">Mã đơn hàng:</span>
                      <strong className="text-sm font-mono text-indigo-700 tracking-wider">
                        {orderCode}
                      </strong>
                    </div>

                    <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Tự động kích hoạt sau 3–10 giây</span>
                    </div>
                  </div>

                  {/* RIGHT: ORDER SUMMARY & BANK DETAILS FROM ENV */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="text-xs text-slate-400 mb-1">Gói dịch vụ đã chọn:</div>
                      <div className="text-base font-black text-white flex items-center justify-between gap-2">
                        <span>{selectedPlan.name}</span>
                        <span className="text-amber-400">{formattedPriceVnd}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Kỳ hạn:{' '}
                        <strong>
                          {selectedPlan.id === 'desktop_pro'
                            ? 'Trọn đời 1 máy'
                            : billingCycle === 'monthly'
                            ? 'Hàng tháng'
                            : 'Theo năm'}
                        </strong>{' '}
                        • Hình thức: <strong>{billingMode === 'byok' ? 'Hạ tầng tiết kiệm' : 'Trọn gói sẵn AI'}</strong>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Chủ tài khoản:</span>
                          <strong className="text-white text-xs">{VIETQR_ACCOUNT_NAME}</strong>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{VIETQR_BANK_NAME}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Số tài khoản ({VIETQR_BANK_NAME}):</span>
                          <strong className="text-emerald-400 font-mono text-sm tracking-wider">
                            {VIETQR_ACCOUNT_NO}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('acc', VIETQR_ACCOUNT_NO)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                        >
                          {copiedField === 'acc' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          <span>{copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Nội dung chuyển khoản (bắt buộc):</span>
                          <strong className="text-amber-300 font-mono text-sm tracking-wider">
                            {orderCode}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('code', orderCode)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                        >
                          {copiedField === 'code' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          <span>{copiedField === 'code' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Mã thanh toán hết hạn sau:</span>
                        <span className="font-mono font-bold text-amber-400">{formatTime(countdown)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isVerifying}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs hover:brightness-110 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        {isVerifying ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                            <span>Đang kiểm tra giao dịch từ ngân hàng...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Tôi Đã Chuyển Khoản Thành Công</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* FALLBACK WHEN VIETQR ENV IS NOT CONFIGURED — NO FAKE QR IMAGE */
                <div className="rounded-3xl border border-indigo-500/30 bg-slate-950 p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                        <ShieldCheck size={13} />
                        Xác nhận kích hoạt chính chủ 1-1
                      </span>
                      <h4 className="mt-2.5 text-lg font-black text-white">
                        Liên hệ Admin để nhận mã QR kích hoạt chính thức
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        Để đảm bảo an toàn tài khoản ngân hàng và cấu hình đúng phòng ban AI cho doanh nghiệp của bạn, vui lòng gửi mã đơn dưới đây tới Zalo Admin hoặc Email chính thức để nhận mã QR thanh toán trực tiếp.
                      </p>
                    </div>
                  </div>

                  {/* ORDER SUMMARY */}
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400">Gói dịch vụ:</span>
                      <strong className="text-white">{selectedPlan.name}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400">Chi phí dự kiến:</span>
                      <strong className="text-amber-400 text-sm">{formattedPriceVnd}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400">Kỳ hạn &amp; Hình thức:</span>
                      <strong className="text-slate-200">
                        {selectedPlan.id === 'desktop_pro'
                          ? 'Trọn đời 1 máy'
                          : billingCycle === 'monthly'
                          ? 'Hàng tháng'
                          : 'Theo năm (-20%)'}{' '}
                        · {billingMode === 'byok' ? 'Hạ tầng tiết kiệm' : 'Trọn gói sẵn AI'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Mã đơn yêu cầu:</span>
                        <strong className="text-amber-300 font-mono text-sm tracking-wider">
                          {orderCode}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('summary', activationSummaryText)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        {copiedField === 'summary' ? (
                          <Check size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>{copiedField === 'summary' ? 'Đã chép nội dung đơn' : 'Sao chép thông tin đơn'}</span>
                      </button>
                    </div>
                  </div>

                  {/* DIRECT ADMIN CONTACT BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={BRANDING.contact.zaloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-xs font-black text-white shadow-lg shadow-indigo-600/25 transition"
                    >
                      <MessageCircle size={15} />
                      <span>Nhắn Zalo Admin: {BRANDING.contact.zalo}</span>
                      <ExternalLink size={12} />
                    </a>

                    <a
                      href={mailtoActivationHref}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-3 text-xs font-bold text-slate-100 transition"
                    >
                      <Mail size={15} className="text-emerald-400" />
                      <span>Gửi Email: {BRANDING.contact.email}</span>
                    </a>
                  </div>

                  {/* INTERACTIVE DEMO UNLOCK FOR TESTING UI */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Muốn trải nghiệm trước giao diện Cloud 24/7 trên bản demo này?
                    </span>
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isVerifying}
                      className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Sparkles size={13} />
                      <span>{isVerifying ? 'Đang mở chế độ demo...' : 'Mở thử chế độ Cloud 24/7 (Demo)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: ACTIVATION SUCCESS */}
          {step === 'success' && (
            <div className="max-w-md mx-auto py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl shadow-xl">
                ✓
              </div>

              <h4 className="text-xl font-black text-white">
                {IS_VIETQR_CONFIGURED
                  ? 'Chúc Mừng! Không Gian Của Bạn Đã Lên Cloud 24/7'
                  : 'Đã Bật Chế Độ Trải Nghiệm Cloud 24/7'}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {IS_VIETQR_CONFIGURED ? (
                  <>
                    Hệ thống đã nhận diện mã đơn <strong>{orderCode}</strong> và kích hoạt trọn gói{' '}
                    <strong>{selectedPlan.name}</strong>. Toàn bộ bot đã được mở khóa và sẵn sàng làm việc không giới hạn.
                  </>
                ) : (
                  <>
                    Bạn đang trải nghiệm chế độ demo gói <strong>{selectedPlan.name}</strong> (mã tham chiếu{' '}
                    <strong>{orderCode}</strong>). Để kích hoạt hạ tầng thực tế 24/7, hãy nhắn Zalo Admin{' '}
                    <strong>{BRANDING.contact.zalo}</strong> hoặc Email <strong>{BRANDING.contact.email}</strong>.
                  </>
                )}
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className="text-emerald-400 font-bold">Cloud 24/7 Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số Bot khả dụng:</span>
                  <span className="text-white font-bold">{selectedPlan.maxBots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lịch chạy ngầm:</span>
                  <span className="text-white font-bold">{selectedPlan.maxRoutines}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
              >
                Bắt Đầu Làm Việc Ngay
              </button>
            </div>
          )}
        </div>

        {/* MODAL FOOTER SUPPORT HOTLINE + DISCREET OWNER ACTIVATION */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 space-y-2.5 text-xs text-slate-400">
          {showOwnerUnlock && onActivateOwner && (
            <form
              onSubmit={handleOwnerKeySubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30"
            >
              <div className="flex items-center gap-2 flex-1">
                <KeyRound size={14} className="text-emerald-400 flex-shrink-0" />
                <input
                  type="password"
                  value={ownerKeyInput}
                  onChange={(e) => {
                    setOwnerKeyInput(e.target.value);
                    if (ownerKeyError) setOwnerKeyError(null);
                  }}
                  placeholder="Nhập mã Chủ ứng dụng / Bản quyền không giới hạn..."
                  className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition"
                >
                  Mở khóa toàn quyền
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOwnerUnlock(false);
                    setOwnerKeyError(null);
                  }}
                  className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                >
                  Đóng
                </button>
              </div>
              {ownerKeyError && (
                <p className="w-full sm:w-auto text-[11px] text-rose-400 font-medium">
                  {ownerKeyError}
                </p>
              )}
            </form>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Hỗ trợ kích hoạt &amp; bảo mật bởi {BRANDING.name}</span>
              </span>
              {onActivateOwner && !showOwnerUnlock && (
                <button
                  type="button"
                  onClick={() => setShowOwnerUnlock(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-300 transition underline-offset-2 hover:underline"
                >
                  <KeyRound size={11} />
                  <span>Mã Chủ ứng dụng</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <a
                href={BRANDING.contact.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-300 hover:text-white transition"
              >
                <PhoneCall size={12} className="text-emerald-400" />
                <span>Zalo: <strong>{BRANDING.contact.zalo}</strong></span>
                <ExternalLink size={11} className="text-slate-500" />
              </a>

              <a
                href={`mailto:${BRANDING.contact.email}`}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition"
              >
                <Mail size={12} className="text-blue-400" />
                <span>Email: <strong>{BRANDING.contact.email}</strong></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
