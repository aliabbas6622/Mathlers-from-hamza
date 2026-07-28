import React from 'react';
import { auth, isAdmin } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel from '@/models/Enrollment';
import { IUser } from '@/models/User';
import Link from 'next/link';
import { ChevronRight, Trophy, Users, Award } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import EnrollmentReviewActions from '../../EnrollmentReviewActions';

export default async function AdminCompetitionResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session || !isAdmin(session.user.role)) {
    redirect('/sign-in');
  }

  await connectDB();
  const { id } = await params;

  const competition = await CompetitionModel.findById(id);
  if (!competition) {
    redirect('/admin/competitions');
  }

  const enrollments = await EnrollmentModel.find({ competition: id })
    .populate<{ student: Pick<IUser, 'fullName' | 'email'> }>('student', 'fullName email')
    .sort({ score: -1, percentage: -1 });

  const totalParticipants = enrollments.length;
  const completedCount = enrollments.filter(e => e.status === 'completed').length;
  const avgScore = completedCount > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.score || 0), 0) / completedCount)
    : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500">
        <Link href="/admin" className="hover:text-brand-primary">Admin</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/admin/competitions" className="hover:text-brand-primary">Competitions</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href={`/admin/competitions/${id}`} className="hover:text-brand-primary">{competition.name}</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Results & Leaderboard</span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{competition.name} Leaderboard</h1>
          <p className="text-gray-600">Review student performance, scores, and participation analytics</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Enrolled" value={String(totalParticipants)} icon={<Users className="w-6 h-6 text-brand-primary" />} />
        <StatCard label="Completed Exams" value={String(completedCount)} icon={<Trophy className="w-6 h-6 text-green-500" />} />
        <StatCard label="Average Score" value={String(avgScore)} icon={<Award className="w-6 h-6 text-yellow-500" />} />
      </div>

      {/* Leaderboard Table */}
      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Participant ID</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Score</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Percentage</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Review</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr, idx: number) => {
                const studentName = enr.student?.fullName || 'Student';
                const studentEmail = enr.student?.email || '';

                return (
                  <tr key={enr._id.toString()} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{studentName}</p>
                      <p className="text-xs text-gray-500">{studentEmail}</p>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs font-bold text-brand-primary">{enr.participantId}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        enr.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {enr.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900">{enr.score ?? '-'}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{enr.percentage !== undefined ? `${enr.percentage}%` : '-'}</td>
                    <td className="py-4 px-4"><EnrollmentReviewActions competitionId={id} enrollmentId={enr._id.toString()} status={enr.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {enrollments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No participants enrolled in this competition yet.
          </div>
        )}
      </GlassCard>
    </div>
  );
}
