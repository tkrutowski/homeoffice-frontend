/** Klasy wizualne kart transakcji — 1:1 struktura jak PurchaseCurrentItem/Group, tonacja primary zamiast emerald. */

export const transactionItemCardClasses =
  'border-orange-400 bg-gradient-to-br from-orange-50 via-white to-orange-100 text-orange-950 ' +
  'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.07),0_0_24px_rgba(251,146,60,0.55)] ' +
  'dark:border-orange-500/85 dark:from-orange-950 dark:via-neutral-950 dark:to-orange-950/90 dark:text-white ' +
  'dark:shadow-[0_0_22px_rgba(251,146,60,0.5),0_0_36px_rgba(234,88,12,0.22)]';

export const transactionItemTitleClass = 'text-surface-950 dark:text-white';

export const transactionItemSubtitleClass = 'text-orange-800/90 dark:text-orange-100/90';

export const transactionItemOtherInfoClass = 'text-orange-700/80 dark:text-orange-200/65';

export const transactionGroupFrameClasses =
  'overflow-hidden rounded-2xl border border-orange-400 bg-transparent ' +
  'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.07),0_0_24px_rgba(251,146,60,0.55)] ' +
  'dark:border-orange-500/85 ' +
  'dark:shadow-[0_0_22px_rgba(251,146,60,0.5),0_0_36px_rgba(234,88,12,0.22)]';

export const transactionGroupHeaderClasses =
  'border-b border-orange-400/30 bg-orange-50 bg-gradient-to-br from-orange-50 via-white to-orange-100 ' +
  'dark:border-orange-600/35 dark:bg-orange-950 dark:bg-gradient-to-br dark:from-orange-950 dark:via-neutral-950 dark:to-orange-950/90';

export const transactionGroupHeaderDateClass =
  'text-4xl font-semibold tracking-tight text-orange-950 dark:text-orange-50';

export const transactionGroupHeaderCaptionClass =
  'text-sm font-medium text-orange-900/90 dark:text-orange-100/90';

export const transactionGroupHeaderAmountClass =
  'text-2xl font-bold tabular-nums tracking-tight text-orange-950 dark:text-orange-50';

export const transactionFirmAvatarClass =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-contrast shadow-inner dark:bg-orange-600 dark:text-white';
