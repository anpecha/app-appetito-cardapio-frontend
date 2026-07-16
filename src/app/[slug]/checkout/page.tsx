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
  ChevronUp,
} from 'lucide-react';

type OrderType = 'delivery' | 'pickup' | 'dine_in';
type PaymentMethod = 'money' | 'credit' | 'debit' | 'pix' | 'online';

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [showItems, setShowItems] = useState(true);
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
      <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center gap-4 p-8">
        <ShoppingBag className="w-12 h-12 text-text-muted" />
        <h1 className="text-xl font-bold text-text-primary">Carrinho vazio</h1>
        <p className="text-text-secondary text-sm">Adicione itens ao cardápio antes de finalizar.</p>
        <button
          onClick={() => router.push(`/${slug}`)}
          className="text-sm font-semibold text-action-strong underline"
        >
          Voltar ao cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page">
      <div className="sticky top-0 z-20 bg-surface-card border-b border-border-default">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => router.push(`/${slug}`)} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">Finalizar Pedido</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-4 pb-32">
        {/* Items summary */}
        <section className="bg-surface-card rounded-radius-xl shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-action-strong" />
              <span className="text-sm font-semibold text-text-primary">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showItems && (
            <div className="px-4 pb-3 space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <span className="text-text-primary">
                      {item.quantity}x {item.product.name}
                    </span>
                    {item.selectedSize && (
                      <span className="text-text-muted ml-1">({item.selectedSize.size_name})</span>
                    )}
                  </div>
                  <span className="text-text-primary font-medium ml-2">
                    {formatCurrencyBRL(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order type */}
        <section className="bg-surface-card rounded-radius-xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <MapPin className="w-4 h-4 text-action-strong" />
            Tipo do Pedido
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {(['delivery', 'pickup', 'dine_in'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`py-2.5 px-3 rounded-radius-lg text-sm font-medium transition-colors ${
                  form.type === t
                    ? 'bg-action-primary text-text-on-brand shadow-button-primary'
                    : 'bg-surface-section text-text-secondary hover:bg-surface-subtle'
                }`}
              >
                {t === 'delivery' ? 'Delivery' : t === 'pickup' ? 'Retirada' : 'Local'}
              </button>
            ))}
          </div>
        </section>

        {/* Customer info */}
        <section className="bg-surface-card rounded-radius-xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Seus Dados</h2>
          <input
            type="text"
            required
            placeholder="Nome completo"
            className="w-full h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          />
          <input
            type="tel"
            required
            placeholder="WhatsApp (11) 99999-9999"
            className="w-full h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary"
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          />
        </section>

        {/* Address (delivery only) */}
        {form.type === 'delivery' && (
          <section className="bg-surface-card rounded-radius-xl shadow-card p-4 space-y-3">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4 text-action-strong" />
              Endereço de Entrega
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                placeholder="Rua"
                className="col-span-2 h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <input
                type="text"
                required
                placeholder="Nº"
                className="h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary"
                value={address.number}
                onChange={(e) => setAddress({ ...address, number: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="Complemento (opcional)"
              className="w-full h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary"
              value={address.complement}
              onChange={(e) => setAddress({ ...address, complement: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Bairro"
                className="h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary"
                value={address.neighborhood}
                onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
              />
              <input
                type="text"
                required
                placeholder="Cidade"
                className="h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="CEP (opcional)"
              className="w-full h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary"
              value={address.zip_code}
              onChange={(e) => setAddress({ ...address, zip_code: e.target.value })}
            />
          </section>
        )}

        {/* Payment method */}
        <section className="bg-surface-card rounded-radius-xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-action-strong" />
            Forma de Pagamento
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'money', label: 'Dinheiro', icon: Banknote },
              { value: 'credit', label: 'Cartão Crédito', icon: CreditCard },
              { value: 'debit', label: 'Cartão Débito', icon: CreditCard },
              { value: 'pix', label: 'PIX', icon: QrCode },
              { value: 'online', label: 'Online', icon: CreditCard },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, payment_method: value as PaymentMethod })}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-radius-lg text-sm font-medium transition-colors ${
                  form.payment_method === value
                    ? 'bg-action-primary/10 border border-action-primary/30 text-text-primary'
                    : 'bg-surface-section text-text-secondary hover:bg-surface-subtle border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
          {form.payment_method === 'money' && (
            <input
              type="text"
              placeholder="Troco para quanto? (opcional)"
              className="w-full h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary"
              value={form.change_for}
              onChange={(e) => setForm({ ...form, change_for: e.target.value })}
            />
          )}
        </section>

        {/* Coupon */}
        <section className="bg-surface-card rounded-radius-xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Ticket className="w-4 h-4 text-action-strong" />
            Cupom de Desconto
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Digite o cupom"
              className="flex-1 h-11 px-3 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary uppercase"
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
              className="h-11 px-4 rounded-radius-sm bg-action-primary text-text-on-brand font-semibold text-sm disabled:opacity-50"
            >
              {couponLoading ? '...' : 'Aplicar'}
            </button>
          </div>
          {couponError && <p className="text-xs text-status-error">{couponError}</p>}
          {couponResult && couponResult.valid && (
            <div className="bg-status-success/10 text-status-success text-sm p-2 rounded-radius-sm">
              Cupom aplicado! Desconto de {formatCurrencyBRL(couponResult.discount_amount)}
            </div>
          )}
        </section>

        {/* Order notes */}
        <section className="bg-surface-card rounded-radius-xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Observações</h2>
          <textarea
            placeholder="Alguma observação geral para o pedido?"
            className="w-full h-20 px-3 py-2 rounded-radius-sm border border-border-default bg-surface-page text-sm text-text-primary resize-none"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </section>

        {/* Total breakdown - sticky bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border-default shadow-lg">
          <div className="max-w-lg mx-auto p-4 space-y-2">
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
              <div className="flex justify-between text-sm text-status-success">
                <span>Desconto</span>
                <span>-{formatCurrencyBRL(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-text-primary pt-1 border-t border-border-default">
              <span>Total</span>
              <span>{formatCurrencyBRL(total)}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-action-strong disabled:bg-text-muted text-white font-bold text-base py-3.5 rounded-radius-xl active:scale-[0.98] transition-transform disabled:active:scale-100"
            >
              {loading
                ? 'Enviando...'
                : form.payment_method === 'pix'
                  ? `Gerar PIX — ${formatCurrencyBRL(total)}`
                  : `Confirmar Pedido — ${formatCurrencyBRL(total)}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
