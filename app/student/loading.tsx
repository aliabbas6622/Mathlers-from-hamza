import Loading from '@/components/ui/Loading';

export default function StudentLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4" role="status">
      <Loading size="lg" />
      <p className="text-gray-600">Loading your learning space...</p>
    </div>
  );
}
