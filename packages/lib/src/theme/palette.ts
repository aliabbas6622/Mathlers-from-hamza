export const THEME_SCOPES = ['global', 'admin', 'student'] as const;

export type ThemeScope = (typeof THEME_SCOPES)[number];

export interface ThemePalette {
  primary: string;
  light: string;
  dark: string;
  lighter: string;
}

export interface SiteTheme {
  global: ThemePalette;
  admin: ThemePalette | null;
  student: ThemePalette | null;
}

export const DEFAULT_THEME: SiteTheme = {
  global: {
    primary: '#C1121F',
    dark: '#8B0E16',
    light: '#E63946',
    lighter: '#F8D7DA',
  },
  admin: null,
  student: null,
};

const hexColor = /^#[0-9a-fA-F]{6}$/;

export function isThemeScope(value: unknown): value is ThemeScope {
  return typeof value === 'string' && (THEME_SCOPES as readonly string[]).includes(value);
}

export function normalizePalette(value: unknown): ThemePalette | null {
  if (!value || typeof value !== 'object') return null;

  const palette = value as Record<string, unknown>;
  const keys: Array<keyof ThemePalette> = ['primary', 'light', 'dark', 'lighter'];
  const normalized = {} as ThemePalette;

  for (const key of keys) {
    const color = palette[key];
    if (typeof color !== 'string' || !hexColor.test(color)) return null;
    normalized[key] = color.toUpperCase();
  }

  return normalized;
}

export function normalizeSiteTheme(value: unknown): SiteTheme {
  const candidate = value as Partial<SiteTheme> | null;

  return {
    global: normalizePalette(candidate?.global) ?? DEFAULT_THEME.global,
    admin: normalizePalette(candidate?.admin),
    student: normalizePalette(candidate?.student),
  };
}

export function colorToRgb(color: string) {
  return `${parseInt(color.slice(1, 3), 16)} ${parseInt(color.slice(3, 5), 16)} ${parseInt(color.slice(5, 7), 16)}`;
}
