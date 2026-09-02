import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, MapPin, ChevronDown, Briefcase, GraduationCap, Star, ArrowRight } from 'lucide-react';
import { HeroLeftIllustration, HeroRightIllustration } from '../components/HeroIllustrations';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';

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
    <div className="relative bg-gradient-to-b from-blue-50/60 via-slate-50 to-white pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      <div className="hidden lg:block absolute left-8 xl:left-24 top-20">
        <HeroLeftIllustration />
      </div>
      <div className="hidden lg:block absolute right-8 xl:right-24 top-20">
        <HeroRightIllustration />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-blue-700 font-bold text-xs md:text-sm mb-6 border border-blue-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          100% Giáo viên/Gia sư được kiểm duyệt KYC & Năng lực giảng dạy
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Tìm kiếm <span className="text-blue-600">Giáo viên & Gia sư</span> <br className="hidden sm:inline" /> hoàn hảo cho bạn
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-500 mb-8 md:mb-10 px-2 leading-relaxed font-normal">
          Nền tảng kết nối trực tiếp học sinh và giáo viên tại Hà Nội: Trao đổi Zalo 1-1, học thử miễn phí và đăng ký học chính thức minh bạch.
        </p>

        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-4 sm:p-5 relative z-10 text-left">
          <form onSubmit={handleHeroSearch} className="flex flex-col md:flex-row gap-2.5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Môn học, lớp, kỹ năng (VD: Toán 10, Tiếng Anh, Piano, Bơi lội...)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-100/70 border border-transparent focus:border-blue-200 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 text-sm outline-none font-medium"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedLoc}
                onChange={e => setSelectedLoc(e.target.value)}
                className="w-full pl-11 pr-9 py-3 rounded-2xl bg-slate-100/70 border border-transparent focus:border-blue-200 focus:bg-white transition-all text-slate-800 appearance-none text-sm outline-none cursor-pointer font-medium"
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
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md shadow-blue-200 md:w-auto w-full flex justify-center items-center gap-1.5 text-sm cursor-pointer"
            >
              Tìm kiếm
            </button>
          </form>
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
    : 95;

  const isTeacher = tutor.type === 'Giáo viên' || (tutor.rolePrefix && (tutor.rolePrefix.includes('Cô') || tutor.rolePrefix.includes('Thầy')));

  // Trích xuất tối đa 3 gạch đầu dòng ý chính ngắn gọn
  const keyBullets: string[] = [];

  if (tutor.education) {
    keyBullets.push(tutor.education.split(/[;,\n]/)[0].trim());
  } else if (tutor.experience) {
    keyBullets.push(`${tutor.experience} năm kinh nghiệm giảng dạy & luyện thi`);
  }

  if (tutor.teachingAchievement) {
    const ach = tutor.teachingAchievement.split(/[.;\n]/)[0].trim();
    if (ach && !keyBullets.includes(ach)) keyBullets.push(ach);
  }

  if (tutor.teachingMethod && keyBullets.length < 3) {
    const met = tutor.teachingMethod.split(/[.;\n]/)[0].trim();
    if (met && !keyBullets.includes(met)) keyBullets.push(met);
  }

  if (keyBullets.length === 0) {
    keyBullets.push(
      'Giáo viên giàu kinh nghiệm bồi dưỡng học sinh giỏi',
      'Phương pháp giảng dạy cá nhân hóa 1-1'
    );
  }

  const finalBullets = keyBullets.slice(0, 3);

  const handleTrialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setPendingTrialTutor(tutor);
      alert(`Vui lòng đăng nhập tài khoản học sinh để đăng ký học thử Zalo cùng ${tutor.displayName || tutor.name}!`);
      openAuthModal('login', 'student');
      return;
    }
    openContactZaloModal(tutor);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-slate-400 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Visual Hero Photo Banner (Clean Portrait, Center Focus, No face obstruction) */}
      <div className="relative p-2.5 pb-0">
        <Link
          to={`/giao-vien/${tutor.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 group/banner"
        >
          <img
            src={tutor.avatar}
            alt={tutor.displayName || tutor.name}
            className="w-full h-full object-cover object-center group-hover/banner:scale-105 transition-transform duration-500"
          />

          {/* Floating Top Pills (Minimalist style) */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] tracking-wide uppercase backdrop-blur-md flex items-center gap-1.5 ${isTeacher
                ? 'bg-[#111111]/90 text-white'
                : 'bg-slate-800/90 text-white'
              }`}>
              {isTeacher ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
              {isTeacher ? 'Giáo viên' : 'Gia sư'}
            </span>

            <span className="px-2.5 py-1 rounded-md font-bold text-[10px] text-[#2e5d32] bg-[#EDF3EC]/95 backdrop-blur-md border border-[#d6e5d5] flex items-center gap-1.5 tabular-nums shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#346538]" />
              {successRate}% nhận lớp
            </span>
          </div>
        </Link>
      </div>

      {/* Main Body: Minimalist editorial layout */}
      <div className="p-4 pt-3 flex-1 flex flex-col justify-between space-y-3">
        {/* Name, Badge & Rating Header */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="inline-block bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md shadow-2xs">
              {tutor.badgeSubject || tutor.subjects?.[0] || 'Môn học'}
            </span>

            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-800 shadow-2xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{tutor.rating}</span>
            </div>
          </div>

          <Link
            to={`/giao-vien/${tutor.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block group-hover:text-blue-700 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight">
              {tutor.displayName || tutor.name}
            </h3>
          </Link>
        </div>

        {/* Slogan / Tiêu đề */}
        <Link
          to={`/giao-vien/${tutor.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block group-hover:text-blue-700 transition-colors"
        >
          <div className="text-xs font-bold text-slate-700 leading-snug tracking-tight line-clamp-2">
            “{tutor.headline || tutor.title}”
          </div>
        </Link>

        {/* Tối đa 3 gạch đầu dòng ý chính */}
        <ul className="space-y-1.5 text-xs text-slate-600">
          {finalBullets.map((item, i) => (
            <li key={i} className="flex items-start gap-2 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              <span className="text-slate-700 font-normal">{item}</span>
            </li>
          ))}
        </ul>

        {/* Pricing & Rate Breakdown */}
        <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-500">Học phí kèm 1-1:</span>
            <div className="text-right">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                {tutor.hourlyRate}đ
              </span>
              <span className="text-xs font-normal text-slate-400">/{tutor.priceUnit || 'giờ'}</span>
            </div>
          </div>

          {/* Level Prices as Soft Minimalist Badges */}
          {tutor.levelPrices && Object.keys(tutor.levelPrices).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(tutor.levelPrices).map(([lvl, prc]) => (
                <span
                  key={lvl}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-normal text-slate-700 tabular-nums"
                >
                  <span className="text-slate-400">{lvl}:</span>
                  <strong className="text-slate-800 font-bold">{prc}đ</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA Row */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div className="text-[11px] text-slate-500 font-medium tabular-nums whitespace-nowrap">
            {tutor.reviews || 0} đánh giá
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/giao-vien/${tutor.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 active:scale-95 transition-all inline-flex items-center justify-center"
            >
              Hồ sơ
            </Link>

            <button
              type="button"
              onClick={handleTrialClick}
              className="whitespace-nowrap bg-[#111111] hover:bg-[#282828] active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1"
            >
              Học thử Zalo
            </button>
          </div>
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
    { id: 'all', label: 'Tất cả nổi bật', count: tutors.length },
    { id: 'teacher', label: 'Giáo viên chuyên môn', count: tutors.filter(t => t.type === 'Giáo viên').length },
    { id: 'tutor', label: 'Gia sư sinh viên giỏi', count: tutors.filter(t => t.type === 'Sinh viên').length },
    { id: 'math', label: 'Môn Toán' },
    { id: 'english', label: 'Tiếng Anh & IELTS' },
    { id: 'literature', label: 'Ngữ Văn' },
    { id: 'science', label: 'Lý - Hóa - Sinh' }
  ];

  return (
    <>
      <Hero />

      {/* Section 1: Giáo viên & Gia sư Tiêu biểu (Minimalist UI Architecture) */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EDF3EC] text-[#346538] font-bold text-xs border border-[#d6e5d5] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#346538]" />
              Đội ngũ giáo viên & gia sư tiêu biểu
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
              Giáo viên & Gia sư <span className="text-blue-700">được đánh giá cao</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl font-normal leading-relaxed">
              100% hồ sơ đã qua đối soát CCCD, bằng cấp chuyên môn và cam kết chất lượng qua buổi học thử 1-1 miễn phí.
            </p>
          </div>

          <Link
            to="/tim-gia-su"
            className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 text-slate-900 font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-2xs"
          >
            <span>Khám phá tất cả {tutors.length}+ hồ sơ</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Dynamic Category / Filter Tabs (Segmented Minimalist Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${isActive
                    ? 'bg-[#111111] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90'
                  }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tabular-nums ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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

        {/* Bottom Explorer Banner (Minimalist Dark Bento) */}
        <div className="mt-12 bg-[#111111] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Bạn đang cần tìm gia sư cho môn học hoặc lớp khác?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Bộ lọc nâng cao với hơn 20+ môn học từ Văn hóa, Ngoại ngữ IELTS, Năng khiếu đàn/vẽ đến Luyện thi THPT Quốc Gia.
            </p>
          </div>
          <Link
            to="/tim-gia-su"
            className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all shrink-0 active:scale-95 shadow-xs"
          >
            Mở bộ lọc chi tiết →
          </Link>
        </div>
      </section>

      {/* Section 2: QUY TRÌNH KẾT NỐI & HỌC THỬ */}
      <section className="py-16 md:py-24 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Quy trình kết nối & Học thử
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Quy trình 4 bước chuẩn mực và minh bạch: Kết nối trực tiếp, học thử 1-1 miễn phí và đánh giá khách quan qua tỷ lệ nhận lớp thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bước 1 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-5">
                  1
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2.5">
                  Lựa chọn Giáo viên
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tìm kiếm giáo viên phù hợp theo môn học và khu vực tại Hà Nội. Xem hồ sơ bằng cấp, video bài giảng mẫu đã qua kiểm định KYC.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Bước 1: Tra cứu hồ sơ
              </div>
            </div>

            {/* Bước 2 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-5">
                  2
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2.5">
                  Bấm "Liên hệ ngay"
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Hệ thống cung cấp Số điện thoại và Zalo trực tiếp của giáo viên để hai bên trao đổi chi tiết và sắp xếp lịch học thử 1-1 miễn phí.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Bước 2: Kết nối trực tiếp
              </div>
            </div>

            {/* Bước 3 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-5">
                  3
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2.5">
                  Buổi học thử 1-1
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Học sinh trải nghiệm thực tế phương pháp giảng dạy cùng giáo viên để đánh giá mức độ phù hợp và tiếp thu kiến thức.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Bước 3: Trải nghiệm 1 buổi miễn phí
              </div>
            </div>

            {/* Bước 4 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all duration-200">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-base flex items-center justify-center mb-5">
                  4
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 mb-2.5">
                  Đăng ký Học chính thức
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sau buổi học thử, học sinh ấn <strong>"Đăng ký học chính thức"</strong> để chốt khóa học. Trường hợp không đăng ký tiếp, <strong>tỷ lệ nhận lớp của giáo viên sẽ tự động giảm</strong> nhằm đảm bảo tính khách quan.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Bước 4: Xác nhận chính thức
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Call to Action */}
      <section className="py-16 md:py-20 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Kết nối với giáo viên và gia sư uy tín</h2>
          <p className="text-slate-300 text-sm md:text-base mb-8 max-w-xl mx-auto">
            Hơn 140+ giáo viên và gia sư đã qua kiểm định chuyên môn tại Hà Nội. Bắt đầu học thử ngay hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tim-gia-su"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-sm transition-all text-sm md:text-base"
            >
              Tìm kiếm Giáo viên & Gia sư
            </Link>
            <button
              onClick={() => openAuthModal('register', 'teacher')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3.5 rounded-2xl border border-slate-700 transition-all text-sm md:text-base cursor-pointer"
            >
              Đăng ký Giảng dạy
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
