import { auth } from '@mathlers/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@mathlers/lib/db';
import UserModel, { UserRole } from '@mathlers/models/User';
import ResultModel from '@mathlers/models/Result';
import GlassCard from '@mathlers/ui/GlassCard';
import { Award, Star, TrendingUp } from 'lucide-react';

export default async function PlayerCardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  await connectDB();

  const user = await UserModel.findById(session.user.id);
  const [resultCount, recentResults] = await Promise.all([
    ResultModel.countDocuments({ student: session.user.id }),
    ResultModel.find({ student: session.user.id }).sort({ completedAt: -1 }).limit(4).select('type score totalMarks completedAt'),
  ]);

  const totalPoints = user?.points || 0;
  const hasSchool = !!user?.school;
  
  let nationalRank = null;
  let schoolRank = null;

  if (user && user.role === UserRole.STUDENT) {
    const studentsWithHigherPoints = await UserModel.countDocuments({
      isActive: true,
      role: UserRole.STUDENT,
      points: { $gt: totalPoints },
    });
    nationalRank = studentsWithHigherPoints + 1;

    if (hasSchool) {
      const schoolStudentsWithHigherPoints = await UserModel.countDocuments({
        isActive: true,
        role: UserRole.STUDENT,
        school: user.school,
        points: { $gt: totalPoints },
      });
      schoolRank = schoolStudentsWithHigherPoints + 1;
    }
  }

  const level = Math.floor(totalPoints / 1000) + 1;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Player Card</h1>

      <GlassCard className="p-8 bg-gradient-to-br from-brand-primary via-brand-light to-brand-dark text-white">
        {/* Card Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 justify-between">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30">
              <span className="text-5xl font-bold">{user?.fullName?.charAt(0) || 'M'}</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">{user?.fullName}</h2>
              <p className="text-lg opacity-90 mb-1">Player ID: {user?.playerId}</p>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <span className="font-semibold">Level {level}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-8 mt-4 md:mt-0">
            <div className="text-center">
              <p className="text-4xl font-bold">#{nationalRank}</p>
              <p className="text-sm opacity-90 uppercase tracking-wider mt-1">National Rank</p>
            </div>
            {hasSchool && (
              <div className="text-center">
                <p className="text-4xl font-bold">#{schoolRank}</p>
                <p className="text-sm opacity-90 uppercase tracking-wider mt-1">School Rank</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
            <p className="text-sm opacity-90">Total Points</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{resultCount}</p>
            <p className="text-sm opacity-90">Recorded results</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{level}</p>
            <p className="text-sm opacity-90">Current Level</p>
          </div>
        </div>

      </GlassCard>

      <GlassCard className="p-6 mt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent results</h3>
        <div className="space-y-3">
          {recentResults.map((result) => <div key={result._id.toString()} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"><div><p className="font-semibold capitalize text-gray-900">{result.type}</p><p className="text-xs text-gray-500">{new Date(result.completedAt).toLocaleDateString()}</p></div><p className="font-bold text-brand-primary">{result.score} / {result.totalMarks}</p></div>)}
          {!recentResults.length && <p className="py-6 text-center text-sm text-gray-500">Complete practice or a competition to see your results here.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
