import { Button } from '@/components/ui/button';
import { CartItem } from '@shared/schema';
import { useCart } from '@/hooks/useCart';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItem;
}

export default function CartItemComponent({ item }: CartItemProps) {
  const { removeFromCart, updateCartItemQuantity } = useCart();

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateCartItemQuantity(item.id, item.quantity - 1, item.name);
    }
  };

  const handleIncrement = () => {
    updateCartItemQuantity(item.id, item.quantity + 1, item.name);
  };

  const handleRemove = () => {
    removeFromCart(item.id, item.name);
  };

  return (
    <li className="py-6 flex">
      <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border border-gray-200">
        <img 
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="ml-4 flex-1 flex flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.name}</h3>
            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>
        <div className="flex-1 flex items-end justify-between text-sm">
          <div className="flex items-center">
            <span className="text-gray-500 mr-3">Qty</span>
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-1 px-2 text-gray-600 hover:text-gray-800 h-auto"
                onClick={handleDecrement}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="p-1 px-2 text-gray-600 hover:text-gray-800 h-auto"
                onClick={handleIncrement}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Button 
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="font-medium text-black hover:text-gray-700 p-0 h-auto"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
}
