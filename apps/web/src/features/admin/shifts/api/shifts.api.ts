import type {
  ApiListResponse,
  ApiResponse,
  Employee,
  EmployeeQuery,
  Shift,
  ShiftPayload,
  ShiftQuery,
} from "../types/shifts.types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
).replace(/\/+$/, "");

const ENDPOINTS = {
  shifts: process.env.NEXT_PUBLIC_SHIFTS_ENDPOINT ?? "/api/shifts",
  employees:
    process.env.NEXT_PUBLIC_EMPLOYEES_ENDPOINT ?? "/api/employees",
};

type RequestOptions = RequestInit & {
  params?: Record<string, string | undefined>;
};

function buildUrl(
  path: string,
  params?: Record<string, string | undefined>,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const url = new URL(
    `${API_BASE_URL}${normalizedPath}`,
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost",
  );

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, headers, ...init } = options;

  const response = await fetch(buildUrl(path, params), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    let message = "";

    try {
      if (contentType.includes("application/json")) {
        const body = await response.json();

        message =
          body?.message ??
          body?.error ??
          JSON.stringify(body);
      } else {
        message = (await response.text()).slice(0, 300);
      }
    } catch {
      // Giữ thông báo lỗi mặc định bên dưới.
    }

    if (response.status === 404) {
      throw new Error(
        `Không tìm thấy API: ${response.url}. ` +
          "Kiểm tra endpoint hoặc route backend.",
      );
    }

    throw new Error(
      message || `Yêu cầu thất bại (${response.status})`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function unwrapList<T>(
  response: ApiListResponse<T> | T[],
): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  throw new Error("API không trả về danh sách dữ liệu hợp lệ.");
}

function unwrap<T>(response: ApiResponse<T> | T): T {
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export const shiftsApi = {
  async list(query: ShiftQuery = {}): Promise<Shift[]> {
    const response = await request<ApiListResponse<Shift> | Shift[]>(
      ENDPOINTS.shifts,
      {
        params: {
          search: query.search,
          status: query.status,
        },
      },
    );

    return unwrapList(response);
  },

  async create(payload: ShiftPayload): Promise<Shift> {
    const response = await request<ApiResponse<Shift> | Shift>(
      ENDPOINTS.shifts,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return unwrap(response);
  },

  async update(
    id: string,
    payload: ShiftPayload,
  ): Promise<Shift> {
    const response = await request<ApiResponse<Shift> | Shift>(
      `${ENDPOINTS.shifts}/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );

    return unwrap(response);
  },

  async remove(id: string): Promise<void> {
    await request<void>(
      `${ENDPOINTS.shifts}/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },

  async listEmployees(
    query: EmployeeQuery = {},
  ): Promise<Employee[]> {
    const response = await request<
      ApiListResponse<Employee> | Employee[]
    >(ENDPOINTS.employees, {
      params: {
        search: query.search,
        status: query.status,
        departmentId: query.departmentId,
      },
    });

    return unwrapList(response);
  },
};