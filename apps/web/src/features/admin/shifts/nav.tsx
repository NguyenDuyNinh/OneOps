"use client";

import type { NavSection } from "@/features/admin/navigation";

function ClockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export const shiftsNav: NavSection = {
  name: "Ca làm việc",
  icon: <ClockIcon />,
  path: "/admin/shifts",
  items: [
    {
      name: "Ca làm việc",
      path: "/admin/shifts",
      icon: <ClockIcon />,
      pro: false,
    },
  ],
};