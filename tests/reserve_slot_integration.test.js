import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

test('RESERVE_SLOT - Schema Database có hàm reserve_slot và release_slot chống race condition', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  assert.ok(sql.includes('CREATE OR REPLACE FUNCTION reserve_slot'), 'Thiếu hàm Stored Procedure reserve_slot');
  assert.ok(sql.includes('p_lock_minutes INT DEFAULT 5'), 'reserve_slot phải có tham số p_lock_minutes với mặc định 5 phút');
  assert.ok(sql.includes('FOR UPDATE'), 'reserve_slot bắt buộc phải có câu lệnh FOR UPDATE chống race condition');
  assert.ok(sql.includes('CREATE OR REPLACE FUNCTION release_slot'), 'Thiếu hàm Stored Procedure release_slot');
  assert.ok(sql.includes('availability_slots'), 'Bắt buộc phải tương tác với bảng availability_slots');
});

test('RESERVE_SLOT - TeacherDetailPage.tsx đã tích hợp Stored Procedure reserve_slot', () => {
  const detailPagePath = path.join(rootDir, 'src', 'app', 'pages', 'TeacherDetailPage.tsx');
  const content = fs.readFileSync(detailPagePath, 'utf8');

  // 1. Kiểm tra gọi supabase.rpc('reserve_slot', ...)
  assert.ok(
    content.includes("supabase.rpc('reserve_slot'") || content.includes('supabase.rpc("reserve_slot"'),
    'TeacherDetailPage.tsx phải gọi supabase.rpc("reserve_slot", ...)'
  );

  // 2. Kiểm tra tham số p_slot_id, p_holder_id, p_lock_minutes
  assert.ok(content.includes('p_slot_id'), 'reserve_slot phải truyền tham số p_slot_id');
  assert.ok(content.includes('p_holder_id'), 'reserve_slot phải truyền tham số p_holder_id');
  assert.ok(content.includes('p_lock_minutes: 5'), 'reserve_slot phải truyền p_lock_minutes: 5 để khóa chỗ 5 phút');

  // 3. Kiểm tra mở EnrollmentModal kèm slot_id khi thành công
  assert.ok(content.includes('openEnrollmentModal'), 'TeacherDetailPage.tsx phải gọi openEnrollmentModal');
  assert.ok(content.includes('selectedSlotId') || content.includes('slot_id'), 'Phải truyền slot_id vào modal');

  // 4. Kiểm tra gọi release_slot khi hủy hoặc đổi ca
  assert.ok(
    content.includes("supabase.rpc('release_slot'") || content.includes('supabase.rpc("release_slot"'),
    'TeacherDetailPage.tsx phải có logic gọi release_slot để nhả khung giờ'
  );

  // 5. Kiểm tra cảnh báo khi bị trùng hoặc người khác giữ chỗ
  assert.ok(
    content.includes('reservationWarning') || content.includes('warningMsg') || content.includes('alert('),
    'Phải hiển thị thông báo/cảnh báo nếu giữ chỗ thất bại'
  );
});

test('RESERVE_SLOT - EnrollmentModal.tsx nhận slot_id và hiển thị thông tin giữ chỗ 5 phút', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'EnrollmentModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  assert.ok(content.includes('selectedSlot') || content.includes('slot_id'), 'EnrollmentModal phải nhận thông tin slot đã chọn');
  assert.ok(content.includes('onProceedToPayment'), 'EnrollmentModal phải truyền tiếp slot_id khi thanh toán');
  assert.ok(content.includes('Khung giờ đã chọn') || content.includes('giữ chỗ'), 'EnrollmentModal phải hiển thị thông báo khung giờ đã giữ chỗ');
});

test('RESERVE_SLOT - BookingContext.tsx cập nhật availability_slots khi hoàn tất nhập học', () => {
  const bookingPath = path.join(rootDir, 'src', 'context', 'BookingContext.tsx');
  const content = fs.readFileSync(bookingPath, 'utf8');

  assert.ok(content.includes('slotId') || content.includes('slot_id'), 'BookingContext phải hỗ trợ tham số slotId');
  assert.ok(content.includes('availability_slots'), 'BookingContext phải cập nhật trạng thái bảng availability_slots');
  assert.ok(content.includes('is_booked'), 'Bắt buộc cập nhật cột is_booked của availability_slots khi học sinh đăng ký');
});
