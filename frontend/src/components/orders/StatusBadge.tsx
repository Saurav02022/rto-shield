import { Badge } from "@/components/ui/badge";
import { getOrderStatusLabel, getOrderStatusVariant } from "@/constants/orderStatus";
import type { OrderStatus } from "@/types/api";

type Props = {
  status: OrderStatus | string;
};

export function StatusBadge({ status }: Props) {
  const variant = getOrderStatusVariant(status);
  const label = getOrderStatusLabel(status);

  return <Badge variant={variant}>{label}</Badge>;
}
