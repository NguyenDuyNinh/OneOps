import {
  historySchema,
  matrixSchema,
  myPermissionsSchema,
  saveInput,
  type SaveInput,
} from "@/features/tenant-system/access-control/roles-permissions/types";
import { apiRequest } from "@/features/tenant-system/access-control/roles-permissions/api/http";

const base = "/permissions";

export const client = {
  matrix: (signal?: AbortSignal) => apiRequest(base, { signal }, matrixSchema),
  mine: (signal?: AbortSignal) =>
    apiRequest(`${base}/me`, { signal }, myPermissionsSchema),
  history: (signal?: AbortSignal) =>
    apiRequest(`${base}/history`, { signal }, historySchema),
  save: (input: SaveInput) =>
    apiRequest(
      base,
      { method: "PUT", body: JSON.stringify(saveInput.parse(input)) },
      matrixSchema,
    ),
};
