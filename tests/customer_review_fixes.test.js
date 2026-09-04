import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// =============================================================================
// KIỂM THỬ PHẦN I: ĐĂNG KÝ HỌC SINH & TRẢI NGHIỆM ĐÁNH GIÁ, BỘ LỌC
// =============================================================================

test('PHẦN I - Mục 2: AuthModal có xác nhận mật khẩu và nút xem mật khẩu', () => {
  const authModalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'AuthModal.tsx');
  assert.ok(fs.existsSync(authModalPath), 'AuthModal.tsx phải tồn tại');
  const content = fs.readFileSync(authModalPath, 'utf8');

  // Kiểm tra import icon mắt
  assert.ok(content.includes('Eye') && content.includes('EyeOff'), 'Phải import Eye và EyeOff icon');

  // Kiểm tra state confirmPassword và showPassword
  assert.ok(content.includes('confirmPassword'), 'Phải có state confirmPassword');
  assert.ok(content.includes('showPassword'), 'Phải có state showPassword');
  assert.ok(content.includes('showConfirmPassword'), 'Phải có state showConfirmPassword');

  // Kiểm tra validation mật khẩu khớp
  assert.ok(
    content.includes('cleanPass !== cleanConfirmPass') || content.includes('cleanPass !== confirmPassword'),
    'Phải validate mật khẩu xác nhận khớp với mật khẩu đăng ký'
  );
});

test('PHẦN I - Mục 4: AuthModal truyền emailRedirectTo để tránh lỗi This site can’t be reached', () => {
  const authModalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'AuthModal.tsx');
  const content = fs.readFileSync(authModalPath, 'utf8');

  assert.ok(
    content.includes('emailRedirectTo'),
    'supabase.auth.signUp phải truyền options.emailRedirectTo để điều hướng chính xác'
  );
});

test('PHẦN I - Mục 5: TeacherDetailPage kiểm tra điều kiện học thử/chính thức trước khi đánh giá', () => {
  const teacherDetailPagePath = path.join(rootDir, 'src', 'app', 'pages', 'TeacherDetailPage.tsx');
  assert.ok(fs.existsSync(teacherDetailPagePath), 'TeacherDetailPage.tsx phải tồn tại');
  const content = fs.readFileSync(teacherDetailPagePath, 'utf8');

  assert.ok(
    content.includes('studentHasLearned'),
    'Phải có biến kiểm tra học viên đã tham gia học thử hoặc chính thức (studentHasLearned)'
  );
  assert.ok(
    content.includes('handleOpenReview'),
    'Nút viết đánh giá phải gọi hàm handleOpenReview kiểm soát quyền'
  );
});

test('PHẦN I - Mục 6: ReviewModal cấm ẩn danh và hiển thị họ tên học sinh đã xác thực', () => {
  const reviewModalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'ReviewModal.tsx');
  assert.ok(fs.existsSync(reviewModalPath), 'ReviewModal.tsx phải tồn tại');
  const content = fs.readFileSync(reviewModalPath, 'utf8');

  // Kiểm tra không còn fallback 'Học viên ẩn danh'
  assert.ok(
    !content.includes("|| 'Học viên ẩn danh'"),
    'Tuyệt đối không được fallback tự động sang Học viên ẩn danh'
  );

  // Kiểm tra xác thực họ tên bắt buộc
  assert.ok(
    content.includes('Không thể ẩn danh') || content.includes('nghiêm cấm đánh giá ẩn danh'),
    'Phải cảnh báo nghiêm cấm ẩn danh'
  );
  assert.ok(
    content.includes('Học viên chính thức') || content.includes('currentSession.fullName'),
    'Phải ưu tiên lấy tên thật tài khoản học sinh đã đăng nhập'
  );
});

test('PHẦN I - Mục 7: FindTutorsPage hỗ trợ 3 hình thức học và các quận trung tâm Hà Nội', () => {
  const findTutorsPath = path.join(rootDir, 'src', 'app', 'pages', 'FindTutorsPage.tsx');
  assert.ok(fs.existsSync(findTutorsPath), 'FindTutorsPage.tsx phải tồn tại');
  const content = fs.readFileSync(findTutorsPath, 'utf8');

  // Kiểm tra 3 hình thức
  assert.ok(content.includes('online'), 'Phải có hình thức online');
  assert.ok(content.includes('offline_student_home'), 'Phải có hình thức gia sư đến nhà học sinh');
  assert.ok(content.includes('offline_tutor_home'), 'Phải có hình thức học tại nhà/lớp của giáo viên');

  // Kiểm tra tập trung quận trung tâm Hà Nội
  assert.ok(content.includes('Cầu Giấy') && content.includes('Đống Đa') && content.includes('Ba Đình'), 'Phải có các quận trung tâm Hà Nội');
});

