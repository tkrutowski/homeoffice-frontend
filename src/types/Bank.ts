export type ActiveStatus = 'ACTIVE' | 'INACTIVE' | 'ALL'

export interface Bank {
  id: number
  name: string
  address: Address
  phone: string
  phone2: string
  fax: string
  mail: string
  www: string
  otherInfo: string
}

export interface Address {
  id: number;
  city: string;
  street: string;
  zip: string;
}

export interface Card {
  id: number
  idBank: number
  idUser: number
  name: string
  activationDate: Date | null
  limit: number
  repaymentDay: number
  expirationDate: Date | null
  otherInfo: string
  activeStatus: ActiveStatus
  cardNumber: string
  closingDay: number
  imageUrl: string
}
