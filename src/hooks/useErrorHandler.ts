import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorState {
  error: string | null;
  isError: boolean;
}

interface UseErrorHandlerReturn {
  error: string | null;
  isError: boolean;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (error: unknown, fallbackMessage?: string) => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R | null>;
}

export const useErrorHandler = (showToast = true): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false
  });
  const { toast } = useToast();

  const setError = useCallback((error: string | null) => {
    setErrorState({
      error,
      isError: !!error
    });

    if (error && showToast) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive'
      });
    }
  }, [toast, showToast]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false
    });
  }, []);

  const handleError = useCallback((error: unknown, fallbackMessage = 'An unexpected error occurred') => {
    let errorMessage = fallbackMessage;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('Error handled:', error);
    setError(errorMessage);
  }, [setError]);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        clearError();
        return await fn(...args);
      } catch (error) {
        handleError(error);
        return null;
      }
    };
  }, [clearError, handleError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    setError,
    clearError,
    handleError,
    withErrorHandling
  };
};