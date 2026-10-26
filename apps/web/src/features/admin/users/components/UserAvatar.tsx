import React from "react";

/** Bảng màu cố định (ghi literal để Tailwind JIT nhận diện). */
const AVATAR_PALETTE = [
  "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  "bg-warning-50 text-orange-600 dark:bg-warning-500/15 dark:text-orange-400",
  "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-500",
  "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
] as const;

/** Lấy chữ cái đầu của từ đầu và từ cuối — phù hợp tên tiếng Việt nhiều từ. */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getPaletteIndex(name: string): number {
  const total = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return total % AVATAR_PALETTE.length;
}

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md";
}

/** Avatar dạng chữ cái đầu — không phụ thuộc ảnh ngoài nên không cần cấu hình domain. */
export default function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-theme-xs" : "h-10 w-10 text-theme-sm";

  return (
    <span
      aria-hidden="true"
      className={`${sizeClass} ${AVATAR_PALETTE[getPaletteIndex(name)]} inline-flex shrink-0 items-center justify-center rounded-full font-semibold`}
    >
      {getInitials(name)}
    </span>
  );
}
