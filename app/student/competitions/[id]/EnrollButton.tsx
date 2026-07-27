'use client';

import React, { useState } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useRouter } from 'next/navigation';

import Link from 'next/link';

export default function EnrollButton({ 
  competitionId, 
  isEnrolled,
  isFull,
  registrationOpen,
  status,
}: { 
  competitionId: string, 
  isEnrolled: boolean,
  isFull: boolean,
  registrationOpen: boolean,
  status?: string,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (isEnrolled) {
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
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to enroll');
      }
      
      // Refresh to update server components with enrollment status
      router.refresh();
    } catch (err: any) {
      setError(err.message);
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
      <PrimaryButton 
        className="w-full" 
        onClick={handleEnroll} 
        disabled={loading}
      >
        {loading ? 'Enrolling...' : 'Enroll Now'}
      </PrimaryButton>
    </div>
  );
}
