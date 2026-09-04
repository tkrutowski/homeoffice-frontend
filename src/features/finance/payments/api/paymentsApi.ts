import httpCommon from '@/config/http-common';
import type { Payment, Installment } from '@/features/finance/payments/types';
import { PaymentStatus } from '@/features/finance/payments/types';

export type PaymentsByStatusYearResult = Map<string, Payment[]>;

function normalizeInstallments(installments: Installment[]): Installment[] {
  return installments.map(installment => ({
    ...installment,
    paymentDeadline: installment.paymentDeadline ? new Date(installment.paymentDeadline) : null,
    paymentDate: installment.paymentDate ? new Date(installment.paymentDate) : null,
  }));
}

function parsePayment(payment: Payment): Payment {
  return {
    ...payment,
    installments: normalizeInstallments(payment.installments),
  };
}

export async function fetchPaymentsByStatusYear(
  status: PaymentStatus,
  year: number
): Promise<PaymentsByStatusYearResult> {
  const response = await httpCommon.get('/v1/finance/payment', {
    params: {
      status,
      date: year,
    },
  });

  const paymentsTemp = new Map(Object.entries(response.data));
  for (const [key, payments] of paymentsTemp.entries()) {
    paymentsTemp.set(
      key,
      (payments as Payment[]).map(payment => parsePayment(payment))
    );
  }

  return paymentsTemp as PaymentsByStatusYearResult;
}
