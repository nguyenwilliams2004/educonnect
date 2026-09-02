import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Users, Briefcase, GraduationCap } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialView?: 'login' | 'register';
  defaultRole?: 'student' | 'teacher';
}

export function AuthModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialView: propInitialView,
  defaultRole: propDefaultRole
}: AuthModalProps = {}) {
  const { authModalState, closeAuthModal, pendingTrialTutor, setPendingTrialTutor, openContactZaloModal } = useUI();
  const { setCurrentSession } = useData();
  const navigate = useNavigate();

  const isOpen = propIsOpen !== undefined ? propIsOpen : authModalState.isOpen;
  const onClose = propOnClose || closeAuthModal;
  const initialView = propInitialView || authModalState.view || 'login';
  const defaultRole = propDefaultRole || authModalState.defaultRole || 'student';

  const [view, setView] = useState<'login' | 'register' | 'forgot_step1' | 'forgot_step2' | 'forgot_step3'>(initialView);
  const [role, setRole] = useState<'student' | 'teacher'>(defaultRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);

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

  const handlePostAuthSuccess = (userRole: 'student' | 'teacher') => {
    if (userRole === 'student' && pendingTrialTutor) {
      const targetTutor = pendingTrialTutor;
      setPendingTrialTutor(null);
      onClose();
      setTimeout(() => {
        openContactZaloModal(targetTutor);
      }, 300);
    } else {
      onClose();
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isPhone = !identifier.includes('@');
      const tutorId = role === 'teacher' ? 't1' : 'usr_' + Date.now();
      setCurrentSession({
        userId: tutorId,
        role: role === 'student' ? 'student' : 'teacher',
        phone: isPhone ? identifier : '0912345678',
        email: isPhone ? 'giaovien.demo@hantutor.vn' : identifier,
        sessionToken: 'tok_' + Math.random().toString(36).substring(2)
      });
      alert(`Đăng nhập thành công với vai trò: ${role === 'student' ? 'Học sinh / Phụ huynh' : 'Giáo viên (Cô Sương Mai)'}!`);
      handlePostAuthSuccess(role);
    }, 500);
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
        setCurrentSession({
          userId: 'usr_' + Date.now(),
          role: 'student',
          phone: !identifier.includes('@') ? identifier : undefined,
          email: identifier.includes('@') ? identifier : undefined,
          sessionToken: 'tok_' + Math.random().toString(36).substring(2)
        });
        alert("Đăng ký tài khoản học sinh thành công!");
        handlePostAuthSuccess('student');
      }, 500);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      alert("Vui lòng nhập Email hoặc Số điện thoại để nhận mã OTP");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCountdown(60);
      setView('forgot_step2');
    }, 500);
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
    }, 500);
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
    }, 500);
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
              {pendingTrialTutor && (
                <div className="mt-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 text-center">
                  Đăng nhập để kết nối học thử 1-1 cùng <strong>{pendingTrialTutor.name}</strong>
                </div>
              )}
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
              {pendingTrialTutor && (
                <div className="mt-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 text-center">
                  Đăng ký để kết nối học thử 1-1 cùng <strong>{pendingTrialTutor.name}</strong>
                </div>
              )}
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
export default AuthModal;
