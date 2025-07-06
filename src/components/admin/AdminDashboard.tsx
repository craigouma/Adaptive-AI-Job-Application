import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, FileText, Download, Filter, Search, Star, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { AdminApplication, ApplicationAnalytics } from '../../types/admin';
import { adminApiService } from '../../services/adminApi';
import { adminAuthService } from '../../services/adminAuth';
import { AdminLogin } from './AdminLogin';
import { ROLE_LABELS } from '../../types';
import { ApplicationsList } from './ApplicationsList';
import { AnalyticsOverview } from './AnalyticsOverview';
import { QuestionAnalytics } from './QuestionAnalytics';
import { CandidateScoring } from './CandidateScoring';

type TabType = 'overview' | 'applications' | 'analytics' | 'scoring';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Check if user is already authenticated
    setIsAuthenticated(adminAuthService.isAuthenticated());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
    loadDashboardData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      const result = await adminAuthService.login(email, password);
      
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(result.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    adminAuthService.logout();
    setIsAuthenticated(false);
    setApplications([]);
    setAnalytics(null);
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminLogin 
        onLogin={handleLogin}
        isLoading={isLoggingIn}
        error={loginError}
      />
    );
  }
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [applicationsData, analyticsData] = await Promise.all([
        adminApiService.getApplications(),
        adminApiService.getAnalytics(),
      ]);
      
      setApplications(applicationsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const filters = {
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      
      const blob = await adminApiService.exportApplications(format, filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting applications:', err);
      setError('Failed to export applications. Please try again.');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.answers.some(answer => 
        String(answer.value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesRole = roleFilter === 'all' || app.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (app.status || 'pending') === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'text-green-600 bg-green-100';
      case 'reviewed': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shortlisted': return <CheckCircle className="w-4 h-4" />;
      case 'reviewed': return <Star className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage job applications and view analytics</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'applications', label: 'Applications', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: FileText },
              { id: 'scoring', label: 'AI Scoring', icon: Star },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && analytics && (
          <AnalyticsOverview analytics={analytics} />
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="frontend-engineer">Frontend Engineer</option>
                    <option value="product-designer">Product Designer</option>
                  </select>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <ApplicationsList 
              applications={filteredApplications}
              onStatusUpdate={loadDashboardData}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <QuestionAnalytics />
        )}

        {activeTab === 'scoring' && (
          <CandidateScoring applications={applications} />
        )}
      </div>
    </div>
  );
};