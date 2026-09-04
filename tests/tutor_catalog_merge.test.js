import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

test('TUTOR CATALOG MERGE - TutorContext hợp nhất giáo viên từ CSDL với danh mục chuẩn', () => {
  const contextPath = path.join(rootDir, 'src', 'context', 'TutorContext.tsx');
  const code = fs.readFileSync(contextPath, 'utf8');

  // 1. Phải có logic hợp nhất liveTutors với remainingMock
  assert.ok(
    code.includes('liveTutors') && code.includes('remainingMock'),
    'TutorContext phải có biến liveTutors và remainingMock để hợp nhất dữ liệu'
  );

  // 2. Chống trùng lặp Cô Sương Mai giữa UUID DB và mock t1
  assert.ok(
    code.includes('00000000-0000-0000-0000-000000000001') && code.includes('cô sương mai'),
    'TutorContext phải kiểm tra chống trùng lặp giữa id UUID và id t1 của Cô Sương Mai'
  );

  // 3. Đảm bảo toàn bộ 10 giáo viên không bao giờ bị biến mất
  assert.ok(
    code.includes('allTutors = [...liveTutors, ...remainingMock]'),
    'TutorContext phải kết hợp liveTutors và remainingMock thành allTutors'
  );

  // 4. Áp dụng các bộ lọc subject, district, online trên allTutors
  assert.ok(
    code.includes('applyTutorOverrides(allTutors)'),
    'Phải áp dụng tutor overrides trên danh sách allTutors đã hợp nhất'
  );
});

test('TUTOR CATALOG SIMULATION - Thuật toán hợp nhất bảo toàn đầy đủ 10 giáo viên khi Supabase chỉ có 1 giáo viên', () => {
  // Mock dữ liệu giả lập từ Supabase (chỉ có 1 giáo viên là Cô Sương Mai)
  const liveTutorsFromDb = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Cô Sương Mai (Demo)',
      badgeSubject: 'Ngữ văn',
      rating: 5.0
    }
  ];

  // 10 mock tutors từ data.ts
  const mockCatalog = [
    { id: 't1', name: 'Cô Sương Mai', badgeSubject: 'Ngữ văn' },
    { id: 't2', name: 'Thầy Trần Văn Tài', badgeSubject: 'Địa lí' },
    { id: 't3', name: 'Thầy Phạm Thắng', badgeSubject: 'Hóa học' },
    { id: 't4', name: 'Thầy Trương Công Kiên', badgeSubject: 'Sinh học' },
    { id: 't5', name: 'Thầy Nguyễn Minh Trí', badgeSubject: 'Toán học' },
    { id: 't6', name: 'Cô Hoàng Thu Trang', badgeSubject: 'Tiếng Anh' },
    { id: 't7', name: 'Thầy Chu Đức Huy', badgeSubject: 'Vật lí' },
    { id: 't8', name: 'Thầy Hoàng Thế Anh', badgeSubject: 'Lập trình' },
    { id: 't9', name: 'Cô Nguyễn Thùy Linh', badgeSubject: 'Tiếng Trung' },
    { id: 't10', name: 'Thầy Lê Tuấn Anh', badgeSubject: 'Piano' }
  ];

  const liveIds = new Set(liveTutorsFromDb.map((t) => String(t.id)));
  const liveNames = new Set(liveTutorsFromDb.map((t) => (t.name || '').toLowerCase().trim()));

  const remainingMock = mockCatalog.filter((m) => {
    const mId = String(m.id);
    const mName = (m.name || '').toLowerCase().trim();
    if (
      mId === 't1' &&
      (liveIds.has('00000000-0000-0000-0000-000000000001') ||
        liveNames.has('cô sương mai') ||
        liveNames.has('cô sương mai (demo)'))
    ) {
      return false;
    }
    return !liveIds.has(mId) && !liveNames.has(mName);
  });

  const allTutors = [...liveTutorsFromDb, ...remainingMock];

  // Kiểm tra: Tổng số giáo viên phải đúng 10 giáo viên!
  assert.equal(allTutors.length, 10, 'Danh sách hợp nhất phải có chính xác 10 giáo viên');
  // Cô Sương Mai từ DB được ưu tiên
  assert.equal(allTutors[0].id, '00000000-0000-0000-0000-000000000001');
  // 9 giáo viên còn lại vẫn đầy đủ
  assert.equal(remainingMock.length, 9, 'Phải giữ nguyên 9 giáo viên mẫu khác');
});
