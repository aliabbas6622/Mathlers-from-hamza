import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import StudentSidebar from '@/components/layout/StudentSidebar';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div data-portal="student" className="min-h-screen">
      <StudentSidebar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
