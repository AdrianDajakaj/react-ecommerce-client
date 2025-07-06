import { useEffect, useState } from 'react';
import api from '../lib/axios';

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

/*
 * Custom hook to fetch products by category ID.
 *
 * @param {number} categoryId - The ID of the category to fetch products from.
 * @returns {Object} An object containing:
 * - products: Array of products in the specified category
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 */
export function useProducts(categoryId: number = 6) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/search?category_id=${categoryId}`);
        const data: unknown[] = response.data;

        const productsWithFullImageUrls = data.map(productRaw => {
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
              ? product.images.map(img => ({ url: `${api.defaults.baseURL}${img.url}` }))
              : [],
            category_name: product.category?.name || '',
          };
        });
        setProducts(productsWithFullImageUrls);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return { products, loading, error };
}
