/**
 * Product Catalog Search, Filter and Query Service
 */

import { store } from '../store/index.js';

export const productService = {
  getProducts(params: { search?: string | null; category?: string | null; sort?: string | null }) {
    let result = store.products.filter((p) => p.is_available);
    const { search, category, sort } = params;

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

    return {
      status: 200,
      data: {
        products: result.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price_paise: p.price_paise,
          price: Math.round(p.price_paise / 100),
          stock: p.stock_quantity,
          image_url: p.image_url,
          description: p.description,
          is_available: p.is_available,
        })),
      },
    };
  },
};
