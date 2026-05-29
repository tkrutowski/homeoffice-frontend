import { computed } from 'vue';
import { useDevicesStore } from '@/stores/devices';
import { useComputerStore } from '@/stores/computers';
import type { Device } from '@/types/Devices';
import type { Computer } from '@/types/Computer';
import { ComputerType } from '@/types/Computer';
import type {
  CategoryAggregate,
  ComputerListItem,
  DashboardAlert,
  DeviceChartData,
  RecentPurchaseItem,
} from '@/types/DeviceDashboard';
import { CATEGORY_COLORS, CHART_LINE_COLORS } from '@/mocks/deviceDashboard.mock';
import { useAuditStore } from '@/stores/audit';
import { UtilsService } from '@/service/UtilsService';

const UNCATEGORIZED = 'Inne';
const MAX_COMPUTERS = 8;
const MAX_RECENT_PURCHASES = 7;
const MAX_RECENT_CHANGES = 5;

/** Typy urządzeń scalane w jedną linię „Inne” na wykresie kosztów. */
export const CHART_CATEGORIES_MERGED_INTO_OTHER = ['Konsola', 'Kamery', 'RTV'] as const;

/** Laptop kupowany jako całość — bez alertów o brakujących częściach (CPU, RAM, dysk…). */
const LAPTOP_DEVICE_TYPE_NAME = 'Komputer-laptop';

function isIntegratedComputer(computer: Computer): boolean {
  if (computer.computerType === ComputerType.LAPTOP) return true;
  const typeStr = String(computer.computerType ?? '').trim();
  return typeStr.localeCompare(LAPTOP_DEVICE_TYPE_NAME, 'pl', { sensitivity: 'accent' }) === 0;
}

function getCategoryName(device: Device): string {
  return device.deviceType?.name?.trim() || UNCATEGORIZED;
}

/** Nazwa kategorii na wykresie (Konsola, Kamery, RTV → Inne). */
function getChartCategoryName(device: Device): string {
  const name = getCategoryName(device);
  if ((CHART_CATEGORIES_MERGED_INTO_OTHER as readonly string[]).includes(name)) {
    return UNCATEGORIZED;
  }
  return name;
}

function hasValidPurchaseAmount(amount: number | null | undefined): boolean {
  return amount != null && !Number.isNaN(Number(amount));
}

function getPurchaseYear(device: Device): number | null {
  if (!device.purchaseDate) return null;
  const d = new Date(device.purchaseDate);
  return Number.isNaN(d.getTime()) ? null : d.getFullYear();
}

function buildCategoryAggregates(devices: Device[]): CategoryAggregate[] {
  const map = new Map<string, { count: number; totalValue: number }>();

  for (const device of devices) {
    const name = getCategoryName(device);
    const current = map.get(name) ?? { count: 0, totalValue: 0 };
    current.count += 1;
    current.totalValue += Number(device.purchaseAmount) || 0;
    map.set(name, current);
  }

  return [...map.entries()]
    .map(([name, { count, totalValue }]) => ({ name, count, totalValue }))
    .sort((a, b) => b.count - a.count)
    .map((item, index) => {
      const palette =
        CATEGORY_COLORS[Math.min(index, CATEGORY_COLORS.length - 1)];
      return {
        ...item,
        colorClass: palette.text,
        barColorClass: palette.bar,
      };
    });
}

