import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { Search, X, BookOpen, ChevronDown, Check, GraduationCap, MapPin, Briefcase, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { TutorCard } from './HomePage';
import { useData } from '../../context/DataContext';

export function FindTutorsPage() {
  const { tutors, currentPage, totalPages, totalCount, fetchTutorsPage, isLoading } = useData();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const [appliedSearch, setAppliedSearch] = useState(params.get('search') || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(() => {
    const loc = params.get('location');
    return loc ? [loc] : [];
  });
  const [sortBy, setSortBy] = useState<'rating' | 'success_rate' | 'price_asc' | 'price_desc'>('rating');

  // Danh mục môn học tổng hợp đa lĩnh vực
  const subjectGroups = [
    {
      group: 'Môn học Văn hóa',
      items: ['Toán', 'Tiếng Anh', 'Ngữ Văn', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lý', 'Tin Học']
    },
    {
      group: 'Năng khiếu & Nghệ thuật',
      items: ['Đàn Piano', 'Đàn Guitar', 'Thanh nhạc / Hát', 'Vẽ / Hội họa', 'Organ / Ukulele']
    },
    {
      group: 'Thể thao & Võ thuật',
      items: ['Bơi lội', 'Võ thuật (Taekwondo / Karate / Tự vệ)', 'Cờ vua / Cờ tướng', 'Yoga / Fitness']
    },
    {
      group: 'Ngoại ngữ & Kỹ năng',
      items: ['IELTS', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn', 'Lập trình (Python / Web / Scratch)', 'Kỹ năng sống']
    }
  ];

  // Bộ lọc Giáo viên và Gia sư ngắn gọn
  const typesList = [
    { label: 'Giáo viên Chuyên môn', value: 'Giáo viên' },
    { label: 'Gia sư Sinh viên Giỏi', value: 'Sinh viên' }
  ];

  const levelsList = [
    'Tiểu học (Lớp 1-5)',
    'THCS (Lớp 6-9)',
    'THPT (Lớp 10-12)',
    'Luyện thi Đại học',
    'Năng khiếu / Người lớn'
  ];

  const formatsList = [
    { label: 'Học trực tuyến (Online)', value: 'online' },
    { label: 'Gia sư đến nhà học sinh', value: 'offline_student_home' },
    { label: 'Học tại nhà / Lớp của giáo viên', value: 'offline_tutor_home' }
  ];

  // Danh sách các Quận trung tâm tại Hà Nội
  const hanoiDistrictsList = [
    'Cầu Giấy',
    'Đống Đa',
    'Hai Bà Trưng',
    'Ba Đình',
    'Thanh Xuân',
    'Hoàn Kiếm',
    'Nam Từ Liêm',
    'Bắc Từ Liêm',
    'Hà Đông',
    'Hoàng Mai',
    'Tây Hồ',
    'Online toàn Hà Nội & Toàn quốc'
  ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput);
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleType = (t: string) => {
    setSelectedTypes(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const toggleLevel = (lvl: string) => {
    setSelectedLevels(prev =>
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  const toggleFormat = (fmt: string) => {
    setSelectedFormats(prev =>
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
  };

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    );
  };

  const resetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setSelectedSubjects([]);
    setSelectedTypes([]);
    setSelectedLevels([]);
    setSelectedFormats([]);
    setSelectedDistricts([]);
    setSortBy('rating');
  };

  const filteredTutors = tutors.filter(t => {
    // Search query match
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      const matchName = t.name?.toLowerCase().includes(q) || t.displayName?.toLowerCase().includes(q);
      const matchSub = t.subjects?.some((s: string) => s.toLowerCase().includes(q)) || t.badgeSubject?.toLowerCase().includes(q);
      const matchTitle = t.title?.toLowerCase().includes(q) || t.headline?.toLowerCase().includes(q);
      if (!matchName && !matchSub && !matchTitle) return false;
    }

    // Subjects filter
    if (selectedSubjects.length > 0) {
      const hasSubject = selectedSubjects.some(sub =>
        t.subjects?.some((s: string) => s.toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes(s.toLowerCase())) ||
        t.badgeSubject?.toLowerCase().includes(sub.toLowerCase())
      );
      if (!hasSubject) return false;
    }

    // Types filter
    if (selectedTypes.length > 0) {
      if (!selectedTypes.includes(t.type)) return false;
    }

    // Formats filter (Online, Đến nhà học sinh, Tại nhà/lớp của giáo viên)
    if (selectedFormats.length > 0) {
      const match = selectedFormats.some(fmt => {
        if (fmt === 'online') {
          return t.isOnline || (t.teachingFormats && t.teachingFormats.includes('online'));
        }
        if (fmt === 'offline_student_home') {
          return (t.teachingFormats && t.teachingFormats.includes('offline_student_home')) ||
            (t.teachingFormatsOffline && !t.teachingFormatsOffline.includes('chỉ online')) ||
            !t.isOnline;
        }
        if (fmt === 'offline_tutor_home') {
          return (t.teachingFormats && t.teachingFormats.includes('offline_tutor_home')) ||
            (t.teachingFormatsOffline && (t.teachingFormatsOffline.toLowerCase().includes('lớp') || t.teachingFormatsOffline.toLowerCase().includes('nhà riêng') || t.teachingFormatsOffline.toLowerCase().includes('phòng học'))) ||
            t.type === 'Giáo viên';
        }
        return false;
      });
      if (!match) return false;
    }

    // Hanoi Districts Filter
    if (selectedDistricts.length > 0) {
      const matchDistrict = selectedDistricts.some(d => {
        if (d === 'online' || d.includes('Online toàn')) return t.isOnline;
        const locStr = `${t.location || ''} ${t.teachingFormatsOffline || ''} ${(t.districts || []).join(' ')}`.toLowerCase();
        return locStr.includes(d.toLowerCase());
      });
      if (!matchDistrict) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'success_rate') {
      const rateA = a.trialStats?.totalTrials > 0 ? (a.trialStats.officialEnrolled / a.trialStats.totalTrials) : 0.95;
      const rateB = b.trialStats?.totalTrials > 0 ? (b.trialStats.officialEnrolled / b.trialStats.totalTrials) : 0.95;
      return rateB - rateA;
    }
    const priceA = parseInt(String(a.hourlyRate).replace(/\D/g, '')) || 0;
    const priceB = parseInt(String(b.hourlyRate).replace(/\D/g, '')) || 0;
    if (sortBy === 'price_asc') return priceA - priceB;
    if (sortBy === 'price_desc') return priceB - priceA;
    return 0;
  });

  const activeFiltersCount = selectedSubjects.length + selectedTypes.length + selectedLevels.length + selectedFormats.length + selectedDistricts.length + (appliedSearch ? 1 : 0);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Editorial Minimalist Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EDF3EC] text-[#346538] text-xs font-bold border border-[#d6e5d5] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#346538]" />
            Khu vực TP. Hà Nội & Toàn quốc
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
            Danh sách Giáo viên & Gia sư <span className="text-blue-700">đã kiểm định</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
            Hệ thống kết nối trực tiếp không qua trung gian: Môn văn hóa phổ thông, Ngoại ngữ IELTS, Năng khiếu nghệ thuật, Võ thuật & Bơi lội.
          </p>
        </div>

        {/* TOP FILTER BAR: MODERN BENTO ARCHITECTURE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">

          {/* Top Search Input & Action Row */}
          <div className="flex flex-col md:flex-row items-center gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(e); }}
                placeholder="Tìm nhanh theo tên giáo viên, môn học (Toán, Văn, Bơi, Piano, Tiếng Anh, IELTS...)"
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FBFBFA] focus:bg-white border border-slate-200 focus:border-slate-800 text-xs sm:text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setAppliedSearch(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full md:w-auto px-5 py-2.5 bg-[#111111] hover:bg-[#282828] active:scale-98 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
              >
                Tìm kiếm
              </button>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="whitespace-nowrap px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Xóa lọc ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Interactive Dropdown Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100">

            {/* Dropdown 1: Môn học */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${selectedSubjects.length > 0
                    ? 'border-blue-300 bg-blue-50/80 text-blue-900 shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Môn học {selectedSubjects.length > 0 && `(${selectedSubjects.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              {/* Hover Popover Dropdown Menu */}
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 max-h-96 overflow-y-auto space-y-3">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span>Chọn môn học & năng khiếu:</span>
                  {selectedSubjects.length > 0 && (
                    <button type="button" onClick={() => setSelectedSubjects([])} className="text-[11px] text-blue-600 hover:underline cursor-pointer">Xóa chọn</button>
                  )}
                </div>
                {subjectGroups.map(grp => (
                  <div key={grp.group} className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{grp.group}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {grp.items.map(sub => {
                        const isSelected = selectedSubjects.includes(sub);
                        return (
                          <button
                            type="button"
                            key={sub}
                            onClick={() => toggleSubject(sub)}
                            className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                              }`}
                          >
                            <span className="truncate">{sub}</span>
                            {isSelected && <Check className="w-3 h-3 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dropdown 2: Cấp học */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${selectedLevels.length > 0
                    ? 'border-indigo-300 bg-indigo-50/80 text-indigo-900 shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Cấp học {selectedLevels.length > 0 && `(${selectedLevels.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 space-y-2">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span>Chọn cấp học / độ tuổi:</span>
                  {selectedLevels.length > 0 && (
                    <button type="button" onClick={() => setSelectedLevels([])} className="text-[11px] text-blue-600 hover:underline cursor-pointer">Xóa chọn</button>
                  )}
                </div>
                <div className="space-y-1">
                  {levelsList.map(lvl => {
                    const isSelected = selectedLevels.includes(lvl);
                    return (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => toggleLevel(lvl)}
                        className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                      >
                        <span>{lvl}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dropdown 3: Khu vực Quận / Huyện */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${selectedDistricts.length > 0
                    ? 'border-emerald-300 bg-[#EDF3EC] text-[#2e5d32] shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Khu vực {selectedDistricts.length > 0 && `(${selectedDistricts.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 max-h-80 overflow-y-auto space-y-2">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span>Quận/Huyện tại Hà Nội:</span>
                  {selectedDistricts.length > 0 && (
                    <button type="button" onClick={() => setSelectedDistricts([])} className="text-[11px] text-blue-600 hover:underline cursor-pointer">Xóa chọn</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {hanoiDistrictsList.map(dist => {
                    const isSelected = selectedDistricts.includes(dist);
                    return (
                      <button
                        type="button"
                        key={dist}
                        onClick={() => toggleDistrict(dist)}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                      >
                        <span className="truncate">{dist}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dropdown 4: Đối tượng (Giáo viên vs Gia sư) */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${selectedTypes.length > 0
                    ? 'border-purple-300 bg-purple-50/80 text-purple-900 shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Loại hình {selectedTypes.length > 0 && `(${selectedTypes.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 space-y-2">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">Chọn đối tượng:</div>
                <div className="space-y-1.5">
                  {typesList.map(t => {
                    const isSelected = selectedTypes.includes(t.value);
                    return (
                      <button
                        type="button"
                        key={t.value}
                        onClick={() => toggleType(t.value)}
                        className={`w-full px-3 py-2.5 rounded-lg text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                      >
                        <div>
                          <div>{t.label}</div>
                          <div className={`text-[10px] font-normal mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {t.value === 'Giáo viên' ? 'Giảng viên, GV trường có kinh nghiệm' : 'Sinh viên giỏi, thủ khoa dạy kèm'}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dropdown 5: Hình thức học (Online vs Trực tiếp) */}
            <div className="relative group">
              <button
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${selectedFormats.length > 0
                    ? 'border-amber-300 bg-amber-50/80 text-amber-900 shadow-2xs font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Hình thức {selectedFormats.length > 0 && `(${selectedFormats.length})`}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-2 w-60 bg-white rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-slate-200 z-50 space-y-1.5">
                <div className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">Hình thức học:</div>
                {formatsList.map(fmt => {
                  const isSelected = selectedFormats.includes(fmt.value);
                  return (
                    <button
                      type="button"
                      key={fmt.value}
                      onClick={() => toggleFormat(fmt.value)}
                      className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${isSelected ? 'bg-[#111111] text-white shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                    >
                      <span>{fmt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filters Chips Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Đang lọc:</span>
              {selectedSubjects.map(sub => (
                <span key={sub} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-medium">
                  {sub}
                  <button type="button" onClick={() => toggleSubject(sub)} className="hover:text-blue-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedLevels.map(lvl => (
                <span key={lvl} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-medium">
                  {lvl}
                  <button type="button" onClick={() => toggleLevel(lvl)} className="hover:text-indigo-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedDistricts.map(dist => (
                <span key={dist} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EDF3EC] text-[#2e5d32] border border-[#d6e5d5] rounded-lg text-xs font-medium">
                  {dist}
                  <button type="button" onClick={() => toggleDistrict(dist)} className="hover:text-emerald-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedTypes.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-xs font-medium">
                  {t}
                  <button type="button" onClick={() => toggleType(t)} className="hover:text-purple-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {selectedFormats.map(fmt => (
                <span key={fmt} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
                  {fmt === 'online' ? 'Online' : 'Offline'}
                  <button type="button" onClick={() => toggleFormat(fmt)} className="hover:text-amber-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {appliedSearch && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-medium">
                  "{appliedSearch}"
                  <button type="button" onClick={() => { setSearchInput(''); setAppliedSearch(''); }} className="hover:text-slate-950 cursor-pointer"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* RESULTS SECTION */}
        <main className="space-y-5">
          {/* Sắp xếp & Thống kê kết quả */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-xs sm:text-sm font-medium text-slate-600">
              Hiển thị <strong className="text-[#111111] font-black text-base tabular-nums">{filteredTutors.length}</strong> hồ sơ giáo viên & gia sư
              {appliedSearch && <span> cho từ khóa "<strong className="text-slate-900">{appliedSearch}</strong>"</span>}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="rating">Đánh giá cao nhất</option>
                <option value="success_rate">Tỷ lệ nhận lớp cao nhất</option>
                <option value="price_asc">Học phí: Thấp đến cao</option>
                <option value="price_desc">Học phí: Cao đến thấp</option>
              </select>
            </div>
          </div>

          {/* Grid kết quả (4 cột chuẩn Minimalist Bento) */}
          {filteredTutors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredTutors.map(tutor => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>

              {/* Server-side Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <div className="text-xs text-slate-500 font-medium">
                    Hiển thị trang <strong className="text-slate-900 font-bold">{currentPage}</strong> / <strong className="text-slate-900 font-bold">{totalPages}</strong> ({totalCount} giáo viên trong hệ thống)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || isLoading}
                      onClick={() => {
                        fetchTutorsPage(currentPage - 1);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          fetchTutorsPage(num);
                          window.scrollTo({ top: 200, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === num
                            ? 'bg-[#111111] text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages || isLoading}
                      onClick={() => {
                        fetchTutorsPage(currentPage + 1);
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      Sau <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Không tìm thấy hồ sơ giáo viên phù hợp</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Hãy thử giảm bớt các tiêu chí lọc hoặc tìm kiếm bằng tên môn học tổng quát hơn.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 bg-[#111111] hover:bg-[#282828] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default FindTutorsPage;
