import { auth } from '@mathlers/lib/auth';
import { redirect } from 'next/navigation';
import Card from '@mathlers/ui/Card';

export default async function NotificationsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>

      <Card className="p-12 text-center">
        <p className="text-gray-600">No notifications yet.</p>
        <p className="mt-2 text-sm text-gray-500">Competition registration and result alerts will appear here when notifications are enabled.</p>
      </Card>
    </div>
  );
}
