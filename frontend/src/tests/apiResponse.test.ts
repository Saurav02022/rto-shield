import { describe, expect, it } from "vitest";

import { ApiError, fail, ok, unwrap } from "@/lib/api-response";

describe("api-response envelope", () => {
  it("wraps success payloads with success=true", async () => {
    const response = ok({ id: "ORD-1" }, { message: "queued" });
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json).toEqual({ success: true, data: { id: "ORD-1" }, message: "queued" });
  });

  it("wraps error payloads with success=false", async () => {
    const response = fail("NOT_FOUND", "missing", { status: 404 });
    const json = await response.json();
    expect(response.status).toBe(404);
    expect(json).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "missing" },
    });
  });

  it("unwrap returns the data on success", async () => {
    const result = await unwrap<{ id: string }>(ok({ id: "ORD-2" }));
    expect(result).toEqual({ id: "ORD-2" });
  });

  it("unwrap throws ApiError on failure envelope", async () => {
    await expect(unwrap(fail("BOOM", "broken"))).rejects.toBeInstanceOf(ApiError);
    try {
      await unwrap(fail("BOOM", "broken"));
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe("BOOM");
      expect((err as Error).message).toBe("broken");
    }
  });
});
