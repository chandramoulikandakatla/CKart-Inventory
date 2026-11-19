/**
 * Supabase Realtime WebSocket Subscriptions Service
 * Provides instantaneous push updates for orders, wallets, products, notifications & spending limits.
 * Eliminates polling and ensures reactive cross-portal state consistency.
 */

import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeEventPayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | string;
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}

export interface RealtimeEcosystemHandlers {
  onOrderChange?: (payload: RealtimeEventPayload) => void;
  onWalletChange?: (payload: RealtimeEventPayload) => void;
  onProductChange?: (payload: RealtimeEventPayload) => void;
  onNotificationInsert?: (payload: RealtimeEventPayload) => void;
  onControlsChange?: (payload: RealtimeEventPayload) => void;
  onTransactionInsert?: (payload: RealtimeEventPayload) => void;
  onConnectionStatus?: (status: 'CONNECTING' | 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void;
}

let activeChannel: RealtimeChannel | null = null;

export const realtimeService = {
  /**
   * Subscribe to live postgres_changes across the CampusKart database tables
   * Returns an unsubscribe function to cleanly tear down the WebSocket channel
   */
  subscribeToEcosystem(handlers: RealtimeEcosystemHandlers): () => void {
    if (!isSupabaseConfigured() || !supabase) {
      return () => {};
    }

    // Clean up any preexisting channel before creating a fresh subscription
    if (activeChannel) {
      try {
        supabase.removeChannel(activeChannel);
      } catch {
        // Ignore removal error
      }
      activeChannel = null;
    }

    try {
      const channel = supabase.channel('campuskart-live-ecosystem', {
        config: {
          broadcast: { self: false },
        },
      });

      // 1. Orders table (Fulfillment state machine changes & new checkouts)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (handlers.onOrderChange) {
            handlers.onOrderChange(payload);
          }
        }
      );

      // 2. Wallets table (Parent top-ups & Student debit updates)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallets' },
        (payload: any) => {
          if (handlers.onWalletChange) {
            handlers.onWalletChange(payload);
          }
        }
      );

      // 3. Products table (Real-time stock decrement, price edits & new items)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: any) => {
          if (handlers.onProductChange) {
            handlers.onProductChange(payload);
          }
        }
      );

      // 4. Notifications table (Instant push alerts for students & parents)
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload: any) => {
          if (handlers.onNotificationInsert) {
            handlers.onNotificationInsert(payload);
          }
        }
      );

      // 5. Spending Controls table (Guardian daily limit adjustments)
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'spending_controls' },
        (payload: any) => {
          if (handlers.onControlsChange) {
            handlers.onControlsChange(payload);
          }
        }
      );

      // 6. Wallet Transactions table (Ledger audit records)
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wallet_transactions' },
        (payload: any) => {
          if (handlers.onTransactionInsert) {
            handlers.onTransactionInsert(payload);
          }
        }
      );

      channel.subscribe((status: string) => {
        if (handlers.onConnectionStatus) {
          handlers.onConnectionStatus(status as any);
        }
      });

      activeChannel = channel;

      return () => {
        if (activeChannel) {
          try {
            supabase.removeChannel(activeChannel);
          } catch {
            // Ignore channel teardown error
          }
          activeChannel = null;
        }
      };
    } catch (err) {
      console.warn('[Supabase Realtime] Subscription error:', err);
      return () => {};
    }
  },

  /**
   * Check if a realtime channel is currently connected
   */
  isSubscribed(): boolean {
    return activeChannel !== null && activeChannel.state === 'joined';
  },
};
