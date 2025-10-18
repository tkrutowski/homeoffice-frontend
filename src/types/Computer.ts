import type { ActiveStatus } from './Bank.ts';
import type { Device } from './Devices.ts';

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

export interface Computer {
  id: number;
  idUser: number;
  name: string;
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
  info: string;
  activeStatus: ActiveStatus;
  computerType: ComputerType;
}
