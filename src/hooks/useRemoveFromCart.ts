import { useState } from "react";
import api from "../lib/axios";

interface RemoveFromCartResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  removeFromCart: (cartItemId: number) => Promise<void>;
}

/**
 * Custom hook to handle removing items from the cart.
 *
 * @returns {RemoveFromCartResult} An object containing:
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - success: Boolean indicating if the item was successfully removed
 * - removeFromCart: Function to remove an item from the cart
 */
export function useRemoveFromCart(): RemoveFromCartResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const removeFromCart = async (cartItemId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.delete(`/cart/item/${cartItemId}`);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Unknown error");
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, removeFromCart };
}
