import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../lib/axios';

export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
    [key: string]: unknown;
  };
  quantity: number;
  subtotal: number;
  unitprice: number;
}

export interface CartData {
  items: CartItem[];
  total: number;
}

interface UseCartReturn {
  cart: CartData | null;
  loading: boolean;
  error: string | null;
  refreshCart: () => void;
  resetError: () => void;
}

/*
 * Custom hook to manage cart state and fetch cart data from the API.
 *
 * @returns {UseCartReturn} An object containing:
 * - cart: The current cart data or null if not loaded
 * - loading: Boolean indicating if the cart is being loaded
 * - error: Error message if any occurred during fetch
 * - refreshCart: Function to manually refresh the cart data
 * - resetError: Function to reset error state
 */
export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const validateCartData = (data: unknown): CartData => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid cart data format');
    }

    const cartData = data as { items?: unknown; total?: unknown };
    
    if (!Array.isArray(cartData.items)) {
      throw new Error('Cart items must be an array');
    }

    if (typeof cartData.total !== 'number' || cartData.total < 0) {
      throw new Error('Cart total must be a non-negative number');
    }

    return cartData as CartData;
  };

  const fetchCart = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/cart', {
        signal: abortControllerRef.current.signal
      });

      const validatedCart = validateCartData(response.data);
      setCart(validatedCart);
    } catch (err: unknown) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cart';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return { cart, loading, error, refreshCart, resetError };
}
