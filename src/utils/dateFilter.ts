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

  // Helper to get end of tomorrow (buffer for timezone differences between UTC server and user's local timezone like IST UTC+5:30)
  const getEndOfTomorrow = () => {
    const end = new Date(now);
    end.setDate(end.getDate() + 1);
    end.setHours(23, 59, 59, 999);
    return end;
  };

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
    // Cover timezone offsets (e.g. UTC server vs IST +5:30 user)
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: getEndOfTomorrow() };
  }

  if (range === "7D") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: getEndOfTomorrow() };
  }

  if (range === "30D") {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return { gte: start, lte: getEndOfTomorrow() };
  }

  if (range === "THIS_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (range === "LAST_MONTH") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (range === "THIS_YEAR") {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear() + 1, 0, 1, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  // "ALL" or unrecognized range
  return undefined;
};

