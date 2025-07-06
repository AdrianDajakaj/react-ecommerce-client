import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useCart } from '@/hooks/useCart';
import api from '@/lib/axios';
import type { CartCard } from '@/components/cart/Cart';
import { CartContext, type CartContextType } from './CartContextDef';

interface CartProviderProps {
  readonly children: ReactNode;
}

/*
 * CartProvider component that fetches cart data and provides it to its children.
 * It manages the state of cart items, quantities, loading status, and errors.
 *
 * @param {CartProviderProps} props - The properties for the CartProvider component.
 * @returns {JSX.Element} The rendered CartProvider component.
 */
export function CartProvider({ children }: CartProviderProps) {
  const { cart, loading: cartLoading, error: cartError, refreshCart } = useCart();
  const [cards, setCards] = useState<CartCard[]>([]);
  const [quantities, setQuantities] = useState<number[]>([]);

  useEffect(() => {
    if (!cartLoading && cart) {
      const fetchAll = async () => {
        const results = await Promise.all(
          cart.items.map(async item => {
            try {
              const res = await api.get(`/products/${item.product.id}`);
              const json = res.data;
              let src = '';
              if (Array.isArray(json.images) && json.images.length > 0 && json.images[0].url) {
                src = `${api.defaults.baseURL?.replace(/\/$/, '')}/${json.images[0].url.replace(/^\//, '')}`;
              }
              return {
                id: item.id,
                product_id: item.product.id,
                quantity: item.quantity,
                subtotal: item.subtotal,
                name: json.name,
                category: json.category?.name ?? '',
                src,
                price: json.price,
              };
            } catch (err) {
              return {
                id: item.id,
                product_id: item.product.id,
                quantity: item.quantity,
                subtotal: item.subtotal,
                name: '',
                category: '',
                src: '',
                price: 0,
                error: err instanceof Error ? err.message : 'Unknown error',
              };
            }
          })
        );
        function isCartCard(obj: unknown): obj is CartCard {
          return obj != null && typeof obj === 'object' && !('error' in obj);
        }
        const validCards = results.filter(isCartCard);
        setCards(validCards);
        setQuantities(validCards.map(c => c.quantity ?? 1));
      };
      fetchAll();
    } else if (!cartLoading && cartError) {
      setCards([]);
      setQuantities([]);
    }
  }, [cart, cartLoading, cartError]);

  const updateLocalQuantity = useCallback((cartItemId: number, newQuantity: number) => {
    const cardIndex = cards.findIndex(c => c.id === cartItemId);
    if (cardIndex !== -1) {
      setQuantities(qs => qs.map((q, i) => (i === cardIndex ? newQuantity : q)));
      setCards(prevCards =>
        prevCards.map(card => (card.id === cartItemId ? { ...card, quantity: newQuantity } : card))
      );
    }
  }, [cards]);

  const removeLocalItem = useCallback((cartItemId: number) => {
    const cardIndex = cards.findIndex(c => c.id === cartItemId);
    if (cardIndex !== -1) {
      setCards(prevCards => prevCards.filter(c => c.id !== cartItemId));
      setQuantities(prevQty => prevQty.filter((_, i) => i !== cardIndex));
    }
  }, [cards]);

  const refreshCartData = useCallback(() => {
    refreshCart();
  }, [refreshCart]);

  const value: CartContextType = useMemo(
    () => ({
      cards,
      quantities,
      loading: cartLoading,
      error: cartError,
      updateLocalQuantity,
      removeLocalItem,
      refreshCartData,
    }),
    [cards, quantities, cartLoading, cartError, updateLocalQuantity, removeLocalItem, refreshCartData]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
