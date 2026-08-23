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
  DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockTutors, mockPendingTutors, mockAdminStats, TutorType } from './data';

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

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 cursor-pointer select-none">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
        <svg viewBox="0 0 100 100" className="w-6 h-6 fill-current">
          <path d="M25 28 C25 23, 32 18, 42 23 L42 80 C32 85, 25 80, 25 75 Z" fill="#ffffff"/>
          <path d="M75 28 C75 23, 68 18, 58 23 L58 80 C68 85, 75 80, 75 75 Z" fill="#ffffff" opacity="0.9"/>
          <path d="M40 48 L60 48 L60 56 L40 56 Z" fill="#ffffff" opacity="0.8"/>
          <path d="M50 12 L70 25 L50 38 L30 25 Z" fill="#f59e0b"/>
          <path d="M70 25 L75 40 L70 42 L65 40 Z" fill="#d97706"/>
        </svg>
      </div>
      <span className={`font-extrabold text-2xl tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        Han<span className="text-blue-600">tutor</span>
      </span>
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
  recordTrialContact: (tutor: any, studentInfo?: { name?: string, phone?: string }) => void;
  recordOfficialEnrollment: (tutorId: any) => void;
  cancelTrialEnrollment: (tutorId: any) => void;
  approveTutorKyc: (tutorId: any) => void;
  rejectTutorKyc: (tutorId: any) => void;
  addMockTutor: (newTutor: any) => void;
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
// 2. MODAL LIÊN HỆ ZALO & HỌC THỬ 1-1
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
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tutor) return null;

  const successRate = tutor.trialStats?.totalTrials > 0 
    ? Math.round((tutor.trialStats.officialEnrolled / tutor.trialStats.totalTrials) * 100) 
    : 95;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim()) {
      alert("Vui lòng nhập Họ tên và Số điện thoại liên hệ");
      return;
    }
    recordTrialContact(tutor, { name: studentName, phone: studentPhone });
    setConnected(true);
  };

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(tutor.phone || tutor.zalo || '0967891234');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!connected ? (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <img src={tutor.avatar} alt={tutor.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{tutor.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{tutor.title}</p>
                <div className="mt-1 text-xs font-semibold text-slate-700">
                  Tỷ lệ nhận lớp: <strong className="text-slate-900">{successRate}%</strong>
                </div>
              </div>
            </div>

            {/* Quy trình kết nối & Học thử: font in đậm cỡ chữ to, formal */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-5 text-slate-800 space-y-2.5">
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Quy trình kết nối & Học thử
              </h4>
              <div className="text-xs sm:text-sm text-slate-600 space-y-1.5 leading-relaxed">
                <p><strong>1.</strong> Nhập thông tin để nhận Số điện thoại / Zalo trực tiếp của giáo viên.</p>
                <p><strong>2.</strong> Hai bên trao đổi chi tiết mục tiêu học tập và thống nhất lịch học thử 1-1 miễn phí.</p>
                <p><strong>3.</strong> Sau buổi học thử, học sinh xác nhận <em>"Đăng ký học chính thức"</em> nếu đạt yêu cầu. Trường hợp không đăng ký tiếp, hệ thống tự động ghi nhận và giảm tỷ lệ nhận lớp của giáo viên nhằm đảm bảo tính khách quan.</p>
              </div>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên học sinh / phụ huynh</label>
                <input 
                  type="text" 
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại / Zalo liên hệ</label>
                <input 
                  type="tel" 
                  value={studentPhone}
                  onChange={e => setStudentPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-sm font-medium"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm text-sm flex items-center justify-center cursor-pointer"
              >
                Xác nhận & Nhận số liên hệ của giáo viên
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-2 space-y-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Đã kết nối thành công</h3>
              <p className="text-xs text-slate-500 mt-1">Thông tin liên hệ trực tiếp của giáo viên {tutor.name}:</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="text-left">
                <span className="text-[11px] text-slate-500 font-medium block">Số điện thoại / Zalo</span>
                <span className="text-lg font-bold text-slate-900">{tutor.phone || tutor.zalo || '0967891234'}</span>
              </div>
              <button 
                type="button" 
                onClick={copyPhoneNumber}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs"
              >
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-600 text-left leading-relaxed">
              Thông tin đã được lưu vào mục <strong>Lớp học thử của tôi</strong>. Sau khi hoàn thành buổi học thử 1-1, vui lòng bấm <strong>"Đăng ký học chính thức"</strong> để xác nhận khóa học.
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
              <a 
                href={`https://zalo.me/${tutor.zalo || tutor.phone || '0967891234'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#0068FF] hover:bg-[#0056d6] text-white text-xs font-bold rounded-xl transition-colors shadow-xs text-center inline-block"
              >
                Mở Zalo trao đổi trực tiếp
              </a>

              <button 
                type="button"
                onClick={onOfficialEnroll}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Đã hoàn thành học thử: Đăng ký học chính thức
              </button>
            </div>
          </div>
        )}
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
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
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

  const activeTrialsCount = myTrials.filter(t => t.status === 'trial_in_progress').length;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
        </Link>

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

        <div className="flex items-center gap-3.5">
          <button 
            type="button"
            onClick={openMyTrialsModal}
            className="md:hidden relative p-2 text-slate-600 hover:bg-slate-50 rounded-xl"
            title="Lớp học thử của tôi"
          >
            <BookOpen className="w-5 h-5" />
            {myTrials.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
            )}
          </button>

          <Link to="/tim-gia-su" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
            <Search className="w-5 h-5" />
          </Link>

          <button 
            onClick={() => openAuthModal('login')}
            className="text-slate-700 hover:text-blue-600 font-bold text-sm px-2 py-2 cursor-pointer transition-colors"
          >
            Đăng nhập
          </button>

          <button 
            onClick={() => openAuthModal('register', 'student')}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 sm:px-6 py-2.5 rounded-full transition-all text-sm shadow-md shadow-blue-200"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('');

  const handleHeroSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    navigate(`/tim-gia-su?search=${encodeURIComponent(searchText)}&location=${encodeURIComponent(selectedLoc)}`);
  };

  return (
    <div className="relative bg-gradient-to-b from-blue-50/60 via-blue-50/20 to-white pt-10 pb-16 md:pt-14 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#dbeafe_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>
      
      <div className="hidden lg:block absolute left-8 xl:left-24 top-24">
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
                onKeyDown={e => { if (e.key === 'Enter') handleHeroSearch(e); }}
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
  const successRate = tutor.trialStats?.totalTrials > 0 
    ? Math.round((tutor.trialStats.officialEnrolled / tutor.trialStats.totalTrials) * 100) 
    : 95;

  return (
    <div className="group relative bg-[#f4f5f7] hover:bg-[#ebedf1] rounded-3xl p-5 sm:p-6 border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[300px]">
      {/* Click overlay link to open teacher profile in new tab */}
      <Link 
        to={`/giao-vien/${tutor.id}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="absolute inset-0 z-10" 
        title={`Xem chi tiết hồ sơ ${tutor.name} (Mở tab mới)`}
      />

      {/* Right Side: Portrait Half-Body Photo (Crisp rounded photo clearly positioned on the right) */}
      <div className="absolute right-3.5 top-5 bottom-16 w-[42%] flex items-center justify-end pointer-events-none z-0 overflow-hidden select-none">
        <img 
          src={tutor.avatar} 
          alt={tutor.name} 
          className="w-full h-full max-h-[165px] object-cover object-top rounded-2xl group-hover:scale-105 transition-transform duration-300 drop-shadow-md border border-white"
        />
      </div>

      {/* Top Left: Slogan & Short Bio (Width strictly 54% so text is 100% readable and never covered) */}
      <div className="relative z-10 w-[54%] max-w-[54%]">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {tutor.headline || tutor.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
          {tutor.shortBio || tutor.teachingMethod || tutor.title}
        </p>
      </div>

      {/* Bottom Area: Teacher Name (Left) & Dark Subject Badge Pill (Right) */}
      <div className="relative z-20 flex items-end justify-between pt-6 mt-auto">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block leading-none mb-1">
            {tutor.rolePrefix || (tutor.type === 'Giáo viên' ? (tutor.name.includes('Cô') ? 'Cô' : 'Thầy') : 'Gia sư')}
          </span>
          <span className="font-bold text-sm sm:text-base text-slate-800 tracking-tight block">
            {tutor.displayName || tutor.name.replace(/^(Cô|Thầy|HLV|Gia sư)\s+/i, '')}
          </span>
        </div>

        <div className="relative z-20">
          <span className="bg-slate-900 text-white font-bold text-xs px-3.5 py-1 rounded-full shadow-sm tracking-wide shrink-0">
            {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
          </span>
        </div>
      </div>

      {/* Quick Action Footer: Highlighted Success Rate & Solid Star Rating (Solid layer at bottom) */}
      <div className="relative z-30 pt-3 border-t border-slate-200/80 mt-3 flex items-center justify-between gap-2 bg-[#f4f5f7]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
              {tutor.hourlyRate}đ<span className="text-[10px] font-normal text-slate-400">/{tutor.priceUnit || 'giờ'}</span>
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700">
              <svg className="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {tutor.rating}
            </span>
          </div>
          <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md mt-1 shadow-2xs">
            Tỷ lệ nhận lớp: <strong>{successRate}%</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openContactZaloModal(tutor);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
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

// TeacherDetailPage
function TeacherDetailPage() {
  const { id } = useParams();
  const { tutors, myTrials, cancelTrialEnrollment } = useData();
  const { openContactZaloModal, openEnrollmentModal } = useUI();

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

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img src={tutor.avatar} alt={tutor.name} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover shadow-sm shrink-0" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{tutor.name}</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                  <svg className="w-3.5 h-3.5 fill-emerald-600" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Đã xác thực KYC
                </span>
                <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {tutor.badgeSubject || tutor.subjects?.[0]}
                </span>
              </div>
              <p className="text-base text-slate-600 font-medium mb-3">{tutor.headline || tutor.title}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 mb-3">
                <span>Khu vực: <strong className="text-slate-900">{tutor.location}</strong></span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                  <svg className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Đánh giá: <strong className="text-slate-900">{tutor.rating}/5.0</strong> ({tutor.reviews || 0} lượt)
                </span>
                
                {/* Highlighted Success Rate Badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-950 px-3.5 py-1.5 rounded-xl shadow-2xs">
                  <span className="text-xs font-semibold text-emerald-900">Tỷ lệ nhận lớp thành công:</span>
                  <span className="text-sm font-extrabold text-emerald-700">{successRate}%</span>
                  <span className="text-[11px] text-emerald-700 font-medium">({officialEnrolled}/{totalTrials > 0 ? totalTrials : 1} học viên chốt học sau học thử)</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80 max-w-3xl leading-relaxed">
                <strong>Cơ chế minh bạch:</strong> Tỷ lệ nhận lớp được tính dựa trên số học sinh đã học thử và xác nhận <em>"Đăng ký học chính thức"</em>. Trường hợp học sinh hoàn thành học thử và không tiếp tục đăng ký, tỷ lệ này sẽ tự động giảm nhằm đảm bảo tính khách quan.
              </div>
            </div>
          </div>
        </div>

        {/* Content & Sticky Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Prominent Academic Credentials & Education Section */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">
                  Học vấn & Bằng cấp chuyên môn
                </h2>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Đã đối soát văn bằng gốc
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* University Education */}
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5">
                  <div className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                    Học vấn chính quy
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {tutor.education || 'Đại học Sư Phạm Hà Nội'}
                  </div>
                  <div className="text-xs text-slate-600">
                    Cử nhân Sư phạm / Thạc sĩ chuyên ngành
                  </div>
                </div>

                {/* Teaching Experience */}
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5">
                  <div className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                    Kinh nghiệm giảng dạy
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {tutor.experience || '3 năm'} kinh nghiệm thực tế
                  </div>
                  <div className="text-xs text-slate-600">
                    Chuyên sâu phương pháp kèm cặp 1-1 & bồi dưỡng năng lực
                  </div>
                </div>
              </div>

              {/* Certificates Showcase */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                  Chứng chỉ & Văn bằng nghiệp vụ đã kiểm duyệt
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(tutor.certificates && tutor.certificates.length > 0 ? tutor.certificates : [
                    'Chứng chỉ Nghiệp vụ Sư phạm Quốc tế',
                    'Chứng nhận Giáo viên Dạy giỏi Cấp Thành phố'
                  ]).map((cert: string, idx: number) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                      <span className="text-xs font-bold text-slate-800 leading-snug">
                        {cert}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        Đã xác minh
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Personality */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Đặc điểm & Phong cách giảng dạy
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {(tutor.personality || ['Tận tâm', 'Kiên nhẫn', 'Thân thiện', 'Truyền cảm hứng']).map((trait: string) => (
                  <span key={trait} className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-semibold rounded-2xl border border-slate-200">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Teaching Method */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Phương pháp giảng dạy & Triết lý giáo dục
              </h2>
              <div className="bg-slate-50 p-5 rounded-2xl text-sm text-slate-700 leading-relaxed mb-4 border border-slate-200/80">
                {tutor.teachingMethod || 'Cá nhân hóa lộ trình theo năng lực từng học sinh, tập trung vào bản chất kiến thức và phản xạ tư duy.'}
              </div>
              {tutor.philosophy && (
                <div className="border-l-4 border-slate-400 bg-slate-50 p-4 rounded-r-2xl text-sm italic text-slate-800">
                  "{tutor.philosophy}"
                </div>
              )}
            </div>

            {/* Video Demo */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Video bài giảng mẫu
              </h2>
              <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0" 
                  title="Video Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Right Sticky Booking Widget */}
          <div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-28 space-y-5">
              <div>
                <span className="text-xs text-slate-500 font-semibold block uppercase">Học phí tham khảo</span>
                <span className="text-2xl font-extrabold text-slate-900">{tutor.hourlyRate}đ <span className="text-xs font-normal text-slate-500">/{tutor.priceUnit || 'giờ'}</span></span>
              </div>

              {/* Highlighted Success Rate Card in Sidebar */}
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
              </div>

              {/* Dynamic Student Trial State Widget */}
              <div className="space-y-3 pt-2">
                {trialItem?.status === 'trial_in_progress' ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="text-xs text-slate-900 font-bold">
                      Trạng thái: Đang trao đổi & học thử cùng {tutor.name}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Số điện thoại / Zalo giáo viên: <strong className="text-slate-900">{tutor.phone || tutor.zalo || '0912345678'}</strong>
                    </p>
                    
                    <a
                      href={`https://zalo.me/${tutor.zalo || tutor.phone || '0912345678'}`}
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
                      Đã đăng ký học chính thức cùng {tutor.name}
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

// 6. TutorRegistrationPage
function TutorRegistrationPage() {
  const { addMockTutor } = useData();
  const location = useLocation();

  // Đọc query params được truyền từ AuthModal khi chọn "Đăng ký dạy học"
  const urlParams = new URLSearchParams(location.search);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Account & Personal Info — khởi tạo sẵn từ query params nếu có
  const [email, setEmail] = useState(urlParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(urlParams.get('phone') || '');
  const [fullName, setFullName] = useState(urlParams.get('name') || '');
  const [birthYear, setBirthYear] = useState(urlParams.get('year') || '2000');

  // Professional Details — Tách Trường học & Ngành học
  const [categoryType, setCategoryType] = useState('student');
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [university, setUniversity] = useState('Đại học Sư phạm Hà Nội');
  const [customUniversity, setCustomUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [certificates, setCertificates] = useState('');
  const [achievements, setAchievements] = useState('');

  // Teaching Preferences
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [teachingFormats, setTeachingFormats] = useState<string[]>([]);
  const [locationText, setLocationText] = useState('');
  const [levelPrices, setLevelPrices] = useState<Record<string, string>>({});
  const [priceUnit, setPriceUnit] = useState('giờ');
  const [scheduleNote, setScheduleNote] = useState('');
  const [scheduleSlots, setScheduleSlots] = useState<string[]>([]);

  // Files & Previews
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string>('');

  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string>('');

  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [credentialPreview, setCredentialPreview] = useState<string>('');

  const [achievementFile, setAchievementFile] = useState<File | null>(null);
  const [achievementPreview, setAchievementPreview] = useState<string>('');

  // Bank account for receiving tutor payment (70%)
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  // Dropdowns lists
  const birthYears = Array.from({ length: 2012 - 1950 + 1 }, (_, i) => (2012 - i).toString());

  const universitiesList = [
    'Đại học Quốc gia Hà Nội',
    'Đại học Quốc gia TP.HCM',
    'Đại học Bách khoa Hà Nội',
    'Đại học Kinh tế Quốc dân (NEU)',
    'Đại học Ngoại thương (FTU)',
    'Đại học Sư phạm Hà Nội',
    'Đại học Sư phạm TP.HCM',
    'Đại học Y Hà Nội',
    'Đại học Y Dược TP.HCM',
    'Đại học Thương mại (TMU)',
    'Học viện Tài chính (AOF)',
    'Học viện Ngân hàng (BA)',
    'Đại học Luật Hà Nội',
    'Đại học Giao thông Vận tải',
    'Đại học Xây dựng Hà Nội',
    'Đại học Thủy lợi',
    'Đại học Công nghiệp Hà Nội',
    'Đại học Kinh tế TP.HCM (UEH)',
    'Đại học Bách khoa TP.HCM',
    'Đại học Khoa học Tự nhiên',
    'Đại học Khoa học Xã hội và Nhân văn',
    'Đại học FPT',
    'Đại học RMIT Vietnam',
    'Đại học Tôn Đức Thắng',
    'Đại học Cần Thơ',
    'Đại học Đà Nẵng',
    'Đại học Huế',
    'Học viện Báo chí và Tuyên truyền',
    'Trường khác (Tự nhập)'
  ];

  const subjectsList = ['Toán', 'Tiếng Anh', 'Vật Lý', 'Hóa Học', 'Ngữ Văn', 'Sinh Học', 'Lịch Sử', 'Địa Lý', 'Tin Học'];
  const levelsList = ['Tiểu học (Lớp 1-5)', 'THCS (Lớp 6-9)', 'THPT (Lớp 10-12)', 'Luyện thi Đại học', 'Luyện thi chứng chỉ (IELTS/TOEIC...)', 'Phát triển năng khiếu / Khác'];
  const formatsList = ['Gia sư tại nhà học viên', 'Dạy tại nhà giáo viên', 'Dạy trực tuyến (Online)', 'Dạy offline tại trung tâm / Khác'];
  const banksList = [
    'Vietcombank (VCB)', 'VietinBank (CTG)', 'BIDV', 'Agribank',
    'MB Bank', 'Techcombank', 'VPBank', 'ACB', 'Sacombank',
    'TPBank', 'SHB', 'HDBank', 'SeABank', 'OCB', 'MSB',
    'LienVietPostBank', 'Nam A Bank', 'VIB', 'Eximbank', 'BaoViet Bank'
  ];

  const shifts = ['Sáng', 'Chiều', 'Tối'];
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'avatar' | 'cccdFront' | 'cccdBack' | 'credential' | 'achievement') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Tệp tải lên không được lớn hơn 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (fileType === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(dataUrl);
      } else if (fileType === 'cccdFront') {
        setCccdFrontFile(file);
        setCccdFrontPreview(dataUrl);
      } else if (fileType === 'cccdBack') {
        setCccdBackFile(file);
        setCccdBackPreview(dataUrl);
      } else if (fileType === 'credential') {
        setCredentialFile(file);
        setCredentialPreview(dataUrl);
      } else if (fileType === 'achievement') {
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

  const handleSubjectChange = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleLevelChange = (level: string) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  const handleFormatChange = (format: string) => {
    if (teachingFormats.includes(format)) {
      setTeachingFormats(teachingFormats.filter(f => f !== format));
    } else {
      setTeachingFormats([...teachingFormats, format]);
    }
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!fullName.trim()) return "Vui lòng nhập Họ và tên";
      if (!birthYear) return "Vui lòng chọn Năm sinh";
      
      if (!email.trim()) return "Vui lòng nhập Email";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return "Email không đúng định dạng (VD: example@gmail.com)";
      
      if (!phone.trim()) return "Vui lòng nhập Số điện thoại";
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(phone)) return "Số điện thoại không đúng định dạng. Vui lòng nhập SĐT Việt Nam hợp lệ (VD: 0912345678)";

      if (!avatarFile && !avatarPreview) return "Vui lòng tải lên Ảnh chân dung rõ mặt";

      if (!title.trim()) return "Vui lòng nhập Tiêu đề hồ sơ / Chức danh";
      if (!experience || parseInt(experience) < 0) return "Vui lòng nhập Số năm kinh nghiệm";

      if (university === 'Trường khác (Tự nhập)' && !customUniversity.trim()) {
        return "Vui lòng nhập tên trường Đại học của bạn";
      }
      if (!major.trim()) return "Vui lòng nhập Ngành học của bạn";
    }
    if (currentStep === 2) {
      if (selectedSubjects.length === 0 && !customSubject.trim()) return "Vui lòng chọn hoặc nhập ít nhất 1 Môn học";
      if (selectedLevels.length === 0) return "Vui lòng chọn ít nhất 1 Cấp độ dạy học";
      if (teachingFormats.length === 0) return "Vui lòng chọn ít nhất 1 Hình thức dạy";
      if (!locationText.trim()) return "Vui lòng nhập Khu vực dạy";
      for (const lvl of selectedLevels) {
        const p = levelPrices[lvl];
        if (!p || parseInt(p.replace(/\D/g, '')) <= 0) {
          return `Vui lòng nhập học phí hợp lệ cho cấp học: ${lvl}`;
        }
      }
      if (scheduleSlots.length === 0) return "Vui lòng chọn ít nhất 1 Lịch rảnh rỗi trên bảng";
      // Bank account validation
      if (!bankName) return "Vui lòng chọn Ngân hàng để nhận thanh toán";
      if (!bankAccountNumber.trim()) return "Vui lòng nhập Số tài khoản ngân hàng";
      if (!/^[0-9]{6,20}$/.test(bankAccountNumber.trim())) return "Số tài khoản không hợp lệ (chỉ chứa số, 6-20 ký tự)";
      if (!bankAccountHolder.trim()) return "Vui lòng nhập Tên chủ tài khoản";
      if (!cccdFrontFile || !cccdBackFile) return "Vui lòng tải lên đầy đủ ảnh mặt trước và mặt sau CCCD để xác thực";
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(step);
    if (error) {
      alert(error);
      return;
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    const error = validateStep(2);
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);
    const userId = 'tutor-' + Date.now();
    const finalSubjects = [...selectedSubjects];
    if (customSubject && !finalSubjects.includes(customSubject)) {
      finalSubjects.push(customSubject);
    }

    // Ghép Trường học và Ngành học
    const finalUniversity = university === 'Trường khác (Tự nhập)' ? (customUniversity.trim() || 'Trường khác') : university;
    const finalEducation = major.trim() ? `${finalUniversity} - ${major.trim()}` : finalUniversity;

    // Parse levelPrices to calculate range
    const numericPrices = Object.values(levelPrices)
      .map(p => parseInt(p.replace(/\D/g, '')))
      .filter(p => !isNaN(p) && p > 0);
    
    const minPrice = numericPrices.length > 0 ? Math.min(...numericPrices) : 150000;
    const maxPrice = numericPrices.length > 0 ? Math.max(...numericPrices) : 150000;

    let displayHourlyRate = '';
    if (numericPrices.length === 0) {
      displayHourlyRate = '150.000';
    } else if (minPrice === maxPrice) {
      displayHourlyRate = minPrice.toLocaleString();
    } else {
      displayHourlyRate = `${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
    }

    let avatarUrl = avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";
    let certUrls: string[] = [];
    let achievementUrl = achievementPreview || '';

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: password || '123456',
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });

      if (!authError && authData?.user) {
        const dbUserId = authData.user.id;
        
        if (avatarFile) {
          try {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `avatar-${dbUserId}.${fileExt}`;
            await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
            avatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
          } catch(e) {}
        }

        if (achievementFile) {
          try {
            const fileExt = achievementFile.name.split('.').pop();
            const fileName = `achievement-${dbUserId}.${fileExt}`;
            await supabase.storage.from('documents').upload(fileName, achievementFile, { upsert: true });
            achievementUrl = supabase.storage.from('documents').getPublicUrl(fileName).data.publicUrl;
          } catch(e) {}
        }

        await supabase.from('users').insert({
          id: dbUserId,
          email,
          full_name: fullName,
          role: 'instructor'
        });

        await supabase.from('profiles').insert({
          id: dbUserId,
          avatar_url: avatarUrl,
          subjects: finalSubjects,
          levels: selectedLevels,
          category_type: categoryType,
          provider_type: '1-1',
          price: minPrice,
          price_unit: priceUnit,
          location: locationText,
          online: teachingFormats.includes('Dạy trực tuyến (Online)'),
          experience: parseInt(experience) || 0,
          education: finalEducation,
          intro: title,
          bio: `[Năm sinh: ${birthYear}] [Hình thức: ${teachingFormats.join(', ')}] [Minh chứng: ${achievementUrl}] [Bảng giá: ${Object.entries(levelPrices).map(([lvl, prc]) => `${lvl}=${prc}`).join(';')}] [Lịch trống: ${scheduleSlots.join(', ')} / ${scheduleNote}] ${achievements || ''}`,
          schedule: scheduleSlots,
          certificates: certUrls.length > 0 ? certUrls : (certificates ? [certificates] : []),
          skills: teachingFormats,
          success_story: achievements,
          verified: false,
          bank_name: bankName,
          bank_account_number: bankAccountNumber.trim(),
          bank_account_name: bankAccountHolder.trim().toUpperCase()
        });
      }
    } catch (e) {
      console.warn("Supabase registration error, falling back to local simulation", e);
    }

    const mockTutorData = {
      id: userId,
      name: fullName,
      avatar: avatarUrl,
      title: title,
      rating: 5.0,
      reviews: 0,
      subjects: finalSubjects,
      location: locationText,
      hourlyRate: displayHourlyRate,
      priceUnit: priceUnit,
      isOnline: teachingFormats.includes('Dạy trực tuyến (Online)'),
      providerType: '1-1',
      targetTags: selectedLevels.slice(0, 3),
      successStory: achievements,
      achievementProofUrl: achievementUrl,
      type: categoryType === 'teacher' ? 'Giáo viên' : 'Sinh viên',
      experience: parseInt(experience) || 0,
      education: finalEducation,
      bio: `[Năm sinh: ${birthYear}] [Hình thức: ${teachingFormats.join(', ')}] [Minh chứng: ${achievementUrl}] [Bảng giá: ${Object.entries(levelPrices).map(([lvl, prc]) => `${lvl}=${prc}`).join(';')}] ${achievements || ''}`,
      schedule: scheduleSlots,
      skills: teachingFormats,
      levels: selectedLevels,
      levelPrices: levelPrices,
      certificates: certificates ? [certificates] : [],
      verified: false,
      kycStatus: 'pending',
      cccdFront: cccdFrontPreview || "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800",
      cccdBack: cccdBackPreview || "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800",
      credentialFile: credentialPreview || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800",
      trialStats: {
        totalTrials: 0,
        officialEnrolled: 0
      }
    };

    addMockTutor(mockTutorData);
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 animate-bounce" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng ký thành công!</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Hồ sơ của bạn đã được gửi xét duyệt (KYC). Trong thời gian chờ phê duyệt, hồ sơ của bạn đã được giả lập duyệt thành công để bạn có thể xem thử ngay lập tức!
        </p>
        <Link to="/tim-gia-su" className="inline-block bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          Xem hồ sơ của tôi
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng ký làm Giáo viên / Gia sư</h1>
          <p className="text-slate-500 text-sm">Gia nhập đội ngũ giáo dục hàng đầu. Đăng ký nhanh chỉ trong 2 bước.</p>
          
          {/* Step Progress Indicators — 2 Bước tối giản */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
              <span className={`text-xs font-semibold ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Chuyên môn & Học vấn</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
              <span className={`text-xs font-semibold ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>Lịch trống, STK & KYC</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* STEP 1: CHUYÊN MÔN & HỌC VẤN */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Thẻ thông tin cá nhân đã tự điền */}
              <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" /> Thông tin tài khoản
                  </h4>
                  <span className="text-[11px] text-blue-600 font-medium">Đã tự động lấy từ Đăng ký</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">Họ và tên *</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800" 
                      placeholder="VD: Nguyễn Văn A" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">Năm sinh *</label>
                    <select 
                      value={birthYear}
                      onChange={e => setBirthYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800"
                    >
                      {birthYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">Số điện thoại *</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800" 
                      placeholder="09xx xxx xxx" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">Email đăng nhập *</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800" 
                      placeholder="email@example.com" 
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Uploader */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <label className="block text-sm font-bold text-slate-800 mb-3">Ảnh chân dung rõ mặt *</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-white shadow-md flex-shrink-0 overflow-hidden relative flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-9 h-9 text-slate-400" />
                    )}
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold inline-block transition-colors shadow-sm">
                      Chọn ảnh tải lên
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleFileChange(e, 'avatar')} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Ảnh chụp chính diện rõ mặt, trang phục lịch sự. Tối đa 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hồ sơ chuyên môn */}
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pt-2">
                <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                Chuyên môn & Học vấn
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bạn ứng tuyển làm *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setCategoryType('student')}
                    className={`py-3.5 px-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${categoryType === 'student' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
                  >
                    <Users className="w-5 h-5" /> Gia sư Sinh viên
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCategoryType('teacher')}
                    className={`py-3.5 px-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1.5 ${categoryType === 'teacher' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
                  >
                    <GraduationCap className="w-5 h-5" /> Giáo viên chuyên nghiệp
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề hồ sơ / Chức danh ngắn *</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm" 
                    placeholder={categoryType === 'teacher' ? "VD: Giáo viên Tiếng Anh chuyên luyện thi IELTS 8.0" : "VD: Sinh viên năm 3 Đại học Ngoại Thương - Học bổng IELTS"} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kinh nghiệm giảng dạy (Số năm) *</label>
                  <input 
                    type="number" 
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm" 
                    placeholder="VD: 3" 
                  />
                </div>

                {/* TÁCH BÀI TRƯỜNG HỌC & NGÀNH HỌC */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trường Đại học *</label>
                  <select 
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                  >
                    {universitiesList.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {university === 'Trường khác (Tự nhập)' && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên trường Đại học của bạn *</label>
                    <input 
                      type="text" 
                      value={customUniversity}
                      onChange={e => setCustomUniversity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm" 
                      placeholder="VD: Đại học Quốc tế RMIT Vietnam" 
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngành học chuyên môn *</label>
                  <input 
                    type="text" 
                    value={major}
                    onChange={e => setMajor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm" 
                    placeholder="VD: Sư phạm Toán, Ngôn ngữ Anh, Công nghệ thông tin..." 
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bằng cấp & Chứng chỉ nổi bật (nếu có)</label>
                  <input 
                    type="text" 
                    value={certificates}
                    onChange={e => setCertificates(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm" 
                    placeholder="VD: IELTS 8.0, TOEIC 950, Bằng tốt nghiệp loại giỏi..." 
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thành tích nổi bật của học sinh cũ</label>
                  <textarea 
                    rows={3}
                    value={achievements}
                    onChange={e => setAchievements(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm resize-none" 
                    placeholder="Mô tả thành tích tiêu biểu của học sinh cũ (VD: Giúp em B tăng điểm Toán từ 5.0 lên 8.5; Dạy kèm em C đạt IELTS 7.0...)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh minh chứng thành tích (bảng điểm, tin nhắn, chứng chỉ...)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer min-h-[110px] flex flex-col justify-center items-center bg-slate-50/50">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={e => handleFileChange(e, 'achievement')} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    {achievementPreview ? (
                      achievementFile?.type === 'application/pdf' ? (
                        <div className="text-blue-600 font-semibold text-xs flex items-center gap-1.5">
                          <GraduationCap className="w-5 h-5" /> {achievementFile.name}
                        </div>
                      ) : (
                        <img src={achievementPreview} alt="Achievements Proof" className="max-h-[90px] rounded-lg object-contain" />
                      )
                    ) : (
                      <>
                        <UploadCloud className="w-7 h-7 text-blue-500 mb-1" />
                        <div className="font-medium text-slate-700 text-xs mb-0.5">Tải lên ảnh/tệp minh chứng thành tích</div>
                        <div className="text-[10px] text-slate-400">JPG, PNG hoặc PDF (Tối đa 5MB)</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DẠY HỌC, STK & KYC */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                Môn học, Học phí & STK Ngân hàng
              </h3>

              {/* Môn học checkboxes */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Môn học giảng dạy *</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {subjectsList.map(subj => {
                    const isChecked = selectedSubjects.includes(subj);
                    return (
                      <label key={subj} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleSubjectChange(subj)}
                          className="rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-sm text-slate-600">{subj}</span>
                      </label>
                    );
                  })}
                </div>
                <input 
                  type="text" 
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm" 
                  placeholder="Môn học khác (nếu có, VD: Lập trình, Tiếng Nhật...)" 
                />
              </div>

              {/* Cấp độ checkboxes */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Cấp độ học sinh nhận dạy *</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {levelsList.map(level => {
                    const isChecked = selectedLevels.includes(level);
                    return (
                      <label key={level} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleLevelChange(level)}
                          className="rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-sm text-slate-600">{level}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Hình thức dạy checkboxes */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Hình thức giảng dạy *</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {formatsList.map(fmt => {
                    const isChecked = teachingFormats.includes(fmt);
                    return (
                      <label key={fmt} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleFormatChange(fmt)}
                          className="rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="text-sm text-slate-600">{fmt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Khu vực nhận dạy (Quận/Huyện, Tỉnh...) *</label>
                  <input 
                    type="text" 
                    value={locationText}
                    onChange={e => setLocationText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm" 
                    placeholder="VD: Cầu Giấy & Đống Đa, Hà Nội" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Học phí theo từng cấp học đã chọn (VNĐ) *</label>
                  {selectedLevels.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                      Vui lòng chọn ít nhất một cấp độ học sinh nhận dạy ở trên để thiết lập học phí.
                    </p>
                  ) : (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {selectedLevels.map(level => (
                        <div key={level} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                          <span className="text-xs font-semibold text-slate-700">{level}:</span>
                          <div className="flex gap-2 items-center">
                            <input 
                              type="text" 
                              value={levelPrices[level] || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setLevelPrices({ ...levelPrices, [level]: val });
                              }}
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-xs w-32 text-right font-medium" 
                              placeholder="VD: 150.000" 
                            />
                            <span className="text-[10px] text-slate-500">đ/{priceUnit}</span>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-2 border-t border-slate-200 flex justify-end items-center gap-2">
                        <span className="text-[10px] text-slate-500">Đơn vị áp dụng:</span>
                        <select 
                          value={priceUnit}
                          onChange={e => setPriceUnit(e.target.value)}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] outline-none"
                        >
                          <option value="giờ">/ giờ</option>
                          <option value="tháng">/ tháng</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lịch trống Grid */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Lịch trống trong tuần (Chọn những buổi rảnh) *</label>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse text-xs text-center">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <th className="p-3 text-left">Buổi</th>
                          {days.map(d => <th key={d} className="p-3">{d}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {shifts.map(shift => (
                          <tr key={shift} className="border-b border-slate-100">
                            <td className="p-3 font-semibold text-slate-700 text-left bg-slate-50/70">{shift}</td>
                            {days.map(day => {
                              const slot = `${day}_${shift}`;
                              const isSelected = scheduleSlots.includes(slot);
                              return (
                                <td key={day} className="p-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleScheduleSlot(day, shift)}
                                    className={`w-full py-2 rounded-lg font-medium transition-all text-[11px] ${
                                      isSelected 
                                        ? 'bg-blue-600 text-white shadow-sm font-bold' 
                                        : 'bg-white text-slate-500 border border-slate-150 hover:bg-slate-50'
                                    }`}
                                  >
                                    {isSelected ? 'Rảnh' : '+'}
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
                <input 
                  type="text" 
                  value={scheduleNote}
                  onChange={e => setScheduleNote(e.target.value)}
                  className="w-full mt-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm" 
                  placeholder="Ghi chú thêm về lịch học (VD: Rảnh các tối trừ thứ 7, Có thể sắp xếp thêm...)" 
                />
              </div>

              {/* Section: Thông tin nhận tiền */}
              <div className="bg-green-50 border border-green-100 rounded-3xl p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-green-500 rounded-full inline-block"></span>
                    Thông tin nhận thanh toán (70% học phí) *
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hệ thống sẽ tự động ghi nhận và chuyển <strong>70% học phí</strong> vào tài khoản của bạn mỗi khi học sinh thanh toán. Trung tâm giữ lại 30% phí nền tảng.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngân hàng *</label>
                    <select
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all text-sm"
                    >
                      <option value="">-- Chọn ngân hàng --</option>
                      {banksList.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số tài khoản *</label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={e => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all text-sm"
                      placeholder="VD: 0123456789"
                      maxLength={20}
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Chỉ nhập số, không nhập dấu cách</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên chủ tài khoản *</label>
                    <input
                      type="text"
                      value={bankAccountHolder}
                      onChange={e => setBankAccountHolder(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all text-sm tracking-wide"
                      placeholder="VD: NGUYEN VAN A"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Nhập đúng tên trên thẻ ngân hàng (CHỮ HOA, không dấu)</p>
                  </div>
                </div>
                {bankName && bankAccountNumber && bankAccountHolder && (
                  <div className="bg-white border border-green-200 rounded-xl p-3 text-xs text-green-800">
                    ✅ {bankName} — STK: <strong>{bankAccountNumber}</strong> — Chủ TK: <strong>{bankAccountHolder}</strong>
                  </div>
                )}
              </div>

              {/* KYC CMND/CCCD & Credentials */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Xác thực danh tính (KYC) & Bằng cấp *</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Để đảm bảo tính chuyên nghiệp và uy tín cho nền tảng, quý gia sư vui lòng cung cấp ảnh chụp giấy tờ xác minh. Chúng tôi cam kết bảo mật tuyệt đối các thông tin cá nhân của bạn.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CCCD Mặt trước */}
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-slate-700">CCCD (Mặt trước) *</span>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[140px] flex flex-col justify-center items-center bg-white/40">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleFileChange(e, 'cccdFront')} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      {cccdFrontPreview ? (
                        <img src={cccdFrontPreview} alt="CCCD Mặt trước" className="max-h-[120px] rounded-lg object-contain" />
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-blue-500 mb-1.5" />
                          <span className="font-semibold text-slate-700 text-xs block">Mặt trước CCCD</span>
                          <span className="text-[10px] text-slate-400">JPG, PNG (Tối đa 5MB)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* CCCD Mặt sau */}
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-slate-700">CCCD (Mặt sau) *</span>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[140px] flex flex-col justify-center items-center bg-white/40">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleFileChange(e, 'cccdBack')} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      {cccdBackPreview ? (
                        <img src={cccdBackPreview} alt="CCCD Mặt sau" className="max-h-[120px] rounded-lg object-contain" />
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-blue-500 mb-1.5" />
                          <span className="font-semibold text-slate-700 text-xs block">Mặt sau CCCD</span>
                          <span className="text-[10px] text-slate-400">JPG, PNG (Tối đa 5MB)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bằng cấp tệp */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-700">Thẻ sinh viên / Bằng tốt nghiệp / Chứng chỉ sư phạm</span>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[120px] flex flex-col justify-center items-center bg-white/40">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={e => handleFileChange(e, 'credential')} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    {credentialPreview ? (
                      credentialFile?.type === 'application/pdf' ? (
                        <div className="text-blue-600 font-semibold text-xs flex items-center gap-1.5">
                          <GraduationCap className="w-6 h-6" /> {credentialFile.name}
                        </div>
                      ) : (
                        <img src={credentialPreview} alt="Chứng chỉ" className="max-h-[100px] rounded-lg object-contain" />
                      )
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-blue-500 mb-1.5" />
                        <span className="font-semibold text-slate-700 text-xs block">Kéo thả hoặc Click chọn tệp chứng chỉ</span>
                        <span className="text-[10px] text-slate-400">Chấp nhận JPG, PNG, PDF (Tối đa 5MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button 
                type="button"
                onClick={handlePrev}
                disabled={loading}
                className="px-6 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 text-sm cursor-pointer"
              >
                Quay lại
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button 
                type="button"
                onClick={handleNext}
                className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm cursor-pointer"
              >
                Tiếp tục →
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : 'Hoàn tất & Gửi duyệt'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. Footer
function Footer() {
  return (
    <footer className="bg-[#0d1424] text-slate-400 py-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <svg viewBox="0 0 100 100" className="w-5 h-5 fill-current">
              <path d="M25 28 C25 23, 32 18, 42 23 L42 80 C32 85, 25 80, 25 75 Z" fill="#ffffff"/>
              <path d="M75 28 C75 23, 68 18, 58 23 L58 80 C68 85, 75 80, 75 75 Z" fill="#ffffff" opacity="0.9"/>
              <path d="M40 48 L60 48 L60 56 L40 56 Z" fill="#ffffff" opacity="0.8"/>
              <path d="M50 12 L70 25 L50 38 L30 25 Z" fill="#f59e0b"/>
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Han<span className="text-blue-500">tutor</span>
          </span>
        </Link>

        <div className="text-xs text-slate-400">
          © 2026 Hantutor. Nền tảng kết nối gia sư thông minh.
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
  setIsMyTrialsOpen
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
    </div>
  );
}

export default function App() {
  const [tutors, setTutors] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hantutor_tutors_list');
      if (saved) return JSON.parse(saved);
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
    // Học sinh học thử xong không tiếp tục -> Xóa hoàn toàn khỏi danh sách lớp học thử (không để hàng chờ)
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
    }
  };

  const dataContextValue: DataContextType = {
    tutors,
    setTutors,
    pendingTutors,
    setPendingTutors,
    adminStats,
    myTrials,
    recordTrialContact,
    recordOfficialEnrollment,
    cancelTrialEnrollment,
    approveTutorKyc,
    rejectTutorKyc,
    addMockTutor
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
          />
        </BrowserRouter>
      </UIContext.Provider>
    </DataContext.Provider>
  );
}
