import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Card from '@/components/ui/Card';

export default async function NotificationsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const notifications = [
    {
      id: 1,
      title: 'New Competition Available',
      message: 'Math Olympiad 2024 registration is now open!',
      date: '2024-01-15',
      type: 'info',
    },
    {
      id: 2,
      title: 'Practice Set Completed',
      message: 'You scored 85% on Algebra Practice Set',
      date: '2024-01-14',
      type: 'success',
    },
    {
      id: 3,
      title: 'Competition Result',
      message: 'Results for Weekly Challenge are now available',
      date: '2024-01-13',
      type: 'info',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600">No notifications yet.</p>
        </Card>
      )}
    </div>
  );
}
