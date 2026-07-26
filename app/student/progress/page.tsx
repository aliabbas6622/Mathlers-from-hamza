import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import ResultModel from '@/models/Result';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default async function ProgressPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  await connectDB();

  const results = await ResultModel.find({ student: session.user.id })
    .sort({ completedAt: -1 })
    .limit(50);

  const totalTests = results.length;
  const passedTests = results.filter((r: any) => r.accuracy >= 70).length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const weeklyProgress: any = {};
  results.forEach((result: any) => {
    const date = new Date(result.completedAt);
    const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
    if (!weeklyProgress[weekKey]) {
      weeklyProgress[weekKey] = { count: 0, score: 0 };
    }
    weeklyProgress[weekKey].count += 1;
    weeklyProgress[weekKey].score += result.score;
  });

  const weeklyData = Object.entries(weeklyProgress)
    .map(([week, data]: [string, any]) => ({
      week,
      tests: data.count,
      avgScore: Math.round(data.score / data.count),
    }))
    .slice(-8);

  const strengths: any = {};
  const weaknesses: any = {};
  results.forEach((result: any) => {
    const subject = result.subject || 'General';
    const avg = result.accuracy;
    if (!strengths[subject]) strengths[subject] = [];
    if (!weaknesses[subject]) weaknesses[subject] = [];
    if (avg >= 80) strengths[subject].push(avg);
    if (avg < 60) weaknesses[subject].push(avg);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Tests Completed</p>
          <p className="text-3xl font-bold text-gray-900">{totalTests}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Pass Rate</p>
          <p className="text-3xl font-bold text-gray-900">{passRate}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Tests Passed</p>
          <p className="text-3xl font-bold text-gray-900">{passedTests}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Progress</h2>
          <div className="space-y-3">
            {weeklyData.map((data) => (
              <div key={data.week} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{data.week}</p>
                  <p className="text-xs text-gray-500">{data.tests} tests</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{data.avgScore} avg score</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Strengths & Weaknesses</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
              {Object.keys(strengths).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(strengths).map(([subject, scores]: [string, any]) => (
                    <div key={subject} className="flex justify-between text-sm">
                      <span>{subject}</span>
                      <span className="text-green-600">{scores.length} high scores</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No strengths identified yet</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-red-700 mb-2">Areas to Improve</h3>
              {Object.keys(weaknesses).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(weaknesses).map(([subject, scores]: [string, any]) => (
                    <div key={subject} className="flex justify-between text-sm">
                      <span>{subject}</span>
                      <span className="text-red-600">{scores.length} low scores</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No weaknesses identified</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Actions</h2>
        <div className="space-y-3">
          {passRate < 70 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">Focus on practice sets to improve your pass rate</p>
            </div>
          )}
          {totalTests < 10 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">Complete more practice tests to get better insights</p>
            </div>
          )}
          {passedTests >= 5 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">Great progress! Consider joining competitions</p>
            </div>
          )}
          <Button className="w-full">View Practice Sets</Button>
        </div>
      </Card>
    </div>
  );
}
