'use client';

import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '@/store/use-cart-store';
import { formatCurrencyBRL } from '@/lib/format';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const { items, updateItemQuantity, removeItem, getCartTotal } = useCartStore();
  const total = getCartTotal();

  const handleCheckout = () => {
    onClose();
    router.push(`/${slug}/checkout`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-card h-full animate-slide-in-right flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-text-primary" />
            <h2 className="text-lg font-bold text-text-primary">
              Carrinho ({items.length})
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-subtle rounded-radius-full">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-text-muted gap-2">
              <ShoppingBag className="w-10 h-10" />
              <p className="text-sm">Seu carrinho está vazio</p>
            </div>
          )}

          {items.map((item, index) => (
            <div key={index} className="bg-surface-section rounded-radius-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary truncate">
                    {item.product.name}
                  </h4>
                  {item.selectedSize && (
                    <p className="text-xs text-text-muted">{item.selectedSize.size_name}</p>
                  )}
                  {Object.values(item.selectedOptions).flat().length > 0 && (
                    <p className="text-xs text-text-muted truncate">
                      {Object.values(item.selectedOptions)
                        .flat()
                        .map((o) => o.name)
                        .join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-text-muted italic truncate">Obs: {item.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="p-1 hover:bg-surface-card rounded-radius-full shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-text-muted hover:text-status-error transition-colors" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateItemQuantity(index, item.quantity - 1)}
                    className="w-7 h-7 rounded-radius-full bg-surface-card flex items-center justify-center hover:bg-surface-subtle"
                  >
                    <Minus className="w-3 h-3 text-text-primary" />
                  </button>
                  <span className="text-sm font-semibold text-text-primary w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                    className="w-7 h-7 rounded-radius-full bg-action-primary flex items-center justify-center hover:brightness-95"
                  >
                    <Plus className="w-3 h-3 text-text-on-brand" />
                  </button>
                </div>
                <span className="text-sm font-bold text-text-primary">
                  {formatCurrencyBRL(item.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border-default p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-secondary">Subtotal</span>
              <span className="text-lg font-bold text-text-primary">{formatCurrencyBRL(total)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-action-strong text-white font-bold text-base py-3.5 rounded-radius-xl active:scale-[0.98] transition-transform"
            >
              Ir para o Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
