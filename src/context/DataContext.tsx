import React, { useMemo } from 'react';
import { AuthProvider, useAuth, UserSessionContext, UserRole } from './AuthContext';
import { TutorProvider, useTutors } from './TutorContext';
import { BookingProvider, useBooking, StudentTrialItem } from './BookingContext';
import { WalletProvider, useWallet, WalletTransaction, TeacherWallet } from './WalletContext';
import { mockAdminStats, TutorReviewItem } from '../app/data';

// Re-export sub-context types for backward compatibility
export type {
  UserSessionContext,
  UserRole,
  StudentTrialItem,
  WalletTransaction,
  TeacherWallet,
};

export const DataContext = React.createContext<DataContextType | null>(null);

export interface DataContextType {
  // From TutorContext
  tutors: any[];
  setTutors: React.Dispatch<React.SetStateAction<any[]>>;
  pendingTutors: any[];
  setPendingTutors: React.Dispatch<React.SetStateAction<any[]>>;
  reviews: TutorReviewItem[];
  updateTutorProfile: (tutorId: string | number, updatedData: Partial<any>) => Promise<void>;
  addTutorReview: (review: Omit<TutorReviewItem, 'id' | 'date'>) => Promise<void>;
  approveTutorKyc: (tutorId: any) => Promise<void>;
  rejectTutorKyc: (tutorId: any) => Promise<void>;
  addMockTutor: (newTutor: any) => Promise<void>;
  getMaskedTutor: (tutor: any) => any;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  fetchTutorsPage: (pageNumber: number, filters?: any) => Promise<void>;

  // From AuthContext
  currentSession: UserSessionContext;
  setCurrentSession: React.Dispatch<React.SetStateAction<UserSessionContext>>;

  // From BookingContext
  myTrials: StudentTrialItem[];
  setMyTrials: React.Dispatch<React.SetStateAction<StudentTrialItem[]>>;
  adminStats: typeof mockAdminStats;
  recordTrialContact: (tutor: any, studentInfo?: { name?: string; phone?: string }) => Promise<void>;
  recordOfficialEnrollment: (tutorId: any, totalTuition?: number) => Promise<void>;
  cancelTrialEnrollment: (tutorId: any) => Promise<void>;

  // From WalletContext
  teacherWallets: Record<string, TeacherWallet>;
  getTeacherWallet: (tutorId: string | number) => TeacherWallet;
  requestWithdrawal: (
    tutorId: string | number,
    amount: number,
    bankInfo: string
  ) => Promise<{ success: boolean; message: string }>;
  approveWithdrawal: (transactionId: string) => void;
}

/**
 * Facade hook combining all sub-contexts for complete backward compatibility.
 * Existing components calling useData() continue to work seamlessly.
 */
export function useData(): DataContextType {
  const auth = useAuth();
  const tutors = useTutors();
  const booking = useBooking();
  const wallet = useWallet();

  return useMemo<DataContextType>(
    () => ({
      // TutorContext
      tutors: tutors.tutors,
      setTutors: tutors.setTutors,
      pendingTutors: tutors.pendingTutors,
      setPendingTutors: tutors.setPendingTutors,
      reviews: tutors.reviews,
      updateTutorProfile: tutors.updateTutorProfile,
      addTutorReview: tutors.addTutorReview,
      approveTutorKyc: tutors.approveTutorKyc,
      rejectTutorKyc: tutors.rejectTutorKyc,
      addMockTutor: tutors.addMockTutor,
      getMaskedTutor: tutors.getMaskedTutor,
      isLoading: tutors.isLoading,
      currentPage: tutors.currentPage,
      pageSize: tutors.pageSize,
      totalCount: tutors.totalCount,
      totalPages: tutors.totalPages,
      fetchTutorsPage: tutors.fetchTutorsPage,

      // AuthContext
      currentSession: auth.currentSession,
      setCurrentSession: auth.setCurrentSession,

      // BookingContext
      myTrials: booking.myTrials,
      setMyTrials: booking.setMyTrials,
      adminStats: booking.adminStats,
      recordTrialContact: booking.recordTrialContact,
      recordOfficialEnrollment: async (tutorId: any, totalTuition = 1_600_000) => {
        await booking.recordOfficialEnrollment(tutorId, totalTuition);
        wallet.recordIncome(tutorId, totalTuition);
      },
      cancelTrialEnrollment: booking.cancelTrialEnrollment,

      // WalletContext
      teacherWallets: wallet.teacherWallets,
      getTeacherWallet: wallet.getTeacherWallet,
      requestWithdrawal: wallet.requestWithdrawal,
      approveWithdrawal: wallet.approveWithdrawal,
    }),
    [auth, tutors, booking, wallet]
  );
}

/**
 * Root DataProvider orchestrating all sub-providers in proper dependency order.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TutorProvider>
        <BookingProvider>
          <WalletProvider>{children}</WalletProvider>
        </BookingProvider>
      </TutorProvider>
    </AuthProvider>
  );
}

// Re-export individual hooks for fine-grained subscriptions
export { useAuth } from './AuthContext';
export { useTutors } from './TutorContext';
export { useBooking } from './BookingContext';
export { useWallet } from './WalletContext';


