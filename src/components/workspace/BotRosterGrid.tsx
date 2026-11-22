'use client';

import React, { useState } from 'react';
import {
  Lock,
  Sparkles,
  ArrowRight,
  Bot as BotIcon,
  MessageSquare,
  Cpu,
} from 'lucide-react';
import { Bot, BotDepartment, WorkspaceMode } from '@/types/workspace';
import { BRANDING } from '@/config/branding';

interface BotRosterGridProps {
  bots: Bot[];
  workspaceMode: WorkspaceMode;
  onToggleBotActive: (botId: string) => void;
  onOpenUpgradeModal: () => void;
  onSelectBotForChat: (bot: Bot) => void;
}

export const BotRosterGrid: React.FC<BotRosterGridProps> = ({
  bots,
  workspaceMode,
  onToggleBotActive,
  onOpenUpgradeModal,
  onSelectBotForChat,
}) => {
  const [selectedDept, setSelectedDept] = useState<BotDepartment>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const departments: BotDepartment[] = [
    'Tất cả',
    'Shop TMĐT & TikTok',
    'Marketing & SEO',
    'Lập Trình & QA',
    'Vận Hành & CSKH',
  ];

  const activeBots = bots.filter((b) => b.isActive);
  const activeCount = activeBots.length;
  const isDesktopLimitReached = workspaceMode === 'desktop_free' && activeCount >= BRANDING.system.desktopMaxFreeBots;

  const filteredBots = bots.filter((bot) => {
    const matchesDept = selectedDept === 'Tất cả' || bot.department === selectedDept;
    const matchesSearch =
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Đội Ngũ Nhân Viên AI
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activeCount}/{bots.length} Đang kích hoạt
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Phân công chuyên môn hóa theo từng phòng ban, tự động phối hợp và xử lý tác vụ liên tục.
          </p>
        </div>

        {/* WORKSPACE STATUS BADGE & UPGRADE ACTION */}
        <div className="flex items-center gap-3">
          {workspaceMode === 'desktop_free' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Bản Cài Máy: Khóa trần {BRANDING.system.desktopMaxFreeBots} Bot</span>
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="ml-1 text-slate-950 font-bold bg-amber-400 hover:bg-amber-300 px-2 py-0.5 rounded-md transition"
              >
                Mở khóa 24/7
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Bản Cloud 24/7: Toàn Quyền 16+ Bot</span>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH & DEPARTMENT FILTER CHIPS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-5">
        {/* DEPARTMENT TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* SEARCH INPUT */}
        <div className="relative min-w-[200px] sm:w-64">
          <input
            type="text"
            placeholder="Tìm bot theo tên, kỹ năng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* DESKTOP FREE WARNING BANNER (When 2 bots active) */}
      {isDesktopLimitReached && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Bạn đã kích hoạt tối đa {BRANDING.system.desktopMaxFreeBots} Bot của Bản Cài Máy
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Các Bot còn lại hiện đang tạm khóa để bảo vệ tài nguyên RAM/CPU máy tính cá nhân. Nâng cấp lên Cloud để chạy đồng thời 5–16+ Bot làm việc nhóm 24/7.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-md hover:brightness-110 transition active:scale-95"
          >
            <Sparkles size={14} className="fill-slate-950" />
            <span>Mở Khóa 5–10+ Bot Trên Cloud</span>
          </button>
        </div>
      )}

      {/* BOT GRID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
        {filteredBots.map((bot) => {
          // Rule: If in desktop_free, and bot is NOT active, and activeCount >= 2 -> bot is locked!
          const isLocked = workspaceMode === 'desktop_free' && !bot.isActive && isDesktopLimitReached;

          return (
            <div
              key={bot.id}
              className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                isLocked
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-80 backdrop-blur-sm'
                  : bot.isActive
                  ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-950/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* TOP ROW: AVATAR, NAME, DEPT, TOGGLE */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                      {bot.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white tracking-tight">
                          {bot.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400">
                          @{bot.codeName}
                        </span>
                      </div>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bot.badgeColor}`}
                      >
                        {bot.department}
                      </span>
                    </div>
                  </div>

                  {/* ACTIVE TOGGLE BUTTON */}
                  <div>
                    {isLocked ? (
                      <div
                        title="Đã chạm trần 2 Bot bản Cài Máy"
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      >
                        <Lock size={16} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleBotActive(bot.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          bot.isActive
                            ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        {bot.isActive ? 'Đang Bật' : 'Kích hoạt'}
                      </button>
                    )}
                  </div>
                </div>

                {/* ROLE TITLE */}
                <div className="mt-3 text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <BotIcon size={13} className="text-indigo-400" />
                  <span>{bot.roleTitle}</span>
                </div>

                {/* DESCRIPTION */}
                <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {bot.description}
                </p>

                {/* SKILLS TAGS */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {bot.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* BOTTOM META & ACTION */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Cpu size={12} className="text-slate-500" />
                  <span className="font-mono truncate max-w-[130px]">{bot.model}</span>
                </div>

                {isLocked ? (
                  <button
                    type="button"
                    onClick={onOpenUpgradeModal}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    <span>Mở khóa Cloud</span>
                    <ArrowRight size={12} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectBotForChat(bot)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <MessageSquare size={12} />
                    <span>Họp cùng @{bot.codeName}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
