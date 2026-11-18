/**
 * Durable File Persistence for CampusKart Backend Store
 */

import fs from 'node:fs';
import { DATA_FILE } from '../config.js';
import { createInitialStore } from './initialData.js';
import { clearAllTokens } from '../security/tokens.js';
import type { BackendStore, SerializedStore } from '../types.js';

export function saveStore(storeToSave: BackendStore, filePath: string = DATA_FILE): void {
  try {
    const serialized: SerializedStore = {
      colleges: storeToSave.colleges,
      students: storeToSave.students,
      parents: storeToSave.parents,
      staff: storeToSave.staff,
      wallets: Object.fromEntries(storeToSave.wallets),
      products: storeToSave.products,
      orders: storeToSave.orders,
      transactions: storeToSave.transactions,
      spending_controls: Object.fromEntries(storeToSave.spending_controls),
      notifications: storeToSave.notifications,
    };
    const tmpPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(serialized, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.error('[CampusKart] Error persisting data store:', err);
  }
}

export function loadStore(filePath: string = DATA_FILE): BackendStore {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data: SerializedStore = JSON.parse(raw);
      return {
        colleges: data.colleges || [],
        students: data.students || [],
        parents: data.parents || [],
        staff: data.staff || [],
        wallets: new Map(Object.entries(data.wallets || {})),
        products: data.products || [],
        orders: data.orders || [],
        transactions: data.transactions || [],
        spending_controls: new Map(Object.entries(data.spending_controls || {})),
        notifications: data.notifications || [],
      };
    }
  } catch (err) {
    console.error('[CampusKart] Error loading persisted data store, falling back to seed:', err);
  }
  const initial = createInitialStore();
  saveStore(initial, filePath);
  return initial;
}

export let store: BackendStore = loadStore(DATA_FILE);

export function resetStore(filePath: string = DATA_FILE): void {
  store = createInitialStore();
  saveStore(store, filePath);
  clearAllTokens();
}
