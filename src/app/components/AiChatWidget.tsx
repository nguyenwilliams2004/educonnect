import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useData } from '../App';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendedTutors?: any[];
}

// Logo icon tròn màu cam theo đúng hình ảnh người dùng cung cấp
export function AiChatLogoIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="50" fill="#f0551c" />
      {/* Bong bóng chat màu trắng hình viên thuốc */}
      <rect x="22" y="28" width="56" height="34" rx="17" fill="#ffffff" />
      {/* Đuôi bong bóng chat */}
      <path d="M48 60 L54 74 L54 60 Z" fill="#ffffff" />
      {/* 3 chấm màu cam */}
      <circle cx="38" cy="45" r="4" fill="#f0551c" />
      <circle cx="50" cy="45" r="4" fill="#f0551c" />
      <circle cx="62" cy="45" r="4" fill="#f0551c" />
    </svg>
  );
}

// Logo Facebook Messenger chính thức theo đúng ảnh người dùng gửi
export function MessengerLogoIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Nền xanh dương Messenger */}
      <circle cx="50" cy="50" r="50" fill="#0064FF" />
      {/* Tia chớp Messenger màu trắng */}
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

// System instruction chứa toàn bộ tri thức nghiệp vụ HanTutor
function getHanTutorSystemInstruction(tutors: any[]) {
  const tutorsSummary = tutors.map(t => ({
    id: t.id,
    name: t.name,
    type: t.type,
    subjects: t.subjects,
    badgeSubject: t.badgeSubject,
    hourlyRate: t.hourlyRate,
    location: t.location,
    headline: t.headline,
    title: t.title,
    successRate: t.trialStats?.totalTrials > 0 
      ? Math.round((t.trialStats.officialEnrolled / t.trialStats.totalTrials) * 100) 
      : 95
  }));

  return `Bạn là Trợ lý AI HanTutor thông minh và chuyên nghiệp, đại diện cho nền tảng kết nối Giáo viên & Gia sư chất lượng cao tại Hà Nội (HanTutor - fasttryon.com).

NHIỆM VỤ CHÍNH:
1. Tư vấn quy trình kết nối & học thử:
   - Học sinh tìm giáo viên theo môn/khu vực tại Hà Nội.
   - Bấm "Liên hệ ngay" để nhận Zalo/SĐT trực tiếp và nhận email thông báo xác nhận.
   - Hai bên thống nhất lịch học thử 1-1 miễn phí 01 buổi.
   - Sau học thử: học sinh xác nhận "Đăng ký học chính thức" nếu hài lòng, hoặc "Không tiếp tục" (hệ thống tự động giảm tỷ lệ nhận lớp của giáo viên để đảm bảo tính khách quan).
2. Chính sách tài chính minh bạch:
   - Thu 30% học phí tháng đầu cho trung tâm và 70% trả cho giáo viên sau khi hoàn thành giảng dạy.
   - Cam kết hoàn tiền 100% nếu học sinh không hài lòng.
3. Kiểm duyệt KYC:
   - 100% giáo viên được đối soát CCCD 2 mặt và bằng cấp sư phạm / chứng chỉ chuyên môn.
4. DANH SÁCH GIÁO VIÊN VÀ GIA SƯ HIỆN CÓ TRÊN HỆ THỐNG:
${JSON.stringify(tutorsSummary, null, 2)}

NGUYÊN TẮC TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt, ngắn gọn, lịch sự, chuẩn xác, không dài dòng.
- TUYỆT ĐỐI KHÔNG sử dụng icon hoặc emoji trang trí rườm rà.
- Khi người dùng tìm môn cụ thể (Toán, Văn, Anh, Hóa, Lập trình, Bơi lội, Đàn...), hãy gợi ý đích danh các giáo viên trong danh sách trên kèm môn, mức học phí và link hồ sơ /giao-vien/{id}.`;
}

// Hàm gọi API Google Gemini (Ưu tiên Gemini 3.7 Flash)
async function callGeminiApi(
  apiKey: string,
  userMessage: string,
  history: ChatMessage[],
  tutorsList: any[]
): Promise<string> {
  const modelsToTry = [
    'gemini-3.7-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  const contents = [
    ...history.filter(m => m.id !== 'welcome').slice(-6).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  const systemInstructionText = getHanTutorSystemInstruction(tutorsList);
  let lastErrorMsg = '';

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstructionText }]
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return candidateText;
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        lastErrorMsg = errData.error?.message || `Lỗi HTTP ${response.status}`;
      }
    } catch (e: any) {
      lastErrorMsg = e.message || 'Lỗi kết nối mạng tới Google Gemini';
    }
  }

  throw new Error(lastErrorMsg || "Không thể nhận phản hồi từ mô hình Gemini 3.7 Flash");
}

// Các câu hỏi gợi ý nhanh (Không chứa icon rườm rà)
const QUICK_PROMPTS = [
  "Quy trình kết nối và học thử như thế nào?",
  "Tìm giáo viên Toán luyện thi tại Hà Nội",
  "Tỷ lệ nhận lớp thành công là gì?",
  "Chính sách bảo vệ học viên 30%/70%"
];

