import type { TransactionCategoryDto } from '@/types/BankTransaction';
import { UtilsService } from '@/service/UtilsService';
import { TRANSACTION_CATEGORY_DEFAULT_COLOR } from '@/config/transactionCategoryColors';

export type CategoryDisplayConfig = {
  iconClass?: string;
  backgroundColor: string;
  initial?: string;
};

const LEGACY_ICONS_BY_ID: Record<number, { icon?: string; colorClass: string }> = {};

const LEGACY_ICONS_BY_NAME: Record<string, { icon?: string; colorClass: string }> = {
  'Outgoing Transfers': { icon: 'pi pi-arrow-right-arrow-left', colorClass: 'bg-red-500 text-white' },
  'Incoming Transfers': { icon: 'pi pi-arrow-right-arrow-left', colorClass: 'bg-emerald-500 text-white' },
  'Family & Personal': { icon: 'pi pi-user', colorClass: 'bg-blue-500 text-white' },
  Rachunki: { icon: 'pi pi-home', colorClass: 'bg-teal-500 text-white' },
};

/** @deprecated Użyj getCategoryDisplay */
export type CategoryIconConfig = {
  icon?: string;
  colorClass: string;
};

/** @deprecated Użyj getCategoryDisplay */
export function getCategoryIconConfig(
  category: { id: number; name: string; icon?: string | null; color?: string | null } | null | undefined
): CategoryIconConfig | null {
  const display = getCategoryDisplay(category);
  if (!display) return null;
  if (display.iconClass) {
    return { icon: display.iconClass, colorClass: 'text-white' };
  }
  return null;
}

export function getCategoryInitial(name: string | undefined | null): string {
  const c = (name ?? '').trim().charAt(0);
  return c ? c.toUpperCase() : '?';
}

export function getCategoryDisplay(
  category: TransactionCategoryDto | { id: number; name: string; icon?: string | null; color?: string | null } | null | undefined
): CategoryDisplayConfig | null {
  if (!category) return null;

  const iconClass = UtilsService.toPrimeIconClass(category.icon);
  const normalizedColor = UtilsService.normalizeHexColor(category.color);
  if (iconClass || normalizedColor) {
    return {
      iconClass,
      backgroundColor: normalizedColor ?? TRANSACTION_CATEGORY_DEFAULT_COLOR,
    };
  }

  const legacy = LEGACY_ICONS_BY_ID[category.id] ?? LEGACY_ICONS_BY_NAME[category.name];
  if (legacy?.icon) {
    return {
      iconClass: legacy.icon,
      backgroundColor: TRANSACTION_CATEGORY_DEFAULT_COLOR,
    };
  }

  return {
    backgroundColor: TRANSACTION_CATEGORY_DEFAULT_COLOR,
    initial: getCategoryInitial(category.name),
  };
}
