import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@shared/schema';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Add to cart with a slight delay to allow animation
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price as any),
        image: product.image,
        quantity: 1,
        shortDescription: product.shortDescription
      });
      setIsAdding(false);
    }, 300);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <img 
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-amber-500">
            <i className="fas fa-star text-sm"></i>
            <i className="fas fa-star text-sm"></i>
            <i className="fas fa-star text-sm"></i>
            <i className="fas fa-star text-sm"></i>
            <i className="fas fa-star-half-alt text-sm"></i>
          </div>
          <span className="text-xs text-gray-500 ml-1">(42 reviews)</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">{product.shortDescription}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">
            ${parseFloat(product.price as any).toFixed(2)}
          </span>
          <Button 
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="bg-black text-white hover:bg-gray-800 transition-colors"
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
