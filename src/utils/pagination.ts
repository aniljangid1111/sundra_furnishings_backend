export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  isPaginated: boolean;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Extracts and sanitizes pagination parameters from request query
 */
export const getPaginationParams = (
  query: any,
  defaultLimit = 10
): PaginationParams => {
  // If limit is explicitly "all", disable pagination limits
  if (query?.limit === "all" || query?.all === "true") {
    return {
      page: 1,
      limit: 100000,
      skip: 0,
      isPaginated: false,
    };
  }

  const page = Math.max(1, parseInt(String(query?.page || 1), 10) || 1);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(String(query?.limit || defaultLimit), 10) || defaultLimit)
  );
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    isPaginated: true,
  };
};

/**
 * Builds standard pagination response metadata
 */
export const buildPaginationMetadata = (
  totalItems: number,
  page: number,
  limit: number
): PaginationMetadata => {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    currentPage: page,
    totalPages,
    totalItems,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

