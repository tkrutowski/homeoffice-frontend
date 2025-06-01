import type { LoanInstallment } from './Loan'
import type { FeeInstallment } from './Fee'

export type PaymentType = 'FEE' | 'LOAN'
export type Installment = FeeInstallment | LoanInstallment
export interface Payment {
  id: number
  idUser: number
  name: string
  paymentDay: number
  paymentType: 'LOAN' | 'FEE'
  loanStatus?: PaymentStatus
  feeStatus?: PaymentStatus
  installments: Installment[]
}

export enum PaymentStatus {
  PAID = "PAID",
  TO_PAY = "TO_PAY",
  OVER_DUE = "OVER_DUE",
  ALL = "ALL"
}

export enum PaymentMethod {
  CASH = "CASH",
  CASH_LATE = "CASH_LATE",
  TRANSFER = "TRANSFER",
}