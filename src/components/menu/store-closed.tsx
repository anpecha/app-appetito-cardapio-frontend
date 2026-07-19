'use client';

import type { Restaurant } from '@/lib/types';
import { Clock, MapPin } from 'lucide-react';

interface StoreClosedProps {
  restaurant: Restaurant;
}

export function StoreClosed({ restaurant }: StoreClosedProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm mx-auto p-6 pb-8 sm:p-8 text-center shadow-lg animate-slide-up">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-subtle flex items-center justify-center">
          <Clock className="w-8 h-8 text-text-muted" />
        </div>

        <h2 className="text-xl font-bold text-text-primary font-display">
          Estamos fechados
        </h2>

        <p className="text-sm text-text-secondary mt-2">
          Volte no horário de funcionamento para fazer seu pedido.
        </p>

        {restaurant.opening_hours && (
          <div className="mt-5 space-y-1.5">
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
                  <span className="font-medium">{hours.open} – {hours.close}</span>
                </div>
              );
            })}
          </div>
        )}

        {restaurant.address && (
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-text-muted">
            <MapPin className="w-3.5 h-3.5" />
            <span>{restaurant.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
