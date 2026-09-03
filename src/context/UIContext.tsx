import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

export interface AuthModalState {
  isOpen: boolean;
  view: 'login' | 'register';
  defaultRole: 'student' | 'teacher';
}

export interface CheckoutModalState {
  isOpen: boolean;
  enrollmentId: string;
  amount: number;
  tutorId: string | number;
}

export interface ReviewModalState {
  isOpen: boolean;
  tutor: any;
  defaultStage: 'trial' | 'official';
}

export interface UIContextType {
  // Auth Modal
  authModalState: AuthModalState;
  setAuthModalState: React.Dispatch<React.SetStateAction<AuthModalState>>;
  openAuthModal: (view?: 'login' | 'register', defaultRole?: 'student' | 'teacher') => void;
  closeAuthModal: () => void;

  // Contact Zalo Modal
  contactZaloModalTutor: any;
  setContactZaloModalTutor: React.Dispatch<React.SetStateAction<any>>;
  pendingTrialTutor: any;
  setPendingTrialTutor: React.Dispatch<React.SetStateAction<any>>;
  openContactZaloModal: (tutor: any) => void;
  closeContactZaloModal: () => void;

  // Enrollment Modal
  enrollmentModalTutor: any;
  setEnrollmentModalTutor: React.Dispatch<React.SetStateAction<any>>;
  openEnrollmentModal: (tutor: any) => void;
  closeEnrollmentModal: () => void;

  // Checkout Modal
  checkoutModalState: CheckoutModalState;
  setCheckoutModalState: React.Dispatch<React.SetStateAction<CheckoutModalState>>;
  openCheckoutModal: (enrollmentId: string, amount: number, tutorId: string | number) => void;
  closeCheckoutModal: () => void;

  // Tutor Detail Modal / Page
  openTutorDetailModal: (tutor: any) => void;

  // My Trials Modal
  isMyTrialsOpen: boolean;
  setIsMyTrialsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openMyTrialsModal: () => void;
  closeMyTrialsModal: () => void;

  // Review Modal
  reviewModalState: ReviewModalState;
  setReviewModalState: React.Dispatch<React.SetStateAction<ReviewModalState>>;
  openReviewModal: (tutor: any, defaultStage?: 'trial' | 'official') => void;
  closeReviewModal: () => void;

  // Teacher Wallet Modal
  teacherWalletModalTutorId: string | number | null;
  setTeacherWalletModalTutorId: React.Dispatch<React.SetStateAction<string | number | null>>;
  openTeacherWalletModal: (tutorId?: string | number) => void;
  closeTeacherWalletModal: () => void;

  // Teacher Profile Modal
  teacherProfileModalTutorId: string | number | null;
  setTeacherProfileModalTutorId: React.Dispatch<React.SetStateAction<string | number | null>>;
  openTeacherProfileModal: (tutorId?: string | number) => void;
  closeTeacherProfileModal: () => void;

  // Student Profile Modal
  isStudentProfileOpen: boolean;
  setIsStudentProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openStudentProfileModal: () => void;
  closeStudentProfileModal: () => void;

  // Standard User Profile & Account Settings Modal (General)
  isUserProfileModalOpen: boolean;
  setIsUserProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openUserProfileModal: () => void;
  closeUserProfileModal: () => void;
}

export const UIContext = createContext<UIContextType | null>(null);

