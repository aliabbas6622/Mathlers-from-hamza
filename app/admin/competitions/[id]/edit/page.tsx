'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Input from '@/components/ui/Input';
import { ChevronRight, Save, Plus, Trash2 } from 'lucide-react';
import QuestionBankSelectorModal from '@/components/admin/competitions/QuestionBankSelectorModal';

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

interface CompetitionSectionResponse {
  name?: string;
  description?: string;
  settings?: Partial<Omit<SectionData, 'name' | 'description' | 'questions'>>;
  questions?: Array<string | { _id: string }>;
}

interface CompetitionResponse {
  name?: string;
  category?: string;
  description?: string;
  organizer?: string;
  contact?: string;
  language?: string;
  difficultyLevel?: string;
  status?: string;
  eligibility?: { type?: string; grades?: string[]; minAge?: number; maxAge?: number; maxParticipants?: number };
  registration?: { startDate?: string; endDate?: string; type?: string };
  schedule?: { competitionStartDate?: string; competitionEndDate?: string };
  rulebook?: string | { content?: string };
  prizeDetails?: string;
  sections?: CompetitionSectionResponse[];
  rounds?: Array<{ name?: string; type?: RoundData['type']; roundNumber?: number; schedule?: { startDate?: string; endDate?: string }; qualificationCriteria?: { topN?: number; minimumScore?: number; minimumPercentage?: number }; sections?: CompetitionSectionResponse[] }>;
}


