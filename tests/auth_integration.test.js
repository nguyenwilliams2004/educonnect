import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');

test('AUTH PRODUCTION - Triệt tiêu hoàn toàn fake mock login', () => {
  const authModalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'AuthModal.tsx');
  const code = fs.readFileSync(authModalPath, 'utf8');

  // Đảm bảo không còn logic fake setTimeout bỏ qua mật khẩu
  assert.ok(!code.includes("userId: tutorId"), 'Không được dùng tutorId mock');
  assert.ok(!code.includes("t1 : 'usr_'"), 'Không được dùng hardcode t1 trong login');
  
  // Đảm bảo kết nối trực tiếp với Supabase Auth thật
  assert.ok(code.includes('supabase.auth.signInWithPassword'), 'Phải dùng signInWithPassword thật');
  assert.ok(code.includes('supabase.auth.signUp'), 'Phải dùng signUp thật');
  assert.ok(code.includes('supabase.auth.signInWithOAuth'), 'Phải có Google OAuth');
  assert.ok(code.includes('supabase.auth.resetPasswordForEmail'), 'Phải có resetPasswordForEmail');
});

test('AUTH PRODUCTION - AuthContext đồng bộ trạng thái từ public.users', () => {
  const authCtxPath = path.join(rootDir, 'src', 'context', 'AuthContext.tsx');
  const code = fs.readFileSync(authCtxPath, 'utf8');

  assert.ok(code.includes("from('users')"), 'AuthContext phải truy vấn bảng public.users');
  assert.ok(code.includes('onAuthStateChange'), 'AuthContext phải lắng nghe onAuthStateChange');
  assert.ok(code.includes('supabase.auth.signOut'), 'AuthContext phải xử lý signOut');
});

test('AUTH PRODUCTION - Schema SQL đã có RLS và Trigger đồng bộ CSDL', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  assert.ok(sql.includes('handle_new_user()'), 'Phải có hàm handle_new_user');
  assert.ok(sql.includes('on_auth_user_created'), 'Phải có trigger on_auth_user_created');
  assert.ok(sql.includes('CREATE POLICY "Users can insert own record." ON users'), 'Phải có chính sách insert vào users');
});
