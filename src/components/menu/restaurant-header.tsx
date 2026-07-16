import type { Restaurant } from '@/lib/types';

interface Props {
  restaurant: Restaurant;
}

export function RestaurantHeader({ restaurant }: Props) {
  return (
    <div className="relative bg-surface-card">
      {restaurant.cover_image && (
        <div className="h-36 sm:h-48 w-full overflow-hidden bg-surface-section">
          <img
            src={restaurant.cover_image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="px-4 py-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {restaurant.logo && (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="w-14 h-14 rounded-radius-full object-cover border-2 border-surface-card shadow-md flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text-primary truncate">
              {restaurant.name}
            </h1>
            {restaurant.delivery_info?.delivery_time && (
              <p className="text-sm text-text-secondary">
                Entrega em ~{restaurant.delivery_info.delivery_time} min
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
