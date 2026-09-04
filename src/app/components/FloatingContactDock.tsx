import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AiChatWidget, { AiChatLogoIcon, MessengerLogoIcon } from './AiChatWidget';
import { trackContactClick, trackEvent } from '../../lib/analytics';

export default function FloatingContactDock() {
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  return (
    <>
      {/* Floating Action Buttons Dock - Bottom Right */}
      <div className="fixed bottom-6 right-5 sm:right-7 z-40 flex flex-col items-end gap-3.5 select-none font-sans">
        
        {/* 1. Nút Facebook Messenger (Điều hướng trực tiếp đến chat Messenger) */}
        <a
          href="https://m.me/61593472564468"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContactClick('messenger')}
          className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/35 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer p-0.5"
          title="Nhắn tin trực tiếp qua Facebook Messenger"
        >
          {/* Logo Messenger chuẩn nhận diện Meta */}
          <div className="w-full h-full flex items-center justify-center drop-shadow-md">
            <MessengerLogoIcon className="w-full h-full" />
          </div>

          {/* Hover Tooltip Label: Typography & Icon chuẩn Hallmark Editorial */}
          <span className="absolute right-full mr-3.5 bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-xl shadow-slate-950/30 border border-slate-800/80 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200 ease-out pointer-events-none hidden sm:inline-flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
              <MessengerLogoIcon className="w-full h-full" />
            </div>
            <span className="font-semibold text-xs text-slate-100 tracking-tight">
              Nhắn tin qua Messenger
            </span>
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-950" />
          </span>

          {/* Online badge */}
          <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs" />
        </a>

        {/* 2. Nút Trợ lý AI Hỏi Đáp Nghiệp Vụ (Theme xanh HanTutor chuẩn nhận diện) */}
        <button
          type="button"
          onClick={() => {
            const nextState = !isAiChatOpen;
            setIsAiChatOpen(nextState);
            if (nextState) trackEvent('ai_chat_open');
          }}
          className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer p-0.5"
          title="Hỏi đáp cùng Trợ lý AI HanTutor"
        >
          {/* Logo AI HanTutor ăn khớp với theme website (tĩnh, không nhấp nháy) */}
          <div className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center drop-shadow-md">
            <AiChatLogoIcon className="w-full h-full" />
          </div>

          {/* Hover Tooltip Label: Typography & Icon chuẩn Hallmark Editorial */}
          <span className="absolute right-full mr-3.5 bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-xl shadow-slate-950/30 border border-slate-800/80 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all duration-200 ease-out pointer-events-none hidden sm:inline-flex items-center gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-xs text-slate-100 tracking-tight">
              Trợ lý AI Hỏi Đáp Nghiệp Vụ
            </span>
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-950" />
          </span>

          {/* AI Badge indicator: Tinh xảo màu Amber đồng bộ logo HanTutor */}
          <span className="absolute -top-1 -right-1 z-20 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white shadow-xs tracking-wider flex items-center justify-center leading-none">
            AI
          </span>
        </button>
      </div>

      {/* AI Chat Widget Popup */}
      <AiChatWidget
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />
    </>
  );
}
