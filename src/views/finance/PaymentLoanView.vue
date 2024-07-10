<script setup lang="ts">
import moment from "moment/moment";
import { computed, onMounted, ref } from "vue";
import router from "@/router";
import { UtilsService } from "@/service/UtilsService";
import { Loan, LoanInstallment } from "@/assets/types/Loan";
import DeleteButton from "@/components/DeleteButton.vue";
import EditButton from "@/components/EditButton.vue";
import PayPaymentDialog from "@/components/PayPaymentDialog.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import OfficeButton from "@/components/OfficeButton.vue";
import IconButton from "@/components/IconButton.vue";
import TheMenuFinance from "@/components/TheMenuFinance.vue";

import { useLoansStore } from "@/stores/loans";
import { usePaymentStore } from "@/stores/payments";
import { useToast } from "primevue/usetoast";

const loansStore = useLoansStore();
const paymentStore = usePaymentStore();
const toast = useToast();

const loan = ref<Loan>();
const installments = ref<LoanInstallment[]>([]);
const isBusy = ref<boolean>(false);

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

const countDeadLine = computed(() => {
  return loan.value?.installmentList[loan.value?.installmentList.length - 1]
    .paymentDeadline;
});
const plannedInterest = computed(() => {
  if (loan.value)
    return (
      (loan.value?.amount -
        loan.value?.numberOfInstallments * loan.value?.installmentAmount) *
      -1
    );
  return 0;
});
const realInterest = computed(() => {
  if (loan.value)
    return loan.value.installmentList
      .filter((l) => l.paymentStatus.name === "PAID")
      .map(
        (installment) =>
          installment.installmentAmountPaid - installment.installmentAmountToPay
      )
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return 0;
});
const calculateCost = computed(() => {
  if (loan.value)
    return (
      (loan.value.amount -
        loan.value.loanCost -
        loan.value.numberOfInstallments * loan.value.installmentAmount) *
      -1
    );
  return 0;
});
const calculatePaid = computed(() => {
  if (loan.value)
    return loan.value.installmentList.filter(
      (installment) => installment.paymentStatus.name === "PAID"
    ).length;
  return 0;
});
const getAmount = computed(() => {
  return installment.value?.installmentAmountPaid
    ? installment.value.installmentAmountPaid
    : installment.value?.installmentAmountToPay;
});
const getDate = computed(() => {
  if (installment.value?.paymentDate?.startsWith("+"))
    return moment().format("YYYY-MM-DD");
  return installment.value?.paymentDate;
});
const calculateProgressBar = computed(() => {
  if (loan.value)
    return (
      (loan.value.installmentList.filter((i) => i.paymentStatus.name === "PAID")
        .length /
        loan.value.numberOfInstallments) *
      100
    );
  return 0;
});
// ---------------------------------------------EDIT PAYMENT--------------------------------
const showPaymentModal = ref(false);
const installment = ref<LoanInstallment>();
function openPaymentModal(i: LoanInstallment) {
  installment.value = i;
  showPaymentModal.value = true;
}

async function savePayment(date: string, amount: number) {
  isBusy.value = true;
  if (installment.value) {
    installment.value.paymentDate = moment(date).format("YYYY-MM-DD");
    installment.value.installmentAmountPaid = amount;
    installment.value.paymentStatus = { name: "PAID", viewName: "Spłacony" };
    showPaymentModal.value = false;

    const savedLoan = await loansStore.updateLoanInstallmentDb(
      installment.value
    );

    //update views
    if (savedLoan) {
      installments.value = savedLoan.installmentList;
      paymentStore.updatePayment(savedLoan, "LOAN");
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zaktualizowano płatność.",
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Potwierdzenie",
        detail: "Błąd podczas płatność.",
        life: 3000,
      });
    }
  }
  isBusy.value = false;
  refresh();
}
//----------------------------------------------DELETE PAYMENT----------------------------
const showDeleteConfirmationDialog = ref<boolean>(false);

const confirmDeletePayment = (i: LoanInstallment) => {
  installment.value = i;
  showDeleteConfirmationDialog.value = true;
};

const deleteConfirmationMessage = computed(() => {
  if (installment.value)
    return `Czy chcesz usunąc płatność z dnia: <b>${installment.value?.paymentDate}</b> </br>&emsp;&emsp;&emsp; na kwotę <b>${installment.value?.installmentAmountPaid} zł</b>?`;
  return "No message";
});
const submitDelete = async () => {
  console.log("submitDelete()");
  isBusy.value = true;
  if (installment.value) {
    installment.value.paymentStatus = {
      name: "TO_PAY",
      viewName: "Do zapłaty",
    };
    installment.value.paymentDate = "";
    installment.value.installmentAmountPaid = 0;
    showDeleteConfirmationDialog.value = false;
    console.log("przed del, ", installment.value);
    const savedLoan = await loansStore.updateLoanInstallmentDb(
      installment.value
    );
    console.log("po del, ", savedLoan);
    //update views
    if (savedLoan) {
      installments.value = savedLoan.installmentList;
      paymentStore.updatePayment(savedLoan, "LOAN");
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Usunięto płatność.",
        life: 3000,
      });
    }
  }
  await refresh();
  isBusy.value = false;
};

//------------------------------------MOUNTED------------------------------
onMounted(async () => {
  console.log("onMounted GET");
  loansStore.getLoans("ALL");
  refresh();
});
const refresh = async () => {
  loan.value = await loansStore.getLoanFromDb(+props.id);
  installments.value = loan.value ? loan.value?.installmentList : [];
};
</script>

