import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { supabase } from '../../../lib/supabase';
import { CheckCircle2 } from 'lucide-react';

export interface TeacherProfileModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  tutorId?: string | number;
}

function parseLevelPrices(levelPrices: any) {
  const result = {
    primary: 200000,
    secondary: 280000,
    high: 350000,
    exam: 350000,
  };
  if (!levelPrices || typeof levelPrices !== 'object') return result;

  if (levelPrices.primary) result.primary = Number(String(levelPrices.primary).replace(/\D/g, '')) || result.primary;
  if (levelPrices.secondary) result.secondary = Number(String(levelPrices.secondary).replace(/\D/g, '')) || result.secondary;
  if (levelPrices.high) result.high = Number(String(levelPrices.high).replace(/\D/g, '')) || result.high;
  if (levelPrices.exam) result.exam = Number(String(levelPrices.exam).replace(/\D/g, '')) || result.exam;

  for (const [k, v] of Object.entries(levelPrices)) {
    const kLower = k.toLowerCase();
    const num = Number(String(v).replace(/\D/g, ''));
    if (!num || isNaN(num)) continue;
    if (kLower.includes('tiểu học') || kLower.includes('cấp 1')) {
      result.primary = num;
    } else if (kLower.includes('thcs') || kLower.includes('cấp 2') || kLower.includes('lớp 6-9')) {
      result.secondary = num;
    } else if (kLower.includes('thpt') || kLower.includes('cấp 3') || kLower.includes('lớp 10-12')) {
      result.high = num;
    } else if (kLower.includes('đại học') || kLower.includes('chuyên') || kLower.includes('luyện thi')) {
      result.exam = num;
    }
  }

  return result;
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

  const activeTutor = React.useMemo(() => {
    const base = tutors.find((t: any) => String(t.id) === String(tutorId)) || tutors[0];
    try {
      const raw = localStorage.getItem('hantutor_tutor_profile_overrides');
      if (!raw) return base;
      const overrides = JSON.parse(raw);
      const override =
        overrides[String(tutorId)] ||
        (String(tutorId) === 't1' ? overrides['00000000-0000-0000-0000-000000000001'] : null) ||
        (String(tutorId) === '00000000-0000-0000-0000-000000000001' ? overrides['t1'] : null);
      if (!override) return base;
      return {
        ...base,
        ...override,
        levelPrices: {
          ...(base.levelPrices || {}),
          ...(override.levelPrices || {}),
        },
      };
    } catch {
      return base;
    }
  }, [tutors, tutorId]);

  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'bank'>('info');

  const initialPrices = parseLevelPrices(activeTutor?.levelPrices);

  const [name, setName] = useState(activeTutor?.name || 'Cô Sương Mai');
  const [headline, setHeadline] = useState(activeTutor?.headline || 'Cử nhân Sư phạm Toán ĐH Sư Phạm Hà Nội, 5 năm kinh nghiệm');
  const [bio, setBio] = useState(activeTutor?.bio || 'Tận tâm, phương pháp giảng dạy dễ hiểu, giúp học sinh nắm vững kiến thức từ cơ bản đến nâng cao.');
  const [phone, setPhone] = useState(activeTutor?.phone || '0912345678');
  const [zalo, setZalo] = useState(activeTutor?.zalo || '0912345678');
  const [avatar, setAvatar] = useState(activeTutor?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400');

  const [primaryPrice, setPrimaryPrice] = useState(initialPrices.primary);
  const [secondaryPrice, setSecondaryPrice] = useState(initialPrices.secondary);
  const [highSchoolPrice, setHighSchoolPrice] = useState(initialPrices.high);
  const [examPrepPrice, setExamPrepPrice] = useState(initialPrices.exam);

  const [bankName, setBankName] = useState(activeTutor?.bankName || 'MB Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState(activeTutor?.bankAccountNumber || '0987654321');
  const [bankAccountName, setBankAccountName] = useState(activeTutor?.bankAccountName || 'NGUYEN SUONG MAI');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeTutor && isOpen) {
      setName(activeTutor.name || '');
      setHeadline(activeTutor.headline || '');
      setBio(activeTutor.bio || '');
      setPhone(activeTutor.phone || '');
      setZalo(activeTutor.zalo || '');
      setAvatar(activeTutor.avatar || '');
      const parsed = parseLevelPrices(activeTutor.levelPrices);
      setPrimaryPrice(parsed.primary);
      setSecondaryPrice(parsed.secondary);
      setHighSchoolPrice(parsed.high);
      setExamPrepPrice(parsed.exam);
      if (activeTutor.bankName) setBankName(activeTutor.bankName);
      if (activeTutor.bankAccountNumber) setBankAccountNumber(activeTutor.bankAccountNumber);
      if (activeTutor.bankAccountName) setBankAccountName(activeTutor.bankAccountName);
      setSaveSuccess(false);
    }
  }, [activeTutor, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const pPrice = Number(primaryPrice) || 200000;
      const sPrice = Number(secondaryPrice) || 280000;
      const hPrice = Number(highSchoolPrice) || 350000;
      const ePrice = Number(examPrepPrice) || 350000;

      const minPrice = Math.min(pPrice, sPrice, hPrice, ePrice);
      const maxPrice = Math.max(pPrice, sPrice, hPrice, ePrice);
      const newHourlyRate = `${minPrice.toLocaleString('vi-VN')} - ${maxPrice.toLocaleString('vi-VN')}`;

      const updated = {
        name: name.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        zalo: zalo.trim(),
        avatar,
        hourlyRate: newHourlyRate,
        pricePerSession: sPrice,
        price: sPrice,
        bankName,
        bankAccountNumber,
        bankAccountName,
        levelPrices: {
          "Tiểu học & Cảm thụ": `${pPrice.toLocaleString('vi-VN')}`,
          "THCS (Lớp 6-9) & Vào 10": `${sPrice.toLocaleString('vi-VN')}`,
          "THPT (Lớp 10-12) & Đại học": `${hPrice.toLocaleString('vi-VN')}`,
          "Luyện thi ĐH / Chuyên": `${ePrice.toLocaleString('vi-VN')}`,
          primary: pPrice,
          secondary: sPrice,
          high: hPrice,
          exam: ePrice,
        }
      };

      await updateTutorProfile(activeTutor?.id || 't1', updated);

      const targetDbId =
        activeTutor?.id && !String(activeTutor.id).startsWith('t')
          ? String(activeTutor.id)
          : String(activeTutor?.id) === 't1'
          ? '00000000-0000-0000-0000-000000000001'
          : null;

      if (targetDbId) {
        await supabase.from('users').update({
          full_name: name.trim(),
          phone: phone.trim(),
          avatar_url: avatar,
        }).eq('id', targetDbId).catch(() => {});

        await supabase.from('profiles').update({
          bio: bio.trim(),
          intro: headline.trim(),
          price: Number(sPrice),
          avatar_url: avatar,
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          bank_account_name: bankAccountName,
        }).eq('id', targetDbId).catch(() => {});
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400'
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
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lưu thông tin hồ sơ thành công!</span>
            </div>
          )}

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
