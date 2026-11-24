'use client';

import React, { useMemo, useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Cloud,
  Crown,
  FolderOpen,
  Inbox,
  Laptop,
  Layers,
  Lock,
  LogOut,
  Mail,
  Menu,
  Moon,
  Pencil,
  PhoneCall,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Sun,
  Trash2,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { BRANDING } from '@/config/branding';
import { DUTY_META } from '@/lib/office3d/officeStore';
import type { OfficeDepartment } from '@/lib/office3d/types';
import type { WorkspaceOrgState } from '@/lib/office3d/useWorkspaceOrg';
import type { WorkspaceMode, WorkspaceTab, WorkspaceUiTheme } from '@/types/workspace';

interface WorkspaceShellProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  workspaceMode: WorkspaceMode;
  onToggleMode: (mode: WorkspaceMode) => void;
  isOwnerUnlimited?: boolean;
  onSignOutOwner?: () => void;
  uiTheme: WorkspaceUiTheme;
  onToggleTheme?: () => void;
  onOpenUpgradeModal: () => void;
  activeIndustryName?: string;
  onOpenIndustryModal?: () => void;
  org: WorkspaceOrgState;
  selectedBotId: string | null;
  onSelectBotFromSidebar: (botId: string) => void;
  onRequestAddDepartment: () => void;
  onRequestEditDepartment: (dept: OfficeDepartment) => void;
  onRequestDeleteDepartment: (deptId: string) => void;
  onRequestAddBot: (defaultDeptId?: string) => void;
  children: React.ReactNode;
}

