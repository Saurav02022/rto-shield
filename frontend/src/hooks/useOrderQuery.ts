"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/routes";
import { unwrap } from "@/lib/api-response";
import type { OrderResponse } from "@/types/api";
import { orderKeys } from "@/query-keys/orders";

type Options = Pick<
  UseQueryOptions<OrderResponse>,
  "initialData" | "refetchInterval" | "refetchOnWindowFocus"
>;

async function fetchOrder(orderId: string): Promise<OrderResponse> {
  const response = await fetch(API_ROUTES.orderDetail(orderId), { cache: "no-store" });
  return unwrap<OrderResponse>(response);
}

export function useOrderQuery(orderId: string, options: Options = {}) {
  return useQuery<OrderResponse>({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => fetchOrder(orderId),
    enabled: Boolean(orderId),
    ...options,
  });
}
