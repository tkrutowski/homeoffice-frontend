import type { Firm } from './Firm.ts'
import type { ActiveStatus } from './Bank.ts'

export interface Device {
  id: number
  deviceType: DeviceType | null
  firm: Firm | null
  name: string
  purchaseDate:  Date | null
  purchaseAmount: number
  sellDate: Date | null
  sellAmount: number
  warrantyEndDate:  Date | null
  insuranceEndDate:  Date | null
  otherInfo: string
  activeStatus: ActiveStatus
}

export interface DeviceType {
  id: number
  name: string
}

export interface DeviceDto {
  id: number
  deviceType: string | undefined
  firm: string | null
  name: string
  purchaseDate:  Date | null
  purchaseAmount: number
  sellDate:  Date | null
  sellAmount: number
  warrantyEndDate:  Date | null
  insuranceEndDate:  Date | null
  otherInfo: string
  activeStatus: ActiveStatus
}
