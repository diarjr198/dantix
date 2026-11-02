import { ZodError } from 'zod';
import { apiError, requireAdmin } from '@/server/auth/authorization';
import { createFaq, listAdminFaqs } from '@/server/site-content';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    return Response.json({ faqs: await listAdminFaqs() });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    return Response.json({ faq: await createFaq(await request.json()) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json({ error: 'Data tidak valid' }, { status: 400 });
    }
    return apiError(error);
  }
}
