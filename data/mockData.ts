// ===== MOCK DATA — EDUCONNECT PLATFORM =====

export type CategoryType = 'academic' | 'arts' | 'sports' | 'it' | 'language' | 'softskill';

export interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  studentName: string;
  description: string;
  imageUrl?: string;
  year: string;
}

export interface ClassModel {
  id: string;
  title: string;
  subject: string;
  goal: string;
  teacherName?: string;
  price: number;
  schedule: string;
}

export interface Instructor {
  isCenter?: boolean;
  classes?: ClassModel[];
  id: number;
  name: string;
  avatar: string;
  avatarBg: string;
  avatarUrl: string;
  subjects: string[];
  skills: string[];
  categoryType: CategoryType;
  levels: string[];
  price: number;
  location: string;
  district: string;
  ward: string;
  address: string;
  online: boolean;
  rating: number;
  reviewCount: number;
  experience: number;
  education: string;
  bio: string;
  studentCount: number;
  intro: string;
  schedule: string[];
  featured: boolean;
  certificates: string[];
  verified: boolean;
  reviews: Review[];
  achievements?: Achievement[];
}

export interface Learner {
  id: number;
  name: string;
  avatar: string;
  avatarBg: string;
  level: string;
  categoryType: CategoryType;
  subjects: string[];
  skills: string[];
  location: string;
  district: string;
  ward: string;
  address: string;
  online: boolean;
  budget: number;
  schedule: string[];
  description: string;
  posted: string;
  urgent: boolean;
}

export interface Booking {
  id: number;
  personName: string;
  personAvatar: string;
  personBg: string;
  skill: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
}

export interface Message {
  id: number;
  name: string;
  avatar: string;
  avatarBg: string;
  last: string;
  time: string;
  unread: boolean;
}

// ===== CATEGORIES =====
export const CATEGORY_MAP: Record<CategoryType, { label: string; icon: string; color: string }> = {
  academic: { label: 'Học thuật', icon: 'school', color: '#2E6FD8' },
  arts: { label: 'Nghệ thuật', icon: 'color-palette', color: '#E85D75' },
  sports: { label: 'Thể thao', icon: 'fitness', color: '#F59E0B' },
  it: { label: 'Công nghệ', icon: 'code-slash', color: '#7C3AED' },
  language: { label: 'Ngôn ngữ', icon: 'language', color: '#0EA5E9' },
  softskill: { label: 'Kỹ năng mềm', icon: 'people', color: '#10B981' },
};

