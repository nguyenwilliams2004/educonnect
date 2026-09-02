import React, { useState } from 'react';
import { mockTutors } from '../../data';
import { useData, TeacherWallet, WalletTransaction } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export interface TeacherWalletModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  tutorId?: string | number;
}

export function TeacherWalletModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  tutorId: propTutorId
}: TeacherWalletModalProps = {}) {
  const { teacherWalletModalTutorId, closeTeacherWalletModal, openTeacherProfileModal } = useUI();
  const { tutors, getTeacherWallet, requestWithdrawal } = useData();

  const isOpen = propIsOpen !== undefined ? propIsOpen : !!teacherWalletModalTutorId;
  const onClose = propOnClose || closeTeacherWalletModal;
  const tutorId = propTutorId || teacherWalletModalTutorId || 't1';

  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'income' | 'withdrawal'>('all');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const activeTutor = (tutors && tutors.length > 0 ? tutors : mockTutors).find((t: any) => String(t.id) === String(tutorId) || String(t.id) === '1' || String(t.id) === 't1') || mockTutors[0];

  const bankAccount = activeTutor?.bankName && activeTutor?.bankAccountNumber
    ? `${activeTutor.bankName} - ${activeTutor.bankAccountNumber} - ${activeTutor.bankAccountName || activeTutor.name}`
    : 'MB Bank - 0987654321 - NGUYEN SUONG MAI';

  const rawWallet = getTeacherWallet ? getTeacherWallet(activeTutor?.id || 't1') : null;
  const wallet: TeacherWallet = {
    balance: typeof rawWallet?.balance === 'number' ? rawWallet.balance : 1680000,
    totalWithdrawn: typeof rawWallet?.totalWithdrawn === 'number' ? rawWallet.totalWithdrawn : 3500000,
    transactions: Array.isArray(rawWallet?.transactions) && rawWallet.transactions.length > 0 ? rawWallet.transactions : [
      {
        id: 'tx_init_1',
        tutorId: 't1',
        tutorName: activeTutor?.name || 'Cô Sương Mai',
        type: 'tuition_income',
        amount: 1120000,
        title: 'Cộng học phí khóa 8 buổi (Học sinh Hoàng Nam)',
        date: '02/09/2026',
        status: 'completed'
      },
      {
        id: 'tx_init_2',
        tutorId: 't1',
        tutorName: activeTutor?.name || 'Cô Sương Mai',
        type: 'tuition_income',
        amount: 560000,
        title: 'Cộng học phí khóa 4 buổi (Học sinh Bảo Anh)',
        date: '01/09/2026',
        status: 'completed'
      }
    ]
  };

  if (!isOpen) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(withdrawAmount.replace(/\D/g, '')) || 0;
    if (amountNum < 50000) {
      alert("Số tiền rút tối thiểu là 50.000 VNĐ!");
      return;
    }
    if (amountNum > wallet.balance) {
      alert(`Số dư khả dụng không đủ! Số dư hiện tại là ${wallet.balance.toLocaleString()}đ`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = requestWithdrawal(activeTutor?.id || 't1', amountNum, bankAccount);
      if (res?.success) {
        alert(res.message);
        setWithdrawAmount('');
        setActiveTab('history');
      } else {
        alert(res?.message || 'Rút tiền thành công!');
        setWithdrawAmount('');
        setActiveTab('history');
      }
    }, 600);
  };

  const filteredTransactions = (wallet.transactions || []).filter(tx => {
    if (historyFilter === 'income') return tx.type === 'tuition_income';
    if (historyFilter === 'withdrawal') return tx.type === 'withdrawal';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header High-End Visual Design */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Ví Thu Nhập Giáo Viên</h3>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                Napas 24/7
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chủ ví: <strong className="text-slate-800">{activeTutor?.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Double-Bezel Card Số dư */}
          <div className="p-1.5 bg-blue-900/10 rounded-[2rem] border border-blue-500/20 shadow-sm">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="text-xs text-blue-100 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Số dư khả dụng
                </span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/25">
                  Tự rút 24/7
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums my-1.5 relative z-10 font-mono">
                {wallet.balance.toLocaleString()} <span className="text-base font-bold text-blue-200">VNĐ</span>
              </div>

              <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between text-xs text-blue-100 relative z-10">
                <div>
                  Đã rút thành công: <strong className="text-white font-bold">{wallet.totalWithdrawn.toLocaleString()}đ</strong>
                </div>
                <div className="text-blue-200 text-[11px] font-medium">
                  {wallet.transactions.length} biến động
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation: Rút tiền vs Lịch sử */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('withdraw')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'withdraw'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rút tiền về Ngân hàng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch sử biến động ({wallet.transactions.length})
            </button>
          </div>

          {/* TAB 1: RÚT TIỀN */}
          {activeTab === 'withdraw' ? (
            <form onSubmit={handleWithdraw} className="space-y-4 text-left">
              {/* Thẻ Ngân hàng Đã liên kết */}
              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{bankAccount}</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded-md">Đã xác thực</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Tài khoản chính nhận chuyển khoản Napas 24/7</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openTeacherProfileModal(activeTutor.id);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer shrink-0"
                >
                  Đổi STK
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Số tiền muốn rút (VNĐ)</label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(wallet.balance.toString())}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Rút toàn bộ số dư
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="VD: 500000"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono"
                    max={wallet.balance}
                    min={50000}
                    required
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold">VNĐ</span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[200000, 500000, 1000000, wallet.balance].map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWithdrawAmount(amt.toString())}
                      disabled={amt <= 0 || amt > wallet.balance}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-bold rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-center"
                    >
                      {idx === 3 ? 'Toàn bộ' : `${(amt / 1000).toLocaleString()}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thông tin phí và thời gian */}
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-slate-700 space-y-1">
                <div className="flex justify-between items-center">
                  <span>Phí giao dịch:</span>
                  <span className="font-extrabold text-blue-700">0đ (Miễn phí 100%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Thời gian chuyển khoản:</span>
                  <span className="font-semibold text-slate-800">Tức thì qua Napas 24/7 (1 - 3 phút)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || wallet.balance <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-sm shadow-blue-200 cursor-pointer flex items-center justify-center active:scale-[0.98]"
              >
                {loading ? 'Đang tạo lệnh chuyển tiền Napas...' : `Xác nhận rút ${withdrawAmount ? parseInt(withdrawAmount).toLocaleString() + 'đ' : ''} về Ngân hàng`}
              </button>
            </form>
          ) : (
            /* TAB 2: LỊCH SỬ BIẾN ĐỘNG VÍ */
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 pb-1">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${historyFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('income')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${historyFilter === 'income' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Học phí nhận (+)
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('withdrawal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${historyFilter === 'withdrawal' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Rút tiền (-)
                </button>
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {filteredTransactions.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400">Không có giao dịch nào phù hợp.</div>
                ) : (
                  filteredTransactions.map((tx: WalletTransaction) => (
                    <div key={tx.id} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 flex items-center justify-between text-xs hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                      <div className="space-y-0.5 max-w-[65%]">
                        <div className="font-bold text-slate-900 leading-snug">{tx.title}</div>
                        <div className="text-[10px] text-slate-500">{tx.date} • {tx.bankInfo || 'Tự động'}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-sm tabular-nums font-mono ${tx.type === 'tuition_income' ? 'text-blue-600' : 'text-slate-900'}`}>
                          {tx.type === 'tuition_income' ? '+' : '-'}{tx.amount.toLocaleString()}đ
                        </div>
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${tx.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                          {tx.status === 'completed' ? 'Thành công' : 'Chờ xử lý'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default TeacherWalletModal;
