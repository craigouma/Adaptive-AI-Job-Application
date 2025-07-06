interface TranslationConfig {
  apiKey: string;
  defaultLanguage: string;
  supportedLanguages: string[];
}

class LingoService {
  private apiKey: string;
  private currentLanguage: string = 'en';
  private translations: Map<string, Map<string, string>> = new Map();

  constructor(config: TranslationConfig) {
    this.apiKey = config.apiKey;
    this.currentLanguage = config.defaultLanguage;
  }

  async initialize() {
    try {
      console.log('Lingo service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Lingo service:', error);
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      // Check cache first
      const cached = this.getFromCache(text, targetLanguage);
      if (cached) return cached;

      // Skip translation if no API key
      if (!this.apiKey) {
        console.warn('No Lingo API key provided, returning original text');
        return text;
      }

      // Translate using direct API call
      const response = await fetch('https://api.lingo.dev/v1/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text,
          target_language: targetLanguage,
          source_language: 'en',
          context: 'job_application'
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const result = await response.json();
      const translated = result.translated_text || text;

      // Cache the result
      this.setCache(text, targetLanguage, translated);
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  }

  async translateQuestion(question: any, targetLanguage: string) {
    if (targetLanguage === 'en') return question;

    try {
      const translatedQuestion = {
        ...question,
        label: await this.translateText(question.label, targetLanguage),
      };

      // Translate options if they exist
      if (question.options) {
        translatedQuestion.options = await Promise.all(
          question.options.map((option: string) => 
            this.translateText(option, targetLanguage)
          )
        );
      }

      return translatedQuestion;
    } catch (error) {
      console.error('Question translation error:', error);
      return question;
    }
  }

  async translateApplicationData(applicationData: any, targetLanguage: string) {
    if (targetLanguage === 'en') return applicationData;

    try {
      const translatedAnswers = await Promise.all(
        applicationData.answers.map(async (answer: any) => ({
          ...answer,
          value: typeof answer.value === 'string' 
            ? await this.translateText(answer.value, targetLanguage)
            : answer.value
        }))
      );

      return {
        ...applicationData,
        answers: translatedAnswers
      };
    } catch (error) {
      console.error('Application data translation error:', error);
      return applicationData;
    }
  }

  setLanguage(language: string) {
    this.currentLanguage = language;
    localStorage.setItem('preferredLanguage', language);
  }

  getCurrentLanguage(): string {
    return localStorage.getItem('preferredLanguage') || this.currentLanguage;
  }

  getSupportedLanguages() {
    return [
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
      { code: 'ru', name: 'Русский', flag: '🇷🇺' }
    ];
  }

  private getFromCache(text: string, language: string): string | null {
    const languageCache = this.translations.get(language);
    return languageCache?.get(text) || null;
  }

  private setCache(text: string, language: string, translation: string) {
    if (!this.translations.has(language)) {
      this.translations.set(language, new Map());
    }
    this.translations.get(language)!.set(text, translation);
  }
}

// Create singleton instance
const lingoConfig: TranslationConfig = {
  apiKey: import.meta.env.VITE_LINGO_API_KEY || '',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru']
};

export const lingoService = new LingoService(lingoConfig);