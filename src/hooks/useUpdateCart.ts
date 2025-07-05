import { useState } from "react";
import { API_BASE_URL } from "../config";

interface UpdateCartResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
}

export function useUpdateCart(): UpdateCartResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const userToken = sessionStorage.getItem("jwt_token");
      const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Authorization": userToken ? `${userToken}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update cart item");
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

  return { loading, error, success, updateCartItem };
}
