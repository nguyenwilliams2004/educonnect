import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  X,
  Users,
  Briefcase,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { supabase } from '../../../lib/supabase';

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
  defaultRole: propDefaultRole,
}: AuthModalProps = {}) {
  const { authModalState, closeAuthModal, pendingTrialTutor, setPendingTrialTutor, openContactZaloModal } = useUI();
  const { setCurrentSession } = useData();
  const navigate = useNavigate();

  const isOpen = propIsOpen !== undefined ? propIsOpen : authModalState.isOpen;
  const onClose = propOnClose || closeAuthModal;
  const initialView = propInitialView || authModalState.view || 'login';
  const defaultRole = propDefaultRole || authModalState.defaultRole || 'student';

  const [view, setView] = useState<'login' | 'register' | 'forgot_step1' | 'pending_verification'>(initialView);
  const [role, setRole] = useState<'student' | 'teacher'>(defaultRole);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    setView(initialView);
    setRole(defaultRole);
    setErrorMessage(authModalState.initialErrorMessage || null);
    if (authModalState.initialEmail) {
      setEmail(authModalState.initialEmail);
    }
    setSuccessMessage(null);
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [
    initialView,
    defaultRole,
    isOpen,
    authModalState.initialErrorMessage,
    authModalState.initialEmail,
  ]);

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

  // ĐĂNG NHẬP THẬT QUA SUPABASE AUTH
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Email hoặc mật khẩu không chính xác.');
        } else if (
          error.message.includes('Email not confirmed') ||
          error.message.toLowerCase().includes('not confirmed')
        ) {
          setErrorMessage(
            'Tài khoản chưa được kích hoạt qua email. Vui lòng kiểm tra hộp thư và nhấn vào liên kết xác nhận để kích hoạt tài khoản.'
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.user) {
        // Zero-Trust Check: Bắt buộc tài khoản đăng ký bằng email phải được xác thực qua link email
        if (!data.user.email_confirmed_at && data.user.app_metadata?.provider === 'email') {
          await supabase.auth.signOut();
          setErrorMessage(
            'Tài khoản chưa được kích hoạt qua email. Vui lòng mở email và nhấn vào liên kết xác nhận trước khi đăng nhập.'
          );
          return;
        }

        // Truy vấn bảng public.users để lấy hồ sơ
        let userRole = (data.user.user_metadata?.role as any) || role;
        let resolvedName = data.user.user_metadata?.full_name || '';
        let resolvedPhone = data.user.phone || data.user.user_metadata?.phone || '';

        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (dbUser) {
            userRole = dbUser.role === 'instructor' ? 'teacher' : dbUser.role;
            resolvedName = dbUser.full_name || resolvedName;
            resolvedPhone = dbUser.phone || resolvedPhone;
          }
        } catch {}

        const appRole = userRole === 'instructor' ? 'teacher' : (userRole as 'student' | 'teacher');

        setCurrentSession({
          userId: data.user.id,
          role: appRole,
          email: data.user.email,
          fullName: resolvedName,
          phone: resolvedPhone,
          sessionToken: data.session?.access_token,
        });

        setSuccessMessage('Đăng nhập thành công!');
        setTimeout(() => {
          handlePostAuthSuccess(appRole);
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage('Lỗi hệ thống: ' + (err.message || 'Không thể kết nối.'));
    } finally {
      setLoading(false);
    }
  };

  // GỬI LẠI LINK XÁC NHẬN EMAIL QUA SUPABASE AUTH
  const handleResendConfirmEmail = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email vào ô bên dưới để nhận link xác nhận mới.');
      return;
    }
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) {
        setErrorMessage('Không thể gửi lại email: ' + error.message);
      } else {
        setSuccessMessage(`Đã gửi lại link xác nhận tới ${cleanEmail}. Vui lòng kiểm tra hòm thư đến (và mục Spam)!`);
        setErrorMessage(null);
      }
    } catch (err: any) {
      setErrorMessage('Lỗi hệ thống: ' + (err.message || 'Không thể gửi lại email.'));
    } finally {
      setResendLoading(false);
    }
  };

  // ĐĂNG KÝ THẬT VÀ LƯU DATABASE SUPABASE
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (role === 'teacher') {
      onClose();
      navigate(`/dang-ky-gia-su?email=${encodeURIComponent(email.trim())}`);
      return;
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanPass = password.trim();
    const cleanConfirmPass = confirmPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      setErrorMessage('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMessage('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    if (cleanPass !== cleanConfirmPass) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp. Vui lòng kiểm tra lại!');
      return;
    }

    setLoading(true);
    try {
      const dbRole = 'student';
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          data: {
            full_name: cleanName,
            phone: cleanPhone || null,
            role: dbRole,
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setErrorMessage('Email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.user) {
        // Kiểm tra cơ chế bảo mật Supabase: Nếu email đã đăng ký từ trước, identities sẽ là mảng rỗng []
        const isExistingUser = data.user.identities && data.user.identities.length === 0;
        if (isExistingUser) {
          setErrorMessage(
            'Email này đã được đăng ký tài khoản từ trước. Vui lòng bấm "Chuyển sang Đăng nhập" bên dưới (hoặc bấm "Quên mật khẩu" nếu không nhớ mật khẩu).'
          );
          return;
        }

        // Ghi trực tiếp vào bảng public.users trên PostgreSQL
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: cleanEmail,
            full_name: cleanName,
            role: dbRole,
            phone: cleanPhone || null,
          });
        } catch (dbErr) {
          console.warn('[Register] Upsert public.users:', dbErr);
        }

        // BẮT BUỘC XÁC THỰC EMAIL:
        // Nếu tài khoản chưa xác thực qua email, chuyển sang màn hình chờ xác thực
        if (!data.user.email_confirmed_at) {
          setView('pending_verification');
          setErrorMessage(null);
          setSuccessMessage(null);
          return;
        }

        // Nếu tài khoản đã được xác thực trước
        if (data.session) {
          setCurrentSession({
            userId: data.user.id,
            role: 'student',
            email: cleanEmail,
            fullName: cleanName,
            phone: cleanPhone,
            sessionToken: data.session.access_token,
          });
          setSuccessMessage('Đăng ký tài khoản thành công!');
          setTimeout(() => {
            handlePostAuthSuccess('student');
          }, 600);
        }
      }
    } catch (err: any) {
      setErrorMessage('Lỗi hệ thống: ' + (err.message || 'Không thể đăng ký.'));
    } finally {
      setLoading(false);
    }
  };

  // ĐĂNG NHẬP GOOGLE 1-CHẠM THẬT
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });
      if (error) {
        setErrorMessage('Lỗi Google Auth: ' + error.message);
        return;
      }
      if (data?.url) {
        // Kiểm tra nhanh xem Google Provider đã được bật trên Supabase chưa
        try {
          const check = await fetch(data.url, { redirect: 'manual' });
          if (check.status === 400) {
            const body = await check.json().catch(() => null);
            if (body?.msg?.includes('provider is not enabled')) {
              setErrorMessage(
                'Google Provider hiện đang TẮT trên Supabase. ' +
                'Vui lòng vào Supabase Dashboard -> Authentication -> Providers -> Bật Google (theo Day 4), ' +
                'hoặc đăng ký/đăng nhập bằng Email ở bên dưới!'
              );
              return;
            }
          }
        } catch {}
        // Nếu đã bật, chuyển hướng đến Google
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể khởi động Google OAuth');
    } finally {
      setLoading(false);
    }
  };

  // GỬI LINK ĐẶT LẠI MẬT KHẨU QUA EMAIL THẬT
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ Email cần khôi phục mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage('Đã gửi email khôi phục mật khẩu! Vui lòng kiểm tra hòm thư đến của bạn.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi gửi yêu cầu khôi phục');
    } finally {
      setLoading(false);
    }
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

        {/* THÔNG BÁO LỖI / THÀNH CÔNG INLINE */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium flex-1">
              <div>{errorMessage}</div>
              {(errorMessage.toLowerCase().includes('xác nhận') ||
                errorMessage.toLowerCase().includes('xác thực') ||
                errorMessage.toLowerCase().includes('not confirmed') ||
                errorMessage.toLowerCase().includes('expired') ||
                errorMessage.toLowerCase().includes('hết hạn') ||
                errorMessage.toLowerCase().includes('invalid')) && (
                <div className="mt-2.5 pt-2 border-t border-red-200/80 flex flex-col gap-1.5">
                  <p className="text-[11px] text-red-600 font-normal">
                    Link xác nhận hết hạn hoặc chưa nhận được email? Bấm nút bên dưới để nhận link mới:
                  </p>
                  <button
                    type="button"
                    onClick={handleResendConfirmEmail}
                    disabled={resendLoading || !email.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {resendLoading ? 'Đang gửi link...' : 'Gửi lại link xác nhận email'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{successMessage}</div>
          </div>
        )}

        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">Chào mừng trở lại</h2>
              <p className="text-sm text-slate-500 mt-1">Đăng nhập tài khoản HanTutor của bạn</p>
              {pendingTrialTutor && (
                <div className="mt-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 text-center">
                  Đăng nhập để kết nối học thử 1-1 cùng <strong>{pendingTrialTutor.name}</strong>
                </div>
              )}
            </div>

            {/* Nút Đăng nhập Google 1-Chạm */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full mb-4 py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Tiếp tục với Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-slate-400 font-medium">Hoặc với Email</span></div>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot_step1'); setErrorMessage(null); }}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Chưa có tài khoản?{' '}
              <button
                onClick={() => { setView('register'); setErrorMessage(null); }}
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
            <div className="grid grid-cols-2 gap-2.5 mb-5">
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
                    Tạo hồ sơ giảng dạy chuẩn quốc tế, công khai phương pháp dạy và nhận lớp học 1-1 với tỷ lệ thành công cao.
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
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên học sinh / phụ huynh</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại (Nhận liên hệ Zalo)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu (Tối thiểu 6 ký tự)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                      title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản học sinh'}
                </button>
              </form>
            )}

            <div className="mt-5 text-center text-xs text-slate-500">
              Đã có tài khoản?{' '}
              <button
                onClick={() => { setView('login'); setErrorMessage(null); }}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {view === 'forgot_step1' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Quên mật khẩu</h2>
              <p className="text-xs text-slate-500 mt-1">Nhập Email đã đăng ký để nhận liên kết đặt lại mật khẩu</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email tài khoản</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang gửi email...' : 'Gửi liên kết khôi phục mật khẩu'}
              </button>
            </form>

            <button
              onClick={() => { setView('login'); setErrorMessage(null); }}
              className="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              ← Quay lại Đăng nhập
            </button>
          </div>
        )}

        {/* PENDING EMAIL VERIFICATION VIEW */}
        {view === 'pending_verification' && (
          <div className="text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner ring-8 ring-blue-50/50">
              <Mail className="w-8 h-8 animate-pulse text-blue-600" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-1.5">Xác thực tài khoản Email</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mb-3">
              Một liên kết xác nhận đã được gửi đến hòm thư:
            </p>
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl py-2 px-3 inline-block font-semibold text-blue-700 text-xs mb-4 break-all">
              {email}
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left mb-5 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                Yêu cầu bảo mật bắt buộc:
              </p>
              <p className="text-amber-800/90 leading-relaxed">
                Bạn <strong>bắt buộc phải bấm vào liên kết trong email</strong> để kích hoạt tài khoản thì mới có thể đăng nhập vào hệ thống.
              </p>
            </div>

            <div className="space-y-2.5">
              {email.toLowerCase().includes('@gmail.com') && (
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <span>Mở hòm thư Gmail</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <button
                type="button"
                onClick={handleResendConfirmEmail}
                disabled={resendLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                <span>{resendLoading ? 'Đang gửi lại...' : 'Chưa nhận được? Gửi lại email xác thực'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer pt-2 inline-block"
              >
                Đã bấm link kích hoạt? <strong>Chuyển sang Đăng nhập</strong>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
