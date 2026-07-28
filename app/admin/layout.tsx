import { auth, isSuperAdmin } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }
  if (!isSuperAdmin(session.user.role)) redirect('/school');

  return (
    <div data-portal="admin" className="min-h-screen">
      <AdminSidebar isSuperAdmin />
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
