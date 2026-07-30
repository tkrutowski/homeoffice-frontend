<script setup lang="ts">
  import UserPayments from '@/features/finance/payments/UserPayments.vue';
  import TheMenuFinance from '@/features/finance/_shared/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import { computed, onMounted, ref, watch } from 'vue';

  import { useUsersStore } from '@/stores/users';
  import { useFirmsStore } from '@/stores/firms';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { PaymentStatus } from '@/features/finance/payments/types';
  import { usePaymentsByStatusYearQuery } from '@/features/finance/payments/queries/usePaymentsQueries';

  const userStore = useUsersStore();
  const firmsStore = useFirmsStore();

  const selectedYear = ref<number>(new Date().getFullYear());
  let yearChangeTimeout: ReturnType<typeof setTimeout> | null = null;

  const paymentStatus = ref<PaymentStatus>(PaymentStatus.ALL);
  const debouncedYear = ref<number>(selectedYear.value);

  const paymentsQuery = usePaymentsByStatusYearQuery(
    computed(() => ({
      status: paymentStatus.value,
      year: debouncedYear.value,
    }))
  );

  const paymentsEntries = computed(() => {
    const entries = paymentsQuery.data.value?.entries();
    return entries ? Array.from(entries) : [];
  });

  const paymentsLoading = computed(() => paymentsQuery.isFetching.value);

  onMounted(async () => {
    console.log('onMounted PaymentView');
    if (userStore.users.length === 0) await userStore.refreshUsers();
    await firmsStore.getFirmsFromDb();
  });

  watch(selectedYear, newYear => {
    if (debouncedYear.value === newYear) return;
    if (yearChangeTimeout) clearTimeout(yearChangeTimeout);
    // Ładujemy tylko rok docelowy po krótkiej pauzie.
    yearChangeTimeout = setTimeout(() => {
      debouncedYear.value = newYear;
    }, 400);
  });

  //
  //--------------------------------DISPLAY FILTER
  //
  const setFilter = async (selectedFilter: PaymentStatus) => {
    paymentStatus.value = selectedFilter;
    localStorage.setItem('selectedFilterPayments', selectedFilter);
  };

  const savedFilter = localStorage.getItem('selectedFilterPayments');
  if (savedFilter) {
    paymentStatus.value = savedFilter as PaymentStatus;
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
          :icon="paymentsLoading ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
          class="mr-2 text-red-500"
          :active="paymentStatus === PaymentStatus.TO_PAY"
          @click="setFilter(PaymentStatus.TO_PAY)"
        />
        <OfficeIconButton
          title="Wyświetl spłacone"
          :icon="paymentsLoading ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
          class="mr-2 text-green-500"
          :active="paymentStatus === PaymentStatus.PAID"
          @click="setFilter(PaymentStatus.PAID)"
        />
        <OfficeIconButton
          title="Wyświetl wszystkie"
          :icon="paymentsLoading ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
          class="mr-2 text-orange-500"
          :active="paymentStatus === PaymentStatus.ALL"
          @click="setFilter(PaymentStatus.ALL)"
        />
        <div class="h-9 w-px shrink-0 bg-surface-300 dark:bg-surface-600" role="presentation" aria-hidden="true" />
        <OfficeIconButton
          title="Odśwież listę płatności"
          class="mr-2 text-orange-500"
          :icon="paymentsLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
          @click="void paymentsQuery.refetch()"
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
    <div class="ml-6 mr-6">
      <div v-for="[userId, paymentsForUser] in paymentsEntries" :key="userId">
        <UserPayments
          :id-user="+userId"
          :year="debouncedYear"
          :payments="paymentsForUser"
          :loading="paymentsLoading"
        />
      </div>
    </div>
  </MainPageShell>
</template>

<style scoped></style>
