import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import ResultModel, { IResult } from '@/models/Result';
import Card from '@/components/ui/Card';

type CertificateResult = Pick<IResult, 'score' | 'totalMarks' | 'completedAt'> & {
  _id: { toString(): string };
};

export default async function CertificatesPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/sign-in');
  }

  await connectDB();

  const results = (await ResultModel.find({
    student: session.user.id,
  })
  .sort({ completedAt: -1 })
  .limit(20)) as unknown as CertificateResult[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Certificates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <Card key={result._id.toString()} className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-primary to-red-dark rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Competition result</h3>
              <p className="text-sm text-gray-600 mb-4">
                Score: {result.score}/{result.totalMarks}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {new Date(result.completedAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">Certificates are shown here once an event organizer issues them.</p>
            </div>
          </Card>
        ))}
      </div>

      {results.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">No certificates yet.</p>
          <p className="text-sm text-gray-500">Complete competitions to earn certificates!</p>
        </Card>
      )}
    </div>
  );
}
