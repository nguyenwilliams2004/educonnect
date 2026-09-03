import { Send, X, ArrowUpRight, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  ChatMessage,
  queryGeminiChatbot,
  getEffectiveGeminiApiKey,
} from '../../lib/aiChatService';

export type { ChatMessage };

/* Hallmark · component: AiChatWidget · genre: editorial · theme: HanTutor Clean Broadsheet
 * states: default · hover · focus · active · disabled · loading
 * contrast: pass (WCAG AA 4.5:1 on text-slate-900 / white / blue-600)
 */

// Logo icon tròn thương hiệu HanTutor
export function AiChatLogoIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="50" fill="#f0551c" />
      <rect x="22" y="28" width="56" height="34" rx="17" fill="#ffffff" />
      <path d="M48 60 L54 74 L54 60 Z" fill="#ffffff" />
      <circle cx="38" cy="45" r="4" fill="#f0551c" />
      <circle cx="50" cy="45" r="4" fill="#f0551c" />
      <circle cx="62" cy="45" r="4" fill="#f0551c" />
    </svg>
  );
}

// Logo Facebook Messenger chính thức
export function MessengerLogoIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="50" fill="#0064FF" />
      <path
        d="M50 16 C30.67 16 15 30.5 15 48.4 C15 58.6 19.8 67.6 27.5 73.5 L27.5 84 L38.2 78 C41.9 79 45.8 79.6 50 79.6 C69.33 79.6 85 65.1 85 47.2 C85 29.3 69.33 16 50 16 Z"
        fill="#0064FF"
      />
      <path
        d="M32 57.5 L46 42.5 L53.5 50.5 L68 42.5 L54 57.5 L46.5 49.5 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

// Các câu hỏi gợi ý nhanh chuẩn nghiệp vụ
const QUICK_PROMPTS = [
  "Quy trình học thử 1-1 miễn phí",
  "Tìm giáo viên Toán luyện thi Hà Nội",
  "Chính sách cam kết hoàn tiền 100%",
  "Tỷ lệ nhận lớp thành công là gì?"
];

export default function AiChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { tutors } = useData();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const activeKey = getEffectiveGeminiApiKey();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ lý AI HanTutor.\n\nTôi có thể hỗ trợ bạn:\n- Tìm kiếm gia sư & giáo viên theo môn học tại Hà Nội\n- Hướng dẫn quy trình hẹn lịch học thử 1-1 miễn phí 01 buổi\n- Chính sách tài chính an toàn & cam kết hoàn tiền 100%\n- Hướng dẫn giáo viên đăng ký nhận lớp\n\nBạn đang quan tâm môn học hoặc cần tư vấn thông tin gì?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const result = await queryGeminiChatbot(
        messageText.trim(),
        messages,
        tutors,
        activeKey
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: result.text,
        recommendedTutors: result.recommendedTutors,
        isFallback: result.isFallback,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: `Hệ thống tạm thời bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau giây lát hoặc nhắn tin trực tiếp qua Messenger ở góc màn hình.`,
        isFallback: true,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-22 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[410px] h-[550px] max-h-[82vh] bg-white rounded-3xl shadow-2xl shadow-slate-900/12 border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-250 select-text font-sans">
      
      {/* Header Hallmark Editorial: Nền sáng tinh tế, ăn khớp 100% theme website HanTutor */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-orange-50 border border-orange-100/80 flex items-center justify-center p-1.5 shadow-2xs shrink-0">
            <AiChatLogoIcon className="w-full h-full" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight truncate">Trợ lý HanTutor</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/80 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Trực tuyến
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">Tư vấn chọn gia sư & học thử 1-1 miễn phí</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer shrink-0"
          title="Đóng hộp chat"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-[13px] leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs font-normal'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
              }`}
            >
              {/* Markdown Content rendering */}
              <div className="space-y-1.5 whitespace-pre-wrap">
                {msg.text.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) {
                    return (
                      <div key={i} className="font-bold text-sm text-slate-900 mt-1.5 mb-1 tracking-tight">
                        {line.replace('### ', '')}
                      </div>
                    );
                  }
                  if (line.startsWith('- ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                    return (
                      <div key={i} className="pl-1 text-slate-700 font-normal">
                        {line}
                      </div>
                    );
                  }
                  return <div key={i}>{line}</div>;
                })}
              </div>

              {/* Recommended Tutors Broadsheet Mini Cards */}
              {msg.recommendedTutors && msg.recommendedTutors.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                  <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
                    Giáo viên gợi ý phù hợp:
                  </span>
                  {msg.recommendedTutors.map((tutor: any) => (
                    <a
                      key={tutor.id}
                      href={`/giao-vien/${tutor.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200/70 hover:border-blue-200 transition-all group shadow-3xs"
                    >
                      <img
                        src={tutor.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
                        alt={tutor.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200/80 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {tutor.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                          {tutor.hourlyRate || (tutor.price ? `${tutor.price.toLocaleString('vi-VN')}đ/h` : 'Học phí ưu đãi')}
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-white group-hover:bg-blue-600 text-slate-400 group-hover:text-white border border-slate-200/60 group-hover:border-blue-600 flex items-center justify-center transition-all shadow-3xs shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs w-fit shadow-2xs text-xs text-slate-500 animate-in fade-in duration-150">
            <div className="flex items-center gap-1 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse [animation-delay:0.4s]" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Trợ lý đang suy nghĩ...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips Carousel */}
      <div className="px-3.5 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-0.5" />
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] font-medium bg-slate-50 hover:bg-blue-50 active:bg-blue-100 text-slate-600 hover:text-blue-700 border border-slate-200/70 hover:border-blue-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-3xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-100 shrink-0"
      >
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-1 flex items-center gap-1.5 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-2xs">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Hỏi về giáo viên, học phí, quy trình học thử..."
            className="flex-1 bg-transparent px-3 py-1.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-hidden font-normal"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0"
            title="Gửi câu hỏi"
            aria-label="Gửi câu hỏi"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
