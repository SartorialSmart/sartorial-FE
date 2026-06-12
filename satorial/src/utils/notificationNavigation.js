export function getNotificationRoute(notif) {
  const data = notif.data || {};
  const orderId = data.order_id || notif.order_id;
  const clientId = data.client_id || notif.client_id;
  const type = notif.notification_type || notif.type;

  switch (type) {
    case "due_order":
    case "overdue_order":
    case "order_status":
      if (orderId) return `/order/detail/${orderId}`;
      return "/order/orders-list";

    case "payment":
      if (orderId) return `/order/detail/${orderId}`;
      return "/order/payments-list";

    case "low_stock":
      return "/inventory/list/overview";

    case "birthday":
      if (clientId) return `/client-data/${clientId}`;
      return "/client/clients-list";

    case "order_limit":
      return "/settings";

    case "subscription_expiry":
    case "subscription_expiring":
      return "/subscriptions/panel";

    default:
      return null;
  }
}
