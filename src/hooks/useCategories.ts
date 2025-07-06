import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../lib/axios';

export interface CategoryNode {
  id: number;
  name: string;
  icon_url: string | null;
  subcategories?: CategoryNode[];
}

interface RawCategory {
  id: number;
  name: string;
  icon_url: string | null;
  parent_id?: number;
}

interface UseCategoriesReturn {
  tree: CategoryNode[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  resetError: () => void;
}

/**
 * Custom hook to fetch and manage the category tree.
 *
 * @returns {UseCategoriesReturn} An object containing:
 * - tree: The category tree structure
 * - loading: Boolean indicating if the data is being loaded
 * - error: Error message if any occurred during fetch
 * - refetch: Function to manually refetch categories
 * - resetError: Function to reset error state
 */
export function useCategories(): UseCategoriesReturn {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
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

  const validateCategory = (data: unknown): RawCategory => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid category data');
    }

    const category = data as Record<string, unknown>;

    if (typeof category.id !== 'number' || category.id <= 0) {
      throw new Error('Category must have a valid ID');
    }

    if (typeof category.name !== 'string' || !category.name.trim()) {
      throw new Error('Category must have a valid name');
    }

    return {
      id: category.id,
      name: category.name,
      icon_url: typeof category.icon_url === 'string' ? category.icon_url : null,
      parent_id: typeof category.parent_id === 'number' ? category.parent_id : undefined,
    };
  };

  const fetchSubtree = useCallback(
    async (
      category: CategoryNode,
      signal: AbortSignal,
      visitedIds: Set<number> = new Set()
    ): Promise<CategoryNode> => {
      // Prevent infinite recursion
      if (visitedIds.has(category.id)) {
        return { ...category, subcategories: undefined };
      }

      visitedIds.add(category.id);

      try {
        const response = await api.get(`/categories/${category.id}/subcategories`, { signal });

        if (!Array.isArray(response.data)) {
          return { ...category, subcategories: undefined };
        }

        const subcategories: CategoryNode[] = response.data
          .map((rawCat: unknown) => {
            try {
              const validatedCat = validateCategory(rawCat);
              return {
                id: validatedCat.id,
                name: validatedCat.name,
                icon_url: validatedCat.icon_url,
              };
            } catch {
              return null;
            }
          })
          .filter((cat: CategoryNode | null): cat is CategoryNode => cat !== null);

        if (subcategories.length === 0) {
          return { ...category, subcategories: undefined };
        }

        // Limit recursion depth and concurrent requests
        const children = await Promise.all(
          subcategories
            .slice(0, 20)
            .map(subcat => fetchSubtree(subcat, signal, new Set(visitedIds)))
        );

        return {
          ...category,
          subcategories: children.length > 0 ? children : undefined,
        };
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }
        // If subcategory fetch fails, return category without subcategories
        return { ...category, subcategories: undefined };
      }
    },
    []
  );

  const fetchCategoryTree = useCallback(async (): Promise<void> => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/categories', { signal });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid categories response format');
      }

      const allCategories: RawCategory[] = response.data
        .map((rawCat: unknown) => {
          try {
            return validateCategory(rawCat);
          } catch {
            return null;
          }
        })
        .filter((cat: RawCategory | null): cat is RawCategory => cat !== null);

      const mainCategories = allCategories
        .filter(cat => !cat.parent_id)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          icon_url: cat.icon_url,
        }));

      if (mainCategories.length === 0) {
        setTree([]);
        return;
      }

      // Limit concurrent requests
      const fullTree = await Promise.all(
        mainCategories.slice(0, 50).map(category => fetchSubtree(category, signal))
      );

      setTree(fullTree);
    } catch (err: unknown) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch category tree';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchSubtree]);

  const refetch = useCallback(() => {
    fetchCategoryTree();
  }, [fetchCategoryTree]);

  useEffect(() => {
    fetchCategoryTree();
  }, [fetchCategoryTree]);

  return { tree, loading, error, refetch, resetError };
}
