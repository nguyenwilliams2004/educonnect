import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('WALLET LEDGER - WalletContext kết nối bảng payout_requests và payments trên Supabase', () => {
  const walletCtxPath = path.join(rootDir, 'src', 'context', 'WalletContext.tsx');
  assert.ok(fs.existsSync(walletCtxPath), 'File src/context/WalletContext.tsx phải tồn tại');

  const content = fs.readFileSync(walletCtxPath, 'utf8');

  // Kiểm tra truy vấn bảng payout_requests và payments
  assert.ok(content.includes("from('payout_requests')"), 'Phải thao tác với bảng payout_requests');
  assert.ok(content.includes("from('payments')"), 'Phải thao tác với bảng payments');
  assert.ok(content.includes('.insert({'), 'Phải insert bản ghi rút tiền mới');
  assert.ok(content.includes("status: 'pending'"), 'Yêu cầu rút tiền mới phải có status pending');
  assert.ok(content.includes("status: 'transferred'"), 'Phải có logic cập nhật status transferred');
});

test('WALLET LEDGER - requestWithdrawal chặn rút tiền vượt quá số dư khả dụng', () => {
  const walletCtxPath = path.join(rootDir, 'src', 'context', 'WalletContext.tsx');
  const content = fs.readFileSync(walletCtxPath, 'utf8');

  assert.ok(content.includes('amount > current.balance'), 'Phải kiểm tra amount > current.balance');
  assert.ok(content.includes('Số dư ví khả dụng không đủ'), 'Phải báo lỗi khi số dư không đủ');
});

test('WALLET LEDGER - Phân tách thông tin ngân hàng an toàn từ chuỗi bankInfo', () => {
  const walletCtxPath = path.join(rootDir, 'src', 'context', 'WalletContext.tsx');
  const content = fs.readFileSync(walletCtxPath, 'utf8');

  assert.ok(content.includes("bankInfo.split('-')"), 'Phải phân tách chuỗi bankInfo theo dấu gạch ngang');
  assert.ok(content.includes('bank_name: bankName'), 'Phải lưu bank_name vào CSDL');
  assert.ok(content.includes('bank_account_number: bankAccountNumber'), 'Phải lưu bank_account_number vào CSDL');
  assert.ok(content.includes('bank_account_name: bankAccountName'), 'Phải lưu bank_account_name vào CSDL');
});

test('WALLET LEDGER - Duy trì tính tương thích ngược cho Mock ID demo t1', () => {
  const walletCtxPath = path.join(rootDir, 'src', 'context', 'WalletContext.tsx');
  const content = fs.readFileSync(walletCtxPath, 'utf8');

  assert.ok(content.includes('DEFAULT_WALLET'), 'Phải giữ DEFAULT_WALLET làm fallback');
  assert.ok(content.includes("t1: DEFAULT_WALLET"), 'Phải khởi tạo key t1');
});

test('WALLET LEDGER - TeacherWalletModal đã chuyển sang async/await xử lý kết quả thật', () => {
  const modalPath = path.join(rootDir, 'src', 'app', 'components', 'modals', 'TeacherWalletModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');

  assert.ok(content.includes('const handleWithdraw = async ('), 'handleWithdraw phải là async');
  assert.ok(content.includes('await requestWithdrawal('), 'Phải await requestWithdrawal');
  assert.ok(!content.includes('setTimeout(() => {'), 'Không còn setTimeout giả lập');
});
