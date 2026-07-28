import { auth } from '@mathlers/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@mathlers/lib/db';
import ResultModel from '@mathlers/models/Result';
import GlassCard from '@mathlers/ui/GlassCard';
import { Award, Trophy, Star, Medal, Target, Zap, Lock } from 'lucide-react';
import { cn } from '@mathlers/lib/utils';

export default async function AchievementsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  await connectDB();

  const results = await ResultModel.find({ student: session.user.id });
  const totalPoints = results.reduce((sum, r) => sum + (r.score || 0), 0);
  const totalAttempts = results.length;
  const testsTaken = results.filter(r => r.type === 'test' || r.type === 'practice').length;
  const competitionAttempts = results.filter(r => r.type === 'competition').length;

  const achievementsList = [
    {
      id: 'first_test',
      title: 'First Steps',
      description: 'Complete your first test or practice session.',
      icon: Star,
      condition: testsTaken > 0,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      id: 'point_collector',
      title: 'Point Collector',
      description: 'Earn a total of 100 points.',
      icon: Zap,
      condition: totalPoints >= 100,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'math_wiz',
      title: 'Math Wiz',
      description: 'Earn a total of 500 points.',
      icon: Trophy,
      condition: totalPoints >= 500,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'accuracy_master',
      title: 'Sharpshooter',
      description: 'Achieve 100% accuracy in any test.',
      icon: Target,
      condition: results.some(r => r.accuracy === 100),
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      id: 'dedicated_learner',
      title: 'Dedicated Learner',
      description: 'Complete 10 total tests or practices.',
      icon: Medal,
      condition: totalAttempts >= 10,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'champion',
      title: 'Mathlers Champion',
      description: 'Earn a total of 1000 points.',
      icon: Award,
      condition: totalPoints >= 1000,
      color: 'text-brand-primary',
      bgColor: 'bg-brand-lighter'
    }
  ];

  const unlockedCount = achievementsList.filter(a => a.condition).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600">Track your progress and unlock new badges.</p>
      </div>

      <GlassCard className="p-8 bg-gradient-to-br from-brand-primary to-brand-dark text-white">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
            <p className="text-white/80">
              You have unlocked {unlockedCount} out of {achievementsList.length} achievements!
            </p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalPoints}</p>
              <p className="text-sm text-white/80 uppercase tracking-wider">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{testsTaken}</p>
              <p className="text-sm text-white/80 uppercase tracking-wider">Tests Taken</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-3xl font-bold">{competitionAttempts}</p>
              <p className="text-sm text-white/80 uppercase tracking-wider">Competitions</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievementsList.map((achievement) => {
          const Icon = achievement.icon;
          const isUnlocked = achievement.condition;

          return (
            <GlassCard 
              key={achievement.id} 
              className={cn(
                "p-6 transition-all duration-300 relative overflow-hidden",
                !isUnlocked && "opacity-75 grayscale-[0.5]"
              )}
            >
              {!isUnlocked && (
                <div className="absolute top-4 right-4">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
              )}
              
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                isUnlocked ? achievement.bgColor : "bg-gray-100"
              )}>
                <Icon className={cn(
                  "w-7 h-7", 
                  isUnlocked ? achievement.color : "text-gray-400"
                )} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {achievement.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {achievement.description}
              </p>
              
              <div className="mt-4 pt-4 border-t">
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  isUnlocked ? "text-green-600" : "text-gray-500"
                )}>
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
