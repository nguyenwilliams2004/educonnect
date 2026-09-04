import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

test('TRIAL SLOT SELECTION - Bảng lịch tuần chuyển sang nút hẹn ca trực quan và loại bỏ đếm ngược 5 phút', () => {
  const detailPagePath = path.join(rootDir, 'src', 'app', 'pages', 'TeacherDetailPage.tsx');
  const content = fs.readFileSync(detailPagePath, 'utf8');

  // 1. Phải có hàm handleSelectTrialSlot xử lý hẹn lịch học thử
  assert.ok(
    content.includes('handleSelectTrialSlot'),
    'TeacherDetailPage.tsx phải có hàm handleSelectTrialSlot để xử lý chọn ca học thử'
  );

  // 2. Nút trên bảng lịch tuần phải là "✓ Hẹn ca này"
  assert.ok(
    content.includes('✓ Hẹn ca này'),
    'Bảng lịch tuần phải có nút thân thiện "✓ Hẹn ca này"'
  );

  // 3. Không còn nút "⏳ Tạm khóa" gây khó chịu trong ô bảng lịch
  assert.ok(
    !content.includes('⏳ Tạm khóa'),
    'Phải loại bỏ hoàn toàn nút ⏳ Tạm khóa trong bảng lịch chi tiết giáo viên'
  );

  // 4. Không còn banner đếm ngược 5 phút gây áp lực ở đầu bảng lịch
  assert.ok(
    !content.includes('Banner khi chính bạn đang giữ chỗ (Countdown 5 phút)'),
    'Phải dọn dẹp banner đếm ngược 5 phút phía trên bảng lịch'
  );

  // 5. Không còn khối đếm ngược 5 phút trong sidebar
  assert.ok(
    !content.includes('Đang giữ chỗ 5 phút') && !content.includes('Trạng thái giữ chỗ'),
    'Phải dọn dẹp khối đếm ngược giữ chỗ 5 phút khỏi sidebar'
  );
});

test('TRIAL SLOT SELECTION - handleSelectTrialSlot tích hợp mượt mà với ContactZaloModal và AuthModal', () => {
  const detailPagePath = path.join(rootDir, 'src', 'app', 'pages', 'TeacherDetailPage.tsx');
  const content = fs.readFileSync(detailPagePath, 'utf8');

  // Kiểm tra truyền thông tin ca học vào selectedSlot
  assert.ok(
    content.includes('selectedSlot: slotInfo') || content.includes('selectedSlot'),
    'handleSelectTrialSlot phải gán selectedSlot vào thông tin tutor'
  );

  // Kiểm tra mở ContactZaloModal khi đã đăng nhập
  assert.ok(
    content.includes('openContactZaloModal(tutorWithSlot)'),
    'handleSelectTrialSlot phải gọi openContactZaloModal(tutorWithSlot)'
  );

  // Kiểm tra lưu pendingTrialTutor khi chưa đăng nhập
  assert.ok(
    content.includes('setPendingTrialTutor(tutorWithSlot)'),
    'handleSelectTrialSlot phải lưu tutorWithSlot vào pendingTrialTutor khi học sinh chưa đăng nhập'
  );
});

test('TRIAL SLOT SELECTION - Duy trì Stored Procedure reserve_slot và release_slot cho luồng nhập học chính thức', () => {
  const detailPagePath = path.join(rootDir, 'src', 'app', 'pages', 'TeacherDetailPage.tsx');
  const content = fs.readFileSync(detailPagePath, 'utf8');

  // Vẫn bảo lưu các hàm phục vụ backend Zero-Trust contract
  assert.ok(
    content.includes("supabase.rpc('reserve_slot'"),
    'TeacherDetailPage.tsx phải duy trì backend contract reserve_slot'
  );
  assert.ok(
    content.includes("supabase.rpc('release_slot'"),
    'TeacherDetailPage.tsx phải duy trì backend contract release_slot'
  );
});
