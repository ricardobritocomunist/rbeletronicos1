import { Drawer, DrawerClose, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'wouter';
import { useCart } from '@/hooks/useCart';
import CartItem from './CartItem';
import { Loader2, Lock } from 'lucide-react';
import { useState } from 'react';

export default function CartDrawer() {
  const { state, closeCart } = useCart();
  const [, navigate] = useLocation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      closeCart();
      navigate('/checkout');
      setIsCheckingOut(false);
    }, 500);
  };

  return (
    <Drawer open={state.isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <DrawerContent className="fixed inset-y-0 right-0 h-full w-full max-w-md rounded-none">
        <div className="h-full flex flex-col bg-white shadow-xl">
          <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
              <DrawerClose className="ml-3 h-7 flex items-center justify-center text-gray-400 hover:text-gray-500">
                <i className="fas fa-times text-xl"></i>
              </DrawerClose>
            </div>

            {/* Cart Empty State */}
            {state.items.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-12">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <i className="fas fa-shopping-cart text-gray-300 text-3xl"></i>
                </div>
                <p className="text-lg text-gray-600 font-medium mb-2">Your cart is empty</p>
                <p className="text-gray-500 mb-6 text-center">Looks like you haven't added any items to your cart yet.</p>
                <DrawerClose asChild>
                  <Button className="bg-black text-white font-medium hover:bg-gray-800 transition-colors">
                    Continue Shopping
                  </Button>
                </DrawerClose>
              </div>
            )}

            {/* Cart Items List */}
            {state.items.length > 0 && (
              <div className="mt-8">
                <div className="flow-root">
                  <ul role="list" className="-my-6 divide-y divide-gray-200">
                    {state.items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>${state.total.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
              <Button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Checkout with Stripe
                  </>
                )}
              </Button>
              <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                <p>
                  or{" "}
                  <DrawerClose asChild>
                    <Button variant="link" className="text-black font-medium hover:text-gray-700">
                      Continue Shopping<span aria-hidden="true"> &rarr;</span>
                    </Button>
                  </DrawerClose>
                </p>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
