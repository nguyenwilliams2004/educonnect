import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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

const DEFAULT_WALLET: TeacherWallet = {
  balance: 1_680_000,
  totalWithdrawn: 3_500_000,
  transactions: [
    {
      id: 'tx_init_1',
      tutorId: 't1',
      tutorName: 'Cô Sương Mai',
      type: 'tuition_income',
      amount: 1_120_000,
      title: 'Cộng học phí khóa 8 buổi (Học sinh Hoàng Nam)',
      date: '02/09/2026',
      status: 'completed',
    },
    {
      id: 'tx_init_2',
      tutorId: 't1',
      tutorName: 'Cô Sương Mai',
      type: 'tuition_income',
      amount: 560_000,
      title: 'Cộng học phí khóa 4 buổi (Học sinh Bảo Anh)',
      date: '01/09/2026',
      status: 'completed',
    },
  ],
};

const isUUID = (id: any) => /^[0-9a-f-]{36}$/.test(String(id));

export interface WalletContextType {
  teacherWallets: Record<string, TeacherWallet>;
  setTeacherWallets: React.Dispatch<React.SetStateAction<Record<string, TeacherWallet>>>;
  getTeacherWallet: (tutorId: string | number) => TeacherWallet;
  requestWithdrawal: (
    tutorId: string | number,
    amount: number,
    bankInfo: string
  ) => Promise<{ success: boolean; message: string }>;
  approveWithdrawal: (transactionId: string) => Promise<void> | void;
  recordIncome: (tutorId: string | number, amount: number, title?: string) => void;
  refreshWallet?: (tutorId?: string | number) => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { currentSession } = useAuth();
  const [teacherWallets, setTeacherWallets] = useState<Record<string, TeacherWallet>>({
    t1: DEFAULT_WALLET,
  });

  // Tải dữ liệu ví thực tế từ CSDL Supabase (payments & payout_requests)
  const loadWalletFromDb = useCallback(async (instructorId: string) => {
    if (!isUUID(instructorId)) return;

    try {
      const [payoutsRes, paymentsRes] = await Promise.all([
        supabase
          .from('payout_requests')
          .select('*')
          .eq('instructor_id', instructorId)
          .order('created_at', { ascending: false }),
        supabase
          .from('payments')
          .select('*, enrollments!inner(instructor_id, student_name, class_title)')
          .eq('enrollments.instructor_id', instructorId)
          .eq('status', 'success')
          .order('created_at', { ascending: false }),
      ]);

      const payouts = payoutsRes.data || [];
      const payments = paymentsRes.data || [];

      // Chuyển đổi payments (thu nhập) sang WalletTransaction
      const incomeTxs: WalletTransaction[] = payments.map((p) => ({
        id: p.id,
        tutorId: instructorId,
        type: 'tuition_income',
        amount: p.tutor_amount || Math.round(p.amount * 0.7),
        title: `Học phí khóa học (${p.enrollments?.student_name || 'Học sinh'} - ${p.enrollments?.class_title || 'Lớp học'})`,
        date: new Date(p.created_at).toLocaleDateString('vi-VN'),
        status: 'completed',
      }));

      // Chuyển đổi payout_requests (lệnh rút tiền) sang WalletTransaction
      const withdrawalTxs: WalletTransaction[] = payouts.map((pr) => ({
        id: pr.id,
        tutorId: instructorId,
        type: 'withdrawal',
        amount: pr.amount,
        title: `Rút tiền về ${pr.bank_name} - ${pr.bank_account_number} (${pr.bank_account_name})`,
        date: new Date(pr.created_at).toLocaleDateString('vi-VN'),
        status: pr.status === 'transferred' ? 'completed' : 'pending',
        bankInfo: `${pr.bank_name} - ${pr.bank_account_number}`,
      }));

      const totalIncome = incomeTxs.reduce((sum, tx) => sum + tx.amount, 0);
      const totalTransferred = payouts
        .filter((pr) => pr.status === 'transferred')
        .reduce((sum, pr) => sum + pr.amount, 0);
      const totalPending = payouts
        .filter((pr) => pr.status === 'pending')
        .reduce((sum, pr) => sum + pr.amount, 0);

      const availableBalance = Math.max(0, totalIncome - totalTransferred - totalPending);

      const allTransactions = [...incomeTxs, ...withdrawalTxs].sort((a, b) =>
        b.id.localeCompare(a.id)
      );

      setTeacherWallets((prev) => ({
        ...prev,
        [instructorId]: {
          balance: availableBalance,
          totalWithdrawn: totalTransferred,
          transactions: allTransactions,
        },
      }));
    } catch (err) {
      console.warn('[WalletContext] Lỗi tải dữ liệu ví từ Supabase:', err);
    }
  }, []);

