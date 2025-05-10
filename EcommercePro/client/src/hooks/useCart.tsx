import { useContext } from 'react';
import { CartContext, CartContextType } from '../context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@shared/schema';

// Create a dummy context for use outside CartProvider
const dummyCartContext: CartContextType = {
  state: { items: [], total: 0, isCartOpen: false },
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  toggleCart: () => {},
  closeCart: () => {},
  openCart: () => {},
};

export const useCart = () => {
  const context = useContext(CartContext) || dummyCartContext;
  const { toast } = useToast();

  // Enhanced versions of context functions with toast notifications
  const addToCart = (item: CartItem) => {
    context.addItem(item);
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
      variant: "default",
    });
    context.openCart();
  };

  const removeFromCart = (id: number, name: string) => {
    context.removeItem(id);
    toast({
      title: "Removed from cart",
      description: `${name} has been removed from your cart.`,
      variant: "default",
    });
  };

  const updateCartItemQuantity = (id: number, quantity: number, name: string) => {
    context.updateQuantity(id, quantity);
    toast({
      title: "Cart updated",
      description: `${name} quantity updated to ${quantity}.`,
      variant: "default",
    });
  };

  return {
    ...context,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
  };
};
