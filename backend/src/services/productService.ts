/**
 * Product Catalog Search, Filter, Lazy Loading & In-Memory Caching Service
 */

import { store } from '../store/index.js';
import { productCache } from '../cache/index.js';
import { paginateArray, type PaginationParams } from '../utils/pagination.js';

export interface ProductQueryParams extends PaginationParams {
  search?: string | null;
  category?: string | null;
  sort?: string | null;
}

export const productService = {
  getProducts(params: ProductQueryParams) {
    const cacheKey = `products:${JSON.stringify(params)}`;
    const cached = productCache.get(cacheKey);
    if (cached) {
      return { status: 200, data: cached, cached: true };
    }

    let result = store.products.filter((p) => p.is_available);
    const { search, category, sort, page, limit, cursor } = params;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    if (category && category !== 'All') {
      result = result.filter((p) => p.category === category);
    }
    if (sort === 'price_asc') {
      result.sort((a, b) => a.price_paise - b.price_paise);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.price_paise - a.price_paise);
    }

    const mapped = result.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price_paise: p.price_paise,
      price: Math.round(p.price_paise / 100),
      stock: p.stock_quantity,
      image_url: p.image_url,
      description: p.description,
      is_available: p.is_available,
    }));

    // If caller explicitly requested pagination with limit/page/cursor
    const isExplicitlyPaginated = Boolean(limit || page || cursor);
    const paginated = paginateArray(
      mapped,
      { page, limit, cursor },
      isExplicitlyPaginated ? 20 : mapped.length || 100
    );

    const payload = {
      products: isExplicitlyPaginated ? paginated.items : mapped,
      pagination: paginated.pagination,
      metrics: {
        total_available: store.products.filter((p) => p.is_available && p.stock_quantity > 0).length,
        out_of_stock: store.products.filter((p) => p.stock_quantity <= 0).length,
      },
    };

    // Cache the query result for 45 seconds with 'products' tag
    productCache.set(cacheKey, payload, 45000, ['products']);

    return {
      status: 200,
      data: payload,
      cached: false,
    };
  },

  invalidateCache() {
    return productCache.invalidateTag('products');
  },
};
