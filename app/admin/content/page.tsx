'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BookOpen, Check, Pencil, Plus, Tags, Trash2, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';

type Subject = { _id: string; name: string; code: string; grades?: Grade[]; description?: string; color?: string; order: number; isActive: boolean };
type Grade = { _id: string; name: string };
type Chapter = { _id: string; name: string; grade: { _id: string }; subject: { _id: string } };
type Subtopic = { _id?: string; name: string; code?: string };
type Topic = {
  _id: string; name: string; code: string; description?: string; grade: string | { _id: string; name: string };
  chapter: string | { _id: string; name: string }; subject: string | { _id: string; name: string };
  subjects?: Array<{ _id: string; name: string }>; subtopics: Subtopic[]; order: number; isActive: boolean;
};

const emptySubject = { name: '', code: '', grades: [] as string[], description: '', color: '#C1121F', order: 0, isActive: true };
const emptyTopic = { name: '', code: '', description: '', grade: '', chapter: '', subjects: [] as string[], subtopics: [] as Subtopic[], order: 0, isActive: true };
const api = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Request failed');
  return data;
};
const idOf = (value: string | { _id: string }) => typeof value === 'string' ? value : value._id;
const inputClass = 'mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500';
const inlineInputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500';
const modalFooterClass = 'sticky bottom-0 -mx-5 -mb-5 mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6';
const modalButtonClass = 'inline-flex min-h-11 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-primary/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-28';

function ModalField({ label, htmlFor, helper, children }: { label: string; htmlFor: string; helper?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-800">{label}</label>
      {children}
      {helper && <p className="mt-1.5 text-xs leading-5 text-gray-500">{helper}</p>}
    </div>
  );
}

