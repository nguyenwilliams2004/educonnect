import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  User,
  Calendar,
  Wallet,
  BookOpen,
  Shield,
  LogOut,
  ExternalLink,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { Logo } from './Logo';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const {
    openAuthModal,
    openMyTrialsModal,
    openTeacherWalletModal,
    openTeacherProfileModal,
    openStudentProfileModal,
    openUserProfileModal
  } = useUI();
  const { myTrials, currentSession, getTeacherWallet } = useData();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTrialsCount = myTrials.filter(t => t.status === 'trial_in_progress').length;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Close menus on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener for avatar dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const userAvatar =
    currentSession.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400';

  const displayName =
    currentSession.name ||
    currentSession.fullName ||
    (currentSession.role === 'teacher'
      ? 'Giáo viên'
      : currentSession.role === 'admin'
      ? 'Quản trị viên'
      : 'Học sinh');

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
            Tìm gia sư
          </Link>

          {currentSession.role === 'teacher' ? (
            <Link
              to="/dang-ky-gia-su"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              Hồ sơ gia sư
              <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Đối tác
              </span>
            </Link>
          ) : (
            <Link
              to="/dang-ky-gia-su"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Trở thành gia sư
            </Link>
          )}

          {currentSession.role !== 'anonymous' && (
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

        {/* Nút hành động góc phải */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            to="/tim-gia-su"
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
            title="Tìm kiếm"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          {currentSession.role !== 'anonymous' ? (
            /* AVATAR DROPDOWN (Khi đã đăng nhập) */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full hover:bg-slate-100/80 border border-slate-200 transition-all cursor-pointer group active:scale-95"
                title="Tài khoản cá nhân"
              >
                <div className="relative shrink-0">
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="hidden sm:flex flex-col text-left max-w-[120px]">
                  <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 leading-none mt-0.5">
                    {currentSession.role === 'teacher'
                      ? 'Giáo viên'
                      : currentSession.role === 'admin'
                      ? 'Quản trị viên'
                      : 'Học sinh'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    userDropdownOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-600'
                  }`}
                />
              </button>

              {/* VERTICAL DROPDOWN MENU */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200/80 py-1 z-50 animate-in fade-in duration-150">
                  {/* Header tóm tắt tài khoản: Tối giản, không gradient */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={userAvatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {currentSession.email || currentSession.phone || 'Tài khoản tiêu chuẩn'}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            currentSession.role === 'admin'
                              ? 'bg-[#FDEBEC] text-[#9F2F2D] border-[#f7d6d7]'
                              : currentSession.role === 'teacher'
                              ? 'bg-[#E1F3FE] text-[#1F6C9F] border-[#cbe6fa]'
                              : 'bg-[#EDF3EC] text-[#346538] border-[#d5e4d3]'
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          {currentSession.role === 'admin'
                            ? 'Quản trị viên'
                            : currentSession.role === 'teacher'
                            ? 'Giáo viên đối tác'
                            : 'Học sinh / Phụ huynh'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Options Menu: Flat, clean typographic hierarchy */}
                  <div className="p-1.5 space-y-0.5">
                    {/* Option 1: Cài đặt hồ sơ tiêu chuẩn */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openUserProfileModal();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                    >
                      <User className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 group-hover:text-slate-900">Cài đặt & Hồ sơ của tôi</p>
                        <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                          Họ tên, số điện thoại, đổi ảnh đại diện
                        </p>
                      </div>
                    </button>

                    {/* Options dành riêng cho Giáo viên */}
                    {currentSession.role === 'teacher' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openTeacherProfileModal(currentSession.userId || 't1');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                        >
                          <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 group-hover:text-slate-900">Hồ sơ giảng dạy & Bảng giá</p>
                            <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                              Giới thiệu kinh nghiệm và môn học
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openTeacherWalletModal(currentSession.userId || 't1');
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Wallet className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 group-hover:text-slate-900">Ví thu nhập & Rút tiền</p>
                              <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                                Tài khoản ngân hàng, yêu cầu rút
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 shrink-0 ml-2">
                            {getTeacherWallet(currentSession.userId || 't1').balance.toLocaleString()}đ
                          </span>
                        </button>

                        <Link
                          to={`/giao-vien/${currentSession.userId || 't1'}`}
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 group-hover:text-slate-900">Xem trang hồ sơ công khai</p>
                            <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                              Giao diện phụ huynh nhìn thấy
                            </p>
                          </div>
                        </Link>
                      </>
                    )}

                    {/* Options dành riêng cho Học sinh */}
                    {currentSession.role === 'student' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openStudentProfileModal();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                        >
                          <GraduationCap className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 group-hover:text-slate-900">Hồ sơ học tập chi tiết</p>
                            <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                              Lớp học, trường học và địa chỉ
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openMyTrialsModal();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Calendar className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 group-hover:text-slate-900">Lịch học thử đã đặt</p>
                              <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                                Lịch hẹn và kết nối gia sư
                              </p>
                            </div>
                          </div>
                          {myTrials.length > 0 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0 ml-2">
                              {myTrials.length}
                            </span>
                          )}
                        </button>
                      </>
                    )}

                    {/* Admin option */}
                    {currentSession.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                      >
                        <Shield className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 group-hover:text-slate-900">Bảng quản trị Admin</p>
                          <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                            Duyệt KYC gia sư và đối soát
                          </p>
                        </div>
                      </Link>
                    )}

                    {/* Divider */}
                    <div className="my-1 border-t border-slate-100" />

                    {/* Logout button */}
                    <button
                      type="button"
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer text-left group"
                    >
                      <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Khi CHƯA đăng nhập */
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

      {/* Thanh điều hướng 3 mục trên điện thoại */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50/95 px-2 py-1.5 flex items-center justify-around gap-1 overflow-x-auto scrollbar-none">
        <Link
          to="/"
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${isActive('/') ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
        >
          Trang chủ
        </Link>
        <Link
          to="/tim-gia-su"
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${isActive('/tim-gia-su') ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
        >
          Tìm gia sư
        </Link>
        <Link
          to="/dang-ky-gia-su"
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${isActive('/dang-ky-gia-su') ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200/60'}`}
        >
          Trở thành gia sư
        </Link>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {/* User info on mobile drawer */}
          {currentSession.role !== 'anonymous' && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {currentSession.email || currentSession.phone || 'Đang đăng nhập'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openUserProfileModal();
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 cursor-pointer"
              >
                Cài đặt
              </button>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/tim-gia-su"
              className="flex items-center justify-between p-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
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

            {currentSession.role === 'student' && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openStudentProfileModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>👤 Hồ sơ học sinh của tôi</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </button>
            )}

            {currentSession.role === 'teacher' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openTeacherProfileModal(currentSession.userId || 't1');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Hồ sơ giảng dạy của tôi</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openTeacherWalletModal(currentSession.userId || 't1');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Ví thù lao & Rút tiền</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">
                    {getTeacherWallet(currentSession.userId || 't1').balance.toLocaleString()}đ
                  </span>
                </button>
              </>
            )}

            <Link
              to="/dang-ky-gia-su"
              className="flex items-center justify-between p-3 rounded-xl text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100"
            >
              <span>💼 Đăng ký làm Gia sư / Giáo viên</span>
              <ChevronRight className="w-4 h-4 text-amber-600" />
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100">
            {currentSession.role !== 'anonymous' ? (
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Đăng xuất tài khoản</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 text-center cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register', 'student');
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 text-center shadow-xs cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
export default Navbar;