  // Tự động tải ví khi gia sư đăng nhập
  useEffect(() => {
    if (currentSession.userId && isUUID(currentSession.userId)) {
      loadWalletFromDb(currentSession.userId);
    }
  }, [currentSession.userId, loadWalletFromDb]);

  const getTeacherWallet = useCallback(
    (tutorId: string | number): TeacherWallet => {
      const k = String(tutorId || 't1');
      if (teacherWallets[k]) return teacherWallets[k];

      // Nếu truyền ID của user đang đăng nhập
      if (currentSession.userId && String(currentSession.userId) === k && teacherWallets[currentSession.userId]) {
        return teacherWallets[currentSession.userId];
      }

      // Fallback an toàn cho mock ID demo
      return teacherWallets['t1'] || DEFAULT_WALLET;
    },
    [teacherWallets, currentSession.userId]
  );

  const requestWithdrawal = useCallback(
    async (
      tutorId: string | number,
      amount: number,
      bankInfo: string
    ): Promise<{ success: boolean; message: string }> => {
      const k = String(tutorId);
      const targetInstructorId = isUUID(tutorId)
        ? String(tutorId)
        : currentSession.userId && isUUID(currentSession.userId)
        ? currentSession.userId
        : null;

      const current = teacherWallets[k] || (targetInstructorId ? teacherWallets[targetInstructorId] : null) || teacherWallets['t1'] || DEFAULT_WALLET;

      if (amount > current.balance) {
        return { success: false, message: 'Số dư ví khả dụng không đủ!' };
      }

      // =========================================================================
      // 1. NẾU LÀ GIA SƯ THẬT: LƯU VÀO BẢNG PAYOUT_REQUESTS TRÊN SUPABASE CSDL
      // =========================================================================
      if (targetInstructorId) {
        // Tách chuỗi bankInfo (Ví dụ: "MB Bank - 0987654321 - NGUYEN SUONG MAI")
        const parts = bankInfo.split('-').map((s) => s.trim());
        const bankName = parts[0] || 'Ngân hàng thụ hưởng';
        const bankAccountNumber = parts[1] || '00000000';
        const bankAccountName = parts[2] || currentSession.fullName || 'GIÁO VIÊN';

        const { data: insertedPayout, error: dbError } = await supabase
          .from('payout_requests')
          .insert({
            instructor_id: targetInstructorId,
            amount: amount,
            bank_name: bankName,
            bank_account_number: bankAccountNumber,
            bank_account_name: bankAccountName,
            status: 'pending',
          })
          .select()
          .single();

        if (dbError) {
          console.error('[WalletContext] Lỗi ghi nhận payout_requests:', dbError.message);
          return {
            success: false,
            message: `Không thể tạo yêu cầu rút tiền: ${dbError.message}`,
          };
        }

        const newTx: WalletTransaction = {
          id: insertedPayout?.id || 'tx_wdr_' + Date.now(),
          tutorId: targetInstructorId,
          type: 'withdrawal',
          amount,
          title: `Rút tiền về ${bankInfo}`,
          date: new Date().toLocaleDateString('vi-VN'),
          status: 'pending',
          bankInfo,
        };

        setTeacherWallets((prev) => {
          const prevWallet = prev[targetInstructorId] || current;
          return {
            ...prev,
            [targetInstructorId]: {
              balance: Math.max(0, prevWallet.balance - amount),
              totalWithdrawn: prevWallet.totalWithdrawn,
              transactions: [newTx, ...prevWallet.transactions],
            },
            ...(k !== targetInstructorId
              ? {
                  [k]: {
                    balance: Math.max(0, current.balance - amount),
                    totalWithdrawn: current.totalWithdrawn,
                    transactions: [newTx, ...current.transactions],
                  },
                }
              : {}),
          };
        });

        return {
          success: true,
          message: `Yêu cầu rút ${amount.toLocaleString()}đ đã được ghi nhận vào Sổ cái hệ thống! Ban quản trị HanTutor sẽ đối soát và giải ngân tới STK ${bankInfo} trong vòng 24h làm việc.`,
        };
      }

      // =========================================================================
      // 2. NẾU LÀ DEMO / MOCK ID ('t1'): CẬP NHẬT STATE TRONG BỘ NHỚ
      // =========================================================================
      const newTx: WalletTransaction = {
        id: 'tx_wdr_' + Date.now(),
        tutorId,
        type: 'withdrawal',
        amount,
        title: `Rút tiền về ${bankInfo}`,
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'completed',
        bankInfo,
      };

      setTeacherWallets((prev) => ({
        ...prev,
        [k]: {
          balance: current.balance - amount,
          totalWithdrawn: current.totalWithdrawn + amount,
          transactions: [newTx, ...current.transactions],
        },
      }));

      return {
        success: true,
        message: `Yêu cầu rút ${amount.toLocaleString()}đ thành công! Tiền sẽ về STK ${bankInfo} trong 1-3 phút qua Napas 24/7.`,
      };
    },
    [teacherWallets, currentSession]
  );

