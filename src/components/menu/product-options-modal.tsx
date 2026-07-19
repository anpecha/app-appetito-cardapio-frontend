'use client';

import { useState, useMemo } from 'react';
import type { Product, ProductSize, ProductOptionGroup, ProductOption } from '@/lib/types';
import { formatCurrencyBRL } from '@/lib/format';
import { useCartStore } from '@/store/use-cart-store';
import { X, Minus, Plus, Info } from 'lucide-react';

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
      <div className="relative bg-surface-card w-full max-w-lg max-h-[90dvh] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-xl animate-slide-up flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-surface-card/95 backdrop-blur-sm z-10 flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-bold text-text-primary font-display truncate pr-2">
            {product.name}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-subtle hover:bg-surface-section transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Image */}
          {product.image_url && (
            <div className="relative h-52 bg-surface-subtle overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-5 space-y-6">
            {/* Description */}
            {product.description && (
              <p className="text-sm text-text-secondary leading-relaxed">{product.description}</p>
            )}

            {/* Sizes */}
            {hasSizes && (
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-1 font-display">Tamanho</h3>
                <p className="text-xs text-text-muted mb-3">Escolha uma opção</p>
                <div className="grid grid-cols-2 gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize?.id === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`relative p-3 rounded-xl text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-action-primary/10 border-2 border-action-primary shadow-sm'
                            : 'bg-surface-section border-2 border-transparent hover:border-border-default'
                        }`}
                      >
                        <span className={`text-sm font-bold block ${isSelected ? 'text-action-primary' : 'text-text-primary'}`}>
                          {size.size_name}
                        </span>
                        <span className={`text-xs mt-0.5 block ${isSelected ? 'text-action-primary' : 'text-text-secondary'}`}>
                          {formatCurrencyBRL(size.price)}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-action-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-text-on-brand" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {isPizza && selectedSize && maxFlavors > 1 && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                    <Info className="w-3.5 h-3.5" />
                    <span>Até {maxFlavors} sabores</span>
                  </div>
                )}
              </div>
            )}

            {/* Option groups */}
            {product.option_groups.map((group) => {
              const selectedCount = (selectedOptions[group.id] || []).length;
              const isSingle = group.max_selections === 1;

              return (
                <div key={group.id}>
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-sm font-bold text-text-primary font-display">{group.name}</h3>
                    <span className="text-xs text-text-muted">
                      {selectedCount}/{group.max_selections > 0 ? group.max_selections : '∞'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mb-3">
                    {isSingle
                      ? 'Selecione uma opção'
                      : group.max_selections > 0
                        ? `Selecione até ${group.max_selections}`
                        : 'Selecione quantas quiser'}
                    {group.min_selections > 0 && ` · mínimo ${group.min_selections}`}
                  </p>
                  <div className="space-y-1.5">
                    {group.options.map((option) => {
                      const selected = !!(selectedOptions[group.id] || []).find((o) => o.id === option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleOption(group, option)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm transition-all duration-150 ${
                            selected
                              ? 'bg-action-primary/10 border-2 border-action-primary/40'
                              : 'bg-surface-section border-2 border-transparent hover:border-border-default'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox / Radio indicator */}
                            <div className={`w-5 h-5 rounded-${isSingle ? 'full' : 'md'} border-2 flex items-center justify-center transition-colors ${
                              selected
                                ? 'border-action-primary bg-action-primary'
                                : 'border-border-default'
                            }`}>
                              {selected && (
                                isSingle ? (
                                  <div className="w-2 h-2 rounded-full bg-text-on-brand" />
                                ) : (
                                  <svg className="w-3 h-3 text-text-on-brand" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )
                              )}
                            </div>
                            <span className="text-text-primary font-medium">{option.name}</span>
                          </div>
                          <span className={`text-xs font-semibold ${option.price_addition > 0 ? 'text-action-primary' : 'text-text-muted'}`}>
                            {option.price_addition > 0 ? `+${formatCurrencyBRL(option.price_addition)}` : 'Grátis'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Notes */}
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-2 font-display">Observações</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Alguma observação? Ex: sem cebola, ponto da carne..."
                className="w-full h-20 px-4 py-3 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary resize-none placeholder:text-text-muted/60 focus:border-action-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-surface-card border-t border-border-subtle p-4 space-y-3">
          {/* Quantity */}
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-full bg-surface-section flex items-center justify-center hover:bg-surface-subtle transition-colors disabled:opacity-30"
            >
              <Minus className="w-4 h-4 text-text-primary" />
            </button>
            <span className="w-8 text-center text-xl font-bold text-text-primary font-display">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-action-primary flex items-center justify-center hover:brightness-95 transition-all"
            >
              <Plus className="w-4 h-4 text-text-on-brand" />
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={!isValid}
            className="w-full bg-action-strong disabled:bg-text-muted text-white font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-all disabled:active:scale-100 shadow-lg disabled:shadow-none"
          >
            Adicionar — {formatCurrencyBRL(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
