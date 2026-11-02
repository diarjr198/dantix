import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth/session';
import { EventForm } from '@/components/dashboard/event-form';
export default async function NewEvent() {
  if (!(await getCurrentUser())) redirect('/masuk');
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <EventForm />
    </main>
  );
}
