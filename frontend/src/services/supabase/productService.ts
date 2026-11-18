/**
 * Supabase Product & Inventory Service
 * Real-time stock, pricing, and catalog mutations.
 */

import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { Product } from '../../types/ecosystem';
import { DbProduct } from './types';

export const productService = {
  /**
   * Fetch all active/available products from Supabase
   */
  async getProducts(): Promise<Product[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id');

      if (error || !data) return null;

      return data.map((item: DbProduct) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: Math.round(Number(item.price_paise) / 100),
        stock: item.stock_quantity,
        active: item.is_available,
        featured: item.stock_quantity > 20,
        offerTag: item.stock_quantity <= 10 ? 'Low Stock' : undefined,
        description: item.description || '',
        imageUrl: item.image_url,
      }));
    } catch (err) {
      console.warn('getProducts error:', err);
      return null;
    }
  },

  /**
   * Insert new product into Supabase
   */
  async createProduct(product: Product): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const pricePaise = Math.round(product.price * 100);
      const { error } = await supabase.from('products').insert({
        name: product.name,
        category: product.category,
        price_paise: pricePaise,
        stock_quantity: product.stock,
        is_available: product.active ?? true,
        description: product.description,
        image_url: product.imageUrl || 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400',
      });

      return !error;
    } catch (err) {
      console.warn('createProduct error:', err);
      return false;
    }
  },

  /**
   * Update Ops Product stock, price, and active status in Supabase
   */
  async updateProductStock(
    productId: string,
    productName: string,
    newStock?: number,
    newPrice?: number,
    toggleActive?: boolean
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (newStock !== undefined) updates.stock_quantity = Math.max(0, newStock);
      if (newPrice !== undefined) updates.price_paise = Math.round(Math.max(1, newPrice) * 100);
      if (toggleActive !== undefined) updates.is_available = toggleActive;

      const { error } = await supabase
        .from('products')
        .update(updates)
        .or(`id.eq.${productId},name.eq.${productName}`);

      return !error;
    } catch (err) {
      console.warn('updateProductStock error:', err);
      return false;
    }
  },
};
