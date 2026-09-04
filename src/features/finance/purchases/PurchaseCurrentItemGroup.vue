<script setup lang="ts">
  import PurchaseCurrentItem from '@/features/finance/purchases/PurchaseCurrentItem.vue';
  import moment from 'moment';
  import { computed, type PropType } from 'vue';
  import { UtilsService } from '@/service/UtilsService.ts';
  import { useCardsListQuery } from '@/features/finance/cards/queries/useCardsQueries';
  import { findCardById } from '@/features/finance/cards/api/cardsApi';
  import type { Purchase } from '@/features/finance/purchases/types';
  import { PaymentStatus } from '@/features/finance/payments/types';

  const cardsQuery = useCardsListQuery('ALL');
  const props = defineProps({
    deadlineDate: {
      type: String,
      required: true,
    },
    purchases: {
      type: Array as PropType<Purchase[]>,
      required: true,
    },
    selectedPurchaseIds: {
      type: Array as PropType<number[]>,
      required: true,
    },
    onToggleSelection: {
      type: Function as PropType<(purchase: Purchase) => void>,
      required: true,
    },
    onRemoveFromSelection: {
      type: Function as PropType<(purchaseId: number) => void>,
      required: false,
    },
  });
  const cardLogo = computed(() => {
    const first = props.purchases?.[0];
    if (!first) return '';
    return findCardById(cardsQuery.data.value ?? [], first.idCard)?.imageUrl ?? '';
  });

  const calculateToPay = computed(() => {
    const toPay = props.purchases.reduce((sum, p) => {
      if (p.paymentStatus === PaymentStatus.PAID) return sum;
      return sum + Number(p.amount);
    }, 0);
    return UtilsService.formatCurrency(toPay);
  });

  /** Termin grupy minął — wizualnie jak karta „po terminie” w PurchaseCurrentItem. */
  const deadlinePast = computed(() => moment(props.deadlineDate).isBefore(moment()));

  /** Obramowanie + cień całej karty (jak `cardVariantClasses` w PurchaseCurrentItem). */
  const groupCardFrameClass = computed(() => {
    if (deadlinePast.value) {
      return [
        'overflow-hidden rounded-2xl border border-red-400 bg-transparent',
        'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.07),0_0_22px_rgba(251,113,133,0.62),0_0_40px_rgba(239,68,68,0.42)]',
        'dark:border-rose-500/85',
        'dark:shadow-[0_0_22px_rgba(248,113,113,0.5),0_0_36px_rgba(220,38,38,0.22)]',
      ].join(' ');
    }
    return [
      'overflow-hidden rounded-2xl border border-emerald-400 bg-transparent',
      'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.07),0_0_24px_rgba(52,211,153,0.55)]',
      'dark:border-emerald-500/85',
      'dark:shadow-[0_0_22px_rgba(52,211,153,0.5),0_0_36px_rgba(16,185,129,0.22)]',
    ].join(' ');
  });

  /**
   * Nagłówek: ten sam gradient co `cardVariantClasses` w PurchaseCurrentItem (bez zewnętrznej ramki — ta jest na section).
   * Kolory tekstu na elementach potomnych — jawne klasy (dziedziczenie bywa gaszone przez style globalne).
   */
  const groupHeaderToneClass = computed(() => {
    if (deadlinePast.value) {
      return [
        'border-b border-red-400/35 bg-red-50 bg-gradient-to-br from-red-50 via-rose-100/70 to-rose-100',
        'dark:border-rose-500/40 dark:bg-neutral-950 dark:bg-gradient-to-br dark:from-neutral-950 dark:via-red-950/95 dark:to-red-900/50',
      ].join(' ');
    }
    return [
      'border-b border-emerald-400/30 bg-emerald-50 bg-gradient-to-br from-emerald-50 via-white to-emerald-100',
      'dark:border-emerald-600/35 dark:bg-emerald-950 dark:bg-gradient-to-br dark:from-emerald-950 dark:via-neutral-950 dark:to-emerald-950/90',
    ].join(' ');
  });

  const headerDateClass = computed(() =>
    deadlinePast.value
      ? 'text-4xl font-semibold tracking-tight text-red-950 dark:text-white'
      : 'text-4xl font-semibold tracking-tight text-emerald-950 dark:text-emerald-50'
  );

  const headerCaptionClass = computed(() =>
    deadlinePast.value
      ? 'text-sm font-medium text-red-900/90 dark:text-red-100/90'
      : 'text-sm font-medium text-emerald-900/90 dark:text-emerald-100/90'
  );

  const headerAmountClass = computed(() =>
    deadlinePast.value
      ? 'text-2xl font-bold tabular-nums tracking-tight text-red-950 dark:text-white'
      : 'text-2xl font-bold tabular-nums tracking-tight text-emerald-950 dark:text-emerald-50'
  );

  // no local state: uses props.purchases
</script>

<template>
  <section
    class="item-group flex w-full max-w-[min(700px,calc(100%-1.5rem))] flex-col md:max-w-5xl xl:max-w-[min(92rem,calc(100%-1.5rem))]"
    :class="groupCardFrameClass"
    :aria-label="`Grupa zakupów, termin ${props.deadlineDate}`"
  >
    <div
      class="purchase-header flex shrink-0 w-full items-center justify-between gap-2 px-5 py-4 sm:gap-4"
      :class="groupHeaderToneClass"
    >
      <img :src="cardLogo" alt="Card logo" class="image-card ml-0 shrink-0 p-1 sm:ml-1" />
      <span class="min-w-0 truncate text-center sm:text-left" :class="headerDateClass" title="Termin spłaty">
        {{ props.deadlineDate }}
      </span>

      <div class="purchase-header-item mr-0 shrink-0 sm:mr-1">
        <div class="flex flex-col items-end text-right">
          <span class="item-title whitespace-nowrap" :class="headerCaptionClass">Do spłaty:</span>
          <span class="whitespace-nowrap" :class="headerAmountClass">{{ calculateToPay }}</span>
        </div>
      </div>
    </div>
    <div class="group-card-body flex flex-col gap-2 bg-transparent p-5">
      <div class="purchase-items-grid">
        <div v-for="purchase in props.purchases" :key="purchase.id" class="purchase-item-cell min-w-0">
          <PurchaseCurrentItem
            :purchase="purchase"
            :is-selected="props.selectedPurchaseIds.includes(purchase.id)"
            :on-toggle-selection="props.onToggleSelection"
            :on-remove-from-selection="props.onRemoveFromSelection"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  .item-group {
    margin: 50px auto;
  }

  /**
   * `auto-fit` + wyższe minimum na xl+ — trzecia kolumna tylko gdy zmieszczą się ~równie szerokie tory
   * (unika „3 wąskich” przy tej samej szerokości co wygodne „2 szerokie”).
   */
  .purchase-items-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .purchase-items-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
    }
  }

  @media (min-width: 1280px) {
    .purchase-items-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 26.5rem), 1fr));
    }
  }

  /* W siatce odstęp daje `gap` — bez tego `mb-3` na karcie dubluje pionowy odstęp. */
  .purchase-item-cell :deep(div.mb-3.flex.flex-row) {
    margin-bottom: 0;
  }
  .image-card {
    max-height: 70px;
  }

  .purchase-header-item {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    flex-direction: column;
  }
  .item-title {
    font-size: 0.8rem;
    line-height: 1.2;
  }
</style>
