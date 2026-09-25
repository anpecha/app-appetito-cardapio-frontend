'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchCatalog } from '@/lib/api';
import type { CatalogData, Product } from '@/lib/types';
import { useCartStore } from '@/store/use-cart-store';
import { useWhiteLabel } from '@/hooks/use-white-label';
import { RestaurantHeader } from '@/components/menu/restaurant-header';
import { CategoryTabs } from '@/components/menu/category-tabs';
import { ProductCard } from '@/components/menu/product-card';
import { CartFloatingButton } from '@/components/menu/cart-floating-button';
import { ProductOptionsModal } from '@/components/menu/product-options-modal';
import { CartDrawer } from '@/components/menu/cart-drawer';
import { StoreClosed } from '@/components/menu/store-closed';

export default function MenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const setRestaurant = useCartStore((s) => s.setRestaurant);

  useWhiteLabel(data?.restaurant ?? null);

  useEffect(() => {
    if (!slug) return;
    fetchCatalog(slug)
      .then((d) => {
        setData(d);
        setRestaurant(d.restaurant.slug, d.restaurant.name);
        if (d.categories.length > 0) setActiveCategory(d.categories[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, setRestaurant]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-surface-page">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-action-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted font-medium">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 p-8 bg-surface-page">
        <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold text-text-primary font-display">Cardápio indisponível</h1>
          <p className="text-text-secondary text-sm mt-1">{error || 'Restaurante não encontrado'}</p>
        </div>
      </div>
    );
  }

  const { restaurant, categories, products } = data;

  const isOpen = checkIsOpen(restaurant.opening_hours);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory ? p.category_id === activeCategory : true;
    const matchesSearch = searchQuery.trim()
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-[100dvh] bg-surface-page pb-24">
      <RestaurantHeader
        restaurant={restaurant}
        isOpen={isOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {restaurant.announcement && restaurant.announcement_active && (
        <div className="bg-action-primary-subtle border-b border-action-primary/20">
          <div className="max-w-2xl mx-auto px-4 py-2.5">
            <p className="text-xs font-medium text-text-on-brand text-center">
              {restaurant.announcement}
            </p>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-20 bg-surface-page/95 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-2xl mx-auto">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </div>

      <main className="max-w-2xl mx-auto">
        {searchQuery.trim() && (
          <div className="px-4 pt-3 flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">
              Buscando por &ldquo;<strong className="text-text-primary">{searchQuery}</strong>&rdquo; ({filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'})
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              Limpar busca
            </button>
          </div>
        )}

        <div className="px-4 space-y-3 pt-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onRequestCustomize={setModalProduct} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-surface-card rounded-2xl border border-border-subtle my-4">
              <p className="text-text-muted text-sm font-medium">Nenhum produto encontrado.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-bold text-amber-600 hover:underline"
                >
                  Limpar busca e ver todos
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <CartFloatingButton onOpenCart={() => setCartOpen(true)} />

      <ProductOptionsModal
        product={modalProduct}
        open={modalProduct !== null}
        onClose={() => setModalProduct(null)}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      {!isOpen && <StoreClosed restaurant={restaurant} />}
    </div>
  );
}

function checkIsOpen(
  hours?: Record<string, { open: string; close: string }>
): boolean {
  if (!hours) return true;

  const now = new Date();
  const dayNames = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const today = dayNames[now.getDay()];
  const todayHours = hours[today];

  if (!todayHours) return false;

  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}
