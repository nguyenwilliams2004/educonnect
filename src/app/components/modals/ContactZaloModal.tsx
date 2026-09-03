import React, { useState } from 'react';
import { X, ShieldCheck, ExternalLink, LogIn, UserCheck, CheckCircle2, BookOpen } from 'lucide-react';
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
  onOfficialEnroll: propOnOfficialEnroll
}: ContactZaloModalProps = {}) {
  const { contactZaloModalTutor, closeContactZaloModal, setEnrollmentModalTutor, openAuthModal, openMyTrialsModal } = useUI();
  const { recordTrialContact, currentSession, myTrials } = useData();

  const tutor = propTutor !== undefined ? propTutor : contactZaloModalTutor;
  const isOpen = propIsOpen !== undefined ? propIsOpen : !!contactZaloModalTutor;
  const onClose = propOnClose || closeContactZaloModal;
  const onOfficialEnroll = propOnOfficialEnroll || (() => {
    const t = tutor;
    closeContactZaloModal();
    setEnrollmentModalTutor(t);
  });

  const [justSaved, setJustSaved] = useState(false);
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
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(zaloUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          {/* Header Thông tin Giáo viên */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-sm border-2 border-slate-100"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white" title="Trực tuyến">
                ✓
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">{tutor.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{tutor.title}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Zalo đã xác thực
              </span>
            </div>
          </div>

          {/* Thông tin khung giờ đã chọn */}
          {tutor.selectedSlot && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-left text-xs flex items-center justify-between animate-in fade-in">
              <div>
                <span className="font-bold text-emerald-900 block">Khung giờ học thử đã chọn:</span>
                <span className="text-emerald-700 font-medium">
                  {tutor.selectedSlot.day} • {tutor.selectedSlot.shift || tutor.selectedSlot.shiftLabel}
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Đã giữ chỗ 5p
              </span>
            </div>
          )}

          {/* NẾU CHƯA ĐĂNG NHẬP: BẮT ĐĂNG NHẬP TRƯỚC */}
          {!isLoggedIn ? (
            <div className="bg-amber-50/90 border border-amber-200/90 p-5 rounded-3xl space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Yêu cầu Đăng nhập</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Vui lòng đăng nhập tài khoản học sinh để kết nối Zalo. Giáo viên <strong className="text-slate-900">{tutor.name}</strong> sẽ nhận được thông tin để hỗ trợ xếp lịch học thử 1-1 cho bạn.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal('login', 'student');
                }}
                className="w-full py-3.5 bg-[#111111] hover:bg-[#282828] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập để nhận học thử Zalo</span>
              </button>
            </div>
          ) : (
            /* NẾU ĐÃ ĐĂNG NHẬP: HIỂN THỊ MÃ QR VÀ NÚT KẾT NỐI */
            <>
              {/* Khung Mã QR Zalo Giáo viên */}
              <div className="bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-100 p-5 rounded-3xl space-y-3">
                <div className="text-center">
                  <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider block">
                    Mã QR Zalo Kết Nối Trực Tiếp
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Quét mã bằng Zalo trên điện thoại để nhắn tin & xếp lịch học thử 1-1
                  </p>
                </div>

                {/* Ảnh mã QR */}
                <div className="w-48 h-48 sm:w-52 sm:h-52 mx-auto bg-white p-2.5 rounded-2xl shadow-md border border-slate-200/80 flex items-center justify-center relative group">
                  <img
                    src={qrCodeUrl}
                    alt={`Mã QR Zalo ${tutor.name}`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium">
                  <span>🔒 Bảo mật thông tin</span> • <span>Học thử 1-1 miễn phí</span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="space-y-2.5 pt-1">
                {isRegistered ? (
                  <>
                    <div className="bg-emerald-50 border border-emerald-200/90 p-3.5 rounded-2xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
                      <span className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
                        Xem danh sách →
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenZalo}
                      className="w-full py-3.5 bg-[#0068FF] hover:bg-[#0056d6] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Mở Zalo nhắn tin trao đổi</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenZalo}
                      className="w-full py-3.5 bg-[#0068FF] hover:bg-[#0056d6] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Mở Zalo & Đăng ký học thử 1-1</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmTrial}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lưu giáo viên vào "Lớp học thử của tôi"</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={onOfficialEnroll}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
                >
                  Đã hoàn thành học thử: Đăng ký học chính thức
                </button>
              </div>

              {/* Ghi chú hướng dẫn */}
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-[11px] text-slate-500 text-center leading-relaxed">
                💡 Sau khi kết nối Zalo, hai bên tự do trao đổi và xếp lịch học thử 1-1 miễn phí. Bạn có thể theo dõi tiến độ ở mục <strong className="text-slate-700">"Lớp học thử của tôi"</strong>.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default ContactZaloModal;
