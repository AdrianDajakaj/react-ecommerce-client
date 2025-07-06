import { useState } from 'react';
import api from '../lib/axios';

interface AddToCartResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
}

/*
 * Custom hook to handle adding products to the cart.
 *
 * @returns {AddToCartResult} An object containing:
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - success: Boolean indicating if the product was successfully added
 * - addToCart: Function to add a product to the cart
 */
export function useAddToCart(): AddToCartResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addToCart = async (productId: number, quantity: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post('/cart/add', {
        product_id: productId,
        quantity,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Unknown error');
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, addToCart };
}
