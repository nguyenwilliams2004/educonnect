import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, RotateCcw, Sparkles, ExternalLink, Settings, MessageSquare } from 'lucide-react';
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

// Messenger Icon chính hãng
export function MessengerLogoIcon({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="messengerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="50%" stopColor="#0078FF" />
          <stop offset="100%" stopColor="#A033FF" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#messengerGrad)" />
      <path
        d="M50 18 C31.77 18 17 31.62 17 48.42 C17 58.01 22.06 66.52 30 72.03 L30 83 L40.59 77.19 C43.59 78.02 46.74 78.47 50 78.47 C68.23 78.47 83 64.85 83 48.42 C83 31.62 68.23 18 50 18 Z"
        fill="#ffffff"
      />
      <path
        d="M33 55.5 L46 41.5 L53 49 L66.5 41.5 L53.5 55.5 L46.5 48 Z"
        fill="url(#messengerGrad)"
      />
    </svg>
  );
}

// Các câu hỏi gợi ý nhanh (Đã loại bỏ câu 30%/70% theo yêu cầu của bạn)
const QUICK_PROMPTS = [
  "Quy trình kết nối & học thử như thế nào?",
  "Tìm giáo viên Toán luyện thi tại Hà Nội",
  "Tỷ lệ nhận lớp thành công là gì?",
  "Làm thế nào để đăng ký trở thành gia sư?"
];