export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({
  activeTab,
  onTabChange,
  workspaceMode,
  onToggleMode,
  isOwnerUnlimited = false,
  onSignOutOwner,
  uiTheme,
  onToggleTheme,
  onOpenUpgradeModal,
  activeIndustryName = 'TMĐT & Shop',
  onOpenIndustryModal,
  org,
  selectedBotId,
  onSelectBotFromSidebar,
  onRequestAddDepartment,
  onRequestEditDepartment,
  onRequestDeleteDepartment,
  onRequestAddBot,
  children,
}) => {
  const isLight = uiTheme === 'light';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [quickAddMenuOpen, setQuickAddMenuOpen] = useState(false);
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({});

  const toggleDeptCollapse = (deptId: string) => {
    setCollapsedDepts((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const filteredDepartments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return org.departments.map((dept) => {
      const deptBots = org.officeBots.filter((b) => b.departmentId === dept.id);
      if (!q) return { dept, bots: deptBots };
      const deptMatches = dept.name.toLowerCase().includes(q);
      const matchingBots = deptMatches
        ? deptBots
        : deptBots.filter(
            (b) =>
              b.name.toLowerCase().includes(q) ||
              b.roleBadge.toLowerCase().includes(q) ||
              b.roleTitle.toLowerCase().includes(q)
          );
      return { dept, bots: matchingBots };
    });
  }, [org.departments, org.officeBots, searchQuery]);

  const toolItems: Array<{
    id: WorkspaceTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [
    { id: 'deliverables', label: 'Xưởng Việc Thật', icon: Sparkles },
    { id: 'routines', label: 'Tự động hóa', icon: Zap },
    { id: 'roster', label: 'Sơ đồ team', icon: Users },
    { id: 'office3d', label: 'Văn phòng 3D', icon: Building2 },
    { id: 'apps', label: 'Ứng dụng đã xuất bản', icon: Rocket },
    { id: 'files', label: 'Tệp của nhóm', icon: FolderOpen },
  ];

  const activeCount = org.officeBots.filter((b) => b.isActive).length;
  const isOwnerFullActive = isOwnerUnlimited && workspaceMode === 'cloud_247';

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] flex flex-col md:flex-row antialiased selection:bg-cyan-500 selection:text-slate-950 transition-colors ${
        isLight ? 'bg-[#f4f6f9] text-slate-900' : 'bg-[#020914] text-slate-100'
      }`}
    >
      {/* MOBILE TOP BAR */}
      <header
        className={`md:hidden flex items-center justify-between px-4 py-2.5 border-b sticky top-16 z-30 backdrop-blur-md ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900'
            : 'bg-slate-900/95 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 rounded-lg ${
              isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-200'
            }`}
            aria-label="Mở thanh điều hướng"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="font-extrabold text-sm tracking-tight">{BRANDING.name}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onTabChange('deliverables')}
            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold"
          >
            Việc Thật
          </button>
          {onOpenIndustryModal && (
            <button
              type="button"
              onClick={onOpenIndustryModal}
              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500 text-white font-bold"
            >
              8 Ngành
            </button>
          )}
          <button
            type="button"
            onClick={() => onRequestAddBot()}
            className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold"
          >
            + Bot
          </button>
          {isOwnerFullActive ? (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-700 dark:text-emerald-300 font-bold inline-flex items-center gap-1">
              <Crown size={12} className="text-amber-500" />
              Chủ App
            </span>
          ) : isOwnerUnlimited ? (
            <button
              type="button"
              onClick={() => onToggleMode('cloud_247')}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold"
            >
              Toàn Quyền
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold"
            >
              24/7
            </button>
          )}
        </div>
      </header>

      {/* LEFT SIDEBAR — SLEEK APP LAYOUT */}
      <aside
        className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] z-30 w-72 flex-shrink-0 flex flex-col border-r transition-transform duration-200 ${
          isLight
            ? 'bg-[#f8fafc] border-slate-200/90 text-slate-800'
            : 'bg-gradient-to-b from-[#061126] via-[#040d1d] to-[#020814] border-cyan-500/15 text-slate-100'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* TOP MODE SELECTOR + QUICK ADD */}
        <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-2 relative">
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setModeMenuOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isOwnerFullActive
                  ? isLight
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100 shadow-xs'
                    : 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/25'
                  : isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                {isOwnerFullActive ? (
                  <Crown size={14} className="text-amber-500 flex-shrink-0" />
                ) : workspaceMode === 'cloud_247' ? (
                  <Cloud size={14} className="text-cyan-500 flex-shrink-0" />
                ) : (
                  <Laptop size={14} className="text-amber-500 flex-shrink-0" />
                )}
                <span className="truncate">
                  {isOwnerFullActive
                    ? 'Chủ App · Toàn Quyền'
                    : isOwnerUnlimited
                      ? 'Xem thử: Bản Cài Máy'
                      : workspaceMode === 'cloud_247'
                        ? 'Bản Cloud 24/7'
                        : 'Bản Cài Máy'}
                </span>
              </span>
              <ChevronDown size={13} className="opacity-60 flex-shrink-0" />
            </button>

            {modeMenuOpen && (
              <div
                className={`absolute left-0 right-0 top-full mt-1.5 p-1.5 rounded-xl border shadow-xl z-40 space-y-1 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onToggleMode('cloud_247');
                    setModeMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start gap-2 transition ${
                    workspaceMode === 'cloud_247'
                      ? isLight
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'bg-emerald-500/15 text-emerald-300 font-bold'
                      : isLight
                        ? 'hover:bg-slate-100'
                        : 'hover:bg-slate-800'
                  }`}
                >
                  {isOwnerUnlimited ? (
                    <Crown size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  ) : (
                    <Cloud size={14} className="mt-0.5 flex-shrink-0 text-cyan-500" />
                  )}
                  <div>
                    <div>
                      {isOwnerUnlimited ? 'Chủ App · Toàn Quyền (Không giới hạn)' : 'Bản Cloud 24/7'}
                    </div>
                    <div className="text-[10px] opacity-70 font-normal">
                      Mở toàn bộ bot, phòng ban & lịch chạy 24/7 không giới hạn
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleMode('desktop_free');
                    setModeMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start gap-2 transition ${
                    workspaceMode === 'desktop_free'
                      ? isLight
                        ? 'bg-amber-50 text-amber-800 font-bold'
                        : 'bg-amber-500/15 text-amber-300 font-bold'
                      : isLight
                        ? 'hover:bg-slate-100'
                        : 'hover:bg-slate-800'
                  }`}
                >
                  <Laptop size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <div>
                    <div>
                      {isOwnerUnlimited ? 'Xem thử góc nhìn khách (Bản Cài Máy)' : 'Bản Cài Máy (Miễn phí)'}
                    </div>
                    <div className="text-[10px] opacity-70 font-normal">
                      Khóa trần {BRANDING.system.desktopMaxFreeBots} bot chạy song song
                    </div>
                  </div>
                </button>
                {isOwnerUnlimited && onSignOutOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setModeMenuOpen(false);
                      onSignOutOwner();
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-[11px] flex items-center gap-2 border-t mt-1 pt-2 transition ${
                      isLight
                        ? 'border-slate-200 text-rose-600 hover:bg-rose-50'
                        : 'border-slate-800 text-rose-300 hover:bg-rose-500/10'
                    }`}
                  >
                    <LogOut size={12} className="flex-shrink-0" />
                    <span>Thoát quyền Chủ App trên máy này</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isLight ? 'Chuyển sang giao diện Tối Hologram' : 'Chuyển sang giao diện Sáng'}
              title={isLight ? 'Chuyển giao diện Tối' : 'Chuyển giao diện Sáng'}
              className={`min-w-[30px] min-h-[30px] flex items-center justify-center rounded-xl border transition ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900/90 border-cyan-500/25 text-cyan-300 hover:bg-slate-800'
              }`}
            >
              {isLight ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickAddMenuOpen((v) => !v)}
              aria-label="Thêm phòng ban, tuyển bot hoặc đổi mẫu ngành"
              title="Thêm phòng ban, tuyển bot hoặc đổi mẫu ngành"
              className={`min-w-[30px] min-h-[30px] flex items-center justify-center rounded-xl border transition ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Plus size={16} />
            </button>

            {quickAddMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-1.5 w-56 p-1.5 rounded-xl border shadow-xl z-40 space-y-1 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              >
                {onOpenIndustryModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickAddMenuOpen(false);
                      onOpenIndustryModal();
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    }`}
                  >
                    <Layers size={14} className="text-indigo-500" /> Đổi mẫu ngành nghề (8 mẫu)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddMenuOpen(false);
                    onRequestAddDepartment();
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                  }`}
                >
                  <Building2 size={14} className="text-cyan-500" /> + Thêm phòng ban mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddMenuOpen(false);
                    onRequestAddBot();
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                  }`}
                >
                  <Plus size={14} className="text-emerald-500" /> + Tuyển nhân viên AI
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 1-CLICK INDUSTRY TEMPLATE SWITCHER BUTTON */}
        {onOpenIndustryModal && (
          <div className="px-3 pb-2">
            <button
              type="button"
              onClick={() => {
                onOpenIndustryModal();
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                isLight
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                  : 'bg-indigo-500/15 border-indigo-400/35 text-indigo-200 hover:bg-indigo-500/25'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <Layers size={13} className={isLight ? 'text-indigo-600 flex-shrink-0' : 'text-indigo-300 flex-shrink-0'} />
                <span className="truncate">Ngành: {activeIndustryName}</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 font-semibold flex-shrink-0">
                8 mẫu
              </span>
            </button>
          </div>
        )}

        {/* HƯỚNG 1: XƯỞNG VIỆC THẬT (KHÔNG CẦN API KEY) */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => {
              onTabChange('deliverables');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
              activeTab === 'deliverables'
                ? 'bg-emerald-700 border-emerald-600 text-white shadow-sm'
                : isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25'
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Sparkles size={13} className="flex-shrink-0" />
              <span className="truncate">Xưởng Việc Thật</span>
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                activeTab === 'deliverables'
                  ? 'bg-white/20 text-white'
                  : isLight
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-emerald-500/25 text-emerald-200'
              }`}
            >
              Không API
            </span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="px-3 pb-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 focus-within:border-cyan-500'
                : 'bg-slate-900/90 border-slate-800 text-slate-200 focus-within:border-cyan-500'
            }`}
          >
            <Search size={13} aria-hidden="true" className={isLight ? 'text-slate-500 flex-shrink-0' : 'text-slate-400 flex-shrink-0'} />
            <input
              id="workspace-sidebar-search"
              name="workspaceSidebarSearch"
              aria-label="Tìm kiếm bot, phòng ban"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bot, phòng ban..."
              className={`w-full bg-transparent outline-none text-xs ${
                isLight ? 'text-slate-900 placeholder:text-slate-500' : 'text-slate-100 placeholder:text-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="opacity-50 hover:opacity-100"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* SCROLLABLE BODY: HỘP THƯ + PHÒNG BAN/BOT TREE + CÔNG CỤ */}
        <div className="flex-1 overflow-y-auto px-2.5 space-y-3 pb-3">
          {/* HỘP THƯ */}
          <button
            type="button"
            onClick={() => {
              onTabChange('inbox');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'inbox'
                ? isLight
                  ? 'bg-slate-200/80 text-slate-950'
                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : isLight
                  ? 'text-slate-700 hover:bg-slate-200/50'
                  : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Inbox size={15} className={activeTab === 'inbox' ? (isLight ? 'text-cyan-700' : 'text-cyan-300') : (isLight ? 'text-slate-600' : 'text-slate-300')} />
              <span>Hộp thư</span>
            </span>
            {org.unreadInboxCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                {org.unreadInboxCount}
              </span>
            )}
          </button>

          {/* COLLAPSIBLE DEPARTMENTS & BOTS TREE */}
          <div className="space-y-1.5">
            <div className="px-2 flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Phòng ban & Bot ({activeCount}/{org.officeBots.length})
              </span>
              <button
                type="button"
                onClick={onRequestAddDepartment}
                className={`text-[11px] font-semibold hover:underline flex items-center gap-0.5 ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}
                title="Thêm phòng ban không giới hạn"
              >
                <Plus size={11} /> Phòng
              </button>
            </div>

            {filteredDepartments.map(({ dept, bots: deptBots }) => {
              const isCollapsed = Boolean(collapsedDepts[dept.id]);
              return (
                <div key={dept.id} className="space-y-0.5">
                  {/* Department Row */}
                  <div
                    className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold transition ${
                      isLight ? 'hover:bg-slate-200/60 text-slate-700' : 'hover:bg-slate-900 text-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDeptCollapse(dept.id)}
                      className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
                    >
                      {isCollapsed ? (
                        <ChevronRight size={13} className="opacity-50 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={13} className="opacity-50 flex-shrink-0" />
                      )}
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: dept.colorHex }}
                      />
                      <span className="truncate">{dept.shortLabel}</span>
                      <span className={`text-[10px] font-normal ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>({deptBots.length})</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onRequestEditDepartment(dept)}
                        aria-label={`Sửa ${dept.shortLabel}`}
                        title="Sửa phòng ban"
                        className={`min-w-[26px] min-h-[26px] flex items-center justify-center p-1.5 rounded-md transition ${
                          isLight
                            ? 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Pencil size={12} />
                      </button>
                      {org.departments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRequestDeleteDepartment(dept.id)}
                          aria-label={`Xóa ${dept.shortLabel}`}
                          title="Xóa phòng ban"
                          className={`min-w-[26px] min-h-[26px] flex items-center justify-center p-1.5 rounded-md transition ${
                            isLight
                              ? 'text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                              : 'text-slate-300 hover:bg-rose-500/20 hover:text-rose-300'
                          }`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bots inside Department */}
                  {!isCollapsed && (
                    <div className="pl-2 space-y-0.5">
                      {deptBots.map((bot) => {
                        const isSelected = selectedBotId === bot.id && activeTab === 'office3d';
                        const dutyMeta = DUTY_META[bot.duty];
                        const isWorking = !bot.isLocked && bot.isActive && bot.duty !== 'idle';
                        return (
                          <button
                            key={bot.id}
                            type="button"
                            onClick={() => {
                              onSelectBotFromSidebar(bot.id);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl transition flex items-start gap-2.5 ${
                              isSelected
                                ? isLight
                                  ? 'bg-white shadow-sm border border-cyan-400/70 text-slate-900'
                                  : 'bg-cyan-500/15 border border-cyan-500/40 text-white'
                                : isLight
                                  ? 'hover:bg-slate-200/60 text-slate-700 border border-transparent'
                                  : 'hover:bg-slate-900/90 text-slate-200 border border-transparent'
                            }`}
                          >
                            {/* Bot Avatar Bubble + Status Dot */}
                            <div className="relative flex-shrink-0 mt-0.5">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border ${
                                  bot.isLocked
                                    ? isLight
                                      ? 'bg-slate-200 border-slate-300 text-slate-500'
                                      : 'bg-slate-800 border-slate-700 text-slate-400'
                                    : isLight
                                      ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                                      : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
                                }`}
                              >
                                {bot.name.slice(0, 1).toUpperCase()}
                              </div>
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                                  isLight ? 'border-[#f7f7f8]' : 'border-[#040d1a]'
                                }`}
                                style={{
                                  backgroundColor: bot.isLocked ? '#94a3b8' : dutyMeta.colorHex,
                                }}
                              />
                            </div>

                            {/* Bot Name + Role + Live Activity */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold truncate flex items-center gap-1">
                                  {bot.name}
                                  {bot.isLead && <span className="text-[10px]">👑</span>}
                                </span>
                                {bot.isLocked ? (
                                  <Lock size={10} className="text-amber-500 flex-shrink-0" />
                                ) : (
                                  <span
                                    className="text-[10px] font-semibold flex-shrink-0"
                                    style={{
                                      color: isWorking
                                        ? isLight
                                          ? '#047857'
                                          : '#34d399'
                                        : isLight
                                          ? '#475569'
                                          : '#cbd5e1',
                                    }}
                                  >
                                    {isWorking ? dutyMeta.shortLabel : '0 tok'}
                                  </span>
                                )}
                              </div>
                              <div className={`text-[10px] truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                {bot.roleBadge} · {bot.roleTitle}
                              </div>
                              {isWorking && bot.currentTaskTitle && (
                                <div className={`mt-1 flex items-center gap-1 text-[10px] font-medium truncate ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                  <span className="truncate">{bot.currentTaskTitle}</span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {/* Inline "+ Thêm bot" right inside each department */}
                      <button
                        type="button"
                        onClick={() => onRequestAddBot(dept.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition ${
                          isLight
                            ? 'text-slate-600 hover:text-cyan-800 hover:bg-slate-200/50'
                            : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
                        }`}
                      >
                        <Plus size={12} /> Thêm bot
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={onRequestAddDepartment}
              className={`w-full mt-1 px-3 py-1.5 rounded-xl border border-dashed text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                isLight
                  ? 'border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-cyan-700 bg-white/70'
                  : 'border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-300 bg-slate-900/50'
              }`}
            >
              <Plus size={12} /> Thêm phòng ban mới (Không giới hạn)
            </button>
          </div>

          {/* SECTION: CÔNG CỤ (5 items) */}
          <div className={`pt-1 border-t ${isLight ? 'border-slate-200/80' : 'border-slate-800/80'}`}>
            <button
              type="button"
              onClick={() => setToolsExpanded((v) => !v)}
              className={`w-full px-2 py-1.5 flex items-center justify-between text-[11px] font-bold transition ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}
            >
              <span>Công cụ</span>
              {toolsExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>

            {toolsExpanded && (
              <div className="space-y-0.5 mt-0.5">
                {toolItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onTabChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? isLight
                            ? 'bg-slate-200/85 text-slate-950 font-bold'
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : isLight
                            ? 'text-slate-700 hover:bg-slate-200/50'
                            : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon
                          size={15}
                          className={
                            isActive
                              ? isLight
                                ? 'text-blue-600'
                                : 'text-cyan-300'
                              : 'opacity-65'
                          }
                        />
                        <span>{item.label}</span>
                      </span>
                      {item.id === 'deliverables' && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          0 API
                        </span>
                      )}
                      {item.id === 'office3d' && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/20 text-cyan-300'}`}>
                          3D
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM WORKSPACE FOOTER (Profile + Upgrade/Owner + Official Contact) */}
        <div
          className={`p-3 border-t space-y-2 ${
            isLight
              ? 'border-slate-200 bg-white/80'
              : 'border-slate-800 bg-[#020813]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isOwnerFullActive ? (
              <button
                type="button"
                onClick={() => setModeMenuOpen((v) => !v)}
                title="Đang mở Quyền Chủ Ứng Dụng không giới hạn"
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-extrabold border flex items-center justify-center gap-1 transition ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/25'
                }`}
              >
                <Crown size={12} className="text-amber-500" />
                <span>Toàn Quyền ∞</span>
              </button>
            ) : isOwnerUnlimited ? (
              <button
                type="button"
                onClick={() => onToggleMode('cloud_247')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] flex items-center justify-center gap-1 transition"
              >
                <Crown size={12} />
                <span>Về Toàn Quyền</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-[11px] flex items-center justify-center gap-1 hover:brightness-105 transition"
              >
                <Zap size={12} />
                <span>Gói 24/7</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">
                AI
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{BRANDING.name}</div>
                <div className={`text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {isOwnerFullActive ? 'Chủ sở hữu · Không giới hạn' : 'v2.7 · Cloud & Desktop'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <a
                href={BRANDING.contact.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Zalo Hỗ trợ ${BRANDING.contact.zalo}`}
                title={`Zalo Hỗ trợ: ${BRANDING.contact.zalo}`}
                className={`min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg transition ${
                  isLight ? 'hover:bg-slate-100 text-emerald-700' : 'hover:bg-slate-800 text-emerald-300'
                }`}
              >
                <PhoneCall size={13} />
              </a>
              <a
                href={`mailto:${BRANDING.contact.email}`}
                aria-label={`Gửi email hỗ trợ ${BRANDING.contact.email}`}
                title={`Email: ${BRANDING.contact.email}`}
                className={`min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg transition ${
                  isLight ? 'hover:bg-slate-100 text-blue-700' : 'hover:bg-slate-800 text-sky-300'
                }`}
              >
                <Mail size={13} />
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-20 md:hidden"
        />
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] overflow-hidden">
        {children}
      </main>
    </div>
  );
};
