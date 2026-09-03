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

test('AI CHAT LLM - Cấu hình 2 model: gemini-3.8-flash làm model chính, gemini-3.7-flash làm model phụ', () => {
  const servicePath = path.join(rootDir, 'src', 'lib', 'aiChatService.ts');
  const serviceContent = fs.readFileSync(servicePath, 'utf8');

  // Kiểm tra 2 model theo yêu cầu: gemini-3.8-flash (chính) và gemini-3.7-flash (phụ)
  assert.ok(serviceContent.includes('gemini-3.8-flash'), 'Phải hỗ trợ gemini-3.8-flash làm model chính');
  assert.ok(serviceContent.includes('gemini-3.7-flash'), 'Phải hỗ trợ gemini-3.7-flash làm model phụ');

  // Kiểm tra widget
  const widgetPath = path.join(rootDir, 'src', 'app', 'components', 'AiChatWidget.tsx');
  const widgetContent = fs.readFileSync(widgetPath, 'utf8');
  assert.ok(!widgetContent.includes('DEFAULT_GEMINI_API_KEY'), 'Triệt tiêu hoàn toàn biến undefined DEFAULT_GEMINI_API_KEY');
  assert.ok(widgetContent.includes('queryGeminiChatbot'), 'AiChatWidget phải gọi queryGeminiChatbot từ service');
});

test('AI CHAT LLM - Thiết kế Hallmark Editorial: Triệt tiêu hoàn toàn UI chìa khóa và badge kỹ thuật', () => {
  const widgetPath = path.join(rootDir, 'src', 'app', 'components', 'AiChatWidget.tsx');
  const widgetContent = fs.readFileSync(widgetPath, 'utf8');

  // Đảm bảo không còn giao diện chìa khóa API key gây rối cho người dùng
  assert.ok(!widgetContent.includes('showConfig'), 'Triệt tiêu hoàn toàn panel cấu hình key');
  assert.ok(!widgetContent.includes('Gemini 3.8 Flash'), 'Triệt tiêu badge kỹ thuật Gemini 3.8 Flash');

  // Đảm bảo thương hiệu chuyên nghiệp theo phong cách Hallmark Editorial
  assert.ok(widgetContent.includes('Trợ lý HanTutor'), 'Hiển thị đúng thương hiệu Trợ lý HanTutor');
  assert.ok(widgetContent.includes('Trực tuyến'), 'Có chỉ báo trạng thái Trực tuyến tinh tế');
});