export default function AiChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { tutors } = useData();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('hantutor_gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào! Tôi là **Trợ lý AI HanTutor** 🎓\n\nTôi có thể giúp bạn giải đáp mọi thắc mắc về:\n- 🎯 **Quy trình học thử & kết nối giáo viên**\n- 🔍 **Tìm kiếm gia sư/giáo viên** theo môn học, khu vực tại Hà Nội\n- 🌟 **Tỷ lệ nhận lớp thành công** & Chính sách xác thực KYC\n- 📝 **Hướng dẫn đăng ký giảng dạy** cho giáo viên & sinh viên\n\nBạn cần hỗ trợ thông tin gì hôm nay?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Bộ phân tích & xử lý nghiệp vụ thông minh cho HanTutor (Smart Domain Inference Engine)
  const generateHanTutorResponse = (query: string): { text: string; recommendedTutors?: any[] } => {
    const q = query.toLowerCase().trim();

    // 1. Câu hỏi về quy trình học thử & kết nối
    if (q.includes('quy trình') || q.includes('học thử') || q.includes('kết nối') || q.includes('liên hệ')) {
      return {
        text: `### 📚 Quy trình Kết nối & Học thử tại HanTutor:\n\n1. **Bước 1: Chọn Giáo viên phù hợp**\n   Học sinh duyệt danh sách giáo viên/gia sư theo môn học, quận tại Hà Nội, xem hồ sơ học vấn, bằng cấp và tỷ lệ nhận lớp.\n\n2. **Bước 2: Ấn "Liên hệ ngay"**\n   Hệ thống sẽ cung cấp số Zalo & SĐT chính thức của giáo viên để 2 bên trực tiếp trao đổi lịch học và nhu cầu.\n\n3. **Bước 3: Buổi học thử 1-1**\n   Học sinh và giáo viên tiến hành buổi học thử để đánh giá mức độ tương thích và phương pháp giảng dạy.\n\n4. **Bước 4: Quyết định sau học thử**\n   - **Nếu tiếp tục:** Học sinh bấm *"Đăng ký học chính thức"* trên hệ thống.\n   - **Nếu không tiếp tục:** Học sinh có thể chọn *"Không tiếp tục"*, lớp học thử sẽ được xóa bỏ khỏi danh sách, và hệ thống tự động ghi nhận giảm tỷ lệ nhận lớp của giáo viên để đảm bảo tính khách quan.`
      };
    }

    // 2. Câu hỏi về tỷ lệ nhận lớp thành công
    if (q.includes('tỷ lệ') || q.includes('nhận lớp') || q.includes('thành công') || q.includes('chốt học')) {
      return {
        text: `### 🌟 Tỷ lệ Nhận lớp Thành công là gì?\n\n- **Định nghĩa:** Đây là chỉ số minh bạch thể hiện tỷ lệ phần trăm số học viên quyết định **đăng ký học chính thức** sau khi đã hoàn thành buổi học thử với giáo viên (\`Số học viên chốt học / Tổng lượt học thử\`).\n\n- **Cơ chế tự động:**\n  - Khi học sinh bấm *"Liên hệ ngay"*, lượt học thử được ghi nhận.\n  - Nếu học sinh bấm *"Đăng ký học chính thức"*, tỷ lệ nhận lớp sẽ **tăng lên**.\n  - Nếu học sinh học thử xong nhưng chọn *"Không tiếp tục"*, tỷ lệ nhận lớp sẽ **tự động giảm xuống**.\n\nChỉ số này giúp phụ huynh và học sinh đánh giá chính xác chất lượng giảng dạy thực tế của giáo viên!`
      };
    }

    // 3. Câu hỏi về đăng ký làm giáo viên / KYC
    if (q.includes('đăng ký') && (q.includes('gia sư') || q.includes('giáo viên') || q.includes('dạy') || q.includes('kyc'))) {
      return {
        text: `### 👩‍🏫 Hướng dẫn Đăng ký trở thành Giáo viên / Gia sư:\n\n1. **Đăng ký tài khoản:** Bấm nút **"Đăng ký ngay"** ở góc phải trên cùng và chọn vai trò **"Giáo viên / Gia sư"** (hoặc truy cập trang \`/dang-ky-gia-su\`).\n2. **Điền thông tin & Hồ sơ:** Cung cấp học vấn, bằng cấp, môn giảng dạy, khu vực tại Hà Nội và học phí mong muốn.\n3. **Xác thực KYC minh bạch:** Tải lên ảnh CCCD (mặt trước/sau) và bằng tốt nghiệp đại học / chứng chỉ chuyên môn.\n4. **Phê duyệt nhanh:** Ban quản trị Admin sẽ kiểm duyệt hồ sơ. Sau khi duyệt, hồ sơ của bạn sẽ **hiển thị trực tiếp ngay trên trang chủ và trang tìm kiếm** HanTutor để học sinh kết nối!`
      };
    }

    // 4. Tìm kiếm giáo viên theo môn học hoặc khu vực
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
        `- **${t.name}** (${t.subjects?.join(', ')}): ${t.title || t.headline} — Học phí: **${t.hourlyRate}đ/giờ** (Tỷ lệ nhận lớp: **${t.trialStats?.totalTrials > 0 ? Math.round((t.trialStats.officialEnrolled / t.trialStats.totalTrials) * 100) : 96}%**)`
      ).join('\n');

      return {
        text: `### 🎯 Gợi ý Giáo viên / Gia sư phù hợp dành cho bạn:\n\n${tutorListMarkdown}\n\n👉 Bạn có thể bấm vào thẻ giáo viên trên màn hình để xem đầy đủ bằng cấp và bấm **"Liên hệ ngay"** để trao đổi Zalo học thử nhé!`,
        recommendedTutors: matchedTutors
      };
    }

    // 5. Câu trả lời mặc định thông minh
    return {
      text: `Cảm ơn câu hỏi của bạn! HanTutor là nền tảng kết nối trực tiếp giữa Phụ huynh/Học sinh và Giáo viên/Gia sư chất lượng cao tại Hà Nội.\n\n- Bạn có thể **tìm kiếm giáo viên** theo quận và môn học trên thanh tìm kiếm.\n- Bấm **"Liên hệ ngay"** tại hồ sơ giáo viên để kết nối Zalo và sắp xếp buổi học thử 1-1 miễn phí.\n- Đội ngũ Admin kiểm duyệt 100% hồ sơ CCCD & Bằng cấp.\n\nNếu bạn muốn kết nối trực tiếp với Đội ngũ Hỗ trợ HanTutor, hãy bấm vào nút **Facebook Messenger** màu xanh ở góc màn hình nhé!`
    };
  };

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

    // Kiểm tra nếu có API Key Gemini hợp lệ
    const activeKey = apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (activeKey) {
      try {
        const systemPrompt = `Bạn là Trợ lý AI thông minh của nền tảng gia sư HanTutor (fasttryon.com).
Nhiệm vụ của bạn là tư vấn tận tình, lịch sự, chuẩn mực cho Phụ huynh và Học sinh về việc tìm gia sư, quy trình học thử, và chính sách của website.
Kiến thức HanTutor:
- Khu vực: Tập trung các quận tại TP. Hà Nội.
- Môn học: Văn hóa (Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa) và Năng khiếu/Nghệ thuật (Đàn, Bơi, Võ, Cờ vua, Lập trình).
- Quy trình: Học sinh chọn giáo viên -> Bấm "Liên hệ ngay" -> Lấy số Zalo -> Trao đổi và học thử 1-1 miễn phí -> Sau học thử: Nếu tiếp tục thì bấm "Đăng ký học chính thức"; nếu không tiếp tục thì lớp học thử bị xóa bỏ và tỷ lệ nhận lớp của giáo viên tự động giảm khách quan.
- Xác thực KYC: Toàn bộ giáo viên được Admin duyệt CCCD 2 mặt và bằng cấp/chứng chỉ trước khi hiển thị lên web.
Hãy trả lời ngắn gọn, rõ ràng, định dạng Markdown đẹp mắt bằng tiếng Việt.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nNgười dùng hỏi: ${messageText}` }]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiResponseText) {
            const aiMsg: ChatMessage = {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: aiResponseText,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Gemini API call error, using HanTutor built-in engine", err);
      }
    }

    // Fallback: Sử dụng HanTutor Domain Knowledge Engine (Độ trễ tự nhiên 500ms)
    setTimeout(() => {
      const responseData = generateHanTutorResponse(messageText);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: responseData.text,
        recommendedTutors: responseData.recommendedTutors,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'ai',
        text: `Đã làm mới cuộc hội thoại! Bạn có thắc mắc gì về quy trình học thử, giáo viên hoặc môn học tại HanTutor không?`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[560px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 select-text">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-4 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 shadow-sm shrink-0 flex items-center justify-center">
            <AiChatLogoIcon className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm tracking-tight text-white truncate">Trợ lý AI HanTutor</h3>
              <span className="bg-white/25 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">AI 24/7</span>
            </div>
            <p className="text-[11px] text-orange-100 truncate mt-0.5">Am hiểu nghiệp vụ & kết nối giáo viên</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
            title="Cài đặt API"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
            title="Làm mới đoạn chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Modal Bar (Optional Gemini API key) */}
      {showSettings && (
        <div className="bg-orange-50/90 border-b border-orange-100 p-3 text-xs shrink-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-bold text-slate-800">Cấu hình Google Gemini API (Tùy chọn):</span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
          <input
            type="password"
            placeholder="Dán Gemini API Key của bạn (hoặc để trống)"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              localStorage.setItem('hantutor_gemini_api_key', e.target.value);
            }}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-orange-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            * Mặc định hệ thống sử dụng Trợ lý nghiệp vụ chuyên sâu HanTutor tích hợp sẵn.
          </p>
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
                    return <div key={i} className="font-extrabold text-sm text-orange-600 mt-1 mb-1">{line.replace('### ', '')}</div>;
                  }
                  if (line.startsWith('- **') || line.startsWith('1. **') || line.startsWith('2. **') || line.startsWith('3. **') || line.startsWith('4. **')) {
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
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 shrink-0" />
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
            <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin" />
            <span>Trợ lý AI HanTutor đang soạn câu trả lời...</span>
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
            className="text-[11px] font-medium bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-slate-200/70 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
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
          placeholder="Hỏi AI về giáo viên, học thử, môn học..."
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
