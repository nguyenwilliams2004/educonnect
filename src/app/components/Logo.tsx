import React from 'react';

export function Logo({ light = false, size = "md" }: { light?: boolean; size?: "sm" | "md" | "lg" }) {
  const iconSizeClass = size === "sm" ? "w-7 h-7 sm:w-8 sm:h-8" : size === "lg" ? "w-11 h-11 sm:w-12 sm:h-12" : "w-8 h-8 sm:w-10 sm:h-10";
  const wordmarkHeightClass = size === "sm" ? "h-4.5 sm:h-5" : size === "lg" ? "h-7 sm:h-8" : "h-5 sm:h-6.5";

  return (
    <div className="flex items-center gap-2 cursor-pointer select-none">
      <img
        src="/logo-icon.png"
        alt="HanTutor Icon"
        className={`${iconSizeClass} object-contain shrink-0 transition-transform duration-200 hover:scale-105`}
      />
      {light ? (
        <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center leading-none">
          Han<span className="text-[#FF9000]">tutor</span>
        </span>
      ) : (
        <img
          src="/logo-wordmark.png"
          alt="HanTutor"
          className={`${wordmarkHeightClass} object-contain shrink-0`}
        />
      )}
    </div>
  );
}

export default Logo;
