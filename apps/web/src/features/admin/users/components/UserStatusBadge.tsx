import React from "react";
import Badge from "../ui/Badge";

/** Nhãn trạng thái hoạt động của tài khoản. */
export default function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge size="sm" color={isActive ? "success" : "error"}>
      {isActive ? "Đang hoạt động" : "Đã vô hiệu hoá"}
    </Badge>
  );
}
