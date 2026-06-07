export type TransactionCategoryIconOption = {
  slug: string;
};

/** Slugi zgodne z PrimeIcons 7 — każdy ma odpowiadającą klasę `pi pi-{slug}`. */
export const TRANSACTION_CATEGORY_ICON_OPTIONS: TransactionCategoryIconOption[] = [
  { slug: 'shopping-cart' },
  { slug: 'home' },
  { slug: 'car' },
  { slug: 'wallet' },
  { slug: 'credit-card' },
  { slug: 'gift' },
  { slug: 'send' },
  { slug: 'shopping-bag' },
  { slug: 'heart' },
  { slug: 'star' },
  { slug: 'briefcase' },
  { slug: 'building' },
  { slug: 'building-columns' },
  { slug: 'money-bill' },
  { slug: 'chart-line' },
  { slug: 'chart-pie' },
  { slug: 'tag' },
  { slug: 'ticket' },
  { slug: 'phone' },
  { slug: 'wifi' },
  { slug: 'bolt' },
  { slug: 'sun' },
  { slug: 'moon' },
  { slug: 'cloud' },
  { slug: 'palette' },
  { slug: 'book' },
  { slug: 'graduation-cap' },
  { slug: 'headphones' },
  { slug: 'camera' },
  { slug: 'truck' },
  { slug: 'map-marker' },
  { slug: 'globe' },
  { slug: 'users' },
  { slug: 'user' },
  { slug: 'wrench' },
  { slug: 'hammer' },
  { slug: 'apple' },
];

export function getIconOption(slug: string | null | undefined): TransactionCategoryIconOption | undefined {
  if (!slug) return undefined;
  return TRANSACTION_CATEGORY_ICON_OPTIONS.find(o => o.slug === slug);
}
