import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  value: number;
  count?: number;
  className?: string;
}

export function Rating({ value, count, className = '' }: RatingProps) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) return <Star key={i} size={16} fill="currentColor" />;
          if (i === fullStars && hasHalfStar) return <StarHalf key={i} size={16} fill="currentColor" />;
          return <Star key={i} size={16} className="text-gray-300" />;
        })}
      </div>
      {count !== undefined && (
        <span className="text-sm text-gray-500 ml-1">({count})</span>
      )}
    </div>
  );
}
