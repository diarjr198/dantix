import { connectDatabase } from '@/server/db/connection';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mongoose = await connectDatabase();
    await mongoose.connection.db?.command({ ping: 1 });
    return Response.json(
      { status: 'ok', database: 'available' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json(
      { status: 'error', database: 'unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
