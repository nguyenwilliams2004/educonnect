import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, MapPin, ChevronDown, Briefcase, GraduationCap, Star, ArrowRight, Award, BookOpen, ShieldCheck } from 'lucide-react';
import { HeroLeftIllustration, HeroRightIllustration } from '../components/HeroIllustrations';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';

/* High-End Visual Design & Design-Taste-Frontend Architecture · Clean Luxury Atelier */

export function Hero() {
  const [searchText, setSearchText] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('');
  const navigate = useNavigate();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('q', searchText.trim());
    if (selectedLoc) params.set('location', selectedLoc);
    navigate(`/tim-gia-su?${params.toString()}`);
  };

  return (
    <div className="relative bg-[#FAF9F6] pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-slate-200/60">
      {/* Ambient background glow orbs for soft structural depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-blue-100/35 via-slate-100/20 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-gradient-to-br from-emerald-100/20 to-transparent blur-3xl opacity-40" />
      </div>

      <div className="hidden lg:block absolute left-8 xl:left-24 top-20 z-10 opacity-90 transition-transform duration-700 hover:scale-102">
        <HeroLeftIllustration />
      </div>
      <div className="hidden lg:block absolute right-8 xl:right-24 top-20 z-10 opacity-90 transition-transform duration-700 hover:scale-102">
        <HeroRightIllustration />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Eyebrow Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-blue-700 font-bold text-xs md:text-sm mb-6 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          100% Giáo viên/Gia sư được kiểm duyệt KYC & Năng lực giảng dạy
        </div>

        {/* Master Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12] mb-4">
          Tìm kiếm <span className="text-blue-600">Giáo viên & Gia sư</span> <br className="hidden sm:inline" /> hoàn hảo cho bạn
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 mb-8 md:mb-10 px-2 leading-relaxed font-normal">
          Nền tảng kết nối trực tiếp học sinh và giáo viên tại Hà Nội: Trao đổi Zalo 1-1, học thử miễn phí và đăng ký học chính thức minh bạch.
        </p>

        {/* Double-Bezel Glass Search Dock */}
        <div className="max-w-3xl mx-auto p-1.5 sm:p-2 rounded-3xl bg-slate-900/[0.03] border border-slate-900/[0.06] shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07)] relative z-10 text-left">
          <div className="rounded-[calc(1.5rem-0.25rem)] bg-white p-3 sm:p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
            <form onSubmit={handleHeroSearch} className="flex flex-col md:flex-row gap-2.5">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="Môn học, lớp, kỹ năng (Toán 10, Tiếng Anh, Piano, Bơi lội...)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400 text-sm outline-none font-medium"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  value={selectedLoc}
                  onChange={e => setSelectedLoc(e.target.value)}
                  className="w-full pl-10 pr-9 py-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-blue-500 transition-all text-slate-900 appearance-none text-sm outline-none cursor-pointer font-medium"
                >
                  <option value="">Tất cả quận Hà Nội / Online</option>
                  <option value="Cầu Giấy">Quận Cầu Giấy</option>
                  <option value="Đống Đa">Quận Đống Đa</option>
                  <option value="Hai Bà Trưng">Quận Hai Bà Trưng</option>
                  <option value="Thanh Xuân">Quận Thanh Xuân</option>
                  <option value="Ba Đình">Quận Ba Đình</option>
                  <option value="Hoàn Kiếm">Quận Hoàn Kiếm</option>
                  <option value="Nam Từ Liêm">Quận Nam Từ Liêm</option>
                  <option value="Bắc Từ Liêm">Quận Bắc Từ Liêm</option>
                  <option value="Hà Đông">Quận Hà Đông</option>
                  <option value="Hoàng Mai">Quận Hoàng Mai</option>
                  <option value="Long Biên">Quận Long Biên</option>
                  <option value="Tây Hồ">Quận Tây Hồ</option>
                  <option value="online">Học trực tuyến (Online)</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md md:w-auto w-full flex justify-center items-center gap-2 text-sm cursor-pointer"
              >
                <span>Tìm kiếm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TutorCard({ tutor }: { tutor: any }) {
  const { openContactZaloModal, openAuthModal, setPendingTrialTutor } = useUI();
  const { currentSession } = useData();
  const isLoggedIn = currentSession && currentSession.role !== 'anonymous' && !!currentSession.userId;

  const totalTrials = tutor.trialStats?.totalTrials || 0;
  const officialEnrolled = tutor.trialStats?.officialEnrolled || 0;
  const successRate = totalTrials > 0
    ? Math.round((officialEnrolled / totalTrials) * 100)
    : 96;

  const isTeacher = tutor.type === 'Giáo viên' || (tutor.rolePrefix && (tutor.rolePrefix.includes('Cô') || tutor.rolePrefix.includes('Thầy')));

  // Tên môn học chính và các môn kèm theo
  const primarySubject = tutor.badgeSubject || (Array.isArray(tutor.subjects) && tutor.subjects[0]) || 'Môn học';
  const secondarySubjects = Array.isArray(tutor.subjects)
    ? tutor.subjects.filter((s: string) => s !== primarySubject).slice(0, 2)
    : [];

  // Trích xuất 2 điểm sáng giá nhất của giáo viên
  const educationBullet = tutor.education ? tutor.education.split(/[;,\n]/)[0].trim() : (tutor.experience ? `${tutor.experience} năm kinh nghiệm giảng dạy` : null);
  const achievementBullet = tutor.teachingAchievement ? tutor.teachingAchievement.split(/[.;\n]/)[0].trim() : (tutor.teachingMethod ? tutor.teachingMethod.split(/[.;\n]/)[0].trim() : 'Phương pháp giảng dạy 1-1 cá nhân hóa');

  const handleTrialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setPendingTrialTutor(tutor);
      openAuthModal('login', 'student');
      return;
    }
    openContactZaloModal(tutor);
  };

  return (
    <div className="group relative p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04),0_1px_3px_rgba(15,23,42,0.02)] hover:border-slate-300 hover:shadow-[0_16px_36px_-8px_rgba(15,23,42,0.08),0_4px_12px_-2px_rgba(15,23,42,0.03)] transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Banner ảnh giáo viên: Editorial Double-Bezel Framing */}
      <div className="relative">
        <Link
          to={`/giao-vien/${tutor.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 group/banner ring-1 ring-black/5"
        >
          <img
            src={tutor.avatar}
            alt={tutor.displayName || tutor.name}
            className="w-full h-full object-cover object-center group-hover/banner:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />

          {/* TÊN MÔN HỌC RÕ NÉT: Chiếm trọn hàng trên, không bị che khuất */}
          <div className="absolute top-2.5 left-2.5 z-10 max-w-[calc(100%-1.25rem)]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider bg-slate-950/85 backdrop-blur-md text-white shadow-sm border border-white/20 truncate max-w-full">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{primarySubject}</span>
            </span>
          </div>

          {/* Đánh giá sao nổi bật dưới góc ảnh */}
          <div className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1 bg-slate-950/80 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-300 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="tabular-nums font-black text-white">{tutor.rating}</span>
          </div>

          {/* Huy hiệu KYC Đã kiểm định */}
          <div className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/90 backdrop-blur-md text-white border border-emerald-400/30 shadow-xs">
            <ShieldCheck className="w-3 h-3 text-white" />
            <span>KYC Đã duyệt</span>
          </div>
        </Link>
      </div>

      {/* Thân thẻ thông tin: Editorial Typographic Layout */}
      <div className="p-3.5 pt-3 flex-1 flex flex-col justify-between space-y-3">
        {/* DÒNG TIÊU ĐỀ MÔN HỌC CHUYÊN SÂU & VAI TRÒ */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-2 border-b border-slate-100">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wide truncate">
                Chuyên môn: <span className="text-slate-900 font-extrabold">{primarySubject}</span>
              </div>
              {secondarySubjects.length > 0 && (
                <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                  Kèm: {secondarySubjects.join(' • ')}
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs shrink-0">
              {isTeacher ? <Briefcase className="w-3 h-3 text-blue-600" /> : <GraduationCap className="w-3 h-3 text-indigo-600" />}
              <span>{isTeacher ? 'Giáo viên' : 'Gia sư'}</span>
            </span>
          </div>

          {/* Tên Giáo Viên: Hiển thị trọn vẹn đầy đủ, không bị cắt ngắn */}
          <Link
            to={`/giao-vien/${tutor.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block group-hover:text-blue-600 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight group-hover:text-blue-600 transition-colors">
              {tutor.displayName || tutor.name}
            </h3>
          </Link>
        </div>

        {/* Châm ngôn sư phạm: Editorial Quote */}
        <Link
          to={`/giao-vien/${tutor.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-2 pl-2.5 border-l-2 border-blue-600/40 italic bg-slate-50/60 py-1 rounded-r-md hover:text-slate-900 transition-colors">
            “{tutor.headline || tutor.title}”
          </div>
        </Link>

        {/* Điểm sáng học vị & tỷ lệ nhận lớp */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-0.5">
          {educationBullet && (
            <div className="flex items-start gap-1.5 leading-snug">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span className="text-slate-700 font-medium line-clamp-1">{educationBullet}</span>
            </div>
          )}
          {achievementBullet && (
            <div className="flex items-start gap-1.5 leading-snug">
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-slate-600 font-normal line-clamp-1">{achievementBullet}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              {successRate}% nhận lớp thành công
            </span>
            <span className="tabular-nums font-medium text-slate-500">{tutor.reviews || 0} nhận xét</span>
          </div>

          {/* Khu vực giảng dạy & Hình thức - Item I.9 */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200/70">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate font-medium">
              {tutor.teachingFormatsOffline || tutor.location || 'Hà Nội & Toàn quốc (Online)'}
            </span>
          </div>
        </div>

        {/* Bảng giá học phí tổng quan */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500 font-medium">Học phí kèm 1-1:</span>
            <div className="text-right">
              <span className="text-base font-black text-slate-900 tabular-nums tracking-tight">
                {tutor.hourlyRate}đ
              </span>
              <span className="text-xs font-normal text-slate-400">/{tutor.priceUnit || 'buổi'}</span>
            </div>
          </div>
        </div>

        {/* Action Row - Dual CTAs */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <Link
            to={`/giao-vien/${tutor.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-slate-900 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer active:scale-98"
          >
            Hồ sơ
          </Link>

          <button
            type="button"
            onClick={handleTrialClick}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-xs transition-all shadow-xs hover:shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Đăng ký học thử 1-1
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const { openAuthModal } = useUI();
  const { tutors } = useData();
  const [selectedTab, setSelectedTab] = useState<'all' | 'teacher' | 'tutor' | 'math' | 'literature' | 'english' | 'science'>('all');

  // Lọc danh sách giáo viên theo Tab tương tác trên trang chủ
  const filteredTutors = tutors.filter(t => {
    if (selectedTab === 'teacher') return t.type === 'Giáo viên';
    if (selectedTab === 'tutor') return t.type === 'Sinh viên';
    if (selectedTab === 'math') return t.badgeSubject?.includes('Toán') || (Array.isArray(t.subjects) && t.subjects.some(s => s.includes('Toán')));
    if (selectedTab === 'literature') return t.badgeSubject?.includes('Văn') || (Array.isArray(t.subjects) && t.subjects.some(s => s.includes('Văn')));
    if (selectedTab === 'english') return t.badgeSubject?.includes('Anh') || t.badgeSubject?.includes('IELTS') || (Array.isArray(t.subjects) && t.subjects.some(s => s.includes('Anh') || s.includes('IELTS')));
    if (selectedTab === 'science') return t.badgeSubject?.includes('Lý') || t.badgeSubject?.includes('Hóa') || t.badgeSubject?.includes('Sinh') || (Array.isArray(t.subjects) && t.subjects.some(s => s.includes('Lý') || s.includes('Hóa') || s.includes('Sinh')));
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'Tất cả chuyên môn', count: tutors.length },
    { id: 'math', label: 'Môn Toán học' },
    { id: 'english', label: 'Tiếng Anh & IELTS' },
    { id: 'literature', label: 'Ngữ Văn' },
    { id: 'science', label: 'Lý - Hóa - Sinh' },
    { id: 'teacher', label: 'Giáo viên trường', count: tutors.filter(t => t.type === 'Giáo viên').length },
    { id: 'tutor', label: 'Gia sư sinh viên giỏi', count: tutors.filter(t => t.type === 'Sinh viên').length },
  ];

  return (
    <>
      <Hero />

      {/* Section 1: Danh mục Giáo viên & Gia sư Tiêu biểu (Hallmark Editorial Roster) */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Broadsheet Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-extrabold uppercase tracking-widest border border-blue-100/80">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              DANH MỤC HỒ SƠ GIẢNG DẠY TIÊU BIỂU · HÀ NỘI
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Giáo viên & Gia sư Chuyên môn cao
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-2xl font-normal leading-relaxed">
              Duyệt hồ sơ công khai theo từng môn học. 100% giáo viên đã đối soát CCCD, thẩm định năng lực và sẵn sàng buổi học thử 1-1 miễn phí.
            </p>
          </div>

          <Link
            to="/tim-gia-su"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-2xs active:scale-98"
          >
            <span>Tất cả {tutors.length}+ hồ sơ</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Dynamic Category / Filter Tabs (Architectural Segmented Bar) */}
        <div className="p-1.5 rounded-2xl bg-slate-900/[0.03] border border-slate-900/[0.06] flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-8 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 active:scale-98 ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-xs ring-1 ring-slate-900'
                    : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold tabular-nums ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tutor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTutors.slice(0, 8).map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>

        {/* Bottom Explorer Banner (Double-Bezel Bento Box) */}
        <div className="mt-14 p-1.5 rounded-3xl bg-slate-900/[0.03] border border-slate-900/[0.06]">
          <div className="rounded-[calc(1.5rem-0.375rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-1.5 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Bạn đang cần tìm gia sư cho môn học hoặc lớp khác?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
                Bộ lọc chuyên sâu với hơn 20+ môn học từ Toán, Ngữ văn, Ngoại ngữ IELTS, Năng khiếu đến Luyện thi THPT Quốc Gia & Chuyên cấp 3.
              </p>
            </div>
            <Link
              to="/tim-gia-su"
              className="relative z-10 whitespace-nowrap px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shrink-0 active:scale-98 shadow-sm flex items-center gap-1.5"
            >
              <span>Mở bộ lọc chi tiết</span>
              <ArrowRight className="w-4 h-4 text-slate-800" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: QUY TRÌNH KẾT NỐI & HỌC THỬ */}
      <section className="py-16 md:py-24 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-widest border border-blue-100 mb-3">
              Minh bạch & Trực quan
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Quy trình kết nối & Học thử
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Quy trình 4 bước chuẩn mực và minh bạch: Kết nối trực tiếp, học thử 1-1 miễn phí và đánh giá khách quan qua tỷ lệ nhận lớp thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bước 1 */}
            <div className="group relative p-1.5 rounded-3xl bg-slate-900/[0.03] border border-slate-900/[0.06] hover:border-slate-900/[0.14] transition-all duration-300 flex flex-col hover:shadow-md">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_12px_-2px_rgba(15,23,42,0.03)] flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 text-white font-black text-base flex items-center justify-center mb-5 shadow-sm ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
                    1
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-2.5">
                    Lựa chọn Giáo viên
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tìm kiếm giáo viên phù hợp theo môn học và khu vực tại Hà Nội. Xem hồ sơ bằng cấp, video bài giảng mẫu đã qua kiểm định KYC.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Bước 1: Tra cứu hồ sơ
                </div>
              </div>
            </div>

            {/* Bước 2 */}
            <div className="group relative p-1.5 rounded-3xl bg-slate-900/[0.03] border border-slate-900/[0.06] hover:border-slate-900/[0.14] transition-all duration-300 flex flex-col hover:shadow-md">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_12px_-2px_rgba(15,23,42,0.03)] flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 text-white font-black text-base flex items-center justify-center mb-5 shadow-sm ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
                    2
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-2.5">
                    Bấm "Liên hệ ngay"
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Hệ thống cung cấp Số điện thoại và Zalo trực tiếp của giáo viên để hai bên trao đổi chi tiết và sắp xếp lịch học thử 1-1 miễn phí.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Bước 2: Kết nối trực tiếp
                </div>
              </div>
            </div>

            {/* Bước 3 */}
            <div className="group relative p-1.5 rounded-3xl bg-slate-900/[0.03] border border-slate-900/[0.06] hover:border-slate-900/[0.14] transition-all duration-300 flex flex-col hover:shadow-md">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_12px_-2px_rgba(15,23,42,0.03)] flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 text-white font-black text-base flex items-center justify-center mb-5 shadow-sm ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
                    3
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-2.5">
                    Buổi học thử 1-1
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Học sinh trải nghiệm thực tế phương pháp giảng dạy cùng giáo viên để đánh giá mức độ phù hợp và tiếp thu kiến thức.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Bước 3: Trải nghiệm 1 buổi miễn phí
                </div>
              </div>
            </div>

            {/* Bước 4 */}
            <div className="group relative p-1.5 rounded-3xl bg-slate-900/[0.03] border border-slate-900/[0.06] hover:border-slate-900/[0.14] transition-all duration-300 flex flex-col hover:shadow-md">
              <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-6 sm:p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_2px_12px_-2px_rgba(15,23,42,0.03)] flex-1 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 text-white font-black text-base flex items-center justify-center mb-5 shadow-sm ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
                    4
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-2.5">
                    Đăng ký Học chính thức
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Sau buổi học thử, học sinh ấn <strong>"Đăng ký học chính thức"</strong> để chốt khóa học. Trường hợp không đăng ký tiếp, <strong>tỷ lệ nhận lớp của giáo viên sẽ tự động giảm</strong> nhằm đảm bảo tính khách quan.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Bước 4: Xác nhận chính thức
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Call to Action */}
      <section className="py-16 md:py-24 bg-[#FAF9F6] border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-2 rounded-3xl bg-slate-900/[0.03] border border-slate-900/[0.06] shadow-xl">
            <div className="rounded-[calc(1.5rem-0.25rem)] bg-gradient-to-br from-[#0B132B] via-[#101F42] to-[#0B132B] border border-white/10 text-white p-8 sm:p-14 text-center relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl mx-auto space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                  Kết nối với giáo viên và gia sư uy tín
                </h2>
                <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                  Hơn 140+ giáo viên và gia sư đã qua kiểm định chuyên môn tại Hà Nội. Bắt đầu học thử 1-1 ngay hôm nay.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3.5 justify-center">
                  <Link
                    to="/tim-gia-su"
                    className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold px-8 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Tìm kiếm Giáo viên & Gia sư</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => openAuthModal('register', 'teacher')}
                    className="bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-bold px-8 py-3.5 rounded-xl border border-white/20 transition-all text-sm md:text-base cursor-pointer"
                  >
                    Đăng ký Giảng dạy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
