-- =============================================================================
-- HANTUTOR SUPABASE SEED DATA (Chuẩn UUID v4 & Dữ liệu Gia sư Thực tế)
-- Chạy toàn bộ file này trên Supabase SQL Editor sau khi đã chạy schema.sql
-- =============================================================================

-- Xóa dữ liệu cũ nếu có (Tránh trùng lặp UUID)
DELETE FROM reviews WHERE id IS NOT NULL;
DELETE FROM payments WHERE id IS NOT NULL;
DELETE FROM enrollments WHERE id IS NOT NULL;
DELETE FROM achievements WHERE id IS NOT NULL;
DELETE FROM class_requests WHERE id IS NOT NULL;
DELETE FROM profiles WHERE id IS NOT NULL;
DELETE FROM users WHERE id IS NOT NULL;

-- 1. SEED BẢNG USERS (10 Giáo viên hàng đầu)
INSERT INTO users (id, email, full_name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'suongmai.nguvan@hantutor.vn', 'Cô Sương Mai', 'instructor'),
('00000000-0000-0000-0000-000000000002', 'thanhtai.dialy@hantutor.vn', 'Thầy Thành Tài', 'instructor'),
('00000000-0000-0000-0000-000000000003', 'minhthang.hoahoc@hantutor.vn', 'Thầy Minh Thắng', 'instructor'),
('00000000-0000-0000-0000-000000000004', 'trungkien.sinhhoc@hantutor.vn', 'Thầy Trung Kiên', 'instructor'),
('00000000-0000-0000-0000-000000000005', 'tiendat.toanhoc@hantutor.vn', 'Thầy Tiến Đạt', 'instructor'),
('00000000-0000-0000-0000-000000000006', 'maiphuong.tienganh@hantutor.vn', 'Cô Mai Phương', 'instructor'),
('00000000-0000-0000-0000-000000000007', 'ngocanh.vatly@hantutor.vn', 'Thầy Ngọc Anh', 'instructor'),
('00000000-0000-0000-0000-000000000008', 'thanhtuan.laptrinh@hantutor.vn', 'Thầy Thanh Tuấn', 'instructor'),
('00000000-0000-0000-0000-000000000009', 'thutrang.tiengtrung@hantutor.vn', 'Cô Thu Trang', 'instructor'),
('00000000-0000-0000-0000-000000000010', 'khanhlinh.piano@hantutor.vn', 'Cô Khánh Linh', 'instructor')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 2. SEED BẢNG PROFILES
INSERT INTO profiles (
  id, avatar_url, subjects, skills, category_type, provider_type,
  target_tags, success_story, levels, price, price_unit,
  location, district, ward, address, online, rating, reviews_count,
  experience, education, bio, intro, schedule, certificates, verified,
  bank_name, bank_account_number, bank_account_name
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
  ARRAY['Ngữ văn', 'Luyện thi vào 10', 'Ôn thi THPT Quốc gia', 'Văn học Nâng cao'],
  ARRAY['Sơ đồ tư duy Văn học', 'Nghị luận xã hội thực chiến', 'Tư duy cảm xúc & Phân tích tác phẩm'],
  'Học tập văn hóa', '1-1',
  ARRAY['Mục tiêu 8.5+ Ngữ văn', 'Bứt phá điểm số thi THPT', 'Vào 10 Chuyên Hà Nội'],
  '98% học sinh đạt điểm 8+ trong kỳ thi THPT Quốc gia 2025. Hơn 45 em đỗ Chuyên Sư Phạm & Chuyên Hà Nội - Amsterdam.',
  ARRAY['Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12', 'Luyện thi Đại học'],
  250000, 'giờ',
  'Hà Nội (Cầu Giấy, Đống Đa, Ba Đình)', 'Cầu Giấy', 'Dịch Vọng Hậu', 'Trần Thái Tông',
  true, 5.0, 48, 8,
  'Thạc sĩ Lý luận & Phương pháp dạy học Ngữ văn - ĐH Sư phạm Hà Nội',
  'Thạc sĩ Ngữ văn với 8 năm kinh nghiệm giảng dạy và luyện thi đại học chuyên sâu. Tác giả phương pháp "Sơ đồ tư duy cảm xúc" giúp học sinh yêu thích môn Văn.',
  'Xin chào các bậc phụ huynh và các em học sinh! Với phương châm "Học Văn bằng cảm xúc thật và tư duy logic", cô cam kết đồng hành giúp học sinh vượt qua nỗi sợ môn Văn.',
  ARRAY['T2: 19h-21h', 'T4: 19h-21h', 'T6: 18h-20h', 'CN: 08h-10h'],
  ARRAY['Bằng Thạc sĩ Sư phạm Xuất sắc', 'Chứng chỉ Nghiệp vụ Sư phạm Quốc tế', 'Đã xác thực CCCD & Bằng cấp'],
  true, 'Vietcombank', '0011004567899', 'NGUYEN THI SUONG MAI'
),
(
  '00000000-0000-0000-0000-000000000002',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop',
  ARRAY['Địa lý', 'Ôn thi THPT Quốc gia', 'Địa lý Kinh tế'],
  ARRAY['Kỹ năng đọc Atlat 100% điểm', 'Phân tích bảng số liệu & biểu đồ', 'Tư duy địa lý thực tế'],
  'Học tập văn hóa', '1-1',
  ARRAY['Mục tiêu 9+ Địa lý', 'Thủ khoa khối C00'],
  'Đã hướng dẫn 12 em đạt điểm 10 môn Địa lý trong 3 kỳ thi THPT gần nhất.',
  ARRAY['Lớp 11', 'Lớp 12', 'Luyện thi Tốt nghiệp'],
  220000, 'giờ',
  'Hà Nội (Thanh Xuân, Hà Đông, Nam Từ Liêm)', 'Thanh Xuân', 'Nhân Chính', 'Lê Văn Lương',
  true, 5.0, 36, 6,
  'Cử nhân Sư phạm Địa lý - Đại học Quốc gia Hà Nội',
  'Thầy Thành Tài chuyên gia huấn luyện bí kíp Atlat đạt điểm tối đa mà không cần học vẹt.',
  'Địa lý không phải là môn học vẹt, đó là môn khoa học ứng dụng trực quan và cực kỳ thú vị.',
  ARRAY['T3: 18h-20h', 'T5: 18h-20h', 'T7: 14h-16h'],
  ARRAY['Giáo viên dạy giỏi cấp Quận', 'Đã xác thực CCCD'],
  true, 'Techcombank', '19033456789012', 'LE THANH TAI'
),
(
  '00000000-0000-0000-0000-000000000003',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
  ARRAY['Hóa học', 'Hóa 10-12', 'Luyện thi Đánh giá năng lực HSA/V-ACT'],
  ARRAY['Phương pháp quy đổi Este', 'Bảo toàn Electron nâng cao', 'Giải nhanh trắc nghiệm Hóa'],
  'Học tập văn hóa', '1-1',
  ARRAY['Mục tiêu 9+ Khối A/B', 'Đỗ Đại học Y Dược'],
  'Hơn 80 học sinh đỗ các trường ĐH Y Hà Nội, Dược Hà Nội, Bách Khoa.',
  ARRAY['Lớp 10', 'Lớp 11', 'Lớp 12', 'Luyện thi HSA'],
  260000, 'giờ',
  'Hà Nội (Hai Bà Trưng, Hoàn Kiếm, Hoàng Mai)', 'Hai Bà Trưng', 'Bách Khoa', 'Đại Cồ Việt',
  true, 5.0, 52, 9,
  'Thạc sĩ Hóa học - Đại học Bách Khoa Hà Nội',
  'Slogan: "Có thầy Thắng - Đơn giản Hóa". Chuyên gia bẻ khóa các câu hỏi phân loại 9+ Hóa học.',
  'Hóa học là cầu nối của tư duy định lượng và phản xạ thực nghiệm.',
  ARRAY['T2: 18h-20h', 'T4: 18h-20h', 'T7: 09h-11h', 'CN: 15h-17h'],
  ARRAY['Thạc sĩ Hóa học Bách Khoa', 'Chứng chỉ Giáo viên Ưu tú'],
  true, 'MB Bank', '098877665544', 'TRAN MINH THANG'
),
(
  '00000000-0000-0000-0000-000000000004',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
  ARRAY['Sinh học', 'Sinh học 12', 'Bồi dưỡng học sinh giỏi'],
  ARRAY['Giải bài tập Phả hệ siêu tốc', 'Di truyền học phân tử', 'Sơ đồ tư duy Sinh học'],
  'Học tập văn hóa', '1-1',
  ARRAY['Chinh phục Khối B00', 'Vào Y Đa Khoa'],
  'Giúp học sinh từ mất gốc đạt 8.5+ môn Sinh học chỉ sau 4 tháng kèm cặp 1-1.',
  ARRAY['Lớp 11', 'Lớp 12', 'Luyện thi Đại học'],
  240000, 'giờ',
  'Hà Nội (Nam Từ Liêm, Bắc Từ Liêm, Cầu Giấy)', 'Nam Từ Liêm', 'Mỹ Đình', 'Lê Đức Thọ',
  true, 5.0, 29, 5,
  'Bác sĩ Đa khoa - Đại học Y Hà Nội',
  'Ứng dụng tư duy y khoa trực quan vào giảng dạy kiến thức Sinh học THPT.',
  'Hiểu bản chất tế bào và quy luật di truyền sẽ thấy môn Sinh học vô cùng gần gũi.',
  ARRAY['T3: 19h-21h', 'T5: 19h-21h', 'CN: 14h-16h'],
  ARRAY['Bằng Tốt nghiệp Bác sĩ Đa khoa', 'Đã xác minh CCCD'],
  true, 'BIDV', '21510001234567', 'NGUYEN TRUNG KIEN'
),
(
  '00000000-0000-0000-0000-000000000005',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
  ARRAY['Toán học', 'Toán 10-12', 'Hình học Không gian', 'Giải tích'],
  ARRAY['Bấm máy Casio thực chiến', 'Tư duy hình học không gian đa chiều', 'Công thức tính nhanh cực trị'],
  'Học tập văn hóa', '1-1',
  ARRAY['Mục tiêu 9+ Toán', 'Đỗ Ngoại Thương & Kinh Tế Quốc Dân'],
  'Hơn 120 học sinh đạt 9+ môn Toán THPT 2024 & 2025.',
  ARRAY['Lớp 10', 'Lớp 11', 'Lớp 12', 'Luyện thi Đại học'],
  280000, 'giờ',
  'Hà Nội (Đống Đa, Ba Đình, Hoàn Kiếm)', 'Đống Đa', 'Láng Thượng', 'Chùa Láng',
  true, 5.0, 64, 10,
  'Thạc sĩ Toán học - ĐH Khoa học Tự nhiên Hà Nội',
  'Thầy Đạt với phong cách giảng dạy hài hước, biến Toán học trừu tượng thành các bài toán thực tế dễ nhớ.',
  'Toán học là nghệ thuật rèn luyện tư duy sắc bén cho cả cuộc đời.',
  ARRAY['T2: 19h-21h', 'T4: 19h-21h', 'T6: 19h-21h', 'CN: 09h-11h'],
  ARRAY['Thạc sĩ Toán học', 'Kỷ niệm chương Vì sự nghiệp giáo dục'],
  true, 'Vietcombank', '0021008899776', 'HOANG TIEN DAT'
),
(
  '00000000-0000-0000-0000-000000000006',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
  ARRAY['Tiếng Anh', 'IELTS 7.5+', 'Tiếng Anh Giao tiếp', 'Tiếng Anh THPT'],
  ARRAY['IELTS 8.5 Overall', 'Phát âm chuẩn IPA Mỹ', 'Chiến thuật Reading & Listening'],
  'Ngoại ngữ', '1-1',
  ARRAY['Bứt phá IELTS 7.5+', 'Săn học bổng du học'],
  'Hơn 60 học sinh đạt chứng chỉ IELTS 7.0 - 8.0 chỉ sau khóa học 6 tháng.',
  ARRAY['Mọi cấp độ', 'Học sinh Cấp 2, 3', 'Người đi làm', 'Luyện thi IELTS'],
  350000, 'giờ',
  'Hà Nội (Tây Hồ, Cầu Giấy, Ba Đình)', 'Tây Hồ', 'Quảng An', 'Xuân Diệu',
  true, 5.0, 78, 7,
  'Thạc sĩ TESOL - University of Melbourne (Úc)',
  'Cô Mai Phương sở hữu IELTS 8.5 và chứng chỉ giảng dạy quốc tế CELTA.',
  'Học tiếng Anh là mở ra cánh cửa kết nối với cả thế giới.',
  ARRAY['T3: 18h-20h', 'T5: 18h-20h', 'T7: 09h-11h'],
  ARRAY['IELTS 8.5 Certificate', 'CELTA Cambridge', 'Thạc sĩ TESOL'],
  true, 'VPBank', '1987654321', 'LE MAI PHUONG'
),
(
  '00000000-0000-0000-0000-000000000007',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
  ARRAY['Vật lý', 'Vật lý 10-12', 'Điện xoay chiều', 'Dao động cơ'],
  ARRAY['Vòng tròn lượng giác đa trục', 'Bản chất hiện tượng vật lý', 'Kỹ thuật đồ thị Vật lý'],
  'Học tập văn hóa', '1-1',
  ARRAY['Mục tiêu 9+ Khối A/A1', 'Đỗ Bách Khoa & Công Nghệ'],
  'Giúp hơn 90 học sinh khối A00/A01 đạt điểm 9+ môn Vật lý.',
  ARRAY['Lớp 10', 'Lớp 11', 'Lớp 12', 'Luyện thi Quốc Gia'],
  250000, 'giờ',
  'Hà Nội (Hà Đông, Thanh Xuân, Nam Từ Liêm)', 'Hà Đông', 'Mộ Lao', 'Trần Phú',
  true, 5.0, 41, 8,
  'Thạc sĩ Vật lý Lý thuyết - Đại học Sư phạm Hà Nội',
  'Thầy Ngọc Anh - Chuyên gia trực quan hóa các hiện tượng sóng và điện từ trường.',
  'Hiểu thấu bản chất vật lý giúp các em giải quyết mọi bài toán phức tạp.',
  ARRAY['T2: 18h-20h', 'T6: 18h-20h', 'CN: 14h-16h'],
  ARRAY['Bằng Thạc sĩ Sư phạm', 'Giáo viên Giỏi cấp Thành phố'],
  true, 'Techcombank', '19022334455667', 'VU NGOC ANH'
),
(
  '00000000-0000-0000-0000-000000000008',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
  ARRAY['Lập trình', 'Python cho người mới', 'Frontend React & TypeScript', 'Thuật toán'],
  ARRAY['Clean Code & Design Patterns', 'Thực chiến Fullstack Project', 'Kèm 1-1 chữa bài chi tiết'],
  'Công nghệ & Kỹ năng', '1-1',
  ARRAY['Chuyển ngành IT thành công', 'Pass phỏng vấn Fresher/Junior'],
  'Hơn 40 học viên đã đi làm tại các công ty công nghệ lớn như FPT, Viettel, VNPT.',
  ARRAY['Học sinh cấp 3', 'Sinh viên CNTT', 'Người chuyển ngành'],
  300000, 'giờ',
  'Hà Nội (Cầu Giấy, Nam Từ Liêm, Thanh Xuân)', 'Cầu Giấy', 'Mai Dịch', 'Hồ Tùng Mậu',
  true, 5.0, 31, 6,
  'Senior Software Engineer - Kỹ sư CNTT ĐH Bách Khoa Hà Nội',
  'Kèm 1-1 code thực tế, review pull request và luyện phỏng vấn kỹ thuật trực tiếp.',
  'Lập trình là công cụ biến mọi ý tưởng thành hiện thực.',
  ARRAY['T3: 20h-22h', 'T5: 20h-22h', 'T7: 15h-17h', 'CN: 15h-17h'],
  ARRAY['AWS Certified Solutions Architect', 'Kỹ sư CNTT Bách Khoa'],
  true, 'Vietcombank', '0451000332211', 'NGUYEN THANH TUAN'
),
(
  '00000000-0000-0000-0000-000000000009',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
  ARRAY['Tiếng Trung', 'HSK 1-6', 'Tiếng Trung Thương Mại', 'Giao tiếp Cấp tốc'],
  ARRAY['Phát âm Pinyin chuẩn Bắc Kinh', 'Phương pháp nhớ chữ Hán qua bộ thủ', 'Đàm phán thương mại'],
  'Ngoại ngữ', '1-1',
  ARRAY['Đỗ HSK 5 trong 6 tháng', 'Làm việc cho tập đoàn Trung Quốc'],
  '95% học viên thi đỗ HSK/HSKK với điểm số trên 240/300 ngay lần thi đầu tiên.',
  ARRAY['Học sinh', 'Sinh viên', 'Người đi làm', 'Luyện thi HSK'],
  230000, 'giờ',
  'Hà Nội (Thanh Xuân, Hoàng Mai, Hai Bà Trưng)', 'Thanh Xuân', 'Khương Trung', 'Vương Thừa Vũ',
  true, 5.0, 39, 5,
  'Thạc sĩ Hán ngữ Quốc tế - Đại học Bắc Kinh (Trung Quốc)',
  'Cô Thu Trang với 5 năm du học và sinh sống tại Bắc Kinh, kinh nghiệm luyện thi HSK 5, 6.',
  'Tiếng Trung không hề khó nếu bạn nắm vững quy luật chuyển hóa âm Hán Việt.',
  ARRAY['T2: 19h-21h', 'T4: 19h-21h', 'T6: 19h-21h'],
  ARRAY['HSK 6 (285/300)', 'Bằng Thạc sĩ Hán ngữ Bắc Kinh'],
  true, 'MB Bank', '091234567888', 'DO THU TRANG'
),
(
  '00000000-0000-0000-0000-000000000010',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
  ARRAY['Piano', 'Thanh nhạc', 'Cảm thụ Âm nhạc Trẻ em', 'Piano Đệm hát'],
  ARRAY['Phương pháp Suzuki Piano', 'Thị tấu & Xướng âm', 'Kiên nhẫn & Truyền cảm hứng cho bé'],
  'Năng khiếu & Nghệ thuật', '1-1',
  ARRAY['Tự tin biểu diễn piano', 'Thi chứng chỉ ABRSM'],
  'Đã giảng dạy hơn 80 bé từ 5-15 tuổi yêu thích đàn Piano và tự chơi được các bản nhạc cổ điển.',
  ARRAY['Trẻ em từ 5 tuổi', 'Người lớn mới bắt đầu', 'Luyện thi ABRSM'],
  280000, 'giờ',
  'Hà Nội (Cầu Giấy, Ba Đình, Tây Hồ)', 'Ba Đình', 'Liễu Giai', 'Kim Mã',
  true, 5.0, 45, 7,
  'Cử nhân Piano Biểu diễn - Học viện Âm nhạc Quốc gia Việt Nam',
  'Cô Linh chuyên dạy Piano cho trẻ em và người lớn với giáo trình chuẩn quốc tế ABRSM.',
  'Âm nhạc nuôi dưỡng tâm hồn và đánh thức trí sáng tạo tuyệt vời của trẻ nhỏ.',
  ARRAY['T3: 16h-18h', 'T5: 16h-18h', 'T7: 09h-11h', 'CN: 09h-11h'],
  ARRAY['Cử nhân Học viện Âm nhạc Quốc gia', 'ABRSM Grade 8 Piano'],
  true, 'Techcombank', '19028889990001', 'PHAM KHANH LINH'
)
ON CONFLICT (id) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  subjects = EXCLUDED.subjects,
  skills = EXCLUDED.skills,
  category_type = EXCLUDED.category_type,
  provider_type = EXCLUDED.provider_type,
  target_tags = EXCLUDED.target_tags,
  success_story = EXCLUDED.success_story,
  levels = EXCLUDED.levels,
  price = EXCLUDED.price,
  price_unit = EXCLUDED.price_unit,
  location = EXCLUDED.location,
  district = EXCLUDED.district,
  ward = EXCLUDED.ward,
  address = EXCLUDED.address,
  online = EXCLUDED.online,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  experience = EXCLUDED.experience,
  education = EXCLUDED.education,
  bio = EXCLUDED.bio,
  intro = EXCLUDED.intro,
  schedule = EXCLUDED.schedule,
  certificates = EXCLUDED.certificates,
  verified = EXCLUDED.verified,
  bank_name = EXCLUDED.bank_name,
  bank_account_number = EXCLUDED.bank_account_number,
  bank_account_name = EXCLUDED.bank_account_name;

