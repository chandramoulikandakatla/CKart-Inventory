/**
 * Notification Persistence Service
 * Thin wrapper — delegates to supabaseConnector (fire-and-forget safe).
 */

import { persistNotification } from './supabaseConnector.js';

export const notificationService = {
  push: (code: string, title: string, msg: string, type: string): void => {
    persistNotification({ studentCode: code, title, message: msg, type }).catch(console.warn);
  },
};
