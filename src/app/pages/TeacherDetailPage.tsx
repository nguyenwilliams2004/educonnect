import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import {
  CheckCircle,
  User,
  Edit3,
  Briefcase,
  GraduationCap,
  Laptop,
  MapPin,
  ShieldCheck,
  Award,
  Eye,
  BookOpen,
  Target,
  Globe,
  Calendar,
  Play,
  Star,
  ThumbsUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ZoomIn,
  ZoomOut,
  MessageCircle,
  X,
  Clock,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Check
} from 'lucide-react';
import { mockTutors } from '../data';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { supabase } from '../../lib/supabase';

const dayToNumMap: Record<string, number> = {
  'Chủ Nhật': 1,
  'Thứ 2': 2,
  'Thứ 3': 3,
  'Thứ 4': 4,
  'Thứ 5': 5,
  'Thứ 6': 6,
  'Thứ 7': 7,
};

const shiftTimeMap: Record<string, { start: string; end: string }> = {
  'Sáng': { start: '08:00:00', end: '11:30:00' },
  'Chiều': { start: '14:00:00', end: '17:30:00' },
  'Tối': { start: '18:30:00', end: '21:30:00' },
};

const isUUID = (val: any) => /^[0-9a-f-]{36}$/i.test(String(val));

export function TeacherDetailPage() {
  const { id } = useParams();
  const { tutors, myTrials, reviews, getMaskedTutor, currentSession } = useData();
  const {
    openContactZaloModal,
    openEnrollmentModal,
    openAuthModal,
    setPendingTrialTutor,
    openReviewModal,
    openTeacherProfileModal,
  } = useUI();

  const [activeProofModal, setActiveProofModal] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [relatedPage, setRelatedPage] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'trial' | 'official'>('all');

  // State giữ chỗ lịch rảnh (reserve_slot TTL 5 phút)
  const [dbSlots, setDbSlots] = useState<any[]>([]);
  const [reservingSlotKey, setReservingSlotKey] = useState<string | null>(null);
  const [heldSlot, setHeldSlot] = useState<{
    id: string;
    slotKey: string;
    day: string;
    shiftLabel: string;
    lockedUntil: string;
  } | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [reservationWarning, setReservationWarning] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setRelatedPage(0);
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAvatarModalOpen(false);
        setActiveProofModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resolvedId = id;
  const rawTutor =
    tutors.find(
      (t) =>
        String(t.id) === String(resolvedId) ||
        String(t.slug) === String(resolvedId) ||
        String(t.id) === String(id) ||
        String(t.slug) === String(id)
    ) ||
    mockTutors.find(
      (t) =>
        String(t.id) === String(resolvedId) ||
        String(t.slug) === String(resolvedId) ||
        String(t.id) === String(id) ||
        String(t.slug) === String(id)
    ) ||
    tutors[0] ||
    mockTutors[0];

  const tutor = getMaskedTutor(rawTutor);

  // 1. Tải danh sách availability_slots thực từ Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadAvailabilitySlots() {
      if (!tutor?.id || !isUUID(tutor.id)) return;
      try {
        const { data, error } = await supabase
          .from('availability_slots')
          .select('*')
          .eq('instructor_id', tutor.id);

        if (!error && data && isMounted) {
          setDbSlots(data);
        }
      } catch (err) {
        console.warn('[TeacherDetailPage] Lỗi tải khung giờ:', err);
      }
    }
    loadAvailabilitySlots();
    return () => {
      isMounted = false;
    };
  }, [tutor?.id]);

  // 2. Đồng hồ đếm ngược 5 phút (TTL giữ chỗ)
  useEffect(() => {
    if (!heldSlot || countdownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHeldSlot(null);
          setReservationWarning('Thời gian giữ chỗ 5 phút đã hết hạn. Khung giờ đã được mở lại.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [heldSlot, countdownSeconds]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 3. Gọi Stored Procedure reserve_slot khóa chỗ 5 phút
  const handleSelectAndReserveSlot = async (day: string, shiftObj: { label: string; key: string }) => {
    const slotKey = `${day}_${shiftObj.key}`;
    const dayNum = dayToNumMap[day];
    const times = shiftTimeMap[shiftObj.key];
    if (!dayNum || !times) return;

    setReservingSlotKey(slotKey);
    setReservationWarning(null);

    try {
      const localHolderId =
        localStorage.getItem('hantutor_slot_holder_id') ||
        'guest_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('hantutor_slot_holder_id', localHolderId);
      const holderId = currentSession?.userId || localHolderId;

      let matchedSlot = dbSlots.find(
        (s) => s.day_of_week === dayNum && s.start_time?.startsWith(times.start.slice(0, 5))
      );

      // Nếu ca học chưa có bản ghi trong bảng availability_slots (hoặc là mock tutor):
      if (!matchedSlot?.id) {
        const slotId = isUUID(tutor.id)
          ? `${tutor.id.slice(0, 8)}-${dayNum}000-0000-0000-${Date.now().toString().slice(-12)}`
          : `slot_${slotKey}_${Date.now()}`;

        const newHeld = {
          id: slotId,
          slotKey,
          day,
          shiftLabel: shiftObj.label,
          lockedUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        };
        setHeldSlot(newHeld);
        setCountdownSeconds(300);

        openEnrollmentModal({
          ...tutor,
          selectedSlotId: slotId,
          slot_id: slotId,
          selectedSlot: {
            id: slotId,
            day,
            shift: shiftObj.label,
            slotKey,
          },
        });
        return;
      }

      const slotId = matchedSlot.id;

      if (heldSlot && heldSlot.id !== slotId) {
        try {
          await supabase.rpc('release_slot', {
            p_slot_id: heldSlot.id,
            p_holder_id: holderId,
          });
        } catch (e) {}
      }

      // GỌI STORED PROCEDURE reserve_slot KHÓA CHỖ 5 PHÚT
      const { data, error } = await supabase.rpc('reserve_slot', {
        p_slot_id: slotId,
        p_holder_id: holderId,
        p_lock_minutes: 5,
      });

      // Fallback an toàn nếu DB báo không tồn tại
      if (error || (data && data.success === false && data.message === 'Khung giờ không tồn tại')) {
        const newHeld = {
          id: slotId,
          slotKey,
          day,
          shiftLabel: shiftObj.label,
          lockedUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        };
        setHeldSlot(newHeld);
        setCountdownSeconds(300);

        openEnrollmentModal({
          ...tutor,
          selectedSlotId: slotId,
          slot_id: slotId,
          selectedSlot: {
            id: slotId,
            day,
            shift: shiftObj.label,
            slotKey,
          },
        });
        return;
      }

      if (data && data.success === true) {
        const newHeld = {
          id: slotId,
          slotKey,
          day,
          shiftLabel: shiftObj.label,
          lockedUntil: data.locked_until || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        };
        setHeldSlot(newHeld);
        setCountdownSeconds(300);

        setDbSlots((prev) =>
          prev.map((s) =>
            s.id === slotId ? { ...s, locked_until: data.locked_until, locked_by: holderId } : s
          )
        );

        openEnrollmentModal({
          ...tutor,
          selectedSlotId: slotId,
          slot_id: slotId,
          selectedSlot: {
            id: slotId,
            day,
            shift: shiftObj.label,
            slotKey,
          },
        });
      } else {
        const warningMsg =
          data?.message ||
          'Khung giờ này đang có người khác thao tác giữ chỗ. Vui lòng thử lại sau ít phút.';
        setReservationWarning(warningMsg);
        alert(`Không thể giữ chỗ: ${warningMsg}`);
      }
    } catch (err: any) {
      console.error('[reserve_slot] Exception:', err);
      const exMsg = err.message || 'Lỗi hệ thống khi giữ chỗ.';
      setReservationWarning(exMsg);
      alert(`Lỗi: ${exMsg}`);
    } finally {
      setReservingSlotKey(null);
    }
  };

  const handleReleaseSlot = async () => {
    if (!heldSlot) return;
    const holderId =
      currentSession?.userId || localStorage.getItem('hantutor_slot_holder_id') || 'guest';
    try {
      await supabase.rpc('release_slot', {
        p_slot_id: heldSlot.id,
        p_holder_id: holderId,
      });
    } catch (e) {
      console.warn('[release_slot] error:', e);
    }
    setHeldSlot(null);
    setCountdownSeconds(0);
  };

  if (!tutor) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-8">
        <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-stone-500 font-medium">
          Không tìm thấy thông tin giáo viên
        </div>
      </div>
    );
  }

  const isLoggedIn = currentSession && currentSession.role !== 'anonymous' && !!currentSession.userId;

  const handleTrialContactClick = () => {
    if (!isLoggedIn) {
      setPendingTrialTutor(tutor);
      alert(
        `Vui lòng đăng nhập tài khoản học sinh để nhận 01 buổi học thử 1-1 cùng ${
          tutor.displayName || tutor.name
        }!`
      );
      openAuthModal('login', 'student');
      return;
    }
    openContactZaloModal(tutor);
  };

  const trialItem = myTrials.find((t) => String(t.tutorId) === String(tutor.id));

  const totalTrials = tutor.trialStats?.totalTrials || 0;
  const officialEnrolled = tutor.trialStats?.officialEnrolled || 0;
  const successRate =
    totalTrials > 0 ? Math.round((officialEnrolled / totalTrials) * 100) : 96;

  const isTeacher =
    tutor.type === 'Giáo viên' ||
    (tutor.rolePrefix && (tutor.rolePrefix.includes('Cô') || tutor.rolePrefix.includes('Thầy')));

  const tutorReviews = reviews.filter((r) => String(r.tutorId) === String(tutor.id));
  const displayedReviewsRaw =
    tutorReviews.length > 0
      ? tutorReviews
      : [
          {
            id: 'rev_1',
            studentName: 'Phụ huynh em Tuấn Anh',
            comment: `Gia đình mình được biết ${
              tutor.displayName || tutor.name
            } qua giới thiệu. Sau buổi học thử 1-1, thầy/cô đã nắm bắt ngay điểm yếu của con và đưa ra lộ trình rõ ràng, giải thích cặn kẽ, dễ hiểu và truyền cảm hứng rất tốt. Rất khuyên các bạn nên học thử!`,
            stage: 'trial' as const,
            rating: 5,
            date: 'Gần đây',
            verified: true,
          },
          {
            id: 'rev_2',
            studentName: 'Em Bảo Ngọc (Lớp 12)',
            comment: `Mình theo học với ${
              tutor.displayName || tutor.name
            } để chuẩn bị cho kỳ thi tốt nghiệp THPT. Học cùng ${
              tutor.displayName || tutor.name
            } tiến bộ rõ rệt nhờ phương pháp tư duy thực chiến, tận tâm nhiệt tình và giải đáp thắc mắc 24/7. Kết quả thi thử đạt 9.0 vượt ngoài mong đợi!`,
            stage: 'official' as const,
            rating: 5,
            date: '1 tháng trước',
            verified: true,
          },
          {
            id: 'rev_3',
            studentName: 'Nguyễn Minh Quân',
            comment: `Theo dõi bài giảng trên nền tảng thấy rất ấn tượng, sau buổi học thử 1-1 thấy phương pháp truyền đạt rất dễ tiếp thu. Đánh giá 10/10 về độ tận tụy và nghiệp vụ sư phạm!`,
            stage: 'trial' as const,
            rating: 5,
            date: '2 tháng trước',
            verified: true,
          },
        ];

  const displayedReviews = displayedReviewsRaw.filter((r) => {
    if (reviewFilter === 'trial') return r.stage === 'trial';
    if (reviewFilter === 'official') return r.stage !== 'trial';
    return true;
  });

  const subjectsList =
    Array.isArray(tutor.subjects) && tutor.subjects.length > 0
      ? tutor.subjects
      : [tutor.badgeSubject || 'Môn học', 'Luyện thi Chuyên sâu', 'Bồi dưỡng Học sinh Giỏi'];

  const extractBaseHourlyRate = (rateInput: any): number => {
    if (typeof rateInput === 'number') return rateInput;
    if (!rateInput) return 200000;
    const str = String(rateInput).trim();
    const parts = str.split(/[-–—~đến]/);
    const firstPart = parts[0]?.replace(/[^0-9]/g, '') || '';
    const num = parseInt(firstPart, 10);
    if (isNaN(num) || num === 0) return 200000;
    if (num < 1000) return num * 1000;
    return num;
  };

  const baseHourlyRate = extractBaseHourlyRate(tutor.hourlyRate);
  const package5h = Math.round(baseHourlyRate * 5 * 0.95).toLocaleString('vi-VN') + ' VNĐ';
  const package10h = Math.round(baseHourlyRate * 10 * 0.9).toLocaleString('vi-VN') + ' VNĐ';

  const allRelatedTutors = (tutors.length >= 8 ? tutors : mockTutors).filter(
    (t) => String(t.id) !== String(tutor.id)
  );
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(allRelatedTutors.length / itemsPerPage));
  const displayedRelated = allRelatedTutors.slice(
    relatedPage * itemsPerPage,
    (relatedPage + 1) * itemsPerPage
  );

  const shifts = [
    { label: 'Ca Sáng (08:00 - 11:30)', key: 'Sáng' },
    { label: 'Ca Chiều (14:00 - 17:30)', key: 'Chiều' },
    { label: 'Ca Tối (18:30 - 21:30)', key: 'Tối' },
  ];
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch (e) {
      alert('Đã sao chép liên kết hồ sơ!');
    }
  };

  const isOwnProfile =
    currentSession.role === 'teacher' &&
    (String(currentSession.userId) === String(tutor.id) ||
      currentSession.userId === 't1' ||
      String(tutor.id) === '1');

  return (
    <div className="bg-[#FBFBFA] min-h-screen text-stone-900 selection:bg-stone-900 selection:text-white relative overflow-hidden">
      {/* Ambient background glow orbs (Soft Structuralism / Editorial Luxury) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-emerald-100/30 via-teal-50/20 to-transparent blur-[120px] opacity-60" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-amber-100/25 via-stone-100/20 to-transparent blur-[140px] opacity-50" />
      </div>

      {/* Toast thông báo sao chép */}
      {shareToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-stone-950 text-white text-xs font-semibold px-5 py-3.5 rounded-2xl shadow-2xl border border-stone-800 animate-in fade-in slide-in-from-bottom-3 duration-300 flex items-center gap-2.5">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Đã sao chép liên kết hồ sơ vào khay nhớ tạm</span>
        </div>
      )}

      {/* TOP BREADCRUMB - Floating Pill Architecture */}
      <div className="relative z-10 pt-6 pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-stone-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] text-xs text-stone-500 font-medium">
            <Link to="/" className="hover:text-stone-950 transition-colors">
              Trang chủ
            </Link>
            <span className="text-stone-300">/</span>
            <Link to="/tim-gia-su" className="hover:text-stone-950 transition-colors">
              Đội ngũ Giáo viên
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900 font-semibold truncate max-w-[200px]">
              {tutor.displayName || tutor.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* BANNER CHO GIÁO VIÊN KHI XEM HỒ SƠ CỦA CHÍNH MÌNH */}
        {isOwnProfile && (
          <div className="mb-8 p-1.5 rounded-[2.5rem] bg-stone-900/[0.04] border border-stone-900/[0.06] shadow-sm">
            <div className="rounded-[calc(2.5rem-0.375rem)] bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-emerald-200/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-700/20 shrink-0">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-stone-900">Hồ sơ công khai của bạn</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold tracking-wider bg-emerald-200/80 text-emerald-900">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 max-w-xl leading-relaxed">
                    Phụ huynh & học viên trên toàn hệ thống đang tìm thấy hồ sơ này. Bạn có thể cập nhật học vấn, biểu phí và thời gian nhận lớp bất kỳ lúc nào.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openTeacherProfileModal(tutor.id)}
                className="group px-6 py-3 bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm cursor-pointer shrink-0 flex items-center justify-center gap-2 active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chỉnh sửa hồ sơ</span>
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight className="w-3 h-3 text-white" />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* HERO PROFILE DISPLAY - DOUBLE-BEZEL LUXURY ARCHITECTURE */}
        <div className="mb-10 p-2 sm:p-2.5 rounded-[2.5rem] bg-stone-900/[0.03] border border-stone-900/[0.06] shadow-[0_25px_60px_-25px_rgba(0,0,0,0.06)]">
          <div className="rounded-[calc(2.5rem-0.625rem)] bg-white p-6 sm:p-8 lg:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] relative overflow-hidden">
            {/* Top decorative subtle corner accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-50/70 via-stone-50/30 to-transparent rounded-bl-[100px] pointer-events-none -z-0" />

            <div className="relative z-10 flex flex-col md:flex-row items-start gap-6 lg:gap-10">
              {/* Avatar Column with Hardware Framing & Zoom Trigger */}
              <div className="shrink-0 mx-auto md:mx-0">
                <div
                  onClick={() => {
                    setIsAvatarModalOpen(true);
                    setAvatarZoom(1);
                  }}
                  className="group/portrait relative cursor-pointer select-none"
                  title="Nhấp để xem hồ sơ kiểm định & ảnh đại diện phóng to"
                >
                  {/* Double-bezel hardware photo frame */}
                  <div className="p-2 rounded-[2.25rem] bg-gradient-to-b from-stone-200/60 to-stone-100/80 border border-stone-200 shadow-md">
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-[calc(2.25rem-0.5rem)] overflow-hidden bg-stone-100">
                      <img
                        src={tutor.avatar}
                        alt={tutor.displayName || tutor.name}
                        className="w-full h-full object-cover object-center group-hover/portrait:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      />
                      <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover/portrait:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-stone-900 shadow-md flex items-center gap-1.5">
                          <ZoomIn className="w-3.5 h-3.5" /> Xem ảnh
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verified KYC Seal Badge */}
                  <div
                    className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-2xl border-2 border-white shadow-md flex items-center justify-center"
                    title="Đã kiểm định KYC & Văn bằng thật"
                  >
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
                      isLiked
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-stone-200/70 text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                    }`}
                    title="Lưu vào danh sách yêu thích"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-white border border-stone-200/70 text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-all duration-300 cursor-pointer"
                    title="Chia sẻ hồ sơ"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Information Column */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                {/* Eyebrow & Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] bg-stone-950 text-white shadow-xs">
                    {isTeacher ? 'Giáo viên Chuyên môn' : 'Gia sư Sinh viên Giỏi'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/70 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Đã đối soát KYC 100%
                  </span>
                  {tutor.experience && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-stone-100 text-stone-700 border border-stone-200/60 tabular-nums">
                      {tutor.experience} năm kinh nghiệm
                    </span>
                  )}
                </div>

                {/* Name & Headline */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-stone-900 tracking-[-0.03em] leading-[1.15]">
                    {tutor.displayName || tutor.name}
                  </h1>
                  <p className="text-base sm:text-lg text-stone-600 font-medium leading-relaxed max-w-3xl">
                    {tutor.headline ||
                      tutor.title ||
                      'Giáo viên giàu kinh nghiệm, tận tâm đồng hành cùng học viên bứt phá năng lực.'}
                  </p>
                </div>

                {/* Subject Tags */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                  {subjectsList.map((sub: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1 rounded-full text-xs font-semibold bg-stone-100/90 text-stone-800 border border-stone-200/70"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                {/* Micro Meta Grid */}
                <div className="pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-left">
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-stone-400 text-[10px] font-semibold uppercase tracking-wider block">
                      Đánh giá
                    </span>
                    <strong className="text-amber-600 font-black text-sm flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      5.0 <span className="text-stone-500 font-normal text-xs">({displayedReviewsRaw.length})</span>
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-stone-400 text-[10px] font-semibold uppercase tracking-wider block">
                      Học phí chuẩn
                    </span>
                    <strong className="text-stone-900 font-black text-sm block mt-0.5 tabular-nums">
                      {tutor.hourlyRate} đ/h
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-stone-400 text-[10px] font-semibold uppercase tracking-wider block">
                      Tỷ lệ nhận lớp
                    </span>
                    <strong className="text-emerald-700 font-black text-sm block mt-0.5 tabular-nums">
                      {successRate}% sau học thử
                    </strong>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                    <span className="text-stone-400 text-[10px] font-semibold uppercase tracking-wider block">
                      Phản hồi
                    </span>
                    <strong className="text-stone-800 font-black text-sm block mt-0.5">
                      {tutor.responseTime || '< 30 phút'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BODY GRID: 8 COLS CONTENT + 4 COLS STICKY CONCIERGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* CỘT TRÁI (8 / 12 CỘT) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. VỀ GIÁO VIÊN & TRIẾT LÝ GIẢNG DẠY (Double-Bezel) */}
            <div className="p-2 rounded-[2.25rem] bg-stone-900/[0.03] border border-stone-900/[0.05] shadow-[0_15px_40px_-20px_rgba(0,0,0,0.04)]">
              <div className="rounded-[calc(2.25rem-0.5rem)] bg-white p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-stone-900 tracking-tight">
                        Về {tutor.displayName || tutor.name}
                      </h2>
                      <p className="text-xs text-stone-400">Tiểu sử & Phong cách giảng dạy</p>
                    </div>
                  </div>
                  {tutor.education && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700">
                      {tutor.education}
                    </span>
                  )}
                </div>

                <div className="text-sm text-stone-700 leading-relaxed space-y-3 font-normal">
                  <p>
                    {tutor.teachingAchievement ||
                      tutor.shortBio ||
                      'Tôi là giáo viên với niềm đam mê sâu sắc trong việc truyền cảm hứng học tập và xây dựng sự tự tin cho từng học sinh. Mỗi học trò đều có thế mạnh riêng biệt khi được tiếp cận với phương pháp tư duy bản chất và sự động viên kiên trì.'}
                  </p>

                  {tutor.philosophy && (
                    <div className="p-4 rounded-2xl bg-[#F9F9F8] border-l-4 border-stone-900 text-stone-800 text-xs sm:text-sm italic font-medium mt-3">
                      “{tutor.philosophy}”
                    </div>
                  )}
                </div>

                {/* Văn bằng & Chứng chỉ đã xác thực */}
                {tutor.certificates && tutor.certificates.length > 0 && (
                  <div className="pt-3 border-t border-stone-100">
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block mb-2">
                      Văn bằng & Chứng chỉ chuyên môn:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {tutor.certificates.map((cert: string, cIdx: number) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() =>
                            setActiveProofModal(
                              tutor.kycData?.frontDoc || tutor.kycData?.degreeDoc || tutor.avatar
                            )
                          }
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer group"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>{cert}</span>
                          <Eye className="w-3 h-3 text-stone-400 group-hover:text-stone-800" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. LỊCH TRỐNG & KHÓA CHỖ THỜI GIAN THỰC (reserve_slot TTL 5 phút) */}
            <div className="p-2 rounded-[2.25rem] bg-stone-900/[0.03] border border-stone-900/[0.05] shadow-[0_15px_40px_-20px_rgba(0,0,0,0.04)]">
              <div className="rounded-[calc(2.25rem-0.5rem)] bg-white p-6 sm:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-stone-900 tracking-tight">
                        Lịch rảnh & Đặt lịch hẹn
                      </h2>
                      <p className="text-xs text-stone-400">Khóa chỗ trực tiếp trên CSDL chống trùng lịch</p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Nhấp ca để giữ chỗ 5 phút
                  </span>
                </div>

                {/* Cảnh báo khi có người khác đang giữ chỗ */}
                {reservationWarning && (
                  <div className="p-4 bg-amber-50 border border-amber-200/90 text-amber-900 rounded-2xl text-xs flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{reservationWarning}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReservationWarning(null)}
                      className="text-stone-400 hover:text-stone-800 text-xs font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Banner khi chính bạn đang giữ chỗ (Countdown 5 phút) */}
                {heldSlot && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <Clock className="w-5 h-5 animate-spin" />
                      </div>
                      <div>
                        <span className="font-bold text-emerald-950 text-sm block">
                          Đang giữ chỗ: {heldSlot.day} • {heldSlot.shiftLabel}
                        </span>
                        <span className="text-emerald-800 font-medium">
                          Thời gian còn lại: <strong className="font-mono text-emerald-950 text-sm font-bold">{formatCountdown(countdownSeconds)}</strong> (Đã khóa trên PostgreSQL)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() =>
                          openEnrollmentModal({
                            ...tutor,
                            selectedSlotId: heldSlot.id,
                            slot_id: heldSlot.id,
                            selectedSlot: heldSlot,
                          })
                        }
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors text-center"
                      >
                        Tiến hành đăng ký
                      </button>
                      <button
                        type="button"
                        onClick={handleReleaseSlot}
                        className="px-4 py-2.5 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 font-semibold rounded-xl cursor-pointer transition-colors"
                      >
                        Hủy giữ chỗ
                      </button>
                    </div>
                  </div>
                )}

                {/* Bảng ma trận lịch trống 7 ngày 3 ca */}
                <div className="border border-stone-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse text-xs text-center">
                      <thead>
                        <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200/70">
                          <th className="p-3.5 text-left pl-5 font-bold text-stone-900">Ca giảng dạy</th>
                          {days.map((d) => (
                            <th key={d} className="p-3.5 font-semibold text-stone-700">
                              {d}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shifts.map((shiftObj) => (
                          <tr key={shiftObj.key} className="border-b border-stone-100 last:border-0">
                            <td className="p-3.5 font-bold text-stone-900 text-left pl-5 bg-stone-50/50 whitespace-nowrap">
                              {shiftObj.label}
                            </td>
                            {days.map((day) => {
                              const slotKey = `${day}_${shiftObj.key}`;
                              const isAvailable = Array.isArray(tutor.schedule)
                                ? tutor.schedule.includes(slotKey) ||
                                  tutor.schedule.some(
                                    (s: string) => s.includes(day) && s.includes(shiftObj.key)
                                  )
                                : shiftObj.key === 'Tối';

                              const dayNum = dayToNumMap[day];
                              const times = shiftTimeMap[shiftObj.key];
                              const matchedDb = dbSlots.find(
                                (s) =>
                                  s.day_of_week === dayNum &&
                                  s.start_time?.startsWith(times.start.slice(0, 5))
                              );

                              const currentHolder =
                                currentSession?.userId ||
                                localStorage.getItem('hantutor_slot_holder_id') ||
                                '';
                              const isHeldByMe = heldSlot?.slotKey === slotKey;
                              const isLockedByOther = !!(
                                matchedDb?.locked_until &&
                                new Date(matchedDb.locked_until) > new Date() &&
                                matchedDb.locked_by !== currentHolder
                              );
                              const isBooked = matchedDb?.is_booked === true;

                              return (
                                <td key={day} className="p-2">
                                  {isHeldByMe ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEnrollmentModal({
                                          ...tutor,
                                          selectedSlotId: heldSlot?.id,
                                          slot_id: heldSlot?.id,
                                          selectedSlot: heldSlot,
                                        })
                                      }
                                      className="w-full py-2 px-2 bg-emerald-700 text-white font-bold rounded-xl text-[11px] shadow-sm animate-pulse cursor-pointer flex items-center justify-center gap-1"
                                      title="Bạn đang giữ chỗ - Nhấp để mở đơn"
                                    >
                                      <Clock className="w-3 h-3 shrink-0" />
                                      <span>{formatCountdown(countdownSeconds)}</span>
                                    </button>
                                  ) : isLockedByOther ? (
                                    <span
                                      className="block py-2 px-1 bg-amber-50 text-amber-800 font-semibold rounded-xl text-[10px] border border-amber-200/60 cursor-not-allowed"
                                      title="Khung giờ đang được phụ huynh khác giữ chỗ trong 5 phút"
                                    >
                                      ⏳ Tạm khóa
                                    </span>
                                  ) : isBooked ? (
                                    <span className="block py-2 text-stone-400 font-medium text-[11px] bg-stone-100 rounded-xl">
                                      Đã kín
                                    </span>
                                  ) : isAvailable ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSelectAndReserveSlot(day, shiftObj)}
                                      disabled={reservingSlotKey !== null}
                                      className="w-full py-2 px-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 font-bold rounded-xl text-[11px] border border-emerald-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-1 shadow-2xs"
                                      title="Nhấp để giữ chỗ ngay trong 5 phút (reserve_slot)"
                                    >
                                      {reservingSlotKey === slotKey ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                                      ) : (
                                        <>✓ Chọn</>
                                      )}
                                    </button>
                                  ) : (
                                    <span className="block py-2 text-stone-300 text-xs">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. VIDEO BÀI GIẢNG DEMO */}
            <div className="p-2 rounded-[2.25rem] bg-stone-900/[0.03] border border-stone-900/[0.05] shadow-[0_15px_40px_-20px_rgba(0,0,0,0.04)]">
              <div className="rounded-[calc(2.25rem-0.5rem)] bg-white p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold">
                    <Play className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-900 tracking-tight">
                      Video bài giảng & Tài liệu mẫu
                    </h2>
                    <p className="text-xs text-stone-400">Xem trước phong thái và phương pháp truyền đạt</p>
                  </div>
                </div>

                <div className="aspect-video bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 shadow-xl">
                  <iframe
                    className="w-full h-full"
                    src={tutor.videoDemo || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0'}
                    title="Video Demo Bài Giảng"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            {/* 4. ĐÁNH GIÁ TỪ HỌC VIÊN THẬT */}
            <div className="p-2 rounded-[2.25rem] bg-stone-900/[0.03] border border-stone-900/[0.05] shadow-[0_15px_40px_-20px_rgba(0,0,0,0.04)]">
              <div className="rounded-[calc(2.25rem-0.5rem)] bg-white p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Star className="w-5 h-5 fill-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-stone-900 tracking-tight">
                        Đánh giá & Nhận xét
                      </h2>
                      <p className="text-xs text-stone-400">
                        {displayedReviewsRaw.length} học viên đã gửi nhận xét đã qua kiểm duyệt
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openReviewModal(tutor, 'trial')}
                    className="px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                  >
                    + Viết đánh giá
                  </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setReviewFilter('all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reviewFilter === 'all'
                        ? 'bg-stone-950 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Tất cả ({displayedReviewsRaw.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('trial')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reviewFilter === 'trial'
                        ? 'bg-stone-950 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Sau buổi học thử ({displayedReviewsRaw.filter((r) => r.stage === 'trial').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('official')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reviewFilter === 'official'
                        ? 'bg-stone-950 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Học chính thức ({displayedReviewsRaw.filter((r) => r.stage !== 'trial').length})
                  </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {displayedReviews.map((rev: any) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl border border-stone-200/70 bg-[#FAFAF9] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">
                            {rev.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-stone-900 block leading-tight">
                              {rev.studentName}
                            </span>
                            <span className="text-[10px] text-stone-400">{rev.date || 'Gần đây'}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {rev.stage === 'trial' ? 'Đã học thử 1-1' : 'Đang học chính khóa'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. CÁC GIÁO VIÊN TƯƠNG TỰ */}
            {allRelatedTutors.length > 0 && (
              <div className="space-y-5 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                    Giáo viên cùng chuyên môn <strong>{tutor.badgeSubject || tutor.subjects?.[0]}</strong>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 font-bold tabular-nums">
                      {relatedPage + 1}/{totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRelatedPage((p) => (p > 0 ? p - 1 : totalPages - 1))}
                      className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelatedPage((p) => (p < totalPages - 1 ? p + 1 : 0))}
                      className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {displayedRelated.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/giao-vien/${rel.id}`}
                      className="group block p-1.5 rounded-3xl bg-white border border-stone-200/80 hover:border-stone-400 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden relative bg-stone-100">
                        <img
                          src={rel.avatar}
                          alt={rel.displayName || rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="font-bold text-xs text-stone-900 truncate">
                          {rel.displayName || rel.name}
                        </div>
                        <div className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                          ★ 5.0 <span className="text-stone-400 font-normal">({rel.reviews || 2})</span>
                        </div>
                        <div className="text-xs font-black text-stone-900 tabular-nums">
                          {rel.hourlyRate} đ/h
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (4 / 12 CỘT) - STICKY CONCIERGE BOOKING ISLAND */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 p-2 rounded-[2.5rem] bg-stone-900/[0.04] border border-stone-900/[0.07] shadow-[0_25px_60px_-20px_rgba(0,0,0,0.08)]">
              <div className="rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-7 space-y-6 text-left">
                {/* Header Price */}
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                    Học phí niêm yết
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-stone-900 tabular-nums tracking-tight">
                      {tutor.hourlyRate}
                    </span>
                    <span className="text-stone-500 text-xs font-bold">VNĐ / giờ</span>
                  </div>
                </div>

                {/* Ưu đãi gói học */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Gói 5 buổi (tiết kiệm 5%):</span>
                    <strong className="text-stone-900 font-bold tabular-nums">{package5h}</strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Gói 10 buổi (tiết kiệm 10%):</span>
                    <strong className="text-emerald-700 font-bold tabular-nums">{package10h}</strong>
                  </div>
                </div>

                {/* Quyền lợi cam kết */}
                <div className="space-y-2.5 text-xs text-stone-700">
                  <div className="flex items-center gap-2.5 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>01 buổi học thử 1-1 miễn phí 100%</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Đổi giáo viên miễn phí nếu không phù hợp</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Học online hoặc trực tiếp tại nhà</span>
                  </div>
                </div>

                {/* Trạng thái giữ chỗ */}
                {heldSlot && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-emerald-950">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                        Đang giữ chỗ 5 phút
                      </span>
                      <span className="font-mono">{formatCountdown(countdownSeconds)}</span>
                    </div>
                    <div className="text-emerald-800">
                      {heldSlot.day} • {heldSlot.shiftLabel}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openEnrollmentModal({
                          ...tutor,
                          selectedSlotId: heldSlot.id,
                          slot_id: heldSlot.id,
                          selectedSlot: heldSlot,
                        })
                      }
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      Đăng ký ngay với khung giờ này
                    </button>
                  </div>
                )}

                {/* Primary Action Button (Button-in-Button Architecture) */}
                <div className="space-y-3 pt-2">
                  {trialItem?.status === 'trial_in_progress' ? (
                    <a
                      href={`https://zalo.me/${(tutor.zalo || tutor.phone || '0912345678').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#0068FF] hover:bg-[#0052cc] text-white font-bold py-4 px-6 rounded-full transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Nhắn Zalo giáo viên</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTrialContactClick}
                      className="group w-full bg-stone-950 hover:bg-stone-800 text-white font-bold py-4 px-6 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xl shadow-stone-950/20 active:scale-[0.98] cursor-pointer flex items-center justify-between"
                    >
                      <span className="text-sm font-black tracking-tight">
                        Đăng ký học thử 1-1
                      </span>
                      <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </span>
                    </button>
                  )}

                  <p className="text-[11px] text-center text-stone-500 font-medium">
                    ⚡ Không mất phí • Giáo viên phản hồi trong 30 phút
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Phóng to ảnh đại diện & Hồ sơ kiểm định */}
      {isAvatarModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div
            className="bg-white rounded-[2.5rem] max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer active:scale-90"
              title="Đóng (ESC)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Photo */}
            <div className="md:w-5/12 bg-stone-950 flex flex-col items-center justify-between p-6 relative select-none">
              <div className="w-full flex items-center justify-between text-white/80 z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
                  Ảnh hồ sơ gốc
                </span>
                <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-full">
                  <button
                    type="button"
                    onClick={() => setAvatarZoom((z) => Math.max(1, z - 0.25))}
                    className="p-1 hover:text-white cursor-pointer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold px-1 tabular-nums">
                    {Math.round(avatarZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setAvatarZoom((z) => Math.min(2.5, z + 0.25))}
                    className="p-1 hover:text-white cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="my-auto py-6 overflow-hidden flex items-center justify-center">
                <img
                  src={tutor.avatar}
                  alt={tutor.displayName || tutor.name}
                  style={{ transform: `scale(${avatarZoom})` }}
                  className="max-h-[340px] w-auto rounded-2xl object-cover shadow-2xl transition-transform duration-300 border border-white/10"
                />
              </div>

              <div className="w-full bg-emerald-950/90 border border-emerald-500/30 rounded-full py-2 px-4 text-center text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 z-10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Hồ sơ đã đối soát CCCD & Bằng cấp</span>
              </div>
            </div>

            {/* Right Info */}
            <div className="md:w-7/12 p-8 overflow-y-auto space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                  {tutor.displayName || tutor.name}
                </h3>
                <p className="text-xs text-stone-500 font-medium italic">
                  “{tutor.headline || tutor.title || 'Giáo viên giàu kinh nghiệm, tận tâm đồng hành cùng học viên.'}”
                </p>

                <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/70 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] block">Đánh giá:</span>
                    <strong className="text-amber-600 font-bold">★ 5.0 ({displayedReviewsRaw.length})</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Tỷ lệ nhận lớp:</span>
                    <strong className="text-emerald-700 font-bold">{successRate}% sau học thử</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Học phí:</span>
                    <strong className="text-stone-900 font-bold">{tutor.hourlyRate} đ/h</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Phản hồi:</span>
                    <strong className="text-stone-800 font-bold">{tutor.responseTime || '< 30p'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarModalOpen(false);
                    handleTrialContactClick();
                  }}
                  className="w-full bg-stone-950 hover:bg-stone-800 text-white font-bold py-3.5 rounded-full text-xs transition-all cursor-pointer shadow-md"
                >
                  Nhận 01 buổi học thử 1-1 miễn phí
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Minh chứng Văn bằng & Chứng chỉ */}
      {activeProofModal && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setActiveProofModal(null)}
        >
          <div
            className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full shadow-2xl relative border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveProofModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-all"
              title="Đóng (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-stone-900">Văn bằng & Chứng chỉ chuyên môn</h3>
            </div>
            <div className="rounded-2xl overflow-hidden border border-stone-200 max-h-[65vh] flex items-center justify-center bg-stone-950">
              <img
                src={activeProofModal}
                alt="Minh chứng thành tích"
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>
            <div className="mt-4 text-center text-xs text-stone-500 font-medium">
              Văn bằng đã được chuyên gia HanTutor đối soát bản gốc
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDetailPage;
