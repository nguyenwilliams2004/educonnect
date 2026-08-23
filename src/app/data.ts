export interface TutorType {
  id: string | number;
  slug?: string;
  name: string;
  avatar: string;
  title: string;
  headline?: string;     // Khẩu hiệu/Slogan nổi bật (vd: Ươm mầm tình yêu văn học, Chiến lược 9+ Địa Lí...)
  shortBio?: string;     // Trích ngang học vị/thành tích (vd: Ths. Quản lý Giáo dục. GV Ngữ Văn online...)
  rolePrefix?: string;   // Cô / Thầy / HLV / Gia sư
  displayName?: string;  // Tên ngắn gọn hiển thị góc trái dưới (vd: Sương Mai, Trần Văn Tài...)
  badgeSubject?: string; // Môn học pill đen góc phải (vd: Ngữ văn, Địa lí, Hoá học, Sinh học, Toán, Bơi lội...)
  rating: number;
  reviews: number;
  subjects: string[];
  location: string;
  hourlyRate: string;
  priceUnit: string;
  isOnline: boolean;
  type: string;
  providerType: string;
  targetTags: string[];
  successStory: string;
  levelPrices: Record<string, string>;
  phone: string;
  zalo: string;
  birthYear?: string;
  experience?: string | number;
  education?: string;
  certificates?: string[];
  // Thông tin mở rộng phong cách Qanda & Superprof
  personality: string[];
  teachingMethod: string;
  philosophy: string;
  videoDemo?: string;
  courseOutlines?: { title: string; desc: string; duration: string }[];
  trialStats: {
    totalTrials: number;
    officialEnrolled: number;
  };
  kycStatus: 'approved' | 'pending' | 'rejected';
  cccdFront?: string;
  cccdBack?: string;
  credentialFile?: string;
  schedule?: string[];
  skills?: string[];
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
    displayName: "Sương Mai",
    headline: "Ươm mầm tình yêu văn học",
    shortBio: "Ths. Quản lý Giáo dục. GV Ngữ Văn online được tin tưởng bởi 60,000+ học sinh",
    badgeSubject: "Ngữ văn",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    title: "ThS. Quản lý Giáo dục - GV Ngữ Văn Online hàng đầu",
    rating: 5.0,
    reviews: 215,
    subjects: ["Ngữ Văn", "Luyện thi Đại học", "Tiểu học"],
    location: "Cầu Giấy, Hà Nội & Online",
    hourlyRate: "200.000 - 350.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0912345678",
    zalo: "0912345678",
    birthYear: "1992",
    experience: "8 năm",
    education: "Thạc sĩ Quản lý Giáo dục - ĐH Sư Phạm Hà Nội",
    certificates: ["Bằng Thạc sĩ Sư phạm Xuất sắc", "Top 10 Giáo viên Ngữ văn Truyền cảm hứng"],
    personality: ["Truyền cảm hứng", "Sâu sắc", "Dịu dàng", "Tâm lý"],
    teachingMethod: "Dạy Văn bằng sơ đồ tư duy cảm xúc, khơi gợi trí tưởng tượng và rèn luyện kỹ năng nghị luận sắc bén.",
    philosophy: "Học Văn là học cách yêu thương, thấu hiểu con người và làm chủ ngôn từ cuộc sống.",
    targetTags: ["Khá → Giỏi", "Luyện thi THPT Quốc Gia", "Văn cảm xúc", "Nghị luận xã hội"],
    successStory: "Đã đồng hành cùng hơn 60,000 học sinh trên toàn quốc; tỷ lệ đạt 8.5+ môn Văn đạt trên 80%.",
    levelPrices: {
      "THCS (Lớp 6-9)": "200.000",
      "THPT (Lớp 10-12)": "280.000",
      "Luyện thi Đại học": "350.000"
    },
    trialStats: {
      totalTrials: 54,
      officialEnrolled: 52
    },
    kycStatus: 'approved',
    schedule: ["Thứ 2_Tối", "Thứ 4_Tối", "Thứ 6_Tối", "Chủ Nhật_Sáng"]
  },
  {
    id: "t2",
    slug: "thay-tran-van-tai-dia-li",
    name: "Thầy Trần Văn Tài",
    rolePrefix: "Thầy",
    displayName: "Trần Văn Tài",
    headline: "Chiến lược 9+ Địa Lí",
    shortBio: "GV Giỏi Sư phạm Địa Lí có hơn 50 Thủ khoa/ Á khoa tỉnh/ thành phố",
    badgeSubject: "Địa lí",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
    title: "GV Giỏi Sư phạm Địa Lí - Chuyên gia Luyện thi 9+",
    rating: 4.9,
    reviews: 148,
    subjects: ["Địa Lý", "Luyện thi Đại học", "THPT (Lớp 10-12)"],
    location: "Đống Đa, Hà Nội & Online",
    hourlyRate: "180.000 - 300.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0987654321",
    zalo: "0987654321",
    birthYear: "1990",
    experience: "9 năm",
    education: "Đại học Sư Phạm Hà Nội - Khoa Địa Lý",
    certificates: ["Giáo viên dạy giỏi cấp Thành phố", "Tác giả bộ Atlat thực chiến"],
    personality: ["Hài hước", "Năng lượng", "Thực tế", "Tỉ mỉ"],
    teachingMethod: "Khai thác triệt để kỹ năng đọc Atlat Địa lý, biểu đồ và số liệu thống kê. Học 1 nhớ 10 mà không cần học vẹt.",
    philosophy: "Địa lý là bức tranh sống động của thế giới, hãy học bằng tư duy khám phá thay vì ghi nhớ máy móc.",
    targetTags: ["Bí kíp Atlat", "Mục tiêu 9+", "Luyện thi Đại học", "Lấy gốc nhanh"],
    successStory: "Đã bồi dưỡng hơn 50 Thủ khoa và Á khoa khối C tại các kỳ thi tuyển sinh đại học.",
    levelPrices: {
      "THPT (Lớp 10-12)": "220.000",
      "Luyện thi Đại học 9+": "300.000"
    },
    trialStats: {
      totalTrials: 38,
      officialEnrolled: 36
    },
    kycStatus: 'approved',
    schedule: ["Thứ 3_Tối", "Thứ 5_Tối", "Thứ 7_Chiều", "Chủ Nhật_Tối"]
  },
  {
    id: "t3",
    slug: "thay-pham-thang-hoa-hoc",
    name: "Thầy Phạm Thắng",
    rolePrefix: "Thầy",
    displayName: "Phạm Thắng",
    headline: "Có thầy đơn giản Hoá",
    shortBio: "Thủ khoa, NCS Tiến sĩ, giảng viên Công nghệ Hoá Học MTA",
    badgeSubject: "Hóa học",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    title: "Thủ khoa, NCS Tiến sĩ - Giảng viên Công nghệ Hóa học MTA",
    rating: 5.0,
    reviews: 192,
    subjects: ["Hóa Học", "Luyện thi Đại học", "Hóa Chuyên"],
    location: "Hai Bà Trưng, Ba Đình, Hà Nội & Online",
    hourlyRate: "250.000 - 450.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0905123456",
    zalo: "0905123456",
    birthYear: "1989",
    experience: "10 năm",
    education: "NCS Tiến sĩ Hóa học - Học viện Kỹ thuật Quân sự",
    certificates: ["Bằng Thạc sĩ Hóa học Xuất sắc", "Thủ khoa đầu ra Học viện"],
    personality: ["Logic cao", "Khoa học", "Dễ hiểu", "Tận tâm"],
    teachingMethod: "Hệ thống hóa bản chất phản ứng và bảo toàn nguyên tố/điện tích. Triệt tiêu hoàn toàn nỗi sợ bài tập vô cơ và hữu cơ.",
    philosophy: "Hóa học là môn khoa học thực nghiệm kỳ diệu. Hiểu bản chất sẽ thấy mọi bài toán đều trở nên cực kỳ đơn giản.",
    targetTags: ["Đơn giản Hóa", "Mục tiêu 9+", "Bảo toàn E & Nguyên tố", "Lấy lại gốc Hóa"],
    successStory: "Hướng dẫn hàng trăm học sinh đạt điểm 9+ môn Hóa, đỗ ĐH Y Hà Nội, ĐH Bách Khoa, Dược Hà Nội.",
    levelPrices: {
      "THCS (Lớp 8-9)": "220.000",
      "THPT (Lớp 10-12)": "300.000",
      "Luyện thi Đại học Y Dược": "450.000"
    },
    trialStats: {
      totalTrials: 45,
      officialEnrolled: 43
    },
    kycStatus: 'approved',
    schedule: ["Thứ 2_Sáng", "Thứ 4_Chiều", "Thứ 6_Tối", "Thứ 7_Tối"]
  },
  {
    id: "t4",
    slug: "thay-truong-cong-kien-sinh-hoc",
    name: "Thầy Trương Công Kiên",
    rolePrefix: "Thầy",
    displayName: "Trương Công Kiên",
    headline: "Sinh học tốc độ tối ưu điểm số",
    shortBio: "8 năm luyện thi trực tuyến với hơn 1000+ điểm 8,9+ mỗi khoá",
    badgeSubject: "Sinh học",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    title: "Chuyên gia Luyện thi Sinh học Khối B & Y Dược",
    rating: 4.9,
    reviews: 175,
    subjects: ["Sinh Học", "Luyện thi Đại học", "Khối B Y Dược"],
    location: "Thanh Xuân, Hà Nội & Online",
    hourlyRate: "200.000 - 380.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0934567890",
    zalo: "0934567890",
    birthYear: "1993",
    experience: "8 năm",
    education: "Đại học Sư Phạm Hà Nội - Khoa Sinh học",
    certificates: ["Bằng Cử nhân Sinh học Xuất sắc", "Top giáo viên luyện thi Khối B uy tín"],
    personality: ["Sôi nổi", "Truyền lửa", "Chiến thuật rõ ràng", "Bám sát đề thi"],
    teachingMethod: "Kỹ thuật giải nhanh Di truyền học và Sinh thái học trong 30 giây. Bấm Casio và áp dụng công thức siêu tốc.",
    philosophy: "Học đúng phương pháp, tốc độ giải đề sẽ tăng gấp đôi và điểm số sẽ tự khắc bứt phá.",
    targetTags: ["Tốc độ tối ưu", "Luyện thi Y Dược Khối B", "Di truyền học Casio", "Mục tiêu 9+"],
    successStory: "Mỗi khóa có hơn 1000+ học viên đạt 8.5 - 10 điểm môn Sinh trong kỳ thi THPT Quốc Gia.",
    levelPrices: {
      "THPT (Lớp 10-12)": "250.000",
      "Luyện thi Khối B Y Dược": "380.000"
    },
    trialStats: {
      totalTrials: 42,
      officialEnrolled: 40
    },
    kycStatus: 'approved',
    schedule: ["Thứ 3_Tối", "Thứ 5_Tối", "Thứ 7_Sáng", "Chủ Nhật_Chiều"]
  },
  {
    id: "t5",
    slug: "co-hoang-yen-ngu-van",
    name: "Cô Hoàng Yến",
    rolePrefix: "Cô",
    displayName: "Hoàng Yến",
    headline: "Văn không lòng vòng bằng tư duy sắc bén",
    shortBio: "9+ năm luyện thi, 12 năm viết và xuất bản sách tham khảo",
    badgeSubject: "Ngữ văn",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
    title: "Tác giả Sách Tham khảo Văn học - 9+ năm luyện thi THPT",
    rating: 5.0,
    reviews: 160,
    subjects: ["Ngữ Văn", "Luyện thi Đại học"],
    location: "Ba Đình, Hoàn Kiếm, Hà Nội & Online",
    hourlyRate: "220.000 - 400.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0968112233",
    zalo: "0968112233",
    birthYear: "1991",
    experience: "9 năm",
    education: "Đại học Sư Phạm Hà Nội - Khoa Ngữ Văn",
    certificates: ["Tác giả 5 đầu sách Văn học tham khảo", "Giáo viên dạy giỏi cấp Tỉnh"],
    personality: ["Sắc sảo", "Ngắn gọn", "Hiện đại", "Kiên nhẫn"],
    teachingMethod: "Rèn luyện tư duy lập luận logic và diễn đạt gãy gọn, sắc sảo. Không viết lan man dài dòng, ghi điểm tuyệt đối ở mở bài và kết bài.",
    philosophy: "Văn chương hiện đại cần sự khúc chiết, cảm xúc chân thực và tư duy phản biện sắc sảo.",
    targetTags: ["Tư duy sắc bén", "Nghị luận xã hội 9+", "Viết văn logic", "Vào 10 & THPT"],
    successStory: "Giúp hàng trăm học sinh từ sợ Văn, không biết viết gì trở nên tự tin viết được bài văn 8+ điểm.",
    levelPrices: {
      "Luyện thi Vào 10": "250.000",
      "Luyện thi Đại học": "380.000"
    },
    trialStats: {
      totalTrials: 36,
      officialEnrolled: 35
    },
    kycStatus: 'approved',
    schedule: ["Thứ 2_Tối", "Thứ 4_Tối", "Thứ 7_Tối", "Chủ Nhật_Sáng"]
  },
  {
    id: "t6",
    slug: "thay-minh-khang-hoa-hoc",
    name: "Thầy Minh Khang",
    rolePrefix: "Thầy",
    displayName: "Minh Khang",
    headline: "Nhẹ nhàng hiểu Hoá",
    shortBio: "Á Khoa trường ĐH Y Dược – ĐHQGHN, Nghiên cứu tại Viện Dược liệu Trung ương",
    badgeSubject: "Hóa học",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    title: "Á Khoa ĐH Y Dược ĐHQGHN - Nghiên cứu viên Viện Dược liệu TW",
    rating: 4.8,
    reviews: 89,
    subjects: ["Hóa Học", "Luyện thi Đại học"],
    location: "Cầu Giấy, Nam Từ Liêm, Hà Nội & Online",
    hourlyRate: "160.000 - 260.000",
    isOnline: true,
    type: "Sinh viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0977223344",
    zalo: "0977223344",
    birthYear: "2001",
    experience: "4 năm",
    education: "Đại học Y Dược - ĐHQGHN - Dược học",
    certificates: ["Á khoa đầu vào ĐH Y Dược ĐHQGHN (Hóa 9.8)", "Giải Nhì HSG Quốc gia môn Hóa"],
    personality: ["Gần gũi", "Tâm lý", "Phương pháp dễ nhớ", "Nhiệt tình"],
    teachingMethod: "Chia nhỏ lý thuyết thành các mẹo ghi nhớ vui nhộn, liên hệ với dược phẩm và đời sống thực tế.",
    philosophy: "Học Hóa không hề áp lực nếu bạn tìm thấy niềm vui trong từng phản ứng.",
    targetTags: ["Nhẹ nhàng hiểu Hóa", "Mẹo nhớ công thức", "Luyện thi Đại học", "Lấy lại căn bản"],
    successStory: "Đã kèm cặp hơn 50 học sinh đạt 8+ môn Hóa trong kỳ thi THPT Quốc Gia.",
    levelPrices: {
      "THCS (Lớp 8-9)": "160.000",
      "THPT (Lớp 10-12)": "220.000",
      "Luyện thi Đại học": "260.000"
    },
    trialStats: {
      totalTrials: 28,
      officialEnrolled: 26
    },
    kycStatus: 'approved',
    schedule: ["Thứ 3_Chiều", "Thứ 5_Tối", "Thứ 7_Sáng", "Chủ Nhật_Chiều"]
  },
  {
    id: "t7",
    slug: "co-thu-ha-sinh-hoc",
    name: "Cô Thu Hà",
    rolePrefix: "Cô",
    displayName: "Thu Hà",
    headline: "Sinh học bài bản từ Thủ khoa Sư phạm",
    shortBio: "Thủ khoa đầu vào, tốt nghiệp Xuất sắc trường ĐHSP HN",
    badgeSubject: "Sinh học",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
    title: "Thủ khoa ĐH Sư Phạm Hà Nội - Giảng dạy Sinh học chuẩn Quốc tế",
    rating: 5.0,
    reviews: 110,
    subjects: ["Sinh Học", "Luyện thi Đại học", "THCS (Lớp 6-9)"],
    location: "Hoàn Kiếm, Hai Bà Trưng, Hà Nội & Online",
    hourlyRate: "200.000 - 350.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0944556677",
    zalo: "0944556677",
    birthYear: "1996",
    experience: "6 năm",
    education: "Đại học Sư Phạm Hà Nội - Khoa Sinh học",
    certificates: ["Thủ khoa tốt nghiệp Xuất sắc ĐH Sư Phạm HN", "Chứng chỉ Sư phạm Quốc tế"],
    personality: ["Tỉ mỉ", "Bài bản", "Kiên nhẫn", "Thân thiện"],
    teachingMethod: "Hệ thống kiến thức từ gốc rễ tế bào học đến sinh thái học bằng sơ đồ hình ảnh trực quan 3D.",
    philosophy: "Học sinh hiểu được bức tranh toàn cảnh của sự sống sẽ học Sinh một cách tự nhiên và say mê.",
    targetTags: ["Bài bản từ gốc", "Mục tiêu 9+", "Sinh học 3D", "Luyện thi Khối B"],
    successStory: "100% học sinh ôn luyện thi THPT đạt điểm trên 8.0 môn Sinh.",
    levelPrices: {
      "THCS (Lớp 6-9)": "200.000",
      "THPT (Lớp 10-12)": "280.000",
      "Luyện thi Đại học": "350.000"
    },
    trialStats: {
      totalTrials: 30,
      officialEnrolled: 29
    },
    kycStatus: 'approved',
    schedule: ["Thứ 2_Chiều", "Thứ 4_Chiều", "Thứ 6_Tối", "Chủ Nhật_Tối"]
  },
  {
    id: "t8",
    slug: "thay-tuan-dung-dia-li",
    name: "Thầy Tuấn Dũng",
    rolePrefix: "Thầy",
    displayName: "Tuấn Dũng",
    headline: "Bản đồ mở khoá môn Địa",
    shortBio: "GV THCS & THPT Thạc sĩ Địa lí Tự nhiên trường ĐH Sư phạm HN",
    badgeSubject: "Địa lí",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    title: "ThS. Địa lí Tự nhiên - ĐH Sư Phạm Hà Nội",
    rating: 4.9,
    reviews: 95,
    subjects: ["Địa Lý", "Luyện thi Đại học"],
    location: "Thanh Xuân, Hà Đông, Hà Nội & Online",
    hourlyRate: "180.000 - 300.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0911889900",
    zalo: "0911889900",
    birthYear: "1994",
    experience: "7 năm",
    education: "Thạc sĩ Địa lý Tự nhiên - ĐH Sư Phạm Hà Nội",
    certificates: ["Bằng Thạc sĩ Địa lý", "Giáo viên dạy giỏi cấp Trường"],
    personality: ["Nhiệt tình", "Gần gũi", "Sáng tạo", "Trách nhiệm"],
    teachingMethod: "Học Địa lý thông qua bản đồ tư duy và hình ảnh thực tế, giúp học sinh nắm chắc 30 câu trắc nghiệm đầu trong 15 phút.",
    philosophy: "Bản đồ là chìa khóa vàng mở ra kho tàng tri thức địa lý.",
    targetTags: ["Bản đồ mở khóa", "Luyện đề thực chiến", "Mục tiêu 9+", "Khối C & D"],
    successStory: "Đã giúp nhiều bạn học sinh đạt điểm 9.5 - 10 môn Địa lý trong kỳ thi tốt nghiệp.",
    levelPrices: {
      "THCS (Lớp 6-9)": "180.000",
      "THPT (Lớp 10-12)": "240.000",
      "Luyện thi Đại học": "300.000"
    },
    trialStats: {
      totalTrials: 25,
      officialEnrolled: 24
    },
    kycStatus: 'approved',
    schedule: ["Thứ 3_Tối", "Thứ 5_Chiều", "Thứ 7_Sáng", "Chủ Nhật_Chiều"]
  },
  {
    id: "t9",
    slug: "hlv-dang-quoc-bao-boi-loi",
    name: "HLV Đặng Quốc Bảo",
    rolePrefix: "HLV",
    displayName: "Quốc Bảo",
    headline: "Tự tin bơi chuẩn kỹ thuật sau 8 buổi",
    shortBio: "Kiện tướng Bơi lội Quốc gia, ĐH SP TDTT, hơn 300 học viên biết bơi an toàn",
    badgeSubject: "Bơi lội",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
    title: "Kiện tướng Bơi lội Quốc gia - HLV Bơi chuyên nghiệp",
    rating: 5.0,
    reviews: 68,
    subjects: ["Bơi lội", "Thể thao", "Kỹ năng sinh tồn"],
    location: "Cầu Giấy, Tây Hồ, Hà Nội",
    hourlyRate: "200.000 - 300.000",
    isOnline: false,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "buổi",
    phone: "0978123456",
    zalo: "0978123456",
    birthYear: "1995",
    experience: "7 năm",
    education: "Đại học Sư phạm Thể dục Thể thao Hà Nội - Khoa Bơi lội",
    certificates: ["Bằng Kiện tướng Bơi lội Quốc gia", "Chứng chỉ Cứu hộ Bơi lội Quốc tế"],
    personality: ["Nhiệt huyết", "Cẩn thận", "Kiên nhẫn với trẻ em", "Kỷ luật"],
    teachingMethod: "Kèm 1-1 trực tiếp dưới nước, cam kết biết bơi ếch, bơi sải đúng kỹ thuật sau 8-10 buổi. Hướng dẫn kỹ năng đứng nước và phòng chống đuối nước.",
    philosophy: "Bơi lội không chỉ là một môn thể thao tăng chiều cao mà là kỹ năng sinh tồn thiết yếu suốt đời.",
    targetTags: ["Cam kết biết bơi", "Bơi ếch & Bơi sải", "Trẻ em từ 5 tuổi", "Kỹ năng đứng nước"],
    successStory: "Đã huấn luyện hơn 300 học viên từ sợ nước trở nên tự tin bơi lội an toàn.",
    levelPrices: {
      "Trẻ em (5-12 tuổi)": "200.000",
      "Người lớn cơ bản": "250.000",
      "Bơi nâng cao (Bướm/Ngửa)": "300.000"
    },
    trialStats: {
      totalTrials: 32,
      officialEnrolled: 31
    },
    kycStatus: 'approved',
    schedule: ["Thứ 2_Chiều", "Thứ 4_Chiều", "Thứ 6_Chiều", "Thứ 7_Sáng", "Chủ Nhật_Sáng"]
  },
  {
    id: "t10",
    slug: "co-le-thao-my-piano-guitar",
    name: "Cô Lê Thảo My",
    rolePrefix: "Cô",
    displayName: "Thảo My",
    headline: "Làm chủ Piano & Cảm thụ âm nhạc",
    shortBio: "Thủ khoa Piano Học viện Âm nhạc QGVN, chứng chỉ Quốc tế ABRSM Grade 8",
    badgeSubject: "Đàn Piano",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    title: "Thủ khoa Piano - Học viện Âm nhạc Quốc gia Việt Nam",
    rating: 5.0,
    reviews: 79,
    subjects: ["Đàn Piano", "Đàn Guitar", "Thanh nhạc / Hát"],
    location: "Hoàn Kiếm, Ba Đình, Hà Nội & Online",
    hourlyRate: "250.000 - 400.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0936789012",
    zalo: "0936789012",
    birthYear: "1998",
    experience: "6 năm",
    education: "Học viện Âm nhạc Quốc gia Việt Nam - Khoa Piano",
    certificates: ["Chứng chỉ Âm nhạc Quốc tế ABRSM Grade 8", "Giải Nhất Festival Piano Hà Nội 2022"],
    personality: ["Nghệ sĩ", "Truyền cảm hứng", "Dịu dàng", "Kiên nhẫn"],
    teachingMethod: "Phương pháp cảm thụ âm nhạc hiện đại, kết hợp thị tấu nốt nhạc và chơi các bản nhạc yêu thích ngay từ những buổi đầu.",
    philosophy: "Mỗi nốt nhạc là một cung bậc cảm xúc, âm nhạc giúp tâm hồn luôn tươi sáng và thư thái.",
    targetTags: ["Piano cổ điển & Cover", "ABRSM Grade 1-8", "Trẻ em từ 4 tuổi", "Guitar đệm hát"],
    successStory: "100% học viên tham gia thi chứng chỉ ABRSM đạt loại Merit và Distinction.",
    levelPrices: {
      "Piano cơ bản / Vỡ lòng": "250.000",
      "Piano đệm hát / Cover": "300.000",
      "Luyện thi ABRSM Quốc tế": "400.000"
    },
    trialStats: {
      totalTrials: 28,
      officialEnrolled: 27
    },
    kycStatus: 'approved',
    schedule: ["Thứ 2_Tối", "Thứ 4_Tối", "Thứ 6_Tối", "Thứ 7_Sáng", "Chủ Nhật_Chiều"]
  },
  {
    id: "t11",
    slug: "hlv-vu-hoang-long-taekwondo-vo-thuat",
    name: "HLV Vũ Hoàng Long",
    rolePrefix: "HLV",
    displayName: "Hoàng Long",
    headline: "Võ thuật tự vệ & Thể lực vượt trội",
    shortBio: "Huyền đai Đệ Tứ đẳng Taekwondo Quốc tế Kukkiwon, 8 năm huấn luyện tự vệ",
    badgeSubject: "Võ thuật",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
    title: "Huyền đai Đệ Tứ đẳng Taekwondo - HLV Võ thuật & Tự vệ",
    rating: 4.9,
    reviews: 52,
    subjects: ["Võ thuật (Taekwondo / Karate / Tự vệ)", "Thể thao", "Kỹ năng sống"],
    location: "Đống Đa, Thanh Xuân, Hà Nội",
    hourlyRate: "180.000 - 280.000",
    isOnline: false,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "buổi",
    phone: "0982345678",
    zalo: "0982345678",
    birthYear: "1993",
    experience: "8 năm",
    education: "Đại học Thể dục Thể thao - Chuyên ngành Võ thuật",
    certificates: ["Huyền đai Đệ Tứ đẳng Quốc Tế Kukkiwon", "Trọng tài Quốc gia Taekwondo"],
    personality: ["Nghiêm túc", "Truyền cảm hứng", "Mạnh mẽ", "Tận tâm"],
    teachingMethod: "Rèn luyện thể lực, phản xạ tự vệ thực chiến và tinh thần võ đạo.",
    philosophy: "Học võ để rèn luyện ý chí kiên cường, bảo vệ bản thân và tôn trọng mọi người xung quanh.",
    targetTags: ["Võ tự vệ thực chiến", "Rèn luyện thể lực", "Trẻ em & Nữ giới", "Thi thăng đai"],
    successStory: "Đào tạo nhiều học viên đạt huy chương tại các giải võ thuật mở rộng Hà Nội.",
    levelPrices: {
      "Vỡ lòng / Thiếu nhi": "180.000",
      "Võ tự vệ cấp tốc": "220.000",
      "Luyện thi đai đen": "280.000"
    },
    trialStats: {
      totalTrials: 20,
      officialEnrolled: 19
    },
    kycStatus: 'approved',
    schedule: ["Thứ 3_Tối", "Thứ 5_Tối", "Thứ 7_Chiều", "Chủ Nhật_Chiều"]
  },
  {
    id: "t12",
    slug: "thay-nguyen-thanh-chung-my-thuat-ve",
    name: "Thầy Nguyễn Thành Chung",
    rolePrefix: "Thầy",
    displayName: "Thành Chung",
    headline: "Bản đồ mở khóa Hội họa & Tư duy màu",
    shortBio: "Họa sĩ, Giảng viên ĐH Mỹ thuật VN, hướng dẫn hơn 25 học sinh đỗ ĐH Kiến Trúc",
    badgeSubject: "Hội họa",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop",
    title: "Họa sĩ - Giảng viên ĐH Mỹ thuật Việt Nam",
    rating: 4.8,
    reviews: 41,
    subjects: ["Vẽ / Hội họa", "Năng khiếu Nghệ thuật", "Luyện thi Khối V - H"],
    location: "Thanh Xuân, Hà Nội & Online",
    hourlyRate: "180.000 - 300.000",
    isOnline: true,
    type: "Giáo viên",
    providerType: "1-1",
    priceUnit: "buổi",
    phone: "0945123789",
    zalo: "0945123789",
    birthYear: "1991",
    experience: "9 năm",
    education: "Đại học Mỹ thuật Việt Nam - Chuyên ngành Hội họa",
    certificates: ["Bằng Cử nhân Hội họa Xuất sắc", "Hội viên Hội Mỹ thuật Hà Nội"],
    personality: ["Sáng tạo", "Cởi mở", "Khơi gợi trí tưởng tượng", "Tỉ mỉ"],
    teachingMethod: "Phát triển tư duy hình khối, màu sắc và phối cảnh. Hướng dẫn từ màu nước, màu sáp, chì than đến sơn dầu và vẽ kỹ thuật số.",
    philosophy: "Hội họa là ngôn ngữ của thị giác, nơi mọi ý tưởng độc đáo đều có thể tỏa sáng.",
    targetTags: ["Vẽ tranh sáng tạo", "Luyện thi Kiến trúc / Mỹ thuật", "Màu nước & Sơn dầu", "Digital Art"],
    successStory: "Đã dìu dắt hơn 25 học sinh đỗ vào ĐH Kiến Trúc, ĐH Mỹ Thuật Công Nghiệp.",
    levelPrices: {
      "Hội họa thiếu nhi": "180.000",
      "Vẽ màu nước / Sơn dầu": "220.000",
      "Luyện thi Khối V, H": "300.000"
    },
    trialStats: {
      totalTrials: 16,
      officialEnrolled: 15
    },
    kycStatus: 'approved',
    schedule: ["Thứ 3_Chiều", "Thứ 5_Chiều", "Thứ 7_Tối", "Chủ Nhật_Sáng"]
  },
  {
    id: "t13",
    slug: "thay-do-minh-tri-lap-trinh-co-vua",
    name: "Thầy Đỗ Minh Trí",
    rolePrefix: "Thầy",
    displayName: "Minh Trí",
    headline: "Lập trình nhí & Tư duy chiến thuật Cờ vua",
    shortBio: "Kỹ sư CNTT ĐH Công nghệ ĐHQGHN, Vận động viên Cờ vua cấp 1 Quốc gia",
    badgeSubject: "Lập trình",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
    title: "Kỹ sư Phần mềm - HLV Cờ vua & Lập trình nhí",
    rating: 4.9,
    reviews: 63,
    subjects: ["Lập trình (Python / Web / Scratch)", "Cờ vua / Cờ tướng", "Tin Học"],
    location: "Nam Từ Liêm, Hà Nội & Online",
    hourlyRate: "160.000 - 250.000",
    isOnline: true,
    type: "Sinh viên",
    providerType: "1-1",
    priceUnit: "giờ",
    phone: "0968345912",
    zalo: "0968345912",
    birthYear: "2002",
    experience: "3 năm",
    education: "Đại học Công nghệ ĐHQGHN - Khoa Công nghệ Thông tin",
    certificates: ["Giải Nhất Olympic Tin học Sinh viên", "Vận động viên Cờ vua cấp 1 Quốc gia"],
    personality: ["Thông minh", "Hài hước", "Kiên nhẫn", "Dạy dễ hiểu"],
    teachingMethod: "Dạy lập trình qua việc làm game thực tế (Scratch, Python, Web HTML/CSS/JS) và dạy tư duy chiến thuật cờ vua logic.",
    philosophy: "Học lập trình và cờ vua giúp rèn luyện tư duy giải quyết vấn đề vượt trội cho thế hệ trẻ.",
    targetTags: ["Lập trình Scratch & Python", "Cờ vua từ vỡ lòng", "Tư duy logic", "Lập trình Web"],
    successStory: "Nhiều học sinh đạt giải Cờ vua cấp trường/quận và tự tay lập trình được game 2D sau 3 tháng.",
    levelPrices: {
      "Cờ vua cơ bản": "160.000",
      "Lập trình Scratch nhí": "180.000",
      "Lập trình Python / Web": "250.000"
    },
    trialStats: {
      totalTrials: 22,
      officialEnrolled: 21
    },
    kycStatus: 'approved',
    schedule: ["Thứ 2_Tối", "Thứ 4_Tối", "Thứ 7_Sáng", "Chủ Nhật_Tối"]
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



