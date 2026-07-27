import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/db/mongodb';
import ResultModel from '@/models/Result';
import EnrollmentModel from '@/models/Enrollment';
import CompetitionModel, { CompetitionStatus } from '@/models/Competition';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Flame, Trophy, Target, TrendingUp, Bell } from 'lucide-react';
import { isValidObjectId } from '@/lib/utils/isValidObjectId';

type ResultRow = {
  _id: { toString(): string };
  type?: string;
  score?: number;
  accuracy?: number;
  completedAt?: Date;
};

type EnrollmentRow = {
  _id: { toString(): string };
};

type UpcomingCompetitionRow = {
  _id: { toString(): string };
  name: string;
  status: string;
  schedule?: { competitionStartDate?: Date };
  competition?: { startDate?: Date };
  analytics?: { totalRegistrations?: number; registrations?: number };
  sections?: unknown[];
  rounds?: unknown[];
};

export default async function StudentDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  await connectDB();

  const userId = session.user.id;
  const hasValidId = isValidObjectId(userId);

  const [results, enrollments, upcomingCompetitions] = await Promise.all([
    hasValidId
      ? ResultModel.find({ student: userId })
        .select('type score accuracy completedAt')
        .sort({ completedAt: -1 })
        .limit(5)
        .lean<ResultRow[]>()
      : Promise.resolve([]),
    hasValidId
      ? EnrollmentModel.find({ student: userId })
        .select('_id')
        .lean<EnrollmentRow[]>()
      : Promise.resolve([]),
    CompetitionModel.find({
      status: { $in: [CompetitionStatus.REGISTRATION_OPEN, CompetitionStatus.DRAFT, CompetitionStatus.IN_PROGRESS] }
    })
      .select('name status schedule analytics sections rounds')
      .sort({ 'schedule.competitionStartDate': 1 })
      .limit(1)
      .lean<UpcomingCompetitionRow[]>(),
  ]);

  const totalPoints = results.reduce((sum, r) => sum + (r.score || 0), 0);
  const accuracy = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + (r.accuracy || 0), 0) / results.length)
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const upcomingComp = upcomingCompetitions[0];
  const startDate = upcomingComp?.schedule?.competitionStartDate || upcomingComp?.competition?.startDate;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {greeting}, {session.user.name} 👋
          </h1>
          <p className="text-lg text-gray-600">Ready for today&apos;s challenge?</p>
        </div>
        <div className="flex gap-4">
          <Link href="/student/notifications" className="p-3 bg-white/80 backdrop-blur-md rounded-xl hover:bg-white transition-all">
            <Bell className="w-6 h-6 text-gray-700" />
          </Link>
          <Link href="/student/profile" className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
            {session.user.name?.charAt(0)}
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Trophy className="w-6 h-6 text-brand-primary" />}
          value={totalPoints.toLocaleString()}
          label="Total Points"
        />
        <StatCard
          icon={<Target className="w-6 h-6 text-brand-primary" />}
          value={results.length}
          label="Tests Taken"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-brand-primary" />}
          value={`${accuracy}%`}
          label="Accuracy"
        />
        <StatCard
          icon={<Flame className="w-6 h-6 text-brand-primary" />}
          value={enrollments.length}
          label="Competitions"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Competition */}
        {upcomingComp ? (
          <GlassCard className="lg:col-span-2 p-8 bg-gradient-to-br from-brand-primary to-brand-dark text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-sm font-medium opacity-90">Featured Competition</span>
                <h2 className="text-3xl font-bold mt-2">{upcomingComp.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Starts</p>
                <p className="font-semibold">{startDate ? new Date(startDate).toLocaleDateString() : 'TBA'}</p>
              </div>
            </div>
            <div className="flex gap-6 mb-6">
              <div>
                <p className="text-sm opacity-90">Participants</p>
                <p className="font-semibold">{upcomingComp.analytics?.totalRegistrations ?? upcomingComp.analytics?.registrations ?? 0}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Sections</p>
                <p className="font-semibold">{upcomingComp.sections?.length ?? upcomingComp.rounds?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Status</p>
                <p className="font-semibold text-green-300 capitalize">{String(upcomingComp.status).replace(/_/g, ' ')}</p>
              </div>
            </div>
            <Link href={`/student/competitions/${upcomingComp._id.toString()}`}>
              <PrimaryButton variant="secondary" className="w-full">
                View Competition →
              </PrimaryButton>
            </Link>
          </GlassCard>
        ) : (
          <GlassCard className="lg:col-span-2 p-8">
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Competitions</h3>
              <p className="text-gray-600 mb-4">Check back later for new competitions</p>
              <Link href="/student/competitions">
                <PrimaryButton variant="secondary">View All Competitions</PrimaryButton>
              </Link>
            </div>
          </GlassCard>
        )}

        {/* Quick Actions */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/student/competitions/join">
              <PrimaryButton className="w-full">🏷 Join with Code</PrimaryButton>
            </Link>
            <Link href="/student/competitions">
              <PrimaryButton variant="secondary" className="w-full">Browse Competitions</PrimaryButton>
            </Link>
            <Link href="/student/practice">
              <PrimaryButton variant="secondary" className="w-full">Start Practice</PrimaryButton>
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result._id.toString()} className="flex items-center gap-4 p-4 bg-white/50 rounded-xl">
              <div className="w-12 h-12 bg-brand-lighter rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-brand-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {result.type === 'practice' ? 'Practice Set' : result.type === 'test' ? 'Test' : 'Competition'}
                </p>
                <p className="text-sm text-gray-600">
                  Score: {result.score} • Accuracy: {result.accuracy}%
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          ))}
          {results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent activity. Start practicing to see your progress!
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
