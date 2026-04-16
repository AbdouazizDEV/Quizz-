export function formatCurrency(value: number, currency: string = 'FCFA'): string {
  return `${value.toLocaleString('fr-FR')} ${currency}`;
}
