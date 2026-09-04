import type { ActiveStatus } from '@/types/ActiveStatus';
import type { Device } from '@/features/device/devices/types';

export interface ComponentType {
  name:
    | 'PROCESSOR'
    | 'MOTHERBOARD'
    | 'NONE'
    | 'COMPUTER_CASE'
    | 'RAM'
    | 'GRAPHICS_CARD'
    | 'DISK'
    | 'POWER'
    | 'COOLER'
    | 'DISPLAY'
    | 'KEYBOARD'
    | 'MOUSE'
    | 'SOUND_CARD'
    | 'USB';
  max: number;
  viewName: string;
  column:
    | 'processor'
    | 'motherboard'
    | 'computerCase'
    | 'ram'
    | 'graphicCard'
    | 'disk'
    | 'power'
    | 'cooling'
    | 'display'
    | 'keyboard'
    | 'mouse'
    | 'soundCard'
    | 'usb';
}

export enum ComputerType {
  LAPTOP = 'LAPTOP',
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  ALL = 'ALL',
}

/** Desktop computer — komponenty jako obiekty Device */
export interface DesktopComputer {
  id?: number;
  idUser: number;
  name: string;
  activeStatus: ActiveStatus;
  info?: string;
  computerType: ComputerType.DESKTOP | 'DESKTOP';
  processor: Device | null;
  motherboard: Device | null;
  ram: Device[];
  disk: Device[];
  power: Device | null;
  cooling: Device[];
  display: Device[];
  keyboard: Device | null;
  mouse: Device | null;
  computerCase: Device | null;
  soundCard: Device | null;
  graphicCard: Device[];
  usb: Device[];
}

/** Laptop computer — specyfikacja jako stringi */
export interface LaptopComputer {
  id?: number;
  idUser: number;
  name: string;
  activeStatus: ActiveStatus;
  info?: string;
  computerType: ComputerType.LAPTOP | 'LAPTOP';
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  display?: string;
}

/** Union type — Computer może być Desktop lub Laptop */
export type Computer = DesktopComputer | LaptopComputer;

/** Type guard — sprawdzenie czy jest laptop */
export function isLaptop(computer: Computer): computer is LaptopComputer {
  return computer.computerType === ComputerType.LAPTOP;
}

/** Type guard — sprawdzenie czy jest desktop */
export function isDesktop(computer: Computer): computer is DesktopComputer {
  return computer.computerType === ComputerType.DESKTOP;
}
