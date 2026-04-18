<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed, ref } from 'vue';
  import type { Purchase } from '@/types/Purchase.ts';
  import { UtilsService } from '@/service/UtilsService.ts';
  import { useFirmsStore } from '@/stores/firms.ts';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import { PaymentStatus } from '@/types/Payment.ts';
  import { useToast } from 'primevue/usetoast';
  import { usePurchasesStore } from '@/stores/purchases.ts';

  const firmStore = useFirmsStore();
  const purchaseStore = usePurchasesStore();
  const toast = useToast();

  const props = defineProps({
    purchase: {
      type: Object as PropType<Purchase>,
      required: true,
    },
  });

  const rowPurchase = computed(
    () => purchaseStore.getPurchaseById(props.purchase.id) ?? props.purchase
  );

  const firmName = computed(() => {
    const result = firmStore.getFirm(props.purchase?.idFirm);
    return result !== null ? result.name : 'Brak firmy';
  });

  const firmInitial = computed(() => {
    const c = firmName.value.trim().charAt(0);
    return c ? c.toUpperCase() : '?';
  });

  const isPaid = computed(() => rowPurchase.value.paymentStatus === PaymentStatus.PAID);
  const canSelectForBulk = computed(
    () =>
      rowPurchase.value.paymentStatus === PaymentStatus.TO_PAY ||
      rowPurchase.value.paymentStatus === PaymentStatus.OVER_DUE
  );

  const overdueDays = computed(() =>
    isPaid.value ? null : UtilsService.daysPastDeadline(rowPurchase.value.paymentDeadline)
  );

  const isOverdueLook = computed(
    () =>
      !isPaid.value &&
      (overdueDays.value !== null || rowPurchase.value.paymentStatus === PaymentStatus.OVER_DUE)
  );

  const cardVariantClasses = computed(() => {
    if (isPaid.value) {
      return [
        'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-950',
        'dark:border-emerald-900/70 dark:from-emerald-950/90 dark:via-neutral-950 dark:to-emerald-950/50 dark:text-white',
      ].join(' ');
    }
    if (isOverdueLook.value) {
      return [
        'border-red-400 bg-gradient-to-br from-red-50 via-rose-100/70 to-rose-100 text-red-950',
        // Jasny: jak zielony (spód + halo), ale druga i trzecia warstwa mocniej „czerwone” — rose na jasnym tle ginie wobec emerald.
        'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.07),0_0_22px_rgba(251,113,133,0.62),0_0_40px_rgba(239,68,68,0.42)]',
        'dark:border-rose-500/85 dark:from-neutral-950 dark:via-red-950/95 dark:to-red-900/50 dark:text-white',
        'dark:shadow-[0_0_22px_rgba(248,113,113,0.5),0_0_36px_rgba(220,38,38,0.22)]',
      ].join(' ');
    }
    return [
      'border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 text-emerald-950',
      'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.07),0_0_24px_rgba(52,211,153,0.55)]',
      'dark:border-emerald-500/85 dark:from-emerald-950 dark:via-neutral-950 dark:to-emerald-950/90 dark:text-white',
      'dark:shadow-[0_0_22px_rgba(52,211,153,0.5),0_0_36px_rgba(16,185,129,0.22)]',
    ].join(' ');
  });

  /** Karta „do zapłaty”, jeszcze nie po terminie — zielona tonacja zamiast chłodnego slate. */
  const isDueSoonLook = computed(() => !isPaid.value && !isOverdueLook.value);

  const isSelected = computed(() =>
    purchaseStore.purchasesToPay.some((p: Purchase) => p.id === props.purchase.id)
  );

  /** Zaznaczenie: gasi zewnętrzną poświatę karty (!shadow), tylko cień wewnętrzny + grubsza bursztynowa obwódka — bez ring (ring mieszał się z kolorową ramką). */
  const pressedClasses =
    'translate-y-px scale-[0.995] border-2 border-amber-500 brightness-[0.97] dark:border-amber-400 dark:brightness-[0.9] ' +
    '!shadow-[inset_0_2px_12px_rgba(0,0,0,0.18),inset_0_3px_8px_rgba(0,0,0,0.1),inset_0_-1px_0_rgba(255,255,255,0.22)] ' +
    'dark:!shadow-[inset_0_3px_18px_rgba(0,0,0,0.55),inset_0_2px_6px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]';

  const cardDropShadow = computed(() => {
    if (isSelected.value && canSelectForBulk.value) return '';
    // Po terminie: pełny cień (jasny + ciemny) jest w cardVariantClasses — nic tu nie doklejaj.
    if (isOverdueLook.value) return '';
    if (isPaid.value) return 'shadow-sm dark:shadow-md';
    return '';
  });

  const firmTitleClass =
    'text-surface-950 dark:text-white';

  const subtitleClass = computed(() => {
    if (isDueSoonLook.value) {
      return 'text-emerald-800/90 dark:text-emerald-100/90';
    }
    return 'text-surface-600 dark:text-neutral-300';
  });

  const otherInfoClass = computed(() => {
    if (isDueSoonLook.value) {
      return 'text-emerald-700/80 dark:text-emerald-200/65';
    }
    return 'text-surface-500 dark:text-neutral-400';
  });

  const purchaseDateLineClass = computed(() => {
    if (isDueSoonLook.value) {
      return 'text-emerald-900 dark:text-emerald-50/95';
    }
    if (isPaid.value) {
      return 'text-emerald-900 dark:text-neutral-100';
    }
    if (isOverdueLook.value) {
      return 'text-red-900 dark:text-neutral-100';
    }
    return 'text-surface-800 dark:text-neutral-100';
  });

  const overdueLineClass = 'font-medium text-red-600 dark:text-red-400';

  const remainingLineClass = 'font-medium text-emerald-700 dark:text-emerald-400';

  const amountTextClass = computed(() => {
    if (isDueSoonLook.value) {
      return 'text-emerald-950 dark:text-emerald-50';
    }
    if (isOverdueLook.value) {
      return 'text-red-950 dark:text-white';
    }
    if (isPaid.value) {
      return 'text-emerald-950 dark:text-white';
    }
    return 'text-surface-950 dark:text-white';
  });

  function onCardClick() {
    if (!canSelectForBulk.value) return;
    const p = rowPurchase.value;
    if (isSelected.value) purchaseStore.delPurchaseToPay(p);
    else purchaseStore.addPurchaseToPay(p);
  }

  const showStatusChangeConfirmationDialog = ref<boolean>(false);
  const changeStatusConfirmationMessage = computed(() => {
    if (rowPurchase.value) {
      return `Czy chcesz oznaczyć zakup: <b>${rowPurchase.value.name}</b> jako <b>Spłacony</b>?`;
    }
    return 'No message';
  });

  const submitChangeStatus = async () => {
    const newStatus: PaymentStatus = PaymentStatus.PAID;
    purchaseStore
      .payForPurchaseDb(props.purchase.id, newStatus)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Oznaczono jako spłacony zakup: ' + props.purchase.name,
          life: 3000,
        });
      })
      .catch(() => {
        toast.add({
          severity: 'error',
          summary: 'Niepowodzenie',
          detail: 'NIE oznaczono jako spłacony zakup: ' + props.purchase.name,
          life: 3000,
        });
      });
    showStatusChangeConfirmationDialog.value = false;
  };

  const purchaseDateLabel = computed(() => {
    const s = UtilsService.formatDateToString(rowPurchase.value.purchaseDate ?? undefined);
    return s || '—';
  });

  const overdueLine = computed(() => {
    if (isPaid.value) return null;
    const n = overdueDays.value;
    if (n !== null) return n === 1 ? 'Po terminie: 1 dzień' : `Po terminie: ${n} dni`;
    if (rowPurchase.value.paymentStatus === PaymentStatus.OVER_DUE) return 'Po terminie spłaty';
    return null;
  });

  const remainingLine = computed(() => {
    if (isPaid.value || overdueLine.value) return null;
    const rem = UtilsService.daysUntilDeadline(rowPurchase.value.paymentDeadline);
    if (rem === null) return null;
    if (rem === 0) return 'Termin spłaty: dziś';
    if (rem === 1) return 'Pozostał 1 dzień do spłaty';
    return `Pozostało ${rem} dni do spłaty`;
  });

  /** Po terminie: spójny z czerwoną kartą (rose/red), jak zielony z zieloną. Przed terminem: bez zmian. */
  const payCtaButtonClass = computed(() => {
    if (isOverdueLook.value) {
      return [
        'rounded-lg border border-rose-300 bg-rose-100/90 px-4 py-2 text-sm font-semibold text-rose-900 shadow-sm',
        'transition-colors hover:border-rose-500 hover:bg-rose-200/90',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600/50',
        'active:translate-y-px active:brightness-[0.98]',
        'dark:border-rose-400/35 dark:bg-rose-950/40 dark:text-rose-50 dark:backdrop-blur-[2px]',
        'dark:hover:border-rose-300/50 dark:hover:bg-rose-950/55 dark:focus-visible:outline-rose-400/50',
        'dark:active:brightness-95',
      ].join(' ');
    }
    return [
      'rounded-lg border border-emerald-300 bg-emerald-100/90 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm',
      'transition-colors hover:border-emerald-500 hover:bg-emerald-200/90',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/50',
      'active:translate-y-px dark:border-emerald-400/35 dark:bg-emerald-950/40 dark:text-emerald-50 dark:backdrop-blur-[2px]',
      'dark:hover:border-emerald-300/50 dark:hover:bg-emerald-950/55 dark:focus-visible:outline-emerald-400/50',
      'dark:active:brightness-95',
    ].join(' ');
  });
