'use client';

import type { Restaurant } from '@/lib/types';
import { MapPin, Clock, ChevronRight } from 'lucide-react';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  isOpen: boolean;
}

export function RestaurantHeader({ restaurant, isOpen }: RestaurantHeaderProps) {
  return (
    <header className="relative">
      {/* Cover Image */}
      <div className="relative h-44 sm:h-52 bg-surface-subtle overflow-hidden">
        {restaurant.cover_image ? (
          <img
            src={restaurant.cover_image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-action-primary/20 to-action-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Info Card — overlaps cover */}
      <div className="relative -mt-10 px-4 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface-card rounded-2xl shadow-card p-4 flex items-center gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-full bg-surface-card border-3 border-surface-card shadow-md flex items-center justify-center overflow-hidden shrink-0">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-action-primary-subtle flex items-center justify-center">
                  <span className="text-lg font-bold text-action-primary font-display">
                    {restaurant.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-text-primary font-display truncate">
                {restaurant.name}
              </h1>

              {restaurant.tagline && (
                <p className="text-xs text-text-secondary mt-0.5 truncate">
                  {restaurant.tagline}
                </p>
              )}

              <div className="flex items-center gap-3 mt-1.5">
                {/* Open/Closed badge */}
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isOpen
                      ? 'bg-status-success/10 text-status-success'
                      : 'bg-status-error/10 text-status-error'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOpen ? 'bg-status-success' : 'bg-status-error'
                    }`}
                  />
                  {isOpen ? 'Aberto' : 'Fechado'}
                </span>

                {/* Delivery info */}
                {restaurant.delivery_info?.delivery_time && (
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="w-3 h-3" />
                    {restaurant.delivery_info.delivery_time}
                  </span>
                )}
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight className="w-5 h-5 text-text-muted shrink-0" />
          </div>

          {/* Address row */}
          {restaurant.address && (
            <div className="flex items-center gap-1.5 mt-2 px-1">
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <p className="text-xs text-text-muted truncate">{restaurant.address}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
