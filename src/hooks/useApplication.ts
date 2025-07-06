import { useCallback } from 'react';
import { useApplicationContext } from '../contexts/ApplicationContext';
import { apiService } from '../services/api';
import { Answer, Role } from '../types';

export const useApplication = () => {
  const { state, dispatch } = useApplicationContext();

  const initializeApplication = useCallback(async () => {
    console.log('Initializing application...');
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await apiService.getNextQuestion({ 
        answers: [], 
        role: state.role 
      });
      console.log('Initial question response:', response);
      
      dispatch({ 
        type: 'INITIALIZE_APPLICATION', 
        payload: { 
          question: response.question || null, 
          totalSteps: 6 // This could be dynamic based on role
        } 
      });
    } catch (error) {
      console.error('Error initializing application:', error);
      
      let errorMessage = 'Failed to load application. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('environment variables') || error.message.includes('Supabase')) {
          errorMessage = 'Please set up your Supabase connection. Check the "Connect to Supabase" button in the top right.';
        } else if (error.message.includes('Unable to connect')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Fallback question if API fails
      dispatch({
        type: 'SET_CURRENT_QUESTION',
        payload: {
          key: 'name',
          label: 'What is your full name?',
          type: 'text',
          required: true
        }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.role, dispatch]);

  const submitAnswer = useCallback(async (answer: Answer) => {
    console.log('Submitting answer:', { applicationId: state.applicationId, questionId: state.currentQuestion?.id, answer });
    dispatch({ type: 'ADD_ANSWER', payload: answer });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const newAnswers = [...state.answers, answer];

    try {
      const response = await apiService.getNextQuestion({ 
        answers: newAnswers, 
        role: state.role 
      });
      console.log('Submit response:', response);
      
      if (response.completed) {
        // Submit the application
        await apiService.submitApplication({
          role: state.role,
          answers: newAnswers,
        });
        dispatch({ type: 'SET_COMPLETED', payload: true });
      } else {
        dispatch({ type: 'SET_CURRENT_QUESTION', payload: response.question || null });
        dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      
      let errorMessage = 'Failed to submit answer. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('environment variables') || error.message.includes('Supabase')) {
          errorMessage = 'Please set up your Supabase connection. Check the "Connect to Supabase" button in the top right.';
        } else if (error.message.includes('Unable to connect')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.answers, state.role, state.currentStep, dispatch]);

  const changeRole = useCallback((newRole: Role) => {
    dispatch({ type: 'SET_ROLE', payload: newRole });
    dispatch({ type: 'RESET_APPLICATION' });
  }, [dispatch]);

  const restartApplication = useCallback(() => {
    dispatch({ type: 'RESET_APPLICATION' });
  }, [dispatch]);

  const getProgressPercentage = useCallback(() => {
    return Math.round((state.answers.length / state.totalSteps) * 100);
  }, [state.answers.length, state.totalSteps]);

  return {
    // State
    role: state.role,
    currentQuestion: state.currentQuestion,
    answers: state.answers,
    isLoading: state.isLoading,
    isCompleted: state.isCompleted,
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    error: state.error,
    
    // Computed values
    progressPercentage: getProgressPercentage(),
    
    // Actions
    initializeApplication,
    submitAnswer,
    changeRole,
    restartApplication,
  };
};