import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';

export interface TeacherProfileModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  tutorId?: string | number;
}

export function TeacherProfileModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  tutorId: propTutorId
}: TeacherProfileModalProps = {}) {
  const { teacherProfileModalTutorId, closeTeacherProfileModal } = useUI();
  const { tutors, updateTutorProfile } = useData();

  const isOpen = propIsOpen !== undefined ? propIsOpen : !!teacherProfileModalTutorId;
  const onClose = propOnClose || closeTeacherProfileModal;
  const tutorId = propTutorId || teacherProfileModalTutorId || 't1';

  const activeTutor = tutors.find((t: any) => String(t.id) === String(tutorId)) || tutors[0];

  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'bank'>('info');

  const [name, setName] = useState(activeTutor?.name || 'Cô Sương Mai');
  const [headline, setHeadline] = useState(activeTutor?.headline || 'Cử nhân Sư phạm Toán ĐH Sư Phạm Hà Nội, 5 năm kinh nghiệm');
  const [bio, setBio] = useState(activeTutor?.bio || 'Tận tâm, phương pháp giảng dạy dễ hiểu, giúp học sinh nắm vững kiến thức từ cơ bản đến nâng cao.');
  const [phone, setPhone] = useState(activeTutor?.phone || '0912345678');
  const [zalo, setZalo] = useState(activeTutor?.zalo || '0912345678');
  const [avatar, setAvatar] = useState(activeTutor?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400');

  const [primaryPrice, setPrimaryPrice] = useState(activeTutor?.levelPrices?.primary || 150000);
  const [secondaryPrice, setSecondaryPrice] = useState(activeTutor?.levelPrices?.secondary || 200000);
  const [highSchoolPrice, setHighSchoolPrice] = useState(activeTutor?.levelPrices?.high || 250000);
  const [examPrepPrice, setExamPrepPrice] = useState(activeTutor?.levelPrices?.exam || 300000);

  const [bankName, setBankName] = useState(activeTutor?.bankName || 'MB Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState(activeTutor?.bankAccountNumber || '0987654321');
  const [bankAccountName, setBankAccountName] = useState(activeTutor?.bankAccountName || 'NGUYEN SUONG MAI');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTutor) {
      setName(activeTutor.name || '');
      setHeadline(activeTutor.headline || '');
      setBio(activeTutor.bio || '');
      setPhone(activeTutor.phone || '');
      setZalo(activeTutor.zalo || '');
      setAvatar(activeTutor.avatar || '');
      if (activeTutor.levelPrices) {
        setPrimaryPrice(activeTutor.levelPrices.primary || 150000);
        setSecondaryPrice(activeTutor.levelPrices.secondary || 200000);
        setHighSchoolPrice(activeTutor.levelPrices.high || 250000);
        setExamPrepPrice(activeTutor.levelPrices.exam || 300000);
      }
      if (activeTutor.bankName) setBankName(activeTutor.bankName);
      if (activeTutor.bankAccountNumber) setBankAccountNumber(activeTutor.bankAccountNumber);
      if (activeTutor.bankAccountName) setBankAccountName(activeTutor.bankAccountName);
    }
  }, [activeTutor, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const updated = {
        name,
        headline,
        bio,
        phone,
        zalo,
        avatar,
        pricePerSession: secondaryPrice || 200000,
        bankName,
        bankAccountNumber,
        bankAccountName,
        levelPrices: {
          primary: Number(primaryPrice),
          secondary: Number(secondaryPrice),
          high: Number(highSchoolPrice),
          exam: Number(examPrepPrice)
        }
      };
      updateTutorProfile(activeTutor?.id || 't1', updated);
      alert("Cập nhật thông tin hồ sơ giáo viên thành công! Dữ liệu đã được lưu trực tiếp.");
      onClose();
    }, 500);
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl relative border border-slate-100 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - No icon */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Chỉnh Sửa Hồ Sơ Giáo Viên</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật thông tin cá nhân, học phí các cấp và tài khoản ngân hàng
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-4 pb-0 bg-white">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'info'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thông tin cá nhân
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'pricing'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Môn dạy & Học phí
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === 'bank'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ngân hàng rút tiền
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ảnh đại diện</label>
                <div className="flex items-center gap-4">
                  <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-sm" />
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[11px] font-bold text-slate-500">Chọn ảnh mẫu nhanh:</span>
                    <div className="flex items-center gap-2">
                      {sampleAvatars.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${avatar === url ? 'border-blue-600 scale-105 shadow-xs' : 'border-slate-200 opacity-70'}`}
                        >
                          <img src={url} alt="sample" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên giáo viên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại / Zalo</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setZalo(e.target.value); }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề / Bằng cấp / Kinh nghiệm</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none"
                  placeholder="VD: Cử nhân Sư phạm Toán ĐH Sư Phạm Hà Nội, 5 năm kinh nghiệm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giới thiệu chi tiết & Phương pháp giảng dạy</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-normal focus:border-blue-500 outline-none"
                  placeholder="Mô tả phương pháp truyền đạt, thế mạnh dạy học sinh mất gốc hoặc bồi dưỡng nâng cao..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: MÔN DẠY & HỌC PHÍ */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
                Học phí dưới đây là mức học phí hiển thị công khai khi học sinh đăng ký khóa học và được tích lũy vào Ví Giảng Dạy ngay khi học sinh thanh toán.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học phí Cấp 1 (Tiểu học / buổi)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={primaryPrice}
                      onChange={e => setPrimaryPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none font-mono"
                      step={10000}
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học phí Cấp 2 (THCS / buổi)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={secondaryPrice}
                      onChange={e => setSecondaryPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none font-mono"
                      step={10000}
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học phí Cấp 3 (THPT / buổi)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={highSchoolPrice}
                      onChange={e => setHighSchoolPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none font-mono"
                      step={10000}
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Học phí Luyện thi ĐH / Chuyên</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={examPrepPrice}
                      onChange={e => setExamPrepPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none font-mono"
                      step={10000}
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NGÂN HÀNG RÚT TIỀN */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngân hàng nhận tiền</label>
                <select
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-500 outline-none bg-white cursor-pointer"
                >
                  <option value="MB Bank">MB Bank (Ngân hàng Quân Đội)</option>
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="VPBank">VPBank</option>
                  <option value="ACB">ACB</option>
                  <option value="BIDV">BIDV</option>
                  <option value="TPBank">TPBank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tài khoản ngân hàng</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={e => setBankAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-blue-500 outline-none"
                  placeholder="VD: 0987654321"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên chủ tài khoản (In hoa không dấu)</label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={e => setBankAccountName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-blue-500 outline-none uppercase"
                  placeholder="VD: NGUYEN SUONG MAI"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-slate-600">
                Thông tin tài khoản được mã hóa và bảo mật chuẩn RLS. Dùng để tự động xử lý các lệnh rút tiền 24/7.
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shadow-blue-200 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 active:scale-98"
            >
              {saving ? 'Đang lưu...' : 'Lưu & Cập nhật Hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default TeacherProfileModal;
