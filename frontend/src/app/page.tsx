import { listOrders } from "@/lib/orders-server";
import OrdersContainer from "@/components/orders";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialOrders = await listOrders();
  return <OrdersContainer initialOrders={initialOrders} />;
}
