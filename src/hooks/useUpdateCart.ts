import { useState } from 'react';
import api from '../lib/axios';

interface UpdateCartResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
}

/**
 * Custom hook to handle updating items in the cart.
 *
 * @returns {UpdateCartResult} An object containing:
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - success: Boolean indicating if the item was successfully updated
 * - updateCartItem: Function to update an item in the cart
 */
export function useUpdateCart(): UpdateCartResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    console.log('Updating cart item:', { cartItemId, quantity });
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.put(`/cart/item/${cartItemId}`, { quantity });
      console.log('PUT request successful');
      setSuccess(true);
    } catch (err) {
      console.log('PUT error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Unknown error');
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, updateCartItem };
}
