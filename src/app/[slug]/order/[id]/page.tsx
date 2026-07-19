'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrder } from '@/lib/api';
import { formatCurrencyBRL } from '@/lib/format';
import Link from 'next/link';
import { Check, Clock, CookingPot, Bike, Package, MapPin, CreditCard, ArrowLeft, RotateCcw } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'new', label: 'Pedido Recebido', icon: Check, description: 'Confirmamos seu pedido' },
  { key: 'preparing', label: 'Preparando', icon: CookingPot, description: 'Sua comida está sendo preparada' },
  { key: 'ready', label: 'Pronto', icon: Package, description: 'Pronto para retirada/entrega' },
  { key: 'out_for_delivery', label: 'Saiu para Entrega', icon: Bike, description: 'A caminho de você' },
  { key: 'delivered', label: 'Entregue', icon: Check, description: 'Pedido entregue com sucesso' },
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
      <div className="min-h-[100dvh] bg-surface-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-action-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted font-medium">Carregando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] bg-surface-page flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center">
          <Package className="w-8 h-8 text-text-muted" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold text-text-primary font-display">Pedido não encontrado</h1>
          <p className="text-text-secondary text-sm mt-1">Verifique o número do pedido e tente novamente.</p>
        </div>
        <Link
          href={`/${slug}`}
          className="mt-2 px-6 py-2.5 bg-action-primary text-text-on-brand rounded-full text-sm font-bold"
        >
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
    <div className="min-h-[100dvh] bg-surface-page pb-12">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface-card/95 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <Link href={`/${slug}`} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-subtle transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
          <h1 className="text-lg font-bold text-text-primary font-display">Acompanhar Pedido</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Status hero */}
        <div className={`rounded-2xl shadow-card p-6 text-center space-y-3 ${
          isCancelled ? 'bg-surface-card' : 'bg-gradient-to-b from-action-primary/5 to-surface-card'
        }`}>
          <div className="text-5xl mb-1">
            {isCancelled ? '😞' : status === 'delivered' || status === 'completed' ? '🎉' : '👨‍🍳'}
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary font-display">
            {isCancelled ? 'Pedido Cancelado' : STATUS_MAP[status] || status}
          </h2>
          <p className="text-sm text-text-secondary">
            Pedido #{String(order.id).slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-text-muted">
            {new Date(order.created_at as string).toLocaleString('pt-BR')}
          </p>
          {!isCancelled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-status-success/10 text-status-success">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
              {STATUS_MAP[status] || status}
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-status-error/10 text-status-error">
              <span className="w-1.5 h-1.5 rounded-full bg-status-error" />
              Cancelado
            </span>
          )}
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="bg-surface-card rounded-2xl shadow-card p-5">
            <div className="space-y-0">
              {STATUS_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i <= activeStep;
                const isCurrent = i === activeStep;
                const isLast = i === STATUS_STEPS.length - 1;
                const isDelivered = status === 'delivered' || status === 'completed';

                if (status === 'new' && i > 0) return null;
                if (status === 'preparing' && i > 1) return null;
                if (status === 'ready' && i > 2) return null;
                if (status === 'out_for_delivery' && i > 3) return null;

                return (
                  <div key={step.key} className="flex gap-3">
                    {/* Icon + line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isDelivered && isActive
                            ? 'bg-status-success text-white'
                            : isCurrent
                              ? 'bg-action-primary text-text-on-brand shadow-md'
                              : isActive
                                ? 'bg-action-primary/20 text-action-primary'
                                : 'bg-surface-section text-text-muted'
                        }`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 my-1 rounded-full transition-colors ${
                          i < activeStep
                            ? isDelivered ? 'bg-status-success' : 'bg-action-primary'
                            : 'bg-border-subtle'
                        }`} />
                      )}
                    </div>

                    {/* Text */}
                    <div className="pt-1.5 pb-2">
                      <p className={`text-sm font-bold ${isActive ? 'text-text-primary' : 'text-text-muted'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-text-muted mt-0.5">{step.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-surface-card rounded-2xl shadow-card p-4 space-y-2.5">
          <h2 className="text-sm font-bold text-text-primary font-display">Itens do Pedido</h2>
          {items.length === 0 && (
            <p className="text-sm text-text-muted">Nenhum item disponível</p>
          )}
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <div className="flex-1 min-w-0">
                <span className="text-text-primary font-medium">
                  {String(item.quantity)}x {String(item.product_name)}
                </span>
              </div>
              <span className="text-text-primary font-semibold ml-3 shrink-0">
                {formatCurrencyBRL(Number(item.total_price))}
              </span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-surface-card rounded-2xl shadow-card p-4 space-y-2">
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
            <div className="flex justify-between text-sm text-status-success font-medium">
              <span>Desconto</span>
              <span>-{formatCurrencyBRL(Number(order.discount_amount))}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-extrabold text-text-primary pt-2 border-t border-border-subtle">
            <span className="font-display">Total</span>
            <span className="font-display">{formatCurrencyBRL(Number(order.total))}</span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-surface-card rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-text-primary font-display">Detalhes</h2>
          {!!order.type && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-7 h-7 rounded-full bg-surface-subtle flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <div>
                <span className="text-text-secondary capitalize">{String(order.type)}</span>
                {!!order.delivery_address && (
                  <span className="text-text-primary ml-1">— {String(order.delivery_address)}</span>
                )}
              </div>
            </div>
          )}
          {!!order.payment_method && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-7 h-7 rounded-full bg-surface-subtle flex items-center justify-center shrink-0">
                <CreditCard className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <span className="text-text-primary">
                {PAYMENT_LABELS[order.payment_method as string] || String(order.payment_method)}
              </span>
            </div>
          )}
          {!!order.notes && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-7 h-7 rounded-full bg-surface-subtle flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <span className="text-text-muted">{String(order.notes)}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/${slug}`}
          className="block w-full text-center bg-action-strong text-white font-bold text-base py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Fazer novo pedido
        </Link>
      </div>
    </div>
  );
}
