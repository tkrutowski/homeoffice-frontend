import type { PaymentStatus } from './Payment.ts';

export type PurchaseAddOrigin = 'current' | 'all' | null;

export type PurchaseAddContext = {
  origin: PurchaseAddOrigin;
  currentListUserId: number | null;
};

export function defaultPurchaseAddContext(): PurchaseAddContext {
  return {
    origin: null,
    currentListUserId: null,
  };
}

export interface Purchase {
  id: number;
  idCard: number;
  idFirm: number;
  idUser: number;
  name: string;
  purchaseDate: Date | null;
  amount: number;
  paymentDeadline: Date | null;
  paymentDate: Date | null;
  otherInfo: string;
  paymentStatus: PaymentStatus;
  installment: boolean;
}
