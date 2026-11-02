import { ZodError } from 'zod';
import { updateProfile } from '@/server/profile';

export const runtime = 'nodejs';

export async function PATCH(request: Request) {
  try {
    return Response.json({ user: await updateProfile(await request.json()) });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (error instanceof ZodError) return Response.json({ error: error.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 });
    if (error instanceof SyntaxError) return Response.json({ error: 'Data tidak valid' }, { status: 400 });
    if (code === 'UNAUTHORIZED') return Response.json({ error: 'Silakan masuk kembali' }, { status: 401 });
    if (code === 'INVALID_PASSWORD') return Response.json({ error: 'Password saat ini salah' }, { status: 400 });
    if (code === 'EMAIL_TAKEN') return Response.json({ error: 'Email sudah digunakan' }, { status: 409 });
    return Response.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}
