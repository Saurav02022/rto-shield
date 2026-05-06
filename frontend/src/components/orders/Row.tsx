"use client";

import { Loader2, PhoneOutgoing, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { formatCurrency } from "@/utils/format";
import type { OrderResponse } from "@/types/api";

type Props = {
  order: OrderResponse;
  isVerifying: boolean;
  onVerify: (orderId: string) => void;
  onView: (orderId: string) => void;
};

export function Row({ order, isVerifying, onVerify, onView }: Props) {
  const canVerify =
    order.status === "pending_verification" ||
    order.status === "needs_followup" ||
    order.status === "unreachable" ||
    order.status === "verification_failed";

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{order.id}</TableCell>
      <TableCell className="font-medium">{order.customer_name}</TableCell>
      <TableCell className="max-w-[260px] truncate" title={order.product_summary}>
        {order.product_summary}
      </TableCell>
      <TableCell className="text-right font-mono">{formatCurrency(order.order_value)}</TableCell>
      <TableCell>
        <StatusBadge status={order.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="sm"
            onClick={() => onVerify(order.id)}
            disabled={!canVerify || isVerifying}
          >
            {isVerifying ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <PhoneOutgoing aria-hidden />
            )}
            Verify
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onView(order.id)}
            aria-label={`View details for order ${order.id}`}
          >
            <Eye aria-hidden />
            View
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
