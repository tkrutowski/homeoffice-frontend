import { PaymentStatus } from "@/assets/types/PaymentStatus";
import { Bank } from "@/assets/types/Bank";

export interface Loan {
  id: number;
  bank: Bank | undefined;
  idUser: number;
  name: string;
  amount: number;
  date: string;
  loanNumber: string;
  accountNumber: string;
  firstPaymentDate: string;
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
  paymentDeadline: string;
  paymentDate: string | undefined;
  paymentStatus: PaymentStatus;
}