// ===== INSTRUCTORS =====
export const INSTRUCTORS: Instructor[] = [
  {
    id: 1,
    name: 'Nguyễn Thị Lan Anh',
    avatar: 'L',
    avatarBg: '#2E6FD8',
    avatarUrl: 'https://i.pravatar.cc/300?img=1',
    subjects: ['Toán', 'Vật lý'],
    skills: ['Luyện thi đại học', 'Bồi dưỡng HSG'],
    categoryType: 'academic',
    levels: ['Lớp 6–9 (THCS)', 'Lớp 10–12 (THPT)'],
    price: 150000,
    location: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Phường Dịch Vọng Hậu',
    address: '25 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy',
    online: true,
    rating: 4.9,
    reviewCount: 87,
    experience: 5,
    education: 'Thạc sĩ Toán — ĐH Sư Phạm HN',
    bio: 'Giáo viên Toán–Lý với 5 năm kinh nghiệm. Từng giảng dạy tại THPT Chu Văn An. Phương pháp trực quan, chú trọng nền tảng tư duy.',
    studentCount: 142,
    intro: 'Mỗi học sinh đều có tiềm năng học tốt Toán nếu được định hướng đúng phương pháp.',
    schedule: ['Thứ 2', 'Thứ 4', 'Thứ 6', 'Chủ nhật'],
    featured: true,
    certificates: ['Thạc sĩ Toán học', 'Chứng chỉ Nghiệp vụ Sư phạm', 'IELTS 7.0'],
    verified: true,
    reviews: [
      { id: 101, author: 'Phụ huynh Bảo', avatar: 'P', rating: 5, comment: 'Cô Lan Anh dạy rất tận tâm, con tiến bộ rõ rệt sau 2 tháng. Điểm Toán từ 6 lên 9.', date: '10/06/2026' },
      { id: 102, author: 'Trần Quốc Bảo', avatar: 'B', rating: 5, comment: 'Cô giải thích rất dễ hiểu, phương pháp trực quan giúp em hiểu sâu bài hơn.', date: '05/06/2026' },
      { id: 103, author: 'Phụ huynh Minh', avatar: 'M', rating: 4, comment: 'Con học với cô đã 6 tháng, cải thiện rõ rệt. Rất hài lòng.', date: '01/06/2026' },
    ],
    achievements: [
      { id: 'a1', title: 'Huy chương Bạc Toán Quốc gia', studentName: 'Trần Quốc Bảo', description: 'Đạt giải Nhì kì thi HSG Quốc gia môn Toán.', year: '2025' },
      { id: 'a2', title: 'Thủ khoa Toán', studentName: 'Nguyễn Minh Tuấn', description: 'Đạt 9.8 điểm môn Toán kì thi THPT Quốc gia.', year: '2024' }
    ],
  },
  {
    id: 2,
    name: 'Trần Minh Hùng',
    avatar: 'H',
    avatarBg: '#0EA5E9',
    avatarUrl: 'https://i.pravatar.cc/300?img=3',
    subjects: ['Tiếng Anh'],
    skills: ['IELTS', 'TOEIC', 'Giao tiếp'],
    categoryType: 'language',
    levels: ['Lớp 6–9 (THCS)', 'Lớp 10–12 (THPT)', 'Đại học', 'Người đi làm'],
    price: 200000,
    location: 'Hà Nội',
    district: 'Đống Đa',
    ward: 'Phường Trung Liệt',
    address: '88 Thái Hà, Trung Liệt, Đống Đa',
    online: true,
    rating: 4.8,
    reviewCount: 124,
    experience: 7,
    education: 'Cử nhân Ngôn ngữ Anh — ĐH Hà Nội',
    bio: 'IELTS 8.5. Chuyên luyện thi IELTS, TOEIC và tiếng Anh giao tiếp. Hơn 200 học viên đã đạt mục tiêu các kỳ thi quốc tế.',
    studentCount: 216,
    intro: 'Tiếng Anh là công cụ — tôi giúp bạn làm chủ nó.',
    schedule: ['Thứ 3', 'Thứ 5', 'Thứ 7'],
    featured: true,
    certificates: ['IELTS 8.5', 'Cử nhân Ngôn ngữ Anh', 'TESOL Certificate'],
    verified: true,
    reviews: [
      { id: 201, author: 'Lê Thu Trang', avatar: 'T', rating: 5, comment: 'Thầy Hùng dạy IELTS rất bài bản, em đã đạt 7.0 sau 3 tháng ôn.', date: '12/06/2026' },
      { id: 202, author: 'Nguyễn Phương', avatar: 'P', rating: 5, comment: 'TOEIC lên 850 nhờ phương pháp dạy của thầy. Rất recommend!', date: '08/06/2026' },
      { id: 203, author: 'Hoàng Anh', avatar: 'A', rating: 4, comment: 'Thầy kiên nhẫn, giải thích kỹ. Em tiến bộ rõ rệt speaking.', date: '02/06/2026' },
    ],
  },
  {
    id: 3,
    name: 'Lê Thanh Tùng',
    avatar: 'T',
    avatarBg: '#E85D75',
    avatarUrl: 'https://i.pravatar.cc/300?img=5',
    subjects: ['Piano', 'Keyboard'],
    skills: ['Lý thuyết âm nhạc', 'Hòa âm', 'Biểu diễn'],
    categoryType: 'arts',
    levels: ['Cơ bản', 'Trung cấp', 'Nâng cao'],
    price: 250000,
    location: 'TP.HCM',
    district: 'Quận 3',
    ward: 'Phường Võ Thị Sáu',
    address: '120 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3',
    online: true,
    rating: 4.9,
    reviewCount: 68,
    experience: 8,
    education: 'Cử nhân Biểu diễn Piano — Nhạc viện TP.HCM',
    bio: 'Nghệ sĩ Piano với 8 năm giảng dạy. Từng biểu diễn tại nhiều sự kiện lớn. Phương pháp giảng dạy linh hoạt từ cổ điển đến hiện đại.',
    studentCount: 95,
    intro: 'Âm nhạc là ngôn ngữ của tâm hồn — hãy để tôi giúp bạn diễn đạt nó.',
    schedule: ['Thứ 2', 'Thứ 4', 'Thứ 6', 'Chủ nhật'],
    featured: true,
    certificates: ['Cử nhân Biểu diễn Piano', 'ABRSM Grade 8', 'Chứng chỉ Sư phạm Âm nhạc'],
    verified: true,
    reviews: [
      { id: 301, author: 'Minh Châu', avatar: 'C', rating: 5, comment: 'Thầy Tùng dạy Piano rất kiên nhẫn, giờ em đã chơi được nhiều bản nhạc yêu thích.', date: '05/06/2026' },
      { id: 302, author: 'PH bé Hana', avatar: 'H', rating: 5, comment: 'Con gái học Piano với thầy 1 năm, đã đạt ABRSM Grade 3. Rất tốt!', date: '01/06/2026' },
      { id: 303, author: 'Thanh Ngân', avatar: 'N', rating: 4, comment: 'Thầy dạy rất chuyên nghiệp, phương pháp phù hợp với người mới bắt đầu.', date: '25/05/2026' },
    ],

  }
];

