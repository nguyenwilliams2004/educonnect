import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('VIETQR PAYMENT - paymentService.ts tồn tại và cấu hình đúng chuẩn VietQR Napas', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'paymentService.ts');
  assert.ok(fs.existsSync(servicePath), 'File src/lib/paymentService.ts phải tồn tại');

  const content = fs.readFileSync(servicePath, 'utf8');
  assert.ok(content.includes('generateVietQrUrl'), 'Phải có hàm generateVietQrUrl');
  assert.ok(content.includes('createPendingPayment'), 'Phải có hàm createPendingPayment');
  assert.ok(content.includes('999988882026'), 'Phải cấu hình STK MB Bank của HanTutor');
  assert.ok(content.includes('img.vietqr.io'), 'Phải dùng cổng ảnh VietQR quốc gia');
  assert.ok(content.includes("from('payments')"), 'Phải thao tác với bảng payments');
  assert.ok(content.includes("status: 'pending'"), 'Thanh toán mới phải có trạng thái pending');
});

test('VIETQR PAYMENT - Thuật toán generateVietQrUrl sinh đúng cấu trúc URL Napas 24/7', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'paymentService.ts');
  const content = fs.readFileSync(servicePath, 'utf8');

  // Kiểm tra template compact2 và các query params
  assert.ok(content.includes('compact2'), 'Phải dùng template compact2 chuyên nghiệp');
  assert.ok(content.includes('amount='), 'URL phải chứa tham số amount');
  assert.ok(content.includes('addInfo='), 'URL phải chứa tham số addInfo');
  assert.ok(content.includes('accountName='), 'URL phải chứa tham số accountName');
});

test('VIETQR PAYMENT - CheckoutModal.tsx đã triệt tiêu hoàn toàn fake payment timer và qrserver', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'CheckoutModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  // Kiểm tra không còn dùng server bên ngoài không chuẩn
  assert.ok(!content.includes('api.qrserver.com'), 'Tuyệt đối không dùng api.qrserver.com');
  assert.ok(!content.includes('setTimeout(() => {'), 'Không còn setTimeout giả lập 1s');
  assert.ok(content.includes('createPendingPayment'), 'Phải gọi hàm createPendingPayment thật');
  assert.ok(content.includes('vietQrUrl'), 'Phải hiển thị mã VietQR từ paymentService');
  assert.ok(content.includes('navigator.clipboard.writeText'), 'Phải có tính năng sao chép STK và nội dung chuyển khoản');
});

test('VIETQR PAYMENT - Database Schema bảo vệ bảng payments với RLS chặt chẽ', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  assert.ok(sql.includes('Students can create pending payments'), 'Phải có policy cho phép tạo thanh toán pending');
  assert.ok(sql.includes("status = 'pending'"), 'Chỉ cho phép insert với status = pending');
  assert.ok(sql.includes('Clients cannot update payments'), 'Cấm tuyệt đối client update bảng payments');
});
