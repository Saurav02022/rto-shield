import { BackendError } from "@/lib/api";
import { fail, ok } from "@/lib/api-response";
import { refreshOrderFromBolna } from "@/lib/orders-server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;
  const url = new URL(request.url);
  const callId = url.searchParams.get("call_id") ?? undefined;
  const force = url.searchParams.get("force") === "true";

  try {
    const data = await refreshOrderFromBolna(orderId, { callId, force });
    return ok(data, { message: "Order refreshed from Bolna." });
  } catch (error) {
    if (error instanceof BackendError) {
      return fail(error.code, error.message, { status: error.status });
    }
    return fail("INTERNAL_ERROR", "Failed to refresh order.", { status: 500 });
  }
}
