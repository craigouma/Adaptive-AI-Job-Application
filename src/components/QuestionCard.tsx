import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2, Globe } from 'lucide-react';
import { Question, Answer } from '../types';

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
            placeholder="Share your thoughts..."
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
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
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
            placeholder="Enter a number..."
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
            placeholder="Type your answer..."
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
            {question.label}
          </h2>
          {question.required && (
            <p className="text-sm text-gray-500">* Required</p>
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
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};