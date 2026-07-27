'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Check, BookOpen, Layers, Filter } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';

interface QuestionItem {
  _id: string;
  question: string;
  type: string;
  difficulty: string;
  marks: number;
  subject?: { name: string };
  grade?: { name: string };
  chapter?: { name: string };
  topic?: { name: string };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedQuestionIds: string[];
  onSelectQuestions: (questionIds: string[]) => void;
  sectionName: string;
}

export default function QuestionBankSelectorModal({
  isOpen,
  onClose,
  selectedQuestionIds,
  onSelectQuestions,
  sectionName,
}: Props) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>(selectedQuestionIds);

  useEffect(() => {
    setLocalSelected(selectedQuestionIds);
  }, [selectedQuestionIds]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (difficulty) queryParams.set('difficulty', difficulty);
        queryParams.set('limit', '50');

        const res = await fetch(`/api/admin/questions?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch question bank', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(timer);
  }, [isOpen, search, difficulty]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setLocalSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSelectQuestions(localSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full relative shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Questions from Bank</h2>
            <p className="text-gray-500 text-sm">Assigning questions to <strong>{sectionName}</strong> ({localSelected.length} selected)</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions by text..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-primary outline-none text-sm text-gray-900"
            />
          </div>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none"
          >
            <option value="">All / Mixed Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-2">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading Question Bank...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No questions found matching your filters.</div>
          ) : (
            questions.map(q => {
              const isSelected = localSelected.includes(q._id);
              return (
                <div
                  key={q._id}
                  onClick={() => toggleSelect(q._id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? 'bg-brand-lighter/50 border-brand-primary shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected ? 'bg-brand-primary text-white' : 'border border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>

                  <div className="flex-1">
                    <p className="text-gray-900 font-medium text-sm line-clamp-2">{q.question}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      {q.subject?.name && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                          {q.subject.name}
                        </span>
                      )}
                      {q.grade?.name && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">
                          {q.grade.name}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded font-semibold capitalize ${
                        q.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                        q.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {q.marks || 1} mark(s)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
          <span className="text-sm text-gray-600 font-semibold">{localSelected.length} Question(s) Selected</span>
          <div className="flex gap-3">
            <PrimaryButton variant="ghost" onClick={onClose}>
              Cancel
            </PrimaryButton>
            <PrimaryButton onClick={handleSave}>
              Save Selected Questions
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
