import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import {
  DataContext,
  DataProvider,
  useData,
  StudentTrialItem,
  WalletTransaction,
  TeacherWallet,
  DataContextType,
} from '../context/DataContext';
import {
  UIContext,
  UIProvider,
  useUI,
  UIContextType,
  AuthModalState,
  CheckoutModalState,
  ReviewModalState
} from '../context/UIContext';
import { Logo } from './components/Logo';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import FloatingContactDock from './components/FloatingContactDock';
import {
  AuthModal,
  ContactZaloModal,
  EnrollmentModal,
  CheckoutModal,
  TeacherWalletModal,
  TeacherProfileModal,
  ReviewModal,
  ReviewTutorModal,
  MyTrialsModal,
  ModalContainer
} from './components/modals';

// ==========================================
// CODE SPLITTING (React.lazy)
// ==========================================
const HomePage = lazy(() => import('./pages/HomePage'));
const FindTutorsPage = lazy(() => import('./pages/FindTutorsPage'));
const TeacherDetailPage = lazy(() => import('./pages/TeacherDetailPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const TutorRegistrationPage = lazy(() => import('./pages/TutorRegistrationPage'));

// Re-export Contexts, Components & Types for complete backward compatibility
export {
  DataContext,
  DataProvider,
  useData,
  UIContext,
  UIProvider,
  useUI,
  Logo,
  Navbar,
  Footer,
  AuthModal,
  ContactZaloModal,
  EnrollmentModal,
  CheckoutModal,
  TeacherWalletModal,
  TeacherProfileModal,
  ReviewModal,
  ReviewTutorModal,
  MyTrialsModal,
  ModalContainer,
  HomePage,
  FindTutorsPage,
  TeacherDetailPage,
  AdminDashboardPage,
  TutorRegistrationPage
};

export type {
  StudentTrialItem,
  WalletTransaction,
  TeacherWallet,
  DataContextType,
  UIContextType,
  AuthModalState,
  CheckoutModalState,
  ReviewModalState
};

// ==========================================
// ELEGANT PAGE LOADER FALLBACK
// ==========================================
function PageLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin"></div>
        <div className="absolute w-6 h-6 rounded-full bg-blue-50"></div>
      </div>
      <p className="text-xs font-semibold text-slate-400 animate-pulse tracking-wide uppercase">
        Đang tải trang...
      </p>
    </div>
  );
}

import { trackPageView } from '../lib/analytics';

function RouteChangeTracker() {
  const location = useLocation();

  React.useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}

// ==========================================
// SUPABASE AUTH ERROR & HASH URL HANDLER
// ==========================================
export function AuthUrlHandler() {
  const { openAuthModal } = useUI();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash) return;

    // Check if URL hash contains Supabase Auth error (e.g. #error=access_denied&error_code=otp_expired...)
    if (hash.includes('error=') || hash.includes('error_code=')) {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
      const errorCode = hashParams.get('error_code');
      const errorDesc = hashParams.get('error_description');

      // Clear the ugly error hash from address bar immediately
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {}

      if (
        errorCode === 'otp_expired' ||
        errorDesc?.toLowerCase().includes('expired') ||
        errorDesc?.toLowerCase().includes('invalid')
      ) {
        openAuthModal('login', 'student', {
          initialErrorMessage:
            'Link xác thực email đã hết hạn hoặc đã được sử dụng (do bộ lọc Gmail/Outlook tự động quét link trước). Bạn có thể nhập email bên dưới và nhấn "Gửi lại link xác nhận email" để nhận link mới, hoặc đăng nhập nếu tài khoản đã kích hoạt.',
        });
      } else if (errorDesc) {
        const decoded = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
        openAuthModal('login', 'student', {
          initialErrorMessage: `Xác thực email không thành công: ${decoded}`,
        });
      }
    } else if (hash.includes('type=signup') || hash.includes('email_verified=true') || hash.includes('confirmation=success')) {
      // Dọn sạch hash sau khi xác thực thành công
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {}
      openAuthModal('login', 'student', {
        initialErrorMessage: 'Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.',
      });
    }
  }, [openAuthModal]);

  return null;
}

// ==========================================
// ROOT APP LAYOUT & ROUTING
// ==========================================
export function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative">
      <RouteChangeTracker />
      <AuthUrlHandler />
      {!isAdmin && <Navbar />}

      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tim-gia-su" element={<FindTutorsPage />} />
            <Route path="/tim-lop-moi" element={<FindTutorsPage />} />
            <Route path="/giao-vien/:id" element={<TeacherDetailPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/dang-ky-gia-su" element={<TutorRegistrationPage />} />
            <Route path="/tim-lop" element={<FindTutorsPage />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdmin && <Footer />}

      {/* Global Modals Container managed by UIContext */}
      <ModalContainer />

      {/* Floating Action Buttons: AI Chat & Facebook Messenger */}
      {!isAdmin && <FloatingContactDock />}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <UIProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </UIProvider>
    </DataProvider>
  );
}
