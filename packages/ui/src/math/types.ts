import type { HTMLAttributes, ReactNode } from 'react';

export type MathRenderState = 'plain' | 'loading' | 'rendered' | 'fallback';

export interface MathJaxApi {
  typesetPromise(elements?: HTMLElement[]): Promise<void>;
  typesetClear?(elements?: HTMLElement[]): void;
}

export interface MathJaxConfiguration {
  tex?: Record<string, unknown>;
  options?: Record<string, unknown>;
  svg?: Record<string, unknown>;
  startup?: Record<string, unknown>;
  [key: string]: unknown;
}

/** MathJax's browser global before its CDN script has finished loading. */
export type MathJaxGlobal = MathJaxConfiguration & Partial<MathJaxApi>;

export interface MathRendererProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** TeX source. Supported delimiters: $...$, $$...$$, \\(...\\), and \\[...\\]. */
  children: ReactNode;
  /** Uses a block element for display equations and long mathematical content. */
  display?: boolean;
  /** Applied while showing raw text because rendering is unavailable. */
  fallbackClassName?: string;
  /** Replaces the accessible label announced for the expression. */
  ariaLabel?: string;
  /** Called after MathJax fails; raw TeX remains visible and selectable. */
  onRenderError?: (error: Error) => void;
}
