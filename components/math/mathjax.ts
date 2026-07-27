'use client';

import type { MathJaxApi, MathJaxConfiguration, MathJaxGlobal } from './types';

export const MATHJAX_CDN_URL = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';

declare global {
  interface Window {
    MathJax?: MathJaxGlobal;
    __mathlersMathJaxPromise?: Promise<MathJaxApi>;
  }
}

const SCRIPT_ID = 'mathlers-mathjax';
const LOAD_TIMEOUT_MS = 15_000;

const defaultConfiguration: MathJaxConfiguration = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
  },
  svg: { fontCache: 'global' },
  startup: { typeset: false },
};

function isReady(api: Window['MathJax']): api is MathJaxGlobal & MathJaxApi {
  return typeof api?.typesetPromise === 'function';
}

function configureMathJax() {
  const existing = window.MathJax;

  window.MathJax = {
    ...defaultConfiguration,
    ...existing,
    tex: { ...defaultConfiguration.tex, ...existing?.tex },
    options: { ...defaultConfiguration.options, ...existing?.options },
    svg: { ...defaultConfiguration.svg, ...existing?.svg },
    startup: { ...defaultConfiguration.startup, ...existing?.startup },
  };
}

export function loadMathJax(): Promise<MathJaxApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('MathJax can only load in a browser.'));
  }

  if (isReady(window.MathJax)) {
    return Promise.resolve(window.MathJax);
  }

  if (window.__mathlersMathJaxPromise) {
    return window.__mathlersMathJaxPromise;
  }

  configureMathJax();

  window.__mathlersMathJaxPromise = new Promise<MathJaxApi>((resolve, reject) => {
    const existing =
      (document.getElementById(SCRIPT_ID) as HTMLScriptElement | null) ??
      Array.from(document.scripts).find((script) => /mathjax/i.test(script.src)) ??
      null;
    const script = existing ?? document.createElement('script');
    const finish = (error?: Error) => {
      window.clearTimeout(timeoutId);
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);

      if (error) {
        reject(error);
      } else if (isReady(window.MathJax)) {
        resolve(window.MathJax);
      } else {
        reject(new Error('MathJax loaded without its rendering API.'));
      }
    };

    const onLoad = () => window.setTimeout(() => finish(), 0);
    const onError = () => finish(new Error('MathJax could not be loaded.'));

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    const timeoutId = window.setTimeout(
      () => finish(new Error('MathJax loading timed out.')),
      LOAD_TIMEOUT_MS,
    );

    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = MATHJAX_CDN_URL;
      script.async = true;
      document.head.appendChild(script);
    } else if (isReady(window.MathJax)) {
      finish();
    }
  }).catch((error: Error) => {
    window.__mathlersMathJaxPromise = undefined;
    throw error;
  });

  return window.__mathlersMathJaxPromise;
}
