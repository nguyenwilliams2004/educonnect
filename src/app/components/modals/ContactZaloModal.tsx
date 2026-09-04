import React, { useState } from 'react';
import { X, ShieldCheck, ExternalLink, LogIn, UserCheck, CheckCircle2, BookOpen, Copy, Check } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export interface ContactZaloModalProps {
  tutor?: any;
  isOpen?: boolean;
  onClose?: () => void;
  onOfficialEnroll?: () => void;
}

export function ContactZaloModal({
  tutor: propTutor,
  isOpen: propIsOpen,
  onClose: propOnClose,
  onOfficialEnroll: _propOnOfficialEnroll,
}: ContactZaloModalProps = {}) {
  const { contactZaloModalTutor, closeContactZaloModal, openAuthModal, openMyTrialsModal } = useUI();
  const { recordTrialContact, currentSession, myTrials } = useData();

  const tutor = propTutor !== undefined ? propTutor : contactZaloModalTutor;
  const isOpen = propIsOpen !== undefined ? propIsOpen : !!contactZaloModalTutor;
  const onClose = propOnClose || closeContactZaloModal;

  const [justSaved, setJustSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLoggedIn = currentSession && currentSession.role !== 'anonymous' && !!currentSession.userId;

  const existingTrial = tutor && myTrials.find(
    (t) => String(t.tutorId) === String(tutor.id) && t.status !== 'cancelled'
  );
  const isRegistered = justSaved || !!existingTrial;

  if (!isOpen || !tutor) return null;

  const handleConfirmTrial = async () => {
    if (!isLoggedIn) {
      onClose();
      openAuthModal('login', 'student');
      return;
    }
    await recordTrialContact(tutor);
    setJustSaved(true);
  };

  const handleOpenZalo = async () => {
    if (isLoggedIn && !isRegistered) {
      await recordTrialContact(tutor);
      setJustSaved(true);
    }
    window.open(zaloUrl, '_blank', 'noopener,noreferrer');
  };

  // Lấy SĐT / Zalo của giáo viên đã đăng ký để tạo link & mã QR Zalo
  const rawPhone = tutor.zalo || tutor.phone || '0967891234';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const zaloUrl = `https://zalo.me/${cleanPhone}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(zaloUrl)}&margin=8`;

  // Mẫu tin nhắn gửi gia sư kèm ngữ cảnh
  const studentName = currentSession?.fullName || 'Học sinh';
  const slotDay = tutor.selectedSlot?.day;
  const slotShift = tutor.selectedSlot?.shift || tutor.selectedSlot?.shiftLabel || tutor.selectedSlot?.time;
  const slotInfo = slotDay ? `${slotDay} (${slotShift})` : 'lịch hẹn thuận tiện';
  const prefilledMessage = `Em chào ${tutor.name}, em là ${studentName} trên EduConnect. Em muốn xin phép hẹn Thầy/Cô 01 buổi học thử 1-1 môn ${tutor.badgeSubject || tutor.subjects?.[0] || 'học'} vào ${slotInfo} ạ!`;

  const handleCopyMessage = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(prefilledMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer z-10"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-3.5 pt-1">
          {/* Header Thông tin Giáo viên */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
            <div className="relative shrink-0">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover shadow-2xs border border-slate-200"
              />
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] text-white"
                title="Trực tuyến"
              >
                ✓
              </span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">{tutor.name}</h3>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5" /> Xác thực
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{tutor.title || 'Gia sư chuyên nghiệp'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                  {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
                </span>
                {tutor.selectedSlot && (
                  <span className="bg-emerald-100/80 text-emerald-800 text-[9px] font-semibold px-2 py-0.5 rounded-md truncate">
                    {tutor.selectedSlot.day} • {tutor.selectedSlot.shift || tutor.selectedSlot.shiftLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CHƯA ĐĂNG NHẬP */}
          {!isLoggedIn ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3 text-left">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Yêu cầu Đăng nhập</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Vui lòng đăng nhập tài khoản học sinh để kết nối Zalo và nhận 01 buổi học thử 1-1 miễn phí cùng <strong>{tutor.name}</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('login', 'student');
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập để nhận học thử</span>
              </button>
            </div>
          ) : (
            /* ĐÃ ĐĂNG NHẬP: GIAO DIỆN KẾT NỐI TINH GỌN */
            <>
              {/* Khung Mã QR (Hiển thị gọn gàng, tối ưu Desktop & ẩn bớt trên Mobile nhỏ) */}
              <div className="bg-gradient-to-b from-blue-50/50 to-slate-50 border border-blue-100 p-3.5 rounded-2xl text-center space-y-2.5">
                <div className="hidden sm:block">
                  <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wide block">
                    Quét Mã QR Kết Nối Trực Tiếp
                  </span>
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-xs border border-slate-200 mt-2 flex items-center justify-center">
                    <img
                      src={qrCodeUrl}
                      alt={`Mã QR Zalo ${tutor.name}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                </div>

                <div className="sm:hidden text-xs text-blue-950 font-medium py-1">
                  Nhấn nút bên dưới để mở ứng dụng Zalo và gửi tin nhắn hẹn học thử với <strong>{tutor.name}</strong>.
                </div>

                <p className="text-[10px] text-slate-500">
                  🔒 Bảo mật thông tin • Học thử 1-1 miễn phí
                </p>
              </div>

              {/* Hộp Tin nhắn mẫu sao chép */}
              <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-left text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700">Lời nhắn mẫu cho gia sư:</span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100 line-clamp-2">
                  "{prefilledMessage}"
                </div>
              </div>

              {/* Nút hành động */}
              <div className="space-y-2 pt-0.5">
                {isRegistered ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Đã lưu vào "Lớp học thử của tôi"
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openMyTrialsModal();
                      }}
                      className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 underline cursor-pointer shrink-0"
                    >
                      Xem lịch →
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmTrial}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lưu vào "Lớp học thử của tôi"</span>
                  </button>
                )}

                {/* Nút chính: Mở Zalo */}
                <button
                  type="button"
                  onClick={handleOpenZalo}
                  className="w-full py-3 bg-[#0068FF] hover:bg-[#0056d6] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Mở Zalo & Đăng ký học thử 1-1</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Ghi chú chân modal */}
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Sau khi kết nối Zalo, hai bên trao đổi chi tiết ca học. Bạn có thể theo dõi và đánh giá ở mục <strong>"Lớp học thử của tôi"</strong>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactZaloModal;
