import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config";

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
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error("Failed to fetch main categories");

        const allCategories: CategoryNode[] = await response.json();
        const mainCategories = allCategories.filter(cat => !('parent_id' in cat));

        const fetchSubtree = async (category: CategoryNode): Promise<CategoryNode> => {
          const res = await fetch(`${API_BASE_URL}/categories/${category.id}/subcategories`);
          if (!res.ok) throw new Error(`Failed to fetch subcategories for ${category.id}`);

          const subcategories: CategoryNode[] = await res.json();

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
