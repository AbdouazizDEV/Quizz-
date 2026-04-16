export type PlanId = 'plan_1m' | 'plan_2m' | 'plan_3m' | 'plan_6m' | 'plan_12m';

export type PaymentMethodId =
  | 'orange_money'
  | 'wave'
  | 'paypal'
  | 'google_pay'
  | 'apple_pay'
  | 'card';

export interface Plan {
  id: PlanId;
  durationLabel: string;
  discountPercent: number;
  price: number;
  currency: 'FCFA';
  isPopular?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  planId: PlanId;
  expiresAt: string;
}
