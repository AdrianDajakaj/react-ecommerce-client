import { useState } from "react";
import { API_BASE_URL } from "../config";

export type PaymentMethod = "CARD" | "BLIK" | "PAYPAL" | "PAYPO" | "GOOGLE_PAY" | "APPLE_PAY" | "ONLINE_TRANSFER";

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

export function useMakeOrder(): MakeOrderResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getUserAddressId = async (): Promise<number> => {
    const userToken = sessionStorage.getItem("jwt_token");
    const userId = sessionStorage.getItem("user_id");
    
    if (!userToken || !userId) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Authorization": userToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to get user data");
    }

    const userData = await response.json();
    
    if (!userData.address_id) {
      throw new Error("User has no shipping address");
    }

    return userData.address_id;
  };

  const makeOrder = async (paymentMethod: PaymentMethod) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const userToken = sessionStorage.getItem("jwt_token");
      
      if (!userToken) {
        throw new Error("User not authenticated");
      }

      const shippingAddressId = await getUserAddressId();

      const orderData: OrderData = {
        payment_method: paymentMethod,
        shipping_address_id: shippingAddressId,
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Authorization": userToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create order");
      }

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

  const resetSuccess = () => {
    setSuccess(false);
    setError(null);
  };

  return { loading, error, success, makeOrder, resetSuccess };
}
