import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

test('TRIALS FEATURE - ContactZaloModal triệt tiêu hoàn toàn tự động ghi nhận khi chỉ mở modal', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'ContactZaloModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  // Không được phép auto-record trong useEffect khi vừa mở modal
  assert.ok(
    !content.includes('useEffect(() => {\n    if (isOpen && tutor && isLoggedIn) {\n      recordTrialContact(tutor);'),
    'ContactZaloModal không được tự động tạo bản ghi khi người dùng mới chỉ mở modal'
  );

  // Phải có hàm kích hoạt có chủ ý
  assert.ok(content.includes('handleConfirmTrial'), 'Phải có hàm handleConfirmTrial để lưu chủ động');
  assert.ok(content.includes('handleOpenZalo'), 'Phải có hàm handleOpenZalo để đồng bộ khi mở Zalo');
  assert.ok(content.includes('isRegistered'), 'Phải kiểm tra trạng thái giáo viên đã được đăng ký học thử hay chưa');
});

test('TRIALS FEATURE - BookingContext hỗ trợ dual-role query và lưu trữ chi tiết slotDay, slotTime', () => {
  const bookingPath = path.join(rootDir, 'src', 'context', 'BookingContext.tsx');
  const content = fs.readFileSync(bookingPath, 'utf8');

  // Kiểm tra interface StudentTrialItem
  assert.ok(content.includes('slotDay?: string;'), 'StudentTrialItem phải hỗ trợ trường slotDay');
  assert.ok(content.includes('slotTime?: string;'), 'StudentTrialItem phải hỗ trợ trường slotTime');
  assert.ok(content.includes('studentName?: string;'), 'StudentTrialItem phải hỗ trợ trường studentName');

  // Kiểm tra query cho cả Giáo viên (instructor_id) và Học sinh (student_id)
  assert.ok(content.includes('instructor_id'), 'BookingContext phải truy vấn theo instructor_id khi role là teacher');
  assert.ok(content.includes('student_id'), 'BookingContext phải truy vấn theo student_id khi role là student');

  // Kiểm tra hàm cập nhật trạng thái lớp học thử
  assert.ok(content.includes('updateTrialStatus'), 'BookingContext phải xuất hàm updateTrialStatus');
});

test('TRIALS FEATURE - MyTrialsModal có bộ lọc tab và hỗ trợ đầy đủ quyền cho cả Giáo viên và Học sinh', () => {
  const myTrialsPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'MyTrialsModal.tsx');
  const content = fs.readFileSync(myTrialsPath, 'utf8');

  // 1. Phải có bộ lọc trạng thái (All, In-progress, Enrolled)
  assert.ok(content.includes('activeTab') || content.includes('filterTab'), 'MyTrialsModal phải có bộ lọc trạng thái');
  assert.ok(content.includes('in_progress'), 'Phải có tab lọc lớp đang học thử / chờ dạy thử');
  assert.ok(content.includes('enrolled'), 'Phải có tab lọc lớp đã chính thức');

  // 2. Hiển thị khung giờ học thử đã hẹn
  assert.ok(content.includes('slotDay'), 'MyTrialsModal phải hiển thị ngày hẹn slotDay');
  assert.ok(content.includes('Lịch học thử:'), 'Phải có nhãn hiển thị lịch học thử cụ thể');

  // 3. Tương tác đa chiều
  assert.ok(content.includes('handleCancelTrial'), 'Phải có hàm hủy / xóa lớp học thử');
  assert.ok(content.includes('handleOpenReview'), 'Phải có hàm mở modal đánh giá giáo viên');
  assert.ok(content.includes('handleMarkTrialCompleted'), 'Giáo viên phải có nút xác nhận đã dạy thử');
});

test('TRIALS FEATURE - Navbar đồng bộ truy cập lớp học thử cho cả Giáo viên và Học sinh', () => {
  const navbarPath = path.join(rootDir, 'src', 'app', 'components', 'Navbar.tsx');
  const content = fs.readFileSync(navbarPath, 'utf8');

  assert.ok(content.includes('Lớp học thử của tôi'), 'Navbar phải có liên kết Lớp học thử của tôi');
  assert.ok(content.includes('Đơn học thử & Học viên'), 'Navbar teacher menu phải có mục Đơn học thử & Học viên');
});
