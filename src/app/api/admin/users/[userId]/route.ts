import { ZodError } from 'zod';
import { apiError, requireAdmin } from '@/server/auth/authorization';
import { updateAdminUser } from '@/server/users';

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) { try { const actor = await requireAdmin(); return Response.json(await updateAdminUser(actor.id, (await params).userId, await request.json())); } catch (error) { if (error instanceof ZodError || error instanceof SyntaxError) return Response.json({ error: 'Data tidak valid' }, { status: 400 }); return apiError(error); } }
export async function DELETE(_request: Request, context: { params: Promise<{ userId: string }> }) { try { const actor = await requireAdmin(); return Response.json(await updateAdminUser(actor.id, (await context.params).userId, { active: false })); } catch (error) { return apiError(error); } }