export function useUI(): UIContextType {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [authModalState, setAuthModalState] = useState<AuthModalState>({
    isOpen: false,
    view: 'login',
    defaultRole: 'student'
  });

  const [contactZaloModalTutor, setContactZaloModalTutor] = useState<any>(null);
  const [pendingTrialTutor, setPendingTrialTutor] = useState<any>(null);
  const [enrollmentModalTutor, setEnrollmentModalTutor] = useState<any>(null);

  const [checkoutModalState, setCheckoutModalState] = useState<CheckoutModalState>({
    isOpen: false,
    enrollmentId: '',
    amount: 0,
    tutorId: ''
  });

  const [isMyTrialsOpen, setIsMyTrialsOpen] = useState(false);

  const [reviewModalState, setReviewModalState] = useState<ReviewModalState>({
    isOpen: false,
    tutor: null,
    defaultStage: 'trial'
  });

  const [teacherWalletModalTutorId, setTeacherWalletModalTutorId] = useState<string | number | null>(null);
  const [teacherProfileModalTutorId, setTeacherProfileModalTutorId] = useState<string | number | null>(null);
  const [isStudentProfileOpen, setIsStudentProfileOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  // Callbacks memoized for maximum performance
  const openAuthModal = useCallback((view: 'login' | 'register' = 'login', defaultRole: 'student' | 'teacher' = 'student') => {
    setAuthModalState({ isOpen: true, view, defaultRole });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const openContactZaloModal = useCallback((tutor: any) => {
    setContactZaloModalTutor(tutor);
  }, []);

  const closeContactZaloModal = useCallback(() => {
    setContactZaloModalTutor(null);
  }, []);

  const openEnrollmentModal = useCallback((tutor: any) => {
    setEnrollmentModalTutor(tutor);
  }, []);

  const closeEnrollmentModal = useCallback(() => {
    setEnrollmentModalTutor(null);
  }, []);

  const openCheckoutModal = useCallback((enrollmentId: string, amount: number, tutorId: string | number) => {
    setCheckoutModalState({ isOpen: true, enrollmentId, amount, tutorId });
  }, []);

  const closeCheckoutModal = useCallback(() => {
    setCheckoutModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const openTutorDetailModal = useCallback((tutor: any) => {
    window.open(`/giao-vien/${tutor.id}`, '_blank');
  }, []);

  const openMyTrialsModal = useCallback(() => {
    setIsMyTrialsOpen(true);
  }, []);

  const closeMyTrialsModal = useCallback(() => {
    setIsMyTrialsOpen(false);
  }, []);

  const openReviewModal = useCallback((tutor: any, defaultStage: 'trial' | 'official' = 'trial') => {
    setReviewModalState({ isOpen: true, tutor, defaultStage });
  }, []);

  const closeReviewModal = useCallback(() => {
    setReviewModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const openTeacherWalletModal = useCallback((tutorId?: string | number) => {
    setTeacherWalletModalTutorId(tutorId || 't1');
  }, []);

  const closeTeacherWalletModal = useCallback(() => {
    setTeacherWalletModalTutorId(null);
  }, []);

  const openTeacherProfileModal = useCallback((tutorId?: string | number) => {
    setTeacherProfileModalTutorId(tutorId || 't1');
  }, []);

  const closeTeacherProfileModal = useCallback(() => {
    setTeacherProfileModalTutorId(null);
  }, []);

  const openStudentProfileModal = useCallback(() => {
    setIsStudentProfileOpen(true);
  }, []);

  const closeStudentProfileModal = useCallback(() => {
    setIsStudentProfileOpen(false);
  }, []);

  const openUserProfileModal = useCallback(() => {
    setIsUserProfileModalOpen(true);
  }, []);

  const closeUserProfileModal = useCallback(() => {
    setIsUserProfileModalOpen(false);
  }, []);

  const uiContextValue = useMemo<UIContextType>(() => ({
    authModalState,
    setAuthModalState,
    openAuthModal,
    closeAuthModal,

    contactZaloModalTutor,
    setContactZaloModalTutor,
    pendingTrialTutor,
    setPendingTrialTutor,
    openContactZaloModal,
    closeContactZaloModal,

    enrollmentModalTutor,
    setEnrollmentModalTutor,
    openEnrollmentModal,
    closeEnrollmentModal,

    checkoutModalState,
    setCheckoutModalState,
    openCheckoutModal,
    closeCheckoutModal,

    openTutorDetailModal,

    isMyTrialsOpen,
    setIsMyTrialsOpen,
    openMyTrialsModal,
    closeMyTrialsModal,

    reviewModalState,
    setReviewModalState,
    openReviewModal,
    closeReviewModal,

    teacherWalletModalTutorId,
    setTeacherWalletModalTutorId,
    openTeacherWalletModal,
    closeTeacherWalletModal,

    teacherProfileModalTutorId,
    setTeacherProfileModalTutorId,
    openTeacherProfileModal,
    closeTeacherProfileModal,

    isStudentProfileOpen,
    setIsStudentProfileOpen,
    openStudentProfileModal,
    closeStudentProfileModal,

    isUserProfileModalOpen,
    setIsUserProfileModalOpen,
    openUserProfileModal,
    closeUserProfileModal
  }), [
    authModalState,
    contactZaloModalTutor,
    pendingTrialTutor,
    enrollmentModalTutor,
    checkoutModalState,
    isMyTrialsOpen,
    reviewModalState,
    teacherWalletModalTutorId,
    teacherProfileModalTutorId,
    isStudentProfileOpen,
    isUserProfileModalOpen,
    openAuthModal,
    closeAuthModal,
    openContactZaloModal,
    closeContactZaloModal,
    openEnrollmentModal,
    closeEnrollmentModal,
    openCheckoutModal,
    closeCheckoutModal,
    openTutorDetailModal,
    openMyTrialsModal,
    closeMyTrialsModal,
    openReviewModal,
    closeReviewModal,
    openTeacherWalletModal,
    closeTeacherWalletModal,
    openTeacherProfileModal,
    closeTeacherProfileModal,
    openStudentProfileModal,
    closeStudentProfileModal,
    openUserProfileModal,
    closeUserProfileModal
  ]);

  return (
    <UIContext.Provider value={uiContextValue}>
      {children}
    </UIContext.Provider>
  );
}
