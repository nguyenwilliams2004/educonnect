# KẾ HOẠCH TỔNG THỂ PHÁT TRIỂN VÀ HOÀN THIỆN WEBSITE HANTUTOR (06 TUẦN)
## DỰ ÁN: WEBSITE NỀN TẢNG GIA SƯ VÀ QUẢN LÝ LỚP HỌC TRỰC TUYẾN HANTUTOR (FULL-STACK WEB DEVELOPMENT)

**Thời lượng thực hiện toàn diện:** 06 tuần (210 giờ làm việc tiêu chuẩn • 7 giờ/ngày, 5 ngày/tuần)  
**Mục tiêu trọng tâm ngắn hạn:** Hoàn thành mốc chạy thử nghiệm kín (Closed Pilot) cho nhóm 10 đến 20 giáo viên thực tế ngay sau 02 tuần đầu tiên.  
**Mục tiêu bàn giao chung:** Đóng kín toàn bộ chu trình nghiệp vụ (Dữ liệu Live, Google Auth, Lịch rảnh, Đặt lịch chống trùng lặp, Thanh toán VietQR tự động, Sổ cái 30/70, Email giao dịch và An toàn thông tin RLS) để bàn giao sản phẩm Turnkey Ready sẵn sàng ra mắt thị trường.

---

### PHẦN 1: BÁO CÁO HIỆN TRẠNG VÀ XỬ LÝ 05 ĐIỂM NGHẼN NỀN TẢNG

#### 1. Hiện trạng đã hoàn thành
* Giao diện người dùng (Frontend UI/UX) đã hoàn thành khoảng 85-90% bao gồm: 05 trang chính (`HomePage`, `FindTutorsPage`, `TeacherDetailPage`, `TutorRegistrationPage`, `AdminDashboardPage`) và 08 Modal nghiệp vụ.
* Đã thiết kế hoàn chỉnh file DDL cơ sở dữ liệu `supabase/schema.sql` (09 bảng quan hệ, RLS policies và Stored Procedures).
* Mã nguồn biên dịch thành công 100% (`npm run build` hoàn tất trong 4.32 giây).

#### 2. Năm điểm nghẽn kỹ thuật nền tảng được xử lý dứt điểm ngay trong Tuần 1
1. **Chuẩn hóa thông tin `package.json`:** Chuyển đổi tên dự án sang `hantutor-web` để chuẩn hóa môi trường triển khai.
2. **Khắc phục xung đột ID (UUID vs Mock ID):** Chuyển toàn bộ dữ liệu mẫu sang chuẩn UUID v4 để kích hoạt đúng các thao tác ghi dữ liệu vào PostgreSQL thật.
3. **Chuẩn hóa API VietQR quốc gia:** Chuyển đổi sang chuẩn Napas 24/7 (`https://img.vietqr.io/image/...`) với đầy đủ mã BIN ngân hàng và số tài khoản thụ hưởng.
4. **Đồng bộ phiên đăng nhập (Session Sync):** Thiết lập Supabase Auth làm nguồn xác thực duy nhất nhằm loại bỏ hiện tượng lệch vai trò khi tải lại trang.
5. **Kích hoạt Migration Live:** Chạy file `schema.sql` trực tiếp trên Supabase Dashboard để chấm dứt hoàn toàn việc sử dụng dữ liệu giả lập.

---

### PHẦN 2: TRỌNG TÂM ĐẶC BIỆT TRONG 02 TUẦN ĐẦU (MỐC CHẠY THỬ NGHIỆM KÍN)

