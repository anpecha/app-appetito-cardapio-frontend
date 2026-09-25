'use client';

import { useState } from 'react';
import type { Restaurant } from '@/lib/types';
import { MapPin, Clock, Search, Share2, X, Store, Check } from 'lucide-react';
import { useModalNav } from '@/hooks/use-modal-nav';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  isOpen: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function RestaurantHeader({
  restaurant,
  isOpen,
  searchQuery = '',
  onSearchChange,
}: RestaurantHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useModalNav(isProfileModalOpen, () => setIsProfileModalOpen(false));

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const shareData = {
      title: restaurant.name,
      text: `Confira o cardápio de ${restaurant.name}!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusText = () => {
    if (isOpen) {
      return 'Loja aberta';
    }

    if (!restaurant.opening_hours) {
      return 'Loja fechada no momento';
    }

    const dayNames = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const today = dayNames[new Date().getDay()];
    const todayHours = restaurant.opening_hours[today];

    if (todayHours?.open) {
      const openFormatted = todayHours.open.endsWith(':00')
        ? todayHours.open.slice(0, -3) + 'h'
        : todayHours.open;
      return `Loja fechada, abre hoje às ${openFormatted}`;
    }

    return 'Loja fechada no momento';
  };

  const minOrderValue = restaurant.delivery_info?.min_order ?? 5;
  const formattedMinOrder = minOrderValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <header className="relative bg-surface-card shadow-xs">
      {/* Cover Image */}
      <div className="relative h-44 sm:h-52 bg-surface-subtle overflow-hidden">
        {restaurant.cover_image ? (
          <img
            src={restaurant.cover_image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-600/30 to-amber-950/80 flex items-center justify-center">
            <Store className="w-16 h-16 text-white/30" />
          </div>
        )}
      </div>

      {/* Main Info Row (Overlapping Logo + Name + Action Buttons) */}
      <div className="max-w-2xl mx-auto px-4 relative z-10 bg-surface-card">
        <div className="flex items-center justify-between py-2">
          {/* Logo + Name */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Round Avatar Logo - Overlaps cover banner */}
            <div className="-mt-10 sm:-mt-12 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-md bg-surface-card flex items-center justify-center overflow-hidden shrink-0 z-20">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-amber-500 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center font-display uppercase">
                  {restaurant.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Restaurant Name */}
            <div className="min-w-0 pt-1">
              <h1 className="text-lg sm:text-xl font-black text-text-primary font-display uppercase tracking-tight truncate">
                {restaurant.name}
              </h1>
              {restaurant.tagline && (
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {restaurant.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Header Action Buttons (Search & Share) */}
          <div className="flex items-center gap-2 shrink-0 pl-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                isSearchOpen || searchQuery
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-100/70 hover:bg-amber-200/80 text-amber-800'
              }`}
              title="Buscar no cardápio"
              aria-label="Buscar no cardápio"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            <button
              onClick={handleShare}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100/70 hover:bg-amber-200/80 text-amber-800 flex items-center justify-center transition-colors relative"
              title="Compartilhar cardápio"
              aria-label="Compartilhar cardápio"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-700" />
              ) : (
                <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>
          </div>
        </div>

        {/* Copy toast feedback */}
        {copied && (
          <div className="pb-2 text-center">
            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium animate-fade-in">
              Link copiado para a área de transferência!
            </span>
          </div>
        )}

        {/* Search Input Bar (Expandable) */}
        {isSearchOpen && (
          <div className="pb-3 pt-1 animate-fade-in">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Buscar item no cardápio..."
                className="w-full pl-9 pr-9 py-2 bg-surface-subtle border border-border-default rounded-xl text-xs sm:text-sm text-text-primary focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Red/Green Status Bar Banner */}
      <div
        className={`w-full py-2.5 px-4 text-white text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors ${
          isOpen ? 'bg-emerald-800' : 'bg-[#b02a2a]'
        }`}
      >
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
          <span className="truncate">{getStatusText()}</span>
        </div>
      </div>

      {/* Minimum Order & Store Profile Row */}
      <div className="bg-surface-card border-b border-border-subtle">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs text-text-secondary">
          <span>Pedido mín. {formattedMinOrder}</span>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            Perfil da loja
          </button>
        </div>
      </div>

      {/* Store Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setIsProfileModalOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="restaurant-profile-title"
            className="bg-surface-card rounded-2xl max-w-md w-full p-5 shadow-xl relative animate-scale-in border border-border-subtle z-10"
          >
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-subtle"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-6">
              <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 overflow-hidden shrink-0 bg-surface-subtle flex items-center justify-center">
                {restaurant.logo ? (
                  <img
                    src={restaurant.logo}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-amber-600 font-bold text-lg">
                    {restaurant.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 id="restaurant-profile-title" className="font-bold text-text-primary text-base font-display">
                  {restaurant.name}
                </h3>
                {restaurant.tagline && (
                  <p className="text-xs text-text-secondary">{restaurant.tagline}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 text-xs divide-y divide-border-subtle">
              {restaurant.address && (
                <div className="pt-2 flex items-start gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-text-primary">Endereço</span>
                    {restaurant.address}
                  </div>
                </div>
              )}

              {restaurant.delivery_info?.delivery_time && (
                <div className="pt-2 flex items-start gap-2 text-text-secondary">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-text-primary">Tempo de entrega</span>
                    {restaurant.delivery_info.delivery_time}
                  </div>
                </div>
              )}

              {restaurant.opening_hours && (
                <div className="pt-2">
                  <span className="font-semibold block text-text-primary mb-1.5">
                    Horários de Funcionamento
                  </span>
                  <div className="space-y-1 bg-surface-subtle p-2.5 rounded-lg">
                    {Object.entries(restaurant.opening_hours).map(([day, hours]) => {
                      const dayLabel =
                        {
                          seg: 'Segunda-feira',
                          ter: 'Terça-feira',
                          qua: 'Quarta-feira',
                          qui: 'Quinta-feira',
                          sex: 'Sexta-feira',
                          sab: 'Sábado',
                          dom: 'Domingo',
                        }[day] || day;

                      return (
                        <div key={day} className="flex justify-between text-text-secondary">
                          <span>{dayLabel}</span>
                          <span className="font-medium text-text-primary">
                            {hours.open} – {hours.close}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-border-subtle flex justify-end">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