export default function ContentPage() {
  const [section, setSection] = useState<'subjects' | 'topics'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectForm, setSubjectForm] = useState(emptySubject);
  const [topicForm, setTopicForm] = useState(emptyTopic);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [subjectModal, setSubjectModal] = useState(false);
  const [topicModal, setTopicModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const [subjectData, gradeData, topicData] = await Promise.all([
        api('/api/admin/subjects'), api('/api/public/grades'), api('/api/admin/topics'),
      ]);
      setSubjects(subjectData.data);
      setGrades(gradeData.data);
      setTopics(topicData.data);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load curriculum'); }
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const loadChapters = useCallback(async (grade: string, subject: string) => {
    if (!grade || !subject) return setChapters([]);
    try { setChapters((await api(`/api/admin/chapters?grade=${grade}&subject=${subject}`)).data); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load chapters'); }
  }, []);

  const openSubject = (subject?: Subject) => {
    setEditingSubject(subject || null);
    setSubjectForm(subject ? { name: subject.name, code: subject.code, grades: subject.grades?.map((grade) => grade._id) || [], description: subject.description || '', color: subject.color || '#C1121F', order: subject.order, isActive: subject.isActive } : emptySubject);
    setSubjectModal(true);
  };
  const openTopic = (topic?: Topic) => {
    setEditingTopic(topic || null);
    const linkedSubjects = topic?.subjects?.map((subject) => subject._id) || (topic ? [idOf(topic.subject)] : []);
    const form = topic ? {
      name: topic.name, code: topic.code, description: topic.description || '', grade: idOf(topic.grade), chapter: idOf(topic.chapter),
      subjects: linkedSubjects, subtopics: topic.subtopics || [], order: topic.order, isActive: topic.isActive,
    } : emptyTopic;
    setTopicForm(form);
    void loadChapters(form.grade, form.subjects[0] || '');
    setTopicModal(true);
  };

  const saveSubject = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      await api(editingSubject ? `/api/admin/subjects/${editingSubject._id}` : '/api/admin/subjects', {
        method: editingSubject ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(subjectForm),
      });
      setSubjectModal(false); setMessage(`Subject ${editingSubject ? 'updated' : 'created'}.`); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save subject'); }
    finally { setSaving(false); }
  };
  const saveTopic = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    try {
      await api(editingTopic ? `/api/admin/topics/${editingTopic._id}` : '/api/admin/topics', {
        method: editingTopic ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(topicForm),
      });
      setTopicModal(false); setMessage(`Topic ${editingTopic ? 'updated' : 'created'}.`); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save topic'); }
    finally { setSaving(false); }
  };
  const remove = async (type: 'subjects' | 'topics', id: string) => {
    if (!window.confirm(`Delete this ${type === 'subjects' ? 'subject' : 'topic'}? This only works when it is not used by the question bank.`)) return;
    try { await api(`/api/admin/${type}/${id}`, { method: 'DELETE' }); setMessage('Deleted.'); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to delete item'); }
  };
  const toggleSubject = (id: string) => setTopicForm((form) => {
    const subjects = form.subjects.includes(id) ? form.subjects.filter((value) => value !== id) : [...form.subjects, id];
    void loadChapters(form.grade, subjects[0] || '');
    return { ...form, subjects, chapter: '' };
  });
  const toggleSubjectGrade = (id: string) => setSubjectForm((form) => ({ ...form, grades: form.grades.includes(id) ? form.grades.filter((value) => value !== id) : [...form.grades, id] }));
  const setTopicGrade = (grade: string) => {
    setTopicForm((form) => {
      const available = subjects.filter((subject) => !grade || !subject.grades?.length || subject.grades.some((item) => item._id === grade)).map((subject) => subject._id);
      const linkedSubjects = form.subjects.filter((subject) => available.includes(subject));
      void loadChapters(grade, linkedSubjects[0] || '');
      return { ...form, grade, chapter: '', subjects: linkedSubjects };
    });
  };
  const setSubtopic = (index: number, field: keyof Subtopic, value: string) => setTopicForm((form) => ({ ...form, subtopics: form.subtopics.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-5 border-b border-gray-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Question bank structure</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-950">Subjects & topics</h1>
          <p className="mt-2 max-w-2xl text-gray-600">Build the taxonomy used when authors create and upload questions.</p>
        </div>
        <button onClick={() => section === 'subjects' ? openSubject() : openTopic()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-dark">
          <Plus className="h-4 w-4" /> Add {section === 'subjects' ? 'subject' : 'topic'}
        </button>
      </div>

      <div className="flex w-fit gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button onClick={() => setSection('subjects')} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${section === 'subjects' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600'}`}><BookOpen className="h-4 w-4" /> Subjects ({subjects.length})</button>
        <button onClick={() => setSection('topics')} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${section === 'topics' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600'}`}><Tags className="h-4 w-4" /> Topics ({topics.length})</button>
      </div>

      {message && <div className="flex items-center justify-between rounded-lg border border-brand-primary/20 bg-brand-lighter/40 px-4 py-3 text-sm text-gray-800"><span>{message}</span><button onClick={() => setMessage('')} aria-label="Dismiss message"><X className="h-4 w-4" /></button></div>}

      {section === 'subjects' ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="grid grid-cols-[minmax(180px,1.2fr)_100px_minmax(160px,1fr)_minmax(180px,1.4fr)_100px_110px] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500"><span>Subject</span><span>Code</span><span>Grades</span><span>Description</span><span>Status</span><span className="text-right">Actions</span></div>
          {subjects.map((subject) => <div key={subject._id} className="grid grid-cols-[minmax(180px,1.2fr)_100px_minmax(160px,1fr)_minmax(180px,1.4fr)_100px_110px] items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-0">
            <div className="flex min-w-0 items-center gap-3"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: subject.color || '#C1121F' }} /><span className="truncate font-semibold text-gray-950">{subject.name}</span></div>
            <span className="font-mono text-sm text-gray-600">{subject.code}</span>
            <span className="truncate text-sm text-gray-600">{subject.grades?.length ? subject.grades.map((grade) => grade.name).join(', ') : 'All grades'}</span>
            <span className="truncate text-sm text-gray-600">{subject.description || 'No description'}</span>
            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${subject.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{subject.isActive ? 'Active' : 'Hidden'}</span>
            <div className="flex justify-end gap-1"><button onClick={() => openSubject(subject)} className="rounded-md p-2 text-gray-600 hover:bg-gray-100" aria-label={`Edit ${subject.name}`}><Pencil className="h-4 w-4" /></button><button onClick={() => void remove('subjects', subject._id)} className="rounded-md p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${subject.name}`}><Trash2 className="h-4 w-4" /></button></div>
          </div>)}
          {!subjects.length && <div className="px-5 py-16 text-center text-sm text-gray-500">No subjects yet. Add the first one to begin organizing the question bank.</div>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="grid grid-cols-[minmax(180px,1.2fr)_minmax(170px,1fr)_minmax(140px,0.8fr)_minmax(170px,1fr)_100px] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500"><span>Topic</span><span>Subjects</span><span>Grade</span><span>Subtopics</span><span className="text-right">Actions</span></div>
          {topics.map((topic) => <div key={topic._id} className="grid grid-cols-[minmax(180px,1.2fr)_minmax(170px,1fr)_minmax(140px,0.8fr)_minmax(170px,1fr)_100px] items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-0">
            <div><p className="font-semibold text-gray-950">{topic.name}</p><p className="mt-1 font-mono text-xs text-gray-500">{topic.code}</p></div>
            <div className="flex flex-wrap gap-1">{(topic.subjects?.length ? topic.subjects : [topic.subject]).map((subject) => <span key={idOf(subject)} className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{typeof subject === 'string' ? 'Subject' : subject.name}</span>)}</div>
            <span className="text-sm text-gray-600">{typeof topic.grade === 'string' ? 'Grade' : topic.grade.name}</span>
            <div className="flex flex-wrap gap-1">{topic.subtopics?.length ? topic.subtopics.map((subtopic) => <span key={subtopic._id || subtopic.name} className="rounded-md bg-brand-lighter/60 px-2 py-1 text-xs font-medium text-brand-dark">{subtopic.name}</span>) : <span className="text-sm text-gray-500">None</span>}</div>
            <div className="flex justify-end gap-1"><button onClick={() => openTopic(topic)} className="rounded-md p-2 text-gray-600 hover:bg-gray-100" aria-label={`Edit ${topic.name}`}><Pencil className="h-4 w-4" /></button><button onClick={() => void remove('topics', topic._id)} className="rounded-md p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${topic.name}`}><Trash2 className="h-4 w-4" /></button></div>
          </div>)}
          {!topics.length && <div className="px-5 py-16 text-center text-sm text-gray-500">No topics yet. Create a topic, connect its subjects, then add its subtopics.</div>}
        </div>
      )}

      <Modal
        isOpen={subjectModal}
        onClose={() => setSubjectModal(false)}
        title={editingSubject ? 'Edit subject' : 'Add subject'}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setSubjectModal(false)} className={`${modalButtonClass} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>Cancel</button>
            <button type="submit" form="subject-form" disabled={saving} className={`${modalButtonClass} bg-brand-primary text-white shadow-sm hover:bg-brand-dark`}>{saving ? 'Saving...' : 'Save subject'}</button>
          </div>
        }
      >
        <form id="subject-form" onSubmit={saveSubject} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField label="Name" htmlFor="subject-name" helper="Shown in lists and authoring filters.">
              <input id="subject-name" required value={subjectForm.name} onChange={(event) => setSubjectForm({ ...subjectForm, name: event.target.value })} className={inputClass} placeholder="Mathematics" />
            </ModalField>
            <ModalField label="Code" htmlFor="subject-code" helper="Use a short unique code.">
              <input id="subject-code" required value={subjectForm.code} onChange={(event) => setSubjectForm({ ...subjectForm, code: event.target.value.toUpperCase() })} className={`${inputClass} font-mono uppercase`} placeholder="MATH" />
            </ModalField>
          </div>

          <ModalField label="Description" htmlFor="subject-description" helper="Optional context for admins reviewing the subject list.">
            <textarea id="subject-description" value={subjectForm.description} onChange={(event) => setSubjectForm({ ...subjectForm, description: event.target.value })} className={`${inputClass} min-h-24 resize-y`} rows={3} />
          </ModalField>

          <fieldset className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
            <legend className="px-1 text-sm font-semibold text-gray-800">Grades</legend>
            <p className="mt-1 text-xs leading-5 text-gray-500">Leave empty when the subject is available to every student grade.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {grades.map((grade) => {
                const selected = subjectForm.grades.includes(grade._id);
                return (
                  <label key={grade._id} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition focus-within:ring-2 focus-within:ring-brand-primary/20 ${selected ? 'border-brand-primary bg-brand-lighter/40 text-gray-950' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={selected} onChange={() => toggleSubjectGrade(grade._id)} className="sr-only" />
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300 bg-white'}`}>{selected && <Check className="h-3.5 w-3.5" />}</span>
                    <span className="min-w-0 truncate">{grade.name}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField label="Color" htmlFor="subject-color" helper="Used as the subject marker in the admin table.">
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/15" aria-label={`Selected color ${subjectForm.color.toUpperCase()}`}>
                <input id="subject-color" type="color" value={subjectForm.color} onChange={(event) => setSubjectForm({ ...subjectForm, color: event.target.value })} className="h-8 w-12 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0" aria-label="Subject color" />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hex</span>
                <output htmlFor="subject-color" className="font-mono text-sm text-gray-700">{subjectForm.color.toUpperCase()}</output>
                <span className="ml-auto h-6 w-6 rounded-full border border-gray-200" style={{ backgroundColor: subjectForm.color }} aria-hidden="true" />
              </div>
            </ModalField>
            <ModalField label="Display order" htmlFor="subject-order" helper="Lower numbers appear earlier.">
              <input id="subject-order" type="number" value={subjectForm.order} onChange={(event) => setSubjectForm({ ...subjectForm, order: Number(event.target.value) })} className={inputClass} />
            </ModalField>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">
            <input type="checkbox" checked={subjectForm.isActive} onChange={(event) => setSubjectForm({ ...subjectForm, isActive: event.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-primary" />
            <span>
              <span className="block font-semibold text-gray-800">Available for question authors</span>
              <span className="mt-0.5 block text-xs leading-5 text-gray-500">Hidden subjects stay in admin records but are not presented as active options.</span>
            </span>
          </label>

        </form>
      </Modal>

      <Modal isOpen={topicModal} onClose={() => setTopicModal(false)} title={editingTopic ? 'Edit topic' : 'Add topic'} size="xl">
        <form onSubmit={saveTopic} className="space-y-6">
          <section className="space-y-4" aria-labelledby="topic-basics-heading">
            <div>
              <h3 id="topic-basics-heading" className="text-sm font-bold uppercase tracking-wide text-gray-500">Basics</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Topic name" htmlFor="topic-name" helper="The label authors see after choosing a chapter.">
                <input id="topic-name" required value={topicForm.name} onChange={(event) => setTopicForm({ ...topicForm, name: event.target.value })} className={inputClass} />
              </ModalField>
              <ModalField label="Code" htmlFor="topic-code" helper="Keep this stable for reporting and imports.">
                <input id="topic-code" required value={topicForm.code} onChange={(event) => setTopicForm({ ...topicForm, code: event.target.value })} className={`${inputClass} font-mono`} />
              </ModalField>
            </div>
            <ModalField label="Description" htmlFor="topic-description" helper="Optional guidance for admins and curriculum reviewers.">
              <textarea id="topic-description" value={topicForm.description} onChange={(event) => setTopicForm({ ...topicForm, description: event.target.value })} className={`${inputClass} min-h-20 resize-y`} rows={2} />
            </ModalField>
          </section>

          <fieldset className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
            <legend className="px-1 text-sm font-semibold text-gray-800">Linked subjects</legend>
            <p className="mt-1 text-xs leading-5 text-gray-500">Select every subject this topic can be used under. The first selected subject controls the chapter list.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {subjects.filter((subject) => subject.isActive && (!topicForm.grade || !subject.grades?.length || subject.grades.some((grade) => grade._id === topicForm.grade))).map((subject) => {
                const selected = topicForm.subjects.includes(subject._id);
                return (
                  <label key={subject._id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition focus-within:ring-2 focus-within:ring-brand-primary/20 ${selected ? 'border-brand-primary bg-brand-lighter/40 text-gray-950' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={selected} onChange={() => toggleSubject(subject._id)} className="sr-only" />
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300 bg-white'}`}>{selected && <Check className="h-3.5 w-3.5" />}</span>
                    <span className="min-w-0 truncate">{subject.name}</span>
                  </label>
                );
              })}
            </div>
            {!subjects.some((subject) => subject.isActive && (!topicForm.grade || !subject.grades?.length || subject.grades.some((grade) => grade._id === topicForm.grade))) && <p className="mt-3 rounded-md bg-white px-3 py-2 text-sm text-gray-500">No active subjects are available for this grade.</p>}
          </fieldset>

          <section className="grid gap-4 sm:grid-cols-2" aria-label="Placement">
            <ModalField label="Grade" htmlFor="topic-grade" helper="Choose the grade before selecting a chapter.">
              <select id="topic-grade" required value={topicForm.grade} onChange={(event) => setTopicGrade(event.target.value)} className={inputClass}>
                <option value="">Select grade</option>
                {grades.map((grade) => <option key={grade._id} value={grade._id}>{grade.name}</option>)}
              </select>
            </ModalField>
            <ModalField label="Chapter" htmlFor="topic-chapter" helper={!topicForm.grade || !topicForm.subjects.length ? 'Select a grade and subject first.' : 'Choose where this topic appears.'}>
              <select id="topic-chapter" required value={topicForm.chapter} onChange={(event) => setTopicForm({ ...topicForm, chapter: event.target.value })} disabled={!topicForm.grade || !topicForm.subjects.length} className={inputClass}>
                <option value="">Select chapter</option>
                {chapters.map((chapter) => <option key={chapter._id} value={chapter._id}>{chapter.name}</option>)}
              </select>
            </ModalField>
          </section>

          <section className="rounded-lg border border-gray-200 p-4" aria-labelledby="subtopics-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 id="subtopics-heading" className="text-sm font-semibold text-gray-800">Subtopics</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">These are available when authors select this topic.</p>
              </div>
              <button type="button" onClick={() => setTopicForm({ ...topicForm, subtopics: [...topicForm.subtopics, { name: '', code: '' }] })} className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 sm:w-auto">
                <Plus className="h-4 w-4" /> Add subtopic
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {topicForm.subtopics.map((subtopic, index) => (
                <div key={subtopic._id || index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_44px]">
                  <input required aria-label={`Subtopic ${index + 1} name`} value={subtopic.name} onChange={(event) => setSubtopic(index, 'name', event.target.value)} className={inlineInputClass} placeholder="Subtopic name" />
                  <input aria-label={`Subtopic ${index + 1} code`} value={subtopic.code || ''} onChange={(event) => setSubtopic(index, 'code', event.target.value)} className={`${inlineInputClass} font-mono`} placeholder="Code" />
                  <button type="button" onClick={() => setTopicForm({ ...topicForm, subtopics: topicForm.subtopics.filter((_, itemIndex) => itemIndex !== index) })} className="inline-flex h-11 w-full items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:w-11" aria-label={`Remove subtopic ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {!topicForm.subtopics.length && <p className="rounded-md bg-gray-50 px-3 py-3 text-sm text-gray-500">No subtopics added.</p>}
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField label="Display order" htmlFor="topic-order" helper="Lower numbers appear earlier.">
              <input id="topic-order" type="number" value={topicForm.order} onChange={(event) => setTopicForm({ ...topicForm, order: Number(event.target.value) })} className={inputClass} />
            </ModalField>
            <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700 sm:mt-7">
              <input type="checkbox" checked={topicForm.isActive} onChange={(event) => setTopicForm({ ...topicForm, isActive: event.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-primary" />
              <span>
                <span className="block font-semibold text-gray-800">Available for question authors</span>
                <span className="mt-0.5 block text-xs leading-5 text-gray-500">Hidden topics remain editable in admin.</span>
              </span>
            </label>
          </div>

          <div className={modalFooterClass}>
            <button type="button" onClick={() => setTopicModal(false)} className={`${modalButtonClass} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>Cancel</button>
            <button type="submit" disabled={saving} className={`${modalButtonClass} bg-brand-primary text-white shadow-sm hover:bg-brand-dark`}>{saving ? 'Saving...' : 'Save topic'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
