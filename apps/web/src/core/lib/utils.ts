import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gộp class conditional + dedupe Tailwind class. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format số theo locale hiện tại, dùng cho metric/dashboard. */
export function formatNumber(value: number, locale = "vi-VN"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Format tiền tệ cho báo cáo quản lý. */
export function formatCurrency(value: number, currency = "VND", locale = "vi-VN"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}
