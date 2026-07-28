'use client';

import { useEffect } from 'react';
import { colorToRgb, type SiteTheme, type ThemePalette } from '@mathlers/lib/theme';

const paletteKeys: Array<keyof ThemePalette> = ['primary', 'light', 'dark', 'lighter'];

function applyPalette(scope: 'global' | 'admin' | 'student', palette: ThemePalette | null) {
  for (const key of paletteKeys) {
    const property = `--brand-${scope}-${key}-rgb`;
    if (palette) {
      document.documentElement.style.setProperty(property, colorToRgb(palette[key]));
    } else {
      document.documentElement.style.removeProperty(property);
    }
  }
}

export function applySiteTheme(theme: SiteTheme) {
  applyPalette('global', theme.global);
  applyPalette('admin', theme.admin);
  applyPalette('student', theme.student);
}

export default function ThemeProvider({ initialTheme, children }: { initialTheme: SiteTheme; children: React.ReactNode }) {
  useEffect(() => {
    applySiteTheme(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    const updateTheme = (event: Event) => applySiteTheme((event as CustomEvent<SiteTheme>).detail);
    window.addEventListener('site-theme:update', updateTheme);
    return () => window.removeEventListener('site-theme:update', updateTheme);
  }, []);

  return children;
}
