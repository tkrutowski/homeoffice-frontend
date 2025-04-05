<script setup lang="ts">
import moment from 'moment'
import {nextTick, onMounted, ref} from 'vue'
import {UtilsService} from '@/service/UtilsService.ts'
import router from '@/router'
import {type Installment, type Payment, PaymentStatus} from '@/types/Payment.ts'

import {usePaymentStore} from '@/stores/payments.ts'
import {useUsersStore} from '@/stores/users.ts'
import {useLoansStore} from '@/stores/loans.ts'
import {useFeeStore} from '@/stores/fee.ts'
import {TranslationService} from "@/service/TranslationService.ts";

const paymentStore = usePaymentStore()
const userStore = useUsersStore()
const loansStore = useLoansStore()
const feeStore = useFeeStore()

const props = defineProps({
  idUser: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
})

const selectedPayment = ref<Payment | null>(null)
const selectedYear = ref<number>(props.year)
const payments = ref<Payment[]>([])

const onRowSelect = (event: any) => {
  const payment = event.data.paymentType === 'LOAN' ? 'PaymentLoan' : 'PaymentFee'
  router.push({
    name: payment,
    params: {id: event.data.id},
  })
}
const getAmount = (installments: Installment[], month: number) => {
  const installment: Installment | undefined = installments.find(
      (pay: Installment) =>
          pay.paymentDeadline?.getFullYear() === selectedYear.value &&
          pay.paymentDeadline.getMonth() + 1 === month,
  )

  return installment === undefined
      ? 'null'
      : +installment.installmentAmountPaid === 0
          ? UtilsService.formatCurrency(installment.installmentAmountToPay)
          : UtilsService.formatCurrency(installment.installmentAmountPaid)
}

const getClassAmount = (installments: Installment[], month: number) => {
  let result = getClassBorderLeftCurrentMonth(month);
  const installment: Installment | undefined = installments.find(
      (pay: Installment) =>
          pay.paymentDeadline?.getFullYear() === selectedYear.value &&
          pay.paymentDeadline?.getMonth() + 1 === month,
  )
  const paymentDeadline = installment?.paymentDeadline
  if (!paymentDeadline) return result + ' no-credit'

  const date = moment(installment?.paymentDate).format('yyyy-MM-DD')
  const isPaid = !date.startsWith('Invalid')
  if (isPaid) {
    const deadline = moment(installment?.paymentDeadline)
    const paymentDate = moment(installment?.paymentDate)

    if (paymentDate.isAfter(deadline)) return result + ' overdue'
    else return result + ' paid'
  } else {
    const deadline = moment(installment?.paymentDeadline)
    const now = moment()
    if (now.isAfter(deadline)) return result + ' overdue'
  }
  return result + ' to-pay'
}

const getClassBorderLeftCurrentMonth = (month: number) => {
  if (month === moment().month() + 1) {
    return "border-l-4 border-l-blue-500"
  }
  return ""
}
const getClassBorderRightLeftCurrentMonth = (month: number) => {
  if (month === moment().month() + 1) {
    return "border-r-4 border-r-blue-500"
  }
  return ""
}

const getDate = (installments: Installment[], month: number) => {
  const installment: Installment | undefined = installments.find(
      (pay: Installment) =>
          pay.paymentDeadline?.getFullYear() === selectedYear.value &&
          pay.paymentDeadline?.getMonth() + 1 === month,
  )
  if (!installment) return 'null'

  const paymentDate = installment?.paymentDate
  if (paymentDate) {
    const date = moment(paymentDate).format('yyyy-MM-DD')
    const isPaid = !date.startsWith('Invalid')
    return isPaid ? date : ''
  }
}

const getClassDate = (installments: Installment[], month: number) => {
  let result = getClassBorderRightLeftCurrentMonth(month);
  const installment = installments.find(
      (pay: Installment) =>
          pay.paymentDeadline?.getFullYear() === selectedYear.value &&
          pay.paymentDeadline?.getMonth() + 1 === month,
  )
  const paymentDeadline = installment?.paymentDeadline
  if (!paymentDeadline) return result + ' no-credit'

  const date = moment(installment?.paymentDate).format('yyyy-MM-DD')
  const isPaid = !date.startsWith('Invalid')
  if (isPaid) {
    const deadline = moment(installment?.paymentDeadline)
    const paymentDate = moment(installment?.paymentDate)

    if (paymentDate.isAfter(deadline)) return result + ' overdue'
    else return result + ' paid'
  }
  return result + ' py-[0.7rem]'
}

