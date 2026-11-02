import { hash } from 'bcryptjs';
import { ZodError } from 'zod';
import { createSessionToken, sessionCookie } from '@/server/auth/session';
import { registerRequestSchema } from '@/server/auth/validators';
import { connectDatabase } from '@/server/db/connection';
import { UserModel } from '@/server/models/user';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const input = registerRequestSchema.parse(await request.json());
    await connectDatabase();

    const identifierQuery =
      input.method === 'email'
        ? { email: input.email }
        : { phone: input.phone };
    const existingUser = await UserModel.exists(identifierQuery);
    if (existingUser) {
      return Response.json(
        { error: 'Email atau nomor HP sudah digunakan' },
        { status: 409 },
      );
    }

    const user = await UserModel.create({
      name: input.name,
      ...(input.method === 'email'
        ? { email: input.email }
        : { phone: input.phone }),
      passwordHash: await hash(input.password, 12),
    });

    const response = Response.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 },
    );
    response.headers.append(
      'Set-Cookie',
      `${sessionCookie.name}=${createSessionToken(user.id)}; Max-Age=${sessionCookie.maxAge}; Path=${sessionCookie.path}; HttpOnly; SameSite=Lax${sessionCookie.secure ? '; Secure' : ''}`,
    );
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? 'Data tidak valid' },
        { status: 400 },
      );
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: 'Data tidak valid' }, { status: 400 });
    }
    return Response.json({ error: 'Gagal membuat akun' }, { status: 500 });
  }
}
