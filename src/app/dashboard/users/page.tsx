import { redirect } from 'next/navigation';
import { UserManager } from '@/components/dashboard/user-manager';
import { requireAdmin } from '@/server/auth/authorization';
import { listAdminUsers, listAllGateAssignments } from '@/server/users';
import { connectDatabase } from '@/server/db/connection';
import { EventModel } from '@/server/models/event';

export default async function UsersPage() { try { await requireAdmin(); } catch { redirect('/dashboard'); } await connectDatabase(); const [users, assignments, events] = await Promise.all([listAdminUsers(), listAllGateAssignments(), EventModel.find().select('title').sort({ startsAt: -1 }).lean()]); return <main><UserManager initialUsers={users as never} events={events.map((event) => ({ id: event._id.toString(), title: event.title }))} initialAssignments={assignments} /></main>; }
