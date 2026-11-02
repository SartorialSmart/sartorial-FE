const getDateRange = (filter, customStartDate, customEndDate) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (filter) {
    case "Today":
      return { startDate: start, endDate: end };
    case "Yesterday": {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      return { startDate: start, endDate: end };
    }
    case "This Week": {
      const day = start.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + mondayOffset);
      return { startDate: start, endDate: end };
    }
    case "Last Week": {
      const day = start.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + mondayOffset - 7);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }
    case "This Month":
      start.setDate(1);
      return { startDate: start, endDate: end };
    case "Last Month": {
      start.setMonth(start.getMonth() - 1, 1);
      end.setMonth(end.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }
    case "This Quarter": {
      const qStart = Math.floor(start.getMonth() / 3) * 3;
      start.setMonth(qStart, 1);
      end.setMonth(qStart + 3, 0);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    }
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatDateCaption = (filter, customStartDate, customEndDate) => {
  if (filter === "All Time") return "All Time";
  const range = getDateRange(filter, customStartDate, customEndDate);
  if (!range) return filter;
  const { startDate, endDate } = range;
  switch (filter) {
    case "Today":
      return `${DAYS[startDate.getDay()]}, ${ordinal(startDate.getDate())} ${MONTHS[startDate.getMonth()]}, ${startDate.getFullYear()}`;
    case "Yesterday":
      return `${DAYS[startDate.getDay()]}, ${ordinal(startDate.getDate())} ${MONTHS[startDate.getMonth()]}, ${startDate.getFullYear()}`;
    case "This Week":
      return `${ordinal(startDate.getDate())} ${MONTHS[startDate.getMonth()]} - ${ordinal(endDate.getDate())} ${MONTHS[endDate.getMonth()]}, ${endDate.getFullYear()}`;
    case "Last Week":
      return `${ordinal(startDate.getDate())} ${MONTHS[startDate.getMonth()]} - ${ordinal(endDate.getDate())} ${MONTHS[endDate.getMonth()]}, ${endDate.getFullYear()}`;
    case "This Month":
      return `${MONTHS[startDate.getMonth()]}, ${startDate.getFullYear()}`;
    case "Last Month":
      return `${MONTHS[startDate.getMonth()]}, ${startDate.getFullYear()}`;
    case "This Quarter": {
      const q = Math.floor(startDate.getMonth() / 3) + 1;
      return `Q${q} ${startDate.getFullYear()}`;
    }
    case "This Year":
      return `${startDate.getFullYear()}`;
    case "Custom Date":
      return `${ordinal(startDate.getDate())} ${MONTHS[startDate.getMonth()]} - ${ordinal(endDate.getDate())} ${MONTHS[endDate.getMonth()]}, ${endDate.getFullYear()}`;
    default:
      return filter;
  }
};

export { getDateRange, getDateRangeISO, filterByDateRange, formatDateCaption };
