export function getNotificationRoute(notif) {
  const data = notif.data || {};
  const orderId = data.order_id || notif.order_id;
  const clientId = data.client_id || notif.client_id;
  const productionId = data.production_id || data.production_order_id || notif.production_id;
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

    case "production_assigned":
    case "production_qa":
    case "production_completed":
      if (productionId) return `/production/detail/${productionId}`;
      return "/production/orders-list";

    default:
      return null;
  }
}
