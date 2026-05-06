import { BackendError } from "@/lib/api";
import { fail, ok } from "@/lib/api-response";
import { getOrder } from "@/lib/orders-server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;

  try {
    const data = await getOrder(orderId);
    return ok(data);
  } catch (error) {
    if (error instanceof BackendError) {
      return fail(error.code, error.message, { status: error.status });
    }
    return fail("INTERNAL_ERROR", "Failed to fetch order.", { status: 500 });
  }
}
