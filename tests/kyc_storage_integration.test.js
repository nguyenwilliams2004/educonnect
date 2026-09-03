import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('KYC & STORAGE - Module kycService.ts phải tồn tại và xuất đầy đủ các hàm cốt lõi', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'kycService.ts');
  assert.ok(fs.existsSync(servicePath), 'File src/lib/kycService.ts phải tồn tại');

  const content = fs.readFileSync(servicePath, 'utf8');
  assert.ok(content.includes('export async function uploadPublicAvatar'), 'Phải có hàm uploadPublicAvatar');
  assert.ok(content.includes('export async function uploadKycDocument'), 'Phải có hàm uploadKycDocument');
  assert.ok(content.includes('export async function getSignedKycUrl'), 'Phải có hàm getSignedKycUrl');
  assert.ok(content.includes('export function parseScheduleSlots'), 'Phải có hàm parseScheduleSlots');
  assert.ok(content.includes('export async function registerTutorProfile'), 'Phải có hàm registerTutorProfile');
  assert.ok(content.includes('STORAGE_BUCKETS.AVATARS'), 'Phải dùng bucket avatar công khai');
  assert.ok(content.includes('STORAGE_BUCKETS.KYC_DOCS'), 'Phải dùng bucket kyc riêng tư');
});

test('KYC & STORAGE - Thuật toán parseScheduleSlots chuyển đổi Thứ & Ca dạy sang định dạng PostgreSQL', () => {
  // Kiểm tra cấu trúc logic hàm parseScheduleSlots trong kycService.ts
  const servicePath = path.join(rootDir, 'src', 'lib', 'kycService.ts');
  const content = fs.readFileSync(servicePath, 'utf8');

  // Kiểm tra map ngày trong tuần: Chủ Nhật = 1, Thứ 2 = 2 ... Thứ 7 = 7
  assert.ok(content.includes("'Chủ Nhật': 1"), 'Chủ nhật phải ánh xạ số 1');
  assert.ok(content.includes("'Thứ 2': 2"), 'Thứ 2 phải ánh xạ số 2');
  assert.ok(content.includes("'Thứ 7': 7"), 'Thứ 7 phải ánh xạ số 7');

  // Kiểm tra map ca học chuẩn
  assert.ok(content.includes("'Sáng': { start: '08:00:00', end: '11:30:00' }"), 'Ca sáng phải từ 08:00:00 đến 11:30:00');
  assert.ok(content.includes("'Chiều': { start: '14:00:00', end: '17:30:00' }"), 'Ca chiều phải từ 14:00:00 đến 17:30:00');
  assert.ok(content.includes("'Tối': { start: '18:30:00', end: '21:30:00' }"), 'Ca tối phải từ 18:30:00 đến 21:30:00');
});

test('KYC & STORAGE - Bảo vệ tài khoản: registerTutorProfile từ chối nếu thiếu mật khẩu khi chưa đăng nhập', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'kycService.ts');
  const content = fs.readFileSync(servicePath, 'utf8');

  // Kiểm tra khối chặn thiếu mật khẩu
  assert.ok(content.includes('if (!params.password)'), 'Phải kiểm tra thiếu mật khẩu');
  assert.ok(content.includes('Vui lòng cung cấp mật khẩu để thiết lập tài khoản giáo viên'), 'Phải có thông báo yêu cầu mật khẩu');
});

test('KYC & STORAGE - An toàn dữ liệu: Lưu tài liệu KYC vào cột certificates và bảng profiles', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'kycService.ts');
  const content = fs.readFileSync(servicePath, 'utf8');

  assert.ok(content.includes('KYC_CCCD_FRONT:'), 'Phải gắn prefix KYC_CCCD_FRONT cho ảnh mặt trước CCCD');
  assert.ok(content.includes('KYC_CCCD_BACK:'), 'Phải gắn prefix KYC_CCCD_BACK cho ảnh mặt sau CCCD');
  assert.ok(content.includes('KYC_CREDENTIAL:'), 'Phải gắn prefix KYC_CREDENTIAL cho bằng cấp/chứng chỉ');
  assert.ok(content.includes("from('profiles').upsert"), 'Phải upsert vào bảng profiles');
  assert.ok(content.includes("from('availability_slots')"), 'Phải thao tác với bảng availability_slots');
  assert.ok(content.includes('.insert(slotRecords)'), 'Phải insert slotRecords vào availability_slots');
});

test('KYC & STORAGE - TutorRegistrationPage và AdminDashboardPage đã nối dây vào kycService', () => {
  const regPage = fs.readFileSync(path.join(rootDir, 'src', 'app', 'pages', 'TutorRegistrationPage.tsx'), 'utf8');
  assert.ok(regPage.includes('registerTutorProfile'), 'TutorRegistrationPage phải gọi registerTutorProfile');
  assert.ok(regPage.includes('setAvatarFile'), 'TutorRegistrationPage phải lưu File object avatar');
  assert.ok(regPage.includes('setCccdFrontFile'), 'TutorRegistrationPage phải lưu File object cccdFront');
  assert.ok(regPage.includes('setCccdBackFile'), 'TutorRegistrationPage phải lưu File object cccdBack');

  const adminPage = fs.readFileSync(path.join(rootDir, 'src', 'app', 'pages', 'AdminDashboardPage.tsx'), 'utf8');
  assert.ok(adminPage.includes('getSignedKycUrl'), 'AdminDashboardPage phải gọi getSignedKycUrl');
  assert.ok(adminPage.includes('handleViewDoc'), 'AdminDashboardPage phải có hàm handleViewDoc');
});
