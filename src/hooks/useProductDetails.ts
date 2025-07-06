import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../lib/axios';

interface ProductDetails {
  name: string;
  category: string;
  image: string | null;
}

interface RawProductDetails {
  name: string;
  category?: { name?: string };
  images?: { url: string }[];
}

interface UseProductDetailsReturn {
  data: ProductDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  resetError: () => void;
}

/*
 * Custom hook to fetch product details by ID.
 *
 * @param {number | null} productId - The ID of the product to fetch.
 * @returns {UseProductDetailsReturn} An object containing:
 * - data: The product details or null if not found
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - refetch: Function to manually refetch product details
 * - resetError: Function to reset error state
 */
export function useProductDetails(productId: number | null): UseProductDetailsReturn {
  const [data, setData] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const validateProductData = (data: unknown): RawProductDetails => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid product data format');
    }

    const product = data as Record<string, unknown>;
    
    if (typeof product.name !== 'string' || !product.name.trim()) {
      throw new Error('Product must have a valid name');
    }

    return {
      name: product.name,
      category: product.category as { name?: string } | undefined,
      images: Array.isArray(product.images) ? product.images : undefined,
    };
  };

  const fetchProductDetails = useCallback(async () => {
    // Input validation
    if (!productId || !Number.isInteger(productId) || productId <= 0) {
      setData(null);
      setError(null);
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
      const response = await api.get(`/products/${productId}`, {
        signal: abortControllerRef.current.signal
      });

      const validatedProduct = validateProductData(response.data);
      
      setData({
        name: validatedProduct.name,
        category: validatedProduct.category?.name ?? '',
        image: Array.isArray(validatedProduct.images) && validatedProduct.images.length > 0 
          ? `${api.defaults.baseURL}${validatedProduct.images[0].url}` 
          : null,
      });
    } catch (err: unknown) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product details';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const refetch = useCallback(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  return { data, loading, error, refetch, resetError };
}
