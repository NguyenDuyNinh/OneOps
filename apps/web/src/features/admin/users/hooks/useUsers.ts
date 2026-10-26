"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AdminUserListItem,
  CreateUserDto,
  PaginatedUsers,
  UpdateUserDto,
  UserListQuery,
  UserRole,
  UserStats,
  UserStatusFilter,
} from "../types";
import { ApiError } from "@/features/auth";
import { usersApi } from "../api/users.api";
import { SEARCH_DEBOUNCE_MS, USERS_PAGE_SIZE } from "../constants";
import type { ManagerOption } from "../types";

/** Kết quả của một thao tác ghi — không ném lỗi ra ngoài để UI tự hiển thị. */
export type MutationResult = { ok: true } | { ok: false; message: string };

const EMPTY_LIST: PaginatedUsers = {
  items: [],
  total: 0,
  page: 1,
  pageSize: USERS_PAGE_SIZE,
  totalPages: 1,
};

const CONNECTION_ERROR_MESSAGE =
  "Không thể kết nối tới máy chủ. Vui lòng kiểm tra đường truyền và thử lại.";

/** Số lượng tối đa nạp cho ô chọn "Quản lý trực tiếp". */
const MANAGER_OPTION_LIMIT = 100;

function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "Bạn không có quyền quản lý tài khoản. Trang này chỉ dành cho quản trị viên.";
    }
    if (error.status === 401) {
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }
    return error.detail;
  }

  return CONNECTION_ERROR_MESSAGE;
}

/**
 * Nguồn dữ liệu duy nhất cho màn hình quản lý tài khoản:
 * danh sách có phân trang/bộ lọc, số liệu tổng quan và các thao tác ghi.
 */
export function useUsers() {
  const [list, setList] = useState<PaginatedUsers>(EMPTY_LIST);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [managerOptions, setManagerOptions] = useState<ManagerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<UserStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  // Chỉ giữ kết quả của request mới nhất (tránh race khi gõ tìm kiếm nhanh).
  const requestSeq = useRef(0);

  // Gõ tìm kiếm → chờ 1 nhịp rồi mới gọi API, đồng thời quay về trang 1.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const seq = ++requestSeq.current;
    let cancelled = false;

    setIsLoading(true);
    setErrorMessage(null);
    setIsForbidden(false);

    const query: UserListQuery = { page, pageSize: USERS_PAGE_SIZE, status };
    if (appliedSearch) query.q = appliedSearch;
    if (role) query.role = role;

    Promise.all([usersApi.list(query), usersApi.stats()])
      .then(([nextList, nextStats]) => {
        if (cancelled || seq !== requestSeq.current) return;
        setList(nextList);
        setStats(nextStats);
      })
      .catch((error: unknown) => {
        if (cancelled || seq !== requestSeq.current) return;
        setIsForbidden(error instanceof ApiError && error.status === 403);
        setErrorMessage(toErrorMessage(error));
      })
      .finally(() => {
        if (cancelled || seq !== requestSeq.current) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, appliedSearch, role, status, reloadToken]);

  // Danh sách gợi ý cho ô "Quản lý trực tiếp" — lỗi ở đây chỉ làm rỗng dropdown,
  // không chặn màn hình chính.
  useEffect(() => {
    let cancelled = false;

    usersApi
      .list({ pageSize: MANAGER_OPTION_LIMIT, status: "active" })
      .then((result) => {
        if (cancelled) return;
        setManagerOptions(
          result.items.map((item) => ({ id: item.id, name: item.name, email: item.email })),
        );
      })
      .catch(() => {
        if (!cancelled) setManagerOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const changeRole = useCallback((nextRole: UserRole | "") => {
    setRole(nextRole);
    setPage(1);
  }, []);

  const changeStatus = useCallback((nextStatus: UserStatusFilter) => {
    setStatus(nextStatus);
    setPage(1);
  }, []);

  const createUser = useCallback(
    async (dto: CreateUserDto): Promise<MutationResult> => {
      try {
        await usersApi.create(dto);
        setPage(1);
        setReloadToken((token) => token + 1);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: toErrorMessage(error) };
      }
    },
    [],
  );

  const updateUser = useCallback(
    async (id: string, dto: UpdateUserDto): Promise<MutationResult> => {
      try {
        await usersApi.update(id, dto);
        setReloadToken((token) => token + 1);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: toErrorMessage(error) };
      }
    },
    [],
  );

  const toggleStatus = useCallback(
    async (id: string, isActive: boolean): Promise<MutationResult> => {
      try {
        await usersApi.updateStatus(id, isActive);
        setReloadToken((token) => token + 1);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: toErrorMessage(error) };
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async (id: string, password: string): Promise<MutationResult> => {
      try {
        await usersApi.resetPassword(id, password);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: toErrorMessage(error) };
      }
    },
    [],
  );

  return {
    // dữ liệu
    items: list.items,
    total: list.total,
    page: list.page,
    pageSize: list.pageSize,
    totalPages: list.totalPages,
    stats,
    managerOptions,
    isLoading,
    errorMessage,
    isForbidden,
    // bộ lọc
    search,
    setSearch,
    role,
    setRole: changeRole,
    status,
    setStatus: changeStatus,
    setPage,
    // hành động
    refresh,
    createUser,
    updateUser,
    toggleStatus,
    resetPassword,
  };
}

export type UseUsersResult = ReturnType<typeof useUsers>;

export type { AdminUserListItem };
