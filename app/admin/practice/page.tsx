'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, Clock, FilePlus2, Plus, Trash2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';
import PrimaryButton from '@/components/ui/PrimaryButton';

type Lookup = { _id: string; name: string };
type Question = { _id: string; question: string; subject: Lookup; grade: Lookup; chapter?: Lookup; topic?: Lookup; difficulty: 'easy' | 'medium' | 'hard'; marks: number };
type Section = { name: string; instructions: string; subject: string; grade: string; chapter: string; topic: string; questions: string[] };
type PracticeBook = { _id: string; name: string; description?: string; type: string; difficulty: string; questions: string[]; sections: Section[]; timeLimit: number; attemptsAllowed: number; isPublished: boolean; availability: { startDate: string; endDate: string } };

const today = () => new Date().toISOString().slice(0, 10);
const inThirtyDays = () => new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const blankSection = (): Section => ({ name: '', instructions: '', subject: '', grade: '', chapter: '', topic: '', questions: [] });

export default function AdminPracticePage() {
  const [books, setBooks] = useState<PracticeBook[]>([]);
  const [subjects, setSubjects] = useState<Lookup[]>([]);
  const [grades, setGrades] = useState<Lookup[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', description: '', type: 'mixed_practice', difficulty: 'medium', timeLimit: 1800, attemptsAllowed: 3, startDate: today(), endDate: inThirtyDays(), isPublished: false, sections: [blankSection()] });

  const load = useCallback(async () => {
    const [bookResponse, subjectResponse, gradeResponse, questionResponse] = await Promise.all([
      fetch('/api/admin/practice'), fetch('/api/public/subjects'), fetch('/api/public/grades'), fetch('/api/admin/questions?limit=100&status=active'),
    ]);
    const [bookData, subjectData, gradeData, questionData] = await Promise.all([bookResponse.json(), subjectResponse.json(), gradeResponse.json(), questionResponse.json()]);
    if (bookData.success) setBooks(bookData.data);
    if (subjectData.success) setSubjects(subjectData.data);
    if (gradeData.success) setGrades(gradeData.data);
    if (questionData.success) setQuestions(questionData.data);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateSection = (index: number, changes: Partial<Section>) => {
    setForm((current) => ({ ...current, sections: current.sections.map((section, itemIndex) => itemIndex === index ? { ...section, ...changes } : section) }));
  };

  const selectedQuestions = (section: Section) => questions.filter((question) => question.subject?._id === section.subject && question.grade?._id === section.grade);
  const toggleQuestion = (index: number, id: string) => {
    const section = form.sections[index];
    updateSection(index, { questions: section.questions.includes(id) ? section.questions.filter((questionId) => questionId !== id) : [...section.questions, id] });
  };

  const createBook = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const response = await fetch('/api/admin/practice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Unable to create practice book');
      setOpen(false);
      setForm({ name: '', description: '', type: 'mixed_practice', difficulty: 'medium', timeLimit: 1800, attemptsAllowed: 3, startDate: today(), endDate: inThirtyDays(), isPublished: false, sections: [blankSection()] });
      setNotice('Practice book created.');
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to create practice book');
    } finally { setSaving(false); }
  };

  const setPublished = async (book: PracticeBook) => {
    const response = await fetch(`/api/admin/practice/${book._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublished: !book.isPublished }) });
    const data = await response.json();
    setNotice(data.success ? `${book.name} is now ${book.isPublished ? 'a draft' : 'published'}.` : data.error || 'Unable to update book');
    if (data.success) await load();
  };

  const removeBook = async (book: PracticeBook) => {
    if (!confirm(`Delete ${book.name}? Student results already recorded will remain.`)) return;
    const response = await fetch(`/api/admin/practice/${book._id}`, { method: 'DELETE' });
    const data = await response.json();
    setNotice(data.success ? 'Practice book deleted.' : data.error || 'Unable to delete book');
    if (data.success) await load();
  };

  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Practice operations</p><h1 className="mt-1 text-3xl font-bold text-gray-950">Practice books</h1><p className="mt-2 text-gray-600">Build Mathlers practice tasks from question-bank sections, then publish them when they are ready.</p></div>
      <PrimaryButton onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Create book</PrimaryButton>
    </div>
    {notice && <div className="flex items-center justify-between rounded-lg border border-brand-primary/20 bg-brand-lighter/40 px-4 py-3 text-sm text-gray-800"><span>{notice}</span><button onClick={() => setNotice('')} className="font-semibold text-brand-primary">Dismiss</button></div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {books.map((book) => <GlassCard key={book._id} className="flex min-h-64 flex-col p-5">
        <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-gray-950">{book.name}</h2><p className="mt-1 text-sm text-gray-600">{book.description || 'No description'}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${book.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{book.isPublished ? 'Published' : 'Draft'}</span></div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-gray-600"><div><strong className="block text-base text-gray-950">{book.sections?.length || 0}</strong>Sections</div><div><strong className="block text-base text-gray-950">{book.questions?.length || 0}</strong>Questions</div><div><strong className="block text-base text-gray-950">{Math.round(book.timeLimit / 60)}</strong>Minutes</div></div>
        <div className="mt-auto flex gap-2 pt-5"><button onClick={() => void setPublished(book)} className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{book.isPublished ? 'Unpublish' : 'Publish'}</button><button onClick={() => void removeBook(book)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" title="Delete practice book" aria-label={`Delete ${book.name}`}><Trash2 className="h-4 w-4" /></button></div>
      </GlassCard>)}
      {!books.length && <div className="col-span-full border-y border-gray-200 py-16 text-center text-gray-500"><BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" /><p>No practice books yet. Create one from the question bank.</p></div>}
    </div>
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Create practice book" size="xl">
      <form onSubmit={createBook} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-gray-700">Book name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-brand-primary" placeholder="Algebra foundations" /></label><label className="text-sm font-semibold text-gray-700">Practice type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="chapter_practice">Chapter practice</option><option value="revision_practice">Revision practice</option><option value="speed_practice">Speed practice</option><option value="mixed_practice">Mixed practice</option></select></label></div>
        <label className="block text-sm font-semibold text-gray-700">Student instructions<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1.5 min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2.5" placeholder="What should students focus on?" /></label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm font-semibold text-gray-700">Difficulty<select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label className="text-sm font-semibold text-gray-700">Time (minutes)<input type="number" min="1" value={form.timeLimit / 60} onChange={(event) => setForm({ ...form, timeLimit: Number(event.target.value) * 60 })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-semibold text-gray-700">Attempts<input type="number" min="1" value={form.attemptsAllowed} onChange={(event) => setForm({ ...form, attemptsAllowed: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="mt-6 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} className="h-4 w-4 accent-brand-primary" />Publish now</label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-gray-700">Available from<input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label><label className="text-sm font-semibold text-gray-700">Available until<input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5" /></label></div>
        <section className="space-y-4 border-t border-gray-200 pt-5"><div className="flex items-center justify-between"><div><h3 className="font-bold text-gray-950">Book sections</h3><p className="text-sm text-gray-600">Each section can import questions from a different Mathlers subject and grade.</p></div><button type="button" onClick={() => setForm({ ...form, sections: [...form.sections, blankSection()] })} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Plus className="h-4 w-4" />Section</button></div>
          {form.sections.map((section, index) => <div key={index} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/60 p-4"><div className="flex items-center justify-between gap-3"><label className="flex-1 text-sm font-semibold text-gray-700">Section {index + 1} name<input required value={section.name} onChange={(event) => updateSection(index, { name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5" placeholder="Linear equations" /></label>{form.sections.length > 1 && <button type="button" onClick={() => setForm({ ...form, sections: form.sections.filter((_, itemIndex) => itemIndex !== index) })} className="mt-6 h-10 w-10 rounded-lg text-red-600 hover:bg-red-50" aria-label={`Remove section ${index + 1}`}><Trash2 className="mx-auto h-4 w-4" /></button>}</div>
            <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-gray-700">Subject<select required value={section.subject} onChange={(event) => updateSection(index, { subject: event.target.value, questions: [] })} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"><option value="">Select subject</option>{subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}</select></label><label className="text-sm font-semibold text-gray-700">Grade<select required value={section.grade} onChange={(event) => updateSection(index, { grade: event.target.value, questions: [] })} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"><option value="">Select grade</option>{grades.map((grade) => <option key={grade._id} value={grade._id}>{grade.name}</option>)}</select></label></div>
            <label className="block text-sm font-semibold text-gray-700">Section guidance<textarea value={section.instructions} onChange={(event) => updateSection(index, { instructions: event.target.value })} className="mt-1.5 min-h-16 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5" placeholder="Optional directions for this section" /></label>
            <div className="rounded-lg border border-gray-200 bg-white"><div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 text-sm"><span className="font-semibold text-gray-800">Question bank</span><span className="text-gray-500">{section.questions.length} selected</span></div><div className="max-h-52 overflow-y-auto p-2">{!section.subject || !section.grade ? <p className="px-2 py-4 text-sm text-gray-500">Select a subject and grade to load matching questions.</p> : selectedQuestions(section).map((question) => <label key={question._id} className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-gray-50"><input type="checkbox" checked={section.questions.includes(question._id)} onChange={() => toggleQuestion(index, question._id)} className="mt-1 h-4 w-4 accent-brand-primary" /><span className="min-w-0"><span className="block text-sm text-gray-800">{question.question}</span><span className="mt-0.5 block text-xs text-gray-500">{question.difficulty} · {question.marks} mark{question.marks === 1 ? '' : 's'}</span></span></label>)}{section.subject && section.grade && !selectedQuestions(section).length && <p className="px-2 py-4 text-sm text-gray-500">No active questions match this subject and grade.</p>}</div></div>
          </div>)}
        </section>
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700">Cancel</button><button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><FilePlus2 className="h-4 w-4" />{saving ? 'Creating...' : 'Create practice book'}</button></div>
      </form>
    </Modal>
  </div>;
}
