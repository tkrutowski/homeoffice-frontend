import type { Firm } from './Firm'
import type {PaymentStatus} from "./Payment.ts";

export interface Fee {
  id: number
  firm: Firm | null
  idUser: number
  name: string
  feeNumber: string
  date: Date | null
  feeFrequency: FeeFrequency | null
  numberOfPayments: number
  amount: number
  firstPaymentDate: Date | null
  accountNumber: string
  feeStatus: PaymentStatus
  otherInfo: string
  installmentList: FeeInstallment[]
}

export interface FeeInstallment {
  idFeeInstallment: number
  idFee: number
  installmentAmountToPay: number
  installmentAmountPaid: number
  paymentDeadline: Date | null
  paymentDate: Date | null
  paymentStatus: PaymentStatus
}

export interface FeeFrequency {
  name: string
  viewName: string
  frequencyNumber: number
}
