import React from "react";

export const WeworkBadgeIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center rounded-full bg-[#2E699E] text-[11px] font-bold text-white shadow-2xs select-none"
    aria-hidden="true"
  >
    W
  </div>
);

export const RequestBadgeIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-2xs select-none"
    aria-hidden="true"
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 12.5V8C3.5 5.23858 5.51472 3 8 3C10.4853 3 12.5 5.23858 12.5 8V12.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  </div>
);
