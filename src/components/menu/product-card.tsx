'use client';

import type { Product } from '@/lib/types';
import { formatCurrencyBRL } from '@/lib/format';
import { useCartStore } from '@/store/use-cart-store';

interface Props {
  product: Product;
  onRequestCustomize: (product: Product) => void;
}

export function ProductCard({ product, onRequestCustomize }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const price = product.promotional_price ?? product.price;
  const hasSizes = product.sizes.length > 0;
  const hasOptions = product.option_groups.length > 0;
  const isComplex = hasSizes || hasOptions || product.product_type === 'pizza';

  const displayPrice = hasSizes
    ? `a partir de ${formatCurrencyBRL(Math.min(...product.sizes.map((s) => s.price)))}`
    : formatCurrencyBRL(price);

  const handleClick = () => {
    if (isComplex) {
      onRequestCustomize(product);
      return;
    }
    addItem(product);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left bg-surface-card rounded-radius-lg shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden flex"
    >
      {product.image_url && (
        <div className="w-24 h-24 shrink-0 bg-surface-section">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 p-3 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary truncate">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{product.description}</p>
        )}
        <p className="text-sm font-bold text-action-strong mt-1">{displayPrice}</p>
        {isComplex && <p className="text-[10px] text-text-muted mt-0.5">Toque para personalizar</p>}
      </div>
    </button>
  );
}
