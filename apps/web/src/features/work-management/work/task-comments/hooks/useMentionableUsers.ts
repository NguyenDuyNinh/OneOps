"use client";

import { useCallback, useEffect, useState } from "react";
import { taskCommentsApi } from "../api/task-comments.api";
import type { MentionableUser } from "../types";

export function useMentionableUsers() {
  const [users, setUsers] = useState<MentionableUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = useCallback(() => {
    taskCommentsApi
      .getMentionableUsers()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setUsers(res);
        } else {
          setUsers([
            { id: "usr_mgr_01", name: "Hoàng Tuấn Bảo", role: "MANAGER" },
            { id: "usr_admin_01", name: "Xuân Thành Trần", role: "ADMIN" },
            { id: "usr_dev_01", name: "Nguyễn Văn A", role: "STAFF" },
            { id: "usr_des_01", name: "Trần Thị B", role: "STAFF" },
          ]);
        }
      })
      .catch(() => {
        setUsers([
          { id: "usr_mgr_01", name: "Hoàng Tuấn Bảo", role: "MANAGER" },
          { id: "usr_admin_01", name: "Xuân Thành Trần", role: "ADMIN" },
          { id: "usr_dev_01", name: "Nguyễn Văn A", role: "STAFF" },
          { id: "usr_des_01", name: "Trần Thị B", role: "STAFF" },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    fetchUsers,
  };
}
