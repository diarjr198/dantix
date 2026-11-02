import { sessionCookie } from '@/server/auth/session';

export const runtime = 'nodejs';

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append(
    'Set-Cookie',
    `${sessionCookie.name}=; Max-Age=0; Path=${sessionCookie.path}; HttpOnly; SameSite=Lax${sessionCookie.secure ? '; Secure' : ''}`,
  );
  return response;
}
