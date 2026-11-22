'use client';

import React from 'react';
import {
  Box,
  Users,
  MessageSquareCode,
  CalendarClock,
  Sparkles,
  Zap,
  Laptop,
  Cloud,
  ExternalLink,
  LifeBuoy,
  PhoneCall,
  Mail,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';
import { BRANDING } from '@/config/branding';
import { WorkspaceMode, WorkspaceTab } from '@/types/workspace';

interface WorkspaceShellProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  workspaceMode: WorkspaceMode;
  onToggleMode: (mode: WorkspaceMode) => void;
  onOpenUpgradeModal: () => void;
  activeBotsCount: number;
  totalBotsCount: number;
  children: React.ReactNode;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  activeTab,
  onTabChange,
  workspaceMode,
  onToggleMode,
  onOpenUpgradeModal,
  activeBotsCount,
  totalBotsCount,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigationItems = [
    {
      id: 'office3d' as WorkspaceTab,
      label: 'Văn Phòng 3D Hologram',
      icon: Box,
      badge: '3D Live',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40',
      desc: 'Bàn họp tròn & chia phòng ban 3D',
    },
    {
      id: 'roster' as WorkspaceTab,
      label: 'Đội Ngũ Nhân Viên AI',
      icon: Users,
      badge: `${activeBotsCount}/${totalBotsCount}`,
      desc: 'Quản lý trạng thái & phân bổ bot',
    },
    {
      id: 'room' as WorkspaceTab,
      label: 'Phòng Họp Chiến Lược',
      icon: MessageSquareCode,
      badge: 'Đa Bot',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      desc: 'Thảo luận & giao việc chéo',
    },
    {
      id: 'routines' as WorkspaceTab,
      label: 'Lịch Tự Động Hóa 24/7',
      icon: CalendarClock,
      badge: workspaceMode === 'cloud_247' ? 'Cloud On' : 'Cài máy',
      badgeColor:
        workspaceMode === 'cloud_247'
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      desc: 'Lịch chạy sáng, trưa & đêm',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* MOBILE TOP BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 sticky top-16 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30 text-sm">
            AI
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight">{BRANDING.name}</h1>
            <p className="text-[10px] text-slate-400">Hệ điều hành AI đa bot</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpgradeModal}
            className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-semibold shadow-sm hover:brightness-110 active:scale-95 transition"
          >
            Nâng cấp
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] z-30 w-72 md:w-80 flex-shrink-0 flex flex-col justify-between bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* BRAND & WORKSPACE HEADER */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-black text-white text-base shadow-xl shadow-indigo-600/30">
              AI
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-100 tracking-tight text-base truncate">
                  {BRANDING.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {BRANDING.tagline}
              </p>
            </div>
          </div>

          {/* MODE TOGGLE SWITCHER (Desktop Free vs Cloud 24/7) */}
          <div className="mt-4 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleMode('desktop_free')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                workspaceMode === 'desktop_free'
                  ? 'bg-slate-800 text-amber-300 shadow border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop size={13} />
              <span>Bản Cài Máy</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleMode('cloud_247')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                workspaceMode === 'cloud_247'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud size={13} />
              <span>Bản Cloud 24/7</span>
            </button>
          </div>

          {/* MODE EXPLANATION PILL */}
          <div className="mt-2.5 px-3 py-2 rounded-lg bg-slate-950/50 border border-slate-800/60 text-[11px] text-slate-300 flex items-start gap-2">
            {workspaceMode === 'desktop_free' ? (
              <>
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Giới hạn 2 Bot:</span> Dữ liệu lưu tại máy. Tắt máy tính là bot dừng hoạt động.
                </div>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-indigo-300">Cloud 24/7 Không Giới Hạn:</span> Tắt máy tính bot vẫn cào dữ liệu, chốt đơn & báo cáo.
                </div>
              </>
            )}
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Không Gian Làm Việc
          </div>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-white border border-indigo-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm leading-tight">{item.label}</div>
                    <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}

          {/* INFRASTRUCTURE STATUS CARD */}
          <div className="pt-4 px-2">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/90 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {workspaceMode === 'cloud_247' ? 'Cloud Cluster Online' : 'Local Daemon Online'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-medium">32ms</span>
              </div>

              {/* AI CREDITS METER */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Hạn mức AI Credits:</span>
                  <span className="font-semibold text-indigo-300">7.45M / 10M</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all"
                    style={{ width: '74.5%' }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500">
                  <span>Mô hình: DeepSeek-V3 + Claude</span>
                  <span>Đã dùng 74%</span>
                </div>
              </div>

              {/* QUICK UPGRADE BUTTON */}
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-[0.98] transition"
              >
                <Zap size={14} className="fill-slate-950" />
                <span>Nâng Cấp Gói 24/7 (VietQR)</span>
              </button>
            </div>
          </div>
        </nav>

        {/* FOOTER: CONTACT & SUPPORT */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <LifeBuoy size={14} className="text-indigo-400" /> Hỗ Trợ 1-1 Chính Thức
            </span>
            <span className="text-[10px] text-slate-500 font-mono">v2.5</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <a
              href={BRANDING.contact.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <span className="flex items-center gap-1.5">
                <PhoneCall size={12} className="text-emerald-400" />
                Zalo Hỗ Trợ: <strong className="text-slate-100">{BRANDING.contact.zalo}</strong>
              </span>
              <ExternalLink size={11} className="text-slate-500" />
            </a>

            <a
              href={`mailto:${BRANDING.contact.email}`}
              className="flex items-center justify-between p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <span className="flex items-center gap-1.5">
                <Mail size={12} className="text-blue-400" />
                Email: <strong className="text-slate-100">{BRANDING.contact.email}</strong>
              </span>
              <ExternalLink size={11} className="text-slate-500" />
            </a>
          </div>
        </div>
      </aside>

      {/* BACKDROP OVERLAY FOR MOBILE */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 md:hidden"
        />
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
};
