import { auth } from '@mathlers/lib/auth';
import { redirect } from 'next/navigation';
import StudentSidebar from '@mathlers/ui/layout/StudentSidebar';
import { UserRole } from '@mathlers/models/User';

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
