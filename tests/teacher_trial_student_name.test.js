import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

test('TEACHER TRIAL STUDENT NAME - BookingContext hiển thị rõ tên học sinh trên giao diện giáo viên', () => {
  const bookingPath = path.join(rootDir, 'src', 'context', 'BookingContext.tsx');
  const content = fs.readFileSync(bookingPath, 'utf8');

  // 1. enrollmentToTrial phải gán tên học sinh khi isTeacher = true
  assert.ok(
    content.includes('const displayStudentTitle = rawStudentName.startsWith'),
    'enrollmentToTrial phải chuẩn hóa tiền tố tên học sinh'
  );
  assert.ok(
    content.includes('isTeacher ? displayStudentTitle :'),
    'tutorName phải là tên học sinh khi xem với tư cách giáo viên'
  );

  // 2. teacherTrialRecord phải có tutorName là Học sinh: ${studentName}
  assert.ok(
    content.includes("tutorName: `Học sinh: ${studentName}`"),
    'teacherTrialRecord phải định danh rõ ràng tên học sinh'
  );

  // 3. Phân tách bộ nhớ đệm: Giáo viên lưu hantutor_teacher_student_trials, học sinh lưu hantutor_trials_${userId}
  assert.ok(
    content.includes('hantutor_teacher_student_trials'),
    'Phải có kho lưu trữ danh sách học viên riêng cho giáo viên'
  );
  assert.ok(
    content.includes('instructorUuid'),
    'Phải ánh xạ ID giáo viên sang UUID hợp lệ để lưu vào Supabase enrollments'
  );
});

test('TEACHER TRIAL STUDENT NAME - MyTrialsModal lọc sạch bookmark học sinh và hiển thị đúng thông tin học viên', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'MyTrialsModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  // 1. Phải có cơ chế lọc bỏ bookmark của học sinh khi giáo viên đăng nhập
  assert.ok(
    content.includes('tutorNames.has(item.tutorName'),
    'MyTrialsModal phải loại bỏ các bản ghi giáo viên bị lẫn từ phiên học sinh'
  );

  // 2. Xác định cardTitle và cardAvatar cho học sinh
  assert.ok(
    content.includes('cardTitle = isTeacher'),
    'MyTrialsModal phải tính toán cardTitle ưu tiên tên học sinh'
  );
  assert.ok(
    content.includes('cardAvatar = isTeacher'),
    'MyTrialsModal phải hiển thị avatar học sinh khi ở vai trò giáo viên'
  );

  // 3. Nút Zalo kết nối học sinh
  assert.ok(
    content.includes("isTeacher ? 'Zalo Học sinh' : 'Zalo Thầy/Cô'"),
    'Nút Zalo phải đổi nhãn thành Zalo Học sinh khi ở vai trò giáo viên'
  );
});

test('TEACHER TRIAL STUDENT NAME - AuthModal hỗ trợ tài khoản kiểm thử nhanh (Demo Test Accounts)', () => {
  const authModalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'AuthModal.tsx');
  const content = fs.readFileSync(authModalPath, 'utf8');

  assert.ok(
    content.includes('giaovien.demo@gmail.com'),
    'AuthModal phải tích hợp email giáo viên demo sẵn sàng test'
  );
  assert.ok(
    content.includes('hocsinh.demo@gmail.com'),
    'AuthModal phải tích hợp email học sinh demo sẵn sàng test'
  );
  assert.ok(
    content.includes('HanTutor2026!@#'),
    'AuthModal phải có mật khẩu kiểm thử chuẩn'
  );
});
