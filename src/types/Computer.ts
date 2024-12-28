import type {ActiveStatus} from "./Bank.ts";
import type {Device} from "./Devices.ts";

export type Component = 'PROCESSOR' | 'MOTHERBOARD' | 'NONE'

export interface ComputerDto {
  id: number
  name: string
  processor:  Device | null
  motherboard:  Device | null
  ram:  Device[]
  disk:  Device[]
  power:  Device | null
  cooling:  Device[]
  monitor: Device[]
  keyboard: Device | null
  mouse: Device | null
  case: Device | null
  graphicCard: Device | null
  soundCard: Device | null
  usb: Device[]
  otherInfo: string
  activeStatus: ActiveStatus
}

export interface Computer {
  id: number
  name: string
  processor:  number
  motherboard:  number
  ram:  number[]
  disk:  number[]
  power:  number
  cooling:  number[]
  monitor: number[]
  keyboard: number
  mouse: number
  case: number
  soundCard: number
  graphicCard: number[]
  usb: number[]
  otherInfo: string
  activeStatus: ActiveStatus
}
