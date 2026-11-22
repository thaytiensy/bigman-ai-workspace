'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Camera,
  GitBranch,
  Lock,
  MessageSquare,
  Play,
  Plus,
  RotateCw,
  Send,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  createHologramOfficeScene,
  type HologramOfficeController,
} from '@/lib/office3d/scene';
import type {
  CameraPreset,
  HandoffLink,
  HologramScreenKind,
  Office3DBot,
  OfficeDepartment,
} from '@/lib/office3d/types';
import { BRANDING } from '@/config/branding';
import type { Bot, WorkspaceMode } from '@/types/workspace';

interface HologramOffice3DProps {
  bots: Bot[];
  workspaceMode: WorkspaceMode;
  onToggleBotActive: (botId: string) => void;
  onAddBot: (bot: Bot) => void;
  onUpdateBotDepartment: (botId: string, deptName: Bot['department']) => void;
  onOpenUpgradeModal: () => void;
  onSelectBotForChat: (bot: Bot) => void;
}

const STORAGE_KEY = 'tochuc_nvai_office3d_org_v1';

const DEFAULT_DEPARTMENTS: OfficeDepartment[] = [
  {
    id: 'dept-exec',
    name: 'Ban Điều Hành Tổng',
    shortLabel: 'Điều hành',
    colorHex: '#00f5ff',
    description: 'Giám sát trạng thái, phân bổ việc chéo và tổng hợp báo cáo toàn hệ thống.',
  },
  {
    id: 'dept-growth',
    name: 'Phòng Tăng Trưởng & Marketing',
    shortLabel: 'Marketing & SEO',
    colorHex: '#38bdf8',
    description: 'SEO Top Google, SEO sàn TMĐT, kịch bản video ngắn và chuốt nội dung tự nhiên.',
  },
  {
    id: 'dept-commerce',
    name: 'Phòng Kinh Doanh & CSKH',
    shortLabel: 'Shop & CSKH',
    colorHex: '#34d399',
    description: 'Vận hành TikTok Shop, nghiên cứu KOC Affiliate, tư vấn chốt đơn và chăm sóc 24/7.',
  },
  {
    id: 'dept-tech',
    name: 'Phòng Kỹ Thuật & Sản Phẩm',
    shortLabel: 'Kỹ thuật & QA',
    colorHex: '#818cf8',
    description: 'Kiến trúc hệ thống, phát triển ứng dụng Web/Desktop và kiểm thử an toàn.',
  },
];

const DEFAULT_HANDOFFS: HandoffLink[] = [
  {
    id: 'hf-1',
    fromDeptId: 'dept-commerce',
    toDeptId: 'dept-growth',
    label: 'Dữ liệu thị trường & KOC → SEO / Content',
  },
  {
    id: 'hf-2',
    fromDeptId: 'dept-growth',
    toDeptId: 'dept-tech',
    label: 'Landing & Bài Pillar → Đẩy Web / App',
  },
  {
    id: 'hf-3',
    fromDeptId: 'dept-tech',
    toDeptId: 'dept-commerce',
    label: 'Bản phát hành mới → Chốt đơn & CSKH',
  },
  {
    id: 'hf-4',
    fromDeptId: 'dept-commerce',
    toDeptId: 'dept-exec',
    label: 'Báo cáo GMV & SLA → Ban Điều Hành',
  },
];

const NEON_COLORS = ['#00f5ff', '#38bdf8', '#34d399', '#818cf8', '#f472b6', '#fbbf24'];

function inferDefaultDepartmentId(bot: Bot): string {
  if (bot.codeName === 'orbit') return 'dept-exec';
  if (bot.department === 'Marketing & SEO') return 'dept-growth';
  if (bot.department === 'Shop TMĐT & TikTok' || bot.department === 'Vận Hành & CSKH') {
    return 'dept-commerce';
  }
  return 'dept-tech';
}