<template>
  <TheMenuFinance />
  <PayPaymentDialog
    v-model:visible="showPaymentModal"
    :amount="getAmount"
    :date="getDate"
    @save="savePayment"
    @cancel="showPaymentModal = false"
  />
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />

  <Panel id="fee-panel" class="mt-3 m-auto">
    <template #header>
      <IconButton
        v-tooltip.right="{
          value: 'Powrót do listy kredytów',
          showDelay: 500,
          hideDelay: 300,
        }"
        icon="pi-fw pi-list"
        @click="() => router.push({ name: 'Loans' })"
      />
      <div class="w-full flex justify-content-center">
        <h2 class="m-0">
          {{ `Szczegóły kredytu: ${loan?.name}` }}
        </h2>
        <div v-if="loansStore.loadingLoans">
          <ProgressSpinner
            class="ml-3"
            style="width: 40px; height: 40px"
            stroke-width="5"
          />
        </div>
      </div>
    </template>
    <div class="formgrid grid">
      <!--      LEFT-->
      <div class="field col">
        <p class="mb-1 mt-3"><small>Nazwa kredytu:</small> {{ loan?.name }}</p>
        <p class="mb-1"><small>Nazwa banku:</small> {{ loan?.bank?.name }}</p>
        <p class="mb-1"><small>Nr kredytu:</small> {{ loan?.loanNumber }}</p>
        <p class="mb-1"><small>Z dnia:</small> {{ loan?.date }}</p>
        <p class="mb-1">
          <small>Data pierwszej raty:</small> {{ loan?.firstPaymentDate }}
        </p>
        <p class="mb-1">
          <small>Termin całkowitej spłaty:</small> {{ countDeadLine }}
        </p>
        <p class="mb-5"><small>Nr konta:</small> {{ loan?.accountNumber }}</p>
        <p class="mb-1">
          <small>Kwota kredytu:</small>
          {{ UtilsService.formatCurrency(loan?.amount) }}
        </p>
        <p class="mb-1">
          <small>Koszt kredytu:</small>
          <span class="color-red ml-1">
            {{ UtilsService.formatCurrency(loan?.loanCost) }}</span
          >
        </p>
        <p class="mb-1">
          <small>Ilość rat:</small> {{ loan?.numberOfInstallments }}
        </p>
        <p class="mb-1">
          <small>Kwota raty:</small>
          {{ UtilsService.formatCurrency(loan?.installmentAmount) }}
        </p>
        <p class="mb-1">
          <small>Odsetki planowane:</small>
          <span class="color-red ml-1">
            {{ UtilsService.formatCurrency(plannedInterest) }}
          </span>
        </p>

        <p class="mb-3">
          <small>Odsetki rzeczywiste:</small>
          <span class="color-red ml-1">
            {{ UtilsService.formatCurrency(realInterest) }}
          </span>
        </p>

        <p class="mb-4">
          <small>Całkowity koszt kredytu:</small>
          <span class="color-red h4 ml-2">
            {{ UtilsService.formatCurrency(calculateCost) }}
          </span>
        </p>

        <p class="mb-1">
          <small>Spłacono:</small> {{ calculatePaid }} z
          {{ loan?.numberOfInstallments }}
        </p>

        <ProgressBar :value="calculateProgressBar">
          {{ calculateProgressBar.toFixed(0) }}%
        </ProgressBar>
        <div class="flex flex-column">
          <label for="info">Opis:</label>
          <Textarea :v-model="loan?.otherInfo" rows="5" readonly id="info" />
        </div>
      </div>

      <!--      RIGHT TABLE-->
      <div class="field col">
        <DataTable :value="installments" v-if="!loansStore.loadingLoans">
          <Column field="installmentNumber">
            <template #header>
              <div class="w-full" style="text-align: left">Nr raty</div>
            </template>
            <template #body="{ data, field }">
              <div class="ml-3" style="text-align: left">
                {{ data[field] }}
              </div>
            </template>
          </Column>
          <Column field="paymentDeadline" header="Termin płatności">
            <template #body="{ data, field }">
              <div style="text-align: center">
                {{ data[field] }}
              </div>
            </template>
          </Column>
          <Column field="installmentAmountToPay" header="Kwota">
            <template #body="{ data, field }">
              <div>
                {{ UtilsService.formatCurrency(data[field]) }}
              </div>
            </template>
          </Column>
          <Column field="paymentDate" header="Data płatności">
            <template #body="{ data, field }">
              <div style="text-align: center">
                {{ data[field].startsWith("+") ? "" : data[field] }}
              </div>
            </template>
          </Column>
          <Column field="installmentAmountPaid" header="Kwota">
            <template #body="{ data, field }">
              <div>
                {{
                  data[field] !== 0
                    ? UtilsService.formatCurrency(data[field])
                    : ""
                }}
              </div>
            </template>
          </Column>
          <!--                EDIT, DELETE-->
          <Column header="Akcja" :exportable="false" style="min-width: 8rem">
            <template #body="slotProps">
              <div class="flex flex-row gap-1 justify-content-end">
                <EditButton
                  v-tooltip.top="{
                    value: 'Edytuj wpłatę',
                    showDelay: 1000,
                    hideDelay: 300,
                  }"
                  @click="openPaymentModal(slotProps.data)"
                />
                <DeleteButton
                  v-tooltip.top="{
                    value: 'Usuń wpłatę',
                    showDelay: 1000,
                    hideDelay: 300,
                  }"
                  :disabled="slotProps.data.installmentAmountPaid === 0"
                  @click="confirmDeletePayment(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <template #footer>
      <div class="flex flex-row">
        <div class="flex col justify-content-center">
          <OfficeButton
            text="zamknij"
            btn-type="office"
            :btn-disabled="isBusy"
            :is-busy-icon="isBusy"
            @click="() => router.back()"
          />
        </div>
      </div>
    </template>
  </Panel>
</template>

<style scoped>
.color-red {
  color: #dc3545;
}
</style>
