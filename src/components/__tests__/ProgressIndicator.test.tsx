import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressIndicator } from '../ProgressIndicator';

describe('ProgressIndicator', () => {
  it('renders progress information correctly', () => {
    render(
      <ProgressIndicator
        currentStep={3}
        totalSteps={6}
        completedSteps={2}
      />
    );

    expect(screen.getByText('Question 3 of 6')).toBeInTheDocument();
    expect(screen.getByText('33% Complete')).toBeInTheDocument();
  });

  it('renders step indicators correctly', () => {
    render(
      <ProgressIndicator
        currentStep={3}
        totalSteps={6}
        completedSteps={2}
      />
    );

    // Should have 6 step indicators
    const stepIndicators = screen.getAllByRole('button');
    expect(stepIndicators).toHaveLength(6);
  });

  it('calculates progress percentage correctly', () => {
    render(
      <ProgressIndicator
        currentStep={4}
        totalSteps={5}
        completedSteps={3}
      />
    );

    expect(screen.getByText('60% Complete')).toBeInTheDocument();
  });
});