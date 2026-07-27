'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, CircleAlert, LoaderCircle, RefreshCcw, RotateCcw, Save, SwatchBook } from 'lucide-react';
import type { SiteTheme, ThemePalette, ThemeScope } from './types';

type PalettePreset = {
  name: string;
  description: string;
  palette: ThemePalette;
};

const DEFAULT_PALETTE: ThemePalette = {
  primary: '#C1121F',
  light: '#E63946',
  dark: '#8B0E16',
  lighter: '#F8D7DA',
};

const PALETTE_PRESETS: PalettePreset[] = [
  { name: 'Crimson', description: 'Current Mathlers palette', palette: DEFAULT_PALETTE },
  { name: 'Ocean', description: 'Clear blue with a cool tint', palette: { primary: '#0369A1', light: '#0EA5E9', dark: '#0C4A6E', lighter: '#E0F2FE' } },
  { name: 'Forest', description: 'Balanced green for study flows', palette: { primary: '#15803D', light: '#22C55E', dark: '#14532D', lighter: '#DCFCE7' } },
  { name: 'Violet', description: 'A focused indigo-violet palette', palette: { primary: '#6D28D9', light: '#8B5CF6', dark: '#4C1D95', lighter: '#EDE9FE' } },
  { name: 'Amber', description: 'Warm gold with strong contrast', palette: { primary: '#B45309', light: '#F59E0B', dark: '#78350F', lighter: '#FEF3C7' } },
];

const SCOPE_COPY: Record<ThemeScope, { label: string; description: string }> = {
  global: { label: 'Whole website', description: 'Base palette used wherever a portal has no dedicated override.' },
  admin: { label: 'Admin portal', description: 'Give staff-facing tools a distinct palette while retaining the global design elsewhere.' },
  student: { label: 'Student portal', description: 'Set a separate look for the learning experience without changing the admin portal.' },
};

const COLOR_FIELDS: Array<{ key: keyof ThemePalette; label: string; helper: string }> = [
  { key: 'primary', label: 'Primary', helper: 'Main actions and active states' },
  { key: 'light', label: 'Light', helper: 'Hover and secondary highlights' },
  { key: 'dark', label: 'Dark', helper: 'Pressed states and contrast' },
  { key: 'lighter', label: 'Tint', helper: 'Soft surfaces and backgrounds' },
];

const HEX_COLOR = /^#[0-9A-F]{6}$/i;

function isThemePalette(value: unknown): value is ThemePalette {
  if (!value || typeof value !== 'object') return false;
  return COLOR_FIELDS.every(({ key }) => {
    const color = (value as Record<string, unknown>)[key];
    return typeof color === 'string' && HEX_COLOR.test(color);
  });
}

function isSiteTheme(value: unknown): value is SiteTheme {
  if (!value || typeof value !== 'object') return false;
  const theme = value as Record<string, unknown>;
  return isThemePalette(theme.global)
    && (theme.admin === null || isThemePalette(theme.admin))
    && (theme.student === null || isThemePalette(theme.student));
}

function samePalette(first: ThemePalette, second: ThemePalette) {
  return COLOR_FIELDS.every(({ key }) => first[key].toUpperCase() === second[key].toUpperCase());
}

function normalizePalette(palette: ThemePalette): ThemePalette {
  return {
    primary: palette.primary.toUpperCase(),
    light: palette.light.toUpperCase(),
    dark: palette.dark.toUpperCase(),
    lighter: palette.lighter.toUpperCase(),
  };
}

function notifyThemeUpdate(theme: SiteTheme) {
  window.dispatchEvent(new CustomEvent<SiteTheme>('site-theme:update', { detail: theme }));
}

async function readResponse(response: Response) {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'The theme settings could not be saved. Please try again.';
    throw new Error(error);
  }
  return payload;
}

function PalettePreview({ palette, label }: { palette: ThemePalette; label: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white" aria-label={`${label} palette preview`}>
      <div className="flex h-2" aria-hidden="true">
        {COLOR_FIELDS.map(({ key }) => <span key={key} className="flex-1" style={{ backgroundColor: palette[key] }} />)}
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: palette.primary }}>M</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="truncate text-xs text-gray-500">Buttons, highlights, and surfaces</p>
        </div>
        <span className="h-7 w-16 rounded-md border border-black/5" style={{ backgroundColor: palette.lighter }} aria-hidden="true" />
      </div>
    </div>
  );
}

