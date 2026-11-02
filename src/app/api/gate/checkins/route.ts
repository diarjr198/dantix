import { checkInTicket, checkinError } from '@/server/checkins';
import { getGateUser } from '@/server/auth/session';

export async function POST(request: Request) {
  const user = await getGateUser();
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  try { return Response.json(await checkInTicket(await request.json())); } catch (error) { return checkinError(error); }
}
