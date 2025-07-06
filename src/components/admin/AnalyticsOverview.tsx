import React from 'react';
import { Users, TrendingUp, Clock, Target, Award, AlertTriangle } from 'lucide-react';
import { ApplicationAnalytics } from '../../types/admin';
import { ROLE_LABELS } from '../../types';

interface AnalyticsOverviewProps {
  analytics: ApplicationAnalytics;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ analytics }) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className={`w-6 h-6 ${getCompletionRateColor(analytics.completionRate)}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className={`text-2xl font-bold ${getCompletionRateColor(analytics.completionRate)}`}>
                {Math.round(analytics.completionRate)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Completion Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(analytics.averageCompletionTime)}
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
              <p className="text-2xl font-bold text-gray-900">{analytics.topCandidates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Role</h3>
          <div className="space-y-4">
            {Object.entries(analytics.applicationsByRole).map(([role, count]) => {
              const percentage = (count / analytics.totalApplications) * 100;
              return (
                <div key={role}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
                    </span>
                    <span className="text-sm text-gray-500">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drop-off Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Drop-off Points</h3>
          <div className="space-y-4">
            {analytics.dropOffPoints.slice(0, 5).map((point, index) => (
              <div key={point.questionKey} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    point.dropOffRate > 20 ? 'bg-red-500' : 
                    point.dropOffRate > 10 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm text-gray-700 capitalize">
                    {point.questionKey.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center">
                  {point.dropOffRate > 15 && <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />}
                  <span className={`text-sm font-medium ${
                    point.dropOffRate > 20 ? 'text-red-600' : 
                    point.dropOffRate > 10 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {Math.round(point.dropOffRate)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
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
                  Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentApplications.slice(0, 5).map((application) => {
                const nameAnswer = application.answers.find(a => a.key === 'name');
                const emailAnswer = application.answers.find(a => a.key === 'email');
                
                return (
                  <tr key={application.id}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {application.score ? (
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            application.score >= 80 ? 'bg-green-500' :
                            application.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm font-medium">{application.score}/100</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not scored</span>
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