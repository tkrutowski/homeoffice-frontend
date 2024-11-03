import {Firm} from "@/types/Firm.ts";
import {ActiveStatus} from "@/types/Bank.ts";


export interface Device {
  id: number;
  deviceType: DeviceType;
  firm: Firm;
  name: string;
  purchaseDate: Date | undefined;
  purchaseAmount: number;
  sellDate: Date | undefined;
  sellAmount: number;
  warrantyEndDate: Date | undefined;
  insuranceEndDate: Date | undefined;
  otherInfo: string;
  activeStatus: ActiveStatus;
}

export interface DeviceType {
  id: number;
  name: string;
}

export interface DeviceDto {
  id: number;
  deviceType: string;
  firm: string;
  name: string;
  purchaseDate: Date | undefined;
  purchaseAmount: number;
  sellDate: Date | undefined;
  sellAmount: number;
  warrantyEndDate: Date | undefined;
  insuranceEndDate: Date | undefined;
  otherInfo: string;
  activeStatus: ActiveStatus;
}