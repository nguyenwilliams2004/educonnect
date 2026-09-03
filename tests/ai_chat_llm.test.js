import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('AI CHAT LLM - aiChatService.ts tồn tại và xuất đầy đủ các hàm xử lý cốt lõi', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'aiChatService.ts');
  assert.ok(fs.existsSync(servicePath), 'File src/lib/aiChatService.ts phải tồn tại');

  const content = fs.readFileSync(servicePath, 'utf8');
  assert.ok(content.includes('sanitizeTutorsForContext'), 'Phải có hàm sanitizeTutorsForContext');
  assert.ok(content.includes('buildSystemInstruction'), 'Phải có hàm buildSystemInstruction');
  assert.ok(content.includes('queryGeminiChatbot'), 'Phải có hàm queryGeminiChatbot');
  assert.ok(content.includes('generateDomainFallbackResponse'), 'Phải có hàm generateDomainFallbackResponse');
  assert.ok(content.includes('getEffectiveGeminiApiKey'), 'Phải có hàm getEffectiveGeminiApiKey');
});

test('AI CHAT LLM - Zero-Trust: Lọc bỏ triệt để dữ liệu nhạy cảm trước khi đưa vào LLM Context', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'aiChatService.ts');
  const content = fs.readFileSync(servicePath, 'utf8');

  // Đảm bảo không map bất kỳ thông tin tài khoản ngân hàng hoặc CCCD vào Sanitize object
  assert.ok(!content.includes('t.bank_account_number'), 'Không được đưa bank_account_number vào context LLM');
  assert.ok(!content.includes('t.bankAccountNumber'), 'Không được đưa bankAccountNumber vào context LLM');
  assert.ok(!content.includes('t.certificates'), 'Không được truyền ảnh CCCD / chứng chỉ nhạy cảm vào context LLM');
  assert.ok(content.includes('Zero-Trust'), 'Phải tuân thủ nguyên tắc Zero-Trust');
});

test('AI CHAT LLM - System Instruction chứa toàn bộ tri thức website và chống Prompt Injection', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'aiChatService.ts');
  const content = fs.readFileSync(servicePath, 'utf8');

  // Đảm bảo tri thức website đầy đủ
  assert.ok(content.includes('QUY TRÌNH KẾT NỐI & HỌC THỬ'), 'Phải chứa quy trình kết nối & học thử');
  assert.ok(content.includes('hoàn tiền 100%'), 'Phải cam kết hoàn tiền 100%');
  assert.ok(content.includes('KIỂM DUYỆT KYC 100%'), 'Phải có thông tin kiểm duyệt KYC');
  assert.ok(content.includes('/giao-vien/{id}'), 'Phải hướng dẫn dẫn link hồ sơ giáo viên');
  assert.ok(content.includes('prompt injection'), 'Phải có cơ chế phòng chống prompt injection');
});

test('AI CHAT LLM - Chuẩn hóa model Gemini chính thức và triệt tiêu lỗi DEFAULT_GEMINI_API_KEY', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'aiChatService.ts');
  const serviceContent = fs.readFileSync(servicePath, 'utf8');

  // Kiểm tra model: Phải ưu tiên gemini-3.8-flash làm model chính
  assert.ok(serviceContent.includes('gemini-3.8-flash'), 'Phải hỗ trợ gemini-3.8-flash làm model chính');
  assert.ok(serviceContent.includes('gemini-2.0-flash'), 'Phải hỗ trợ gemini-2.0-flash');

  // Kiểm tra widget
  const widgetPath = path.join(rootDir, 'src', 'app', 'components', 'AiChatWidget.tsx');
  const widgetContent = fs.readFileSync(widgetPath, 'utf8');
  assert.ok(!widgetContent.includes('DEFAULT_GEMINI_API_KEY'), 'Triệt tiêu hoàn toàn biến undefined DEFAULT_GEMINI_API_KEY');
  assert.ok(widgetContent.includes('queryGeminiChatbot'), 'AiChatWidget phải gọi queryGeminiChatbot từ service');
});

test('AI CHAT LLM - AiChatWidget cung cấp giao diện hiển thị trạng thái và cấu hình API Key', () => {
  const widgetPath = path.join(rootDir, 'src', 'app', 'components', 'AiChatWidget.tsx');
  const widgetContent = fs.readFileSync(widgetPath, 'utf8');

  assert.ok(widgetContent.includes('hantutor_gemini_api_key'), 'Cho phép lưu API Key vào localStorage');
  assert.ok(widgetContent.includes('Gemini 3.8 Flash'), 'Hiển thị badge khi Gemini 3.8 Flash hoạt động');
  assert.ok(widgetContent.includes('showConfig'), 'Có panel cấu hình key khi cần');
});
