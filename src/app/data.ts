export interface TutorReviewItem {
  id: string;
  tutorId: string | number;
  studentName: string;
  avatar?: string;
  rating: number;
  date: string;
  stage: 'trial' | 'official' | 'ongoing';
  stageText: string;
  comment: string;
  likes?: number;
  verified?: boolean;
}

export const defaultTutorReviews: TutorReviewItem[] = [
  {
    id: "r1",
    tutorId: "t1",
    studentName: "Phụ huynh em Tuấn Anh",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "22/08/2026",
    stage: "trial",
    stageText: "Sau buổi học thử 1-1",
    comment: "Cô Mai dạy rất tận tình và tâm lý. Trong buổi học thử, cô đã chỉ ra ngay các lỗi diễn đạt và cách mở bài sáng tạo khiến con rất hào hứng. Gia đình đã quyết định đăng ký học chính thức cùng cô ngay sau buổi học!",
    likes: 12,
    verified: true
  },
  {
    id: "r2",
    tutorId: "t1",
    studentName: "Em Bảo Ngọc (Lớp 12)",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "15/08/2026",
    stage: "official",
    stageText: "Đang theo học 3 tháng",
    comment: "Nhờ phương pháp sơ đồ tư duy cảm xúc của cô, em đã không còn sợ các câu nghị luận xã hội nữa. Điểm thi thử khảo sát của em từ 6.5 đã bứt phá lên 8.75 điểm. Em cảm ơn cô rất nhiều ạ!",
    likes: 19,
    verified: true
  },
  {
    id: "r3",
    tutorId: "t2",
    studentName: "Nguyễn Minh Quân (Học sinh 12 chuyên)",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "20/08/2026",
    stage: "official",
    stageText: "Sau thời gian học chính thức",
    comment: "Thầy Tài dạy cực kỳ cuốn hút và thực chiến! Bí kíp đọc Atlat và phân tích số liệu của thầy giúp em làm đúng 100% các câu thực hành mà không phải học vẹt một chữ nào.",
    likes: 15,
    verified: true
  },
  {
    id: "r4",
    tutorId: "t2",
    studentName: "Phụ huynh bạn Khánh Linh",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "16/08/2026",
    stage: "trial",
    stageText: "Sau buổi học thử 1-1",
    comment: "Thầy có tác phong sư phạm rất chuyên nghiệp, đúng giờ và nhiệt tình. Bé nhà mình sau buổi học thử cảm thấy môn Địa rất thú vị và tự tin hơn hẳn.",
    likes: 8,
    verified: true
  },
  {
    id: "r5",
    tutorId: "t3",
    studentName: "Hoàng Đức Duy (Lớp 12 A1)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "19/08/2026",
    stage: "official",
    stageText: "Đang theo học 2 tháng",
    comment: "Đúng như slogan 'Có thầy đơn giản Hóa', các bài tập este và bảo toàn electron hóc búa được thầy Thắng quy đổi và phân tích bản chất cực kỳ dễ hiểu. Rất khuyên các bạn khối A/B nên học thầy!",
    likes: 24,
    verified: true
  },
  {
    id: "r6",
    tutorId: "t4",
    studentName: "Lê Phương Thảo (Luyện thi Y Hà Nội)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    date: "17/08/2026",
    stage: "trial",
    stageText: "Sau buổi học thử 1-1",
    comment: "Buổi học thử với thầy Kiên thật sự chất lượng. Thầy hướng dẫn cách giải bài tập Phả hệ và Di truyền quần thể bằng công thức tính nhanh chỉ mất chưa đầy 40 giây.",
    likes: 11,
    verified: true
  }
];

