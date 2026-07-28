import { redirect } from 'next/navigation';
import { auth as clerkAuth } from '@clerk/nextjs/server';
import { auth } from '@/lib/auth/auth';
import { UserRole } from '@/models/User';

export default async function Home() {
  const { userId } = await clerkAuth();
  if (!userId) redirect('/landing');

  const session = await auth();
  if (session?.user.role === UserRole.SUPER_ADMIN) redirect('/admin');
  if (session?.user.role === UserRole.ADMIN) redirect('/school');
  if (session?.user.role === UserRole.TEACHER) redirect('/teacher');
  if (session?.user.role === UserRole.STUDENT) redirect('/student/dashboard');
  redirect('/access-pending');
}
