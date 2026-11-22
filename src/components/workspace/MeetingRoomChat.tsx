'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  ArrowRightLeft,
  Trash2,
  KeyRound,
} from 'lucide-react';
import { Bot, ChatMessage } from '@/types/workspace';
import { QUICK_PROMPT_CATEGORIES } from '@/data/mockWorkspaceData';
import type { ByokClientSettings } from './ByokSettingsModal';

interface MeetingRoomChatProps {
  bots: Bot[];
  preselectedBot?: Bot | null;
  onClearPreselectedBot?: () => void;
  byokSettings?: ByokClientSettings;
  onOpenByokModal?: () => void;
}

export const MeetingRoomChat: React.FC<MeetingRoomChatProps> = ({
  bots,
  preselectedBot,
  onClearPreselectedBot,
  byokSettings,
  onOpenByokModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderType: 'system',
      senderName: 'Hệ Thống Điều Phối',
      senderAvatar: '🛰️',
      senderRole: 'Orchestrator',
      content:
        'Chào mừng bạn đến với **Phòng Họp Chiến Lược Đa Bot** của Tổ Chức Nhân Viên AI. Bạn có thể gắn thẻ `@tên-bot` (ví dụ: `@Sunny`, `@Wren`, `@Listing Pro`) để yêu cầu từng chuyên gia giải quyết vấn đề hoặc để các bot tự động giao việc chéo cho nhau.',
      timestamp: '15:40',
    },
    {
      id: 'msg-2',
      senderType: 'user',
      senderName: 'Chủ Gian Hàng',
      senderAvatar: '👤',
      content:
        '@Sunny Gian hàng TikTok Shop của mình tuần này lượt xem thẻ Shop Tab tăng gấp đôi nhưng tỷ lệ chuyển đổi CR lại tụt xuống 1.4%. Bạn và @Wren kiểm tra giúp mình nhé!',
      timestamp: '15:42',
      mentions: ['Sunny', 'Wren'],
    },
    {
      id: 'msg-3',
      senderType: 'bot',
      senderId: 'bot-sunny',
      senderName: 'Sunny',
      senderAvatar: '🛍️',
      senderRole: 'Chuyên gia Vận hành TikTok Shop',
      delegatedTo: 'Wren',
      content:
        `Chào bạn! Theo công thức **GMV Flywheel = Impressions × CTR × CR × AOV**, trường hợp của bạn rơi vào **Trường hợp 3: Lượt hiển thị tốt nhưng CR thấp (< 2%)**.

**Nguyên nhân cốt lõi khi khách bấm vào nhưng không mua:**
1. Bộ ảnh sản phẩm chưa giải tỏa được nỗi sợ mua hàng (thiếu ảnh bảng size, thiếu ảnh cận cảnh chất liệu thực tế).
2. Chưa có đánh giá 5 sao kèm hình ảnh thực tế trong 10 đánh giá đầu tiên.
3. Thiếu **Voucher Khách Hàng Mới** để kích thích chốt đơn tức thì.

Tôi đã bàn giao yêu cầu quét dữ liệu giá và mẫu ảnh của top 3 shop đối thủ sang cho **@Wren** để bóc tách chi tiết.`,
      timestamp: '15:43',
    },
    {
      id: 'msg-4',
      senderType: 'bot',
      senderId: 'bot-wren',
      senderName: 'Wren',
      senderAvatar: '📊',
      senderRole: 'Chuyên gia Nghiên cứu KOC & Thị trường',
      content:
        `Nhận lệnh từ **@Sunny**, tôi đã quét nhanh 3 đối thủ lớn nhất cùng phân khúc trên TikTok Shop:
- **Giá bán:** Đối thủ đang cài cấu hình SKU mồi (phụ kiện kèm) để kéo giá hiển thị ngoài thẻ Shop Tab thấp hơn gian hàng bạn 15%.
- **Voucher sàn:** Đối thủ đã đăng ký gói **Voucher Xtra** và cài thêm **Combo Mua 2 giảm 5%**.
- **Kế hoạch hành động:** Bạn nên tối ưu lại đủ 7–9 ảnh theo chuẩn USP, bổ sung voucher giảm 10k cho đơn từ 150k và gửi 30 lời mời mẫu thử miễn phí cho KOC ngách thời trang để kéo đánh giá video có gắn giỏ hàng!`,
      timestamp: '15:44',
    },
  ]);

  const [inputContent, setInputContent] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handle preselected bot from Roster Grid
  useEffect(() => {
    if (preselectedBot) {
      setInputContent(`@${preselectedBot.name} `);
      inputRef.current?.focus();
      onClearPreselectedBot?.();
    }
  }, [preselectedBot, onClearPreselectedBot]);

  // Handle input changes and mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputContent(val);

    const lastAtPos = val.lastIndexOf('@');
    if (lastAtPos !== -1 && lastAtPos === val.length - 1) {
      setShowMentionMenu(true);
      setMentionFilter('');
    } else if (lastAtPos !== -1 && showMentionMenu) {
      const query = val.slice(lastAtPos + 1);
      if (query.includes(' ')) {
        setShowMentionMenu(false);
      } else {
        setMentionFilter(query.toLowerCase());
      }
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (botName: string) => {
    const lastAtPos = inputContent.lastIndexOf('@');
    if (lastAtPos !== -1) {
      const nextContent = inputContent.slice(0, lastAtPos) + `@${botName} `;
      setInputContent(nextContent);
    }
    setShowMentionMenu(false);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const trimmed = inputContent.trim();
    if (!trimmed || isStreaming) return;

    // Detect mentioned bots
    const mentionedBots = bots.filter((b) =>
      trimmed.toLowerCase().includes(`@${b.name.toLowerCase()}`) ||
      trimmed.toLowerCase().includes(`@${b.codeName.toLowerCase()}`)
    );
    const targetBot = mentionedBots.length > 0 ? mentionedBots[0] : bots[0];
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderType: 'user',
      senderName: 'Bạn',
      senderAvatar: '👤',
      content: trimmed,
      timestamp: nowTime,
      mentions: mentionedBots.map((b) => b.name),
    };

    const streamingMsgId = `bot-${Date.now() + 1}`;
    const initialBotMsg: ChatMessage = {
      id: streamingMsgId,
      senderType: 'bot',
      senderId: targetBot.id,
      senderName: targetBot.name,
      senderAvatar: targetBot.avatar,
      senderRole: targetBot.roleTitle,
      content: '',
      timestamp: nowTime,
      isStreaming: true,
    };

    const historyForApi = [...messages, userMsg]
      .filter((m) => m.senderType === 'user' || m.senderType === 'bot')
      .slice(-10)
      .map((m) => ({
        role: m.senderType === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    setInputContent('');
    setShowMentionMenu(false);
    setIsStreaming(true);

    try {
      const hasByok = Boolean(byokSettings?.apiKey && byokSettings.apiKey.trim().length >= 10);
      const res = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: '00000000-0000-0000-0000-000000000001',
          botId: targetBot.id,
          messages: historyForApi,
          iterationCount: 1,
          botProfile: {
            name: targetBot.name,
            roleTitle: targetBot.roleTitle,
            department: targetBot.department,
            systemPrompt: targetBot.description,
          },
          byok: hasByok
            ? {
                provider: byokSettings?.provider || 'auto',
                apiKey: byokSettings?.apiKey.trim(),
                model: byokSettings?.model?.trim() || undefined,
              }
            : undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const errPayload = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errPayload.error || `Lỗi kết nối AI (HTTP ${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulated = '';
      let streamError: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const clean = line.trim();
          if (!clean.startsWith('data:')) continue;
          const jsonStr = clean.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const evt = JSON.parse(jsonStr);
            if (evt.type === 'token' && typeof evt.text === 'string') {
              accumulated += evt.text;
              const snapshot = accumulated;
              setMessages((prev) =>
                prev.map((m) => (m.id === streamingMsgId ? { ...m, content: snapshot } : m))
              );
            } else if (evt.type === 'error' && typeof evt.error === 'string') {
              streamError = evt.error;
            }
          } catch {
            // Bỏ qua chunk không hoàn chỉnh
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMsgId
            ? {
                ...m,
                content: streamError
                  ? `${accumulated}${accumulated ? '\n\n' : ''}⚠️ Không thể kết nối AI thực: ${streamError}\nVui lòng kiểm tra lại API Key trong mục "Cài đặt API Key (BYOK)".`
                  : accumulated || generateBotResponse(targetBot, trimmed),
                isStreaming: false,
              }
            : m
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ streaming';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingMsgId
            ? {
                ...m,
                content: `⚠️ ${msg}\n\n${generateBotResponse(targetBot, trimmed)}`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyQuickPrompt = (promptContent: string) => {
    setInputContent(promptContent);
    inputRef.current?.focus();
  };

  // Helper to generate context-rich responses
  const generateBotResponse = (bot: Bot, query: string): string => {
    if (bot.codeName === 'sunny' || query.toLowerCase().includes('tiktok') || query.toLowerCase().includes('shop')) {
      return `Tôi là **Sunny** (Chuyên gia Vận hành TikTok Shop). Đối với yêu cầu của bạn:

1. **Chuẩn hóa Tiêu đề & Listing:** Hãy áp dụng công thức: \`[Loại sản phẩm] + [Thương hiệu] + [USP đặc tính nổi bật] + [Đối tượng sử dụng] + [Quy cách]\`. Độ dài vàng 60–120 ký tự, viết hoa chữ cái đầu và tuyệt đối không dùng từ ngữ cấm như "100%", "trị dứt điểm", "tốt nhất".
2. **Kiểm soát Biên Lợi Nhuận (Unit Economics):** Nhắc bạn cẩn trọng việc cộng dồn: **Chiết khấu sàn + Voucher Shop + Hoa hồng KOC Affiliate**. Phải đảm bảo tỷ suất lợi nhuận ròng sau khi trừ chi phí vận hành vẫn duy trì trên 25%–35%.
3. **SLA Vận chuyển:** Đảm bảo bàn giao cho đơn vị vận chuyển trong vòng 24–48h để giữ tỷ lệ giao hàng trễ (LDR) luôn < 4%.`;
    }

    if (bot.codeName === 'listing_pro' || query.toLowerCase().includes('seo')) {
      return `Chào bạn, tôi là **Listing Pro** (Chuyên gia SEO Tổng Thể):

- **Phân tầng từ khóa:** Cần chia bộ từ khóa làm 3 tầng: Tầng Nhận diện (Informatonal), Tầng Cân nhắc (Navigational) và Tầng Chốt đơn (Commercial Intent).
- **Tối ưu Shop Tab:** Đưa từ khóa có lượng tìm kiếm cao nhất lên 35 ký tự đầu tiên của tiêu đề để tối ưu hiển thị trên ứng dụng di động.
- **Backlink & Entity:** Xây dựng liên kết nội bộ chặt chẽ giữa bài viết blog trụ cột (Pillar) và thẻ sản phẩm để tối đa hóa điểm chất lượng thuật toán.`;
    }

    return `Tôi là **${bot.name}** (${bot.roleTitle}). Tôi đã tiếp nhận yêu cầu: "${query}".

**Giải pháp đề xuất theo quy chuẩn:**
- Bước 1: Rà soát hiện trạng và xác định mục tiêu định lượng cốt lõi.
- Bước 2: Thiết lập quy trình chuẩn hóa và phân chia trách nhiệm phối hợp với các bot liên quan.
- Bước 3: Đo lường phản hồi theo thời gian thực và tự động tinh chỉnh sau 24h.

Bạn có cần tôi bàn giao thêm thông tin này cho phòng ban nào khác không?`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* ROOM HEADER */}
      <div className="px-4 py-3 md:px-6 md:py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-lg shadow-md shadow-emerald-500/20">
            💬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm md:text-base text-white">
                Phòng Họp Chiến Lược Đa Bot
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Trực tiếp
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gõ <code className="text-indigo-400 bg-slate-800 px-1 py-0.2 rounded font-mono">@</code> để chỉ định chuyên gia hoặc nhận hỗ trợ đa chiều.
            </p>
          </div>
        </div>

        {/* QUICK BOT PARTICIPANTS PREVIEW + BYOK TRIGGER */}
        <div className="flex items-center gap-2">
          {onOpenByokModal && (
            <button
              type="button"
              onClick={onOpenByokModal}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                byokSettings?.apiKey && byokSettings.apiKey.trim().length >= 10
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35 hover:bg-emerald-500/25'
                  : 'bg-cyan-500/15 text-cyan-200 border-cyan-500/35 hover:bg-cyan-500/25'
              }`}
              title="Cắm API Key cá nhân (OpenAI / Gemini / Claude / OpenRouter) để chạy AI thực"
            >
              <KeyRound size={12} />
              <span className="hidden sm:inline">
                {byokSettings?.apiKey && byokSettings.apiKey.trim().length >= 10
                  ? 'AI Thực (BYOK)'
                  : 'Cài API Key (BYOK)'}
              </span>
            </button>
          )}
          <div className="hidden lg:flex items-center -space-x-2 mr-2">
            {bots.slice(0, 5).map((b) => (
              <div
                key={b.id}
                title={`${b.name} (${b.roleTitle})`}
                className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs shadow"
              >
                {b.avatar}
              </div>
            ))}
            <span className="text-xs text-slate-400 pl-3 font-medium">+{bots.length - 5} bot</span>
          </div>

          <button
            type="button"
            onClick={() => setMessages([messages[0]])}
            title="Xóa lịch sử phòng họp"
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 transition"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* QUICK INDUSTRY PROMPT BAR */}
      <div className="px-4 py-2.5 md:px-6 bg-slate-900/60 border-b border-slate-800/80 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Mẫu lệnh nhanh:
          </span>
          {QUICK_PROMPT_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryTab(idx)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategoryTab === idx
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* PROMPT CHIPS */}
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPT_CATEGORIES[selectedCategoryTab].prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyQuickPrompt(p.content)}
              className="text-left px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 whitespace-nowrap transition flex items-center gap-1.5 group"
            >
              <Sparkles size={11} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MESSAGES CONVERSATION STREAM */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.senderType === 'user';
          const isSystem = msg.senderType === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="max-w-3xl mx-auto my-3 p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs text-slate-300 flex items-start gap-3 shadow-md"
              >
                <div className="text-xl flex-shrink-0">{msg.senderAvatar}</div>
                <div className="flex-1 leading-relaxed">
                  <div className="font-bold text-indigo-300 mb-0.5">{msg.senderName}</div>
                  <div className="prose prose-invert prose-xs text-slate-300">{msg.content}</div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* SENDER AVATAR */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              >
                {msg.senderAvatar}
              </div>

              {/* MESSAGE BUBBLE */}
              <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                {/* NAME & ROLE HEADER */}
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="font-bold text-xs text-slate-200">{msg.senderName}</span>
                  {msg.senderRole && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-medium">
                      {msg.senderRole}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                </div>

                {/* DELEGATION NOTICE PILL */}
                {msg.delegatedTo && (
                  <div className="mb-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium flex items-center gap-1.5">
                    <ArrowRightLeft size={12} className="text-emerald-400" />
                    <span>Đã phân công việc chéo sang: <strong>@{msg.delegatedTo}</strong></span>
                  </div>
                )}

                {/* CONTENT BOX */}
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap select-text ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />
                  )}
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                {!isUser && (
                  <div className="mt-1.5 flex items-center gap-2 px-1 text-[11px] text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:text-slate-300 flex items-center gap-1 transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR WITH @MENTION POPUP */}
      <div className="p-3 md:p-4 bg-slate-900 border-t border-slate-800 relative flex-shrink-0">
        {/* MENTION SUGGESTION MENU */}
        {showMentionMenu && (
          <div className="absolute bottom-full left-4 mb-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-20">
            <div className="px-3 py-1.5 bg-slate-800/90 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Chỉ Định Nhân Viên AI
            </div>
            <div className="max-h-48 overflow-y-auto">
              {bots
                .filter((b) => b.name.toLowerCase().includes(mentionFilter))
                .map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectMention(b.name)}
                    className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-800 transition"
                  >
                    <span className="text-base">{b.avatar}</span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{b.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">@{b.codeName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{b.roleTitle}</div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* INPUT CONTAINER */}
        <div className="flex items-end gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2 focus-within:border-indigo-500 transition shadow-inner">
          <textarea
            ref={inputRef}
            rows={2}
            value={inputContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Gửi câu hỏi hoặc giao việc cho @Sunny, @Wren, @Echo... (Enter để gửi, Shift+Enter xuống dòng)"
            className="flex-1 bg-transparent border-0 resize-none text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none p-1.5 max-h-32"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputContent.trim() || isStreaming}
            className={`p-2.5 rounded-xl font-semibold transition-all flex items-center justify-center ${
              !inputContent.trim() || isStreaming
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 active:scale-95'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
