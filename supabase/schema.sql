-- =============================================================================
-- HANTUTOR POSTGRESQL SCHEMA, STORED PROCEDURES & ROW LEVEL SECURITY (RLS)
-- Chạy toàn bộ file này trực tiếp trên SQL Editor của Supabase Dashboard.
-- =============================================================================

-- 1. BẢNG USERS: Liên kết với Supabase Auth
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'center', 'admin')),
  phone TEXT,
  avatar_url TEXT,
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

-- 3. BẢNG AVAILABILITY_SLOTS: Quản lý khung giờ rảnh & Giữ chỗ chống trùng lịch TTL (Anti Double-booking)
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Chủ Nhật, 2=Thứ 2, ..., 7=Thứ 7
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  locked_until TIMESTAMP WITH TIME ZONE,
  locked_by TEXT, -- ID hoặc session của học sinh đang giữ chỗ tạm thời
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(instructor_id, day_of_week, start_time, end_time)
);

-- 4. BẢNG ACHIEVEMENTS: Bảng vàng thành tích học sinh của gia sư
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

-- 5. BẢNG ENROLLMENTS: Đặt lịch học thử & Đăng ký nhập học chính thức
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  slot_id UUID REFERENCES availability_slots(id) ON DELETE SET NULL,
  class_title TEXT,
  student_name TEXT NOT NULL,
  student_age TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  note TEXT,
  status TEXT DEFAULT 'trial_booked' CHECK (status IN ('trial_booked', 'trial_completed', 'enrolled', 'not_enrolled', 'changed_tutor')),
  trial_date TEXT,
  source_type TEXT DEFAULT 'platform',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. BẢNG PAYMENTS: Giao dịch thanh toán học phí VietQR (Phân chia 30/70)
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
  transferred_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. BẢNG PAYOUT_REQUESTS: Yêu cầu rút tiền đơn giản của Gia sư (MVP Wallet Ledger)
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  bank_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_account_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'transferred', 'rejected')),
  admin_note TEXT,
  transferred_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. BẢNG REVIEWS: Đánh giá gia sư từ học sinh chính thức
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

-- 9. BẢNG CLASS_REQUESTS: Yêu cầu tìm gia sư chung của phụ huynh
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
-- CÁC HÀM XỬ LÝ GIỮ CHỖ KHUNG GIỜ RẢNH (TTL SLOT RESERVATION PROCEDURES)
-- =============================================================================

-- Hàm 1: Tạm giữ chỗ khung giờ trong 5 phút (Chống phụ huynh khác chọn trùng)
CREATE OR REPLACE FUNCTION reserve_slot(
  p_slot_id UUID,
  p_holder_id TEXT,
  p_lock_minutes INT DEFAULT 5
) RETURNS JSONB AS $$
DECLARE
  v_slot availability_slots%ROWTYPE;
BEGIN
  -- Khóa dòng để tránh tranh chấp trong tích tắc (Concurrency Lock)
  SELECT * INTO v_slot
  FROM availability_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Khung giờ không tồn tại');
  END IF;

  IF v_slot.is_booked THEN
    RETURN jsonb_build_object('success', false, 'message', 'Khung giờ này đã được đặt trước');
  END IF;

  -- Nếu đang có người khác giữ chỗ và chưa hết hạn 5 phút
  IF v_slot.locked_until > NOW() AND v_slot.locked_by IS DISTINCT FROM p_holder_id THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Khung giờ này đang có người khác thao tác giữ chỗ. Vui lòng thử lại sau ít phút.'
    );
  END IF;

  -- Ghi nhận giữ chỗ tạm thời trong p_lock_minutes phút
  UPDATE availability_slots
  SET locked_until = NOW() + (p_lock_minutes || ' minutes')::INTERVAL,
      locked_by = p_holder_id
  WHERE id = p_slot_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Giữ chỗ thành công',
    'locked_until', NOW() + (p_lock_minutes || ' minutes')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm 2: Hủy giữ chỗ nếu phụ huynh đóng modal hoặc đổi khung giờ khác
