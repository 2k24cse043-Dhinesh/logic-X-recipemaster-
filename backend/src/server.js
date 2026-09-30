import 'dotenv/config';
import http from 'node:http';
import app from './app.js';
import { connectDb } from './config/db.js';
import logger from './utils/logger.js';

const port = Number(process.env.PORT) || 5000;
const server = http.createServer(app);

await connectDb();
server.listen(port, () => logger.info({ port }, 'RecipeMaster API listening'));

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  server.close(async () => {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);