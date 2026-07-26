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
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white">
      <StudentSidebar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
