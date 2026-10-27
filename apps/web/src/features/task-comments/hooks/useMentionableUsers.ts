'use client';

import { useCallback, useEffect, useState } from 'react';
import { taskCommentsApi } from '../api/task-comments.api';
import type { MentionableUser } from '../types';

export function useMentionableUsers() {
  const [users, setUsers] = useState<MentionableUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await taskCommentsApi.getMentionableUsers();
      setUsers(res);
    } catch {
      // Bỏ qua lỗi kết nối
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    fetchUsers,
  };
}

