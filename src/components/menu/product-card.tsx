'use client';

import type { Product } from '@/lib/types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onRequestCustomize: (product: Product) => void;
}

export function ProductCard({ product, onRequestCustomize }: ProductCardProps) {
  const hasOptions =
    product.sizes?.length > 0 || product.option_groups?.length > 0;

  const basePrice = product.promotional_price ?? product.price;

  return (
    <button
      onClick={() => onRequestCustomize(product)}
      className="w-full bg-surface-card rounded-xl shadow-card p-3 flex gap-3 text-left hover:shadow-card-hover transition-shadow duration-200 group"
    >
      {/* Text */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-text-primary font-display line-clamp-2">
            {product.name}
          </h3>
          {product.product_type === 'featured' && (
            <span className="shrink-0 text-[10px] font-bold bg-status-warning/10 text-status-warning px-1.5 py-0.5 rounded">
              Destaque
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-extrabold text-text-primary font-display">
            R$ {basePrice.toFixed(2).replace('.', ',')}
          </span>
          {product.promotional_price && (
            <span className="text-xs text-text-muted line-through">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>

        {hasOptions && (
          <p className="text-[11px] text-action-primary font-semibold mt-1">
            Toque para personalizar
          </p>
        )}
      </div>

      {/* Image */}
      <div className="relative w-24 h-24 rounded-xl bg-surface-subtle overflow-hidden shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
        )}

        {/* Add button */}
        <div className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-action-primary text-text-on-brand flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
          <Plus className="w-4 h-4" strokeWidth={3} />
        </div>
      </div>
    </button>
  );
}
