import { compare } from 'bcryptjs';
import { ZodError } from 'zod';
import { createSessionToken, sessionCookie } from '@/server/auth/session';
import { loginRequestSchema } from '@/server/auth/validators';
import { connectDatabase } from '@/server/db/connection';
import { effectiveUserRole, UserModel } from '@/server/models/user';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const input = loginRequestSchema.parse(await request.json());
    await connectDatabase();

    const user = await UserModel.findOne(
      input.method === 'email'
        ? { email: input.identifier }
        : { phone: input.identifier },
    ).select('+passwordHash');

    if (!user || user.active === false || effectiveUserRole(user) === 'GATE' || !(await compare(input.password, user.passwordHash))) {
      return Response.json(
        { error: 'Email/nomor HP atau password salah' },
        { status: 401 },
      );
    }

    const response = Response.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
    response.headers.append(
      'Set-Cookie',
      `${sessionCookie.name}=${createSessionToken(user.id)}; Max-Age=${sessionCookie.maxAge}; Path=${sessionCookie.path}; HttpOnly; SameSite=Lax${sessionCookie.secure ? '; Secure' : ''}`,
    );
    return response;
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json({ error: 'Data tidak valid' }, { status: 400 });
    }
    return Response.json({ error: 'Gagal masuk' }, { status: 500 });
  }
}
