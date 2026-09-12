import type { Bank } from '@/features/finance/banks/types';
import type { PaymentStatus } from '@/features/finance/payments/types';
import type { Purchase } from '@/features/finance/purchases/types';

export interface Loan {
  id: number;
  bank: Bank | null;
  idUser: number;
  name: string;
  amount: number;
  date: Date | null;
  loanNumber: string;
  accountNumber: string;
  firstPaymentDate: Date | null;
  numberOfInstallments: number;
  installmentAmount: number;
  loanStatus: PaymentStatus;
  loanCost: number; //prowizja itp
  otherInfo: string;
  installmentList: LoanInstallment[];
}
export interface LoanInstallment {
  idLoanInstallment: number;
  idLoan: number;
  installmentNumber: number;
  installmentAmountToPay: number;
  installmentAmountPaid: number;
  paymentDeadline: Date | null;
  paymentDate: Date | null;
  paymentStatus: PaymentStatus;
}

/** Podgląd/sugestia przed zamianą zakupów na kredyt — GET /finance/loan/from-purchases/draft. */
export interface LoanFromPurchasesDraft {
  suggestedAmount: number;
  suggestedName: string;
  suggestedDate: Date | null;
  purchases: Purchase[];
  warnings: string[];
}
