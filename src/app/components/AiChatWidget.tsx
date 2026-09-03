import { Send, X, Key, Check, HelpCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  ChatMessage,
  queryGeminiChatbot,
  getEffectiveGeminiApiKey,
  isKeyFormatValid,
} from '../../lib/aiChatService';

export type { ChatMessage };

// Logo icon tròn màu cam theo đúng hình ảnh thương hiệu HanTutor
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

// Các câu hỏi gợi ý nhanh
const QUICK_PROMPTS = [
  "Quy trình kết nối và học thử 1-1 như thế nào?",
  "Tìm giáo viên Toán luyện thi tại Hà Nội",
  "Tỷ lệ nhận lớp thành công là gì?",
  "Chính sách bảo vệ học viên & cam kết hoàn tiền 100%"
];

export default function AiChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { tutors } = useData();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(() => getEffectiveGeminiApiKey());
  const [activeKey, setActiveKey] = useState(() => getEffectiveGeminiApiKey());
  const [keySaved, setKeySaved] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ lý AI HanTutor.\n\nTôi có thể hỗ trợ bạn:\n- Quy trình học thử 1-1 miễn phí và kết nối giáo viên\n- Tìm kiếm gia sư và giáo viên theo môn học tại Hà Nội\n- Chính sách tài chính minh bạch và cam kết hoàn tiền 100%\n- Hướng dẫn đăng ký giảng dạy trên hệ thống\n\nBạn cần hỗ trợ thông tin gì hôm nay?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customKeyInput.trim();
    if (clean) {
      localStorage.setItem('hantutor_gemini_api_key', clean);
      setActiveKey(clean);
    } else {
      localStorage.removeItem('hantutor_gemini_api_key');
      setActiveKey('');
    }
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowConfig(false);
    }, 1200);
  };

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

  const isGeminiLive = Boolean(activeKey && isKeyFormatValid(activeKey));

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[84vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 select-text">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-3.5 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-white p-1 shadow-sm shrink-0 flex items-center justify-center">
            <AiChatLogoIcon className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">Trợ lý AI HanTutor</h3>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                isGeminiLive 
                  ? 'bg-emerald-400 text-emerald-950 ring-1 ring-white/50' 
                  : 'bg-amber-300 text-amber-950'
              }`}>
                {isGeminiLive ? 'Gemini 3.8 Flash' : 'Nghiệp vụ'}
              </span>
            </div>
            <p className="text-[10px] text-orange-100 truncate mt-0.5">Tư vấn quy trình & gợi ý giáo viên</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              showConfig ? 'bg-white/30 text-white' : 'hover:bg-white/20 text-orange-100'
            }`}
            title="Cấu hình Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Config Panel (ẩn/hiện khi bấm icon Chìa khóa) */}
      {showConfig && (
        <div className="bg-slate-900 text-white p-3.5 text-xs shrink-0 border-b border-slate-800 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold flex items-center gap-1 text-[11px] text-amber-300">
              <Key className="w-3 h-3" /> Cấu hình Google Gemini LLM API Key
            </span>
            <span className="text-[10px] text-slate-400">Context: {tutors.length} giáo viên</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
            Nhập Google AI Studio Key (bắt đầu bằng <code className="text-amber-400">AIzaSy...</code>) để kích hoạt LLM trực tiếp. Nếu để trống, chatbot sử dụng bộ quy chuẩn nghiệp vụ HanTutor.
          </p>
          <form onSubmit={handleSaveApiKey} className="flex gap-1.5">
            <input
              type="password"
              value={customKeyInput}
              onChange={(e) => setCustomKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-amber-400 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              {keySaved ? <Check className="w-3 h-3" /> : 'Lưu'}
            </button>
          </form>
        </div>
      )}

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
              }`}
            >
              {/* Markdown Content rendering */}
              <div className="space-y-1.5 whitespace-pre-wrap">
                {msg.text.split('\n').map((line, i) => {
                  if (line.startsWith('### ')) {
                    return <div key={i} className="font-extrabold text-sm text-slate-900 mt-1 mb-1">{line.replace('### ', '')}</div>;
                  }
                  if (line.startsWith('- ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                    return <div key={i} className="pl-1 text-slate-700">{line}</div>;
                  }
                  return <div key={i}>{line}</div>;
                })}
              </div>

              {/* Recommended Tutors Mini Cards */}
              {msg.recommendedTutors && msg.recommendedTutors.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                  <span className="font-bold text-[11px] text-slate-700 block">Danh sách giáo viên gợi ý:</span>
                  {msg.recommendedTutors.map((tutor: any) => (
                    <a
                      key={tutor.id}
                      href={`/giao-vien/${tutor.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-orange-50 rounded-xl border border-slate-200/70 transition-colors group"
                    >
                      <img
                        src={tutor.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
                        alt={tutor.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[11px] text-slate-900 truncate group-hover:text-orange-600">
                          {tutor.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects} • {tutor.hourlyRate || tutor.price}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* Offline Fallback Badge */}
              {msg.isFallback && msg.sender === 'ai' && (
                <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-2.5 h-2.5" /> Chế độ quy chuẩn nghiệp vụ
                  </span>
                  {!isGeminiLive && (
                    <button
                      type="button"
                      onClick={() => setShowConfig(true)}
                      className="text-orange-600 hover:underline cursor-pointer font-medium"
                    >
                      Kích hoạt Gemini AI
                    </button>
                  )}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200/80 rounded-2xl w-fit text-xs text-slate-500 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1 text-[11px]">Trợ lý AI đang suy nghĩ...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
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
        className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Hỏi về giáo viên, môn học, quy trình học thử 1-1..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-2xl transition-all shadow-sm cursor-pointer shrink-0"
          title="Gửi câu hỏi"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
