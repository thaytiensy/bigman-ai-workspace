'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Crown, Plus, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { BotRosterGrid } from '@/components/workspace/BotRosterGrid';
import { MeetingRoomChat } from '@/components/workspace/MeetingRoomChat';
import { RoutinesPanel } from '@/components/workspace/RoutinesPanel';
import { UpgradeVietQrModal } from '@/components/workspace/UpgradeVietQrModal';
import { IndustryTemplateModal } from '@/components/workspace/IndustryTemplateModal';
import { RealDeliverablesStudio } from '@/components/workspace/RealDeliverablesStudio';
import {
  EditBotModal,
  EditDepartmentModal,
} from '@/components/workspace/OfficeModals';
import {
  OfficeInboxView,
  OfficePublishedAppsView,
  OfficeTeamFilesView,
} from '@/components/workspace/OfficeExtraViews';
import { OfficeKanbanBoard } from '@/components/workspace/OfficeKanbanBoard';
import {
  NEON_COLORS,
  ORG_STORAGE_KEY,
  useWorkspaceOrg,
} from '@/lib/office3d/useWorkspaceOrg';
import type {
  AvatarStyle,
  HologramScreenKind,
  Office3DBot,
  OfficeDepartment,
} from '@/lib/office3d/types';
import {
  buildWorkspaceFromIndustryTemplate,
  DEFAULT_INDUSTRY_ID,
  getIndustryTemplateById,
  type IndustryTemplate,
} from '@/data/industryTemplates';
import { INITIAL_BOTS, INITIAL_ROUTINES } from '@/data/mockWorkspaceData';
import type {
  Bot,
  RoutineItem,
  WorkspaceMode,
  WorkspaceTab,
  WorkspaceUiTheme,
} from '@/types/workspace';
import { BRANDING } from '@/config/branding';
import {
  clearOwnerAccess,
  resolveOwnerAccessFromUrl,
  saveOwnerAccess,
} from '@/lib/ownerAccess';

const HologramOffice3D = dynamic(
  () => import('@/components/workspace/HologramOffice3D').then((m) => m.HologramOffice3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#020914] text-cyan-300 gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold tracking-wide">
          Đang khởi tạo Văn Phòng 3D Hologram...
        </p>
      </div>
    ),
  }
);

