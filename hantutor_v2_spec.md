# Hantutor v2 — Tài liệu bổ sung tính năng (bàn giao Dev)

Mục đích: liệt kê đầy đủ các tính năng còn thiếu so với bản thiết kế v2 hiện tại, để hoàn thiện đúng mô hình kinh doanh đã chốt. Nguyên tắc xuyên suốt: **Đây KHÔNG phải một danh bạ gia sư để lướt. Đây là nền tảng (1) ghép theo mục tiêu, (2) kiểm định tạo niềm tin, (3) giữ giao dịch qua nền tảng, (4) có hệ sinh thái lớp đông \+ quản lý lớp.** Mỗi tính năng bên dưới phục vụ một trong bốn trụ này.

**Ký hiệu ưu tiên:** P0 \= bắt buộc để chạy được bản đầu · P1 \= quan trọng, làm sớm · P2 \= làm sau khi có traction

---

## PHẦN A — SỬA NGAY TRÊN GIAO DIỆN HIỆN TẠI

### A1. Bỏ thông điệp khoe số lượng, thay bằng thông điệp chất lượng (P0)

- **Hiện tại:** "Hơn 10.000+ Gia sư & Học sinh đang kết nối".  
- **Vấn đề:** Đi ngược định vị cốt lõi (khan hiếm có kiểm định). Khoe số lượng \= giống mọi app đã chết.  
- **Sửa thành:** thông điệp nhấn kiểm định/chất lượng. Ví dụ: "Mọi gia sư đều qua kiểm định năng lực dạy" hoặc "Chỉ nhận X% gia sư đạt chuẩn". Con số nếu dùng phải là con số *chất lượng* (tỷ lệ đỗ, mức độ hài lòng), không phải *số lượng*.

### A2. Đổi nhãn nút hành động cho nhất quán (P0)

- Giữ "Mời dạy" (phía gia sư) và "Ứng tuyển" (phía lớp) — đã đúng, đều đi qua nền tảng.  
- **Tuyệt đối không** dùng nút mở lộ số điện thoại / liên hệ trực tiếp gia sư ở bất kỳ đâu trước khi giao dịch được ghi nhận (xem C1 — chống rò rỉ).

---

## PHẦN B — LUỒNG GHÉP THEO MỤC TIÊU (trụ cột khác biệt \#1)

### B1. Bổ sung trường "Mục tiêu" vào form Đăng yêu cầu (P0)

Form hiện có: môn, lớp, số buổi/tuần, hình thức, học phí, địa điểm, yêu cầu đặc biệt. **Còn thiếu trường quan trọng nhất:**

- **Mục tiêu học tập** (bắt buộc), dạng chọn nhanh:  
  - Lấy lại căn bản / mất gốc  
  - Nâng từ khá lên giỏi  
  - Luyện thi (vào 10 / vào ĐH / IELTS…) — kèm ô chọn kỳ thi & trường mục tiêu  
  - Học nâng cao / chuyên  
- **Mức điểm hiện tại → mức điểm mong muốn** (ví dụ: 5 → 8). Đây là dữ liệu lõi để match và để đo kết quả sau này.

### B2. Kết quả tìm kiếm \= danh sách ĐƯỢC GỢI Ý, không phải danh bạ để tự lướt (P1)

- Sau khi khai mục tiêu, hệ thống trả về danh sách gia sư/lớp **đã xếp hạng theo độ phù hợp với mục tiêu**, kèm nhãn giải thích ngắn ("Phù hợp: chuyên đưa HS từ TB lên khá, đúng khu vực").  
- Cơ chế: lọc cứng (môn, khu vực, ngân sách, cấp lớp) → xếp hạng mềm (độ khớp mục tiêu \+ chất lượng). Chạy tức thì (mili-giây), KHÔNG bắt user chờ.  
- **Không cần AI ở bước này.** Đây là filter \+ ranking theo tiêu chí. (AI đọc mô tả tự do là P2, xem B4.)

### B3. Hồ sơ gia sư phải gắn thẻ theo mục tiêu (P1)

Thẻ gia sư hiện chỉ có: sao, môn, khu vực, giá. **Bổ sung dữ liệu để match đúng:**

- Chuyên đưa học sinh từ mức nào → mức nào (VD: "mất gốc → khá", "khá → giỏi/chuyên")  
- Kỳ thi từng luyện & kết quả (số HS đỗ, trường)  
- Lịch trống thực tế (để match theo lịch học sinh)

