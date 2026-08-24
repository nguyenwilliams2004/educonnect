import React, { useState } from 'react';
import AiChatWidget, { AiChatLogoIcon, MessengerLogoIcon } from './AiChatWidget';

export default function FloatingContactDock() {
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  return (
    <>
      {/* Floating Action Buttons Dock - Bottom Right */}
      <div className="fixed bottom-6 right-5 sm:right-7 z-40 flex flex-col items-end gap-3.5 select-none">
        
        {/* 1. Nút Facebook Messenger (Điều hướng trực tiếp đến chat Messenger) */}
        <a
          href="https://m.me/61593472564468"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer p-0.5"
          title="Nhắn tin trực tiếp qua Facebook Messenger"
        >
          {/* Logo Messenger */}
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center drop-shadow-md">
            <MessengerLogoIcon className="w-full h-full" />
          </div>

          {/* Hover Tooltip Label */}
          <span className="absolute right-full mr-3.5 bg-slate-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:inline-block">
            💬 Nhắn tin qua Messenger
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
          </span>

          {/* Online badge */}
          <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 w-3.5 h-3.5 rounded-full ring-2 ring-white" />
        </a>

        {/* 2. Nút Trợ lý AI Hỏi Đáp Nghiệp Vụ (Logo màu cam theo yêu cầu) */}
        <button
          type="button"
          onClick={() => setIsAiChatOpen(!isAiChatOpen)}
          className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer p-0.5"
          title="Hỏi đáp cùng Trợ lý AI HanTutor"
        >
          {/* Attention Pulse Effect */}
          <span className="absolute -inset-1 rounded-full bg-orange-400 opacity-40 group-hover:opacity-75 animate-ping pointer-events-none" />

          {/* Logo Cam bong bóng chat 3 chấm */}
          <div className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center drop-shadow-md">
            <AiChatLogoIcon className="w-full h-full" />
          </div>

          {/* Hover Tooltip Label */}
          <span className="absolute right-full mr-3.5 bg-slate-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:inline-block">
            🤖 Trợ lý AI Hỏi Đáp Nghiệp Vụ
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
          </span>

          {/* AI Badge indicator */}
          <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-white shadow-xs">
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
