import { ZodError } from 'zod';
import { apiError, requireAdmin } from '@/server/auth/authorization';
import { deleteFaq, updateFaq } from '@/server/site-content';

export const runtime = 'nodejs';

type Context = { params: Promise<{ faqId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { faqId } = await params;
    return Response.json({ faq: await updateFaq(faqId, await request.json()) });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return Response.json({ error: 'Data tidak valid' }, { status: 400 });
    }
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { faqId } = await params;
    await deleteFaq(faqId);
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
