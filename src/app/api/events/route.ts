import { getCurrentUser } from '@/server/auth/session';
import { apiError } from '@/server/auth/authorization';
import { createEvent, dashboardEvents } from '@/server/events';
export const runtime = 'nodejs';
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    return Response.json(await dashboardEvents(user));
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    return Response.json(
      { event: await createEvent(user, await request.json()) },
      { status: 201 },
    );
  } catch (e) {
    return apiError(e);
  }
}
