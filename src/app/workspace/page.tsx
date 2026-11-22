'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { BotRosterGrid } from '@/components/workspace/BotRosterGrid';
import { MeetingRoomChat } from '@/components/workspace/MeetingRoomChat';
import { RoutinesPanel } from '@/components/workspace/RoutinesPanel';
import { UpgradeVietQrModal } from '@/components/workspace/UpgradeVietQrModal';
import { INITIAL_BOTS, INITIAL_ROUTINES } from '@/data/mockWorkspaceData';
import { Bot, RoutineItem, WorkspaceMode, WorkspaceTab } from '@/types/workspace';
import { BRANDING } from '@/config/branding';

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
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('desktop_free');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('office3d');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [bots, setBots] = useState<Bot[]>(INITIAL_BOTS);
  const [routines, setRoutines] = useState<RoutineItem[]>(INITIAL_ROUTINES);
  const [preselectedBot, setPreselectedBot] = useState<Bot | null>(null);

  const activeBotsCount = bots.filter((b) => b.isActive).length;

  // Toggle Bot Active status with Desktop Free limit enforcement
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

  // Recruit new AI bot directly from 3D Office
  const handleAddBot = (newBot: Bot) => {
    setBots((prev) => [...prev, newBot]);
  };

  // Update bot department dynamically from 3D Office
  const handleUpdateBotDepartment = (botId: string, deptName: Bot['department']) => {
    setBots((prev) =>
      prev.map((b) => (b.id === botId ? { ...b, department: deptName } : b))
    );
  };

  // Toggle Routine On/Off
  const handleToggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  // Handle switching to Meeting Room with preselected bot
  const handleSelectBotForChat = (bot: Bot) => {
    setPreselectedBot(bot);
    setActiveTab('room');
  };

  // When upgrading to Cloud is successful
  const handleSuccessUpgrade = () => {
    setWorkspaceMode('cloud_247');
    setBots((prev) =>
      prev.map((b, idx) => (idx < 8 ? { ...b, isActive: true } : b))
    );
  };

  return (
    <WorkspaceShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      workspaceMode={workspaceMode}
      onToggleMode={setWorkspaceMode}
      onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
      activeBotsCount={activeBotsCount}
      totalBotsCount={bots.length}
    >
      {activeTab === 'office3d' && (
        <HologramOffice3D
          bots={bots}
          workspaceMode={workspaceMode}
          onToggleBotActive={handleToggleBotActive}
          onAddBot={handleAddBot}
          onUpdateBotDepartment={handleUpdateBotDepartment}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
          onSelectBotForChat={handleSelectBotForChat}
        />
      )}

      {activeTab === 'roster' && (
        <BotRosterGrid
          bots={bots}
          workspaceMode={workspaceMode}
          onToggleBotActive={handleToggleBotActive}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
          onSelectBotForChat={handleSelectBotForChat}
        />
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

      {/* 1-TOUCH UPGRADE MODAL */}
      <UpgradeVietQrModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccessUpgrade={handleSuccessUpgrade}
      />
    </WorkspaceShell>
  );
}
