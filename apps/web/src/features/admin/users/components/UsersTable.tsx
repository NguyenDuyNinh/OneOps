"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/Table";
import type { AdminUserListItem } from "../types";
import UserAvatar from "./UserAvatar";
import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" });

const HEADER_CELL =
  "text-theme-xs px-5 py-3 text-start font-medium whitespace-nowrap text-gray-500 dark:text-gray-400";
const BODY_CELL = "px-5 py-4 text-start align-middle";

interface UsersTableProps {
  items: AdminUserListItem[];
  currentUserId: string | null;
  isLoading: boolean;
  onEdit: (user: AdminUserListItem) => void;
  onToggleStatus: (user: AdminUserListItem) => void;
  onResetPassword: (user: AdminUserListItem) => void;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <td colSpan={6} className={BODY_CELL}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100 dark:bg-white/5" />
              <div className="space-y-2">
                <div className="h-3 w-40 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                <div className="h-3 w-56 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
              </div>
            </div>
          </td>
        </TableRow>
      ))}
    </>
  );
}

export default function UsersTable({
  items,
  currentUserId,
  isLoading,
  onEdit,
  onToggleStatus,
  onResetPassword,
}: UsersTableProps) {
  const showSkeleton = isLoading && items.length === 0;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[980px]">
        <Table className="min-w-full">
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className={HEADER_CELL}>
                Người dùng
              </TableCell>
              <TableCell isHeader className={HEADER_CELL}>
                Vai trò
              </TableCell>
              <TableCell isHeader className={HEADER_CELL}>
                Quản lý trực tiếp
              </TableCell>
              <TableCell isHeader className={HEADER_CELL}>
                Trạng thái
              </TableCell>
              <TableCell isHeader className={HEADER_CELL}>
                Ngày tạo
              </TableCell>
              <TableCell isHeader className={`${HEADER_CELL} text-end`}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {showSkeleton && <SkeletonRows />}

            {!showSkeleton && items.length === 0 && (
              <TableRow>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                    Không tìm thấy tài khoản nào
                  </p>
                  <p className="text-theme-xs mt-1 text-gray-500 dark:text-gray-400">
                    Thử xoá bộ lọc hoặc đổi từ khoá tìm kiếm.
                  </p>
                </td>
              </TableRow>
            )}

            {items.map((user) => {
              const isCurrentUser = user.id === currentUserId;

              return (
                <TableRow
                  key={user.id}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                    isLoading ? "opacity-60" : ""
                  }`}
                >
                  <TableCell className={BODY_CELL}>
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.name} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-theme-sm block truncate font-medium whitespace-nowrap text-gray-800 dark:text-white/90">
                            {user.name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-brand-600 bg-brand-50 dark:bg-brand-500/15 dark:text-brand-400 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap uppercase">
                              Bạn
                            </span>
                          )}
                        </div>
                        <span className="text-theme-xs block truncate whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className={`${BODY_CELL} whitespace-nowrap`}>
                    <UserRoleBadge role={user.role} />
                  </TableCell>

                  <TableCell className={`${BODY_CELL} whitespace-nowrap`}>
                    <span className="text-theme-sm text-gray-600 dark:text-gray-300">
                      {user.managerName ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell className={`${BODY_CELL} whitespace-nowrap`}>
                    <UserStatusBadge isActive={user.isActive} />
                  </TableCell>

                  <TableCell className={`${BODY_CELL} whitespace-nowrap`}>
                    <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                      {DATE_FORMATTER.format(new Date(user.createdAt))}
                    </span>
                  </TableCell>

                  <TableCell className={`${BODY_CELL} text-end whitespace-nowrap`}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="text-theme-xs text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg px-2.5 py-1.5 font-medium transition"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onResetPassword(user)}
                        className="text-theme-xs rounded-lg px-2.5 py-1.5 font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        Mật khẩu
                      </button>
                      {isCurrentUser ? (
                        <span
                          className="text-theme-xs cursor-not-allowed rounded-lg px-2.5 py-1.5 text-gray-400 dark:text-gray-500"
                          title="Không thể tự vô hiệu hoá tài khoản đang đăng nhập"
                        >
                          Khoá
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleStatus(user)}
                          className={`text-theme-xs rounded-lg px-2.5 py-1.5 font-medium transition ${
                            user.isActive
                              ? "text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                              : "text-success-600 hover:bg-success-50 dark:hover:bg-success-500/10"
                          }`}
                        >
                          {user.isActive ? "Khoá" : "Mở khoá"}
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
