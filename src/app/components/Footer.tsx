import React from 'react';
import { Link } from 'react-router';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-slate-900">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <img
                src="/logo-icon.png"
                alt="HanTutor Icon"
                className="w-9 h-9 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-black text-2xl tracking-tight text-white flex items-center leading-none">
                Han<span className="text-[#FF9000]">tutor</span>
              </span>
            </Link>
            <div className="hidden sm:block w-px h-6 bg-slate-800" />
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Hồ sơ đối soát CCCD & Bằng cấp sư phạm</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-semibold text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <Link to="/tim-gia-su" className="hover:text-white transition-colors">Tìm gia sư</Link>
            <Link to="/dang-ky-gia-su" className="hover:text-white transition-colors">Trở thành gia sư</Link>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">Hà Nội, Việt Nam</span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© 2026 HanTutor. Nền tảng kết nối giáo viên & gia sư chất lượng cao.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Quy chuẩn sư phạm</span>
            <span>•</span>
            <span>Bảo mật dữ liệu cá nhân</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
