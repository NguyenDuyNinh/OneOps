import {
  accountInput,
  accountPatch,
  accountSchema,
  changeAccessInput,
  historySchema,
  listSchema,
  resetPasswordInput,
  type AccountDto,
  type AccountInput,
  type AccountProfile,
  type ChangeAccessInput,
  type ResetPasswordInput,
} from "@/features/tenant-system/access-control/accounts/types";
import { apiRequest } from "@/features/tenant-system/access-control/accounts/api/http";
const base = "/accounts";
async function collect(signal?: AbortSignal) {
  const items: AccountDto[] = [];
  for (let page = 1; ; page++) {
    const result = await apiRequest(
      `${base}?page=${page}&pageSize=100`,
      { signal },
      listSchema,
    );
    items.push(...result.items);
    if (items.length >= result.total || !result.items.length) return items;
  }
}
export const client = {
  list: (signal?: AbortSignal) => collect(signal),
  create: (data: AccountInput) =>
    apiRequest(
      base,
      { method: "POST", body: JSON.stringify(accountInput.parse(data)) },
      accountSchema,
    ),
  update: (record: AccountDto, patch: AccountProfile) =>
    apiRequest(
      `${base}/${record.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...accountPatch.parse(patch),
          version: record.version,
        }),
      },
      accountSchema,
    ),
  changeAccess: (record: AccountDto, input: ChangeAccessInput) =>
    apiRequest(
      `${base}/${record.id}/access`,
      {
        method: "POST",
        body: JSON.stringify({
          ...changeAccessInput.parse(input),
          version: record.version,
        }),
      },
      accountSchema,
    ),
  resetPassword: (record: AccountDto, input: ResetPasswordInput) =>
    apiRequest(
      `${base}/${record.id}/password`,
      {
        method: "POST",
        body: JSON.stringify({
          ...resetPasswordInput.parse(input),
          version: record.version,
        }),
      },
      accountSchema,
    ),
  history: (record: AccountDto, signal?: AbortSignal) =>
    apiRequest(`${base}/${record.id}/history`, { signal }, historySchema),
};
