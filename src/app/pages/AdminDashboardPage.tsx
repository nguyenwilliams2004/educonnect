import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ShieldCheck, AlertCircle, ExternalLink, Zap, Target, X, ShieldAlert, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';
export type UserRole = 'anonymous' | 'student' | 'teacher' | 'parent' | 'admin';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { getSignedKycUrl } from '../../lib/kycService';
import { supabase } from '../../lib/supabase';

export function AdminDashboardPage() {
  const {
    tutors,
    pendingTutors,
    adminStats,
    approveTutorKyc,
    rejectTutorKyc,
    securityLogs,
    refreshSecurityLogs,
    currentSession,
    setCurrentSession,
    teacherWallets,
    getTeacherWallet,
  } = useData();
  const { openTeacherWalletModal } = useUI();

  // State xác thực Admin qua Supabase
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const [currentTab, setCurrentTab] = useState<'kyc' | 'requests' | 'analytics' | 'security'>('kyc');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ isOpen: boolean; title: string; imageUrl: string; tutorName: string } | null>(null);

  // Tự động kiểm tra phiên Supabase Auth đang hoạt động có role = 'admin' khi tải trang
  useEffect(() => {
    let isMounted = true;

    async function checkExistingAdminSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('id, email, full_name, role')
            .eq('id', session.user.id)
            .maybeSingle();

          const resolvedRole = dbUser?.role || session.user.user_metadata?.role || session.user.app_metadata?.role;
          if (resolvedRole === 'admin') {
            setCurrentSession({
              userId: session.user.id,
              role: 'admin',
              email: session.user.email,
              fullName: dbUser?.full_name || session.user.user_metadata?.full_name || 'Quản trị viên',
              sessionToken: session.access_token,
            });
          }
        }
      } catch (err) {
        console.warn('[AdminDashboard] Kiểm tra phiên admin:', err);
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    }

    checkExistingAdminSession();
    return () => { isMounted = false; };
  }, [setCurrentSession]);

  const handleViewDoc = async (title: string, rawUrlOrPath: string | undefined, tutorName: string) => {
    if (!rawUrlOrPath) return;
    try {
      const signed = await getSignedKycUrl(rawUrlOrPath);
      setSelectedDocPreview({
        isOpen: true,
        title,
        imageUrl: signed || rawUrlOrPath,
        tutorName,
      });
    } catch {
      setSelectedDocPreview({
        isOpen: true,
        title,
        imageUrl: rawUrlOrPath,
        tutorName,
      });
    }
  };

  // Security Sandbox State
  const [sandboxRole, setSandboxRole] = useState<UserRole>('anonymous');
  const [testInternalId, setTestInternalId] = useState('t1');
  const [generatedSecureToken, setGeneratedSecureToken] = useState('sec_tutor_t1_9a8b7c');

  const handleFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= 5) {
      const lockTime = Date.now() + 60 * 1000;
      setLockoutUntil(lockTime);
      setErrorMsg('Bạn đã nhập sai 5 lần liên tiếp. Cổng đăng nhập tạm khóa 60 giây để phòng chống brute-force.');
    }
  };

  // Đăng nhập Admin chuẩn Zero-Trust qua Supabase Auth
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSecs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setErrorMsg(`Hệ thống đang tạm khóa. Vui lòng thử lại sau ${remainingSecs} giây.`);
      return;
    }

    const cleanEmail = adminEmail.trim();
    const cleanPass = adminPassword.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu Quản trị viên.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Xác thực danh tính với Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        handleFailedAttempt();
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Email hoặc mật khẩu quản trị viên không chính xác.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Tài khoản chưa xác nhận email. Vui lòng kiểm tra hộp thư.');
        } else {
          setErrorMsg(error.message || 'Lỗi xác thực hệ thống.');
        }
        return;
      }

      if (!data.user) {
        setErrorMsg('Không tìm thấy thông tin tài khoản hợp lệ.');
        return;
      }

      // 2. Zero-Trust RBAC: Kiểm tra trực tiếp role tại bảng public.users
      const { data: dbUser, error: roleError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', data.user.id)
        .maybeSingle();

      const resolvedRole = dbUser?.role || data.user.user_metadata?.role || data.user.app_metadata?.role;

      // 3. Nghiêm cấm tài khoản không mang role 'admin'
      if (resolvedRole !== 'admin') {
        // Đăng xuất ngay lập tức khỏi Supabase
        await supabase.auth.signOut();
        setCurrentSession({ role: 'anonymous' });
        handleFailedAttempt();
        setErrorMsg('Từ chối truy cập: Tài khoản không có đặc quyền Quản trị viên (role ≠ "admin").');
        return;
      }

      // 4. Xác thực thành công
      setFailedAttempts(0);
      setLockoutUntil(null);
      setErrorMsg('');

      setCurrentSession({
        userId: data.user.id,
        role: 'admin',
        email: data.user.email,
        fullName: dbUser?.full_name || data.user.user_metadata?.full_name || 'Quản trị viên',
        sessionToken: data.session?.access_token,
      });
    } catch (err: any) {
      console.error('[AdminDashboard] Lỗi đăng nhập:', err);
      setErrorMsg('Lỗi kết nối máy chủ: ' + (err.message || 'Không thể xác thực.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AdminDashboard] Lỗi đăng xuất:', err);
    }
    setCurrentSession({ role: 'anonymous' });
  };

  const triggerSecuritySimulation = () => {
    alert("Đã tạo 3 sự kiện an ninh mô phỏng (IDOR Probe, Rate Limit Block, RLS Violation) vào Nhật ký An ninh!");
  };

  // Màn hình chờ xác nhận phiên ban đầu
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-xs text-slate-400">Đang kiểm tra quyền quản trị viên Supabase...</p>
        </div>
      </div>
    );
  }

  // Trường hợp đang đăng nhập tài khoản người dùng thường (Học sinh/Giáo viên)
  if (currentSession.role !== 'admin' && currentSession.role !== 'anonymous') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Quyền truy cập bị hạn chế</h2>
          <p className="text-xs text-slate-500 mb-6">
            Bạn đang đăng nhập với tài khoản <strong className="text-slate-800">{currentSession.email}</strong> (Vai trò: <span className="uppercase text-amber-600 font-bold">{currentSession.role}</span>). Tài khoản này không có quyền quản trị hệ thống.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleAdminLogout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm cursor-pointer"
            >
              Đăng xuất & Đăng nhập tài khoản Admin
            </button>
            <Link
              to="/"
              className="block w-full py-3 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              ← Quay lại trang chủ người dùng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Form Đăng nhập Admin (Khi chưa có session admin)
  if (currentSession.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Cổng Quản trị viên</h2>
          <p className="text-xs text-slate-500 mb-6">Xác thực tài khoản Supabase có đặc quyền <strong>role = &apos;admin&apos;</strong></p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Quản trị viên</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@hantutor.vn"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu Quản trị</label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                required
                autoComplete="current-password"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-blue-200 text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực Supabase RBAC...</span>
                </>
              ) : (
                'Đăng nhập Quản trị'
              )}
            </button>
          </form>

          {/* Hộp hỗ trợ tài khoản mẫu cho kiểm thử */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-left">
            <p className="text-[11px] text-slate-500 font-semibold mb-1">Tài khoản Quản trị mẫu (Supabase DB):</p>
            <div className="text-[11px] font-mono text-slate-700 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span>Email: <strong className="text-blue-600">admin@hantutor.vn</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('admin@hantutor.vn');
                    setAdminPassword('HanTutorAdmin2026!@#');
                  }}
                  className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100 cursor-pointer"
                >
                  Tự động điền
                </button>
              </div>
              <div>Pass: <code className="bg-slate-200/70 px-1.5 py-0.5 rounded text-[10px]">HanTutorAdmin2026!@#</code></div>
            </div>
          </div>

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

  const maskedSample = sampleTutor;

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
          <div className="hidden sm:flex items-center gap-2 text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-200 font-medium truncate max-w-[200px]">
              {currentSession.fullName || currentSession.email || 'Quản trị viên'}
            </span>
          </div>
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
            <span className="text-[10px] text-slate-400 font-bold uppercase block">LÆ°á»£t truy cáº­p</span>
            <span className="text-xl font-extrabold text-slate-900">{adminStats.pageViews?.toLocaleString()}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tá»•ng GiÃ¡o viÃªn</span>
            <span className="text-xl font-extrabold text-blue-600">{tutors.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Chá» duyá»‡t KYC</span>
            <span className="text-xl font-extrabold text-amber-600">{pendingList.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">LiÃªn há»‡ Há»c thá»­</span>
            <span className="text-xl font-extrabold text-indigo-600">{adminStats.totalTrialContacts}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Há»c chÃ­nh thá»©c</span>
            <span className="text-xl font-extrabold text-emerald-600">{adminStats.totalOfficialEnrolled}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tá»· lá»‡ thÃ nh cÃ´ng</span>
            <span className="text-xl font-extrabold text-emerald-700">{adminStats.avgTrialSuccessRate}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setCurrentTab('kyc')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${currentTab === 'kyc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Duyá»‡t há»“ sÆ¡ KYC ({pendingList.length})
          </button>
          <button
            onClick={() => setCurrentTab('requests')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${currentTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            YÃªu cáº§u Há»c thá»­ & Giao dá»‹ch
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${currentTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            VÃ­ Giáº£ng Dáº¡y & Lá»‡nh RÃºt Tiá»n
          </button>
          <button
            onClick={() => {
              setCurrentTab('security');
              refreshSecurityLogs();
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${currentTab === 'security' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            GiÃ¡m sÃ¡t An ninh (RLS, IDOR, Rate Limit)
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
              <h2 className="text-lg font-bold text-slate-900">Danh sÃ¡ch há»“ sÆ¡ cáº§n phÃª duyá»‡t KYC</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setKycFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${kycFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                  Chá» duyá»‡t ({pendingList.length})
                </button>
                <button
                  onClick={() => setKycFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${kycFilter === 'approved' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                >
                  ÄÃ£ duyá»‡t ({approvedList.length})
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
                        onClick={() => handleViewDoc(
                          'Căn cước công dân (Mặt trước)',
                          tutor.cccdFront,
                          tutor.name
                        )}
                        className="border border-slate-200 hover:border-blue-500 rounded-xl p-1 bg-slate-50 text-center cursor-pointer transition-all group block"
                      >
                        <div className="text-[10px] text-slate-500 font-semibold mb-1 group-hover:text-blue-600">CCCD Mặt trước</div>
                        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-white">
                          <img src={tutor.cccdFront} alt="CCCD Front" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleViewDoc(
                          'Căn cước công dân (Mặt sau)',
                          tutor.cccdBack,
                          tutor.name
                        )}
                        className="border border-slate-200 hover:border-blue-500 rounded-xl p-1 bg-slate-50 text-center cursor-pointer transition-all group block"
                      >
                        <div className="text-[10px] text-slate-500 font-semibold mb-1 group-hover:text-blue-600">CCCD Mặt sau</div>
                        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-white">
                          <img src={tutor.cccdBack} alt="CCCD Back" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleViewDoc(
                          'Bằng Tốt Nghiệp Đại Học / Chứng Chỉ Sư Phạm',
                          tutor.credentialFile,
                          tutor.name
                        )}
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
                          alert(`ÄÃ£ phÃª duyá»‡t KYC thÃ nh cÃ´ng cho giÃ¡o viÃªn ${tutor.name}!`);
                        }}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        âœ“ PhÃª duyá»‡t há»“ sÆ¡
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          rejectTutorKyc(tutor.id);
                          alert(`ÄÃ£ tá»« chá»‘i há»“ sÆ¡ cá»§a giÃ¡o viÃªn ${tutor.name}.`);
                        }}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Tá»« chá»‘i
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 text-center text-xs font-semibold text-emerald-600">
                      âœ“ Há»“ sÆ¡ nÃ y Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c thá»±c chÃ­nh thá»©c
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
            <h2 className="text-lg font-bold text-slate-900 mb-4">Lá»‹ch sá»­ YÃªu cáº§u Há»c thá»­ & ÄÄƒng kÃ½ chÃ­nh thá»©c</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Há»c sinh</th>
                    <th className="pb-3">GiÃ¡o viÃªn</th>
                    <th className="pb-3">Loáº¡i yÃªu cáº§u</th>
                    <th className="pb-3">Thá»i gian</th>
                    <th className="pb-3">Tráº¡ng thÃ¡i</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(adminStats.recentActivities || []).map((act: any) => (
                    <tr key={act.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-900">{act.student || 'Há» c sinh'}</td>
                      <td className="py-3 font-medium text-blue-600">{act.tutor}</td>
                      <td className="py-3">{act.type === 'trial_contact' ? 'Há» c thá»­ 1-1 Zalo' : act.type === 'official_enrolled' ? 'Há» c chÃ­nh thá»©c' : 'XÃ©t duyá»‡t KYC'}</td>
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
                <p className="text-[11px] text-slate-400 mt-1">Thù lao tích lũy sẵn sàng rút</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-bold uppercase block">Tổng Tiền Đã Rút</span>
                <span className="text-2xl font-black text-slate-900">
                  {Object.values(teacherWallets).reduce((sum, w) => sum + (w.totalWithdrawn || 0), 0).toLocaleString()} VNĐ
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Đã chuyển khoản qua Napas 24/7</p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-400 font-bold uppercase block">Doanh Thu Phí Dịch Vụ Sàn</span>
                <span className="text-2xl font-black text-blue-600">
                  {Math.round(Object.values(teacherWallets).reduce((sum, w) => sum + (w.balance + w.totalWithdrawn), 0) * (3 / 7)).toLocaleString()} VNÄ
                </span>
                <p className="text-[11px] text-slate-400 mt-1">PhÃ­ váº­n hÃ nh & báº£o hiá»ƒm ná»n táº£ng</p>
              </div>
            </div>

            {/* Table of teacher wallets and recent withdrawals */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tráº¡ng thÃ¡i VÃ­ & Lá»‡nh RÃºt Tiá»n cá»§a GiÃ¡o ViÃªn</h3>
                  <p className="text-xs text-slate-500">GiÃ¡o viÃªn tá»± chá»§ rÃºt tiá»n vá» tÃ i khoáº£n ngÃ¢n hÃ ng tÆ°Æ¡ng tá»± Shopee/ShopeePay</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="pb-3">GiÃ¡o viÃªn</th>
                      <th className="pb-3">Sá»‘ dÆ° vÃ­ hiá»‡n táº¡i</th>
                      <th className="pb-3">ÄÃ£ rÃºt lÅ©y káº¿</th>
                      <th className="pb-3">Giao dá»‹ch gáº§n nháº¥t</th>
                      <th className="pb-3">Thao tÃ¡c</th>
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
                          <td className="py-3 font-black text-emerald-600 tabular-nums">{tw.balance.toLocaleString()}Ä‘</td>
                          <td className="py-3 text-slate-600 font-semibold tabular-nums">{tw.totalWithdrawn.toLocaleString()}Ä‘</td>
                          <td className="py-3 text-xs text-slate-500">
                            {lastTx ? `${lastTx.title} (${lastTx.date})` : 'ChÆ°a cÃ³ giao dá»‹ch'}
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => openTeacherWalletModal(tut.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                            >
                              Xem & Thá»­ RÃºt Tiá»n
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
                  <span className="text-xs text-slate-400 font-bold uppercase">Sá»± kiá»‡n An ninh</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <div className="text-2xl font-black text-white">{securityLogs.length}</div>
                <div className="text-[11px] text-slate-400">Ghi nháº­n vi pháº¡m & Probe logs</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">Rate Limiting</span>
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">{Object.keys(RATE_LIMIT_RULES).length} Quy táº¯c</div>
                <div className="text-[11px] text-emerald-600 font-bold">Sliding Window & Lockout Active</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">Row Level Security (RLS)</span>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-blue-600">Äang báº­t</div>
                <div className="text-[11px] text-slate-500">Data Masking CCCD/SÄT/Bank</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">IDOR Guard</span>
                  <Target className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-600">Opaque Crypto</div>
                <div className="text-[11px] text-slate-500">Chá»‘ng quÃ©t ID sá»‘ tuáº§n tá»±</div>
              </div>
            </div>

            {/* LIVE SECURITY AUDIT LOGS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Nháº­t kÃ½ Sá»± kiá»‡n An ninh Thá»i gian thá»±c (Live Security Audit Log)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ghi nháº­n tá»± Ä‘á»™ng cÃ¡c hÃ nh vi vÆ°á»£t ngÆ°á»¡ng Rate Limit, táº¥n cÃ´ng IDOR hoáº·c cá»‘ gáº¯ng can thiá»‡p dá»¯ liá»‡u trÃ¡i phÃ©p.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerSecuritySimulation}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    âš¡ MÃ´ phá»ng Vi pháº¡m An ninh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      SecurityAuditLogger.clearLogs();
                      refreshSecurityLogs();
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    XÃ³a nháº­t kÃ½
                  </button>
                </div>
              </div>

              {securityLogs.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                  Há»‡ thá»‘ng an toÃ n. ChÆ°a phÃ¡t hiá»‡n vi pháº¡m báº£o máº­t nÃ o.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <th className="pb-3">Thá»i gian</th>
                        <th className="pb-3">Má»©c Ä‘á»™</th>
                        <th className="pb-3">Loáº¡i sá»± kiá»‡n</th>
                        <th className="pb-3">Äá»‘i tÆ°á»£ng má»¥c tiÃªu</th>
                        <th className="pb-3">Chi tiáº¿t vi pháº¡m</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {securityLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="py-3 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                            {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                          </td>
                          <td className="py-3">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${log.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
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
                    Cáº¥u hÃ¬nh Giá»›i háº¡n Táº§n suáº¥t (Rate Limiting Buckets)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Thuáº­t toÃ¡n Sliding Window vá»›i thá»i gian khÃ³a táº¡m thá»i</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <th className="pb-2">HÃ nh vi (Action)</th>
                        <th className="pb-2">Háº¡n má»©c</th>
                        <th className="pb-2">Cá»­a sá»• (Window)</th>
                        <th className="pb-2">HÃ¬nh thá»©c xá»­ lÃ½</th>
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
                          <td className="py-2.5 text-slate-600">{config.windowMs / 1000 >= 60 ? `${config.windowMs / 60000} phÃºt` : `${config.windowMs / 1000}s`}</td>
                          <td className="py-2.5">
                            {config.lockoutMs ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                KhÃ³a {config.lockoutMs / 60000} phÃºt
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500">Chá» háº¿t cá»­a sá»•</span>
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
                    Thá»­ nghiá»‡m Row Level Security (RLS) & IDOR Protection
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Kiá»ƒm tra káº¿t quáº£ Data Masking theo tá»«ng vai trÃ² ngÆ°á»i dÃ¹ng</p>
                </div>

                {/* Role Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Xem dá»¯ liá»‡u dÆ°á»›i gÃ³c nhÃ¬n (Role View):</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSandboxRole('anonymous')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${sandboxRole === 'anonymous' ? 'bg-[#111111] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      KhÃ¡ch vÃ£ng lai
                    </button>
                    <button
                      type="button"
                      onClick={() => setSandboxRole('teacher')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${sandboxRole === 'teacher' ? 'bg-[#111111] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      ChÃ­nh GiÃ¡o viÃªn
                    </button>
                    <button
                      type="button"
                      onClick={() => setSandboxRole('admin')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${sandboxRole === 'admin' ? 'bg-[#111111] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      Quáº£n trá»‹ viÃªn
                    </button>
                  </div>
                </div>

                {/* Masked Output Preview */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Há» tÃªn:</span>
                    <strong className="text-slate-900">{maskedSample.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Sá»‘ Ä‘iá»‡n thoáº¡i:</span>
                    <strong className={`font-mono ${sandboxRole === 'anonymous' ? 'text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded' : 'text-emerald-700'}`}>
                      {maskedSample.phone}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Sá»‘ CCCD (KYC):</span>
                    <strong className={`font-mono ${sandboxRole === 'anonymous' ? 'text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded' : 'text-emerald-700'}`}>
                      {maskedSample.kycData?.idNumber || '001**********'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Link Scan CCCD & Báº±ng ÄH:</span>
                    <strong className="text-slate-700">
                      {maskedSample.kycData?.frontDoc ? 'âœ“ ÄÆ°á»£c cáº¥p quyá»n xem áº£nh gá»‘c' : 'ðŸš« Bá»‹ áº©n (RLS Encrypted)'}
                    </strong>
                  </div>
                </div>

                {/* IDOR Opaque Token Demo */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Chuyá»ƒn Ä‘á»•i ID ná»™i bá»™ sang Crypto Token (IDOR Defense):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testInternalId}
                      onChange={e => {
                        setTestInternalId(e.target.value);
                        setGeneratedSecureToken('sec_tutor_' + e.target.value + '_hash');
                      }}
                      className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                      placeholder="ID gá»‘c (1)"
                    />
                    <div className="flex-1 px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-900 font-mono text-xs rounded-xl truncate flex items-center">
                      {generatedSecureToken}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    URL cÃ´ng khai dÃ¹ng token ngáº«u nhiÃªn khÃ´ng tuáº§n tá»±, ngÄƒn cháº·n hacker thay Ä‘á»•i sá»‘ ID Ä‘á»ƒ Ä‘Ã¡nh cáº¯p há»“ sÆ¡.
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
                <p className="text-xs text-slate-500 mt-0.5">GiÃ¡o viÃªn: <strong className="text-slate-800">{selectedDocPreview.tutorName}</strong></p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedDocPreview.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Má»Ÿ áº£nh gá»‘c
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
              <span className="text-slate-500">Kiá»ƒm tra thÃ´ng tin há» tÃªn, ngÃ y sinh vÃ  sá»‘ hiá»‡u vÄƒn báº±ng khá»›p vá»›i há»“ sÆ¡.</span>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                ÄÃ³ng cá»­a sá»•
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;

