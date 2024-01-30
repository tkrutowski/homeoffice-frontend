<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { FilterMatchMode } from "primevue/api";
import router from "@/router";
import { UtilsService } from "@/service/UtilsService";

import { PaymentStatus } from "@/assets/types/PaymentStatus";
import OfficeButton from "@/components/OfficeButton.vue";
import EditButton from "@/components/EditButton.vue";
import DeleteButton from "@/components/DeleteButton.vue";
import StatusButton from "@/components/StatusButton.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import TheMenuFinance from "@/components/TheMenuFinance.vue";
import { Fee, FeeInstallment } from "@/assets/types/Fee";

import { useToast } from "primevue/usetoast";
import { useFeeStore } from "@/stores/fee";
import { usePaymentStore } from "@/stores/payments";
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
//---------------------------------------------MOUNTED-----------------------------------------------
onMounted(() => {
  feeStore.getFeesFromDb("ALL", true);
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

  <Panel class="mt-5">
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
      :value="feeStore.fees"
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

      <template #loading>
        <h4 class="color-green">Ładowanie danych. Proszę czekać...</h4>
      </template>

      <Column expander style="width: 5rem" />
      <Column field="name" header="Nazwa" sortable />
      <Column field="firm.name" header="Nazwa firmy" sortable />
      <Column field="date" header="Data" sortable />
      <Column field="amount" header="Kwota" style="min-width: 120px">
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(slotProps.data[slotProps.field]) }}
        </template>
      </Column>
      <Column
        field="feeFrequency.viewName"
        header="Częstotliwość opłat"
        sortable
      />
      <Column header="Data zakończenia" sortable>
        <template #body="slotProps">
          {{ calculateEndDate(slotProps.data.installmentList) }}
        </template>
      </Column>

      <Column field="feeStatus" header="Status" style="width: 100px">
        <template #body="{ data, field }">
          <StatusButton
            v-tooltip.top="{
              value: 'Zmień status opłaty (Spłacona/Do spłaty)',
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
            Szczególy opłaty {{ slotProps.data.name }}
          </h5>
          <hr />
          <div class="flex flex-row grid">
            <div class="flex flex-column col-12 col-xl-5">
              <p class="mb-1 mt-3">
                <small>Nazwa opłaty:</small> {{ slotProps.data.name }}
              </p>
              <p class="mb-1">
                <small>Nazwa firmy:</small> {{ slotProps.data.firm.name }}
              </p>
              <p class="mb-1">
                <small>Nr umowy:</small> {{ slotProps.data.feeNumber }}
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
                {{ calculateEndDate(slotProps.data.installmentList) }}
              </p>
              <p class="mb-5">
                <small>Nr konta:</small> {{ slotProps.data.accountNumber }}
              </p>

              <p class="mb-1">
                <small>Kwota opłaty:</small>
                {{ UtilsService.formatCurrency(slotProps.data.amount) }}
              </p>
              <p class="mb-1">
                <small>Częstotliwość opłat:</small>
                <span class="color-red ml-1">
                  {{ slotProps.data.feeFrequency.viewName }}
                </span>
              </p>
              <p class="mb-1">
                <small>Ilość opłat:</small>
                {{ slotProps.data.numberOfInstallments }}
              </p>
              <p class="mb-1">
                <small>Planowany koszt:</small>
                <span class="color-red ml-1">
                  {{
                    UtilsService.formatCurrency(
                      calculatePlannedCost(slotProps.data.installmentList)
                    )
                  }}
                </span>
              </p>
              <p class="mb-3">
                <small>Rzeczywisty koszt:</small>
                <span class="color-red ml-1">
                  {{
                    UtilsService.formatCurrency(
                      calculateActualCost(slotProps.data.installmentList)
                    )
                  }}
                </span>
              </p>

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
                <Column field="paymentDeadline" header="Termin płatności">
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
