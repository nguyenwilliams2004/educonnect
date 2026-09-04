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

test('TEACHER TRIAL STUDENT NAME - AuthContext định danh chính xác Cô Sương Mai và AuthModal giữ UI Production tinh gọn', () => {
  const authCtxPath = path.join(rootDir, 'src', 'context', 'AuthContext.tsx');
  const authCtxContent = fs.readFileSync(authCtxPath, 'utf8');

  // Kiểm tra liên kết tài khoản giáo viên tới Cô Sương Mai
  assert.ok(
    authCtxContent.includes('isCoSuongMai'),
    'AuthContext phải nhận diện tài khoản Cô Sương Mai'
  );
  assert.ok(
    authCtxContent.includes("cleanName = isCoSuongMai\n      ? 'Cô Sương Mai'"),
    'AuthContext phải chuẩn hóa họ tên Cô Sương Mai không dính chữ Demo'
  );
  assert.ok(
    authCtxContent.includes('photo-1544005313-94ddf0286df2'),
    'AuthContext phải dùng đúng avatar của Cô Sương Mai'
  );

  // Kiểm tra AuthModal tuyệt đối không để lộ debug UI / nút test ra màn hình đăng nhập người dùng
  const authModalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'AuthModal.tsx');
  const authModalContent = fs.readFileSync(authModalPath, 'utf8');

  assert.ok(
    !authModalContent.includes('Tài khoản Test nghiệm thu'),
    'AuthModal phải là giao diện Production sạch, không để lộ UI test cho người dùng cuối'
  );
});
