import { auth } from '@mathlers/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@mathlers/lib/db';
import UserModel from '@mathlers/models/User';
import ResultModel, { IResult } from '@mathlers/models/Result';
import GlassCard from '@mathlers/ui/GlassCard';
import PrimaryButton from '@mathlers/ui/PrimaryButton';
import { User, Mail, Edit, Award, TrendingUp, Target } from 'lucide-react';

type ProfileResult = Pick<IResult, 'score' | 'accuracy' | 'type' | 'completedAt'> & {
  _id: { toString(): string };
};

export default async function StudentProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  await connectDB();

  const user = await UserModel.findById(session.user.id);
  const results = (await ResultModel.find({ student: session.user.id })) as unknown as ProfileResult[];

  const totalPoints = results.reduce((sum, r) => sum + (r.score || 0), 0);
  const accuracy = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + (r.accuracy || 0), 0) / results.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <GlassCard className="p-6">
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-brand-primary to-brand-dark rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">Player ID: {user?.playerId}</p>
          </div>

          <PrimaryButton className="w-full mb-4">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </PrimaryButton>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">Student</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">{user?.email}</span>
            </div>
          </div>
        </GlassCard>

        {/* Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-brand-lighter rounded-xl p-4 text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-brand-primary" />
                <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
              <div className="bg-brand-lighter rounded-xl p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-brand-primary" />
                <p className="text-2xl font-bold text-gray-900">{results.length}</p>
                <p className="text-sm text-gray-600">Tests Taken</p>
              </div>
              <div className="bg-brand-lighter rounded-xl p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-brand-primary" />
                <p className="text-2xl font-bold text-gray-900">{accuracy}%</p>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
            </div>
          </GlassCard>

          {/* Personal Information */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <p className="text-gray-900 font-semibold">{user?.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-900 font-semibold">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Player ID</label>
                <p className="text-gray-900 font-semibold">{user?.playerId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                <p className="text-gray-900 font-semibold capitalize">{user?.role}</p>
              </div>
            </div>
          </GlassCard>

          {/* Competition History */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {results.slice(0, 5).map((result) => (
                <div key={result._id.toString()} className="flex items-center gap-4 p-3 bg-white/50 rounded-xl">
                  <div className="w-10 h-10 bg-brand-lighter rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-brand-primary" />
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
                    {new Date(result.completedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {results.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
