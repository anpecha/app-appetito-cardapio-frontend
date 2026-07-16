import { create } from 'zustand';
import type { CartItem, Product, ProductOption, ProductSize } from '@/lib/types';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  restaurantSlug: string | null;
  restaurantName: string | null;

  setRestaurant: (slug: string, name: string) => void;
  addItem: (product: Product, size?: ProductSize, options?: Record<string, ProductOption[]>, notes?: string, quantity?: number) => void;
  updateItemQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  getItemTotal: (item: CartItem) => number;
  getCartTotal: () => number;
  getItemCount: () => number;
}

function calcItemPrice(item: CartItem): number {
  const basePrice = item.selectedSize?.price ?? item.product.price ?? 0;
  const optionsTotal = Object.values(item.selectedOptions)
    .flat()
    .reduce((sum, opt) => sum + (opt.price_addition ?? 0), 0);
  return (basePrice + optionsTotal) * item.quantity;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantSlug: null,
      restaurantName: null,

      setRestaurant: (slug, name) => set({ restaurantSlug: slug, restaurantName: name }),

      addItem: (product, selectedSize, selectedOptions = {}, notes, quantity = 1) => {
        const item: CartItem = {
          product,
          quantity,
          selectedSize,
          selectedOptions,
          notes,
          totalPrice: 0,
        };
        item.totalPrice = calcItemPrice(item);
        set((state) => ({ items: [...state.items, item] }));
      },

      updateItemQuantity: (index, quantity) =>
        set((state) => {
          const items = [...state.items];
          if (quantity <= 0) {
            items.splice(index, 1);
          } else {
            items[index] = { ...items[index], quantity, totalPrice: calcItemPrice({ ...items[index], quantity }) };
          }
          return { items };
        }),

      removeItem: (index) =>
        set((state) => ({ items: state.items.filter((_, i) => i !== index) })),

      clearCart: () => set({ items: [] }),

      getItemTotal: (item) => calcItemPrice(item),
      getCartTotal: () => get().items.reduce((sum, item) => sum + calcItemPrice(item), 0),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'appetito-cart' },
  ),
);
