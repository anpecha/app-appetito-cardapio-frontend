'use client';

import { useState, useMemo } from 'react';
import type { Product, ProductSize, ProductOptionGroup, ProductOption } from '@/lib/types';
import { formatCurrencyBRL } from '@/lib/format';
import { useCartStore } from '@/store/use-cart-store';
import { X, Minus, Plus } from 'lucide-react';

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function ProductOptionsModal({ product, open, onClose }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOption[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const hasSizes = (product?.sizes.length ?? 0) > 0;

  const isPizza = product?.product_type === 'pizza';
  const maxFlavors = selectedSize?.max_flavors ?? 1;

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const base = selectedSize?.price ?? product.price;
    const optionsTotal = Object.values(selectedOptions)
      .flat()
      .reduce((sum, o) => sum + (o.price_addition ?? 0), 0);
    return (base + optionsTotal) * quantity;
  }, [product, selectedSize, selectedOptions, quantity]);

  const isValid = useMemo(() => {
    if (!product) return false;
    if (hasSizes && !selectedSize) return false;
    for (const group of product.option_groups) {
      const count = (selectedOptions[group.id] || []).length;
      if (count < group.min_selections) return false;
    }
    return true;
  }, [product, hasSizes, selectedSize, selectedOptions]);

  const toggleOption = (group: ProductOptionGroup, option: ProductOption) => {
    setSelectedOptions((prev) => {
      const current = prev[group.id] || [];
      const exists = current.find((o) => o.id === option.id);

      let next: ProductOption[];
      if (exists) {
        if (current.length <= group.min_selections) return prev;
        next = current.filter((o) => o.id !== option.id);
      } else {
        if (!exists && group.max_selections === 1) {
          next = [option];
        } else if (group.max_selections > 0 && current.length >= group.max_selections) {
          return prev;
        } else {
          next = [...current, option];
        }
      }
      return { ...prev, [group.id]: next };
    });
  };

  const handleAdd = () => {
    if (!product || !isValid) return;
    addItem(product, selectedSize || undefined, selectedOptions, notes || undefined, quantity);
    handleClose();
  };

  const handleClose = () => {
    setSelectedSize(hasSizes && product?.sizes[0] ? product.sizes[0] : null);
    setSelectedOptions({});
    setQuantity(1);
    setNotes('');
    onClose();
  };

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-overlay-in" onClick={handleClose} />
      <div className="relative bg-surface-card w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto shadow-xl animate-slide-up">
        <div className="sticky top-0 bg-surface-card z-10 flex items-center justify-between p-4 border-b border-border-default">
          <h2 className="text-lg font-bold text-text-primary truncate pr-2">{product.name}</h2>
          <button onClick={handleClose} className="p-1 hover:bg-surface-subtle rounded-radius-full shrink-0">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover rounded-radius-lg"
            />
          )}

          {product.description && (
            <p className="text-sm text-text-secondary">{product.description}</p>
          )}

          {hasSizes && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">Tamanho</h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-radius-full text-sm font-medium transition-colors ${
                      selectedSize?.id === size.id
                        ? 'bg-action-primary text-text-on-brand shadow-button-primary'
                        : 'bg-surface-card text-text-secondary border border-border-default hover:bg-surface-subtle'
                    }`}
                  >
                    {size.size_name} — {formatCurrencyBRL(size.price)}
                  </button>
                ))}
              </div>
              {isPizza && selectedSize && maxFlavors > 1 && (
                <p className="text-xs text-text-muted mt-2">Até {maxFlavors} sabores</p>
              )}
            </div>
          )}

          {product.option_groups.map((group) => (
            <div key={group.id}>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{group.name}</h3>
              <p className="text-xs text-text-muted mb-2">
                {group.max_selections === 1
                  ? 'Selecione uma opção'
                  : group.max_selections > 0
                    ? `Selecione até ${group.max_selections}`
                    : 'Selecione quantas quiser'}
                {group.min_selections > 0 && ` (mín. ${group.min_selections})`}
              </p>
              <div className="space-y-1">
                {group.options.map((option) => {
                  const selected = !!(selectedOptions[group.id] || []).find((o) => o.id === option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleOption(group, option)}
                      className={`w-full flex items-center justify-between p-3 rounded-radius-md text-sm transition-colors ${
                        selected
                          ? 'bg-action-primary/10 border border-action-primary/30'
                          : 'bg-surface-section border border-transparent hover:bg-surface-subtle'
                      }`}
                    >
                      <span className="text-text-primary">{option.name}</span>
                      <span className="text-text-secondary">
                        {option.price_addition > 0 ? `+${formatCurrencyBRL(option.price_addition)}` : 'Grátis'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-2">Observações</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação? Ex: tirar cebola..."
              className="w-full h-20 px-3 py-2 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface-card border-t border-border-default p-4 space-y-3">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-radius-full bg-surface-section flex items-center justify-center hover:bg-surface-subtle transition-colors"
            >
              <Minus className="w-4 h-4 text-text-primary" />
            </button>
            <span className="w-8 text-center text-lg font-bold text-text-primary">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-radius-full bg-action-primary flex items-center justify-center hover:brightness-95 transition-all"
            >
              <Plus className="w-4 h-4 text-text-on-brand" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={!isValid}
            className="w-full bg-action-strong disabled:bg-text-muted text-white font-bold text-base py-3.5 rounded-radius-xl active:scale-[0.98] transition-transform disabled:active:scale-100"
          >
            Adicionar — {formatCurrencyBRL(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
