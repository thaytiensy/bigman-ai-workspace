'use client';

import React from 'react';
import {
  ArrowRight,
  Cpu,
  Edit3,
  Eye,
  Lock,
  MessageSquare,
  Plus,
  UserPlus,
  Zap,
} from 'lucide-react';
import { DUTY_META } from '@/lib/office3d/officeStore';
import type { HandoffLink, Office3DBot, OfficeDepartment } from '@/lib/office3d/types';

interface OfficeFloor2DProps {
  departments: OfficeDepartment[];
  bots: Office3DBot[];
  handoffs: HandoffLink[];
  onPeekBot: (botId: string) => void;
  onChatBot: (botId: string) => void;
  onEditBot: (botId: string) => void;
  onEditDept: (deptId: string) => void;
  onOpenNewDept: () => void;
  onOpenNewBot: () => void;
  onOpenUpgrade: () => void;
  onRunHandoff: () => void;
}

/**
 * Sơ đồ 2D Nhẹ Máy (Sprite / Floorplan Mode — tương đương chế độ Sprite trong Hermes Virtual Office):
 * Chạy mượt 0% GPU cho máy cấu hình thấp hoặc điện thoại, tự động giãn lưới theo số phòng ban không giới hạn.
 */
export const OfficeFloor2D: React.FC<OfficeFloor2DProps> = ({
  departments,
  bots,
  handoffs,
  onPeekBot,
  onChatBot,
  onEditBot,
  onEditDept,
  onOpenNewDept,
  onOpenNewBot,
  onOpenUpgrade,
  onRunHandoff,
}) => {
  const deptNameById = new Map(departments.map((d) => [d.id, d]));

  return (
    <div className="flex-1 overflow-y-auto bg-[#020914] p-4 space-y-4">
      {/* HEADER BANNER */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#04182a] via-[#062138] to-[#04182a] p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-cyan-300" />
            <h3 className="text-sm font-black text-white tracking-wide">
              Sơ Đồ Văn Phòng 2D Nhẹ Máy · Tiết Kiệm PIN & GPU
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              {departments.length} Phòng ban · {bots.length} Bot (Mở rộng không giới hạn)
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Bot ở trạng thái <strong>Rảnh (0 tok)</strong> tuyệt đối không gọi mô hình AI. Bấm vào từng nhân viên để soi màn hình trực tiếp hoặc nhắn tin 1-1.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRunHandoff}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Zap size={13} /> Chạy chuỗi A2A
          </button>
          <button
            type="button"
            onClick={onOpenNewDept}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Plus size={13} /> Phòng ban
          </button>
          <button
            type="button"
            onClick={onOpenNewBot}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition"
          >
            <UserPlus size={13} /> Tuyển Bot
          </button>
        </div>
      </div>

      {/* AUTO-EXPANDING DEPARTMENT ROOMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {departments.map((dept) => {
          const deptBots = bots.filter((b) => b.departmentId === dept.id);
          return (
            <div
              key={dept.id}
              className="rounded-2xl border bg-slate-900/80 p-3.5 flex flex-col gap-3 shadow-lg"
              style={{
                borderColor: `${dept.colorHex}55`,
                boxShadow: `0 0 24px ${dept.colorHex}12`,
              }}
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: dept.colorHex,
                        boxShadow: `0 0 10px ${dept.colorHex}`,
                      }}
                    />
                    <h4 className="text-sm font-bold text-white">{dept.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{dept.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onEditDept(dept.id)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition"
                  title="Chỉnh sửa / đổi màu phòng ban"
                >
                  <Edit3 size={13} />
                </button>
              </div>

              {deptBots.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-xl">
                  Phòng ban trống — hãy tuyển hoặc chuyển bot vào phòng này
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {deptBots.map((bot) => {
                    const dutyMeta = DUTY_META[bot.duty];
                    return (
                      <div
                        key={bot.id}
                        className={`rounded-xl border p-2.5 flex flex-col justify-between gap-2 transition ${
                          bot.isLocked
                            ? 'border-slate-800 bg-slate-950/60 opacity-75'
                            : 'border-slate-700/80 bg-slate-950/90 hover:border-cyan-400/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {bot.name}
                            </span>
                            {bot.isLocked ? (
                              <span className="text-[10px] text-amber-300 flex items-center gap-0.5">
                                <Lock size={10} /> Khóa
                              </span>
                            ) : (
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-bold border ${dutyMeta.badgeClass}`}
                              >
                                {dutyMeta.shortLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-semibold text-cyan-300 mt-0.5">
                            {bot.roleBadge}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {bot.currentTaskTitle || bot.roleTitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 pt-1 border-t border-slate-800/80">
                          {bot.isLocked ? (
                            <button
                              type="button"
                              onClick={onOpenUpgrade}
                              className="w-full py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold"
                            >
                              Mở khóa Cloud 24/7
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onPeekBot(bot.id)}
                                className="flex-1 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 text-[10px] font-semibold flex items-center justify-center gap-1"
                              >
                                <Eye size={11} /> Soi
                              </button>
                              <button
                                type="button"
                                onClick={() => onChatBot(bot.id)}
                                className="flex-1 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-[10px] font-semibold flex items-center justify-center gap-1"
                              >
                                <MessageSquare size={11} /> Chat
                              </button>
                              <button
                                type="button"
                                onClick={() => onEditBot(bot.id)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Sửa hồ sơ & phòng ban bot"
                              >
                                <Edit3 size={11} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* A2A INTER-DEPARTMENT HANDOFF FLOWS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-3.5">
        <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2.5">
          Luồng Bàn Giao A2A Liên Phòng Ban ({handoffs.length} tuyến)
        </h4>
        <div className="flex flex-wrap gap-2">
          {handoffs.map((h) => {
            const fromD = deptNameById.get(h.fromDeptId);
            const toD = deptNameById.get(h.toDeptId);
            return (
              <div
                key={h.id}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-200 flex items-center gap-1.5"
              >
                <span className="font-bold" style={{ color: fromD?.colorHex || '#00f5ff' }}>
                  {fromD?.shortLabel || h.fromDeptId}
                </span>
                <ArrowRight size={12} className="text-cyan-400" />
                <span className="font-bold" style={{ color: toD?.colorHex || '#34d399' }}>
                  {toD?.shortLabel || h.toDeptId}
                </span>
                <span className="text-slate-400">· {h.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
