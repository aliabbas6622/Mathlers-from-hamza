/**
 * Level configuration for gamification
 */
export interface LevelConfig {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  color: string;
}

/**
 * Level titles and point thresholds
 */
export const LEVELS: LevelConfig[] = [
  { level: 1, title: 'Beginner', minPoints: 0, maxPoints: 99, color: 'text-gray-500' },
  { level: 2, title: 'Learner', minPoints: 100, maxPoints: 249, color: 'text-green-500' },
  { level: 3, title: 'Explorer', minPoints: 250, maxPoints: 499, color: 'text-blue-500' },
  { level: 4, title: 'Scholar', minPoints: 500, maxPoints: 799, color: 'text-purple-500' },
  { level: 5, title: 'Rising Star', minPoints: 800, maxPoints: 1199, color: 'text-yellow-500' },
  { level: 6, title: 'Mathematician', minPoints: 1200, maxPoints: 1699, color: 'text-orange-500' },
  { level: 7, title: 'Expert', minPoints: 1700, maxPoints: 2299, color: 'text-red-500' },
  { level: 8, title: 'Master', minPoints: 2300, maxPoints: 2999, color: 'text-pink-500' },
  { level: 9, title: 'Grand Master', minPoints: 3000, maxPoints: 3999, color: 'text-indigo-500' },
  { level: 10, title: 'Math Wizard', minPoints: 4000, maxPoints: 4999, color: 'text-violet-500' },
  { level: 11, title: 'Math Legend', minPoints: 5000, maxPoints: 6499, color: 'text-fuchsia-500' },
  { level: 12, title: 'Math God', minPoints: 6500, maxPoints: Infinity, color: 'text-amber-500' },
];

/**
 * Get level by points
 */
export function getLevelByPoints(points: number): LevelConfig {
  return LEVELS.find(level => points >= level.minPoints && points <= level.maxPoints) || LEVELS[0];
}

/**
 * Get progress to next level
 */
export function getLevelProgress(currentPoints: number): { currentLevel: LevelConfig; nextLevel: LevelConfig | null; progress: number } {
  const currentLevel = getLevelByPoints(currentPoints);
  const nextLevel = LEVELS[currentLevel.level] || null;
  
  if (!nextLevel) {
    return { currentLevel, nextLevel: null, progress: 100 };
  }
  
  const range = nextLevel.minPoints - currentLevel.minPoints;
  const progressInLevel = currentPoints - currentLevel.minPoints;
  const progress = Math.min(100, Math.round((progressInLevel / range) * 100));
  
  return { currentLevel, nextLevel, progress };
}

/**
 * Points awarded for different actions
 */
export const POINTS_REWARDS = {
  CORRECT_ANSWER: 10,
  PERFECT_PRACTICE: 50,
  COMPETITION_PARTICIPATION: 25,
  COMPETITION_WIN: 100,
  COMPETITION_TOP_3: 50,
  DAILY_STREAK: 5,
  WEEKLY_STREAK: 25,
  MONTHLY_STREAK: 100,
  BADGE_EARNED: 30,
};
