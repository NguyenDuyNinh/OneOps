"use client";

import React, { useMemo, useState } from "react";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/InputField";
import Label from "../ui/Label";
import { Modal } from "../ui/Modal";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import {
  PASSWORD_MIN_LENGTH,
  ROLE_FILTER_OPTIONS,
  generatePassword,
} from "../constants";
import type { AdminUserListItem, ManagerOption, UserFormValues } from "../types";
import { UserRole } from "../types";
import FormSelect from "./FormSelect";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<keyof UserFormValues, string>>;

interface UserFormModalProps {
  mode: "create" | "edit";
  user: AdminUserListItem | null;
  managerOptions: ManagerOption[];
  currentUserId: string | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}

export default function UserFormModal({
  mode,
  user,
  managerOptions,
  currentUserId,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const isEdit = mode === "edit";

  const [values, setValues] = useState<UserFormValues>({
    email: user?.email ?? "",
    name: user?.name ?? "",
    role: user?.role ?? UserRole.EMPLOYEE,
    password: "",
    managerId: user?.managerId ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = useMemo(
    () => ROLE_FILTER_OPTIONS.filter((option) => option.value !== ""),
    [],
  );

  const managerSelectOptions = useMemo(
    () => [
      { value: "", label: "— Không gán —" },
      ...managerOptions
        .filter((manager) => manager.id !== user?.id)
        .map((manager) => ({ value: manager.id, label: `${manager.name} (${manager.email})` })),
    ],
    [managerOptions, user?.id],
  );

  const updateField = <TKey extends keyof UserFormValues>(key: TKey, value: UserFormValues[TKey]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!values.name.trim()) {
      next.name = "Vui lòng nhập họ tên.";
    }

    if (!isEdit) {
      if (!EMAIL_PATTERN.test(values.email.trim())) {
        next.email = "Email không hợp lệ.";
      }
      if (values.password.length < PASSWORD_MIN_LENGTH) {
        next.password = `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự.`;
      }
    }

    setFieldErrors(next);
    return Object.values(next).every((message) => message === undefined);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...values,
      email: values.email.trim(),
      name: values.name.trim(),
    });
  };

  const handleGeneratePassword = () => {
    const generated = generatePassword();
    if (!generated) return;
    updateField("password", generated);
    setShowPassword(true);
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-2xl p-6 lg:p-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {isEdit
          ? "Cập nhật họ tên, vai trò và quản lý trực tiếp. Email không thể thay đổi."
          : "Tài khoản sẽ đăng nhập được ngay bằng email và mật khẩu bên dưới."}
      </p>

      {errorMessage && (
        <div className="mt-4" role="alert">
          <Alert variant="error" title="Không lưu được" message={errorMessage} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="user-name">
              Họ tên <span className="text-error-500">*</span>
            </Label>
            <Input
              id="user-name"
              name="name"
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="off"
              disabled={isSubmitting}
              error={Boolean(fieldErrors.name)}
              hint={fieldErrors.name}
            />
          </div>

          <div>
            <Label htmlFor="user-email">
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              id="user-email"
              name="email"
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="ban@oneops.vn"
              autoComplete="off"
              disabled={isEdit || isSubmitting}
              error={Boolean(fieldErrors.email)}
              hint={
                fieldErrors.email ??
                (isEdit ? "Email dùng để đăng nhập nên không thể sửa." : undefined)
              }
            />
          </div>

          <div>
            <Label htmlFor="user-role">
              Vai trò <span className="text-error-500">*</span>
            </Label>
            <FormSelect
              id="user-role"
              value={values.role}
              options={roleOptions}
              onChange={(value) => updateField("role", value as UserRole)}
              disabled={isSubmitting || (isEdit && user?.id === currentUserId)}
            />
            {isEdit && user?.id === currentUserId && (
              <p className="text-theme-xs mt-1.5 text-gray-500 dark:text-gray-400">
                Không thể tự đổi vai trò của chính mình.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="user-manager">Quản lý trực tiếp</Label>
            <FormSelect
              id="user-manager"
              value={values.managerId}
              options={managerSelectOptions}
              onChange={(value) => updateField("managerId", value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {!isEdit && (
          <div>
            <Label htmlFor="user-password">
              Mật khẩu khởi tạo <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="user-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={values.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
                autoComplete="new-password"
                disabled={isSubmitting}
                error={Boolean(fieldErrors.password)}
                hint={fieldErrors.password}
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
            <button
              type="button"
              onClick={handleGeneratePassword}
              disabled={isSubmitting}
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 mt-2 text-sm font-medium disabled:opacity-50"
            >
              Tạo mật khẩu ngẫu nhiên
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo tài khoản"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