Mục tiêu tối thượng của 02 tuần đầu tiên là đưa hệ sinh thái vào trạng thái hoạt động thực tế để nhóm 10–20 giáo viên có thể tham gia khởi tạo hồ sơ, cài đặt lịch dạy và nhận đơn học thử:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   MỤC TIÊU 02 TUẦN ĐẦU: ĐẠT MỐC PILOT TEST CHO GIÁO VIÊN               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Giáo viên đăng nhập trực tiếp bằng tài khoản Google thật.                            │
│ • Điền thông tin cá nhân, tiểu sử, môn dạy, mức học phí và số tài khoản ngân hàng.      │
│ • Cài đặt khung giờ rảnh hàng tuần trên ma trận lịch (lưu vào availability_slots).      │
│ • Tải ảnh đại diện và ảnh bằng cấp/CCCD lên Private Storage an toàn.                   │
│ • Sở hữu đường dẫn hồ sơ công khai (Profile URL) hiển thị chuẩn mực trên mọi thiết bị. │
│ • Nhận thông tin đăng ký học thử từ học sinh thử nghiệm.                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 📍 TUẦN 1: KÍCH HOẠT DATABASE LIVE, GOOGLE AUTH, TÊN MIỀN VÀ EDGE BOT SEO
* **Công việc cụ thể:**
  * Xử lý dứt điểm 05 điểm nghẽn kỹ thuật nền tảng; triển khai `schema.sql` lên PostgreSQL Supabase Live.
  * Khởi tạo 02 Storage Buckets: `tutor-avatars` (công khai) và `tutor-kyc-docs` (riêng tư).
  * Nạp dữ liệu Seeder chuẩn UUID cho 25+ hồ sơ gia sư thực tế mẫu.
  * Mua tên miền website; cấu hình các bản ghi DNS (DKIM, SPF, DMARC, MX) trên Resend từ sớm để hoàn tất xác thực 24h.
  * Tích hợp Google OAuth 2.0 và Email Auth vào `AuthModal`/`AuthContext`; thiết lập Route Guard bảo vệ `/admin`.
  * Viết Vercel Edge Middleware nhận diện bot tìm kiếm (Googlebot, Facebook, Zalo) để trả thẻ OpenGraph động phục vụ Web SEO.
* **Tiêu chí nghiệm thu (DoD Tuần 1):**
  * Toàn bộ 05 điểm nghẽn nền tảng được triệt tiêu 100%.
  * Cơ sở dữ liệu Live hoạt động ổn định với dữ liệu thật.
  * Tên miền đạt chứng nhận Verified trên Resend.
  * Đăng nhập Google 1-chạm hoạt động chính xác.

#### 📍 TUẦN 2: QUẢN LÝ LỊCH RẢNH (SLOTS), ĐĂNG KÝ GIA SƯ KYC VÀ MỞ PILOT TEST
* **Công việc cụ thể:**
  * Tái cấu trúc `TutorContext` và `DataContext` sang truy vấn Supabase SDK thật; xóa bỏ hoàn toàn dữ liệu mock.
  * Nối biểu mẫu đăng ký (`TutorRegistrationPage`) và cập nhật hồ sơ (`TeacherProfileModal`) vào Supabase Storage.
  * Tích hợp giao diện ma trận chọn khung giờ rảnh lưu trực tiếp vào bảng `availability_slots`.
  * **Tiến hành mở đợt Pilot Test:** Mời 10–20 giáo viên tham gia tạo tài khoản, hoàn thiện hồ sơ, cài đặt lịch dạy rảnh và tải lên tài liệu KYC.
  * Thu thập phản hồi ban đầu về trải nghiệm nhập liệu và giao diện hiển thị trên các dòng điện thoại khác nhau.
* **Tiêu chí nghiệm thu (DoD Tuần 2):**
  * 100% trang tìm kiếm tải dữ liệu từ PostgreSQL dưới 300ms.
  * 10–20 giáo viên thử nghiệm hoàn thiện hồ sơ thật trên hệ thống Live thành công.
  * Hồ sơ gia sư mới lưu vào cơ sở dữ liệu ở trạng thái chờ duyệt (`verified = false`), ảnh CCCD nằm an toàn trong bucket riêng tư.

---

### PHẦN 3: LỘ TRÌNH TRIỂN KHAI HOÀN THIỆN CÁC TUẦN TIẾP THEO (TUẦN 3 - TUẦN 6)

#### 📍 TUẦN 3: ĐẶT LỊCH HỌC THỬ TTL 5 PHÚT, REALTIME NOTIFICATION VÀ ADMIN DUYỆT KYC
* **Công việc cụ thể:**
  * Kết nối `EnrollmentModal` và `BookingContext` với hàm Stored Procedure `reserve_slot()`: Tạm giữ chỗ khung giờ trong 05 phút chống trùng lặp; tự động nhả slot nếu quá thời gian mà không cần can thiệp thủ công.
  * Kích hoạt Supabase Realtime Channel gửi thông báo tức thì đến Gia sư và Quản trị viên khi có lịch hẹn mới.
  * Nâng cấp `AdminDashboardPage`: Xem trước ảnh CCCD/Bằng cấp qua Signed URL bảo mật (hạn 05 phút); nút Phê duyệt (`verified = true`) hoặc Từ chối kèm lý do.
