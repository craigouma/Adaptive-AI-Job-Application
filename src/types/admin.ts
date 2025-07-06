import { Role } from './index';

export interface AdminApplication {
  id: string;
  role: Role;
  answers: Array<{ key: string; value: string | number }>;
  created_at: string;
  updated_at: string;
  score?: number;
  status?: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
}

export interface ApplicationAnalytics {
  totalApplications: number;
  applicationsByRole: Record<string, number>;
  completionRate: number;
  averageCompletionTime: number;
  dropOffPoints: Array<{
    questionKey: string;
    dropOffRate: number;
  }>;
  recentApplications: AdminApplication[];
  topCandidates: AdminApplication[];
}

export interface QuestionAnalytics {
  questionKey: string;
  label: string;
  responseCount: number;
  averageResponseLength: number;
  commonResponses: Array<{
    value: string;
    count: number;
  }>;
  dropOffRate: number;
}

export interface CandidateScore {
  applicationId: string;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  communicationScore: number;
  cultureFitScore: number;
  reasoning: string;
}