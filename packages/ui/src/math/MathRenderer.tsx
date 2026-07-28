'use client';

import { useEffect, useRef, useState } from 'react';

import { loadMathJax } from './mathjax';
import type { MathRenderState, MathRendererProps } from './types';

const mathDelimiterPattern = /\$\$[\s\S]+?\$\$|\$(?!\$)(?:\\.|[^$])+?\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/;

function hasMathDelimiter(value: string) {
  return mathDelimiterPattern.test(value);
}

function toText(value: MathRendererProps['children']) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

export function MathRenderer({
  children,
  display = false,
  className,
  fallbackClassName,
  ariaLabel,
  onRenderError,
  ...props
}: MathRendererProps) {
  const source = toText(children);
  const elementRef = useRef<HTMLElement>(null);
  const onRenderErrorRef = useRef(onRenderError);
  const [state, setState] = useState<MathRenderState>('plain');
  const Element = display ? 'div' : 'span';

  useEffect(() => {
    onRenderErrorRef.current = onRenderError;
  }, [onRenderError]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.textContent = source;

    if (!hasMathDelimiter(source)) {
      return;
    }

    let cancelled = false;

    void Promise.resolve()
      .then(() => {
        if (!cancelled) setState('loading');
        return loadMathJax();
      })
      .then(async (mathJax) => {
        if (cancelled) return;

        mathJax.typesetClear?.([element]);
        element.textContent = source;
        await mathJax.typesetPromise([element]);

        if (!cancelled) setState('rendered');
      })
      .catch((reason: unknown) => {
        if (cancelled) return;

        element.textContent = source;
        setState('fallback');
        onRenderErrorRef.current?.(
          reason instanceof Error ? reason : new Error('Math rendering failed.'),
        );
      });

    return () => {
      cancelled = true;
      window.MathJax?.typesetClear?.([element]);
    };
  }, [source]);

  const displayState = hasMathDelimiter(source) ? state : 'plain';
  const resolvedClassName = [
    className,
    displayState === 'fallback' || displayState === 'loading' ? fallbackClassName : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Element
      {...props}
      ref={elementRef as never}
      aria-label={ariaLabel}
      className={resolvedClassName || undefined}
      data-math-render-state={displayState}
    >
      {source}
    </Element>
  );
}
