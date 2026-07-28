import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import StudentSidebar from '@/components/layout/StudentSidebar';
import { UserRole } from '@/models/User';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session || session.user.role !== UserRole.STUDENT) redirect('/');

  return (
    <div data-portal="student" className="min-h-screen">
      <StudentSidebar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
