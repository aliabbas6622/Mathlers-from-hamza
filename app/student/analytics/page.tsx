import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import ResultModel, { IResult } from '@/models/Result';
import Card from '@/components/ui/Card';

type ResultSummary = Pick<IResult, 'score' | 'totalMarks' | 'accuracy' | 'type' | 'completedAt'> & {
  _id: { toString(): string };
};

export default async function AnalyticsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  await connectDB();

  const results = (await ResultModel.find({ student: session.user.id })
    .sort({ completedAt: -1 })
    .limit(100)) as unknown as ResultSummary[];

  const totalTests = results.length;
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const totalPossible = results.reduce((sum, result) => sum + result.totalMarks, 0);
  const averageAccuracy = results.length > 0 
    ? Math.round(results.reduce((sum, result) => sum + result.accuracy, 0) / results.length)
    : 0;

  const subjectPerformance: Record<string, { total: number; count: number }> = {};
  results.forEach((result) => {
    const subject = 'General';
    if (!subjectPerformance[subject]) {
      subjectPerformance[subject] = { total: 0, count: 0 };
    }
    subjectPerformance[subject].total += result.score;
    subjectPerformance[subject].count += 1;
  });

  const recentResults = results.slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Performance Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Total Tests</p>
          <p className="text-3xl font-bold text-gray-900">{totalTests}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Total Score</p>
          <p className="text-3xl font-bold text-gray-900">{totalScore}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Average Accuracy</p>
          <p className="text-3xl font-bold text-gray-900">{averageAccuracy}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Success Rate</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Subject Performance</h2>
          <div className="space-y-4">
            {Object.entries(subjectPerformance).map(([subject, data]) => (
              <div key={subject}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">{subject}</span>
                  <span className="font-semibold">{Math.round(data.total / data.count)} avg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-primary h-2 rounded-full"
                    style={{ width: `${Math.min(100, (data.total / data.count) / 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Performance</h2>
          <div className="space-y-3">
            {recentResults.map((result) => (
              <div key={result._id.toString()} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">
                    {result.type === 'practice' ? 'Practice' : result.type === 'test' ? 'Test' : 'Competition'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(result.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{result.score}</p>
                  <p className="text-xs text-gray-500">{result.accuracy}% accuracy</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
