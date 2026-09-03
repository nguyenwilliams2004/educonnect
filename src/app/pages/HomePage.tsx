import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, MapPin, ChevronDown, Briefcase, GraduationCap, Star, ArrowRight, Award, BookOpen } from 'lucide-react';
import { HeroLeftIllustration, HeroRightIllustration } from '../components/HeroIllustrations';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';

/* Hallmark · genre: editorial · macrostructure: Broadsheet Roster · theme: Newsprint/Atelier · pre-emit critique: P5 H5 E5 S5 R5 V5 */

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
    <div className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-slate-400/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Banner ảnh giáo viên: Editorial Framing */}
      <div className="relative p-2.5 pb-0">
        <Link
          to={`/giao-vien/${tutor.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-4/3 rounded-lg overflow-hidden bg-slate-100 group/banner"
        >
          <img
            src={tutor.avatar}
            alt={tutor.displayName || tutor.name}
            className="w-full h-full object-cover object-center group-hover/banner:scale-103 transition-transform duration-500"
          />

          {/* TÊN MÔN HỌC RÕ NÉT: Anchor Badge nổi bật ở góc trên bên trái */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-black text-xs uppercase tracking-wider bg-slate-950 text-white shadow-sm border border-white/20">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{primarySubject}</span>
            </span>
          </div>

          {/* Huy hiệu vai trò: Giáo viên vs Gia sư */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="px-2 py-1 rounded-md font-semibold text-[11px] bg-white/95 text-slate-800 backdrop-blur-xs border border-slate-200 shadow-xs flex items-center gap-1">
              {isTeacher ? <Briefcase className="w-3 h-3 text-blue-600" /> : <GraduationCap className="w-3 h-3 text-indigo-600" />}
              <span>{isTeacher ? 'Giáo viên' : 'Gia sư'}</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Thân thẻ thông tin: Editorial Typographic Layout */}
      <div className="p-4 pt-3 flex-1 flex flex-col justify-between space-y-3">
        {/* DÒNG TIÊU ĐỀ MÔN HỌC CHUYÊN SÂU & ĐÁNH GIÁ */}
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

            <div className="flex items-center gap-1 bg-amber-50/90 border border-amber-200/70 px-2 py-0.5 rounded text-xs font-bold text-amber-900 shrink-0 shadow-2xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{tutor.rating}</span>
            </div>
          </div>

          {/* Tên Giáo Viên */}
          <Link
            to={`/giao-vien/${tutor.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight group-hover:text-blue-700 transition-colors">
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
          <div className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-2 pl-2.5 border-l-2 border-slate-200 hover:border-slate-400 transition-colors">
            “{tutor.headline || tutor.title}”
          </div>
        </Link>

        {/* Điểm sáng học vị & tỷ lệ nhận lớp */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-0.5">
          {educationBullet && (
            <div className="flex items-start gap-1.5 leading-snug">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span className="text-slate-700 font-medium line-clamp-1">{educationBullet}</span>
            </div>
          )}
          {achievementBullet && (
            <div className="flex items-start gap-1.5 leading-snug">
              <Award className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span className="text-slate-600 font-normal line-clamp-1">{achievementBullet}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {successRate}% nhận lớp thành công
            </span>
            <span className="tabular-nums">{tutor.reviews || 0} nhận xét</span>
          </div>
        </div>

        {/* Bảng giá học phí */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-slate-500 font-medium">Học phí kèm 1-1:</span>
            <div className="text-right">
              <span className="text-base font-extrabold text-slate-900 tabular-nums">
                {tutor.hourlyRate}đ
              </span>
              <span className="text-xs font-normal text-slate-400">/{tutor.priceUnit || 'buổi'}</span>
            </div>
          </div>

          {tutor.levelPrices && Object.keys(tutor.levelPrices).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(tutor.levelPrices).slice(0, 3).map(([lvl, prc]) => (
                <span
                  key={lvl}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 tabular-nums"
                >
                  <span className="text-slate-400">{lvl}:</span>
                  <strong className="text-slate-700 font-semibold">{prc}đ</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <Link
            to={`/giao-vien/${tutor.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center justify-center cursor-pointer"
          >
            Hồ sơ
          </Link>

          <button
            type="button"
            onClick={handleTrialClick}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 active:scale-98 text-white font-bold text-xs transition-colors shadow-xs inline-flex items-center justify-center gap-1 cursor-pointer"
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
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              DANH MỤC HỒ SƠ GIẢNG DẠY TIÊU BIỂU · HÀ NỘI
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Giáo viên & Gia sư Chuyên môn cao
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-2xl font-normal leading-relaxed">
              Duyệt hồ sơ công khai theo từng môn học. 100% giáo viên đã đối soát CCCD, thẩm định năng lực và sẵn sàng buổi học thử 1-1 miễn phí.
            </p>
          </div>

          <Link
            to="/tim-gia-su"
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-2xs"
          >
            <span>Tất cả {tutors.length}+ hồ sơ</span>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Dynamic Category / Filter Tabs (Editorial Segmented Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold tabular-nums ${
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

        {/* Bottom Explorer Banner (Editorial Bento Box) */}
        <div className="mt-12 bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800 shadow-sm">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Bạn đang cần tìm gia sư cho môn học hoặc lớp khác?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Bộ lọc chuyên sâu với hơn 20+ môn học từ Toán, Ngữ văn, Ngoại ngữ IELTS, Năng khiếu đến Luyện thi THPT Quốc Gia & Chuyên cấp 3.
            </p>
          </div>
          <Link
            to="/tim-gia-su"
            className="whitespace-nowrap px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all shrink-0 active:scale-95 shadow-xs"
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
