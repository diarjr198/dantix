import { getCurrentUser } from '@/server/auth/session';
import { confirmOrderPayment, orderError } from '@/server/orders';
export const runtime = 'nodejs';
type Context = { params: Promise<{ orderId: string }> };
export async function POST(_: Request, { params }: Context) { try { const user = await getCurrentUser(); if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 }); return Response.json({ order: await confirmOrderPayment(user, (await params).orderId) }); } catch (error) { return orderError(error); } }
