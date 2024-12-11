import type { LoanInstallment } from './Loan'
import type { FeeInstallment } from './Fee'

export type PaymentType = 'FEE' | 'LOAN'
export type Installment = FeeInstallment | LoanInstallment
export interface Payment {
  id: number
  idUser: number
  name: string
  paymentDay: number
  installments: Installment[]
  paymentType: PaymentType
}