function buildDeviceAlerts(devices: Device[]): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  for (const device of devices) {
    if (device.activeStatus !== 'ACTIVE') continue;

    if (!device.imageUrl?.length) {
      alerts.push({
        id: `device-${device.id}-image`,
        severity: 'info',
        message: `Urządzenie „${device.name}" nie ma zdjęcia`,
        entityType: 'DEVICE',
        entityId: device.id,
      });
    }
    if (UtilsService.hasEmptyDeviceDetails(device.details)) {
      alerts.push({
        id: `device-${device.id}-desc`,
        severity: 'info',
        message: `Urządzenie „${device.name}" nie ma uzupełnionych szczegółów`,
        entityType: 'DEVICE',
        entityId: device.id,
      });
    }
    if (!device.firm) {
      alerts.push({
        id: `device-${device.id}-firm`,
        severity: 'info',
        message: `Urządzenie „${device.name}" nie ma podanego producenta`,
        entityType: 'DEVICE',
        entityId: device.id,
      });
    }
    if (!device.deviceType) {
      alerts.push({
        id: `device-${device.id}-type`,
        severity: 'warn',
        message: `Urządzenie „${device.name}" nie ma przypisanego typu`,
        entityType: 'DEVICE',
        entityId: device.id,
      });
    }
    if (!device.purchaseDate) {
      alerts.push({
        id: `device-${device.id}-date`,
        severity: 'warn',
        message: `Urządzenie „${device.name}" nie ma daty zakupu`,
        entityType: 'DEVICE',
        entityId: device.id,
      });
    }
    if (!hasValidPurchaseAmount(device.purchaseAmount)) {
      alerts.push({
        id: `device-${device.id}-amount`,
        severity: 'warn',
        message: `Urządzenie „${device.name}" nie ma ceny zakupu`,
        entityType: 'DEVICE',
        entityId: device.id,
      });
    }
  }

  return alerts;
}

function buildComputerAlerts(computers: Computer[]): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  for (const computer of computers) {
    if (computer.activeStatus !== 'ACTIVE') continue;

    if (isIntegratedComputer(computer)) {
      continue;
    }

    if (!computer.processor) {
      alerts.push({
        id: `computer-${computer.id}-cpu`,
        severity: 'warn',
        message: `${computer.name} — brak przypisanego procesora`,
        entityType: 'COMPUTER',
        entityId: computer.id,
      });
    }
    if (!computer.motherboard) {
      alerts.push({
        id: `computer-${computer.id}-mb`,
        severity: 'warn',
        message: `${computer.name} — brak przypisanej płyty głównej`,
        entityType: 'COMPUTER',
        entityId: computer.id,
      });
    }
    if (!computer.ram?.length) {
      alerts.push({
        id: `computer-${computer.id}-ram`,
        severity: 'warn',
        message: `${computer.name} — brak przypisanej pamięci RAM`,
        entityType: 'COMPUTER',
        entityId: computer.id,
      });
    }
    if (!computer.disk?.length) {
      alerts.push({
        id: `computer-${computer.id}-disk`,
        severity: 'warn',
        message: `${computer.name} — brak przypisanego dysku systemowego`,
        entityType: 'COMPUTER',
        entityId: computer.id,
      });
    }
  }

  return alerts;
}

function formatComputerSummary(computer: Computer): string {
  const cpu = computer.processor?.name ?? 'brak CPU';
  const gpu = computer.graphicCard?.[0]?.name ?? 'brak GPU';
  const ram =
    computer.ram?.length > 0
      ? computer.ram.map(r => r.name).join(', ')
      : 'brak RAM';
  const disk =
    computer.disk?.length > 0
      ? computer.disk.map(d => d.name).join(', ')
      : 'brak dysku';

  return [cpu, gpu, ram, disk].join(' · ');
}

function getComputerIcon(computerType: ComputerType): string {
  switch (computerType) {
    case ComputerType.LAPTOP:
      return 'pi pi-mobile';
    case ComputerType.TABLET:
      return 'pi pi-tablet';
    case ComputerType.DESKTOP:
    default:
      return 'pi pi-desktop';
  }
}

