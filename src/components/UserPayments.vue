<script setup lang="ts">
import moment from "moment";
import { onMounted, ref } from "vue";
import { UtilsService } from "@/service/UtilsService";
import router from "@/router";
import { Installment, Payment } from "@/assets/types/Payment";

import { usePaymentStore } from "@/stores/payments";
import { useUsersStore } from "@/stores/users";

const paymentStore = usePaymentStore();
const userStore = useUsersStore();

const props = defineProps({
  idUser: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

const selectedPayment = ref<Payment>();
const selectedYear = ref<number>(props.year);
const payments = ref<Payment[]>();

const onRowSelect = (event: any) => {
  // console.log("ON_ROW_SELECT: ", event);
  // console.log("ON_ROW_SELECT: ", event.data.paymentType);
  const payment =
    event.data.paymentType === "LOAN" ? "PaymentLoan" : "PaymentFee";
  router.push({
    name: payment,
    params: { id: event.data.id },
  });
};
const getAmount = (installments: Installment[], month: number) => {
  let installment = installments.find(
    (pay) =>
      parseInt(moment(pay.paymentDeadline).format("yyyy")) ===
        selectedYear.value &&
      parseInt(moment(pay.paymentDeadline).format("M")) === month
  );

  return installment === undefined
    ? "null"
    : +installment.installmentAmountPaid === 0
    ? UtilsService.formatCurrency(installment.installmentAmountToPay)
    : UtilsService.formatCurrency(installment.installmentAmountPaid);
};

const getClassAmount = (installments: Installment[], month: number) => {
  let installment = installments.find(
    (pay) =>
      parseInt(moment(pay.paymentDeadline).format("yyyy")) ===
        selectedYear.value &&
      parseInt(moment(pay.paymentDeadline).format("M")) === month
  );
  const paymentDeadline = installment?.paymentDeadline;
  if (!paymentDeadline) return "no-credit";

  let isPaid =
    installment?.paymentDate !== "-999999999-01-01" &&
    installment?.paymentDate !== "0001-01-01";
  if (isPaid) return "paid";
  else {
    const deadline = moment(installment?.paymentDeadline);
    const now = moment();
    if (now.isAfter(deadline)) return "overdue";
  }
  return null;
};

const getDate = (installments: Installment[], month: number) => {
  let installment = installments.find(
    (pay) =>
      parseInt(moment(pay.paymentDeadline).format("yyyy")) ===
        selectedYear.value &&
      parseInt(moment(pay.paymentDeadline).format("M")) === month
  );
  if (!installment) return "null";

  const paymentDate = installment?.paymentDate;
  if (paymentDate) {
    let isPaid =
      paymentDate !== "-999999999-01-01" && paymentDate !== "0001-01-01";
    return isPaid ? paymentDate : "";
  }
};

const getClassDate = (installments: Installment[], month: number) => {
  let installment = installments.find(
    (pay) =>
      parseInt(moment(pay.paymentDeadline).format("yyyy")) ===
        selectedYear.value &&
      parseInt(moment(pay.paymentDeadline).format("M")) === month
  );
  const paymentDeadline = installment?.paymentDeadline;
  if (!paymentDeadline) return "no-credit";

  let isPaid =
    installment?.paymentDate !== "-999999999-01-01" &&
    installment?.paymentDate !== "0001-01-01";
  if (isPaid) return "paid";
  return null;
};

const calculateTotal = (month: number) => {
  return payments.value
    ?.map((value) => value.installments)
    .flatMap((value) => value)
    .filter(
      (pay) =>
        parseInt(moment(pay.paymentDeadline).format("yyyy")) ===
          selectedYear.value &&
        parseInt(moment(pay.paymentDeadline).format("M")) === month
    )
    .map((value) => value.installmentAmountToPay)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
};
const calculateTotalPaid = (month: number) => {
  return payments.value
    ?.map((value) => value.installments)
    .flatMap((value) => value)
    .filter(
      (pay) =>
        parseInt(moment(pay.paymentDeadline).format("yyyy")) ===
          selectedYear.value &&
        parseInt(moment(pay.paymentDeadline).format("M")) === month
    )
    .map((value) => value.installmentAmountPaid)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
};
const calculateTotalToPay = (month: number) => {
  return payments.value
    ?.map((value) => value.installments)
    .flatMap((value) => value)
    .filter(
      (pay) =>
        parseInt(moment(pay.paymentDeadline).format("yyyy")) ===
          selectedYear.value &&
        parseInt(moment(pay.paymentDeadline).format("M")) === month
    )
    .map((value) =>
      value.installmentAmountToPay - value.installmentAmountPaid < 0
        ? 0
        : value.installmentAmountToPay - value.installmentAmountPaid
    )
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
};
const getMonth = (month: number) => {
  switch (month) {
    case 1:
      return "Styczeń";
    case 2:
      return "Luty";
    case 3:
      return "Marzec";
    case 4:
      return "Kwiecień";
    case 5:
      return "Maj";
    case 6:
      return "Czerwiec";
    case 7:
      return "Lipiec";
    case 8:
      return "Sierpień";
    case 9:
      return "Wrzesień";
    case 10:
      return "Październik";
    case 11:
      return "Listopad";
    case 12:
      return "Grudzień";
    default:
      return "null";
  }
};
const getUserFullName = (id: number) => {
  return userStore.getUserFullName(id);
};

//------------------------------------MOUNTED------------------------------
onMounted(() => {
  console.log("onMounted UserPayments");
  payments.value = paymentStore.getPaymentsByUserID(props.idUser?.toString());
});
</script>

<template>
  <Panel class="mt-5">
    <template #header>
      <div class="w-full flex justify-content-center">
        <h3 class="color-green">
          {{ getUserFullName(idUser) }}
        </h3>
        <div v-if="paymentStore.loadingPayments">
          <ProgressSpinner
            class="ml-3"
            style="width: 40px; height: 40px"
            stroke-width="5"
          />
        </div>
      </div>
    </template>
    <DataTable
      v-model:selection="selectedPayment"
      removable-sort
      sort-field="paymentDay"
      :value="payments"
      :loading="paymentStore.loadingPayments"
      scrollable
      :sort-order="1"
      selection-mode="single"
      table-style="min-width: 50rem"
      @rowSelect="onRowSelect"
    >
      <template #empty>
        <h4 v-if="!paymentStore.loadingPayments" class="color-red">
          Nie znaleziono opłat...
        </h4>
      </template>

      <template #loading>
        <h4 class="color-green">Ładowanie danych. Proszę czekać...</h4>
      </template>

      <!--  NAME    -->
      <Column
        field="name"
        header="Nazwa"
        sortable
        frozen
        style="min-width: 180px"
      >
        <template #body="{ data, field }">
          <div class="name">
            {{ data[field] }}
          </div>
        </template>
      </Column>

      <!--  PAYMENT DAY    -->
      <Column
        field="paymentDay"
        header="Dzień"
        sortable
        frozen
        style="width: 45px"
      >
        <template #body="{ data, field }">
          <div class="day">
            {{ data[field] }}
          </div>
        </template>
      </Column>

      <!--  MONTHS    -->
      <div v-for="number in 12" :key="number">
        <Column
          field="amount"
          :header="getMonth(number)"
          style="min-width: 100px"
        >
          <template #body="slotProps">
            <div :class="getClassAmount(slotProps.data.installments, number)">
              {{ getAmount(slotProps.data.installments, number) }}
            </div>
          </template>
        </Column>
        <Column header="Data zapł." style="min-width: 110px">
          <template #body="slotProps">
            <div :class="getClassDate(slotProps.data.installments, number)">
              <!--                  slotProps.data.paymentDay-->
              {{ getDate(slotProps.data.installments, number) }}
            </div>
          </template>
        </Column>
      </div>

      <ColumnGroup type="footer">
        <Row>
          <Column
            footer="Razem:"
            :colspan="2"
            footerStyle="text-align:left"
            frozen
          />
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
            footerStyle="text-align:left"
            frozen
          />
          <Column
            v-for="number in 12"
            :key="number"
            :footer="UtilsService.formatCurrency(calculateTotalPaid(number))"
            :colspan="2"
          />
        </Row>
        <Row>
          <Column
            footer="Do zapłaty:"
            :colspan="2"
            footerStyle="text-align:left"
            frozen
          />
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
.no-credit {
  background-color: red;
  color: red;
  padding: 0.3rem 0 0.3rem 0;
}
.paid {
  background-color: #2ca083;
  color: black;
  padding: 0.3rem 0 0.3rem 0;
}
.to-pay {
  padding: 0.3rem 0 0.3rem 0;
}
.name {
  padding: 0.3rem 0 0.3rem 0;
  text-align: left;
}
.day {
  padding: 0.3rem 0 0.3rem 0;
  text-align: center;
}
.overdue {
  background-color: yellow;
  color: black;
  padding: 0.3rem 0 0.3rem 0;
}
.p-datatable .p-datatable-tbody > tr > td {
  text-align: center;
  border: 1px solid black;
  border-width: 0 1px 1px 0;
  padding: 1rem 0 1rem 0;
}
</style>
