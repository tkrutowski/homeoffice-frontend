import type { Firm } from '@/types/Firm';
import type { ActiveStatus } from '@/types/ActiveStatus';
import type { FileInfo } from '@/types/FileInfo';

export interface Device {
  id: number;
  deviceType: DeviceType | null;
  firm: Firm | null;
  name: string;
  purchaseDate: Date | null;
  purchaseAmount: number;
  sellDate: Date | null;
  sellAmount: number;
  warrantyEndDate: Date | null;
  insuranceEndDate: Date | null;
  otherInfo: string;
  activeStatus: ActiveStatus;
  details: Map<string, string>;
  imageUrl: string;
  files: FileInfo[];
}

export interface DeviceType {
  id: number;
  name: string;
}