* **Tiêu chí nghiệm thu (DoD Tuần 3):**
  * Triệt tiêu 100% rủi ro trùng lịch giữa các học sinh; Gia sư và Quản trị viên nhận thông báo thời gian thực; Quản trị viên duyệt KYC thành công qua Signed URL.

#### 📍 TUẦN 4: TỰ ĐỘNG HÓA CỔNG VIETQR PAYOS WEBHOOK VÀ SỔ CÁI DOANH THU 30/70
* **Công việc cụ thể:**
  * Sinh mã VietQR động chuẩn ngân hàng trên `CheckoutModal` chứa đúng số tiền học phí và cú pháp `HT_{ENROLLMENT_ID}`.
  * Viết Supabase Edge Function `payos-webhook-handler`: Xác thực chữ ký số HMAC-SHA256 và cơ chế Idempotency chống nạp tiền 02 lần; tự động chuyển trạng thái đơn sang `enrolled`.
  * Tự động phân tách dòng tiền: 30% thuộc về nền tảng HanTutor và 70% cộng vào số dư thù lao của gia sư phụ trách.
  * Xây dựng chức năng "Yêu cầu rút tiền" (`payout_requests`) cho gia sư và bảng đối soát cho Quản trị viên trên Admin Dashboard (sử dụng khóa giao dịch `SELECT ... FOR UPDATE` chống race condition).
* **Tiêu chí nghiệm thu (DoD Tuần 4):**
  * Quét mã QR chuyển tiền thật -> Webhook bắt giao dịch trong 02 giây và tự kích hoạt trạng thái ghi danh; Doanh thu và số dư ví tính toán chính xác 100%, không bị sai lệch.

#### 📍 TUẦN 5: KÍCH HOẠT RESEND TRANSACTIONAL EMAIL, TRỢ LÝ AI VÀ ĐÁNH GIÁ VERIFIED
* **Công việc cụ thể:**
  * Tích hợp Resend API gửi email HTML tiêu chuẩn thương hiệu HanTutor tự động trong 03 trường hợp: Phụ huynh đặt lịch học thử, Gia sư có học sinh mới và Biên lai thanh toán học phí thành công.
  * Viết Supabase Edge Function proxy cho Trợ lý AI Gemini nhằm bảo mật tuyệt đối `VITE_GEMINI_API_KEY` và thiết lập hạn mức truy cập (Rate Limit: 15 yêu cầu/phút).
  * Áp dụng cơ chế Verified Reviews: Chỉ những học sinh đã hoàn tất thanh toán khóa học (`status = 'enrolled'`) mới được cấp quyền gửi đánh giá sao cho gia sư; tính năng tự động tính lại điểm rating trung bình.
* **Tiêu chí nghiệm thu (DoD Tuần 5):**
  * Email giao dịch gửi thẳng vào hộp thư Inbox trong 03 giây; Trợ lý AI trên web vận hành an toàn; Học sinh chưa học chính thức không thể gửi đánh giá ảo.

#### 📍 TUẦN 6: BẢO MẬT PENTEST, TỐI ƯU WEB RESPONSIVE, SEO SCHEMA VÀ BÀN GIAO TURNKEY
* **Công việc cụ thể:**
  * Rà soát toàn diện 100% các chính sách Row Level Security (RLS) trên cả 09 bảng dữ liệu PostgreSQL.
  * Kiểm thử phòng chống các lỗ hổng website theo tiêu chuẩn OWASP Top 10: XSS (sử dụng `DOMPurify`), SQL Injection, CSRF và lỗ hổng đọc trộm dữ liệu chéo (IDOR).
  * Tối ưu hóa Web Responsive trên Desktop, Laptop, Tablet và Mobile Browser; Code Splitting và nén ảnh WebP đạt điểm Google Lighthouse: Performance > 90, Accessibility > 95, Best Practices > 95, SEO = 100.
  * Kích hoạt sao lưu tự động hàng ngày (Daily Automated Database Backups); tích hợp hệ thống giám sát sự cố Sentry; thực hiện diễn tập khôi phục dữ liệu (Disaster Recovery Drill) dưới 10 phút.
  * Hoàn thiện tài liệu hướng dẫn vận hành, đối soát và xử trị website chi tiết (`ADMIN_RUNBOOK.md`).
