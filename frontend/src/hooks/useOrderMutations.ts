"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/routes";
import { unwrap } from "@/lib/api-response";
import type { OrderResponse, TriggerCallResponse } from "@/types/api";
import { orderKeys } from "@/query-keys/orders";

async function postVerify(orderId: string): Promise<TriggerCallResponse> {
  const response = await fetch(API_ROUTES.orderVerify(orderId), { method: "POST" });
  return unwrap<TriggerCallResponse>(response);
}

async function postRefresh(
  orderId: string,
  params?: { callId?: string; force?: boolean },
): Promise<OrderResponse> {
  const url = new URL(API_ROUTES.orderRefresh(orderId), window.location.origin);
  if (params?.callId) url.searchParams.set("call_id", params.callId);
  if (params?.force) url.searchParams.set("force", "true");

  const response = await fetch(url.toString().replace(window.location.origin, ""), {
    method: "POST",
  });
  return unwrap<OrderResponse>(response);
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const verify = useMutation<TriggerCallResponse, Error, { orderId: string }>({
    mutationFn: ({ orderId }) => postVerify(orderId),
    onSuccess: (response) => {
      // Optimistically replace the order in the list cache so the row flips
      // to `verifying` immediately, then trigger a background refetch for
      // freshness.
      queryClient.setQueryData(orderKeys.detail(response.order.id), response.order);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });

  const refresh = useMutation<
    OrderResponse,
    Error,
    { orderId: string; callId?: string; force?: boolean }
  >({
    mutationFn: ({ orderId, callId, force }) => postRefresh(orderId, { callId, force }),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });

  return { verify, refresh };
}
