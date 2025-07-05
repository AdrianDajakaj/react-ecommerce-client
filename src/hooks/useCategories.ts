import { useEffect, useState } from "react";
import api from "../lib/axios";

export interface CategoryNode {
  id: number;
  name: string;
  icon_url: string | null;
  subcategories?: CategoryNode[];
}

/**
 * Custom hook to fetch and manage the category tree.
 * 
 * @returns {Object} An object containing:
 * - tree: The category tree structure
 * - loading: Boolean indicating if the data is being loaded
 * - error: Error message if any occurred during fetch
 */
export function useCategories() {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchCategoryTree = async (): Promise<void> => {
      try {
        const response = await api.get('/categories');
        const allCategories: CategoryNode[] = response.data;
        const mainCategories = allCategories.filter(cat => !('parent_id' in cat));

        const fetchSubtree = async (category: CategoryNode): Promise<CategoryNode> => {
          const res = await api.get(`/categories/${category.id}/subcategories`);
          const subcategories: CategoryNode[] = res.data;

          const children = await Promise.all(subcategories.map(fetchSubtree)); 
          return { ...category, subcategories: children.length > 0 ? children : undefined };
        };

        const fullTree = await Promise.all(mainCategories.map(fetchSubtree));
        setTree(fullTree);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch category tree");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryTree();
  }, []);

  return { tree, loading, error };
}
