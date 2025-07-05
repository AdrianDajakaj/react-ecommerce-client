import { useContext } from 'react';
import { CartContext } from '@/contexts/CartContextDef';

/**
 * Custom hook to access the CartContext.
 * Throws an error if used outside of a CartProvider.
 *
 * @returns {CartContextType} The context value.
 */
export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
