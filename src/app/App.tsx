import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router';
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
  UploadCloud,
  Phone,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Play,
  Check,
  Copy,
  Calendar,
  Award,
  TrendingUp,
  Eye,
  UserCheck,
  UserX,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Heart,
  Smile,
  Zap,
  DollarSign,
  Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockTutors, mockPendingTutors, mockAdminStats, TutorType, defaultTutorReviews, TutorReviewItem } from './data';
import FloatingContactDock from './components/FloatingContactDock';

export interface StudentTrialItem {
  tutorId: string | number;
  tutorName: string;
  avatar: string;
  badgeSubject: string;
  headline?: string;
  rolePrefix?: string;
  displayName?: string;
  phone?: string;
  zalo?: string;
  hourlyRate?: string;
  date: string;
  status: 'trial_in_progress' | 'enrolled' | 'cancelled';
}

// --- LOCALSTORAGE HELPERS (Quản lý trạng thái học thử và học chính thức) ---
function getEnrolledTutors(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('hantutor_enrolled') || '{}'); } catch { return {}; }
}
function saveEnrolledTutor(tutorId: string | number, enrollmentId: string) {
  const enrolled = getEnrolledTutors();
  enrolled[String(tutorId)] = enrollmentId;
  localStorage.setItem('hantutor_enrolled', JSON.stringify(enrolled));
}
function getStoredTrials(): StudentTrialItem[] {
  try { return JSON.parse(localStorage.getItem('hantutor_student_trials') || '[]'); } catch { return []; }
}
function saveStoredTrials(trials: StudentTrialItem[]) {
  localStorage.setItem('hantutor_student_trials', JSON.stringify(trials));
}

function Logo({ light = false, size = "md" }: { light?: boolean; size?: "sm" | "md" | "lg" }) {
  const iconSizeClass = size === "sm" ? "w-7 h-7 sm:w-8 sm:h-8" : size === "lg" ? "w-11 h-11 sm:w-12 sm:h-12" : "w-8 h-8 sm:w-10 sm:h-10";
  const wordmarkHeightClass = size === "sm" ? "h-4.5 sm:h-5" : size === "lg" ? "h-7 sm:h-8" : "h-5 sm:h-6.5";

  return (
    <div className="flex items-center gap-2 cursor-pointer select-none">
      <img 
        src="/logo-icon.png" 
        alt="HanTutor Icon" 
        className={`${iconSizeClass} object-contain shrink-0 transition-transform duration-200 hover:scale-105`} 
      />
      {light ? (
        <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center leading-none">
          Han<span className="text-[#FF9000]">tutor</span>
        </span>
      ) : (
        <img 
          src="/logo-wordmark.png" 
          alt="HanTutor" 
          className={`${wordmarkHeightClass} object-contain shrink-0`} 
        />
      )}
    </div>
  );
}

// --- CONTEXT CHO DỮ LIỆU & UI ---
interface UIContextType {
  openAuthModal: (view?: 'login' | 'register', defaultRole?: 'student' | 'teacher') => void;
  openContactZaloModal: (tutor: any) => void;
  openEnrollmentModal: (tutor: any) => void;
  openCheckoutModal: (enrollmentId: string, amount: number, tutorId: string | number) => void;
  openTutorDetailModal: (tutor: any) => void;
  openMyTrialsModal: () => void;
  openReviewModal: (tutor: any, defaultStage?: 'trial' | 'official') => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}

interface DataContextType {
  tutors: any[];
  setTutors: React.Dispatch<React.SetStateAction<any[]>>;
  pendingTutors: any[];
  setPendingTutors: React.Dispatch<React.SetStateAction<any[]>>;
  adminStats: typeof mockAdminStats;
  myTrials: StudentTrialItem[];
  reviews: TutorReviewItem[];
  recordTrialContact: (tutor: any, studentInfo?: { name?: string, phone?: string }) => void;
  recordOfficialEnrollment: (tutorId: any) => void;
  cancelTrialEnrollment: (tutorId: any) => void;
  approveTutorKyc: (tutorId: any) => void;
  rejectTutorKyc: (tutorId: any) => void;
  addMockTutor: (newTutor: any) => void;
  addTutorReview: (review: Omit<TutorReviewItem, 'id' | 'date'>) => void;
}

export const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}

