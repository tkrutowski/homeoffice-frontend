<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { computed, onMounted, ref } from "vue";
import router from "@/router";
import { UtilsService } from "@/service/UtilsService";

import { Loan, LoanInstallment } from "@/assets/types/Loan";
import { PaymentStatus } from "@/assets/types/PaymentStatus";
import OfficeButton from "@/components/OfficeButton.vue";
import EditButton from "@/components/EditButton.vue";
import DeleteButton from "@/components/DeleteButton.vue";
import StatusButton from "@/components/StatusButton.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import TheMenuFinance from "@/components/TheMenuFinance.vue";

import { useToast } from "primevue/usetoast";
import { useLoansStore } from "@/stores/loans";
import { usePaymentStore } from "@/stores/payments";
import { useFeeStore } from "@/stores/fee";
const toast = useToast();
const loansStore = useLoansStore();
const paymentStore = usePaymentStore();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  // name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  // 'country.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  // representative: { value: null, matchMode: FilterMatchMode.IN },
  // status: { value: null, matchMode: FilterMatchMode.EQUALS },
  // verified: { value: null, matchMode: FilterMatchMode.EQUALS }
});
const expandedRows = ref([]);
const loanTemp = ref<Loan>();

const calculateInstallmentToPayAmount = (
  installments: LoanInstallment[]
): number => {
  console.log("LIST: ", installments);
  return installments
    .filter((value) => value.paymentStatus.name === "TO_PAY")
    .map((value) => value.installmentAmountToPay)
    .reduce((acc, currentValue) => acc + currentValue, 0);
};
const getCompletePaymentDate = (installments: LoanInstallment[]): string => {
  return installments[installments.length - 1].paymentDeadline;
};
const calculatePlannedInterest = (loan: Loan): number => {
  return (
    (loan.amount - loan.numberOfInstallments * loan.installmentAmount) * -1
  );
};
const calculateActualInterest = (loan: Loan): number => {
  return (
    loan.installmentList
      .filter((payment) => payment.paymentStatus.name === "PAID")
      .map(
        (installment) =>
          installment.installmentAmountPaid - installment.installmentAmountToPay
      )
      // .map(value => parseFloat(value))
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  );
};
const calculateTotalCost = (loan: Loan): number => {
  return (
    (loan.amount -
      loan.loanCost -
      loan.numberOfInstallments * loan.installmentAmount) *
    -1
  );
};
const calculateInstallmentPaid = (loan: Loan): number => {
  return loan.installmentList.filter(
    (installment) => installment.paymentStatus.name === "PAID"
  ).length;
};
const calculateInstallmentToPayNumber = (
  installments: LoanInstallment[]
): number => {
  return installments.filter((value) => value.paymentStatus.name === "TO_PAY")
    .length;
};
//
//---------------------------------------------STATUS CHANGE--------------------------------------------------
//
const showStatusChangeConfirmationDialog = ref<boolean>(false);
const confirmStatusChange = (loan: Loan) => {
  loanTemp.value = loan;
  showStatusChangeConfirmationDialog.value = true;
};
const changeStatusConfirmationMessage = computed(() => {
  if (loanTemp.value)
    return `Czy chcesz zmienić status kredytu: <b>${
      loanTemp.value?.name
    }</b> na <b>${
      loanTemp.value?.loanStatus.name === "PAID" ? "Do spłaty" : "Spłacony"
    }</b>?`;
  return "No message";
});
const submitChangeStatus = async () => {
  console.log("submitChangeStatus()");
  if (loanTemp.value) {
    let newStatus: PaymentStatus = {
      name: loanTemp.value.loanStatus.name === "PAID" ? "TO_PAY" : "PAID",
      viewName:
        loanTemp.value?.loanStatus.viewName !== "PAID"
          ? "Spłacony"
          : "Do spłaty",
    };
    const result = await loansStore.updateLoanStatusDb(
      loanTemp.value.id,
      newStatus
    );
    if (result)
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zmieniono status kredytu: " + loanTemp.value?.name,
        life: 3000,
      });
  }
  showStatusChangeConfirmationDialog.value = false;
};

//
//-------------------------------------------------DELETE LOAN-------------------------------------------------
//
const showDeleteConfirmationDialog = ref<boolean>(false);
const confirmDeleteLoan = (loan: Loan) => {
  loanTemp.value = loan;
  showDeleteConfirmationDialog.value = true;
};
const deleteConfirmationMessage = computed(() => {
  if (loanTemp.value)
    return `Czy chcesz usunąc kredyt: <b>${loanTemp.value?.name}</b>?`;
  return "No message";
});
const submitDelete = async () => {
  console.log("submitDelete()");
  if (loanTemp.value) {
    const result = await loansStore.deleteLoanDb(loanTemp.value.id);
    if (result) {
      //update payment
      paymentStore.deletePayment(loanTemp.value, "FEE");
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Usunięto kredyt: " + loanTemp.value?.name,
        life: 3000,
      });
    }
  }
  showDeleteConfirmationDialog.value = false;
};

