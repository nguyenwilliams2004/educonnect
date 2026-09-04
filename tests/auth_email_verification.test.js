import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('AUTH EMAIL VERIFICATION - AuthUrlHandler bắt lỗi hash, otp_expired và xác thực thành công', () => {
  const appPath = path.resolve('src/app/App.tsx');
  const appCode = fs.readFileSync(appPath, 'utf8');

  assert.ok(appCode.includes('AuthUrlHandler'), 'App.tsx phải chứa AuthUrlHandler');
  assert.ok(appCode.includes('otp_expired'), 'AuthUrlHandler phải kiểm tra mã lỗi otp_expired');
  assert.ok(appCode.includes('replaceState'), 'AuthUrlHandler phải xóa hash lỗi khỏi thanh địa chỉ browser');
  assert.ok(appCode.includes('<AuthUrlHandler />'), 'AppLayout phải mount AuthUrlHandler');
  assert.ok(appCode.includes('email_verified=true'), 'AuthUrlHandler phải xử lý trường hợp xác thực thành công');
});

test('AUTH EMAIL VERIFICATION - AuthModal hỗ trợ gửi lại email xác thực (resend)', () => {
  const modalPath = path.resolve('src/app/components/modals/AuthModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf8');

  assert.ok(modalCode.includes('handleResendConfirmEmail'), 'AuthModal phải có hàm handleResendConfirmEmail');
  assert.ok(modalCode.includes('supabase.auth.resend'), 'AuthModal phải gọi supabase.auth.resend');
  assert.ok(modalCode.includes('initialErrorMessage'), 'AuthModal phải nhận initialErrorMessage từ authModalState');
  assert.ok(modalCode.includes('Gửi lại link xác nhận email'), 'AuthModal phải render nút Gửi lại link xác nhận email');
});

test('AUTH EMAIL VERIFICATION - UIContext hỗ trợ initialErrorMessage trong AuthModalState', () => {
  const uiContextPath = path.resolve('src/context/UIContext.tsx');
  const uiCode = fs.readFileSync(uiContextPath, 'utf8');

  assert.ok(uiCode.includes('initialErrorMessage?: string | null;'), 'AuthModalState phải có initialErrorMessage');
  assert.ok(uiCode.includes('initialEmail?: string;'), 'AuthModalState phải có initialEmail');
});

test('AUTH EMAIL VERIFICATION - vite.config.ts cấu hình cổng 3000 cho dev server', () => {
  const vitePath = path.resolve('vite.config.ts');
  const viteCode = fs.readFileSync(vitePath, 'utf8');

  assert.ok(viteCode.includes('port: 3000'), 'vite.config.ts phải cấu hình cổng server: { port: 3000 }');
});

test('AUTH EMAIL VERIFICATION - Bắt buộc xác thực email: AuthModal chuyển sang view pending_verification khi đăng ký', () => {
  const modalPath = path.resolve('src/app/components/modals/AuthModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf8');

  assert.ok(
    modalCode.includes("'pending_verification'"),
    'AuthModal phải có view pending_verification để hướng dẫn người dùng check email'
  );
  assert.ok(
    modalCode.includes("setView('pending_verification')"),
    'handleRegister phải chuyển sang pending_verification nếu email chưa xác thực'
  );
  assert.ok(
    modalCode.includes('Xác thực tài khoản Email'),
    'Giao diện pending_verification phải có tiêu đề Xác thực tài khoản Email'
  );
});

test('AUTH EMAIL VERIFICATION - Zero-Trust: Chặn đăng nhập nếu tài khoản chưa có email_confirmed_at', () => {
  const modalPath = path.resolve('src/app/components/modals/AuthModal.tsx');
  const modalCode = fs.readFileSync(modalPath, 'utf8');

  assert.ok(
    modalCode.includes('!data.user.email_confirmed_at'),
    'handleLogin phải kiểm tra cờ email_confirmed_at của user'
  );
  assert.ok(
    modalCode.includes('supabase.auth.signOut()'),
    'handleLogin phải lập tức đăng xuất nếu email chưa được xác thực'
  );

  const authContextPath = path.resolve('src/context/AuthContext.tsx');
  const contextCode = fs.readFileSync(authContextPath, 'utf8');

  assert.ok(
    contextCode.includes('!authUser.email_confirmed_at'),
    'AuthContext phải kiểm tra cờ email_confirmed_at trước khi đồng bộ phiên làm việc'
  );
});
