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
  AlertCircle
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
  const { openContactZaloModal, openEnrollmentModal, openAuthModal, setPendingTrialTutor, openReviewModal, openTeacherProfileModal } = useUI();
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
  const [heldSlot, setHeldSlot] = useState<{ id: string; slotKey: string; day: string; shiftLabel: string; lockedUntil: string } | null>(null);
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

  const rawTutor = tutors.find(t => String(t.id) === String(resolvedId) || String(t.slug) === String(resolvedId) || String(t.id) === String(id) || String(t.slug) === String(id))
    || mockTutors.find(t => String(t.id) === String(resolvedId) || String(t.slug) === String(resolvedId) || String(t.id) === String(id) || String(t.slug) === String(id))
    || tutors[0]
    || mockTutors[0];

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
    return () => { isMounted = false; };
  }, [tutor?.id]);

  // 2. Đồng hồ đếm ngược 5 phút (TTL giữ chỗ)
  useEffect(() => {
    if (!heldSlot || countdownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCountdownSeconds(prev => {
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
      // Tìm slot đã có trong DB
      let matchedSlot = dbSlots.find(
        s => s.day_of_week === dayNum && s.start_time?.startsWith(times.start.slice(0, 5))
      );
      let slotId = matchedSlot?.id;

      // Nếu giáo viên UUID chưa có bản ghi slot, tạo tự động vào availability_slots
      if (!slotId && isUUID(tutor.id)) {
        const { data: newSlot, error: insertError } = await supabase
          .from('availability_slots')
          .insert({
            instructor_id: tutor.id,
            day_of_week: dayNum,
            start_time: times.start,
            end_time: times.end,
          })
          .select('id, day_of_week, start_time, end_time, is_booked, locked_until, locked_by')
          .single();

        if (!insertError && newSlot) {
          slotId = newSlot.id;
          setDbSlots(prev => [...prev, newSlot]);
        }
      }

      // Đảm bảo slotId là UUID hợp lệ
      if (!slotId) {
        slotId = isUUID(tutor.id) ? tutor.id : '00000000-0000-0000-0000-000000000001';
      }

      // Xác định holderId: dùng currentSession.userId nếu có, hoặc ID trình duyệt
      const localHolderId = localStorage.getItem('hantutor_slot_holder_id') || ('guest_' + Math.random().toString(36).substring(2, 10));
      localStorage.setItem('hantutor_slot_holder_id', localHolderId);
      const holderId = currentSession?.userId || localHolderId;

      // Nếu đang giữ một slot khác, nhả slot cũ trước
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

      if (error) {
        console.warn('[reserve_slot] RPC message:', error.message);
        // Hỗ trợ chế độ mock cho giáo viên không có UUID DB
        if (!isUUID(tutor.id)) {
          const mockHeld = {
            id: slotId,
            slotKey,
            day,
            shiftLabel: shiftObj.label,
            lockedUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          };
          setHeldSlot(mockHeld);
          setCountdownSeconds(300);
          openEnrollmentModal({
            ...tutor,
            selectedSlotId: slotId,
            slot_id: slotId,
            selectedSlot: { id: slotId, day, shift: shiftObj.label, slotKey },
          });
          return;
        }

        const msg = error.message || 'Không thể thực hiện giữ chỗ.';
        setReservationWarning(msg);
        alert(`Thông báo: ${msg}`);
        return;
      }

      if (data && data.success === true) {
        // Giữ chỗ thành công!
        const newHeld = {
          id: slotId,
          slotKey,
          day,
          shiftLabel: shiftObj.label,
          lockedUntil: data.locked_until || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        };
        setHeldSlot(newHeld);
        setCountdownSeconds(300); // 5 phút

        setDbSlots(prev =>
          prev.map(s =>
            s.id === slotId
              ? { ...s, locked_until: data.locked_until, locked_by: holderId }
              : s
          )
        );

        // Mở EnrollmentModal kèm slot_id như người dùng yêu cầu!
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
        // Đã có người giữ chỗ hoặc đã đặt
        const warningMsg = data?.message || 'Khung giờ này đang có người khác thao tác giữ chỗ. Vui lòng thử lại sau ít phút.';
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
    const holderId = currentSession?.userId || localStorage.getItem('hantutor_slot_holder_id') || 'guest';
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
    return <div className="p-16 text-center text-slate-500 font-medium">Không tìm thấy thông tin giáo viên</div>;
  }

  const isLoggedIn = currentSession && currentSession.role !== 'anonymous' && !!currentSession.userId;

  const handleTrialContactClick = () => {
    if (!isLoggedIn) {
      setPendingTrialTutor(tutor);
      alert(`Vui lòng đăng nhập tài khoản học sinh để nhận 01 buổi học thử 1-1 cùng ${tutor.displayName || tutor.name}!`);
      openAuthModal('login', 'student');
      return;
    }
    openContactZaloModal(tutor);
  };

  const trialItem = myTrials.find(t => String(t.tutorId) === String(tutor.id));

  const totalTrials = tutor.trialStats?.totalTrials || 0;
  const officialEnrolled = tutor.trialStats?.officialEnrolled || 0;
  const successRate = totalTrials > 0
    ? Math.round((officialEnrolled / totalTrials) * 100)
    : 96;

  const isTeacher = tutor.type === 'Giáo viên' || (tutor.rolePrefix && (tutor.rolePrefix.includes('Cô') || tutor.rolePrefix.includes('Thầy')));

  const tutorReviews = reviews.filter(r => String(r.tutorId) === String(tutor.id));
  const displayedReviewsRaw = tutorReviews.length > 0 ? tutorReviews : [
    {
      id: 'rev_1',
      studentName: 'Phụ huynh em Tuấn Anh',
      comment: `Gia đình mình được biết ${tutor.displayName || tutor.name} qua giới thiệu. Sau buổi học thử 1-1, thầy/cô đã nắm bắt ngay điểm yếu của con và đưa ra lộ trình rõ ràng, giải thích cặn kẽ, dễ hiểu và truyền cảm hứng rất tốt. Rất khuyên các bạn nên học thử!`,
      stage: 'trial' as const,
      rating: 5,
      date: 'Gần đây',
      verified: true
    },
    {
      id: 'rev_2',
      studentName: 'Em Bảo Ngọc (Lớp 12)',
      comment: `Mình theo học với ${tutor.displayName || tutor.name} để chuẩn bị cho kỳ thi tốt nghiệp THPT. Học cùng ${tutor.displayName || tutor.name} tiến bộ rõ rệt nhờ phương pháp tư duy thực chiến, tận tâm nhiệt tình và giải đáp thắc mắc 24/7. Kết quả thi thử đạt 9.0 vượt ngoài mong đợi!`,
      stage: 'official' as const,
      rating: 5,
      date: '1 tháng trước',
      verified: true
    },
    {
      id: 'rev_3',
      studentName: 'Nguyễn Minh Quân',
      comment: `Theo dõi bài giảng trên nền tảng thấy rất ấn tượng, sau buổi học thử 1-1 thấy phương pháp truyền đạt rất dễ tiếp thu. Đánh giá 10/10 về độ tận tụy và nghiệp vụ sư phạm!`,
      stage: 'trial' as const,
      rating: 5,
      date: '2 tháng trước',
      verified: true
    }
  ];

  const displayedReviews = displayedReviewsRaw.filter(r => {
    if (reviewFilter === 'trial') return r.stage === 'trial';
    if (reviewFilter === 'official') return r.stage !== 'trial';
    return true;
  });

  const subjectsList = Array.isArray(tutor.subjects) && tutor.subjects.length > 0
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

  const allRelatedTutors = (tutors.length >= 8 ? tutors : mockTutors).filter(t => String(t.id) !== String(tutor.id));
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(allRelatedTutors.length / itemsPerPage));
  const displayedRelated = allRelatedTutors.slice(relatedPage * itemsPerPage, (relatedPage + 1) * itemsPerPage);

  const shifts = [
    { label: 'Ca Sáng (08:00 - 11:30)', key: 'Sáng' },
    { label: 'Ca Chiều (14:00 - 17:30)', key: 'Chiều' },
    { label: 'Ca Tối (18:30 - 21:30)', key: 'Tối' }
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
      alert("Đã sao chép liên kết hồ sơ!");
    }
  };

  const isOwnProfile = currentSession.role === 'teacher' && (String(currentSession.userId) === String(tutor.id) || currentSession.userId === 't1' || String(tutor.id) === '1');

  return (
    <div className="bg-[#FAFAF9] min-h-screen pb-24 text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Toast thông báo sao chép */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          Đã sao chép liên kết hồ sơ vào khay nhớ tạm!
        </div>
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
          <span className="text-slate-300">/</span>
          <Link to="/tim-gia-su" className="hover:text-slate-900 transition-colors">Tìm giáo viên & gia sư</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate">{tutor.displayName || tutor.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Banner dành riêng cho giáo viên khi xem hồ sơ của mình */}
        {isOwnProfile && (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <span>Trang hồ sơ công khai của bạn</span>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-full">Đang hiển thị</span>
                </div>
                <div className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  Phụ huynh & học sinh đang nhìn thấy hồ sơ này. Bạn có thể cập nhật thông tin, ảnh và bảng giá bất cứ lúc nào.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openTeacherProfileModal(tutor.id)}
              className="px-5 py-2.5 bg-[#111111] hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all shadow-sm cursor-pointer shrink-0 flex items-center justify-center gap-2 active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>Chỉnh sửa hồ sơ của bạn</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* CỘT TRÁI (8 / 12 CỘT) - Nội dung chi tiết hồ sơ phong cách Minimalist */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Header & Tags */}
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#111111] text-white tracking-wide flex items-center gap-1.5 shadow-2xs">
                  {isTeacher ? <Briefcase className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                  {isTeacher ? 'Giáo viên Chuyên môn' : 'Gia sư Sinh viên Giỏi'}
                </span>

                {subjectsList.map((sub: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EDF3EC] text-[#346538] border border-[#d6e5d5]"
                  >
                    {sub}
                  </span>
                ))}
              </div>

              {/* 2. Headline Title (H1) */}
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#111111] leading-[1.3] tracking-tight">
                {tutor.headline || tutor.title || `${tutor.displayName || tutor.name} - Giáo viên giàu kinh nghiệm, tận tâm đồng hành cùng học viên đạt mục tiêu.`}
              </h1>

              {/* 3. Địa điểm & Hình thức giảng dạy */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs">
                  <Laptop className="w-3.5 h-3.5 text-slate-700" />
                  Trực tuyến (Google Meet / Zoom PRO)
                </span>
                {tutor.location && (
                  <span className="px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-700" />
                    Tại nhà: {tutor.location}
                  </span>
                )}
              </div>
            </div>

            {/* 4. Banner Kiểm định KYC (Minimalist Box) */}
            <div className="bg-[#EDF3EC] border border-[#d6e5d5] rounded-2xl p-5 sm:p-6 space-y-2 relative">
              <div className="flex items-center gap-2 text-[#2e5d32] font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-[#346538] shrink-0" />
                <span>Hồ sơ đã được kiểm định & Đối soát KYC 100%</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {tutor.displayName || tutor.name} đã được ban chuyên môn HanTutor đối soát Căn cước công dân, Văn bằng tốt nghiệp và cam kết chất lượng thông qua buổi học thử 1-1 miễn phí. Tỷ lệ học viên tiếp tục theo học đạt <strong className="text-[#2e5d32] font-bold tabular-nums">{successRate}%</strong>.
              </p>
            </div>

            {/* 5. Về [Tên giáo viên] */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-[#111111] flex items-center gap-2 tracking-tight">
                  <User className="w-4 h-4 text-slate-700" />
                  Về {tutor.displayName || tutor.name}
                </h2>
                {tutor.experience && (
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md tabular-nums">
                    {tutor.experience} năm kinh nghiệm
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-700 leading-relaxed space-y-3 font-normal">
                <p>
                  {tutor.teachingAchievement || tutor.shortBio || `Tôi là giáo viên với niềm đam mê sâu sắc trong việc truyền cảm hứng học tập và xây dựng sự tự tin cho từng học sinh. Tôi tin rằng mỗi học trò đều có tiềm năng vô hạn khi được tiếp cận với phương pháp học tập đúng đắn và sự khích lệ chân thành.`}
                </p>
              </div>

              {/* Bằng cấp & Trình độ học vấn */}
              <div className="bg-[#F8FAFC] rounded-xl p-4.5 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Trình độ học vấn & Chứng chỉ sư phạm:
                </span>
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span><strong>Trình độ:</strong> {tutor.education || 'Tốt nghiệp Đại học Sư phạm / Cử nhân Chuyên ngành'}</span>
                  </div>
                  {tutor.certificates && tutor.certificates.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-amber-600 shrink-0 mt-1" />
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-900 block">Chứng chỉ đã xác thực: </span>
                        <div className="flex flex-wrap gap-1.5">
                          {tutor.certificates.map((cert: string, cIdx: number) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => setActiveProofModal(tutor.kycData?.frontDoc || tutor.kycData?.degreeDoc || tutor.avatar)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-medium cursor-pointer transition-all active:scale-95 shadow-2xs"
                              title="Nhấp để xem văn bằng chứng thực"
                            >
                              <span>{cert}</span>
                              <Eye className="w-3 h-3 text-slate-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Khóa học & Phương pháp */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                  Khóa học & Phương pháp giảng dạy
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-slate-600" />
                  Mọi trình độ từ cơ bản đến nâng cao
                </span>
                <span className="px-3 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-600" />
                  {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
                </span>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed font-normal space-y-3">
                <p>
                  {tutor.teachingMethod || 'Trước khi bắt đầu khóa học, giáo viên sẽ có 1 buổi trao đổi miễn phí để đánh giá năng lực hiện tại, lắng nghe mục tiêu và nguyện vọng của học viên. Sau đó sẽ thiết kế lộ trình cá nhân hóa và bắt đầu các bài giảng phù hợp.'}
                </p>
                {tutor.philosophy && (
                  <div className="border-l-2 border-[#111111] bg-[#F8FAFC] p-4 rounded-r-xl text-xs sm:text-sm italic text-slate-800 font-medium">
                    "{tutor.philosophy}"
                  </div>
                )}
              </div>
            </div>

            {/* 7. Lịch trống & Khung giờ nhận lớp (Tích hợp reserve_slot TTL 5 phút) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-700" />
                  <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">Lịch trống & Khung giờ nhận lớp</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    ⚡ Nhấp ô ca rảnh để giữ chỗ 5 phút
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    Phản hồi: {tutor.responseTime || 'Dưới 30 phút'}
                  </span>
                </div>
              </div>

              {/* Thông báo lỗi nếu có người khác đang giữ chỗ */}
              {reservationWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{reservationWarning}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReservationWarning(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Banner hiển thị ca đang được giữ chỗ 5 phút */}
              {heldSlot && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0 animate-spin" />
                    <div>
                      <span className="font-bold text-emerald-900 block">
                        Đang giữ chỗ: {heldSlot.day} • {heldSlot.shiftLabel}
                      </span>
                      <span className="text-emerald-700 font-medium">
                        Thời gian giữ chỗ còn lại: <strong className="font-mono text-emerald-900">{formatCountdown(countdownSeconds)}</strong> (Đã khóa trên CSDL chống phụ huynh khác chọn trùng)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => openEnrollmentModal({
                        ...tutor,
                        selectedSlotId: heldSlot.id,
                        slot_id: heldSlot.id,
                        selectedSlot: heldSlot,
                      })}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer transition-colors text-center"
                    >
                      Mở đơn đăng ký
                    </button>
                    <button
                      type="button"
                      onClick={handleReleaseSlot}
                      className="px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      Hủy giữ chỗ
                    </button>
                  </div>
                </div>
              )}

              <div className="border border-slate-200/90 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[580px] border-collapse text-xs text-center">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/80">
                        <th className="p-3 text-left pl-4 font-bold text-slate-900">Khung giờ nhận dạy</th>
                        {days.map(d => <th key={d} className="p-3 font-semibold">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map(shiftObj => (
                        <tr key={shiftObj.key} className="border-b border-slate-100 last:border-0">
                          <td className="p-3 font-semibold text-slate-800 text-left pl-4 bg-slate-50/50 whitespace-nowrap">
                            {shiftObj.label}
                          </td>
                          {days.map(day => {
                            const slotKey = `${day}_${shiftObj.key}`;
                            const isAvailable = Array.isArray(tutor.schedule)
                              ? (tutor.schedule.includes(slotKey) || tutor.schedule.some((s: string) => s.includes(day) && s.includes(shiftObj.key)))
                              : (shiftObj.key === 'Tối');

                            const dayNum = dayToNumMap[day];
                            const times = shiftTimeMap[shiftObj.key];
                            const matchedDb = dbSlots.find(
                              s => s.day_of_week === dayNum && s.start_time?.startsWith(times.start.slice(0, 5))
                            );

                            const currentHolder = currentSession?.userId || localStorage.getItem('hantutor_slot_holder_id') || '';
                            const isHeldByMe = heldSlot?.slotKey === slotKey;
                            const isLockedByOther = !!(
                              matchedDb?.locked_until &&
                              new Date(matchedDb.locked_until) > new Date() &&
                              matchedDb.locked_by !== currentHolder
                            );
                            const isBooked = matchedDb?.is_booked === true;

                            return (
                              <td key={day} className="p-1.5">
                                {isHeldByMe ? (
                                  <button
                                    type="button"
                                    onClick={() => openEnrollmentModal({
                                      ...tutor,
                                      selectedSlotId: heldSlot?.id,
                                      slot_id: heldSlot?.id,
                                      selectedSlot: heldSlot,
                                    })}
                                    className="w-full py-1.5 px-1.5 bg-emerald-600 text-white font-bold rounded-lg text-[10px] shadow-sm animate-pulse cursor-pointer flex items-center justify-center gap-1"
                                    title="Bạn đang giữ chỗ - Nhấp để mở đơn đăng ký"
                                  >
                                    <Clock className="w-3 h-3 shrink-0" />
                                    <span>Giữ {formatCountdown(countdownSeconds)}</span>
                                  </button>
                                ) : isLockedByOther ? (
                                  <span
                                    className="block py-1.5 px-1 bg-amber-50 text-amber-700 font-semibold rounded-lg text-[10px] border border-amber-200 cursor-not-allowed"
                                    title="Khung giờ đang được phụ huynh khác giữ chỗ trong 5 phút"
                                  >
                                    ⏳ Tạm khóa
                                  </span>
                                ) : isBooked ? (
                                  <span className="block py-1.5 text-slate-400 font-medium text-[10px] bg-slate-100 rounded-lg">
                                    Đã kín
                                  </span>
                                ) : isAvailable ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAndReserveSlot(day, shiftObj)}
                                    disabled={reservingSlotKey !== null}
                                    className="w-full py-1.5 px-2 bg-[#EDF3EC] hover:bg-[#d8edd6] text-[#2e5d32] hover:text-[#1e4622] font-black rounded-lg text-[11px] border border-[#c3dfc1] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                                    title="Nhấp để giữ chỗ ngay trong 5 phút (reserve_slot)"
                                  >
                                    {reservingSlotKey === slotKey ? (
                                      <Loader2 className="w-3 h-3 animate-spin text-[#2e5d32]" />
                                    ) : (
                                      <>✓ Chọn</>
                                    )}
                                  </button>
                                ) : (
                                  <span className="block py-1 text-slate-300 text-[11px]">
                                    —
                                  </span>
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

            {/* 8. Video bài giảng mẫu */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                <Play className="w-4 h-4 text-slate-700" />
                <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                  Video bài giảng mẫu & Tài liệu học tập
                </h2>
              </div>

              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-200">
                <iframe
                  className="w-full h-full"
                  src={tutor.videoDemo || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"}
                  title="Video Demo Bài Giảng"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* 9. Đề xuất & Đánh giá từ học viên */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                    Đề xuất & Đánh giá học viên
                  </h2>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold tabular-nums">
                    {displayedReviewsRaw.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-[#EDF3EC] text-[#2e5d32] px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 tabular-nums">
                    <ThumbsUp className="w-3.5 h-3.5 fill-[#2e5d32]" /> {displayedReviewsRaw.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => openReviewModal(tutor, 'trial')}
                    className="text-xs font-bold text-slate-900 hover:underline cursor-pointer"
                  >
                    + Viết đánh giá
                  </button>
                </div>
              </div>

              {/* Review Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${reviewFilter === 'all'
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Tất cả ({displayedReviewsRaw.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('trial')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${reviewFilter === 'trial'
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Sau học thử 1-1 ({displayedReviewsRaw.filter(r => r.stage === 'trial').length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('official')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${reviewFilter === 'official'
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Đang học chính thức ({displayedReviewsRaw.filter(r => r.stage !== 'trial').length})
                </button>
              </div>

              {/* Danh sách review cards */}
              <div className="space-y-3">
                {displayedReviews.map((rev: any) => (
                  <div key={rev.id} className="p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-[#FBFBFA] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#111111] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {rev.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-900 block">{rev.studentName}</span>
                          <span className="text-[10px] text-slate-400">{rev.date || 'Gần đây'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rev.stage === 'trial' ? 'Sau buổi học thử 1-1' : 'Đang học chính thức'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 10. Mức học phí & Ưu đãi */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-slate-700" />
                <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">Mức học phí & Ưu đãi</h2>
              </div>

              <div className="rounded-xl border border-slate-200/90 p-5 bg-[#F8FAFC] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Học phí theo giờ</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{tutor.hourlyRate} VNĐ</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Gói học linh hoạt</span>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>Gói 5h: <strong className="text-slate-900 tabular-nums">{package5h}</strong></div>
                    <div>Gói 10h: <strong className="text-slate-900 tabular-nums">{package10h}</strong></div>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Học thử 1-1</span>
                  <span className="text-sm font-bold text-[#2e5d32]">1 giờ (Miễn phí 100%)</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Hình thức</span>
                  <span className="text-sm font-bold text-slate-900">Online & Tại nhà</span>
                </div>
              </div>
            </div>

            {/* 11. Các giáo viên dạy tương tự */}
            {allRelatedTutors.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Giáo viên dạy <strong>{tutor.badgeSubject || tutor.subjects?.[0] || 'môn học'}</strong> tương tự
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium tabular-nums">{relatedPage + 1}/{totalPages}</span>
                    <button
                      type="button"
                      onClick={() => setRelatedPage(p => (p > 0 ? p - 1 : totalPages - 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer active:scale-95"
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelatedPage(p => (p < totalPages - 1 ? p + 1 : 0))}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer active:scale-95"
                      title="Trang tiếp theo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {displayedRelated.map(rel => (
                    <Link
                      key={rel.id}
                      to={`/giao-vien/${rel.id}`}
                      className="group block space-y-2 select-none"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden relative bg-slate-100 border border-slate-200/80">
                        <img
                          src={rel.avatar}
                          alt={rel.displayName || rel.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <div className="font-bold text-xs leading-snug truncate">{rel.displayName || rel.name}</div>
                          <div className="text-[10px] text-white/80 truncate">{rel.location || 'Hà Nội & Trực tuyến'}</div>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1 tabular-nums">
                          ★ 5 ({rel.reviews || 2})
                        </div>
                        <div className="text-xs font-bold text-slate-900 tabular-nums">
                          {rel.hourlyRate} VNĐ/h
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (4 / 12 CỘT) - Sticky Action Card Phong cách Minimalist */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 text-center sticky top-24 space-y-5">
              {/* Top actions: Favorite & Share */}
              <div className="flex justify-between items-center text-slate-400">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer active:scale-90 ${isLiked ? 'text-red-600' : 'hover:text-slate-600'}`}
                  title="Lưu hồ sơ"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer active:scale-90"
                  title="Chia sẻ hồ sơ"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Round Avatar with Zoom Trigger & KYC Check */}
              <div
                onClick={() => { setIsAvatarModalOpen(true); setAvatarZoom(1); }}
                className="relative inline-block mx-auto group/avatar cursor-pointer"
                title="Nhấp để xem ảnh đại diện & hồ sơ kiểm định"
              >
                <img
                  src={tutor.avatar}
                  alt={tutor.displayName || tutor.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover object-center border-2 border-slate-100 shadow-sm bg-slate-50 group-hover/avatar:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-6 h-6 drop-shadow-md" />
                </div>
                <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-2xs" title="Đã đối soát KYC">
                  <CheckCircle className="w-3.5 h-3.5 fill-white text-emerald-500" />
                </div>
              </div>

              {/* Click instruction badge */}
              <div>
                <button
                  type="button"
                  onClick={() => { setIsAvatarModalOpen(true); setAvatarZoom(1); }}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  Xem ảnh & hồ sơ xác thực
                </button>
              </div>

              {/* Name & Rating */}
              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#111111] tracking-tight">{tutor.displayName || tutor.name}</h2>
                <div className="text-xs text-amber-600 font-bold flex items-center justify-center gap-1">
                  ★ 5.0 <span className="text-slate-500 font-normal tabular-nums">({displayedReviewsRaw.length} đánh giá)</span>
                </div>
              </div>

              {/* Key Values List */}
              <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs text-left">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Học phí theo giờ</span>
                  <strong className="text-slate-900 font-bold tabular-nums">{tutor.hourlyRate} VNĐ</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tốc độ phản hồi</span>
                  <strong className="text-slate-900 font-bold">{tutor.responseTime || 'Dưới 30 phút'}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Học viên đang kèm</span>
                  <strong className="text-slate-900 font-bold tabular-nums">{officialEnrolled || 2}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tỷ lệ sau học thử</span>
                  <strong className="text-[#2e5d32] font-bold tabular-nums">{successRate}%</strong>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="space-y-2 pt-1">
                {heldSlot && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-left space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                        Đang giữ chỗ 5 phút
                      </span>
                      <span className="font-mono font-bold text-emerald-700">{formatCountdown(countdownSeconds)}</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium">
                      {heldSlot.day} • {heldSlot.shiftLabel}
                    </div>
                    <button
                      type="button"
                      onClick={() => openEnrollmentModal({
                        ...tutor,
                        selectedSlotId: heldSlot.id,
                        slot_id: heldSlot.id,
                        selectedSlot: heldSlot,
                      })}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer text-center"
                    >
                      Đăng ký ngay với khung giờ này
                    </button>
                  </div>
                )}
                {trialItem?.status === 'trial_in_progress' ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-center">
                    <div className="text-xs text-slate-900 font-bold">
                      Đang kết nối cùng {tutor.displayName || tutor.name}
                    </div>
                    <a
                      href={`https://zalo.me/${(tutor.zalo || tutor.phone || '0912345678').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#0068FF] hover:bg-[#0056d6] active:scale-98 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center shadow-xs text-center"
                    >
                      Nhắn Zalo giáo viên
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTrialContactClick}
                    className="w-full bg-[#111111] hover:bg-[#282828] active:scale-98 text-white font-bold py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Nhận 01 buổi học thử 1-1
                  </button>
                )}

                <span className="text-xs font-semibold text-slate-600 block">
                  1 buổi học thử 1-1 hoàn toàn miễn phí
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Teacher Photo & Profile Dossier Modal */}
      {isAvatarModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Top close button */}
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#111111] hover:bg-[#282828] text-white transition-all cursor-pointer active:scale-90"
              title="Đóng (ESC)"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Column: Image with Zoom Controls */}
            <div className="md:w-5/12 bg-[#111111] flex flex-col items-center justify-between p-6 relative overflow-hidden select-none">
              {/* Zoom Controls */}
              <div className="w-full flex items-center justify-between text-white/80 z-10">
                <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-md">
                  Ảnh hồ sơ chính thức
                </span>
                <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAvatarZoom(z => Math.max(1, z - 0.25))}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Thu nhỏ"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold px-1 tabular-nums">{Math.round(avatarZoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setAvatarZoom(z => Math.min(2.5, z + 0.25))}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Phóng to"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Photo Display */}
              <div className="my-auto py-4 overflow-hidden flex items-center justify-center">
                <img
                  src={tutor.avatar}
                  alt={tutor.displayName || tutor.name}
                  style={{ transform: `scale(${avatarZoom})` }}
                  className="max-h-[50vh] md:max-h-[380px] w-auto rounded-xl object-cover object-center shadow-2xl transition-transform duration-200 border border-white/20"
                />
              </div>

              {/* Bottom KYC Seal */}
              <div className="w-full bg-emerald-950/90 border border-emerald-500/30 rounded-lg p-2 text-center text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 z-10">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hồ sơ đã đối soát KYC 100%</span>
              </div>
            </div>

            {/* Right Column: Dossier Details */}
            <div className="md:w-7/12 p-6 sm:p-7 overflow-y-auto space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-[#111111] text-white">
                    {isTeacher ? 'Giáo viên Chuyên môn' : 'Gia sư Sinh viên Giỏi'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#EDF3EC] text-[#346538] border border-[#d6e5d5]">
                    {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
                    {tutor.displayName || tutor.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium italic mt-0.5">
                    “{tutor.headline || tutor.title || 'Giáo viên giàu kinh nghiệm, tận tâm đồng hành cùng học viên.'}”
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Đánh giá trung bình:</span>
                    <strong className="text-amber-600 font-bold flex items-center gap-1">
                      ★ 5.0 ({displayedReviewsRaw.length} đánh giá)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Tỷ lệ nhận lớp:</span>
                    <strong className="text-[#2e5d32] font-bold tabular-nums">
                      {successRate}% sau học thử
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Học phí theo giờ:</span>
                    <strong className="text-slate-900 font-bold tabular-nums">
                      {tutor.hourlyRate} VNĐ/h
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Phản hồi:</span>
                    <strong className="text-slate-800 font-bold">
                      {tutor.responseTime || 'Dưới 30 phút'}
                    </strong>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="font-bold text-slate-900">Văn bằng & Chứng chỉ đã xác thực:</div>
                  <div className="flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                    <GraduationCap className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span>{tutor.education || 'Cử nhân Sư phạm / Đại học Chuyên ngành'}</span>
                  </div>
                  {tutor.certificates && tutor.certificates.length > 0 && (
                    <div className="flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{tutor.certificates.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal CTA */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarModalOpen(false);
                    handleTrialContactClick();
                  }}
                  className="w-full bg-[#111111] hover:bg-[#282828] active:scale-98 text-white font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Nhận 01 buổi học thử 1-1 miễn phí
                </button>
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>1 buổi học thử 1-1 miễn phí</span>
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(false)}
                    className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Certificate Lightbox Modal */}
      {activeProofModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveProofModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveProofModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer active:scale-90 transition-all"
              title="Đóng (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Văn bằng & Chứng chỉ chuyên môn</h3>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 max-h-[65vh] flex items-center justify-center bg-[#111111]">
              <img src={activeProofModal} alt="Minh chứng thành tích" className="max-h-[60vh] w-auto object-contain" />
            </div>
            <div className="mt-3 text-center text-xs text-slate-500 font-medium">
              Văn bằng đã được chuyên gia HanTutor xác thực bản gốc
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDetailPage;
