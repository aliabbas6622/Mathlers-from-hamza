'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Input from '@/components/ui/Input';
import { ChevronRight, ChevronLeft, Save, X, Plus, Trash2, Check } from 'lucide-react';

import QuestionBankSelectorModal from '@/components/admin/competitions/QuestionBankSelectorModal';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SectionData {
  name: string;
  description: string;
  duration: string;
  totalMarks: string;
  passingMarks: string;
  negativeMarking: boolean;
  negativeMarkValue: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  calculatorAllowed: boolean;
  skipAllowed: boolean;
  reviewAllowed: boolean;
  questions: string[];
}

interface RoundData {
  name: string;
  type: 'qualifier' | 'quarter_final' | 'semi_final' | 'final' | 'custom';
  startDate: string;
  endDate: string;
  topN: string;
  minimumScore: string;
  minimumPercentage: string;
  sections: SectionData[];
}

interface FormData {
  // Step 1
  name: string;
  category: string;
  description: string;
  organizer: string;
  contact: string;
  language: string;
  difficultyLevel: string;
  // Step 2
  eligibilityType: string;
  grades: string[];
  minAge: string;
  maxAge: string;
  maxParticipants: string;
  // Step 3
  registrationStartDate: string;
  registrationEndDate: string;
  competitionStartDate: string;
  competitionEndDate: string;
  registrationType: string;
  // Step 4
  rulebookContent: string;
  // Step 5
  prizeDetails: string;
}

const STEPS = [
  { label: 'Basic Info', icon: '📋' },
  { label: 'Eligibility', icon: '🎯' },
  { label: 'Registration', icon: '📅' },
  { label: 'Rulebook', icon: '📖' },
  { label: 'Structure', icon: '🏗️' },
];

const GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];

const defaultSection: SectionData = {
  name: 'Section 1',
  description: '',
  duration: '30',
  totalMarks: '100',
  passingMarks: '40',
  negativeMarking: false,
  negativeMarkValue: '0',
  shuffleQuestions: true,
  shuffleOptions: true,
  calculatorAllowed: false,
  skipAllowed: true,
  reviewAllowed: true,
  questions: [],
};

