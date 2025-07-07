import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2, Globe } from 'lucide-react';
import { Question, Answer } from '../types';
import { useApplicationContext } from '../contexts/ApplicationContext';
import { translateText } from '../services/lingoService';
import { useStaticLingo } from '../hooks/useStaticLingo';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: Answer) => void;
  isLoading?: boolean;
  currentAnswer?: string | number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  isLoading = false,
  currentAnswer = ''
}) => {
  const [value, setValue] = useState<string | number>(currentAnswer);
  const [isAnimating, setIsAnimating] = useState(false);
  const { state: appState } = useApplicationContext();
  const lang = appState.language;

  // State for translated question and options
  const [translatedLabel, setTranslatedLabel] = useState(question.label);
  const [translatedOptions, setTranslatedOptions] = useState<string[]>(question.options || []);

  // Static UI strings
  const [requiredText, shareThoughts, selectOption, enterNumber, typeAnswer, processing, continueText] = useStaticLingo(
    [
      '* Required',
      'Share your thoughts...',
      'Select an option...',
      'Enter a number...',
      'Type your answer...',
      'Processing...',
      'Continue'
    ],
    'en',
    lang
  );

  // Translate question label and options on language change
  useEffect(() => {
    let isMounted = true;
    const doTranslate = async () => {
      if (lang === 'en') {
        setTranslatedLabel(question.label);
        setTranslatedOptions(question.options || []);
        console.log('[Lingo] Language is English, skipping translation.');
        return;
      }
      try {
        console.log('[Lingo] Translating question label:', question.label, 'from en to', lang);
        const label = await translateText(question.label, 'en', lang);
        console.log('[Lingo] Translated label:', label);
        let options: string[] = [];
        if (question.options) {
          console.log('[Lingo] Translating options:', question.options, 'from en to', lang);
          options = await Promise.all(question.options.map(async (opt) => {
            try {
              const translated = await translateText(opt, 'en', lang);
              console.log('[Lingo] Option:', opt, '->', translated);
              return translated;
            } catch (err) {
              console.error('[Lingo] Option translation error:', err);
              return opt;
            }
          }));
        }
        if (isMounted) {
          setTranslatedLabel(label);
          setTranslatedOptions(options);
        }
      } catch (err) {
        console.error('[Lingo] Question translation error:', err);
        setTranslatedLabel(question.label);
        setTranslatedOptions(question.options || []);
      }
    };
    doTranslate();
    return () => { isMounted = false; };
  }, [question, lang]);

  useEffect(() => {
    // Reset value when question changes
    setValue('');
  }, [question.key]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value && question.required) return;
    setIsAnimating(true);
    setTimeout(() => {
      onAnswer({ key: question.key, value });
      setValue(''); // Clear the input after submitting
      setIsAnimating(false);
    }, 200);
  };

  const renderInput = () => {
    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none h-28 sm:h-32 text-base"
            placeholder={shareThoughts}
            required={question.required}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base appearance-none bg-white"
            required={question.required}
          >
            <option value="">{selectOption}</option>
            {translatedOptions?.map((option, idx) => (
              <option key={question.options ? question.options[idx] : option} value={question.options ? question.options[idx] : option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
            placeholder={enterNumber}
            required={question.required}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
            placeholder={typeAnswer}
            required={question.required}
          />
        );
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 max-w-2xl w-full transform transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {translatedLabel}
          </h2>
          {question.required && (
            <p className="text-sm text-gray-500">{requiredText}</p>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          {renderInput()}
        </div>

        <button
          type="submit"
          disabled={isLoading || (!value && question.required)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-lg font-semibold transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center space-x-2 text-base sm:text-lg touch-manipulation"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{processing}</span>
            </>
          ) : (
            <>
              <span>{continueText}</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};