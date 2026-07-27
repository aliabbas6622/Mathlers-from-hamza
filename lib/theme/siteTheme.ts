import connectDB from '@/lib/db/mongodb';
import SiteThemeModel from '@/models/SiteTheme';
import { DEFAULT_THEME, normalizeSiteTheme, type SiteTheme, type ThemePalette, type ThemeScope } from './palette';

export async function getSiteTheme(): Promise<SiteTheme> {
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
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return normalizeSiteTheme(theme);
}
