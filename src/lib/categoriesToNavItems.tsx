import type { CategoryNode } from '@/hooks/useCategories';
import type { NavItem } from '@/components/navbar/ResizableNavbar';
import { API_BASE_URL } from '@/config';

export function categoryTreeToNavItems(categories: CategoryNode[]): NavItem[] {
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    icon: category.icon_url ? (
      <span className="inline-block w-5 h-5">
        <img
          src={`${API_BASE_URL}${category.icon_url}`}
          alt={category.name}
          className="w-full h-full object-contain block"
        />
      </span>
    ) : undefined,
    link: `/category/${category.id}`,
    subItems: category.subcategories ? categoryTreeToNavItems(category.subcategories) : undefined,
  }));
}
