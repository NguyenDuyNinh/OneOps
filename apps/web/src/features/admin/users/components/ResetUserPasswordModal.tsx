"use client";

import React, { useState } from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/InputField";
import Label from "../ui/Label";
import { Modal } from "../ui/Modal";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { PASSWORD_MIN_LENGTH, generatePassword } from "../constants";
import type { AdminUserListItem } from "../types";
import UserAvatar from "./UserAvatar";

interface ResetUserPasswordModalProps {
  user: AdminUserListItem;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

export default function ResetUserPasswordModal({
  user,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: ResetUserPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(true);

  const handleGenerate = () => {
    const generated = generatePassword();
    if (!generated) return;
    setPassword(generated);
    setFieldError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < PASSWORD_MIN_LENGTH) {
      setFieldError(`Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự.`);
      return;
    }

    setFieldError(null);
    onSubmit(password);
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg p-6 lg:p-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Đặt lại mật khẩu</h3>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]">
        <UserAvatar name={user.name} size="sm" />
        <div className="min-w-0">
          <p className="text-theme-sm truncate font-medium text-gray-800 dark:text-white/90">
            {user.name}
          </p>
          <p className="text-theme-xs truncate text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Mật khẩu cũ sẽ ngừng hiệu lực ngay lập tức. Hãy gửi mật khẩu mới cho người dùng qua kênh
        bảo mật.
      </p>

      {errorMessage && (
        <div className="mt-4" role="alert">
          <Alert variant="error" title="Không đặt lại được" message={errorMessage} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <div>
          <Label htmlFor="reset-password">
            Mật khẩu mới <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="reset-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldError(null);
              }}
              placeholder={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
              autoComplete="new-password"
              autoFocus
              disabled={isSubmitting}
              error={Boolean(fieldError)}
              hint={fieldError ?? undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute top-3 right-4 z-30"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isSubmitting}
          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm font-medium disabled:opacity-50"
        >
          Tạo mật khẩu ngẫu nhiên
        </button>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Đặt lại mật khẩu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
