import React, { useState, useEffect } from 'react';
import { X, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { useAuth } from '../../../context/AuthContext';

export interface ReviewModalProps {
  tutor?: any;
  isOpen?: boolean;
  defaultStage?: 'trial' | 'official';
  onClose?: () => void;
  onSuccess?: () => void;
}

export function ReviewModal({
  tutor: propTutor,
  isOpen: propIsOpen,
  defaultStage: propDefaultStage,
  onClose: propOnClose,
  onSuccess
}: ReviewModalProps = {}) {
  const { reviewModalState, closeReviewModal } = useUI();
  const { addTutorReview } = useData();
  const { currentSession } = useAuth();

  const tutor = propTutor !== undefined ? propTutor : reviewModalState.tutor;
  const isOpen = propIsOpen !== undefined ? propIsOpen : (reviewModalState.isOpen && !!reviewModalState.tutor);
  const defaultStage = propDefaultStage || reviewModalState.defaultStage || 'trial';
  const onClose = propOnClose || closeReviewModal;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [stage, setStage] = useState<'trial' | 'official'>(defaultStage);
  const [studentName, setStudentName] = useState(currentSession.fullName || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStage(defaultStage);
      if (currentSession.fullName) {
        setStudentName(currentSession.fullName);
      }
    }
  }, [isOpen, defaultStage, currentSession.fullName]);

  if (!isOpen || !tutor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAuthor = (currentSession.fullName || studentName).trim();
    if (!finalAuthor) {
      alert("Vui lòng cung cấp họ tên của bạn để gửi đánh giá. Hệ thống HanTutor nghiêm cấm đánh giá ẩn danh!");
      return;
    }

    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung nhận xét của bạn!");
      return;
    }

    setIsSubmitting(true);
    addTutorReview({
      tutorId: tutor.id,
      studentName: finalAuthor,
      rating,
      stage,
      stageText: stage === 'trial' ? 'Sau buổi học thử 1-1' : 'Sau thời gian học chính thức',
      comment: comment.trim(),
      verified: true,
      likes: 1
    });

    setIsSubmitting(false);
    alert(`Cảm ơn bạn đã đánh giá ${rating} sao cho ${tutor.name}! Nhận xét đã được cập nhật trực tiếp.`);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 select-text">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <img src={tutor.avatar} alt={tutor.name} className="w-13 h-13 rounded-2xl object-cover shadow-sm border border-slate-200" />
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Đánh giá & Nhận xét</span>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">{tutor.name}</h3>
            <span className="text-xs text-slate-500">{tutor.subjects?.join(', ')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Star Rating Picker */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Mức độ hài lòng của bạn:</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-115"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${(hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200'
                      }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-sm text-slate-800">
                {rating === 5 ? '⭐ Rất xuất sắc (5/5)' : rating === 4 ? '⭐ Tốt (4/5)' : rating === 3 ? 'Bình thường (3/5)' : 'Cần cải thiện'}
              </span>
            </div>
          </div>

          {/* Giai đoạn đánh giá */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Giai đoạn bạn muốn đánh giá:</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStage('trial')}
                className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${stage === 'trial'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-700 ring-2 ring-blue-100'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
              >
                <div className="text-xs">🎯 Sau buổi học thử 1-1</div>
                <div className="text-[10px] font-normal text-slate-500 mt-0.5">Nhận xét tác phong, phương pháp buổi đầu</div>
              </button>

              <button
                type="button"
                onClick={() => setStage('official')}
                className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${stage === 'official'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-700 ring-2 ring-blue-100'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
              >
                <div className="text-xs">🎓 Đang học chính thức</div>
                <div className="text-[10px] font-normal text-slate-500 mt-0.5">Nhận xét sự tiến bộ sau thời gian học</div>
              </button>
            </div>
          </div>

          {/* Tên học sinh / Phụ huynh */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-800">Họ tên người đánh giá:</label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" /> Không thể ẩn danh
              </span>
            </div>
            {currentSession.fullName ? (
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-900 text-xs">{currentSession.fullName}</span>
                <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 ml-auto font-medium">
                  Học viên chính thức
                </span>
              </div>
            ) : (
              <input
                type="text"
                placeholder="VD: Phụ huynh em Tuấn Anh, hoặc Em Minh Đức (Lớp 12)..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                required
              />
            )}
          </div>

          {/* Nội dung nhận xét */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Nội dung nhận xét chi tiết:</label>
            <textarea
              rows={4}
              placeholder="Chia sẻ trải nghiệm học tập, sự tận tâm của giáo viên, khả năng tiếp thu và tiến bộ của học sinh..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 focus:bg-white leading-relaxed resize-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Gửi nhận xét ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export { ReviewModal as ReviewTutorModal };
export default ReviewModal;
