/**
 * CampusKart High-Performance Modular TypeScript Backend Server
 * Clean entrypoint delegating to modular services, security, store, and router.
 */

import http from 'node:http';
import { PORT, HOST, DATA_FILE, SUPABASE_URL } from './src/config.js';
import { handleApiRequest } from './src/routes/index.js';
import { store, loadStore, saveStore, resetStore } from './src/store/index.js';
import { logger } from './src/utils/index.js';

export { PORT, HOST, DATA_FILE, store, loadStore, saveStore, resetStore, logger };

export function createServer(): http.Server {
  return http.createServer(handleApiRequest);
}

// Start server if run directly
if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    logger.info({
      host: HOST,
      port: PORT,
      database: SUPABASE_URL ? 'Supabase' : 'File-Backed Engine',
      storageFile: DATA_FILE,
    }, `CampusKart Modular TypeScript Backend active on http://${HOST}:${PORT}`);
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    logger.info({ signal }, `Received ${signal}. Flushing store and closing server gracefully...`);
    saveStore(store);
    server.close(() => {
      logger.info('CampusKart Server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
