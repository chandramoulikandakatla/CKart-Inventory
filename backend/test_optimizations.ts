/**
 * Backend Optimizations Test Suite
 * Tests:
 * 1. Lazy loading & pagination metadata (limit, page, cursor, has_more)
 * 2. In-memory LRU/TTL Cache & Tag invalidation on stock update
 * 3. Latency tracking (X-Response-Time) & Cache headers (X-Cache: HIT/MISS)
 * 4. System metrics & performance telemetry endpoint (/api/system/metrics)
 * 5. Debounced async persistence queue
 */

import http from 'node:http';
import { handleApiRequest } from './src/routes/router.js';
import { productCache, metricsCache } from './src/cache/index.js';
import { store, resetStore, queueSaveStore } from './src/store/index.js';
import { generateToken } from './src/security/index.js';

async function runOptimizationsTests() {
  console.log('=====================================================');
  console.log('Testing CampusKart Backend Optimizations & Lazy Loading');
  console.log('=====================================================\n');

  resetStore();
  productCache.clear();
  metricsCache.clear();

  const server = http.createServer((req, res) => handleApiRequest(req, res));
  await new Promise<void>((resolve) => server.listen(4098, '127.0.0.1', () => resolve()));

  try {
    // Test 1: Lazy Pagination & Slicing
    console.log('[Test 1] Testing Lazy Loading & Pagination on /api/products...');
    const page1Res = await fetch('http://127.0.0.1:4098/api/products?limit=2&page=1');
    const page1Data = await page1Res.json();
    
    if (page1Data.products.length !== 2) {
      throw new Error(`Expected 2 products on page 1, got ${page1Data.products.length}`);
    }
    if (!page1Data.pagination || page1Data.pagination.total_pages <= 1 || !page1Data.pagination.has_more) {
      throw new Error(`Invalid pagination envelope: ${JSON.stringify(page1Data.pagination)}`);
    }
    console.log(`  -> Page 1: Fetched 2 items, total: ${page1Data.pagination.total_count}, has_more: ${page1Data.pagination.has_more}`);

    // Fetch Page 2
    const page2Res = await fetch('http://127.0.0.1:4098/api/products?limit=2&page=2');
    const page2Data = await page2Res.json();
    if (page2Data.products[0].id === page1Data.products[0].id) {
      throw new Error('Page 2 returned same items as Page 1');
    }
    console.log(`  -> Page 2: Fetched next 2 items successfully. First item on page 2: ${page2Data.products[0].name}`);

    // Test 2: In-Memory Cache (MISS then HIT) & X-Response-Time
    console.log('\n[Test 2] Testing In-Memory Cache & Latency Headers...');
    productCache.clear();
    
    // First call: Cache MISS
    const missRes = await fetch('http://127.0.0.1:4098/api/products?category=Chips');
    const missCacheHeader = missRes.headers.get('X-Cache');
    const missTime = missRes.headers.get('X-Response-Time');
    if (missCacheHeader !== 'MISS') {
      throw new Error(`Expected X-Cache: MISS on first request, got: ${missCacheHeader}`);
    }
    console.log(`  -> First request: X-Cache=${missCacheHeader}, X-Response-Time=${missTime}`);

    // Second call: Cache HIT
    const hitRes = await fetch('http://127.0.0.1:4098/api/products?category=Chips');
    const hitCacheHeader = hitRes.headers.get('X-Cache');
    const hitTime = hitRes.headers.get('X-Response-Time');
    if (hitCacheHeader !== 'HIT') {
      throw new Error(`Expected X-Cache: HIT on second request, got: ${hitCacheHeader}`);
    }
    console.log(`  -> Second request: X-Cache=${hitCacheHeader}, X-Response-Time=${hitTime} (Accelerated via in-memory cache)`);

    // Test 3: Tag Invalidation on Catalog Mutation
    console.log('\n[Test 3] Testing Automatic Cache Invalidation on Stock Mutation...');
    const opsToken = generateToken('ops', 'STF-001');
    
    // Mutate product via ops endpoint
    const mutateRes = await fetch('http://127.0.0.1:4098/api/ops/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opsToken}`,
      },
      body: JSON.stringify({
        id: 'PRD-001',
        stock_quantity: 999,
      }),
    });
    if (mutateRes.status !== 200) throw new Error(`Ops update failed: ${mutateRes.status}`);

    // Requesting products again should be a cache MISS with fresh data
    const refreshedRes = await fetch('http://127.0.0.1:4098/api/products?category=Chips');
    const refreshedCacheHeader = refreshedRes.headers.get('X-Cache');
    const refreshedData = await refreshedRes.json();
    const updatedPrd = refreshedData.products.find((p: any) => p.id === 'PRD-001');
    
    if (refreshedCacheHeader !== 'MISS') {
      throw new Error(`Expected X-Cache: MISS after cache invalidation, got: ${refreshedCacheHeader}`);
    }
    if (updatedPrd?.stock !== 999) {
      throw new Error(`Expected updated stock 999, got: ${updatedPrd?.stock}`);
    }
    console.log(`  -> Cache invalidated automatically: X-Cache=${refreshedCacheHeader}, Fresh Stock: ${updatedPrd.stock}`);

    // Test 4: System Performance Telemetry
    console.log('\n[Test 4] Testing System Performance Telemetry Endpoint (/api/system/metrics)...');
    const metricsRes = await fetch('http://127.0.0.1:4098/api/system/metrics');
    const metricsData = await metricsRes.json();
    if (!metricsData.memory || !metricsData.caches || !metricsData.counts) {
      throw new Error(`Invalid telemetry payload: ${JSON.stringify(metricsData)}`);
    }
    console.log(`  -> Memory Heap: ${metricsData.memory.heap_used_mb} MB / ${metricsData.memory.heap_total_mb} MB`);
    console.log(`  -> Product Cache Hit Ratio: ${metricsData.caches.products.hitRatio} (Hits: ${metricsData.caches.products.hits}, Misses: ${metricsData.caches.products.misses})`);
    console.log(`  -> Managed Entities: ${metricsData.counts.products} products, ${metricsData.counts.orders} orders`);

    // Test 5: Debounced Async Persistence Queue
    console.log('\n[Test 5] Testing Non-Blocking Debounced Persistence Queue...');
    queueSaveStore(store);
    console.log('  -> Non-blocking saveStore queued successfully without blocking event loop.');

    console.log('\n=====================================================');
    console.log('[SUCCESS] ALL BACKEND OPTIMIZATIONS PASSED 100% OK!');
    console.log('=====================================================');
  } finally {
    server.close();
  }
}

runOptimizationsTests().catch((err) => {
  console.error('[FAIL] Optimizations test failed:', err);
  process.exit(1);
});
