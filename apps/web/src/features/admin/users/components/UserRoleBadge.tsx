import React from "react";
import Badge from "../ui/Badge";
import type { UserRole } from "../types";
import { ROLE_BADGE_COLOR, ROLE_LABELS } from "../constants";

/** Nhãn vai trò — dùng chung cho bảng và các dialog. */
export default function UserRoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge size="sm" color={ROLE_BADGE_COLOR[role]}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}
