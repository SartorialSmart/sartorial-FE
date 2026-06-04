import { Bell, Clock, AlertTriangle, Package, Cake, Gauge, RefreshCw, CreditCard, AlertOctagon, Timer } from "lucide-react";

export const NOTIFICATION_ICONS = {
  due_order: Clock,
  overdue_order: AlertTriangle,
  low_stock: Package,
  birthday: Cake,
  order_limit: Gauge,
  order_status: RefreshCw,
  payment: CreditCard,
  subscription_expiry: AlertOctagon,
  subscription_expiring: Timer,
};

export const NOTIFICATION_COLORS = {
  due_order: "text-yellow-600 bg-yellow-50",
  overdue_order: "text-red-600 bg-red-50",
  low_stock: "text-orange-600 bg-orange-50",
  birthday: "text-pink-600 bg-pink-50",
  order_limit: "text-purple-600 bg-purple-50",
  order_status: "text-blue-600 bg-blue-50",
  payment: "text-emerald-600 bg-emerald-50",
  subscription_expiry: "text-red-700 bg-red-100",
  subscription_expiring: "text-amber-600 bg-amber-50",
};

export const NOTIFICATION_LABELS = {
  due_order: "Due Order",
  overdue_order: "Overdue Order",
  low_stock: "Low Stock",
  birthday: "Client Birthday",
  order_limit: "Order Limit Reached",
};

export const NOTIFICATION_TYPE = {
  DUE_ORDER: "due_order",
  OVERDUE_ORDER: "overdue_order",
  LOW_STOCK: "low_stock",
  BIRTHDAY: "birthday",
  ORDER_LIMIT: "order_limit",
  ORDER_STATUS: "order_status",
  PAYMENT: "payment",
  SUBSCRIPTION_EXPIRY: "subscription_expiry",
  SUBSCRIPTION_EXPIRING: "subscription_expiring",
};

export const NOTIFICATION_TYPE_LABELS = {
  due_order: "Due Order Reminder",
  overdue_order: "Overdue Order Alert",
  low_stock: "Low Stock Warning",
  birthday: "Client Birthday",
  order_limit: "Order Limit Reached",
  order_status: "Order Status Change",
  payment: "Payment Notification",
  subscription_expiry: "Subscription Expired",
  subscription_expiring: "Subscription Expiring",
};

export const NOTIFICATION_TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];