// ===== LEARNERS =====
export const LEARNERS: Learner[] = [
  {
    id: 1,
    name: 'Trần Quốc Bảo',
    avatar: 'B',
    avatarBg: '#2E6FD8',
    level: 'Lớp 11',
    categoryType: 'academic',
    subjects: ['Toán', 'Vật lý'],
    skills: ['Luyện thi đại học'],
    location: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Phường Nghĩa Đô',
    address: '12 Nghĩa Đô, Cầu Giấy',
    online: true,
    budget: 150000,
    schedule: ['Thứ 3', 'Thứ 5', 'Thứ 7'],
    description: 'Học sinh lớp 11 cần ôn tập chuẩn bị thi học kỳ. Tìm giáo viên Toán–Lý kiên nhẫn, có thể dạy online.',
    posted: '2 giờ trước',
    urgent: true,
  },
  {
    id: 2,
    name: 'Nguyễn Minh Châu',
    avatar: 'C',
    avatarBg: '#E85D75',
    level: 'Người lớn',
    categoryType: 'arts',
    subjects: ['Piano'],
    skills: ['Biểu diễn cơ bản'],
    location: 'TP.HCM',
    district: 'Quận 3',
    ward: 'Phường Võ Thị Sáu',
    address: '88 Lý Chính Thắng, Quận 3',
    online: false,
    budget: 250000,
    schedule: ['Thứ 7', 'Chủ nhật'],
    description: 'Muốn học Piano cơ bản, có thể tự chơi những bản nhạc đơn giản. Ưu tiên giáo viên nữ, dạy tại nhà.',
    posted: '5 giờ trước',
    urgent: false,
  },
  {
    id: 3,
    name: 'Phạm Thị Lan',
    avatar: 'L',
    avatarBg: '#7C3AED',
    level: 'Sinh viên ĐH năm 2',
    categoryType: 'it',
    subjects: ['Lập trình Python'],
    skills: ['Data Science', 'Machine Learning'],
    location: 'TP.HCM',
    district: 'Quận 1',
    ward: 'Phường Bến Thành',
    address: '15 Lê Lợi, Bến Thành, Quận 1',
    online: true,
    budget: 300000,
    schedule: ['Thứ 7', 'Chủ nhật'],
    description: 'Sinh viên ngành CNTT cần mentor hướng dẫn Data Science và Machine Learning. Ưu tiên học theo dự án thực tế.',
    posted: '1 ngày trước',
    urgent: false,

  }
];

// ===== BOOKINGS =====
export const LEARNER_BOOKINGS: Booking[] = [
  {
    id: 1,
    personName: 'Nguyễn Thị Lan Anh',
    personAvatar: 'L',
    personBg: '#2E6FD8',
    skill: 'Toán',
    date: '22/06/2026',
    time: '19:00 – 21:00',
    type: 'Online',
    status: 'confirmed',
    price: 300000,
  },
  {
    id: 2,
    personName: 'Lê Thanh Tùng',
    personAvatar: 'T',
    personBg: '#E85D75',
    skill: 'Piano',
    date: '24/06/2026',
    time: '18:00 – 19:30',
    type: 'Tại nhà',
    status: 'pending',
    price: 375000,
  },
  {
    id: 3,
    personName: 'Nguyễn Đức Mạnh',
    personAvatar: 'M',
    personBg: '#F59E0B',
    skill: 'Bơi lội',
    date: '15/06/2026',
    time: '07:00 – 08:30',
    type: 'Trực tiếp',
    status: 'completed',
    price: 270000,
  },
];

