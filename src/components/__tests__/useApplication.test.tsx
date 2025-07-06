import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ApplicationProvider } from '../contexts/ApplicationContext';
import { useApplication } from '../hooks/useApplication';
import { apiService } from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  apiService: {
    getNextQuestion: vi.fn(),
    submitApplication: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ApplicationProvider>{children}</ApplicationProvider>
);

describe('useApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial state correctly', () => {
    const { result } = renderHook(() => useApplication(), { wrapper });

    expect(result.current.role).toBe('frontend-engineer');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.currentStep).toBe(1);
    expect(result.current.answers).toEqual([]);
    expect(result.current.progressPercentage).toBe(0);
  });

  it('calculates progress percentage correctly', () => {
    const { result } = renderHook(() => useApplication(), { wrapper });

    // Simulate adding answers
    act(() => {
      result.current.submitAnswer({ key: 'test1', value: 'value1' });
    });

    // Progress should be updated based on answers
    expect(result.current.progressPercentage).toBeGreaterThan(0);
  });

  it('handles role change correctly', () => {
    const { result } = renderHook(() => useApplication(), { wrapper });

    act(() => {
      result.current.changeRole('product-designer');
    });

    expect(result.current.role).toBe('product-designer');
    expect(result.current.answers).toEqual([]); // Should reset answers
  });

  it('handles application restart correctly', () => {
    const { result } = renderHook(() => useApplication(), { wrapper });

    // Add some state
    act(() => {
      result.current.submitAnswer({ key: 'test', value: 'value' });
    });

    // Restart
    act(() => {
      result.current.restartApplication();
    });

    expect(result.current.answers).toEqual([]);
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isCompleted).toBe(false);
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('API Error');
    vi.mocked(apiService.getNextQuestion).mockRejectedValue(mockError);

    const { result } = renderHook(() => useApplication(), { wrapper });

    await act(async () => {
      await result.current.initializeApplication();
    });

    expect(result.current.error).toBe('Failed to load application. Please try again.');
    expect(result.current.isLoading).toBe(false);
  });
});