import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';

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

export interface WalletContextType {
  teacherWallets: Record<string, TeacherWallet>;
  setTeacherWallets: React.Dispatch<React.SetStateAction<Record<string, TeacherWallet>>>;
  getTeacherWallet: (tutorId: string | number) => TeacherWallet;
  requestWithdrawal: (
    tutorId: string | number,
    amount: number,
    bankInfo: string
  ) => Promise<{ success: boolean; message: string }>;
  approveWithdrawal: (transactionId: string) => void;
  recordIncome: (tutorId: string | number, amount: number, title?: string) => void;
}

export const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [teacherWallets, setTeacherWallets] = useState<Record<string, TeacherWallet>>({
    t1: DEFAULT_WALLET,
  });

  const getTeacherWallet = useCallback(
    (tutorId: string | number): TeacherWallet => {
      const k = String(tutorId || 't1');
      return teacherWallets[k] || teacherWallets['t1'] || DEFAULT_WALLET;
    },
    [teacherWallets]
  );

  const requestWithdrawal = useCallback(
    async (
      tutorId: string | number,
      amount: number,
      bankInfo: string
    ): Promise<{ success: boolean; message: string }> => {
      const k = String(tutorId);
      const current = teacherWallets[k] || teacherWallets['t1'] || DEFAULT_WALLET;
      if (amount > current.balance) {
        return { success: false, message: 'Số dư ví khả dụng không đủ!' };
      }
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
    [teacherWallets]
  );

  const approveWithdrawal = useCallback((_transactionId: string) => {}, []);

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

  const value = useMemo<WalletContextType>(
    () => ({
      teacherWallets,
      setTeacherWallets,
      getTeacherWallet,
      requestWithdrawal,
      approveWithdrawal,
      recordIncome,
    }),
    [teacherWallets, getTeacherWallet, requestWithdrawal, approveWithdrawal, recordIncome]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
