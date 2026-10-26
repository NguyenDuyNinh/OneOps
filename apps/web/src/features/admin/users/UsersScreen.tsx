"use client";

import React, { useCallback, useEffect, useState } from "react";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import { getCurrentUser } from "@/features/auth";
import { PlusIcon } from "@/icons";
import { useUsers } from "./hooks/useUsers";
import type { AdminUserListItem, UserFormValues } from "./types";
import UserFormModal from "./components/UserFormModal";
import ResetUserPasswordModal from "./components/ResetUserPasswordModal";
import UserStatsCards from "./components/UserStatsCards";
import UserStatusDialog from "./components/UserStatusDialog";
import UsersPagination from "./components/UsersPagination";
import UsersTable from "./components/UsersTable";
import UsersToolbar from "./components/UsersToolbar";

type FormTarget = { mode: "create" | "edit"; user: AdminUserListItem | null };
type StatusTarget = { user: AdminUserListItem; nextActive: boolean };
type Feedback = { variant: "success" | "error"; title: string; message: string };

export default function UsersScreen() {
  const users = useUsers();

  // Đọc phiên ở effect để tránh lệch hydration (server không có storage).
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    setCurrentUserId(getCurrentUser()?.id ?? null);
  }, []);

  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [statusTarget, setStatusTarget] = useState<StatusTarget | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<AdminUserListItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const openCreateModal = () => {
    setModalError(null);
    setFormTarget({ mode: "create", user: null });
  };

  const openEditModal = (user: AdminUserListItem) => {
    setModalError(null);
    setFormTarget({ mode: "edit", user });
  };

  const openStatusDialog = (user: AdminUserListItem) => {
    setModalError(null);
    setStatusTarget({ user, nextActive: !user.isActive });
  };

  const openPasswordModal = (user: AdminUserListItem) => {
    setModalError(null);
    setPasswordTarget(user);
  };

  const closeModals = useCallback(() => {
    setFormTarget(null);
    setStatusTarget(null);
    setPasswordTarget(null);
    setModalError(null);
  }, []);

  const handleSubmitForm = async (values: UserFormValues) => {
    if (!formTarget) return;

    setIsSubmitting(true);
    setModalError(null);

    const result =
      formTarget.mode === "create"
        ? await users.createUser({
            email: values.email,
            name: values.name,
            role: values.role,
            password: values.password,
            ...(values.managerId ? { managerId: values.managerId } : {}),
          })
        : formTarget.user
          ? await users.updateUser(formTarget.user.id, {
              name: values.name,
              role: values.role,
              managerId: values.managerId ? values.managerId : null,
            })
          : { ok: false as const, message: "Không xác định được tài khoản cần sửa." };

    setIsSubmitting(false);

    if (!result.ok) {
      setModalError(result.message);
      return;
    }

    setFeedback({
      variant: "success",
      title: "Thành công",
      message:
        formTarget.mode === "create"
          ? `Đã tạo tài khoản ${values.email}.`
          : `Đã cập nhật tài khoản ${values.email}.`,
    });
    closeModals();
  };

  const handleConfirmStatus = async () => {
    if (!statusTarget) return;

    setIsSubmitting(true);
    setModalError(null);
    const result = await users.toggleStatus(statusTarget.user.id, statusTarget.nextActive);
    setIsSubmitting(false);

    if (!result.ok) {
      setModalError(result.message);
      return;
    }

    setFeedback({
      variant: "success",
      title: "Thành công",
      message: statusTarget.nextActive
        ? `Đã kích hoạt lại tài khoản ${statusTarget.user.email}.`
        : `Đã vô hiệu hoá tài khoản ${statusTarget.user.email}.`,
    });
    closeModals();
  };

  const handleResetPassword = async (password: string) => {
    if (!passwordTarget) return;

    setIsSubmitting(true);
    setModalError(null);
    const result = await users.resetPassword(passwordTarget.id, password);
    setIsSubmitting(false);

    if (!result.ok) {
      setModalError(result.message);
      return;
    }

    setFeedback({
      variant: "success",
      title: "Đã đặt lại mật khẩu",
      message: `Tài khoản ${passwordTarget.email} dùng mật khẩu mới: ${password} — hãy sao chép và gửi cho người dùng ngay bây giờ.`,
    });
    closeModals();
  };

  return (
    <div className="space-y-6">
      {users.isForbidden && (
        <Alert
          variant="error"
          title="Không có quyền truy cập"
          message="Trang quản lý tài khoản chỉ dành cho quản trị viên. Vui lòng liên hệ quản trị viên nếu bạn cần quyền này."
        />
      )}

      {!users.isForbidden && (
        <>
          {feedback && (
            <div className="relative">
              <Alert
                variant={feedback.variant}
                title={feedback.title}
                message={feedback.message}
              />
              <button
                type="button"
                onClick={() => setFeedback(null)}
                aria-label="Đóng thông báo"
                className="absolute top-3 right-3 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          )}

          <UserStatsCards stats={users.stats} />

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                  Danh sách tài khoản
                </h3>
                <p className="text-theme-xs mt-1 text-gray-500 dark:text-gray-400">
                  Chỉ quản trị viên mới thấy và thao tác được trên trang này.
                </p>
              </div>
              <Button size="sm" startIcon={<PlusIcon />} onClick={openCreateModal}>
                Thêm tài khoản
              </Button>
            </div>

            <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
              <UsersToolbar
                search={users.search}
                onSearchChange={users.setSearch}
                role={users.role}
                onRoleChange={users.setRole}
                status={users.status}
                onStatusChange={users.setStatus}
                onRefresh={users.refresh}
                isLoading={users.isLoading}
              />
            </div>

            {users.errorMessage ? (
              <div className="border-t border-gray-100 px-5 py-6 dark:border-gray-800">
                <Alert
                  variant="error"
                  title="Không tải được danh sách tài khoản"
                  message={users.errorMessage}
                />
                <button
                  type="button"
                  onClick={users.refresh}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 mt-3 text-sm font-medium"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 dark:border-gray-800">
                <UsersTable
                  items={users.items}
                  currentUserId={currentUserId}
                  isLoading={users.isLoading}
                  onEdit={openEditModal}
                  onToggleStatus={openStatusDialog}
                  onResetPassword={openPasswordModal}
                />
              </div>
            )}

            <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
              <UsersPagination
                page={users.page}
                totalPages={users.totalPages}
                total={users.total}
                pageSize={users.pageSize}
                isLoading={users.isLoading}
                onPageChange={users.setPage}
              />
            </div>
          </div>
        </>
      )}

      {!users.isForbidden && formTarget && (
        <UserFormModal
          mode={formTarget.mode}
          user={formTarget.user}
          managerOptions={users.managerOptions}
          currentUserId={currentUserId}
          isSubmitting={isSubmitting}
          errorMessage={modalError}
          onClose={closeModals}
          onSubmit={handleSubmitForm}
        />
      )}

      {!users.isForbidden && statusTarget && (
        <UserStatusDialog
          user={statusTarget.user}
          nextActive={statusTarget.nextActive}
          isSubmitting={isSubmitting}
          errorMessage={modalError}
          onClose={closeModals}
          onConfirm={handleConfirmStatus}
        />
      )}

      {!users.isForbidden && passwordTarget && (
        <ResetUserPasswordModal
          user={passwordTarget}
          isSubmitting={isSubmitting}
          errorMessage={modalError}
          onClose={closeModals}
          onSubmit={handleResetPassword}
        />
      )}
    </div>
  );
}