export interface TutorType {
  id: string | number;
  slug?: string;
  name: string;
  avatar: string;
  coverImage?: string;       // 4. Ảnh cá nhân khác (1 ảnh bìa FB)
  otherImages?: string[];     // 4. Ảnh cá nhân khác (tối đa 3 ảnh)
  title: string;
  headline?: string;         // 2. Dòng giới thiệu ngắn (Headline / Slogan)
  shortBio?: string;         // Trích ngang học vị/thành tích
  rolePrefix?: string;       // Cô / Thầy / HLV / Gia sư
  displayName?: string;      // 1. Tên hiển thị trên web
  badgeSubject?: string;     // Môn học pill đen góc phải
  rating: number;
  reviews: number;
  subjects: string[];        // 6. Môn học tiếp nhận
  targetAudience?: string;   // 9. Cấp học & Đối tượng nhận dạy (giáo viên tự điền)
  location: string;
  hourlyRate: string;        // 12. Bảng giá dịch vụ
  priceUnit: string;
  levelPrices: Record<string, string>; // 12. Bảng giá theo từng cấp lớp
  isOnline: boolean;
  teachingFormatsOnline?: string;  // 10. Trực tuyến (Zoom, Google Meet, MS Teams...)
  teachingFormatsOffline?: string; // 10. Trực tiếp (Danh sách quận/huyện)
  type: string;
  providerType: string;
  targetTags: string[];
  successStory: string;
  phone: string;
  zalo: string;
  birthYear?: string;
  experience?: string | number;
  education?: string;        // 5. Trình độ học vấn (Lưu trong KYC)
  educationLevel?: string;   // Đại học / Cao đẳng / Thạc sĩ
  major?: string;            // Chuyên ngành học
  certificates?: string[];   // 7. Chứng chỉ chuyên môn & Nghiệp vụ sư phạm
  pedagogicalCertificates?: string[]; // 7. Chứng chỉ nghiệp vụ sư phạm (TESOL, CELTA...)
  personality: string[];
  teachingMethod: string;
  philosophy: string;
  teachingAchievement?: string; // 8. Thành tích, phương pháp giảng dạy (~200 từ)
  achievementProofUrl?: string; // 8. Tài liệu minh chứng
  trainingMaterials?: string;   // 11. Tài liệu đào tạo (Học liệu cung cấp)
  videoDemo?: string;           // 11. Đường dẫn video bài giảng mẫu
  responseTime?: string;        // 13. Thời gian phản hồi cam kết
  schedule?: string[];          // 13. Lịch học & Khung giờ nhận lớp (ma trận 7x3)
  skills?: string[];
  trialStats: {
    totalTrials: number;
    officialEnrolled: number;
  };
  kycStatus: 'approved' | 'pending' | 'rejected';
  cccdNumber?: string;
  cccdFront?: string;
  cccdBack?: string;
  credentialFile?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  courseOutlines?: { title: string; desc: string; duration: string }[];
  reviewsList?: {
    id: string;
    studentName: string;
    avatar?: string;
    rating: number;
    date: string;
    comment: string;
    course: string;
  }[];
}

