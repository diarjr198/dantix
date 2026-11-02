import mongoose from 'mongoose';
import { getServerEnv } from '@/server/config/env';

declare global {
  var mongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

export async function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!global.mongooseConnectionPromise) {
    const { MONGODB_URI, MONGODB_DB_NAME } = getServerEnv();
    global.mongooseConnectionPromise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB_NAME,
        serverSelectionTimeoutMS: 5_000,
        connectTimeoutMS: 10_000,
        autoIndex: false,
      })
      .catch((error: unknown) => {
        global.mongooseConnectionPromise = undefined;
        throw error;
      });
  }
  return global.mongooseConnectionPromise;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  global.mongooseConnectionPromise = undefined;
}
