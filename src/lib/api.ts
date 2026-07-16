import type { CatalogData } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8003';

export async function fetchRestaurantInfo(slug: string) {
  const catalog = await fetchCatalog(slug);
  return catalog.restaurant;
}

export async function fetchCatalog(slug: string): Promise<CatalogData> {
  const res = await fetch(`${API_BASE}/catalog/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog: ${res.status}`);
  }
  return res.json();
}

export async function createOrder(payload: unknown) {
  const res = await fetch(`${API_BASE}/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create order');
  }
  return res.json();
}

export async function getOrder(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);
  if (!res.ok) {
    throw new Error('Order not found');
  }
  return res.json();
}

export async function validateCoupon(code: string, restaurantId: string, orderValue: number) {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, restaurant_id: restaurantId, order_value: orderValue }),
  });
  return res.json();
}