function HexColorInput({
  field,
  label,
  helper,
  color,
  onValidColor,
}: {
  field: keyof ThemePalette;
  label: string;
  helper: string;
  color: string;
  onValidColor: (color: string) => void;
}) {
  const [input, setInput] = useState(color);
  const isValid = HEX_COLOR.test(input);

  return (
    <label className="block rounded-lg border border-gray-200 bg-white p-4">
      <span className="block text-sm font-semibold text-gray-900">{label}</span>
      <span className="mt-1 block text-xs text-gray-500">{helper}</span>
      <span className="mt-3 flex items-center gap-3">
        <input
          type="color"
          value={color}
          onChange={(event) => onValidColor(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-md border border-gray-300 bg-white p-1"
          aria-label={`${label} colour picker`}
        />
        <input
          type="text"
          value={input}
          onChange={(event) => {
            const next = event.target.value.trim();
            setInput(next);
            if (HEX_COLOR.test(next)) onValidColor(next);
          }}
          spellCheck="false"
          inputMode="text"
          maxLength={7}
          pattern="#[0-9A-Fa-f]{6}"
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm uppercase text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
          aria-invalid={input.length > 0 && !isValid}
          aria-describedby={`${field}-help`}
        />
      </span>
      <span id={`${field}-help`} className="mt-2 block text-xs text-gray-500">{isValid ? 'Use a six-digit hexadecimal colour.' : 'Enter a six-digit hexadecimal colour, for example #123ABC.'}</span>
    </label>
  );
}

function LoadingPanel() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading theme settings">
      <div className="h-8 w-52 animate-pulse rounded bg-gray-200" />
      <div className="h-11 w-full max-w-xl animate-pulse rounded-lg bg-gray-100" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="h-96 animate-pulse rounded-lg border border-gray-200 bg-white" />
        <div className="h-48 animate-pulse rounded-lg border border-gray-200 bg-white" />
      </div>
    </div>
  );
}

