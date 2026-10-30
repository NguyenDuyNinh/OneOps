import React from "react";
import { cn } from "./utils";

export type BadgeVariant = "light" | "solid";
export type BadgeSize = "sm" | "md";
export type BadgeColor =
  "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
  className,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium transition-colors";

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
  };

  const variants = {
    light: {
      primary:
        "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      success:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      error: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      warning:
        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      info: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      light: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/80",
      dark: "bg-gray-600 text-white dark:bg-white/20 dark:text-white",
    },
    solid: {
      primary: "bg-blue-600 text-white",
      success: "bg-emerald-600 text-white",
      error: "bg-red-600 text-white",
      warning: "bg-amber-600 text-white",
      info: "bg-cyan-600 text-white",
      light: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white",
      dark: "bg-gray-800 text-white dark:bg-gray-900",
    },
  };

  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={cn(baseStyles, sizeClass, colorStyles, className)}>
      {startIcon && <span className="mr-0.5">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-0.5">{endIcon}</span>}
    </span>
  );
};

export default Badge;
