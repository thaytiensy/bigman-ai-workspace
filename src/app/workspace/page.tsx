'use client';

import React, { useState } from 'react';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';
import { BotRosterGrid } from '@/components/workspace/BotRosterGrid';
import { MeetingRoomChat } from '@/components/workspace/MeetingRoomChat';
import { RoutinesPanel } from '@/components/workspace/RoutinesPanel';
import { UpgradeVietQrModal } from '@/components/workspace/UpgradeVietQrModal';
import { INITIAL_BOTS, INITIAL_ROUTINES } from '@/data/mockWorkspaceData';
import { Bot, RoutineItem, WorkspaceMode, WorkspaceTab } from '@/types/workspace';
import { BRANDING } from '@/config/branding';

export default function WorkspacePage() {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('desktop_free');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('roster');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [bots, setBots] = useState<Bot[]>(INITIAL_BOTS);
  const [routines, setRoutines] = useState<RoutineItem[]>(INITIAL_ROUTINES);
  const [preselectedBot, setPreselectedBot] = useState<Bot | null>(null);

  const activeBotsCount = bots.filter((b) => b.isActive).length;

  // Toggle Bot Active status with Desktop Free limit enforcement
  const handleToggleBotActive = (botId: string) => {
    const targetBot = bots.find((b) => b.id === botId);
    if (!targetBot) return;

    // If currently inactive and trying to activate
    if (!targetBot.isActive) {
      if (workspaceMode === 'desktop_free' && activeBotsCount >= BRANDING.system.desktopMaxFreeBots) {
        // Trigger Upgrade Modal to explain the Cloud unlocking
        setIsUpgradeModalOpen(true);
        return;
      }
    }

    setBots((prev) =>
      prev.map((b) => (b.id === botId ? { ...b, isActive: !b.isActive } : b))
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
    // Enable more bots on Cloud
    setBots((prev) =>
      prev.map((b, idx) => (idx < 6 ? { ...b, isActive: true } : b))
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
