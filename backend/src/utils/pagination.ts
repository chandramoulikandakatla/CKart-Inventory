/**
 * Generic Lazy-Loading & Pagination Utility
 * 
 * Supports:
 * - Offset-based pagination with limit and page
 * - Cursor-based lazy loading
 * - Envelope generation with standard pagination metadata
 */

export interface PaginationParams {
  page?: number | string | null;
  limit?: number | string | null;
  cursor?: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  has_more: boolean;
  next_cursor?: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export function paginateArray<T extends { id?: string }>(
  items: T[],
  params: PaginationParams,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginatedResult<T> {
  const total_count = items.length;
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(params.limit || defaultLimit), 10) || defaultLimit)
  );

  // 1. Cursor-based lazy slice if cursor is provided
  if (params.cursor) {
    const cursorIndex = items.findIndex((item) => item.id === params.cursor);
    const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    const paginatedItems = items.slice(startIndex, startIndex + limit);
    const nextItem = items[startIndex + limit];
    const has_more = startIndex + limit < total_count;

    return {
      items: paginatedItems,
      pagination: {
        page: Math.floor(startIndex / limit) + 1,
        limit,
        total_count,
        total_pages: Math.ceil(total_count / limit) || 1,
        has_more,
        next_cursor: has_more && nextItem?.id ? nextItem.id : null,
      },
    };
  }

  // 2. Standard offset-based pagination
  const page = Math.max(1, parseInt(String(params.page || 1), 10) || 1);
  const total_pages = Math.ceil(total_count / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedItems = items.slice(startIndex, startIndex + limit);
  const has_more = page < total_pages;
  const nextItem = has_more ? paginatedItems[paginatedItems.length - 1] : null;

  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total_count,
      total_pages,
      has_more,
      next_cursor: has_more && nextItem?.id ? nextItem.id : null,
    },
  };
}
