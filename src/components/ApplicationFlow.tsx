import React, { useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { ProgressIndicator } from './ProgressIndicator';
import { RoleToggle } from './RoleToggle';
import { CompletionCard } from './CompletionCard';
import { ErrorMessage } from './ErrorMessage';
import { useApplication } from '../hooks/useApplication';
import { Role } from '../types';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Adaptive Job Application
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-2">
            Personalized questions based on your role and responses
          </p>
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
                  <p className="text-gray-600">Loading your personalized application...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};