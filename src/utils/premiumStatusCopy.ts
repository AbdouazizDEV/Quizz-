import type { components } from '@sdk';

export type PremiumContractView = components['schemas']['PremiumContract'];

function formatDakar(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Dakar',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function premiumStatusPresentation(input: {
  loading: boolean;
  error: boolean;
  premium?: PremiumContractView | null;
}): { title: string; body: string } {
  if (input.loading && !input.premium) {
    return { title: 'Premium', body: 'Chargement du statut…' };
  }
  if (input.error && !input.premium) {
    return { title: 'Premium', body: 'Statut indisponible pour le moment.' };
  }

  const premium = input.premium;
  if (!premium || premium.status === 'inactive') {
    return { title: 'Premium', body: 'Non activé. L’accès Arena reste gratuit.' };
  }

  const when = premium.expires_at ? formatDakar(premium.expires_at) : '';
  const days = premium.days_remaining ?? 0;
  if (premium.status === 'expired' || premium.expired) {
    return {
      title: 'Premium expiré',
      body: when ? `Échéance passée le ${when}.` : 'Échéance passée.',
    };
  }

  const remaining = days > 0 ? `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}` : 'dernier jour';
  if (premium.source === 'arena') {
    return { title: 'Premium Arena', body: `Actif jusqu’au ${when} · ${remaining}` };
  }
  if (premium.source === 'classic_trial') {
    return { title: 'Essai classique', body: `Actif · ${remaining}` };
  }
  return { title: 'Premium', body: when ? `Actif jusqu’au ${when} · ${remaining}` : `Actif · ${remaining}` };
}
