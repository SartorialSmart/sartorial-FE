export const READY_MADE_PREFIX = "[READY_MADE]";
export const READY_MADE_TITLE_PREFIX = "RMO - ";

/**
 * Resolve the display name of an order's category, whether the API returns it
 * as an object, a plain string, or via the separate order_category_name field.
 */
export const getOrderCategoryName = (order) => {
  if (!order) return "";
  if (typeof order.order_category === "object" && order.order_category?.name)
    return order.order_category.name;
  if (typeof order.order_category === "string") return order.order_category;
  return order.order_category_name || "";
};

/**
 * Check if an order is a ready-made order.
 * The backend now stores an explicit `ready_made` flag, which is authoritative.
 * For older cached data we fall back to frontend markers:
 * - its description carries the [READY_MADE] marker prefix
 * - its title starts with the "RMO - " ready-made order prefix
 * - its inventory or order category name matches "ready made" (e.g. "Ready Made Wears")
 */
export const isReadyMadeOrder = (order) => {
  if (!order) return false;
  if (typeof order.ready_made === "boolean") return order.ready_made;
  if (order.order_description?.startsWith(READY_MADE_PREFIX)) return true;
  const title = order.order_title || order.order_name || "";
  if (title.trim().toUpperCase().startsWith(READY_MADE_TITLE_PREFIX)) return true;
  const categoryName = getOrderCategoryName(order);
  if (categoryName && /ready made/i.test(categoryName)) return true;
  return false;
};

/**
 * Strip the ready-made marker prefix from an order description for clean display.
 */
export const getCleanDescription = (order) => {
  if (!order?.order_description) return "";
  return order.order_description.replace(
    new RegExp(`^${READY_MADE_PREFIX}\\n?`),
    ""
  );
};

/**
 * Build a ready-made order description with the marker prefix.
 */
export const buildReadyMadeDescription = (itemsSummary) => {
  const itemsText = itemsSummary
    .map((i) => `${i.item_name} x${i.quantity}`)
    .join(", ");
  return `${READY_MADE_PREFIX}\nReady Made Items: ${itemsText}`;
};
