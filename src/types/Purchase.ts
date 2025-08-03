import type { PaymentStatus } from './Payment.ts';

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
