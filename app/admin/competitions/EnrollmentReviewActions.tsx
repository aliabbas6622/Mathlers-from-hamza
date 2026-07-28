'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EnrollmentReviewActions({ competitionId, enrollmentId, status }: { competitionId: string; enrollmentId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const update = async (nextStatus: 'approved' | 'rejected') => {
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/competitions/${competitionId}/enrollments/${enrollmentId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setError('Unable to update');
    } finally {
      setPending(false);
    }
  };
  if (status !== 'pending') return null;
  return <div className="flex items-center gap-2"><button disabled={pending} onClick={() => void update('approved')} className="rounded-lg border border-transparent px-2 py-1 text-xs font-semibold text-green-700 hover:border-green-600 hover:bg-green-50 disabled:opacity-50">Approve</button><button disabled={pending} onClick={() => void update('rejected')} className="rounded-lg border border-transparent px-2 py-1 text-xs font-semibold text-red-700 hover:border-red-600 hover:bg-red-50 disabled:opacity-50">Reject</button>{error && <span className="text-xs text-red-600">{error}</span>}</div>;
}
