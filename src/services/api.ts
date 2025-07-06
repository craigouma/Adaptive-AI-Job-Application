import { NextQuestionRequest, NextQuestionResponse, ApplicationData } from '../types';

const getApiBaseUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('VITE_SUPABASE_URL environment variable is not set. Please check your .env file.');
    throw new Error('Supabase URL not configured. Please set up your environment variables.');
  }
  return `${supabaseUrl}/functions/v1`;
};

const getAuthHeaders = () => {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    console.error('VITE_SUPABASE_ANON_KEY environment variable is not set. Please check your .env file.');
    throw new Error('Supabase anonymous key not configured. Please set up your environment variables.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`,
  };
};

export const apiService = {
  async getNextQuestion(data: NextQuestionRequest): Promise<NextQuestionResponse> {
    try {
      console.log('Calling next-question function with:', data);
      
      // Check if environment variables are properly set
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      
      console.log('API Base URL:', baseUrl);
      
      const response = await fetch(`${baseUrl}/next-question`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Function response:', result);
      return result;
    } catch (error) {
      console.error('Error calling next-question function:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to Supabase. Please check your internet connection and Supabase configuration.');
      }
      
      throw new Error(`Failed to get next question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async submitApplication(data: ApplicationData): Promise<{ success: boolean }> {
    try {
      console.log('Calling submit-application function with:', data);
      
      const baseUrl = getApiBaseUrl();
      const headers = getAuthHeaders();
      
      const response = await fetch(`${baseUrl}/submit-application`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase function error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Function response:', result);
      return result;
    } catch (error) {
      console.error('Error calling submit-application function:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to Supabase. Please check your internet connection and Supabase configuration.');
      }
      
      throw new Error(`Failed to submit application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};