'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { MathRenderer } from '@/components/math/MathRenderer';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, XCircle } from 'lucide-react';

type OptionKey = 'A' | 'B' | 'C' | 'D';

type PracticeQuestion = {
  id: string;
  question: string;
  options: Record<OptionKey, string>;
  difficulty: string;
  marks: number;
};

type PracticeSet = {
  id: string;
  name: string;
  subject: string;
  grade: string;
  timeLimit: number;
  questions: PracticeQuestion[];
};

type PracticeResult = {
  score: number;
  totalMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  accuracy: number;
  timeTaken: number;
  answers: {
    questionId: string;
    selectedAnswer: OptionKey | null;
    isCorrect: boolean;
    correctAnswer: OptionKey;
    explanation: string;
  }[];
};

async function responseData(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: response.status === 401 ? 'Your session has ended. Please sign in again.' : 'The server returned an unexpected response.' };
  }
}

export default function PracticeSessionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const isMounted = useRef(true);
  const submitting = useRef(false);
  const autoSubmitStarted = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    isMounted.current = true;
    autoSubmitStarted.current = false;
    submitting.current = false;

    async function loadPracticeSet() {
      if (isMounted.current) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`/api/practice/${params.id}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const data = await responseData(response);

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load practice set');
        }

        if (isMounted.current) {
          setPracticeSet(data.practiceSet);
          setTimeLeft(data.practiceSet.timeLimit || 1800);
          setResult(null);
          setAnswers({});
          setCurrentQuestion(0);
          setError(null);
        }
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') {
          return;
        }

        if (isMounted.current) {
          setPracticeSet(null);
          setResult(null);
          setError(loadError instanceof Error ? loadError.message : 'Unable to load practice set');
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }

    loadPracticeSet();

    return () => {
      controller.abort();
    };
  }, [params.id, loadAttempt]);

  const elapsedTime = useMemo(() => {
    if (!practiceSet) {
      return 0;
    }

    return Math.max((practiceSet.timeLimit || 1800) - timeLeft, 0);
  }, [practiceSet, timeLeft]);

  const submitPractice = useCallback(async () => {
    if (!practiceSet || submitting.current || result) {
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/practice/${practiceSet.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timeTaken: elapsedTime }),
      });
      const data = await responseData(response);

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit practice');
      }

      if (isMounted.current) {
        setResult(data.result);
      }
    } catch (submitError) {
      if (isMounted.current) {
        setError(submitError instanceof Error ? submitError.message : 'Unable to submit practice');
      }
    } finally {
      submitting.current = false;
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }, [answers, elapsedTime, practiceSet, result]);

  useEffect(() => {
    if (!practiceSet || result) {
      return;
    }

    if (timeLeft <= 0) {
      if (!autoSubmitStarted.current) {
        autoSubmitStarted.current = true;
        submitPractice();
      }
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [practiceSet, result, submitPractice, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loading size="lg" />
        <p className="text-gray-600">Loading practice session...</p>
      </div>
    );
  }

  if (error && !practiceSet) {
    return (
      <EmptyState
        title="Practice unavailable"
        description={error}
        action={{ label: 'Try Again', onClick: () => setLoadAttempt((attempt) => attempt + 1) }}
      />
    );
  }

  if (!practiceSet || practiceSet.questions.length === 0) {
    return (
      <EmptyState
        title="No questions found"
        description="This practice set has no active questions yet."
        action={{ label: 'Choose Another Set', onClick: () => router.push('/student/practice') }}
      />
    );
  }

  const question = practiceSet.questions[currentQuestion];
  const selectedAnswer = answers[question.id] || null;
  const gradedAnswer = result?.answers.find((answer) => answer.questionId === question.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-600">{practiceSet.subject} • {practiceSet.grade}</p>
          <h1 className="text-3xl font-bold text-gray-900">{practiceSet.name}</h1>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-brand-lighter rounded-xl">
          <Clock className="w-5 h-5 text-brand-primary" />
          <span className="font-bold text-brand-primary">{formatTime(result ? result.timeTaken : timeLeft)}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <GlassCard className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-brand-primary">{result.score}/{result.totalMarks}</p>
              <p className="text-sm text-gray-600">Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
              <p className="text-sm text-gray-600">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{result.wrongAnswers}</p>
              <p className="text-sm text-gray-600">Wrong</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{result.skipped}</p>
              <p className="text-sm text-gray-600">Skipped</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-primary">{result.accuracy}%</p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-600">Question </span>
          <span className="text-2xl font-bold text-gray-900">{currentQuestion + 1}</span>
          <span className="text-sm text-gray-600"> of {practiceSet.questions.length}</span>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700">
          {question.difficulty}
        </span>
      </div>

      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          <MathRenderer>{question.question}</MathRenderer>
        </h2>
        <div className="space-y-4">
          {(Object.keys(question.options) as OptionKey[]).map((optionKey) => {
            const isSelected = selectedAnswer === optionKey;
            const isCorrect = gradedAnswer?.correctAnswer === optionKey;
            const isWrongSelection = result && isSelected && !isCorrect;

            return (
              <button
                key={optionKey}
                type="button"
                disabled={Boolean(result) || timeLeft === 0 || isSubmitting}
                onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionKey }))}
                className={`w-full p-5 text-left rounded-2xl border-2 transition-all font-medium text-lg ${
                  isCorrect
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : isWrongSelection
                    ? 'border-red-500 bg-red-50 text-red-800'
                    : isSelected
                    ? 'border-brand-primary bg-brand-lighter text-brand-primary shadow-lg'
                    : 'border-gray-200 hover:border-brand-primary hover:bg-gray-50'
                }`}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-gray-700 mr-4 text-sm font-semibold">
                  {optionKey}
                </span>
                <MathRenderer>{question.options[optionKey]}</MathRenderer>
                {isCorrect && result && <CheckCircle2 className="float-right w-6 h-6" />}
                {isWrongSelection && <XCircle className="float-right w-6 h-6" />}
              </button>
            );
          })}
        </div>

        {gradedAnswer && (
          <div className="mt-6 rounded-xl bg-white/70 p-4">
            <p className="font-semibold text-gray-900">Explanation</p>
            <MathRenderer display className="mt-1 text-gray-700">
              {gradedAnswer.explanation || 'No explanation provided.'}
            </MathRenderer>
          </div>
        )}
      </GlassCard>

      <div className="flex justify-between items-center">
        <PrimaryButton
          variant="secondary"
          onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </PrimaryButton>

        {result ? (
          <PrimaryButton onClick={() => router.push('/student/results')} className="px-8">
            View Results
          </PrimaryButton>
        ) : timeLeft === 0 ? (
          <PrimaryButton onClick={submitPractice} isLoading={isSubmitting} className="px-8">
            Retry submission
          </PrimaryButton>
        ) : currentQuestion === practiceSet.questions.length - 1 ? (
          <PrimaryButton onClick={submitPractice} isLoading={isSubmitting} className="px-8">
            Submit Practice
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => setCurrentQuestion((prev) => Math.min(prev + 1, practiceSet.questions.length - 1))}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </PrimaryButton>
        )}
      </div>

      <div className="flex justify-center flex-wrap gap-2">
        {practiceSet.questions.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentQuestion(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentQuestion === index
                ? 'bg-brand-primary scale-125'
                : answers[item.id]
                ? 'bg-brand-lighter'
                : 'bg-gray-300'
            }`}
            aria-label={`Go to question ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
