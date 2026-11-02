import { AuthLogo } from '@/components/auth/auth-logo';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterIllustration } from '@/components/auth/register-illustration';

export function LoginPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="flex h-14 items-center justify-center border-b border-slate-200 bg-white shadow-sm">
        <AuthLogo />
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-[920px] items-center gap-12 px-5 py-10 lg:grid-cols-[1fr_402px] lg:gap-16 lg:px-0 lg:py-0">
        <div className="hidden items-center justify-center lg:flex">
          <RegisterIllustration />
        </div>
        <div className="flex justify-center">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
