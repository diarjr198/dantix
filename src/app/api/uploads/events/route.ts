import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getCurrentUser } from '@/server/auth/session';
export const runtime = 'nodejs';
const signatures = [
  {
    type: 'image/jpeg',
    ext: 'jpg',
    test: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    type: 'image/png',
    ext: 'png',
    test: (b: Buffer) =>
      b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  },
  {
    type: 'image/webp',
    ext: 'webp',
    test: (b: Buffer) =>
      b.subarray(0, 4).toString() === 'RIFF' &&
      b.subarray(8, 12).toString() === 'WEBP',
  },
];
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  const file = (await request.formData()).get('file');
  if (!(file instanceof File))
    return Response.json({ error: 'File wajib diisi' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024)
    return Response.json({ error: 'Ukuran maksimal 5 MB' }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const format = signatures.find((s) => s.type === file.type && s.test(bytes));
  if (!format)
    return Response.json(
      { error: 'Gunakan JPG, PNG, atau WebP yang valid' },
      { status: 400 },
    );
  const dir = path.join(process.cwd(), 'public', 'uploads', 'events');
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${format.ext}`;
  await writeFile(path.join(dir, name), bytes, { flag: 'wx' });
  return Response.json({ url: `/uploads/events/${name}` }, { status: 201 });
}
