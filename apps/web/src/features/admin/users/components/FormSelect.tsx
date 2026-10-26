import React from "react";

export interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  id: string;
  value: string;
  options: ReadonlyArray<FormSelectOption>;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

/**
 * Select có kiểm soát (controlled) cho form tài khoản.
 * Khác `features/_template/ui/form/Select.tsx` (bản copy trong module này) ở chỗ cho phép chọn lại giá trị rỗng ("— Không gán —").
 */
export default function FormSelect({
  id,
  value,
  options,
  onChange,
  disabled = false,
  error = false,
}: FormSelectProps) {
  const stateClasses = disabled
    ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
    : error
      ? "border-error-500 bg-transparent text-gray-800 dark:border-error-500 dark:bg-gray-900 dark:text-white/90"
      : "border-gray-300 bg-transparent text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={`shadow-theme-xs h-11 w-full appearance-none rounded-lg border px-4 py-2.5 text-sm ${stateClasses}`}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
