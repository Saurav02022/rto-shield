/** React Query key factory for the orders feature. */

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (orderId: string) => [...orderKeys.details(), orderId] as const,
};