const defaultRound = (roundNumber: number): RoundData => ({
  name: roundNumber === 1 ? 'Qualifier' : `Round ${roundNumber}`,
  type: roundNumber === 1 ? 'qualifier' : 'custom',
  startDate: '', endDate: '', topN: roundNumber === 1 ? '100' : '', minimumScore: '', minimumPercentage: '',
  sections: [{ ...defaultSection }],
});

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateCompetitionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdAccessCode, setCreatedAccessCode] = useState('');
  const [modalSectionIdx, setModalSectionIdx] = useState<number | null>(null);
  const [modalRoundTarget, setModalRoundTarget] = useState<{ roundIndex: number; sectionIndex: number } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '', category: 'public', description: '', organizer: '', contact: '',
    language: 'English', difficultyLevel: 'intermediate',
    eligibilityType: 'public', grades: [], minAge: '', maxAge: '', maxParticipants: '500',
    registrationStartDate: '', registrationEndDate: '',
    competitionStartDate: '', competitionEndDate: '', registrationType: 'automatic',
    rulebookContent: '',
    prizeDetails: '',
  });

  const [sections, setSections] = useState<SectionData[]>([{ ...defaultSection }]);
  const [rounds, setRounds] = useState<RoundData[]>([defaultRound(1)]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleGrade = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade],
    }));
  };

  const handleSectionChange = (idx: number, field: string, value: string | boolean | string[]) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addSection = () => {
    setSections(prev => [...prev, { ...defaultSection, name: `Section ${prev.length + 1}` }]);
  };

  const removeSection = (idx: number) => {
    if (sections.length > 1) setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRound = (roundIndex: number, field: keyof Omit<RoundData, 'sections'>, value: string) => {
    setRounds(prev => prev.map((round, index) => index === roundIndex ? { ...round, [field]: value } : round));
  };
  const updateRoundSection = (roundIndex: number, sectionIndex: number, field: string, value: string | boolean | string[]) => {
    setRounds(prev => prev.map((round, index) => index === roundIndex ? { ...round, sections: round.sections.map((section, current) => current === sectionIndex ? { ...section, [field]: value } : section) } : round));
  };
  const addRound = () => setRounds(prev => [...prev, defaultRound(prev.length + 1)]);
  const removeRound = (roundIndex: number) => { if (rounds.length > 1) setRounds(prev => prev.filter((_, index) => index !== roundIndex)); };
  const addRoundSection = (roundIndex: number) => setRounds(prev => prev.map((round, index) => index === roundIndex ? { ...round, sections: [...round.sections, { ...defaultSection, name: `Section ${round.sections.length + 1}` }] } : round));
  const removeRoundSection = (roundIndex: number, sectionIndex: number) => setRounds(prev => prev.map((round, index) => index === roundIndex && round.sections.length > 1 ? { ...round, sections: round.sections.filter((_, current) => current !== sectionIndex) } : round));

  const next = () => { setError(''); setStep(s => Math.min(s + 1, STEPS.length - 1)); };
  const prev = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const body = {
        ...formData,
        grades: formData.grades.length > 0 ? formData.grades : ['All'],
        maxParticipants: Number(formData.maxParticipants),
        sections: formData.category === 'championship' ? [] : sections.map((s, i) => ({
          name: s.name,
          description: s.description,
          order: i,
          questions: s.questions || [],
          settings: {
            duration: Number(s.duration),
            totalMarks: Number(s.totalMarks),
            passingMarks: Number(s.passingMarks),
            negativeMarking: s.negativeMarking,
            negativeMarkValue: Number(s.negativeMarkValue),
            shuffleQuestions: s.shuffleQuestions,
            shuffleOptions: s.shuffleOptions,
            calculatorAllowed: s.calculatorAllowed,
            skipAllowed: s.skipAllowed,
            reviewAllowed: s.reviewAllowed,
          },
        })),
        rounds: formData.category === 'championship' ? rounds.map((round, roundIndex) => ({
          name: round.name, type: round.type, roundNumber: roundIndex + 1,
          schedule: { startDate: round.startDate, endDate: round.endDate },
          qualificationCriteria: { topN: round.topN, minimumScore: round.minimumScore, minimumPercentage: round.minimumPercentage },
          sections: round.sections.map((s, sectionIndex) => ({ name: s.name, description: s.description, order: sectionIndex, questions: s.questions || [], settings: { duration: Number(s.duration), totalMarks: Number(s.totalMarks), passingMarks: Number(s.passingMarks), negativeMarking: s.negativeMarking, negativeMarkValue: Number(s.negativeMarkValue), shuffleQuestions: s.shuffleQuestions, shuffleOptions: s.shuffleOptions, calculatorAllowed: s.calculatorAllowed, skipAllowed: s.skipAllowed, reviewAllowed: s.reviewAllowed } })),
        })) : [],
      };

      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let msg = 'Failed to create competition';
        try { const d = await res.json(); if (d.error) msg = d.error; } catch {}
        throw new Error(msg);
      }

      const created = await res.json() as { accessCode?: string };
      if (created.accessCode) {
        setCreatedAccessCode(created.accessCode);
      } else {
        router.push('/admin/competitions');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create competition');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (createdAccessCode) {
    return (
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Competition created</h1>
        <p className="text-gray-600">Save this access code now. It is shown once so you can distribute it only to eligible participants.</p>
        <code className="block rounded-xl bg-gray-100 px-4 py-3 text-xl font-bold tracking-wider text-gray-900">{createdAccessCode}</code>
        <PrimaryButton onClick={() => router.push('/admin/competitions')}>View competitions</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500">
        <Link href="/admin" className="hover:text-brand-primary transition-colors">Admin</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/admin/competitions" className="hover:text-brand-primary transition-colors">Competitions</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Create New</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Create Competition</h1>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                i === step
                  ? 'bg-brand-primary text-white shadow-lg scale-105'
                  : i < step
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {i < step ? <Check className="w-4 h-4" /> : <span>{s.icon}</span>}
              <span className="hidden md:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

      {/* Step 1 — Basic Info */}
      {step === 0 && (
        <GlassCard className="p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Competition Name" name="name" value={formData.name} onChange={handleChange} required />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange}
                className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
                <option value="public">🌍 Public Competition</option>
                <option value="grade">🏫 Grade Competition</option>
                <option value="championship">🥊 Championship (multi-round)</option>
              </select>
            </div>
            <Input label="Organizer" name="organizer" value={formData.organizer} onChange={handleChange} required />
            <Input label="Contact" name="contact" value={formData.contact} onChange={handleChange} required />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select name="language" value={formData.language} onChange={handleChange}
                className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
              </select>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
              <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleChange}
                className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="w-full md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={3}
                className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none" />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Step 2 — Eligibility */}
      {step === 1 && (
        <GlassCard className="p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-4">Eligibility</h2>
          <div className="space-y-6">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Who can participate?</label>
              <select name="eligibilityType" value={formData.eligibilityType} onChange={handleChange}
                className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
                <option value="public">Public — Everyone</option>
                <option value="selected_grades">Selected Grades</option>
                <option value="selected_schools">Selected Schools</option>
                <option value="invite_only">Invite Only</option>
              </select>
            </div>

            {(formData.eligibilityType === 'selected_grades' || formData.category === 'grade') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Grades</label>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map(g => (
                    <button key={g} type="button" onClick={() => toggleGrade(g)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.grades.includes(g) ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input label="Min Age (optional)" type="number" name="minAge" value={formData.minAge} onChange={handleChange} />
              <Input label="Max Age (optional)" type="number" name="maxAge" value={formData.maxAge} onChange={handleChange} />
              <Input label="Max Participants" type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} required />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Step 3 — Registration & Schedule */}
      {step === 2 && (
        <GlassCard className="p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-4">Registration & Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Registration Start" type="datetime-local" name="registrationStartDate" value={formData.registrationStartDate} onChange={handleChange} required />
            <Input label="Registration End" type="datetime-local" name="registrationEndDate" value={formData.registrationEndDate} onChange={handleChange} required />
            <Input label="Competition Start" type="datetime-local" name="competitionStartDate" value={formData.competitionStartDate} onChange={handleChange} required />
            <Input label="Competition End" type="datetime-local" name="competitionEndDate" value={formData.competitionEndDate} onChange={handleChange} required />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Type</label>
            <select name="registrationType" value={formData.registrationType} onChange={handleChange}
              className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none">
              <option value="automatic">Automatic — instant enrollment</option>
              <option value="manual_approval">Manual Approval</option>
              <option value="access_code">Access Code</option>
            </select>
          </div>
          {formData.registrationType === 'access_code' && (
            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
              A secure access code will be generated when you create this competition. Save it before leaving the confirmation screen.
            </p>
          )}
        </GlassCard>
      )}

      {/* Step 4 — Rulebook & Prize */}
      {step === 3 && (
        <GlassCard className="p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-4">Rulebook & Prizes</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rulebook (Markdown / Rich Text)</label>
            <textarea name="rulebookContent" value={formData.rulebookContent} onChange={handleChange} required rows={8}
              placeholder="Write the competition rules here. Supports markdown formatting..."
              className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prize Details</label>
            <textarea name="prizeDetails" value={formData.prizeDetails} onChange={handleChange} required rows={4}
              className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 focus:border-brand-primary outline-none" />
          </div>
        </GlassCard>
      )}

      {/* Step 5 — Sections */}
      {step === 4 && formData.category !== 'championship' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Competition Sections</h2>
            <PrimaryButton type="button" variant="secondary" onClick={addSection}>
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </PrimaryButton>
          </div>

          {sections.map((sec, idx) => (
            <GlassCard key={idx} className="p-6 space-y-5 relative">
              {sections.length > 1 && (
                <button type="button" onClick={() => removeSection(idx)}
                  className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <h3 className="font-bold text-gray-900">Section {idx + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Section Name" value={sec.name} onChange={e => handleSectionChange(idx, 'name', e.target.value)} required />
                <Input label="Duration (mins)" type="number" value={sec.duration} onChange={e => handleSectionChange(idx, 'duration', e.target.value)} required />
                <Input label="Total Marks" type="number" value={sec.totalMarks} onChange={e => handleSectionChange(idx, 'totalMarks', e.target.value)} required />
                <Input label="Passing Marks" type="number" value={sec.passingMarks} onChange={e => handleSectionChange(idx, 'passingMarks', e.target.value)} required />
                <div className="w-full md:col-span-2">
                  <Input label="Description (optional)" value={sec.description} onChange={e => handleSectionChange(idx, 'description', e.target.value)} />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Section Settings</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {([
                    ['shuffleQuestions', 'Shuffle Questions'],
                    ['shuffleOptions', 'Shuffle Options'],
                    ['calculatorAllowed', 'Calculator'],
                    ['skipAllowed', 'Allow Skip'],
                    ['reviewAllowed', 'Allow Review'],
                    ['negativeMarking', 'Negative Marking'],
                  ] as [string, string][]).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={sec[key as keyof SectionData] as boolean}
                        onChange={e => handleSectionChange(idx, key, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                      {label}
                    </label>
                  ))}
                </div>
                {sec.negativeMarking && (
                  <div className="mt-3 max-w-xs">
                    <Input label="Negative Mark Value" type="number" value={sec.negativeMarkValue}
                      onChange={e => handleSectionChange(idx, 'negativeMarkValue', e.target.value)} />
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Question Bank Assignment</p>
                  <p className="text-xs text-gray-500">
                    {sec.questions && sec.questions.length > 0
                      ? `Selected ${sec.questions.length} questions for this section.`
                      : 'No questions assigned yet.'}
                  </p>
                </div>
                <PrimaryButton type="button" variant="secondary" onClick={() => setModalSectionIdx(idx)}>
                  Select Questions ({sec.questions?.length || 0})
                </PrimaryButton>
              </div>
            </GlassCard>
          ))}

          {/* Question Selector Modal */}
          {modalSectionIdx !== null && (
            <QuestionBankSelectorModal
              isOpen={modalSectionIdx !== null}
              onClose={() => setModalSectionIdx(null)}
              selectedQuestionIds={sections[modalSectionIdx]?.questions || []}
              onSelectQuestions={(selectedIds) => handleSectionChange(modalSectionIdx, 'questions', selectedIds)}
              sectionName={sections[modalSectionIdx]?.name || `Section ${modalSectionIdx + 1}`}
            />
          )}
        </div>
      )}

      {step === 4 && formData.category === 'championship' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div><h2 className="text-xl font-semibold text-gray-900">Championship rounds</h2><p className="mt-1 text-sm text-gray-500">Rounds run in schedule order. Every non-final round needs at least one qualification rule.</p></div>
            <PrimaryButton type="button" variant="secondary" onClick={addRound}><Plus className="mr-2 h-4 w-4" />Add round</PrimaryButton>
          </div>
          {rounds.map((round, roundIndex) => (
            <GlassCard key={roundIndex} className="space-y-5 p-6">
              <div className="flex items-center justify-between"><h3 className="font-bold text-gray-900">Round {roundIndex + 1}</h3>{rounds.length > 1 && <button type="button" onClick={() => removeRound(roundIndex)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Round name" value={round.name} onChange={(event) => updateRound(roundIndex, 'name', event.target.value)} required />
                <label className="block text-sm font-medium text-gray-700">Round type<select value={round.type} onChange={(event) => updateRound(roundIndex, 'type', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"><option value="qualifier">Qualifier</option><option value="quarter_final">Quarter-final</option><option value="semi_final">Semi-final</option><option value="final">Final</option><option value="custom">Custom</option></select></label>
                <Input label="Round starts" type="datetime-local" value={round.startDate} onChange={(event) => updateRound(roundIndex, 'startDate', event.target.value)} required />
                <Input label="Round ends" type="datetime-local" value={round.endDate} onChange={(event) => updateRound(roundIndex, 'endDate', event.target.value)} required />
              </div>
              {roundIndex < rounds.length - 1 && <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-3"><Input label="Qualify top N (optional)" type="number" value={round.topN} onChange={(event) => updateRound(roundIndex, 'topN', event.target.value)} /><Input label="Minimum score (optional)" type="number" value={round.minimumScore} onChange={(event) => updateRound(roundIndex, 'minimumScore', event.target.value)} /><Input label="Minimum percentage (optional)" type="number" value={round.minimumPercentage} onChange={(event) => updateRound(roundIndex, 'minimumPercentage', event.target.value)} /></div>}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4"><h4 className="font-semibold text-gray-900">Round sections</h4><PrimaryButton type="button" variant="secondary" onClick={() => addRoundSection(roundIndex)}><Plus className="mr-2 h-4 w-4" />Add section</PrimaryButton></div>
              {round.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4 rounded-xl border border-gray-200 p-4">
                  <div className="flex justify-between"><p className="font-medium text-gray-900">Section {sectionIndex + 1}</p>{round.sections.length > 1 && <button type="button" onClick={() => removeRoundSection(roundIndex, sectionIndex)} className="text-sm text-red-600">Remove</button>}</div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4"><Input label="Name" value={section.name} onChange={(event) => updateRoundSection(roundIndex, sectionIndex, 'name', event.target.value)} required /><Input label="Duration (mins)" type="number" value={section.duration} onChange={(event) => updateRoundSection(roundIndex, sectionIndex, 'duration', event.target.value)} required /><Input label="Total marks" type="number" value={section.totalMarks} onChange={(event) => updateRoundSection(roundIndex, sectionIndex, 'totalMarks', event.target.value)} required /><Input label="Passing marks" type="number" value={section.passingMarks} onChange={(event) => updateRoundSection(roundIndex, sectionIndex, 'passingMarks', event.target.value)} required /></div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3"><span className="text-sm text-gray-600">{section.questions.length} question(s) selected</span><PrimaryButton type="button" variant="secondary" onClick={() => setModalRoundTarget({ roundIndex, sectionIndex })}>Select questions</PrimaryButton></div>
                </div>
              ))}
            </GlassCard>
          ))}
          {modalRoundTarget && <QuestionBankSelectorModal isOpen onClose={() => setModalRoundTarget(null)} selectedQuestionIds={rounds[modalRoundTarget.roundIndex]?.sections[modalRoundTarget.sectionIndex]?.questions || []} onSelectQuestions={(selectedIds) => updateRoundSection(modalRoundTarget.roundIndex, modalRoundTarget.sectionIndex, 'questions', selectedIds)} sectionName={rounds[modalRoundTarget.roundIndex]?.sections[modalRoundTarget.sectionIndex]?.name || 'Round section'} />}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div>
          {step > 0 && (
            <PrimaryButton type="button" variant="secondary" onClick={prev}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </PrimaryButton>
          )}
        </div>
        <div className="flex gap-4">
          <Link href="/admin/competitions">
            <PrimaryButton type="button" variant="ghost">
              <X className="w-4 h-4 mr-2" /> Cancel
            </PrimaryButton>
          </Link>
          {step < STEPS.length - 1 ? (
            <PrimaryButton type="button" onClick={next}>
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </PrimaryButton>
          ) : (
            <PrimaryButton type="button" onClick={handleSubmit} disabled={loading} isLoading={loading}>
              <Save className="w-4 h-4 mr-2" /> Create Competition
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
