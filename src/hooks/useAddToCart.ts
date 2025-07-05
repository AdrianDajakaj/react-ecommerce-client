
import { useState } from "react";
import { API_BASE_URL } from "../config";


interface AddToCartResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
}

export function useAddToCart(): AddToCartResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addToCart = async (productId: number, quantity: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const userToken = sessionStorage.getItem("jwt_token");
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Authorization": userToken ? `${userToken}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to add to cart");
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

  return { loading, error, success, addToCart };
}