export default function WorkspacePage() {
  const [isOwnerUnlimited, setIsOwnerUnlimited] = useState(false);
  const [ownerToast, setOwnerToast] = useState<string | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('desktop_free');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('office3d');
  const [uiTheme, setUiTheme] = useState<WorkspaceUiTheme>('dark');
  const [rosterSubView, setRosterSubView] = useState<'grid' | 'kanban'>('grid');

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isIndustryModalOpen, setIsIndustryModalOpen] = useState(false);

  const [bots, setBots] = useState<Bot[]>(INITIAL_BOTS);
  const [routines, setRoutines] = useState<RoutineItem[]>(INITIAL_ROUTINES);
  const [preselectedBot, setPreselectedBot] = useState<Bot | null>(null);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);

  // Global Unlimited Department & Bot Modals
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptColor, setNewDeptColor] = useState(NEON_COLORS[0]);
  const [editingDept, setEditingDept] = useState<OfficeDepartment | null>(null);

  const [showAddBotModal, setShowAddBotModal] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotRoleBadge, setNewBotRoleBadge] = useState('AI Specialist');
  const [newBotRoleTitle, setNewBotRoleTitle] = useState('');
  const [newBotDeptId, setNewBotDeptId] = useState('');
  const [newBotScreen, setNewBotScreen] = useState<HologramScreenKind>('marketer');
  const [newBotAvatarStyle, setNewBotAvatarStyle] = useState<AvatarStyle>('female');
  const [newBotModel, setNewBotModel] = useState('Claude 3.7 Sonnet');
  const [editingBot, setEditingBot] = useState<Office3DBot | null>(null);

  useEffect(() => {
    // 1. Check creator / owner unlimited access (URL param or persistent localStorage)
    const { isOwner, justActivated } = resolveOwnerAccessFromUrl();
    const initialMode: WorkspaceMode = isOwner ? 'cloud_247' : 'desktop_free';
    if (isOwner) {
      setIsOwnerUnlimited(true);
      setWorkspaceMode('cloud_247');
      if (justActivated) {
        setOwnerToast(
          'Đã kích hoạt Quyền Chủ Ứng Dụng — Mở khóa toàn bộ không giới hạn và đã lưu vĩnh viễn trên trình duyệt này.'
        );
      }
    }

    // 1b. Restore saved UI theme (defaults to dark hologram theme)
    try {
      const savedTheme = window.localStorage.getItem('tochuc_ai_ui_theme_v1');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setUiTheme(savedTheme);
      }
    } catch {
      // Ignore storage errors
    }

    // 2. Restore tab from query params
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (
        tabParam === 'deliverables' ||
        tabParam === 'files' ||
        tabParam === 'inbox' ||
        tabParam === 'roster' ||
        tabParam === 'routines' ||
        tabParam === 'apps' ||
        tabParam === 'room'
      ) {
        setActiveTab(tabParam);
      }
    } catch {
      // Ignore invalid search params
    }

    // 3. Restore industry template bots/routines with the resolved mode
    let restoredCustomIndustry = false;
    try {
      const raw = window.localStorage.getItem(ORG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { activeIndustryId?: string };
        if (parsed.activeIndustryId && parsed.activeIndustryId !== DEFAULT_INDUSTRY_ID) {
          const tpl = getIndustryTemplateById(parsed.activeIndustryId);
          const built = buildWorkspaceFromIndustryTemplate(tpl, initialMode);
          setBots(built.bots);
          setRoutines(built.routines);
          restoredCustomIndustry = true;
        }
      }
    } catch {
      // Ignore invalid localStorage
    }

    if (isOwner && !restoredCustomIndustry) {
      setBots((prev) => prev.map((b) => ({ ...b, isActive: true })));
    }
  }, []);

  useEffect(() => {
    if (!ownerToast) return;
    const timer = window.setTimeout(() => setOwnerToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [ownerToast]);

  const handleToggleUiTheme = () => {
    setUiTheme((prev) => {
      const next: WorkspaceUiTheme = prev === 'light' ? 'dark' : 'light';
      try {
        window.localStorage.setItem('tochuc_ai_ui_theme_v1', next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const activeBotsCount = bots.filter((b) => b.isActive).length;

  const handleToggleMode = (mode: WorkspaceMode) => {
    setWorkspaceMode(mode);
    if (mode === 'cloud_247') {
      setBots((prev) => prev.map((b) => ({ ...b, isActive: true })));
    } else {
      setBots((prev) =>
        prev.map((b, idx) => ({
          ...b,
          isActive: idx < BRANDING.system.desktopMaxFreeBots,
        }))
      );
    }
  };

  const handleActivateOwner = (passkey: string): boolean => {
    if (!saveOwnerAccess(passkey)) return false;
    setIsOwnerUnlimited(true);
    setWorkspaceMode('cloud_247');
    setBots((prev) => prev.map((b) => ({ ...b, isActive: true })));
    setIsUpgradeModalOpen(false);
    setOwnerToast(
      'Đã mở Quyền Chủ Ứng Dụng — Toàn bộ bot, phòng ban & lịch Cloud 24/7 đã được mở không giới hạn.'
    );
    return true;
  };

  const handleSignOutOwner = () => {
    clearOwnerAccess();
    setIsOwnerUnlimited(false);
    setWorkspaceMode('desktop_free');
    setBots((prev) =>
      prev.map((b, idx) => ({
        ...b,
        isActive: idx < BRANDING.system.desktopMaxFreeBots,
      }))
    );
    setOwnerToast('Đã thoát Quyền Chủ Ứng Dụng trên trình duyệt này (quay về giao diện khách).');
  };

  const handleToggleBotActive = (botId: string) => {
    const targetBot = bots.find((b) => b.id === botId);
    if (!targetBot) return;

    if (!targetBot.isActive) {
      if (
        workspaceMode === 'desktop_free' &&
        activeBotsCount >= BRANDING.system.desktopMaxFreeBots
      ) {
        setIsUpgradeModalOpen(true);
        return;
      }
    }

    setBots((prev) =>
      prev.map((b) => (b.id === botId ? { ...b, isActive: !b.isActive } : b))
    );
  };

  const handleAddBot = (newBot: Bot) => {
    setBots((prev) => [...prev, newBot]);
  };

  const handleUpdateBot = (botId: string, patch: Partial<Bot>) => {
    setBots((prev) => prev.map((b) => (b.id === botId ? { ...b, ...patch } : b)));
  };

  const handleRemoveBot = (botId: string) => {
    setBots((prev) => prev.filter((b) => b.id !== botId));
    if (selectedBotId === botId) setSelectedBotId(null);
  };

  const handleUpdateBotDepartment = (botId: string, deptName: Bot['department']) => {
    setBots((prev) =>
      prev.map((b) => (b.id === botId ? { ...b, department: deptName } : b))
    );
  };

  const org = useWorkspaceOrg({
    bots,
    workspaceMode,
    byokConfigured: true,
    onAddBot: handleAddBot,
    onUpdateBot: handleUpdateBot,
    onRemoveBot: handleRemoveBot,
    onUpdateBotDepartment: handleUpdateBotDepartment,
  });

  const activeIndustryTemplate = getIndustryTemplateById(org.activeIndustryId);

  const handleApplyIndustryTemplate = (template: IndustryTemplate) => {
    const built = buildWorkspaceFromIndustryTemplate(template, workspaceMode);
    setBots(built.bots);
    setRoutines(built.routines);
    setSelectedBotId(null);
    org.applyIndustryOrg({
      template,
      departments: built.departments,
      bots: built.bots,
      botDeptMap: built.botDeptMap,
      handoffs: built.handoffs,
    });
    setActiveTab('office3d');
  };

  const handleToggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const handleSelectBotForChat = (bot: Bot) => {
    setPreselectedBot(bot);
    setActiveTab('room');
  };

  const handleSuccessUpgrade = () => {
    setWorkspaceMode('cloud_247');
    setBots((prev) => prev.map((b) => ({ ...b, isActive: true })));
  };

  const handleOpenAddBotModal = (defaultDeptId?: string) => {
    setNewBotDeptId(defaultDeptId || org.departments[0]?.id || 'dept-exec');
    setShowAddBotModal(true);
  };

  const handleCreateDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    org.addDepartment({
      name: newDeptName,
      description: newDeptDesc,
      colorHex: newDeptColor,
    });
    setNewDeptName('');
    setNewDeptDesc('');
    setShowAddDeptModal(false);
  };

  const handleCreateBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;
    const created = org.addBotToDepartment({
      name: newBotName,
      roleBadge: newBotRoleBadge,
      roleTitle: newBotRoleTitle,
      departmentId: newBotDeptId || org.departments[0]?.id || 'dept-exec',
      screenKind: newBotScreen,
      avatarStyle: newBotAvatarStyle,
      model: newBotModel,
    });
    setSelectedBotId(created.id);
    setNewBotName('');
    setNewBotRoleTitle('');
    setShowAddBotModal(false);
  };

  return (
    <WorkspaceShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      workspaceMode={workspaceMode}
      onToggleMode={handleToggleMode}
      isOwnerUnlimited={isOwnerUnlimited}
      onSignOutOwner={handleSignOutOwner}
      uiTheme={uiTheme}
      onToggleTheme={handleToggleUiTheme}
      onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
      activeIndustryName={activeIndustryTemplate.shortName}
      onOpenIndustryModal={() => setIsIndustryModalOpen(true)}
      org={org}
      selectedBotId={selectedBotId}
      onSelectBotFromSidebar={(botId) => {
        setSelectedBotId(botId);
        setActiveTab('office3d');
      }}
      onRequestAddDepartment={() => setShowAddDeptModal(true)}
      onRequestEditDepartment={(dept) => setEditingDept(dept)}
      onRequestDeleteDepartment={(deptId) => org.deleteDepartment(deptId)}
      onRequestAddBot={handleOpenAddBotModal}
    >
      {ownerToast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-2xl bg-slate-900/95 border border-emerald-400/50 text-emerald-100 px-4 py-3 shadow-2xl backdrop-blur-md flex items-start gap-3 text-xs">
          <Crown size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed flex-1">{ownerToast}</div>
          <button
            type="button"
            onClick={() => setOwnerToast(null)}
            aria-label="Đóng thông báo"
            className="text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {activeTab === 'office3d' && (
        <HologramOffice3D
          bots={bots}
          org={org}
          workspaceMode={workspaceMode}
          uiTheme={uiTheme}
          onToggleUiTheme={handleToggleUiTheme}
          activeIndustryName={activeIndustryTemplate.shortName}
          sampleCommands={activeIndustryTemplate.sampleCommands}
          onOpenIndustryModal={() => setIsIndustryModalOpen(true)}
          onOpenDeliverables={() => setActiveTab('deliverables')}
          selectedBotId={selectedBotId}
          onSelectBotId={setSelectedBotId}
          onToggleBotActive={handleToggleBotActive}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
          onSelectBotForChat={handleSelectBotForChat}
          onRequestAddDepartment={() => setShowAddDeptModal(true)}
          onRequestAddBot={handleOpenAddBotModal}
          onRequestEditBot={(bot) => setEditingBot(bot)}
        />
      )}

      {activeTab === 'deliverables' && (
        <RealDeliverablesStudio
          uiTheme={uiTheme}
          onRecordFile={org.recordGeneratedFile}
          onOpenTeamFiles={() => setActiveTab('files')}
        />
      )}

      {activeTab === 'inbox' && (
        <OfficeInboxView
          org={org}
          uiTheme={uiTheme}
          onFocusBotIn3D={(botId) => {
            setSelectedBotId(botId);
            setActiveTab('office3d');
          }}
        />
      )}

      {activeTab === 'roster' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setRosterSubView('grid')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  rosterSubView === 'grid'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Đội Ngũ & Phòng Ban ({bots.length})
              </button>
              <button
                type="button"
                onClick={() => setRosterSubView('kanban')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  rosterSubView === 'kanban'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Kanban QA & Phê duyệt ({org.tasks.length})
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsIndustryModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-semibold flex items-center gap-1"
              >
                Ngành: {activeIndustryTemplate.shortName}
              </button>
              <button
                type="button"
                onClick={() => setShowAddDeptModal(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-1"
              >
                <Plus size={13} /> Phòng ban
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddBotModal()}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Tuyển Bot
              </button>
            </div>
          </div>

          {rosterSubView === 'grid' ? (
            <BotRosterGrid
              bots={bots}
              workspaceMode={workspaceMode}
              onToggleBotActive={handleToggleBotActive}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              onSelectBotForChat={handleSelectBotForChat}
            />
          ) : (
            <OfficeKanbanBoard
              tasks={org.tasks}
              approvals={org.approvals}
              bots={org.officeBots}
              departments={org.departments}
              onCreateTask={org.createKanbanTask}
              onMoveTask={org.moveKanbanTask}
              onAddEvidence={org.addTaskEvidence}
              onVerifyTask={org.verifyKanbanTask}
              onDecideApproval={org.decideApproval}
              onPeekBot={(botId) => {
                setSelectedBotId(botId);
                setActiveTab('office3d');
              }}
            />
          )}
        </div>
      )}

      {activeTab === 'room' && (
        <MeetingRoomChat
          bots={bots}
          preselectedBot={preselectedBot}
          onClearPreselectedBot={() => setPreselectedBot(null)}
        />
      )}

      {activeTab === 'routines' && (
        <RoutinesPanel
          routines={routines}
          workspaceMode={workspaceMode}
          onToggleRoutine={handleToggleRoutine}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        />
      )}

      {activeTab === 'apps' && (
        <OfficePublishedAppsView
          org={org}
          uiTheme={uiTheme}
          onAfterDeploy={() => setActiveTab('office3d')}
        />
      )}

      {activeTab === 'files' && (
        <OfficeTeamFilesView org={org} uiTheme={uiTheme} />
      )}

      {/* ─── GLOBAL UNLIMITED DEPARTMENT & BOT CRUD MODALS ─────────────────── */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDepartmentSubmit}
            className="w-full max-w-md rounded-2xl bg-[#041224] border border-cyan-500/40 p-5 space-y-4 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">
                Tạo Phòng Ban AI Mới (Không giới hạn)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDeptModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên phòng ban</label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="VD: Phòng Pháp Chế, Phòng Livestream, Phòng R&D..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chức năng chính</label>
                <textarea
                  rows={2}
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  placeholder="Mô tả nhiệm vụ & đầu việc bàn giao của phòng ban..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Màu nhận diện Hologram
                </label>
                <div className="flex items-center gap-2">
                  {NEON_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setNewDeptColor(hex)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        newDeptColor === hex ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDeptModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold"
              >
                Tạo phòng ban
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddBotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBotSubmit}
            className="w-full max-w-md rounded-2xl bg-[#041224] border border-cyan-500/40 p-5 space-y-4 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">
                Tuyển Nhân Viên AI Hologram Mới (Không giới hạn)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBotModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tên nhân viên AI</label>
                  <input
                    type="text"
                    required
                    value={newBotName}
                    onChange={(e) => setNewBotName(e.target.value)}
                    placeholder="VD: An, Bình, Chi, Dũng..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nhãn thẻ 3D</label>
                  <input
                    type="text"
                    value={newBotRoleBadge}
                    onChange={(e) => setNewBotRoleBadge(e.target.value)}
                    placeholder="AI Marketer / AI Analyst"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chức danh chuyên môn</label>
                <input
                  type="text"
                  value={newBotRoleTitle}
                  onChange={(e) => setNewBotRoleTitle(e.target.value)}
                  placeholder="VD: Chuyên gia Tài chính & Kiểm soát biên lợi nhuận"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gán vào Phòng ban</label>
                <select
                  value={newBotDeptId}
                  onChange={(e) => setNewBotDeptId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                >
                  {org.departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dáng Hologram</label>
                  <select
                    value={newBotAvatarStyle}
                    onChange={(e) => setNewBotAvatarStyle(e.target.value as AvatarStyle)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none"
                  >
                    <option value="female">Nữ (AI Marketer / Support)</option>
                    <option value="male">Nam (AI Manager / Engineer)</option>
                    <option value="android">Android Tối giản</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Màn hình HUD</label>
                  <select
                    value={newBotScreen}
                    onChange={(e) => setNewBotScreen(e.target.value as HologramScreenKind)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none"
                  >
                    <option value="marketer">Chiến dịch & Biểu đồ</option>
                    <option value="manager">Điều hành & KPI</option>
                    <option value="researcher">Nghiên cứu & Dữ liệu</option>
                    <option value="support">CSKH & Kênh chat</option>
                    <option value="commerce">Doanh số & Đơn hàng</option>
                    <option value="code">Kỹ thuật & Mã nguồn</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mô hình AI mặc định</label>
                <input
                  type="text"
                  value={newBotModel}
                  onChange={(e) => setNewBotModel(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBotModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold"
              >
                Đưa vào Văn phòng 3D
              </button>
            </div>
          </form>
        </div>
      )}

      {editingDept && (
        <EditDepartmentModal
          department={editingDept}
          canDelete={org.departments.length > 1}
          onClose={() => setEditingDept(null)}
          onSave={(updated) =>
            org.updateDepartment(updated.id, {
              name: updated.name,
              description: updated.description,
              colorHex: updated.colorHex,
            })
          }
          onDelete={org.deleteDepartment}
        />
      )}

      {editingBot && (
        <EditBotModal
          bot={editingBot}
          departments={org.departments}
          onClose={() => setEditingBot(null)}
          onSave={(patch) =>
            org.editBotFull(patch.botId, {
              name: patch.name,
              roleBadge: patch.roleBadge,
              roleTitle: patch.roleTitle,
              departmentId: patch.departmentId,
              screenKind: patch.screenKind,
              avatarStyle: patch.avatarStyle,
              model: patch.model,
            })
          }
          onRemoveBot={editingBot.id.startsWith('bot-custom-') ? org.removeBot : undefined}
        />
      )}

      <IndustryTemplateModal
        isOpen={isIndustryModalOpen}
        activeIndustryId={org.activeIndustryId}
        workspaceMode={workspaceMode}
        onClose={() => setIsIndustryModalOpen(false)}
        onApplyTemplate={handleApplyIndustryTemplate}
      />

      <UpgradeVietQrModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccessUpgrade={handleSuccessUpgrade}
        onActivateOwner={handleActivateOwner}
      />

    </WorkspaceShell>
  );
}