export const INSTRUCTOR_BOOKINGS: Booking[] = [
  {
    id: 1,
    personName: 'Trần Quốc Bảo',
    personAvatar: 'B',
    personBg: '#2E6FD8',
    skill: 'Toán',
    date: '22/06/2026',
    time: '19:00 – 21:00',
    type: 'Online',
    status: 'confirmed',
    price: 300000,
  },
  {
    id: 2,
    personName: 'Nguyễn Minh Châu',
    personAvatar: 'C',
    personBg: '#E85D75',
    skill: 'Piano',
    date: '25/06/2026',
    time: '17:00 – 18:30',
    type: 'Tại nhà',
    status: 'pending',
    price: 375000,
  },
  {
    id: 3,
    personName: 'Hoàng Anh Khoa',
    personAvatar: 'K',
    personBg: '#F59E0B',
    skill: 'Bơi lội',
    date: '18/06/2026',
    time: '07:00 – 08:30',
    type: 'Trực tiếp',
    status: 'completed',
    price: 270000,
  },
];

// ===== MESSAGES =====
export const LEARNER_MESSAGES: Message[] = [
  { id: 1, name: 'Nguyễn Thị Lan Anh', avatar: 'L', avatarBg: '#2E6FD8', last: 'Thứ 4 tối này mình dạy em nhé!', time: '10:30', unread: true },
  { id: 2, name: 'Lê Thanh Tùng', avatar: 'T', avatarBg: '#E85D75', last: 'Bài Piano tuần này em tập phần nào?', time: 'Hôm qua', unread: false },
  { id: 3, name: 'Nguyễn Đức Mạnh', avatar: 'M', avatarBg: '#F59E0B', last: 'Buổi bơi cuối tuần lúc 7h nhé!', time: 'Thứ 2', unread: false },
];

export const INSTRUCTOR_MESSAGES: Message[] = [
  { id: 1, name: 'Trần Quốc Bảo', avatar: 'B', avatarBg: '#2E6FD8', last: 'Thầy ơi tối thứ 4 có dạy không ạ?', time: '10:45', unread: true },
  { id: 2, name: 'Nguyễn Minh Châu', avatar: 'C', avatarBg: '#E85D75', last: 'Em muốn đăng ký thêm buổi Piano ạ', time: 'Hôm qua', unread: false },
  { id: 3, name: 'Hoàng Anh Khoa', avatar: 'K', avatarBg: '#F59E0B', last: 'Thầy cho em lịch bơi tuần tới ạ', time: 'Thứ 3', unread: true },
];

// ===== REVIEWS (legacy - kept for backward compatibility) =====
export const REVIEWS: Review[] = [
  { id: 1, author: 'Phụ huynh Bảo', avatar: 'P', rating: 5, comment: 'Cô Lan Anh dạy rất tận tâm, con tiến bộ rõ rệt sau 2 tháng.', date: '10/06/2026' },
  { id: 2, author: 'Minh Châu', avatar: 'C', rating: 5, comment: 'Thầy Tùng dạy Piano rất kiên nhẫn, giờ em đã chơi được nhiều bản nhạc yêu thích.', date: '05/06/2026' },
  { id: 3, author: 'Anh Khoa', avatar: 'K', rating: 4, comment: 'HLV Mạnh chuyên nghiệp, sau 1 tháng mình đã bơi được 50m.', date: '01/06/2026' },
];

// ===== DEMO ACCOUNTS =====
export const DEMO_ACCOUNTS = [
  {
    email: 'hocvien@demo.com',
    password: '123456',
    role: 'learner' as const,
    name: 'Trần Quốc Bảo',
    level: 'Lớp 11',
    skills: ['Toán', 'Vật lý'],
    location: 'Hà Nội',
    avatar: 'B',
    avatarBg: '#2E6FD8',
  },
  {
    email: 'giangvien@demo.com',
    password: '123456',
    role: 'instructor' as const,
    name: 'Nguyễn Thị Lan Anh',
    skills: ['Toán', 'Vật lý'],
    price: 150000,
    rating: 4.9,
    studentCount: 142,
    location: 'Hà Nội',
    avatar: 'L',
    avatarBg: '#2E6FD8',
  },
];