### B4. (P2) Ô mô tả tự do \+ AI đọc hiểu

- Thêm ô "Mô tả thêm về con bạn" (tự do). Dùng LLM đọc hiểu → chuyển thành tiêu chí bổ sung cho ranking. Chi phí mỗi lần gọi rất nhỏ. Chỉ làm sau khi B1–B3 chạy ổn.

---

## PHẦN C — KIỂM ĐỊNH & NIỀM TIN (trụ cột khác biệt \#2)

### C1. Phân biệt rõ 2 loại nhà cung cấp, 2 luồng kiểm định (P0)

Hệ thống phải phân loại và hiển thị khác nhau:

- **Gia sư 1-1:** kiểm định GẮT (chưa có bằng chứng thị trường). Cần: xác minh danh tính, đánh giá năng lực dạy (video dạy thử / xử lý tình huống mẫu), badge "Đã kiểm định năng lực".  
- **Giáo viên lớp đông:** KHÔNG kiểm định trình độ (đã được thị trường kiểm chứng qua lớp đông sẵn có). Chỉ cần xác minh danh tính \+ tư cách cơ bản. Badge khác: "GV có lớp — đã được học viên công nhận".  
- **Bắt buộc với cả hai:** một lớp xác minh tư cách/an toàn tối thiểu (không tiền sử vấn đề với học sinh).

### C2. Hiển thị bằng chứng kiểm định, không chỉ nhãn "Xác thực" (P1)

Nhãn "Xác thực" hiện quá mờ nhạt. Cần cho user *thấy* quy trình:

- Trang/section giải thích gia sư phải vượt qua những gì (minh bạch quy trình).  
- Nếu có: tỷ lệ gia sư bị từ chối (con số khan hiếm \= tín hiệu chất lượng).  
- Trên mỗi hồ sơ: thể hiện các bước kiểm định đã qua (checklist trực quan).

### C3. Kết quả thật của học sinh cũ trên hồ sơ (P1)

- Ngoài sao & số lượt đánh giá, thêm **câu chuyện kết quả** (có sự đồng ý): "HS từ 5.5 → 8.0 sau 3 tháng". Đây là bằng chứng chốt niềm tin mạnh nhất trong giáo dục.

### C4. Cơ chế học thử \+ bảo đảm đổi (P0)

- Nút chính không phải "liên hệ" mà là **"Đặt buổi học thử"** (qua nền tảng).  
- Cam kết rõ ràng hiển thị cho phụ huynh: **đổi gia sư miễn phí nếu buổi thử không phù hợp**. Đây vừa là risk reversal (chốt niềm tin) vừa là lý do đi qua nền tảng.

---

## PHẦN D — CHỐNG RÒ RỈ & GIỮ GIAO DỊCH (trụ cột \#3)

### D1. Thông tin liên hệ gia sư chỉ mở SAU khi đặt lịch qua nền tảng (P0)

- Không hiển thị SĐT/Zalo gia sư ở hồ sơ công khai.  
- Luồng: phụ huynh đặt buổi học thử qua nền tảng → hệ thống ghi nhận → mới kết nối 2 bên.

### D2. Xác nhận nhập học (P0)

- Sau buổi thử, hệ thống có bước xác nhận học sinh có nhập học không (trigger tính phí giới thiệu).  
- Cần cơ chế **gọi/nhắn phụ huynh xác nhận** (không chỉ dựa vào giáo viên báo — giáo viên có động cơ giấu để né phí).  
- Lưu trạng thái: đã thử / đã nhập học / không nhập học / đổi gia sư.

### D3. Thu học phí tháng đầu qua nền tảng (P0)

- Tích hợp cổng thanh toán VN. Học phí tháng đầu chạy qua nền tảng.  
- Hệ thống tự: giữ phí giới thiệu (% tháng đầu) → trừ ưu đãi tháng đầu cho HS → chuyển phần còn lại cho gia sư/GV.  
- **Kiểm tra cổng có hỗ trợ payout tự động (disbursement)** cho phần chuyển GV; nếu không, cần quy trình chuyển thủ công.

### D4. Attribution — ghi công nguồn học sinh (P0)

- Mỗi học sinh gắn nguồn (đến từ nền tảng / gia sư tự có), lưu vĩnh viễn.  
- Đây là cơ sở để tính phí và chống tranh chấp "học sinh này tự đến".

---

## PHẦN E — HỆ SINH THÁI LỚP ĐÔNG \+ PHẦN MỀM QUẢN LÝ (trụ cột \#4 — hiện đang THIẾU HOÀN TOÀN)

