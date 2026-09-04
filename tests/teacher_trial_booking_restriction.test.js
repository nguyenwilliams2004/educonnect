import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

test('TEACHER TRIAL RESTRICTION - MyTrialsModal tuân thủ nghiêm ngặt React Rules of Hooks', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'MyTrialsModal.tsx');
  const code = fs.readFileSync(modalPath, 'utf8');

  // Đảm bảo không còn useState nào bị đặt sau if (!isOpen) return null;
  const earlyReturnIdx = code.indexOf('if (!isOpen) return null;');
  assert.ok(earlyReturnIdx !== -1, 'MyTrialsModal phải có early return if (!isOpen) return null;');

  const deletedIdsIdx = code.indexOf('const [deletedIds, setDeletedIds]');
  assert.ok(deletedIdsIdx !== -1, 'Phải có state deletedIds');
  assert.ok(
    deletedIdsIdx < earlyReturnIdx,
    'Hook deletedIds phải được gọi TRƯỚC if (!isOpen) return null; để chống crash React Rules of Hooks'
  );
});

test('TEACHER TRIAL RESTRICTION - TeacherDetailPage chặn giáo viên tự đặt học thử và đặt học thử với đồng nghiệp', () => {
  const detailPath = path.join(rootDir, 'src', 'app', 'pages', 'TeacherDetailPage.tsx');
  const code = fs.readFileSync(detailPath, 'utf8');

  // 1. Phải tính toán chính xác isOwnProfile
  assert.ok(code.includes('isOwnProfile'), 'TeacherDetailPage phải có biến isOwnProfile');

  // 2. Chặn trong handleTrialContactClick
  assert.ok(
    code.includes("currentSession.role === 'teacher'"),
    'handleTrialContactClick phải kiểm tra role teacher'
  );

  // 3. Chặn trong handleSelectTrialSlot
  assert.ok(
    code.includes("currentSession.role === 'teacher'") && code.includes('handleSelectTrialSlot'),
    'handleSelectTrialSlot phải chặn giáo viên đặt ca học thử'
  );

  // 4. Giao diện sidebar phân biệt rõ ràng: Hồ sơ của bạn vs Chế độ xem đồng nghiệp
  assert.ok(
    code.includes('Chỉnh sửa hồ sơ của bạn'),
    'Sidebar phải hiển thị nút Chỉnh sửa hồ sơ của bạn khi xem hồ sơ chính mình'
  );
  assert.ok(
    code.includes('Chế độ xem đồng nghiệp'),
    'Sidebar phải hiển thị thông báo Chế độ xem đồng nghiệp khi giáo viên xem giáo viên khác'
  );
});

test('TEACHER TRIAL RESTRICTION - ContactZaloModal và BookingContext bảo vệ Zero-Trust ở tầng nghiệp vụ', () => {
  const zaloModalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'ContactZaloModal.tsx');
  const zaloCode = fs.readFileSync(zaloModalPath, 'utf8');
  assert.ok(
    zaloCode.includes("currentSession.role === 'teacher'"),
    'ContactZaloModal phải kiểm tra role teacher'
  );

  const bookingCtxPath = path.join(rootDir, 'src', 'context', 'BookingContext.tsx');
  const bookingCode = fs.readFileSync(bookingCtxPath, 'utf8');
  assert.ok(
    bookingCode.includes("if (currentSession.role === 'teacher')"),
    'BookingContext.recordTrialContact phải chặn vai trò teacher ghi nhận học thử'
  );
});
