import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { UserRole } from '@/models/User';

export default async function Home() {
  const session = await auth();
  if (session?.user.role === UserRole.SUPER_ADMIN) redirect('/admin');
  if (session?.user.role === UserRole.ADMIN) redirect('/school');
  if (session?.user.role === UserRole.TEACHER) redirect('/teacher');
  if (session?.user.role === UserRole.STUDENT) redirect('/student/dashboard');
  redirect('/landing');
}
