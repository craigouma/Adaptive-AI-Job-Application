import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApplicationProvider, useApplicationContext } from '../contexts/ApplicationContext';
import { useApplication } from '../hooks/useApplication';

// Test component to access context
const TestComponent = () => {
  const { state, dispatch } = useApplicationContext();
  
  return (
    <div>
      <div data-testid="role">{state.role}</div>
      <div data-testid="loading">{state.isLoading.toString()}</div>
      <div data-testid="completed">{state.isCompleted.toString()}</div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="answers-count">{state.answers.length}</div>
      
      <button 
        onClick={() => dispatch({ type: 'SET_ROLE', payload: 'product-designer' })}
        data-testid="change-role"
      >
        Change Role
      </button>
      
      <button 
        onClick={() => dispatch({ type: 'ADD_ANSWER', payload: { key: 'test', value: 'test-value' } })}
        data-testid="add-answer"
      >
        Add Answer
      </button>
      
      <button 
        onClick={() => dispatch({ type: 'SET_COMPLETED', payload: true })}
        data-testid="complete"
      >
        Complete
      </button>
    </div>
  );
};

describe('ApplicationContext', () => {
  it('provides initial state correctly', () => {
    render(
      <ApplicationProvider>
        <TestComponent />
      </ApplicationProvider>
    );

    expect(screen.getByTestId('role')).toHaveTextContent('frontend-engineer');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('completed')).toHaveTextContent('false');
    expect(screen.getByTestId('current-step')).toHaveTextContent('1');
    expect(screen.getByTestId('answers-count')).toHaveTextContent('0');
  });

  it('handles role change correctly', () => {
    render(
      <ApplicationProvider>
        <TestComponent />
      </ApplicationProvider>
    );

    fireEvent.click(screen.getByTestId('change-role'));
    expect(screen.getByTestId('role')).toHaveTextContent('product-designer');
  });

  it('handles adding answers correctly', () => {
    render(
      <ApplicationProvider>
        <TestComponent />
      </ApplicationProvider>
    );

    fireEvent.click(screen.getByTestId('add-answer'));
    expect(screen.getByTestId('answers-count')).toHaveTextContent('1');
  });

  it('handles completion correctly', () => {
    render(
      <ApplicationProvider>
        <TestComponent />
      </ApplicationProvider>
    );

    fireEvent.click(screen.getByTestId('complete'));
    expect(screen.getByTestId('completed')).toHaveTextContent('true');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useApplicationContext must be used within an ApplicationProvider');

    console.error = originalError;
  });
});