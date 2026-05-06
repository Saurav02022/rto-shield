import { fail, ok } from "@/lib/api-response";
import { BackendError } from "@/lib/api";
import { listOrders } from "@/lib/orders-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listOrders();
    return ok(data);
  } catch (error) {
    if (error instanceof BackendError) {
      return fail(error.code, error.message, { status: error.status });
    }
    return fail("INTERNAL_ERROR", "Failed to list orders.", { status: 500 });
  }
}
