import type { CatalogData, Product, ProductOptionGroup, ProductSize } from '@/lib/types';

export const MOCK_RESTAURANT = {
  id: 'rest-001',
  name: 'Pizza do Bairro',
  slug: 'pizza-do-bairro',
  cover_image: 'https://skyifflcpfxvqpgzhbly.supabase.co/storage/v1/object/public/images/cover.jpg',
  logo: 'https://skyifflcpfxvqpgzhbly.supabase.co/storage/v1/object/public/images/logo.png',
  delivery_info: {
    min_order: 0,
    delivery_fee: 5.0,
    delivery_time: '30-50 min',
    working_hours: '18:00 - 23:59',
  },
};

export const MOCK_SIZES: ProductSize[] = [
  { id: 'size-1', product_id: 'prod-1', size_name: 'Broto', price: 29.9, max_flavors: 1 },
  { id: 'size-2', product_id: 'prod-1', size_name: 'Grande', price: 49.9, max_flavors: 2 },
  { id: 'size-3', product_id: 'prod-1', size_name: 'Gigante', price: 69.9, max_flavors: 3 },
];

export const MOCK_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'grp-1', product_id: 'prod-1', name: 'Adicionais', min_selections: 0, max_selections: 3,
    options: [
      { id: 'opt-1', group_id: 'grp-1', name: 'Queijo extra', price_addition: 4.0 },
      { id: 'opt-2', group_id: 'grp-1', name: 'Bacon', price_addition: 5.0 },
      { id: 'opt-3', group_id: 'grp-1', name: 'Catupiry', price_addition: 3.0 },
    ],
  },
  {
    id: 'grp-2', product_id: 'prod-1', name: 'Borda', min_selections: 1, max_selections: 1,
    options: [
      { id: 'opt-4', group_id: 'grp-2', name: 'Tradicional', price_addition: 0 },
      { id: 'opt-5', group_id: 'grp-2', name: 'Catupiry', price_addition: 3.0 },
      { id: 'opt-6', group_id: 'grp-2', name: 'Cheddar', price_addition: 3.0 },
    ],
  },
];

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Pizzas', order: 1 },
  { id: 'cat-2', name: 'Bebidas', order: 2 },
  { id: 'cat-3', name: 'Sobremesas', order: 3 },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1', category_id: 'cat-1', name: 'Calabresa', description: 'Calabresa, cebola e mussarela',
    price: 29.9, price_cents: 2990, image_url: undefined,
    sizes: MOCK_SIZES, option_groups: MOCK_OPTION_GROUPS, availability: [],
  },
  {
    id: 'prod-2', category_id: 'cat-1', name: 'Mussarela', description: 'Mussarela e tomate',
    price: 29.9, price_cents: 2990, image_url: undefined,
    sizes: [{ id: 'size-4', product_id: 'prod-2', size_name: 'Broto', price: 25.0, max_flavors: 1 }],
    option_groups: [], availability: [],
  },
  {
    id: 'prod-3', category_id: 'cat-2', name: 'Coca-Cola 2L', description: 'Refrigerante 2 litros',
    price: 12.0, price_cents: 1200, image_url: undefined,
    sizes: [], option_groups: [], availability: [],
  },
];

export function getMockCatalog(): CatalogData {
  return { restaurant: MOCK_RESTAURANT, categories: MOCK_CATEGORIES, products: MOCK_PRODUCTS };
}

export function getMockOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-12345',
    restaurant_id: 'rest-001',
    status: 'new',
    type: 'delivery',
    subtotal: 49.9,
    delivery_fee: 5.0,
    discount_amount: 5.0,
    total: 49.9,
    payment_method: 'money',
    change_for: 60,
    delivery_address: 'Rua Exemplo, 123 - Centro',
    items: [
      { product_name: 'Calabresa (Grande)', quantity: 1, unit_price: 49.9, total_price: 49.9 },
    ],
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
