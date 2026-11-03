export interface DateRangeFilter {
  gte?: Date;
  lte?: Date;
}

/**
 * Converts frontend time range and date strings into Prisma-compatible Date filter
 */
export const parseDateRangeFilter = (
  timeRange?: string,
  startDate?: string,
  endDate?: string
): DateRangeFilter | undefined => {
  const range = (timeRange || "").toUpperCase().trim();
  const now = new Date();

  if (range === "CUSTOM" || (!range && (startDate || endDate))) {
    if (!startDate && !endDate) return undefined;
    const filter: DateRangeFilter = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filter.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.lte = end;
    }
    return filter;
  }

  if (range === "TODAY") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (range === "7D") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: now };
  }

  if (range === "30D") {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: now };
  }

  if (range === "THIS_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (range === "LAST_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (range === "THIS_YEAR") {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  // "ALL" or unrecognized range
  return undefined;
};

