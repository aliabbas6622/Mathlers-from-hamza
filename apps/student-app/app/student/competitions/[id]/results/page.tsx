import React from 'react';
import { auth } from '@mathlers/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@mathlers/lib/db';
import CompetitionModel from '@mathlers/models/Competition';
import EnrollmentModel from '@mathlers/models/Enrollment';
import Link from 'next/link';
import { Trophy, ArrowRight, BarChart2 } from 'lucide-react';
import GlassCard from '@mathlers/ui/GlassCard';
import PrimaryButton from '@mathlers/ui/PrimaryButton';
import { isValidObjectId } from '@mathlers/lib/utils';

export default async function StudentCompetitionResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session || !isValidObjectId(session.user.id)) {
    redirect('/sign-in');
  }

  await connectDB();
  const { id } = await params;
  if (!isValidObjectId(id)) {
    redirect('/student/competitions');
  }

  const competition = await CompetitionModel.findById(id);
  if (!competition) {
    redirect('/student/competitions');
  }

  const enrollment = await EnrollmentModel.findOne({
    competition: id,
    student: session.user.id,
  });

  if (!enrollment || enrollment.status !== 'completed') {
    redirect(`/student/competitions/${id}`);
  }

  const score = enrollment.score || 0;
  const totalMarks = enrollment.totalMarks || 100;
  const percentage = enrollment.percentage || Math.round((score / totalMarks) * 100);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <GlassCard className="p-8 text-center space-y-6 bg-gradient-to-br from-brand-dark via-brand-primary to-indigo-900 text-white relative overflow-hidden">
        <div className="w-20 h-20 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest bg-white/20 px-3 py-1 rounded-full">
            OFFICIAL RESULTS
          </span>
          <h1 className="text-3xl font-extrabold mt-3">{competition.name}</h1>
          <p className="text-white/80 text-sm mt-1">Participant ID: {enrollment.participantId}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
          <div>
            <p className="text-xs text-white/70">Score</p>
            <p className="text-2xl font-black text-yellow-300">{score} / {totalMarks}</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Percentage</p>
            <p className="text-2xl font-black text-green-300">{percentage}%</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Status</p>
            <p className="text-xl font-bold text-white uppercase">Completed</p>
          </div>
        </div>
      </GlassCard>

      {/* Performance Summary */}
      <GlassCard className="p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-brand-primary" /> Performance Summary
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-600 text-sm">Submission Time</span>
            <span className="font-semibold text-gray-900 text-sm">
              {enrollment.endTime ? new Date(enrollment.endTime).toLocaleString() : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-600 text-sm">Category</span>
            <span className="font-semibold text-gray-900 text-sm capitalize">{competition.category}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
          <Link href="/student/competitions" className="flex-1">
            <PrimaryButton className="w-full">
              Back to Competition Center <ArrowRight className="w-4 h-4 ml-2" />
            </PrimaryButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