// ==========================================
// 1. AUTH MODAL (Role Student & Teacher, 3-Step Forgot Password)
// ==========================================
function AuthModal({ 
  isOpen, 
  onClose, 
  initialView = 'login', 
  defaultRole = 'student' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  initialView?: 'login' | 'register'; 
  defaultRole?: 'student' | 'teacher'; 
}) {
  const [view, setView] = useState<'login' | 'register' | 'forgot_step1' | 'forgot_step2' | 'forgot_step3'>(initialView);
  const [role, setRole] = useState<'student' | 'teacher'>(defaultRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setView(initialView);
    setRole(defaultRole);
  }, [initialView, defaultRole, isOpen]);

  useEffect(() => {
    let timer: any;
    if (view === 'forgot_step2' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [view, countdown]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`Đăng nhập thành công với vai trò: ${role === 'student' ? 'Học sinh / Phụ huynh' : 'Giáo viên'}!`);
      onClose();
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'teacher') {
      onClose();
      navigate(`/dang-ky-gia-su?email=${encodeURIComponent(identifier)}`);
    } else {
      if (!identifier.trim() || !password.trim()) {
        alert("Vui lòng điền đầy đủ thông tin đăng ký");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        alert("Đăng ký tài khoản học sinh thành công! Bạn có thể bắt đầu tìm kiếm giáo viên và liên hệ học thử miễn phí.");
        onClose();
      }, 600);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      alert("Vui lòng nhập Email hoặc Số điện thoại đã đăng ký");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCountdown(60);
      setView('forgot_step2');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      alert("Vui lòng nhập đúng mã OTP 6 chữ số");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('forgot_step3');
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.");
      setView('login');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Chào mừng trở lại</h2>
              <p className="text-sm text-slate-500 mt-1">Đăng nhập vào nền tảng HanTutor</p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <button 
                type="button"
                onClick={() => setRole('student')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${role === 'student' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
              >
                <Users className="w-4 h-4" /> Tôi là học sinh
              </button>
              <button 
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${role === 'teacher' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
              >
                <Briefcase className="w-4 h-4" /> Tôi là giáo viên
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email hoặc Số điện thoại</label>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="Nhập email hoặc SĐT..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                  <button 
                    type="button" 
                    onClick={() => setView('forgot_step1')}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Chưa có tài khoản?{' '}
              <button 
                onClick={() => setView('register')} 
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Đăng ký tài khoản mới
              </button>
            </div>
          </div>
        )}

        {/* VIEW: REGISTER */}
        {view === 'register' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Tạo tài khoản mới</h2>
              <p className="text-sm text-slate-500 mt-1">Chọn vai trò của bạn để bắt đầu</p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <button 
                type="button"
                onClick={() => setRole('student')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${role === 'student' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
              >
                <Users className="w-4 h-4" /> Tôi là học sinh
              </button>
              <button 
                type="button"
                onClick={() => setRole('teacher')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${role === 'teacher' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
              >
                <Briefcase className="w-4 h-4" /> Tôi là giáo viên
              </button>
            </div>

            {role === 'teacher' ? (
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-center space-y-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-200">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Đăng ký làm Giáo viên / Gia sư</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Tạo hồ sơ giảng dạy chuẩn quốc tế, công khai video demo, phương pháp dạy và nhận lớp học 1-1 với tỷ lệ thành công cao.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/dang-ky-gia-su');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer"
                >
                  Tiếp tục đến Form Đăng ký Giáo viên →
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email hoặc Số điện thoại</label>
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Nhập email hoặc SĐT..." 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)..." 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản học sinh'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center text-xs text-slate-500">
              Đã có tài khoản?{' '}
              <button 
                onClick={() => setView('login')} 
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD STEP 1 */}
        {view === 'forgot_step1' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Quên mật khẩu</h2>
              <p className="text-xs text-slate-500 mt-1">Bước 1/3: Nhập Email hoặc Số điện thoại để nhận mã xác thực</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email hoặc SĐT đã đăng ký</label>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="Nhập email hoặc SĐT..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                {loading ? 'Đang gửi mã...' : 'Gửi mã xác thực OTP'}
              </button>
            </form>

            <button 
              onClick={() => setView('login')}
              className="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              ← Quay lại Đăng nhập
            </button>
          </div>
        )}

        {/* FORGOT PASSWORD STEP 2 */}
        {view === 'forgot_step2' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Xác thực mã OTP</h2>
              <p className="text-xs text-slate-500 mt-1">Bước 2/3: Mã xác thực 6 số đã được gửi tới {identifier}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nhập mã OTP (6 chữ số)</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456" 
                  className="w-full text-center tracking-widest text-lg font-bold px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="text-center text-xs text-slate-500">
                {countdown > 0 ? (
                  <span>Gửi lại mã sau <strong className="text-blue-600">{countdown}s</strong></span>
                ) : (
                  <button 
                    type="button"
                    onClick={() => { setCountdown(60); alert("Mã OTP mới đã được gửi!"); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Gửi lại mã OTP ngay
                  </button>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading || otp.length < 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang kiểm tra...' : 'Xác thực OTP'}
              </button>
            </form>
          </div>
        )}

        {/* FORGOT PASSWORD STEP 3 */}
        {view === 'forgot_step3' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Tạo mật khẩu mới</h2>
              <p className="text-xs text-slate-500 mt-1">Bước 3/3: Đặt mật khẩu an toàn cho tài khoản của bạn</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer shadow-md shadow-emerald-200"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu & Đăng nhập'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. MODAL LIÊN HỆ ZALO & HỌC THỬ 1-1 (MÃ QR ZALO TRỰC TIẾP)
// ==========================================
function ContactZaloModal({ 
  tutor, 
  isOpen, 
  onClose, 
  onOfficialEnroll 
}: { 
  tutor: any; 
  isOpen: boolean; 
  onClose: () => void; 
  onOfficialEnroll: () => void; 
}) {
  const { recordTrialContact } = useData();

  // Tự động ghi nhận lớp học thử vào "Lớp học thử của tôi" ngay khi học sinh bấm liên hệ
  useEffect(() => {
    if (isOpen && tutor) {
      recordTrialContact(tutor);
    }
  }, [isOpen, tutor]);

  if (!isOpen || !tutor) return null;

  // Lấy SĐT / Zalo của giáo viên đã đăng ký để tạo link & mã QR Zalo
  const rawPhone = tutor.zalo || tutor.phone || '0967891234';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const zaloUrl = `https://zalo.me/${cleanPhone}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(zaloUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          {/* Header Thông tin Giáo viên */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img 
                src={tutor.avatar} 
                alt={tutor.name} 
                className="w-20 h-20 rounded-2xl object-cover shadow-sm border-2 border-slate-100" 
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white" title="Trực tuyến">
                ✓
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">{tutor.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{tutor.title}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Zalo đã xác thực
              </span>
            </div>
          </div>

          {/* Khung Mã QR Zalo Giáo viên */}
          <div className="bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-100 p-5 rounded-3xl space-y-3">
            <div className="text-center">
              <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider block">
                Mã QR Zalo Kết Nối Trực Tiếp
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Quét mã bằng Zalo trên điện thoại để nhắn tin & xếp lịch học thử 1-1
              </p>
            </div>

            {/* Ảnh mã QR */}
            <div className="w-48 h-48 sm:w-52 sm:h-52 mx-auto bg-white p-2.5 rounded-2xl shadow-md border border-slate-200/80 flex items-center justify-center relative group">
              <img 
                src={qrCodeUrl} 
                alt={`Mã QR Zalo ${tutor.name}`} 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium">
              <span>🔒 Bảo mật thông tin</span> • <span>Học thử 1-1 miễn phí</span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="space-y-2 pt-1">
            <a 
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#0068FF] hover:bg-[#0056d6] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Mở Zalo kết nối ngay</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button 
              type="button"
              onClick={onOfficialEnroll}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
            >
              Đã hoàn thành học thử: Đăng ký học chính thức
            </button>
          </div>

          {/* Ghi chú lưu tự động vào Lớp học thử của tôi */}
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-[11px] text-slate-600 text-center leading-relaxed">
            ✨ Lớp học thử 1-1 đã được tự động lưu vào mục <strong className="text-slate-900">"Lớp học thử của tôi"</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. ENROLLMENT & CHECKOUT MODAL (Chia 30%/70%)
// ==========================================
function EnrollmentModal({ 
  tutor, 
  isOpen, 
  onClose, 
  onProceedToPayment 
}: { 
  tutor: any; 
  isOpen: boolean; 
  onClose: () => void; 
  onProceedToPayment: (enrollmentId: string, amount: number, tutorId: string | number) => void; 
}) {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [totalSessions, setTotalSessions] = useState<number>(8);

  if (!isOpen || !tutor) return null;

  const levels = tutor.levelPrices ? Object.keys(tutor.levelPrices) : ['Tiểu học', 'THCS', 'THPT'];
  const currentLvl = selectedLevel || levels[0];
  const priceString = tutor.levelPrices?.[currentLvl] || '200.000';
  const pricePerSession = parseInt(priceString.replace(/\D/g, '')) || 200000;
  const totalTuition = pricePerSession * totalSessions;

  const centerFee = Math.round(totalTuition * 0.3);
  const tutorFee = Math.round(totalTuition * 0.7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enrollmentId = 'ENR_' + Date.now();
    saveEnrolledTutor(tutor.id, enrollmentId);
    onClose();
    onProceedToPayment(enrollmentId, totalTuition, tutor.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h3 className="text-xl font-extrabold text-slate-900">Đăng ký học chính thức</h3>
          <p className="text-xs text-slate-500 mt-0.5">Giáo viên: <strong className="text-slate-800">{tutor.name}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chọn cấp độ học</label>
            <select 
              value={currentLvl}
              onChange={e => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl} ({tutor.levelPrices?.[lvl] || '200.000'}đ/giờ)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Số buổi đăng ký cho khóa đầu tiên</label>
            <div className="grid grid-cols-3 gap-2">
              {[8, 12, 16].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setTotalSessions(num)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${totalSessions === num ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {num} buổi
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown 30% / 70% */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Học phí 1 buổi ({currentLvl}):</span>
              <span className="font-bold text-slate-900">{pricePerSession.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tổng học phí ({totalSessions} buổi):</span>
              <span className="font-bold text-slate-900">{totalTuition.toLocaleString()}đ</span>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex justify-between text-[11px] text-slate-500">
              <span>• Phí vận hành sàn (30%):</span>
              <span className="font-semibold text-blue-700">{centerFee.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>• Giáo viên thực nhận (70%):</span>
              <span className="font-semibold text-emerald-700">{tutorFee.toLocaleString()}đ</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Tổng thanh toán:</span>
              <span className="text-blue-600 text-base">{totalTuition.toLocaleString()}đ</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-200 cursor-pointer"
          >
            Tiến hành thanh toán VietQR ({totalTuition.toLocaleString()}đ)
          </button>
        </form>
      </div>
    </div>
  );
}

function CheckoutModal({ 
  enrollmentId, 
  amount, 
  tutorId, 
  isOpen, 
  onClose 
}: { 
  enrollmentId: string; 
  amount: number; 
  tutorId: string | number; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirmPaid = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaid(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!paid ? (
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Thanh toán học phí VietQR</h3>
            <p className="text-xs text-slate-500">Quét mã QR bằng ứng dụng ngân hàng bất kỳ để hoàn tất đăng ký</p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HANTUTOR_${enrollmentId}_${amount}`} 
                alt="VietQR" 
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-xl text-xs space-y-1 text-slate-700 text-left">
              <div><strong>Số tiền:</strong> <span className="text-blue-700 font-bold">{amount?.toLocaleString()} VNĐ</span></div>
              <div><strong>Nội dung CK:</strong> <span className="font-mono font-bold text-slate-900">{enrollmentId}</span></div>
              <div><strong>Ngân hàng:</strong> MB Bank - STK: 999988882026 (HanTutor Platform)</div>
            </div>

            <button 
              type="button" 
              onClick={handleConfirmPaid}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang xác thực thanh toán...' : 'Tôi đã chuyển khoản thành công'}
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">Đăng ký thành công!</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Giao dịch của bạn đã được ghi nhận. Học phí đã được phân bổ tự động (30% sàn duy trì và 70% chuyển cho giáo viên). Chúc bạn có những buổi học hiệu quả!
            </p>
            <button 
              type="button" 
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Hoàn tất & Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3.5. REVIEW TUTOR MODAL (Nhận xét & Đánh giá giáo viên)
// ==========================================
function ReviewTutorModal({
  tutor,
  isOpen,
  defaultStage = 'trial',
  onClose,
  onSuccess
}: {
  tutor: any;
  isOpen: boolean;
  defaultStage?: 'trial' | 'official';
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { addTutorReview } = useData();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [stage, setStage] = useState<'trial' | 'official'>(defaultStage);
  const [studentName, setStudentName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStage(defaultStage);
    }
  }, [isOpen, defaultStage]);

  if (!isOpen || !tutor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung nhận xét của bạn!");
      return;
    }

    setIsSubmitting(true);
    addTutorReview({
      tutorId: tutor.id,
      studentName: studentName.trim() || 'Học viên ẩn danh',
      rating,
      stage,
      stageText: stage === 'trial' ? 'Sau buổi học thử 1-1' : 'Sau thời gian học chính thức',
      comment: comment.trim(),
      verified: true,
      likes: 1
    });

    setIsSubmitting(false);
    alert(`Cảm ơn bạn đã đánh giá ${rating} sao cho ${tutor.name}! Nhận xét của bạn đã được cập nhật trực tiếp.`);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 select-text">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <img src={tutor.avatar} alt={tutor.name} className="w-13 h-13 rounded-2xl object-cover shadow-sm border border-slate-200" />
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Đánh giá & Nhận xét</span>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">{tutor.name}</h3>
            <span className="text-xs text-slate-500">{tutor.subjects?.join(', ')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Star Rating Picker */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Mức độ hài lòng của bạn:</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-115"
                >
                  <Star 
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'fill-slate-200 text-slate-200'
                    }`} 
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-sm text-slate-800">
                {rating === 5 ? '⭐ Rất xuất sắc (5/5)' : rating === 4 ? '⭐ Tốt (4/5)' : rating === 3 ? 'Bình thường (3/5)' : 'Cần cải thiện'}
              </span>
            </div>
          </div>

          {/* Giai đoạn đánh giá */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Giai đoạn bạn muốn đánh giá:</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStage('trial')}
                className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                  stage === 'trial' 
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 ring-2 ring-blue-100' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-xs">🎯 Sau buổi học thử 1-1</div>
                <div className="text-[10px] font-normal text-slate-500 mt-0.5">Nhận xét tác phong, phương pháp buổi đầu</div>
              </button>

              <button
                type="button"
                onClick={() => setStage('official')}
                className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                  stage === 'official' 
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 ring-2 ring-blue-100' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-xs">🎓 Đang học chính thức</div>
                <div className="text-[10px] font-normal text-slate-500 mt-0.5">Nhận xét sự tiến bộ sau thời gian học</div>
              </button>
            </div>
          </div>

          {/* Tên học sinh / Phụ huynh */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Họ tên của bạn hoặc Phụ huynh:</label>
            <input
              type="text"
              placeholder="VD: Phụ huynh em Tuấn Anh, hoặc Em Minh Đức (Lớp 12)..."
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Nội dung nhận xét */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Nội dung nhận xét chi tiết:</label>
            <textarea
              rows={4}
              placeholder="Chia sẻ trải nghiệm học tập, sự tận tâm của giáo viên, khả năng tiếp thu và tiến bộ của học sinh..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white leading-relaxed resize-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Gửi nhận xét ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. MODAL QUẢN LÝ LỚP HỌC THỬ CỦA HỌC SINH
// ==========================================
function MyTrialsModal({
  isOpen,
  onClose,
  onOpenEnrollment
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenEnrollment: (tutor: any) => void;
}) {
  const { myTrials, cancelTrialEnrollment, tutors } = useData();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-extrabold text-slate-900">
            Lớp học thử & Giáo viên đã liên hệ ({myTrials.length})
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến độ trao đổi học thử và xác nhận <strong>"Đăng ký học chính thức"</strong> sau khi hoàn thành buổi học 1-1.
          </p>
        </div>

        {myTrials.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Users className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-medium">Bạn chưa liên hệ học thử với giáo viên nào.</p>
            <Link 
              to="/tim-gia-su" 
              onClick={onClose}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Tìm giáo viên ngay →
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {myTrials.map((item) => {
              const fullTutor = tutors.find(t => String(t.id) === String(item.tutorId));
              return (
                <div 
                  key={item.tutorId} 
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.avatar} alt={item.tutorName} className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-xs" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">{item.tutorName}</span>
                        <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          {item.badgeSubject}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.headline || `Liên hệ ngày: ${item.date}`}</p>
                      
                      {/* Trạng thái formal */}
                      <div className="mt-1 flex items-center gap-2">
                        {item.status === 'trial_in_progress' && (
                          <span className="inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-200">
                            Đang trao đổi & học thử
                          </span>
                        )}
                        {item.status === 'enrolled' && (
                          <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            Đã đăng ký học chính thức
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hành động */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 flex-wrap">
                    {item.phone && (
                      <a
                        href={`https://zalo.me/${item.zalo || item.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                      >
                        Zalo
                      </a>
                    )}

                    {/* Nút Đánh giá giáo viên */}
                    <button
                      type="button"
                      onClick={() => {
                        if (fullTutor) openReviewModal(fullTutor, item.status === 'enrolled' ? 'official' : 'trial');
                      }}
                      className="px-3 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                      title="Viết nhận xét & đánh giá giáo viên sau học thử hoặc thời gian học"
                    >
                      ⭐ Đánh giá
                    </button>

                    {item.status === 'trial_in_progress' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (fullTutor) onOpenEnrollment(fullTutor);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Đăng ký học chính thức
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelTrialEnrollment(item.tutorId)}
                          className="bg-white hover:bg-slate-100 text-slate-600 hover:text-red-600 font-semibold border border-slate-200 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap"
                          title="Hủy học / Không tiếp tục (Xóa bỏ khỏi danh sách, hệ thống cập nhật giảm tỷ lệ nhận lớp của giáo viên)"
                        >
                          Không tiếp tục
                        </button>
                      </>
                    )}

                    {item.status === 'enrolled' && (
                      <span className="text-xs font-semibold text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                        Đang theo học
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. HEADER, HERO & CARDS
// ==========================================
function HeroLeftIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 lg:w-40 lg:h-40 drop-shadow-2xl select-none pointer-events-none">
      <path d="M40 70 L140 40 L170 80 L70 110 Z" fill="#BFDBFE" />
      <path d="M40 70 L70 110 L70 130 L40 90 Z" fill="#60A5FA" />
      <path d="M70 110 L170 80 L170 100 L70 130 Z" fill="#2563EB" />
      <path d="M45 68 L142 40 L165 75 L68 103 Z" fill="#FFFFFF" />
      <g transform="translate(90, 0) rotate(45)">
        <rect x="0" y="20" width="15" height="70" fill="#FBBF24" />
        <polygon points="0,90 15,90 7.5,110" fill="#F59E0B" />
        <polygon points="5,103 10,103 7.5,110" fill="#334155" />
        <rect x="0" y="10" width="15" height="10" fill="#94A3B8" />
        <rect x="0" y="0" width="15" height="10" fill="#F87171" />
      </g>
      <circle cx="30" cy="30" r="10" fill="#FDE68A" />
      <circle cx="160" cy="140" r="6" fill="#93C5FD" />
      <path d="M10 100 L20 90 L30 100 L20 110 Z" fill="#FCA5A5" />
    </svg>
  );
}

function HeroRightIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 lg:w-48 lg:h-48 drop-shadow-2xl select-none pointer-events-none">
      <path d="M100 40 L160 65 L100 90 L40 65 Z" fill="#2563EB" />
      <path d="M60 75 L60 110 C60 120 100 130 100 130 C100 130 140 120 140 110 L140 75" fill="#1E40AF" />
      <path d="M100 40 L160 65 L100 90 L40 65 Z" fill="#3B82F6" />
      <path d="M100 65 L150 85 L150 115" stroke="#FBBF24" strokeWidth="4" fill="none" />
      <circle cx="150" cy="115" r="5" fill="#F59E0B" />
      <circle cx="100" cy="65" r="4" fill="#FDE68A" />
      <rect x="50" y="130" width="100" height="30" rx="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" transform="rotate(-10 100 145)" />
      <rect x="90" y="125" width="20" height="40" fill="#EF4444" transform="rotate(-10 100 145)" />
      <path d="M30 140 L40 130 L50 140 L40 150 Z" fill="#93C5FD" />
      <circle cx="170" cy="40" r="8" fill="#FDE68A" />
    </svg>
  );
}

function Navbar() {
  const { openAuthModal, openMyTrialsModal } = useUI();
  const { myTrials } = useData();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTrialsCount = myTrials.filter(t => t.status === 'trial_in_progress').length;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-slate-100 shadow-2xs">
      {/* Hàng chính Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Logo />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'}`}
          >
            Trang chủ
          </Link>
          <Link 
            to="/tim-gia-su" 
            className={`text-sm font-semibold transition-colors ${isActive('/tim-gia-su') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'}`}
          >
            Tìm Gia Sư & Giáo Viên
          </Link>
          <button
            type="button"
            onClick={openMyTrialsModal}
            className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            Lớp học thử của tôi
            {myTrials.length > 0 && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activeTrialsCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'}`}>
                {myTrials.length}
              </span>
            )}
          </button>
        </nav>

        {/* Nút hành động */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link 
            to="/tim-gia-su" 
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
            title="Tìm kiếm"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          <button 
            type="button"
            onClick={() => openAuthModal('login')}
            className="text-slate-700 hover:text-blue-600 font-bold text-xs sm:text-sm px-2 py-1.5 sm:px-2.5 sm:py-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            Đăng nhập
          </button>

          <button 
            type="button"
            onClick={() => openAuthModal('register', 'student')}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full transition-all text-xs sm:text-sm shadow-xs shadow-blue-200 whitespace-nowrap shrink-0"
          >
            Đăng ký
          </button>

          {/* Nút Hamburger menu trên điện thoại */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 ml-0.5"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Thanh điều hướng 3 mục trên điện thoại (Không bao giờ bị khuất trên mobile) */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50/95 px-2 py-1.5 flex items-center justify-around gap-1 overflow-x-auto scrollbar-none">
        <Link 
          to="/" 
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isActive('/') ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-blue-600'}`}
        >
          Trang chủ
        </Link>
        <Link 
          to="/tim-gia-su" 
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isActive('/tim-gia-su') ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-blue-600'}`}
        >
          Tìm Gia Sư & Giáo Viên
        </Link>
        <button
          type="button"
          onClick={openMyTrialsModal}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap text-slate-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
        >
          <span>Lớp học thử của tôi</span>
          {myTrials.length > 0 && (
            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${activeTrialsCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'}`}>
              {myTrials.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer (khi bấm vào nút Menu) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="space-y-1">
            <Link
              to="/"
              className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <span>🏠 Trang chủ</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/tim-gia-su"
              className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold ${isActive('/tim-gia-su') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <span>🎓 Tìm Gia Sư & Giáo Viên</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openMyTrialsModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <span>📚 Lớp học thử của tôi</span>
                {myTrials.length > 0 && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activeTrialsCount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {myTrials.length}
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <Link
              to="/dang-ky-gia-su"
              className="flex items-center justify-between p-3 rounded-xl text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100"
            >
              <span>💼 Đăng ký làm Gia sư / Giáo viên</span>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('login');
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 text-center"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('register', 'student');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 text-center shadow-xs"
            >
              Đăng ký ngay
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const [searchText, setSearchText] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('');
  const navigate = useNavigate();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('q', searchText.trim());
    if (selectedLoc) params.set('location', selectedLoc);
    navigate(`/tim-gia-su?${params.toString()}`);
  };

  return (
    <div className="relative bg-gradient-to-b from-blue-50/60 via-slate-50 to-white pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      <div className="hidden lg:block absolute left-8 xl:left-24 top-20">
        <HeroLeftIllustration />
      </div>
      <div className="hidden lg:block absolute right-8 xl:right-24 top-20">
        <HeroRightIllustration />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-blue-700 font-bold text-xs md:text-sm mb-6 border border-blue-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          100% Giáo viên/Gia sư được kiểm duyệt KYC & Năng lực giảng dạy
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Tìm kiếm <span className="text-blue-600">Giáo viên & Gia sư</span> <br className="hidden sm:inline"/> hoàn hảo cho bạn
        </h1>
        
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-500 mb-8 md:mb-10 px-2 leading-relaxed font-normal">
          Nền tảng kết nối trực tiếp học sinh và giáo viên tại Hà Nội: Trao đổi Zalo 1-1, học thử miễn phí và đăng ký học chính thức minh bạch.
        </p>

        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-4 sm:p-5 relative z-10 text-left">
          <form onSubmit={handleHeroSearch} className="flex flex-col md:flex-row gap-2.5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Môn học, lớp, kỹ năng (VD: Toán 10, Tiếng Anh, Piano, Bơi lội...)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-100/70 border border-transparent focus:border-blue-200 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 text-sm outline-none font-medium"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={selectedLoc}
                onChange={e => setSelectedLoc(e.target.value)}
                className="w-full pl-11 pr-9 py-3 rounded-2xl bg-slate-100/70 border border-transparent focus:border-blue-200 focus:bg-white transition-all text-slate-800 appearance-none text-sm outline-none cursor-pointer font-medium"
              >
                <option value="">Tất cả quận Hà Nội / Online</option>
                <option value="Cầu Giấy">Quận Cầu Giấy</option>
                <option value="Đống Đa">Quận Đống Đa</option>
                <option value="Hai Bà Trưng">Quận Hai Bà Trưng</option>
                <option value="Thanh Xuân">Quận Thanh Xuân</option>
                <option value="Ba Đình">Quận Ba Đình</option>
                <option value="Hoàn Kiếm">Quận Hoàn Kiếm</option>
                <option value="Nam Từ Liêm">Quận Nam Từ Liêm</option>
                <option value="Bắc Từ Liêm">Quận Bắc Từ Liêm</option>
                <option value="Hà Đông">Quận Hà Đông</option>
                <option value="Hoàng Mai">Quận Hoàng Mai</option>
                <option value="Long Biên">Quận Long Biên</option>
                <option value="Tây Hồ">Quận Tây Hồ</option>
                <option value="online">Học trực tuyến (Online)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md shadow-blue-200 md:w-auto w-full flex justify-center items-center gap-1.5 text-sm cursor-pointer"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function TutorCard({ tutor }: { tutor: any }) {
  const { openContactZaloModal } = useUI();

  return (
    <div className="group relative bg-[#f4f5f7] hover:bg-[#ebedf1] rounded-3xl p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[330px]">
      {/* Clickable Area: Title, Bio, Name & Photo all directly link to teacher detail page */}
      <Link 
        to={`/giao-vien/${tutor.id}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-start justify-between gap-3 text-left group-hover:cursor-pointer"
        title={`Xem chi tiết hồ sơ ${tutor.name} (Mở tab mới)`}
      >
        {/* Left Side: Slogan, Bio, Teacher Name */}
        <div className="flex-1 min-w-0 pr-1 flex flex-col justify-between min-h-[155px]">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
              {tutor.headline || tutor.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
              {tutor.shortBio || tutor.teachingMethod || tutor.title}
            </p>
          </div>

          <div className="mt-auto pt-2">
            <span className="text-[10px] text-slate-400 font-medium block leading-none mb-0.5">
              {tutor.rolePrefix || (tutor.type === 'Giáo viên' ? (tutor.name.includes('Cô') ? 'Cô' : 'Thầy') : 'Gia sư')}
            </span>
            <span className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight block truncate">
              {tutor.displayName || tutor.name.replace(/^(Cô|Thầy|HLV|Gia sư)\s+/i, '')}
            </span>
          </div>
        </div>

        {/* Right Side: Portrait Photo with Subject Badge pill at bottom edge (là 1 phần của ảnh luôn) */}
        <div className="relative shrink-0 w-28 sm:w-32 flex flex-col items-center">
          <div className="w-full h-36 sm:h-40 rounded-2xl overflow-hidden shadow-xs border-2 border-white bg-slate-200">
            <img 
              src={tutor.avatar} 
              alt={tutor.name} 
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* Môn học nằm ngay chính giữa dưới (là 1 phần của ảnh luôn) */}
          <div className="-mt-3.5 z-20">
            <span className="bg-slate-900 text-white font-extrabold text-[11px] px-3.5 py-1 rounded-full shadow-md tracking-wide text-center whitespace-nowrap block">
              {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
            </span>
          </div>
        </div>
      </Link>

      {/* Quick Action Footer: Học phí 100% trên CÙNG 1 DÒNG (không bao giờ ngắt dòng) */}
      <div className="relative z-30 pt-3 border-t border-slate-200/80 mt-auto flex items-center justify-between gap-1 bg-[#f4f5f7]">
        <div className="min-w-0 flex-1 pr-1">
          <div className="text-[11px] sm:text-xs font-extrabold text-slate-900 whitespace-nowrap leading-tight">
            {tutor.hourlyRate}đ<span className="text-[10px] font-normal text-slate-500">/{tutor.priceUnit || 'giờ'}</span>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 mt-0.5 whitespace-nowrap">
            <svg className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{tutor.rating}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openContactZaloModal(tutor);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs transition-all shadow-xs hover:shadow-md cursor-pointer whitespace-nowrap shrink-0 text-center"
        >
          Liên hệ ngay
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 6. HOMEPAGE
// ==========================================
function HomePage() {
  const { openAuthModal } = useUI();
  const { tutors } = useData();
  
  return (
    <>
      <Hero />

      {/* Section 1: Giáo viên / Gia sư Tiêu biểu */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
              Giáo viên / Gia sư <span className="text-blue-600">Tiêu biểu tại Hà Nội</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl">
              Hồ sơ giáo viên, gia sư được kiểm định và đánh giá cao tại TP. Hà Nội.
            </p>
          </div>
          <Link to="/tim-gia-su" className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 text-sm md:text-base">
            Xem tất cả giáo viên →
          </Link>
        </div>

        {/* Nhóm Giáo viên chuyên nghiệp */}
        <div className="mb-12">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
            Giáo viên
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tutors.filter(t => t.type === 'Giáo viên').slice(0, 4).map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        </div>

        {/* Nhóm Gia sư */}
        <div>
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
            Gia sư
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tutors.filter(t => t.type === 'Sinh viên').slice(0, 4).map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: QUY TRÌNH KẾT NỐI & HỌC THỬ (FORMAL, FONT IN ĐẬM, CỠ CHỮ TO, BỎ ICON) */}
      <section className="py-16 md:py-24 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Quy trình kết nối & Học thử
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Quy trình 4 bước chuẩn mực và minh bạch: Kết nối trực tiếp, học thử 1-1 miễn phí và đánh giá khách quan qua tỷ lệ nhận lớp thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bước 1 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-5">
                  1
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2.5">
                  Lựa chọn Giáo viên
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tìm kiếm giáo viên phù hợp theo môn học và khu vực tại Hà Nội. Xem hồ sơ bằng cấp, video bài giảng mẫu đã qua kiểm định KYC.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Bước 1: Tra cứu hồ sơ
              </div>
            </div>

            {/* Bước 2 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-5">
                  2
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2.5">
                  Bấm "Liên hệ ngay"
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Hệ thống cung cấp Số điện thoại và Zalo trực tiếp của giáo viên để hai bên trao đổi chi tiết và sắp xếp lịch học thử 1-1 miễn phí.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Bước 2: Kết nối trực tiếp
              </div>
            </div>

            {/* Bước 3 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-5">
                  3
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2.5">
                  Buổi học thử 1-1
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Học sinh trải nghiệm thực tế phương pháp giảng dạy cùng giáo viên để đánh giá mức độ phù hợp và tiếp thu kiến thức.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Bước 3: Trải nghiệm 1 buổi miễn phí
              </div>
            </div>

            {/* Bước 4 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-5">
                  4
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2.5">
                  Đăng ký Học chính thức
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sau buổi học thử, học sinh ấn <strong>"Đăng ký học chính thức"</strong> để chốt khóa học. Trường hợp không đăng ký tiếp, <strong>tỷ lệ nhận lớp của giáo viên sẽ tự động giảm</strong> nhằm đảm bảo tính khách quan.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Bước 4: Xác nhận chính thức
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Call to Action */}
      <section className="py-16 md:py-20 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Kết nối với giáo viên và gia sư uy tín</h2>
          <p className="text-slate-300 text-sm md:text-base mb-8 max-w-xl mx-auto">
            Hơn 140+ giáo viên và gia sư đã qua kiểm định chuyên môn tại Hà Nội. Bắt đầu học thử ngay hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/tim-gia-su" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-sm transition-all text-sm md:text-base"
            >
              Tìm kiếm Giáo viên & Gia sư
            </Link>
            <button 
              onClick={() => openAuthModal('register', 'teacher')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3.5 rounded-2xl border border-slate-700 transition-all text-sm md:text-base cursor-pointer"
            >
              Đăng ký Giảng dạy
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

// FindTutorsPage - Bộ lọc tổng hợp (Văn hóa, Năng khiếu, Thể thao, Ngoại ngữ, Lập trình) & Checkbox Quận Hà Nội
function FindTutorsPage() {
  const { tutors } = useData();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  
  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const [appliedSearch, setAppliedSearch] = useState(params.get('search') || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(() => {
    const loc = params.get('location');
    return loc ? [loc] : [];
  });
  const [sortBy, setSortBy] = useState<'rating' | 'success_rate' | 'price_asc' | 'price_desc'>('rating');

  // Danh mục môn học tổng hợp đa lĩnh vực
  const subjectGroups = [
    {
      group: 'Môn học Văn hóa',
      items: ['Toán', 'Tiếng Anh', 'Ngữ Văn', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lý', 'Tin Học']
    },
    {
      group: 'Năng khiếu & Nghệ thuật',
      items: ['Đàn Piano', 'Đàn Guitar', 'Thanh nhạc / Hát', 'Vẽ / Hội họa', 'Organ / Ukulele']
    },
    {
      group: 'Thể thao & Võ thuật',
      items: ['Bơi lội', 'Võ thuật (Taekwondo / Karate / Tự vệ)', 'Cờ vua / Cờ tướng', 'Yoga / Fitness']
    },
    {
      group: 'Ngoại ngữ & Kỹ năng',
      items: ['IELTS', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn', 'Lập trình (Python / Web / Scratch)', 'Kỹ năng sống']
    }
  ];

  // Bộ lọc Giáo viên và Gia sư ngắn gọn
  const typesList = [
    { label: 'Giáo viên', value: 'Giáo viên' },
    { label: 'Gia sư', value: 'Sinh viên' }
  ];

  const levelsList = [
    'Tiểu học (Lớp 1-5)',
    'THCS (Lớp 6-9)',
    'THPT (Lớp 10-12)',
    'Luyện thi Đại học',
    'Năng khiếu / Người lớn'
  ];

  const formatsList = [
    { label: 'Học trực tuyến (Online)', value: 'online' },
    { label: 'Gia sư tại nhà (Offline)', value: 'offline' }
  ];

  // Danh sách các Quận/Huyện tại Hà Nội
  const hanoiDistrictsList = [
    'Cầu Giấy',
    'Đống Đa',
    'Hai Bà Trưng',
    'Ba Đình',
    'Thanh Xuân',
    'Hoàn Kiếm',
    'Nam Từ Liêm',
    'Bắc Từ Liêm',
    'Hà Đông',
    'Hoàng Mai',
    'Long Biên',
    'Tây Hồ',
    'Gia Lâm',
    'Thanh Trì',
    'Đông Anh',
    'Hoài Đức',
    'Online toàn Hà Nội'
  ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput);
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleType = (t: string) => {
    setSelectedTypes(prev => 
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const toggleLevel = (lvl: string) => {
    setSelectedLevels(prev => 
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  const toggleFormat = (fmt: string) => {
    setSelectedFormats(prev => 
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
  };

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev => 
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    );
  };

  const resetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setSelectedSubjects([]);
    setSelectedTypes([]);
    setSelectedLevels([]);
    setSelectedFormats([]);
    setSelectedDistricts([]);
    setSortBy('rating');
  };

  const filteredTutors = tutors.filter(t => {
    // Search query match
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchSub = t.subjects?.some((s: string) => s.toLowerCase().includes(q));
      const matchTitle = t.title?.toLowerCase().includes(q);
      if (!matchName && !matchSub && !matchTitle) return false;
    }

    // Subjects filter (đa lựa chọn)
    if (selectedSubjects.length > 0) {
      const hasSubject = selectedSubjects.some(sub => 
        t.subjects?.some((s: string) => s.toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes(s.toLowerCase()))
      );
      if (!hasSubject) return false;
    }

    // Types filter
    if (selectedTypes.length > 0) {
      if (!selectedTypes.includes(t.type)) return false;
    }

    // Formats filter
    if (selectedFormats.length > 0) {
      const matchesOnline = selectedFormats.includes('online') && t.isOnline;
      const matchesOffline = selectedFormats.includes('offline') && !t.isOnline;
      if (!matchesOnline && !matchesOffline) return false;
    }

    // Hanoi Districts Filter (Đa lựa chọn quận Hà Nội)
    if (selectedDistricts.length > 0) {
      const matchDistrict = selectedDistricts.some(d => {
        if (d === 'online' || d === 'Online toàn Hà Nội') return t.isOnline;
        return t.location.toLowerCase().includes(d.toLowerCase());
      });
      if (!matchDistrict) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'success_rate') {
      const rateA = a.trialStats?.totalTrials > 0 ? (a.trialStats.officialEnrolled / a.trialStats.totalTrials) : 0.95;
      const rateB = b.trialStats?.totalTrials > 0 ? (b.trialStats.officialEnrolled / b.trialStats.totalTrials) : 0.95;
      return rateB - rateA;
    }
    const priceA = parseInt(String(a.hourlyRate).replace(/\D/g, '')) || 0;
    const priceB = parseInt(String(b.hourlyRate).replace(/\D/g, '')) || 0;
    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    return 0;
  });

  const activeFiltersCount = selectedSubjects.length + selectedTypes.length + selectedLevels.length + selectedFormats.length + selectedDistricts.length + (appliedSearch ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-2 border border-slate-200">
          Khu vực TP. Hà Nội
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Danh sách Giáo viên & Gia sư tại Hà Nội
        </h1>
        <p className="text-slate-500 text-sm">
          Nền tảng kết nối toàn diện: Văn hóa, Ngoại ngữ, Năng khiếu Âm nhạc, Hội họa, Võ thuật & Bơi lội tại Hà Nội.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* LEFT COLUMN: BỘ LỌC DỌC (VERTICAL SIDEBAR FILTER) */}
        <aside className="lg:col-span-1 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs sticky top-24 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
              <Filter className="w-4 h-4 text-blue-600" /> Bộ lọc tìm kiếm
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button 
                type="button" 
                onClick={resetFilters} 
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Đặt lại
              </button>
            )}
          </div>

          {/* 1. Nhập từ khóa (Nhấn Enter để tìm) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Từ khóa tìm kiếm
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(e); }}
                placeholder="Tên giáo viên, môn, bơi, đàn... (Enter)"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs text-slate-800 outline-none transition-colors"
              />
              {searchInput && (
                <button 
                  type="button" 
                  onClick={() => { setSearchInput(''); setAppliedSearch(''); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
            <span className="text-[10px] text-slate-400 block mt-1">Nhấn phím <strong>Enter</strong> để tìm kiếm</span>
          </div>

          {/* 2. Đối tượng: Giáo viên / Gia sư (Bộ lọc ngắn gọn) */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Đối tượng giảng dạy
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typesList.map(t => (
                <label key={t.value} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${selectedTypes.includes(t.value) ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.includes(t.value)}
                    onChange={() => toggleType(t.value)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Môn học tổng hợp đa lĩnh vực (Văn hóa, Đàn, Võ, Bơi, Vẽ, Lập trình...) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Môn học & Năng khiếu
              </label>
              {selectedSubjects.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setSelectedSubjects([])}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Bỏ chọn ({selectedSubjects.length})
                </button>
              )}
            </div>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {subjectGroups.map(grp => (
                <div key={grp.group} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {grp.group}
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {grp.items.map(sub => (
                      <label key={sub} className="flex items-center gap-2 text-xs text-slate-700 hover:text-blue-600 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedSubjects.includes(sub)}
                          onChange={() => toggleSubject(sub)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                        />
                        <span>{sub}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Quận / Huyện tại Hà Nội (Checkboxes) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Quận/Huyện tại Hà Nội
              </label>
              {selectedDistricts.length > 0 && (
                <button 
                  type="button" 
                  onClick={() => setSelectedDistricts([])}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Bỏ chọn ({selectedDistricts.length})
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {hanoiDistrictsList.map(district => (
                <label key={district} className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-blue-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={selectedDistricts.includes(district)}
                    onChange={() => toggleDistrict(district)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                  />
                  <span className={district === 'Online toàn Hà Nội' ? 'font-bold text-blue-600' : ''}>
                    {district}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Cấp học / Độ tuổi */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Cấp học / Trình độ
            </label>
            <div className="space-y-2">
              {levelsList.map(lvl => (
                <label key={lvl} className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-blue-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={selectedLevels.includes(lvl)}
                    onChange={() => toggleLevel(lvl)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                  />
                  <span>{lvl}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 6. Hình thức học tập */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Hình thức học tập
            </label>
            <div className="space-y-2">
              {formatsList.map(fmt => (
                <label key={fmt.value} className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-blue-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={selectedFormats.includes(fmt.value)}
                    onChange={() => toggleFormat(fmt.value)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                  />
                  <span>{fmt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: KẾT QUẢ TÌM KIẾM & DANH SÁCH THẺ GIA SƯ */}
        <main className="lg:col-span-3 space-y-6">
          {/* Sắp xếp & Thống kê kết quả */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-xs sm:text-sm font-semibold text-slate-700">
              Tìm thấy <strong className="text-blue-600 text-base">{filteredTutors.length}</strong> giáo viên tại Hà Nội
              {appliedSearch && <span> cho từ khóa "<strong className="text-slate-900">{appliedSearch}</strong>"</span>}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Sắp xếp:</span>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="rating">Đánh giá cao nhất</option>
                <option value="success_rate">Tỷ lệ nhận lớp cao nhất</option>
                <option value="price_asc">Học phí: Thấp đến cao</option>
                <option value="price_desc">Học phí: Cao đến thấp</option>
              </select>
            </div>
          </div>

          {/* Grid kết quả */}
          {filteredTutors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredTutors.map(tutor => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Không tìm thấy giáo viên nào phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hãy thử bỏ bớt các ô tích lọc hoặc tìm kiếm bằng từ khóa môn học khác.
              </p>
              <button 
                type="button" 
                onClick={resetFilters}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// TeacherDetailPage - Giao diện thông tin giáo viên theo chuẩn đặc tả Google Docs
function TeacherDetailPage() {
  const { id } = useParams();
  const { tutors, myTrials, cancelTrialEnrollment, reviews } = useData();
  const { openContactZaloModal, openEnrollmentModal, openReviewModal } = useUI();
  const [reviewFilter, setReviewFilter] = useState<'all' | 'trial' | 'official'>('all');
  const [activeProofModal, setActiveProofModal] = useState<string | null>(null);

  const tutor = tutors.find(t => String(t.id) === String(id)) || tutors[0];

  if (!tutor) {
    return <div className="p-12 text-center text-slate-500">Không tìm thấy giáo viên</div>;
  }

  const trialItem = myTrials.find(t => String(t.tutorId) === String(tutor.id));

  const totalTrials = tutor.trialStats?.totalTrials || 0;
  const officialEnrolled = tutor.trialStats?.officialEnrolled || 0;
  const successRate = totalTrials > 0
    ? Math.round((officialEnrolled / totalTrials) * 100)
    : 95;

  const tutorReviews = reviews.filter(r => String(r.tutorId) === String(tutor.id));
  const displayedReviews = tutorReviews.filter(r => {
    if (reviewFilter === 'trial') return r.stage === 'trial';
    if (reviewFilter === 'official') return r.stage !== 'trial';
    return true;
  });

  const shifts = ['Sáng', 'Chiều', 'Tối'];
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const coverBannerUrl = tutor.coverImage || tutor.otherImages?.[0] || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* 4. Ảnh cá nhân khác (1 ảnh) - Trình bày như ảnh bìa Facebook & Header Hồ sơ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          {/* Cover Banner (Ảnh bìa FB) */}
          <div className="relative h-48 sm:h-64 md:h-80 w-full bg-slate-900 group">
            <img 
              src={coverBannerUrl} 
              alt="Ảnh bìa hồ sơ giáo viên" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Đang nhận lớp mới
            </div>
          </div>

          {/* Profile Header Info: 3. Avatar + 1. Tên hiển thị + 2. Headline */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                {/* 3. Ảnh đại diện (Avatar) */}
                <div className="relative shrink-0">
                  <img 
                    src={tutor.avatar} 
                    alt={tutor.displayName || tutor.name} 
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-white" 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Đã đối soát danh tính KYC">
                    <CheckCircle className="w-4 h-4 fill-white text-emerald-500" />
                  </div>
                </div>

                {/* 1. Tên hiển thị trên web & 2. Headline */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    {/* 1. Tên hiển thị trên web */}
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {tutor.displayName || tutor.name}
                    </h1>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Đã xác thực KYC
                    </span>
                    <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {tutor.badgeSubject || tutor.subjects?.[0] || 'Giáo viên'}
                    </span>
                  </div>

                  {/* 2. Dòng giới thiệu ngắn (Headline / Slogan) */}
                  <p className="text-base sm:text-lg text-blue-700 font-semibold italic">
                    "{tutor.headline || tutor.title}"
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      Đánh giá: <strong className="text-slate-900">{tutor.rating}/5.0</strong> ({tutor.reviews || 0} lượt)
                    </span>
                    <span>Khu vực: <strong className="text-slate-900">{tutor.location}</strong></span>
                    {tutor.experience && (
                      <span>Kinh nghiệm: <strong className="text-slate-900">{tutor.experience} năm</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tỷ lệ nhận lớp thành công */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 sm:text-right shrink-0">
                <div className="text-xs font-bold text-emerald-900">Tỷ lệ nhận lớp thành công</div>
                <div className="text-2xl font-black text-emerald-700">{successRate}%</div>
                <div className="text-[11px] text-emerald-800 font-medium">({officialEnrolled}/{totalTrials > 0 ? totalTrials : 1} học viên chốt học sau học thử)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Columns: Left 2 cols, Right Sticky 1 col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info (Strictly Following Google Docs Sequence) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 6. Môn học tiếp nhận */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">6</div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Môn học tiếp nhận</h2>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {(tutor.subjects && tutor.subjects.length > 0 ? tutor.subjects : ['Toán học', 'Ngữ văn', 'Tiếng Anh']).map((sub: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="px-4 py-2 bg-blue-50 text-blue-800 text-xs sm:text-sm font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* 9. Cấp học & Đối tượng nhận dạy */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">9</div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Cấp học & Đối tượng nhận dạy</h2>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-sm text-slate-800 leading-relaxed font-medium">
                {tutor.targetAudience || 'Nhận dạy kèm tất cả các cấp học từ cơ bản đến nâng cao theo nguyện vọng của học sinh và phụ huynh; Bồi dưỡng học sinh mất gốc và luyện thi vào các trường chuyên/đại học.'}
              </div>
            </div>

            {/* 12. Bảng giá dịch vụ */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">12</div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Bảng giá dịch vụ</h2>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Học phí theo {tutor.priceUnit || 'giờ'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {tutor.levelPrices && Object.keys(tutor.levelPrices).length > 0 ? (
                  Object.entries(tutor.levelPrices).map(([lvl, prc]) => (
                    <div key={lvl} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-slate-600 mb-1">{lvl}</span>
                      <span className="text-lg font-extrabold text-blue-700">{prc}đ <span className="text-xs font-normal text-slate-500">/{tutor.priceUnit || 'giờ'}</span></span>
                    </div>
                  ))
                ) : (
                  <div className="sm:col-span-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Học phí dạy kèm theo giờ:</span>
                    <span className="text-xl font-extrabold text-blue-700">{tutor.hourlyRate}đ <span className="text-xs font-normal text-slate-500">/{tutor.priceUnit || 'giờ'}</span></span>
                  </div>
                )}
              </div>
            </div>

            {/* 13. Lịch học & Cam kết vận hành */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">13</div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Lịch học & Khung giờ nhận lớp</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  Cam kết phản hồi: {tutor.responseTime || 'Dưới 30 phút'}
                </span>
              </div>

              {/* Ma trận Lịch trống */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse text-xs text-center">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="p-2.5 text-left pl-3.5">Ca dạy</th>
                        {days.map(d => <th key={d} className="p-2.5">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map(shift => (
                        <tr key={shift} className="border-b border-slate-100 last:border-0">
                          <td className="p-2.5 font-bold text-slate-700 text-left pl-3.5 bg-slate-50/60">{shift}</td>
                          {days.map(day => {
                            const slot = `${day}_${shift}`;
                            const isAvailable = tutor.schedule ? tutor.schedule.includes(slot) : (shift === 'Tối');
                            return (
                              <td key={day} className="p-1">
                                {isAvailable ? (
                                  <span className="block py-1.5 px-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] shadow-2xs">
                                    Có thể
                                  </span>
                                ) : (
                                  <span className="block py-1.5 px-2 text-slate-300 text-[11px]">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 10. Hình thức giảng dạy */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">10</div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Hình thức giảng dạy</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trực tuyến (Online) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                    <Globe className="w-4 h-4" />
                    <span>Trực tuyến (Online)</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {tutor.teachingFormatsOnline || 'Nền tảng Google Meet, Zoom PRO, MS Teams (Tích hợp chia sẻ màn hình & bảng vẽ thông minh)'}
                  </p>
                </div>

                {/* Trực tiếp (Offline) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Trực tiếp (Offline)</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {tutor.teachingFormatsOffline || tutor.location || 'Tại nhà học viên / Nhà giáo viên trong khu vực đăng ký'}
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Chứng chỉ chuyên môn & Nghiệp vụ sư phạm */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">7</div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Chứng chỉ chuyên môn & Nghiệp vụ sư phạm</h2>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Đã đối soát bản gốc
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(tutor.certificates && tutor.certificates.length > 0 ? tutor.certificates : [
                  'Chứng chỉ Sư phạm / Chuyên môn Quốc tế',
                  'Văn bằng & Chứng chỉ Giảng dạy Chuyên sâu'
                ]).map((cert: string, idx: number) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 leading-snug truncate">
                        {cert}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      Xác thực
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Thành tích, phương pháp giảng dạy */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-sm">8</div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Thành tích & Phương pháp giảng dạy</h2>
                </div>
                {tutor.achievementProofUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveProofModal(tutor.achievementProofUrl || null)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem minh chứng
                  </button>
                )}
              </div>

              {/* Đặc điểm & Tính cách */}
              <div className="flex flex-wrap gap-2">
                {(tutor.personality || ['Tận tâm', 'Kiên nhẫn', 'Thân thiện', 'Truyền cảm hứng']).map((trait: string) => (
                  <span key={trait} className="px-3.5 py-1.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200">
                    #{trait}
                  </span>
                ))}
              </div>

              {/* Bài viết chi tiết background (~200 từ) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-sm text-slate-700 leading-relaxed space-y-3 font-normal">
                <p>
                  {tutor.teachingAchievement || tutor.successStory || tutor.teachingMethod || 'Giáo viên luôn tận tâm đồng hành cùng học sinh, chú trọng xây dựng nền tảng vững chắc và kích hoạt tư duy phản xạ sáng tạo.'}
                </p>
                {tutor.teachingMethod && tutor.teachingMethod !== tutor.teachingAchievement && (
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 font-medium">
                    <strong>Phương pháp cốt lõi:</strong> {tutor.teachingMethod}
                  </div>
                )}
                {tutor.philosophy && (
                  <div className="border-l-4 border-blue-500 bg-white p-3 rounded-r-xl text-xs italic text-slate-800">
                    "{tutor.philosophy}"
                  </div>
                )}
              </div>
            </div>

            {/* 11. Tài liệu đào tạo */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">11</div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Tài liệu đào tạo</h2>
              </div>

              {/* Học liệu cung cấp */}
              {tutor.trainingMaterials && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-xs font-bold text-slate-700 block uppercase">Học liệu cung cấp cho học viên:</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{tutor.trainingMaterials}</p>
                </div>
              )}

              {/* Video bài giảng mẫu */}
              <div>
                <span className="text-xs font-bold text-slate-700 block uppercase mb-2">Video bài giảng mẫu:</span>
                <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center relative">
                  <iframe 
                    className="w-full h-full"
                    src={tutor.videoDemo || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"} 
                    title="Video Demo Bài Giảng"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            {/* Comment của học sinh */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Comment & Đánh giá của học sinh
                    </h2>
                    <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                      {tutorReviews.length} nhận xét
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Đánh giá từ phụ huynh & học sinh đã học thử 1-1 hoặc theo học chính thức
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openReviewModal(tutor, trialItem?.status === 'enrolled' ? 'official' : 'trial')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md shadow-blue-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Viết nhận xét & Đánh giá
                </button>
              </div>

              {/* Rating Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {tutor.rating || 5.0}
                    <span className="text-base text-slate-400 font-normal">/5</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-1 block">
                      Dựa trên {tutorReviews.length || tutor.reviews || 10} đánh giá thực tế
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center">
                    <span className="text-xs font-bold block">100% Hài lòng</span>
                    <span className="text-[10px] text-emerald-600">Sau học thử 1-1</span>
                  </div>
                  <div className="px-4 py-2 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 text-center">
                    <span className="text-xs font-bold block">{successRate}% Tiếp tục</span>
                    <span className="text-[10px] text-blue-600">Đăng ký chính thức</span>
                  </div>
                </div>
              </div>

              {/* Reviews Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    reviewFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({tutorReviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('trial')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    reviewFilter === 'trial'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sau học thử 1-1 ({tutorReviews.filter(r => r.stage === 'trial').length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('official')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    reviewFilter === 'official'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Đang học chính thức ({tutorReviews.filter(r => r.stage !== 'trial').length})
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-3.5">
                {displayedReviews.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500">Chưa có nhận xét nào trong mục này.</p>
                    <button
                      type="button"
                      onClick={() => openReviewModal(tutor, 'trial')}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Hãy là người đầu tiên gửi đánh giá cho {tutor.name} →
                    </button>
                  </div>
                ) : (
                  displayedReviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 transition-colors space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {rev.avatar ? (
                            <img src={rev.avatar} alt={rev.studentName} className="w-10 h-10 rounded-full object-cover shadow-2xs shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                              {rev.studentName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{rev.studentName}</span>
                              {rev.verified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                  <ShieldCheck className="w-3 h-3" /> Đã xác thực
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{rev.date}</span>
                          </div>
                        </div>

                        {/* Stage Pill */}
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                          rev.stage === 'trial'
                            ? 'bg-blue-100/80 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100/80 text-emerald-800 border border-emerald-200'
                        }`}>
                          {rev.stageText || (rev.stage === 'trial' ? 'Sau buổi học thử 1-1' : 'Đang học chính thức')}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sticky Action Widget */}
          <div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-28 space-y-5">
              <div>
                <span className="text-xs text-slate-500 font-semibold block uppercase">Học phí tham khảo</span>
                <span className="text-2xl font-extrabold text-slate-900">{tutor.hourlyRate}đ <span className="text-xs font-normal text-slate-500">/{tutor.priceUnit || 'giờ'}</span></span>
              </div>

              {/* Highlighted Success Rate Card */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-900">Tỷ lệ nhận lớp thành công:</span>
                  <span className="text-base font-extrabold text-emerald-700">{successRate}%</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-emerald-800">
                  <span>Học viên chốt học sau học thử:</span>
                  <span className="font-bold">{officialEnrolled}/{totalTrials > 0 ? totalTrials : 1}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Học thử 1-1:</span>
                  <span className="font-bold text-slate-900">Miễn phí</span>
                </div>
                <div className="flex justify-between">
                  <span>Xác thực hồ sơ KYC:</span>
                  <span className="font-bold text-emerald-700">Đã kiểm duyệt 100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian phản hồi:</span>
                  <span className="font-bold text-blue-700">{tutor.responseTime || 'Dưới 30 phút'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {trialItem?.status === 'trial_in_progress' ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="text-xs text-slate-900 font-bold">
                      Trạng thái: Đang trao đổi & học thử cùng {tutor.displayName || tutor.name}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed flex items-center justify-between">
                      <span>Kênh kết nối:</span> <strong className="text-blue-600">Zalo chính thức đã xác thực</strong>
                    </p>
                    
                    <a
                      href={`https://zalo.me/${(tutor.zalo || tutor.phone || '0912345678').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#0068FF] hover:bg-[#0056d6] text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center shadow-xs text-center"
                    >
                      Nhắn Zalo giáo viên
                    </a>

                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <button
                        type="button"
                        onClick={() => openEnrollmentModal(tutor)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer text-xs shadow-sm"
                      >
                        Đăng ký học chính thức
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelTrialEnrollment(tutor.id)}
                        className="w-full bg-white hover:bg-slate-100 text-slate-600 hover:text-red-600 font-semibold py-2 rounded-xl transition-all border border-slate-200 text-xs cursor-pointer"
                        title="Hủy học / Không đăng ký tiếp (Sẽ làm giảm tỷ lệ nhận lớp của giáo viên)"
                      >
                        Không tiếp tục đăng ký
                      </button>
                    </div>
                  </div>
                ) : trialItem?.status === 'enrolled' ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                    <div className="text-xs text-slate-900 font-bold">
                      Đã đăng ký học chính thức cùng {tutor.displayName || tutor.name}
                    </div>
                    <p className="text-xs text-slate-600">
                      Khóa học đã được kích hoạt trên hệ thống.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openContactZaloModal(tutor)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer text-sm"
                    >
                      Liên hệ ngay (Zalo / SĐT)
                    </button>
                    <p className="text-center text-xs text-slate-500">
                      Kết nối Zalo trực tiếp & 01 buổi học thử miễn phí
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Xem Minh chứng thành tích */}
      {activeProofModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveProofModal(null)}
        >
          <div 
            className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveProofModal(null)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-3">Tài liệu minh chứng thành tích</h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-[70vh] flex items-center justify-center bg-slate-50">
              <img src={activeProofModal} alt="Minh chứng thành tích" className="max-h-[65vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// AdminDashboardPage
function AdminDashboardPage() {
  const { tutors, pendingTutors, adminStats, approveTutorKyc, rejectTutorKyc } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('hantutor_admin_auth') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [currentTab, setCurrentTab] = useState<'kyc' | 'requests' | 'tutors' | 'analytics'>('kyc');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ isOpen: boolean; title: string; imageUrl: string; tutorName: string } | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123' || adminPassword === 'hantutor@2026') {
      sessionStorage.setItem('hantutor_admin_auth', 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Mật khẩu quản trị viên không chính xác. Vui lòng thử lại!');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('hantutor_admin_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Cổng Quản trị viên</h2>
          <p className="text-xs text-slate-500 mb-6">Xác thực quyền quản trị hệ thống HanTutor</p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu quản trị</label>
              <input 
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdminLogin(e); }}
                placeholder="Nhập mật khẩu quản trị viên..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer"
            >
              Đăng nhập Quản trị
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link to="/" className="text-xs text-slate-500 hover:text-blue-600 font-semibold">
              ← Quay lại trang chủ người dùng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingList = pendingTutors.filter(t => t.kycStatus === 'pending');
  const approvedList = tutors.filter(t => t.kycStatus === 'approved');
  const displayedKycList = kycFilter === 'pending' ? pendingList : kycFilter === 'approved' ? approvedList : [...pendingList, ...approvedList];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Logo light={true} />
          <span className="bg-blue-600/30 text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-md border border-blue-500/30">
            Admin Portal
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/" className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
            🌐 Xem website người dùng
          </Link>
          <button onClick={handleAdminLogout} className="text-red-400 hover:text-red-300 font-bold cursor-pointer">
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Lượt truy cập</span>
            <span className="text-xl font-extrabold text-slate-900">{adminStats.pageViews?.toLocaleString()}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng Giáo viên</span>
            <span className="text-xl font-extrabold text-blue-600">{tutors.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Chờ duyệt KYC</span>
            <span className="text-xl font-extrabold text-amber-600">{pendingList.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Liên hệ Học thử</span>
            <span className="text-xl font-extrabold text-indigo-600">{adminStats.totalTrialContacts}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Học chính thức</span>
            <span className="text-xl font-extrabold text-emerald-600">{adminStats.totalOfficialEnrolled}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tỷ lệ thành công</span>
            <span className="text-xl font-extrabold text-emerald-700">{adminStats.avgTrialSuccessRate}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
          <button 
            onClick={() => setCurrentTab('kyc')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${currentTab === 'kyc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Duyệt hồ sơ KYC ({pendingList.length})
          </button>
          <button 
            onClick={() => setCurrentTab('requests')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${currentTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Yêu cầu Học thử & Giao dịch
          </button>
          <button 
            onClick={() => setCurrentTab('analytics')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${currentTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Phân bổ Doanh thu (30%/70%)
          </button>
        </div>

        {/* TAB 1: KYC APPROVAL */}
        {currentTab === 'kyc' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Danh sách hồ sơ cần phê duyệt KYC</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setKycFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${kycFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                  Chờ duyệt ({pendingList.length})
                </button>
                <button 
                  onClick={() => setKycFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${kycFilter === 'approved' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                  Đã duyệt ({approvedList.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedKycList.map(tutor => (
                <div key={tutor.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-start gap-4">
                    <img src={tutor.avatar} alt={tutor.name} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <Link 
                          to={`/giao-vien/${tutor.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-slate-900 hover:text-blue-600 text-base flex items-center gap-1 group"
                        >
                          {tutor.name}
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                        </Link>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${tutor.kycStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {tutor.kycStatus === 'approved' ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{tutor.title}</p>
                      <p className="text-xs text-blue-600 font-semibold mt-1">SĐT/Zalo: {tutor.phone || tutor.zalo}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl text-xs space-y-1 text-slate-700">
                    <div><strong>Học vấn:</strong> {tutor.education}</div>
                    <div><strong>Môn dạy:</strong> {tutor.subjects?.join(', ')}</div>
                    <div><strong>Khu vực:</strong> {tutor.location}</div>
                  </div>

                  {/* KYC Clickable Document Lightbox */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-700">Tài liệu CCCD & Bằng cấp:</span>
                      <span className="text-[11px] text-blue-600 font-semibold">🔍 Nhấp vào ảnh để phóng to</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDocPreview({
                          isOpen: true,
                          title: 'Căn cước công dân (Mặt trước)',
                          imageUrl: tutor.cccdFront || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800',
                          tutorName: tutor.name
                        })}
                        className="border border-slate-200 hover:border-blue-500 rounded-xl p-1 bg-slate-50 text-center cursor-pointer transition-all group block"
                      >
                        <div className="text-[10px] text-slate-500 font-semibold mb-1 group-hover:text-blue-600">CCCD Mặt trước</div>
                        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-white">
                          <img src={tutor.cccdFront} alt="CCCD Front" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDocPreview({
                          isOpen: true,
                          title: 'Căn cước công dân (Mặt sau)',
                          imageUrl: tutor.cccdBack || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800',
                          tutorName: tutor.name
                        })}
                        className="border border-slate-200 hover:border-blue-500 rounded-xl p-1 bg-slate-50 text-center cursor-pointer transition-all group block"
                      >
                        <div className="text-[10px] text-slate-500 font-semibold mb-1 group-hover:text-blue-600">CCCD Mặt sau</div>
                        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-white">
                          <img src={tutor.cccdBack} alt="CCCD Back" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDocPreview({
                          isOpen: true,
                          title: 'Bằng Tốt Nghiệp Đại Học / Chứng Chỉ',
                          imageUrl: tutor.credentialFile || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800',
                          tutorName: tutor.name
                        })}
                        className="border border-slate-200 hover:border-blue-500 rounded-xl p-1 bg-slate-50 text-center cursor-pointer transition-all group block"
                      >
                        <div className="text-[10px] text-slate-500 font-semibold mb-1 group-hover:text-blue-600">Bằng ĐH / Chứng chỉ</div>
                        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-white">
                          <img src={tutor.credentialFile} alt="Degree" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  {tutor.kycStatus === 'pending' ? (
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          approveTutorKyc(tutor.id);
                          alert(`Đã phê duyệt KYC thành công cho giáo viên ${tutor.name}!`);
                        }}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        ✓ Phê duyệt hồ sơ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          rejectTutorKyc(tutor.id);
                          alert(`Đã từ chối hồ sơ của giáo viên ${tutor.name}.`);
                        }}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 text-center text-xs font-semibold text-emerald-600">
                      ✓ Hồ sơ này đã được xác thực chính thức
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: REQUESTS */}
        {currentTab === 'requests' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Lịch sử Yêu cầu Học thử & Đăng ký chính thức</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Học sinh</th>
                    <th className="pb-3">Giáo viên</th>
                    <th className="pb-3">Loại yêu cầu</th>
                    <th className="pb-3">Thời gian</th>
                    <th className="pb-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(adminStats.recentActivities || []).map((act: any) => (
                    <tr key={act.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-900">{act.student || 'Học sinh'}</td>
                      <td className="py-3 font-medium text-blue-600">{act.tutor}</td>
                      <td className="py-3">{act.type === 'trial_contact' ? 'Học thử 1-1 Zalo' : act.type === 'official_enrolled' ? 'Học chính thức' : 'Xét duyệt KYC'}</td>
                      <td className="py-3 text-slate-400">{act.time}</td>
                      <td className="py-3 font-bold text-emerald-600">{act.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REVENUE SPLIT */}
        {currentTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Cơ chế Phân bổ Doanh thu Học phí</h3>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-2">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Trung tâm vận hành (30%):</span>
                  <span className="text-blue-700 font-extrabold">Tự động giữ lại duy trì sàn</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Giáo viên nhận (70%):</span>
                  <span className="text-emerald-700 font-extrabold">Tự động chuyển vào STK đã đăng ký</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tất cả các giao dịch thanh toán VietQR đều được chia tách tự động theo tỷ lệ quy định 30% / 70% và cập nhật trực tiếp vào cơ sở dữ liệu.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {selectedDocPreview && selectedDocPreview.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedDocPreview(null)}
        >
          <div 
            className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedDocPreview.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Giáo viên: <strong className="text-slate-800">{selectedDocPreview.tutorName}</strong></p>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={selectedDocPreview.imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở ảnh gốc
                </a>
                <button 
                  onClick={() => setSelectedDocPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-slate-900/5 flex items-center justify-center min-h-[350px]">
              <img 
                src={selectedDocPreview.imageUrl} 
                alt={selectedDocPreview.title} 
                className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-lg border border-slate-200 bg-white"
              />
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
              <span className="text-slate-500">Kiểm tra thông tin họ tên, ngày sinh và số hiệu văn bằng khớp với hồ sơ.</span>
              <button 
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 6. TutorRegistrationPage - Form hồ sơ đăng ký giáo viên chuẩn đặc tả Google Docs
function TutorRegistrationPage() {
  const { addMockTutor } = useData();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ================= PHẦN I: THẨM ĐỊNH DANH TÍNH & BẢO MẬT HỒ SƠ =================
  // 1. Định danh cá nhân (KYC)
  const [fullName, setFullName] = useState(urlParams.get('name') || '');
  const [cccdNumber, setCccdNumber] = useState('');
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string>('');
  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string>('');

  // 2. Thông tin liên hệ & Kênh thanh toán
  const [phone, setPhone] = useState(urlParams.get('phone') || '');
  const [email, setEmail] = useState(urlParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [bankName, setBankName] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  // ================= PHẦN II: THÔNG TIN GIẢNG DẠY (HIỂN THỊ TRÊN WEB) =================
  // 1. Tên hiển thị trên web
  const [displayName, setDisplayName] = useState(urlParams.get('name') || '');

  // 2. Dòng giới thiệu ngắn (Headline / Slogan)
  const [headline, setHeadline] = useState('');

  // 3. Ảnh đại diện (Avatar)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showSampleModal, setShowSampleModal] = useState(false);

  // 4. Ảnh cá nhân khác (3 ảnh - optional)
  const [otherImages, setOtherImages] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState<string>('');

  // 5. Trình độ học vấn
  const [educationLevel, setEducationLevel] = useState('Đại học');
  const [major, setMajor] = useState('');
  const [university, setUniversity] = useState('Đại học Sư phạm Hà Nội');
  const [customUniversity, setCustomUniversity] = useState('');
  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [credentialPreview, setCredentialPreview] = useState<string>('');

  // 6. Môn học tiếp nhận
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');

  // 7. Chứng chỉ chuyên môn & Nghiệp vụ sư phạm
  const [subjectCertificates, setSubjectCertificates] = useState('');
  const [pedagogicalCertificates, setPedagogicalCertificates] = useState('');
  const [certificateProofFile, setCertificateProofFile] = useState<File | null>(null);
  const [certificateProofPreview, setCertificateProofPreview] = useState<string>('');

  // 8. Thành tích, phương pháp giảng dạy
  const [teachingAchievement, setTeachingAchievement] = useState('');
  const [experience, setExperience] = useState('');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(['Tận tâm', 'Kiên nhẫn']);
  const [customPersonality, setCustomPersonality] = useState('');
  const [achievementFile, setAchievementFile] = useState<File | null>(null);
  const [achievementPreview, setAchievementPreview] = useState<string>('');

  // 9. Cấp học & Đối tượng nhận dạy (Giáo viên tự điền, KHÔNG tạo ô chọn sẵn)
  const [targetAudience, setTargetAudience] = useState('');

  // 10. Hình thức giảng dạy
  const [teachingFormatsOnline, setTeachingFormatsOnline] = useState('Google Meet, Zoom PRO, MS Teams');
  const [teachingFormatsOffline, setTeachingFormatsOffline] = useState('');
  const [isOnlineSupport, setIsOnlineSupport] = useState(true);
  const [isOfflineSupport, setIsOfflineSupport] = useState(true);

  // 11. Tài liệu đào tạo (Optional)
  const [trainingMaterials, setTrainingMaterials] = useState('');
  const [videoDemo, setVideoDemo] = useState('');

  // 12. Bảng giá dịch vụ (VNĐ/giờ)
  const [hourlyRate, setHourlyRate] = useState('200.000 - 350.000');
  const [priceUnit, setPriceUnit] = useState('giờ');
  const [levelPrices, setLevelPrices] = useState<Record<string, string>>({
    'THCS (Lớp 6-9)': '200.000',
    'THPT (Lớp 10-12)': '280.000',
    'Luyện thi Đại học / Chuyên': '350.000'
  });

  // 13. Lịch học & Cam kết vận hành
  const [scheduleSlots, setScheduleSlots] = useState<string[]>(['Thứ 2_Tối', 'Thứ 4_Tối', 'Thứ 6_Tối', 'Chủ Nhật_Sáng']);
  const [responseTime, setResponseTime] = useState<'Dưới 30 phút' | 'Dưới 1 giờ' | 'Dưới 3 giờ'>('Dưới 30 phút');
  const [commitAccurate, setCommitAccurate] = useState(false);
  const [commitConduct, setCommitConduct] = useState(false);
  const [commitTerms, setCommitTerms] = useState(false);

  // Lists & Options
  const banksList = [
    'Vietcombank (VCB)', 'VietinBank (CTG)', 'BIDV', 'Agribank',
    'MB Bank', 'Techcombank', 'VPBank', 'ACB', 'Sacombank',
    'TPBank', 'SHB', 'HDBank', 'SeABank', 'OCB', 'MSB',
    'LienVietPostBank', 'Nam A Bank', 'VIB', 'Eximbank', 'Ngân hàng khác (Tự nhập)'
  ];

  const popularSubjects = [
    'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học',
    'Lịch sử', 'Địa lý', 'Tin học', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn',
    'Đàn Piano', 'Đàn Guitar', 'Vẽ / Mỹ thuật', 'Bơi lội', 'Cầu lông', 'Bóng rổ',
    'Võ thuật (Tự vệ)', 'Cờ vua', 'Yoga'
  ];

  const suggestedPersonalities = [
    'Tận tâm', 'Kiên nhẫn', 'Thân thiện', 'Truyền cảm hứng', 'Năng lượng',
    'Hài hước', 'Logic cao', 'Sắc sảo', 'Tỉ mỉ', 'Chiến thuật rõ ràng'
  ];

  const shifts = ['Sáng', 'Chiều', 'Tối'];
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover' | 'other' | 'cccdFront' | 'cccdBack' | 'credential' | 'certProof' | 'achievement') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Tệp tải lên không được vượt quá 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(dataUrl);
      } else if (type === 'cover') {
        setCoverPreview(dataUrl);
        setOtherImages(prev => [dataUrl, ...prev.slice(0, 2)]);
      } else if (type === 'other') {
        setOtherImages(prev => prev.length < 3 ? [...prev, dataUrl] : [prev[0], prev[1], dataUrl]);
      } else if (type === 'cccdFront') {
        setCccdFrontFile(file);
        setCccdFrontPreview(dataUrl);
      } else if (type === 'cccdBack') {
        setCccdBackFile(file);
        setCccdBackPreview(dataUrl);
      } else if (type === 'credential') {
        setCredentialFile(file);
        setCredentialPreview(dataUrl);
      } else if (type === 'certProof') {
        setCertificateProofFile(file);
        setCertificateProofPreview(dataUrl);
      } else if (type === 'achievement') {
        setAchievementFile(file);
        setAchievementPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleScheduleSlot = (day: string, shift: string) => {
    const slot = `${day}_${shift}`;
    if (scheduleSlots.includes(slot)) {
      setScheduleSlots(scheduleSlots.filter(s => s !== slot));
    } else {
      setScheduleSlots([...scheduleSlots, slot]);
    }
  };

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const togglePersonality = (p: string) => {
    if (personalityTraits.includes(p)) {
      setPersonalityTraits(personalityTraits.filter(t => t !== p));
    } else {
      setPersonalityTraits([...personalityTraits, p]);
    }
  };

  const validatePartI = () => {
    if (!fullName.trim()) return "Vui lòng nhập Họ và tên đầy đủ theo CCCD.";
    if (!cccdNumber.trim()) return "Vui lòng nhập Số CCCD/Hộ chiếu.";
    if (!cccdFrontPreview) return "Vui lòng tải lên Ảnh chụp mặt trước CCCD/Hộ chiếu.";
    if (!cccdBackPreview) return "Vui lòng tải lên Ảnh chụp mặt sau CCCD/Hộ chiếu.";
    if (!phone.trim()) return "Vui lòng nhập Số điện thoại dùng Zalo.";
    if (!email.trim()) return "Vui lòng nhập Email cá nhân.";
    if (!bankName) return "Vui lòng chọn Ngân hàng nhận thanh toán.";
    if (bankName === 'Ngân hàng khác (Tự nhập)' && !customBankName.trim()) return "Vui lòng nhập tên ngân hàng của bạn.";
    if (!bankAccountNumber.trim()) return "Vui lòng nhập Số tài khoản ngân hàng.";
    if (!bankAccountHolder.trim()) return "Vui lòng nhập Tên chủ tài khoản (phải trùng khớp họ tên CCCD).";
    return null;
  };

  const validatePartII = () => {
    if (!displayName.trim()) return "Vui lòng nhập Tên hiển thị trên website.";
    if (!headline.trim()) return "Vui lòng nhập Dòng giới thiệu ngắn (Headline / Slogan).";
    if (!avatarPreview) return "Vui lòng tải lên Ảnh đại diện (Avatar).";
    if (!educationLevel) return "Vui lòng chọn Trình độ học vấn.";
    if (!major.trim()) return "Vui lòng nhập Chuyên ngành học.";
    if (selectedSubjects.length === 0 && !customSubject.trim()) return "Vui lòng chọn hoặc nhập ít nhất 1 Môn học tiếp nhận.";
    if (!targetAudience.trim()) return "Vui lòng điền Cấp học & Đối tượng nhận dạy (mục 9).";
    if (!hourlyRate.trim()) return "Vui lòng điền Bảng giá dịch vụ học phí (mục 12).";
    if (scheduleSlots.length === 0) return "Vui lòng chọn ít nhất 1 ca rảnh trong tuần (mục 13).";
    if (!commitAccurate || !commitConduct || !commitTerms) return "Vui lòng tích chọn đầy đủ 3 cam kết tiêu chuẩn cộng đồng.";
    return null;
  };

  const handleNextStep = () => {
    const error = validatePartI();
    if (error) {
      alert(error);
      return;
    }
    // Tự động gán displayName = fullName nếu chưa nhập
    if (!displayName.trim()) setDisplayName(fullName);
    if (!bankAccountHolder.trim()) setBankAccountHolder(fullName.toUpperCase());
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const error = validatePartII();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);
    const tutorId = `tutor-${Date.now()}`;
    const allSubjects = [...selectedSubjects];
    if (customSubject.trim() && !allSubjects.includes(customSubject.trim())) {
      allSubjects.push(customSubject.trim());
    }

    const finalUniversityName = university === 'Trường khác (Tự nhập)' ? (customUniversity.trim() || 'Trường Đại học') : university;
    const finalBankName = bankName === 'Ngân hàng khác (Tự nhập)' ? customBankName.trim() : bankName;

    const certList: string[] = [];
    if (subjectCertificates.trim()) certList.push(subjectCertificates.trim());
    if (pedagogicalCertificates.trim()) certList.push(pedagogicalCertificates.trim());

    const newTutorProfile: TutorType = {
      id: tutorId,
      name: fullName,
      displayName: displayName || fullName,
      rolePrefix: educationLevel === 'Thạc sĩ' ? 'ThS' : 'Giáo viên',
      headline: headline,
      badgeSubject: allSubjects[0] || 'Giáo viên',
      avatar: avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
      coverImage: coverPreview || otherImages[0] || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200",
      otherImages: otherImages.length > 0 ? otherImages : [coverPreview || avatarPreview],
      title: `${educationLevel} ${major} - ${headline}`,
      shortBio: `${educationLevel} ${major} (${finalUniversityName})`,
      rating: 5.0,
      reviews: 0,
      subjects: allSubjects,
      targetAudience: targetAudience,
      location: teachingFormatsOffline || 'Hà Nội & Toàn quốc (Online)',
      hourlyRate: hourlyRate,
      priceUnit: priceUnit,
      levelPrices: levelPrices,
      isOnline: isOnlineSupport,
      teachingFormatsOnline: isOnlineSupport ? teachingFormatsOnline : 'Không dạy online',
      teachingFormatsOffline: isOfflineSupport ? (teachingFormatsOffline || 'Khu vực nội thành') : 'Chỉ dạy online',
      type: educationLevel.includes('Tiến sĩ') || educationLevel.includes('Thạc sĩ') ? 'Giáo viên' : 'Gia sư',
      providerType: '1-1',
      targetTags: allSubjects.slice(0, 3),
      successStory: teachingAchievement,
      phone: phone,
      zalo: phone,
      birthYear: '1995',
      experience: experience || '3 năm',
      education: `${educationLevel} ${major} - ${finalUniversityName}`,
      educationLevel: educationLevel,
      major: major,
      certificates: certList.length > 0 ? certList : ['Đã xác thực văn bằng gốc'],
      pedagogicalCertificates: pedagogicalCertificates ? [pedagogicalCertificates] : [],
      personality: personalityTraits,
      teachingMethod: teachingAchievement || 'Phương pháp giảng dạy cá nhân hóa, bám sát năng lực học sinh.',
      philosophy: headline || 'Tận tâm đồng hành vì sự tiến bộ của từng học trò.',
      teachingAchievement: teachingAchievement,
      achievementProofUrl: achievementPreview || certificateProofPreview,
      trainingMaterials: trainingMaterials || 'Giáo trình biên soạn độc quyền và tài liệu ôn thi cập nhật.',
      videoDemo: videoDemo || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      responseTime: responseTime,
      schedule: scheduleSlots,
      trialStats: {
        totalTrials: 0,
        officialEnrolled: 0
      },
      kycStatus: 'pending',
      cccdNumber: cccdNumber,
      cccdFront: cccdFrontPreview,
      cccdBack: cccdBackPreview,
      credentialFile: credentialPreview,
      bankName: finalBankName,
      bankAccountNumber: bankAccountNumber,
      bankAccountHolder: bankAccountHolder
    };

    addMockTutor(newTutorProfile);
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600 animate-bounce" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Gửi hồ sơ thành công!</h1>
        <p className="text-slate-600 mb-8 text-sm leading-relaxed">
          Hồ sơ của bạn đã được gửi đến ban kiểm duyệt HanTutor. Chúng tôi sẽ đối soát danh tính KYC và kích hoạt huy hiệu xác thực trong thời gian sớm nhất.
        </p>
        <Link 
          to="/tim-gia-su" 
          className="inline-block bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm"
        >
          Xem danh sách giáo viên
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
        
        {/* Header Form */}
        <div className="text-center mb-8 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Đăng ký Hồ sơ Giáo viên / Giảng viên</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-xl mx-auto">
            Quy trình đăng ký chuẩn gồm 2 phần: Thẩm định danh tính bảo mật & Thông tin giảng dạy công khai.
          </p>

          {/* Stepper Progress Tabs */}
          <div className="grid grid-cols-2 gap-3 mt-6 max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                step === 1 
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'}`}>I</span>
                <span className="text-xs font-bold uppercase tracking-wider">Phần I: Thẩm định KYC</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Bảo mật, không hiển thị trên web</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const err = validatePartI();
                if (err) {
                  alert(err);
                  return;
                }
                setStep(2);
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                step === 2 
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'}`}>II</span>
                <span className="text-xs font-bold uppercase tracking-wider">Phần II: TT Giảng dạy</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Hiển thị trên web cho học sinh</span>
            </button>
          </div>
        </div>

        {/* ================= BƯỚC 1: PHẦN I - THẨM ĐỊNH DANH TÍNH & BẢO MẬT HỒ SƠ ================= */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Security Notice Banner */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Quy định bảo mật hồ sơ (Phần I):</strong> Toàn bộ thông tin định danh CCCD và Tài khoản ngân hàng ở Phần I được bảo mật nghiêm ngặt theo chuẩn KYC, chỉ dùng cho mục đích kiểm duyệt văn bằng và chuyển trả 70% học phí, tuyệt đối KHÔNG hiển thị công khai trên website.
              </div>
            </div>

            {/* 1. Định danh cá nhân (KYC) */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h3 className="text-base font-bold text-slate-900">Định danh cá nhân (KYC)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên đầy đủ *</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="VD: NGUYỄN VĂN AN"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Nhập đúng như trên thẻ Căn cước công dân</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số CCCD / Hộ chiếu *</label>
                  <input 
                    type="text" 
                    value={cccdNumber}
                    onChange={e => setCccdNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="VD: 001200012345"
                    maxLength={12}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Số thẻ 12 chữ số hợp lệ</span>
                </div>

                {/* Ảnh chụp 2 mặt CCCD */}
                <div className="sm:col-span-2 space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Ảnh chụp 2 mặt CCCD / Hộ chiếu *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mặt trước */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-600 block">Mặt trước CCCD *</span>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[140px] flex flex-col justify-center items-center bg-white/70">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => handleFileChange(e, 'cccdFront')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                        {cccdFrontPreview ? (
                          <img src={cccdFrontPreview} alt="CCCD Front" className="max-h-[120px] rounded-lg object-contain" />
                        ) : (
                          <>
                            <UploadCloud className="w-7 h-7 text-blue-500 mb-1" />
                            <span className="font-bold text-slate-700 text-xs block">Tải ảnh mặt trước</span>
                            <span className="text-[10px] text-slate-400">JPG, PNG rõ nét không bị lóa</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mặt sau */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-600 block">Mặt sau CCCD *</span>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[140px] flex flex-col justify-center items-center bg-white/70">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => handleFileChange(e, 'cccdBack')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                        {cccdBackPreview ? (
                          <img src={cccdBackPreview} alt="CCCD Back" className="max-h-[120px] rounded-lg object-contain" />
                        ) : (
                          <>
                            <UploadCloud className="w-7 h-7 text-blue-500 mb-1" />
                            <span className="font-bold text-slate-700 text-xs block">Tải ảnh mặt sau</span>
                            <span className="text-[10px] text-slate-400">JPG, PNG rõ nét không bị lóa</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Thông tin liên hệ & Kênh thanh toán */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h3 className="text-base font-bold text-slate-900">Thông tin liên hệ & Kênh thanh toán</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại dùng Zalo *</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Dùng để tạo mã QR Zalo kết nối học sinh học thử</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email cá nhân *</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="VD: email@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Nhận thông báo lịch dạy & báo cáo thanh toán</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu đăng nhập tài khoản</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (nếu để trống mặc định là 123456)"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-800" 
                  />
                </div>

                {/* Tài khoản ngân hàng */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <div className="mb-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tài khoản ngân hàng nhận thanh toán (70% học phí) *</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tên chủ tài khoản bắt buộc phải trùng khớp với Họ tên trên CCCD.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tên ngân hàng *</label>
                      <select
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none"
                      >
                        <option value="">-- Chọn ngân hàng --</option>
                        {banksList.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Số tài khoản *</label>
                      <input 
                        type="text" 
                        value={bankAccountNumber}
                        onChange={e => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="VD: 0123456789"
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tên chủ tài khoản *</label>
                      <input 
                        type="text" 
                        value={bankAccountHolder}
                        onChange={e => setBankAccountHolder(e.target.value.toUpperCase())}
                        placeholder="VD: NGUYEN VAN AN"
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold uppercase outline-none" 
                      />
                    </div>

                    {bankName === 'Ngân hàng khác (Tự nhập)' && (
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nhập tên ngân hàng của bạn *</label>
                        <input 
                          type="text" 
                          value={customBankName}
                          onChange={e => setCustomBankName(e.target.value)}
                          placeholder="VD: Ngân hàng số Cake by VPBank"
                          className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs outline-none" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4 flex justify-end">
              <button 
                type="button"
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer"
              >
                Tiếp tục sang Phần II (Thông tin giảng dạy) →
              </button>
            </div>
          </div>
        )}

        {/* ================= BƯỚC 2: PHẦN II - THÔNG TIN GIẢNG DẠY ================= */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* 1. Tên hiển thị & 2. Headline */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1-2</span>
                <h3 className="text-base font-bold text-slate-900">Tên hiển thị & Giới thiệu ngắn</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Tên hiển thị trên web *</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="VD: Cô Sương Mai, Thầy Trần Văn Tài, HLV Minh Tuấn..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold text-slate-800" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Tên này sẽ hiển thị trực tiếp cho học sinh nhìn thấy</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Dòng giới thiệu ngắn (Headline / Slogan) *</label>
                  <input 
                    type="text" 
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="VD: Ươm mầm tình yêu văn học - Bứt phá điểm 9+ kỳ thi THPT"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-blue-700" 
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Khẩu hiệu truyền cảm hứng hoặc thế mạnh giảng dạy</span>
                </div>
              </div>
            </div>

            {/* 3. Ảnh đại diện (Avatar) & 4. Ảnh cá nhân khác */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3-4</span>
                <h3 className="text-base font-bold text-slate-900">Ảnh đại diện (Avatar) & Ảnh bìa / Cá nhân khác</h3>
              </div>

              {/* 3. Avatar Upload with Sample Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">3. Ảnh đại diện (Avatar) * (Chân dung bản thân, trang phục lịch sự, phông nền sáng)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs">
                        <UploadCloud className="w-4 h-4" />
                        <span>Tải ảnh đại diện</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e => handleFileChange(e, 'avatar')}
                          className="hidden" 
                        />
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">Ảnh nét, phông sáng, tối đa 5MB</p>
                    </div>
                  </div>

                  {/* Sample avatar preview */}
                  <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <button
                      type="button"
                      onClick={() => setShowSampleModal(true)}
                      className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg overflow-hidden border border-amber-300 shrink-0 bg-white cursor-pointer hover:scale-105 transition-transform"
                      title="Bấm để phóng to xem ảnh mẫu"
                    >
                      <img src="/sample-avatar-4x6.png" alt="Ảnh mẫu" className="w-full h-full object-cover" />
                    </button>
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded uppercase block w-fit mb-0.5">Ảnh mẫu chuẩn</span>
                      <p className="text-[11px] text-slate-600">Chụp chính diện lịch sự, phông sáng.</p>
                      <button
                        type="button"
                        onClick={() => setShowSampleModal(true)}
                        className="text-[11px] text-amber-800 font-bold hover:underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem phóng to ảnh mẫu
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Ảnh cá nhân khác (Tối đa 3 ảnh - optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">4. Ảnh cá nhân khác (Tối đa 3 ảnh - Ảnh 1 làm ảnh bìa Facebook, ảnh 2-3 hoạt động dạy học)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Slot 1: Cover Photo */}
                  <div className="border border-slate-200 rounded-2xl p-3 bg-white text-center">
                    <span className="text-[10px] font-bold text-blue-700 block mb-1.5">Ảnh 1 (Ảnh bìa FB Cover)</span>
                    <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Chưa có ảnh</span>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs">
                        Thay ảnh
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cover')} className="hidden" />
                      </label>
                    </div>
                    <label className="cursor-pointer text-[11px] text-blue-600 font-bold hover:underline mt-2 inline-block">
                      + Chọn ảnh bìa
                      <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cover')} className="hidden" />
                    </label>
                  </div>

                  {/* Slot 2: Other photo 2 */}
                  <div className="border border-slate-200 rounded-2xl p-3 bg-white text-center">
                    <span className="text-[10px] font-bold text-slate-700 block mb-1.5">Ảnh 2 (Hoạt động thực tế)</span>
                    <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                      {otherImages[1] ? (
                        <img src={otherImages[1]} alt="Other 2" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Tùy chọn</span>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs">
                        Thay ảnh
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'other')} className="hidden" />
                      </label>
                    </div>
                    <label className="cursor-pointer text-[11px] text-slate-600 font-bold hover:underline mt-2 inline-block">
                      + Tải ảnh 2
                      <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'other')} className="hidden" />
                    </label>
                  </div>

                  {/* Slot 3: Other photo 3 */}
                  <div className="border border-slate-200 rounded-2xl p-3 bg-white text-center">
                    <span className="text-[10px] font-bold text-slate-700 block mb-1.5">Ảnh 3 (Hoạt động thực tế)</span>
                    <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                      {otherImages[2] ? (
                        <img src={otherImages[2]} alt="Other 3" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Tùy chọn</span>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs">
                        Thay ảnh
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'other')} className="hidden" />
                      </label>
                    </div>
                    <label className="cursor-pointer text-[11px] text-slate-600 font-bold hover:underline mt-2 inline-block">
                      + Tải ảnh 3
                      <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'other')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Trình độ học vấn & 6. Môn học tiếp nhận */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">5-6</span>
                <h3 className="text-base font-bold text-slate-900">Trình độ học vấn & Môn học tiếp nhận</h3>
              </div>

              {/* 5. Trình độ học vấn */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">5. Trình độ học vấn *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">Trình độ *</span>
                    <select
                      value={educationLevel}
                      onChange={e => setEducationLevel(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold outline-none"
                    >
                      <option value="Đại học">Đại học (Cử nhân)</option>
                      <option value="Cao đẳng">Cao đẳng</option>
                      <option value="Thạc sĩ">Thạc sĩ</option>
                      <option value="NCS Tiến sĩ">NCS Tiến sĩ</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">Chuyên ngành học *</span>
                    <input 
                      type="text" 
                      value={major}
                      onChange={e => setMajor(e.target.value)}
                      placeholder="VD: Sư phạm Ngữ văn, Toán học..."
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none" 
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">Trường ĐH / Cao đẳng *</span>
                    <input 
                      type="text" 
                      value={university}
                      onChange={e => setUniversity(e.target.value)}
                      placeholder="VD: ĐH Sư Phạm Hà Nội"
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none" 
                    />
                  </div>
                </div>

                {/* Tải lên tệp kiểm duyệt (Bằng tốt nghiệp / Thẻ sinh viên) */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">Tải lên tệp kiểm duyệt (Bản scan/ảnh chụp Bằng tốt nghiệp, Bảng điểm hoặc Thẻ sinh viên)</span>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[100px] flex flex-col justify-center items-center bg-white/70">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={e => handleFileChange(e, 'credential')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    {credentialPreview ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Đã tải lên văn bằng kiểm duyệt thành công
                      </span>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-blue-500 mb-1" />
                        <span className="font-bold text-slate-700 text-xs block">Tải lên tệp kiểm duyệt văn bằng</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG hoặc PDF (Tối đa 8MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. Môn học tiếp nhận (Tạo ô chọn) */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">6. Môn học tiếp nhận * (Chọn các môn bạn nhận dạy kèm)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-white p-4 rounded-2xl border border-slate-200">
                  {popularSubjects.map(sub => {
                    const isSelected = selectedSubjects.includes(sub);
                    return (
                      <label 
                        key={sub} 
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSubject(sub)}
                          className="rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })}
                </div>
                <input 
                  type="text" 
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="Nhập môn học khác nếu chưa có trong danh sách trên..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs outline-none" 
                />
              </div>
            </div>

            {/* 7. Chứng chỉ chuyên môn & Nghiệp vụ sư phạm */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">7</span>
                <h3 className="text-base font-bold text-slate-900">Chứng chỉ chuyên môn & Nghiệp vụ sư phạm</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chứng chỉ chuyên môn môn học</label>
                  <input 
                    type="text" 
                    value={subjectCertificates}
                    onChange={e => setSubjectCertificates(e.target.value)}
                    placeholder="VD: IELTS 8.0, HSK 6, Giải Nhất HSG Quốc Gia..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chứng chỉ sư phạm / Nghiệp vụ giảng dạy (Optional)</label>
                  <input 
                    type="text" 
                    value={pedagogicalCertificates}
                    onChange={e => setPedagogicalCertificates(e.target.value)}
                    placeholder="VD: Bồi dưỡng Nghiệp vụ Sư phạm, TESOL, CELTA..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none" 
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tải lên tệp kiểm duyệt (Bản scan chứng chỉ gốc)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[90px] flex flex-col justify-center items-center bg-white/70">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={e => handleFileChange(e, 'certProof')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    {certificateProofPreview ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Đã tải lên bản scan chứng chỉ gốc
                      </span>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-blue-500 mb-1" />
                        <span className="font-bold text-slate-700 text-xs block">Tải lên bản scan chứng chỉ gốc</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG hoặc PDF</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Thành tích, phương pháp giảng dạy */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">8</span>
                <h3 className="text-base font-bold text-slate-900">Thành tích & Phương pháp giảng dạy</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số năm kinh nghiệm giảng dạy *</label>
                    <input 
                      type="text" 
                      value={experience}
                      onChange={e => setExperience(e.target.value)}
                      placeholder="VD: 5 năm, 8 năm..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Đặc điểm, phong cách dạy học (Chọn tags)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedPersonalities.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePersonality(p)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            personalityTraits.includes(p) ? 'bg-blue-600 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thành tích cá nhân & Background (Có thể viết dài ~200 từ để thể hiện năng lực) *
                  </label>
                  <textarea 
                    rows={4}
                    value={teachingAchievement}
                    onChange={e => setTeachingAchievement(e.target.value)}
                    placeholder="Mô tả chi tiết background bản thân, kinh nghiệm dẫn dắt học sinh, phong cách sư phạm, số học sinh đạt điểm cao, phương pháp giảng dạy khác biệt..."
                    className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tài liệu minh chứng thành tích (Upload tệp)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[90px] flex flex-col justify-center items-center bg-white/70">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={e => handleFileChange(e, 'achievement')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    {achievementPreview ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Đã tải lên tài liệu minh chứng thành tích
                      </span>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-blue-500 mb-1" />
                        <span className="font-bold text-slate-700 text-xs block">Tải lên tệp minh chứng thành tích</span>
                        <span className="text-[10px] text-slate-400">Ảnh giấy khen, giải thưởng, bảng điểm hoặc chứng nhận</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 9. Cấp học & Đối tượng nhận dạy (Giáo viên tự điền) */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">9</span>
                <h3 className="text-base font-bold text-slate-900">Cấp học & Đối tượng nhận dạy</h3>
              </div>
              <label className="block text-xs font-bold text-slate-700">
                Cấp học & Đối tượng nhận dạy * (Giáo viên tự do điền nội dung, không bị giới hạn)
              </label>
              <textarea 
                rows={3}
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="VD: Học sinh mất gốc môn Toán lớp 9 cần lấy lại căn bản cấp tốc; Học sinh lớp 12 luyện thi THPT Quốc Gia mục tiêu 8.5+; Học viên ôn thi Chuyên..."
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-blue-100 font-medium"
              />
            </div>

            {/* 10. Hình thức giảng dạy */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">10</span>
                <h3 className="text-base font-bold text-slate-900">Hình thức giảng dạy</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isOnlineSupport}
                      onChange={e => setIsOnlineSupport(e.target.checked)}
                      className="rounded text-blue-600" 
                    />
                    <span>Trực tuyến (Online)</span>
                  </label>
                  {isOnlineSupport && (
                    <input 
                      type="text" 
                      value={teachingFormatsOnline}
                      onChange={e => setTeachingFormatsOnline(e.target.value)}
                      placeholder="Nền tảng sử dụng (Zoom, Google Meet, MS Teams...)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none" 
                    />
                  )}
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isOfflineSupport}
                      onChange={e => setIsOfflineSupport(e.target.checked)}
                      className="rounded text-blue-600" 
                    />
                    <span>Trực tiếp (Offline)</span>
                  </label>
                  {isOfflineSupport && (
                    <input 
                      type="text" 
                      value={teachingFormatsOffline}
                      onChange={e => setTeachingFormatsOffline(e.target.value)}
                      placeholder="Danh sách quận/huyện, khu vực có thể di chuyển..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none" 
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 11. Tài liệu đào tạo (Optional) */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">11</span>
                <h3 className="text-base font-bold text-slate-900">Tài liệu đào tạo (Optional)</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học liệu cung cấp cho học viên</label>
                  <textarea 
                    rows={2}
                    value={trainingMaterials}
                    onChange={e => setTrainingMaterials(e.target.value)}
                    placeholder="Mô tả giáo trình, đề thi thử, sổ tay công thức độc quyền..."
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn Video bài giảng mẫu (YouTube link)</label>
                  <input 
                    type="text" 
                    value={videoDemo}
                    onChange={e => setVideoDemo(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* 12. Bảng giá dịch vụ */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">12</span>
                  <h3 className="text-base font-bold text-slate-900">Bảng giá dịch vụ</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">Đơn vị: VNĐ / {priceUnit}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học phí theo giờ (Mức cố định hoặc khoảng dao động) *</label>
                  <input 
                    type="text" 
                    value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                    placeholder="VD: 200.000 hoặc 180.000 - 300.000"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-blue-700 outline-none" 
                  />
                </div>

                {/* Bảng giá theo cấp lớp */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-700 block mb-2">Chi tiết mức học phí theo cấp học:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(levelPrices).map(([lvl, prc]) => (
                      <div key={lvl} className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-600 block mb-1">{lvl}</span>
                        <div className="flex items-center gap-1">
                          <input 
                            type="text" 
                            value={prc}
                            onChange={e => setLevelPrices({ ...levelPrices, [lvl]: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-blue-700 outline-none" 
                          />
                          <span className="text-[10px] text-slate-400">đ/giờ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 13. Lịch học & Cam kết vận hành */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">13</span>
                <h3 className="text-base font-bold text-slate-900">Lịch học & Cam kết vận hành</h3>
              </div>

              {/* Ma trận ca rảnh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Khung giờ có thể nhận lớp (Tích chọn các ca rảnh trong tuần) *</label>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse text-xs text-center">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <th className="p-2.5 text-left pl-3.5">Ca dạy</th>
                          {days.map(d => <th key={d} className="p-2.5">{d}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {shifts.map(shift => (
                          <tr key={shift} className="border-b border-slate-100 last:border-0">
                            <td className="p-2.5 font-bold text-slate-700 text-left pl-3.5 bg-slate-50/60">{shift}</td>
                            {days.map(day => {
                              const slot = `${day}_${shift}`;
                              const isSelected = scheduleSlots.includes(slot);
                              return (
                                <td key={day} className="p-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleScheduleSlot(day, shift)}
                                    className={`w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                      isSelected ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-150'
                                    }`}
                                  >
                                    {isSelected ? '✓ Rảnh' : '+'}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Thời gian phản hồi cam kết */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Thời gian phản hồi cam kết *</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Dưới 30 phút', 'Dưới 1 giờ', 'Dưới 3 giờ'] as const).map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setResponseTime(time)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        responseTime === time ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Cam kết tiêu chuẩn cộng đồng */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                  Cam kết tiêu chuẩn cộng đồng (Tích chọn cả 3 mục để hoàn tất) *
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-blue-50/30">
                  <input 
                    type="checkbox" 
                    checked={commitAccurate}
                    onChange={e => setCommitAccurate(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0" 
                  />
                  <span>1. Cam kết thông tin bằng cấp, chứng chỉ đã tải lên là chính xác 100%.</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-blue-50/30">
                  <input 
                    type="checkbox" 
                    checked={commitConduct}
                    onChange={e => setCommitConduct(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0" 
                  />
                  <span>2. Cam kết tuân thủ quy tắc ứng xử sư phạm và thời gian nhận lớp sau khi kết nối.</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-blue-50/30">
                  <input 
                    type="checkbox" 
                    checked={commitTerms}
                    onChange={e => setCommitTerms(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0" 
                  />
                  <span>3. Đã đọc và đồng ý với các điều khoản của hợp đồng hợp tác đào tạo.</span>
                </label>
              </div>
            </div>

            {/* Form Controls: Back & Submit */}
            <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ← Quay lại Phần I
              </button>

              <button 
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi hồ sơ...
                  </>
                ) : 'Hoàn tất đăng ký & Gửi duyệt hồ sơ'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Phóng to Xem Kĩ Ảnh Mẫu Chuẩn */}
      {showSampleModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowSampleModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col items-center text-center"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowSampleModal(false)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full mb-3">
              ★ Ảnh mẫu chân dung chuẩn
            </div>

            <div className="w-52 sm:w-60 h-72 sm:h-80 rounded-2xl overflow-hidden shadow-md border-4 border-slate-100 bg-white mb-3 flex items-center justify-center">
              <img 
                src="/sample-avatar-4x6.png" 
                alt="Ảnh mẫu chân dung chuẩn" 
                className="w-full h-full object-cover object-top"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Chụp thẳng mặt rõ nét, phông nền sáng như ảnh mẫu.
            </p>

            <button
              type="button"
              onClick={() => setShowSampleModal(false)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 7. Footer
function Footer() {
  return (
    <footer className="bg-[#0d1424] text-slate-400 py-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <img 
            src="/logo-icon.png" 
            alt="HanTutor Icon" 
            className="w-9 h-9 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105" 
          />
          <span className="font-extrabold text-2xl tracking-tight text-white flex items-center leading-none">
            Han<span className="text-[#FF9000]">tutor</span>
          </span>
        </Link>

        <div className="text-xs text-slate-400">
          © 2026 HanTutor. Nền tảng kết nối gia sư thông minh.
        </div>
      </div>
    </footer>
  );
}

// 8. AppLayout & Root App
function AppLayout({
  authModalState,
  setAuthModalState,
  contactZaloModalTutor,
  setContactZaloModalTutor,
  enrollmentModalTutor,
  setEnrollmentModalTutor,
  recordOfficialEnrollment,
  openCheckoutModal,
  checkoutModalState,
  setCheckoutModalState,
  isMyTrialsOpen,
  setIsMyTrialsOpen,
  reviewModalState,
  setReviewModalState
}: any) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative">
      {!isAdmin && <Navbar />}
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tim-gia-su" element={<FindTutorsPage />} />
          <Route path="/tim-lop-moi" element={<FindTutorsPage />} />
          <Route path="/giao-vien/:id" element={<TeacherDetailPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/dang-ky-gia-su" element={<TutorRegistrationPage />} />
          <Route path="/tim-lop" element={<FindTutorsPage />} />
        </Routes>
      </main>

      {!isAdmin && <Footer />}

      {/* Global Modals */}
      {authModalState.isOpen && (
        <AuthModal 
          isOpen={authModalState.isOpen} 
          initialView={authModalState.view} 
          defaultRole={authModalState.defaultRole}
          onClose={() => setAuthModalState({ ...authModalState, isOpen: false })} 
        />
      )}

      {contactZaloModalTutor && (
        <ContactZaloModal 
          tutor={contactZaloModalTutor}
          isOpen={!!contactZaloModalTutor}
          onClose={() => setContactZaloModalTutor(null)}
          onOfficialEnroll={() => {
            const t = contactZaloModalTutor;
            setContactZaloModalTutor(null);
            setEnrollmentModalTutor(t);
          }}
        />
      )}

      {enrollmentModalTutor && (
        <EnrollmentModal 
          tutor={enrollmentModalTutor}
          isOpen={true}
          onClose={() => setEnrollmentModalTutor(null)}
          onProceedToPayment={(enrollmentId, amount, tutorId) => {
            recordOfficialEnrollment(tutorId);
            openCheckoutModal(enrollmentId, amount, tutorId);
          }}
        />
      )}

      {checkoutModalState.isOpen && (
        <CheckoutModal 
          enrollmentId={checkoutModalState.enrollmentId}
          amount={checkoutModalState.amount}
          tutorId={checkoutModalState.tutorId}
          isOpen={checkoutModalState.isOpen}
          onClose={() => setCheckoutModalState({ ...checkoutModalState, isOpen: false })}
        />
      )}

      {isMyTrialsOpen && (
        <MyTrialsModal 
          isOpen={isMyTrialsOpen}
          onClose={() => setIsMyTrialsOpen(false)}
          onOpenEnrollment={(tutor) => setEnrollmentModalTutor(tutor)}
        />
      )}

      {/* Modal Nhận xét & Đánh giá giáo viên */}
      {reviewModalState.isOpen && reviewModalState.tutor && (
        <ReviewTutorModal
          tutor={reviewModalState.tutor}
          isOpen={reviewModalState.isOpen}
          defaultStage={reviewModalState.defaultStage}
          onClose={() => setReviewModalState({ ...reviewModalState, isOpen: false })}
        />
      )}

      {/* Floating Action Buttons: AI Chat & Facebook Messenger */}
      {!isAdmin && <FloatingContactDock />}
    </div>
  );
}

export default function App() {
  const [tutors, setTutors] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hantutor_tutors_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mergedMock = mockTutors.map(mt => {
            const found = parsed.find((p: any) => String(p.id) === String(mt.id));
            return found ? { ...mt, ...found } : mt;
          });
          const customTutors = parsed.filter((p: any) => !mockTutors.some(mt => String(mt.id) === String(p.id)));
          return [...mergedMock, ...customTutors];
        }
      }
    } catch (e) {}
    return mockTutors;
  });
  const [pendingTutors, setPendingTutors] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hantutor_pending_tutors');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return mockPendingTutors;
  });
  const [adminStats, setAdminStats] = useState(mockAdminStats);
  const [myTrials, setMyTrials] = useState<StudentTrialItem[]>(() => getStoredTrials());
  const [reviews, setReviews] = useState<TutorReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem('hantutor_tutor_reviews');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultTutorReviews;
  });

  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; view: 'login' | 'register'; defaultRole: 'student' | 'teacher' }>({
    isOpen: false,
    view: 'login',
    defaultRole: 'student'
  });
  const [contactZaloModalTutor, setContactZaloModalTutor] = useState<any>(null);
  const [enrollmentModalTutor, setEnrollmentModalTutor] = useState<any>(null);
  const [checkoutModalState, setCheckoutModalState] = useState<{ isOpen: boolean; enrollmentId: string; amount: number; tutorId: string | number }>({
    isOpen: false,
    enrollmentId: '',
    amount: 0,
    tutorId: ''
  });
  const [isMyTrialsOpen, setIsMyTrialsOpen] = useState(false);
  const [reviewModalState, setReviewModalState] = useState<{ isOpen: boolean; tutor: any; defaultStage: 'trial' | 'official' }>({
    isOpen: false,
    tutor: null,
    defaultStage: 'trial'
  });

  const addTutorReview = (newReviewData: Omit<TutorReviewItem, 'id' | 'date'>) => {
    const newReview: TutorReviewItem = {
      ...newReviewData,
      id: `rev_${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN')
    };

    setReviews(prev => {
      const updated = [newReview, ...prev];
      try {
        localStorage.setItem('hantutor_tutor_reviews', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setTutors(prev => prev.map(t => {
      if (String(t.id) === String(newReview.tutorId)) {
        const currentReviews = (t.reviews || 0) + 1;
        return {
          ...t,
          reviews: currentReviews,
          rating: 5.0
        };
      }
      return t;
    }));
  };

  const addMockTutor = (newTutor: any) => {
    setPendingTutors(prev => {
      const updated = [newTutor, ...prev];
      try {
        localStorage.setItem('hantutor_pending_tutors', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setAdminStats(prev => ({
      ...prev,
      pendingKyc: prev.pendingKyc + 1,
      recentActivities: [
        {
          id: `act_${Date.now()}`,
          tutor: newTutor.name,
          student: '',
          type: 'kyc_submit',
          time: 'Vừa xong',
          status: 'Chờ duyệt KYC'
        },
        ...prev.recentActivities
      ]
    }));
  };

  const recordTrialContact = (tutor: any, studentInfo?: { name?: string, phone?: string }) => {
    // 1. Tăng lượt học thử cho giáo viên
    setTutors(prev => prev.map(t => {
      if (String(t.id) === String(tutor.id)) {
        const stats = t.trialStats || { totalTrials: 24, officialEnrolled: 22 };
        return {
          ...t,
          trialStats: {
            ...stats,
            totalTrials: stats.totalTrials + 1
          }
        };
      }
      return t;
    }));

    // 2. Thêm vào danh sách học thử của học sinh (nếu chưa có)
    setMyTrials(prev => {
      const existing = prev.find(item => String(item.tutorId) === String(tutor.id));
      let updated: StudentTrialItem[];
      if (existing) {
        updated = prev.map(item => String(item.tutorId) === String(tutor.id) ? { ...item, status: 'trial_in_progress' } : item);
      } else {
        const newItem: StudentTrialItem = {
          tutorId: tutor.id,
          tutorName: tutor.name,
          avatar: tutor.avatar,
          badgeSubject: tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học',
          headline: tutor.headline,
          rolePrefix: tutor.rolePrefix,
          displayName: tutor.displayName,
          phone: tutor.phone,
          zalo: tutor.zalo,
          hourlyRate: tutor.hourlyRate,
          date: new Date().toLocaleDateString('vi-VN'),
          status: 'trial_in_progress'
        };
        updated = [newItem, ...prev];
      }
      saveStoredTrials(updated);
      return updated;
    });

    // 3. Ghi nhận hoạt động admin
    setAdminStats(prev => ({
      ...prev,
      totalTrialContacts: prev.totalTrialContacts + 1,
      recentActivities: [
        {
          id: `act_${Date.now()}`,
          tutor: tutor.name || 'Giáo viên',
          student: studentInfo?.name || 'Học sinh liên hệ Zalo',
          type: 'trial_contact',
          time: 'Vừa xong',
          status: 'Đang học thử 1-1'
        },
        ...prev.recentActivities
      ]
    }));
  };

  const recordOfficialEnrollment = (tutorId: any) => {
    // 1. Tăng số lượt nhận lớp chính thức thành công
    setTutors(prev => prev.map(t => {
      if (String(t.id) === String(tutorId)) {
        const stats = t.trialStats || { totalTrials: 24, officialEnrolled: 22 };
        return {
          ...t,
          trialStats: {
            ...stats,
            officialEnrolled: stats.officialEnrolled + 1
          }
        };
      }
      return t;
    }));

    // 2. Cập nhật trạng thái trong MyTrials sang 'enrolled'
    setMyTrials(prev => {
      const updated = prev.map(item => 
        String(item.tutorId) === String(tutorId) 
          ? { ...item, status: 'enrolled' as const } 
          : item
      );
      saveStoredTrials(updated);
      return updated;
    });

    // 3. Ghi nhận giao dịch admin
    setAdminStats(prev => ({
      ...prev,
      totalOfficialEnrolled: prev.totalOfficialEnrolled + 1,
      recentActivities: [
        {
          id: `act_${Date.now()}`,
          tutor: tutors.find(t => String(t.id) === String(tutorId))?.name || 'Giáo viên',
          student: 'Học sinh chính thức',
          type: 'official_enrolled',
          time: 'Vừa xong',
          status: 'Đăng ký chính thức (30%/70%)'
        },
        ...prev.recentActivities
      ]
    }));
  };

  const cancelTrialEnrollment = (tutorId: any) => {
    setMyTrials(prev => {
      const updated = prev.filter(item => String(item.tutorId) !== String(tutorId));
      saveStoredTrials(updated);
      return updated;
    });
    alert("Đã xóa khỏi danh sách học thử. Bạn đã chọn không tiếp tục đăng ký học, tỷ lệ nhận lớp của giáo viên đã được hệ thống cập nhật giảm khách quan!");
  };

  const approveTutorKyc = (tutorId: any) => {
    const tutorToApprove = pendingTutors.find(t => String(t.id) === String(tutorId));
    if (tutorToApprove) {
      const approved: any = {
        ...tutorToApprove,
        kycStatus: 'approved',
        status: 'active',
        isPromoted: true,
        rating: tutorToApprove.rating || 5.0,
        reviews: tutorToApprove.reviews || 0,
        trialStats: tutorToApprove.trialStats || { totalTrials: 10, officialEnrolled: 10 },
        personality: tutorToApprove.personality || ['Tận tâm', 'Trách nhiệm', 'Nhiệt tình'],
        certificates: tutorToApprove.certificates || ['Đã xác thực CCCD & Bằng cấp']
      };
      
      const newPending = pendingTutors.filter(t => String(t.id) !== String(tutorId));
      setPendingTutors(newPending);
      try {
        localStorage.setItem('hantutor_pending_tutors', JSON.stringify(newPending));
      } catch (e) {}

      setTutors(prev => {
        const filtered = prev.filter(t => String(t.id) !== String(tutorId));
        const updated = [approved, ...filtered];
        try {
          localStorage.setItem('hantutor_tutors_list', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  const rejectTutorKyc = (tutorId: any) => {
    setPendingTutors(prev => {
      const updated = prev.filter(t => String(t.id) !== String(tutorId));
      try {
        localStorage.setItem('hantutor_pending_tutors', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const uiContextValue: UIContextType = {
    openAuthModal: (view = 'login', defaultRole = 'student') => {
      setAuthModalState({ isOpen: true, view, defaultRole });
    },
    openContactZaloModal: (tutor: any) => {
      setContactZaloModalTutor(tutor);
    },
    openEnrollmentModal: (tutor: any) => {
      setEnrollmentModalTutor(tutor);
    },
    openCheckoutModal: (enrollmentId: string, amount: number, tutorId: string | number) => {
      setCheckoutModalState({ isOpen: true, enrollmentId, amount, tutorId });
    },
    openTutorDetailModal: (tutor: any) => {
      window.open(`/giao-vien/${tutor.id}`, '_blank');
    },
    openMyTrialsModal: () => {
      setIsMyTrialsOpen(true);
    },
    openReviewModal: (tutor: any, defaultStage = 'trial') => {
      setReviewModalState({ isOpen: true, tutor, defaultStage });
    }
  };

  const dataContextValue: DataContextType = {
    tutors,
    setTutors,
    pendingTutors,
    setPendingTutors,
    adminStats,
    myTrials,
    reviews,
    recordTrialContact,
    recordOfficialEnrollment,
    cancelTrialEnrollment,
    approveTutorKyc,
    rejectTutorKyc,
    addMockTutor,
    addTutorReview
  };

  return (
    <DataContext.Provider value={dataContextValue}>
      <UIContext.Provider value={uiContextValue}>
        <BrowserRouter>
          <AppLayout 
            authModalState={authModalState}
            setAuthModalState={setAuthModalState}
            contactZaloModalTutor={contactZaloModalTutor}
            setContactZaloModalTutor={setContactZaloModalTutor}
            enrollmentModalTutor={enrollmentModalTutor}
            setEnrollmentModalTutor={setEnrollmentModalTutor}
            recordOfficialEnrollment={recordOfficialEnrollment}
            openCheckoutModal={uiContextValue.openCheckoutModal}
            checkoutModalState={checkoutModalState}
            setCheckoutModalState={setCheckoutModalState}
            isMyTrialsOpen={isMyTrialsOpen}
            setIsMyTrialsOpen={setIsMyTrialsOpen}
            reviewModalState={reviewModalState}
            setReviewModalState={setReviewModalState}
          />
        </BrowserRouter>
      </UIContext.Provider>
    </DataContext.Provider>
  );
}
