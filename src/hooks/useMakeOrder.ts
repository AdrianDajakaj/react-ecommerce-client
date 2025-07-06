import { useState } from 'react';
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

interface MakeOrderResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  makeOrder: (paymentMethod: PaymentMethod) => Promise<void>;
  resetSuccess: () => void;
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
 */
export function useMakeOrder(): MakeOrderResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getUserAddressId = async (): Promise<number> => {
    const userId = sessionStorage.getItem('user_id');

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await api.get(`/users/${userId}`);
    const userData = response.data;

    if (!userData.address_id) {
      throw new Error('User has no shipping address');
    }

    return userData.address_id;
  };

  const makeOrder = async (paymentMethod: PaymentMethod) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const shippingAddressId = await getUserAddressId();

      const orderData: OrderData = {
        payment_method: paymentMethod,
        shipping_address_id: shippingAddressId,
      };

      await api.post('/orders', orderData);
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

  const resetSuccess = () => {
    setSuccess(false);
    setError(null);
  };

  return { loading, error, success, makeOrder, resetSuccess };
}
