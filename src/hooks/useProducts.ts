import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";


export interface ProductImage {
  url: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  images: ProductImage[];
  category_name: string;
}

export function useProducts(categoryId: number = 6) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/products/search?category_id=${categoryId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data: unknown[]) => {
        const productsWithFullImageUrls = data.map((productRaw) => {
          const product = productRaw as {
            id: number;
            name: string;
            price: number;
            stock: number;
            description: string;
            images: { url: string }[];
            category?: { name?: string };
          };
          return {
            ...product,
            images: Array.isArray(product.images)
              ? product.images.map((img) => ({ url: `${API_BASE_URL}${img.url}` }))
              : [],
            category_name: product.category?.name || "",
          };
        });
        setProducts(productsWithFullImageUrls);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, [categoryId]);

  return { products, loading, error };
}
