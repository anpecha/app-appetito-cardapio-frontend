'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchCatalog } from '@/lib/api';
import type { CatalogData, Product } from '@/lib/types';
import { useCartStore } from '@/store/use-cart-store';
import { RestaurantHeader } from '@/components/menu/restaurant-header';
import { CategoryTabs } from '@/components/menu/category-tabs';
import { ProductCard } from '@/components/menu/product-card';
import { CartFloatingButton } from '@/components/menu/cart-floating-button';
import { ProductOptionsModal } from '@/components/menu/product-options-modal';
import { CartDrawer } from '@/components/menu/cart-drawer';

export default function MenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const setRestaurant = useCartStore((s) => s.setRestaurant);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Carregando cardápio...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-bold text-text-primary">Cardápio indisponível</h1>
        <p className="text-text-secondary text-sm">{error || 'Restaurante não encontrado'}</p>
      </div>
    );
  }

  const { restaurant, categories, products } = data;

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products;

  return (
    <div className="min-h-screen bg-surface-page pb-24">
      <RestaurantHeader restaurant={restaurant} />

      <div className="sticky top-0 z-20 bg-surface-page pt-2 pb-1">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      <div className="px-4 max-w-lg mx-auto space-y-3 mt-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onRequestCustomize={setModalProduct} />
        ))}
        {filteredProducts.length === 0 && (
          <p className="text-text-muted text-center py-8 text-sm">
            Nenhum produto nesta categoria.
          </p>
        )}
      </div>

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
    </div>
  );
}
