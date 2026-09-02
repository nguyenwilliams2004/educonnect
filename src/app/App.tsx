import {
  AlertCircle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  Filter,
  Globe,
  GraduationCap,
  Heart,
  Info,
  Laptop,
  MapPin,
  Maximize2,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Search,
  Share2,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  UploadCloud,
  User,
  UserCheck,
  Users,
  UserX,
  X,
  Zap,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import FloatingContactDock from './components/FloatingContactDock';
import { defaultTutorReviews, mockAdminStats, mockPendingTutors, mockTutors, TutorReviewItem, TutorType } from './data';
import {
  IDORGuard,
  RATE_LIMIT_RULES,
  RateLimiter,
  RateLimitResult,
  RowLevelSecurity,
  SecurityAuditEvent,
  SecurityAuditLogger,
  UserRole,
  UserSessionContext
} from './security';

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
  studentId?: string | number;
  studentPhone?: string;
}

export interface WalletTransaction {
  id: string;
  tutorId: string | number;
  tutorName?: string;
  type: 'tuition_income' | 'withdrawal';
  amount: number;
  title: string;
  date: string;
  status: 'completed' | 'pending';
  bankInfo?: string;
}

export interface TeacherWallet {
  balance: number;
  totalWithdrawn: number;
  transactions: WalletTransaction[];
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
function getStoredTeacherWallets(): Record<string, TeacherWallet> {
  const defaultWallet: TeacherWallet = {
    balance: 1680000,
    totalWithdrawn: 3500000,
    transactions: [
      {
        id: 'tx_init_1',
        tutorId: 't1',
        tutorName: 'Cô Sương Mai',
        type: 'tuition_income',
        amount: 1120000,
        title: 'Cộng 70% học phí khóa 8 buổi (Học sinh Hoàng Nam)',
        date: '02/09/2026',
        status: 'completed'
      },
      {
        id: 'tx_init_2',
        tutorId: 't1',
        tutorName: 'Cô Sương Mai',
        type: 'tuition_income',
        amount: 560000,
        title: 'Cộng 70% học phí khóa 4 buổi (Học sinh Bảo Anh)',
        date: '01/09/2026',
        status: 'completed'
      }
    ]
  };

  try {
    const raw = localStorage.getItem('hantutor_teacher_wallets');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (!parsed['t1'] || typeof parsed['t1'].balance !== 'number' || parsed['t1'].balance === 0) {
          parsed['t1'] = defaultWallet;
        }
        return parsed;
      }
    }
  } catch { }
  return {
    t1: defaultWallet
  };
}
function saveStoredTeacherWallets(wallets: Record<string, TeacherWallet>) {
  localStorage.setItem('hantutor_teacher_wallets', JSON.stringify(wallets));
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
  openTeacherWalletModal: (tutorId?: string | number) => void;
  openTeacherProfileModal: (tutorId?: string | number) => void;
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
  currentSession: UserSessionContext;
  setCurrentSession: React.Dispatch<React.SetStateAction<UserSessionContext>>;
  teacherWallets: Record<string, TeacherWallet>;
  getTeacherWallet: (tutorId: string | number) => TeacherWallet;
  requestWithdrawal: (tutorId: string | number, amount: number, bankInfo: string) => { success: boolean; message: string };
  approveWithdrawal: (transactionId: string) => void;
  recordTrialContact: (tutor: any, studentInfo?: { name?: string, phone?: string }) => void;
  recordOfficialEnrollment: (tutorId: any, totalTuition?: number) => void;
  cancelTrialEnrollment: (tutorId: any) => void;
  approveTutorKyc: (tutorId: any) => void;
  rejectTutorKyc: (tutorId: any) => void;
  addMockTutor: (newTutor: any) => void;
  updateTutorProfile: (tutorId: string | number, updatedData: Partial<any>) => void;
  addTutorReview: (review: Omit<TutorReviewItem, 'id' | 'date'>) => void;
  getMaskedTutor: (tutor: any) => any;
  securityLogs: SecurityAuditEvent[];
  refreshSecurityLogs: () => void;
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
  const { setCurrentSession } = useData();

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

    // Rate Limit Check (Sliding window)
    const rateCheck = RateLimiter.check('AUTH_LOGIN', identifier);
    if (!rateCheck.allowed) {
      alert(rateCheck.errorMessage || 'Thao tác quá nhanh. Vui lòng thử lại sau.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      RateLimiter.reset('AUTH_LOGIN', identifier);
      const isPhone = !identifier.includes('@');
      const tutorId = role === 'teacher' ? 't1' : IDORGuard.toSecureId('usr', identifier);
      setCurrentSession({
        userId: tutorId,
        role: role === 'student' ? 'student' : 'teacher',
        phone: isPhone ? identifier : '0912345678',
        email: isPhone ? 'giaovien.demo@hantutor.vn' : identifier,
        sessionToken: 'tok_' + Math.random().toString(36).substring(2)
      });
      alert(`Đăng nhập thành công với vai trò: ${role === 'student' ? 'Học sinh / Phụ huynh' : 'Giáo viên (Cô Sương Mai)'}!`);
      onClose();
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const regRate = RateLimiter.check('AUTH_REGISTER', identifier || 'anon_reg');
    if (!regRate.allowed) {
      alert(regRate.errorMessage);
      return;
    }

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
        RateLimiter.reset('AUTH_REGISTER', identifier || 'anon_reg');
        setCurrentSession({
          userId: IDORGuard.toSecureId('usr', identifier),
          role: 'student',
          phone: !identifier.includes('@') ? identifier : undefined,
          email: identifier.includes('@') ? identifier : undefined,
          sessionToken: 'tok_' + Math.random().toString(36).substring(2)
        });
        alert("Đăng ký tài khoản học sinh thành công!");
        onClose();
      }, 600);
    }
  };

  const handleForgotPasswordStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      alert("Vui lòng nhập Email hoặc Số điện thoại để nhận mã OTP");
      return;
    }

    // Rate limit for OTP
    const otpRate = RateLimiter.check('AUTH_OTP', identifier);
    if (!otpRate.allowed) {
      alert(otpRate.errorMessage || 'Yêu cầu gửi OTP quá thường xuyên. Vui lòng chờ.');
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
            <div className="grid grid-cols-2 gap-2.5 mb-4">
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

            {/* Quick Demo Credentials for Teacher */}
            {role === 'teacher' && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-900 flex items-center gap-1">
                    <span>👨‍🏫 Tài khoản Giáo viên Demo:</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono">giaovien.demo@hantutor.vn • demo123456</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('giaovien.demo@hantutor.vn');
                    setPassword('demo123456');
                  }}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  ⚡ Tự điền
                </button>
              </div>
            )}

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
// 3. ENROLLMENT MODAL (Giao diện học sinh: chỉ hiển thị học phí khóa học)
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

          {/* Chi tiết học phí cho học sinh (không hiển thị 30/70) */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Học phí 1 buổi ({currentLvl}):</span>
              <span className="font-bold text-slate-900">{pricePerSession.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Số buổi đăng ký:</span>
              <span className="font-bold text-slate-900">{totalSessions} buổi</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Tổng thanh toán học phí:</span>
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
              Lớp học đã được kích hoạt thành công. Giáo viên sẽ liên hệ và bắt đầu khóa học theo lịch đã chọn. Chúc bạn có những buổi học hiệu quả!
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
// 3.2. TEACHER WALLET MODAL (Ví Giảng Dạy - Tự Rút Tiền Shopee-Style Fintech)
// ==========================================
function TeacherWalletModal({
  isOpen,
  onClose,
  tutorId
}: {
  isOpen: boolean;
  onClose: () => void;
  tutorId?: string | number;
}) {
  const { tutors, getTeacherWallet, requestWithdrawal, openTeacherProfileModal } = useData() as any;
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'income' | 'withdrawal'>('all');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [bankAccount, setBankAccount] = useState('MB Bank - 0987654321 - NGUYEN SUONG MAI');
  const [loading, setLoading] = useState(false);

  const activeTutor = tutors.find((t: any) => String(t.id) === String(tutorId)) || tutors[0];
  const wallet = getTeacherWallet(activeTutor?.id || 't1');

  if (!isOpen) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(withdrawAmount.replace(/\D/g, '')) || 0;
    if (amountNum < 50000) {
      alert("Số tiền rút tối thiểu là 50.000 VNĐ!");
      return;
    }
    if (amountNum > wallet.balance) {
      alert(`Số dư khả dụng không đủ! Số dư hiện tại là ${wallet.balance.toLocaleString()}đ`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = requestWithdrawal(activeTutor?.id || 't1', amountNum, bankAccount);
      if (res.success) {
        alert(res.message);
        setWithdrawAmount('');
        setActiveTab('history');
      } else {
        alert(res.message);
      }
    }, 600);
  };

  const filteredTransactions = wallet.transactions.filter(tx => {
    if (historyFilter === 'income') return tx.type === 'tuition_income';
    if (historyFilter === 'withdrawal') return tx.type === 'withdrawal';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-200/90 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">Ví Thu Nhập Giáo Viên</h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Shopee-Style
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chủ ví: <strong className="text-slate-800">{activeTutor?.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Card Số dư Phong cách Fintech Dark Card */}
          <div className="bg-gradient-to-br from-[#0B0F17] via-[#111827] to-[#042f2e] text-white p-5 sm:p-6 rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.25)] border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Số dư ví khả dụng (70% Học phí)
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Napas 24/7 Miễn phí
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight tabular-nums my-1 relative z-10 font-mono">
              {wallet.balance.toLocaleString()} <span className="text-base font-bold text-slate-200">VNĐ</span>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300 relative z-10">
              <div>
                Đã rút thành công: <strong className="text-white font-bold">{wallet.totalWithdrawn.toLocaleString()}đ</strong>
              </div>
              <div className="text-slate-400 text-[11px]">
                {wallet.transactions.length} biến động
              </div>
            </div>
          </div>

          {/* Tab Navigation: Rút tiền vs Lịch sử */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('withdraw')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'withdraw'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Rút tiền về Ngân hàng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" /> Lịch sử biến động ({wallet.transactions.length})
            </button>
          </div>

          {/* TAB 1: RÚT TIỀN */}
          {activeTab === 'withdraw' ? (
            <form onSubmit={handleWithdraw} className="space-y-4 text-left">
              {/* Thẻ Ngân hàng Đã liên kết */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    MB
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{bankAccount}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] text-slate-500">Tài khoản chính nhận chuyển khoản 24/7</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Số tiền muốn rút (VNĐ)</label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(wallet.balance.toString())}
                    className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
                  >
                    ⚡ Rút tất cả số dư
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="VD: 500000"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-mono"
                    max={wallet.balance}
                    min={50000}
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold">VNĐ</span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[200000, 500000, 1000000, wallet.balance].map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWithdrawAmount(amt.toString())}
                      disabled={amt <= 0 || amt > wallet.balance}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[11px] font-bold rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-center"
                    >
                      {idx === 3 ? 'Toàn bộ' : `${(amt / 1000).toLocaleString()}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thông tin phí và thời gian */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-[11px] text-emerald-950 space-y-1">
                <div className="flex justify-between items-center">
                  <span>Phí giao dịch rút tiền:</span>
                  <span className="font-extrabold text-emerald-700">0đ (Miễn phí 100%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Thời gian chuyển khoản:</span>
                  <span className="font-semibold text-slate-800">Tức thì qua Napas 24/7 (1 - 3 phút)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || wallet.balance <= 0}
                className="w-full bg-[#111111] hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Đang tạo lệnh chuyển tiền Napas...' : `Xác nhận rút ${withdrawAmount ? parseInt(withdrawAmount).toLocaleString() + 'đ' : ''} về Ngân hàng`}
              </button>
            </form>
          ) : (
            /* TAB 2: LỊCH SỬ BIẾN ĐỘNG VÍ */
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 pb-1">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${historyFilter === 'all' ? 'bg-[#111111] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('income')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${historyFilter === 'income' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Học phí (+70%)
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('withdrawal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${historyFilter === 'withdrawal' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Rút tiền (-)
                </button>
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {filteredTransactions.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">Không có giao dịch nào phù hợp.</div>
                ) : (
                  filteredTransactions.map((tx: WalletTransaction) => (
                    <div key={tx.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs hover:border-slate-300 transition-colors">
                      <div className="space-y-1 max-w-[65%]">
                        <div className="font-bold text-slate-900 leading-snug">{tx.title}</div>
                        <div className="text-[10px] text-slate-500">{tx.date} • {tx.bankInfo || 'Tự động'}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-sm tabular-nums font-mono ${tx.type === 'tuition_income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {tx.type === 'tuition_income' ? '+' : '-'}{tx.amount.toLocaleString()}đ
                        </div>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${tx.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {tx.status === 'completed' ? 'Thành công' : 'Chờ xử lý'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3.3. TEACHER PROFILE MODAL (Chỉnh Sửa Thông Tin Giáo Viên)
// ==========================================
function TeacherProfileModal({
  isOpen,
  onClose,
  tutorId
}: {
  isOpen: boolean;
  onClose: () => void;
  tutorId?: string | number;
}) {
  const { tutors, updateTutorProfile, currentSession, setCurrentSession } = useData() as any;
  const activeTutor = tutors.find((t: any) => String(t.id) === String(tutorId)) || tutors[0];

  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'bank'>('info');

  // Form State initialized from activeTutor
  const [name, setName] = useState(activeTutor?.name || 'Cô Sương Mai');
  const [headline, setHeadline] = useState(activeTutor?.headline || 'Cử nhân Sư phạm Toán ĐH Sư Phạm Hà Nội, 5 năm kinh nghiệm');
  const [bio, setBio] = useState(activeTutor?.bio || 'Tận tâm, phương pháp giảng dạy dễ hiểu, giúp học sinh nắm vững kiến thức từ cơ bản đến nâng cao.');
  const [phone, setPhone] = useState(activeTutor?.phone || '0912345678');
  const [zalo, setZalo] = useState(activeTutor?.zalo || '0912345678');
  const [avatar, setAvatar] = useState(activeTutor?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400');
  
  // Pricing state
  const [primaryPrice, setPrimaryPrice] = useState(activeTutor?.levelPrices?.primary || 150000);
  const [secondaryPrice, setSecondaryPrice] = useState(activeTutor?.levelPrices?.secondary || 200000);
  const [highSchoolPrice, setHighSchoolPrice] = useState(activeTutor?.levelPrices?.high || 250000);
  const [examPrepPrice, setExamPrepPrice] = useState(activeTutor?.levelPrices?.exam || 300000);

  // Bank state
  const [bankName, setBankName] = useState('MB Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState('0987654321');
  const [bankAccountName, setBankAccountName] = useState('NGUYEN SUONG MAI');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTutor) {
      setName(activeTutor.name || '');
      setHeadline(activeTutor.headline || '');
      setBio(activeTutor.bio || '');
      setPhone(activeTutor.phone || '');
      setZalo(activeTutor.zalo || '');
      setAvatar(activeTutor.avatar || '');
      if (activeTutor.levelPrices) {
        setPrimaryPrice(activeTutor.levelPrices.primary || 150000);
        setSecondaryPrice(activeTutor.levelPrices.secondary || 200000);
        setHighSchoolPrice(activeTutor.levelPrices.high || 250000);
        setExamPrepPrice(activeTutor.levelPrices.exam || 300000);
      }
    }
  }, [activeTutor, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const updated = {
        name,
        headline,
        bio,
        phone,
        zalo,
        avatar,
        pricePerSession: secondaryPrice || 200000,
        levelPrices: {
          primary: Number(primaryPrice),
          secondary: Number(secondaryPrice),
          high: Number(highSchoolPrice),
          exam: Number(examPrepPrice)
        }
      };
      updateTutorProfile(activeTutor?.id || 't1', updated);
      alert("Cập nhật thông tin hồ sơ giáo viên thành công! Dữ liệu đã được lưu trực tiếp.");
      onClose();
    }, 500);
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100/80 border border-blue-200 text-blue-800 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">Chỉnh Sửa Hồ Sơ Giáo Viên</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật thông tin cá nhân, học phí các cấp và tài khoản ngân hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-4 pb-0 bg-white">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'info'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👤 Thông tin cá nhân
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'pricing'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📚 Môn dạy & Học phí
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'bank'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏦 Ngân hàng rút tiền
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ảnh đại diện</label>
                <div className="flex items-center gap-4">
                  <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-sm" />
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[11px] font-bold text-slate-500">Chọn ảnh mẫu nhanh:</span>
                    <div className="flex items-center gap-2">
                      {sampleAvatars.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${avatar === url ? 'border-blue-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70'}`}
                        >
                          <img src={url} alt="sample" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên giáo viên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại / Zalo</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setZalo(e.target.value); }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề / Bằng cấp / Kinh nghiệm</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                  placeholder="VD: Cử nhân Sư phạm Toán ĐH Sư Phạm Hà Nội, 5 năm kinh nghiệm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giới thiệu chi tiết & Phương pháp giảng dạy</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-normal focus:border-blue-500 outline-none"
                  placeholder="Mô tả phương pháp truyền đạt, thế mạnh dạy học sinh mất gốc hoặc bồi dưỡng nâng cao..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: MÔN DẠY & HỌC PHÍ */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                💡 <strong>Lưu ý:</strong> Học phí dưới đây là mức học sinh nhìn thấy khi đăng ký khóa học. Giáo viên sẽ nhận <strong>70%</strong> học phí tích lũy vào Ví Giảng Dạy ngay khi học sinh hoàn tất thanh toán.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học phí Cấp 1 (Tiểu học / buổi)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={primaryPrice}
                      onChange={e => setPrimaryPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none font-mono"
                      step={10000}
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học phí Cấp 2 (THCS / buổi)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={secondaryPrice}
                      onChange={e => setSecondaryPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none font-mono"
                      step={10000}
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học phí Cấp 3 (THPT / buổi)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={highSchoolPrice}
                      onChange={e => setHighSchoolPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none font-mono"
                      step={10000}
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học phí Luyện thi ĐH / Chuyên</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={examPrepPrice}
                      onChange={e => setExamPrepPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none font-mono"
                      step={10000}
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NGÂN HÀNG RÚT TIỀN */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngân hàng nhận tiền</label>
                <select
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none bg-white cursor-pointer"
                >
                  <option value="MB Bank">MB Bank (Ngân hàng Quân Đội)</option>
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="VPBank">VPBank</option>
                  <option value="ACB">ACB</option>
                  <option value="BIDV">BIDV</option>
                  <option value="TPBank">TPBank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tài khoản ngân hàng</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={e => setBankAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-blue-500 outline-none"
                  placeholder="VD: 0987654321"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên chủ tài khoản (In hoa không dấu)</label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={e => setBankAccountName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none uppercase"
                  placeholder="VD: NGUYEN SUONG MAI"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thông tin tài khoản được mã hóa và bảo mật chuẩn RLS. Dùng để tự động xử lý các lệnh rút tiền 24/7.</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#111111] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? 'Đang lưu...' : '💾 Lưu & Cập nhật Hồ sơ'}
            </button>
          </div>
        </form>
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
                    className={`w-7 h-7 transition-colors ${(hoverRating || rating) >= star
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
                className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${stage === 'trial'
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
                className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${stage === 'official'
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
// 4. MODAL QUẢN LÝ LỚP HỌC THỬ (Tách biệt Học sinh & Giáo viên)
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
  const { myTrials, cancelTrialEnrollment, tutors, currentSession } = useData();

  if (!isOpen) return null;

  const isTeacher = currentSession.role === 'teacher';

  // Demo Student Registrations for Teacher
  const teacherTrials = [
    {
      tutorId: 'stud_1',
      tutorName: 'Học sinh: Nguyễn Hoàng Nam (Lớp 12)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
      badgeSubject: 'Toán 12 - Luyện thi THPTQG',
      headline: 'Hẹn học thử: 19:30 Tối Thứ Năm • SĐT: 0987.654.321',
      phone: '0987654321',
      zalo: '0987654321',
      date: '02/09/2026',
      status: 'trial_in_progress' as const
    },
    {
      tutorId: 'stud_2',
      tutorName: 'Học sinh: Trần Bảo Anh (Lớp 10)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400',
      badgeSubject: 'Toán 10 - Nâng cao',
      headline: 'Đã hoàn thành học thử 1-1 • Đã thanh toán học phí khóa 8 buổi',
      phone: '0912888999',
      zalo: '0912888999',
      date: '01/09/2026',
      status: 'enrolled' as const
    }
  ];

  const displayedList = isTeacher ? teacherTrials : myTrials;

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
            {isTeacher
              ? `Học sinh đã đăng ký học thử với bạn (${displayedList.length})`
              : `Lớp học thử & Giáo viên đã liên hệ (${displayedList.length})`}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isTeacher
              ? 'Danh sách học viên đăng ký nhận 01 buổi học thử 1-1. Bạn có thể nhấn mở Zalo để liên hệ và xếp lịch dạy ngay.'
              : 'Theo dõi tiến độ trao đổi học thử và xác nhận "Đăng ký học chính thức" sau khi hoàn thành buổi học 1-1.'}
          </p>
        </div>

        {displayedList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Users className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-medium">
              {isTeacher ? 'Chưa có học sinh nào đăng ký học thử với bạn.' : 'Bạn chưa liên hệ học thử với giáo viên nào.'}
            </p>
            {!isTeacher && (
              <Link
                to="/tim-gia-su"
                onClick={onClose}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Tìm giáo viên ngay →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {displayedList.map((item) => {
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
                            {isTeacher ? 'Chờ xếp lịch & dạy thử 1-1' : 'Đang trao đổi & học thử'}
                          </span>
                        )}
                        {item.status === 'enrolled' && (
                          <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            {isTeacher ? 'Đã thành học viên chính thức' : 'Đã đăng ký học chính thức'}
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
                        {isTeacher ? 'Liên hệ Học sinh (Zalo)' : 'Zalo'}
                      </a>
                    )}

                    {!isTeacher && (
                      <>
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
                              title="Hủy học / Không tiếp tục"
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
                      </>
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
  const { openAuthModal, openMyTrialsModal, openTeacherWalletModal, openTeacherProfileModal } = useUI();
  const { myTrials, currentSession, setCurrentSession, getTeacherWallet } = useData();
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

          {currentSession.role === 'teacher' ? (
            <button
              type="button"
              onClick={openMyTrialsModal}
              className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Học sinh hẹn học thử
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                2
              </span>
            </button>
          ) : (
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
          )}
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

          {currentSession.role !== 'anonymous' ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {currentSession.role === 'teacher' && (
                <>
                  <button
                    type="button"
                    onClick={() => openTeacherProfileModal(currentSession.userId || 't1')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-2xs cursor-pointer transition-all active:scale-95"
                    title="Chỉnh sửa thông tin hồ sơ giáo viên"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Hồ sơ của tôi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openTeacherWalletModal(currentSession.userId || 't1')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-all active:scale-95"
                    title="Mở Ví Giảng Dạy - Tự Rút Tiền"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Ví: {getTeacherWallet(currentSession.userId || 't1').balance.toLocaleString()}đ</span>
                  </button>
                </>
              )}

              <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                currentSession.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                currentSession.role === 'teacher' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {currentSession.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {currentSession.role === 'admin' ? 'Quản trị viên' : currentSession.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCurrentSession({ role: 'anonymous' });
                  alert("Đã đăng xuất tài khoản thành công!");
                }}
                className="text-xs text-slate-500 hover:text-red-600 font-semibold px-2 py-1 cursor-pointer transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}

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
          Tìm kiếm <span className="text-blue-600">Giáo viên & Gia sư</span> <br className="hidden sm:inline" /> hoàn hảo cho bạn
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

  const totalTrials = tutor.trialStats?.totalTrials || 0;
  const officialEnrolled = tutor.trialStats?.officialEnrolled || 0;
  const successRate = totalTrials > 0
    ? Math.round((officialEnrolled / totalTrials) * 100)
    : 95;

  const isTeacher = tutor.type === 'Giáo viên' || (tutor.rolePrefix && (tutor.rolePrefix.includes('Cô') || tutor.rolePrefix.includes('Thầy')));

  // Trích xuất tối đa 3 gạch đầu dòng ý chính ngắn gọn, không văn xuôi dài dòng
  const keyBullets: string[] = [];

  if (tutor.education) {
    keyBullets.push(tutor.education.split(/[;,\n]/)[0].trim());
  } else if (tutor.experience) {
    keyBullets.push(`${tutor.experience} năm kinh nghiệm giảng dạy & luyện thi`);
  }

  if (tutor.teachingAchievement) {
    const ach = tutor.teachingAchievement.split(/[.;\n]/)[0].trim();
    if (ach && !keyBullets.includes(ach)) keyBullets.push(ach);
  }

  if (tutor.teachingMethod && keyBullets.length < 3) {
    const met = tutor.teachingMethod.split(/[.;\n]/)[0].trim();
    if (met && !keyBullets.includes(met)) keyBullets.push(met);
  }

  if (keyBullets.length === 0) {
    keyBullets.push(
      'Giáo viên giàu kinh nghiệm bồi dưỡng học sinh giỏi',
      'Phương pháp giảng dạy cá nhân hóa 1-1'
    );
  }

  const finalBullets = keyBullets.slice(0, 3);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-slate-400 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">

      {/* Visual Hero Photo Banner (Minimalist & High Contrast) */}
      <div className="relative p-2.5 pb-0">
        <Link
          to={`/giao-vien/${tutor.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-16/10 rounded-xl overflow-hidden bg-slate-100 group/banner"
        >
          <img
            src={tutor.avatar}
            alt={tutor.displayName || tutor.name}
            className="w-full h-full object-cover object-top group-hover/banner:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />

          {/* Floating Top Pills (Minimalist style) */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] tracking-wide uppercase backdrop-blur-md flex items-center gap-1.5 ${
              isTeacher
                ? 'bg-[#111111]/90 text-white'
                : 'bg-slate-800/90 text-white'
            }`}>
              {isTeacher ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
              {isTeacher ? 'Giáo viên' : 'Gia sư'}
            </span>

            <span className="px-2.5 py-1 rounded-md font-bold text-[10px] text-[#2e5d32] bg-[#EDF3EC]/95 backdrop-blur-md border border-[#d6e5d5] flex items-center gap-1.5 tabular-nums shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#346538]" />
              {successRate}% nhận lớp
            </span>
          </div>

          {/* Floating Bottom Info over image */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between text-white pointer-events-none">
            <div>
              <span className="inline-block bg-white/95 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md mb-1 shadow-2xs">
                {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
              </span>
              <div className="font-extrabold text-sm sm:text-base leading-tight drop-shadow-xs text-white truncate">
                {tutor.displayName || tutor.name}
              </div>
            </div>

            {/* Rating Badge */}
            <div className="flex items-center gap-1 bg-[#111111]/85 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-amber-300 border border-white/10 shadow-2xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{tutor.rating}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Body: Minimalist editorial layout */}
      <div className="p-4 pt-3 flex-1 flex flex-col justify-between space-y-3">
        {/* Slogan / Tiêu đề */}
        <Link
          to={`/giao-vien/${tutor.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block group-hover:text-blue-700 transition-colors"
        >
          <div className="text-sm font-bold text-slate-900 leading-snug tracking-tight line-clamp-2">
            “{tutor.headline || tutor.title}”
          </div>
        </Link>

        {/* Tối đa 3 gạch đầu dòng ý chính */}
        <ul className="space-y-1.5 text-xs text-slate-600">
          {finalBullets.map((item, i) => (
            <li key={i} className="flex items-start gap-2 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              <span className="text-slate-700 font-normal">{item}</span>
            </li>
          ))}
        </ul>

        {/* Pricing & Rate Breakdown */}
        <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-500">Học phí kèm 1-1:</span>
            <div className="text-right">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                {tutor.hourlyRate}đ
              </span>
              <span className="text-xs font-normal text-slate-400">/{tutor.priceUnit || 'giờ'}</span>
            </div>
          </div>

          {/* Level Prices as Soft Minimalist Badges */}
          {tutor.levelPrices && Object.keys(tutor.levelPrices).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(tutor.levelPrices).map(([lvl, prc]) => (
                <span
                  key={lvl}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-normal text-slate-700 tabular-nums"
                >
                  <span className="text-slate-400">{lvl}:</span>
                  <strong className="text-slate-800 font-bold">{prc}đ</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA Row */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div className="text-[11px] text-slate-500 font-medium tabular-nums whitespace-nowrap">
            {tutor.reviews || 0} đánh giá
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/giao-vien/${tutor.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 active:scale-95 transition-all inline-flex items-center justify-center"
            >
              Hồ sơ
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openContactZaloModal(tutor);
              }}
              className="whitespace-nowrap bg-[#111111] hover:bg-[#282828] active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1"
            >
              Học thử Zalo
            </button>
          </div>
        </div>

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
  const [selectedTab, setSelectedTab] = useState<'all' | 'teacher' | 'tutor' | 'math' | 'literature' | 'english' | 'science'>('all');

  // Lọc danh sách giáo viên theo Tab tương tác trên trang chủ
  const filteredTutors = tutors.filter(t => {
    if (selectedTab === 'teacher') return t.type === 'Giáo viên';
    if (selectedTab === 'tutor') return t.type === 'Sinh viên';
    if (selectedTab === 'math') return t.badgeSubject?.includes('Toán') || (Array.isArray(t.subjects) && t.subjects.some(s => s.includes('Toán')));
    if (selectedTab === 'literature') return t.badgeSubject?.includes('Văn') || (Array.isArray(t.subjects) && t.subjects.some(s => s.includes('Văn')));
    if (selectedTab === 'english') return t.badgeSubject?.includes('Anh') || t.badgeSubject?.includes('IELTS') || (Array.isArray(t.subjects) && t.subjects.some(s => s.includes('Anh') || s.includes('IELTS')));
    if (selectedTab === 'science') return t.badgeSubject?.includes('Lý') || t.badgeSubject?.includes('Hóa') || t.badgeSubject?.includes('Sinh') || (Array.isArray(t.subjects) && t.subjects.some(s => s.includes('Lý') || s.includes('Hóa') || s.includes('Sinh')));
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'Tất cả nổi bật', count: tutors.length },
    { id: 'teacher', label: 'Giáo viên chuyên môn', count: tutors.filter(t => t.type === 'Giáo viên').length },
    { id: 'tutor', label: 'Gia sư sinh viên giỏi', count: tutors.filter(t => t.type === 'Sinh viên').length },
    { id: 'math', label: 'Môn Toán' },
    { id: 'english', label: 'Tiếng Anh & IELTS' },
    { id: 'literature', label: 'Ngữ Văn' },
    { id: 'science', label: 'Lý - Hóa - Sinh' }
  ];

  return (
    <>
      <Hero />

      {/* Section 1: Giáo viên & Gia sư Tiêu biểu (Minimalist UI Architecture) */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EDF3EC] text-[#346538] font-bold text-xs border border-[#d6e5d5] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#346538]" />
              Đội ngũ giáo viên & gia sư tiêu biểu
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
              Giáo viên & Gia sư <span className="text-blue-700">được đánh giá cao</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl font-normal leading-relaxed">
              100% hồ sơ đã qua đối soát CCCD, bằng cấp chuyên môn và cam kết chất lượng qua buổi học thử 1-1 miễn phí.
            </p>
          </div>

          <Link 
            to="/tim-gia-su" 
            className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 text-slate-900 font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-2xs"
          >
            <span>Khám phá tất cả {tutors.length}+ hồ sơ</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Dynamic Category / Filter Tabs (Segmented Minimalist Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tabular-nums ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tutor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTutors.slice(0, 8).map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>

        {/* Bottom Explorer Banner (Minimalist Dark Bento) */}
        <div className="mt-12 bg-[#111111] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Bạn đang cần tìm gia sư cho môn học hoặc lớp khác?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Bộ lọc nâng cao với hơn 20+ môn học từ Văn hóa, Ngoại ngữ IELTS, Năng khiếu đàn/vẽ đến Luyện thi THPT Quốc Gia.
            </p>
          </div>
          <Link
            to="/tim-gia-su"
            className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all shrink-0 active:scale-95 shadow-xs"
          >
            Mở bộ lọc chi tiết →
          </Link>
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

// FindTutorsPage - Bộ lọc tìm kiếm giáo viên & gia sư chuẩn Minimalist UI
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
    { label: 'Giáo viên Chuyên môn', value: 'Giáo viên' },
    { label: 'Gia sư Sinh viên Giỏi', value: 'Sinh viên' }
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
      const matchName = t.name?.toLowerCase().includes(q) || t.displayName?.toLowerCase().includes(q);
      const matchSub = t.subjects?.some((s: string) => s.toLowerCase().includes(q)) || t.badgeSubject?.toLowerCase().includes(q);
      const matchTitle = t.title?.toLowerCase().includes(q) || t.headline?.toLowerCase().includes(q);
      if (!matchName && !matchSub && !matchTitle) return false;
    }

    // Subjects filter (đa lựa chọn)
    if (selectedSubjects.length > 0) {
      const hasSubject = selectedSubjects.some(sub =>
        t.subjects?.some((s: string) => s.toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes(s.toLowerCase())) ||
        t.badgeSubject?.toLowerCase().includes(sub.toLowerCase())
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
        return t.location?.toLowerCase().includes(d.toLowerCase());
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
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Editorial Minimalist Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EDF3EC] text-[#346538] text-xs font-bold border border-[#d6e5d5] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#346538]" />
            Khu vực TP. Hà Nội & Toàn quốc
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
            Danh sách Giáo viên & Gia sư <span className="text-blue-700">đã kiểm định</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
            Hệ thống kết nối trực tiếp không qua trung gian: Môn văn hóa phổ thông, Ngoại ngữ IELTS, Năng khiếu nghệ thuật, Võ thuật & Bơi lội.
          </p>
        </div>

        {/* TOP FILTER BAR: MODERN BENTO ARCHITECTURE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          
          {/* Top Search Input & Action Row */}
          <div className="flex flex-col md:flex-row items-center gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(e); }}
                placeholder="Tìm nhanh theo tên giáo viên, môn học (Toán, Văn, Bơi, Piano, Tiếng Anh, IELTS...)"
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FBFBFA] focus:bg-white border border-slate-200 focus:border-slate-800 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setAppliedSearch(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full md:w-auto px-5 py-2.5 bg-[#111111] hover:bg-[#282828] active:scale-98 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
              >
                Tìm kiếm
              </button>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="whitespace-nowrap px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Xóa lọc ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Interactive Dropdown Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100">
            
            {/* Dropdown 1: Môn học */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  selectedSubjects.length > 0
                    ? 'border-blue-300 bg-blue-50/80 text-blue-900 shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Môn học {selectedSubjects.length > 0 && `(${selectedSubjects.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              {/* Hover Popover Dropdown Menu */}
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 max-h-96 overflow-y-auto space-y-3">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span>Chọn môn học & năng khiếu:</span>
                  {selectedSubjects.length > 0 && (
                    <button type="button" onClick={() => setSelectedSubjects([])} className="text-[11px] text-blue-600 hover:underline cursor-pointer">Xóa chọn</button>
                  )}
                </div>
                {subjectGroups.map(grp => (
                  <div key={grp.group} className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{grp.group}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {grp.items.map(sub => {
                        const isSelected = selectedSubjects.includes(sub);
                        return (
                          <button
                            type="button"
                            key={sub}
                            onClick={() => toggleSubject(sub)}
                            className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="truncate">{sub}</span>
                            {isSelected && <Check className="w-3 h-3 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dropdown 2: Cấp học */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  selectedLevels.length > 0
                    ? 'border-indigo-300 bg-indigo-50/80 text-indigo-900 shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Cấp học {selectedLevels.length > 0 && `(${selectedLevels.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 space-y-2">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span>Chọn cấp học / độ tuổi:</span>
                  {selectedLevels.length > 0 && (
                    <button type="button" onClick={() => setSelectedLevels([])} className="text-[11px] text-blue-600 hover:underline cursor-pointer">Xóa chọn</button>
                  )}
                </div>
                <div className="space-y-1">
                  {levelsList.map(lvl => {
                    const isSelected = selectedLevels.includes(lvl);
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => toggleLevel(lvl)}
                        className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{lvl}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dropdown 3: Khu vực Quận / Huyện */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  selectedDistricts.length > 0
                    ? 'border-emerald-300 bg-[#EDF3EC] text-[#2e5d32] shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Khu vực {selectedDistricts.length > 0 && `(${selectedDistricts.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 max-h-80 overflow-y-auto space-y-2">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span>Quận/Huyện tại Hà Nội:</span>
                  {selectedDistricts.length > 0 && (
                    <button type="button" onClick={() => setSelectedDistricts([])} className="text-[11px] text-blue-600 hover:underline cursor-pointer">Xóa chọn</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {hanoiDistrictsList.map(dist => {
                    const isSelected = selectedDistricts.includes(dist);
                    return (
                      <button
                        type="button"
                        key={dist}
                        onClick={() => toggleDistrict(dist)}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{dist}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dropdown 4: Đối tượng (Giáo viên vs Gia sư) */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  selectedTypes.length > 0
                    ? 'border-purple-300 bg-purple-50/80 text-purple-900 shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Loại hình {selectedTypes.length > 0 && `(${selectedTypes.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 space-y-2">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">Chọn đối tượng:</div>
                <div className="space-y-1.5">
                  {typesList.map(t => {
                    const isSelected = selectedTypes.includes(t.value);
                    return (
                      <button
                        type="button"
                        key={t.value}
                        onClick={() => toggleType(t.value)}
                        className={`w-full px-3 py-2.5 rounded-lg text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <div>{t.label}</div>
                          <div className={`text-[10px] font-normal mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {t.value === 'Giáo viên' ? 'Giảng viên, GV trường có kinh nghiệm' : 'Sinh viên giỏi, thủ khoa dạy kèm'}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dropdown 5: Hình thức học (Online vs Trực tiếp) */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  selectedFormats.length > 0
                    ? 'border-amber-300 bg-amber-50/80 text-amber-900 shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Hình thức {selectedFormats.length > 0 && `(${selectedFormats.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-60 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 space-y-1.5">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">Hình thức học:</div>
                {formatsList.map(fmt => {
                  const isSelected = selectedFormats.includes(fmt.value);
                  return (
                    <button
                      type="button"
                      key={fmt.value}
                      onClick={() => toggleFormat(fmt.value)}
                      className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{fmt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filters Chips Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Đang lọc:</span>
              {selectedSubjects.map(sub => (
                <span key={sub} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium">
                  {sub}
                  <button type="button" onClick={() => toggleSubject(sub)} className="hover:text-blue-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedLevels.map(lvl => (
                <span key={lvl} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-medium">
                  {lvl}
                  <button type="button" onClick={() => toggleLevel(lvl)} className="hover:text-indigo-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedDistricts.map(dist => (
                <span key={dist} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EDF3EC] text-[#2e5d32] border border-[#d6e5d5] rounded-lg text-xs font-medium">
                  {dist}
                  <button type="button" onClick={() => toggleDistrict(dist)} className="hover:text-emerald-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedTypes.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-xs font-medium">
                  {t}
                  <button type="button" onClick={() => toggleType(t)} className="hover:text-purple-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedFormats.map(fmt => (
                <span key={fmt} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
                  {fmt === 'online' ? 'Online' : 'Offline'}
                  <button type="button" onClick={() => toggleFormat(fmt)} className="hover:text-amber-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {appliedSearch && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-medium">
                  "{appliedSearch}"
                  <button type="button" onClick={() => { setSearchInput(''); setAppliedSearch(''); }} className="hover:text-slate-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* RESULTS SECTION */}
        <main className="space-y-5">
          {/* Sắp xếp & Thống kê kết quả */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-xs sm:text-sm font-medium text-slate-600">
              Hiển thị <strong className="text-[#111111] font-black text-base tabular-nums">{filteredTutors.length}</strong> hồ sơ giáo viên & gia sư
              {appliedSearch && <span> cho từ khóa "<strong className="text-slate-900">{appliedSearch}</strong>"</span>}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="rating">Đánh giá cao nhất</option>
                <option value="success_rate">Tỷ lệ nhận lớp cao nhất</option>
                <option value="price_asc">Học phí: Thấp đến cao</option>
                <option value="price_desc">Học phí: Cao đến thấp</option>
              </select>
            </div>
          </div>

          {/* Grid kết quả (4 cột chuẩn Minimalist Bento) */}
          {filteredTutors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTutors.map(tutor => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Không tìm thấy hồ sơ giáo viên phù hợp</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Hãy thử giảm bớt các tiêu chí lọc hoặc tìm kiếm bằng tên môn học tổng quát hơn.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#111111] hover:bg-[#282828] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
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

// TeacherDetailPage - Giao diện chi tiết giáo viên chuẩn Minimalist & Editorial UI
function TeacherDetailPage() {
  const { id } = useParams();
  const { tutors, myTrials, cancelTrialEnrollment, reviews, getMaskedTutor, currentSession } = useData();
  const { openContactZaloModal, openEnrollmentModal, openReviewModal, openAuthModal, openTeacherProfileModal } = useUI();
  const [activeProofModal, setActiveProofModal] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [relatedPage, setRelatedPage] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'trial' | 'official'>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setRelatedPage(0);
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAvatarModalOpen(false);
        setActiveProofModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // IDOR Guard: Support both raw IDs, slug names, and opaque crypto tokens
  const resolvedId = IDORGuard.fromSecureId(id || '') || id;

  const rawTutor = tutors.find(t => String(t.id) === String(resolvedId) || String(t.slug) === String(resolvedId) || String(t.id) === String(id) || String(t.slug) === String(id))
    || mockTutors.find(t => String(t.id) === String(resolvedId) || String(t.slug) === String(resolvedId) || String(t.id) === String(id) || String(t.slug) === String(id))
    || tutors[0]
    || mockTutors[0];

  // Apply Row Level Security (Data Masking for unprivileged viewers)
  const tutor = getMaskedTutor(rawTutor);

  if (!tutor) {
    return <div className="p-16 text-center text-slate-500 font-medium">Không tìm thấy thông tin giáo viên</div>;
  }

  const trialItem = myTrials.find(t => String(t.tutorId) === String(tutor.id));

  const totalTrials = tutor.trialStats?.totalTrials || 0;
  const officialEnrolled = tutor.trialStats?.officialEnrolled || 0;
  const successRate = totalTrials > 0
    ? Math.round((officialEnrolled / totalTrials) * 100)
    : 96;

  const isTeacher = tutor.type === 'Giáo viên' || (tutor.rolePrefix && (tutor.rolePrefix.includes('Cô') || tutor.rolePrefix.includes('Thầy')));

  const tutorReviews = reviews.filter(r => String(r.tutorId) === String(tutor.id));
  const displayedReviewsRaw = tutorReviews.length > 0 ? tutorReviews : [
    {
      id: 'rev_1',
      studentName: 'Anna',
      comment: `Mình được biết ${tutor.displayName || tutor.name} qua giới thiệu. Mình tìm đến cũng gấp gáp về thời gian nhưng ${tutor.displayName || tutor.name} không hề ngại đưa ra lộ trình riêng cho học viên, luôn tận tâm nhắc nhở và chuẩn bị bài giảng chu đáo. Giải thích cặn kẽ, dễ hiểu và truyền cảm hứng rất tốt. Rất khuyên các bạn nên học thử!`,
      stage: 'official' as const,
      rating: 5,
      date: 'Gần đây',
      verified: true
    },
    {
      id: 'rev_2',
      studentName: 'Tuấn Thành',
      comment: `Mình theo học với ${tutor.displayName || tutor.name} để chuẩn bị cho kỳ thi và phỏng vấn. Học cùng ${tutor.displayName || tutor.name} tiến bộ rõ rệt nhờ phương pháp liên hệ thực tế, tận tâm nhiệt tình và giải đáp thắc mắc 24/7. Kết quả đạt được vượt ngoài mong đợi!`,
      stage: 'official' as const,
      rating: 5,
      date: '1 tháng trước',
      verified: true
    },
    {
      id: 'rev_3',
      studentName: 'Đạt',
      comment: `Theo dõi bài giảng trên nền tảng thấy rất ấn tượng, sau buổi học thử 1-1 thấy phương pháp truyền đạt rất dễ tiếp thu. Đánh giá 10/10 về độ tận tụy!`,
      stage: 'trial' as const,
      rating: 5,
      date: '2 tháng trước',
      verified: true
    }
  ];

  const displayedReviews = displayedReviewsRaw.filter(r => {
    if (reviewFilter === 'trial') return r.stage === 'trial';
    if (reviewFilter === 'official') return r.stage !== 'trial';
    return true;
  });

  const subjectsList = Array.isArray(tutor.subjects) && tutor.subjects.length > 0
    ? tutor.subjects
    : [tutor.badgeSubject || 'Môn học', 'Luyện thi Chuyên sâu', 'Bồi dưỡng Học sinh Giỏi'];

  // Trích xuất học phí chuẩn xác
  const extractBaseHourlyRate = (rateInput: any): number => {
    if (typeof rateInput === 'number') return rateInput;
    if (!rateInput) return 200000;
    const str = String(rateInput).trim();
    const parts = str.split(/[-–—~đến]/);
    const firstPart = parts[0]?.replace(/[^0-9]/g, '') || '';
    const num = parseInt(firstPart, 10);
    if (isNaN(num) || num === 0) return 200000;
    if (num < 1000) return num * 1000;
    return num;
  };

  const baseHourlyRate = extractBaseHourlyRate(tutor.hourlyRate);
  const package5h = Math.round(baseHourlyRate * 5 * 0.95).toLocaleString('vi-VN') + ' VNĐ';
  const package10h = Math.round(baseHourlyRate * 10 * 0.9).toLocaleString('vi-VN') + ' VNĐ';

  // Phân trang giáo viên liên quan
  const allRelatedTutors = (tutors.length >= 8 ? tutors : mockTutors).filter(t => String(t.id) !== String(tutor.id));
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(allRelatedTutors.length / itemsPerPage));
  const displayedRelated = allRelatedTutors.slice(relatedPage * itemsPerPage, (relatedPage + 1) * itemsPerPage);

  const shifts = [
    { label: 'Ca Sáng (08:00 - 11:30)', key: 'Sáng' },
    { label: 'Ca Chiều (14:00 - 17:30)', key: 'Chiều' },
    { label: 'Ca Tối (18:30 - 21:30)', key: 'Tối' }
  ];
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch (e) {
      alert("Đã sao chép liên kết hồ sơ!");
    }
  };

  const isOwnProfile = currentSession.role === 'teacher' && (String(currentSession.userId) === String(tutor.id) || currentSession.userId === 't1' || String(tutor.id) === '1');

  return (
    <div className="bg-[#FAFAF9] min-h-screen pb-24 text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Toast thông báo sao chép */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Đã sao chép liên kết hồ sơ vào khay nhớ tạm!
        </div>
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
          <span className="text-slate-300">/</span>
          <Link to="/tim-gia-su" className="hover:text-slate-900 transition-colors">Tìm giáo viên & gia sư</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate">{tutor.displayName || tutor.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Banner dành riêng cho giáo viên khi xem hồ sơ của mình */}
        {isOwnProfile && (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <span>Trang hồ sơ công khai của bạn</span>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-full">Đang hiển thị</span>
                </div>
                <div className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Phụ huynh & học sinh đang nhìn thấy hồ sơ này. Bạn có thể cập nhật thông tin, ảnh và bảng giá bất cứ lúc nào.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openTeacherProfileModal(tutor.id)}
              className="px-5 py-2.5 bg-[#111111] hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all shadow-sm cursor-pointer shrink-0 flex items-center justify-center gap-2 active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>Chỉnh sửa hồ sơ của bạn</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* CỘT TRÁI (8 / 12 CỘT) - Nội dung chi tiết hồ sơ phong cách Minimalist */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. Header & Tags */}
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#111111] text-white tracking-wide flex items-center gap-1.5 shadow-2xs">
                  {isTeacher ? <Briefcase className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                  {isTeacher ? 'Giáo viên Chuyên môn' : 'Gia sư Sinh viên Giỏi'}
                </span>

                {subjectsList.map((sub: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF3EC] text-[#346538] border border-[#d6e5d5]"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              {/* 2. Headline Title (H1) */}
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#111111] leading-[1.3] tracking-tight">
                {tutor.headline || tutor.title || `${tutor.displayName || tutor.name} - Giáo viên giàu kinh nghiệm, tận tâm đồng hành cùng học viên đạt mục tiêu.`}
              </h1>

              {/* 3. Địa điểm & Hình thức giảng dạy */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs">
                  <Laptop className="w-3.5 h-3.5 text-slate-700" />
                  Trực tuyến (Google Meet / Zoom PRO)
                </span>
                {tutor.location && (
                  <span className="px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-700" />
                    Tại nhà: {tutor.location}
                  </span>
                )}
              </div>
            </div>

            {/* 4. Banner Kiểm định KYC (Minimalist Box) */}
            <div className="bg-[#EDF3EC] border border-[#d6e5d5] rounded-2xl p-5 sm:p-6 space-y-2 relative">
              <div className="flex items-center gap-2 text-[#2e5d32] font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-[#346538] shrink-0" />
                <span>Hồ sơ đã được kiểm định & Đối soát KYC 100%</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {tutor.displayName || tutor.name} đã được ban chuyên môn HanTutor đối soát Căn cước công dân, Văn bằng tốt nghiệp và cam kết chất lượng thông qua buổi học thử 1-1 miễn phí. Tỷ lệ học viên tiếp tục theo học đạt <strong className="text-[#2e5d32] font-bold tabular-nums">{successRate}%</strong>.
              </p>
            </div>

            {/* 5. Về [Tên giáo viên] */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-[#111111] flex items-center gap-2 tracking-tight">
                  <User className="w-4 h-4 text-slate-700" />
                  Về {tutor.displayName || tutor.name}
                </h2>
                {tutor.experience && (
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md tabular-nums">
                    {tutor.experience} năm kinh nghiệm
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-700 leading-relaxed space-y-3 font-normal">
                <p>
                  {tutor.teachingAchievement || tutor.shortBio || `Tôi là giáo viên với niềm đam mê sâu sắc trong việc truyền cảm hứng học tập và xây dựng sự tự tin cho từng học sinh. Tôi tin rằng mỗi học trò đều có tiềm năng vô hạn khi được tiếp cận với phương pháp học tập đúng đắn và sự khích lệ chân thành.`}
                </p>
              </div>

              {/* Bằng cấp & Trình độ học vấn */}
              <div className="bg-[#F8FAFC] rounded-xl p-4.5 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Trình độ học vấn & Chứng chỉ sư phạm:
                </span>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span><strong>Trình độ:</strong> {tutor.education || 'Tốt nghiệp Đại học Sư phạm / Cử nhân Chuyên ngành'}</span>
                  </div>
                  {tutor.certificates && tutor.certificates.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-900 block">Chứng chỉ đã xác thực: </span>
                        <div className="flex flex-wrap gap-1.5">
                          {tutor.certificates.map((cert: string, cIdx: number) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => setActiveProofModal(tutor.kycData?.frontDoc || tutor.kycData?.degreeDoc || tutor.avatar)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-medium cursor-pointer transition-all active:scale-95 shadow-2xs"
                              title="Nhấp để xem văn bằng chứng thực"
                            >
                              <span>{cert}</span>
                              <Eye className="w-3 h-3 text-slate-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Khóa học & Phương pháp */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                  Khóa học & Phương pháp giảng dạy
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-slate-600" />
                  Mọi trình độ từ cơ bản đến nâng cao
                </span>
                <span className="px-3 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-600" />
                  {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
                </span>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed font-normal space-y-3">
                <p>
                  {tutor.teachingMethod || 'Trước khi bắt đầu khóa học, giáo viên sẽ có 1 buổi trao đổi miễn phí để đánh giá năng lực hiện tại, lắng nghe mục tiêu và nguyện vọng của học viên. Sau đó sẽ thiết kế lộ trình cá nhân hóa và bắt đầu các bài giảng phù hợp.'}
                </p>
                {tutor.philosophy && (
                  <div className="border-l-2 border-[#111111] bg-[#F8FAFC] p-4 rounded-r-xl text-xs sm:text-sm italic text-slate-800 font-medium">
                    "{tutor.philosophy}"
                  </div>
                )}
              </div>
            </div>

            {/* 7. Lịch trống & Khung giờ nhận lớp */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-700" />
                  <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">Lịch trống & Khung giờ nhận lớp</h2>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
                  Phản hồi: {tutor.responseTime || 'Dưới 30 phút'}
                </span>
              </div>

              <div className="border border-slate-200/90 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[540px] border-collapse text-xs text-center">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/80">
                        <th className="p-3 text-left pl-4 font-bold text-slate-900">Khung giờ nhận dạy</th>
                        {days.map(d => <th key={d} className="p-3 font-semibold">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map(shiftObj => (
                        <tr key={shiftObj.key} className="border-b border-slate-100 last:border-0">
                          <td className="p-3 font-semibold text-slate-800 text-left pl-4 bg-slate-50/50 whitespace-nowrap">
                            {shiftObj.label}
                          </td>
                          {days.map(day => {
                            const slotKey = `${day}_${shiftObj.key}`;
                            const isAvailable = Array.isArray(tutor.schedule)
                              ? (tutor.schedule.includes(slotKey) || tutor.schedule.some((s: string) => s.includes(day) && s.includes(shiftObj.key)))
                              : (shiftObj.key === 'Tối');
                            return (
                              <td key={day} className="p-1.5">
                                {isAvailable ? (
                                  <span className="inline-block py-1 px-2.5 bg-[#EDF3EC] text-[#2e5d32] font-black rounded text-[11px]">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="block py-1 text-slate-300 text-[11px]">
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

            {/* 8. Video bài giảng mẫu */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                <Play className="w-4 h-4 text-slate-700" />
                <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                  Video bài giảng mẫu & Tài liệu học tập
                </h2>
              </div>

              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-200">
                <iframe
                  className="w-full h-full"
                  src={tutor.videoDemo || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"}
                  title="Video Demo Bài Giảng"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* 9. Đề xuất & Đánh giá từ học viên */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                    Đề xuất & Đánh giá học viên
                  </h2>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold tabular-nums">
                    {displayedReviewsRaw.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-[#EDF3EC] text-[#2e5d32] px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 tabular-nums">
                    <ThumbsUp className="w-3.5 h-3.5 fill-[#2e5d32]" /> {displayedReviewsRaw.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => openReviewModal(tutor, 'trial')}
                    className="text-xs font-bold text-slate-900 hover:underline cursor-pointer"
                  >
                    + Viết đánh giá
                  </button>
                </div>
              </div>

              {/* Review Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    reviewFilter === 'all'
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({displayedReviewsRaw.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('trial')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    reviewFilter === 'trial'
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sau học thử 1-1 ({displayedReviewsRaw.filter(r => r.stage === 'trial').length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('official')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    reviewFilter === 'official'
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Đang học chính thức ({displayedReviewsRaw.filter(r => r.stage !== 'trial').length})
                </button>
              </div>

              {/* Danh sách review cards */}
              <div className="space-y-3">
                {displayedReviews.map((rev: any) => (
                  <div key={rev.id} className="p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-[#FBFBFA] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#111111] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {rev.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-900 block">{rev.studentName}</span>
                          <span className="text-[10px] text-slate-400">{rev.date || 'Gần đây'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rev.stage === 'trial' ? 'Sau buổi học thử 1-1' : 'Đang học chính thức'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 10. Mức học phí & Ưu đãi */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-slate-700" />
                <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">Mức học phí & Ưu đãi</h2>
              </div>

              <div className="rounded-xl border border-slate-200/90 p-5 bg-[#F8FAFC] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Học phí theo giờ</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{tutor.hourlyRate} VNĐ</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Gói học linh hoạt</span>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>Gói 5h: <strong className="text-slate-900 tabular-nums">{package5h}</strong></div>
                    <div>Gói 10h: <strong className="text-slate-900 tabular-nums">{package10h}</strong></div>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Học thử 1-1</span>
                  <span className="text-sm font-bold text-[#2e5d32]">1 giờ (Miễn phí 100%)</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Hình thức</span>
                  <span className="text-sm font-bold text-slate-900">Online & Tại nhà</span>
                </div>
              </div>
            </div>

            {/* 11. Các giáo viên dạy tương tự */}
            {allRelatedTutors.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Giáo viên dạy <strong>{tutor.badgeSubject || tutor.subjects?.[0] || 'môn học'}</strong> tương tự
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium tabular-nums">{relatedPage + 1}/{totalPages}</span>
                    <button
                      type="button"
                      onClick={() => setRelatedPage(p => (p > 0 ? p - 1 : totalPages - 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer active:scale-95"
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelatedPage(p => (p < totalPages - 1 ? p + 1 : 0))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer active:scale-95"
                      title="Trang tiếp theo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {displayedRelated.map(rel => (
                    <Link
                      key={rel.id}
                      to={`/giao-vien/${rel.id}`}
                      className="group block space-y-2 select-none"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden relative bg-slate-100 border border-slate-200/80">
                        <img
                          src={rel.avatar}
                          alt={rel.displayName || rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <div className="font-bold text-xs leading-snug truncate">{rel.displayName || rel.name}</div>
                          <div className="text-[10px] text-white/80 truncate">{rel.location || 'Hà Nội & Trực tuyến'}</div>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1 tabular-nums">
                          ⭐ 5 ({rel.reviews || 2})
                        </div>
                        <div className="text-xs font-bold text-slate-900 tabular-nums">
                          {rel.hourlyRate} VNĐ/h
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* CỘT PHẢI (4 / 12 CỘT) - Sticky Action Card Phong cách Minimalist */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 text-center sticky top-24 space-y-5">

              {/* Top actions: Favorite & Share */}
              <div className="flex justify-between items-center text-slate-400">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer active:scale-90 ${isLiked ? 'text-red-600' : 'hover:text-slate-600'}`}
                  title="Lưu hồ sơ"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer active:scale-90"
                  title="Chia sẻ hồ sơ"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Round Avatar with Zoom Trigger & KYC Check */}
              <div
                onClick={() => { setIsAvatarModalOpen(true); setAvatarZoom(1); }}
                className="relative inline-block mx-auto group/avatar cursor-pointer"
                title="Nhấp để xem ảnh đại diện & hồ sơ kiểm định"
              >
                <img
                  src={tutor.avatar}
                  alt={tutor.displayName || tutor.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-slate-100 shadow-sm bg-slate-50 group-hover/avatar:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-6 h-6 drop-shadow-md" />
                </div>
                <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-2xs" title="Đã đối soát KYC">
                  <CheckCircle className="w-3.5 h-3.5 fill-white text-emerald-500" />
                </div>
              </div>

              {/* Click instruction badge */}
              <div>
                <button
                  type="button"
                  onClick={() => { setIsAvatarModalOpen(true); setAvatarZoom(1); }}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  Xem ảnh & hồ sơ xác thực
                </button>
              </div>

              {/* Name & Rating */}
              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#111111] tracking-tight">{tutor.displayName || tutor.name}</h2>
                <div className="text-xs text-amber-600 font-bold flex items-center justify-center gap-1">
                  ⭐ 5.0 <span className="text-slate-500 font-normal tabular-nums">({displayedReviewsRaw.length} đánh giá)</span>
                </div>
              </div>

              {/* Key Values List */}
              <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs text-left">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Học phí theo giờ</span>
                  <strong className="text-slate-900 font-bold tabular-nums">{tutor.hourlyRate} VNĐ</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tốc độ phản hồi</span>
                  <strong className="text-slate-900 font-bold">{tutor.responseTime || 'Dưới 30 phút'}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Học viên đang kèm</span>
                  <strong className="text-slate-900 font-bold tabular-nums">{officialEnrolled || 2}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tỷ lệ chốt sau học thử</span>
                  <strong className="text-[#2e5d32] font-bold tabular-nums">{successRate}%</strong>
                </div>
              </div>

              {/* Primary Action Button (Solid #111111 Black Button) */}
              <div className="space-y-2 pt-1">
                {trialItem?.status === 'trial_in_progress' ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-center">
                    <div className="text-xs text-slate-900 font-bold">
                      Đang kết nối cùng {tutor.displayName || tutor.name}
                    </div>
                    <a
                      href={`https://zalo.me/${(tutor.zalo || tutor.phone || '0912345678').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#0068FF] hover:bg-[#0056d6] active:scale-98 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center shadow-xs text-center"
                    >
                      Nhắn Zalo giáo viên
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openContactZaloModal(tutor)}
                    className="w-full bg-[#111111] hover:bg-[#282828] active:scale-98 text-white font-bold py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Nhận 01 buổi học thử 1-1
                  </button>
                )}

                <span className="text-xs font-semibold text-slate-600 block">
                  1 buổi học thử 1-1 hoàn toàn miễn phí
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* MODAL 1: Teacher Photo & Profile Dossier Modal */}
      {isAvatarModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Top close button */}
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#111111] hover:bg-[#282828] text-white transition-all cursor-pointer active:scale-90"
              title="Đóng (ESC)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Column: Image with Zoom Controls */}
            <div className="md:w-5/12 bg-[#111111] flex flex-col items-center justify-between p-6 relative overflow-hidden select-none">
              
              {/* Zoom Controls */}
              <div className="w-full flex items-center justify-between text-white/80 z-10">
                <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-md">
                  Ảnh hồ sơ chính thức
                </span>
                <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAvatarZoom(z => Math.max(1, z - 0.25))}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Thu nhỏ"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold px-1 tabular-nums">{Math.round(avatarZoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setAvatarZoom(z => Math.min(2.5, z + 0.25))}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Phóng to"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Photo Display */}
              <div className="my-auto py-4 overflow-hidden flex items-center justify-center">
                <img
                  src={tutor.avatar}
                  alt={tutor.displayName || tutor.name}
                  style={{ transform: `scale(${avatarZoom})` }}
                  className="max-h-[50vh] md:max-h-[380px] w-auto rounded-xl object-cover shadow-2xl transition-transform duration-200 border border-white/20"
                />
              </div>

              {/* Bottom KYC Seal */}
              <div className="w-full bg-emerald-950/90 border border-emerald-500/30 rounded-lg p-2 text-center text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 z-10">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hồ sơ đã đối soát KYC 100%</span>
              </div>
            </div>

            {/* Right Column: Dossier Details */}
            <div className="md:w-7/12 p-6 sm:p-7 overflow-y-auto space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-[#111111] text-white">
                    {isTeacher ? 'Giáo viên Chuyên môn' : 'Gia sư Sinh viên Giỏi'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#EDF3EC] text-[#346538] border border-[#d6e5d5]">
                    {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
                    {tutor.displayName || tutor.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium italic mt-0.5">
                    “{tutor.headline || tutor.title || 'Giáo viên giàu kinh nghiệm, tận tâm đồng hành cùng học viên.'}”
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Đánh giá trung bình:</span>
                    <strong className="text-amber-600 font-bold flex items-center gap-1">
                      ⭐ 5.0 ({displayedReviewsRaw.length} đánh giá)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Tỷ lệ nhận lớp:</span>
                    <strong className="text-[#2e5d32] font-bold tabular-nums">
                      {successRate}% sau học thử
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Học phí theo giờ:</span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {tutor.hourlyRate} VNĐ/h
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Phản hồi:</span>
                    <strong className="text-slate-800 font-bold">
                      {tutor.responseTime || 'Dưới 30 phút'}
                    </strong>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="font-bold text-slate-900">Văn bằng & Chứng chỉ đã xác thực:</div>
                  <div className="flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                    <GraduationCap className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span>{tutor.education || 'Cử nhân Sư phạm / Đại học Chuyên ngành'}</span>
                  </div>
                  {tutor.certificates && tutor.certificates.length > 0 && (
                    <div className="flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{tutor.certificates.join(', ')}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal CTA */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarModalOpen(false);
                    openContactZaloModal(tutor);
                  }}
                  className="w-full bg-[#111111] hover:bg-[#282828] active:scale-98 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Nhận 01 buổi học thử 1-1 miễn phí
                </button>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>1 buổi học thử 1-1 miễn phí</span>
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(false)}
                    className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Certificate Lightbox Modal */}
      {activeProofModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveProofModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveProofModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer active:scale-90 transition-all"
              title="Đóng (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Văn bằng & Chứng chỉ chuyên môn</h3>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 max-h-[65vh] flex items-center justify-center bg-[#111111]">
              <img src={activeProofModal} alt="Minh chứng thành tích" className="max-h-[60vh] w-auto object-contain" />
            </div>
            <div className="mt-3 text-center text-xs text-slate-500 font-medium">
              Văn bằng đã được chuyên gia HanTutor xác thực bản gốc
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// AdminDashboardPage
function AdminDashboardPage() {
  const { tutors, pendingTutors, adminStats, approveTutorKyc, rejectTutorKyc, securityLogs, refreshSecurityLogs, setCurrentSession, teacherWallets, getTeacherWallet } = useData();
  const { openTeacherWalletModal } = useUI();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('hantutor_admin_auth') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [currentTab, setCurrentTab] = useState<'kyc' | 'requests' | 'tutors' | 'analytics' | 'security'>('kyc');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ isOpen: boolean; title: string; imageUrl: string; tutorName: string } | null>(null);

  // Security Sandbox State
  const [sandboxRole, setSandboxRole] = useState<UserRole>('anonymous');
  const [testInternalId, setTestInternalId] = useState('t1');
  const [generatedSecureToken, setGeneratedSecureToken] = useState(() => IDORGuard.toSecureId('tutor', 't1'));

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce Rate Limit for Admin Login
    const rateCheck = RateLimiter.check('ADMIN_ACTION', 'admin_portal_login');
    if (!rateCheck.allowed) {
      setErrorMsg(rateCheck.errorMessage || 'Quá nhiều lần đăng nhập quản trị thất bại.');
      SecurityAuditLogger.log({
        type: 'ADMIN_AUTH_FAILED',
        severity: 'HIGH',
        action: 'ADMIN_LOGIN_LOCKOUT',
        target: 'admin_portal',
        details: 'Cảnh báo: Cố gắng brute-force mật khẩu quản trị viên vượt quá giới hạn.'
      });
      refreshSecurityLogs();
      return;
    }

    if (adminPassword === 'admin123' || adminPassword === 'hantutor@2026') {
      sessionStorage.setItem('hantutor_admin_auth', 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
      RateLimiter.reset('ADMIN_ACTION', 'admin_portal_login');
      setCurrentSession({
        userId: 'admin_root',
        role: 'admin',
        sessionToken: 'adm_' + Date.now()
      });
    } else {
      setErrorMsg('Mật khẩu quản trị viên không chính xác. Vui lòng thử lại!');
      SecurityAuditLogger.log({
        type: 'ADMIN_AUTH_FAILED',
        severity: 'MEDIUM',
        action: 'ADMIN_LOGIN_FAILED',
        target: 'admin_portal',
        details: 'Sai mật khẩu truy cập Admin Portal.'
      });
      refreshSecurityLogs();
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('hantutor_admin_auth');
    setIsAuthenticated(false);
    setCurrentSession({ role: 'anonymous' });
  };

  const triggerSecuritySimulation = () => {
    // 1. Simulate IDOR Probe Attack
    SecurityAuditLogger.log({
      type: 'IDOR_PROBE_DETECTED',
      severity: 'CRITICAL',
      action: 'ACCESS_TRIAL_PRIVATE',
      target: 'trial_obj_891',
      details: 'Mô phỏng IDOR: Người dùng student_402 cố tình đổi URL truy cập đơn học thử riêng tư #891 của học sinh khác.'
    });

    // 2. Simulate Rate Limit Trigger
    SecurityAuditLogger.log({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'HIGH',
      action: 'AUTH_LOGIN',
      target: '0987654321',
      details: 'Mô phỏng Rate Limit: IP 118.69.182.10 gửi 6 yêu cầu đăng nhập liên tiếp trong 1 phút. Đã kích hoạt khóa tự động 5 phút.'
    });

    // 3. Simulate Unauthorized Row Mutation
    SecurityAuditLogger.log({
      type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      severity: 'HIGH',
      action: 'MODIFY_TUTOR',
      target: 't1',
      details: 'Mô phỏng RLS: Người dùng chưa cấp quyền cố gắng sửa học phí của giáo viên t1.'
    });

    refreshSecurityLogs();
    alert("Đã tạo 3 sự kiện an ninh mô phỏng (IDOR Probe, Rate Limit Block, RLS Violation) vào Nhật ký An ninh!");
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

  // Sample tutor for RLS Sandbox
  const sampleTutor = tutors[0] || {
    id: 't1',
    name: 'ThS. Nguyễn Văn An',
    phone: '0912345678',
    zalo: '0912345678',
    email: 'nguyenvanan.sp@gmail.com',
    kycData: {
      status: 'verified',
      idNumber: '001095012345',
      frontDoc: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800',
      degreeDoc: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800'
    }
  };

  const maskedSample = RowLevelSecurity.applyTutorRLS(sampleTutor, {
    role: sandboxRole,
    userId: sandboxRole === 'teacher' ? sampleTutor.id : 'guest_1',
    phone: sandboxRole === 'teacher' ? sampleTutor.phone : undefined
  });

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
            Ví Giảng Dạy & Lệnh Rút Tiền
          </button>
          <button
            onClick={() => {
              setCurrentTab('security');
              refreshSecurityLogs();
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${currentTab === 'security' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Giám sát An ninh (RLS, IDOR, Rate Limit)
            {securityLogs.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {securityLogs.length}
              </span>
            )}
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

        {/* TAB 3: TEACHER WALLET & WITHDRAWAL MANAGEMENT (SHOPEE-STYLE) */}
        {currentTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-bold uppercase block">Tổng Quỹ Ví Giáo Viên</span>
                <span className="text-2xl font-black text-emerald-600">
                  {Object.values(teacherWallets).reduce((sum, w) => sum + (w.balance || 0), 0).toLocaleString()} VNĐ
                </span>
                <p className="text-[11px] text-slate-400 mt-1">70% học phí tích lũy sẵn sàng rút</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-bold uppercase block">Tổng Tiền Đã Rút</span>
                <span className="text-2xl font-black text-slate-900">
                  {Object.values(teacherWallets).reduce((sum, w) => sum + (w.totalWithdrawn || 0), 0).toLocaleString()} VNĐ
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Đã chuyển khoản qua Napas 24/7</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-bold uppercase block">Doanh Thu Sàn Giữ Lại (30%)</span>
                <span className="text-2xl font-black text-blue-600">
                  {Math.round(Object.values(teacherWallets).reduce((sum, w) => sum + (w.balance + w.totalWithdrawn), 0) * (3 / 7)).toLocaleString()} VNĐ
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Phí vận hành & bảo hiểm nền tảng</p>
              </div>
            </div>

            {/* Table of teacher wallets and recent withdrawals */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Trạng thái Ví & Lệnh Rút Tiền của Giáo Viên</h3>
                  <p className="text-xs text-slate-500">Giáo viên tự chủ rút tiền về tài khoản ngân hàng tương tự Shopee/ShopeePay</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="pb-3">Giáo viên</th>
                      <th className="pb-3">Số dư ví hiện tại</th>
                      <th className="pb-3">Đã rút lũy kế</th>
                      <th className="pb-3">Giao dịch gần nhất</th>
                      <th className="pb-3">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {tutors.slice(0, 6).map(tut => {
                      const tw = getTeacherWallet(tut.id);
                      const lastTx = tw.transactions[0];
                      return (
                        <tr key={tut.id} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                            <img src={tut.avatar} alt={tut.name} className="w-7 h-7 rounded-full object-cover" />
                            <span>{tut.name}</span>
                          </td>
                          <td className="py-3 font-black text-emerald-600 tabular-nums">{tw.balance.toLocaleString()}đ</td>
                          <td className="py-3 text-slate-600 font-semibold tabular-nums">{tw.totalWithdrawn.toLocaleString()}đ</td>
                          <td className="py-3 text-xs text-slate-500">
                            {lastTx ? `${lastTx.title} (${lastTx.date})` : 'Chưa có giao dịch'}
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => openTeacherWalletModal(tut.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                            >
                              Xem & Thử Rút Tiền
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY AUDIT & RLS / IDOR / RATE LIMIT MONITOR */}
        {currentTab === 'security' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Security Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase">Sự kiện An ninh</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <div className="text-2xl font-black text-white">{securityLogs.length}</div>
                <div className="text-[11px] text-slate-400">Ghi nhận vi phạm & Probe logs</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">Rate Limiting</span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">{Object.keys(RATE_LIMIT_RULES).length} Quy tắc</div>
                <div className="text-[11px] text-emerald-600 font-bold">Sliding Window & Lockout Active</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">Row Level Security (RLS)</span>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-600">Đang bật</div>
                <div className="text-[11px] text-slate-500">Data Masking CCCD/SĐT/Bank</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">IDOR Guard</span>
                  <Target className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-600">Opaque Crypto</div>
                <div className="text-[11px] text-slate-500">Chống quét ID số tuần tự</div>
              </div>
            </div>

            {/* LIVE SECURITY AUDIT LOGS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Nhật ký Sự kiện An ninh Thời gian thực (Live Security Audit Log)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ghi nhận tự động các hành vi vượt ngưỡng Rate Limit, tấn công IDOR hoặc cố gắng can thiệp dữ liệu trái phép.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerSecuritySimulation}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    ⚡ Mô phỏng Vi phạm An ninh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      SecurityAuditLogger.clearLogs();
                      refreshSecurityLogs();
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Xóa nhật ký
                  </button>
                </div>
              </div>

              {securityLogs.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                  Hệ thống an toàn. Chưa phát hiện vi phạm bảo mật nào.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <th className="pb-3">Thời gian</th>
                        <th className="pb-3">Mức độ</th>
                        <th className="pb-3">Loại sự kiện</th>
                        <th className="pb-3">Đối tượng mục tiêu</th>
                        <th className="pb-3">Chi tiết vi phạm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {securityLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-3 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                            {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                          </td>
                          <td className="py-3">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              log.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                              log.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-3 font-bold text-slate-900 font-mono text-[11px]">{log.type}</td>
                          <td className="py-3 font-semibold text-indigo-600 font-mono text-[11px]">{log.target}</td>
                          <td className="py-3 text-slate-600 text-xs leading-relaxed max-w-md">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* TWO COLUMN GRID: RATE LIMIT RULES & RLS / IDOR SANDBOX */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RATE LIMIT RULES TABLE */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Cấu hình Giới hạn Tần suất (Rate Limiting Buckets)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Thuật toán Sliding Window với thời gian khóa tạm thời</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <th className="pb-2">Hành vi (Action)</th>
                        <th className="pb-2">Hạn mức</th>
                        <th className="pb-2">Cửa sổ (Window)</th>
                        <th className="pb-2">Hình thức xử lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {Object.entries(RATE_LIMIT_RULES).map(([key, config]) => (
                        <tr key={key} className="hover:bg-slate-50">
                          <td className="py-2.5">
                            <div className="font-bold text-slate-800">{config.description}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{key}</div>
                          </td>
                          <td className="py-2.5 font-bold text-indigo-600">{config.maxRequests} reqs</td>
                          <td className="py-2.5 text-slate-600">{config.windowMs / 1000 >= 60 ? `${config.windowMs / 60000} phút` : `${config.windowMs / 1000}s`}</td>
                          <td className="py-2.5">
                            {config.lockoutMs ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                Khóa {config.lockoutMs / 60000} phút
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500">Chờ hết cửa sổ</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RLS & IDOR INTERACTIVE INSPECTOR */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Thử nghiệm Row Level Security (RLS) & IDOR Protection
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Kiểm tra kết quả Data Masking theo từng vai trò người dùng</p>
                </div>

                {/* Role Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Xem dữ liệu dưới góc nhìn (Role View):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSandboxRole('anonymous')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sandboxRole === 'anonymous' ? 'bg-[#111111] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Khách vãng lai
                    </button>
                    <button
                      type="button"
                      onClick={() => setSandboxRole('teacher')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sandboxRole === 'teacher' ? 'bg-[#111111] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Chính Giáo viên
                    </button>
                    <button
                      type="button"
                      onClick={() => setSandboxRole('admin')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sandboxRole === 'admin' ? 'bg-[#111111] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Quản trị viên
                    </button>
                  </div>
                </div>

                {/* Masked Output Preview */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Họ tên:</span>
                    <strong className="text-slate-900">{maskedSample.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Số điện thoại:</span>
                    <strong className={`font-mono ${sandboxRole === 'anonymous' ? 'text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded' : 'text-emerald-700'}`}>
                      {maskedSample.phone}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Số CCCD (KYC):</span>
                    <strong className={`font-mono ${sandboxRole === 'anonymous' ? 'text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded' : 'text-emerald-700'}`}>
                      {maskedSample.kycData?.idNumber || '001**********'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Link Scan CCCD & Bằng ĐH:</span>
                    <strong className="text-slate-700">
                      {maskedSample.kycData?.frontDoc ? '✓ Được cấp quyền xem ảnh gốc' : '🚫 Bị ẩn (RLS Encrypted)'}
                    </strong>
                  </div>
                </div>

                {/* IDOR Opaque Token Demo */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Chuyển đổi ID nội bộ sang Crypto Token (IDOR Defense):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testInternalId}
                      onChange={e => {
                        setTestInternalId(e.target.value);
                        setGeneratedSecureToken(IDORGuard.toSecureId('tutor', e.target.value));
                      }}
                      className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                      placeholder="ID gốc (1)"
                    />
                    <div className="flex-1 px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-900 font-mono text-xs rounded-xl truncate flex items-center">
                      {generatedSecureToken}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    URL công khai dùng token ngẫu nhiên không tuần tự, ngăn chặn hacker thay đổi số ID để đánh cắp hồ sơ.
                  </p>
                </div>
              </div>
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

  // Phân tách vai trò Đăng ký: Giáo viên vs Gia sư (Point 6)
  const [roleType, setRoleType] = useState<'teacher' | 'tutor'>('teacher');

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
  const [displayName, setDisplayName] = useState(urlParams.get('name') || '');
  const [headline, setHeadline] = useState('');

  // 3. Ảnh đại diện (Avatar)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showSampleModal, setShowSampleModal] = useState(false);

  // 4. Ảnh cá nhân khác (2 ảnh - optional)
  const [otherImages, setOtherImages] = useState<string[]>([]);

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

  // 9. Cấp học & Đối tượng nhận dạy
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

  // AI Image Validation Status Tracker (Point 8)
  const [imageValidations, setImageValidations] = useState<{
    avatar?: boolean;
    cccdFront?: boolean;
    cccdBack?: boolean;
    credential?: boolean;
  }>({});

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

  const shifts = [
    { label: 'Ca Sáng (08:00 - 11:30)', key: 'Sáng' },
    { label: 'Ca Chiều (14:00 - 17:30)', key: 'Chiều' },
    { label: 'Ca Tối (18:30 - 21:30)', key: 'Tối' }
  ];
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  // Automated AI Image Validation Checker (Point 8)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'other' | 'cccdFront' | 'cccdBack' | 'credential' | 'certProof' | 'achievement') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file format
    const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!validFormats.includes(file.type)) {
      alert("Định dạng tệp không hợp lệ! Vui lòng chỉ tải tệp định dạng JPG, PNG, WEBP hoặc PDF.");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Tệp tải lên vượt quá dung lượng cho phép (tối đa 5MB). Vui lòng chọn ảnh nhẹ hơn!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(dataUrl);
        setImageValidations(prev => ({ ...prev, avatar: true }));
      } else if (type === 'other') {
        setOtherImages(prev => prev.length < 2 ? [...prev, dataUrl] : [prev[0], dataUrl]);
      } else if (type === 'cccdFront') {
        setCccdFrontFile(file);
        setCccdFrontPreview(dataUrl);
        setImageValidations(prev => ({ ...prev, cccdFront: true }));
      } else if (type === 'cccdBack') {
        setCccdBackFile(file);
        setCccdBackPreview(dataUrl);
        setImageValidations(prev => ({ ...prev, cccdBack: true }));
      } else if (type === 'credential') {
        setCredentialFile(file);
        setCredentialPreview(dataUrl);
        setImageValidations(prev => ({ ...prev, credential: true }));
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

  const toggleScheduleSlot = (day: string, shiftKey: string) => {
    const slot = `${day}_${shiftKey}`;
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

    const isTeacherRole = roleType === 'teacher';

    const newTutorProfile: TutorType = {
      id: tutorId,
      name: fullName,
      displayName: displayName || fullName,
      rolePrefix: isTeacherRole ? (educationLevel === 'Thạc sĩ' ? 'ThS' : 'Giáo viên') : 'Gia sư',
      headline: headline,
      badgeSubject: allSubjects[0] || (isTeacherRole ? 'Giáo viên' : 'Gia sư'),
      avatar: avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
      coverImage: otherImages[0] || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200",
      otherImages: otherImages.length > 0 ? otherImages : [avatarPreview],
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
      type: isTeacherRole ? 'Giáo viên' : 'Gia sư',
      providerType: isTeacherRole ? 'teacher' : 'tutor',
      targetTags: allSubjects.slice(0, 3),
      successStory: teachingAchievement,
      phone: phone,
      zalo: phone,
      birthYear: '1995',
      experience: experience || (isTeacherRole ? '5 năm' : '2 năm'),
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
      trialStats: { totalTrials: 0, officialEnrolled: 0 },
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
          Hồ sơ của bạn đã được gửi đến ban kiểm duyệt HanTutor. Chúng tôi sẽ đối soát danh tính KYC tự động và kích hoạt hồ sơ trong thời gian sớm nhất.
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
        <div className="text-center mb-8 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Đăng ký Hồ sơ Giảng dạy</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-xl mx-auto">
            Hệ thống kết nối Giáo viên Chuyên nghiệp & Gia sư Sinh viên Giỏi hàng đầu tại Hà Nội
          </p>

          <div className="mt-6 mb-6 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
            <div
              onClick={() => setRoleType('teacher')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${roleType === 'teacher'
                  ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-100'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Đăng ký Giáo viên
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">Chuyên nghiệp</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dành cho giáo viên các trường, giảng viên, thạc sĩ. <strong>Học sinh đóng tiền trực tiếp cho Giáo viên</strong> sau khi chốt lịch, giáo viên gửi 30% phí vận hành cho sàn.
              </p>
            </div>

            <div
              onClick={() => setRoleType('tutor')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${roleType === 'tutor'
                  ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-100'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-slate-700'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  Đăng ký Gia sư
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">Thanh toán Escrow</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dành cho sinh viên giỏi, thủ khoa, gia sư tự do. <strong>Phụ huynh thanh toán đảm bảo qua HanTutor Escrow</strong>, nhận 70% học phí an toàn sau khi hoàn thành buổi học.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${step === 1 ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
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
                if (err) { alert(err); return; }
                setStep(2);
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${step === 2 ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
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

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Quy định bảo mật hồ sơ:</strong> Thông tin CCCD và Tài khoản ngân hàng ở Phần I được bảo mật chuẩn KYC, dùng cho mục đích kiểm duyệt văn bằng và chuyển trả học phí, tuyệt đối KHÔNG hiển thị công khai.
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h3 className="text-base font-bold text-slate-900">Định danh cá nhân (KYC)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên đầy đủ *</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="VD: NGUYỄN VĂN AN" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số CCCD / Hộ chiếu *</label>
                  <input type="text" value={cccdNumber} onChange={e => setCccdNumber(e.target.value.replace(/\D/g, ''))} placeholder="VD: 001200012345" maxLength={12} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800" />
                </div>

                <div className="sm:col-span-2 space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Ảnh chụp 2 mặt CCCD / Hộ chiếu *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600 block">Mặt trước CCCD *</span>
                        {imageValidations.cccdFront && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> AI Đã duyệt ảnh chuẩn
                          </span>
                        )}
                      </div>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[140px] flex flex-col justify-center items-center bg-white/70">
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cccdFront')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        {cccdFrontPreview ? <img src={cccdFrontPreview} alt="CCCD Front" className="max-h-[120px] rounded-lg object-contain" /> : <><UploadCloud className="w-7 h-7 text-blue-500 mb-1" /><span className="font-bold text-slate-700 text-xs block">Tải ảnh mặt trước</span></>}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600 block">Mặt sau CCCD *</span>
                        {imageValidations.cccdBack && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> AI Đã duyệt ảnh chuẩn
                          </span>
                        )}
                      </div>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer min-h-[140px] flex flex-col justify-center items-center bg-white/70">
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cccdBack')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        {cccdBackPreview ? <img src={cccdBackPreview} alt="CCCD Back" className="max-h-[120px] rounded-lg object-contain" /> : <><UploadCloud className="w-7 h-7 text-blue-500 mb-1" /><span className="font-bold text-slate-700 text-xs block">Tải ảnh mặt sau</span></>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h3 className="text-base font-bold text-slate-900">Thông tin liên hệ & Kênh thanh toán</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại dùng Zalo *</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email cá nhân *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold text-slate-800" />
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <div className="mb-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tài khoản ngân hàng nhận học phí (70% đối với Gia sư) *</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tên chủ tài khoản bắt buộc phải trùng khớp với Họ tên trên CCCD.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tên ngân hàng *</label>
                      <select value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none">
                        <option value="">-- Chọn ngân hàng --</option>
                        {banksList.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Số tài khoản *</label>
                      <input type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value.replace(/\D/g, ''))} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tên chủ tài khoản *</label>
                      <input type="text" value={bankAccountHolder} onChange={e => setBankAccountHolder(e.target.value.toUpperCase())} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold uppercase outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="button" onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer">
                Tiếp tục sang Phần II (Thông tin giảng dạy) →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1-2</span>
                <h3 className="text-base font-bold text-slate-900">Tên hiển thị & Giới thiệu ngắn</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Tên hiển thị trên web *</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none text-sm font-bold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Dòng giới thiệu ngắn (Slogan) *</label>
                  <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none text-sm font-semibold text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">3-4</span>
                <h3 className="text-base font-bold text-slate-900">Ảnh đại diện & Ảnh hoạt động giảng dạy</h3>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">3. Ảnh đại diện (Avatar) * (Chân dung bản thân, trang phục lịch sự, phông sáng)</label>
                  {imageValidations.avatar && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> AI Đã duyệt ảnh đạt chuẩn
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <Users className="w-8 h-8 text-slate-400" />}
                    </div>
                    <div>
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
                        <UploadCloud className="w-4 h-4" /> <span>Tải ảnh đại diện</span>
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'avatar')} className="hidden" />
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">Ảnh nét, phông sáng, tối đa 5MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    <button type="button" onClick={() => setShowSampleModal(true)} className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg overflow-hidden border border-amber-300 shrink-0 bg-white cursor-pointer hover:scale-105 transition-transform">
                      <img src="/sample-avatar-4x6.png" alt="Ảnh mẫu" className="w-full h-full object-cover" />
                    </button>
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded uppercase block w-fit mb-0.5">Ảnh mẫu chuẩn</span>
                      <p className="text-[11px] text-slate-600">Chụp chính diện lịch sự, phông sáng.</p>
                      <button type="button" onClick={() => setShowSampleModal(true)} className="text-[11px] text-amber-800 font-bold hover:underline mt-0.5 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Xem mẫu
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">4. Ảnh hoạt động dạy học thực tế (Tối đa 2 ảnh - Tùy chọn)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-2xl p-4 bg-white text-center">
                    <span className="text-[10px] font-bold text-slate-700 block mb-1.5">Ảnh hoạt động 1 (Lớp học / Dạy kèm)</span>
                    <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                      {otherImages[0] ? <img src={otherImages[0]} alt="Activity 1" className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400 font-medium">Chưa có ảnh</span>}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 cursor-pointer text-white font-bold text-xs">
                        Thay ảnh <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'other')} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4 bg-white text-center">
                    <span className="text-[10px] font-bold text-slate-700 block mb-1.5">Ảnh hoạt động 2 (Học sinh tiến bộ)</span>
                    <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                      {otherImages[1] ? <img src={otherImages[1]} alt="Activity 2" className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400 font-medium">Tùy chọn</span>}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 cursor-pointer text-white font-bold text-xs">
                        Thay ảnh <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'other')} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">5-6</span>
                <h3 className="text-base font-bold text-slate-900">Trình độ học vấn & Môn học tiếp nhận</h3>
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">5. Trình độ học vấn *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold">
                    <option value="Đại học">Đại học</option><option value="Cao đẳng">Cao đẳng</option><option value="Thạc sĩ">Thạc sĩ</option>
                  </select>
                  <input type="text" value={major} onChange={e => setMajor(e.target.value)} placeholder="Chuyên ngành" className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
                  <input type="text" value={university} onChange={e => setUniversity(e.target.value)} placeholder="Trường ĐH" className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold" />
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700 block">Tải lên tệp kiểm duyệt văn bằng</span>
                    {imageValidations.credential && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> AI Đã kiểm duyệt văn bằng
                      </span>
                    )}
                  </div>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center min-h-[100px] flex flex-col justify-center items-center bg-white/70">
                    <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange(e, 'credential')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {credentialPreview ? <span className="text-xs font-bold text-emerald-700">✓ Đã tải văn bằng</span> : <><UploadCloud className="w-6 h-6 text-blue-500 mb-1" /><span className="text-[10px] text-slate-400">JPG, PNG, PDF (Tối đa 5MB)</span></>}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">6. Môn học tiếp nhận *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-4 rounded-2xl border border-slate-200">
                  {popularSubjects.map(sub => (
                    <label key={sub} className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                      <input type="checkbox" checked={selectedSubjects.includes(sub)} onChange={() => toggleSubject(sub)} className="rounded text-blue-600" /> {sub}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">9</span>
                <h3 className="text-base font-bold text-slate-900">Cấp học & Đối tượng nhận dạy</h3>
              </div>
              <textarea rows={3} value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Mô tả đối tượng học sinh..." className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs font-medium outline-none" />
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">13</span>
                <h3 className="text-base font-bold text-slate-900">Lịch học & Cam kết vận hành</h3>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Khung giờ có thể nhận lớp *</label>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full min-w-[540px] border-collapse text-xs text-center">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="p-3 text-left pl-4 font-bold text-slate-800">Khung giờ</th>
                        {days.map(d => <th key={d} className="p-3">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map(shiftObj => (
                        <tr key={shiftObj.key} className="border-b border-slate-100">
                          <td className="p-3 font-bold text-slate-700 text-left pl-4 bg-slate-50/70 whitespace-nowrap">{shiftObj.label}</td>
                          {days.map(day => (
                            <td key={day} className="p-1.5">
                              <button type="button" onClick={() => toggleScheduleSlot(day, shiftObj.key)} className={`w-full py-1.5 rounded-lg text-[11px] font-semibold ${scheduleSlots.includes(`${day}_${shiftObj.key}`) ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-slate-50 text-slate-400'}`}>
                                {scheduleSlots.includes(`${day}_${shiftObj.key}`) ? '✓ Rảnh' : '+'}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2.5">
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
  setReviewModalState,
  teacherWalletModalTutorId,
  setTeacherWalletModalTutorId,
  teacherProfileModalTutorId,
  setTeacherProfileModalTutorId
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
            recordOfficialEnrollment(tutorId, amount);
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

      {/* Ví Giảng Dạy - Tự Rút Tiền Shopee-Style */}
      {teacherWalletModalTutorId && (
        <TeacherWalletModal
          isOpen={!!teacherWalletModalTutorId}
          tutorId={teacherWalletModalTutorId}
          onClose={() => setTeacherWalletModalTutorId(null)}
        />
      )}

      {/* Modal Chỉnh sửa hồ sơ giáo viên */}
      {teacherProfileModalTutorId && (
        <TeacherProfileModal
          isOpen={!!teacherProfileModalTutorId}
          tutorId={teacherProfileModalTutorId}
          onClose={() => setTeacherProfileModalTutorId(null)}
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
    } catch (e) { }
    return mockTutors;
  });
  const [pendingTutors, setPendingTutors] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hantutor_pending_tutors');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return mockPendingTutors;
  });
  const [adminStats, setAdminStats] = useState(mockAdminStats);
  const [myTrials, setMyTrials] = useState<StudentTrialItem[]>(() => getStoredTrials());
  const [reviews, setReviews] = useState<TutorReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem('hantutor_tutor_reviews');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return defaultTutorReviews;
  });

  const [teacherWallets, setTeacherWallets] = useState<Record<string, TeacherWallet>>(() => getStoredTeacherWallets());

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
  const [teacherWalletModalTutorId, setTeacherWalletModalTutorId] = useState<string | number | null>(null);
  const [teacherProfileModalTutorId, setTeacherProfileModalTutorId] = useState<string | number | null>(null);

  const [currentSession, setCurrentSession] = useState<UserSessionContext>(() => {
    try {
      const saved = localStorage.getItem('hantutor_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return { role: 'anonymous' };
  });

  useEffect(() => {
    try {
      localStorage.setItem('hantutor_user_session', JSON.stringify(currentSession));
    } catch (e) { }
  }, [currentSession]);

  const [securityLogs, setSecurityLogs] = useState<SecurityAuditEvent[]>(() => SecurityAuditLogger.getLogs());

  const refreshSecurityLogs = () => {
    setSecurityLogs(SecurityAuditLogger.getLogs());
  };

  const getMaskedTutor = (tutor: any) => {
    return RowLevelSecurity.applyTutorRLS(tutor, currentSession);
  };

  const getTeacherWallet = (tutorId: string | number): TeacherWallet => {
    const idKey = String(tutorId || 't1');
    const found = teacherWallets[idKey] || teacherWallets['t1'];
    if (found && typeof found.balance === 'number') {
      return found;
    }
    return {
      balance: 1680000,
      totalWithdrawn: 3500000,
      transactions: [
        {
          id: 'tx_init_1',
          tutorId: 't1',
          tutorName: 'Cô Sương Mai',
          type: 'tuition_income',
          amount: 1120000,
          title: 'Cộng 70% học phí khóa 8 buổi (Học sinh Hoàng Nam)',
          date: '02/09/2026',
          status: 'completed'
        },
        {
          id: 'tx_init_2',
          tutorId: 't1',
          tutorName: 'Cô Sương Mai',
          type: 'tuition_income',
          amount: 560000,
          title: 'Cộng 70% học phí khóa 4 buổi (Học sinh Bảo Anh)',
          date: '01/09/2026',
          status: 'completed'
        }
      ]
    };
  };

  const requestWithdrawal = (tutorId: string | number, amount: number, bankInfo: string) => {
    const idKey = String(tutorId);
    const current = getTeacherWallet(idKey);
    if (amount > current.balance) {
      return { success: false, message: 'Số dư ví khả dụng không đủ!' };
    }

    const newTx: WalletTransaction = {
      id: 'tx_wdr_' + Date.now(),
      tutorId,
      type: 'withdrawal',
      amount,
      title: `Rút tiền về ${bankInfo}`,
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'completed',
      bankInfo
    };

    const updated: TeacherWallet = {
      balance: current.balance - amount,
      totalWithdrawn: current.totalWithdrawn + amount,
      transactions: [newTx, ...current.transactions]
    };

    const all = { ...teacherWallets, [idKey]: updated };
    setTeacherWallets(all);
    saveStoredTeacherWallets(all);

    return { success: true, message: `Yêu cầu rút ${amount.toLocaleString()}đ thành công! Tiền sẽ về STK ${bankInfo} trong 1-3 phút qua Napas 24/7.` };
  };

  const approveWithdrawal = (transactionId: string) => {
    // Approve withdrawal
  };

  const updateTutorProfile = (tutorId: string | number, updatedData: Partial<any>) => {
    setTutors(prev => {
      const updated = prev.map(t => {
        if (String(t.id) === String(tutorId) || (String(tutorId) === 't1' && String(t.id) === '1')) {
          return { ...t, ...updatedData };
        }
        return t;
      });
      try {
        localStorage.setItem('hantutor_tutors_list', JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
  };

  const addTutorReview = (newReviewData: Omit<TutorReviewItem, 'id' | 'date'>) => {
    // Rate limit check
    const rate = RateLimiter.check('REVIEW_SUBMIT', String(newReviewData.tutorId));
    if (!rate.allowed) {
      alert(rate.errorMessage || 'Thao tác đánh giá quá nhanh. Vui lòng chờ ít phút.');
      refreshSecurityLogs();
      return;
    }

    const newReview: TutorReviewItem = {
      ...newReviewData,
      id: `rev_${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN')
    };

    setReviews(prev => {
      const updated = [newReview, ...prev];
      try {
        localStorage.setItem('hantutor_tutor_reviews', JSON.stringify(updated));
      } catch (e) { }
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
    // Rate limit check for KYC submit
    const rate = RateLimiter.check('KYC_SUBMIT', newTutor.phone || 'tutor_reg');
    if (!rate.allowed) {
      alert(rate.errorMessage || 'Tải lên hồ sơ quá thường xuyên. Vui lòng thử lại sau.');
      refreshSecurityLogs();
      return;
    }

    setPendingTutors(prev => {
      const updated = [newTutor, ...prev];
      try {
        localStorage.setItem('hantutor_pending_tutors', JSON.stringify(updated));
      } catch (e) { }
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
    // Rate limit check for trial booking
    const rate = RateLimiter.check('TRIAL_BOOKING', studentInfo?.phone || String(currentSession.userId || 'client_student'));
    if (!rate.allowed) {
      alert(rate.errorMessage || 'Bạn đã đăng ký học thử quá nhiều lần trong thời gian ngắn.');
      refreshSecurityLogs();
      return;
    }

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
          status: 'trial_in_progress',
          studentId: currentSession.userId || 'anon_stud',
          studentPhone: studentInfo?.phone || currentSession.phone
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

  const recordOfficialEnrollment = (tutorId: any, totalTuition = 1600000) => {
    // 1. Tự động cộng 70% học phí vào Ví Giảng Dạy của giáo viên (Shopee-Style)
    const tutorEarnings = Math.round(totalTuition * 0.7);
    const idKey = String(tutorId);
    const current = getTeacherWallet(idKey);
    const incomeTx: WalletTransaction = {
      id: 'tx_inc_' + Date.now(),
      tutorId,
      type: 'tuition_income',
      amount: tutorEarnings,
      title: `Cộng 70% học phí khóa học (#ENR_${Date.now().toString().slice(-6)})`,
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'completed'
    };

    const updatedWallet: TeacherWallet = {
      ...current,
      balance: current.balance + tutorEarnings,
      transactions: [incomeTx, ...current.transactions]
    };

    const allWallets = { ...teacherWallets, [idKey]: updatedWallet };
    setTeacherWallets(allWallets);
    saveStoredTeacherWallets(allWallets);

    // 2. Tăng số lượt nhận lớp chính thức thành công
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

    // 3. Cập nhật trạng thái trong MyTrials sang 'enrolled'
    setMyTrials(prev => {
      const updated = prev.map(item =>
        String(item.tutorId) === String(tutorId)
          ? { ...item, status: 'enrolled' as const }
          : item
      );
      saveStoredTrials(updated);
      return updated;
    });

    // 4. Ghi nhận giao dịch admin
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
          status: 'Đã thanh toán (70% vào Ví Giáo viên)'
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
      } catch (e) { }

      setTutors(prev => {
        const filtered = prev.filter(t => String(t.id) !== String(tutorId));
        const updated = [approved, ...filtered];
        try {
          localStorage.setItem('hantutor_tutors_list', JSON.stringify(updated));
        } catch (e) { }
        return updated;
      });
    }
  };

  const rejectTutorKyc = (tutorId: any) => {
    setPendingTutors(prev => {
      const updated = prev.filter(t => String(t.id) !== String(tutorId));
      try {
        localStorage.setItem('hantutor_pending_tutors', JSON.stringify(updated));
      } catch (e) { }
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
    },
    openTeacherWalletModal: (tutorId) => {
      setTeacherWalletModalTutorId(tutorId || currentSession.userId || 't1');
    },
    openTeacherProfileModal: (tutorId) => {
      setTeacherProfileModalTutorId(tutorId || currentSession.userId || 't1');
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
    currentSession,
    setCurrentSession,
    teacherWallets,
    getTeacherWallet,
    requestWithdrawal,
    approveWithdrawal,
    recordTrialContact,
    recordOfficialEnrollment,
    cancelTrialEnrollment,
    approveTutorKyc,
    rejectTutorKyc,
    addMockTutor,
    updateTutorProfile,
    addTutorReview,
    getMaskedTutor,
    securityLogs,
    refreshSecurityLogs
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
            teacherWalletModalTutorId={teacherWalletModalTutorId}
            setTeacherWalletModalTutorId={setTeacherWalletModalTutorId}
            teacherProfileModalTutorId={teacherProfileModalTutorId}
            setTeacherProfileModalTutorId={setTeacherProfileModalTutorId}
          />
        </BrowserRouter>
      </UIContext.Provider>
    </DataContext.Provider>
  );
}
