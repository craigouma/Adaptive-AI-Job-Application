import { useEffect, useState, useRef } from 'react';
import { translateStaticStrings } from '../services/lingoService';

// Session cache: { [lang]: Map<string, string> }
const staticLingoCache: Record<string, Map<string, string>> = {};

export function useStaticLingo(strings: string[], sourceLocale: string, targetLocale: string): string[] {
  const [translated, setTranslated] = useState<string[]>(strings);
  const prevLangRef = useRef<string>(targetLocale);

  useEffect(() => {
    let isMounted = true;
    if (sourceLocale === targetLocale) {
      setTranslated(strings);
      return;
    }
    // Initialize cache for this language if needed
    if (!staticLingoCache[targetLocale]) {
      staticLingoCache[targetLocale] = new Map();
    }
    const cache = staticLingoCache[targetLocale];
    // Check which strings need translation
    const untranslated: string[] = [];
    const indices: number[] = [];
    strings.forEach((str, i) => {
      if (!cache.has(str)) {
        untranslated.push(str);
        indices.push(i);
      }
    });
    if (untranslated.length === 0) {
      // All cached
      setTranslated(strings.map(str => cache.get(str) || str));
      return;
    }
    // Translate missing
    translateStaticStrings(untranslated, sourceLocale, targetLocale).then(results => {
      if (!isMounted) return;
      results.forEach((res, i) => {
        cache.set(untranslated[i], res);
      });
      setTranslated(strings.map(str => cache.get(str) || str));
    });
    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, [strings.join('|'), sourceLocale, targetLocale]);

  // If language changes, update
  useEffect(() => {
    if (prevLangRef.current !== targetLocale) {
      prevLangRef.current = targetLocale;
      setTranslated(strings);
    }
    // eslint-disable-next-line
  }, [targetLocale]);

  return translated;
} 