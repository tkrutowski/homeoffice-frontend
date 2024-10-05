import { LoanInstallment } from "@/assets/types/Loan";
import { FeeInstallment } from "@/assets/types/Fee";

export type PaymentType = "FEE" | "LOAN";
export type Installment = FeeInstallment | LoanInstallment;
export interface Payment {
  id: number;
  idUser: number;
  name: string;
  paymentDay: number;
  installments: Installment[];
  paymentType: PaymentType;
}
