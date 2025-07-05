import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

interface ProductDetails {
  name: string;
  category: string;
  image: string | null;
}

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