  const approveWithdrawal = useCallback(async (transactionId: string) => {
    if (isUUID(transactionId)) {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'transferred',
          transferred_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (error) {
        console.error('[WalletContext] Lỗi cập nhật payout_requests:', error.message);
      }
    }

    setTeacherWallets((prev) => {
      const updated: Record<string, TeacherWallet> = {};
      for (const [k, w] of Object.entries(prev)) {
        let matched = false;
        const newTxs = w.transactions.map((tx) => {
          if (tx.id === transactionId) {
            matched = true;
            return { ...tx, status: 'completed' as const };
          }
          return tx;
        });

        if (matched) {
          const tx = w.transactions.find((t) => t.id === transactionId);
          const amt = tx?.amount || 0;
          updated[k] = {
            ...w,
            totalWithdrawn: w.totalWithdrawn + amt,
            transactions: newTxs,
          };
        } else {
          updated[k] = w;
        }
      }
      return updated;
    });
  }, []);

  const recordIncome = useCallback((tutorId: string | number, amount: number, title?: string) => {
    const k = String(tutorId);
    setTeacherWallets((prev) => {
      const current = prev[k] || prev['t1'] || DEFAULT_WALLET;
      const incomeTx: WalletTransaction = {
        id: 'tx_inc_' + Date.now(),
        tutorId,
        type: 'tuition_income',
        amount,
        title: title || `Cộng học phí khóa học (#ENR_${Date.now().toString().slice(-6)})`,
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'completed',
      };
      return {
        ...prev,
        [k]: {
          ...current,
          balance: current.balance + amount,
          transactions: [incomeTx, ...current.transactions],
        },
      };
    });
  }, []);

  const refreshWallet = useCallback(
    async (tutorId?: string | number) => {
      const id = String(tutorId || currentSession.userId || '');
      if (isUUID(id)) {
        await loadWalletFromDb(id);
      }
    },
    [currentSession.userId, loadWalletFromDb]
  );

  const value = useMemo<WalletContextType>(
    () => ({
      teacherWallets,
      setTeacherWallets,
      getTeacherWallet,
      requestWithdrawal,
      approveWithdrawal,
      recordIncome,
      refreshWallet,
    }),
    [teacherWallets, getTeacherWallet, requestWithdrawal, approveWithdrawal, recordIncome, refreshWallet]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
