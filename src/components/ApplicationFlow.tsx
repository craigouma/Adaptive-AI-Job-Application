import React, { useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { ProgressIndicator } from './ProgressIndicator';
import { RoleToggle } from './RoleToggle';
import { CompletionCard } from './CompletionCard';
import { ErrorMessage } from './ErrorMessage';
import { useApplication } from '../hooks/useApplication';
import { Role } from '../types';
import { SUPPORTED_LANGUAGES } from '../services/lingoService';
import { useApplicationContext } from '../contexts/ApplicationContext';
import { useStaticLingo } from '../hooks/useStaticLingo';

export const ApplicationFlow: React.FC = () => {
  const {
    role,
    currentQuestion,
    isLoading,
    isCompleted,
    currentStep,
    totalSteps,
    error,
    progressPercentage,
    initializeApplication,
    submitAnswer,
    changeRole,
    restartApplication,
  } = useApplication();

  const { state: appState, setLanguage } = useApplicationContext();

  // Static UI strings to translate
  const [title, subtitle, languageLabel, loadingText] = useStaticLingo(
    [
      'Adaptive Job Application',
      'Personalized questions based on your role and responses',
      'Language:',
      'Loading your personalized application...'
    ],
    'en',
    appState.language
  );

  useEffect(() => {
    initializeApplication();
  }, [role, initializeApplication]);

  const handleRoleChange = (newRole: Role) => {
    changeRole(newRole);
  };

  const handleRestart = () => {
    restartApplication();
    // Re-initialize after restart
    setTimeout(() => {
      initializeApplication();
    }, 100);
  };

  // Language selector handler
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <div className="text-center sm:text-left mb-2 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 px-2">
              {subtitle}
            </p>
          </div>
          {/* Language Selector */}
          <div className="mt-2 sm:mt-0">
            <label htmlFor="language-select" className="mr-2 font-medium text-gray-700">🌐 {languageLabel}</label>
            <select
              id="language-select"
              value={appState.language}
              onChange={handleLanguageChange}
              className="border rounded px-2 py-1 focus:outline-none focus:ring focus:border-blue-400"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!isCompleted && (
          <>
            <RoleToggle role={role} onRoleChange={handleRoleChange} />
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              completedSteps={currentStep - 1}
            />
          </>
        )}

        <div className="flex justify-center px-2 sm:px-0">
          <div className="max-w-2xl w-full">
            {error && (
              <ErrorMessage 
                message={error} 
                onDismiss={() => {/* Could add dismiss functionality */}} 
              />
            )}
            
            {isCompleted ? (
              <CompletionCard role={role} onRestart={handleRestart} />
            ) : currentQuestion ? (
              <QuestionCard
                question={currentQuestion}
                onAnswer={submitAnswer}
                isLoading={isLoading}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{loadingText}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};