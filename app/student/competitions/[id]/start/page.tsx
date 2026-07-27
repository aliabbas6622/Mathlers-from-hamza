'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import MathRenderer from '@/components/math/MathRenderer';
import { Clock, CheckCircle2, ChevronLeft, ChevronRight, Send, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CompetitionExamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const competitionId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [competition, setCompetition] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);

  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const startExam = async () => {
      try {
        const res = await fetch(`/api/competitions/${competitionId}/start`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to start exam');

        setCompetition(data.competition);
        setEnrollment(data.enrollment);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    startExam();
  }, [competitionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Preparing your competition environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Exam Notice</h2>
        <p className="text-gray-600 text-sm">{error}</p>
        <Link href={`/student/competitions/${competitionId}`}>
          <PrimaryButton className="w-full">Back to Competition Details</PrimaryButton>
        </Link>
      </div>
    );
  }

  const sections = competition?.sections || [];
  const currentSection = sections[activeSectionIdx] || {};
  const questions = currentSection.questions || [];
  const currentQuestion = questions[currentQuestionIdx] || {};

  const handleOptionSelect = (optionIdx: number) => {
    if (!currentQuestion._id) return;
    setAnswers(prev => ({ ...prev, [currentQuestion._id]: optionIdx }));
  };

  const handleSubmitExam = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/competitions/${competitionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to submit exam');
      }

      router.push(`/student/competitions/${competitionId}/results`);
    } catch (err: any) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold px-3 py-1 bg-brand-lighter text-brand-primary rounded-full uppercase">
            LIVE COMPETITION EXAM
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{competition.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 font-mono font-bold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Duration: {currentSection.settings?.duration || 30} mins</span>
          </div>

          <PrimaryButton onClick={() => setShowConfirmModal(true)} className="bg-green-600 hover:bg-green-700 text-white">
            <Send className="w-4 h-4 mr-2" /> Submit Exam
          </PrimaryButton>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {sections.map((sec: any, idx: number) => (
          <button
            key={idx}
            onClick={() => {
              setActiveSectionIdx(idx);
              setCurrentQuestionIdx(0);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
              activeSectionIdx === idx
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {sec.name} ({sec.questions?.length || 0} Qs)
          </button>
        ))}
      </div>

      {/* Main Runner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Canvas */}
        <div className="lg:col-span-3 space-y-6">
          {currentQuestion._id ? (
            <GlassCard className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-sm font-bold text-gray-700">
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
                <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-semibold">
                  {currentQuestion.marks || 1} Mark(s)
                </span>
              </div>

              {/* Question Text with Math LaTeX renderer */}
              <div className="text-gray-900 text-lg font-medium leading-relaxed">
                <MathRenderer math={currentQuestion.question} inline={false} />
              </div>

              {/* Options */}
              <div className="space-y-3 pt-4">
                {currentQuestion.options?.map((opt: any, oIdx: number) => {
                  const isSelected = answers[currentQuestion._id] === oIdx;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleOptionSelect(oIdx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                        isSelected
                          ? 'bg-brand-lighter/50 border-brand-primary shadow-sm font-semibold'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                        isSelected ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <div className="text-gray-900 text-base">
                        <MathRenderer math={opt.optionText} inline />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-6 mt-6">
                <PrimaryButton
                  variant="ghost"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(i => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </PrimaryButton>

                <PrimaryButton
                  disabled={currentQuestionIdx === questions.length - 1}
                  onClick={() => setCurrentQuestionIdx(i => Math.min(questions.length - 1, i + 1))}
                >
                  Next Question <ChevronRight className="w-4 h-4 ml-2" />
                </PrimaryButton>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-12 text-center text-gray-500">
              No questions found in this section.
            </GlassCard>
          )}
        </div>

        {/* Sidebar Question Palette */}
        <div>
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q: any, i: number) => {
                const isAnswered = answers[q._id] !== undefined;
                const isCurrent = i === currentQuestionIdx;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIdx(i)}
                    className={`h-10 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'ring-2 ring-brand-primary ring-offset-2 bg-brand-primary text-white'
                        : isAnswered
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-sm" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-200 rounded-sm" /> Unanswered
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Confirm Submission Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl text-center space-y-6">
            <ShieldCheck className="w-16 h-16 text-brand-primary mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Submit Competition Exam?</h3>
              <p className="text-gray-600 text-sm mt-2">
                Are you sure you want to finish and submit your answers? You cannot edit your choices after submitting.
              </p>
            </div>

            <div className="flex gap-3">
              <PrimaryButton variant="ghost" onClick={() => setShowConfirmModal(false)} className="w-full">
                Cancel
              </PrimaryButton>
              <PrimaryButton onClick={handleSubmitExam} isLoading={submitting} disabled={submitting} className="w-full bg-green-600 hover:bg-green-700">
                Confirm Submit
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