export default function ThemeSettingsPanel() {
  const [serverTheme, setServerTheme] = useState<SiteTheme | null>(null);
  const [drafts, setDrafts] = useState<SiteTheme | null>(null);
  const [scope, setScope] = useState<ThemeScope>('global');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadTheme = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/site-theme', { signal, cache: 'no-store' });
      const payload = await readResponse(response);
      const theme = payload && typeof payload === 'object' && 'theme' in payload ? payload.theme : null;
      if (!isSiteTheme(theme)) throw new Error('The saved theme data is incomplete. Please refresh and try again.');
      const normalized = {
        global: normalizePalette(theme.global),
        admin: theme.admin ? normalizePalette(theme.admin) : null,
        student: theme.student ? normalizePalette(theme.student) : null,
      };
      setServerTheme(normalized);
      setDrafts(normalized);
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === 'AbortError') return;
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load theme settings.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => loadTheme(controller.signal));
    return () => controller.abort();
  }, [loadTheme]);

  const activePalette = useMemo(() => {
    if (!drafts) return DEFAULT_PALETTE;
    return drafts[scope] ?? drafts.global;
  }, [drafts, scope]);

  const usesGlobalPalette = scope !== 'global' && drafts?.[scope] === null;
  const hasChanges = Boolean(drafts && serverTheme && !samePalette(activePalette, serverTheme[scope] ?? serverTheme.global));

  const updatePalette = (nextPalette: ThemePalette) => {
    setDrafts((current) => current ? { ...current, [scope]: normalizePalette(nextPalette) } : current);
    setNotice(null);
  };

  const updateColor = (field: keyof ThemePalette, value: string) => {
    if (!HEX_COLOR.test(value)) return;
    updatePalette({ ...activePalette, [field]: value });
  };

  const save = async () => {
    if (!drafts || !isThemePalette(activePalette)) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/site-theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, palette: normalizePalette(activePalette) }),
      });
      await readResponse(response);
      const next: SiteTheme = { ...drafts, [scope]: normalizePalette(activePalette) };
      setDrafts(next);
      setServerTheme(next);
      notifyThemeUpdate(next);
      setNotice(`${SCOPE_COPY[scope].label} palette saved.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save the palette.');
    } finally {
      setSaving(false);
    }
  };

  const resetOverride = async () => {
    if (!drafts || scope === 'global') return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch('/api/admin/site-theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, palette: null }),
      });
      await readResponse(response);
      const next: SiteTheme = { ...drafts, [scope]: null };
      setDrafts(next);
      setServerTheme(next);
      notifyThemeUpdate(next);
      setNotice(`${SCOPE_COPY[scope].label} now inherits the whole website palette.`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to reset the portal palette.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPanel />;

  if (!drafts || !serverTheme) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5" role="alert">
        <div className="flex gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
          <div>
            <h1 className="font-semibold text-red-950">Theme settings are unavailable</h1>
            <p className="mt-1 text-sm leading-6 text-red-800">{error || 'The current theme settings could not be loaded.'}</p>
            <button type="button" onClick={() => void loadTheme()} className="mt-4 inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/30">
              <RefreshCcw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-10">
      <header className="border-b border-gray-200 pb-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-lighter text-brand-primary"><SwatchBook className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-semibold text-brand-primary">Website appearance</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">Theme settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Choose a shared palette, then add portal-specific overrides only where they are needed.</p>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-200" role="tablist" aria-label="Theme scope">
        <div className="flex gap-1 overflow-x-auto">
          {(Object.keys(SCOPE_COPY) as ThemeScope[]).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={scope === item}
              onClick={() => { setScope(item); setError(null); setNotice(null); }}
              className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:ring-inset ${scope === item ? 'text-brand-primary' : 'text-gray-600 hover:text-gray-950'}`}
            >
              {SCOPE_COPY[item].label}
              {item !== 'global' && drafts[item] !== null && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-brand-primary align-middle" aria-label="Custom override active" />}
              {scope === item && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-t bg-brand-primary" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}
      {notice && (
        <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          <p>{notice}</p>
        </div>
      )}

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="space-y-6" aria-labelledby="palette-heading">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="palette-heading" className="text-lg font-bold text-gray-950">{SCOPE_COPY[scope].label} palette</h2>
                <p className="mt-1 text-sm text-gray-600">{SCOPE_COPY[scope].description}</p>
              </div>
              {usesGlobalPalette && <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">Using global palette</span>}
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-gray-900">Preset palettes</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {PALETTE_PRESETS.map((preset) => {
                const selected = samePalette(activePalette, preset.palette);
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => updatePalette(preset.palette)}
                    aria-pressed={selected}
                    className={`group rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${selected ? 'border-brand-primary bg-brand-lighter/30' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <span className="flex h-2 overflow-hidden rounded-full" aria-hidden="true">
                      {COLOR_FIELDS.map(({ key }) => <span key={key} className="flex-1" style={{ backgroundColor: preset.palette[key] }} />)}
                    </span>
                    <span className="mt-3 flex items-center justify-between gap-3"><span className="font-semibold text-gray-900">{preset.name}</span>{selected && <Check className="h-4 w-4 text-brand-primary" aria-label="Selected" />}</span>
                    <span className="mt-1 block text-xs leading-5 text-gray-500">{preset.description}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="border-t border-gray-200 pt-6">
            <legend className="text-sm font-semibold text-gray-900">Custom colours</legend>
            <p className="mt-1 text-sm text-gray-600">Use six-digit hexadecimal values to keep the palette predictable across the product.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {COLOR_FIELDS.map(({ key, label, helper }) => (
                <HexColorInput
                  key={`${scope}-${key}-${activePalette[key]}`}
                  field={key}
                  label={label}
                  helper={helper}
                  color={activePalette[key]}
                  onValidColor={(color) => updateColor(key, color)}
                />
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            {scope !== 'global' ? (
              <button type="button" onClick={() => void resetOverride()} disabled={saving || usesGlobalPalette} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 disabled:cursor-not-allowed disabled:opacity-50">
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset to global palette
              </button>
            ) : <span className="hidden sm:block" />}
            <button type="button" onClick={() => void save()} disabled={saving || !hasChanges} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              {saving ? 'Saving palette...' : 'Save palette'}
            </button>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start" aria-label="Palette preview">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Live preview</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">A quick check of the colours selected for this scope.</p>
          </div>
          <PalettePreview palette={activePalette} label={SCOPE_COPY[scope].label} />
          {scope !== 'global' && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Inheritance</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">{usesGlobalPalette ? 'This portal currently follows the whole website palette.' : 'This portal has its own saved palette override.'}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
