import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Save,
  Camera,
  Copy,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useUI } from '../../../context/UIContext';
import { useData } from '../../../context/DataContext';
import { supabase } from '../../../lib/supabase';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400'
];

export function UserProfileModal() {
  const { isUserProfileModalOpen, closeUserProfileModal } = useUI();
  const { currentSession, setCurrentSession } = useData();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (isUserProfileModalOpen) {
      setFullName(currentSession.name || currentSession.fullName || '');
      setPhone(currentSession.phone || '');
      setAvatarUrl(currentSession.avatar || PRESET_AVATARS[0]);
      setCustomAvatarInput(currentSession.avatar || '');
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [isUserProfileModalOpen, currentSession]);

  if (!isUserProfileModalOpen) return null;

  const roleLabel =
    currentSession.role === 'admin'
      ? 'Quản trị viên hệ thống'
      : currentSession.role === 'teacher'
      ? 'Giáo viên đối tác'
      : 'Học sinh / Phụ huynh';

  const roleBadgeColor =
    currentSession.role === 'admin'
      ? 'bg-red-50 text-red-700 border-red-200'
      : currentSession.role === 'teacher'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const handleCopyId = () => {
    if (currentSession.userId) {
      navigator.clipboard.writeText(String(currentSession.userId));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const finalAvatar = avatarUrl.trim() || PRESET_AVATARS[0];
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.trim();

      // 1. CẬP NHẬT TRỰC TIẾP VÀO SUPABASE BẢNG public.users
      if (currentSession.userId && !String(currentSession.userId).startsWith('t')) {
        const { error: dbError } = await supabase
          .from('users')
          .update({
            full_name: trimmedName,
            phone: trimmedPhone,
            avatar_url: finalAvatar
          })
          .eq('id', currentSession.userId);

        if (dbError) {
          console.warn('Lỗi cập nhật public.users:', dbError.message);
        }

        // 2. CẬP NHẬT SUPABASE AUTH USER METADATA
        await supabase.auth.updateUser({
          data: {
            full_name: trimmedName,
            phone: trimmedPhone,
            avatar_url: finalAvatar
          }
        }).catch(() => {});

        // 3. NẾU LÀ GIÁO VIÊN: ĐỒNG BỘ THÊM VÀO BẢNG PROFILES NẾU CÓ
        if (currentSession.role === 'teacher') {
          await supabase
            .from('profiles')
            .update({ avatar_url: finalAvatar })
            .eq('id', currentSession.userId)
            .catch(() => {});
        }
      }

      // 4. CẬP NHẬT CLIENT SESSION TRONG APPLICATION STATE
      setCurrentSession(prev => ({
        ...prev,
        name: trimmedName,
        fullName: trimmedName,
        phone: trimmedPhone,
        avatar: finalAvatar
      }));

      // 5. LƯU BỘ NHỚ ĐỆM LOCAL STORAGE
      try {
        const cached = localStorage.getItem('hantutor_student_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          localStorage.setItem(
            'hantutor_student_profile',
            JSON.stringify({
              ...parsed,
              name: trimmedName,
              phone: trimmedPhone,
              avatar: finalAvatar
            })
          );
        }
      } catch {}

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER: Sleek Gradient & Identity */}
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-6 pt-6 pb-5 shrink-0">
          <button
            type="button"
            onClick={closeUserProfileModal}
            className="absolute top-4 right-4 z-20 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative shrink-0 group">
              <img
                src={avatarUrl || PRESET_AVATARS[0]}
                alt={fullName || 'Avatar'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/80 shadow-md ring-4 ring-white/10"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Tài khoản đang hoạt động" />
            </div>

            <div className="min-w-0 pr-8">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                  {fullName || 'Tài khoản người dùng'}
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{currentSession.email || 'user@hantutor.vn'}</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadgeColor}`}>
                  <ShieldCheck className="w-3 h-3" />
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Alerts */}
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã cập nhật và lưu thay đổi lên cơ sở dữ liệu Supabase thành công!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Chọn ảnh đại diện */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Ảnh đại diện</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                {showCustomInput ? 'Chọn mẫu có sẵn' : 'Dán liên kết ảnh khác'}
              </button>
            </div>

            {showCustomInput ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={customAvatarInput}
                  onChange={e => {
                    setCustomAvatarInput(e.target.value);
                    if (e.target.value.startsWith('http')) {
                      setAvatarUrl(e.target.value);
                    }
                  }}
                  placeholder="https://example.com/my-photo.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800"
                />
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((preset, idx) => {
                  const isSelected = avatarUrl === preset;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-200 scale-105'
                          : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Họ và tên */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên hiển thị <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nhập họ và tên..."
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Section 3: Số điện thoại */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số điện thoại (Nhận liên hệ học tập / Zalo)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Section 4: Email & UID (Thông tin bảo mật) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Email đăng nhập
              </span>
              <span className="font-mono text-slate-800">{currentSession.email || 'Chưa cập nhật'}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Mã ID tài khoản
              </span>
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                <span>{String(currentSession.userId || 'demo').slice(0, 12)}...</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 hover:bg-slate-200 rounded-md transition-colors cursor-pointer text-slate-600"
                  title="Sao chép UID"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeUserProfileModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Đang lưu CSDL...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
