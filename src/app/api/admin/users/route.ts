import { ZodError } from 'zod';
import { apiError } from '@/server/auth/authorization';
import { createAdminUser, listAdminUsers } from '@/server/users';

export async function GET() { try { return Response.json({ users: await listAdminUsers() }); } catch (error) { return apiError(error); } }
export async function POST(request: Request) { try { return Response.json(await createAdminUser(await request.json()), { status: 201 }); } catch (error) { if (error instanceof ZodError || error instanceof SyntaxError) return Response.json({ error: 'Data tidak valid' }, { status: 400 }); return apiError(error); } }
