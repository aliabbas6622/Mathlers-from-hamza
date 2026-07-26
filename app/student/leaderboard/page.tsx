import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import UserModel from '@/models/User';
import ResultModel from '@/models/Result';
import Card from '@/components/ui/Card';

export default async function LeaderboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  await connectDB();

  const results = await ResultModel.find({})
    .sort({ score: -1 })
    .limit(50)
    .populate('student');

  const leaderboard: any[] = [];
  const userScores = new Map();

  results.forEach((result: any) => {
    const studentId = result.student?._id?.toString();
    if (studentId) {
      const currentScore = userScores.get(studentId) || 0;
      userScores.set(studentId, currentScore + result.score);
    }
  });

  const students = await UserModel.find({ isActive: true }).limit(50);

  students.forEach((student: any) => {
    leaderboard.push({
      id: student._id.toString(),
      name: student.fullName,
      playerId: student.playerId,
      score: userScores.get(student._id.toString()) || 0,
    });
  });

  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard.slice(0, 20);

  const userRank = leaderboard.findIndex((u) => u.id === session.user.id) + 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Leaderboard</h1>

      <Card className="p-6 mb-8 bg-gradient-to-r from-red-primary to-red-dark text-white">
        <div className="text-center">
          <p className="text-lg mb-2">Your Current Rank</p>
          <p className="text-5xl font-bold mb-2">#{userRank || '-'}</p>
          <p className="text-sm opacity-90">Keep practicing to improve your ranking!</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performers</h2>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                entry.id === session.user.id ? 'bg-red-50 border-2 border-red-primary' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{entry.name}</p>
                  <p className="text-sm text-gray-600">{entry.playerId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{entry.score} pts</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
