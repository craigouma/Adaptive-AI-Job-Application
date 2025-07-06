import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../QuestionCard';
import { Question } from '../../types';

describe('QuestionCard', () => {
  const mockQuestion: Question = {
    key: 'name',
    label: 'What is your name?',
    type: 'text',
    required: true
  };

  const mockOnAnswer = vi.fn();

  it('renders question correctly', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={mockOnAnswer} />);
    
    expect(screen.getByText('What is your name?')).toBeInTheDocument();
    expect(screen.getByText('* Required')).toBeInTheDocument();
  });

  it('calls onAnswer when form is submitted', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={mockOnAnswer} />);
    
    const input = screen.getByPlaceholderText('Type your answer...');
    const submitButton = screen.getByRole('button', { name: /continue/i });

    fireEvent.change(input, { target: { value: 'John Doe' } });
    fireEvent.click(submitButton);

    expect(mockOnAnswer).toHaveBeenCalledWith({
      key: 'name',
      value: 'John Doe'
    });
  });

  it('renders select options correctly', () => {
    const selectQuestion: Question = {
      key: 'experience',
      label: 'Years of experience?',
      type: 'select',
      options: ['0-1 years', '2-3 years', '4-5 years']
    };

    render(<QuestionCard question={selectQuestion} onAnswer={mockOnAnswer} />);
    
    expect(screen.getByText('0-1 years')).toBeInTheDocument();
    expect(screen.getByText('2-3 years')).toBeInTheDocument();
    expect(screen.getByText('4-5 years')).toBeInTheDocument();
  });

  it('disables submit button when required field is empty', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={mockOnAnswer} />);
    
    const submitButton = screen.getByRole('button', { name: /continue/i });
    expect(submitButton).toBeDisabled();
  });
});