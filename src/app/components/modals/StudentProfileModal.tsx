import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  BookOpen,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  Save,
  ChevronRight,
  ShieldCheck,
  Award,
  MessageCircle,
  HelpCircle,
  Edit3
} from 'lucide-react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import { supabase } from '../../../lib/supabase';

export interface StudentProfileData {
  name: string;
  parentName: string;
  phone: string;
  email: string;
  grade: string;
  school: string;
  district: string;
  address: string;
  avatar: string;
}

const DEFAULT_STUDENT_PROFILE: StudentProfileData = {
  name: 'Nguyễn Hoàng Nam',
  parentName: 'Bác Thành (Phụ huynh)',
  phone: '0912345678',
  email: 'hoangnam.student@gmail.com',
  grade: 'Lớp 10',
  school: 'THPT Chuyên Hà Nội - Amsterdam',
  district: 'Quận Cầu Giấy, Hà Nội',
  address: 'Số 126 Hoàng Quốc Việt, Cầu Giấy',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'
};

const STUDENT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400'
];

const GRADES = [
  'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5',
  'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9 (Thi vào 10)',
  'Lớp 10', 'Lớp 11', 'Lớp 12 (Luyện thi ĐH)'
];

const DISTRICTS = [
  'Quận Cầu Giấy, Hà Nội',
  'Quận Đống Đa, Hà Nội',
  'Quận Ba Đình, Hà Nội',
  'Quận Thanh Xuân, Hà Nội',
  'Quận Nam Từ Liêm, Hà Nội',
  'Quận Bắc Từ Liêm, Hà Nội',
  'Quận Hai Bà Trưng, Hà Nội',
  'Quận Hà Đông, Hà Nội',
  'Học Online toàn quốc'
];

