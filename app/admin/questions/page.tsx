'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth/auth';
import connectDB from '@/lib/db/mongodb';
import QuestionModel from '@/models/Question';
import SubjectModel from '@/models/Subject';
import GradeModel from '@/models/Grade';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import QuestionForm from '@/components/forms/admin/QuestionForm';
import { Search, Filter, Plus, Edit, Trash2, BarChart3, Eye } from 'lucide-react';

interface Question {
  _id: string;
  subject: { _id: string; name: string };
  grade: { _id: string; name: string };
  question: string;
  difficulty: string;
  status: string;
  analytics: {
    totalAttempts: number;
    correctPercentage: number;
  };
}

interface Subject {
  _id: string;
  name: string;
}

interface Grade {
  _id: string;
  name: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
    fetchGrades();
  }, []);

  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedSubject && { subject: selectedSubject }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty })
      });

      const res = await fetch(`/api/admin/questions?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setQuestions(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/public/subjects');
      const data = await res.json();
      if (data.success) {
        setSubjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await fetch('/api/public/grades');
      const data = await res.json();
      if (data.success) {
        setGrades(data.data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const handleCreateQuestion = async (formData: any) => {
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Question created successfully!');
        fetchQuestions();
      } else {
        alert(data.error || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question');
    }
  };

  const handleUpdateQuestion = async (formData: any) => {
    if (!editingQuestion) return;
    
    try {
      const res = await fetch(`/api/admin/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Question updated successfully!');
        fetchQuestions();
        setEditingQuestion(null);
      } else {
        alert(data.error || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to archive this question?')) return;
    
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Question archived successfully!');
        fetchQuestions();
      } else {
        alert(data.error || 'Failed to archive question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to archive question');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingQuestion(null);
  };

  const handleFilter = () => {
    fetchQuestions(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600">Manage all questions in the database</p>
        </div>
        <div className="flex gap-3">
          <PrimaryButton variant="secondary" onClick={() => window.location.href = '/admin/analytics/questions'}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </PrimaryButton>
          <PrimaryButton onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </PrimaryButton>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            />
          </div>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
          <select 
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <PrimaryButton variant="secondary" onClick={handleFilter}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </PrimaryButton>
        </div>
      </GlassCard>

      {/* Questions Table */}
      <GlassCard className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Question</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Subject</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Grade</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Difficulty</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Attempts</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Success Rate</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900 max-w-md truncate">{q.question}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-brand-lighter text-brand-primary rounded-full text-sm">
                        {q.subject?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{q.grade?.name || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{q.analytics?.totalAttempts || 0}</td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${
                        (q.analytics?.correctPercentage || 0) >= 70 ? 'text-green-600' :
                        (q.analytics?.correctPercentage || 0) >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {q.analytics?.correctPercentage || 0}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(q)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {questions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-2">No questions found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or add a new question</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => fetchQuestions(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchQuestions(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </GlassCard>

      {/* Question Form Modal */}
      <QuestionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
        initialData={editingQuestion || undefined}
        subjects={subjects}
        grades={grades}
      />
    </div>
  );
}
