<script setup lang="ts">
import UserPayments from '../../components/finance/UserPayments.vue'
import TheMenuFinance from '../../components/finance/TheMenuFinance.vue'
import {onMounted, ref, watch} from 'vue'

import {usePaymentStore} from '../../stores/payments'
import {useUsersStore} from '../../stores/users'
import {useLoansStore} from '../../stores/loans'
import {useFeeStore} from '../../stores/fee'

const loansStore = useLoansStore()
const feeStore = useFeeStore()
const paymentStore = usePaymentStore()
const userStore = useUsersStore()

const selectedYear = ref<number>(new Date().getFullYear())
const refreshKey = ref<boolean>(true)

async function getPayments() {
  refreshKey.value = false
  paymentStore.paymentSelectedYear = selectedYear.value
  await paymentStore.getPaymentsFromDb('ALL')
  refreshKey.value = true
}

onMounted(async () => {
  console.log('onMounted PaymentView')
  if (userStore.users.length === 0) await userStore.refreshUsers()
  if (loansStore.loans.length === 0) await loansStore.refreshLoans()
  if (feeStore.fees.length === 0) await feeStore.refreshLoans()
  if (paymentStore.payments.size !== 0) refreshKey.value = true
})

watch(selectedYear, (newYear: number) => {
  refreshKey.value = paymentStore.paymentSelectedYear === newYear
})
</script>

<template>
  <TheMenuFinance/>

  <Toolbar class="m-6">
    <template #start
    ><p class="mt-auto mb-auto">ROK: {{ paymentStore.paymentSelectedYear }}</p></template
    >

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
      <UserPayments :id-user="+userId" :year="+paymentStore.paymentSelectedYear"/>
    </div>
  </div>
</template>

<style scoped></style>
