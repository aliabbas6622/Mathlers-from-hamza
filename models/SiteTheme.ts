import mongoose, { Model, Schema } from 'mongoose';
import type { SiteTheme as ThemeConfig, ThemePalette } from '@/lib/theme/palette';

interface ISiteTheme extends Omit<ThemeConfig, 'admin' | 'student'> {
  key: string;
  admin?: ThemePalette;
  student?: ThemePalette;
}

const paletteSchema = new Schema<ThemePalette>(
  {
    primary: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
    light: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
    dark: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
    lighter: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
  },
  { _id: false }
);

const siteThemeSchema = new Schema<ISiteTheme>(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    global: { type: paletteSchema, required: true },
    admin: { type: paletteSchema, default: undefined },
    student: { type: paletteSchema, default: undefined },
  },
  { timestamps: true }
);

const SiteThemeModel: Model<ISiteTheme> = mongoose.models.SiteTheme || mongoose.model<ISiteTheme>('SiteTheme', siteThemeSchema);

export default SiteThemeModel;
