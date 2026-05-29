export type DashboardAlertSeverity = 'warn' | 'info';

export interface DashboardAlert {
  id: string;
  severity: DashboardAlertSeverity;
  message: string;
  entityType: 'DEVICE' | 'COMPUTER';
  entityId?: number;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditEntityType = 'DEVICE' | 'COMPUTER';

export interface AuditChangeEntry {
  id: number;
  action: AuditAction;
  entityType: AuditEntityType;
  entityName: string;
  timestamp: Date;
  user?: string;
}

export interface CategoryAggregate {
  name: string;
  count: number;
  totalValue: number;
  colorClass: string;
  barColorClass: string;
}

export interface ComputerListItem {
  id: number;
  name: string;
  summary: string;
  isActive: boolean;
  icon: string;
}

export interface RecentPurchaseItem {
  id: number;
  name: string;
  category: string;
  purchaseDate: Date;
  amount: number;
}

export interface ChartDatasetConfig {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension?: number;
}

export interface DeviceChartData {
  /** Lata na osi X (np. "2022", "2023") */
  labels: string[];
  datasets: ChartDatasetConfig[];
  /** Sumy kosztów per kategoria (legenda / pigułki) */
  categoryTotals: { label: string; total: number; color: string }[];
}
