import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";


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

export function useCart() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const userToken = sessionStorage.getItem("jwt_token");
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "GET",
        headers: {
          "Authorization": userToken ? `${userToken}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch cart");
      }
      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
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
