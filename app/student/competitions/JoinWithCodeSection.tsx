'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Input from '@/components/ui/Input';
import { Tag, Check, AlertCircle, Trophy, Calendar, Users, Layers, Clock, ShieldCheck, Download, X, QrCode, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function JoinWithCodeSection({ studentName = 'Student' }: { studentName?: string }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [competitionData, setCompetitionData] = useState<any>(null);
  const [rulebookAccepted, setRulebookAccepted] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<any>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setCompetitionData(null);
    setEnrollmentResult(null);

    try {
      const res = await fetch('/api/competitions/join-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to find competition');
      }

      setCompetitionData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setError('');
    setCompetitionData(null);
    setRulebookAccepted(false);
    setEnrollmentResult(null);
  };

  const handleEnroll = async () => {
    if (!competitionData || !rulebookAccepted) return;

    setEnrolling(true);
    setError('');

    try {
      const res = await fetch(`/api/competitions/${competitionData.competition._id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll');
      }

      setEnrollmentResult({
        participantId: data.participantId,
        competitionName: competitionData.competition.name,
        accessCode: competitionData.competition.registration?.accessCode || code,
        competitionId: competitionData.competition._id,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const comp = competitionData?.competition;
  const elig = competitionData?.eligibilityCheck;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Code Input Card */}
      <GlassCard className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-brand-lighter rounded-xl flex items-center justify-center text-brand-primary">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Join Competition with Code</h2>
            <p className="text-gray-600 text-sm">Enter the unique code given by your school or teacher</p>
          </div>
        </div>

        <form onSubmit={handleValidateCode} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g. MTH-G7-4832"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="text-lg tracking-widest font-mono uppercase font-bold text-brand-primary"
                required
              />
            </div>
            <div className="flex gap-2">
              <PrimaryButton type="submit" isLoading={loading} disabled={loading || !code.trim()}>
                Find Competition
              </PrimaryButton>
              {code && (
                <PrimaryButton type="button" variant="ghost" onClick={handleClear}>
                  Clear
                </PrimaryButton>
              )}
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </GlassCard>

      {/* Competition Preview Card */}
      {comp && !enrollmentResult && (
        <GlassCard className="p-8 space-y-6 border-2 border-brand-primary/20">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-semibold px-3 py-1 bg-brand-lighter text-brand-primary rounded-full uppercase">
                {comp.category} Competition
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{comp.name}</h3>
              <p className="text-gray-600 text-sm mt-1">Organized by {comp.organizer}</p>
            </div>
            <span className="text-sm font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
              {comp.registration?.accessCode}
            </span>
          </div>

          <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{comp.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <div>
              <p className="text-xs text-gray-500">Sections</p>
              <p className="font-bold text-gray-900 flex items-center justify-center gap-1 mt-1">
                <Layers className="w-4 h-4 text-brand-primary" /> {comp.sectionsCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-bold text-gray-900 flex items-center justify-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-blue-500" /> {comp.totalDuration} mins
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Grades</p>
              <p className="font-bold text-gray-900 mt-1">{comp.eligibility?.grades?.join(', ') || 'All'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Capacity</p>
              <p className="font-bold text-gray-900 mt-1">{comp.eligibility?.maxParticipants}</p>
            </div>
          </div>

          {/* Rulebook Section */}
          {comp.rulebook && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-primary" /> Competition Rulebook
              </h4>
              <p className="text-xs text-gray-600 font-mono whitespace-pre-line max-h-32 overflow-y-auto p-2 bg-white rounded border border-gray-100">
                {typeof comp.rulebook === 'object' ? comp.rulebook.content : comp.rulebook}
              </p>
            </div>
          )}

          {/* Eligibility Check Status */}
          {elig && (
            <div>
              {elig.isEnrolled ? (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium text-sm flex items-center justify-between">
                  <span>✓ You are already enrolled in this competition!</span>
                  <span className="font-mono font-bold text-xs bg-white px-2 py-1 rounded">ID: {elig.existingParticipantId}</span>
                </div>
              ) : !elig.isGradeEligible ? (
                <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm">
                  ⚠️ Your grade is not eligible for this competition. Allowed: {comp.eligibility?.grades?.join(', ')}
                </div>
              ) : elig.isFull ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
                  🛑 This competition has reached its maximum participant limit.
                </div>
              ) : (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rulebookAccepted}
                      onChange={e => setRulebookAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">
                      I have read and agree to the competition rulebook.
                    </span>
                  </label>

                  <PrimaryButton
                    onClick={handleEnroll}
                    disabled={!rulebookAccepted || enrolling}
                    isLoading={enrolling}
                    className="w-full text-lg py-4"
                  >
                    Confirm & Enroll Now 🎉
                  </PrimaryButton>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* Successful Enrollment Banner */}
      {enrollmentResult && (
        <GlassCard className="p-8 text-center space-y-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <Check className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-3xl font-bold text-gray-900">🎉 Successfully Enrolled!</h3>
            <p className="text-gray-600 mt-1">You are now registered for <strong>{enrollmentResult.competitionName}</strong></p>
          </div>

          <div className="max-w-md mx-auto p-4 bg-white rounded-2xl shadow-sm border border-green-200 text-left space-y-2">
            <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-500">Participant ID</span>
              <span className="font-mono font-bold text-brand-primary">{enrollmentResult.participantId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Access Code</span>
              <span className="font-mono font-semibold text-gray-700">{enrollmentResult.accessCode}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <PrimaryButton onClick={() => setShowPassModal(true)}>
              <QrCode className="w-4 h-4 mr-2" /> Download Competition Pass
            </PrimaryButton>
            <Link href={`/student/competitions/${enrollmentResult.competitionId}`}>
              <PrimaryButton variant="secondary">
                View Competition <ArrowRight className="w-4 h-4 ml-2" />
              </PrimaryButton>
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Digital Competition Pass Modal */}
      {showPassModal && enrollmentResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => setShowPassModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Pass Printable Card */}
            <div className="p-6 bg-gradient-to-br from-brand-dark via-brand-primary to-indigo-900 rounded-2xl text-white shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <Trophy className="w-48 h-48 text-white" />
              </div>

              <div className="flex justify-between items-center border-b border-white/20 pb-3">
                <span className="font-extrabold tracking-wider text-xs uppercase bg-white/20 px-3 py-1 rounded-full">
                  OFFICIAL COMPETITION PASS
                </span>
                <span className="text-xs text-green-300 font-semibold">✓ VERIFIED</span>
              </div>

              <div>
                <p className="text-xs text-white/70 uppercase">Competition</p>
                <h4 className="text-xl font-bold">{enrollmentResult.competitionName}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-white/70">Student Name</p>
                  <p className="font-semibold">{studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Participant ID</p>
                  <p className="font-mono font-bold text-yellow-300">{enrollmentResult.participantId}</p>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white p-3 rounded-xl flex items-center justify-between text-gray-900">
                <div>
                  <p className="text-xs text-gray-500">Scan for Verification</p>
                  <p className="font-mono text-xs font-bold">{enrollmentResult.participantId}</p>
                </div>
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                  <QrCode className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <PrimaryButton onClick={() => window.print()} className="w-full">
                <Download className="w-4 h-4 mr-2" /> Print / Save PDF
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
