'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { AiProviderId } from '@/lib/server/ai-provider';

export interface ByokClientSettings {
  provider: AiProviderId;
  apiKey: string;
  model: string;
}

export const BYOK_STORAGE_KEY = 'tochuc_nvai_byok_v1';

export const DEFAULT_BYOK_SETTINGS: ByokClientSettings = {
  provider: 'auto',
  apiKey: '',
  model: '',
};

const PROVIDER_OPTIONS: Array<{
  id: AiProviderId;
  label: string;
  placeholder: string;
  defaultModel: string;
}> = [
  {
    id: 'auto',
    label: 'Tự động nhận diện theo tiền tố Key',
    placeholder: 'AIza... (Gemini) / sk-... (OpenAI) / sk-ant-... (Claude) / sk-or-... (OpenRouter)',
    defaultModel: 'Tự động chọn model tối ưu',
  },
  {
    id: 'gemini',
    label: 'Google Gemini (AI Studio)',
    placeholder: 'AIzaSy...',
    defaultModel: 'gemini-2.5-flash',
  },
  {
    id: 'openai',
    label: 'OpenAI (ChatGPT API)',
    placeholder: 'sk-proj-... hoặc sk-...',
    defaultModel: 'gpt-4o-mini',
  },
  {
    id: 'anthropic',
    label: 'Anthropic Claude',
    placeholder: 'sk-ant-api03-...',
    defaultModel: 'claude-3-5-sonnet-latest',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter (DeepSeek / Đa mô hình)',
    placeholder: 'sk-or-v1-...',
    defaultModel: 'deepseek/deepseek-chat-v3-0324',
  },
];

export function loadByokSettings(): ByokClientSettings {
  if (typeof window === 'undefined') return DEFAULT_BYOK_SETTINGS;
  try {
    const raw = window.localStorage.getItem(BYOK_STORAGE_KEY);
    if (!raw) return DEFAULT_BYOK_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ByokClientSettings>;
    return {
      provider: parsed.provider || 'auto',
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' ? parsed.model : '',
    };
  } catch {
    return DEFAULT_BYOK_SETTINGS;
  }
}

export function saveByokSettings(settings: ByokClientSettings): void {
  if (typeof window === 'undefined') return;
  try {
    if (!settings.apiKey.trim()) {
      window.localStorage.removeItem(BYOK_STORAGE_KEY);
    } else {
      window.localStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(settings));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function maskClientKey(key: string): string {
  const clean = key.trim();
  if (!clean) return '';
  if (clean.length <= 10) return '••••••••';
  return `${clean.slice(0, 6)}••••••${clean.slice(-4)}`;
}

interface ByokSettingsModalProps {
  isOpen: boolean;
  settings: ByokClientSettings;
  onClose: () => void;
  onSave: (next: ByokClientSettings) => void;
}

export const ByokSettingsModal: React.FC<ByokSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [provider, setProvider] = useState<AiProviderId>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [showKey, setShowKey] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProvider(settings.provider);
      setApiKey(settings.apiKey);
      setModel(settings.model);
      setShowKey(false);
      setSavedNotice(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const activeOption =
    PROVIDER_OPTIONS.find((p) => p.id === provider) || PROVIDER_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: ByokClientSettings = {
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
    };
    saveByokSettings(cleaned);
    onSave(cleaned);
    setSavedNotice(true);
    setTimeout(() => {
      onClose();
    }, 650);
  };

  const handleClear = () => {
    const empty = { ...DEFAULT_BYOK_SETTINGS };
    setProvider('auto');
    setApiKey('');
    setModel('');
    saveByokSettings(empty);
    onSave(empty);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cài đặt API Key AI (BYOK)"
    >
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/35 shadow-2xl shadow-cyan-950/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-extrabold text-white">
                Cài đặt API Key AI (BYOK)
              </h2>
              <p className="text-[11px] text-slate-400">
                Cắm khóa cá nhân để các nhân viên AI trả lời thực theo thời gian thực
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Provider select */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Nhà cung cấp AI
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AiProviderId)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* API Key input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-200">
                Khóa API (BYOK Key)
              </label>
              {apiKey.trim() && (
                <span className="text-[10px] font-mono text-emerald-400">
                  {maskClientKey(apiKey)}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={activeOption.placeholder}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-3 pr-10 py-2.5 text-xs md:text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                aria-label={showKey ? 'Ẩn API Key' : 'Hiện API Key'}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Optional Model override */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Tên Model (tùy chọn — để trống dùng mặc định:{' '}
              <span className="text-cyan-300 font-mono">{activeOption.defaultModel}</span>)
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={activeOption.defaultModel}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs md:text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Security notice */}
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 flex items-start gap-2.5 text-[11px] text-emerald-200 leading-relaxed">
            <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Bảo mật Zero-Leak BYOK:</strong> Khóa API được lưu cục bộ trên trình duyệt của riêng bạn, chỉ truyền qua kết nối HTTPS tới máy chủ streaming và tự động lọc bỏ khỏi mọi log/thông báo lỗi. Để trống nếu muốn dùng Chế độ Demo miễn phí.
            </div>
          </div>

          {savedNotice && (
            <div className="rounded-xl bg-cyan-500/15 border border-cyan-400/40 px-3 py-2 text-xs text-cyan-200 flex items-center gap-2 font-semibold">
              <CheckCircle2 size={15} className="text-cyan-300" />
              <span>Đã lưu cấu hình BYOK! Các bot đã sẵn sàng chạy AI thực.</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition"
            >
              <Trash2 size={14} />
              <span>Xóa Key</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 transition"
              >
                <Sparkles size={14} />
                <span>Lưu &amp; Kích Hoạt AI Thực</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
