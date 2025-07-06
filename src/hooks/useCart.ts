import { useEffect, useState } from 'react';
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

/*
 * Custom hook to manage cart state and fetch cart data from the API.
 *
 * @returns {Object} An object containing:
 * - cart: The current cart data or null if not loaded
 * - loading: Boolean indicating if the cart is being loaded
 * - error: Error message if any occurred during fetch
 * - refreshCart: Function to manually refresh the cart data
 */
export function useCart() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const refreshCart = () => {
    fetchCart();
  };

  return { cart, loading, error, refreshCart };
}
