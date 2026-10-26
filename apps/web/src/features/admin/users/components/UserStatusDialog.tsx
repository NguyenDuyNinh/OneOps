"use client";

import React from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import { Modal } from "../ui/Modal";
import type { AdminUserListItem } from "../types";

interface UserStatusDialogProps {
  user: AdminUserListItem;
  /** Trạng thái sẽ áp dụng sau khi xác nhận. */
  nextActive: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UserStatusDialog({
  user,
  nextActive,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}: UserStatusDialogProps) {
  return (
    <Modal isOpen onClose={onClose} className="max-w-md p-6 lg:p-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {nextActive ? "Kích hoạt tài khoản" : "Vô hiệu hoá tài khoản"}
      </h3>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {nextActive ? (
          <>
            Tài khoản <span className="font-medium text-gray-800 dark:text-white/90">{user.email}</span>{" "}
            sẽ có thể đăng nhập trở lại.
          </>
        ) : (
          <>
            Tài khoản{" "}
            <span className="font-medium text-gray-800 dark:text-white/90">{user.email}</span> sẽ bị
            chặn đăng nhập ngay lập tức. Dữ liệu (công việc, chấm công, tin nhắn) vẫn được giữ
            nguyên.
          </>
        )}
      </p>

      {errorMessage && (
        <div className="mt-4" role="alert">
          <Alert
            variant="error"
            title={nextActive ? "Không kích hoạt được" : "Không vô hiệu hoá được"}
            message={errorMessage}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
          Huỷ
        </Button>
        <Button
          size="sm"
          variant={nextActive ? "primary" : "outline"}
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : nextActive ? "Kích hoạt" : "Vô hiệu hoá"}
        </Button>
      </div>
    </Modal>
  );
}
