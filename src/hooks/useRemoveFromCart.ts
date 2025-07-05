import { useState } from "react";
import { API_BASE_URL } from "../config";

interface RemoveFromCartResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  removeFromCart: (cartItemId: number) => Promise<void>;
}

export function useRemoveFromCart(): RemoveFromCartResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const removeFromCart = async (cartItemId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const userToken = sessionStorage.getItem("jwt_token");
      const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": userToken ? `${userToken}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to remove item from cart");
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

  return { loading, error, success, removeFromCart };
}
