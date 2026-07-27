/**
 * Site configuration
 */
export const siteConfig = {
  name: 'Mathlers',
  description: 'Master Mathematics Through Competition and Practice',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  keywords: ['mathematics', 'learning', 'competition', 'practice', 'education'],
  author: 'Mathlers Team',
  version: '0.1.0',
  
  links: {
    github: 'https://github.com/mathlers',
    twitter: 'https://twitter.com/mathlers',
    contact: '/contact',
    privacy: '/privacy',
    terms: '/terms',
  },
  
  features: [
    'Interactive Practice Sessions',
    'Live Competitions',
    'Detailed Analytics',
    'Gamified Learning',
    'Certificates & Achievements',
    'Leaderboards',
  ],
};

export type SiteConfig = typeof siteConfig;
