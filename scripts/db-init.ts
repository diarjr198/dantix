import 'dotenv/config';
import {
  connectDatabase,
  disconnectDatabase,
} from '../src/server/db/connection';
import { databaseModels } from '../src/server/db/models';

async function main() {
  await connectDatabase();

  for (const model of databaseModels) {
    await model.createCollection();
    const migratedIndexesByCollection: Record<string, string[]> = {
      users: ['email_1', 'phone_1'],
      organizers: ['ownerUserId_1'],
      payments: ['orderId_1'],
      tickets: ['qrTokenHash_1'],
      checkins: ['sessionId_1_ticketId_1', 'ticketId_1'],
    };
    const migratedIndexes =
      migratedIndexesByCollection[model.collection.collectionName] ?? [];
    for (const index of migratedIndexes) {
      try {
        await model.collection.dropIndex(index);
      } catch (error: unknown) {
        if (!(error instanceof Error && /index not found/i.test(error.message)))
          throw error;
      }
    }
    await model.createIndexes();
    console.log(`Initialized ${model.collection.collectionName}`);
  }
}

main()
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown database initialization error';
    console.error(`Database initialization failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
