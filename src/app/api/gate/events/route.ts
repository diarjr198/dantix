import { checkinError, listGateEvents } from '@/server/checkins';
import { getGateUser } from '@/server/auth/session';

export async function GET() {
  const user = await getGateUser();
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  try { return Response.json({ events: await listGateEvents() }); } catch (error) { return checkinError(error); }
}
