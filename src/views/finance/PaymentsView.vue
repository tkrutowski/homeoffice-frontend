<script setup lang="ts">
  import UserPayments from '@/components/finance/UserPayments.vue';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import { onMounted, ref, watch } from 'vue';

  import { usePaymentStore } from '@/stores/payments';
  import { useUsersStore } from '@/stores/users';
  import { useLoansStore } from '@/stores/loans';
  import { useFeeStore } from '@/stores/fee';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import type { StatusType } from '@/types/StatusType.ts';

  const loansStore = useLoansStore();
  const feeStore = useFeeStore();
  const paymentStore = usePaymentStore();
  const userStore = useUsersStore();

  const selectedYear = ref<number>(new Date().getFullYear());
  const refreshKey = ref<boolean>(true);

  async function getPayments() {
    refreshKey.value = false;
    paymentStore.paymentSelectedYear = selectedYear.value;
    await paymentStore.getPaymentsFromDb(filter.value);
    refreshKey.value = true;
  }

  onMounted(async () => {
    console.log('onMounted PaymentView');
    if (userStore.users.length === 0) await userStore.refreshUsers();
    // if (loansStore.loans.length === 0) await loansStore.refreshLoans();
    // if (feeStore.fees.length === 0) await feeStore.refreshLoans();
    if (paymentStore.payments.size !== 0) refreshKey.value = true;
  });

  watch(selectedYear, (newYear: number) => {
    refreshKey.value = paymentStore.paymentSelectedYear === newYear;
  });

  //
  //--------------------------------DISPLAY FILTER
  //
  const filter = ref<StatusType>('ALL');
  const setFilter = (selectedFilter: StatusType) => {
    filter.value = selectedFilter;
    localStorage.setItem('selectedFilterPayments', selectedFilter);
  };

  const savedFilter = localStorage.getItem('selectedFilterPayments');
  if (savedFilter) {
    filter.value = savedFilter as StatusType;
  }
</script>

<template>
  <TheMenuFinance />

  <Toolbar class="m-6">
    <template #start>
      <p class="mt-auto mb-auto mr-5">ROK: {{ paymentStore.paymentSelectedYear }}</p>
      <OfficeIconButton
        title="Wyświetl niespłacone"
        :icon="paymentStore.loadingPayments ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
        class="mr-2"
        :active="filter === 'TO_PAY'"
        @click="setFilter('TO_PAY')"
      />
      <OfficeIconButton
        title="Wyświetl spłacone"
        :icon="paymentStore.loadingPayments ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
        class="mr-2"
        :active="filter === 'PAID'"
        @click="setFilter('PAID')"
      />
      <OfficeIconButton
        title="Wyświetl wszystkie"
        :icon="paymentStore.loadingPayments ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
        class="mr-2"
        :active="filter === 'ALL'"
        @click="setFilter('ALL')"
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

    <template #end>
      <Button
        outlined
        class="font-bold uppercase tracking-wider"
        label="wyszukaj"
        :disabled="paymentStore.loadingPayments"
        :loading="paymentStore.loadingPayments"
        @click="getPayments"
      />
    </template>
  </Toolbar>
  <div v-if="refreshKey" class="ml-6 mr-6">
    <div v-for="[userId] in paymentStore.payments" :key="userId">
      <UserPayments :id-user="+userId" :year="+paymentStore.paymentSelectedYear" />
    </div>
  </div>
</template>

<style scoped></style>