export const mockTutors: TutorType[] = [
  {
    id: "t1",
    slug: "co-suong-mai-ngu-van",
    name: "Cô Sương Mai",
    rolePrefix: "Cô",
    displayName: "Cô Sương Mai",
    headline: "Ươm mầm tình yêu văn học - Bứt phá điểm 9+ kỳ thi THPT",
    shortBio: "Ths. Quản lý Giáo dục. GV Ngữ Văn online được tin tưởng bởi 60,000+ học sinh",
    badgeSubject: "Ngữ văn",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop",
    otherImages: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop"
    ],
    title: "ThS. Quản lý Giáo dục - GV Ngữ Văn Online hàng đầu",
    rating: 5.0,
    reviews: 215,
    subjects: ["Ngữ Văn", "Luyện thi Vào 10", "Luyện thi THPT Quốc Gia", "Văn học Cảm thụ"],
    targetAudience: "Học sinh mất gốc môn Văn cần lấy lại căn bản cấp tốc; Học sinh lớp 9 ôn thi vào 10 trường Chuyên/Công lập; Học sinh lớp 12 luyện thi THPT Quốc Gia mục tiêu 8.5+; Học viên yêu thích phát triển kỹ năng viết và cảm thụ văn học.",
    location: "Cầu Giấy, Nam Từ Liêm, Ba Đình (Hà Nội) & Toàn quốc (Online)",
    hourlyRate: "200.000 - 350.000",
    priceUnit: "giờ",
    levelPrices: {
      "Tiểu học & Cảm thụ": "200.000",
      "THCS (Lớp 6-9) & Vào 10": "280.000",
      "THPT (Lớp 10-12) & Đại học": "350.000"
    },
    isOnline: true,
    teachingFormatsOnline: "Google Meet, Zoom PRO Bản quyền (Tích hợp bảng vẽ Wacom & sơ đồ tư duy thời gian thực)",
    teachingFormatsOffline: "Khu vực Cầu Giấy, Nam Từ Liêm, Ba Đình, Đống Đa, Tây Hồ (Hà Nội)",
    type: "Giáo viên",
    providerType: "1-1",
    phone: "0912345678",
    zalo: "0912345678",
    birthYear: "1992",
    experience: "8 năm",
    education: "Thạc sĩ Quản lý Giáo dục - ĐH Sư Phạm Hà Nội",
    educationLevel: "Thạc sĩ",
    major: "Sư phạm Ngữ văn",
    certificates: [
      "Bằng Thạc sĩ Sư phạm Ngữ văn Xuất sắc - ĐH Sư phạm Hà Nội",
      "Chứng nhận Top 10 Giáo viên Truyền cảm hứng Văn học Quốc gia",
      "Chứng chỉ Nghiệp vụ Sư phạm Quốc tế Advance"
    ],
    pedagogicalCertificates: ["Chứng chỉ Bồi dưỡng Nghiệp vụ Sư phạm Cao cấp", "Chứng nhận Đổi mới Phương pháp Dạy học"],
    personality: ["Truyền cảm hứng", "Sâu sắc", "Dịu dàng", "Tâm lý"],
    teachingMethod: "Dạy Văn bằng sơ đồ tư duy cảm xúc, khơi gợi trí tưởng tượng và rèn luyện kỹ năng nghị luận sắc bén.",
    philosophy: "Học Văn là học cách yêu thương, thấu hiểu con người và làm chủ ngôn từ cuộc sống.",
    teachingAchievement: "Với hơn 8 năm kinh nghiệm giảng dạy và đào tạo chuyên sâu môn Ngữ văn, tôi đã trực tiếp hướng dẫn hơn 60,000 học sinh trên cả nước. Phương pháp giảng dạy của tôi tập trung vào việc biến môn Văn khô khan thành những câu chuyện sống động thông qua sơ đồ tư duy cảm xúc và kỹ thuật nghị luận xã hội hiện đại. Tỷ lệ học sinh đạt điểm 8.5+ trong kỳ thi THPT Quốc Gia hàng năm đạt trên 82%, với nhiều thủ khoa, á khoa môn Văn tại các tỉnh thành lớn.",
    achievementProofUrl: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=800",
    trainingMaterials: "Bộ giáo trình độc quyền 'Bí kíp 9+ Ngữ văn THPT', Tuyển tập 50 đề thi thử bám sát ma trận Bộ GD&ĐT, Sổ tay mở bài - kết bài sáng tạo và ngân hàng dẫn chứng nghị luận xã hội cập nhật hàng tuần.",
    videoDemo: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
    responseTime: "Dưới 30 phút",
    schedule: ["Thứ 2_Tối", "Thứ 3_Tối", "Thứ 4_Tối", "Thứ 6_Tối", "Thứ 7_Sáng", "Chủ Nhật_Sáng", "Chủ Nhật_Tối"],
    targetTags: ["Khá → Giỏi", "Luyện thi THPT Quốc Gia", "Văn cảm xúc", "Nghị luận xã hội"],
    successStory: "Đã đồng hành cùng hơn 60,000 học sinh trên toàn quốc; tỷ lệ đạt 8.5+ môn Văn đạt trên 80%.",
    trialStats: {
      totalTrials: 54,
      officialEnrolled: 52
    },
    kycStatus: 'approved'
  },
  {
    id: "t2",
    slug: "thay-tran-van-tai-dia-li",
    name: "Thầy Trần Văn Tài",
    rolePrefix: "Thầy",
    displayName: "Thầy Trần Văn Tài",
    headline: "Chiến lược 9+ Địa Lí - Bí kíp Atlat & Tư duy số liệu",
    shortBio: "GV Giỏi Sư phạm Địa Lí có hơn 50 Thủ khoa/ Á khoa tỉnh/ thành phố",
    badgeSubject: "Địa lí",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    otherImages: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600&auto=format&fit=crop"
    ],
    title: "GV Giỏi Sư phạm Địa Lí - Chuyên gia Luyện thi 9+",
    rating: 4.9,
    reviews: 148,
    subjects: ["Địa Lý", "Luyện thi THPT Quốc Gia", "Bồi dưỡng HSG Địa Lí"],
    targetAudience: "Học sinh lớp 12 luyện thi tốt nghiệp THPT khối C, C00, D14; Học sinh thi học sinh giỏi cấp Tỉnh/Thành phố; Học sinh cần lấy gốc kỹ năng Atlat và nhận diện biểu đồ nhanh trong 15 phút.",
    location: "Đống Đa, Thanh Xuân, Cầu Giấy (Hà Nội) & Toàn quốc (Online)",
    hourlyRate: "180.000 - 300.000",
    priceUnit: "giờ",
    levelPrices: {
      "THPT (Lớp 10-12)": "220.000",
      "Luyện thi Đại học 9+": "300.000"
    },
    isOnline: true,
    teachingFormatsOnline: "Zoom, Google Meet (Chia sẻ màn hình Atlat điện tử 3D)",
    teachingFormatsOffline: "Khu vực Đống Đa, Thanh Xuân, Cầu Giấy, Ba Đình (Hà Nội)",
    type: "Giáo viên",
    providerType: "1-1",
    phone: "0987654321",
    zalo: "0987654321",
    birthYear: "1990",
    experience: "9 năm",
    education: "Đại học Sư Phạm Hà Nội - Khoa Địa Lý",
    educationLevel: "Đại học",
    major: "Sư phạm Địa lý",
    certificates: [
      "Giáo viên dạy giỏi cấp Thành phố Hà Nội",
      "Tác giả bộ sách 'Atlat thực chiến 9+ Địa Lí'",
      "Chứng nhận bồi dưỡng HSG Quốc Gia"
    ],
    pedagogicalCertificates: ["Chứng chỉ Nghiệp vụ Sư phạm Quốc gia"],
    personality: ["Hài hước", "Năng lượng", "Thực tế", "Tỉ mỉ"],
    teachingMethod: "Khai thác triệt để kỹ năng đọc Atlat Địa lý, biểu đồ và số liệu thống kê. Học 1 nhớ 10 mà không cần học vẹt.",
    philosophy: "Địa lý là bức tranh sống động của thế giới, hãy học bằng tư duy khám phá thay vì ghi nhớ máy móc.",
    teachingAchievement: "Hơn 9 năm kinh nghiệm luyện thi đại học và bồi dưỡng đội tuyển HSG môn Địa lý. Đã đào tạo thành công hơn 50 Thủ khoa và Á khoa khối C tại các tỉnh miền Bắc. Phương pháp dạy tối ưu hoá Atlat giúp học sinh giải quyết 15 câu trắc nghiệm kỹ năng chỉ trong 5 phút với độ chính xác 100%.",
    achievementProofUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800",
    trainingMaterials: "Bộ cẩm nang 'Giải mã Atlat Địa lý Việt Nam', 30 đề thi thử độc quyền phân loại câu hỏi Vận dụng cao, Bảng tổng hợp số liệu kinh tế - xã hội cập nhật mới nhất.",
    videoDemo: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
    responseTime: "Dưới 30 phút",
    schedule: ["Thứ 3_Tối", "Thứ 5_Tối", "Thứ 7_Chiều", "Chủ Nhật_Tối"],
    targetTags: ["Bí kíp Atlat", "Mục tiêu 9+", "Luyện thi Đại học", "Lấy gốc nhanh"],
    successStory: "Đã bồi dưỡng hơn 50 Thủ khoa và Á khoa khối C tại các kỳ thi tuyển sinh đại học.",
    trialStats: {
      totalTrials: 38,
      officialEnrolled: 36
    },
    kycStatus: 'approved'
  },
  {
    id: "t3",
    slug: "thay-pham-thang-hoa-hoc",
    name: "Thầy Phạm Thắng",
    rolePrefix: "Thầy",
    displayName: "Thầy Phạm Thắng",
    headline: "Có thầy đơn giản Hoá - Bản chất phản ứng & Kỹ thuật Casio",
    shortBio: "Thủ khoa, NCS Tiến sĩ, giảng viên Công nghệ Hoá Học MTA",
    badgeSubject: "Hóa học",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop",
    otherImages: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop"
    ],
    title: "Thủ khoa, NCS Tiến sĩ - Giảng viên Công nghệ Hóa học MTA",
    rating: 5.0,
    reviews: 192,
    subjects: ["Hóa Học", "Luyện thi Đại học Khối A/B", "Hóa Chuyên"],
    targetAudience: "Học sinh mất gốc Hóa cấp 2 và cấp 3; Học sinh 11-12 mục tiêu đỗ ĐH Y Hà Nội, Dược, Bách Khoa; Học sinh ôn thi chuyên Hóa vào các trường Chuyên Sư Phạm, Chuyên KHTN.",
    location: "Hai Bà Trưng, Ba Đình, Hoàn Kiếm (Hà Nội) & Online",
    hourlyRate: "250.000 - 450.000",
    priceUnit: "giờ",
    levelPrices: {
      "THCS (Lớp 8-9)": "220.000",
      "THPT (Lớp 10-12)": "300.000",
      "Luyện thi Đại học Y Dược": "450.000"
    },
    isOnline: true,
    teachingFormatsOnline: "MS Teams, Zoom HD (Bảng mô phỏng phân tử 3D)",
    teachingFormatsOffline: "Hai Bà Trưng, Ba Đình, Hoàn Kiếm, Đống Đa (Hà Nội)",
    type: "Giáo viên",
    providerType: "1-1",
    phone: "0905123456",
    zalo: "0905123456",
    birthYear: "1989",
    experience: "10 năm",
    education: "NCS Tiến sĩ Hóa học - Học viện Kỹ thuật Quân sự",
    educationLevel: "Thạc sĩ",
    major: "Công nghệ Kỹ thuật Hóa học",
    certificates: [
      "Bằng Thạc sĩ Hóa học Xuất sắc",
      "Thủ khoa đầu ra Học viện Kỹ thuật Quân sự",
      "Bằng khen Giảng viên Nghiên cứu Khoa học Xuất sắc"
    ],
    pedagogicalCertificates: ["Chứng chỉ Bồi dưỡng Nghiệp vụ Giảng viên ĐH"],
    personality: ["Logic cao", "Khoa học", "Dễ hiểu", "Tận tâm"],
    teachingMethod: "Hệ thống hóa bản chất phản ứng và bảo toàn nguyên tố/điện tích. Triệt tiêu hoàn toàn nỗi sợ bài tập vô cơ và hữu cơ.",
    philosophy: "Hóa học là môn khoa học thực nghiệm kỳ diệu. Hiểu bản chất sẽ thấy mọi bài toán đều trở nên cực kỳ đơn giản.",
    teachingAchievement: "10 năm giảng dạy đại học và luyện thi THPT Quốc Gia. Đã đào tạo trực tiếp hơn 200 học sinh đỗ vào các trường Y Dược hàng đầu (ĐH Y Hà Nội, ĐH Dược Hà Nội, Học viện Quân Y). Tác giả phương pháp 'Quy đổi este nâng cao' được hàng nghìn học sinh ứng dụng hiệu quả.",
    achievementProofUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800",
    trainingMaterials: "Tuyển tập 1000 câu bài tập Hóa học Este - Lipit phân loại theo mức độ, Sơ đồ tư duy vô cơ và ngân hàng đề thi thử bám sát đề thi chính thức.",
    videoDemo: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
    responseTime: "Dưới 30 phút",
    schedule: ["Thứ 2_Sáng", "Thứ 4_Chiều", "Thứ 6_Tối", "Thứ 7_Tối"],
    targetTags: ["Đơn giản Hóa", "Mục tiêu 9+", "Bảo toàn E & Nguyên tố", "Lấy lại gốc Hóa"],
    successStory: "Hướng dẫn hàng trăm học sinh đạt điểm 9+ môn Hóa, đỗ ĐH Y Hà Nội, ĐH Bách Khoa, Dược Hà Nội.",
    trialStats: {
      totalTrials: 45,
      officialEnrolled: 43
    },
    kycStatus: 'approved'
  },
  {
    id: "t4",
    slug: "thay-truong-cong-kien-sinh-hoc",
    name: "Thầy Trương Công Kiên",
    rolePrefix: "Thầy",
    displayName: "Thầy Trương Công Kiên",
    headline: "Sinh học tốc độ tối ưu điểm số - Chiến thuật bứt phá 9+",
    shortBio: "8 năm luyện thi trực tuyến với hơn 1000+ điểm 8,9+ mỗi khoá",
    badgeSubject: "Sinh học",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop",
    otherImages: [
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop"
    ],
    title: "Chuyên gia Luyện thi Sinh học Khối B & Y Dược",
    rating: 4.9,
    reviews: 175,
    subjects: ["Sinh Học", "Luyện thi Đại học", "Khối B Y Dược"],
    targetAudience: "Học sinh lớp 12 định hướng khối B (Toán - Hóa - Sinh); Học sinh luyện thi vào các trường Đại học Y Dược; Học sinh cần tăng tốc độ làm bài trắc nghiệm Sinh học.",
    location: "Thanh Xuân, Hà Đông (Hà Nội) & Online",
    hourlyRate: "200.000 - 380.000",
    priceUnit: "giờ",
    levelPrices: {
      "THPT (Lớp 10-12)": "250.000",
      "Luyện thi Khối B Y Dược": "380.000"
    },
    isOnline: true,
    teachingFormatsOnline: "Zoom, Google Meet",
    teachingFormatsOffline: "Khu vực Thanh Xuân, Hà Đông, Nam Từ Liêm (Hà Nội)",
    type: "Giáo viên",
    providerType: "1-1",
    phone: "0934567890",
    zalo: "0934567890",
    birthYear: "1993",
    experience: "8 năm",
    education: "Đại học Sư Phạm Hà Nội - Khoa Sinh học",
    educationLevel: "Đại học",
    major: "Sư phạm Sinh học",
    certificates: [
      "Bằng Cử nhân Sư phạm Sinh học Xuất sắc",
      "Chứng nhận Top Giáo viên Luyện thi Khối B uy tín miền Bắc"
    ],
    personality: ["Sôi nổi", "Truyền lửa", "Chiến thuật rõ ràng", "Bám sát đề thi"],
    teachingMethod: "Kỹ thuật giải nhanh Di truyền học và Sinh thái học trong 30 giây. Bấm Casio và áp dụng công thức siêu tốc.",
    philosophy: "Học đúng phương pháp, tốc độ giải đề sẽ tăng gấp đôi và điểm số sẽ tự khắc bứt phá.",
    teachingAchievement: "8 năm luyện thi chuyên sâu môn Sinh học. Mỗi năm có hơn 1000 học sinh đạt 8.5+ trong kỳ thi THPT Quốc Gia.",
    achievementProofUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800",
    trainingMaterials: "Bộ 40 công thức giải nhanh Di truyền học, Cẩm nang chinh phục Phả hệ, Bộ đề thi thử độc quyền 2026.",
    videoDemo: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
    responseTime: "Dưới 30 phút",
    schedule: ["Thứ 3_Tối", "Thứ 5_Tối", "Thứ 7_Sáng", "Chủ Nhật_Chiều"],
    targetTags: ["Tốc độ tối ưu", "Luyện thi Y Dược Khối B", "Di truyền học Casio", "Mục tiêu 9+"],
    successStory: "Mỗi khóa có hơn 1000+ học viên đạt 8.5 - 10 điểm môn Sinh trong kỳ thi THPT Quốc Gia.",
    trialStats: {
      totalTrials: 42,
      officialEnrolled: 40
    },
    kycStatus: 'approved'
  }
];

