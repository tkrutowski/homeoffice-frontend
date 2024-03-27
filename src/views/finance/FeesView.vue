<script setup lang="ts">
import { computed, ref } from "vue";
import { FilterMatchMode } from "primevue/api";
import router from "@/router";
import { UtilsService } from "@/service/UtilsService";

import { PaymentStatus } from "@/assets/types/PaymentStatus";
import OfficeButton from "@/components/OfficeButton.vue";
import OfficeIconButton from "@/components/OfficeIconButton.vue";
import EditButton from "@/components/EditButton.vue";
import DeleteButton from "@/components/DeleteButton.vue";
import StatusButton from "@/components/StatusButton.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import TheMenuFinance from "@/components/TheMenuFinance.vue";
import { Fee, FeeInstallment } from "@/assets/types/Fee";

import { useToast } from "primevue/usetoast";
import { useFeeStore } from "@/stores/fee";
import { usePaymentStore } from "@/stores/payments";
import StatusType from "@/assets/types/StatusType";
const toast = useToast();
const feeStore = useFeeStore();
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
const feeTemp = ref<Fee>();
feeStore.getFees("ALL");
const calculatePlannedCost = (installments: FeeInstallment[]): number => {
  console.log("XXX", installments);
  return installments
    .map((installment) => installment.installmentAmountToPay)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};
const calculateActualCost = (installments: FeeInstallment[]): number => {
  return installments
    .map((installment) => installment.installmentAmountPaid)
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};
const calculateEndDate = (installments: FeeInstallment[]): string => {
  return installments[installments.length - 1].paymentDeadline;
};
//
//--------------------------------DISPLAY FILTER
//
const filter = ref<StatusType>("ALL");
const setFilter = (selectedFilter: StatusType) => {
  filter.value = selectedFilter;
  localStorage.setItem("selectedFilterFees", selectedFilter);
};

const savedFilter = localStorage.getItem("selectedFilterFees");
if (savedFilter) {
  filter.value = savedFilter as StatusType;
}

const filteredData = computed(() => {
  switch (filter.value) {
    case "TO_PAY":
      return feeStore.getFeesToPay;
    case "PAID":
      return feeStore.getFeesPaid;
    case "ALL":
    default:
      return feeStore.fees;
  }
});

//
//---------------------------------------------STATUS CHANGE--------------------------------------------------
//
const showStatusChangeConfirmationDialog = ref<boolean>(false);
const confirmStatusChange = (fee: Fee) => {
  feeTemp.value = fee;
  showStatusChangeConfirmationDialog.value = true;
};
const changeStatusConfirmationMessage = computed(() => {
  if (feeTemp.value)
    return `Czy chcesz zmienić status opłaty: <b>${
      feeTemp.value?.name
    }</b> na <b>${
      feeTemp.value?.feeStatus.name === "PAID" ? "Do spłaty" : "Spłacony"
    }</b>?`;
  return "No message";
});
const submitChangeStatus = async () => {
  console.log("submitChangeStatus()");
  if (feeTemp.value) {
    let newStatus: PaymentStatus = {
      name: feeTemp.value.feeStatus.name === "PAID" ? "TO_PAY" : "PAID",
      viewName:
        feeTemp.value?.feeStatus.viewName !== "PAID" ? "Spłacony" : "Do spłaty",
    };
    const result = await feeStore.updateFeeStatusDb(
      feeTemp.value.id,
      newStatus
    );
    if (result)
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zmieniono status opłaty: " + feeTemp.value?.name,
        life: 3000,
      });
  }
  showStatusChangeConfirmationDialog.value = false;
};

//
//-------------------------------------------------DELETE FEE-------------------------------------------------
//
const showDeleteConfirmationDialog = ref<boolean>(false);
const confirmDeleteLoan = (fee: Fee) => {
  feeTemp.value = fee;
  showDeleteConfirmationDialog.value = true;
};
const deleteConfirmationMessage = computed(() => {
  if (feeTemp.value)
    return `Czy chcesz usunąc opłatę: <b>${feeTemp.value?.name}</b>?`;
  return "No message";
});
const submitDelete = async () => {
  console.log("submitDelete()");
  showDeleteConfirmationDialog.value = false;
  if (feeTemp.value) {
    const result = await feeStore.deleteFeeDb(feeTemp.value.id);
    if (result) {
      //update payment
      paymentStore.deletePayment(feeTemp.value, "FEE");
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Usunięto opłatę: " + feeTemp.value?.name,
        life: 3000,
      });
    }
  }
};

