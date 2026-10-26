"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Alert from "@/core/ui/alert/Alert";
import Button from "@/core/ui/button/Button";
import Checkbox from "@/core/ui/form/Checkbox";
import Input from "@/core/ui/form/InputField";
import Label from "@/core/ui/form/Label";
import { isAuthenticated } from "@/core/lib/auth-storage";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useLogin } from "./hooks/useLogin";

const ERROR_TITLE = "Đăng nhập thất bại";

export default function SignInForm() {
  const router = useRouter();
  const { login, isLoading, errorMessage } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Đã có phiên hợp lệ thì không cần đứng ở trang đăng nhập nữa.
  useEffect(() => {
    if (isAuthenticated()) router.replace("/admin");
  }, [router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void login({ email: email.trim(), password }, rememberMe);
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Về trang chủ
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-5 sm:mb-8">
          <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
            Đăng nhập
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nhập email và mật khẩu để truy cập hệ thống OneOps.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5" role="alert">
            <Alert variant="error" title={ERROR_TITLE} message={errorMessage} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label htmlFor="email">
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ban@oneops.vn"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                autoFocus
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">
                Mật khẩu <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute top-1/2 right-4 z-30 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onChange={setRememberMe}
                disabled={isLoading}
              />
              <label
                htmlFor="remember-me"
                className="text-theme-sm block font-normal text-gray-700 dark:text-gray-400"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div>
              <Button className="w-full" size="sm" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-5">
          <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/signup"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
