<script setup lang="ts">
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import router from '@/router';
  import { useAuthorizationStore } from '@/stores/authorization';

  const authorizationStore = useAuthorizationStore();

  function enterFinance() {
    if (!authorizationStore.hasAccessFinance) return;
    router.push({ name: 'FinanceHome' });
  }

  function pushListOrRefresh(routeName: 'Loans' | 'Fees' | 'Purchases') {
    if (window.location.href.includes(router.resolve({ name: routeName }).href)) {
      const redirect = JSON.stringify({ name: routeName });
      router.push({ path: '/refresh', query: { redirect } });
    } else {
      router.push({ name: routeName });
    }
  }

  function goPayments() {
    if (!authorizationStore.hasAccessFinancePayment) return;
    router.push({ name: 'Payments' });
  }

  function goNewLoan() {
    if (!authorizationStore.hasAccessFinanceLoan) return;
    router.push({
      name: 'Loan',
      params: { isEdit: 'false', loanId: 0 },
    });
  }

  function goNewFee() {
    if (!authorizationStore.hasAccessFinanceFee) return;
    router.push({
      name: 'Fee',
      params: { isEdit: 'false', feeId: 0 },
    });
  }

  function goNewPurchase() {
    if (!authorizationStore.hasAccessFinancePurchase) return;
    router.push({
      name: 'Purchase',
      params: { isEdit: 'false', purchaseId: 0 },
    });
  }

  function onAddLoanClick() {
    if (!authorizationStore.hasAccessFinanceLoan) return;
    goNewLoan();
  }

  function onAddFeeClick() {
    if (!authorizationStore.hasAccessFinanceFee) return;
    goNewFee();
  }

  function onAddPurchaseClick() {
    if (!authorizationStore.hasAccessFinancePurchase) return;
    goNewPurchase();
  }
</script>

