<script setup lang="ts">
  import TheMenuFinance from '@/features/finance/_shared/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import FinanceSummaryCard from '@/features/finance/home/FinanceSummaryCard.vue';
  import GenericChartPanel from '@/components/GenericChartPanel.vue';
  import ChartSkeletonGrid from '@/components/ChartSkeletonGrid.vue';
  import { ref, onMounted, computed, watch } from 'vue';
  import { useUsersStore } from '@/stores/users';
  import { useAuthorizationStore } from '@/stores/authorization';
  import { useCardsListQuery } from '@/features/finance/cards/queries/useCardsQueries';
  import { findCardById } from '@/features/finance/cards/api/cardsApi';
  import { useLoansByYearStatusUserQuery } from '@/features/finance/loans/queries/useLoansQueries';
  import { useFeesByYearStatusUserQuery } from '@/features/finance/fees/queries/useFeesQueries';
  import { useFinanceCharts } from '@/features/finance/home/useFinanceCharts';

  const usersStore = useUsersStore();
  const authorizationStore = useAuthorizationStore();

  const currentYear = new Date().getFullYear();
  const selectedYear = ref(currentYear);
  const showOnlyLoggedUser = ref<boolean>(true);

  // ===== Queries =====
  const cardsQuery = useCardsListQuery('ALL');
  const cards = computed(() => cardsQuery.data.value ?? []);
  const cardsActive = computed(() => cards.value.filter(card => card.activeStatus === 'ACTIVE'));

  const hasAccessToAllPayments = computed(() => {
    return authorizationStore.hasAccessFinancePaymentReadAll;
  });

  const usersToDisplay = computed(() => {
    if (showOnlyLoggedUser.value) {
      const user = usersStore.users.find(user => user.username === authorizationStore.username);
      return user ? [user] : [];
    }
    if (hasAccessToAllPayments.value) {
      return usersStore.users;
    }
    const user = usersStore.users.find(user => user.username === authorizationStore.username);
    return user ? [user] : [];
  });

  const homeUserId = computed(() => {
    if (!showOnlyLoggedUser.value) return undefined;
    return usersToDisplay.value[0]?.id;
  });

  const loansQuery = useLoansByYearStatusUserQuery(selectedYear, 'TO_PAY', homeUserId);
  const feesQuery = useFeesByYearStatusUserQuery(selectedYear, 'TO_PAY', homeUserId);

  const loans = computed(() => loansQuery.data.value ?? []);
  const fees = computed(() => feesQuery.data.value ?? []);

  // ===== Months Array =====
  const months = [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień',
  ];

  // ===== useFinanceCharts Composable =====
  const {
    isLoadingPurchases,
    usersLoansChartData,
    usersFeesChartData,
    usersLoansSummaryChartData,
    usersPurchasesSummaryChartData,
    usersPurchaseChartData,
    loansToPay,
    feesToPay,
    purchasesToPay,
    totalToPay,
    loadDataForYear: loadChartDataForYear,
  } = useFinanceCharts({
    loans,
    fees,
    cardsActive,
    selectedYear,
    usersToDisplay,
    getCard: (cardId: number) => findCardById(cards.value, cardId) ?? undefined,
    months,
  });

  // ===== Computed - Loading States =====
  const isLoadingLoans = computed(() => loansQuery.isFetching.value);
  const isLoadingFees = computed(() => feesQuery.isFetching.value);
  const isLoadingData = computed(
    () => isLoadingLoans.value || isLoadingFees.value || isLoadingPurchases.value || cardsQuery.isFetching.value
  );

  // ===== Computed - Years Array =====
  const availableYears = computed(() => {
    const years = [];
    for (let year = 2020; year <= currentYear + 5; year++) {
      years.push(year);
    }
    return years;
  });

  // ===== Methods =====
  const onYearChange = async () => {
    await loadDataForYear();
  };

  const loadDataForYear = async () => {
    try {
      await Promise.all([usersStore.getUsersFromDb(), cardsQuery.refetch(), loansQuery.refetch(), feesQuery.refetch()]);
      await loadChartDataForYear(() => Promise.resolve());
    } catch (error) {
      console.error('Error loading finance home data:', error);
    }
  };

  // ===== Lifecycle =====
  onMounted(async () => {
    await loadDataForYear();
  });

  watch(showOnlyLoggedUser, async () => {
    await loadDataForYear();
  });
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenuFinance />
    </template>

    <div class="min-h-0 p-4 md:p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-0">Finanse Domowe</h1>
        <p class="mt-1 text-sm text-surface-600 dark:text-surface-400">
          Przegląd kredytów, opłat i zakupów w jednym miejscu.
        </p>
      </div>

      <!-- Controls -->
      <div
        class="mb-6 flex justify-between items-center p-4 rounded-lg border border-surface-200 bg-surface-0 dark:border-surface-700 dark:bg-surface-950"
      >
        <div></div>
        <div class="flex items-center gap-4">
          <Select
            v-model="selectedYear"
            :options="availableYears"
            @change="onYearChange"
            class="w-32"
            placeholder="Wybierz rok"
          />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="showOnlyLoggedUser" :binary="true" />
          <label class="ml-2 text-sm font-medium text-surface-600 dark:text-surface-400">Wyświetl tylko moje</label>
        </div>
      </div>

      <!-- Summary Cards -->
      <div v-if="!isLoadingData" class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinanceSummaryCard
          icon="💳"
          label="Kredyty do spłaty"
          :value="loansToPay"
          hint="Suma wszystkich rat do spłaty"
          color-class="red"
        />
        <FinanceSummaryCard
          icon="📋"
          label="Opłaty do spłaty"
          :value="feesToPay"
          hint="Ubezpieczenie, podatki, opłaty"
          color-class="purple"
        />
        <FinanceSummaryCard
          icon="🛍️"
          label="Zakupy do spłaty"
          :value="purchasesToPay"
          hint="Suma niezapłaconych transakcji"
          color-class="amber"
        />
        <FinanceSummaryCard
          icon="💰"
          label="Razem do spłaty"
          :value="totalToPay"
          hint="Suma wszystkich zobowiązań"
          color-class="blue"
        />
      </div>

      <!-- Summary Cards Skeleton -->
      <div v-else class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="n in 4"
          :key="n"
          class="rounded-2xl border border-surface-200 bg-surface-0 p-6 dark:border-surface-700 dark:bg-surface-950"
        >
          <Skeleton width="70%" height="1rem" class="mb-3"></Skeleton>
          <Skeleton width="80%" height="2rem" class="mb-3"></Skeleton>
          <Skeleton width="100%" height="0.75rem"></Skeleton>
        </div>
      </div>

      <!-- Loading State for Initial Load -->
      <div v-if="isLoadingData" class="flex flex-col gap-8">
        <!-- Summary Charts Skeleton -->
        <ChartSkeletonGrid :columns="2" :rows="1" height="h-72" />

        <!-- User Charts Skeleton -->
        <div
          v-for="n in 2"
          :key="n"
          class="flex flex-col gap-6 pt-8 border-t border-surface-200 dark:border-surface-700"
        >
          <Skeleton width="40%" height="1.5rem" class="mx-auto"></Skeleton>
          <ChartSkeletonGrid :columns="2" :rows="1" height="h-72" />
          <ChartSkeletonGrid :columns="2" :rows="1" height="h-80" :full-width="true" />
        </div>
      </div>

      <!-- Actual Content -->
      <div v-else class="flex flex-col gap-8">
        <!-- Per-User Sections -->
        <div
          v-for="user in usersToDisplay"
          :key="user.id"
          class="flex flex-col gap-6 pt-8 border-t border-surface-200 dark:border-surface-700"
        >
          <h2 class="text-2xl font-bold text-center text-surface-900 dark:text-surface-0">
            {{ user.firstName }} {{ user.lastName }}
          </h2>

          <!-- Rząd 1: Kredyty i Zakupy do spłaty (Summary) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GenericChartPanel
              :chart-data="usersLoansSummaryChartData.get(user.id) || { labels: [], datasets: [], categoryTotals: [] }"
              title="Kredyty do spłaty"
              icon="pi pi-credit-card"
              chart-type="bar"
              :loading="isLoadingLoans"
            />
            <GenericChartPanel
              :chart-data="
                usersPurchasesSummaryChartData.get(user.id) || { labels: [], datasets: [], categoryTotals: [] }
              "
              title="Zakupy do spłaty"
              icon="pi pi-shopping-cart"
              chart-type="bar"
              :loading="isLoadingPurchases"
            />
          </div>

          <!-- Rząd 2: Kredyty i Opłaty (Monthly) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GenericChartPanel
              :chart-data="usersLoansChartData.get(user.id) || { labels: [], datasets: [], categoryTotals: [] }"
              :title="`Płatności kredytów w ${selectedYear}`"
              icon="pi pi-chart-bar"
              chart-type="bar"
              :loading="isLoadingLoans"
              :show-totals="true"
            />
            <GenericChartPanel
              :chart-data="usersFeesChartData.get(user.id) || { labels: [], datasets: [], categoryTotals: [] }"
              :title="`Płatności opłat w ${selectedYear}`"
              icon="pi pi-chart-bar"
              chart-type="bar"
              :loading="isLoadingFees"
              :show-totals="true"
            />
          </div>

          <!-- Rząd 3: Niespłacone zakupy (Full-width) -->
          <GenericChartPanel
            :chart-data="usersPurchaseChartData.get(user.id) || { labels: [], datasets: [], categoryTotals: [] }"
            :title="`Niespłacone zakupy w ${selectedYear}`"
            icon="pi pi-chart-line"
            chart-type="line"
            :loading="isLoadingPurchases"
            :show-totals="true"
            panel-class="h-full min-h-[24rem]"
          />
        </div>
      </div>
    </div>
  </MainPageShell>
</template>
