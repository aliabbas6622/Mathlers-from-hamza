import { auth } from '@mathlers/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@mathlers/lib/db';
import ResultModel, { IResult } from '@mathlers/models/Result';
import Card from '@mathlers/ui/Card';

type ResultListItem = Pick<IResult, 'type' | 'score' | 'totalMarks' | 'accuracy' | 'completedAt'> & {
  _id: { toString(): string };
};

export default async function ResultsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  await connectDB();

  const results = (await ResultModel.find({ student: session.user.id })
    .sort({ completedAt: -1 })
    .limit(20)) as unknown as ResultListItem[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Results</h1>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result._id.toString()} className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {result.type === 'practice' ? 'Practice Set' : result.type === 'test' ? 'Test' : 'Competition'}
                </h3>
                <p className="text-sm text-gray-600">
                  Score: {result.score}/{result.totalMarks} • Accuracy: {result.accuracy}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{result.score}</p>
                <p className="text-xs text-gray-600">
                  {result.completedAt?.toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600">No results yet. Start practicing!</p>
        </Card>
      )}
    </div>
  );
}
