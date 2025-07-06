import React, { useState } from 'react';
import { X, Star, Download, Mail, Calendar, User, Briefcase } from 'lucide-react';
import { AdminApplication, CandidateScore } from '../../types/admin';
import { ROLE_LABELS } from '../../types';
import { adminApiService } from '../../services/adminApi';

interface ApplicationDetailModalProps {
  application: AdminApplication;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const [candidateScore, setCandidateScore] = useState<CandidateScore | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);

  const handleScoreCandidate = async () => {
    setIsScoring(true);
    setScoringError(null);
    
    try {
      const score = await adminApiService.scoreCandidate(application.id);
      setCandidateScore(score);
    } catch (error) {
      console.error('Error scoring candidate:', error);
      setScoringError('Failed to score candidate. Please try again.');
    } finally {
      setIsScoring(false);
    }
  };

  const handleDownloadApplication = () => {
    const nameAnswer = application.answers.find(a => a.key === 'name');
    const candidateName = nameAnswer?.value || 'Unknown';
    
    const content = `Job Application - ${ROLE_LABELS[application.role]}
Candidate: ${candidateName}
Applied: ${new Date(application.created_at).toLocaleString()}
Application ID: ${application.id}

Responses:
${application.answers.map(answer => `${answer.key}: ${answer.value}`).join('\n')}

${candidateScore ? `
AI Assessment:
Overall Score: ${candidateScore.overallScore}/100
Skills Score: ${candidateScore.skillsScore}/100
Experience Score: ${candidateScore.experienceScore}/100
Communication Score: ${candidateScore.communicationScore}/100
Culture Fit Score: ${candidateScore.cultureFitScore}/100

Reasoning: ${candidateScore.reasoning}
` : ''}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidateName}_${application.role}_application.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const nameAnswer = application.answers.find(a => a.key === 'name');
  const emailAnswer = application.answers.find(a => a.key === 'email');
  const experienceAnswer = application.answers.find(a => a.key === 'experience');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {nameAnswer?.value || 'Unknown Candidate'}
              </h2>
              <p className="text-gray-600">{ROLE_LABELS[application.role]} Application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Application Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{emailAnswer?.value || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Experience:</span>
                    <span className="text-sm font-medium">{experienceAnswer?.value || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Applied:</span>
                    <span className="text-sm font-medium">
                      {new Date(application.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* All Responses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Application Responses</h3>
                {application.answers.map((answer, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">
                      {answer.key.replace('_', ' ')}
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{String(answer.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Scoring */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Assessment</h3>
                
                {!candidateScore && !isScoring && (
                  <button
                    onClick={handleScoreCandidate}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Star className="w-4 h-4" />
                    <span>Score Candidate</span>
                  </button>
                )}

                {isScoring && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Analyzing candidate...</p>
                  </div>
                )}

                {scoringError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{scoringError}</p>
                  </div>
                )}

                {candidateScore && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {candidateScore.overallScore}/100
                      </div>
                      <p className="text-sm text-gray-600">Overall Score</p>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'Skills', score: candidateScore.skillsScore },
                        { label: 'Experience', score: candidateScore.experienceScore },
                        { label: 'Communication', score: candidateScore.communicationScore },
                        { label: 'Culture Fit', score: candidateScore.cultureFitScore },
                      ].map(({ label, score }) => (
                        <div key={label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-medium">{score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                score >= 80 ? 'bg-green-500' :
                                score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2">AI Reasoning</h4>
                      <p className="text-sm text-gray-700">{candidateScore.reasoning}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleDownloadApplication}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Application</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};