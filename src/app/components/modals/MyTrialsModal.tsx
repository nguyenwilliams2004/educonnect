import React from 'react';
import { Link } from 'react-router';
import { X, Users } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export interface MyTrialsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenEnrollment?: (tutor: any) => void;
}

export function MyTrialsModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onOpenEnrollment: propOnOpenEnrollment
}: MyTrialsModalProps = {}) {
  const { isMyTrialsOpen, closeMyTrialsModal, openEnrollmentModal, openReviewModal } = useUI();
  const { myTrials, cancelTrialEnrollment, tutors, currentSession } = useData();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isMyTrialsOpen;
  const onClose = propOnClose || closeMyTrialsModal;
  const onOpenEnrollment = propOnOpenEnrollment || ((tutor: any) => {
    onClose();
    openEnrollmentModal(tutor);
  });

  if (!isOpen) return null;

  const isTeacher = currentSession.role === 'teacher';

  const defaultTeacherTrials = [
    {
      tutorId: 'stud_1',
      tutorName: 'Học sinh: Nguyễn Hoàng Nam (Lớp 12)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
      badgeSubject: 'Toán 12 - Luyện thi THPTQG',
      headline: 'Hẹn học thử: 19:30 Tối Thứ Năm • SĐT: 0987.654.321',
      phone: '0987654321',
      zalo: '0987654321',
      date: '02/09/2026',
      status: 'trial_in_progress' as const
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
      status: 'enrolled' as const
    }
  ];

  let teacherTrials = defaultTeacherTrials;
  try {
    const localTeacherTrials = JSON.parse(localStorage.getItem('hantutor_teacher_student_trials') || '[]');
    if (Array.isArray(localTeacherTrials) && localTeacherTrials.length > 0) {
      teacherTrials = [...localTeacherTrials, ...defaultTeacherTrials];
    }
  } catch (e) {}

  const displayedList = isTeacher ? teacherTrials : myTrials;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-extrabold text-slate-900">
            {isTeacher
              ? `Học sinh đã đăng ký học thử với bạn (${displayedList.length})`
              : `Lớp học thử & Giáo viên đã liên hệ (${displayedList.length})`}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isTeacher
              ? 'Danh sách học viên đăng ký nhận 01 buổi học thử 1-1. Bạn có thể nhấn mở Zalo để liên hệ và xếp lịch dạy ngay.'
              : 'Theo dõi tiến độ trao đổi học thử và xác nhận "Đăng ký học chính thức" sau khi hoàn thành buổi học 1-1.'}
          </p>
        </div>

        {displayedList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Users className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-medium">
              {isTeacher ? 'Chưa có học sinh nào đăng ký học thử với bạn.' : 'Bạn chưa liên hệ học thử với giáo viên nào.'}
            </p>
            {!isTeacher && (
              <Link
                to="/tim-gia-su"
                onClick={onClose}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Tìm giáo viên ngay →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {displayedList.map((item) => {
              const fullTutor = tutors.find(t => String(t.id) === String(item.tutorId));
              return (
                <div
                  key={item.tutorId}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.avatar} alt={item.tutorName} className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-xs" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">{item.tutorName}</span>
                        <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          {item.badgeSubject}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.headline || `Liên hệ ngày: ${item.date}`}</p>

                      {/* Trạng thái formal */}
                      <div className="mt-1 flex items-center gap-2">
                        {item.status === 'trial_in_progress' && (
                          <span className="inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-200">
                            {isTeacher ? 'Chờ xếp lịch & dạy thử 1-1' : 'Đang trao đổi & học thử'}
                          </span>
                        )}
                        {item.status === 'enrolled' && (
                          <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            {isTeacher ? 'Đã thành học viên chính thức' : 'Đã đăng ký học chính thức'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hành động */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 flex-wrap">
                    {item.phone && (
                      <a
                        href={`https://zalo.me/${item.zalo || item.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                      >
                        {isTeacher ? 'Liên hệ Học sinh (Zalo)' : 'Zalo'}
                      </a>
                    )}

                    {!isTeacher && (
                      <>
                        {/* Nút Đánh giá giáo viên */}
                        <button
                          type="button"
                          onClick={() => {
                            if (fullTutor) openReviewModal(fullTutor, item.status === 'enrolled' ? 'official' : 'trial');
                          }}
                          className="px-3 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                          title="Viết nhận xét & đánh giá giáo viên sau học thử hoặc thời gian học"
                        >
                          ⭐ Đánh giá
                        </button>

                        {item.status === 'trial_in_progress' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onOpenEnrollment(fullTutor || item)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
                            >
                              Đăng ký học chính thức
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelTrialEnrollment(item.tutorId)}
                              className="bg-white hover:bg-slate-100 text-slate-600 hover:text-red-600 font-semibold border border-slate-200 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap"
                              title="Hủy học / Không tiếp tục"
                            >
                              Không tiếp tục
                            </button>
                          </>
                        )}

                        {item.status === 'enrolled' && (
                          <span className="text-xs font-semibold text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                            Đang theo học
                          </span>
                        )}
                      </>
                    )}
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
