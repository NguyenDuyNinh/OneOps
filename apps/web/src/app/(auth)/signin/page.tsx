import { SignInForm } from "@/features/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | OneOps",
  description: "Đăng nhập vào hệ thống vận hành nội bộ OneOps",
};

export default function SignIn() {
  return <SignInForm />;
}
