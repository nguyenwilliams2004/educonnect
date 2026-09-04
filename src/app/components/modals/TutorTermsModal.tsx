import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Award, Scale, HelpCircle } from 'lucide-react';

export interface TutorTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
}

export function TutorTermsModal({ isOpen, onClose, onAgree }: TutorTermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Quy Chế & Điều Khoản Hợp Tác Đối Tác Giảng Dạy
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Nền tảng Giáo dục Trực tiếp HanTutor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-blue-900 font-medium leading-relaxed">
              Chào mừng bạn đến với cộng đồng đối tác giảng dạy HanTutor. Vui lòng đọc kỹ các điều khoản dưới đây để nắm rõ quyền lợi, trách nhiệm và quy chế vận hành chung trước khi gửi hồ sơ.
            </p>
          </div>

          {/* Điều 1 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-[13px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              1. Tiêu chuẩn Thẩm định Hồ sơ & Xác thực Năng lực (KYC)
            </h3>
            <p className="pl-6">
              - Đối tác cam kết cung cấp thông tin cá nhân (Họ tên, CCCD/Hộ chiếu, SĐT, Email) và tệp minh chứng văn bằng / Thẻ sinh viên hoàn toàn trung thực, còn hiệu lực.
            </p>
            <p className="pl-6">
              - Mọi trường hợp làm giả mạo bằng cấp, sử dụng danh tính người khác sẽ bị khóa vĩnh viễn và HanTutor có quyền hủy bỏ mọi giao dịch liên quan.
            </p>
          </div>

          {/* Điều 2 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-[13px]">
              <Award className="w-4 h-4 text-amber-500" />
              2. Chuẩn mực Sư phạm & Tác phong Giảng dạy
            </h3>
            <p className="pl-6">
              - Luôn vào lớp đúng giờ (cả hình thức Online và Offline). Trong trường hợp bận đột xuất, phải báo trước cho học sinh/phụ huynh tối thiểu 03 giờ để sắp xếp bù buổi.
            </p>
            <p className="pl-6">
              - Nghiêm cấm mọi hành vi thiếu chuẩn mực, ngôn từ phản cảm, xúc phạm hoặc gây tổn hại đến thể chất, tinh thần của học sinh.
            </p>
            <p className="pl-6">
              - Cam kết chuẩn bị giáo án bài giảng chu đáo và phản hồi tiến độ học tập định kỳ sau mỗi tháng cho phụ huynh.
            </p>
          </div>

          {/* Điều 3 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-[13px]">
              <FileText className="w-4 h-4 text-blue-500" />
              3. Quy chế Buổi học thử 1-1 & Nhận lớp
            </h3>
            <p className="pl-6">
              - Đối tác sẵn sàng tham gia buổi làm quen / học thử 1-1 với học sinh để thẩm định năng lực và tạo niềm tin với phụ huynh.
            </p>
            <p className="pl-6">
              - Học phí được công khai minh bạch theo mức giá đối tác tự niêm yết trên hồ sơ. Không tự ý ép giá hoặc thu thêm phụ phí ngoài thỏa thuận ban đầu.
            </p>
          </div>

          {/* Điều 4 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-[13px]">
              <Scale className="w-4 h-4 text-purple-500" />
              4. Thanh toán, Phí nền tảng & Bảo đảm thù lao
            </h3>
            <p className="pl-6">
              - HanTutor đóng vai trò kết nối trực tiếp, áp dụng mức phí dịch vụ nền tảng tối ưu (0% phí môi giới ngầm, biểu phí công khai theo từng gói kết nối).
            </p>
            <p className="pl-6">
              - Thù lao giảng dạy được đối soát tự động và thanh toán về tài khoản ngân hàng chính chủ của đối tác theo chu kỳ quy định, đảm bảo 100% không bị bùng học phí.
            </p>
          </div>

          {/* Điều 5 */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-[13px]">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              5. Bảo mật thông tin & Quyền lợi hỗ trợ
            </h3>
            <p className="pl-6">
              - HanTutor cam kết bảo mật tuyệt đối các tài liệu nhạy cảm (CCCD, văn bằng) trên máy chủ mã hóa riêng tư, chỉ sử dụng cho mục đích kiểm duyệt nội bộ.
            </p>
            <p className="pl-6">
              - Đối tác được bảo vệ quyền lợi hợp pháp và nhận hỗ trợ giải quyết tranh chấp 24/7 từ đội ngũ Admin HanTutor.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer text-xs"
          >
            Đóng lại
          </button>
          {onAgree && (
            <button
              type="button"
              onClick={() => {
                onAgree();
                onClose();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tôi đồng ý với điều khoản này
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TutorTermsModal;
