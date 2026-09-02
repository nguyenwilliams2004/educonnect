import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useUI } from '../../../context/UIContext';

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
  onClose: propOnClose
}: CheckoutModalProps = {}) {
  const { checkoutModalState, closeCheckoutModal } = useUI();
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOpen = propIsOpen !== undefined ? propIsOpen : checkoutModalState.isOpen;
  const onClose = propOnClose || closeCheckoutModal;
  const enrollmentId = propEnrollmentId || checkoutModalState.enrollmentId;
  const amount = propAmount !== undefined ? propAmount : checkoutModalState.amount;
  const tutorId = propTutorId || checkoutModalState.tutorId;

  if (!isOpen) return null;

  const handleConfirmPaid = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPaid(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!paid ? (
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">Thanh toán học phí VietQR</h3>
            <p className="text-xs text-slate-500">Quét mã QR bằng ứng dụng ngân hàng bất kỳ để hoàn tất đăng ký</p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=HANTUTOR_${enrollmentId}_${amount}`}
                alt="VietQR"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-xl text-xs space-y-1 text-slate-700 text-left">
              <div><strong>Số tiền:</strong> <span className="text-blue-700 font-bold">{amount?.toLocaleString()} VNĐ</span></div>
              <div><strong>Nội dung CK:</strong> <span className="font-mono font-bold text-slate-900">{enrollmentId}</span></div>
              <div><strong>Ngân hàng:</strong> MB Bank - STK: 999988882026 (HanTutor Platform)</div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPaid}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang xác thực thanh toán...' : 'Tôi đã chuyển khoản thành công'}
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <h3 className="text-2xl font-extrabold text-slate-900">Đăng ký thành công!</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lớp học đã được kích hoạt thành công. Giáo viên sẽ liên hệ và bắt đầu khóa học theo lịch đã chọn. Chúc bạn có những buổi học hiệu quả!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Hoàn tất & Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default CheckoutModal;
