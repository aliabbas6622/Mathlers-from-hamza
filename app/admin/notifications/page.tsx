import connectDB from '@/lib/db/mongodb';
import NotificationModel from '@/models/Notification';
import { Bell, CheckCheck, Users } from 'lucide-react';

export default async function AdminNotificationsPage() {
  await connectDB();
  const notifications = await NotificationModel.find().populate('recipient', 'fullName playerId').sort({ sentAt: -1 }).limit(50).lean();
  const unread = notifications.filter((notification) => !notification.isRead).length;

  return <div className="mx-auto max-w-5xl space-y-8">
    <div className="border-b border-gray-200 pb-7"><p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Student communication</p><h1 className="mt-1 text-3xl font-bold text-gray-950">Notifications</h1><p className="mt-2 text-gray-600">Review recent messages delivered across the Mathlers platform.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><Metric icon={<Bell />} label="Recent notifications" value={notifications.length} /><Metric icon={<CheckCheck />} label="Unread" value={unread} /><Metric icon={<Users />} label="Recipients reached" value={new Set(notifications.map((notification) => notification.recipient?._id?.toString())).size} /></div>
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {notifications.map((notification) => { const recipient = notification.recipient as unknown as { fullName?: string; playerId?: string } | null; return <div key={notification._id.toString()} className="border-b border-gray-100 px-5 py-4 last:border-0"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-gray-950">{notification.title}</p><p className="mt-1 text-sm text-gray-600">{notification.message}</p><p className="mt-2 text-xs text-gray-500">To {recipient?.fullName || 'Unknown student'}{recipient?.playerId ? ` · ${recipient.playerId}` : ''} · {new Date(notification.sentAt).toLocaleDateString()}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-brand-lighter text-brand-primary'}`}>{notification.isRead ? 'Read' : 'Unread'}</span></div></div>; })}
      {!notifications.length && <p className="px-5 py-16 text-center text-sm text-gray-500">No notifications have been sent yet.</p>}
    </div>
  </div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5"><span className="text-brand-primary">{icon}</span><div><p className="text-2xl font-bold text-gray-950">{value}</p><p className="text-sm text-gray-600">{label}</p></div></div>;
}
