import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getCurrentUser } from '@/server/auth/session';
export default async function Layout({children}:{children:React.ReactNode}){const user=await getCurrentUser();if(!user)redirect('/masuk');if(user.role==='GATE')redirect('/gate');return <DashboardShell user={user}>{children}</DashboardShell>}