<template>
  <div
    class="w-full max-w-[400px] mx-auto overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 text-surface-900 shadow-lg dark:border-primary/50 dark:bg-surface-950 dark:text-surface-0 dark:shadow-xl"
  >
    <div class="flex min-w-0 flex-col md:flex-row">
      <!-- Lewy panel -->
      <button
        type="button"
        class="flex flex-col items-center gap-4 pt-7 text-left transition hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-45 dark:hover:bg-white/5 md:min-w-0 md:flex-1 md:items-start md:gap-5 md:border-surface-200 md:pl-7 md:py-7 dark:md:border-primary/30"
        :disabled="!authorizationStore.hasAccessFinance"
        @click="enterFinance"
      >
        <div
          class="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-b from-surface-100/90 to-surface-0 shadow-inner backdrop-blur-md dark:border-primary/40 dark:from-white/15 dark:to-white/5 md:h-28 md:w-28"
        >
          <i class="pi pi-wallet text-4xl text-primary md:text-5xl" aria-hidden="true" />
        </div>
        <div class="w-full max-w-xs text-center md:text-left">
          <h2 class="text-xl font-bold uppercase tracking-[0.2em] text-surface-900 md:text-2xl dark:text-surface-0">
            Finanse
          </h2>
          <p class="mt-2 text-xs leading-relaxed text-surface-600 md:text-sm dark:text-surface-400">
            Monitorowanie finansów, płatności i zakupów — szybki dostęp do list i formularzy.
          </p>
        </div>
      </button>

      <!-- Prawa kolumna -->
      <div
        class="flex w-full shrink-0 flex-col gap-3 border-t border-surface-200 p-3 dark:border-primary/20 md:w-[170px] md:min-w-0 md:grow-0 md:border-t-0 md:border-surface-200 md:p-3 dark:md:border-primary/30"
      >
        <!-- Lista kredytów -->
        <div
          class="relative overflow-visible rounded-lg border border-surface-200 bg-surface-100/90 transition hover:shadow-[0_0_10px_rgba(249,115,22,0.18)] dark:border-primary/50 dark:bg-surface-900/80 dark:hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          :class="{ 'pointer-events-none opacity-45': !authorizationStore.hasAccessFinanceLoan }"
        >
          <button
            type="button"
            class="w-full cursor-pointer rounded-lg p-3 pr-12 text-left text-surface-900 transition hover:bg-surface-200/60 dark:text-inherit dark:hover:bg-white/5 md:p-2 md:pr-10"
            :disabled="!authorizationStore.hasAccessFinanceLoan"
            @click="pushListOrRefresh('Loans')"
          >
            <i class="pi pi-credit-card mb-1 block text-lg text-primary md:text-xl" aria-hidden="true" />
            <span class="block break-words text-sm font-semibold md:leading-tight">
              Lista kredytów
            </span>
            <span class="mt-1 block break-words text-xs leading-snug text-surface-600 dark:text-surface-400">
              Ostatnia aktualizacja: 2 min temu
            </span>
          </button>
          <div
            class="finance-plus-wrap absolute right-1 top-1.5 z-20 shrink-0 md:right-0.5 md:top-1"
            title="Nowy kredyt"
            @click.stop="onAddLoanClick"
          >
            <OfficeIconButton icon="pi pi-plus" :btn-disabled="!authorizationStore.hasAccessFinanceLoan" class="text-green-600 dark:text-green-400"/>
          </div>
        </div>

        <!-- Lista opłat -->
        <div
          class="relative overflow-visible rounded-lg border border-surface-200 bg-surface-100/90 transition hover:shadow-[0_0_10px_rgba(249,115,22,0.18)] dark:border-primary/50 dark:bg-surface-900/80 dark:hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          :class="{ 'pointer-events-none opacity-45': !authorizationStore.hasAccessFinanceFee }"
        >
          <button
            type="button"
            class="w-full cursor-pointer rounded-lg p-3 pr-12 text-left text-surface-900 transition hover:bg-surface-200/60 dark:text-inherit dark:hover:bg-white/5 md:p-2 md:pr-10"
            :disabled="!authorizationStore.hasAccessFinanceFee"
            @click="pushListOrRefresh('Fees')"
          >
            <i class="pi pi-money-bill mb-1 block text-lg text-primary md:text-xl" aria-hidden="true" />
            <span class="block break-words text-sm font-semibold md:leading-tight">Lista opłat</span>
            <span class="mt-1 block break-words text-xs leading-snug text-surface-600 dark:text-surface-400">
              Ostatnia aktualizacja: 1 godz. temu
            </span>
          </button>
          <div
            class="finance-plus-wrap absolute right-1 top-1.5 z-20 shrink-0 md:right-0.5 md:top-1"
            title="Nowa opłata"
            @click.stop="onAddFeeClick"
          >
            <OfficeIconButton icon="pi pi-plus" :btn-disabled="!authorizationStore.hasAccessFinanceFee" class="text-green-600 dark:text-green-400"/>
          </div>
        </div>

        <!-- Lista zakupów -->
        <div
          class="relative overflow-visible rounded-lg border border-surface-200 bg-surface-100/90 transition hover:shadow-[0_0_10px_rgba(249,115,22,0.18)] dark:border-primary/50 dark:bg-surface-900/80 dark:hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          :class="{ 'pointer-events-none opacity-45': !authorizationStore.hasAccessFinancePurchase }"
        >
          <button
            type="button"
            class="w-full cursor-pointer rounded-lg p-3 pr-12 text-left text-surface-900 transition hover:bg-surface-200/60 dark:text-inherit dark:hover:bg-white/5 md:p-2 md:pr-10"
            :disabled="!authorizationStore.hasAccessFinancePurchase"
            @click="pushListOrRefresh('Purchases')"
          >
            <i class="pi pi-shopping-cart mb-1 block text-lg text-primary md:text-xl" aria-hidden="true" />
            <span class="block break-words text-sm font-semibold md:leading-tight">
              Lista zakupów
            </span>
            <span class="mt-1 block break-words text-xs leading-snug text-surface-600 dark:text-surface-400">
              Ostatnia aktualizacja: dziś
            </span>
          </button>
          <div
            class="finance-plus-wrap absolute right-1 top-1.5 z-20 shrink-0 md:right-0.5 md:top-1"
            title="Nowy zakup"
            @click.stop="onAddPurchaseClick"
          >
            <OfficeIconButton icon="pi pi-plus" :btn-disabled="!authorizationStore.hasAccessFinancePurchase" class="text-green-600 dark:text-green-400"/>
          </div>
        </div>

        <!-- Płatności (bez +) -->
        <div
          class="relative overflow-visible rounded-lg border border-surface-200 bg-surface-100/90 transition hover:shadow-[0_0_10px_rgba(249,115,22,0.18)] dark:border-primary/50 dark:bg-surface-900/80 dark:hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          :class="{ 'pointer-events-none opacity-45': !authorizationStore.hasAccessFinancePayment }"
        >
          <button
            type="button"
            class="w-full cursor-pointer rounded-lg p-3 text-left text-surface-900 transition hover:bg-surface-200/60 dark:text-inherit dark:hover:bg-white/5 md:p-2"
            :disabled="!authorizationStore.hasAccessFinancePayment"
            @click="goPayments"
          >
            <i class="pi pi-list mb-1 block text-lg text-primary md:text-xl" aria-hidden="true" />
            <span class="block break-words text-sm font-semibold md:leading-tight">
              Płatności bieżące
            </span>
            <span class="mt-1 block break-words text-xs leading-snug text-surface-600 dark:text-surface-400">
              Ostatnia aktualizacja: dziś
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
