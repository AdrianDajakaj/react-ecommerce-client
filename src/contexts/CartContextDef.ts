import { createContext } from 'react';
import type { CartCard } from '@/components/cart/Cart';

export interface CartContextType {
  cards: CartCard[];
  quantities: number[];
  loading: boolean;
  error: string | null;
  updateLocalQuantity: (cartItemId: number, newQuantity: number) => void;
  removeLocalItem: (cartItemId: number) => void;
  refreshCartData: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
