import React from 'react';

export function HeroLeftIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 lg:w-40 lg:h-40 drop-shadow-2xl select-none pointer-events-none">
      <path d="M40 70 L140 40 L170 80 L70 110 Z" fill="#BFDBFE" />
      <path d="M40 70 L70 110 L70 130 L40 90 Z" fill="#60A5FA" />
      <path d="M70 110 L170 80 L170 100 L70 130 Z" fill="#2563EB" />
      <path d="M45 68 L142 40 L165 75 L68 103 Z" fill="#FFFFFF" />
      <g transform="translate(90, 0) rotate(45)">
        <rect x="0" y="20" width="15" height="70" fill="#FBBF24" />
        <polygon points="0,90 15,90 7.5,110" fill="#F59E0B" />
        <polygon points="5,103 10,103 7.5,110" fill="#334155" />
        <rect x="0" y="10" width="15" height="10" fill="#94A3B8" />
        <rect x="0" y="0" width="15" height="10" fill="#F87171" />
      </g>
      <circle cx="30" cy="30" r="10" fill="#FDE68A" />
      <circle cx="160" cy="140" r="6" fill="#93C5FD" />
      <path d="M10 100 L20 90 L30 100 L20 110 Z" fill="#FCA5A5" />
    </svg>
  );
}

export function HeroRightIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 lg:w-48 lg:h-48 drop-shadow-2xl select-none pointer-events-none">
      <path d="M100 40 L160 65 L100 90 L40 65 Z" fill="#2563EB" />
      <path d="M60 75 L60 110 C60 120 100 130 100 130 C100 130 140 120 140 110 L140 75" fill="#1E40AF" />
      <path d="M100 40 L160 65 L100 90 L40 65 Z" fill="#3B82F6" />
      <path d="M100 65 L150 85 L150 115" stroke="#FBBF24" strokeWidth="4" fill="none" />
      <circle cx="150" cy="115" r="5" fill="#F59E0B" />
      <circle cx="100" cy="65" r="4" fill="#FDE68A" />
      <rect x="50" y="130" width="100" height="30" rx="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" transform="rotate(-10 100 145)" />
      <rect x="90" y="125" width="20" height="40" fill="#EF4444" transform="rotate(-10 100 145)" />
      <path d="M30 140 L40 130 L50 140 L40 150 Z" fill="#93C5FD" />
      <circle cx="170" cy="40" r="8" fill="#FDE68A" />
    </svg>
  );
}