export default function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const competitionId = resolvedParams.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [modalSectionIdx, setModalSectionIdx] = useState<number | null>(null);
  const [modalRoundTarget, setModalRoundTarget] = useState<{ roundIndex: number; sectionIndex: number } | null>(null);

  const [formData, setFormData] = useState({
    name: '', category: 'public', description: '', organizer: '', contact: '',
    language: 'English', difficultyLevel: 'intermediate', status: 'draft',
    eligibilityType: 'public', grades: [] as string[], minAge: '', maxAge: '', maxParticipants: '500',
    registrationStartDate: '', registrationEndDate: '',
    competitionStartDate: '', competitionEndDate: '', registrationType: 'automatic',
    rulebookContent: '', prizeDetails: '',
  });

  const [sections, setSections] = useState<SectionData[]>([]);
  const [rounds, setRounds] = useState<RoundData[]>([]);

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const res = await fetch(`/api/admin/competitions/${competitionId}`);
        if (!res.ok) throw new Error('Failed to fetch competition');
        const comp: CompetitionResponse = await res.json();

        setFormData({
          name: comp.name || '',
          category: comp.category || 'public',
          description: comp.description || '',
          organizer: comp.organizer || '',
          contact: comp.contact || '',
          language: comp.language || 'English',
          difficultyLevel: comp.difficultyLevel || 'intermediate',
          status: comp.status || 'draft',
          eligibilityType: comp.eligibility?.type || 'public',
          grades: comp.eligibility?.grades || [],
          minAge: comp.eligibility?.minAge ? String(comp.eligibility.minAge) : '',
          maxAge: comp.eligibility?.maxAge ? String(comp.eligibility.maxAge) : '',
          maxParticipants: comp.eligibility?.maxParticipants ? String(comp.eligibility.maxParticipants) : '500',
          registrationStartDate: comp.registration?.startDate ? new Date(comp.registration.startDate).toISOString().slice(0, 16) : '',
          registrationEndDate: comp.registration?.endDate ? new Date(comp.registration.endDate).toISOString().slice(0, 16) : '',
          competitionStartDate: comp.schedule?.competitionStartDate ? new Date(comp.schedule.competitionStartDate).toISOString().slice(0, 16) : '',
          competitionEndDate: comp.schedule?.competitionEndDate ? new Date(comp.schedule.competitionEndDate).toISOString().slice(0, 16) : '',
          registrationType: comp.registration?.type || 'automatic',
          rulebookContent: typeof comp.rulebook === 'object' ? comp.rulebook?.content || '' : comp.rulebook || '',
          prizeDetails: comp.prizeDetails || '',
        });

        if (comp.sections && comp.sections.length > 0) {
          setSections(comp.sections.map((s) => ({
            name: s.name || 'Section',
            description: s.description || '',
            duration: String(s.settings?.duration || 30),
            totalMarks: String(s.settings?.totalMarks || 100),
            passingMarks: String(s.settings?.passingMarks || 40),
            negativeMarking: !!s.settings?.negativeMarking,
            negativeMarkValue: String(s.settings?.negativeMarkValue || 0),
            shuffleQuestions: s.settings?.shuffleQuestions ?? true,
            shuffleOptions: s.settings?.shuffleOptions ?? true,
            calculatorAllowed: !!s.settings?.calculatorAllowed,
            skipAllowed: s.settings?.skipAllowed ?? true,
            reviewAllowed: s.settings?.reviewAllowed ?? true,
            questions: (s.questions || []).map((q) => typeof q === 'object' ? q._id : q),
          })));
        } else {
          setSections([{
            name: 'Section 1', description: '', duration: '30', totalMarks: '100', passingMarks: '40',
            negativeMarking: false, negativeMarkValue: '0', shuffleQuestions: true, shuffleOptions: true,
            calculatorAllowed: false, skipAllowed: true, reviewAllowed: true, questions: [],
          }]);
        }
        setRounds((comp.rounds || []).map((round) => ({
          name: round.name || 'Round', type: round.type || 'custom',
          startDate: round.schedule?.startDate ? new Date(round.schedule.startDate).toISOString().slice(0, 16) : '',
          endDate: round.schedule?.endDate ? new Date(round.schedule.endDate).toISOString().slice(0, 16) : '',
          topN: round.qualificationCriteria?.topN ? String(round.qualificationCriteria.topN) : '',
          minimumScore: round.qualificationCriteria?.minimumScore ? String(round.qualificationCriteria.minimumScore) : '',
          minimumPercentage: round.qualificationCriteria?.minimumPercentage ? String(round.qualificationCriteria.minimumPercentage) : '',
          sections: (round.sections || []).map((section) => ({
            name: section.name || 'Section', description: section.description || '', duration: String(section.settings?.duration || 30), totalMarks: String(section.settings?.totalMarks || 100), passingMarks: String(section.settings?.passingMarks || 40), negativeMarking: !!section.settings?.negativeMarking, negativeMarkValue: String(section.settings?.negativeMarkValue || 0), shuffleQuestions: section.settings?.shuffleQuestions ?? true, shuffleOptions: section.settings?.shuffleOptions ?? true, calculatorAllowed: !!section.settings?.calculatorAllowed, skipAllowed: section.settings?.skipAllowed ?? true, reviewAllowed: section.settings?.reviewAllowed ?? true, questions: (section.questions || []).map((question) => typeof question === 'object' ? question._id : question),
          })),
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch competition');
      } finally {
        setFetching(false);
      }
    };

    fetchCompetition();
  }, [competitionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (idx: number, field: string, value: string | boolean | string[]) => {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addSection = () => {
    setSections(prev => [...prev, {
      name: `Section ${prev.length + 1}`, description: '', duration: '30', totalMarks: '100', passingMarks: '40',
      negativeMarking: false, negativeMarkValue: '0', shuffleQuestions: true, shuffleOptions: true,
      calculatorAllowed: false, skipAllowed: true, reviewAllowed: true, questions: [],
    }]);
  };

  const removeSection = (idx: number) => {
    if (sections.length > 1) setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRound = (roundIndex: number, field: keyof Omit<RoundData, 'sections'>, value: string) => setRounds(prev => prev.map((round, index) => index === roundIndex ? { ...round, [field]: value } : round));
  const updateRoundSection = (roundIndex: number, sectionIndex: number, field: string, value: string | boolean | string[]) => setRounds(prev => prev.map((round, index) => index === roundIndex ? { ...round, sections: round.sections.map((section, current) => current === sectionIndex ? { ...section, [field]: value } : section) } : round));
  const addRound = () => setRounds(prev => [...prev, { name: `Round ${prev.length + 1}`, type: 'custom', startDate: '', endDate: '', topN: '', minimumScore: '', minimumPercentage: '', sections: [{ name: 'Section 1', description: '', duration: '30', totalMarks: '100', passingMarks: '40', negativeMarking: false, negativeMarkValue: '0', shuffleQuestions: true, shuffleOptions: true, calculatorAllowed: false, skipAllowed: true, reviewAllowed: true, questions: [] }] }]);
  const removeRound = (roundIndex: number) => { if (rounds.length > 1) setRounds(prev => prev.filter((_, index) => index !== roundIndex)); };
  const addRoundSection = (roundIndex: number) => setRounds(prev => prev.map((round, index) => index === roundIndex ? { ...round, sections: [...round.sections, { name: `Section ${round.sections.length + 1}`, description: '', duration: '30', totalMarks: '100', passingMarks: '40', negativeMarking: false, negativeMarkValue: '0', shuffleQuestions: true, shuffleOptions: true, calculatorAllowed: false, skipAllowed: true, reviewAllowed: true, questions: [] }] } : round));
  const removeRoundSection = (roundIndex: number, sectionIndex: number) => setRounds(prev => prev.map((round, index) => index === roundIndex && round.sections.length > 1 ? { ...round, sections: round.sections.filter((_, current) => current !== sectionIndex) } : round));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const body = {
        ...formData,
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
          name: round.name, type: round.type, roundNumber: roundIndex + 1, schedule: { startDate: round.startDate, endDate: round.endDate },
          qualificationCriteria: { topN: round.topN, minimumScore: round.minimumScore, minimumPercentage: round.minimumPercentage },
          sections: round.sections.map((section, sectionIndex) => ({ name: section.name, description: section.description, order: sectionIndex, questions: section.questions || [], settings: { duration: Number(section.duration), totalMarks: Number(section.totalMarks), passingMarks: Number(section.passingMarks), negativeMarking: section.negativeMarking, negativeMarkValue: Number(section.negativeMarkValue), shuffleQuestions: section.shuffleQuestions, shuffleOptions: section.shuffleOptions, calculatorAllowed: section.calculatorAllowed, skipAllowed: section.skipAllowed, reviewAllowed: section.reviewAllowed } })),
        })) : [],
      };

      const res = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update competition');
      }

      window.location.href = `/admin/competitions/${competitionId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update competition');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-gray-500">Loading competition editor...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center text-sm text-gray-500">
        <Link href="/admin" className="hover:text-brand-primary">Admin</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/admin/competitions" className="hover:text-brand-primary">Competitions</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Edit {formData.name}</span>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Edit Competition</h1>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 outline-none"
        >
          <option value="draft">Draft</option>
          <option value="registration_open">Registration Open</option>
          <option value="registration_closed">Registration Closed</option>
          <option value="in_progress">In Progress (Live)</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

      <GlassCard className="p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Basic Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
          <label className="block text-sm font-medium text-gray-700">Category<select name="category" value={formData.category} onChange={handleChange} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900"><option value="public">Public</option><option value="grade">Grade</option><option value="championship">Championship (multi-round)</option></select></label>
          <Input label="Organizer" name="organizer" value={formData.organizer} onChange={handleChange} required />
          <Input label="Contact" name="contact" value={formData.contact} onChange={handleChange} required />
          <Input label="Max Participants" type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} required />
          <div className="w-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
              className="glass-input w-full px-4 py-3 text-gray-900 rounded-xl border border-gray-200 outline-none" />
          </div>
        </div>
      </GlassCard>

      {/* Sections & Question Bank Selector */}
      {formData.category !== 'championship' && <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Sections & Questions</h2>
          <PrimaryButton type="button" variant="secondary" onClick={addSection}>
            <Plus className="w-4 h-4 mr-2" /> Add Section
          </PrimaryButton>
        </div>

        {sections.map((sec, idx) => (
          <GlassCard key={idx} className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">Section {idx + 1}</h3>
              {sections.length > 1 && (
                <button type="button" onClick={() => removeSection(idx)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Section Name" value={sec.name} onChange={e => handleSectionChange(idx, 'name', e.target.value)} required />
              <Input label="Duration (mins)" type="number" value={sec.duration} onChange={e => handleSectionChange(idx, 'duration', e.target.value)} required />
              <Input label="Total Marks" type="number" value={sec.totalMarks} onChange={e => handleSectionChange(idx, 'totalMarks', e.target.value)} required />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-900">Question Bank Assignment</p>
                <p className="text-xs text-gray-500">{sec.questions.length} question(s) assigned to this section</p>
              </div>
              <PrimaryButton type="button" variant="secondary" onClick={() => setModalSectionIdx(idx)}>
                Manage Questions ({sec.questions.length})
              </PrimaryButton>
            </div>
          </GlassCard>
        ))}
      </div>}

      {formData.category === 'championship' && <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-gray-900">Championship rounds</h2><p className="mt-1 text-sm text-gray-500">Qualification rules on each non-final round control access to the next one.</p></div><PrimaryButton type="button" variant="secondary" onClick={addRound}><Plus className="mr-2 h-4 w-4" />Add round</PrimaryButton></div>
        {rounds.map((round, roundIndex) => <GlassCard key={roundIndex} className="space-y-5 p-6">
          <div className="flex items-center justify-between"><h3 className="font-bold text-gray-900">Round {roundIndex + 1}</h3>{rounds.length > 1 && <button type="button" onClick={() => removeRound(roundIndex)} className="text-red-600">Remove</button>}</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Input label="Round name" value={round.name} onChange={(event) => updateRound(roundIndex, 'name', event.target.value)} required /><label className="block text-sm font-medium text-gray-700">Round type<select value={round.type} onChange={(event) => updateRound(roundIndex, 'type', event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5"><option value="qualifier">Qualifier</option><option value="quarter_final">Quarter-final</option><option value="semi_final">Semi-final</option><option value="final">Final</option><option value="custom">Custom</option></select></label><Input label="Round starts" type="datetime-local" value={round.startDate} onChange={(event) => updateRound(roundIndex, 'startDate', event.target.value)} required /><Input label="Round ends" type="datetime-local" value={round.endDate} onChange={(event) => updateRound(roundIndex, 'endDate', event.target.value)} required /></div>
          {roundIndex < rounds.length - 1 && <div className="grid grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 md:grid-cols-3"><Input label="Qualify top N (optional)" type="number" value={round.topN} onChange={(event) => updateRound(roundIndex, 'topN', event.target.value)} /><Input label="Minimum score (optional)" type="number" value={round.minimumScore} onChange={(event) => updateRound(roundIndex, 'minimumScore', event.target.value)} /><Input label="Minimum percentage (optional)" type="number" value={round.minimumPercentage} onChange={(event) => updateRound(roundIndex, 'minimumPercentage', event.target.value)} /></div>}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4"><h4 className="font-semibold">Round sections</h4><PrimaryButton type="button" variant="secondary" onClick={() => addRoundSection(roundIndex)}><Plus className="mr-2 h-4 w-4" />Add section</PrimaryButton></div>
          {round.sections.map((section, sectionIndex) => <div key={sectionIndex} className="space-y-4 rounded-xl border border-gray-200 p-4"><div className="flex justify-between"><p className="font-medium">Section {sectionIndex + 1}</p>{round.sections.length > 1 && <button type="button" onClick={() => removeRoundSection(roundIndex, sectionIndex)} className="text-sm text-red-600">Remove</button>}</div><div className="grid grid-cols-1 gap-4 md:grid-cols-4"><Input label="Name" value={section.name} onChange={(event) => updateRoundSection(roundIndex, sectionIndex, 'name', event.target.value)} required /><Input label="Duration" type="number" value={section.duration} onChange={(event) => updateRoundSection(roundIndex, sectionIndex, 'duration', event.target.value)} required /><Input label="Total marks" type="number" value={section.totalMarks} onChange={(event) => updateRoundSection(roundIndex, sectionIndex, 'totalMarks', event.target.value)} required /><Input label="Passing marks" type="number" value={section.passingMarks} onChange={(event) => updateRoundSection(roundIndex, sectionIndex, 'passingMarks', event.target.value)} required /></div><div className="flex items-center justify-between rounded-xl bg-gray-50 p-3"><span className="text-sm text-gray-600">{section.questions.length} question(s) selected</span><PrimaryButton type="button" variant="secondary" onClick={() => setModalRoundTarget({ roundIndex, sectionIndex })}>Select questions</PrimaryButton></div></div>)}
        </GlassCard>)}
      </div>}

      {modalSectionIdx !== null && (
        <QuestionBankSelectorModal
          isOpen={modalSectionIdx !== null}
          onClose={() => setModalSectionIdx(null)}
          selectedQuestionIds={sections[modalSectionIdx]?.questions || []}
          onSelectQuestions={(selectedIds) => handleSectionChange(modalSectionIdx, 'questions', selectedIds)}
          sectionName={sections[modalSectionIdx]?.name || `Section ${modalSectionIdx + 1}`}
        />
      )}
      {modalRoundTarget && <QuestionBankSelectorModal isOpen onClose={() => setModalRoundTarget(null)} selectedQuestionIds={rounds[modalRoundTarget.roundIndex]?.sections[modalRoundTarget.sectionIndex]?.questions || []} onSelectQuestions={(selectedIds) => updateRoundSection(modalRoundTarget.roundIndex, modalRoundTarget.sectionIndex, 'questions', selectedIds)} sectionName={rounds[modalRoundTarget.roundIndex]?.sections[modalRoundTarget.sectionIndex]?.name || 'Round section'} />}

      <div className="flex justify-end gap-4 pt-4">
        <Link href={`/admin/competitions/${competitionId}`}>
          <PrimaryButton variant="ghost">Cancel</PrimaryButton>
        </Link>
        <PrimaryButton onClick={handleSubmit} isLoading={loading} disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </PrimaryButton>
      </div>
    </div>
  );
}
