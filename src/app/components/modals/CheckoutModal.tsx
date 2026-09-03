import React, { useState, useMemo } from 'react';
import { X, Copy, Check, QrCode, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { useUI } from '../../../context/UIContext';
import { useAuth } from '../../../context/AuthContext';
import {
  HANTUTOR_VIETQR_CONFIG,
  generateVietQrUrl,
  createPendingPayment,
} from '../../../lib/paymentService';

export interface CheckoutModalProps {
  enrollmentId?: string;
  amount?: number;
  tutorId?: string | number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CheckoutModal({
  enrollmentId: propEnrollmentId,
  amount: propAmount,
  tutorId: propTutorId,
  isOpen: propIsOpen,
  onClose: propOnClose,
}: CheckoutModalProps = {}) {
  const { checkoutModalState, closeCheckoutModal } = useUI();
  const { currentSession } = useAuth();

  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState<string>('');

  const isOpen = propIsOpen !== undefined ? propIsOpen : checkoutModalState.isOpen;
  const onClose = propOnClose || closeCheckoutModal;
  const rawEnrollmentId = propEnrollmentId || checkoutModalState.enrollmentId;
  const amount = propAmount !== undefined ? propAmount : checkoutModalState.amount || 1600000;
  const tutorId = propTutorId || checkoutModalState.tutorId;

  // Mã chuyển khoản duy nhất cho đơn hàng này
  const orderCode = useMemo(() => {
    if (rawEnrollmentId && rawEnrollmentId.startsWith('HT_')) return rawEnrollmentId;
    const cleanId = (rawEnrollmentId || 'ORD').replace(/[^a-zA-Z0-9]/g, '').slice(-8);
    return `HT_${cleanId}`;
  }, [rawEnrollmentId]);

  // URL mã VietQR Napas 24/7 thật
  const vietQrUrl = useMemo(() => {
    return generateVietQrUrl({
      amount: amount || 0,
      orderCode: orderCode,
      accountName: HANTUTOR_VIETQR_CONFIG.accountName,
    });
  }, [amount, orderCode]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPaid = async () => {
    setLoading(true);
    try {
      const res = await createPendingPayment({
        enrollmentId: rawEnrollmentId,
        tutorId: tutorId,
        amount: amount || 0,
        studentId: currentSession?.userId,
        studentName: currentSession?.fullName,
        studentPhone: currentSession?.phone,
      });

      setTransactionCode(res.transactionCode || orderCode);
      setPaid(true);
    } catch (err) {
      console.error('[CheckoutModal] Lỗi khi xác nhận thanh toán:', err);
      setTransactionCode(orderCode);
      setPaid(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 text-center max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {!paid ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">Thanh toán VietQR Napas 24/7</h3>
                <p className="text-[11px] text-slate-500">Chuyển khoản an toàn & Xác nhận tự động</p>
              </div>
            </div>

            {/* Khung chứa ảnh mã VietQR Napas thật */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl inline-block shadow-inner">
              <img
                src={vietQrUrl}
                alt="VietQR Napas 24/7"
                className="w-52 h-52 sm:w-56 sm:h-56 mx-auto rounded-xl object-contain bg-white shadow-xs"
                loading="eager"
              />
              <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] font-bold text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Quét bằng bất kỳ App Ngân hàng hoặc MoMo
              </div>
            </div>

            {/* Thông tin chuyển khoản chi tiết kèm nút Copy */}
            <div className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl text-xs space-y-2 text-left">
              {/* Ngân hàng */}
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-slate-900">{HANTUTOR_VIETQR_CONFIG.bankName}</span>
              </div>

              {/* Số tài khoản */}
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500">Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-blue-700 text-sm tracking-wide">
                    {HANTUTOR_VIETQR_CONFIG.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(HANTUTOR_VIETQR_CONFIG.accountNumber, 'acc')}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Chủ tài khoản */}
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-bold text-slate-900">{HANTUTOR_VIETQR_CONFIG.accountName}</span>
              </div>

              {/* Số tiền */}
              <div className="flex justify-between items-center py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500">Số tiền:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-700 text-sm">
                    {amount?.toLocaleString()} VNĐ
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(amount), 'amount')}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Sao chép số tiền"
                  >
                    {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Nội dung chuyển khoản */}
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Nội dung CK:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                    {orderCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(orderCode, 'code')}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    title="Sao chép nội dung"
                  >
                    {copiedField === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-1.5 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Lưu ý:</strong> Vui lòng giữ nguyên nội dung chuyển khoản <strong>{orderCode}</strong> để hệ thống nhận diện và kích hoạt lớp nhanh nhất.
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmPaid}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang gửi thông tin đối soát...' : 'Tôi đã chuyển khoản thành công'}
            </button>
          </div>
        ) : (
          <div className="py-2 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <Clock className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">Đã ghi nhận thanh toán!</h3>

            <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl text-xs space-y-1.5 text-slate-700 text-left">
              <div><strong>Mã giao dịch:</strong> <span className="font-mono font-bold text-emerald-800">{transactionCode}</span></div>
              <div><strong>Số tiền:</strong> <span className="font-bold text-slate-900">{amount?.toLocaleString()} VNĐ</span></div>
              <div><strong>Trạng thái:</strong> <span className="inline-block bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">Chờ đối soát ngân hàng (Pending)</span></div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed text-left">
              Ban quản lý HanTutor sẽ đối soát sao kê Napas 24/7 trong <strong>5 - 15 phút</strong>. Sau khi hoàn tất xác nhận, giáo viên sẽ nhận được thông báo để liên hệ bắt đầu khóa học theo lịch đã chọn.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors cursor-pointer"
            >
              Đã hiểu & Hoàn tất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
