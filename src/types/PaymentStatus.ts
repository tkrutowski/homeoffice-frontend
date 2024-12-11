type Status = 'PAID' | 'TO_PAY' | 'OVER_DUE'
export interface PaymentStatus {
  name: Status
  viewName: string
}
