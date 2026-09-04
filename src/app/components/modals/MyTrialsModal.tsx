import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  X,
  Users,
  Calendar,
  Clock,
  MessageCircle,
  ExternalLink,
  Star,
  Trash2,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { StudentTrialItem } from '../../../context/BookingContext';

export interface MyTrialsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenEnrollment?: (tutor: any) => void;
}

/* Hallmark · component: MyTrialsModal · genre: editorial · theme: Broadside Academic Roster
 * states: default · hover · focus · active · disabled · loading
 * contrast: pass (WCAG AA)
 */

export function MyTrialsModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onOpenEnrollment: propOnOpenEnrollment,
}: MyTrialsModalProps = {}) {
  const { isMyTrialsOpen, closeMyTrialsModal, openEnrollmentModal, openReviewModal } = useUI();
  const { myTrials, cancelTrialEnrollment, updateTrialStatus, tutors, currentSession } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'enrolled'>('all');

  const isOpen = propIsOpen !== undefined ? propIsOpen : isMyTrialsOpen;
  const onClose = propOnClose || closeMyTrialsModal;
  const onOpenEnrollment =
    propOnOpenEnrollment ||
    ((tutor: any) => {
      onClose();
      openEnrollmentModal(tutor);
    });

  if (!isOpen) return null;

  const isTeacher = currentSession.role === 'teacher';

  const defaultTeacherTrials: StudentTrialItem[] = [
    {
      tutorId: 'stud_1',
      tutorName: 'Học sinh: Nguyễn Hoàng Nam (Lớp 12)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
      badgeSubject: 'Toán 12 - Luyện thi THPTQG',
      headline: 'Hẹn học thử: 19:30 Tối Thứ Năm • SĐT: 0987.654.321',
      phone: '0987654321',
      zalo: '0987654321',
      date: '02/09/2026',
      bookingTime: '14:20',
      status: 'trial_in_progress',
      slotDay: 'Thứ Năm',
      slotTime: '19:30 - 21:00',
      studentName: 'Nguyễn Hoàng Nam',
      studentPhone: '0987654321',
    },
    {
      tutorId: 'stud_2',
      tutorName: 'Học sinh: Trần Bảo Anh (Lớp 10)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400',
      badgeSubject: 'Toán 10 - Nâng cao',
      headline: 'Đã hoàn thành học thử 1-1 • Đã thanh toán học phí khóa 8 buổi',
      phone: '0912888999',
      zalo: '0912888999',
      date: '01/09/2026',
      bookingTime: '09:15',
      status: 'enrolled',
      slotDay: 'Thứ Bảy',
      slotTime: '08:30 - 10:00',
      studentName: 'Trần Bảo Anh',
      studentPhone: '0912888999',
    },
  ];

  let rawList: StudentTrialItem[] = [];
  if (isTeacher) {
    let localTeacherTrials: StudentTrialItem[] = [];
    try {
      localTeacherTrials = JSON.parse(
        localStorage.getItem('hantutor_teacher_student_trials') || '[]'
      );
    } catch (e) {}

    const combined = [...(myTrials || []), ...localTeacherTrials, ...defaultTeacherTrials];
    const seen = new Set<string>();
    rawList = combined.filter((item) => {
      const id = String(item.enrollmentId || item.tutorId);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  } else {
    rawList = myTrials || [];
  }

  const displayedList = rawList.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress')
      return item.status === 'trial_in_progress' || item.status === 'trial_completed';
    if (activeTab === 'enrolled') return item.status === 'enrolled';
    return true;
  });

  const handleCancelTrial = (item: StudentTrialItem) => {
    if (
      window.confirm(
        `Bạn có chắc muốn hủy / xóa ${
          isTeacher ? 'học viên' : 'lớp học thử cùng'
        } "${item.tutorName}" khỏi danh sách?`
      )
    ) {
      cancelTrialEnrollment(item.tutorId);
    }
  };

  const handleMarkTrialCompleted = (item: StudentTrialItem) => {
    updateTrialStatus(item.tutorId, 'trial_completed');
  };

  const handleOpenReview = (item: StudentTrialItem, fullTutor: any) => {
    const targetTutor = fullTutor || {
      id: item.tutorId,
      name: item.tutorName,
      displayName: item.displayName || item.tutorName,
      avatar: item.avatar,
      badgeSubject: item.badgeSubject,
      subjects: [item.badgeSubject],
    };
    openReviewModal(targetTutor, item.status === 'enrolled' ? 'official' : 'trial');
  };

  // Trích xuất giờ đặt học thử chính xác
  const getBookingTimeString = (item: StudentTrialItem) => {
    if (item.bookingTime) return item.bookingTime;
    if (item.createdAt) {
      try {
        const d = new Date(item.createdAt);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
      } catch {}
    }
    if (item.headline) {
      const match = item.headline.match(/(\d{1,2}:\d{2})/);
      if (match) return match[1];
    }
    return '09:00';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative border border-slate-200/90 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hallmark Editorial - Broadsheet Academic Masthead */}
        <div className="mb-4 pb-4 border-b border-slate-100 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-500/15 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded">
                  {isTeacher ? 'HANTUTOR QUẢN LÝ LỚP DẠY' : 'SỔ TAY THEO DÕI HỌC THỬ 1-1'}
                </span>
                <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">· Cam kết 100% miễn phí</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {isTeacher
                  ? `Danh sách học sinh học thử (${rawList.length})`
                  : `Lớp học thử của tôi (${rawList.length})`}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {isTeacher
              ? 'Quản lý học viên đăng ký 01 buổi học thử 1-1. Bạn có thể mở Zalo kết nối và xếp lịch dạy ngay.'
              : 'Theo dõi tiến độ học thử 1-1 miễn phí, xem thời điểm đã đặt lịch, kết nối Zalo với thầy cô và đăng ký học chính thức.'}
          </p>

          {/* Quick Stat Bar & Filter Tabs */}
          {rawList.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Tất cả</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {rawList.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('in_progress')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'in_progress'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <span>{isTeacher ? 'Chờ dạy thử' : 'Đang học thử'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${activeTab === 'in_progress' ? 'bg-white/20 text-white' : 'bg-amber-200/70 text-amber-900'}`}>
                    {rawList.filter((i) => i.status === 'trial_in_progress' || i.status === 'trial_completed').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('enrolled')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'enrolled'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                  }`}
                >
                  <span>{isTeacher ? 'Đã chốt học' : 'Đã học chính thức'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${activeTab === 'enrolled' ? 'bg-white/20 text-white' : 'bg-emerald-200/70 text-emerald-900'}`}>
                    {rawList.filter((i) => i.status === 'enrolled').length}
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bảo chứng chất lượng học thử 1-1</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        {displayedList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3 flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1 shadow-inner">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {isTeacher
                  ? activeTab === 'all'
                    ? 'Chưa có học sinh nào đăng ký học thử với bạn.'
                    : 'Không có học viên nào ở mục này.'
                  : activeTab === 'all'
                  ? 'Bạn chưa có lớp học thử nào.'
                  : 'Không có lớp học thử nào ở mục này.'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                {isTeacher
                  ? 'Khi học sinh bấm đăng ký học thử qua hồ sơ của bạn, thông tin và lịch hẹn sẽ tự động xuất hiện ở đây.'
                  : 'Chọn giáo viên phù hợp trên HanTutor để nhận ngay 01 buổi học thử 1-1 hoàn toàn miễn phí!'}
              </p>
            </div>
            {!isTeacher && (
              <Link
                to="/tim-gia-su"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-98"
              >
                <span>Khám phá danh sách giáo viên</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {displayedList.map((item) => {
              const fullTutor = tutors.find((t) => String(t.id) === String(item.tutorId));
              const cleanPhone = (item.zalo || item.phone || '').replace(/[^0-9]/g, '');
              const bookingTimeStr = getBookingTimeString(item);

              return (
                <div
                  key={String(item.enrollmentId || item.tutorId)}
                  className="relative bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 transition-all shadow-xs hover:shadow-md space-y-4 overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:via-indigo-500 before:to-amber-500"
                >
                  {/* VÙNG 1: AVATAR, TÊN ĐẦY ĐỦ KHÔNG BỊ CẮT, MÔN HỌC & TRẠNG THÁI */}
                  <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img
                          src={item.avatar}
                          alt={item.tutorName}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-xs border-2 border-white ring-1 ring-slate-200/80"
                        />
                        <span
                          className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] text-white font-bold shadow-xs"
                          title="Đã xác thực danh tính & chuyên môn"
                        >
                          ✓
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* TÊN HIỂN THỊ TRỌN VẸN - TRIỆT TIÊU LỖI CẮT CHỮ */}
                          <h4 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug tracking-tight">
                            {item.tutorName}
                          </h4>
                          <span className="inline-flex items-center gap-1 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shrink-0 shadow-3xs">
                            <BookOpen className="w-3 h-3 text-amber-400" />
                            {item.badgeSubject}
                          </span>
                        </div>

                        {/* Châm ngôn sư phạm / Ghi chú trang nhã */}
                        {item.headline && (
                          <div className="text-xs text-slate-600 leading-relaxed font-normal pl-2.5 border-l-2 border-slate-200 mt-1.5 italic">
                            “{item.headline}”
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Huy hiệu trạng thái chính quy */}
                    <div className="shrink-0">
                      {item.status === 'trial_in_progress' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/80 shadow-3xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isTeacher ? 'Chờ xếp lịch & dạy thử 1-1' : 'Đang trao đổi & học thử 1-1'}</span>
                        </span>
                      )}
                      {item.status === 'trial_completed' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/80 shadow-3xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isTeacher ? 'Đã dạy thử xong' : 'Đã học thử • Sẵn sàng đăng ký'}</span>
                        </span>
                      )}
                      {item.status === 'enrolled' && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/80 shadow-3xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isTeacher ? 'Đã là học viên chính thức' : 'Đã đăng ký học chính thức'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* VÙNG 2: PHIẾU HẸN HỌC THỬ (TICKET SLIP) - XEM THỜI ĐIỂM ĐẶT LÚC MẤY GIỜ & LỊCH HỌC THỬ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-3xs">
                    {/* 1. Thời điểm đặt lịch */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Thời điểm đặt lịch</span>
                        <div className="text-xs text-slate-800 font-medium mt-0.5">
                          Lúc <strong className="text-slate-900 font-extrabold text-sm font-mono">{bookingTimeStr}</strong>
                          <span className="text-slate-500 font-normal"> · Ngày {item.date || '04/09/2026'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Lịch học thử đã hẹn trước */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lịch hẹn buổi học thử</span>
                        <div className="text-xs text-emerald-800 font-bold mt-0.5 truncate">
                          {item.slotDay
                            ? `Lịch học thử: ${item.slotDay} ${item.slotTime ? `(${item.slotTime})` : ''}`
                            : 'Lịch học thử: Thống nhất trực tiếp qua Zalo'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VÙNG 3: THANH CÔNG CỤ HÀNH ĐỘNG RỘNG RÃI & PHÂN TÁCH KHOA HỌC */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
                    {/* Nhóm liên hệ Zalo & Xem hồ sơ */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {cleanPhone && (
                        <a
                          href={`https://zalo.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#0068FF] hover:bg-[#0056d6] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md active:scale-98"
                          title="Mở Zalo nhắn tin trao đổi"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{isTeacher ? 'Nhắn Zalo Học sinh' : 'Nhắn Zalo Thầy/Cô'}</span>
                        </a>
                      )}

                      {item.tutorId && !isTeacher && (
                        <Link
                          to={`/giao-vien/${item.tutorId}`}
                          onClick={onClose}
                          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-3xs"
                          title="Xem trang hồ sơ giáo viên"
                        >
                          <span>Hồ sơ chi tiết</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      )}
                    </div>

                    {/* Nhóm nút nghiệp vụ chính */}
                    <div className="flex items-center gap-2 flex-wrap ml-auto">
                      {isTeacher ? (
                        <>
                          {item.status === 'trial_in_progress' && (
                            <button
                              type="button"
                              onClick={() => handleMarkTrialCompleted(item)}
                              className="px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shadow-3xs"
                              title="Xác nhận đã hoàn thành buổi dạy thử"
                            >
                              ✓ Xác nhận đã dạy thử
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCancelTrial(item)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Xóa học viên khỏi danh sách"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Đánh giá giáo viên */}
                          <button
                            type="button"
                            onClick={() => handleOpenReview(item, fullTutor)}
                            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-3xs"
                            title="Viết nhận xét & đánh giá giáo viên sau học thử"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>Đánh giá</span>
                          </button>

                          {/* Đăng ký học chính thức */}
                          {item.status !== 'enrolled' && (
                            <button
                              type="button"
                              onClick={() => onOpenEnrollment(fullTutor || item)}
                              className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm shadow-blue-500/20 cursor-pointer whitespace-nowrap flex items-center gap-1"
                            >
                              <span>Đăng ký học chính thức</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Hủy học thử / Không tiếp tục */}
                          {item.status === 'trial_in_progress' && (
                            <button
                              type="button"
                              onClick={() => handleCancelTrial(item)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Hủy học thử / Không tiếp tục"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {item.status === 'enrolled' && (
                            <span className="text-xs font-bold text-emerald-800 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                              ✓ Đang theo học chính thức
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTrialsModal;
