<script setup lang="ts">
import UserPayments from "@/components/UserPayments.vue";
import TheMenuFinance from "@/components/TheMenuFinance.vue";
import OfficeButton from "@/components/OfficeButton.vue";
import { onMounted, ref, watch } from "vue";

import { usePaymentStore } from "@/stores/payments";
const paymentStore = usePaymentStore();
import { useUsersStore } from "@/stores/users";
const userStore = useUsersStore();

const selectedYear = ref<number>(new Date().getFullYear());
const refreshKey = ref<boolean>(true);
async function getPayments() {
  refreshKey.value = false;
  paymentStore.paymentSelectedYear = selectedYear.value;
  await paymentStore.getPaymentsFromDb("ALL");
  refreshKey.value = true;
}

onMounted(async () => {
  if (userStore.users.length === 0) await userStore.getUsersFromDb();
});

onMounted(() => {
  if (paymentStore.payments.size !== 0) refreshKey.value = true;
});

watch(selectedYear, (newYear: number) => {
  refreshKey.value = paymentStore.paymentSelectedYear === newYear;
});
</script>

<template>
  <TheMenuFinance />

  <Toolbar class="m-6">
    <template #start
      ><p class="color-orange mt-auto mb-auto">
        ROK: {{ paymentStore.paymentSelectedYear }}
      </p></template
    >

    <template #center>
      <InputNumber
        v-model="selectedYear"
        :min="2010"
        :max="2030"
        show-buttons
        :format="false"
        buttonLayout="horizontal"
      />
    </template>

    <template #end>
      <OfficeButton
        text="wyszukaj"
        btn-type="office"
        :btn-disabled="paymentStore.loadingPayments"
        :loading="paymentStore.loadingPayments"
        @click="getPayments"
      />
    </template>
  </Toolbar>
  <div class="ml-2 mr-2" v-if="refreshKey">
    <div v-for="[userId] in paymentStore.payments" :key="userId">
      <UserPayments
        :id-user="+userId"
        :year="+paymentStore.paymentSelectedYear"
      />
    </div>
  </div>
</template>

<style scoped></style>