CREATE OR REPLACE FUNCTION release_slot(
  p_slot_id UUID,
  p_holder_id TEXT
) RETURNS JSONB AS $$
BEGIN
  UPDATE availability_slots
  SET locked_until = NULL,
      locked_by = NULL
  WHERE id = p_slot_id AND locked_by = p_holder_id AND is_booked = false;

  RETURN jsonb_build_object('success', true, 'message', 'Đã nhả khung giờ');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- INDEXES PHỤC VỤ HIỆU NĂNG TÌM KIẾM VÀ ĐỐI SOÁT
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_subjects ON profiles USING GIN (subjects);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON profiles (district);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles (rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles (verified);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments (student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_instructor ON enrollments (instructor_id);
CREATE INDEX IF NOT EXISTS idx_availability_instructor ON availability_slots (instructor_id, day_of_week);

-- =============================================================================
-- KÍCH HOẠT ROW LEVEL SECURITY (RLS) TRÊN TẤT CẢ CÁC BẢNG
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_requests ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CÁC CHÍNH SÁCH BẢO MẬT (POLICIES)
-- =============================================================================

-- --- HÀM KIỂM TRA QUYỀN ADMIN HỆ THỐNG (Zero-Trust RBAC Helper) ---
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --- 1. CHÍNH SÁCH ĐỌC CÔNG KHAI (Public Read) ---
DROP POLICY IF EXISTS "Public users are viewable by everyone." ON users;
CREATE POLICY "Public users are viewable by everyone." ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public slots are viewable by everyone." ON availability_slots;
CREATE POLICY "Public slots are viewable by everyone." ON availability_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public achievements are viewable by everyone." ON achievements;
CREATE POLICY "Public achievements are viewable by everyone." ON achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reviews are viewable by everyone." ON reviews;
CREATE POLICY "Public reviews are viewable by everyone." ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public class requests are viewable by everyone." ON class_requests;
CREATE POLICY "Public class requests are viewable by everyone." ON class_requests FOR SELECT USING (true);

-- --- 2. CHÍNH SÁCH TỰ SỞ HỮU DỮ LIỆU (Self-Write / Users, Profiles & Slots) ---
DROP POLICY IF EXISTS "Users can insert own record." ON users;
CREATE POLICY "Users can insert own record." ON users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own record." ON users;
CREATE POLICY "Users can update own record." ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Instructors can manage own slots." ON availability_slots;
CREATE POLICY "Instructors can manage own slots." ON availability_slots FOR ALL USING (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can manage own achievements." ON achievements;
CREATE POLICY "Instructors can manage own achievements." ON achievements FOR ALL USING (auth.uid() = instructor_id);

-- --- 3. CHÍNH SÁCH QUẢN LÝ ĐƠN HỌC THỬ (Enrollments) ---
DROP POLICY IF EXISTS "Users can view relevant enrollments." ON enrollments;
CREATE POLICY "Users can view relevant enrollments." ON enrollments FOR SELECT USING (
  auth.uid() = student_id OR auth.uid() = instructor_id OR auth.uid() IS NULL
);

DROP POLICY IF EXISTS "Anyone can create trial enrollment." ON enrollments;
CREATE POLICY "Anyone can create trial enrollment." ON enrollments FOR INSERT WITH CHECK (
  auth.uid() IS NULL OR auth.uid() = student_id
);

DROP POLICY IF EXISTS "Participants can update enrollments." ON enrollments;
CREATE POLICY "Participants can update enrollments." ON enrollments FOR UPDATE USING (
  auth.uid() = student_id OR auth.uid() = instructor_id
);

-- --- 4. CHÍNH SÁCH THANH TOÁN & RÚT TIỀN (Payments & Payouts Protection) ---
DROP POLICY IF EXISTS "Participants can view payments." ON payments;
CREATE POLICY "Participants can view payments." ON payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.id = payments.enrollment_id
      AND (enrollments.student_id = auth.uid() OR enrollments.instructor_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Instructors can view own payout requests." ON payout_requests;
CREATE POLICY "Instructors can view own payout requests." ON payout_requests FOR SELECT USING (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can insert own payout requests." ON payout_requests;
CREATE POLICY "Instructors can insert own payout requests." ON payout_requests FOR INSERT WITH CHECK (auth.uid() = instructor_id);

-- CẤM UPDATE PAYMENTS & PAYOUT STATUS TỪ CLIENT
DROP POLICY IF EXISTS "Clients cannot update payments." ON payments;
CREATE POLICY "Clients cannot update payments." ON payments FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Clients cannot update payout status." ON payout_requests;
CREATE POLICY "Clients cannot update payout status." ON payout_requests FOR UPDATE USING (false);

-- CHO PHÉP TẠO GIAO DỊCH THANH TOÁN CHỜ ĐỐI SOÁT (PENDING ONLY)
DROP POLICY IF EXISTS "Students can create pending payments." ON payments;
CREATE POLICY "Students can create pending payments." ON payments FOR INSERT WITH CHECK (
  status = 'pending'
);

-- --- 5. CHÍNH SÁCH ĐÁNH GIÁ (Verified Reviews) ---
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

-- --- 6. CHÍNH SÁCH DÀNH CHO QUẢN TRỊ VIÊN (Admin RBAC Policies) ---
-- Admin cập nhật hồ sơ gia sư (duyệt KYC verified = true, phê duyệt/từ chối hồ sơ)
DROP POLICY IF EXISTS "Admins can update any profile." ON profiles;
CREATE POLICY "Admins can update any profile." ON profiles FOR UPDATE USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "Admins can delete any profile." ON profiles;
CREATE POLICY "Admins can delete any profile." ON profiles FOR DELETE USING (
  public.is_admin()
);

-- Admin quản lý toàn bộ đơn đăng ký học thử và nhập học chính thức
DROP POLICY IF EXISTS "Admins can manage enrollments." ON enrollments;
CREATE POLICY "Admins can manage enrollments." ON enrollments FOR ALL USING (
  public.is_admin()
);

-- Admin xem và phê duyệt lệnh rút tiền của gia sư
DROP POLICY IF EXISTS "Admins can view all payout requests." ON payout_requests;
CREATE POLICY "Admins can view all payout requests." ON payout_requests FOR SELECT USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "Admins can update payout requests." ON payout_requests;
CREATE POLICY "Admins can update payout requests." ON payout_requests FOR UPDATE USING (
  public.is_admin()
);

-- --- 7. TRIGGER TỰ ĐỘNG ĐỒNG BỘ AUTH.USERS SANG PUBLIC.USERS ---
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, 'User'), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      phone = COALESCE(EXCLUDED.phone, public.users.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

