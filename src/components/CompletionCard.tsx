import React from 'react';
import { CheckCircle, Download } from 'lucide-react';
import { useApplication } from '../hooks/useApplication';
import { ROLE_LABELS, Role } from '../types';
import { useApplicationContext } from '../contexts/ApplicationContext';
import { useStaticLingo } from '../hooks/useStaticLingo';

interface CompletionCardProps {
  role: Role;
  onRestart: () => void;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({ role, onRestart }) => {
  const { answers } = useApplication();
  const roleLabel = ROLE_LABELS[role];
  const { state: appState } = useApplicationContext();
  const [completeTitle, thankYou, whatsNext, reviewMsg, startNew, downloadCopy] = useStaticLingo(
    [
      'Application Complete!',
      'Thank you for your interest in the {roleLabel} position.',
      "What's Next?",
      "Our team will review your application and get back to you within 3-5 business days. We'll send updates to your email address.",
      'Start New Application',
      'Download Copy'
    ],
    'en',
    appState.language
  );

  const handleDownloadCopy = () => {
    const applicationData = {
      role: roleLabel,
      submittedAt: new Date().toLocaleString(),
      answers: answers.reduce((acc, answer) => {
        acc[answer.key] = answer.value;
        return acc;
      }, {} as Record<string, string | number>)
    };

    const content = `Job Application - ${roleLabel}\nSubmitted: ${applicationData.submittedAt}\n\nApplication Details:\n${Object.entries(applicationData.answers).map(([key, value]) => `${key}: ${value}`).join('\n')}\n\nThank you for your interest in our ${roleLabel} position!`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roleLabel.replace(' ', '_')}_Application_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-2xl w-full text-center">
      <div className="mb-4 sm:mb-6">
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {completeTitle}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 px-2">
          {thankYou.replace('{roleLabel}', roleLabel)}
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{whatsNext}</h3>
          <p className="text-gray-600 text-sm sm:text-base">
            {reviewMsg}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg active:scale-95 touch-manipulation text-base"
          >
            {startNew}
          </button>
          <button 
            onClick={handleDownloadCopy}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-200 active:scale-95 touch-manipulation text-base"
          >
            <Download className="w-4 h-4" />
            <span>{downloadCopy}</span>
          </button>
        </div>
      </div>
    </div>
  );
};