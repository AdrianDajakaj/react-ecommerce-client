import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../lib/axios';

interface AddToCartResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  resetState: () => void;
}

/*
 * Custom hook to handle adding products to the cart.
 *
 * @returns {AddToCartResult} An object containing:
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - success: Boolean indicating if the product was successfully added
 * - addToCart: Function to add a product to the cart
 * - resetState: Function to reset the hook state
 */
export function useAddToCart(): AddToCartResult {
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

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    // Input validation
    if (!Number.isInteger(productId) || productId <= 0) {
      setError('Invalid product ID');
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('Quantity must be a positive integer');
      return;
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
      await api.post(
        '/cart/add',
        {
          product_id: productId,
          quantity,
        },
        {
          signal: abortControllerRef.current.signal,
        }
      );
      setSuccess(true);
    } catch (err: unknown) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      if (err instanceof Error) {
        setError(err.message || 'Failed to add product to cart');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, addToCart, resetState };
}
