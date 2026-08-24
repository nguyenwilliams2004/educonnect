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

// Các câu hỏi gợi ý nhanh (Không chứa icon rườm rà)
const QUICK_PROMPTS = [
  "Quy trình kết nối và học thử như thế nào?",
  "Tìm giáo viên Toán luyện thi tại Hà Nội",
  "Tỷ lệ nhận lớp thành công là gì?",
  "Hướng dẫn đăng ký trở thành gia sư"
];

export default function AiChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { tutors } = useData();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ lý AI HanTutor.\n\nTôi có thể hỗ trợ bạn:\n- Quy trình học thử và kết nối giáo viên\n- Tìm kiếm gia sư và giáo viên theo môn học tại Hà Nội\n- Tìm hiểu về tỷ lệ nhận lớp thành công và xác thực KYC\n- Hướng dẫn đăng ký giảng dạy trên hệ thống\n\nBạn cần hỗ trợ thông tin gì hôm nay?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Bộ phân tích nghiệp vụ HanTutor chuyên sâu (Không cần nhập API key)
  const generateHanTutorResponse = (query: string): { text: string; recommendedTutors?: any[] } => {
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

    // 3. Đăng ký làm giáo viên / KYC
    if (q.includes('đăng ký') && (q.includes('gia sư') || q.includes('giáo viên') || q.includes('dạy') || q.includes('kyc'))) {
      return {
        text: `### Hướng dẫn đăng ký trở thành Giáo viên / Gia sư:\n\n1. Đăng ký tài khoản: Bấm "Đăng ký ngay" ở góc trên cùng và chọn vai trò "Giáo viên / Gia sư" (hoặc vào mục Đăng ký gia sư).\n2. Điền thông tin hồ sơ: Học vấn, môn giảng dạy, khu vực tại Hà Nội và mức học phí mong muốn.\n3. Xác thực hồ sơ KYC: Tải lên ảnh CCCD (2 mặt) và bằng tốt nghiệp/chứng chỉ chuyên môn.\n4. Phê duyệt: Ban quản trị kiểm duyệt hồ sơ và duyệt kích hoạt hiển thị trực tiếp lên hệ thống.`
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
        `- **${t.name}** (${t.subjects?.join(', ')}): ${t.title || t.headline} — Học phí: **${t.hourlyRate}đ/giờ** (Tỷ lệ nhận lớp: **${t.trialStats?.totalTrials > 0 ? Math.round((t.trialStats.officialEnrolled / t.trialStats.totalTrials) * 100) : 96}%**)`
      ).join('\n');

      return {
        text: `### Danh sách giáo viên phù hợp:\n\n${tutorListMarkdown}\n\nBạn có thể bấm vào thẻ giáo viên để xem chi tiết bằng cấp và bấm "Liên hệ ngay" để bắt đầu học thử.`,
        recommendedTutors: matchedTutors
      };
    }

    // 5. Mặc định
    return {
      text: `HanTutor là nền tảng kết nối trực tiếp Phụ huynh và Học sinh với Giáo viên, Gia sư chất lượng cao tại Hà Nội.\n\n- Tìm kiếm giáo viên theo môn học và quận huyện trên thanh tìm kiếm.\n- Bấm "Liên hệ ngay" để kết nối Zalo và hẹn lịch học thử 1-1 miễn phí.\n- Ban quản trị kiểm duyệt 100% bằng cấp và chứng chỉ của giáo viên.\n\nĐể trao đổi trực tiếp với bộ phận hỗ trợ, bạn có thể bấm vào nút Facebook Messenger ở góc dưới màn hình.`
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
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 select-text">
      {/* Header tinh gọn: Không có icon thừa, không có dán API */}
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
