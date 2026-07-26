import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import CompetitionModel from '@/models/Competition';
import EnrollmentModel from '@/models/Enrollment';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Trophy, Calendar, Users, Target } from 'lucide-react';

export default async function CompetitionsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  await connectDB();

  const competitions = await CompetitionModel.find().limit(10);

  const enrollments = await EnrollmentModel.find({ 
    student: session.user.id 
  });

  const enrolledIds = enrollments.map(e => e.competition.toString());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitions</h1>
        <p className="text-gray-600">Join competitions and compete with students worldwide</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((comp: any) => {
          const isEnrolled = enrolledIds.includes(comp._id.toString());
          
          return (
            <GlassCard key={comp._id.toString()} className="p-6 hover:scale-105 transition-transform">
              <div className="relative mb-4">
                <div className="w-full h-32 bg-gradient-to-br from-brand-primary to-brand-dark rounded-xl flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-white opacity-80" />
                </div>
                <span className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-semibold ${
                  String(comp.status) === 'active' ? 'bg-green-500 text-white' :
                  String(comp.status) === 'upcoming' ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {String(comp.status)}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{comp.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{comp.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(comp.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{comp.participants || 0} Participants</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>{comp.rounds?.length || 0} Rounds</span>
                </div>
              </div>

              {isEnrolled ? (
                <PrimaryButton variant="secondary" className="w-full" disabled>
                  ✓ Enrolled
                </PrimaryButton>
              ) : (
                <PrimaryButton className="w-full">
                  Enroll Now
                </PrimaryButton>
              )}
            </GlassCard>
          );
        })}
      </div>

      {competitions.length === 0 && (
        <GlassCard className="p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">No competitions available yet.</p>
          <p className="text-sm text-gray-500">Check back soon for new competitions!</p>
        </GlassCard>
      )}
    </div>
  );
}
