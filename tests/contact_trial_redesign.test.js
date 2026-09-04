import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

test('CONTACT TRIAL REDESIGN - Loại bỏ hoàn toàn nút premature Đăng ký chính thức trong modal học thử', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'ContactZaloModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  // Đảm bảo không còn nút premature gây hiểu lầm
  assert.ok(
    !content.includes('Đã hoàn thành học thử: Đăng ký học chính thức'),
    'Không được có nút Đã hoàn thành học thử trong modal kết nối học thử ban đầu'
  );
});

test('CONTACT TRIAL REDESIGN - Cung cấp tin nhắn mẫu kết nối kèm ngữ cảnh học sinh', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'ContactZaloModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  assert.ok(content.includes('prefilledMessage'), 'Modal phải có biến prefilledMessage định dạng lời nhắn');
  assert.ok(content.includes('handleCopyMessage'), 'Modal phải có hàm handleCopyMessage để sao chép tin nhắn 1-chạm');
  assert.ok(content.includes('Lời nhắn mẫu cho gia sư'), 'Modal phải hiển thị khu vực Lời nhắn mẫu cho gia sư');
});

test('CONTACT TRIAL REDESIGN - Giữ nguyên tính tương thích ngược và không tự động ghi nhận khi chỉ mở modal', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'ContactZaloModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  assert.ok(content.includes('handleConfirmTrial'), 'Phải giữ hàm handleConfirmTrial');
  assert.ok(content.includes('handleOpenZalo'), 'Phải giữ hàm handleOpenZalo');
  assert.ok(content.includes('isRegistered'), 'Phải giữ biến isRegistered');
  assert.ok(!content.includes('useEffect(() => {\n    if (isOpen && tutor && isLoggedIn) {\n      recordTrialContact(tutor);'), 'Không auto record khi vừa mở');
});

test('CONTACT TRIAL REDESIGN - Tối ưu kích thước QR và giao diện chống vỡ / cuộn chuột quá mức', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'ContactZaloModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  // Kiểm tra kích thước QR gọn gàng
  assert.ok(content.includes('w-36 h-36'), 'Mã QR phải được tối ưu kích thước w-36 h-36');
  assert.ok(content.includes('hidden sm:block'), 'Phải tối ưu ẩn hiện QR phù hợp giữa desktop và mobile');
});
