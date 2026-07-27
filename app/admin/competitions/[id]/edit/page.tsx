'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Input from '@/components/ui/Input';
import { ChevronRight, ChevronLeft, Save, X, Plus, Trash2, Check } from 'lucide-react';
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

export default function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const competitionId = resolvedParams.id;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [modalSectionIdx, setModalSectionIdx] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '', category: 'public', description: '', organizer: '', contact: '',
    language: 'English', difficultyLevel: 'intermediate', status: 'draft',
    eligibilityType: 'public', grades: [] as string[], minAge: '', maxAge: '', maxParticipants: '500',
    registrationStartDate: '', registrationEndDate: '',
    competitionStartDate: '', competitionEndDate: '', registrationType: 'automatic',
    rulebookContent: '', prizeDetails: '',
  });

  const [sections, setSections] = useState<SectionData[]>([]);

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const res = await fetch(`/api/admin/competitions/${competitionId}`);
        if (!res.ok) throw new Error('Failed to fetch competition');
        const comp = await res.json();

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
          rulebookContent: typeof comp.rulebook === 'object' ? comp.rulebook?.content : comp.rulebook || '',
          prizeDetails: comp.prizeDetails || '',
        });

        if (comp.sections && comp.sections.length > 0) {
          setSections(comp.sections.map((s: any) => ({
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
            questions: (s.questions || []).map((q: any) => typeof q === 'object' ? q._id : q),
          })));
        } else {
          setSections([{
            name: 'Section 1', description: '', duration: '30', totalMarks: '100', passingMarks: '40',
            negativeMarking: false, negativeMarkValue: '0', shuffleQuestions: true, shuffleOptions: true,
            calculatorAllowed: false, skipAllowed: true, reviewAllowed: true, questions: [],
          }]);
        }
      } catch (err: any) {
        setError(err.message);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const body = {
        ...formData,
        maxParticipants: Number(formData.maxParticipants),
        sections: sections.map((s, i) => ({
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
    } catch (err: any) {
      setError(err.message);
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
      <div className="space-y-6">
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
      </div>

      {modalSectionIdx !== null && (
        <QuestionBankSelectorModal
          isOpen={modalSectionIdx !== null}
          onClose={() => setModalSectionIdx(null)}
          selectedQuestionIds={sections[modalSectionIdx]?.questions || []}
          onSelectQuestions={(selectedIds) => handleSectionChange(modalSectionIdx, 'questions', selectedIds)}
          sectionName={sections[modalSectionIdx]?.name || `Section ${modalSectionIdx + 1}`}
        />
      )}

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
