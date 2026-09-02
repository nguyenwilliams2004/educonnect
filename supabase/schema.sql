-- =============================================================================
-- HANTUTOR POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Chạy toàn bộ file này trực tiếp trên SQL Editor của Supabase Dashboard.
-- =============================================================================

-- 1. BẢNG USERS: Liên kết với Supabase Auth
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'center', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BẢNG PROFILES: Hồ sơ chi tiết của giáo viên / trung tâm
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  avatar_url TEXT,
  subjects TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  category_type TEXT,
  provider_type TEXT DEFAULT '1-1', -- '1-1' | 'class'
  target_tags TEXT[] DEFAULT '{}',
  success_story TEXT,
  levels TEXT[] DEFAULT '{}',
  price INTEGER DEFAULT 0,
  price_unit TEXT DEFAULT 'giờ',
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
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BẢNG ACHIEVEMENTS: Bảng vàng thành tích học sinh của gia sư
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BẢNG ENROLLMENTS: Đặt lịch học thử & đăng ký nhập học chính thức
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  class_title TEXT,
  student_name TEXT NOT NULL,
  student_age TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  note TEXT,
  status TEXT DEFAULT 'trial_booked' CHECK (status IN ('trial_booked', 'trial_completed', 'enrolled', 'not_enrolled', 'changed_tutor')),
  trial_date TEXT,
  source_type TEXT DEFAULT 'platform',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BẢNG PAYMENTS: Giao dịch thanh toán học phí (Phân chia 30/70)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'vietqr',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  transaction_code TEXT,
  center_amount INTEGER DEFAULT 0,        -- 30% thuộc về nền tảng HanTutor
  tutor_amount INTEGER DEFAULT 0,         -- 70% thù lao giáo viên
  tutor_transfer_status TEXT DEFAULT 'pending' CHECK (tutor_transfer_status IN ('pending', 'transferred', 'failed')),
  tutor_bank_name TEXT,
  tutor_bank_account TEXT,
  tutor_bank_name_holder TEXT,
  transferred_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. BẢNG REVIEWS: Đánh giá gia sư từ học sinh
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  student_name TEXT DEFAULT 'Học sinh',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(enrollment_id)
);

-- 7. BẢNG CLASS_REQUESTS: Yêu cầu tìm gia sư chung của phụ huynh
CREATE TABLE IF NOT EXISTS class_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  parent_name TEXT,
  subjects TEXT[] DEFAULT '{}',
  format TEXT,
  location TEXT,
  sessions_per_week TEXT,
  budget TEXT,
  target_goal TEXT,
  current_target_score TEXT,
  special_requirements TEXT,
  status TEXT DEFAULT 'open',
  applicants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- KÍCH HOẠT ROW LEVEL SECURITY (RLS) TRÊN TẤT CẢ CÁC BẢNG
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_requests ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CÁC CHÍNH SÁCH BẢO MẬT (POLICIES)
-- =============================================================================

-- --- 1. CHÍNH SÁCH ĐỌC CÔNG KHAI (Public Read) ---
DROP POLICY IF EXISTS "Public users are viewable by everyone." ON users;
CREATE POLICY "Public users are viewable by everyone." ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public achievements are viewable by everyone." ON achievements;
CREATE POLICY "Public achievements are viewable by everyone." ON achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reviews are viewable by everyone." ON reviews;
CREATE POLICY "Public reviews are viewable by everyone." ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public class requests are viewable by everyone." ON class_requests;
CREATE POLICY "Public class requests are viewable by everyone." ON class_requests FOR SELECT USING (true);

-- --- 2. CHÍNH SÁCH TỰ SỞ HỮU DỮ LIỆU (Self-Write / Profiles) ---
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Instructors can manage own achievements." ON achievements;
CREATE POLICY "Instructors can manage own achievements." ON achievements FOR ALL USING (auth.uid() = instructor_id);

-- --- 3. CHÍNH SÁCH QUẢN LÝ LỊCH HỌC THỬ (Enrollments) ---
-- Học sinh xem lịch của mình, Gia sư xem các học sinh đăng ký với mình
DROP POLICY IF EXISTS "Users can view relevant enrollments." ON enrollments;
CREATE POLICY "Users can view relevant enrollments." ON enrollments FOR SELECT USING (
  auth.uid() = student_id OR auth.uid() = instructor_id OR auth.uid() IS NULL
);

-- Bất kỳ ai (kể cả khách vãng lai) cũng có thể gửi đơn đăng ký học thử
DROP POLICY IF EXISTS "Anyone can create trial enrollment." ON enrollments;
CREATE POLICY "Anyone can create trial enrollment." ON enrollments FOR INSERT WITH CHECK (
  auth.uid() IS NULL OR auth.uid() = student_id
);

-- Chỉ học sinh hoặc gia sư phụ trách mới được cập nhật trạng thái đơn
DROP POLICY IF EXISTS "Participants can update enrollments." ON enrollments;
CREATE POLICY "Participants can update enrollments." ON enrollments FOR UPDATE USING (
  auth.uid() = student_id OR auth.uid() = instructor_id
);

-- --- 4. CHÍNH SÁCH BẢO VỆ DÒNG TIỀN (Payments Protection) ---
-- Chỉ học sinh thanh toán hoặc gia sư thụ hưởng mới được xem hóa đơn
DROP POLICY IF EXISTS "Participants can view payments." ON payments;
CREATE POLICY "Participants can view payments." ON payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.id = payments.enrollment_id
      AND (enrollments.student_id = auth.uid() OR enrollments.instructor_id = auth.uid())
  )
);

-- Cho phép tạo bản ghi thanh toán khi học sinh nhập học chính thức
DROP POLICY IF EXISTS "Students can insert payment for own enrollment." ON payments;
CREATE POLICY "Students can insert payment for own enrollment." ON payments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.id = enrollment_id
      AND (enrollments.student_id = auth.uid() OR auth.uid() IS NULL)
  )
);

-- CẤM UPDATE PAYMENTS: Trạng thái và số dư thanh toán không được phép tự sửa từ Client
DROP POLICY IF EXISTS "Clients cannot mutate payments." ON payments;
-- Không tạo policy FOR UPDATE để chặn mọi sửa đổi trái phép từ client

-- --- 5. CHÍNH SÁCH ĐÁNH GIÁ (Reviews) ---
-- Chỉ học sinh đã đăng ký và có đơn enrolled mới được đánh giá
DROP POLICY IF EXISTS "Enrolled students can insert reviews." ON reviews;
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
