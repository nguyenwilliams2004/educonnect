-- Bảng Users: Chứa thông tin đăng nhập và phân quyền cơ bản (liên kết với Auth của Supabase)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'center')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bảng Profiles: Chứa hồ sơ chi tiết của giáo viên/trung tâm để hiển thị lên app
CREATE TABLE profiles (
  id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  avatar_url TEXT,
  subjects TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  category_type TEXT,
  provider_type TEXT, -- '1-1' | 'class' (v2)
  target_tags TEXT[] DEFAULT '{}', -- Thẻ mục tiêu (v2)
  success_story TEXT, -- Câu chuyện thành công (v2)
  levels TEXT[] DEFAULT '{}',
  price INTEGER DEFAULT 0,
  price_unit TEXT DEFAULT 'giờ', -- 'giờ' | 'tháng'
  location TEXT,
  district TEXT,
  ward TEXT,
  address TEXT,
  online BOOLEAN DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  experience INTEGER DEFAULT 0,
  education TEXT,
  bio TEXT,
  intro TEXT,
  schedule TEXT[] DEFAULT '{}',
  certificates TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  -- Thông tin ngân hàng để nhận 70% học phí
  bank_name TEXT,                -- Tên ngân hàng (VD: Vietcombank, MB Bank...)
  bank_account_number TEXT,      -- Số tài khoản
  bank_account_name TEXT,        -- Tên chủ tài khoản (in hoa, không dấu)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bảng Achievements: Chứa thành tích bảng vàng của các giáo viên/trung tâm
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bảng Enrollments: Lưu thông tin đặt lịch học thử và nhập học (Booking qua nền tảng)
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Phụ huynh/học viên đăng nhập
  class_title TEXT, -- Tên lớp hoặc tên môn muốn học
  student_name TEXT NOT NULL,
  student_age TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  note TEXT,
  status TEXT DEFAULT 'trial_booked', -- trial_booked | trial_completed | enrolled | not_enrolled | changed_tutor
  trial_date TEXT, -- Lịch học thử mong muốn
  source_type TEXT DEFAULT 'platform', -- Ghi công nguồn: platform | organic
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bảng Payments: Lưu lịch sử giao dịch (Thanh toán học phí tháng đầu)
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'vietqr',
  status TEXT DEFAULT 'pending', -- pending | success | failed
  transaction_code TEXT, -- Mã giao dịch ngân hàng trả về (nếu có)
  -- Phân chia học phí 30/70
  center_amount INTEGER DEFAULT 0,        -- 30% thuộc về trung tâm EduConnect
  tutor_amount INTEGER DEFAULT 0,         -- 70% thù lao giảng viên
  tutor_transfer_status TEXT DEFAULT 'pending', -- pending | transferred | failed
  tutor_bank_name TEXT,                   -- Ngân hàng của giảng viên
  tutor_bank_account TEXT,                -- STK giảng viên
  tutor_bank_name_holder TEXT,            -- Tên chủ TK giảng viên
  transferred_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bảng Class Requests: Lưu yêu cầu tìm gia sư chung (Phụ huynh đăng lên bảng chung)
CREATE TABLE class_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Học viên đăng yêu cầu (nếu có đăng nhập)
  title TEXT NOT NULL,
  parent_name TEXT,
  subjects TEXT[] DEFAULT '{}',
  format TEXT, -- Offline, Online
  location TEXT,
  sessions_per_week TEXT,
  budget TEXT,
  target_goal TEXT, -- Mục tiêu học tập (v2)
  current_target_score TEXT, -- Mức điểm hiện tại -> Mong muốn (v2)
  special_requirements TEXT,
  status TEXT DEFAULT 'open',
  applicants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật Row Level Security (RLS) để bảo mật dữ liệu
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Cấu hình chính sách đọc dữ liệu công khai (Ai cũng xem được hồ sơ và thành tích)
CREATE POLICY "Public users are viewable by everyone." ON users FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Public achievements are viewable by everyone." ON achievements FOR SELECT USING (true);
CREATE POLICY "Public class requests are viewable by everyone." ON class_requests FOR SELECT USING (true);

-- Cho phép mọi người Insert vào enrollments và payments (Demo/Tạm thời)
CREATE POLICY "Anyone can insert enrollments." ON enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update enrollments." ON enrollments FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert payments." ON payments FOR INSERT WITH CHECK (true);

-- Cấu hình chính sách Users: Người dùng chỉ được sửa thông tin của chính mình
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Các chính sách khác sẽ được bổ sung sau...

-- ==============================================================
-- Bảng Reviews: Đánh giá giảng viên từ học sinh đã đăng ký học
-- Chỉ học sinh có enrollment status = 'enrolled' mới được đánh giá
-- Mỗi enrollment chỉ được đánh giá đúng 1 lần (UNIQUE constraint)
-- ==============================================================
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  student_name TEXT DEFAULT 'Học sinh',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(enrollment_id) -- Mỗi enrollment chỉ được đánh giá 1 lần
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Ai cũng xem được đánh giá (công khai)
CREATE POLICY "Public reviews are viewable by everyone." ON reviews FOR SELECT USING (true);

-- Chỉ học sinh đã đăng nhập và có enrollment 'enrolled' mới được insert
CREATE POLICY "Enrolled students can insert reviews." ON reviews FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid() = student_id AND
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.id = enrollment_id
      AND enrollments.student_id = auth.uid()
      AND enrollments.status = 'enrolled'
  )
);

-- ==============================================================
-- MIGRATION: Thêm cột ngân hàng vào profiles (chạy nếu DB đã tồn tại)
-- Chạy các lệnh này trong Supabase SQL Editor
-- ==============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_name TEXT;

-- MIGRATION: Thêm cột phân chia học phí vào payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS center_amount INTEGER DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tutor_amount INTEGER DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tutor_transfer_status TEXT DEFAULT 'pending';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tutor_bank_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tutor_bank_account TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tutor_bank_name_holder TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMP WITH TIME ZONE;
