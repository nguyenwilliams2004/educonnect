import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');

test('ADMIN AUTH - Triệt tiêu hoàn toàn mật khẩu tĩnh admin123', () => {
  const adminPagePath = path.join(rootDir, 'src', 'app', 'pages', 'AdminDashboardPage.tsx');
  const code = fs.readFileSync(adminPagePath, 'utf8');

  // Đảm bảo không còn bất kỳ dòng kiểm tra mật khẩu tĩnh nào
  assert.ok(!code.includes('admin123'), 'Không được chứa mật khẩu tĩnh admin123');
  assert.ok(!code.includes('hantutor@2026'), 'Không được chứa mật khẩu tĩnh hantutor@2026');
});

test('ADMIN AUTH - Xóa bỏ hoàn toàn cơ chế sessionStorage giả lập', () => {
  const adminPagePath = path.join(rootDir, 'src', 'app', 'pages', 'AdminDashboardPage.tsx');
  const code = fs.readFileSync(adminPagePath, 'utf8');

  assert.ok(!code.includes('sessionStorage'), 'Không được dùng sessionStorage để lưu trạng thái đăng nhập admin');
  assert.ok(!code.includes('hantutor_admin_auth'), 'Không được dùng key hantutor_admin_auth');
});

test('ADMIN AUTH - Đăng nhập bằng Supabase Auth và Zero-Trust RBAC role = admin', () => {
  const adminPagePath = path.join(rootDir, 'src', 'app', 'pages', 'AdminDashboardPage.tsx');
  const code = fs.readFileSync(adminPagePath, 'utf8');

  // Phải sử dụng Supabase Auth thật
  assert.ok(code.includes('supabase.auth.signInWithPassword'), 'Admin phải đăng nhập qua Supabase signInWithPassword');
  assert.ok(code.includes("from('users')"), 'Admin phải kiểm tra role từ bảng public.users');
  assert.ok(code.includes("'admin'"), 'Admin phải kiểm tra điều kiện role admin');
  assert.ok(code.includes('supabase.auth.signOut()'), 'Nếu không phải role admin thì phải lập tức signOut');
  assert.ok(code.includes('supabase.auth.getSession()'), 'Phải tự động kiểm tra phiên đăng nhập Supabase khi tải trang');
});

test('ADMIN AUTH - Database Schema có hàm is_admin() và RLS Admin Policies', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  assert.ok(sql.includes('public.is_admin()'), 'Schema phải có hàm helper public.is_admin()');
  assert.ok(sql.includes("role = 'admin'"), 'Hàm is_admin() phải kiểm tra role = admin');
  assert.ok(sql.includes('Admins can update any profile.'), 'Phải có RLS policy cho Admin duyệt hồ sơ profiles');
  assert.ok(sql.includes('Admins can delete any profile.'), 'Phải có RLS policy cho Admin xóa hồ sơ profiles');
  assert.ok(sql.includes('Admins can manage enrollments.'), 'Phải có RLS policy cho Admin quản lý enrollments');
  assert.ok(sql.includes('Admins can update payout requests.'), 'Phải có RLS policy cho Admin duyệt rút tiền');
});

test('ADMIN AUTH - Script demo accounts có tài khoản Quản trị viên (Admin)', () => {
  const demoPath = path.join(rootDir, 'supabase', 'create_demo_accounts.sql');
  const sql = fs.readFileSync(demoPath, 'utf8');

  assert.ok(sql.includes('admin@hantutor.vn'), 'Phải có tài khoản admin@hantutor.vn trong create_demo_accounts.sql');
  assert.ok(sql.includes("'admin'"), 'Tài khoản admin phải được gán role admin');
});
