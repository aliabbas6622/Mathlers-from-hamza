import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import QuestionModel from '@/models/Question';
import ResultModel from '@/models/Result';
import UserModel, { UserRole } from '@/models/User';
import { BarChart3, FileQuestion, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

export default async function AnalyticsPage() {
  await connectDB();
  const [students, questions, competitions, results] = await Promise.all([
    UserModel.countDocuments({ role: UserRole.STUDENT, isActive: true }),
    QuestionModel.countDocuments(),
    CompetitionModel.countDocuments(),
    ResultModel.countDocuments(),
  ]);

  return <div className="mx-auto max-w-7xl space-y-8">
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Platform reporting</p><h1 className="mt-1 text-3xl font-bold text-gray-950">Analytics</h1><p className="mt-2 text-gray-600">A concise view of Mathlers activity and assessment coverage.</p></div><Link href="/admin/analytics/questions" className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"><BarChart3 className="h-4 w-4" /> Question analytics</Link></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<Users />} label="Active students" value={students} /><Metric icon={<FileQuestion />} label="Question bank" value={questions} /><Metric icon={<Trophy />} label="Competitions" value={competitions} /><Metric icon={<BarChart3 />} label="Completed results" value={results} /></div>
    <div className="rounded-lg border border-gray-200 bg-white p-6"><h2 className="font-bold text-gray-950">Reporting shortcuts</h2><p className="mt-2 text-sm text-gray-600">Question-level performance is available in the dedicated analytics view. Student and competition information is available from their respective admin sections.</p></div>
  </div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5"><span className="text-brand-primary">{icon}</span><div><p className="text-2xl font-bold text-gray-950">{value}</p><p className="text-sm text-gray-600">{label}</p></div></div>;
}
