'use client';

import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '@/store/use-cart-store';
import { formatCurrencyBRL } from '@/lib/format';
import { useModalNav } from '@/hooks/use-modal-nav';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const { items, updateItemQuantity, removeItem, getCartTotal } = useCartStore();
  const total = getCartTotal();

  useModalNav(open, onClose);

  const handleCheckout = () => {
    onClose();
    router.push(`/${slug}/checkout`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-overlay-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="relative w-full max-w-md bg-surface-card h-full animate-slide-in-right flex flex-col shadow-2xl z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-subtle transition-colors mr-1"
              title="Voltar para o cardápio (Esc)"
            >
              <ArrowLeft className="w-5 h-5 text-text-primary" />
            </button>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 id="cart-drawer-title" className="text-base font-bold text-text-primary font-display">
                Sua Sacola
              </h2>
              <p className="text-xs text-text-muted">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-subtle hover:bg-surface-section transition-colors text-text-secondary"
            title="Fechar sacola (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-text-muted gap-4 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-amber-600/60" />
              </div>
              <div>
                <p className="text-base font-bold text-text-primary font-display">Sua sacola está vazia</p>
                <p className="text-xs text-text-secondary mt-1">Explore as opções do cardápio e adicione seus itens favoritos!</p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold transition-colors shadow-sm"
              >
                Voltar ao Cardápio
              </button>
            </div>
          )}

          {items.map((item, index) => (
            <div key={index} className="bg-surface-section rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-text-primary truncate font-display">
                    {item.product.name}
                  </h4>
                  {item.selectedSize && (
                    <p className="text-xs text-text-muted mt-0.5">{item.selectedSize.size_name}</p>
                  )}
                  {Object.values(item.selectedOptions).flat().length > 0 && (
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {Object.values(item.selectedOptions)
                        .flat()
                        .map((o) => o.name)
                        .join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-text-muted italic truncate mt-0.5">📝 {item.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-card transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-status-error transition-colors" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateItemQuantity(index, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-surface-card flex items-center justify-center hover:bg-surface-subtle transition-colors"
                  >
                    <Minus className="w-3 h-3 text-text-primary" />
                  </button>
                  <span className="text-sm font-bold text-text-primary w-5 text-center font-display">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-action-primary flex items-center justify-center hover:brightness-95 transition-all"
                  >
                    <Plus className="w-3 h-3 text-text-on-brand" />
                  </button>
                </div>
                <span className="text-sm font-bold text-text-primary font-display">
                  {formatCurrencyBRL(item.totalPrice * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border-subtle p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text-secondary">Subtotal</span>
              <span className="text-lg font-extrabold text-text-primary font-display">
                {formatCurrencyBRL(total)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-action-strong text-white font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg"
            >
              Ir para o Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
