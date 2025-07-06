import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  completedSteps
}) => {
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm sm:text-base font-medium text-gray-700">
          Question {currentStep} of {totalSteps}
        </span>
        <span className="text-sm sm:text-base font-medium text-gray-700">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-3 sm:mt-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-300 ${
              index < completedSteps
                ? 'bg-green-500 border-green-500 text-white'
                : index === currentStep - 1
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}
          >
            {index < completedSteps ? (
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <span className="text-xs sm:text-sm font-semibold">{index + 1}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};