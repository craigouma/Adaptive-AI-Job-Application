import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, MessageSquare, Filter } from 'lucide-react';
import { QuestionAnalytics as QuestionAnalyticsType } from '../../types/admin';
import { adminApiService } from '../../services/adminApi';

export const QuestionAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<QuestionAnalyticsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    loadQuestionAnalytics();
  }, [roleFilter]);

  const loadQuestionAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await adminApiService.getQuestionAnalytics(
        roleFilter !== 'all' ? roleFilter : undefined
      );
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading question analytics:', err);
      setError('Failed to load question analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading question analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="frontend-engineer">Frontend Engineer</option>
            <option value="product-designer">Product Designer</option>
          </select>
        </div>
      </div>

      {/* Question Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analytics.map((question) => (
          <div key={question.questionKey} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {question.label}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{question.responseCount} responses</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>Avg. {question.averageResponseLength} chars</span>
                  </div>
                </div>
              </div>
              
              {question.dropOffRate > 15 && (
                <div className="flex items-center space-x-1 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">{Math.round(question.dropOffRate)}% drop-off</span>
                </div>
              )}
            </div>

            {/* Drop-off Rate Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Drop-off Rate</span>
                <span className={`font-medium ${
                  question.dropOffRate > 20 ? 'text-red-600' :
                  question.dropOffRate > 10 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {Math.round(question.dropOffRate)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    question.dropOffRate > 20 ? 'bg-red-500' :
                    question.dropOffRate > 10 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(question.dropOffRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Common Responses */}
            {question.commonResponses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Common Responses</h4>
                <div className="space-y-2">
                  {question.commonResponses.slice(0, 3).map((response, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 truncate flex-1 mr-2">
                        {String(response.value).length > 50 
                          ? `${String(response.value).substring(0, 50)}...`
                          : String(response.value)
                        }
                      </span>
                      <span className="text-gray-500 font-medium">{response.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {analytics.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics available</h3>
          <p className="mt-1 text-sm text-gray-500">
            No question analytics data found for the selected filters.
          </p>
        </div>
      )}
    </div>
  );
};