import { getCurrentUser } from '@/server/auth/session';
import { apiError, requireEventManager } from '@/server/auth/authorization';
import { updateEvent } from '@/server/events';
import { connectDatabase } from '@/server/db/connection';
import { TicketTypeModel } from '@/server/models/ticket-type';
import { OrderModel } from '@/server/models/transaction-models';
export const runtime = 'nodejs';
type C = { params: Promise<{ eventId: string }> };
export async function PATCH(request: Request, { params }: C) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const { eventId } = await params;
    return Response.json({
      event: await updateEvent(user, eventId, await request.json()),
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(_: Request, { params }: C) {
  try {
    const { eventId } = await params;
    const { event } = await requireEventManager(eventId);
    if (!event) throw new Error('NOT_FOUND');
    if (event.status !== 'DRAFT') throw new Error('FORBIDDEN');
    if (await OrderModel.exists({ eventId: event._id }))
      throw new Error('EVENT_HAS_ORDERS');
    const mongoose = await connectDatabase();
    await mongoose.connection.transaction(async (session) => {
      await TicketTypeModel.deleteMany({ eventId: event._id }, { session });
      await event.deleteOne({ session });
    });
    return new Response(null, { status: 204 });
  } catch (e) {
    return apiError(e);
  }
}
