export const READY_MADE_PREFIX = "[READY_MADE]";

/**
 * Check if an order is a ready-made order based on its description prefix.
 * This is a frontend marker since the backend order_type choices are limited to Single/Bulk.
 */
export const isReadyMadeOrder = (order) => {
  if (!order) return false;
  if (order.order_description?.startsWith(READY_MADE_PREFIX)) return true;
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
