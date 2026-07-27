'use client';

import { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import StatCard from '@/components/ui/StatCard';
import { BarChart3, TrendingUp, Award, Clock, BookOpen, Target } from 'lucide-react';

interface AnalyticsData {
  overall: {
    totalQuestions: number;
    totalAttempts: number;
    totalCorrect: number;
    totalIncorrect: number;
    avgCorrectPercentage: number;
    avgDifficultyIndex: number;
    totalUsageInPractice: number;
    totalUsageInTests: number;
    totalUsageInCompetitions: number;
  };
  byDifficulty: Array<{
    _id: string;
    count: number;
    avgCorrectPercentage: number;
    totalAttempts: number;
    avgDifficultyIndex: number;
  }>;
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  topAttempted: any[];
  hardest: any[];
  easiest: any[];
}

export default function QuestionAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics/questions?timeRange=${selectedTimeRange}`);
      const data = await res.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into question performance</p>
        </div>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary outline-none"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Questions"
          value={analytics.overall.totalQuestions.toString()}
          icon={BookOpen}
          trend="+12%"
        />
        <StatCard
          title="Total Attempts"
          value={analytics.overall.totalAttempts.toLocaleString()}
          icon={Target}
          trend="+8%"
        />
        <StatCard
          title="Avg Success Rate"
          value={`${analytics.overall.avgCorrectPercentage.toFixed(1)}%`}
          icon={Award}
          trend={analytics.overall.avgCorrectPercentage >= 70 ? '+5%' : '-3%'}
        />
        <StatCard
          title="Avg Difficulty Index"
          value={analytics.overall.avgDifficultyIndex.toFixed(2)}
          icon={TrendingUp}
          trend="Stable"
        />
      </div>

      {/* Usage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Practice Usage</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {analytics.overall.totalUsageInPractice.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">Questions used in practice sessions</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Test Usage</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {analytics.overall.totalUsageInTests.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">Questions used in tests</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Competition Usage</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {analytics.overall.totalUsageInCompetitions.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">Questions used in competitions</p>
        </GlassCard>
      </div>

      {/* Statistics by Difficulty */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance by Difficulty</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Difficulty</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Count</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Attempts</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Success Rate</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Difficulty Index</th>
              </tr>
            </thead>
            <tbody>
              {analytics.byDifficulty.map((stat) => (
                <tr key={stat._id} className="border-b border-gray-100">
                  <td className="py-3 px-4 capitalize">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      stat._id === 'easy' ? 'bg-green-100 text-green-700' :
                      stat._id === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {stat._id}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{stat.count}</td>
                  <td className="py-3 px-4 text-gray-600">{stat.totalAttempts.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${
                      stat.avgCorrectPercentage >= 70 ? 'text-green-600' :
                      stat.avgCorrectPercentage >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {stat.avgCorrectPercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{stat.avgDifficultyIndex.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Questions by Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analytics.byStatus.map((status) => (
          <GlassCard key={status._id} className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 capitalize mb-2">{status._id}</h3>
            <p className="text-3xl font-bold text-brand-primary">{status.count}</p>
            <p className="text-sm text-gray-500 mt-2">questions</p>
          </GlassCard>
        ))}
      </div>

      {/* Top Attempted Questions */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Most Attempted Questions</h3>
        <div className="space-y-4">
          {analytics.topAttempted.map((q, index) => (
            <div key={q._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="w-8 h-8 bg-brand-lighter text-brand-primary rounded-lg flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{q.question}</p>
                <p className="text-sm text-gray-500">{q.subject?.name} • {q.grade?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{q.analytics?.totalAttempts || 0} attempts</p>
                <p className="text-sm text-gray-500">{q.analytics?.correctPercentage || 0}% success</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Hardest Questions */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Hardest Questions (Lowest Success Rate)</h3>
        <div className="space-y-4">
          {analytics.hardest.map((q, index) => (
            <div key={q._id} className="flex items-center gap-4 p-4 bg-red-50 rounded-xl">
              <span className="w-8 h-8 bg-red-200 text-red-700 rounded-lg flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{q.question}</p>
                <p className="text-sm text-gray-500">{q.subject?.name} • {q.grade?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">{q.analytics?.correctPercentage || 0}% success</p>
                <p className="text-sm text-gray-500">{q.analytics?.totalAttempts || 0} attempts</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Easiest Questions */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Easiest Questions (Highest Success Rate)</h3>
        <div className="space-y-4">
          {analytics.easiest.map((q, index) => (
            <div key={q._id} className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
              <span className="w-8 h-8 bg-green-200 text-green-700 rounded-lg flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{q.question}</p>
                <p className="text-sm text-gray-500">{q.subject?.name} • {q.grade?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{q.analytics?.correctPercentage || 0}% success</p>
                <p className="text-sm text-gray-500">{q.analytics?.totalAttempts || 0} attempts</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
