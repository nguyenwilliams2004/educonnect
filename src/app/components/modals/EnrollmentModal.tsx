import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export interface EnrollmentModalProps {
  tutor?: any;
  isOpen?: boolean;
  onClose?: () => void;
  onProceedToPayment?: (enrollmentId: string, amount: number, tutorId: string | number, slotId?: string | null) => void;
}

export function EnrollmentModal({
  tutor: propTutor,
  isOpen: propIsOpen,
  onClose: propOnClose,
  onProceedToPayment: propOnProceedToPayment
}: EnrollmentModalProps = {}) {
  const { enrollmentModalTutor, closeEnrollmentModal, openCheckoutModal } = useUI();
  const { recordOfficialEnrollment } = useData();

  const tutor = propTutor !== undefined ? propTutor : enrollmentModalTutor;
  const isOpen = propIsOpen !== undefined ? propIsOpen : !!enrollmentModalTutor;
  const onClose = propOnClose || closeEnrollmentModal;
  const onProceedToPayment = propOnProceedToPayment || ((enrollmentId: string, amount: number, tutorId: string | number, slotId?: string | null) => {
    recordOfficialEnrollment(tutorId, amount, slotId);
    openCheckoutModal(enrollmentId, amount, tutorId);
  });

  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [totalSessions, setTotalSessions] = useState<number>(8);

  if (!isOpen || !tutor) return null;

  const levels = tutor.levelPrices ? Object.keys(tutor.levelPrices) : ['Tiểu học', 'THCS', 'THPT'];
  const currentLvl = selectedLevel || levels[0];
  const priceString = tutor.levelPrices?.[currentLvl] || '200.000';
  const pricePerSession = parseInt(priceString.replace(/\D/g, '')) || 200000;
  const totalTuition = pricePerSession * totalSessions;
  const activeSlotId = tutor.selectedSlotId || tutor.slot_id || tutor.selectedSlot?.id || null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // enrollmentId is a local reference; Supabase UUID is tracked inside recordOfficialEnrollment
    const enrollmentId = 'ENR_' + Date.now();
    onClose();
    onProceedToPayment(enrollmentId, totalTuition, tutor.id, activeSlotId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h3 className="text-xl font-extrabold text-slate-900">Đăng ký học chính thức</h3>
          <p className="text-xs text-slate-500 mt-0.5">Giáo viên: <strong className="text-slate-800">{tutor.name}</strong></p>
        </div>

        {/* Thông tin khung giờ rảnh đã được giữ chỗ 5 phút */}
        {tutor.selectedSlot && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-emerald-900 block">Khung giờ đã chọn:</span>
              <span className="text-emerald-700 font-medium">
                {tutor.selectedSlot.day} • {tutor.selectedSlot.shift || tutor.selectedSlot.shiftLabel}
              </span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Đã giữ chỗ 5p
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chọn cấp độ học</label>
            <select
              value={currentLvl}
              onChange={e => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none bg-white"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl} ({tutor.levelPrices?.[lvl] || '200.000'}đ/giờ)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Số buổi đăng ký cho khóa đầu tiên</label>
            <div className="grid grid-cols-3 gap-2">
              {[8, 12, 16].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setTotalSessions(num)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${totalSessions === num ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
                >
                  {num} buổi
                </button>
              ))}
            </div>
          </div>

          {/* Chi tiết học phí cho học sinh */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Học phí 1 buổi ({currentLvl}):</span>
              <span className="font-bold text-slate-900">{pricePerSession.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Số buổi đăng ký:</span>
              <span className="font-bold text-slate-900">{totalSessions} buổi</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Tổng thanh toán học phí:</span>
              <span className="text-blue-600 text-base">{totalTuition.toLocaleString()}đ</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-200 cursor-pointer"
          >
            Tiến hành thanh toán VietQR ({totalTuition.toLocaleString()}đ)
          </button>
        </form>
      </div>
    </div>
  );
}
export default EnrollmentModal;
