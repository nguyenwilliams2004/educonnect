import React from 'react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-[#0d1424] text-slate-400 py-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <img
            src="/logo-icon.png"
            alt="HanTutor Icon"
            className="w-9 h-9 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-extrabold text-2xl tracking-tight text-white flex items-center leading-none">
            Han<span className="text-[#FF9000]">tutor</span>
          </span>
        </Link>

        <div className="text-xs text-slate-400">
          © 2026 HanTutor. Nền tảng kết nối gia sư thông minh.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
