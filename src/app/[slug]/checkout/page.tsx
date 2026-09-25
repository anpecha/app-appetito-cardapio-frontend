'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/use-cart-store';
import { createOrder, validateCoupon, fetchRestaurantInfo } from '@/lib/api';
import { formatCurrencyBRL } from '@/lib/format';
import type { Restaurant } from '@/lib/types';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  Ticket,
  ChevronDown,
  Store,
  Car,
  Pencil,
} from 'lucide-react';

type OrderType = 'delivery' | 'pickup' | 'dine_in';
type PaymentMethod = 'money' | 'credit' | 'debit' | 'pix' | 'online';

const ORDER_TYPES = [
  { value: 'delivery' as const, label: 'Delivery', icon: Car, desc: 'Receba em casa' },
  { value: 'pickup' as const, label: 'Retirada', icon: Store, desc: 'Busque no balcão' },
  { value: 'dine_in' as const, label: 'Local', icon: MapPin, desc: 'Coma aqui' },
];

const PAYMENT_METHODS = [
  { value: 'money' as const, label: 'Dinheiro', icon: Banknote },
  { value: 'credit' as const, label: 'Crédito', icon: CreditCard },
  { value: 'debit' as const, label: 'Débito', icon: CreditCard },
  { value: 'pix' as const, label: 'PIX', icon: QrCode },
  { value: 'online' as const, label: 'Online', icon: CreditCard },
];

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    discount_amount: number;
    final_value: number;
    coupon_code: string;
    discount_type: string;
    discount_value: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    type: 'delivery' as OrderType,
    payment_method: '' as PaymentMethod | '',
    change_for: '',
    notes: '',
  });

  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    zip_code: '',
    complement: '',
  });

  useEffect(() => {
    fetchRestaurantInfo(slug).then(setRestaurant).catch(() => {});
  }, [slug]);

  const subtotal = getCartTotal();
  const deliveryFee = form.type === 'delivery' ? (restaurant?.delivery_info?.delivery_fee ?? 0) : 0;
  const discount = couponResult?.discount_amount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim() || !restaurant) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponResult(null);
    try {
      const result = await validateCoupon(couponCode.trim(), restaurant.id, subtotal + deliveryFee);
      setCouponResult(result);
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : 'Cupom inválido');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        restaurant_slug: slug,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        type: form.type,
        payment_method: form.payment_method || undefined,
        order_source: 'website',
        delivery_fee: deliveryFee || undefined,
        discount_amount: discount || undefined,
        coupon_code: couponResult?.coupon_code || undefined,
        notes: form.notes || undefined,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.selectedSize?.price ?? item.product.price,
          total_price: item.totalPrice,
          notes: item.notes || undefined,
          options: Object.keys(item.selectedOptions).length > 0 ? item.selectedOptions : undefined,
        })),
        subttotal: subtotal,
      };

      if (form.type === 'delivery') {
        payload.delivery_address = `${address.street}, ${address.number}`;
        payload.delivery_neighborhood = address.neighborhood;
        payload.delivery_city = address.city;
        payload.delivery_zip_code = address.zip_code;
        if (address.complement) payload.delivery_complement = address.complement;
      }

      const result = await createOrder(payload);
      clearCart();
      setCouponResult(null);
      router.push(`/${slug}/order/${result.order.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-surface-page flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-text-muted" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold text-text-primary font-display">Carrinho vazio</h1>
          <p className="text-text-secondary text-sm mt-1">Adicione itens ao cardápio antes de finalizar.</p>
        </div>
        <button
          onClick={() => router.push(`/${slug}`)}
          className="mt-2 px-6 py-2.5 bg-action-primary text-text-on-brand rounded-full text-sm font-bold"
        >
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface-page pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface-card/95 backdrop-blur-sm border-b border-border-subtle shadow-xs">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.push(`/${slug}`)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-surface-subtle hover:bg-surface-section text-text-primary text-xs font-bold transition-colors"
            title="Voltar para o cardápio"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            <span>Voltar ao Cardápio</span>
          </button>
          <h1 className="text-base sm:text-lg font-extrabold text-text-primary font-display">
            Finalizar Pedido
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-4">
        {/* Items summary — collapsible */}
        <section className="bg-surface-card rounded-2xl shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-action-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-action-primary" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-text-primary block">
                  {items.reduce((s, i) => s + i.quantity, 0)} itens
                </span>
                <span className="text-xs text-text-muted">{formatCurrencyBRL(subtotal)}</span>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${showItems ? 'rotate-180' : ''}`} />
          </button>
          {showItems && (
            <div className="px-4 pb-4 space-y-2 border-t border-border-subtle pt-3">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="text-text-primary font-medium">
                      {item.quantity}x {item.product.name}
                    </span>
                    {item.selectedSize && (
                      <span className="text-text-muted ml-1 text-xs">({item.selectedSize.size_name})</span>
                    )}
                    {item.notes && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">📝 {item.notes}</p>
                    )}
                  </div>
                  <span className="text-text-primary font-semibold ml-3 shrink-0">
                    {formatCurrencyBRL(item.totalPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order type */}
        <section className="bg-surface-card rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-text-primary font-display flex items-center gap-2">
            <MapPin className="w-4 h-4 text-action-primary" />
            Tipo do Pedido
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {ORDER_TYPES.map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, type: value })}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center transition-all ${
                  form.type === value
                    ? 'bg-action-primary text-text-on-brand shadow-sm'
                    : 'bg-surface-section text-text-secondary hover:bg-surface-subtle'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{label}</span>
                <span className="text-[10px] opacity-70">{desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Customer info */}
        <section className="bg-surface-card rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-text-primary font-display flex items-center gap-2">
            <Pencil className="w-4 h-4 text-action-primary" />
            Seus Dados
          </h2>
          <input
            type="text"
            required
            placeholder="Nome completo"
            className="w-full h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          />
          <input
            type="tel"
            required
            placeholder="WhatsApp (11) 99999-9999"
            className="w-full h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          />
        </section>

        {/* Address (delivery only) */}
        {form.type === 'delivery' && (
          <section className="bg-surface-card rounded-2xl shadow-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-text-primary font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-action-primary" />
              Endereço de Entrega
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                placeholder="Rua"
                className="col-span-2 h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <input
                type="text"
                required
                placeholder="Nº"
                className="h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
                value={address.number}
                onChange={(e) => setAddress({ ...address, number: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="Complemento (opcional)"
              className="w-full h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
              value={address.complement}
              onChange={(e) => setAddress({ ...address, complement: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Bairro"
                className="h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
              />
              <input
                type="text"
                required
                placeholder="Cidade"
                className="h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="CEP (opcional)"
              className="w-full h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
              value={address.zip_code}
              onChange={(e) => setAddress({ ...address, zip_code: e.target.value })}
            />
          </section>
        )}

        {/* Payment method */}
        <section className="bg-surface-card rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-text-primary font-display flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-action-primary" />
            Forma de Pagamento
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, payment_method: value as PaymentMethod })}
                className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl text-center transition-all ${
                  form.payment_method === value
                    ? 'bg-action-primary text-text-on-brand shadow-sm'
                    : 'bg-surface-section text-text-secondary hover:bg-surface-subtle'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-semibold leading-tight">{label}</span>
              </button>
            ))}
          </div>
          {form.payment_method === 'money' && (
            <input
              type="text"
              placeholder="Troco para quanto? (opcional)"
              className="w-full h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
              value={form.change_for}
              onChange={(e) => setForm({ ...form, change_for: e.target.value })}
            />
          )}
        </section>

        {/* Coupon */}
        <section className="bg-surface-card rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-text-primary font-display flex items-center gap-2">
            <Ticket className="w-4 h-4 text-action-primary" />
            Cupom de Desconto
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite o cupom"
              className="flex-1 h-12 px-4 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary uppercase placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setCouponResult(null);
                setCouponError('');
              }}
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={!couponCode.trim() || couponLoading}
              className="h-12 px-5 rounded-xl bg-action-primary text-text-on-brand font-bold text-sm disabled:opacity-50 transition-opacity"
            >
              {couponLoading ? '...' : 'Aplicar'}
            </button>
          </div>
          {couponError && (
            <p className="text-xs text-status-error font-medium">{couponError}</p>
          )}
          {couponResult && couponResult.valid && (
            <div className="bg-status-success/10 text-status-success text-sm font-medium p-3 rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cupom aplicado! Desconto de {formatCurrencyBRL(couponResult.discount_amount)}
            </div>
          )}
        </section>

        {/* Order notes */}
        <section className="bg-surface-card rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-text-primary font-display">Observações</h2>
          <textarea
            placeholder="Alguma observação geral para o pedido?"
            className="w-full h-20 px-4 py-3 rounded-xl border-2 border-border-default bg-surface-section text-sm text-text-primary resize-none placeholder:text-text-muted/50 focus:border-action-primary focus:outline-none transition-colors"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </section>
      </form>

      {/* Sticky footer — total + CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-card/95 backdrop-blur-sm border-t border-border-subtle shadow-lg z-30">
        <div className="max-w-lg mx-auto p-4 space-y-3">
          {/* Breakdown */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal</span>
              <span>{formatCurrencyBRL(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Taxa de entrega</span>
                <span>{formatCurrencyBRL(deliveryFee)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm text-status-success font-medium">
                <span>Desconto</span>
                <span>-{formatCurrencyBRL(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-extrabold text-text-primary pt-2 border-t border-border-subtle">
              <span className="font-display">Total</span>
              <span className="font-display">{formatCurrencyBRL(total)}</span>
            </div>
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={loading || !form.payment_method}
            onClick={handleSubmit}
            className="w-full bg-action-strong disabled:bg-text-muted text-white font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-all disabled:active:scale-100 shadow-lg disabled:shadow-none"
          >
            {loading
              ? 'Enviando...'
              : form.payment_method === 'pix'
                ? `Gerar PIX — ${formatCurrencyBRL(total)}`
                : `Confirmar Pedido — ${formatCurrencyBRL(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
