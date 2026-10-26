import { api } from "@/features/auth";
import type {
  AdminUserListItem,
  CreateUserDto,
  PaginatedUsers,
  ResetUserPasswordDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UpdateUserStatusResponse,
  UserListQuery,
  UserStats,
} from "../types";

function buildQuery(params: UserListQuery): string {
  const search = new URLSearchParams();

  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.pageSize !== undefined) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.role) search.set("role", params.role);
  if (params.status && params.status !== "all") search.set("status", params.status);

  const queryString = search.toString();
  return queryString ? `?${queryString}` : "";
}

export const usersApi = {
  list: (params: UserListQuery = {}): Promise<PaginatedUsers> =>
    api.get<PaginatedUsers>(`/users${buildQuery(params)}`),

  stats: (): Promise<UserStats> => api.get<UserStats>("/users/stats"),

  getById: (id: string): Promise<AdminUserListItem> =>
    api.get<AdminUserListItem>(`/users/${id}`),

  create: (dto: CreateUserDto): Promise<AdminUserListItem> =>
    api.post<AdminUserListItem>("/users", dto),

  update: (id: string, dto: UpdateUserDto): Promise<AdminUserListItem> =>
    api.patch<AdminUserListItem>(`/users/${id}`, dto),

  updateStatus: (id: string, isActive: boolean): Promise<UpdateUserStatusResponse> => {
    const dto: UpdateUserStatusDto = { isActive };
    return api.patch<UpdateUserStatusResponse>(`/users/${id}/status`, dto);
  },

  resetPassword: (id: string, password: string): Promise<void> => {
    const dto: ResetUserPasswordDto = { password };
    return api.patch<void>(`/users/${id}/password`, dto);
  },
};
