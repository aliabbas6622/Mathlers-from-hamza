import { redirect } from 'next/navigation';
import { SignOutButton, UserButton } from '@clerk/nextjs';
import { auth as clerkAuth } from '@clerk/nextjs/server';
import { auth, isSuperAdmin } from '@mathlers/lib/auth';

export default async function Home() {
  const session = await auth();
  if (session && isSuperAdmin(session.user.role)) redirect('/admin/developer');

  const { userId } = await clerkAuth();
  if (!userId) redirect('/sign-in');

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto w-fit"><UserButton /></div>
        <h1 className="mt-6 text-3xl font-bold text-slate-950">Developer access required</h1>
        <p className="mt-3 text-slate-600">This console is restricted to Mathlers super administrators.</p>
        <SignOutButton redirectUrl="/sign-in">
          <button className="mt-6 rounded-xl border border-transparent px-4 py-2.5 font-semibold text-slate-600 hover:border-slate-300">Sign out</button>
        </SignOutButton>
      </section>
    </main>
  );
}