</script>

<template>
  <ConfirmationDialog
    v-model:visible="showStatusChangeConfirmationDialog"
    :msg="changeStatusConfirmationMessage"
    @save="submitChangeStatus"
    @cancel="showStatusChangeConfirmationDialog = false"
  />
  <div
    class="mb-3 flex flex-row justify-between gap-4 rounded-2xl border p-5 transition-[box-shadow,transform,filter] duration-150"
    :class="[
      cardVariantClasses,
      canSelectForBulk ? 'cursor-pointer select-none' : 'cursor-default',
      isSelected && canSelectForBulk ? pressedClasses : cardDropShadow,
    ]"
    :role="canSelectForBulk ? 'button' : undefined"
    :tabindex="canSelectForBulk ? 0 : -1"
    :aria-pressed="canSelectForBulk ? isSelected : undefined"
    @click="onCardClick"
    @keydown.enter.prevent="onCardClick"
    @keydown.space.prevent="onCardClick"
  >
    <div class="flex min-w-0 flex-1 flex-col justify-between gap-4">
      <div class="flex min-w-0 items-start gap-3">
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-700 text-lg font-bold text-white shadow-inner dark:bg-pink-900"
          aria-hidden="true"
        >
          {{ firmInitial }}
        </div>
        <div class="min-w-0 flex-1 flex-col">
          <span class="block truncate text-lg font-bold leading-tight" :class="firmTitleClass" :title="firmName">
            {{ firmName }}
          </span>
          <span class="mt-0.5 block text-sm" :class="subtitleClass" :title="rowPurchase.name">
            {{ rowPurchase.name }}
          </span>
          <span
            v-if="rowPurchase.otherInfo"
            class="mt-1 block truncate text-xs"
            :class="otherInfoClass"
            title="Dodatkowe informacje"
          >
            {{ rowPurchase.otherInfo }}
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-1 text-sm">
        <span :class="purchaseDateLineClass">Data zakupu: {{ purchaseDateLabel }}</span>
        <span v-if="overdueLine" :class="overdueLineClass">{{ overdueLine }}</span>
        <span v-else-if="remainingLine" :class="remainingLineClass">{{ remainingLine }}</span>
      </div>
    </div>

    <div class="flex shrink-0 flex-col items-end justify-between gap-3 self-stretch">
      <span class="text-right text-2xl font-bold tabular-nums tracking-tight" :class="amountTextClass">
        {{ UtilsService.formatCurrency(rowPurchase.amount) }}
      </span>
      <button
        v-if="!isPaid"
        type="button"
        :class="payCtaButtonClass"
        title="Oznacz zakup jako spłacony"
        @click.stop="showStatusChangeConfirmationDialog = true"
      >
        Spłać teraz
      </button>
    </div>
  </div>
</template>
