import { api } from "../lib/api-client";
import type { LoginDto, LoginResponse } from "../types";

export const authApi = {
  login: (dto: LoginDto): Promise<LoginResponse> =>
    api.post<LoginResponse>("/auth/login", dto),
};
