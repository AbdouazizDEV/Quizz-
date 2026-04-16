import { apiClient } from './api/apiClient';
import type { PaymentMethodId, PaymentResult, PlanId } from '../types/premium.types';

interface IPaymentService {
  processPayment(planId: PlanId, methodId: PaymentMethodId): Promise<PaymentResult>;
}

const PaymentService: IPaymentService = {
  async processPayment(planId, methodId) {
    const { data } = await apiClient.post<PaymentResult>('/payments/subscribe', {
      planId,
      methodId,
    });
    return data;
  },
};

export { PaymentService };
