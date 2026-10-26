import SignInForm from "@/features/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignIn Page | Hoàng Hà Digital",
  description: "Trang Signin Page Hoàng Hà Digital Dashboard Template",
};

export default function SignIn() {
  return <SignInForm />;
}
