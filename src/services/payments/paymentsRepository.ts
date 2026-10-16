import { apiClient } from '@services/api/apiClient';

export type PaidPlanId = 'plan_1m' | 'plan_12m';

export function readApiError(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { error?: unknown; message?: unknown } } }).response?.data;
    if (typeof data?.error === 'string' && data.error.trim()) return data.error;
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  }
  return fallback;
}

export async function createPremiumCheckout(planId: PaidPlanId) {
  const response = await apiClient.post<{ url: string; reference: string; plan_id: PaidPlanId }>(
    '/payments/checkout',
    { plan_id: planId },
  );
  return response.data;
}

export async function fetchPremiumPayment(reference: string) {
  const response = await apiClient.get<{ reference: string; status: string }>(`/payments/${encodeURIComponent(reference)}`);
  return response.data;
}