const calculateTotal = (month: number) => {
  return payments.value
      ?.map((value) => value.installments)
      .flatMap((value) => value)
      .filter(
          (pay: Installment) =>
              pay.paymentDeadline?.getFullYear() === selectedYear.value &&
              pay.paymentDeadline.getMonth() + 1 === month,
      )
      .map((value) => value.installmentAmountToPay)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}
const calculateTotalPaid = (month: number) => {
  return payments.value
      ?.map((value) => value.installments)
      .flatMap((value) => value)
      .filter(
          (pay: Installment) =>
              pay.paymentDeadline?.getFullYear() === selectedYear.value &&
              pay.paymentDeadline.getMonth() + 1 === month,
      )
      .map((value) => value.installmentAmountPaid)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}
const calculateTotalToPay = (month: number) => {
  return payments.value
      ?.map((value) => value.installments)
      .flatMap((value) => value)
      .filter(
          (pay: Installment) =>
              pay.paymentDeadline?.getFullYear() === selectedYear.value &&
              pay.paymentDeadline.getMonth() + 1 === month,
      )
      .map((value) =>
          value.paymentStatus === PaymentStatus.TO_PAY
              ? value.installmentAmountToPay
              : 0,
      )
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const findBankOrFirmName = (payment: Payment) => {
  let result = ''
  if (payment.paymentType === 'LOAN' && payment.installments.length > 0) {
    const firstInstallment = payment.installments[0]
    if (UtilsService.isLoanInstallment(firstInstallment)) {
      const loan = loansStore.getLoan(firstInstallment.idLoan)
      if (loan && loan.bank) {
        result = loan.bank.name
      }
    }
  }

  if (payment.paymentType === 'FEE' && payment.installments.length > 0) {
    const firstInstallment = payment.installments[0]
    if (UtilsService.isFeeInstallment(firstInstallment)) {
      const fee = feeStore.getFee(firstInstallment.idFee)
      if (fee && fee.firm) {
        result = fee.firm.name
      }
    }
  }

  if (result.length > 20) {
    return result.slice(0, 15) + '...'
  }

  return result
}

const getUserFullName = (id: number) => {
  return userStore.getUserFullName(id)
}

//------------------------------------MOUNTED------------------------------
onMounted(() => {
  console.log('onMounted UserPayments')
  moment.locale('pl')
  payments.value = paymentStore.getPaymentsByUserID(props.idUser?.toString())

  nextTick(() => {
    scrollToToday();
  });
})

//display current day in the table
const dataTableRef = ref(null);
const todayIndex = ref<number>((moment().month() * 2) + 3);//3 first columns to skip

const scrollToToday = () => {
  if (dataTableRef.value) {
    const container = (dataTableRef.value as any).$el.querySelector(".p-datatable-table-container") as HTMLElement | null;

    if (container) {
      const columns = container.querySelectorAll("thead.p-datatable-thead > tr > th");

      const frozenColumnsCount = 2;
      const frozenColumnsWidth = Array.from(columns)
          .slice(0, frozenColumnsCount)
          .reduce((total, col) => total + (col as HTMLElement).offsetWidth, 0);

      const target = columns[todayIndex.value] as HTMLElement;

      if (target) {
        container.scrollTo({
          left: target.offsetLeft - frozenColumnsWidth,
          behavior: "smooth",
        });
      }
    }
  }
};
</script>

<template>
  <Panel class="mt-5">
    <template #header>
      <div class="w-full flex justify-center">
        <p class="m-0 text-3xl">
          {{ getUserFullName(idUser) }}
        </p>
        <div v-if="paymentStore.loadingPayments">
          <ProgressSpinner class="ml-3" style="width: 40px; height: 40px" stroke-width="5"/>
        </div>
      </div>
    </template>
    <DataTable ref="dataTableRef"
               v-model:selection="selectedPayment"
               :loading="paymentStore.loadingPayments"
               :sort-order="1"
               :value="payments"
               removable-sort
               scrollable
               selection-mode="single"
               sort-field="paymentDay"
               table-style="min-width: 50rem"
               @row-select="onRowSelect"
               size="small"
    >
      <template #empty>
        <p v-if="!paymentStore.loadingPayments" class="text-red-500 text-3xl ">
          Nie znaleziono opłat...
        </p>
      </template>

      <!--  NAME    -->
      <Column field="name" header="Nazwa" :sortable="true" frozen style="min-width: 200px">
        <template #body="{ data, field }">
          <div class="name">
            {{ data[field] }}
          </div>
        </template>
      </Column>

      <!--  BANK/FIRM    -->
      <Column field="bank" header="Bank/Firma" :sortable="true" frozen style="min-width: 150px">
        <template #body="{ data }">
          <div class="name">
            {{ findBankOrFirmName(data) }}
          </div>
        </template>
      </Column>

      <!--  PAYMENT DAY    -->
      <Column field="paymentDay" header="Dzień" :sortable="true" style="width: 85px">
        <template #body="{ data, field }">
          <div class="day">
            {{ data[field] }}
          </div>
        </template>
      </Column>

      <!--  MONTHS    -->
      <div v-for="number in 12" :key="number">
        <!--  AMOUNT -->
        <Column
            field="amount"
            :header="TranslationService.translateMonth(number)"
            headerStyle="min-width: 100px;"
            headerClass="user-payment"
            class="user-payment"
        >
          <template #body="slotProps">
            <div :class="getClassAmount(slotProps.data.installments, number)">
              {{ getAmount(slotProps.data.installments, number) }}
            </div>
          </template>
        </Column>

        <!--   DATA     -->
        <Column
            header="Data zapł." fefacrot
            headerStyle="min-width: 110px;"
            headerClass=" user-payment"
            class="p-column-data-zapl user-payment"
        >
          <template #body="slotProps">
            <div :class="getClassDate(slotProps.data.installments, number)">
              {{ getDate(slotProps.data.installments, number) }}&emsp;
            </div>
          </template>
        </Column>
      </div>

      <ColumnGroup type="footer">
        <Row>
          <Column footer="Razem:" :colspan="2" frozen footer-style="text-align:left"/>
          <Column />
          <Column
              v-for="number in 12"
              :key="number"
              :footer="UtilsService.formatCurrency(calculateTotal(number))"
              :colspan="2"
          />
        </Row>
        <Row>
          <Column
              footer="Zapłacono:"
              :colspan="2"
              footer-style="text-align:left"
              footer-class="ml-5"
              frozen
          />
          <Column/>
          <Column
              v-for="number in 12"
              :key="number"
              :footer="UtilsService.formatCurrency(calculateTotalPaid(number))"
              :colspan="2"
          />
        </Row>
        <Row>
          <Column footer="Do zapłaty:" :colspan="2" frozen footer-style="text-align:left"/>
          <Column/>
          <Column
              v-for="number in 12"
              :key="number"
              :footer="UtilsService.formatCurrency(calculateTotalToPay(number))"
              :colspan="2"
          />
        </Row>
      </ColumnGroup>
    </DataTable>
  </Panel>
</template>

<style scoped>
.name {
  padding: 0.3rem 0 0.3rem 0;
  text-align: left;
}

.day {
  padding: 0.3rem 0 0.3rem 0;
  text-align: center;
}

.no-credit {
  display: flex;
  justify-content: center;
  background-color: red;
  color: red;
  padding: 0.7rem 0;
  min-width: 100%;
}

.paid {
  display: flex;
  justify-content: center;
  background-color: #2ca083;
  color: black;
  padding: 0.7rem 0;
  min-width: 100%;
}

.to-pay {
  display: flex;
  justify-content: center;
  padding: 0.7rem 0;
}

.overdue {
  display: flex;
  justify-content: center;
  background-color: yellow;
  color: black;
  padding: 0.7rem 0;
  min-width: 100%;
}

.p-datatable >>> .p-datatable-column-footer {
  margin-left: 1rem;
}

/* Styl podczas najechania myszką */
.p-datatable >>> .p-datatable-tbody > tr:hover {
  filter: brightness(0.75); /* Przyciemnia każdy kolor o 25% */
}
</style>
