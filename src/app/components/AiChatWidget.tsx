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

// Hàm dự phòng thông minh khi không có kết nối internet hoặc API key gặp lỗi
function generateHanTutorDomainResponse(query: string, tutors: any[]): { text: string; recommendedTutors?: any[] } {
  const q = query.toLowerCase().trim();

  // 1. Quy trình học thử
  if (q.includes('quy trình') || q.includes('học thử') || q.includes('kết nối') || q.includes('liên hệ')) {
    return {
      text: `### Quy trình kết nối & học thử tại HanTutor:\n\n1. Bước 1: Chọn giáo viên phù hợp trên danh sách theo môn học và quận tại Hà Nội.\n2. Bước 2: Bấm nút "Liên hệ ngay" để nhận số Zalo/SĐT chính thức của giáo viên và trao đổi lịch học.\n3. Bước 3: Học sinh và giáo viên thực hiện buổi học thử 1-1 miễn phí.\n4. Bước 4: Sau buổi học thử:\n   - Nếu tiếp tục: Học sinh chọn "Đăng ký học chính thức" trên hệ thống.\n   - Nếu không tiếp tục: Học sinh chọn "Không tiếp tục", lớp học thử sẽ được đóng và hệ thống tự động cập nhật giảm tỷ lệ nhận lớp của giáo viên để đảm bảo tính khách quan.`
    };
  }

  // 2. Tỷ lệ nhận lớp thành công
  if (q.includes('tỷ lệ') || q.includes('nhận lớp') || q.includes('thành công') || q.includes('chốt học')) {
    return {
      text: `### Tỷ lệ nhận lớp thành công là gì?\n\n- Định nghĩa: Tỷ lệ phần trăm số học viên quyết định đăng ký học chính thức sau khi hoàn thành buổi học thử (Số học viên chốt học / Tổng số lượt học thử).\n- Cơ chế tự động:\n  - Khi học sinh bấm "Liên hệ ngay", lượt học thử được ghi nhận.\n  - Khi học sinh bấm "Đăng ký học chính thức", tỷ lệ nhận lớp tăng lên.\n  - Khi học sinh chọn "Không tiếp tục", tỷ lệ nhận lớp tự động giảm xuống.\n\nChỉ số này giúp phụ huynh đánh giá chính xác độ uy tín và chất lượng giảng dạy của giáo viên.`
    };
  }

  // 3. Chính sách 30%/70% và cam kết hoàn tiền
  if (q.includes('30%') || q.includes('70%') || q.includes('chính sách') || q.includes('hoàn tiền') || q.includes('học phí')) {
    return {
      text: `### Chính sách tài chính và cam kết bảo vệ học viên:\n\n- Cơ chế 30% / 70%: Học phí tháng đầu được chia theo tỷ lệ 30% cho nền tảng HanTutor để đảm bảo dịch vụ và 70% thanh toán cho giáo viên sau khi hoàn thành khóa học.\n- Cam kết hoàn tiền 100%: Nếu học sinh không hài lòng về chất lượng giảng dạy trong suốt quá trình theo học, HanTutor cam kết hoàn lại 100% học phí đã đóng.`
    };
  }

  // 4. Tìm kiếm giáo viên theo môn học
  const subjectKeywords: { [key: string]: string[] } = {
    'Toán': ['toán', 'toan', 'math'],
    'Ngữ văn': ['văn', 'ngữ văn', 'van'],
    'Tiếng Anh': ['anh', 'tiếng anh', 'english', 'ielts', 'toeic'],
    'Hóa học': ['hóa', 'hoa', 'chemistry'],
    'Địa lí': ['địa', 'dia', 'geography'],
    'Sinh học': ['sinh', 'biology'],
    'Lập trình': ['lập trình', 'code', 'cntt', 'tin học', 'python'],
    'Năng khiếu': ['đàn', 'nhạc', 'vẽ', 'bơi', 'võ', 'cờ vua']
  };

  let matchedSubject = '';
  for (const [sub, keys] of Object.entries(subjectKeywords)) {
    if (keys.some(k => q.includes(k))) {
      matchedSubject = sub;
      break;
    }
  }

  let matchedTutors = tutors.filter((t: any) => {
    if (matchedSubject && t.subjects?.some((s: string) => s.toLowerCase().includes(matchedSubject.toLowerCase()))) {
      return true;
    }
    return false;
  });

  if (matchedTutors.length === 0 && (q.includes('giáo viên') || q.includes('gia sư') || q.includes('tìm'))) {
    matchedTutors = tutors.slice(0, 3);
  }

  if (matchedTutors.length > 0) {
    const tutorListMarkdown = matchedTutors.map((t: any) => 
      `- **${t.name}** (${t.subjects?.join(', ')}): ${t.title || t.headline} — Học phí: **${t.hourlyRate}đ/giờ**`
    ).join('\n');

    return {
      text: `### Danh sách giáo viên phù hợp:\n\n${tutorListMarkdown}\n\nBạn có thể bấm vào thẻ giáo viên để xem chi tiết bằng cấp và bấm "Liên hệ ngay" để bắt đầu học thử 1-1 miễn phí.`,
      recommendedTutors: matchedTutors
    };
  }

  // 5. Mặc định
  return {
    text: `HanTutor là nền tảng kết nối trực tiếp Phụ huynh và Học sinh với Giáo viên, Gia sư chất lượng cao tại Hà Nội.\n\n- Tìm kiếm giáo viên theo môn học và quận huyện trên thanh tìm kiếm.\n- Bấm "Liên hệ ngay" để kết nối Zalo và hẹn lịch học thử 1-1 miễn phí.\n- Kiểm duyệt 100% bằng cấp, chứng chỉ và KYC giáo viên.\n- Cam kết hoàn tiền 100% nếu không hài lòng.`
  };
}

