import { PaymentStatus } from "@/assets/types/PaymentStatus";
import Firm from "@/assets/types/Firm";

export interface Fee {
  id: number;
  firm: Firm | undefined;
  idUser: number;
  name: string;
  feeNumber: string;
  date: string;
  feeFrequency: FeeFrequency | undefined;
  numberOfPayments: number;
  amount: number;
  firstPaymentDate: string;
  accountNumber: string;
  feeStatus: PaymentStatus;
  otherInfo: string;
  installmentList: FeeInstallment[];
}
export interface FeeInstallment {
  idFeeInstallment: number;
  idFee: number;
  installmentAmountToPay: number;
  installmentAmountPaid: number;
  paymentDeadline: string;
  paymentDate: string | undefined;
  paymentStatus: PaymentStatus;
}

export interface FeeFrequency {
  name: string;
  viewName: string;
  frequencyNumber: number;
}
