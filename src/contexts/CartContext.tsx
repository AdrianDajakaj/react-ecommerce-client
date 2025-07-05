import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useCart } from '@/hooks/useCart';
import { API_BASE_URL } from '@/config';
import type { CartCard } from '@/components/cart/Cart';
import { CartContext, type CartContextType } from './CartContextDef';

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { cart, loading: cartLoading, error: cartError, refreshCart } = useCart();
  const [cards, setCards] = useState<CartCard[]>([]);
  const [quantities, setQuantities] = useState<number[]>([]);

  // Build cards array from cart items
  useEffect(() => {
    if (!cartLoading && cart) {
      const fetchAll = async () => {
        const results = await Promise.all(
          cart.items.map(async (item) => {
            try {
              const res = await fetch(`${API_BASE_URL}/products/${item.product.id}`);
              if (!res.ok) throw new Error("Failed to fetch product");
              const json = await res.json();
              let src = "";
              if (Array.isArray(json.images) && json.images.length > 0 && json.images[0].url) {
                src = `${API_BASE_URL.replace(/\/$/, "")}/${json.images[0].url.replace(/^\//, "")}`;
              }
              return {
                id: item.id,
                product_id: item.product.id,
                quantity: item.quantity,
                subtotal: item.subtotal,
                name: json.name,
                category: json.category?.name ?? "",
                src,
                price: json.price,
              };
            } catch (err) {
              return {
                id: item.id,
                product_id: item.product.id,
                quantity: item.quantity,
                subtotal: item.subtotal,
                name: "",
                category: "",
                src: "",
                price: 0,
                error: (err instanceof Error ? err.message : "Unknown error"),
              };
            }
          })
        );
        function isCartCard(obj: unknown): obj is CartCard {
          return obj != null && typeof obj === 'object' && !('error' in obj);
        }
        const validCards = results.filter(isCartCard);
        setCards(validCards);
        setQuantities(validCards.map((c) => c.quantity ?? 1));
      };
      fetchAll();
    } else if (!cartLoading && cartError) {
      setCards([]);
      setQuantities([]);
    }
  }, [cart, cartLoading, cartError]);

  const updateLocalQuantity = (cartItemId: number, newQuantity: number) => {
    const cardIndex = cards.findIndex(c => c.id === cartItemId);
    if (cardIndex !== -1) {
      setQuantities(qs => qs.map((q, i) => i === cardIndex ? newQuantity : q));
      // Also update the card's quantity
      setCards(prevCards => prevCards.map(card => 
        card.id === cartItemId ? { ...card, quantity: newQuantity } : card
      ));
    }
  };

  const removeLocalItem = (cartItemId: number) => {
    const cardIndex = cards.findIndex(c => c.id === cartItemId);
    if (cardIndex !== -1) {
      setCards(prevCards => prevCards.filter(c => c.id !== cartItemId));
      setQuantities(prevQty => prevQty.filter((_, i) => i !== cardIndex));
    }
  };

  const refreshCartData = () => {
    refreshCart();
  };

  const value: CartContextType = {
    cards,
    quantities,
    loading: cartLoading,
    error: cartError,
    updateLocalQuantity,
    removeLocalItem,
    refreshCartData,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
