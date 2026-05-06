import { BackendError } from "@/lib/api";
import { fail, ok } from "@/lib/api-response";
import { triggerVerifyCall } from "@/lib/orders-server";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;

  try {
    const data = await triggerVerifyCall(orderId);
    return ok(data, { message: "Verification call queued." });
  } catch (error) {
    if (error instanceof BackendError) {
      return fail(error.code, error.message, { status: error.status });
    }
    return fail("INTERNAL_ERROR", "Failed to trigger verification call.", { status: 500 });
  }
}
