import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('ADMIN SECURITY - Triệt tiêu hoàn toàn mật khẩu hardcode và sessionStorage bypass', () => {
  const adminPagePath = path.join(rootDir, 'src', 'app', 'pages', 'AdminDashboardPage.tsx');
  assert.ok(fs.existsSync(adminPagePath), 'File AdminDashboardPage.tsx phải tồn tại');

  const content = fs.readFileSync(adminPagePath, 'utf8');

  // Đảm bảo không còn hardcode mật khẩu
  assert.ok(!content.includes('admin123'), 'Tuyệt đối không được chứa mật khẩu admin123');
  assert.ok(!content.includes('hantutor@2026'), 'Tuyệt đối không được chứa mật khẩu hantutor@2026');
  assert.ok(!content.includes('sessionStorage'), 'Tuyệt đối không dùng sessionStorage để lưu cờ auth admin');
  assert.ok(!content.includes('hantutor_admin_auth'), 'Không dùng token giả lập hantutor_admin_auth');
});

test('ADMIN SECURITY - Xác thực danh tính qua Supabase Auth và kiểm soát quyền RBAC role = admin', () => {
  const adminPagePath = path.join(rootDir, 'src', 'app', 'pages', 'AdminDashboardPage.tsx');
  const content = fs.readFileSync(adminPagePath, 'utf8');

  // Kiểm tra kết nối Supabase Auth
  assert.ok(content.includes('supabase.auth.signInWithPassword'), 'Phải dùng signInWithPassword của Supabase');
  assert.ok(content.includes("from('users')"), 'Phải truy vấn bảng users để lấy role');
  assert.ok(content.includes("resolvedRole !== 'admin'"), 'Phải từ chối truy cập nếu role khác admin');
  assert.ok(content.includes('supabase.auth.signOut()'), 'Phải tự động đăng xuất nếu không có quyền admin');
});

test('ADMIN SECURITY - Cơ chế phòng chống tấn công Brute-Force mật khẩu', () => {
  const adminPagePath = path.join(rootDir, 'src', 'app', 'pages', 'AdminDashboardPage.tsx');
  const content = fs.readFileSync(adminPagePath, 'utf8');

  assert.ok(content.includes('failedAttempts'), 'Phải đếm số lần đăng nhập thất bại');
  assert.ok(content.includes('lockoutUntil'), 'Phải có thời gian khóa tạm thời lockoutUntil');
});

test('ADMIN SECURITY - Duyệt KYC cập nhật cờ verified = true trực tiếp vào CSDL Supabase', () => {
  const tutorCtxPath = path.join(rootDir, 'src', 'context', 'TutorContext.tsx');
  const content = fs.readFileSync(tutorCtxPath, 'utf8');

  assert.ok(content.includes("from('profiles')"), 'Phải thao tác bảng profiles');
  assert.ok(content.includes('.update({ verified: true })'), 'Phải update verified: true trên Supabase');
});
