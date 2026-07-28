'use client';

import React, { useState } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useRouter } from 'next/navigation';

import Link from 'next/link';

export default function EnrollButton({ 
  competitionId, 
  isEnrolled,
  enrollmentStatus,
  isFull,
  registrationOpen,
  status,
  requiresRulebookAcceptance,
  requiresAccessCode,
}: { 
  competitionId: string, 
  isEnrolled: boolean,
  enrollmentStatus?: string,
  isFull: boolean,
  registrationOpen: boolean,
  status?: string,
  requiresRulebookAcceptance: boolean,
  requiresAccessCode: boolean,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rulebookAccepted, setRulebookAccepted] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const router = useRouter();

  if (isEnrolled) {
    if (enrollmentStatus === 'pending') {
      return <PrimaryButton variant="secondary" className="w-full border-amber-200 bg-amber-50 text-amber-800 pointer-events-none">Enrollment pending school or organizer approval</PrimaryButton>;
    }

    if (enrollmentStatus === 'rejected') {
      return <PrimaryButton variant="secondary" className="w-full border-red-200 bg-red-50 text-red-700 pointer-events-none">This enrollment was not approved</PrimaryButton>;
    }

    if (status === 'in_progress') {
      return (
        <Link href={`/student/competitions/${competitionId}/start`} className="block w-full">
          <PrimaryButton className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 animate-pulse">
            🚀 Enter Live Exam Now →
          </PrimaryButton>
        </Link>
      );
    }

    if (status === 'completed') {
      return (
        <Link href={`/student/competitions/${competitionId}/results`} className="block w-full">
          <PrimaryButton className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3">
            🏆 View My Results →
          </PrimaryButton>
        </Link>
      );
    }

    return (
      <PrimaryButton variant="secondary" className="w-full text-green-700 bg-green-50 border-green-200 pointer-events-none">
        ✓ You are enrolled in this competition
      </PrimaryButton>
    );
  }

  if (!registrationOpen) {
    return (
      <PrimaryButton variant="secondary" className="w-full pointer-events-none">
        Registration Closed
      </PrimaryButton>
    );
  }

  if (isFull) {
    return (
      <PrimaryButton variant="secondary" className="w-full pointer-events-none">
        Competition Full
      </PrimaryButton>
    );
  }

  const handleEnroll = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/competitions/${competitionId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rulebookAccepted, accessCode }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to enroll');
      }
      
      // Refresh to update server components with enrollment status
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}
      {requiresAccessCode && (
        <label className="block text-sm font-medium text-gray-700">
          Access code
          <input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} className="mt-2 w-full rounded-xl border border-transparent bg-gray-50 px-3 py-2 font-mono uppercase outline-none transition-colors focus:border-brand-primary" placeholder="MTH-XXXXXXXX" />
        </label>
      )}
      {requiresRulebookAcceptance && (
        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={rulebookAccepted} onChange={(event) => setRulebookAccepted(event.target.checked)} className="mt-1 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
          <span>I have read and accept this competition&apos;s official rulebook.</span>
        </label>
      )}
      <PrimaryButton 
        className="w-full" 
        onClick={handleEnroll} 
        disabled={loading || (requiresRulebookAcceptance && !rulebookAccepted) || (requiresAccessCode && !accessCode.trim())}
      >
        {loading ? 'Enrolling...' : 'Enroll Now'}
      </PrimaryButton>
    </div>
  );
}
