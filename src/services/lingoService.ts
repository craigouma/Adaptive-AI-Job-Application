import { LingoDotDevEngine } from "lingo.dev/sdk";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const lingoDotDev = new LingoDotDevEngine({
  apiKey: import.meta.env.VITE_LINGO_API_KEY,
});

async function callSupabaseTranslate({ text, texts, sourceLocale, targetLocale }: { text?: string, texts?: string[], sourceLocale: string, targetLocale: string }) {
  const url = `${SUPABASE_URL}/functions/v1/translate`;
  const body: any = { sourceLocale, targetLocale };
  if (texts) body.texts = texts;
  if (text) body.text = text;
  const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase translate error: ${res.status}`);
  return res.json();
}

export async function translateText(text: string, sourceLocale: string, targetLocale: string, fast = false): Promise<string> {
  if (!text || sourceLocale === targetLocale) return text;
  try {
    const { translated } = await callSupabaseTranslate({ text, sourceLocale, targetLocale });
      return translated;
  } catch (error: any) {
    console.error("Translation failed:", error.message);
    return text;
  }
}

export async function translateObject(obj: object, sourceLocale: string, targetLocale: string, onProgress?: (progress: number) => void): Promise<any> {
  if (sourceLocale === targetLocale) return obj;
  try {
    return await lingoDotDev.localizeObject(obj, { sourceLocale, targetLocale }, onProgress);
  } catch (error: any) {
    console.error("Object translation failed:", error.message);
    return obj;
  }
}

export async function translateHtml(html: string, sourceLocale: string, targetLocale: string): Promise<string> {
  if (!html || sourceLocale === targetLocale) return html;
  try {
    return await lingoDotDev.localizeHtml(html, { sourceLocale, targetLocale });
  } catch (error: any) {
    console.error("HTML translation failed:", error.message);
    return html;
  }
}

export async function detectLanguage(text: string): Promise<string | null> {
  try {
    return await lingoDotDev.recognizeLocale(text);
  } catch (error: any) {
    console.error("Language detection failed:", error.message);
    return null;
  }
}

export async function translateStaticStrings(strings: string[], sourceLocale: string, targetLocale: string): Promise<string[]> {
  if (sourceLocale === targetLocale) return strings;
  try {
    const { translated } = await callSupabaseTranslate({ texts: strings, sourceLocale, targetLocale });
    return translated;
  } catch (error: any) {
    console.error("Static string batch translation failed:", error.message);
    return strings;
  }
}

export const SUPPORTED_LANGUAGES = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'pt', name: 'Português', flag: '🇵🇹' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];