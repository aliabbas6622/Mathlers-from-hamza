'use client';

import { useState } from 'react';
import GlassCard from '@mathlers/ui/GlassCard';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@mathlers/lib/utils';

export interface LeaderboardEntry {
  id: string;
  name: string;
  playerId: string;
  score: number;
}

export interface CurrentUserLeaderboardData {
  id: string;
  points: number;
}

export default function LeaderboardClient({
  nationalLeaderboard,
  schoolLeaderboard,
  userNationalRank,
  userSchoolRank,
  currentUser,
  hasSchool
}: {
  nationalLeaderboard: LeaderboardEntry[];
  schoolLeaderboard: LeaderboardEntry[];
  userNationalRank: number | null;
  userSchoolRank: number | null;
  currentUser: CurrentUserLeaderboardData | null;
  hasSchool: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'national' | 'school'>(hasSchool ? 'school' : 'national');
  
  const currentLeaderboard = activeTab === 'national' ? nationalLeaderboard : schoolLeaderboard;
  const currentRank = activeTab === 'national' ? userNationalRank : userSchoolRank;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other Mathlers.</p>
      </div>
      
      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('national')}
          className={cn(
            "px-6 py-2 rounded-lg font-semibold text-sm transition-all",
            activeTab === 'national' 
              ? "bg-white text-brand-primary shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          National
        </button>
        <button
          onClick={() => setActiveTab('school')}
          className={cn(
            "px-6 py-2 rounded-lg font-semibold text-sm transition-all",
            activeTab === 'school' 
              ? "bg-white text-brand-primary shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          My School
        </button>
      </div>

      <GlassCard className="p-8 bg-gradient-to-br from-brand-primary to-brand-dark text-white">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {activeTab === 'national' ? 'Your National Rank' : 'Your School Rank'}
            </h2>
            <p className="text-white/80">
              {activeTab === 'school' && !hasSchool 
                ? "You are not associated with any school." 
                : "Keep practicing to improve your ranking!"}
            </p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold">
                {activeTab === 'school' && !hasSchool ? '-' : `#${currentRank || '-'}`}
              </p>
              <p className="text-sm text-white/80 uppercase tracking-wider mt-2">
                {activeTab === 'national' ? 'National Rank' : 'School Rank'}
              </p>
            </div>
            {currentUser && (
              <div className="text-center hidden sm:block">
                <p className="text-5xl font-bold">{currentUser.points || 0}</p>
                <p className="text-sm text-white/80 uppercase tracking-wider mt-2">Total Points</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {activeTab === 'national' ? 'Top National Performers' : 'Top School Performers'}
        </h2>
        
        {activeTab === 'school' && !hasSchool ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You are not enrolled in any school.</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {currentLeaderboard.map((entry, index) => {
              const isCurrentUser = entry.id === currentUser?.id;
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-all",
                    isCurrentUser ? "bg-brand-lighter border border-brand-primary/20" : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                      index === 0 ? "bg-yellow-100 text-yellow-600" :
                      index === 1 ? "bg-gray-200 text-gray-600" :
                      index === 2 ? "bg-amber-100 text-amber-700" :
                      "bg-white text-gray-400 border border-gray-200 shadow-sm"
                    )}>
                      {index === 0 ? <Trophy className="w-6 h-6" /> :
                       index === 1 ? <Medal className="w-6 h-6" /> :
                       index === 2 ? <Award className="w-6 h-6" /> :
                       index + 1}
                    </div>
                    <div>
                      <p className={cn("font-bold", isCurrentUser ? "text-brand-dark" : "text-gray-900")}>
                        {entry.name}
                      </p>
                      <p className="text-sm text-gray-500 font-mono">{entry.playerId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xl font-bold", isCurrentUser ? "text-brand-primary" : "text-gray-900")}>
                      {entry.score}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Points</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
