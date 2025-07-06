export interface Question {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  options?: string[];
  required?: boolean;
}

export interface Answer {
  key: string;
  value: string | number;
}

export interface ApplicationData {
  id?: string;
  role: Role;
  answers: Answer[];
  created_at?: string;
}

export interface NextQuestionRequest {
  answers: Answer[];
  role: Role;
}

export interface NextQuestionResponse {
  question?: Question;
  completed?: boolean;
  message?: string;
}

export const ROLES = [
  'frontend-engineer',
  'product-designer',
  'backend-engineer',
  'fullstack-engineer',
  'data-scientist',
  'devops-engineer',
  'product-manager',
  'ui-ux-designer',
  'mobile-developer',
  'qa-engineer'
] as const;

export type Role = typeof ROLES[number];

export const ROLE_LABELS: Record<Role, string> = {
  'frontend-engineer': 'Frontend Engineer',
  'product-designer': 'Product Designer',
  'backend-engineer': 'Backend Engineer',
  'fullstack-engineer': 'Full Stack Engineer',
  'data-scientist': 'Data Scientist',
  'devops-engineer': 'DevOps Engineer',
  'product-manager': 'Product Manager',
  'ui-ux-designer': 'UI/UX Designer',
  'mobile-developer': 'Mobile Developer',
  'qa-engineer': 'QA Engineer'
};