//
//-------------------------------------------------EDIT LOAN-------------------------------------------------
//
const editItem = (item: Loan) => {
  const loanItem: Loan = JSON.parse(JSON.stringify(item));
  console.log("EDIT: ", loanItem);
  router.push({
    name: "Loan",
    params: { isEdit: "true", loanId: loanItem.id },
  });
};
//---------------------------------------------ON MOUTED-------------------------------------------------------
onMounted(() => {
  loansStore.getLoansFromDb("ALL", true);
});
</script>
<template>
  <Toast />
  <TheMenuFinance />
  <ConfirmationDialog
    v-model:visible="showStatusChangeConfirmationDialog"
    :msg="changeStatusConfirmationMessage"
    @save="submitChangeStatus"
    @cancel="showStatusChangeConfirmationDialog = false"
  />

  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />

  <Panel class="mt-3">
    <template #header>
      <div class="w-full flex justify-content-center">
        <h3 class="color-green">LISTA KREDYTÓW</h3>
        <div v-if="loansStore.loadingLoans">
          <ProgressSpinner
            class="ml-3"
            style="width: 40px; height: 40px"
            stroke-width="5"
          />
        </div>
      </div>
    </template>
    <DataTable
      v-if="!loansStore.loadingLoans"
      v-model:expandedRows="expandedRows"
      v-model:filters="filters"
      :value="loansStore.loans"
      :loading="loansStore.loadingLoans"
      striped-rows
      removable-sort
      paginator
      :rows="10"
      :rows-per-page-options="[5, 10, 20, 50]"
      table-style="min-width: 50rem"
      filter-display="row"
      :global-filter-fields="['name', 'bank.name', 'date']"
      sort-field="date"
      :sort-order="-1"
    >
      <template #header>
        <div class="flex justify-content-sm-between">
          <router-link
            :to="{ name: 'Loan', params: { isEdit: 'false', loanId: 0 } }"
            style="text-decoration: none"
          >
            <OfficeButton text="Nowy kredyt" btn-type="office" />
          </router-link>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Keyword Search"
            />
          </span>
        </div>
      </template>

      <template #empty>
        <h4 class="color-red" v-if="!loansStore.loadingLoans">
          Nie znaleziono kredytów...
        </h4>
      </template>

      <Column expander style="width: 5rem" />
      <Column field="name" header="Nazwa" sortable />
      <Column field="bank.name" header="Nazwa banku" sortable />
      <Column field="date" header="Data" sortable />
      <Column field="amount" header="Kwota" style="min-width: 120px">
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(slotProps.data[slotProps.field]) }}
        </template>
      </Column>
      <Column field="numberOfInstallments" header="Ilość rat" sortable />
      <Column
        field="installmentAmount"
        header="Kwota raty"
        style="min-width: 120px"
      >
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(slotProps.data[slotProps.field]) }}
        </template>
      </Column>

      <Column header="Pozostało" sortable>
        <template #body="slotProps">
          {{
            UtilsService.formatCurrency(
              calculateInstallmentToPayAmount(slotProps.data.installmentList)
            )
          }}
          ({{
            calculateInstallmentToPayNumber(slotProps.data.installmentList)
          }})
        </template>
      </Column>

      <Column field="loanStatus" header="Status" style="width: 100px">
        <template #body="{ data, field }">
          <StatusButton
            v-tooltip.top="{
              value: 'Zmień status kredytu (Spłacona/Do spłaty)',
              showDelay: 1000,
              hideDelay: 300,
            }"
            :btn-type="data[field].name"
            :color-icon="data[field].name === 'PAID' ? '#2da687' : '#dc3545'"
            @click="confirmStatusChange(data)"
          />
        </template>
      </Column>
      <!--                EDIT, DELETE-->
      <Column header="Akcja" :exportable="false" style="min-width: 8rem">
        <template #body="slotProps">
          <div class="flex flex-row gap-1 justify-content-end">
            <EditButton
              v-tooltip.top="{
                value: 'Edytuj kredyt',
                showDelay: 1000,
                hideDelay: 300,
              }"
              @click="editItem(slotProps.data)"
            />
            <DeleteButton
              v-tooltip.top="{
                value: 'Usuń kredyt',
                showDelay: 1000,
                hideDelay: 300,
              }"
              @click="confirmDeleteLoan(slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-3">
          <h5 class="mb-3" style="text-align: center">
            Szczególy kredytu {{ slotProps.data.name }}
          </h5>
          <hr />
          <div class="flex flex-row grid">
            <div class="flex flex-column col-12 col-xl-5">
              <p class="mb-1 mt-3">
                <small>Nazwa kredytu:</small> {{ slotProps.data.name }}
              </p>
              <p class="mb-1">
                <small>Nazwa banku:</small> {{ slotProps.data.bank.name }}
              </p>
              <p class="mb-1">
                <small>Nr kredytu:</small> {{ slotProps.data.loanNumber }}
              </p>
              <p class="mb-1">
                <small>Z dnia:</small> {{ slotProps.data.date }}
              </p>
              <p class="mb-1">
                <small>Data pierwszej raty:</small>
                {{ slotProps.data.firstPaymentDate }}
              </p>
              <p class="mb-1">
                <small>Termin całkowitej spłaty:</small>
                {{ getCompletePaymentDate(slotProps.data.installmentList) }}
              </p>
              <p class="mb-5">
                <small>Nr konta:</small> {{ slotProps.data.accountNumber }}
              </p>

              <p class="mb-1">
                <small>Kwota kredytu:</small>
                {{ UtilsService.formatCurrency(slotProps.data.amount) }}
              </p>
              <p class="mb-1">
                <small>Koszt kredytu: </small>
                <span class="color-red ml-1">
                  {{
                    UtilsService.formatCurrency(slotProps.data.loanCost)
                  }}</span
                >
              </p>
              <p class="mb-1">
                <small>Ilość rat:</small>
                {{ slotProps.data.numberOfInstallments }}
              </p>
              <p class="mb-1">
                <small>Kwota raty:</small>
                {{
                  UtilsService.formatCurrency(slotProps.data.installmentAmount)
                }}
              </p>
              <p class="mb-1">
                <small>Odsetki planowane:</small>
                <span class="color-red ml-1">
                  {{
                    UtilsService.formatCurrency(
                      calculatePlannedInterest(slotProps.data)
                    )
                  }}
                </span>
              </p>
              <p class="mb-3">
                <small>Odsetki rzeczywiste:</small>
                <span class="color-red ml-1">
                  {{
                    UtilsService.formatCurrency(
                      calculateActualInterest(slotProps.data)
                    )
                  }}
                </span>
              </p>

              <p class="mb-4">
                <small>Całkowity koszt kredytu:</small>
                <span class="color-red h4 ml-1">
                  {{
                    UtilsService.formatCurrency(
                      calculateTotalCost(slotProps.data)
                    )
                  }}
                </span>
              </p>

              <p class="mb-1">
                <small>Spłacono:</small>
                {{ calculateInstallmentPaid(slotProps.data) }}
                z {{ slotProps.data.numberOfInstallments }}
              </p>

              <div class="card">
                <ProgressBar
                  :value="
                    (calculateInstallmentPaid(slotProps.data) /
                      slotProps.data.numberOfInstallments) *
                    100
                  "
                >
                  {{
                    (
                      (calculateInstallmentPaid(slotProps.data) /
                        slotProps.data.numberOfInstallments) *
                      100
                    ).toFixed(0)
                  }}%
                </ProgressBar>
              </div>
              <label>Dodatkowe informacje:</label>
              <Textarea
                v-model="slotProps.data.otherInfo"
                rows="5"
                cols="30"
                readonly
              />
            </div>

            <div class="flex flex-column col-12 col-xl-7">
              <DataTable :value="slotProps.data.installmentList">
                <Column field="installmentNumber" style="width: 100px">
                  <template #header>
                    <div class="w-full" style="text-align: left">Nr raty</div>
                  </template>
                  <template #body="{ data, field }">
                    <div style="text-align: left">{{ data[field] }}</div>
                  </template>
                </Column>
                <Column field="paymentDeadline">
                  <template #header>
                    <div class="w-full" style="text-align: center">
                      Termin płatności
                    </div>
                  </template>
                  <template #body="{ data, field }">
                    <div style="text-align: center">{{ data[field] }}</div>
                  </template>
                </Column>
                <Column field="installmentAmountToPay" header="Kwota">
                  <template #body="{ data, field }">
                    {{ UtilsService.formatCurrency(data[field]) }}
                  </template>
                </Column>
                <Column field="paymentDate" header="Data płatności">
                  <template #body="{ data, field }">
                    <div style="text-align: center">
                      {{
                        data[field] === "-999999999-01-01" ? "" : data[field]
                      }}
                    </div>
                  </template>
                </Column>
                <Column field="installmentAmountPaid" header="Kwota zapł.">
                  <template #body="{ data, field }">
                    <div style="text-align: center">
                      {{ UtilsService.formatCurrency(data[field]) }}
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>
      </template>
    </DataTable>
  </Panel>
</template>

<style scoped>
.p-datatable .p-datatable-tbody > tr > td {
  text-align: center !important;
}
</style>
