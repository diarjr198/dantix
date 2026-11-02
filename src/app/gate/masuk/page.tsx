import { redirect } from 'next/navigation';
import { GateLoginForm } from '@/components/gate/gate-login-form';
import { getGateUser } from '@/server/auth/session';

export default async function GateLoginPage() {
  const user = await getGateUser();
  if (user?.role === 'GATE') redirect('/gate');
  return <main className="min-h-screen bg-[#ffd23f] px-5 py-10"><GateLoginForm /></main>;
}
