/** Standard API envelope shared by all `app/api/*` route handlers. */

export type ApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  message?: string;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;

export function ok<TData>(data: TData, init?: { message?: string; meta?: Record<string, unknown>; status?: number }): Response {
  const body: ApiSuccessResponse<TData> = {
    success: true,
    data,
    ...(init?.message && { message: init.message }),
    ...(init?.meta && { meta: init.meta }),
  };
  return Response.json(body, { status: init?.status ?? 200 });
}

export function fail(
  code: string,
  message: string,
  init?: { status?: number; details?: unknown },
): Response {
  const error: ApiErrorResponse["error"] = { code, message };
  if (init?.details !== undefined) {
    error.details = init.details;
  }
  return Response.json({ success: false, error } satisfies ApiErrorResponse, {
    status: init?.status ?? 500,
  });
}

/** Narrow helper for client hooks: throws on error envelope, returns data otherwise. */
export async function unwrap<TData>(response: Response): Promise<TData> {
  const json = (await response.json()) as ApiResponse<TData>;
  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message);
  }
  return json.data;
}

export class ApiError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}
