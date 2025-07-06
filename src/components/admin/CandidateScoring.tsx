import React, { useState } from 'react';
import { Star, Brain, TrendingUp, Users, Award } from 'lucide-react';
import { AdminApplication, CandidateScore } from '../../types/admin';
import { ROLE_LABELS } from '../../types';
import { adminApiService } from '../../services/adminApi';

interface CandidateScoringProps {
  applications: AdminApplication[];
}

export const CandidateScoring: React.FC<CandidateScoringProps> = ({ applications }) => {
  const [scores, setScores] = useState<Record<string, CandidateScore>>({});
  const [isScoring, setIsScoring] = useState<Record<string, boolean>>({});
  const [scoringErrors, setScoringErrors] = useState<Record<string, string>>({});

  const handleScoreCandidate = async (applicationId: string) => {
    setIsScoring(prev => ({ ...prev, [applicationId]: true }));
    setScoringErrors(prev => ({ ...prev, [applicationId]: '' }));
    
    try {
      const score = await adminApiService.scoreCandidate(applicationId);
      setScores(prev => ({ ...prev, [applicationId]: score }));
    } catch (error) {
      console.error('Error scoring candidate:', error);
      setScoringErrors(prev => ({ 
        ...prev, 
        [applicationId]: 'Failed to score candidate. Please try again.' 
      }));
    } finally {
      setIsScoring(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleScoreAllCandidates = async () => {
    const unscored = applications.filter(app => !scores[app.id]);
    
    for (const application of unscored) {
      await handleScoreCandidate(application.id);
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  const scoredApplications = applications.filter(app => scores[app.id]);
  const averageScore = scoredApplications.length > 0 
    ? scoredApplications.reduce((sum, app) => sum + scores[app.id].overallScore, 0) / scoredApplications.length
    : 0;

  const topCandidates = scoredApplications
    .sort((a, b) => scores[b.id].overallScore - scores[a.id].overallScore)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Scoring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI Scored</p>
              <p className="text-2xl font-bold text-gray-900">{scoredApplications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageScore > 0 ? Math.round(averageScore) : '--'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Top Candidates</p>
              <p className="text-2xl font-bold text-gray-900">
                {topCandidates.filter(app => scores[app.id].overallScore >= 80).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Candidate Scoring</h3>
            <p className="text-gray-600 mt-1">
              Use AI to automatically score candidates based on their responses
            </p>
          </div>
          <button
            onClick={handleScoreAllCandidates}
            disabled={Object.values(isScoring).some(Boolean)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>Score All Candidates</span>
          </button>
        </div>
      </div>

      {/* Top Candidates */}
      {topCandidates.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Candidates</h3>
          <div className="space-y-4">
            {topCandidates.map((application, index) => {
              const score = scores[application.id];
              const nameAnswer = application.answers.find(a => a.key === 'name');
              const emailAnswer = application.answers.find(a => a.key === 'email');
              
              return (
                <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {nameAnswer?.value || 'Unknown'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {emailAnswer?.value} • {ROLE_LABELS[application.role]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(score.overallScore)}`}>
                        {getScoreGrade(score.overallScore)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{score.overallScore}/100</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Candidates with Scoring */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Candidate Scoring</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Communication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => {
                const nameAnswer = application.answers.find(a => a.key === 'name');
                const emailAnswer = application.answers.find(a => a.key === 'email');
                const score = scores[application.id];
                const loading = isScoring[application.id];
                const error = scoringErrors[application.id];
                
                return (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {nameAnswer?.value || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {emailAnswer?.value || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ROLE_LABELS[application.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {score ? (
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(score.overallScore)}`}>
                            {getScoreGrade(score.overallScore)}
                          </span>
                          <span className="text-sm text-gray-900">{score.overallScore}/100</span>
                        </div>
                      ) : loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-500">Scoring...</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not scored</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {score ? `${score.skillsScore}/100` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {score ? `${score.experienceScore}/100` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {score ? `${score.communicationScore}/100` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!score && !loading && (
                        <button
                          onClick={() => handleScoreCandidate(application.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Star className="w-4 h-4" />
                          <span>Score</span>
                        </button>
                      )}
                      {error && (
                        <p className="text-red-600 text-xs">{error}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};