'use client';

import React, { useState } from 'react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useRouter } from 'next/navigation';

export default function EnrollButton({ 
  competitionId, 
  isEnrolled,
  isFull,
  registrationOpen,
}: { 
  competitionId: string, 
  isEnrolled: boolean,
  isFull: boolean,
  registrationOpen: boolean,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (isEnrolled) {
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
