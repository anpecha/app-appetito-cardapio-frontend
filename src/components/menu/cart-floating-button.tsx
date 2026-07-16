'use client';

import { useCartStore } from '@/store/use-cart-store';
import { formatCurrencyBRL } from '@/lib/format';
import { ShoppingBag } from 'lucide-react';

interface Props {
  onOpenCart: () => void;
}

export function CartFloatingButton({ onOpenCart }: Props) {
  const count = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) => s.getCartTotal());

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-surface-page via-surface-page to-transparent pointer-events-none">
      <button
        onClick={onOpenCart}
        className="pointer-events-auto w-full max-w-lg mx-auto bg-action-strong text-white rounded-radius-xl px-6 py-4 shadow-lg flex items-center justify-between gap-3 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-semibold text-sm">
            {count} {count === 1 ? 'item' : 'itens'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">Ver Carrinho</span>
          <span className="font-bold text-base">• {formatCurrencyBRL(total)}</span>
        </div>
      </button>
    </div>
  );
}
