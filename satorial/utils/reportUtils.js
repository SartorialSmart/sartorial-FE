const getDateRange = (filter, customStartDate, customEndDate) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (filter) {
    case "Today":
      return { startDate: start, endDate: end };
    case "This Week": {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      return { startDate: start, endDate: end };
    }
    case "This Month":
      start.setDate(1);
      return { startDate: start, endDate: end };
    case "This Year":
      start.setMonth(0, 1);
      return { startDate: start, endDate: end };
    case "Custom Date":
      if (!customStartDate || !customEndDate) return null;
      return {
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate + "T23:59:59.999"),
      };
    case "All Time":
    default:
      return null;
  }
};

const getDateRangeISO = (filter, customStartDate, customEndDate) => {
  const range = getDateRange(filter, customStartDate, customEndDate);
  if (!range) return { startDate: null, endDate: null };
  return {
    startDate: range.startDate.toISOString(),
    endDate: range.endDate.toISOString(),
  };
};

const filterByDateRange = (items, dateField, filter, customStartDate, customEndDate) => {
  if (filter === "All Time") return items;
  const range = getDateRange(filter, customStartDate, customEndDate);
  if (!range) return items;
  return items.filter((item) => {
    const dateStr = dateField
      .split(".")
      .reduce((obj, key) => obj?.[key], item);
    if (!dateStr) return false;
    const itemDate = new Date(dateStr);
    return itemDate >= range.startDate && itemDate <= range.endDate;
  });
};

export { getDateRange, getDateRangeISO, filterByDateRange };
