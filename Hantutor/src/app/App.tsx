import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import { 
  Search, 
  MapPin, 
  Star, 
  BookOpen, 
  MessageCircle, 
  Bell, 
  ChevronDown, 
  CheckCircle,
  GraduationCap,
  Users,
  Briefcase,
  Clock,
  Menu,
  X,
  Filter,
  UploadCloud
} from 'lucide-react';
import { mockTutors, mockClasses } from './data';

// --- CONTEXT FOR MODALS ---
type UIContextType = {
  openAuthModal: (view: 'login' | 'register') => void;
  openInviteModal: (tutor: any) => void;
  openPostClassModal: () => void;
};
const UIContext = createContext<UIContextType | null>(null);

function useUI() {
  return useContext(UIContext) as UIContextType;
}

// --- MODALS ---
function AuthModal({ isOpen, onClose, initialView }: { isOpen: boolean, onClose: () => void, initialView: 'login' | 'register' }) {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [role, setRole] = useState<'parent' | 'tutor'>('parent');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 md:p-8">
          <div className="flex gap-4 border-b border-slate-200 mb-6">
            <button 
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${view === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setView('login')}
            >
              Đăng nhập
            </button>
            <button 
              className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${view === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setView('register')}
            >
              Đăng ký
            </button>
          </div>

          {view === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email hoặc Số điện thoại</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="Nhập email hoặc SĐT..." />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">Quên mật khẩu?</a>
                </div>
                <input type="password" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" />
              </div>
              <button className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mt-2">
                Đăng nhập
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bạn là ai?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setRole('parent')}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${role === 'parent' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Users className="w-5 h-5" /> Phụ huynh/Học sinh
                  </button>
                  <button 
                    onClick={() => setRole('tutor')}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${role === 'tutor' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Briefcase className="w-5 h-5" /> Gia sư/Giáo viên
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                <input type="tel" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="09xx xxx xxx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                <input type="password" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="Tạo mật khẩu" />
              </div>
              {role === 'tutor' && (
                <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  Lưu ý: Bạn sẽ cần tải lên CMND/CCCD và bằng cấp để xác thực hồ sơ gia sư sau khi đăng ký.
                </div>
              )}
              <button 
                onClick={() => {
                  if (role === 'tutor') {
                    onClose();
                    window.location.href = '/dang-ky-gia-su';
                  } else {
                    onClose();
                  }
                }}
                className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mt-2"
              >
                Tạo tài khoản
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InviteTutorModal({ tutor, onClose }: { tutor: any, onClose: () => void }) {
  if (!tutor) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Mời gia sư giảng dạy</h2>
          
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl mb-6">
            <img src={tutor.avatar} alt={tutor.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-bold text-slate-900">{tutor.name}</div>
              <div className="text-sm text-slate-500">{tutor.title} • {tutor.hourlyRate}đ/h</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Môn học cần dạy</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="VD: Toán lớp 10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lời nhắn (Thông tin chi tiết, lịch học...)</label>
              <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Xin chào, tôi muốn tìm gia sư dạy cho bé nhà tôi vào các buổi tối thứ 3, 5..."></textarea>
            </div>
            <button onClick={onClose} className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mt-4 flex justify-center items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Gửi lời mời
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostClassModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Đăng yêu cầu tìm Gia sư</h2>
          <p className="text-slate-500 text-sm mb-6">Mô tả rõ yêu cầu để tìm được gia sư phù hợp nhất.</p>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề bài đăng</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="VD: Cần tìm gia sư Tiếng Anh giao tiếp cấp tốc" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="VD: Tiếng Anh" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức học</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all">
                  <option>Tại nhà (Offline)</option>
                  <option>Trực tuyến (Online)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ (Nếu học tại nhà)</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="Quận/Huyện, Tỉnh/Thành phố..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số buổi/tuần</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all">
                  <option>1 buổi</option>
                  <option>2 buổi</option>
                  <option>3 buổi</option>
                  <option>4+ buổi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Học phí dự kiến/buổi</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all" placeholder="VD: 200.000đ" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yêu cầu khác</label>
              <textarea rows={3} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Yêu cầu giáo viên nữ, có kinh nghiệm luyện thi đại học..."></textarea>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <button onClick={onClose} className="flex-1 px-6 py-3.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
            <button onClick={onClose} className="flex-[2] bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Đăng yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---
function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const { openAuthModal, openPostClassModal } = useUI();

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Tìm Gia Sư', path: '/tim-gia-su' },
    { name: 'Tìm Lớp Mới', path: '/tim-lop' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-b from-blue-100/90 to-white/90 backdrop-blur-md border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-bold text-xl md:text-2xl text-slate-900 tracking-tight">Han<span className="text-blue-600">tutor</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`font-medium transition-colors ${
                  location.pathname === link.path 
                    ? 'text-blue-600' 
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4 relative">
            <button className="text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors" onClick={() => openPostClassModal()}>
              Đăng yêu cầu
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2 rounded-full transition-all relative ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              {/* Notif Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 font-bold text-slate-900">Thông báo</div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="text-sm text-slate-900 font-medium mb-1"><span className="text-blue-600">Nguyễn Hà Anh</span> đã ứng tuyển lớp Toán 10 của bạn.</div>
                      <div className="text-xs text-slate-500">10 phút trước</div>
                    </div>
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="text-sm text-slate-900 font-medium mb-1">Hồ sơ gia sư của bạn đã được duyệt thành công!</div>
                      <div className="text-xs text-slate-500">2 giờ trước</div>
                    </div>
                  </div>
                  <div className="p-3 text-center text-sm text-blue-600 font-medium hover:bg-slate-50 cursor-pointer">Xem tất cả</div>
                </div>
              )}
            </div>

            <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
              <MessageCircle className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <button className="text-slate-600 font-medium hover:text-blue-600 transition-colors" onClick={() => openAuthModal('login')}>Đăng nhập</button>
            <button 
              onClick={() => openAuthModal('register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md shadow-blue-200"
            >
              Đăng ký ngay
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <button className="p-2 text-slate-500 relative" onClick={() => setIsNotifOpen(!isNotifOpen)}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 shadow-lg absolute w-full left-0 z-40">
          <div className="flex flex-col space-y-3">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-medium px-3 py-2 rounded-lg ${
                  location.pathname === link.path 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button 
              className="text-left px-3 py-2 font-medium text-blue-600 bg-blue-50 rounded-lg"
              onClick={() => { setIsMobileMenuOpen(false); openPostClassModal(); }}
            >
              Đăng yêu cầu tìm gia sư
            </button>
          </div>
          <div className="h-px w-full bg-slate-100"></div>
          <div className="flex flex-col space-y-3 px-3">
            <button className="text-slate-600 font-medium text-left py-2" onClick={() => { setIsMobileMenuOpen(false); openAuthModal('login'); }}>Đăng nhập</button>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); openAuthModal('register'); }}
              className="bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold shadow-md shadow-blue-200 flex justify-center"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function VectorBook() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 lg:w-40 lg:h-40 drop-shadow-2xl">
      {/* Base Book */}
      <path d="M40 70 L140 40 L170 80 L70 110 Z" fill="#BFDBFE" />
      <path d="M40 70 L70 110 L70 130 L40 90 Z" fill="#60A5FA" />
      <path d="M70 110 L170 80 L170 100 L70 130 Z" fill="#2563EB" />
      {/* Pages */}
      <path d="M45 68 L142 40 L165 75 L68 103 Z" fill="#FFFFFF" />
      {/* Pencil */}
      <g transform="translate(90, 0) rotate(45)">
        <rect x="0" y="20" width="15" height="70" fill="#FBBF24" />
        <polygon points="0,90 15,90 7.5,110" fill="#F59E0B" />
        <polygon points="5,103 10,103 7.5,110" fill="#334155" />
        <rect x="0" y="10" width="15" height="10" fill="#94A3B8" />
        <rect x="0" y="0" width="15" height="10" fill="#F87171" />
      </g>
      {/* Decorative shapes */}
      <circle cx="30" cy="30" r="10" fill="#FDE68A" />
      <circle cx="160" cy="140" r="6" fill="#93C5FD" />
      <path d="M10 100 L20 90 L30 100 L20 110 Z" fill="#FCA5A5" />
    </svg>
  );
}

function VectorCap() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 lg:w-48 lg:h-48 drop-shadow-2xl">
      {/* Cap */}
      <path d="M100 40 L160 65 L100 90 L40 65 Z" fill="#2563EB" />
      <path d="M60 75 L60 110 C60 120 100 130 100 130 C100 130 140 120 140 110 L140 75" fill="#1E40AF" />
      <path d="M100 40 L160 65 L100 90 L40 65 Z" fill="#3B82F6" />
      {/* Tassel */}
      <path d="M100 65 L150 85 L150 115" stroke="#FBBF24" strokeWidth="4" fill="none" />
      <circle cx="150" cy="115" r="5" fill="#F59E0B" />
      <circle cx="100" cy="65" r="4" fill="#FDE68A" />
      {/* Diploma */}
      <rect x="50" y="130" width="100" height="30" rx="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" transform="rotate(-10 100 145)" />
      <rect x="90" y="125" width="20" height="40" fill="#EF4444" transform="rotate(-10 100 145)" />
      {/* Decorative shapes */}
      <path d="M30 140 L40 130 L50 140 L40 150 Z" fill="#93C5FD" />
      <circle cx="170" cy="40" r="8" fill="#FDE68A" />
    </svg>
  );
}

function Hero() {
  const [activeTab, setActiveTab] = useState<'tutor' | 'class'>('tutor');

  return (
    <div className="relative bg-gradient-to-b from-blue-100/80 via-blue-50/60 to-white pt-10 pb-16 md:pt-16 md:pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
      
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
        <div className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
        <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Floating Illustrations */}
      <div className="hidden lg:block absolute left-4 xl:left-16 top-32">
        <VectorBook />
      </div>
      <div className="hidden lg:block absolute right-4 xl:right-16 top-20">
        <VectorCap />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium text-xs md:text-sm mb-6 border border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Hơn 10,000+ Gia sư & Học sinh đang kết nối
        </div>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 md:mb-6">
          Tìm kiếm <span className="text-blue-600">Gia sư</span> & <span className="text-blue-600">Lớp học</span> <br className="hidden md:block"/> hoàn hảo cho bạn
        </h1>
        
        <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-500 mb-8 md:mb-10 px-2">
          Nền tảng kết nối thông minh giúp Phụ huynh tìm được gia sư uy tín và Giáo viên/Sinh viên dễ dàng tìm lớp phù hợp.
        </p>

        {/* Search Component */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-3 sm:p-4 relative z-10">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-4 w-full sm:w-fit mx-auto sm:mx-0">
            <button 
              onClick={() => setActiveTab('tutor')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-semibold transition-all text-sm md:text-base ${
                activeTab === 'tutor' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Tôi tìm Gia sư
            </button>
            <button 
              onClick={() => setActiveTab('class')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-semibold transition-all text-sm md:text-base ${
                activeTab === 'class' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Tôi tìm Lớp học
            </button>
          </div>

          {/* Search Inputs */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder={activeTab === 'tutor' ? "Môn học, lớp (VD: Toán 10...)" : "Từ khóa lớp học..."}
                className="w-full pl-12 pr-4 py-3 md:py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-200 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400 text-sm md:text-base outline-none"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select className="w-full pl-12 pr-10 py-3 md:py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:border-blue-200 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-slate-700 appearance-none text-sm md:text-base outline-none">
                <option value="">Tất cả khu vực / Online</option>
                <option value="hn">Hà Nội</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
                <option value="dn">Đà Nẵng</option>
                <option value="online">Học Online</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
            <Link to={activeTab === 'tutor' ? '/tim-gia-su' : '/tim-lop'} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all shadow-lg shadow-blue-200 md:w-auto w-full flex justify-center items-center gap-2 text-sm md:text-base">
              Tìm kiếm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorCard({ tutor }: { tutor: any }) {
  const { openInviteModal } = useUI();

  return (
    <div className="bg-white rounded-3xl p-4 md:p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      <div className="flex items-start gap-3 md:gap-4 mb-4">
        <div className="relative shrink-0">
          <img src={tutor.avatar} alt={tutor.name} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover" />
          <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base md:text-lg text-slate-900 group-hover:text-blue-600 transition-colors truncate block w-full">
            {tutor.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 md:px-2 py-0.5 rounded text-xs font-semibold shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {tutor.rating}
            </div>
            <span className="text-slate-500 text-xs md:text-sm truncate">
              {tutor.title}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4">
        {tutor.subjects.map((sub: string) => (
          <span key={sub} className="px-2 md:px-3 py-1 bg-slate-50 text-slate-600 text-[10px] md:text-xs font-medium rounded-lg border border-slate-100">
            {sub}
          </span>
        ))}
      </div>

      <div className="space-y-2 mb-4 md:mb-6 flex-1">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
          <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
          <span className="truncate">{tutor.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
          <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
          <span className="truncate">{tutor.isOnline ? 'Nhận dạy Online & Offline' : 'Chỉ dạy Offline'}</span>
        </div>
      </div>

      <div className="pt-3 md:pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-[10px] md:text-xs block mb-0.5">Học phí từ</span>
          <span className="font-bold text-sm md:text-base text-slate-900">{tutor.hourlyRate}đ<span className="text-slate-500 text-xs font-normal">/giờ</span></span>
        </div>
        <button 
          onClick={() => openInviteModal(tutor)}
          className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold transition-colors text-xs md:text-sm"
        >
          Mời dạy
        </button>
      </div>
    </div>
  );
}

function ClassCard({ cls }: { cls: any }) {
  return (
    <div className="bg-white rounded-3xl p-4 md:p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className="flex gap-1.5 md:gap-2 items-center bg-emerald-50 text-emerald-600 px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {cls.status}
        </div>
        <span className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
          {cls.postedAt}
        </span>
      </div>

      <h3 className="font-bold text-base md:text-lg text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 md:mb-2 line-clamp-2">
        {cls.title}
      </h3>
      
      <p className="text-xs md:text-sm text-slate-500 mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2">
        Đăng bởi: <span className="font-medium text-slate-700">{cls.parentName}</span>
      </p>

      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
        {cls.subjects.map((sub: string) => (
          <span key={sub} className="px-2 md:px-3 py-1 bg-blue-50 text-blue-700 text-[10px] md:text-xs font-medium rounded-lg">
            {sub}
          </span>
        ))}
        <span className="px-2 md:px-3 py-1 bg-slate-50 text-slate-600 text-[10px] md:text-xs font-medium rounded-lg border border-slate-100">
          {cls.format}
        </span>
      </div>

      <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6 flex-1 bg-slate-50 p-3 md:p-4 rounded-2xl">
        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-600">
          <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" />
          </div>
          <span className="truncate">{cls.location}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-600">
          <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" />
          </div>
          {cls.sessionsPerWeek} buổi / tuần
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-[10px] md:text-xs block mb-0.5">Mức phí dự kiến</span>
          <span className="font-bold text-slate-900 text-sm md:text-base">{cls.budget}</span>
        </div>
        <button className="bg-slate-900 text-white hover:bg-blue-600 px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold transition-colors text-xs md:text-sm">
          Ứng tuyển
        </button>
      </div>
    </div>
  );
}

// --- PAGES ---
function HomePage() {
  const { openPostClassModal, openAuthModal } = useUI();
  return (
    <>
      <Hero />

      {/* Featured Tutors Section */}
      <section className="py-12 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-3">Gia sư <span className="text-blue-600">Tiêu biểu</span></h2>
            <p className="text-slate-500 text-sm md:text-lg max-w-2xl">Khám phá hồ sơ của những gia sư, giáo viên được đánh giá cao nhất trong tuần qua.</p>
          </div>
          <Link to="/tim-gia-su" className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 text-sm md:text-base">
            Xem tất cả gia sư
            <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {mockTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      </section>

      {/* Latest Classes Section */}
      <section className="py-12 md:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-3">Lớp học <span className="text-blue-600">Mới nhất</span></h2>
              <p className="text-slate-500 text-sm md:text-lg max-w-2xl">Hàng trăm phụ huynh đang tìm kiếm gia sư giỏi. Ứng tuyển ngay để nhận lớp!</p>
            </div>
            <Link to="/tim-lop" className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 text-sm md:text-base">
              Khám phá lớp mới
              <span className="text-lg">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {mockClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-blue-600">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6">Bạn đã sẵn sàng kết nối?</h2>
          <p className="text-blue-100 text-sm md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto">
            Tham gia cùng hàng ngàn phụ huynh và gia sư khác. Đăng ký hoàn toàn miễn phí chỉ trong 2 phút!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <button onClick={openPostClassModal} className="bg-white text-blue-600 hover:bg-slate-50 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg transition-all shadow-xl shadow-blue-900/20">
              Tôi cần tìm Gia sư
            </button>
            <button onClick={() => openAuthModal('register')} className="bg-blue-700 text-white hover:bg-blue-800 border border-blue-500 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg transition-all">
              Tôi muốn Đăng ký Dạy
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function FindTutorsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm sticky top-28">
            <div className="flex items-center gap-2 font-bold text-lg mb-6 text-slate-900">
              <Filter className="w-5 h-5" /> Bộ lọc tìm kiếm
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3">Khu vực</h4>
                <select className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 text-sm outline-none">
                  <option>Toàn quốc</option>
                  <option>Hà Nội</option>
                  <option>TP. Hồ Chí Minh</option>
                  <option>Đà Nẵng</option>
                </select>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3">Môn học</h4>
                <div className="space-y-2">
                  {['Toán', 'Tiếng Anh', 'Vật Lý', 'Hóa Học', 'Ngữ Văn'].map(subject => (
                    <label key={subject} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-slate-600">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3">Trình độ</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-600">Giáo viên</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-600">Sinh viên</span>
                  </label>
                </div>
              </div>

              <button className="w-full bg-blue-50 text-blue-600 font-semibold py-3.5 rounded-xl text-sm hover:bg-blue-100 transition-colors">
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Danh sách Gia sư</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sắp xếp theo:</span>
              <select className="p-2 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100">
                <option>Đánh giá cao nhất</option>
                <option>Mới cập nhật</option>
                <option>Giá từ thấp đến cao</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {mockTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
            {mockTutors.map((tutor) => (
              <TutorCard key={`dup-${tutor.id}`} tutor={{...tutor, id: tutor.id + 10}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FindClassesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm sticky top-28">
            <div className="flex items-center gap-2 font-bold text-lg mb-6 text-slate-900">
              <Filter className="w-5 h-5" /> Bộ lọc tìm kiếm
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3">Hình thức học</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-sm text-slate-600">Online</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-sm text-slate-600">Offline (Tại nhà)</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3">Khu vực (Offline)</h4>
                <select className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 text-sm outline-none">
                  <option>Tất cả</option>
                  <option>Hà Nội</option>
                  <option>TP. Hồ Chí Minh</option>
                  <option>Đà Nẵng</option>
                </select>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3">Trạng thái</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" className="rounded-full text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-sm text-slate-600">Đang tuyển</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" className="rounded-full text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-600">Tất cả</span>
                  </label>
                </div>
              </div>

              <button className="w-full bg-blue-50 text-blue-600 font-semibold py-3.5 rounded-xl text-sm hover:bg-blue-100 transition-colors">
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Lớp học đang tuyển</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sắp xếp theo:</span>
              <select className="p-2 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100">
                <option>Mới nhất</option>
                <option>Lương cao nhất</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {mockClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
            {mockClasses.map((cls) => (
              <ClassCard key={`dup-${cls.id}`} cls={{...cls, id: cls.id + 10}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorRegistrationPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng ký làm Gia sư</h1>
          <p className="text-slate-500">Hoàn tất hồ sơ (KYC) để bắt đầu nhận lớp và tăng thu nhập.</p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span> Thông tin giảng dạy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chức danh / Tiêu đề hồ sơ</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="VD: Sinh viên ĐH Bách Khoa..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kinh nghiệm giảng dạy (Năm)</label>
                <input type="number" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="VD: 2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Môn học có thể dạy</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Toán, Vật Lý, IELTS..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mức học phí mong muốn (VNĐ/giờ)</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="VD: 150.000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hình thức dạy</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none">
                  <option>Cả Online và Offline</option>
                  <option>Chỉ dạy Online</option>
                  <option>Chỉ dạy Offline</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span> Xác thực danh tính (KYC)
            </h3>
            <p className="text-sm text-slate-500 mb-4">Chúng tôi yêu cầu xác thực để đảm bảo môi trường an toàn và uy tín. Thông tin của bạn sẽ được bảo mật tuyệt đối.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-medium text-slate-700 mb-1">Ảnh CMND/CCCD (Mặt trước)</div>
                <div className="text-xs text-slate-400">JPG, PNG (Max 5MB)</div>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-medium text-slate-700 mb-1">Thẻ sinh viên / Bằng tốt nghiệp</div>
                <div className="text-xs text-slate-400">JPG, PNG, PDF (Max 5MB)</div>
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100">
            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-lg">
              Hoàn tất đăng ký & Gửi duyệt
            </button>
            <p className="text-center text-sm text-slate-500 mt-4">
              Bằng việc bấm nút, bạn đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản dịch vụ</a> của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 md:py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-center md:text-left">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">Han<span className="text-blue-500">tutor</span></span>
        </div>
        <div className="text-xs md:text-sm">
          © 2026 Hantutor. Nền tảng kết nối gia sư thông minh.
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [authModalState, setAuthModalState] = useState<{isOpen: boolean, view: 'login'|'register'}>({ isOpen: false, view: 'login' });
  const [inviteModalTutor, setInviteModalTutor] = useState<any>(null);
  const [isPostClassOpen, setIsPostClassOpen] = useState(false);

  const uiContextValue = {
    openAuthModal: (view: 'login' | 'register') => setAuthModalState({ isOpen: true, view }),
    openInviteModal: (tutor: any) => setInviteModalTutor(tutor),
    openPostClassModal: () => setIsPostClassOpen(true)
  };

  return (
    <UIContext.Provider value={uiContextValue}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tim-gia-su" element={<FindTutorsPage />} />
              <Route path="/tim-lop" element={<FindClassesPage />} />
              <Route path="/dang-ky-gia-su" element={<TutorRegistrationPage />} />
            </Routes>
          </main>

          <Footer />

          {/* Global Modals */}
          {authModalState.isOpen && (
            <AuthModal 
              isOpen={authModalState.isOpen} 
              initialView={authModalState.view} 
              onClose={() => setAuthModalState({ ...authModalState, isOpen: false })} 
            />
          )}
          
          {inviteModalTutor && (
            <InviteTutorModal 
              tutor={inviteModalTutor} 
              onClose={() => setInviteModalTutor(null)} 
            />
          )}

          {isPostClassOpen && (
            <PostClassModal 
              isOpen={isPostClassOpen} 
              onClose={() => setIsPostClassOpen(false)} 
            />
          )}
        </div>
      </BrowserRouter>
    </UIContext.Provider>
  );
}
