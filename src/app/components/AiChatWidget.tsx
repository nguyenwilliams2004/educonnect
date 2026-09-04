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

// Logo AI HanTutor chuẩn nhận diện thương hiệu (Royal Blue & Amber Spark)
export function AiChatLogoIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="HanTutor AI">
      <defs>
        {/* Gradient nền thông minh: Deep Indigo -> Royal Blue -> Azure Cyan */}
        <linearGradient id="hantutorAiBg" x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="45%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Gradient điểm nhấn Amber đặc trưng của HanTutor */}
        <linearGradient id="hantutorAmberSpark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#FF9000" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Gradient ánh sáng viền nổi 3D */}
        <radialGradient id="hantutorAiGlow" cx="50%" cy="38%" r="48%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Nền tròn phong cách HanTutor với viền ánh sáng tinh tế */}
      <circle cx="50" cy="50" r="48" fill="url(#hantutorAiBg)" />
      <circle cx="50" cy="50" r="47" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="50" cy="38" r="36" fill="url(#hantutorAiGlow)" />

      {/* Biểu tượng hội thoại trí tuệ nhân tạo (Speech bubble bo tròn tinh tế) */}
      <path
        d="M50 21 C33.5 21 20 33.2 20 48 C20 54.6 22.8 60.6 27.4 65.2 L24.5 75.5 C24.1 76.8 25.4 78 26.7 77.3 L36.8 72.2 C40.8 74.1 45.3 75 50 75 C66.5 75 80 62.8 80 48 C80 33.2 66.5 21 50 21 Z"
        fill="#FFFFFF"
        fillOpacity="0.14"
        stroke="#FFFFFF"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />

      {/* Ngôi sao AI Sparkle 4 cánh sắc sảo (Generative AI Core) */}
      <path
        d="M50 28 C50 38 42 46 32 46 C42 46 50 54 50 64 C50 54 58 46 68 46 C58 46 50 38 50 28 Z"
        fill="#FFFFFF"
      />

      {/* Ngôi sao phụ HanTutor Amber Sparkle tượng trưng cho con người & tri thức */}
      <path
        d="M66 26 C66 30 62.5 33.5 58.5 33.5 C62.5 33.5 66 37 66 41 C66 37 69.5 33.5 73.5 33.5 C69.5 33.5 66 30 66 26 Z"
        fill="url(#hantutorAmberSpark)"
      />

      {/* Vi hạt trí tuệ xanh ngọc */}
      <circle cx="33" cy="57" r="2.5" fill="#BAE6FD" />
    </svg>
  );
}

// Logo Facebook Messenger chuẩn nhận diện hình ảnh người dùng cung cấp
export function MessengerLogoIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 994 994" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Messenger">
      <defs>
        <linearGradient id="messengerBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0A7CFF" />
          <stop offset="100%" stopColor="#0064FF" />
        </linearGradient>
      </defs>
      {/* Khối bong bóng chat Messenger màu xanh đặc trưng */}
      <path
        fill="url(#messengerBlueGradient)"
        d="M497 0C217 0 0 205.1 0 482.1C0 627 59.4 752.2 156.1 838.7c8.1 7.3 13 17.4 13.4 28.3l2.7 88.4c0.9 28.2 30 46.5 55.8 35.2l98.6-43.5c8.4-3.7 17.7-4.4 26.5-2c45.3 12.5 93.6 19.1 143.9 19.1c280 0 497-205.1 497-482.1S777 0 497 0z"
      />
      {/* Biểu tượng tia sét trắng bo góc mềm mại chuẩn xác */}
      <path
        fill="#FFFFFF"
        d="M198.6 623.1l146-231.6c23.2-36.8 73-46 107.8-19.9l116.1 87.1c10.7 8 25.3 7.9 35.9-0.1l156.8-119c20.9-15.9 48.3 9.2 34.2 31.4L649.5 602.5c-23.2 36.8-73 46-107.8 19.9l-116.1-87.1c-10.7-8-25.3-7.9-35.9 0.1L232.8 654.5C211.9 670.4 184.5 645.3 198.6 623.1z"
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
          <div className="w-9 h-9 rounded-2xl bg-blue-50/80 border border-blue-100/80 flex items-center justify-center p-1.5 shadow-2xs shrink-0">
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
