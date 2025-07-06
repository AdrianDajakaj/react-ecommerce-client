import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../lib/axios';

interface RemoveFromCartResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  removeFromCart: (cartItemId: number) => Promise<void>;
  resetState: () => void;
}

/**
 * Custom hook to handle removing items from the cart.
 *
 * @returns {RemoveFromCartResult} An object containing:
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - success: Boolean indicating if the item was successfully removed
 * - removeFromCart: Function to remove an item from the cart
 * - resetState: Function to reset the hook state
 */
export function useRemoveFromCart(): RemoveFromCartResult {
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

  const removeFromCart = useCallback(async (cartItemId: number): Promise<void> => {
    // Input validation
    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      const errorMessage = 'Invalid cart item ID';
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
    setSuccess(false);

    try {
      await api.delete(`/cart/item/${cartItemId}`, {
        signal: abortControllerRef.current.signal,
      });
      setSuccess(true);
    } catch (err: unknown) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        throw err;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, removeFromCart, resetState };
}
