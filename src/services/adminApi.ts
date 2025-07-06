import { AdminApplication, ApplicationAnalytics, QuestionAnalytics, CandidateScore } from '../types/admin';

const getApiBaseUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }
  return `${supabaseUrl}/functions/v1`;
};

const getAuthHeaders = () => {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new Error('Supabase anonymous key not configured');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`,
  };
};

export const adminApiService = {
  async getApplications(): Promise<AdminApplication[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/admin-applications`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  async getAnalytics(): Promise<ApplicationAnalytics> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/admin-analytics`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  async getQuestionAnalytics(role?: string): Promise<QuestionAnalytics[]> {
    try {
      const url = new URL(`${getApiBaseUrl()}/admin-question-analytics`);
      if (role) {
        url.searchParams.append('role', role);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching question analytics:', error);
      throw error;
    }
  },

  async scoreCandidate(applicationId: string): Promise<CandidateScore> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/admin-score-candidate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error scoring candidate:', error);
      throw error;
    }
  },

  async updateApplicationStatus(applicationId: string, status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'): Promise<void> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/admin-update-status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ applicationId, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  async exportApplications(format: 'csv' | 'pdf', filters?: { role?: string; status?: string }): Promise<Blob> {
    try {
      const url = new URL(`${getApiBaseUrl()}/admin-export`);
      url.searchParams.append('format', format);
      if (filters?.role) url.searchParams.append('role', filters.role);
      if (filters?.status) url.searchParams.append('status', filters.status);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting applications:', error);
      throw error;
    }
  },
};