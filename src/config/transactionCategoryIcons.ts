export type CategoryIconConfig = {
  icon?: string;
  colorClass: string;
};

const CATEGORY_ICONS_BY_ID: Record<number, CategoryIconConfig> = {};

const CATEGORY_ICONS_BY_NAME: Record<string, CategoryIconConfig> = {
  'Outgoing Transfers': { icon: 'pi pi-arrow-right-arrow-left', colorClass: 'bg-red-500 text-white' },
  'Incoming Transfers': { icon: 'pi pi-arrow-right-arrow-left', colorClass: 'bg-emerald-500 text-white' },
  'Family & Personal': { icon: 'pi pi-user', colorClass: 'bg-blue-500 text-white' },
  Rachunki: { icon: 'pi pi-home', colorClass: 'bg-teal-500 text-white' },
};

export function getCategoryIconConfig(
  category: { id: number; name: string } | null | undefined
): CategoryIconConfig | null {
  if (!category) return null;
  return CATEGORY_ICONS_BY_ID[category.id] ?? CATEGORY_ICONS_BY_NAME[category.name] ?? null;
}

export function getCategoryInitial(name: string | undefined | null): string {
  const c = (name ?? '').trim().charAt(0);
  return c ? c.toUpperCase() : '?';
}