export function StudentProfileModal() {
  const { isStudentProfileOpen, closeStudentProfileModal, openReviewModal, openEnrollmentModal } = useUI();
  const { myTrials, currentSession, setCurrentSession, tutors } = useData();

  const [activeTab, setActiveTab] = useState<'info' | 'classes' | 'tuition'>('info');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form States
  const [profile, setProfile] = useState<StudentProfileData>(() => {
    try {
      const stored = localStorage.getItem('hantutor_student_profile');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      ...DEFAULT_STUDENT_PROFILE,
      phone: currentSession.phone || DEFAULT_STUDENT_PROFILE.phone,
      email: currentSession.email || DEFAULT_STUDENT_PROFILE.email,
      name: currentSession.name || DEFAULT_STUDENT_PROFILE.name
    };
  });

  useEffect(() => {
    if (isStudentProfileOpen) {
      setSaveSuccess(false);
      try {
        const stored = localStorage.getItem('hantutor_student_profile');
        if (stored) {
          setProfile(JSON.parse(stored));
        } else {
          setProfile(prev => ({
            ...prev,
            name: currentSession.name || currentSession.fullName || prev.name,
            phone: currentSession.phone || prev.phone,
            email: currentSession.email || prev.email,
            avatar: currentSession.avatar || prev.avatar
          }));
        }
      } catch {}
    }
  }, [isStudentProfileOpen, currentSession]);

  if (!isStudentProfileOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const trimmedName = profile.name.trim();
      const trimmedPhone = profile.phone.trim();
      const finalAvatar = profile.avatar;

      // 1. CẬP NHẬT DATABASE SUPABASE THẬT
      if (currentSession.userId && !String(currentSession.userId).startsWith('t')) {
        await supabase
          .from('users')
          .update({
            full_name: trimmedName,
            phone: trimmedPhone,
            avatar_url: finalAvatar
          })
          .eq('id', currentSession.userId)
          .catch(() => {});

        await supabase.auth.updateUser({
          data: {
            full_name: trimmedName,
            phone: trimmedPhone,
            avatar_url: finalAvatar,
            grade: profile.grade,
            school: profile.school,
            district: profile.district,
            parentName: profile.parentName
          }
        }).catch(() => {});
      }

      // 2. LƯU LOCALSTORAGE VÀ CẬP NHẬT CLIENT SESSION
      try {
        localStorage.setItem('hantutor_student_profile', JSON.stringify({
          ...profile,
          name: trimmedName,
          phone: trimmedPhone,
          avatar: finalAvatar
        }));
      } catch {}

      setCurrentSession(prev => ({
        ...prev,
        name: trimmedName,
        fullName: trimmedName,
        phone: trimmedPhone,
        avatar: finalAvatar
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Mock enrollment payments for tab 3
  const paidInvoices = [
    {
      id: 'ENR_1788422113882',
      title: 'Khóa 8 buổi Học kèm 1-1 Chuyên sâu',
      tutorName: 'Cô Sương Mai (Ngữ Văn)',
      amount: 1600000,
      sessions: '8/8 buổi',
      status: 'paid',
      date: '03/09/2026',
      method: 'VietQR (MB Bank)'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER: Clean Blue & White Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 pt-6 pb-4 sm:px-8 shrink-0">
          {/* Nút đóng X luôn nằm trên cùng và không bị che */}
          <button
            type="button"
            onClick={closeStudentProfileModal}
            className="absolute top-4 right-4 z-30 text-white/90 hover:text-white bg-black/20 hover:bg-black/35 p-2 rounded-full transition-colors cursor-pointer"
            title="Đóng hồ sơ"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 pr-12">
            <div className="relative shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Tài khoản học sinh đang hoạt động" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {profile.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                  {profile.grade}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {profile.school}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.district}
                </span>
              </p>
            </div>
          </div>

          {/* TAB NAVIGATION: 3 tabs gọn gàng */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'info'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Thông tin học sinh
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'classes'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Lớp học & Gia sư của tôi
              {myTrials.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'classes' ? 'bg-blue-600 text-white' : 'bg-white/30 text-white'
                }`}>
                  {myTrials.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tuition')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tuition'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Học phí & Hóa đơn VietQR
            </button>
          </div>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50">

          {/* ========================================================================= */}
          {/* TAB 1: THÔNG TIN HỌC SINH */}
          {/* ========================================================================= */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Alert Feedback Toast */}
              {saveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Đã cập nhật thông tin học sinh thành công!
                </div>
              )}

              {/* SECTION: Chọn Avatar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <label className="block text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Ảnh đại diện
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {STUDENT_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfile({ ...profile, avatar: url })}
                      className={`relative rounded-xl overflow-hidden p-0.5 transition-all cursor-pointer ${
                        profile.avatar === url
                          ? 'ring-3 ring-blue-600 scale-105 shadow-md'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-12 h-12 rounded-lg object-cover" />
                      {profile.avatar === url && (
                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Hoặc dán link ảnh (URL)..."
                      value={profile.avatar}
                      onChange={e => setProfile({ ...profile, avatar: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-slate-600 bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Thông tin liên hệ cơ bản */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Thông tin học sinh & Phụ huynh
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên học sinh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-colors"
                      placeholder="VD: Nguyễn Hoàng Nam"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ tên Phụ huynh
                    </label>
                    <input
                      type="text"
                      value={profile.parentName}
                      onChange={e => setProfile({ ...profile, parentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-colors"
                      placeholder="VD: Bác Thành (Bố Nam)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại liên hệ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-colors font-mono"
                        placeholder="0912345678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-colors"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Khối lớp & Địa chỉ */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Khối lớp & Trường học
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Khối lớp hiện tại <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={profile.grade}
                      onChange={e => setProfile({ ...profile, grade: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none bg-white font-medium"
                    >
                      {GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Trường đang theo học
                    </label>
                    <input
                      type="text"
                      value={profile.school}
                      onChange={e => setProfile({ ...profile, school: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-colors"
                      placeholder="VD: THPT Chuyên Hà Nội - Amsterdam"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Khu vực Quận / Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={profile.district}
                      onChange={e => setProfile({ ...profile, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none bg-white font-medium"
                    >
                      {DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ chi tiết (Dành cho học kèm tại nhà)
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={e => setProfile({ ...profile, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-none transition-colors"
                      placeholder="VD: Số 126 Hoàng Quốc Việt, Cầu Giấy"
                    />
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeStudentProfileModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: LỚP HỌC & GIA SƯ CỦA TÔI */}
          {/* ========================================================================= */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Danh sách lớp học đã đăng ký</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Quản lý lịch học thử 1-1 và các khóa học chính thức của bạn</p>
                </div>

                <a
                  href="/tim-gia-su"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  Tìm thêm gia sư <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {myTrials.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Chưa có lớp học thử nào</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Hãy lựa chọn thầy cô phù hợp trên HanTutor để nhận ngay 01 buổi học thử 1-1 miễn phí!
                  </p>
                  <a
                    href="/tim-gia-su"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    Khám phá danh sách giáo viên
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {myTrials.map((item, idx) => {
                    const matchedTutor = tutors.find(t => String(t.id) === String(item.tutorId));
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={item.avatar}
                            alt={item.tutorName}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-extrabold text-slate-900">{item.tutorName}</h4>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                {item.badgeSubject}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {item.headline || 'Giáo viên chuyên môn dạy kèm 1-1'}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 font-medium text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Đã xác nhận học thử 1-1
                              </span>
                              <span>•</span>
                              <span>Ngày hẹn: {item.date || 'Hôm nay'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                          {item.zalo && (
                            <a
                              href={`https://zalo.me/${item.zalo.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Zalo thầy cô
                            </a>
                          )}

                          {matchedTutor && (
                            <button
                              type="button"
                              onClick={() => {
                                closeStudentProfileModal();
                                openEnrollmentModal(matchedTutor);
                              }}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              Học chính thức
                            </button>
                          )}

                          {matchedTutor && (
                            <button
                              type="button"
                              onClick={() => {
                                closeStudentProfileModal();
                                openReviewModal(matchedTutor, 'trial');
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Viết đánh giá"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HỌC PHÍ & HÓA ĐƠN VIETQR */}
          {/* ========================================================================= */}
          {activeTab === 'tuition' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Lịch sử học phí & Hóa đơn VietQR</h3>
                <p className="text-xs text-slate-500 mt-0.5">Minh bạch tài chính, hóa đơn điện tử bảo đảm quyền lợi học viên</p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500">Đã thanh toán</span>
                  <div className="text-lg font-black text-blue-600 mt-1">1.600.000đ</div>
                  <span className="text-[11px] text-slate-400">1 khóa học chính thức</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500">Số buổi tích lũy</span>
                  <div className="text-lg font-black text-slate-900 mt-1">8 buổi</div>
                  <span className="text-[11px] text-emerald-600 font-medium">Bảo hiểm 100% học phí</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500">Chính sách HanTutor</span>
                  <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Đổi giáo viên miễn phí
                  </div>
                  <span className="text-[11px] text-slate-400">Nếu không hài lòng sau 2 buổi</span>
                </div>
              </div>

              {/* Invoice list */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Hóa đơn / Giao dịch</span>
                  <span>Trạng thái</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {paidInvoices.map(inv => (
                    <div key={inv.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{inv.title}</h4>
                          <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {inv.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Giáo viên: <strong>{inv.tutorName}</strong> • {inv.sessions}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>{inv.date}</span>
                          <span>•</span>
                          <span>{inv.method}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">{inv.amount.toLocaleString()}đ</div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã thanh toán
                          </span>
                        </div>

                        <a
                          href={`tel:0912345678`}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Hỗ trợ / Khiếu nại đổi giáo viên"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentProfileModal;
