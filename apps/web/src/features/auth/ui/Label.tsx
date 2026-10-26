// UI RIÊNG của module `auth` — bản copy từ `features/_template/ui`.
// KHÔNG import file này từ module khác: module khác tự copy bản của nó vào `<module>/ui/`.
// Sửa ở đây chỉ ảnh hưởng module `auth` — đó là mục đích (không conflict khi 17 người cùng sửa).

import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Default classes that apply by default
        "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400",

        // User-defined className that can override the default margin
        className,
      )}
    >
      {children}
    </label>
  );
};

export default Label;
