/**
 * Badge types for achievements
 */
export enum BadgeType {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  MASTER = 'master',
  SPECIAL = 'special',
}

/**
 * Badge categories
 */
export enum BadgeCategory {
  PRACTICE = 'practice',
  COMPETITION = 'competition',
  STREAK = 'streak',
  LEVEL = 'level',
  SCORE = 'score',
  ACHIEVEMENT = 'achievement',
}

/**
 * Sample badges configuration
 */
export const BADGES = {
  // Practice badges
  FIRST_PRACTICE: {
    id: 'first_practice',
    name: 'First Steps',
    description: 'Complete your first practice session',
    type: BadgeType.BEGINNER,
    category: BadgeCategory.PRACTICE,
    icon: '🎯',
  },
  PRACTICE_10: {
    id: 'practice_10',
    name: 'Dedicated Learner',
    description: 'Complete 10 practice sessions',
    type: BadgeType.INTERMEDIATE,
    category: BadgeCategory.PRACTICE,
    icon: '📚',
  },
  PRACTICE_50: {
    id: 'practice_50',
    name: 'Practice Master',
    description: 'Complete 50 practice sessions',
    type: BadgeType.ADVANCED,
    category: BadgeCategory.PRACTICE,
    icon: '🏆',
  },
  // Streak badges
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    type: BadgeType.INTERMEDIATE,
    category: BadgeCategory.STREAK,
    icon: '🔥',
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    type: BadgeType.ADVANCED,
    category: BadgeCategory.STREAK,
    icon: '⚡',
  },
  // Competition badges
  FIRST_COMPETITION: {
    id: 'first_competition',
    name: 'Competitor',
    description: 'Participate in your first competition',
    type: BadgeType.BEGINNER,
    category: BadgeCategory.COMPETITION,
    icon: '🎖️',
  },
  COMPETITION_WINNER: {
    id: 'competition_winner',
    name: 'Champion',
    description: 'Win a competition',
    type: BadgeType.EXPERT,
    category: BadgeCategory.COMPETITION,
    icon: '👑',
  },
  // Level badges
  LEVEL_5: {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    type: BadgeType.INTERMEDIATE,
    category: BadgeCategory.LEVEL,
    icon: '⭐',
  },
  LEVEL_10: {
    id: 'level_10',
    name: 'Math Wizard',
    description: 'Reach level 10',
    type: BadgeType.EXPERT,
    category: BadgeCategory.LEVEL,
    icon: '🧙',
  },
  LEVEL_20: {
    id: 'level_20',
    name: 'Math Legend',
    description: 'Reach level 20',
    type: BadgeType.MASTER,
    category: BadgeCategory.LEVEL,
    icon: '🐉',
  },
};
