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
  levels TEXT[] DEFAULT '{}',
  price INTEGER DEFAULT 0,
  location TEXT,
  district TEXT,
  ward TEXT,
  address TEXT,
  online BOOLEAN DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 5.0,
  experience INTEGER DEFAULT 0,
  education TEXT,
  bio TEXT,
  intro TEXT,
  schedule TEXT[] DEFAULT '{}',
  certificates TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
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

-- Bảng Enrollments: Lưu thông tin đăng ký học thử / liên hệ
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Học viên đăng ký (nếu có đăng nhập)
  class_title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_age TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending',
  trial_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật Row Level Security (RLS) để bảo mật dữ liệu
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Cấu hình chính sách đọc dữ liệu công khai (Ai cũng xem được hồ sơ và thành tích)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Public achievements are viewable by everyone." ON achievements FOR SELECT USING (true);

-- Cấu hình chính sách Users: Người dùng chỉ được sửa thông tin của chính mình
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Các chính sách khác sẽ được bổ sung sau...