// Danh sách giáo viên đang chờ duyệt (Dành cho Admin Dashboard)
export const mockPendingTutors: TutorType[] = [
  {
    id: "pending-1",
    slug: "hoang-van-duc-hoa-hoc",
    name: "Hoàng Văn Đức",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop",
    title: "Cử nhân Hóa học - ĐH Khoa học Tự nhiên",
    rating: 5.0,
    reviews: 0,
    subjects: ["Hóa Học", "Luyện thi Đại học"],
    location: "Thanh Xuân, Hà Nội",
    hourlyRate: "180.000 - 250.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0967891234",
    zalo: "0967891234",
    birthYear: "1999",
    experience: "3 năm",
    education: "Đại học Khoa học Tự nhiên ĐHQGHN - Hóa Dược",
    certificates: ["Bằng Cử nhân Hóa học loại Giỏi", "Chứng chỉ Sư phạm"],
    personality: ["Năng động", "Nhiệt tình", "Khoa học"],
    teachingMethod: "Hóa học trực quan qua video thí nghiệm thực tế và sơ đồ tư duy phản ứng.",
    philosophy: "Hóa học gắn liền với cuộc sống.",
    targetTags: ["Mất gốc Hóa", "Luyện thi THPT"],
    successStory: "Đã dạy hơn 15 học sinh tiến bộ từ 4 điểm lên 8 điểm môn Hóa.",
    levelPrices: {
      "THCS (Lớp 6-9)": "180.000",
      "THPT (Lớp 10-12)": "220.000",
      "Luyện thi Đại học": "250.000"
    },
    trialStats: {
      totalTrials: 0,
      officialEnrolled: 0
    },
    kycStatus: 'pending',
    cccdFront: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop",
    cccdBack: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop",
    credentialFile: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: "pending-2",
    slug: "tran-thi-mai-tieng-nhat",
    name: "Trần Thị Mai",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    title: "Giáo viên Tiếng Nhật N1 - JLPT",
    rating: 5.0,
    reviews: 0,
    subjects: ["Tiếng Nhật", "JLPT N5-N2"],
    location: "Nam Từ Liêm, Hà Nội & Online",
    hourlyRate: "200.000 - 300.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0911223344",
    zalo: "0911223344",
    birthYear: "1996",
    experience: "4 năm",
    education: "Đại học Ngoại Ngữ ĐHQGHN - Tiếng Nhật",
    certificates: ["JLPT N1", "Chứng chỉ du học Nhật Bản 2 năm"],
    personality: ["Chu đáo", "Kiên trì", "Tỉ mỉ"],
    teachingMethod: "Luyện phát âm chuẩn Tokyo và đàm thoại thực chiến hàng ngày.",
    philosophy: "Học ngoại ngữ là một hành trình khám phá văn hóa.",
    targetTags: ["Tiếng Nhật N5-N2", "Du học sinh"],
    successStory: "Đã giúp hơn 30 học viên đỗ JLPT N3 và N2 đúng kỳ hạn.",
    levelPrices: {
      "Sơ cấp (N5-N4)": "200.000",
      "Trung cấp (N3-N2)": "300.000"
    },
    trialStats: {
      totalTrials: 0,
      officialEnrolled: 0
    },
    kycStatus: 'pending',
    cccdFront: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop",
    cccdBack: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop",
    credentialFile: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=500&auto=format&fit=crop"
  }
];

// Thống kê dành cho Admin Dashboard
export const mockAdminStats = {
  pageViews: 14280,
  pageViewsGrowth: "+18.5% so với tuần trước",
  totalTutors: 148,
  pendingKyc: 2,
  totalStudents: 892,
  totalTrialContacts: 310,
  totalOfficialEnrolled: 274,
  avgTrialSuccessRate: "88.4%",
  recentActivities: [
    { id: 1, type: "trial_contact", student: "Nguyễn Văn Hùng", tutor: "Cô Nguyễn Hà Anh", time: "10 phút trước", status: "Đang học thử" },
    { id: 2, type: "official_enrolled", student: "Trần Minh Quân", tutor: "Thầy Trần Văn Nam", time: "35 phút trước", status: "Đã vào học chính thức" },
    { id: 3, type: "kyc_submit", student: "", tutor: "Hoàng Văn Đức", time: "1 giờ trước", status: "Chờ duyệt KYC" },
    { id: 4, type: "official_enrolled", student: "Lê Thu Hà", tutor: "Thầy Lê Minh Tuấn", time: "2 giờ trước", status: "Đã vào học chính thức" }
  ]
};