-- 3. SEED BẢNG REVIEWS
INSERT INTO reviews (id, instructor_id, rating, comment, student_name) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5, 'Cô Mai dạy rất tận tình và tâm lý. Trong buổi học thử, cô đã chỉ ra ngay các lỗi diễn đạt và cách mở bài sáng tạo khiến con rất hào hứng.', 'Phụ huynh em Tuấn Anh'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 5, 'Nhờ phương pháp sơ đồ tư duy cảm xúc của cô, em đã không còn sợ các câu nghị luận xã hội nữa. Điểm thi thử khảo sát từ 6.5 lên 8.75!', 'Em Bảo Ngọc (Lớp 12)'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 5, 'Thầy Tài dạy cực kỳ cuốn hút và thực chiến! Bí kíp đọc Atlat của thầy giúp em làm đúng 100% các câu thực hành.', 'Nguyễn Minh Quân (Học sinh 12 chuyên)'),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 5, 'Đúng như slogan "Có thầy đơn giản Hóa", các bài tập este và bảo toàn electron hóc búa được thầy Thắng phân tích cực dễ hiểu.', 'Hoàng Đức Duy (Lớp 12 A1)'),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 5, 'Thầy Đạt dạy Toán tư duy cực đỉnh! Các bài toán hình không gian và hàm số cực trị được phân tích bản chất giúp em tăng điểm thần tốc.', 'Bùi Quang Huy (Lớp 12 Chuyên)'),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 5, 'Cô Mai Phương phát âm chuẩn và phương pháp từ vựng Spaced Repetition siêu hay. Em đã đạt 7.5 Overall IELTS!', 'Nguyễn Thảo Nhi (IELTS 7.5)'),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 5, 'Vòng tròn lượng giác đa trục của thầy Ngọc Anh đỉnh thực sự! Em hiểu ngay bản chất giao thoa sóng và dao động điều hòa.', 'Trần Bảo Nam (Khối A01)'),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', 5, 'Thầy Tuấn dạy code rất thực chiến và kiên nhẫn. Nhờ thầy mà em đã pass phỏng vấn Frontend Intern tại công ty công nghệ lớn!', 'Đặng Hoàng Nam (Sinh viên CNTT)')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BẢNG ACHIEVEMENTS (Bảng vàng thành tích)
INSERT INTO achievements (instructor_id, title, student_name, description, year) VALUES
('00000000-0000-0000-0000-000000000001', 'Thủ khoa Chuyên Sư Phạm Hà Nội môn Ngữ Văn', 'Lê Khánh Linh', 'Đạt 9.25 điểm môn Ngữ Văn kỳ thi vào 10 năm 2025', '2025'),
('00000000-0000-0000-0000-000000000005', 'Điểm 10 Tuyệt Đối môn Toán THPT Quốc Gia', 'Nguyễn Tiến Minh', 'Đỗ Á khoa Trường Đại học Bách Khoa Hà Nội (IT1)', '2025'),
('00000000-0000-0000-0000-000000000006', 'IELTS 8.0 Overall Sau 5 Tháng Kèm 1-1', 'Trần Quỳnh Trang', 'Listening: 8.5, Reading: 8.5, Writing: 7.5, Speaking: 7.5', '2025')
ON CONFLICT DO NOTHING;

-- 5. SEED BẢNG CLASS_REQUESTS (Yêu cầu tìm gia sư chung)
INSERT INTO class_requests (title, parent_name, subjects, format, location, sessions_per_week, budget, status, applicants_count) VALUES
('Tìm gia sư Toán & Lý ôn thi vào 10 Chuyên Cầu Giấy', 'Bác Minh Tuấn', ARRAY['Toán học', 'Vật lý'], 'Trực tiếp tại nhà', 'Cầu Giấy, Hà Nội', '3 buổi/tuần', '300.000đ/buổi', 'open', 5),
('Cần giáo viên luyện thi IELTS cấp tốc Target 7.0', 'Chị Lan Hương', ARRAY['Tiếng Anh', 'IELTS'], 'Online 1-1 qua Zoom', 'Toàn quốc (Online)', '2 buổi/tuần', '400.000đ/buổi', 'open', 8),
('Tìm gia sư Hóa học lớp 11 kèm lấy lại gốc', 'Anh Hoàng Long', ARRAY['Hóa học'], 'Trực tiếp tại nhà', 'Đống Đa, Hà Nội', '2 buổi/tuần', '250.000đ/buổi', 'open', 3);
