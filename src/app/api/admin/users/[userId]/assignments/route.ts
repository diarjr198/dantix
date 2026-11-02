import { apiError } from '@/server/auth/authorization';
import { listGateAssignments, setGateAssignment } from '@/server/users';

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) { try { return Response.json({ assignments: await listGateAssignments((await params).userId) }); } catch (error) { return apiError(error); } }
export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) { try { const input = await request.json() as { eventId?: string; active?: boolean }; await setGateAssignment((await params).userId, input.eventId ?? '', input.active !== false); return Response.json({ ok: true }); } catch (error) { return apiError(error); } }
