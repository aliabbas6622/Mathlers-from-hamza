'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import GlassCard from '@/components/ui/GlassCard';
import Modal from '@/components/ui/Modal';

interface QuestionFormData {
  subject: string;
  grade: string;
  chapter: string;
  topic: string;
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
}

interface Grade {
  _id: string;
  name: string;
  level: string;
}

interface Chapter {
  _id: string;
  name: string;
}

interface Topic {
  _id: string;
  name: string;
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
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>(initialData?.grade || '');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialData?.subject || '');
  const [selectedChapter, setSelectedChapter] = useState<string>(initialData?.chapter || '');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<QuestionFormData>({
    defaultValues: initialData || {
      subject: '',
      grade: '',
      chapter: '',
      topic: '',
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      explanation: '',
      difficulty: 'medium',
      marks: 1,
      estimatedTime: 60,
      status: 'active'
    }
  });

  const watchedGrade = watch('grade');
  const watchedSubject = watch('subject');
  const watchedChapter = watch('chapter');

  // Fetch chapters when grade changes
  useEffect(() => {
    if (watchedGrade && watchedSubject) {
      fetchChapters(watchedGrade, watchedSubject);
    }
  }, [watchedGrade, watchedSubject]);

  // Fetch topics when chapter changes
  useEffect(() => {
    if (watchedChapter) {
      fetchTopics(watchedChapter);
    }
  }, [watchedChapter]);

  const fetchChapters = async (gradeId: string, subjectId: string) => {
    try {
      const res = await fetch(`/api/admin/chapters?grade=${gradeId}&subject=${subjectId}`);
      const data = await res.json();
      if (data.success) {
        setChapters(data.data);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const fetchTopics = async (chapterId: string) => {
    try {
      const res = await fetch(`/api/admin/topics?chapter=${chapterId}`);
      const data = await res.json();
      if (data.success) {
        setTopics(data.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleFormSubmit = async (data: QuestionFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Question' : 'Add New Question'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Subject and Grade Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <select
              {...register('subject', { required: 'Subject is required' })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
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
              Grade *
            </label>
            <select
              {...register('grade', { required: 'Grade is required' })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.name}
                </option>
              ))}
            </select>
            {errors.grade && (
              <p className="text-red-500 text-sm mt-1">{errors.grade.message}</p>
            )}
          </div>
        </div>

        {/* Chapter and Topic Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapter *
            </label>
            <select
              {...register('chapter', { required: 'Chapter is required' })}
              disabled={!watchedGrade || !watchedSubject}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none disabled:bg-gray-100"
            >
              <option value="">Select Chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter._id} value={chapter._id}>
                  {chapter.name}
                </option>
              ))}
            </select>
            {errors.chapter && (
              <p className="text-red-500 text-sm mt-1">{errors.chapter.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <select
              {...register('topic', { required: 'Topic is required' })}
              disabled={!watchedChapter}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none disabled:bg-gray-100"
            >
              <option value="">Select Topic</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  {topic.name}
                </option>
              ))}
            </select>
            {errors.topic && (
              <p className="text-red-500 text-sm mt-1">{errors.topic.message}</p>
            )}
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            {...register('question', { required: 'Question is required' })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
            placeholder="Enter your question here..."
          />
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
                {...register(`options.${option}` as any, { required: `Option ${option} is required` })}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
                placeholder={`Enter option ${option}`}
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
            {...register('explanation', { required: 'Explanation is required' })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none"
            placeholder="Explain why the correct answer is correct..."
          />
          {errors.explanation && (
            <p className="text-red-500 text-sm mt-1">{errors.explanation.message}</p>
          )}
        </div>

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