export default function AiChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { tutors } = useData();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('hantutor_gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  });
  const [isSettingKey, setIsSettingKey] = useState(false);
  const [tempKey, setTempKey] = useState('');
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ lý AI HanTutor (Sử dụng mô hình Gemini 3.7 Flash).\n\nTôi có thể hỗ trợ bạn:\n- Quy trình học thử 1-1 miễn phí và kết nối giáo viên\n- Tìm kiếm gia sư và giáo viên theo môn học tại Hà Nội\n- Chính sách bảo vệ học viên 30%/70% và kiểm duyệt KYC\n- Hướng dẫn đăng ký giảng dạy trên hệ thống\n\nBạn cần hỗ trợ thông tin gì hôm nay?`,
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
    if (tempKey.trim()) {
      localStorage.setItem('hantutor_gemini_api_key', tempKey.trim());
      setApiKey(tempKey.trim());
      setIsSettingKey(false);
      alert("Đã lưu Google Gemini API Key thành công! Chatbot sẽ gọi trực tiếp mô hình Gemini 3.7 Flash.");
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim()) return;

    // Nếu chưa có API key, mở form nhập key
    if (!apiKey.trim()) {
      setIsSettingKey(true);
      return;
    }

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
      // Gọi trực tiếp Google Gemini API (Gemini 3.7 Flash)
      const aiResponseText = await callGeminiApi(apiKey, messageText.trim(), messages, tutors);

      // Trích xuất giáo viên gợi ý nếu có nhắc đến tên
      const matchedTutors = tutors.filter((t: any) => 
        aiResponseText.toLowerCase().includes(t.name.toLowerCase())
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        recommendedTutors: matchedTutors.length > 0 ? matchedTutors : undefined,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: `Lỗi kết nối Gemini 3.7 Flash: ${err.message || 'Vui lòng kiểm tra lại API Key hoặc kết nối mạng.'}\n\nBạn có thể bấm vào nút "API Key" ở góc trên bên phải để cập nhật API key mới.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[560px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 select-text">
      {/* Header tinh gọn: Hiển thị mô hình Gemini 3.7 Flash & nút quản lý Key */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-3.5 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white p-0.5 shadow-sm shrink-0 flex items-center justify-center">
            <AiChatLogoIcon className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">Trợ lý HanTutor AI</h3>
              <span className="bg-white/20 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-md shrink-0">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-[10px] text-orange-100 truncate">Gọi trực tiếp Google Gemini API</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTempKey(apiKey);
              setIsSettingKey(!isSettingKey);
            }}
            className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1 bg-black/15 px-2.5"
            title="Cài đặt Google Gemini API Key"
          >
            {apiKey ? 'Key: Đã lưu' : 'Nhập API Key'}
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

      {/* Modal/Banner nhập API Key khi chưa có hoặc muốn thay đổi */}
      {isSettingKey && (
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 animate-in slide-in-from-top-2 duration-150 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-amber-400">Google Gemini API Key (Gemini 3.7 Flash)</span>
            <button 
              type="button" 
              onClick={() => setIsSettingKey(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Đóng
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mb-2.5 leading-relaxed">
            Nhập Google Gemini API Key của bạn để chatbot gửi yêu cầu và nhận phản hồi trực tiếp từ mô hình <strong>Gemini 3.7 Flash</strong>.
          </p>
          <form onSubmit={handleSaveApiKey} className="space-y-2">
            <input
              type="password"
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              placeholder="Dán mã API Key (AIzaSy...)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
              required
            />
            <div className="flex items-center justify-between pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-amber-400 hover:underline"
              >
                Lấy API key miễn phí tại Google AI Studio →
              </a>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Lưu Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Thông báo nếu chưa có Key */}
      {!apiKey && !isSettingKey && (
        <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-4 flex items-center justify-between text-xs text-amber-900 shrink-0">
          <span>Chưa cấu hình Gemini API Key.</span>
          <button
            type="button"
            onClick={() => setIsSettingKey(true)}
            className="font-bold underline text-amber-800 hover:text-amber-950 cursor-pointer"
          >
            Nhập Key ngay
          </button>
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
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs ${
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
                  if (line.startsWith('- **') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                    return <div key={i} className="pl-1 text-slate-700">{line}</div>;
                  }
                  return <div key={i}>{line}</div>;
                })}
              </div>

              {/* Recommended Tutors Mini Cards */}
              {msg.recommendedTutors && msg.recommendedTutors.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                  <span className="font-bold text-[11px] text-slate-700 block">Danh sách gợi ý:</span>
                  {msg.recommendedTutors.map((tutor: any) => (
                    <a
                      key={tutor.id}
                      href={`/giao-vien/${tutor.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-orange-50 rounded-xl border border-slate-200/70 transition-colors group"
                    >
                      <img src={tutor.avatar} alt={tutor.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[11px] text-slate-900 truncate group-hover:text-orange-600">{tutor.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{tutor.subjects?.join(', ')} • {tutor.hourlyRate}đ/h</div>
                      </div>
                    </a>
                  ))}
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
            <span className="ml-1">Đang soạn câu trả lời...</span>
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
          placeholder="Hỏi về giáo viên, học thử, môn học..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-2xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
