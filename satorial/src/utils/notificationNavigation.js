export function getNotificationRoute(notif) {
  const data = notif.data || {};
  const type = notif.notification_type || notif.type;

  switch (type) {
    case "due_order":
    case "overdue_order":
    case "order_status":
      if (data.order_id) return `/order/detail/${data.order_id}`;
      return "/order/orders-list";

    case "payment":
      if (data.order_id) return `/order/detail/${data.order_id}`;
      return "/order/payments-list";

    case "low_stock":
      return "/inventory/list/overview";

    case "birthday":
      if (data.client_id) return `/client-data/${data.client_id}`;
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
