'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrder } from '@/lib/api';
import { formatCurrencyBRL } from '@/lib/format';
import Link from 'next/link';
import { Check, Clock, CookingPot, Bike, Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'new', label: 'Pedido Recebido', icon: Check },
  { key: 'preparing', label: 'Preparando', icon: CookingPot },
  { key: 'ready', label: 'Pronto', icon: Package },
  { key: 'out_for_delivery', label: 'Saiu para Entrega', icon: Bike },
  { key: 'delivered', label: 'Entregue', icon: Check },
];

const STATUS_MAP: Record<string, string> = {
  new: 'Novo',
  preparing: 'Preparando',
  ready: 'Pronto',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};

const PAYMENT_LABELS: Record<string, string> = {
  money: 'Dinheiro',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  pix: 'PIX',
  online: 'Online',
};

function getActiveStep(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

export default function OrderPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    if (!id) return;
    getOrder(id as string)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-page flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Carregando pedido...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-bold text-text-primary">Pedido não encontrado</h1>
        <Link href={`/${slug}`} className="text-sm font-semibold text-action-strong underline">
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  const status = (order.status as string) || 'new';
  const isCancelled = status === 'cancelled';
  const activeStep = getActiveStep(status);
  const items = (order.items as Array<Record<string, unknown>>) || [];

  return (
    <div className="min-h-screen bg-surface-page">
      <div className="sticky top-0 z-20 bg-surface-card border-b border-border-default">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <Link href={`/${slug}`} className="p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-lg font-bold text-text-primary">Acompanhar Pedido</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-12">
        {/* Header */}
        <div className="bg-surface-card rounded-radius-xl shadow-card p-6 text-center space-y-2">
          <div className="text-5xl mb-2">{isCancelled ? '😞' : '🎉'}</div>
          <h1 className="text-2xl font-bold text-text-primary">
            {isCancelled ? 'Pedido Cancelado' : 'Pedido Confirmado!'}
          </h1>
          <p className="text-sm text-text-secondary">
            Pedido #{String(order.id).slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-text-muted">
            {new Date(order.created_at as string).toLocaleString('pt-BR')}
          </p>
          {!isCancelled && (
            <span className="inline-block mt-2 px-3 py-1 rounded-radius-full text-sm font-semibold bg-status-success/10 text-status-success">
              {STATUS_MAP[status] || status}
            </span>
          )}
          {isCancelled && (
            <span className="inline-block mt-2 px-3 py-1 rounded-radius-full text-sm font-semibold bg-status-error/10 text-status-error">
              Cancelado
            </span>
          )}
        </div>

        {!isCancelled && (
          <div className="bg-surface-card rounded-radius-xl shadow-card p-6">
            <div className="relative">
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i <= activeStep;
                const isLast = i === STATUS_STEPS.length - 1;
                const isDelivered = status === 'delivered' || status === 'completed';

                if (status === 'new' && i > 0) return null;
                if (status === 'preparing' && i > 1) return null;
                if (status === 'ready' && i > 2) return null;
                if (status === 'out_for_delivery' && i > 3) return null;

                return (
                  <div key={step.key} className="flex items-start gap-3 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-radius-full flex items-center justify-center shrink-0 ${
                          isActive
                            ? isDelivered
                              ? 'bg-status-success text-white'
                              : 'bg-action-primary text-text-on-brand'
                            : 'bg-surface-section text-text-muted'
                        }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-full mt-1 ${
                            i < activeStep ? 'bg-status-success' : 'bg-border-subtle'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? 'text-text-primary' : 'text-text-muted'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-surface-card rounded-radius-xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Itens do Pedido</h2>
          {items.length === 0 && (
            <p className="text-sm text-text-muted">Nenhum item disponível</p>
          )}
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <div className="flex-1 min-w-0">
                <span className="text-text-primary">
                  {String(item.quantity)}x {String(item.product_name)}
                </span>
              </div>
              <span className="text-text-primary font-medium ml-2">
                {formatCurrencyBRL(Number(item.total_price))}
              </span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-surface-card rounded-radius-xl shadow-card p-4 space-y-2">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Subtotal</span>
            <span>{formatCurrencyBRL(Number(order.subtotal))}</span>
          </div>
          {Number(order.delivery_fee) > 0 && (
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Taxa de entrega</span>
              <span>{formatCurrencyBRL(Number(order.delivery_fee))}</span>
            </div>
          )}
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between text-sm text-status-success">
              <span>Desconto</span>
              <span>-{formatCurrencyBRL(Number(order.discount_amount))}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-text-primary pt-1 border-t border-border-default">
            <span>Total</span>
            <span>{formatCurrencyBRL(Number(order.total))}</span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-surface-card rounded-radius-xl shadow-card p-4 space-y-3">
          {!!order.type && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-text-muted shrink-0" />
              <span className="text-text-secondary capitalize">{String(order.type)}</span>
              {!!order.delivery_address && (
                <span className="text-text-primary ml-1">— {String(order.delivery_address)}</span>
              )}
            </div>
          )}
          {!!order.payment_method && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-text-muted shrink-0" />
              <span className="text-text-primary">
                {PAYMENT_LABELS[order.payment_method as string] || String(order.payment_method)}
              </span>
            </div>
          )}
          {!!order.notes && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-text-muted shrink-0" />
              <span className="text-text-muted">{String(order.notes)}</span>
            </div>
          )}
        </div>

        <Link
          href={`/${slug}`}
          className="block w-full text-center bg-action-strong text-white font-bold text-base py-3.5 rounded-radius-xl active:scale-[0.98] transition-transform"
        >
          Fazer novo pedido
        </Link>
      </div>
    </div>
  );
}
