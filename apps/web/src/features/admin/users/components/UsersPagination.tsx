"use client";

import React, { useMemo } from "react";

interface UsersPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

/** Cửa sổ số trang tối đa 5 nút quanh trang hiện tại. */
function buildPageWindow(page: number, totalPages: number): number[] {
  const windowSize = Math.min(5, totalPages);
  const start = Math.min(Math.max(1, page - Math.floor(windowSize / 2)), totalPages - windowSize + 1);

  return Array.from({ length: windowSize }, (_, index) => start + index);
}

export default function UsersPagination({
  page,
  totalPages,
  total,
  pageSize,
  isLoading,
  onPageChange,
}: UsersPaginationProps) {
  const pages = useMemo(() => buildPageWindow(page, Math.max(1, totalPages)), [page, totalPages]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const navButtonClass =
    "shadow-theme-xs flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]";

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-theme-sm text-gray-500 dark:text-gray-400">
        Hiển thị <span className="font-medium text-gray-700 dark:text-gray-300">{from}</span>–
        <span className="font-medium text-gray-700 dark:text-gray-300">{to}</span> trong{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">{total}</span> tài khoản
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className={navButtonClass}
        >
          Trước
        </button>

        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            disabled={isLoading}
            aria-current={pageNumber === page ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition ${
              pageNumber === page
                ? "bg-brand-500 text-white"
                : "text-gray-700 hover:bg-brand-50 dark:text-gray-400 dark:hover:bg-white/5"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className={navButtonClass}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
