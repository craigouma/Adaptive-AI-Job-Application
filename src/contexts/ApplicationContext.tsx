import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Question, Answer, Role } from '../types';

interface ApplicationState {
  role: Role;
  currentQuestion: Question | null;
  answers: Answer[];
  isLoading: boolean;
  isCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  error: string | null;
}

type ApplicationAction =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_CURRENT_QUESTION'; payload: Question | null }
  | { type: 'ADD_ANSWER'; payload: Answer }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_COMPLETED'; payload: boolean }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_APPLICATION' }
  | { type: 'INITIALIZE_APPLICATION'; payload: { question: Question | null; totalSteps: number } };

const initialState: ApplicationState = {
  role: 'frontend-engineer',
  currentQuestion: null,
  answers: [],
  isLoading: false,
  isCompleted: false,
  currentStep: 1,
  totalSteps: 6,
  error: null,
};

function applicationReducer(state: ApplicationState, action: ApplicationAction): ApplicationState {
  switch (action.type) {
    case 'SET_ROLE':
      return {
        ...state,
        role: action.payload,
      };
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload,
      };
    case 'ADD_ANSWER':
      return {
        ...state,
        answers: [...state.answers, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_COMPLETED':
      return {
        ...state,
        isCompleted: action.payload,
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'RESET_APPLICATION':
      return {
        ...initialState,
        role: state.role, // Keep the current role
      };
    case 'INITIALIZE_APPLICATION':
      return {
        ...state,
        currentQuestion: action.payload.question,
        totalSteps: action.payload.totalSteps,
        answers: [],
        currentStep: 1,
        isCompleted: false,
        error: null,
      };
    default:
      return state;
  }
}

interface ApplicationContextType {
  state: ApplicationState;
  dispatch: React.Dispatch<ApplicationAction>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

interface ApplicationProviderProps {
  children: ReactNode;
}

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(applicationReducer, initialState);

  return (
    <ApplicationContext.Provider value={{ state, dispatch }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext must be used within an ApplicationProvider');
  }
  return context;
};