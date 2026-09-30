import mongoose from 'mongoose';
import logger from '../utils/logger.js';

mongoose.set('strictQuery', true);
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.warn('MongoDB is not configured. Set MONGODB_URI to enable recipe data.');
    return false;
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB_NAME || 'recipemaster',
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      logger.info('Connected to MongoDB');
      return true;
    } catch (error) {
      logger.error({ err: error, attempt }, 'MongoDB connection attempt failed');
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  return false;
}

export function getDbState() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}

export async function withTransaction(callback) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}