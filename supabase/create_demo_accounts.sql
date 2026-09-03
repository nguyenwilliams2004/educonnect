-- =============================================================================
-- HANTUTOR: TẠO TÀI KHOẢN DEMO ĐẦY ĐỦ AUTH.USERS & AUTH.IDENTITIES
-- Chạy script này trên SQL Editor để tạo 2 tài khoản test đăng nhập ngay 100%
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. XÓA BẢN GHI CŨ NẾU ĐÃ TỒN TẠI
DELETE FROM auth.identities WHERE provider_id IN ('giaovien.demo@gmail.com', 'hocsinh.demo@gmail.com', 'admin@hantutor.vn');
DELETE FROM public.users WHERE email IN ('giaovien.demo@gmail.com', 'hocsinh.demo@gmail.com', 'admin@hantutor.vn');
DELETE FROM auth.users WHERE email IN ('giaovien.demo@gmail.com', 'hocsinh.demo@gmail.com', 'admin@hantutor.vn');

-- 2. TẠO TÀI KHOẢN GIÁO VIÊN
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated',
  'giaovien.demo@gmail.com',
  crypt('HanTutor2026!@#', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Cô Sương Mai (Demo)","phone":"0912345678","role":"instructor"}',
  NOW(), NOW(), '', '', '', ''
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  json_build_object('sub', '00000000-0000-0000-0000-000000000001', 'email', 'giaovien.demo@gmail.com'),
  'email', 'giaovien.demo@gmail.com', NOW(), NOW(), NOW()
);

-- 3. TẠO TÀI KHOẢN HỌC SINH
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated',
  'hocsinh.demo@gmail.com',
  crypt('HanTutor2026!@#', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Nguyễn Văn An (Demo)","phone":"0987654321","role":"student"}',
  NOW(), NOW(), '', '', '', ''
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  json_build_object('sub', '00000000-0000-0000-0000-000000000002', 'email', 'hocsinh.demo@gmail.com'),
  'email', 'hocsinh.demo@gmail.com', NOW(), NOW(), NOW()
);

-- 4. TẠO TÀI KHOẢN QUẢN TRỊ VIÊN (ADMIN PORTAL)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000003',
  'authenticated', 'authenticated',
  'admin@hantutor.vn',
  crypt('HanTutorAdmin2026!@#', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Quản Trị Viên Hệ Thống","phone":"0900000000","role":"admin"}',
  NOW(), NOW(), '', '', '', ''
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  json_build_object('sub', '00000000-0000-0000-0000-000000000003', 'email', 'admin@hantutor.vn'),
  'email', 'admin@hantutor.vn', NOW(), NOW(), NOW()
);

-- 5. ĐỒNG BỘ VÀO BẢNG PUBLIC.USERS
INSERT INTO public.users (id, email, full_name, role, phone) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'giaovien.demo@gmail.com', 'Cô Sương Mai (Demo)', 'instructor', '0912345678'),
  ('00000000-0000-0000-0000-000000000002', 'hocsinh.demo@gmail.com', 'Nguyễn Văn An (Demo)', 'student', '0987654321'),
  ('00000000-0000-0000-0000-000000000003', 'admin@hantutor.vn', 'Quản Trị Viên Hệ Thống', 'admin', '0900000000')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, phone = EXCLUDED.phone;

-- 6. XÁC NHẬN TẤT CẢ TÀI KHOẢN
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