test('PHẦN I - Mục 9: TeacherDetailPage và TutorCard hiển thị rõ khu vực giảng dạy', () => {
  const detailPath = path.join(rootDir, 'src', 'app', 'pages', 'TeacherDetailPage.tsx');
  const homePath = path.join(rootDir, 'src', 'app', 'pages', 'HomePage.tsx');

  const detailContent = fs.readFileSync(detailPath, 'utf8');
  const homeContent = fs.readFileSync(homePath, 'utf8');

  assert.ok(
    detailContent.includes('Khu vực dạy') || detailContent.includes('Khu Vực Nhận Dạy'),
    'TeacherDetailPage phải hiển thị khu vực giảng dạy'
  );
  assert.ok(
    homeContent.includes('Khu vực giảng dạy') || homeContent.includes('teachingFormatsOffline'),
    'TutorCard trên HomePage/FindTutorsPage phải hiển thị khu vực giảng dạy'
  );
});

// =============================================================================
// KIỂM THỬ PHẦN II: ĐĂNG KÝ LÀM GIÁO VIÊN (TUTOR REGISTRATION)
// =============================================================================

test('PHẦN II - Mục 1: TutorRegistrationPage có 1 checkbox cam kết duy nhất', () => {
  const tutorRegPath = path.join(rootDir, 'src', 'app', 'pages', 'TutorRegistrationPage.tsx');
  assert.ok(fs.existsSync(tutorRegPath), 'TutorRegistrationPage.tsx phải tồn tại');
  const content = fs.readFileSync(tutorRegPath, 'utf8');

  assert.ok(content.includes('agreeAllTerms'), 'Phải có state agreeAllTerms');
  assert.ok(!content.includes('commitAccurate'), 'Không còn duy trì 3 checkbox tách rời (commitAccurate)');
  assert.ok(!content.includes('commitConduct'), 'Không còn duy trì 3 checkbox tách rời (commitConduct)');
  assert.ok(!content.includes('commitTerms'), 'Không còn duy trì 3 checkbox tách rời (commitTerms)');
});

test('PHẦN II - Mục 2: Có TutorTermsModal và link xem toàn văn điều khoản', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'TutorTermsModal.tsx');
  assert.ok(fs.existsSync(modalPath), 'TutorTermsModal.tsx phải tồn tại');

  const regPath = path.join(rootDir, 'src', 'app', 'pages', 'TutorRegistrationPage.tsx');
  const regContent = fs.readFileSync(regPath, 'utf8');

  assert.ok(regContent.includes('TutorTermsModal'), 'Phải import và render TutorTermsModal');
  assert.ok(regContent.includes('setShowTermsModal(true)'), 'Phải có nút bấm mở popup điều khoản');
});

test('PHẦN II - Mục 3: validatePartII bắt buộc phải tải lên Bằng tốt nghiệp hoặc Thẻ SV', () => {
  const regPath = path.join(rootDir, 'src', 'app', 'pages', 'TutorRegistrationPage.tsx');
  const regContent = fs.readFileSync(regPath, 'utf8');

  assert.ok(
    regContent.includes('!credentialPreview && !credentialFile'),
    'Phải kiểm tra cả preview và file đối với văn bằng/thẻ sinh viên trước khi cho submit'
  );
});

test('PHẦN II - Mục 4: kycService.ts xử lý an toàn lỗi RLS profiles và không gây alert lỗi', () => {
  const kycPath = path.join(rootDir, 'src', 'lib', 'kycService.ts');
  assert.ok(fs.existsSync(kycPath), 'kycService.ts phải tồn tại');
  const content = fs.readFileSync(kycPath, 'utf8');

  assert.ok(
    content.includes('emailRedirectTo'),
    'kycService phải truyền emailRedirectTo khi signUp gia sư'
  );
  assert.ok(
    content.includes('console.warn') || content.includes('pending_profile_'),
    'Phải có cơ chế xử lý ngoại lệ an toàn cho RLS profiles khi chưa kích hoạt email session'
  );
});

test('PHẦN II - Mục 5: TutorRegistrationPage có trường chọn Hình thức học và các Quận trung tâm Hà Nội', () => {
  const regPath = path.join(rootDir, 'src', 'app', 'pages', 'TutorRegistrationPage.tsx');
  const content = fs.readFileSync(regPath, 'utf8');

  assert.ok(content.includes('teachingFormats'), 'Phải có state teachingFormats');
  assert.ok(content.includes('selectedDistricts'), 'Phải có state selectedDistricts');
  assert.ok(content.includes('centralDistricts'), 'Phải có danh sách centralDistricts');
  assert.ok(
    content.includes('Cầu Giấy') && content.includes('Đống Đa') && content.includes('Thanh Xuân'),
    'Phải cho chọn các quận trung tâm Hà Nội'
  );
});
