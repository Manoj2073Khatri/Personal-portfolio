import type { ApiErrorBody } from "./types";

/** Error thrown for non-2xx CMS API responses. Safe to import from client code. */
export class CmsApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "CmsApiError";
  }

  static async fromResponse(res: Response): Promise<CmsApiError> {
    let body: Partial<ApiErrorBody> = {};
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      // Non-JSON error (e.g. proxy HTML page); fall back to the status text.
    }
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message || res.statusText || "Request failed";
    return new CmsApiError(res.status, message, body.errors ?? {});
  }
}
