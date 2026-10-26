import { api } from "@/core/lib/api-client";
import type { LoginDto, LoginResponse } from "@oneops/shared-types";

export const authApi = {
  login: (dto: LoginDto): Promise<LoginResponse> =>
    api.post<LoginResponse>("/auth/login", dto),
};
