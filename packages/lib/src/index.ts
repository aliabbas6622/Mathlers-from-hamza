// Auth
export { auth, isAdmin, isSuperAdmin, isTeacher, canManageContent, canManageSchoolOperations } from './auth';
export type { MathlersSession } from './auth';

// Database
export { default as connectDB } from './db/mongodb';

// Theme
export { DEFAULT_THEME, normalizeSiteTheme, normalizePalette, colorToRgb, isThemeScope } from './theme/palette';
export { getSiteTheme, saveThemePalette } from './theme/siteTheme';
export type { SiteTheme, ThemePalette, ThemeScope } from './theme/palette';

// Utils
export { cn } from './utils/cn';
export * from './utils/formatters';
export * from './utils/validators';
export * from './utils/permissions';
export { isValidObjectId } from './utils/isValidObjectId';

// Security
export { takeRateLimit } from './security/rate-limit';

// Questions
export { normalizeQuestionPayload, parseQuestionPayload, parseQuestionUpdatePayload, parseBulkUploadPayload, readJsonPayload, questionError, questionDuplicateKey, questionDuplicateFilter, escapeRegex } from './questions/payload';
export { validateQuestionLinks } from './questions/validateLinks';
export type { QuestionPayload, QuestionUpdatePayload } from './questions/payload';

// Competition
export { activeChampionshipRound, roundStatus, isQualifiedForRound } from './competition/championship';
