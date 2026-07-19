export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cover_image?: string;
  logo?: string;
  delivery_info?: {
    min_order?: number;
    delivery_fee?: number;
    delivery_time?: string;
    working_hours?: string;
  };
  primary_color?: string | null;
  secondary_color?: string | null;
  font_family?: string | null;
  tagline?: string | null;
  address?: string | null;
  opening_hours?: Record<string, { open: string; close: string }>;
  announcement?: string | null;
  announcement_active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order?: number;
  parent_id?: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size_name: string;
  price: number;
  max_flavors: number;
}

export interface ProductOption {
  id: string;
  group_id: string;
  name: string;
  price_addition: number;
}

export interface ProductOptionGroup {
  id: string;
  product_id: string;
  name: string;
  min_selections: number;
  max_selections: number;
  options: ProductOption[];
}

export interface ProductAvailability {
  id: string;
  product_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  image_url?: string;
  product_type?: string;
  pizza_category_id?: string;
  fractional_pricing_strategy?: string;
  price_cents: number;
  promotional_price_cents?: number;
  sizes: ProductSize[];
  availability: ProductAvailability[];
  option_groups: ProductOptionGroup[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: ProductSize;
  selectedOptions: Record<string, ProductOption[]>;
  notes?: string;
  totalPrice: number;
}

export interface CatalogData {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
}
