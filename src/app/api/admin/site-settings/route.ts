import { ZodError } from 'zod';
import { apiError, requireAdmin } from '@/server/auth/authorization';
import { getAdminSiteSettings, updateSiteSettings } from '@/server/site-content';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    return Response.json({ settings: await getAdminSiteSettings() });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    return Response.json({ settings: await updateSiteSettings(await request.json()) });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json({ error: 'Data tidak valid' }, { status: 400 });
    }
    return apiError(error);
  }
}
