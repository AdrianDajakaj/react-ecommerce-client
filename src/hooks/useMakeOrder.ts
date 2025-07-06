import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../lib/axios';

export type PaymentMethod =
  | 'CARD'
  | 'BLIK'
  | 'PAYPAL'
  | 'PAYPO'
  | 'GOOGLE_PAY'
  | 'APPLE_PAY'
  | 'ONLINE_TRANSFER';

interface OrderData {
  payment_method: PaymentMethod;
  shipping_address_id: number;
}

interface UserData {
  address_id?: number;
  id: number;
  email: string;
}

interface MakeOrderResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  makeOrder: (paymentMethod: PaymentMethod) => Promise<void>;
  resetSuccess: () => void;
  resetError: () => void;
}

/*
 * Custom hook to handle making an order.
 *
 * @returns {MakeOrderResult} An object containing:
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - success: Boolean indicating if the order was successfully created
 * - makeOrder: Function to create an order with a specified payment method
 * - resetSuccess: Function to reset the success state
 * - resetError: Function to reset the error state
 */
export function useMakeOrder(): MakeOrderResult {
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

  const resetSuccess = useCallback(() => {
    setSuccess(false);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const validatePaymentMethod = (paymentMethod: PaymentMethod): boolean => {
    const validMethods: PaymentMethod[] = [
      'CARD', 'BLIK', 'PAYPAL', 'PAYPO', 
      'GOOGLE_PAY', 'APPLE_PAY', 'ONLINE_TRANSFER'
    ];
    return validMethods.includes(paymentMethod);
  };

  const validateUserData = (data: unknown): UserData => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid user data format');
    }

    const userData = data as Record<string, unknown>;
    
    if (typeof userData.id !== 'number' || userData.id <= 0) {
      throw new Error('Invalid user ID');
    }

    if (typeof userData.address_id !== 'number' || userData.address_id <= 0) {
      throw new Error('User has no valid shipping address');
    }

    if (typeof userData.email !== 'string' || !userData.email.trim()) {
      throw new Error('Invalid user email');
    }

    return {
      id: userData.id,
      email: userData.email,
      address_id: userData.address_id,
    };
  };

  const getUserAddressId = useCallback(async (signal: AbortSignal): Promise<number> => {
    const userId = sessionStorage.getItem('user_id');

    if (!userId?.trim()) {
      throw new Error('User not authenticated');
    }

    // Validate user ID format
    const userIdNumber = parseInt(userId, 10);
    if (!Number.isInteger(userIdNumber) || userIdNumber <= 0) {
      throw new Error('Invalid user ID format');
    }

    const response = await api.get(`/users/${userIdNumber}`, { signal });
    const validatedUserData = validateUserData(response.data);

    return validatedUserData.address_id!;
  }, []);

  const makeOrder = useCallback(async (paymentMethod: PaymentMethod): Promise<void> => {
    // Input validation
    if (!validatePaymentMethod(paymentMethod)) {
      const errorMessage = 'Invalid payment method';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const shippingAddressId = await getUserAddressId(signal);

      const orderData: OrderData = {
        payment_method: paymentMethod,
        shipping_address_id: shippingAddressId,
      };

      await api.post('/orders', orderData, { signal });
      setSuccess(true);
    } catch (err: unknown) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getUserAddressId]);

  return { loading, error, success, makeOrder, resetSuccess, resetError };
}
