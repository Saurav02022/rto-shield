"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DetailDialog } from "@/components/orders/DetailDialog";
import { EmptyState } from "@/components/orders/EmptyState";
import { List } from "@/components/orders/List";
import { Toolbar } from "@/components/orders/Toolbar";
import { useOrderMutations } from "@/hooks/useOrderMutations";
import { useOrdersQuery } from "@/hooks/useOrdersQuery";
import type { OrderListResponse } from "@/types/api";
import { orderKeys } from "@/query-keys/orders";

type Props = {
  initialOrders: OrderListResponse;
};

export default function OrdersContainer({ initialOrders }: Props) {
  const queryClient = useQueryClient();
  const ordersQuery = useOrdersQuery({ initialData: initialOrders });
  const { verify, refresh } = useOrderMutations();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const items = useMemo(
    () => ordersQuery.data?.items ?? [],
    [ordersQuery.data],
  );
  const selectedOrder = useMemo(
    () => items.find((item) => item.id === selectedOrderId) ?? null,
    [items, selectedOrderId],
  );

  const verifyingOrderId = verify.isPending ? verify.variables?.orderId ?? null : null;
  const isRefreshingDetail = refresh.isPending;
  const isRefreshingList = ordersQuery.isFetching && !ordersQuery.isPending;

  const handleVerify = (orderId: string) => {
    verify.mutate(
      { orderId },
      {
        onSuccess: (response) => {
          toast.success("Verification call queued", {
            description: `Bolna execution: ${response.call_id}`,
          });
        },
        onError: (error) => {
          toast.error("Could not start verification call", {
            description: error.message,
          });
        },
      },
    );
  };

  const handleView = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleRefresh = () => {
    if (!selectedOrderId) return;
    refresh.mutate(
      { orderId: selectedOrderId },
      {
        onSuccess: () => {
          toast.success("Order refreshed from Bolna");
        },
        onError: (error) => {
          toast.error("Refresh failed", { description: error.message });
        },
      },
    );
  };

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-8 pb-12 sm:px-6 lg:px-8">
      <Toolbar
        totalCount={items.length}
        isRefreshing={isRefreshingList}
        onRefreshAll={handleRefreshAll}
      />

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <List
          orders={items}
          verifyingOrderId={verifyingOrderId}
          onVerify={handleVerify}
          onView={handleView}
        />
      )}

      <DetailDialog
        order={selectedOrder}
        open={Boolean(selectedOrderId)}
        isRefreshing={isRefreshingDetail}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null);
        }}
        onRefresh={handleRefresh}
      />
    </main>
  );
}