### E1. Luồng riêng cho giáo viên lớp đông (P1)

- Khác gia sư 1-1: một GV, nhiều HS, ít lớp nhưng sĩ số lớn.  
- Hồ sơ GV lớp đông: thông tin lớp, lịch, sĩ số, học phí/tháng (không phải /giờ).

### E2. Phần mềm quản lý lớp — công cụ nội bộ giữ chân (P1)

Đây là "chất keo" ràng buộc, KHÔNG bán như SaaS cạnh tranh MISA. Tính năng tối thiểu:

- Danh sách học sinh của lớp (tự động nhận HS được nền tảng giới thiệu — xem E3)  
- Điểm danh  
- Thu học phí định kỳ (qua cổng thanh toán) \+ theo dõi ai đã đóng/chưa  
- Gửi thông báo tự động cho phụ huynh (lịch, nhắc đóng phí) — qua Zalo/SMS  
- Báo cáo cơ bản cho GV

### E3. Ràng buộc "nhận học sinh" ↔ "quản lý lớp" (P1)

Đây là cơ chế lõi vừa thiết kế. Bắt buộc thể hiện trong sản phẩm:

- Học sinh nền tảng giới thiệu **đổ thẳng vào** phần mềm quản lý của GV (không phải 2 hệ thống rời).  
- GV muốn nhận HS từ nền tảng thì tiếp nhận qua công cụ này → phần mềm trở thành *cửa* vào dòng cung, không phải sản phẩm mua rời.  
- Định giá phần mềm quản lý ở mức thị trường (tham chiếu MISA \~4tr/năm), KHÔNG cố kiếm lời trực tiếp từ nó — nó giữ chân để Hoang tiếp tục thu phí giới thiệu.

### E4. Cơ chế chiết khấu chéo (P2)

- GV dùng phần mềm quản lý → phí giới thiệu mỗi HS thấp hơn; không dùng → cao hơn. Làm việc dùng-cả-hai rẻ hơn dùng-riêng.

---

## PHẦN F — TÀI KHOẢN & VAI TRÒ (nền tảng kỹ thuật)

### F1. Phân vai rõ (P0)

4 vai: Phụ huynh/Học sinh · Gia sư 1-1 · Giáo viên lớp đông · Admin (Hoang/vận hành). Mỗi vai một dashboard riêng.

### F2. Dashboard Admin cho vận hành (P0)

- Duyệt/kiểm định hồ sơ gia sư (hàng đợi chờ duyệt)  
- Xem trạng thái từng ca match (đã thử / nhập học / rò rỉ nghi ngờ)  
- Quản lý dòng tiền: phí giới thiệu đã thu, payout cho GV, ưu đãi đã chi  
- Theo dõi 4 chỉ số cốt lõi: số đăng yêu cầu, số đặt học thử, số nhập học, tỷ lệ chuyển đổi giữa các bước

### F3. Hệ thống chat trong nền tảng (P1)

- Đã có icon chat ở nav. Chat phải nằm TRONG nền tảng (không đẩy ra Zalo) — để giữ giao dịch và có dữ liệu.

---

## PHẦN G — ĐO LƯỜNG (đừng đo lượt xem)

Bắt buộc tracking 3 chỉ số phễu (không phải vanity metrics):

1. Số người **hoàn tất đăng yêu cầu** (đầu phễu thật)  
2. Số người **đặt buổi học thử** (ý định mua)  
3. Số người **nhập học thật** (nơi phát sinh doanh thu)  
+ Tỷ lệ rớt giữa mỗi bước (biết phễu rò ở đâu).

---

## GHI CHÚ ƯU TIÊN TỔNG THỂ CHO DEV

- **Làm trước (P0) để có bản chạy được, đúng mô hình:** A1, A2, B1, C1, C4, D1, D2, D3, D4, F1, F2.  
- **Làm sớm (P1):** B2, B3, C2, C3, E1, E2, E3, F3.  
- **Làm sau (P2):** B4, E4, và các tối ưu.  
- Điều quan trọng nhất dev cần hiểu: **nếu bỏ Phần B (ghép mục tiêu), C (kiểm định), D (chống rò rỉ), E (lớp đông \+ quản lý) mà chỉ làm danh sách gia sư đẹp để lướt — thì sản phẩm này chỉ là một app gia sư nữa và sẽ thất bại như các app trước.** Bốn phần đó LÀ sản phẩm.

