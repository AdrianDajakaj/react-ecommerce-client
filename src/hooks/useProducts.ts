import { useEffect, useState, useCallback, useRef } from 'react';
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

interface RawProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  images: { url: string }[];
  category?: { name?: string };
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/*
 * Custom hook to fetch products by category ID.
 *
 * @param {number} categoryId - The ID of the category to fetch products from.
 * @returns {UseProductsReturn} An object containing:
 * - products: Array of products in the specified category
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - refetch: Function to manually refetch products
 */
export function useProducts(categoryId: number = 6): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to transform raw product data
  const transformProductImages = useCallback((images: { url: string }[]): ProductImage[] => {
    if (!Array.isArray(images)) {
      return [];
    }
    return images.map(img => ({
      url: `${api.defaults.baseURL}${img.url}`
    }));
  }, []);

  // Helper function to transform raw product
  const transformProduct = useCallback((productRaw: unknown): Product => {
    const product = productRaw as RawProduct;
    return {
      ...product,
      images: transformProductImages(product.images),
      category_name: product.category?.name ?? '',
    };
  }, [transformProductImages]);

  const fetchProducts = useCallback(async () => {
    // Input validation
    if (!Number.isInteger(categoryId) || categoryId < 0) {
      setError('Invalid category ID');
      setLoading(false);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/products/search?category_id=${categoryId}`, {
        signal: abortControllerRef.current.signal
      });
      
      const data: unknown[] = response.data;
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      const transformedProducts = data.map(transformProduct);
      setProducts(transformedProducts);
    } catch (err: unknown) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [categoryId, transformProduct]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  return { products, loading, error, refetch };
}
