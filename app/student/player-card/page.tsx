import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import UserModel, { UserRole } from '@/models/User';
import ResultModel from '@/models/Result';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Download, Share2, Award, Star, TrendingUp } from 'lucide-react';

export default async function PlayerCardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  await connectDB();

  const user = await UserModel.findById(session.user.id);
  const results = await ResultModel.find({ student: session.user.id });

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
            <p className="text-2xl font-bold">{results.length}</p>
            <p className="text-sm opacity-90">Tests Taken</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p className="text-2xl font-bold">{level}</p>
            <p className="text-sm opacity-90">Current Level</p>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-semibold mb-1">Scan to View Profile</p>
              <p className="text-gray-600 text-sm">Share your achievements with others</p>
            </div>
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="w-20 h-20 bg-gray-300 rounded" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <PrimaryButton variant="secondary" className="flex-1">
            <Download className="w-5 h-5 mr-2" />
            Download Card
          </PrimaryButton>
          <PrimaryButton variant="secondary" className="flex-1">
            <Share2 className="w-5 h-5 mr-2" />
            Share Profile
          </PrimaryButton>
        </div>
      </GlassCard>

      {/* Additional Info */}
      <GlassCard className="p-6 mt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['First Win', 'Speed Demon', 'Perfect Score', 'Streak Master'].map((achievement) => (
            <div key={achievement} className="bg-brand-lighter rounded-xl p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-brand-primary" />
              <p className="font-semibold text-gray-900 text-sm">{achievement}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
