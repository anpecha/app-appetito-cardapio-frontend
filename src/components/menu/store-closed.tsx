'use client';

import { useState } from 'react';
import type { Restaurant } from '@/lib/types';
import { Clock, MapPin, X, Eye } from 'lucide-react';
import { useModalNav } from '@/hooks/use-modal-nav';

interface StoreClosedProps {
  restaurant: Restaurant;
}

export function StoreClosed({ restaurant }: StoreClosedProps) {
  const [dismissed, setDismissed] = useState(false);

  useModalNav(!dismissed, () => setDismissed(true));

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs animate-fade-in" onClick={() => setDismissed(true)} />
      <div className="relative bg-surface-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm mx-auto p-6 pb-8 sm:p-8 text-center shadow-2xl animate-slide-up z-10 border border-border-subtle">
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-section flex items-center justify-center text-text-secondary transition-colors"
          title="Fechar aviso (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>

        <h2 className="text-xl font-extrabold text-text-primary font-display">
          Estamos fechados
        </h2>

        <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
          No momento não estamos aceitando pedidos. Você ainda pode visualizar o cardápio e os preços!
        </p>

        {restaurant.opening_hours && (
          <div className="mt-5 space-y-1.5 bg-surface-subtle p-3 rounded-xl">
            {Object.entries(restaurant.opening_hours).map(([day, hours]) => {
              const dayLabel = {
                seg: 'Segunda',
                ter: 'Terça',
                qua: 'Quarta',
                qui: 'Quinta',
                sex: 'Sexta',
                sab: 'Sábado',
                dom: 'Domingo',
              }[day] || day;

              return (
                <div key={day} className="flex justify-between text-xs text-text-secondary">
                  <span>{dayLabel}</span>
                  <span className="font-semibold text-text-primary">{hours.open} – {hours.close}</span>
                </div>
              );
            })}
          </div>
        )}

        {restaurant.address && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-muted">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{restaurant.address}</span>
          </div>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Eye className="w-4 h-4" />
          Ver Cardápio (Modo Leitura)
        </button>
      </div>
    </div>
  );
}
