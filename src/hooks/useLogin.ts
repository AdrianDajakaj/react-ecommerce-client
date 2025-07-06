import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../lib/axios';

interface LoginData {
  email: string;
  password: string;
}

interface LoginResult {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

interface UseLoginReturn {
  login: (data: LoginData) => Promise<LoginResult>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  token: string | null;
  resetError: () => void;
}

/*
 * Custom hook to handle user login and logout.
 *
 * @returns {UseLoginReturn} An object containing:
 * - login: Function to log in the user
 * - logout: Function to log out the user
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - token: JWT token if login was successful
 * - resetError: Function to reset error state
 */
export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (data: LoginData): Promise<LoginResult> => {
    // Input validation
    if (!data.email?.trim()) {
      const errorMessage = 'Email is required';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    if (!data.password?.trim()) {
      const errorMessage = 'Password is required';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      const errorMessage = 'Please enter a valid email address';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const response = await api.post('/users/login', data, {
        signal: abortControllerRef.current.signal,
      });
      const result = response.data as LoginResult;

      setToken(result.token);
      sessionStorage.setItem('jwt_token', result.token);

      // Use optional chaining
      if (result.user?.id) {
        sessionStorage.setItem('user_id', result.user.id.toString());
      }

      return result;
    } catch (err: unknown) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }

      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setError(null);
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_id');
  }, []);

  return { login, logout, loading, error, token, resetError };
}
