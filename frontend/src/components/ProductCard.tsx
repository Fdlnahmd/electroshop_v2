import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../data';
import { Rating } from './Rating';
import { useAppContext } from '../AppContext';
import { formatRupiah, getProductImageUrl } from '../utils';

interface ProductCardProps {
  product: Product;
  key?: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, user } = useAppContext();

  return (
    <div className="card group flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square bg-gray-50">
        <img 
          src={getProductImageUrl(product.image)} 
          alt={product.name} 
          loading="lazy"
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs font-medium text-gray-500 mb-1">{product.category}</div>
        <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold text-gray-900 leading-tight mb-2 line-clamp-2">{product.name}</h3>
        </Link>
        
        <Rating value={product.rating} count={product.reviewsCount} className="mb-3" />
        
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-gray-900">{formatRupiah(product.price)}</span>
          {(!user || user.role !== 'admin') && (
            <button 
              onClick={() => addToCart(product)}
              className="flex items-center justify-center bg-gray-50 text-primary hover:bg-primary hover:text-white transition-colors p-2 rounded-md"
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
