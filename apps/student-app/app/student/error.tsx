'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';
import PrimaryButton from '@mathlers/ui/PrimaryButton';

export default function StudentError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-gray-900">We could not load this page</h1>
      <p className="mt-2 max-w-md text-gray-600">Your work is safe. Check your connection and try again.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <PrimaryButton onClick={reset} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </PrimaryButton>
        <Link href="/student/dashboard">
          <PrimaryButton variant="secondary">Back to dashboard</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
