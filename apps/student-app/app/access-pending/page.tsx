import Link from 'next/link';
import { SignOutButton, UserButton } from '@clerk/nextjs';
import { auth as clerkAuth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { auth } from '@mathlers/lib/auth';

export default async function AccessPendingPage() {
  const { userId } = await clerkAuth();
  if (!userId) redirect('/sign-in');
  if (await auth()) redirect('/');

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto w-fit"><UserButton /></div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand-primary">Account created</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Waiting for approval</h1>
        <p className="mt-3 leading-relaxed text-slate-600">
          Your sign-in works. A Mathlers developer must assign your school and approve you as an administrator or teacher before the workspace opens.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl border border-transparent px-4 py-2.5 font-semibold text-brand-primary hover:border-brand-primary">
            Check again
          </Link>
          <SignOutButton redirectUrl="/landing">
            <button className="rounded-xl border border-transparent px-4 py-2.5 font-semibold text-slate-600 hover:border-slate-300">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </section>
    </main>
  );
}