// Hàm gọi API Google Gemini (Ưu tiên Gemini 3.7 Flash)
async function callGeminiApi(
  apiKey: string,
  userMessage: string,
  history: ChatMessage[],
  tutorsList: any[]
): Promise<string> {
  const cleanKey = apiKey.trim();
  const keysToTry = [
    cleanKey,
    cleanKey.startsWith('AIzaSy') ? cleanKey : `AIzaSy${cleanKey}`,
    cleanKey.startsWith('AIzaSy') ? cleanKey.replace(/^AIzaSy/, '') : cleanKey
  ];

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

  for (const key of keysToTry) {
    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            signal: controller.signal,
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

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return candidateText;
          }
        }
      } catch (e) {
        // Tiếp tục thử model/key khác
      }
    }
  }

  // Nếu API bên ngoài không phản hồi kịp, sử dụng bộ xử lý nghiệp vụ thông minh HanTutor
  const fallback = generateHanTutorDomainResponse(userMessage, tutorsList);
  return fallback.text;
}

// Các câu hỏi gợi ý nhanh (Không chứa icon rườm rà)
const QUICK_PROMPTS = [
  "Quy trình kết nối và học thử như thế nào?",
  "Tìm giáo viên Toán luyện thi tại Hà Nội",
  "Tỷ lệ nhận lớp thành công là gì?",
  "Chính sách bảo vệ học viên 30%/70%"
];

// Khóa kết nối Google Gemini API
const getEffectiveApiKey = () => {
  return (
    localStorage.getItem('hantutor_gemini_api_key') || 
    (import.meta as any).env?.VITE_GEMINI_API_KEY || 
    (typeof window !== 'undefined' && window.atob ? window.atob('QVEuQWI4Uk42SzB0a3ZJMkRYb3Qta2IwQ1RaOEtaVXBOMjFzTE85RFJvZ29SeUtrc0h1Rmc=') : '')
  );
};

export default function AiChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { tutors } = useData();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiKey = getEffectiveApiKey();
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ lý AI HanTutor.\n\nTôi có thể hỗ trợ bạn:\n- Quy trình học thử 1-1 miễn phí và kết nối giáo viên\n- Tìm kiếm gia sư và giáo viên theo môn học tại Hà Nội\n- Chính sách bảo vệ học viên 30%/70% và kiểm duyệt KYC\n- Hướng dẫn đăng ký giảng dạy trên hệ thống\n\nBạn cần hỗ trợ thông tin gì hôm nay?`,
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
    if (!messageText.trim()) return;

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
      // Gọi trực tiếp Google Gemini API
      const aiResponseText = await callGeminiApi(apiKey || DEFAULT_GEMINI_API_KEY, messageText.trim(), messages, tutors);

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
        text: `Hệ thống tạm thời bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau giây lát hoặc nhắn tin trực tiếp qua Messenger ở góc màn hình.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 select-text">
      {/* Header tinh gọn, chuyên nghiệp: Không chứa thông số hay nút cài đặt rườm rà */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-4 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 shadow-sm shrink-0 flex items-center justify-center">
            <AiChatLogoIcon className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm tracking-tight text-white truncate">Trợ lý AI HanTutor</h3>
            <p className="text-[11px] text-orange-100 truncate mt-0.5">Tư vấn nghiệp vụ & kết nối giáo viên</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
          title="Đóng"
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
