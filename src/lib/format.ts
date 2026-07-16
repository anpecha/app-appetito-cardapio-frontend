export function formatCurrencyBRL(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0,00';
  const amount = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(amount)) return '0,00';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
