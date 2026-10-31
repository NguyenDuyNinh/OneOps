import {
  firstAdminSchema,
  passwordChangeSchema,
  sessionSchema,
  setupSchema,
  type FirstAdmin,
  type PasswordChange,
  type Session,
  type SetupState,
} from "@/features/tenant-system/access-control/tenant-auth/types";
import { apiRequest } from "@/features/tenant-system/access-control/tenant-auth/api/http";
const base = "/auth";
export const client = {
  setup: (signal?: AbortSignal) =>
    apiRequest(`${base}/setup`, { signal }, setupSchema),
  session: (signal?: AbortSignal) =>
    apiRequest(`${base}/session`, { signal }, sessionSchema),
  login: (username: string, password: string) =>
    apiRequest(
      `${base}/login`,
      { method: "POST", body: JSON.stringify({ username, password }) },
      sessionSchema,
    ),
  logout: () => apiRequest(`${base}/logout`, { method: "POST" }),
  changePassword: (input: PasswordChange) =>
    apiRequest(`${base}/password`, {
      method: "POST",
      body: JSON.stringify(passwordChangeSchema.parse(input)),
    }),
  // First-run bootstrap: the account API accepts this call anonymously while
  // the tenant still has no account.
  createFirstAdmin: (input: FirstAdmin) => {
    const parsed = firstAdminSchema.parse(input);
    return apiRequest("/accounts", {
      method: "POST",
      body: JSON.stringify({
        ...parsed,
        role: "MANAGER",
        isSystemAdmin: true,
        actorName: parsed.displayName,
      }),
    });
  },
};
export type { Session, SetupState };
