'use client';

import { useCartStore } from '@/store/use-cart-store';
import { ShoppingBag } from 'lucide-react';
import { formatCurrencyBRL } from '@/lib/format';

interface CartFloatingButtonProps {
  onOpenCart: () => void;
}

export function CartFloatingButton({ onOpenCart }: CartFloatingButtonProps) {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-lg">
      <button
        onClick={onOpenCart}
        className="w-full h-14 bg-action-primary text-text-on-brand rounded-2xl shadow-lg flex items-center justify-between px-5 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-text-on-brand text-action-primary rounded-full text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="text-sm font-bold">
            Ver carrinho
          </span>
        </div>
        <span className="text-sm font-extrabold">
          {formatCurrencyBRL(totalPrice)}
        </span>
      </button>
    </div>
  );
}
