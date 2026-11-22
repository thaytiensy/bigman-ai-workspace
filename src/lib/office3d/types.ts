/**
 * Kiểu dữ liệu cho Văn Phòng 3D Hologram (kế thừa kiến trúc modular từ Hermes Virtual Office - MIT).
 */

export type HologramScreenKind =
  | 'manager'
  | 'marketer'
  | 'researcher'
  | 'support'
  | 'code'
  | 'commerce';

export type CameraPreset = 'hero' | 'table' | 'overview' | 'skyline';

export interface OfficeDepartment {
  id: string;
  name: string;
  shortLabel: string;
  colorHex: string;
  description: string;
  isCustom?: boolean;
}

export interface HandoffLink {
  id: string;
  fromDeptId: string;
  toDeptId: string;
  label: string;
}

export interface Office3DBot {
  id: string;
  name: string;
  codeName: string;
  roleBadge: string;
  roleTitle: string;
  departmentId: string;
  departmentName: string;
  accentHex: string;
  screenKind: HologramScreenKind;
  isActive: boolean;
  isLocked: boolean;
  status: 'ready' | 'working' | 'offline';
}

export interface HandoffPulse {
  fromBotId: string;
  toBotId: string;
  colorHex: string;
  label?: string;
}

export interface Office3DCallbacks {
  onSelectBot?: (botId: string) => void;
  onSelectLockedBot?: (botId: string) => void;
  onSceneReady?: () => void;
}
