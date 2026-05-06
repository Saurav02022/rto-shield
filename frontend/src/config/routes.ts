/** App route constants — single source of truth for in-app URLs. */

export const PAGE_ROUTES = {
  home: "/",
  orderDetail: (orderId: string) => `/orders/${orderId}`,
} as const;

export const API_ROUTES = {
  orders: "/api/orders",
  orderDetail: (orderId: string) => `/api/orders/${orderId}`,
  orderVerify: (orderId: string) => `/api/orders/${orderId}/verify`,
  orderRefresh: (orderId: string) => `/api/orders/${orderId}/refresh`,
} as const;
