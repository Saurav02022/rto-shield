"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/routes";
import { unwrap } from "@/lib/api-response";
import type { OrderListResponse } from "@/types/api";
import { orderKeys } from "@/query-keys/orders";

type Options = Pick<
  UseQueryOptions<OrderListResponse>,
  "initialData" | "refetchInterval" | "refetchOnWindowFocus"
>;

async function fetchOrders(): Promise<OrderListResponse> {
  const response = await fetch(API_ROUTES.orders, { cache: "no-store" });
  return unwrap<OrderListResponse>(response);
}

export function useOrdersQuery(options: Options = {}) {
  return useQuery<OrderListResponse>({
    queryKey: orderKeys.list(),
    queryFn: fetchOrders,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    ...options,
  });
}