//
//-------------------------------------------------EDIT FEE-------------------------------------------------
//
const editItem = (item: Fee) => {
  const feeItem: Fee = JSON.parse(JSON.stringify(item));
  router.push({
    name: "Fee",
    params: { isEdit: "true", feeId: feeItem.id },
  });
};
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

  <Panel class="mt-5 mt-3 ml-2 mr-2">
    <template #header>
      <div class="w-full flex justify-content-center">
        <h3 class="color-green">LISTA OPŁAT</h3>
        <div v-if="feeStore.loadingFees">
          <ProgressSpinner
            class="ml-3"
            style="width: 40px; height: 40px"
            stroke-width="5"
          />
        </div>
      </div>
    </template>
    <DataTable
      v-if="!feeStore.loadingFees"
      v-model:expandedRows="expandedRows"
      v-model:filters="filters"
      :value="filteredData"
      :loading="feeStore.loadingFees"
      striped-rows
      removable-sort
      paginator
      :rows="10"
      :rows-per-page-options="[5, 10, 20, 50]"
      table-style="min-width: 50rem"
      filter-display="row"
      :global-filter-fields="['name', 'firm.name', 'date']"
      sort-field="date"
      :sort-order="-1"
      row-hover
    >
      <template #header>
        <div class="flex justify-content-sm-between">
          <router-link
            :to="{ name: 'Fee', params: { isEdit: 'false', feeId: 0 } }"
            style="text-decoration: none"
          >
            <OfficeButton text="Nowa opłata" btn-type="office" />
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
        <h4 class="color-red" v-if="!feeStore.loadingFees">
          Nie znaleziono opłat...
        </h4>
      </template>

      <Column expander style="width: 5rem" />
      <Column field="name" header="Nazwa" sortable class="color-orange" />
      <Column
        field="firm.name"
        header="Nazwa firmy"
        sortable
        class="color-orange"
      />
      <Column field="date" header="Data" sortable class="color-orange" />
      <Column
        field="amount"
        header="Kwota"
        style="min-width: 120px"
        class="color-orange"
      >
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(slotProps.data[slotProps.field]) }}
        </template>
      </Column>
      <Column
        field="feeFrequency.viewName"
        header="Częstotliwość opłat"
        sortable
        class="color-orange"
      />
      <Column header="Data zakończenia" sortable class="color-orange">
        <template #body="slotProps">
          {{ calculateEndDate(slotProps.data.installmentList) }}
        </template>
      </Column>

      <Column field="feeStatus" header="Status" style="width: 100px">
        <template #body="{ data, field }">
          <StatusButton
            v-tooltip.top="{
              value: 'Zmień status opłaty',
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
                value: 'Edytuj opłatę',
                showDelay: 1000,
                hideDelay: 300,
              }"
              @click="editItem(slotProps.data)"
            />
            <DeleteButton
              v-tooltip.top="{
                value: 'Usuń opłatę',
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
            <span class="color-orange"
              >Szczególy opłaty {{ slotProps.data.name }}
            </span>
          </h5>
          <hr />
          <div class="flex flex-row grid">
            <div class="flex flex-column col-12 col-xl-5">
              <p class="mb-1 mt-3 color-orange text-left">
                <small>Nazwa opłaty:</small> {{ slotProps.data.name }}
              </p>
              <p class="mb-1 color-orange text-left">
                <small>Nazwa firmy:</small> {{ slotProps.data.firm.name }}
              </p>
              <p class="mb-1 color-orange text-left">
                <small>Nr umowy:</small> {{ slotProps.data.feeNumber }}
              </p>
              <p class="mb-1 color-orange text-left">
                <small>Z dnia:</small> {{ slotProps.data.date }}
              </p>
              <p class="mb-1 color-orange text-left">
                <small>Data pierwszej raty:</small>
                {{ slotProps.data.firstPaymentDate }}
              </p>
              <p class="mb-1 color-orange text-left">
                <small>Termin całkowitej spłaty:</small>
                {{ calculateEndDate(slotProps.data.installmentList) }}
              </p>
              <p class="mb-5 color-orange text-left">
                <small>Nr konta:</small> {{ slotProps.data.accountNumber }}
              </p>

              <p class="mb-1 color-orange text-left">
                <small>Kwota opłaty:</small>
                {{ UtilsService.formatCurrency(slotProps.data.amount) }}
              </p>
              <p class="mb-1 color-orange text-left">
                <small>Częstotliwość opłat:</small>
                <span class="color-red ml-1">
                  {{ slotProps.data.feeFrequency.viewName }}
                </span>
              </p>
              <p class="mb-1 color-orange text-left">
                <small>Ilość opłat:</small>
                {{ slotProps.data.numberOfInstallments }}
              </p>
              <p class="mb-1 color-orange text-left">
                <small>Planowany koszt:</small>
                <span class="color-red ml-1">
                  {{
                    UtilsService.formatCurrency(
                      calculatePlannedCost(slotProps.data.installmentList)
                    )
                  }}
                </span>
              </p>
              <p class="mb-3 color-orange text-left">
                <small>Rzeczywisty koszt:</small>
                <span class="color-red ml-1">
                  {{
                    UtilsService.formatCurrency(
                      calculateActualCost(slotProps.data.installmentList)
                    )
                  }}
                </span>
              </p>

              <label class="color-orange text-left"
                >Dodatkowe informacje:</label
              >
              <Textarea
                v-model="slotProps.data.otherInfo"
                rows="5"
                cols="30"
                readonly
              />
            </div>

            <div class="flex flex-column col-12 col-xl-7">
              <DataTable :value="slotProps.data.installmentList">
                <Column field="paymentDeadline" header="Termin płatności">
                  <template #body="{ data, field }">
                    <div class="color-orange" style="text-align: center">
                      {{ data[field] }}
                    </div>
                  </template>
                </Column>
                <Column field="installmentAmountToPay" header="Kwota">
                  <template #body="{ data, field }">
                    <span class="color-orange">
                      {{ UtilsService.formatCurrency(data[field]) }}
                    </span>
                  </template>
                </Column>
                <Column field="paymentDate" header="Data płatności">
                  <template #body="{ data, field }">
                    <div class="color-orange" style="text-align: center">
                      {{
                        data[field] === "-999999999-01-01" ? "" : data[field]
                      }}
                    </div>
                  </template>
                </Column>
                <Column field="installmentAmountPaid" header="Kwota zapł.">
                  <template #body="{ data, field }">
                    <div class="color-orange" style="text-align: center">
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

  <Toolbar class="sticky-toolbar">
    <template #start>
      <OfficeIconButton
        v-tooltip.right="{
          value: 'Odświerz listę opłat',
          showDelay: 500,
          hideDelay: 300,
        }"
        :icon="feeStore.loadingFees ? 'pi-spin pi-spinner' : 'pi-refresh'"
        class="mr-2"
        @click="feeStore.getFeesFromDb('ALL', true)"
      />
    </template>

    <template #center>
      <OfficeIconButton
        v-tooltip.left="{
          value: 'Wyświetl niespłacone',
          showDelay: 500,
          hideDelay: 300,
        }"
        :icon="feeStore.loadingFees ? 'pi-spin pi-spinner' : 'pi-stop'"
        class="mr-2"
        :active="filter === 'TO_PAY'"
        @click="setFilter('TO_PAY')"
      />
      <OfficeIconButton
        v-tooltip.top="{
          value: 'Wyświetl spłacone',
          showDelay: 500,
          hideDelay: 300,
        }"
        :icon="feeStore.loadingFees ? 'pi-spin pi-spinner' : 'pi-check-square'"
        class="mr-2"
        :active="filter === 'PAID'"
        @click="setFilter('PAID')"
      />
      <OfficeIconButton
        v-tooltip.right="{
          value: 'Wyświetl wszystkie',
          showDelay: 500,
          hideDelay: 300,
        }"
        :icon="feeStore.loadingFees ? 'pi-spin pi-spinner' : 'pi-list'"
        class="mr-2"
        :active="filter === 'ALL'"
        @click="setFilter('ALL')"
      />
    </template>
  </Toolbar>
</template>

<style scoped>
.p-datatable .p-datatable-tbody > tr > td {
  text-align: center !important;
}
</style>
