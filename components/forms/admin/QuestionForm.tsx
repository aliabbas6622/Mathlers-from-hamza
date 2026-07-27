'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Modal from '@/components/ui/Modal';
import { MathRenderer } from '@/components/math';

interface QuestionFormData {
  subject: string;
  grade?: string;
  chapter?: string;
  topic?: string;
  subtopic?: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  estimatedTime: number;
  status: 'active' | 'inactive' | 'archived';
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  grades?: Array<{ _id: string; name: string }>;
}

interface Grade {
  _id: string;
  name: string;
  level?: string;
}

interface Topic {
  _id: string;
  name: string;
  subtopics: Array<{ _id: string; name: string }>;
}

interface LookupResponse<T> {
  success?: boolean;
  data?: T[];
  error?: string;
}

interface QuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  initialData?: QuestionFormData & { _id?: string };
  subjects: Subject[];
  grades: Grade[];
}

export default function QuestionForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  subjects,
  grades
}: QuestionFormProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [curriculumError, setCurriculumError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const defaultValues = useMemo<QuestionFormData>(() => ({
    subject: '',
    grade: '',
    chapter: '',
    topic: '',
    subtopic: '',
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A',
    explanation: '',
    difficulty: 'medium',
    marks: 1,
    estimatedTime: 60,
    status: 'active'
  }), []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue
  } = useForm<QuestionFormData>({
    defaultValues: initialData || defaultValues
  });

  const watchedGrade = watch('grade');
  const watchedSubject = watch('subject');
  const watchedTopic = watch('topic');
  const watchedQuestion = watch('question');
  const watchedOptions = watch('options');
  const watchedExplanation = watch('explanation');

  const fetchTopics = useCallback(async (subjectId: string, gradeId?: string) => {
    try {
      setCurriculumError('');
      let url = `/api/admin/topics?subject=${subjectId}`;
      if (gradeId) url += `&grade=${gradeId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Unable to load topics. Try again.');
      const data = await res.json() as LookupResponse<Topic>;
      if (data.success && data.data) {
        setTopics(data.data);
      } else {
        throw new Error(data.error || 'Unable to load topics. Try again.');
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics([]);
      setCurriculumError(error instanceof Error ? error.message : 'Unable to load topics. Try again.');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      reset(initialData || defaultValues);
    }
  }, [defaultValues, initialData, isOpen, reset]);

  useEffect(() => {
    if (watchedSubject) {
      fetchTopics(watchedSubject, watchedGrade);
    } else {
      setTopics([]);
    }
  }, [fetchTopics, watchedSubject, watchedGrade]);

  const selectedTopic = topics.find((topic) => topic._id === watchedTopic);
  const visibleSubjects = subjects.filter((subject) => !watchedGrade || !subject.grades?.length || subject.grades.some((grade) => grade._id === watchedGrade));

  useEffect(() => {
    if (watchedSubject && !visibleSubjects.some((subject) => subject._id === watchedSubject)) {
      setValue('subject', '');
      setValue('topic', '');
      setValue('subtopic', '');
    }
  }, [setValue, visibleSubjects, watchedSubject]);

  const handleFormSubmit = async (data: QuestionFormData) => {
    setIsLoading(true);
    setSubmitError('');
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting question:', error);
      setSubmitError(error instanceof Error ? error.message : 'Unable to save the question. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Question' : 'Add New Question'} size="xl">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="border-y border-gray-200 py-4 text-sm text-gray-600">
          Use standard text or LaTeX in any question, option, or explanation. Inline math uses <code className="rounded bg-gray-100 px-1.5 py-0.5">$x^2$</code>; display math uses <code className="rounded bg-gray-100 px-1.5 py-0.5">$$x^2$$</code>.
        </div>

        {/* Subject, Grade, and Topic Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <select
              {...register('subject', {
                required: 'Subject is required',
                onChange: () => {
                  setValue('topic', '');
                  setValue('subtopic', '');
                }
              })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            >
              <option value="">Select Subject</option>
              {visibleSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Grade (optional)
            </label>
            <select
              {...register('grade', {
                onChange: () => {
                  setValue('topic', '');
                  setValue('subtopic', '');
                }
              })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            >
              <option value="">All / Any Grade (optional)</option>
              {grades.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic (optional)
            </label>
            <select
              {...register('topic', {
                onChange: () => setValue('subtopic', '')
              })}
              disabled={!watchedSubject}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none disabled:bg-gray-100"
            >
              <option value="">Select Topic (optional)</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtopic {selectedTopic?.subtopics?.length ? '(optional)' : '(optional)'}
          </label>
          <select
            {...register('subtopic')}
            disabled={!watchedTopic || !selectedTopic?.subtopics?.length}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none disabled:bg-gray-100"
          >
            <option value="">{selectedTopic?.subtopics?.length ? 'Select Subtopic (optional)' : 'No subtopics configured'}</option>
            {selectedTopic?.subtopics?.map((subtopic) => (
              <option key={subtopic._id} value={subtopic._id}>{subtopic.name}</option>
            ))}
          </select>
        </div>

        {curriculumError && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{curriculumError}</div>}

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            {...register('question', { required: 'Question is required', maxLength: { value: 2000, message: 'Keep the question under 2,000 characters' } })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
            placeholder="Example: Solve $x^2 = 9$."
          />
          <div className="mt-2 flex justify-between text-xs text-gray-500"><span>Math notation is rendered for students automatically.</span><span>{watchedQuestion?.length || 0}/2,000</span></div>
          {errors.question && (
            <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Options *
          </label>
          {(['A', 'B', 'C', 'D'] as const).map((option) => (
            <div key={option} className="flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center bg-brand-lighter text-brand-primary rounded-lg font-semibold">
                {option}
              </span>
              <input
                type="text"
                {...register(`options.${option}`, { required: `Option ${option} is required`, maxLength: { value: 500, message: `Keep option ${option} under 500 characters` } })}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
                placeholder={`Option ${option}; LaTeX supported`}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  {...register('correctAnswer')}
                  value={option}
                  className="w-4 h-4 text-brand-primary"
                />
                <span className="text-sm text-gray-600">Correct</span>
              </label>
            </div>
          ))}
          {errors.options && (
            <p className="text-red-500 text-sm">All options are required</p>
          )}
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation *
          </label>
          <textarea
            {...register('explanation', { required: 'Explanation is required', maxLength: { value: 4000, message: 'Keep the explanation under 4,000 characters' } })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
            placeholder="Explain the method. LaTeX is supported here too."
          />
          <div className="mt-2 text-right text-xs text-gray-500">{watchedExplanation?.length || 0}/4,000</div>
          {errors.explanation && (
            <p className="text-red-500 text-sm mt-1">{errors.explanation.message}</p>
          )}
        </div>

        {(watchedQuestion || watchedExplanation || Object.values(watchedOptions || {}).some(Boolean)) && (
          <section aria-label="Question preview" className="border-y border-gray-200 py-5">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-gray-950">Student preview</h3><span className="text-xs text-gray-500">Math rendering is checked here before publishing.</span></div>
            <div className="space-y-3 text-sm text-gray-800">
              {watchedQuestion && <MathRenderer display className="font-medium" fallbackClassName="font-mono text-xs text-gray-700">{watchedQuestion}</MathRenderer>}
              <div className="grid gap-2 sm:grid-cols-2">{(['A', 'B', 'C', 'D'] as const).map((option) => watchedOptions?.[option] ? <div key={option} className="flex gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"><span className="font-semibold text-brand-primary">{option}</span><MathRenderer fallbackClassName="font-mono text-xs text-gray-700">{watchedOptions[option]}</MathRenderer></div> : null)}</div>
              {watchedExplanation && <div className="border-t border-gray-100 pt-3"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Explanation</p><MathRenderer display fallbackClassName="font-mono text-xs text-gray-700">{watchedExplanation}</MathRenderer></div>}
            </div>
          </section>
        )}

        {/* Difficulty, Marks, and Time */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty *
            </label>
            <select
              {...register('difficulty')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marks *
            </label>
            <input
              type="number"
              {...register('marks', { valueAsNumber: true, min: 1 })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Time (seconds) *
            </label>
            <input
              type="number"
              {...register('estimatedTime', { valueAsNumber: true, min: 1 })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
              min="1"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Submit Button */}
        {submitError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>}
        <div className="flex gap-4 pt-4">
          <PrimaryButton
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Question' : 'Create Question'}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