* **Tiêu chí nghiệm thu (DoD Tuần 6):**
  * Website đạt điểm Lighthouse > 90; Zero lỗ hổng bảo mật; Toàn bộ hệ thống website đạt tiêu chuẩn bàn giao trọn gói (Turnkey Web Product), sẵn sàng vận hành thương mại ngay lập tức.

---

### PHẦN 4: MA TRẬN QUẢN TRỊ RỦI RO VÀ GIẢI PHÁP KỸ THUẬT TRIỆT ĐỂ

| RỦI RO TIỀM ẨN | MỨC ĐỘ | GIẢI PHÁP KỸ THUẬT TRIỆT ĐỂ |
| :--- | :---: | :--- |
| **Trùng lặp lịch dạy của Gia sư** | Cao | Áp dụng cơ chế giữ chỗ tạm thời 05 phút (`locked_until TIMESTAMPTZ`) và khóa giao dịch cơ sở dữ liệu (`SELECT ... FOR UPDATE`). |
| **Gian lận trạng thái thanh toán** | Nghiêm trọng | Cấm tuyệt đối quyền sửa trạng thái đơn hàng từ Client Web; Chỉ chấp nhận kết quả thanh toán từ Webhook có chữ ký số bí mật HMAC-SHA256. |
| **Rút tiền vượt quá số dư ví** | Nghiêm trọng | Tính toán số dư khả dụng tức thời trên cơ sở dữ liệu bằng công thức: `Tổng thu nhập 70% - Tổng tiền đã chi trả`, lưu nhật ký kiểm toán bất biến. |
| **Lộ lọt thông tin CCCD / Bằng cấp** | Cao | Lưu trữ tài liệu trên Private Storage Bucket; chỉ sinh đường dẫn truy cập tạm thời (Signed URL có hạn 05 phút) khi Quản trị viên tiến hành xét duyệt trên Admin Dashboard. |
| **Lộ lọt khóa bảo mật (API Keys)** | Nghiêm trọng | Toàn bộ khóa bảo mật (Gemini AI, Supabase Service Role, Resend Secret Key) đều được lưu trữ và thực thi tại Edge Functions, không xuất hiện ở mã nguồn Frontend Web. |
| **Email thông báo bị đánh dấu Spam** | Trung bình | Đăng ký tên miền website và hoàn tất cấu hình các bản ghi xác thực DNS (DKIM, SPF, DMARC, MX) ngay từ Tuần 1 để làm ấm danh tiếng gửi thư của tên miền. |

---

### PHẦN 5: TIÊU CHUẨN NGHIỆM THU VÀ BÀN GIAO WEBSITE (DEFINITION OF DONE)

Mỗi phân hệ tính năng web trước khi bàn giao bắt buộc phải thỏa mãn đầy đủ 05 tiêu chí cốt lõi:
1. **Tính đúng đắn về chức năng:** Vận hành trơn tru, hiển thị chuẩn xác trên mọi trình duyệt web (Chrome, Safari, Edge, Firefox) và mọi kích thước màn hình.
2. **Tính an toàn bảo mật:** Được bảo vệ chặt chẽ bởi PostgreSQL RLS, xác thực phân quyền nghiêm ngặt, tuyệt đối không để lộ khóa bí mật.
3. **Tính toàn vẹn tài chính:** Không phát sinh bất kỳ sai lệch nào trong quá trình tự động phân chia doanh thu 30/70 và đối soát lệnh rút tiền.
4. **Hiệu năng tải trang web:** Thời gian phản hồi và tải trang trung bình dưới 1.5 giây, đạt chuẩn Google Lighthouse tối ưu.
5. **Tài liệu bàn giao:** Mã nguồn website được chú thích rõ ràng, đi kèm bộ tài liệu hướng dẫn vận hành và xử trị sự cố đầy đủ (`ADMIN_RUNBOOK.md`).

---

### PHẦN 6: KẾT LUẬN VÀ CAM KẾT TRIỂN KHAI

Bản kế hoạch 06 tuần tinh gọn phân bổ nguồn lực hợp lý, tập trung giải quyết dứt điểm các bài toán thực tế ngay trong 02 tuần đầu để mở đợt thử nghiệm Pilot cho giáo viên, tạo nền tảng vững chắc cho các phân hệ thanh toán và bảo mật tiếp theo. Dự án được cam kết bàn giao đúng hạn 1.5 tháng với chất lượng kỹ thuật cao nhất.
