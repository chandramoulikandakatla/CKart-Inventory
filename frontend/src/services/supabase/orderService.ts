/**
 * Supabase Order Processing & Status Tracking Service
 * Full-cycle order checkout, item snapshotting, and fulfillment pipeline.
 */

import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { notificationService } from './notificationService';

export const orderService = {
  /**
   * Record checkout order, insert items, debit wallet, and decrease stock in Supabase.
   */
  async submitOrder(orderData: {
    studentCode: string;
    items: Array<{ productId: string; name: string; category: string; price: number; qty: number; subtotal: number }>;
    totalAmount: number;
    fulfilmentMethod: string;
    collectionPoint: string;
    idempotencyKey?: string;
  }): Promise<{ orderId: string; reference: string; newBalance: number } | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('id, college_id, student_code, first_name')
        .eq('student_code', orderData.studentCode)
        .single();

      if (sErr || !student) {
        console.warn('Student not found for submitOrder:', orderData.studentCode);
        return null;
      }

      const { data: wallet, error: wErr } = await supabase
        .from('wallets')
        .select('id, balance_paise')
        .eq('student_id', student.id)
        .single();

      if (wErr || !wallet) {
        console.warn('Wallet not found for student:', student.id);
        return null;
      }

      const totalPaise = Math.round(orderData.totalAmount * 100);
      const prevBalPaise = Number(wallet.balance_paise || 0);
      const newBalPaise = Math.max(0, prevBalPaise - totalPaise);

      // Create order
      const { data: newOrder, error: oErr } = await supabase
        .from('orders')
        .insert({
          student_id: student.id,
          college_id: student.college_id,
          total_amount_paise: totalPaise,
          payment_status: 'paid',
          fulfilment_status: 'Order Placed',
          fulfilment_method: orderData.fulfilmentMethod,
          collection_point: orderData.collectionPoint,
          idempotency_key: orderData.idempotencyKey || `IDEM-${Date.now()}`,
        })
        .select('*')
        .single();

      if (oErr || !newOrder) {
        console.warn('Order insert error:', oErr);
        return null;
      }

      // Fetch all products to resolve IDs and update stocks
      const { data: allDbProducts } = await supabase.from('products').select('id, name, stock_quantity');

      // Insert order items & decrement stock
      for (const item of orderData.items) {
        const matched = (allDbProducts || []).find(
          (p: any) => p.id === item.productId || p.name.toLowerCase() === item.name.toLowerCase()
        );
        const prdId = matched ? matched.id : item.productId;
        const curStock = matched ? matched.stock_quantity : 50;

        await supabase.from('order_items').insert({
          order_id: newOrder.id,
          product_id: prdId,
          product_name_snapshot: item.name,
          category_snapshot: item.category,
          quantity: item.qty,
          unit_price_paise: Math.round(item.price * 100),
          subtotal_paise: Math.round(item.subtotal * 100),
        });

        // Decrement stock in DB
        if (matched) {
          await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, curStock - item.qty) })
            .eq('id', matched.id);
        }
      }

      // Deduct wallet balance
      await supabase
        .from('wallets')
        .update({ balance_paise: newBalPaise, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

      // Insert purchase debit transaction
      const txnRef = `TXN-CK-${Math.floor(90025 + Math.random() * 900)}`;
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        student_id: student.id,
        transaction_type: 'DEBIT',
        amount_paise: totalPaise,
        direction: 'debit',
        previous_balance_paise: prevBalPaise,
        new_balance_paise: newBalPaise,
        balance_after_paise: newBalPaise,
        status: 'completed',
        reference: txnRef,
        reference_id: txnRef,
        reference_type: 'STUDENT_PURCHASE',
        description: `Purchase: ${orderData.items.map((i) => `${i.qty}x ${i.name}`).join(', ').slice(0, 60)}`,
        related_order_id: newOrder.id,
      });

      // Insert persistent database notification
      await notificationService.createNotification({
        studentCode: orderData.studentCode,
        title: `Order Confirmed (${newOrder.id.slice(-6)})`,
        message: `${student.first_name} placed an order for ₹${orderData.totalAmount}. Remaining balance: ₹${Math.round(newBalPaise / 100)}.`,
        type: 'order',
      });

      return {
        orderId: newOrder.id,
        reference: txnRef,
        newBalance: Math.round(newBalPaise / 100),
      };
    } catch (err) {
      console.warn('submitOrder error:', err);
      return null;
    }
  },

  /**
   * Update Ops Order status in Supabase and push live notification
   */
  async updateOrderStatus(orderId: string, nextStatus: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({ fulfilment_status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select('student_id')
        .single();

      if (error || !order) return false;

      const { data: student } = await supabase
        .from('students')
        .select('student_code')
        .eq('id', order.student_id)
        .single();

      if (student?.student_code) {
        await notificationService.createNotification({
          studentCode: student.student_code,
          title: `Order Status: ${nextStatus}`,
          message: `Order ${orderId.slice(-6)} is now marked as "${nextStatus}" by Operations.`,
          type: 'order',
        });
      }

      return true;
    } catch (err) {
      console.warn('updateOrderStatus error:', err);
      return false;
    }
  },
};
