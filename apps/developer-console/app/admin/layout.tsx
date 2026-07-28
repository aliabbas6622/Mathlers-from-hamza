import { auth, isSuperAdmin } from '@mathlers/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@mathlers/ui/layout/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session || !isSuperAdmin(session.user.role)) redirect('/');

  return (
    <div data-portal="admin" className="min-h-screen">
      <AdminSidebar />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
