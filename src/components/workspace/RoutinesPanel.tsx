'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Play,
  CheckCircle2,
  Cloud,
  Laptop,
} from 'lucide-react';
import { RoutineItem, WorkspaceMode } from '@/types/workspace';

interface RoutinesPanelProps {
  routines: RoutineItem[];
  workspaceMode: WorkspaceMode;
  onToggleRoutine: (id: string) => void;
  onOpenUpgradeModal: () => void;
}

export const RoutinesPanel: React.FC<RoutinesPanelProps> = ({
  routines,
  workspaceMode,
  onToggleRoutine,
  onOpenUpgradeModal,
}) => {
  const [filterTime, setFilterTime] = useState<'all' | 'morning' | 'night' | 'hourly'>('all');
  const [runningId, setRunningId] = useState<string | null>(null);

  const filteredRoutines = routines.filter((r) => {
    if (filterTime === 'all') return true;
    return r.timeOfDay === filterTime;
  });

  const handleRunNow = (id: string) => {
    setRunningId(id);
    setTimeout(() => {
      setRunningId(null);
    }, 1800);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Lịch Tự Động Hóa 24/7 (Routines)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {routines.filter((r) => r.isEnabled).length}/{routines.length} Đang kích hoạt
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Thiết lập lịch bot tự động quét số liệu, gửi báo cáo và canh đơn theo khung giờ vàng sáng - trưa - đêm.
          </p>
        </div>

        {/* TIME OF DAY FILTER BUTTONS */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setFilterTime('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterTime === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({routines.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTime('morning')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterTime === 'morning'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun size={13} />
            <span>Sáng sớm</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTime('night')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterTime === 'night'
                ? 'bg-indigo-900 text-indigo-200 border border-indigo-700/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon size={13} />
            <span>Đêm muộn</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC MODE ALERT BANNER */}
      <div className="my-6">
        {workspaceMode === 'desktop_free' ? (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                <Laptop size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm md:text-base text-amber-200">
                    Cảnh Báo Vận Hành Trên Bản Cài Máy:
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                    Tắt máy là bot dừng
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Lịch tự động hiện tại chỉ kích hoạt khi máy tính của bạn đang mở và không ở chế độ Ngủ (Sleep). Khi tắt máy tính, bot sẽ không thể quét đơn đêm hay đối soát doanh thu đúng giờ.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <Cloud size={16} />
              <span>Kích Hoạt Chạy Ngầm 24/7 Trên Cloud</span>
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5">
                <Cloud size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm md:text-base text-indigo-200">
                    Hạ Tầng Cloud 24/7/365 Đang Hoạt Động Hoàn Hảo
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                    Cloud Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Toàn bộ lịch trình tự động được đồng bộ và vận hành bởi cụm máy chủ đám mây độc lập. Dù bạn tắt máy tính hay đi công tác, bot vẫn quét đơn, rà soát NRR và báo cáo đúng giờ vào Zalo.
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-xs font-mono text-emerald-400 font-bold block">
                Cluster: Hanoi-Cloud-01
              </span>
              <span className="text-[11px] text-slate-400">Độ khả dụng SLA: 99.98%</span>
            </div>
          </div>
        )}
      </div>

      {/* ROUTINES LIST */}
      <div className="space-y-3.5 pb-8">
        {filteredRoutines.map((routine) => {
          const isMorning = routine.timeOfDay === 'morning';
          const isNight = routine.timeOfDay === 'night';
          const isRunning = runningId === routine.id;

          return (
            <div
              key={routine.id}
              className={`p-4 md:p-5 rounded-2xl border transition-all ${
                routine.isEnabled
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
                  : 'bg-slate-950 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* LEFT: TIME BADGE, BOT AVATAR, TITLE */}
                <div className="flex items-start gap-3.5">
                  {/* TIME BADGE */}
                  <div
                    className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-mono font-bold flex-shrink-0 border ${
                      isMorning
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : isNight
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {isMorning ? <Sun size={16} /> : <Moon size={16} />}
                    <span className="text-xs mt-0.5">{routine.cronExpression.split(' ')[1]}:{routine.cronExpression.split(' ')[0].padStart(2, '0')}</span>
                  </div>

                  {/* DETAILS */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm md:text-base text-white">
                        {routine.title}
                      </h3>
                      {routine.runOnCloud && workspaceMode === 'cloud_247' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                          <Cloud size={10} /> Cloud 24/7
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700 flex items-center gap-1">
                          <Laptop size={10} /> Chạy trên máy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-indigo-300 font-medium">
                        <span>{routine.botAvatar}</span>
                        <span>{routine.botName}</span>
                      </span>
                      <span>•</span>
                      <span>{routine.timeLabel}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">{routine.cronExpression}</span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
                      {routine.description}
                    </p>

                    {/* LAST RUN STATUS */}
                    <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span>{routine.lastRunText}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: RUN NOW & TOGGLE SWITCH */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleRunNow(routine.id)}
                    disabled={isRunning || !routine.isEnabled}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isRunning
                        ? 'bg-indigo-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    <Play size={12} className={isRunning ? 'animate-spin' : ''} />
                    <span>{isRunning ? 'Đang chạy...' : 'Chạy thử'}</span>
                  </button>

                  {/* TOGGLE SWITCH */}
                  <button
                    type="button"
                    onClick={() => onToggleRoutine(routine.id)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      routine.isEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        routine.isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
