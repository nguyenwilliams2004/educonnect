import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  Briefcase,
  UploadCloud,
  Users,
  Eye,
  X
} from 'lucide-react';
import { Tutor as TutorType } from '../data';
import { useData } from '../../context/DataContext';

export function TutorRegistrationPage() {
  const { addMockTutor } = useData();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Phân tách vai trò Đăng ký: Giáo viên vs Gia sư
  const [roleType, setRoleType] = useState<'teacher' | 'tutor'>('teacher');

  // ================= PHẦN I: THẨM ĐỊNH DANH TÍNH & BẢO MẬT HỒ SƠ =================
  // 1. Định danh cá nhân (KYC)
  const [fullName, setFullName] = useState(urlParams.get('name') || '');
  const [cccdNumber, setCccdNumber] = useState('');
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string>('');
  const [cccdBackPreview, setCccdBackPreview] = useState<string>('');

  // 2. Thông tin liên hệ & Kênh thanh toán
  const [phone, setPhone] = useState(urlParams.get('phone') || '');
  const [email, setEmail] = useState(urlParams.get('email') || '');
  const [bankName, setBankName] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  // ================= PHẦN II: THÔNG TIN GIẢNG DẠY (HIỂN THỊ TRÊN WEB) =================
  const [displayName, setDisplayName] = useState(urlParams.get('name') || '');
  const [headline, setHeadline] = useState('');

  // 3. Ảnh đại diện (Avatar)
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showSampleModal, setShowSampleModal] = useState(false);

  // 4. Ảnh cá nhân khác (2 ảnh - optional)
  const [otherImages, setOtherImages] = useState<string[]>([]);

  // 5. Trình độ học vấn
  const [educationLevel, setEducationLevel] = useState('Đại học');
  const [major, setMajor] = useState('');
  const [university, setUniversity] = useState('Đại học Sư phạm Hà Nội');
  const [customUniversity, setCustomUniversity] = useState('');
  const [credentialPreview, setCredentialPreview] = useState<string>('');

  // 6. Môn học tiếp nhận
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubject, setCustomSubject] = useState('');

  // 7. Chứng chỉ chuyên môn & Nghiệp vụ sư phạm
  const [subjectCertificates, setSubjectCertificates] = useState('');
  const [pedagogicalCertificates, setPedagogicalCertificates] = useState('');
  const [certificateProofPreview, setCertificateProofPreview] = useState<string>('');

  // 8. Thành tích, phương pháp giảng dạy
  const [teachingAchievement, setTeachingAchievement] = useState('');
  const [experience, setExperience] = useState('');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(['Tận tâm', 'Kiên nhẫn']);
  const [achievementPreview, setAchievementPreview] = useState<string>('');

  // 9. Cấp học & Đối tượng nhận dạy
  const [targetAudience, setTargetAudience] = useState('');

  // 10. Hình thức giảng dạy
  const [teachingFormatsOnline] = useState('Google Meet, Zoom PRO, MS Teams');
  const [teachingFormatsOffline] = useState('');
  const [isOnlineSupport] = useState(true);
  const [isOfflineSupport] = useState(true);

  // 11. Tài liệu đào tạo (Optional)
  const [trainingMaterials] = useState('');
  const [videoDemo] = useState('');

  // 12. Bảng giá dịch vụ (VNĐ/giờ)
  const [hourlyRate] = useState('200.000 - 350.000');
  const [priceUnit] = useState('giờ');
  const [levelPrices] = useState<Record<string, string>>({
    'THCS (Lớp 6-9)': '200.000',
    'THPT (Lớp 10-12)': '280.000',
    'Luyện thi Đại học / Chuyên': '350.000'
  });

  // 13. Lịch học & Cam kết vận hành
  const [scheduleSlots, setScheduleSlots] = useState<string[]>(['Thứ 2_Tối', 'Thứ 4_Tối', 'Thứ 6_Tối', 'Chủ Nhật_Sáng']);
  const [responseTime] = useState<'Dưới 30 phút' | 'Dưới 1 giờ' | 'Dưới 3 giờ'>('Dưới 30 phút');
  const [commitAccurate, setCommitAccurate] = useState(false);
  const [commitConduct, setCommitConduct] = useState(false);
  const [commitTerms, setCommitTerms] = useState(false);

  // AI Image Validation Status Tracker
  const [imageValidations, setImageValidations] = useState<{
    avatar?: boolean;
    cccdFront?: boolean;
    cccdBack?: boolean;
    credential?: boolean;
  }>({});

  // Lists & Options
  const banksList = [
    'Vietcombank (VCB)', 'VietinBank (CTG)', 'BIDV', 'Agribank',
    'MB Bank', 'Techcombank', 'VPBank', 'ACB', 'Sacombank',
    'TPBank', 'SHB', 'HDBank', 'SeABank', 'OCB', 'MSB',
    'LienVietPostBank', 'Nam A Bank', 'VIB', 'Eximbank', 'Ngân hàng khác (Tự nhập)'
  ];

  const popularSubjects = [
    'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học',
    'Lịch sử', 'Địa lý', 'Tin học', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn',
    'Đàn Piano', 'Đàn Guitar', 'Vẽ / Mỹ thuật', 'Bơi lội', 'Cầu lông', 'Bóng rổ',
    'Võ thuật (Tự vệ)', 'Cờ vua', 'Yoga'
  ];

  const shifts = [
    { label: 'Ca Sáng (08:00 - 11:30)', key: 'Sáng' },
    { label: 'Ca Chiều (14:00 - 17:30)', key: 'Chiều' },
    { label: 'Ca Tối (18:30 - 21:30)', key: 'Tối' }
  ];
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'other' | 'cccdFront' | 'cccdBack' | 'credential' | 'certProof' | 'achievement') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!validFormats.includes(file.type)) {
      alert("Định dạng tệp không hợp lệ! Vui lòng chỉ tải tệp định dạng JPG, PNG, WEBP hoặc PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Tệp tải lên vượt quá dung lượng cho phép (tối đa 5MB). Vui lòng chọn ảnh nhẹ hơn!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'avatar') {
        setAvatarPreview(dataUrl);
        setImageValidations(prev => ({ ...prev, avatar: true }));
      } else if (type === 'other') {
        setOtherImages(prev => prev.length < 2 ? [...prev, dataUrl] : [prev[0], dataUrl]);
      } else if (type === 'cccdFront') {
        setCccdFrontPreview(dataUrl);
        setImageValidations(prev => ({ ...prev, cccdFront: true }));
      } else if (type === 'cccdBack') {
        setCccdBackPreview(dataUrl);
        setImageValidations(prev => ({ ...prev, cccdBack: true }));
      } else if (type === 'credential') {
        setCredentialPreview(dataUrl);
        setImageValidations(prev => ({ ...prev, credential: true }));
      } else if (type === 'certProof') {
        setCertificateProofPreview(dataUrl);
      } else if (type === 'achievement') {
        setAchievementPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleScheduleSlot = (day: string, shiftKey: string) => {
    const slot = `${day}_${shiftKey}`;
    if (scheduleSlots.includes(slot)) {
      setScheduleSlots(scheduleSlots.filter(s => s !== slot));
    } else {
      setScheduleSlots([...scheduleSlots, slot]);
    }
  };

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const validatePartI = () => {
    if (!fullName.trim()) return "Vui lòng nhập Họ và tên đầy đủ theo CCCD.";
    if (!cccdNumber.trim()) return "Vui lòng nhập Số CCCD/Hộ chiếu.";
    if (!cccdFrontPreview) return "Vui lòng tải lên Ảnh chụp mặt trước CCCD/Hộ chiếu.";
    if (!cccdBackPreview) return "Vui lòng tải lên Ảnh chụp mặt sau CCCD/Hộ chiếu.";
    if (!phone.trim()) return "Vui lòng nhập Số điện thoại dùng Zalo.";
    if (!email.trim()) return "Vui lòng nhập Email cá nhân.";
    if (!bankName) return "Vui lòng chọn Ngân hàng nhận thanh toán.";
    if (bankName === 'Ngân hàng khác (Tự nhập)' && !customBankName.trim()) return "Vui lòng nhập tên ngân hàng của bạn.";
    if (!bankAccountNumber.trim()) return "Vui lòng nhập Số tài khoản ngân hàng.";
    if (!bankAccountHolder.trim()) return "Vui lòng nhập Tên chủ tài khoản (phải trùng khớp họ tên CCCD).";
    return null;
  };

  const validatePartII = () => {
    if (!displayName.trim()) return "Vui lòng nhập Tên hiển thị trên website.";
    if (!headline.trim()) return "Vui lòng nhập Dòng giới thiệu ngắn (Headline / Slogan).";
    if (!avatarPreview) return "Vui lòng tải lên Ảnh đại diện (Avatar).";
    if (!educationLevel) return "Vui lòng chọn Trình độ học vấn.";
    if (!major.trim()) return "Vui lòng nhập Chuyên ngành học.";
    if (selectedSubjects.length === 0 && !customSubject.trim()) return "Vui lòng chọn hoặc nhập ít nhất 1 Môn học tiếp nhận.";
    if (!targetAudience.trim()) return "Vui lòng điền Cấp học & Đối tượng nhận dạy (mục 9).";
    if (!hourlyRate.trim()) return "Vui lòng điền Bảng giá dịch vụ học phí (mục 12).";
    if (scheduleSlots.length === 0) return "Vui lòng chọn ít nhất 1 ca rảnh trong tuần (mục 13).";
    if (!commitAccurate || !commitConduct || !commitTerms) return "Vui lòng tích chọn đầy đủ 3 cam kết tiêu chuẩn cộng đồng.";
    return null;
  };

  const handleNextStep = () => {
    const error = validatePartI();
    if (error) {
      alert(error);
      return;
    }
    if (!displayName.trim()) setDisplayName(fullName);
    if (!bankAccountHolder.trim()) setBankAccountHolder(fullName.toUpperCase());
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const error = validatePartII();
    if (error) {
      alert(error);
      return;
    }

    setLoading(true);
    const tutorId = `tutor-${Date.now()}`;
    const allSubjects = [...selectedSubjects];
    if (customSubject.trim() && !allSubjects.includes(customSubject.trim())) {
      allSubjects.push(customSubject.trim());
    }

    const finalUniversityName = university === 'Trường khác (Tự nhập)' ? (customUniversity.trim() || 'Trường Đại học') : university;
    const finalBankName = bankName === 'Ngân hàng khác (Tự nhập)' ? customBankName.trim() : bankName;

    const certList: string[] = [];
    if (subjectCertificates.trim()) certList.push(subjectCertificates.trim());
    if (pedagogicalCertificates.trim()) certList.push(pedagogicalCertificates.trim());

    const isTeacherRole = roleType === 'teacher';

    const newTutorProfile: TutorType = {
      id: tutorId,
      name: fullName,
      displayName: displayName || fullName,
      rolePrefix: isTeacherRole ? (educationLevel === 'Thạc sĩ' ? 'ThS' : 'Giáo viên') : 'Gia sư',
      headline: headline,
      badgeSubject: allSubjects[0] || (isTeacherRole ? 'Giáo viên' : 'Gia sư'),
      avatar: avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
      coverImage: otherImages[0] || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200",
      otherImages: otherImages.length > 0 ? otherImages : [avatarPreview],
      title: `${educationLevel} ${major} - ${headline}`,
      shortBio: `${educationLevel} ${major} (${finalUniversityName})`,
      rating: 5.0,
      reviews: 0,
      subjects: allSubjects,
      targetAudience: targetAudience,
      location: teachingFormatsOffline || 'Hà Nội & Toàn quốc (Online)',
      hourlyRate: hourlyRate,
      priceUnit: priceUnit,
      levelPrices: levelPrices,
      isOnline: isOnlineSupport,
      teachingFormatsOnline: isOnlineSupport ? teachingFormatsOnline : 'Không dạy online',
      teachingFormatsOffline: isOfflineSupport ? (teachingFormatsOffline || 'Khu vực nội thành') : 'Chỉ dạy online',
      type: isTeacherRole ? 'Giáo viên' : 'Gia sư',
      providerType: isTeacherRole ? 'teacher' : 'tutor',
      targetTags: allSubjects.slice(0, 3),
      successStory: teachingAchievement,
      phone: phone,
      zalo: phone,
      birthYear: '1995',
      experience: experience || (isTeacherRole ? '5 năm' : '2 năm'),
      education: `${educationLevel} ${major} - ${finalUniversityName}`,
      educationLevel: educationLevel,
      major: major,
      certificates: certList.length > 0 ? certList : ['Đã xác thực văn bằng gốc'],
      pedagogicalCertificates: pedagogicalCertificates ? [pedagogicalCertificates] : [],
      personality: personalityTraits,
      teachingMethod: teachingAchievement || 'Phương pháp giảng dạy cá nhân hóa, bám sát năng lực học sinh.',
      philosophy: headline || 'Tận tâm đồng hành vì sự tiến bộ của từng học trò.',
      teachingAchievement: teachingAchievement,
      achievementProofUrl: achievementPreview || certificateProofPreview,
      trainingMaterials: trainingMaterials || 'Giáo trình biên soạn độc quyền và tài liệu ôn thi cập nhật.',
      videoDemo: videoDemo || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      responseTime: responseTime,
      schedule: scheduleSlots,
      trialStats: { totalTrials: 0, officialEnrolled: 0 },
      kycStatus: 'pending',
      cccdNumber: cccdNumber,
      cccdFront: cccdFrontPreview,
      cccdBack: cccdBackPreview,
      credentialFile: credentialPreview,
      bankName: finalBankName,
      bankAccountNumber: bankAccountNumber,
      bankAccountHolder: bankAccountHolder
    };

    addMockTutor(newTutorProfile);
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Gửi hồ sơ thành công!</h1>
        <p className="text-slate-600 mb-8 text-xs sm:text-sm leading-relaxed">
          Hồ sơ giảng dạy của bạn đã được chuyển đến ban kiểm duyệt chuyên môn HanTutor. Chúng tôi sẽ thẩm định thông tin và kích hoạt hồ sơ công khai trong thời gian sớm nhất.
        </p>
        <Link
          to="/tim-gia-su"
          className="inline-flex items-center justify-center bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-xs sm:text-sm"
        >
          Khám phá danh sách giáo viên
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-sm border border-slate-200/80">
        
        {/* HEADER */}
        <div className="text-center mb-8 border-b border-slate-100 pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-3">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Cổng Đăng Ký Đối Tác Giảng Dạy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Đăng ký Hồ sơ Giảng dạy</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-xl mx-auto leading-relaxed">
            Gia nhập mạng lưới giáo viên chuyên nghiệp & gia sư tài năng hàng đầu tại Hà Nội. Tiếp cận học sinh chất lượng cao, linh hoạt thời gian và minh bạch thù lao.
          </p>

          {/* CHỌN VAI TRÒ: GIÁO VIÊN VS GIA SƯ */}
          <div className="mt-7 mb-7 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
            <div
              onClick={() => setRoleType('teacher')}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                roleType === 'teacher'
                  ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-500/10 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${roleType === 'teacher' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  Giáo viên Chuyên nghiệp
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800">
                  Chính quy
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Dành cho giáo viên trường công/tư, giảng viên, thạc sĩ. Chủ động lịch dạy, trực tiếp thống nhất học phí và kế hoạch học tập với phụ huynh học sinh.
              </p>
            </div>

            <div
              onClick={() => setRoleType('tutor')}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                roleType === 'tutor'
                  ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-500/10 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${roleType === 'tutor' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  Gia sư Xuất sắc
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-800">
                  Bảo trợ Escrow
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Dành cho sinh viên giỏi, thủ khoa, gia sư kinh nghiệm. Phụ huynh thanh toán qua quỹ bảo trợ HanTutor Escrow, cam kết nhận đủ thù lao sau mỗi buổi dạy.
              </p>
            </div>
          </div>

          {/* STEPPER NAVIGATION */}
          <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                step === 1
                  ? 'border-blue-600 bg-blue-50/60 text-blue-950 shadow-xs ring-2 ring-blue-500/10'
                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                1
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider">Phần I: Thẩm định KYC</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">Bảo mật thông tin cá nhân</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                const err = validatePartI();
                if (err) { alert(err); return; }
                setStep(2);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                step === 2
                  ? 'border-blue-600 bg-blue-50/60 text-blue-950 shadow-xs ring-2 ring-blue-500/10'
                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                2
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider">Phần II: Hồ sơ Giảng dạy</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">Hiển thị tới học sinh</p>
              </div>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHẦN 1: THẨM ĐỊNH KYC (BẢO MẬT) */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Alert bảo mật */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-slate-700 leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-slate-900">Cam kết bảo mật danh tính (KYC):</strong> Toàn bộ thông tin CCCD/Hộ chiếu và số tài khoản ngân hàng ở Phần I được mã hóa và lưu trữ an toàn. Dữ liệu này chỉ phục vụ công tác xác minh tư cách người dạy và đối soát chi trả thù lao, tuyệt đối <strong>không hiển thị công khai</strong> trên hồ sơ web.
              </div>
            </div>

            {/* Mục 1: Định danh cá nhân */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">1</span>
                <h3 className="text-sm font-bold text-slate-900">Định danh cá nhân (KYC)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên đầy đủ theo CCCD <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="VD: NGUYỄN VĂN AN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số CCCD / Hộ chiếu <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={cccdNumber}
                    onChange={e => setCccdNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="VD: 001200012345"
                    maxLength={12}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 outline-none text-xs sm:text-sm font-mono text-slate-800 transition-all"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700">Ảnh chụp 2 mặt CCCD / Hộ chiếu <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Mặt trước */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-600 block">Mặt trước CCCD</span>
                        {imageValidations.cccdFront && (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã duyệt ảnh chuẩn
                          </span>
                        )}
                      </div>
                      <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-blue-50/30 hover:border-blue-400 transition-all cursor-pointer min-h-[130px] flex flex-col justify-center items-center bg-slate-50/50">
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cccdFront')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        {cccdFrontPreview ? (
                          <img src={cccdFrontPreview} alt="CCCD Front" className="max-h-[110px] rounded-lg object-contain shadow-xs" />
                        ) : (
                          <>
                            <UploadCloud className="w-6 h-6 text-slate-400 mb-1.5" />
                            <span className="font-semibold text-slate-700 text-xs block">Tải ảnh mặt trước</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP tối đa 5MB</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mặt sau */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-600 block">Mặt sau CCCD</span>
                        {imageValidations.cccdBack && (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã duyệt ảnh chuẩn
                          </span>
                        )}
                      </div>
                      <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-blue-50/30 hover:border-blue-400 transition-all cursor-pointer min-h-[130px] flex flex-col justify-center items-center bg-slate-50/50">
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cccdBack')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        {cccdBackPreview ? (
                          <img src={cccdBackPreview} alt="CCCD Back" className="max-h-[110px] rounded-lg object-contain shadow-xs" />
                        ) : (
                          <>
                            <UploadCloud className="w-6 h-6 text-slate-400 mb-1.5" />
                            <span className="font-semibold text-slate-700 text-xs block">Tải ảnh mặt sau</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP tối đa 5MB</span>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Mục 2: Liên hệ & Ngân hàng */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">2</span>
                <h3 className="text-sm font-bold text-slate-900">Thông tin liên hệ & Kênh nhận thù lao</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại Zalo nhận thông báo lớp <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 outline-none text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email cá nhân <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tutor@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 outline-none text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                {/* Phần Ngân hàng nhận thù lao */}
                <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                  <div className="mb-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tài khoản ngân hàng nhận thù lao giảng dạy <span className="text-red-500">*</span></h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tên chủ tài khoản ngân hàng cần trùng khớp với Họ tên trên CCCD để hệ thống tự động đối soát.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên ngân hàng <span className="text-red-500">*</span></label>
                      <select
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none focus:border-blue-600 transition-colors"
                      >
                        <option value="">-- Chọn ngân hàng --</option>
                        {banksList.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      {bankName === 'Ngân hàng khác (Tự nhập)' && (
                        <input
                          type="text"
                          placeholder="Nhập tên ngân hàng..."
                          value={customBankName}
                          onChange={e => setCustomBankName(e.target.value)}
                          className="mt-2 w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-600"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số tài khoản <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={e => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="VD: 1903..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-semibold outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên chủ tài khoản <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={bankAccountHolder}
                        onChange={e => setBankAccountHolder(e.target.value.toUpperCase())}
                        placeholder="NGUYEN VAN AN"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold uppercase outline-none focus:border-blue-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl transition-all shadow-sm text-xs sm:text-sm cursor-pointer inline-flex items-center gap-2"
              >
                Tiếp tục sang Phần II (Thông tin giảng dạy) →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHẦN 2: THÔNG TIN GIẢNG DẠY (HIỂN THỊ CÔNG KHAI) */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Mục 1-2: Tên & Giới thiệu */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">1-2</span>
                <h3 className="text-sm font-bold text-slate-900">Tên hiển thị & Giới thiệu ngắn</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">1. Tên hiển thị trên website <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="VD: Thầy Hoàng Nam hoặc Cô Mai Anh"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 outline-none text-xs sm:text-sm font-bold text-slate-800 focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">2. Dòng giới thiệu ngắn (Slogan / Chuyên môn) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="VD: Luyện thi Toán 9 vào 10 & Chuyên sâu bản chất"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 outline-none text-xs sm:text-sm font-semibold text-blue-700 focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Mục 3-4: Ảnh chân dung & Hoạt động */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">3-4</span>
                <h3 className="text-sm font-bold text-slate-900">Ảnh đại diện & Hình ảnh giảng dạy</h3>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">3. Ảnh đại diện hồ sơ (Avatar) <span className="text-red-500">*</span></label>
                  {imageValidations.avatar && (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Ảnh đạt chuẩn
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3.5">
                    <div className="w-20 h-24 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors">
                        <UploadCloud className="w-3.5 h-3.5" /> <span>Tải ảnh đại diện</span>
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'avatar')} className="hidden" />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">Ảnh chân dung lịch sự, phông sáng, tối đa 5MB</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
                    <button
                      type="button"
                      onClick={() => setShowSampleModal(true)}
                      className="w-12 h-16 rounded-lg overflow-hidden border border-amber-300 shrink-0 bg-white cursor-pointer hover:scale-105 transition-transform"
                    >
                      <img src="/sample-avatar-4x6.png" alt="Ảnh mẫu" className="w-full h-full object-cover" />
                    </button>
                    <div>
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded uppercase block w-fit mb-0.5">Tiêu chuẩn ảnh mẫu</span>
                      <p className="text-[11px] text-slate-600 leading-snug">Chụp chính diện, trang phục trang nhã.</p>
                      <button
                        type="button"
                        onClick={() => setShowSampleModal(true)}
                        className="text-[11px] text-amber-800 font-semibold hover:underline mt-0.5 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem ảnh mẫu 4x6
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Ảnh hoạt động */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">4. Ảnh hoạt động giảng dạy thực tế (Tùy chọn - Giúp tăng tỷ lệ chọn)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40 text-center">
                    <span className="text-[11px] font-medium text-slate-700 block mb-1.5">Ảnh hoạt động 1 (Lớp học / Kèm 1-1)</span>
                    <div className="relative aspect-video rounded-lg bg-white overflow-hidden flex items-center justify-center border border-slate-200">
                      {otherImages[0] ? (
                        <img src={otherImages[0]} alt="Activity 1" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[11px] text-slate-400">Chưa có ảnh</span>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 cursor-pointer text-white font-semibold text-xs transition-opacity">
                        Thay ảnh <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'other')} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40 text-center">
                    <span className="text-[11px] font-medium text-slate-700 block mb-1.5">Ảnh hoạt động 2 (Tài liệu / Học sinh tiến bộ)</span>
                    <div className="relative aspect-video rounded-lg bg-white overflow-hidden flex items-center justify-center border border-slate-200">
                      {otherImages[1] ? (
                        <img src={otherImages[1]} alt="Activity 2" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[11px] text-slate-400">Chưa có ảnh</span>
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 cursor-pointer text-white font-semibold text-xs transition-opacity">
                        Thay ảnh <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'other')} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mục 5-6: Học vấn & Môn học */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">5-6</span>
                <h3 className="text-sm font-bold text-slate-900">Trình độ học vấn & Môn học tiếp nhận</h3>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">5. Học vị & Trường đào tạo <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={educationLevel}
                    onChange={e => setEducationLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:border-blue-600 transition-colors"
                  >
                    <option value="Đại học">Đại học</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                  </select>
                  <input
                    type="text"
                    value={major}
                    onChange={e => setMajor(e.target.value)}
                    placeholder="Chuyên ngành đào tạo"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none focus:border-blue-600 transition-colors"
                  />
                  <input
                    type="text"
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    placeholder="Tên trường Đại học"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-700 block">Tệp chứng thực văn bằng / Thẻ sinh viên</span>
                    {imageValidations.credential && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã nhận tệp văn bằng
                      </span>
                    )}
                  </div>
                  <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center min-h-[90px] flex flex-col justify-center items-center bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-400 transition-all cursor-pointer">
                    <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange(e, 'credential')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {credentialPreview ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">✓ Đã tải tệp văn bằng lên hệ thống</span>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-semibold text-slate-700">Tải ảnh bằng tốt nghiệp hoặc thẻ SV</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, PDF (Tối đa 5MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. Môn học */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">6. Môn học tiếp nhận giảng dạy <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/40 p-3.5 rounded-xl border border-slate-200">
                  {popularSubjects.map(sub => {
                    const checked = selectedSubjects.includes(sub);
                    return (
                      <label
                        key={sub}
                        onClick={() => toggleSubject(sub)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors select-none ${
                          checked
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mục 9: Cấp học & Đối tượng nhận dạy */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">9</span>
                <h3 className="text-sm font-bold text-slate-900">Cấp học & Đối tượng nhận dạy</h3>
              </div>
              <textarea
                rows={3}
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="Mô tả cụ thể đối tượng học sinh tiếp nhận (VD: Học sinh mất gốc môn Toán lớp 8-9, học sinh ôn thi chuyên Văn vào 10, luyện thi Đại học khối D...)"
                className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/10 transition-all resize-none"
              />
            </div>

            {/* Mục 13: Lịch học rảnh trong tuần */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">13</span>
                <h3 className="text-sm font-bold text-slate-900">Khung giờ có thể nhận lớp</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Chọn các ca học bạn sẵn sàng giảng dạy <span className="text-red-500">*</span></label>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full min-w-[520px] border-collapse text-xs text-center">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="p-3 text-left pl-4 font-bold text-slate-800">Khung giờ</th>
                        {days.map(d => <th key={d} className="p-2.5 font-semibold text-slate-700">{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map(shiftObj => (
                        <tr key={shiftObj.key} className="border-b border-slate-100 last:border-0">
                          <td className="p-2.5 font-medium text-slate-700 text-left pl-4 bg-slate-50/50 whitespace-nowrap text-xs">{shiftObj.label}</td>
                          {days.map(day => {
                            const isSelected = scheduleSlots.includes(`${day}_${shiftObj.key}`);
                            return (
                              <td key={day} className="p-1.5">
                                <button
                                  type="button"
                                  onClick={() => toggleScheduleSlot(day, shiftObj.key)}
                                  className={`w-full py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                                      : 'bg-slate-100/70 text-slate-500 hover:bg-slate-200/80'
                                  }`}
                                >
                                  {isSelected ? '✓ Rảnh' : '+'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cam kết trách nhiệm */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 p-2.5 bg-slate-50/50 rounded-xl border border-slate-200/80 hover:bg-blue-50/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={commitAccurate}
                    onChange={e => setCommitAccurate(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span>1. Cam kết toàn bộ thông tin bằng cấp, thẻ sinh viên và hồ sơ tải lên là hoàn toàn chính xác.</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 p-2.5 bg-slate-50/50 rounded-xl border border-slate-200/80 hover:bg-blue-50/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={commitConduct}
                    onChange={e => setCommitConduct(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span>2. Cam kết giữ vững chuẩn mực sư phạm, đúng giờ và nhiệt tình đồng hành cùng học sinh.</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 p-2.5 bg-slate-50/50 rounded-xl border border-slate-200/80 hover:bg-blue-50/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={commitTerms}
                    onChange={e => setCommitTerms(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span>3. Đã đọc kỹ và đồng ý với điều khoản hợp tác đối tác giảng dạy của HanTutor.</span>
                </label>
              </div>
            </div>

            {/* Điều hướng Back & Submit */}
            <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ← Quay lại Phần I
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl transition-all shadow-sm text-xs sm:text-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi hồ sơ...
                  </>
                ) : 'Hoàn tất đăng ký & Gửi duyệt hồ sơ'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Phóng to Xem Kĩ Ảnh Mẫu Chuẩn */}
      {showSampleModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowSampleModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-xl relative animate-in zoom-in-95 duration-200 flex flex-col items-center text-center border border-slate-100"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSampleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-amber-200/60">
              ★ Ảnh mẫu chân dung chuẩn 4x6
            </div>

            <div className="w-48 sm:w-56 h-64 sm:h-72 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white mb-3 flex items-center justify-center">
              <img
                src="/sample-avatar-4x6.png"
                alt="Ảnh mẫu chân dung chuẩn"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Chụp chính diện rõ nét khuôn mặt, trang phục lịch sự, phông nền sáng.
            </p>

            <button
              type="button"
              onClick={() => setShowSampleModal(false)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorRegistrationPage;
