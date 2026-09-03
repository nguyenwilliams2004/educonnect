import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Search, Menu, X, ChevronRight, User } from 'lucide-react';
import { Logo } from './Logo';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';

export function Navbar() {
  const {
    openAuthModal,
    openMyTrialsModal,
    openTeacherWalletModal,
    openTeacherProfileModal,
    openStudentProfileModal
  } = useUI();
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
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-2xs cursor-pointer transition-all active:scale-95"
                    title="Chỉnh sửa thông tin hồ sơ giáo viên"
                  >
                    <span>Hồ sơ của tôi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openTeacherWalletModal(currentSession.userId || 't1')}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-200 cursor-pointer transition-all active:scale-95"
                    title="Mở Ví Thu Nhập"
                  >
                    <span>Ví: {getTeacherWallet(currentSession.userId || 't1').balance.toLocaleString()}đ</span>
                  </button>
                </>
              )}

              {currentSession.role === 'student' && (
                <button
                  type="button"
                  onClick={openStudentProfileModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs cursor-pointer transition-all active:scale-95"
                  title="Xem và chỉnh sửa hồ sơ học sinh"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hồ sơ của tôi</span>
                </button>
              )}

              <span className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${
                currentSession.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                currentSession.role === 'teacher' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
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
                  <User className="w-4 h-4 text-blue-600" />
                  <span>👤 Hồ sơ học sinh của tôi</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </button>
            )}

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

export default Navbar;