/** Koszty zakupów z listy urządzeń (GET /v1/devices) — oś X: lata, linie: kategorie typu urządzenia. */
function buildChartDataByYears(devices: Device[]): DeviceChartData {
  const withDate = devices.filter(d => getPurchaseYear(d) != null);

  if (withDate.length === 0) {
    return { labels: [], datasets: [], categoryTotals: [] };
  }

  const years = [...new Set(withDate.map(d => getPurchaseYear(d)!))].sort((a, b) => a - b);
  const labels = years.map(y => String(y));

  const valueByCategoryName = new Map<string, number>();
  for (const device of withDate) {
    const cat = getChartCategoryName(device);
    valueByCategoryName.set(
      cat,
      (valueByCategoryName.get(cat) ?? 0) + (Number(device.purchaseAmount) || 0)
    );
  }

  const sortedCategories = [...valueByCategoryName.entries()]
    .sort((a, b) => {
      if (a[0] === UNCATEGORIZED) return 1;
      if (b[0] === UNCATEGORIZED) return -1;
      return b[1] - a[1];
    })
    .map(([name]) => name);

  const chartCategories = sortedCategories;

  const yearlyByCategory = new Map<string, number[]>();
  for (const cat of chartCategories) {
    yearlyByCategory.set(cat, years.map(() => 0));
  }

  for (const device of withDate) {
    const year = getPurchaseYear(device)!;
    const yearIndex = years.indexOf(year);
    if (yearIndex === -1) continue;

    const cat = getChartCategoryName(device);
    const arr = yearlyByCategory.get(cat);
    if (arr) {
      arr[yearIndex] += Number(device.purchaseAmount) || 0;
    }
  }

  const datasets = chartCategories.map((label, index) => {
    const colors = CHART_LINE_COLORS[index % CHART_LINE_COLORS.length];
    return {
      label,
      data: yearlyByCategory.get(label) ?? years.map(() => 0),
      borderColor: colors.border,
      backgroundColor: colors.bg,
      tension: 0.35,
    };
  });

  const categoryTotals = chartCategories.map((label, index) => {
    const data = yearlyByCategory.get(label) ?? [];
    const colors = CHART_LINE_COLORS[index % CHART_LINE_COLORS.length];
    return {
      label,
      total: data.reduce((sum, v) => sum + v, 0),
      color: colors.border,
    };
  });

  return { labels, datasets, categoryTotals };
}

export function useDeviceDashboard() {
  const deviceStore = useDevicesStore();
  const computerStore = useComputerStore();
  const auditStore = useAuditStore();

  const devices = computed(() => deviceStore.devices);
  const computers = computed(() => computerStore.computers);

  const isLoading = computed(
    () => deviceStore.loadingDevices || computerStore.loadingComputers
  );

  const isLoadingAudit = computed(() => auditStore.loadingAudit);

  const totalValue = computed(() =>
    devices.value.reduce((sum, d) => sum + (Number(d.purchaseAmount) || 0), 0)
  );

  const categoryAggregates = computed(() => buildCategoryAggregates(devices.value));

  const valueByCategory = computed(() =>
    [...categoryAggregates.value].sort((a, b) => b.totalValue - a.totalValue)
  );

  const maxCategoryCount = computed(() => {
    const counts = categoryAggregates.value.map(c => c.count);
    return counts.length ? Math.max(...counts) : 1;
  });

  const chartData = computed(() => buildChartDataByYears(devices.value));

  const alerts = computed(() => [
    ...buildComputerAlerts(computers.value),
    ...buildDeviceAlerts(devices.value),
  ]);

  const computerListItems = computed((): ComputerListItem[] =>
    computers.value.slice(0, MAX_COMPUTERS).map(c => ({
      id: c.id,
      name: c.name,
      summary: formatComputerSummary(c),
      isActive: c.activeStatus === 'ACTIVE',
      icon: getComputerIcon(c.computerType),
    }))
  );

  const recentPurchases = computed((): RecentPurchaseItem[] =>
    devices.value
      .filter(d => d.purchaseDate != null)
      .sort((a, b) => new Date(b.purchaseDate!).getTime() - new Date(a.purchaseDate!).getTime())
      .slice(0, MAX_RECENT_PURCHASES)
      .map(d => ({
        id: d.id,
        name: d.name,
        category: getCategoryName(d),
        purchaseDate: new Date(d.purchaseDate!),
        amount: Number(d.purchaseAmount) || 0,
      }))
  );

  const recentChanges = computed(() => auditStore.recentChanges);

  const isEmpty = computed(() => devices.value.length === 0 && computers.value.length === 0);

  async function loadDashboardData() {
    const tasks: Promise<unknown>[] = [
      auditStore.fetchDashboardRecentChanges(MAX_RECENT_CHANGES),
    ];

    if (deviceStore.devices.length <= 1) {
      tasks.push(deviceStore.refreshDevices());
    }
    if (computerStore.computers.length === 0) {
      tasks.push(computerStore.getComputers());
    }

    await Promise.all(tasks);
  }

  return {
    devices,
    computers,
    isLoading,
    isLoadingAudit,
    isEmpty,
    loadDashboardData,
    totalValue,
    categoryAggregates,
    valueByCategory,
    maxCategoryCount,
    chartData,
    alerts,
    computerListItems,
    recentPurchases,
    recentChanges,
  };
}
