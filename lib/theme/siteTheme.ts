import connectDB from '@/lib/db/mongodb';
import SiteThemeModel from '@/models/SiteTheme';
import { DEFAULT_THEME, normalizeSiteTheme, type SiteTheme, type ThemePalette, type ThemeScope } from './palette';

const THEME_CACHE_MS = 60_000;

let cachedTheme: { value: SiteTheme; expiresAt: number } | null = null;
let pendingThemeRead: Promise<SiteTheme> | null = null;

export async function getSiteTheme(): Promise<SiteTheme> {
  const now = Date.now();
  if (cachedTheme && cachedTheme.expiresAt > now) {
    return cachedTheme.value;
  }

  if (pendingThemeRead) {
    return pendingThemeRead;
  }

  pendingThemeRead = readSiteTheme()
    .then((theme) => {
      cachedTheme = { value: theme, expiresAt: Date.now() + THEME_CACHE_MS };
      return theme;
    })
    .finally(() => {
      pendingThemeRead = null;
    });

  return pendingThemeRead;
}

async function readSiteTheme(): Promise<SiteTheme> {
  try {
    await connectDB();
    const theme = await SiteThemeModel.findOne({ key: 'default' }).lean();
    return normalizeSiteTheme(theme);
  } catch {
    // Branding must never make the application unavailable when the database is down.
    return DEFAULT_THEME;
  }
}

export async function saveThemePalette(scope: ThemeScope, palette: ThemePalette | null): Promise<SiteTheme> {
  await connectDB();
  const update = scope === 'global' ? { $set: { global: palette } } : palette ? { $set: { [scope]: palette } } : { $unset: { [scope]: 1 } };
  const setOnInsert = scope === 'global' ? { key: 'default' } : { key: 'default', global: DEFAULT_THEME.global };
  const theme = await SiteThemeModel.findOneAndUpdate(
    { key: 'default' },
    { ...update, $setOnInsert: setOnInsert },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  ).lean();

  const normalizedTheme = normalizeSiteTheme(theme);
  cachedTheme = { value: normalizedTheme, expiresAt: Date.now() + THEME_CACHE_MS };
  return normalizedTheme;
}
