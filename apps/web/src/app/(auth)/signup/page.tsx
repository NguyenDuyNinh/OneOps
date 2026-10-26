import SignUpForm from "@/features/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp Page | Hoàng Hà Digital",
  description: "Trang SignUp Page Hoàng Hà Digital Dashboard Template",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
