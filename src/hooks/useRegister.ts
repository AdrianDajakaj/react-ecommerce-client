import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../lib/axios';

interface Address {
  country: string;
  city: string;
  postcode: string;
  street: string;
  number: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname: string;
  address: Address;
}

interface RegisterResult {
  id: number;
  email: string;
  message: string;
}

interface UseRegisterReturn {
  register: (data: RegisterData) => Promise<RegisterResult>;
  loading: boolean;
  error: string | null;
  success: boolean;
  resetState: () => void;
}

/**
 * Custom hook to handle user registration.
 *
 * @returns {UseRegisterReturn} An object containing:
 * - register: Function to register a new user
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - success: Boolean indicating if the registration was successful
 * - resetState: Function to reset the hook state
 */
export function useRegister(): UseRegisterReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  const validateRegistrationData = (data: RegisterData): string | null => {
    // Email validation
    if (!data.email?.trim()) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return 'Please enter a valid email address';
    }

    // Password validation
    if (!data.password?.trim()) {
      return 'Password is required';
    }

    if (data.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    // Name validation
    if (!data.name?.trim()) {
      return 'First name is required';
    }

    if (!data.surname?.trim()) {
      return 'Last name is required';
    }

    // Address validation
    if (!data.address) {
      return 'Address is required';
    }

    if (!data.address.country?.trim()) {
      return 'Country is required';
    }

    if (!data.address.city?.trim()) {
      return 'City is required';
    }

    if (!data.address.postcode?.trim()) {
      return 'Postcode is required';
    }

    if (!data.address.street?.trim()) {
      return 'Street is required';
    }

    if (!data.address.number?.trim()) {
      return 'House number is required';
    }

    return null;
  };

  const register = useCallback(async (data: RegisterData): Promise<RegisterResult> => {
    // Input validation
    const validationError = validateRegistrationData(data);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/users/register', data, {
        signal: abortControllerRef.current.signal,
      });
      const result = response.data as RegisterResult;

      setSuccess(true);
      return result;
    } catch (err: unknown) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }

      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error, success, resetState };
}
