import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '..');

test('DAY 1 - Package.json: Tên định danh dự án phải là "hantutor-web"', () => {
  const pkgPath = path.join(rootDir, 'package.json');
  assert.ok(fs.existsSync(pkgPath), 'package.json phải tồn tại');

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert.strictEqual(pkg.name, 'hantutor-web', 'Tên dự án trong package.json phải là hantutor-web');
  assert.notStrictEqual(pkg.name, '@figma/my-make-file', 'Không được giữ lại tên figma template');
  assert.ok(pkg.scripts?.build, 'Cần có script build');
  assert.ok(pkg.scripts?.dev, 'Cần có script dev');
  assert.ok(pkg.scripts?.test, 'Cần có script test');
});

test('DAY 1 - Environment: File .env.example và .env.local phải sẵn sàng', () => {
  const envExamplePath = path.join(rootDir, '.env.example');
  const envLocalPath = path.join(rootDir, '.env.local');

  assert.ok(fs.existsSync(envExamplePath), '.env.example phải tồn tại');
  assert.ok(fs.existsSync(envLocalPath), '.env.local phải tồn tại');

  const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
  assert.ok(envExampleContent.includes('VITE_SUPABASE_URL'), '.env.example thiếu VITE_SUPABASE_URL');
  assert.ok(envExampleContent.includes('VITE_SUPABASE_ANON_KEY'), '.env.example thiếu VITE_SUPABASE_ANON_KEY');
  assert.ok(envExampleContent.includes('VITE_GEMINI_API_KEY'), '.env.example thiếu VITE_GEMINI_API_KEY');

  const gitignorePath = path.join(rootDir, '.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  assert.ok(gitignoreContent.includes('.env*.local'), '.gitignore phải bảo vệ .env.local khỏi bị push lên git');
});

test('DAY 1 - Schema Database: Định nghĩa đủ 09 bảng quan hệ', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  assert.ok(fs.existsSync(schemaPath), 'supabase/schema.sql phải tồn tại');

  const sql = fs.readFileSync(schemaPath, 'utf8');
  const requiredTables = [
    'users',
    'profiles',
    'availability_slots',
    'achievements',
    'enrollments',
    'payments',
    'payout_requests',
    'reviews',
    'class_requests',
  ];

  for (const table of requiredTables) {
    const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i');
    assert.ok(tableRegex.test(sql), `Schema thiếu bảng: ${table}`);
  }
});

test('DAY 1 - Chống tranh chấp lịch: Hàm reserve_slot và release_slot phải có FOR UPDATE', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  assert.ok(sql.includes('CREATE OR REPLACE FUNCTION reserve_slot'), 'Thiếu hàm reserve_slot');
  assert.ok(sql.includes('CREATE OR REPLACE FUNCTION release_slot'), 'Thiếu hàm release_slot');
  assert.ok(sql.includes('FOR UPDATE'), 'reserve_slot bắt buộc phải có câu lệnh FOR UPDATE để chống race condition');
  assert.ok(sql.includes('SECURITY DEFINER'), 'Hàm stored procedure phải chạy với quyền SECURITY DEFINER');
});

test('DAY 1 - Bảo mật RLS: Tất cả bảng quan trọng phải kích hoạt Row Level Security', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const rlsTables = [
    'users',
    'profiles',
    'availability_slots',
    'achievements',
    'enrollments',
    'payments',
    'payout_requests',
    'reviews',
    'class_requests',
  ];

  for (const table of rlsTables) {
    const rlsRegex = new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`, 'i');
    assert.ok(rlsRegex.test(sql), `Bảng ${table} chưa được kích hoạt RLS`);
  }
});

test('DAY 1 - Supabase Module: Export đầy đủ client, helper và tên Storage Buckets', async () => {
  const supabaseTsPath = path.join(rootDir, 'src', 'lib', 'supabase.ts');
  assert.ok(fs.existsSync(supabaseTsPath), 'src/lib/supabase.ts phải tồn tại');

  const content = fs.readFileSync(supabaseTsPath, 'utf8');
  assert.ok(content.includes('export const supabase'), 'Phải export supabase client');
  assert.ok(content.includes('export const isSupabaseConfigured'), 'Phải export hàm isSupabaseConfigured');
  assert.ok(content.includes('STORAGE_BUCKETS'), 'Phải export hằng số STORAGE_BUCKETS');
  assert.ok(content.includes("'tutor-avatars'"), 'STORAGE_BUCKETS phải có tutor-avatars');
  assert.ok(content.includes("'tutor-kyc-docs'"), 'STORAGE_BUCKETS phải có tutor-kyc-docs');
});