function inferRoleBadge(bot: Bot): { badge: string; screen: HologramScreenKind } {
  const cn = bot.codeName.toLowerCase();
  if (cn.includes('orbit')) return { badge: 'AI Manager', screen: 'manager' };
  if (cn.includes('listing') || cn.includes('echo')) return { badge: 'AI Marketer', screen: 'marketer' };
  if (cn.includes('wren')) return { badge: 'AI Researcher', screen: 'researcher' };
  if (cn.includes('sale') || cn.includes('cskh')) return { badge: 'AI Customer Support', screen: 'support' };
  if (cn.includes('sunny')) return { badge: 'AI Commerce', screen: 'commerce' };
  return { badge: 'AI Engineer', screen: 'code' };
}

function mapDeptIdToBotDepartment(deptId: string): Bot['department'] {
  if (deptId === 'dept-growth') return 'Marketing & SEO';
  if (deptId === 'dept-tech') return 'Lập Trình & QA';
  if (deptId === 'dept-exec') return 'Vận Hành & CSKH';
  return 'Shop TMĐT & TikTok';
}

interface SavedOrgConfig {
  departments: OfficeDepartment[];
  botDeptMap: Record<string, string>;
  handoffs: HandoffLink[];
}

export const HologramOffice3D: React.FC<HologramOffice3DProps> = ({
  bots,
  workspaceMode,
  onToggleBotActive,
  onAddBot,
  onUpdateBotDepartment,
  onOpenUpgradeModal,
  onSelectBotForChat,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HologramOfficeController | null>(null);

  const [webglError, setWebglError] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('hero');
  const [autoRotate, setAutoRotate] = useState(false);

  const [departments, setDepartments] = useState<OfficeDepartment[]>(DEFAULT_DEPARTMENTS);
  const [botDeptMap, setBotDeptMap] = useState<Record<string, string>>({});
  const [handoffs, setHandoffs] = useState<HandoffLink[]>(DEFAULT_HANDOFFS);

  const [selectedBotId, setSelectedBotId] = useState<string | null>('bot-orbit');
  const [filterDeptId, setFilterDeptId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'departments' | 'workflow' | 'bot'>('departments');
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Forms: Create Department & Recruit Bot & Quick Assign
  const [showNewDeptForm, setShowNewDeptForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('#00f5ff');

  const [showNewBotForm, setShowNewBotForm] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotRole, setNewBotRole] = useState('');
  const [newBotDeptId, setNewBotDeptId] = useState('dept-growth');

  const [newLinkFrom, setNewLinkFrom] = useState('dept-exec');
  const [newLinkTo, setNewLinkTo] = useState('dept-growth');
  const [newLinkLabel, setNewLinkLabel] = useState('');

  const [quickTaskText, setQuickTaskText] = useState('');
  const [isRunningChain, setIsRunningChain] = useState(false);
  const [workflowLog, setWorkflowLog] = useState<Array<{ id: string; time: string; text: string }>>([
    {
      id: 'init-1',
      time: 'Trực tuyến',
      text: 'Văn phòng 3D Hologram sẵn sàng. Bấm vào bất kỳ nhân viên AI nào trên bàn tròn để điều phối.',
    },
  ]);

  // Load persisted org config from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<SavedOrgConfig>;
      if (Array.isArray(parsed.departments) && parsed.departments.length > 0) {
        setDepartments(parsed.departments);
      }
      if (parsed.botDeptMap && typeof parsed.botDeptMap === 'object') {
        setBotDeptMap(parsed.botDeptMap);
      }
      if (Array.isArray(parsed.handoffs) && parsed.handoffs.length > 0) {
        setHandoffs(parsed.handoffs);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Save org config to localStorage
  useEffect(() => {
    try {
      const payload: SavedOrgConfig = { departments, botDeptMap, handoffs };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota errors
    }
  }, [departments, botDeptMap, handoffs]);

  const activeCount = useMemo(() => bots.filter((b) => b.isActive).length, [bots]);
  const isDesktopLimitReached =
    workspaceMode === 'desktop_free' && activeCount >= BRANDING.system.desktopMaxFreeBots;

  const office3DBots: Office3DBot[] = useMemo(() => {
    // Keep Orbit prominently first so it anchors the center chair facing the hero camera
    const sorted = [...bots].sort((a, b) => {
      if (a.codeName === 'orbit') return -1;
      if (b.codeName === 'orbit') return 1;
      return a.priorityOrder - b.priorityOrder;
    });

    return sorted.map((bot) => {
      const deptId = botDeptMap[bot.id] || inferDefaultDepartmentId(bot);
      const dept = departments.find((d) => d.id === deptId) || departments[0];
      const { badge, screen } = inferRoleBadge(bot);
      const isLocked = workspaceMode === 'desktop_free' && !bot.isActive && isDesktopLimitReached;

      return {
        id: bot.id,
        name: bot.name,
        codeName: bot.codeName,
        roleBadge: badge,
        roleTitle: bot.roleTitle,
        departmentId: dept.id,
        departmentName: dept.name,
        accentHex: dept.colorHex,
        screenKind: screen,
        isActive: bot.isActive,
        isLocked,
        status: bot.status,
      };
    });
  }, [bots, botDeptMap, departments, workspaceMode, isDesktopLimitReached]);

  const selectedBot = useMemo(
    () => bots.find((b) => b.id === selectedBotId) || null,
    [bots, selectedBotId]
  );
  const selected3DBot = useMemo(
    () => office3DBots.find((b) => b.id === selectedBotId) || null,
    [office3DBots, selectedBotId]
  );

  // Ref callbacks so Three.js scene is initialized exactly once (Hermes Scene3D pattern)
  const cbRef = useRef({
    onSelectBot: (botId: string) => {
      setSelectedBotId(botId);
      setDrawerTab('bot');
      setDrawerOpen(true);
      controllerRef.current?.focusBot(botId);
    },
    onSelectLockedBot: (botId: string) => {
      setSelectedBotId(botId);
      onOpenUpgradeModal();
    },
  });

  cbRef.current = {
    onSelectBot: (botId: string) => {
      setSelectedBotId(botId);
      setDrawerTab('bot');
      setDrawerOpen(true);
      controllerRef.current?.focusBot(botId);
    },
    onSelectLockedBot: (botId: string) => {
      setSelectedBotId(botId);
      onOpenUpgradeModal();
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    try {
      const ctrl = createHologramOfficeScene(canvas, overlay, {
        onSelectBot: (id) => cbRef.current.onSelectBot(id),
        onSelectLockedBot: (id) => cbRef.current.onSelectLockedBot(id),
      });
      controllerRef.current = ctrl;

      const parent = canvas.parentElement;
      const ro = new ResizeObserver(() => {
        if (!parent) return;
        ctrl.resize(parent.clientWidth, parent.clientHeight);
      });
      if (parent) {
        ro.observe(parent);
        ctrl.resize(parent.clientWidth, parent.clientHeight);
      }

      return () => {
        ro.disconnect();
        ctrl.dispose();
        controllerRef.current = null;
      };
    } catch (err) {
      setWebglError(
        err instanceof Error
          ? err.message
          : 'Trình duyệt hiện chưa bật tăng tốc phần cứng WebGL.'
      );
    }
  }, []);

  // Re-sync 3D avatars when bots, departments, or selection change
  useEffect(() => {
    controllerRef.current?.syncBots(office3DBots, selectedBotId, filterDeptId);
  }, [office3DBots, selectedBotId, filterDeptId]);

  useEffect(() => {
    controllerRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  const appendLog = useCallback((text: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setWorkflowLog((prev) => [{ id: `${Date.now()}-${Math.random()}`, time, text }, ...prev.slice(0, 14)]);
  }, []);

  const handleCameraPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    controllerRef.current?.setCameraPreset(preset);
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;
    const id = `dept-custom-${Date.now()}`;
    const dept: OfficeDepartment = {
      id,
      name: trimmed,
      shortLabel: trimmed.slice(0, 18),
      colorHex: newDeptColor,
      description: newDeptDesc.trim() || 'Phòng ban tùy biến hoạt động song song trên bàn họp 3D.',
      isCustom: true,
    };
    setDepartments((prev) => [...prev, dept]);
    setNewDeptName('');
    setNewDeptDesc('');
    setShowNewDeptForm(false);
    appendLog(`Đã mở phòng ban mới: ${dept.name}`);
  };

  const handleDeleteDepartment = (deptId: string) => {
    const target = departments.find((d) => d.id === deptId);
    if (!target?.isCustom) return;
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    setBotDeptMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] === deptId) next[k] = 'dept-exec';
      });
      return next;
    });
    setHandoffs((prev) => prev.filter((h) => h.fromDeptId !== deptId && h.toDeptId !== deptId));
    if (filterDeptId === deptId) setFilterDeptId(null);
    appendLog(`Đã xóa phòng ban tùy chỉnh: ${target.name}`);
  };

  const handleRecruitBot = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newBotName.trim();
    if (!name) return;
    const id = `bot-custom-${Date.now()}`;
    const codeName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_');

    const canBeActive =
      workspaceMode === 'cloud_247' || activeCount < BRANDING.system.desktopMaxFreeBots;

    const created: Bot = {
      id,
      name,
      codeName: codeName || `bot_${bots.length + 1}`,
      roleTitle: newBotRole.trim() || 'Chuyên viên AI Đa Nhiệm',
      department: mapDeptIdToBotDepartment(newBotDeptId),
      avatar: '🤖',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      status: 'ready',
      description: 'Nhân viên AI được tuyển trực tiếp ngay trong Văn Phòng 3D Hologram.',
      skills: ['Phối hợp liên phòng ban', 'Xử lý tác vụ 24/7', 'Báo cáo tự động'],
      model: 'Claude / Gemini Flash',
      isActive: canBeActive,
      priorityOrder: bots.length + 1,
    };

    onAddBot(created);
    setBotDeptMap((prev) => ({ ...prev, [id]: newBotDeptId }));
    setSelectedBotId(id);
    setNewBotName('');
    setNewBotRole('');
    setShowNewBotForm(false);
    appendLog(`Đã tuyển nhân viên AI mới: ${name} (${departments.find((d) => d.id === newBotDeptId)?.name || 'Hệ thống'})`);
    setTimeout(() => {
      controllerRef.current?.focusBot(id);
      controllerRef.current?.say(id, `Xin chào! ${name} đã vào vị trí.`, 4000);
    }, 150);
  };

  const handleAssignBotDept = (botId: string, deptId: string) => {
    setBotDeptMap((prev) => ({ ...prev, [botId]: deptId }));
    onUpdateBotDepartment(botId, mapDeptIdToBotDepartment(deptId));
    const dept = departments.find((d) => d.id === deptId);
    const bot = bots.find((b) => b.id === botId);
    if (bot && dept) {
      appendLog(`Chuyển @${bot.name} sang ${dept.name}`);
      controllerRef.current?.say(botId, `Đã chuyển về ${dept.shortLabel}`, 3200);
    }
  };

  const handleAddHandoffLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLinkFrom === newLinkTo) return;
    const fromD = departments.find((d) => d.id === newLinkFrom);
    const toD = departments.find((d) => d.id === newLinkTo);
    if (!fromD || !toD) return;
    const link: HandoffLink = {
      id: `hf-${Date.now()}`,
      fromDeptId: newLinkFrom,
      toDeptId: newLinkTo,
      label: newLinkLabel.trim() || `${fromD.shortLabel} → ${toD.shortLabel}`,
    };
    setHandoffs((prev) => [...prev, link]);
    setNewLinkLabel('');
    appendLog(`Đã nối luồng bàn giao: ${link.label}`);
  };

  const handleQuickAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected3DBot || !quickTaskText.trim()) return;
    if (selected3DBot.isLocked) {
      onOpenUpgradeModal();
      return;
    }
    const text = quickTaskText.trim();
    controllerRef.current?.say(selected3DBot.id, `Đang xử lý: ${text.slice(0, 60)}`, 5000);
    appendLog(`Giao việc cho @${selected3DBot.name}: "${text}"`);
    setQuickTaskText('');

    // Fire a live handoff beam to Orbit (AI Manager) as confirmation
    const manager = office3DBots.find((b) => b.codeName === 'orbit' && b.id !== selected3DBot.id);
    if (manager) {
      setTimeout(() => {
        controllerRef.current?.triggerHandoffBeam({
          fromBotId: selected3DBot.id,
          toBotId: manager.id,
          colorHex: selected3DBot.accentHex,
          label: `Báo cáo tiến độ cho @${manager.name}`,
        });
      }, 900);
    }
  };

  const handleRunDepartmentChain = () => {
    if (isRunningChain || handoffs.length === 0) return;
    setIsRunningChain(true);
    setDrawerTab('workflow');
    setDrawerOpen(true);
    controllerRef.current?.setCameraPreset('hero');
    appendLog('🚀 Khởi chạy chuỗi bàn giao liên phòng ban trên mặt bàn Hologram 3D...');

    handoffs.forEach((link, idx) => {
      setTimeout(() => {
        const fromBot =
          office3DBots.find((b) => b.departmentId === link.fromDeptId && !b.isLocked) ||
          office3DBots.find((b) => b.departmentId === link.fromDeptId) ||
          office3DBots[0];
        const toBot =
          office3DBots.find(
            (b) => b.departmentId === link.toDeptId && b.id !== fromBot?.id && !b.isLocked
          ) ||
          office3DBots.find((b) => b.departmentId === link.toDeptId && b.id !== fromBot?.id) ||
          office3DBots[1];

        if (fromBot && toBot) {
          controllerRef.current?.triggerHandoffBeam({
            fromBotId: fromBot.id,
            toBotId: toBot.id,
            colorHex: fromBot.accentHex,
            label: link.label,
          });
          setTimeout(() => {
            controllerRef.current?.say(toBot.id, `Đã nhận từ @${fromBot.name} ✓`, 2600);
          }, 700);
          appendLog(`Bước ${idx + 1}: @${fromBot.name} → @${toBot.name} (${link.label})`);
        }

        if (idx === handoffs.length - 1) {
          setTimeout(() => {
            setIsRunningChain(false);
            appendLog('✅ Hoàn tất chuỗi phối hợp liên phòng ban.');
          }, 1800);
        }
      }, idx * 1750);
    });
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#020914] text-slate-100 overflow-hidden">
      {/* TOP FLOATING COMMAND BAR */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/85 border-b border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f5ff] animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-extrabold tracking-tight text-white">
                Văn Phòng 3D Hologram
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                {departments.length} Phòng Ban · {activeCount}/{bots.length} Bot Sáng
              </span>
            </div>
          </div>
        </div>

        {/* CAMERA PRESETS & RUN CHAIN CTA */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'hero', label: 'Góc Chuẩn Hero' },
              { id: 'table', label: 'Bàn Họp 360°' },
              { id: 'overview', label: 'Toàn Cảnh' },
              { id: 'skyline', label: 'Cửa Kính Đêm' },
            ] as Array<{ id: CameraPreset; label: string }>
          ).map((cam) => (
            <button
              key={cam.id}
              type="button"
              onClick={() => handleCameraPreset(cam.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                cameraPreset === cam.id
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,245,255,0.25)]'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-700/80 hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              <Camera size={12} />
              <span>{cam.label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
              autoRotate
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                : 'bg-slate-900/90 text-slate-300 border border-slate-700/80 hover:text-white'
            }`}
          >
            <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
            <span>Xoay</span>
          </button>

          <button
            type="button"
            disabled={isRunningChain}
            onClick={handleRunDepartmentChain}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-[0_0_18px_rgba(0,245,255,0.4)] hover:brightness-110 disabled:opacity-60 transition"
          >
            <Play size={12} className="fill-slate-950" />
            <span>{isRunningChain ? 'Đang truyền việc...' : 'Chạy Chuỗi Bàn Giao'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:bg-slate-800"
          >
            <Building2 size={12} />
            <span>{drawerOpen ? 'Ẩn Bảng Điều Phối' : 'Phòng Ban & Bot'}</span>
          </button>
        </div>
      </div>

      {/* MAIN 3D STAGE + RIGHT GLASS HUD DRAWER */}
      <div className="relative flex-1 flex min-h-0">
        {/* 3D CANVAS VIEWPORT */}
        <div className="relative flex-1 min-w-0 h-full overflow-hidden">
          {webglError ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-950">
              <Sparkles className="h-10 w-10 text-cyan-400 mb-3" />
              <h3 className="text-lg font-bold text-white">Không thể khởi tạo đồ họa 3D WebGL</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">{webglError}</p>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                data-testid="hologram-office-canvas"
                className="block w-full h-full touch-none cursor-grab active:cursor-grabbing"
              />
              <div ref={overlayRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
            </>
          )}

          {/* BOTTOM-LEFT DEPARTMENT FILTER PILLS + MODE HINT */}
          <div className="absolute bottom-3 left-3 right-3 md:right-auto z-10 flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={() => setFilterDeptId(null)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md transition border ${
                filterDeptId === null
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/70'
                  : 'bg-slate-950/75 text-slate-300 border-slate-700/80 hover:text-white'
              }`}
            >
              Tất cả ({office3DBots.length})
            </button>
            {departments.map((dept) => {
              const count = office3DBots.filter((b) => b.departmentId === dept.id).length;
              const active = filterDeptId === dept.id;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setFilterDeptId(active ? null : dept.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md transition border ${
                    active
                      ? 'bg-slate-900/95 text-white border-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.35)]'
                      : 'bg-slate-950/75 text-slate-300 border-slate-700/80 hover:text-white'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: dept.colorHex, boxShadow: `0 0 6px ${dept.colorHex}` }}
                  />
                  <span>{dept.shortLabel}</span>
                  <span className="text-[10px] text-slate-400">({count})</span>
                </button>
              );
            })}

            {workspaceMode === 'desktop_free' && (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 backdrop-blur-md hover:bg-amber-500/30"
              >
                <Lock size={11} />
                <span>Cài máy: Sáng tối đa 2 Bot · Mở khóa Cloud 24/7</span>
              </button>
            )}
          </div>

          {/* BOTTOM-LEFT SUBTLE HINT & MIT CREDIT */}
          <div className="hidden lg:flex items-center gap-2 absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-slate-950/65 border border-cyan-500/20 backdrop-blur-md text-[11px] text-slate-300">
            <span>Kéo chuột xoay 360° · Cuộn để thu phóng · Bấm Bot 3D để giao việc</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300/80">Lõi 3D: Hermes Virtual Office (MIT)</span>
          </div>
        </div>

        {/* RIGHT GLASS CONTROL DRAWER (Departments, Workflows, Bot Inspector) */}
        {drawerOpen && (
          <aside className="w-full sm:w-80 md:w-96 flex-shrink-0 border-l border-cyan-500/20 bg-slate-950/92 backdrop-blur-xl flex flex-col z-20 absolute md:relative inset-y-0 right-0">
            {/* Drawer Tab Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 flex-1 mr-2">
                <button
                  type="button"
                  onClick={() => setDrawerTab('departments')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-bold transition ${
                    drawerTab === 'departments'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 size={13} />
                  <span>Phòng ban</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('workflow')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-bold transition ${
                    drawerTab === 'workflow'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitBranch size={13} />
                  <span>Nối chuỗi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('bot')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-bold transition ${
                    drawerTab === 'bot'
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users size={13} />
                  <span>Bot 3D</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Đóng bảng điều phối"
              >
                <X size={16} />
              </button>
            </div>

            {/* DRAWER BODY */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {/* TAB 1: FLEXIBLE DEPARTMENTS */}
              {drawerTab === 'departments' && (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Cơ cấu phòng ban linh hoạt
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewDeptForm((v) => !v);
                          setShowNewBotForm(false);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25"
                      >
                        <Plus size={12} />
                        <span>Phòng ban</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewBotForm((v) => !v);
                          setShowNewDeptForm(false);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                      >
                        <UserPlus size={12} />
                        <span>Tuyển Bot</span>
                      </button>
                    </div>
                  </div>

                  {/* INLINE CREATE DEPARTMENT FORM */}
                  {showNewDeptForm && (
                    <form
                      onSubmit={handleCreateDepartment}
                      className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-2.5"
                    >
                      <div className="text-xs font-bold text-cyan-200">+ Tạo phòng ban AI mới</div>
                      <input
                        type="text"
                        required
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        placeholder="VD: Phòng Livestream & Affiliate"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newDeptDesc}
                        onChange={(e) => setNewDeptDesc(e.target.value)}
                        placeholder="Chức năng chính của phòng ban..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Màu hologram:</span>
                        {NEON_COLORS.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => setNewDeptColor(hex)}
                            className={`h-5 w-5 rounded-full border-2 transition ${
                              newDeptColor === hex ? 'border-white scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: hex }}
                            aria-label={`Chọn màu ${hex}`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowNewDeptForm(false)}
                          className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:brightness-110"
                        >
                          Lưu phòng ban
                        </button>
                      </div>
                    </form>
                  )}

                  {/* INLINE RECRUIT NEW AI BOT FORM */}
                  {showNewBotForm && (
                    <form
                      onSubmit={handleRecruitBot}
                      className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2.5"
                    >
                      <div className="text-xs font-bold text-indigo-200">+ Tuyển Nhân viên AI vào bàn 3D</div>
                      <input
                        type="text"
                        required
                        value={newBotName}
                        onChange={(e) => setNewBotName(e.target.value)}
                        placeholder="Tên Bot (VD: Nova, Tài Chính...)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newBotRole}
                        onChange={(e) => setNewBotRole(e.target.value)}
                        placeholder="Vai trò (VD: Chuyên gia Kế toán & Thuế)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                      />
                      <select
                        value={newBotDeptId}
                        onChange={(e) => setNewBotDeptId(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-400 focus:outline-none"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowNewBotForm(false)}
                          className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-400"
                        >
                          Thêm vào Văn Phòng 3D
                        </button>
                      </div>
                    </form>
                  )}

                  {/* DEPARTMENTS LIST */}
                  <div className="space-y-2.5">
                    {departments.map((dept) => {
                      const deptBots = office3DBots.filter((b) => b.departmentId === dept.id);
                      const isFiltered = filterDeptId === dept.id;
                      return (
                        <div
                          key={dept.id}
                          className={`p-3 rounded-xl border transition ${
                            isFiltered
                              ? 'bg-slate-900 border-cyan-400/70 shadow-[0_0_16px_rgba(0,245,255,0.12)]'
                              : 'bg-slate-900/65 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setFilterDeptId(isFiltered ? null : dept.id)}
                              className="text-left flex-1"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor: dept.colorHex,
                                    boxShadow: `0 0 8px ${dept.colorHex}`,
                                  }}
                                />
                                <span className="text-xs font-bold text-white">{dept.name}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {dept.description}
                              </p>
                            </button>
                            {dept.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDepartment(dept.id)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400"
                                title="Xóa phòng ban tự tạo"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          {/* Bots inside this department */}
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {deptBots.length === 0 ? (
                              <span className="text-[11px] italic text-slate-500">
                                Chưa có bot — bấm vào bot khác để chuyển về đây
                              </span>
                            ) : (
                              deptBots.map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBotId(b.id);
                                    setDrawerTab('bot');
                                    controllerRef.current?.focusBot(b.id);
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                                    selectedBotId === b.id
                                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60'
                                      : b.isLocked
                                      ? 'bg-slate-950/70 text-slate-500 border-slate-800'
                                      : 'bg-slate-950/90 text-slate-200 border-slate-700 hover:border-cyan-500/40'
                                  }`}
                                >
                                  {b.isLocked ? (
                                    <Lock size={10} className="text-amber-400" />
                                  ) : (
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{
                                        backgroundColor: b.isActive ? dept.colorHex : '#64748b',
                                      }}
                                    />
                                  )}
                                  <span>{b.name}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* TAB 2: INTER-DEPARTMENT WORKFLOW HANDOFF CHAIN */}
              {drawerTab === 'workflow' && (
                <>
                  <div className="p-3 rounded-xl bg-cyan-950/35 border border-cyan-500/30">
                    <div className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                      <Zap size={14} className="text-cyan-400" />
                      <span>Luồng bàn giao liên phòng ban</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Nối các phòng ban thành dây chuyền tự động. Khi bấm chạy, tia năng lượng hologram sẽ truyền việc qua từng nhân viên AI trên bàn 3D.
                    </p>
                    <button
                      type="button"
                      disabled={isRunningChain}
                      onClick={handleRunDepartmentChain}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 hover:brightness-110 disabled:opacity-60"
                    >
                      <Play size={13} className="fill-slate-950" />
                      <span>{isRunningChain ? 'Đang chạy tia bàn giao 3D...' : 'Chạy Chuỗi Bàn Giao Ngay'}</span>
                    </button>
                  </div>

                  {/* Active Handoff Links */}
                  <div className="space-y-2">
                    {handoffs.map((link, idx) => {
                      const fromD = departments.find((d) => d.id === link.fromDeptId);
                      const toD = departments.find((d) => d.id === link.toDeptId);
                      return (
                        <div
                          key={link.id}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold">
                              <span className="text-cyan-400">#{idx + 1}</span>
                              <span style={{ color: fromD?.colorHex || '#38bdf8' }}>
                                {fromD?.shortLabel || 'Phòng A'}
                              </span>
                              <span className="text-slate-500">→</span>
                              <span style={{ color: toD?.colorHex || '#34d399' }}>
                                {toD?.shortLabel || 'Phòng B'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {link.label}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setHandoffs((prev) => prev.filter((h) => h.id !== link.id))}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Xóa bước bàn giao"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom Handoff Link */}
                  <form
                    onSubmit={handleAddHandoffLink}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                  >
                    <div className="text-[11px] font-bold text-slate-200">+ Nối thêm bước bàn giao</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={newLinkFrom}
                        onChange={(e) => setNewLinkFrom(e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-white"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            Từ: {d.shortLabel}
                          </option>
                        ))}
                      </select>
                      <select
                        value={newLinkTo}
                        onChange={(e) => setNewLinkTo(e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-white"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            Tới: {d.shortLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder="Mô tả bàn giao (VD: Kiểm duyệt → Xuất bản)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:bg-slate-700"
                    >
                      + Thêm liên kết phòng ban
                    </button>
                  </form>

                  {/* Realtime Execution Log */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Nhật ký điều phối thời gian thực
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {workflowLog.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-2 rounded-lg bg-slate-900/70 border border-slate-800/80 text-[11px]"
                        >
                          <span className="font-mono text-cyan-400 mr-1.5">[{entry.time}]</span>
                          <span className="text-slate-200">{entry.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 3: SELECTED 3D BOT INSPECTOR & DIRECT DISPATCH */}
              {drawerTab === 'bot' && selectedBot && selected3DBot && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/35">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mb-1.5"
                          style={{
                            color: selected3DBot.accentHex,
                            borderColor: `${selected3DBot.accentHex}66`,
                            backgroundColor: `${selected3DBot.accentHex}15`,
                          }}
                        >
                          {selected3DBot.roleBadge}
                        </span>
                        <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                          <span>{selectedBot.avatar}</span>
                          <span>{selectedBot.name}</span>
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5">{selectedBot.roleTitle}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleBotActive(selectedBot.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                          selectedBot.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {selectedBot.isActive ? 'Đang bật' : 'Bật Bot'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                      {selectedBot.description}
                    </p>

                    {/* Department Assignment Switcher */}
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Thuộc phòng ban (chuyển linh hoạt):
                      </label>
                      <select
                        value={selected3DBot.departmentId}
                        onChange={(e) => handleAssignBotDept(selectedBot.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Skills */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {selectedBot.skills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-cyan-200 border border-slate-800"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick Task Assignment right inside 3D */}
                  <form
                    onSubmit={handleQuickAssignTask}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
                  >
                    <label className="block text-xs font-bold text-cyan-200">
                      Giao việc nhanh cho @{selectedBot.name} trên bàn 3D
                    </label>
                    <textarea
                      rows={2}
                      value={quickTaskText}
                      onChange={(e) => setQuickTaskText(e.target.value)}
                      placeholder={`VD: @${selectedBot.name} lập kế hoạch chiến dịch mới và báo lại Orbit...`}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:brightness-110"
                      >
                        <Send size={13} />
                        <span>Phát lệnh 3D</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectBotForChat(selectedBot)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
                      >
                        <MessageSquare size={13} />
                        <span>Phòng họp</span>
                      </button>
                    </div>
                  </form>

                  {selected3DBot.isLocked && (
                    <button
                      type="button"
                      onClick={onOpenUpgradeModal}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg"
                    >
                      <Lock size={14} />
                      <span>Mở khóa @{selectedBot.name} trên Cloud 24/7</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
