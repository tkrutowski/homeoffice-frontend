import type {ActiveStatus} from "./Bank.ts";
import type {Device} from "./Devices.ts";

export interface ComponentType {
    name: 'PROCESSOR' | 'MOTHERBOARD' | 'NONE' | 'COMPUTER_CASE' | 'RAM' | 'GRAPHICS_CARD' | 'DISK' | 'POWER' | 'COOLER' | 'DISPLAY' | 'KEYBOARD' | 'MOUSE' | 'SOUND_CARD' | 'USB'
    max: number
    viewName: string
    column: 'processor' | 'motherboard' | 'computerCase' | 'ram' | 'graphicCard' | 'disk' | 'power' | 'cooling' | 'display' | 'keyboard' | 'mouse' | 'soundCard' | 'usb'
}

export interface ComputerType {
    name: 'LAPTOP' | 'DESKTOP' | 'TABLET'
    viewName: string
}

export interface ComputerDto {
    id: number
    name: string
    processor: Device | null
    motherboard: Device | null
    ram: Device[]
    disk: Device[]
    power: Device | null
    cooling: Device[]
    display: Device[]
    keyboard: Device | null
    mouse: Device | null
    computerCase: Device | null
    graphicCard: Device | null
    soundCard: Device | null
    usb: Device[]
    info: string
    activeStatus: ActiveStatus
}

export interface Computer {
    id: number
    name: string
    processor: number
    motherboard: number
    ram: number[]
    disk: number[]
    power: number
    cooling: number[]
    display: number[]
    keyboard: number
    mouse: number
    computerCase: number
    soundCard: number
    graphicCard: number[]
    usb: number[]
    info: string
    activeStatus: ActiveStatus
}
