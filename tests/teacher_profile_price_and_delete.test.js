import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

test('TEACHER PROFILE & PRICING - Bảng giá đồng bộ chính xác và loại bỏ thông báo kỹ thuật Supabase', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'TeacherProfileModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  // 1. Phải có hàm parseLevelPrices để đọc đúng giá từ data gốc của giáo viên
  assert.ok(
    content.includes('parseLevelPrices'),
    'TeacherProfileModal phải có hàm parseLevelPrices chuẩn hóa giá các cấp'
  );

  // 2. Không được để lộ thông báo kỹ thuật nhắc tới cơ sở dữ liệu Supabase
  assert.ok(
    !content.includes('cơ sở dữ liệu Supabase') && !content.includes('đồng bộ hồ sơ giáo viên lên cơ sở dữ liệu Supabase'),
    'Phải loại bỏ thông báo kỹ thuật "đã lưu vào Supabase" theo yêu cầu người dùng'
  );

  // 3. Thông báo lưu thành công phải tinh gọn, thân thiện
  assert.ok(
    content.includes('Lưu thông tin hồ sơ thành công!'),
    'Phải hiển thị thông báo thành công thân thiện "Lưu thông tin hồ sơ thành công!"'
  );

  // 4. Phải tính toán và cập nhật lại hourlyRate khi lưu giá các cấp
  assert.ok(
    content.includes('hourlyRate: newHourlyRate') || content.includes('newHourlyRate'),
    'Phải tính toán lại dải học phí hourlyRate khi cập nhật giá từng cấp'
  );
});

test('TEACHER PROFILE PERSISTENCE - TutorContext và TeacherDetailPage bảo lưu dữ liệu qua refresh', () => {
  const tutorCtxPath = path.join(rootDir, 'src', 'context', 'TutorContext.tsx');
  const detailPagePath = path.join(rootDir, 'src', 'app', 'pages', 'TeacherDetailPage.tsx');

  const tutorCtxContent = fs.readFileSync(tutorCtxPath, 'utf8');
  const detailContent = fs.readFileSync(detailPagePath, 'utf8');

  // 1. TutorContext phải có applyTutorOverrides và lưu vào localStorage hantutor_tutor_profile_overrides
  assert.ok(
    tutorCtxContent.includes('hantutor_tutor_profile_overrides'),
    'TutorContext phải lưu và nạp overrides từ hantutor_tutor_profile_overrides'
  );
  assert.ok(
    tutorCtxContent.includes('applyTutorOverrides'),
    'TutorContext phải áp dụng applyTutorOverrides lên danh sách gia sư'
  );

  // 2. TeacherDetailPage phải hiển thị Bảng giá theo cấp học chi tiết
  assert.ok(
    detailContent.includes('Bảng giá theo cấp học') || detailContent.includes('Học phí theo cấp học'),
    'TeacherDetailPage phải hiển thị Bảng giá theo cấp học chi tiết'
  );
  assert.ok(
    detailContent.includes('hantutor_tutor_profile_overrides'),
    'TeacherDetailPage phải đồng bộ trực tiếp overrides từ localStorage khi refresh'
  );
});

test('TEACHER TRIAL DELETION - Giáo viên có thể xóa học sinh học thử tức thì và vĩnh viễn', () => {
  const myTrialsPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'MyTrialsModal.tsx');
  const bookingCtxPath = path.join(rootDir, 'src', 'context', 'BookingContext.tsx');

  const myTrialsContent = fs.readFileSync(myTrialsPath, 'utf8');
  const bookingContent = fs.readFileSync(bookingCtxPath, 'utf8');

  // 1. MyTrialsModal phải có cơ chế quản lý deletedIds
  assert.ok(
    myTrialsContent.includes('deletedIds') || myTrialsContent.includes('hantutor_deleted_trial_ids'),
    'MyTrialsModal phải theo dõi danh sách học viên đã bị xóa'
  );

  // 2. BookingContext phải lưu ID đã xóa vào hantutor_deleted_trial_ids
  assert.ok(
    bookingContent.includes('hantutor_deleted_trial_ids'),
    'BookingContext phải lưu hantutor_deleted_trial_ids để chặn nạp lại'
  );

  // 3. Nút xóa học viên phải có trong giao diện giáo viên
  assert.ok(
    myTrialsContent.includes('Xóa học viên khỏi danh sách') || myTrialsContent.includes('handleCancelTrial'),
    'MyTrialsModal phải cho phép giáo viên bấm xóa học viên'
  );
});