// ===== CONSTANTS =====
export const SUBJECTS = [
  'Toán', 'Vật lý', 'Hóa học', 'Sinh học', 'Tiếng Anh',
  'Tiếng Nhật', 'Tiếng Hàn', 'Lập trình Python', 'Web Development',
  'Piano', 'Guitar', 'Vẽ', 'Bơi lội', 'Yoga', 'Thuyết trình', 'Giao tiếp',
];

export const CATEGORY_SUBJECTS: Record<CategoryType, string[]> = {
  academic: ['Toán', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ Văn', 'Lịch sử', 'Địa lý'],
  arts: ['Piano', 'Guitar', 'Vẽ', 'Múa', 'Thanh nhạc'],
  sports: ['Bơi lội', 'Yoga', 'Bóng rổ', 'Cờ vua', 'Võ thuật'],
  it: ['Lập trình Python', 'Web Development', 'Thiết kế đồ hoạ', 'Data Science'],
  language: ['Tiếng Anh', 'Tiếng Nhật', 'Tiếng Hàn', 'Tiếng Trung', 'Tiếng Pháp'],
  softskill: ['Thuyết trình', 'Giao tiếp', 'Lãnh đạo', 'Quản lý thời gian'],
};

export const LEVELS = ['Cấp 2', 'Cấp 3', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
export const CITIES = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

// ===== WARD DATA =====
export const WARDS: Record<string, string[]> = {
  'Cầu Giấy': ['Phường Dịch Vọng Hậu', 'Phường Nghĩa Đô', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa'],
  'Đống Đa': ['Phường Trung Liệt', 'Phường Khâm Thiên', 'Phường Ô Chợ Dừa', 'Phường Láng Hạ', 'Phường Thịnh Quang'],
  'Thanh Xuân': ['Phường Nhân Chính', 'Phường Thanh Xuân Trung', 'Phường Thanh Xuân Bắc', 'Phường Khương Đình'],
  'Hoàng Mai': ['Phường Hoàng Văn Thụ', 'Phường Định Công', 'Phường Giáp Bát', 'Phường Mai Động'],
  'Ba Đình': ['Phường Ngọc Hà', 'Phường Kim Mã', 'Phường Giảng Võ', 'Phường Liễu Giai'],
  'Hai Bà Trưng': ['Phường Bách Khoa', 'Phường Lê Đại Hành', 'Phường Thanh Nhàn', 'Phường Đồng Nhân'],
  'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Đa Kao', 'Phường Nguyễn Thái Bình'],
  'Quận 3': ['Phường Võ Thị Sáu', 'Phường 6', 'Phường 9', 'Phường 14'],
  'Quận 7': ['Phường Tân Phong', 'Phường Tân Hưng', 'Phường Phú Thuận', 'Phường Tân Kiểng'],
  'Bình Thạnh': ['Phường 25', 'Phường 1', 'Phường 2', 'Phường 7', 'Phường 11'],
  'Hải Châu': ['Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Hải Châu 1', 'Phường Hòa Cường Bắc'],
  'Sơn Trà': ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường Phước Mỹ', 'Phường Thọ Quang'],
};

export const DISTRICTS: Record<string, string[]> = {
  'Hà Nội': ['Cầu Giấy', 'Đống Đa', 'Thanh Xuân', 'Hoàng Mai', 'Ba Đình', 'Hai Bà Trưng', 'Hoàn Kiếm', 'Long Biên', 'Tây Hồ'],
  'TP.HCM': ['Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Thủ Đức', 'Gò Vấp', 'Tân Bình', 'Phú Nhuận'],
  'Đà Nẵng': ['Hải Châu', 'Sơn Trà', 'Thanh Khê', 'Ngũ Hành Sơn', 'Liên Chiểu'],
  'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn'],
  'Hải Phòng': ['Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Hải An'],
};

export const formatPrice = (price: number): string =>
  price.toLocaleString('vi-VN') + 'đ';

// Generate 10 new random instructors/centers
const randomNames = ['Trung tâm Lập trình CodeZ', 'CLB Võ thuật MMA Sài Gòn', 'Học viện Cờ Vua Kiện Tướng', 'Lớp vẽ Cô Hạnh', 'Trung tâm Kỹ năng Mềm LifePro', 'Gia sư Tiếng Nhật Sakura', 'Trung tâm Yoga Thiền Tâm', 'Lớp học Thiết kế Đồ Họa Cấp Tốc', 'Gia sư Kinh Tế Vi Mô Thầy Hoàng', 'Trung tâm Âm Nhạc Giai Điệu Vàng'];
const randomCategories: CategoryType[] = ['it', 'sports', 'academic', 'arts', 'softskill', 'language', 'sports', 'it', 'academic', 'arts'];
const randomSubjects = [['Lập trình C++', 'Python'], ['Muay Thái', 'Kickboxing'], ['Cờ vua'], ['Vẽ màu nước', 'Luyện thi khối H'], ['Giao tiếp', 'Thuyết trình'], ['Tiếng Nhật N4', 'Tiếng Nhật N5'], ['Yoga', 'Thiền'], ['Photoshop', 'Illustrator'], ['Kinh tế vi mô', 'Xác suất'], ['Piano', 'Thanh nhạc']];

for (let i = 0; i < 10; i++) {
  INSTRUCTORS.push({
    id: 100 + i,
    name: randomNames[i],
    avatar: randomNames[i].charAt(0),
    avatarBg: CATEGORY_MAP[randomCategories[i]].color,
    avatarUrl: `https://i.pravatar.cc/300?img=${40 + i}`,
    subjects: randomSubjects[i],
    skills: ['Cơ bản', 'Nâng cao'],
    categoryType: randomCategories[i],
    levels: ['Người đi làm', 'Đại học', 'Cơ bản'],
    price: 200000 + i * 50000,
    location: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Phường Quan Hoa',
    address: 'Số 10, Ngõ 20',
    online: i % 2 === 0,
    rating: 4.8 + (i % 3) * 0.1,
    reviewCount: 20 + i * 15,
    experience: 3 + i,
    education: 'Đại học Chuyên Ngành',
    bio: `Tự hào là đơn vị/cá nhân đào tạo hàng đầu trong lĩnh vực ${randomSubjects[i].join(', ')}.`,
    studentCount: 100 + i * 20,
    intro: `Học ${randomSubjects[i][0]} không khó, đã có chúng tôi!`,
    schedule: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    featured: i % 3 === 0,
    certificates: ['Chứng chỉ Giảng dạy', 'Bằng cấp Chuyên môn'],
    verified: true,
    reviews: [],
    isCenter: randomNames[i].toLowerCase().includes('trung tâm') || randomNames[i].toLowerCase().includes('học viện') || randomNames[i].toLowerCase().includes('clb'),
  });
}

// Auto-generate classes for all instructors/centers
INSTRUCTORS.forEach(inst => {
  if (inst.id === 5 || inst.id === 15) {
    inst.isCenter = true;
    inst.name = inst.id === 5 ? 'Trung Tâm Anh Ngữ Apex' : 'Học Viện Nghệ Thuật ABC';
  }

  inst.classes = [];
  const classCount = inst.isCenter ? 4 : 2;
  const goals = ['Luyện thi chuyên', 'Đại học 8+', 'Mất gốc', 'Lấy lại căn bản', 'Nâng cao', 'Cơ bản', 'Giao tiếp'];
  
  for (let i = 0; i < classCount; i++) {
    const subject = inst.subjects[i % inst.subjects.length] || inst.subjects[0] || 'Khác';
    const goal = goals[(inst.id + i) % goals.length];
    const price = inst.price + (i * 20000);
    const schedule1 = inst.schedule[i % inst.schedule.length] || 'Thứ 2';
    const schedule2 = inst.schedule[(i + 1) % inst.schedule.length] || 'Thứ 4';
    
    inst.classes.push({
      id: `${inst.id}-c${i}`,
      title: `Lớp ${subject} - ${goal}`,
      subject: subject,
      goal: goal,
      teacherName: inst.isCenter ? `GV. Nguyễn Văn ${String.fromCharCode(65 + i)}` : inst.name,
      price: price,
      schedule: `${schedule1} & ${schedule2}`
    });
  }
});
