import type { Device, DeviceType } from '@/features/device/devices/types';
import type { Computer } from '@/features/device/computers/types';
import { ComputerType } from '@/features/device/computers/types';
import type {
  AuditChangeEntry,
  CategoryAggregate,
  ComputerListItem,
  DashboardAlert,
  DeviceChartData,
  RecentPurchaseItem,
} from '@/features/device/home/dashboardTypes';

export const mockDeviceType: DeviceType = {
  id: 1,
  name: 'Procesor',
};

export const mockDevice: Device = {
  id: 101,
  deviceType: mockDeviceType,
  firm: {
    id: 1,
    name: 'Intel',
    phone: '',
    phone2: '',
    fax: '',
    mail: '',
    www: '',
    otherInfo: '',
    address: { id: 1, city: 'Warszawa', street: '', zip: '' },
  },
  name: 'Intel Core i7-13700K',
  purchaseDate: new Date('2024-03-15'),
  purchaseAmount: 1899,
  sellDate: null,
  sellAmount: 0,
  warrantyEndDate: new Date('2027-03-15'),
  insuranceEndDate: null,
  otherInfo: '',
  activeStatus: 'ACTIVE',
  details: new Map([['Socket', 'LGA1700'], ['Rdzenie', '16']]),
  imageUrl: '',
  files: [],
};

export const mockComputer: Computer = {
  id: 1,
  idUser: 1,
  name: 'PC Biurko',
  processor: mockDevice,
  motherboard: null,
  ram: [],
  disk: [],
  power: null,
  cooling: [],
  display: [],
  keyboard: null,
  mouse: null,
  computerCase: null,
  soundCard: null,
  graphicCard: [],
  usb: [],
  info: '',
  activeStatus: 'ACTIVE',
  computerType: ComputerType.DESKTOP,
};

export const mockCategoryAggregates: CategoryAggregate[] = [
  {
    name: 'Procesor',
    count: 3,
    totalValue: 4500,
    colorClass: 'text-sky-600 dark:text-sky-400',
    barColorClass: 'bg-sky-500',
  },
  {
    name: 'RAM',
    count: 5,
    totalValue: 2200,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    barColorClass: 'bg-emerald-500',
  },
];

export const mockAlerts: DashboardAlert[] = [
  {
    id: '1',
    severity: 'warn',
    message: 'Brak procesora w komputerze PC Biurko',
    entityType: 'COMPUTER',
    entityId: 1,
  },
  {
    id: '2',
    severity: 'info',
    message: 'Gwarancja kończy się za 30 dni',
    entityType: 'DEVICE',
    entityId: 101,
  },
];

export const mockComputerList: ComputerListItem[] = [
  {
    id: 1,
    name: 'PC Biurko',
    summary: 'i7 · 32 GB · RTX',
    isActive: true,
    icon: 'pi pi-desktop',
  },
];

export const mockRecentPurchases: RecentPurchaseItem[] = [
  {
    id: 101,
    name: 'Intel Core i7-13700K',
    category: 'Procesor',
    purchaseDate: new Date('2024-03-15'),
    amount: 1899,
  },
];

export const mockRecentChanges: AuditChangeEntry[] = [
  {
    id: 1,
    action: 'UPDATE',
    entityType: 'DEVICE',
    entityName: 'Intel Core i7-13700K',
    timestamp: new Date('2026-07-20'),
    user: 'tomek',
  },
];

export const mockChartData: DeviceChartData = {
  labels: ['2023', '2024', '2025'],
  datasets: [
    {
      label: 'Procesor',
      data: [0, 1899, 0],
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14, 165, 233, 0.15)',
      tension: 0.3,
    },
  ],
  categoryTotals: [{ label: 'Procesor', total: 1899, color: '#0ea5e9' }],
};
