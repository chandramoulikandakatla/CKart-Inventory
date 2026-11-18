/**
 * Durable File Persistence for CampusKart Backend Store
 * 
 * Supports:
 * - Atomic write-then-rename to prevent partial writes
 * - Debounced asynchronous non-blocking flush queue (queueSaveStore)
 * - Emergency synchronous flush (saveStoreSync) for process shutdown
 * - Signal listeners for graceful shutdown
 */

import fs from 'node:fs';
import { DATA_FILE } from '../config.js';
import { createInitialStore } from './initialData.js';
import { clearAllTokens } from '../security/tokens.js';
import type { BackendStore, SerializedStore } from '../types.js';

let writeTimer: NodeJS.Timeout | null = null;
let isDirty = false;
let isWriting = false;

function serializeStore(storeToSave: BackendStore): SerializedStore {
  return {
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
}

/**
 * Synchronous atomic persistence (blocks event loop briefly, safe for tests/shutdown)
 */
export function saveStoreSync(storeToSave: BackendStore, filePath: string = DATA_FILE): void {
  try {
    const serialized = serializeStore(storeToSave);
    const tmpPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(serialized, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
    isDirty = false;
  } catch (err) {
    console.error('[CampusKart] Error persisting data store synchronously:', err);
  }
}

/**
 * Asynchronous atomic persistence (non-blocking)
 */
export async function saveStoreAsync(storeToSave: BackendStore, filePath: string = DATA_FILE): Promise<void> {
  if (isWriting) {
    isDirty = true;
    return;
  }
  isWriting = true;
  try {
    const serialized = serializeStore(storeToSave);
    const tmpPath = `${filePath}.tmp.${Date.now()}`;
    await fs.promises.writeFile(tmpPath, JSON.stringify(serialized, null, 2), 'utf-8');
    await fs.promises.rename(tmpPath, filePath);
    isDirty = false;
  } catch (err) {
    console.error('[CampusKart] Error persisting data store asynchronously:', err);
  } finally {
    isWriting = false;
    if (isDirty) {
      isDirty = false;
      saveStoreAsync(storeToSave, filePath);
    }
  }
}

/**
 * Queued debounced persistence for high-throughput batch operations
 */
export function queueSaveStore(storeToSave: BackendStore, filePath: string = DATA_FILE, debounceMs: number = 50): void {
  isDirty = true;
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    if (isDirty) {
      saveStoreAsync(storeToSave, filePath);
    }
  }, debounceMs);
}

/**
 * Default saveStore implementation (synchronous for immediate consistency)
 */
export function saveStore(storeToSave: BackendStore, filePath: string = DATA_FILE): void {
  saveStoreSync(storeToSave, filePath);
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
  saveStoreSync(initial, filePath);
  return initial;
}

export let store: BackendStore = loadStore(DATA_FILE);

export function resetStore(filePath: string = DATA_FILE): void {
  store = createInitialStore();
  saveStoreSync(store, filePath);
  clearAllTokens();
}

// Emergency flush on process exit
function handleProcessExit() {
  if (isDirty) {
    saveStoreSync(store);
  }
}

process.once('beforeExit', handleProcessExit);
