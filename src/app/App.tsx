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
// ROOT APP LAYOUT & ROUTING
// ==========================================
export function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative">
      <RouteChangeTracker />
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
