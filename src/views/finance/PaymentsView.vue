<script setup lang="ts">
  import UserPayments from '@/components/finance/UserPayments.vue';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { onActivated, onMounted, ref, watch } from 'vue';

  import { usePaymentStore } from '@/stores/payments';
  import { useUsersStore } from '@/stores/users';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import type { StatusType } from '@/types/StatusType.ts';

  const paymentStore = usePaymentStore();
  const userStore = useUsersStore();

  const selectedYear = ref<number>(new Date().getFullYear());
  const refreshKey = ref<boolean>(true);
  let yearChangeTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastRequestId = 0;

  async function getPayments() {
    const requestId = ++lastRequestId;
    refreshKey.value = false;
    paymentStore.paymentSelectedYear = selectedYear.value;
    await paymentStore.getPaymentsFromDb(filter.value);
    // Jeśli pojawiło się nowsze żądanie, ignorujemy starszą odpowiedź.
    if (requestId !== lastRequestId) return;
    refreshKey.value = true;
  }

  onMounted(async () => {
    console.log('onMounted PaymentView');
    if (userStore.users.length === 0) await userStore.refreshUsers();
    await getPayments();
  });

  onActivated(() => {
    // Zabezpieczenie na przyszłość (np. KeepAlive): po powrocie do listy zawsze dociągnij aktualne dane.
    void getPayments();
  });

  watch(selectedYear, newYear => {
    if (paymentStore.paymentSelectedYear === newYear) return;
    if (yearChangeTimeout) clearTimeout(yearChangeTimeout);
    // Ładujemy tylko rok docelowy po krótkiej pauzie.
    yearChangeTimeout = setTimeout(() => {
      void getPayments();
    }, 400);
  });

  //
  //--------------------------------DISPLAY FILTER
  //
  const filter = ref<StatusType>('ALL');
  const setFilter = async (selectedFilter: StatusType) => {
    filter.value = selectedFilter;
    localStorage.setItem('selectedFilterPayments', selectedFilter);
    await getPayments();
  };

  const savedFilter = localStorage.getItem('selectedFilterPayments');
  if (savedFilter) {
    filter.value = savedFilter as StatusType;
  }
</script>

<template>
  <MainPageShell>
    <template #top>
      <TheMenuFinance />
    </template>

    <Toolbar class="m-6">
      <template #start>
        <OfficeIconButton
          title="Wyświetl niespłacone"
          :icon="paymentStore.loadingPayments ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
          class="mr-2 text-red-500"
          :active="filter === 'TO_PAY'"
          @click="setFilter('TO_PAY')"
        />
        <OfficeIconButton
          title="Wyświetl spłacone"
          :icon="paymentStore.loadingPayments ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
          class="mr-2 text-green-500"
          :active="filter === 'PAID'"
          @click="setFilter('PAID')"
        />
        <OfficeIconButton
          title="Wyświetl wszystkie"
          :icon="paymentStore.loadingPayments ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
          class="mr-2 text-orange-500"
          :active="filter === 'ALL'"
          @click="setFilter('ALL')"
        />
        <div class="h-9 w-px shrink-0 bg-surface-300 dark:bg-surface-600" role="presentation" aria-hidden="true" />
        <OfficeIconButton
          title="Odśwież listę płatności"
          class="mr-2 text-orange-500"
          :icon="paymentStore.loadingPayments ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
          @click="getPayments"
        />
      </template>

      <template #center>
        <InputNumber
          v-model="selectedYear"
          :min="2010"
          :max="2030"
          show-buttons
          :format="false"
          button-layout="horizontal"
        />
      </template>
    </Toolbar>
    <div v-if="refreshKey" class="ml-6 mr-6">
      <div v-for="[userId] in paymentStore.payments" :key="userId">
        <UserPayments :id-user="+userId" :year="+paymentStore.paymentSelectedYear" />
      </div>
    </div>
  </MainPageShell>
</template>

<style scoped></style>
