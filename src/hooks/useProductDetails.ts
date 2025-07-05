import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

interface ProductDetails {
  name: string;
  category: string;
  image: string | null;
}

/*
    * Custom hook to fetch product details by ID.
    *
    * @param {number | null} productId - The ID of the product to fetch.
    * @returns {Object} An object containing:
    * - data: The product details or null if not found
    * - loading: Boolean indicating if the request is in progress
    * - error: Error message if any occurred during the request
    */
export function useProductDetails(productId: number | null) {
  const [data, setData] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/products/${productId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch product");
        const json = await res.json();
        setData({
          name: json.name,
          category: json.category?.name ?? "",
          image: Array.isArray(json.images) && json.images.length > 0 ? json.images[0].url : null,
        });
      })
      .catch((err) => setError(err.message || "Unknown error"))
      .finally(() => setLoading(false));
  }, [productId]);

  return { data, loading, error };
}
