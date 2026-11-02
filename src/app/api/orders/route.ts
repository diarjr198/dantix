import { getCurrentUser } from '@/server/auth/session';
import { createPendingOrder, listUserOrders, orderError } from '@/server/orders';
export const runtime = 'nodejs';
export async function GET() { try { const user = await getCurrentUser(); if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 }); return Response.json({ orders: await listUserOrders(user.id) }); } catch (error) { return orderError(error); } }
export async function POST(request: Request) { try { const user = await getCurrentUser(); if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 }); return Response.json({ order: await createPendingOrder(user, await request.json()) }, { status: 201 }); } catch (error) { return orderError(error); } }
