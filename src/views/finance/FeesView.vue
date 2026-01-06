<script setup lang="ts">
  import { computed, type DefineComponent, ref } from 'vue';
  import { FilterMatchMode } from '@primevue/core/api';
  import router from '@/router';
  import { UtilsService } from '@/service/UtilsService';

  import { PaymentStatus } from '@/types/Payment';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import StatusButton from '@/components/StatusButton.vue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import type { Fee, FeeInstallment } from '@/types/Fee';

  import { useToast } from 'primevue/usetoast';
  import { useFeeStore } from '@/stores/fee';
  import { usePaymentStore } from '@/stores/payments';
  import { useFirmsStore } from '@/stores/firms';
  import type { StatusType } from '@/types/StatusType';
  import moment from 'moment';
  import type { AxiosError } from 'axios';
  import type { DataTablePageEvent } from 'primevue/datatable';

  const toast = useToast();
  const feeStore = useFeeStore();
  const paymentStore = usePaymentStore();
  const firmsStore = useFirmsStore();

  //filter
  const filters = ref();
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      idFirm: { value: null, matchMode: FilterMatchMode.EQUALS },
      date: {
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_AFTER }],
      },
      amount: {
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
    };
  };
  initFilters();
  const clearFilter = async () => {
    initFilters();
    await feeStore.filterFees(filters.value);
  };
  const firmFilter = computed(() => {
    return firmsStore.firms.sort((a, b) => a.name.localeCompare(b.name));
  });
  const formatDate = (value: Date) => {
    return moment(value).format('YYYY-MM-DD');
  };

  const expandedRows = ref([]);
  const feeTemp = ref<Fee | null>(null);
  const calculatePlannedCost = (installments: FeeInstallment[]): number => {
    return installments
      .map(installment => installment.installmentAmountToPay)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  };
  const calculateActualCost = (installments: FeeInstallment[]): number => {
    return installments
      .map(installment => installment.installmentAmountPaid)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  };
  const calculateEndDate = (installments: FeeInstallment[]): Date | null => {
    return installments[installments.length - 1].paymentDeadline;
  };
  //
  //--------------------------------DISPLAY FILTER
  //
  // Initialize filter from localStorage or default to 'ALL'
  const savedFilter = localStorage.getItem('selectedFilterFees') as StatusType | null;
  const filter = ref<StatusType>(savedFilter || 'ALL');

  // Apply saved filter to filters object on initialization
  if (savedFilter && (savedFilter === 'TO_PAY' || savedFilter === 'PAID')) {
    filters.value.feeStatus = { value: savedFilter, matchMode: FilterMatchMode.EQUALS };
  }

  const setFilter = async (selectedFilter: StatusType) => {
    filter.value = selectedFilter;
    localStorage.setItem('selectedFilterFees', selectedFilter);

    // Add status filter to filters
    if (selectedFilter === 'TO_PAY' || selectedFilter === 'PAID') {
      filters.value.feeStatus = { value: selectedFilter, matchMode: FilterMatchMode.EQUALS };
    } else {
      delete filters.value.feeStatus;
    }

    await feeStore.filterFees(filters.value);
  };

  // Load initial data
  if (feeStore.fees.length === 0 && !feeStore.loadingFees) {
    feeStore.filterFees(filters.value);
  }
  feeStore.getFeesSumToPayFromDb();
  firmsStore.getFirmsFromDb();

  //
  //-------------SELECTED FEES
  //
  const selectedFees = ref<Fee[]>([]);
  const selectedFeesAmount = computed(() => {
    let sum = 0;
    selectedFees.value.forEach((fee: { installmentList: FeeInstallment[] }) => {
      const installmentSum = fee.installmentList
        .filter(value => value.paymentStatus === PaymentStatus.TO_PAY)
        .map(value => value.installmentAmountToPay)
        .reduce((acc, currentValue) => acc + currentValue, 0);
      sum += installmentSum;
    });
    return sum;
  });

  const dataTableRef = ref<DefineComponent | null>(null);
  const filteredFeeAmount = computed(() => {
    let sum = 0;
    feeStore.fees.forEach((fee: Fee) => {
      if (fee.feeStatus === PaymentStatus.TO_PAY) {
        const installmentSum = fee.installmentList
          .filter(value => value.paymentStatus === PaymentStatus.TO_PAY)
          .map(value => value.installmentAmountToPay)
          .reduce((acc, currentValue) => acc + currentValue, 0);
        sum += installmentSum;
      }
    });
    return sum;
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
      return `Czy chcesz zmienić status opłaty: <b>${feeTemp.value?.name}</b> na <b>${
        feeTemp.value?.feeStatus === PaymentStatus.PAID ? 'Do spłaty' : 'Spłacony'
      }</b>?`;
    return 'No message';
  });
  const submitChangeStatus = async () => {
    console.log('submitChangeStatus()');
    if (feeTemp.value) {
      const newStatus: PaymentStatus =
        feeTemp.value.feeStatus === PaymentStatus.PAID ? PaymentStatus.TO_PAY : PaymentStatus.PAID;
      await feeStore
        .updateFeeStatusDb(feeTemp.value.id, newStatus)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zmieniono status opłaty: ' + feeTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas zmiany statusu opłaty: ' + feeTemp.value?.name,
            life: 3000,
          });
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
    if (feeTemp.value) return `Czy chcesz usunąc opłatę: <b>${feeTemp.value?.name}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    showDeleteConfirmationDialog.value = false;
    if (feeTemp.value) {
      await feeStore
        .deleteFeeDb(feeTemp.value.id)
        .then(() => {
          //update payment
          if (feeTemp.value) {
            paymentStore.deletePayment(feeTemp.value, 'FEE');
          }
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto opłatę: ' + feeTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas usuwania opłaty: ' + feeTemp.value?.name,
            life: 3000,
          });
        });
    }
  };

  //
  //-------------------------------------------------EDIT FEE-------------------------------------------------
  //
  const editItem = (item: Fee) => {
    const feeItem: Fee = JSON.parse(JSON.stringify(item));
    router.push({
      name: 'Fee',
      params: { isEdit: 'true', feeId: feeItem.id },
    });
  };

  //
  //-------------------------------------------------COPY FEE-------------------------------------------------
  //
  const copyItem = (item: Fee) => {
    router.push({
      name: 'Fee',
      params: { isEdit: 'false', feeId: 0 },
      query: { copyFromId: item.id.toString() },
    });
  };

  const handlePageChange = async (event: DataTablePageEvent) => {
    console.log('handlePageChange()', event);
    feeStore.updateRowsPerPage(event.rows);
    await feeStore.getFeesFromDb(event.page, event.rows);
  };

  const handleSort = async (event: any) => {
    console.log('handleSort()', event);
    await feeStore.sortFees(event.sortField, event.sortOrder);
  };

  const handleFilter = async () => {
    console.log('handleFilter()', filters.value);
    await feeStore.filterFees(filters.value);
  };

  // Obsługa wyszukiwania globalnego z debounce
  import { watch } from 'vue';
  let searchTimeout: NodeJS.Timeout | null = null;

  watch(
    () => filters.value.global.value,
    newValue => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Search when value has more than 3 letters or is empty
      if (!newValue || newValue.length >= 3) {
        searchTimeout = setTimeout(async () => {
          console.log('Global search:', newValue);
          await feeStore.filterFees(filters.value);
        }, 500); // 500ms debounce
      }
    }
  );
</script>
<template>
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

  <Panel class="my-3 mx-2">
    <DataTable
      ref="dataTableRef"
      v-model:expandedRows="expandedRows"
      v-model:filters="filters"
      :value="feeStore.fees"
      v-model:selection="selectedFees"
      selectionMode="multiple"
      metaKeySelection
      removable-sort
      paginator
      lazy
      :sort-mode="'single'"
      :rows="feeStore.rowsPerPage"
      :total-records="feeStore.totalFees"
      :rows-per-page-options="[5, 10, 20, 50]"
      table-style="min-width: 50rem"
      filter-display="menu"
      :global-filter-fields="['name', 'firm.name', 'date']"
      row-hover
      size="small"
      @page="handlePageChange"
      @sort="handleSort"
      @filter="handleFilter"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      current-page-report-template="Od {first} do {last} (Wszystkich opłat: {totalRecords})"
    >
      <template #header>
        <div class="flex justify-between">
          <router-link :to="{ name: 'Fee', params: { isEdit: 'false', feeId: 0 } }" style="text-decoration: none">
            <Button outlined label="Dodaj" icon="pi pi-plus" title="Dodaj nową opłatę" />
          </router-link>
          <div v-if="feeStore.loadingFees">
            <ProgressSpinner class="ml-3" style="width: 35px; height: 35px" stroke-width="5" />
          </div>
          <div class="flex gap-4">
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText class="!max-w-32" v-model="filters['global'].value" placeholder="wyszukaj..." />
            </IconField>
            <Button
              type="button"
              icon="pi pi-filter-slash"
              outlined
              size="small"
              title="Wyczyść filtry"
              @click="clearFilter()"
            />
          </div>
        </div>
      </template>

      <template #empty>
        <h4 class="text-red-500" v-if="!feeStore.loadingFees">Nie znaleziono opłat...</h4>
      </template>

      <Column expander style="width: 5rem" />

      <!--   NAME   -->
      <Column field="name" header="Nazwa" sortable>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>

      <!--   FIRM   -->
      <Column
        field="firm.name"
        header="Nazwa firmy"
        :sortable="true"
        filter-field="idFirm"
        :show-filter-match-modes="false"
      >
        <template #body="{ data }">
          {{ data.firm.name }}
        </template>
        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            :options="firmFilter"
            option-label="name"
            option-value="id"
            placeholder="Wybierz..."
            class="p-column-filter"
          />
        </template>
      </Column>

      <!--DATA-->
      <Column
        field="date"
        header="Data"
        :sortable="true"
        data-type="date"
        filter-field="date"
        :show-filter-match-modes="true"
      >
        <template #body="{ data }">
          {{ formatDate(data.date) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" date-format="yy-mm-dd" placeholder="yyyy-dd-mm" />
        </template>
      </Column>

      <!--AMOUNT-->
      <Column
        field="amount"
        header="Kwota"
        style="min-width: 120px"
        data-type="numeric"
        filter-field="amount"
        :show-filter-match-modes="true"
        :show-filter-operator="true"
      >
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(slotProps.data[slotProps.field]) }}
        </template>
        <template #filter="{ filterModel }">
          <InputNumber v-model="filterModel.value" mode="currency" currency="PLN" locale="pl-PL" />
        </template>
      </Column>

      <!--   FEE FREQUENCY   -->
      <Column field="feeFrequency.viewName" header="Częstotliwość opłat" sortable />
      <Column header="Data zakończenia" sortable>
        <template #body="slotProps">
          {{ calculateEndDate(slotProps.data.installmentList) }}
        </template>
      </Column>

      <Column field="feeStatus" header="Status" style="width: 100px">
        <template #body="{ data, field }">
          <StatusButton
            title="Zmień status opłaty"
            :btn-type="data[field]"
            :color-icon="data[field] === 'PAID' ? '#2da687' : '#dc3545'"
            @click="confirmStatusChange(data)"
          />
        </template>
      </Column>
      <!--                EDIT, COPY, DELETE-->
      <Column header="Akcja" :exportable="false" style="min-width: 10rem">
        <template #body="slotProps">
          <div class="flex flex-row gap-1 justify-content-end">
            <OfficeIconButton class="text-orange-500" title="Edytuj opłatę" icon="pi pi-file-edit" @click="editItem(slotProps.data)" />
            <OfficeIconButton class="text-orange-500" title="Kopiuj opłatę" icon="pi pi-copy" @click="copyItem(slotProps.data)" />
            <OfficeIconButton
              class="text-red-500"
              title="Usuń opłatę"
              icon="pi pi-trash"
              @click="confirmDeleteLoan(slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-3">
          <p class="mb-3 text-center text-xl font-bold">>Szczególy opłaty {{ slotProps.data.name }}</p>
          <hr />
          <div class="flex flex-col md:flex-row gap-4">
            <div class="basis-1/2">
              <Fieldset legend="Ogólne informacje" class="">
                <p class="mb-1 mt-3 text-left"><small>Nazwa opłaty:</small> {{ slotProps.data.name }}</p>
                <p class="mb-1 text-left"><small>Nazwa firmy:</small> {{ slotProps.data.firm.name }}</p>
                <p class="mb-1 text-left"><small>Nr umowy:</small> {{ slotProps.data.feeNumber }}</p>
                <p class="mb-1 text-left"><small>Z dnia:</small> {{ slotProps.data.date }}</p>
                <p class="mb-1 text-left">
                  <small>Data pierwszej raty:</small>
                  {{ slotProps.data.firstPaymentDate }}
                </p>
                <p class="mb-1 text-left">
                  <small>Termin całkowitej spłaty:</small>
                  {{ calculateEndDate(slotProps.data.installmentList) }}
                </p>
                <p class="mb-5 text-left"><small>Nr konta:</small> {{ slotProps.data.accountNumber }}</p>

                <p class="mb-1 text-left">
                  <small>Kwota opłaty:</small>
                  {{ UtilsService.formatCurrency(slotProps.data.amount) }}
                </p>
                <p class="mb-1 text-left">
                  <small>Częstotliwość opłat:</small>
                  <span class="text-red-500 ml-1">
                    {{ slotProps.data.feeFrequency.viewName }}
                  </span>
                </p>
                <p class="mb-1 text-left">
                  <small>Ilość opłat:</small>
                  {{ slotProps.data.numberOfInstallments }}
                </p>
                <p class="mb-1 text-left">
                  <small>Planowany koszt:</small>
                  <span class="text-red-500 ml-1">
                    {{ UtilsService.formatCurrency(calculatePlannedCost(slotProps.data.installmentList)) }}
                  </span>
                </p>
                <p class="mb-3 text-left">
                  <small>Rzeczywisty koszt:</small>
                  <span class="text-red-500 ml-1">
                    {{ UtilsService.formatCurrency(calculateActualCost(slotProps.data.installmentList)) }}
                  </span>
                </p>
              </Fieldset>
              <Fieldset legend="Dodatkowe informacje">
                <Textarea id="description" v-model="slotProps.data.otherInfo" fluid rows="5" cols="30" />
              </Fieldset>
            </div>

            <div class="basis-1/2">
              <Fieldset legend="Szczegóły wpłat">
                <DataTable :value="slotProps.data.installmentList" size="small">
                  <Column field="paymentDeadline" header="Termin płatności">
                    <template #body="{ data, field }">
                      <div class="" style="text-align: center">
                        {{ data[field] }}
                      </div>
                    </template>
                  </Column>
                  <Column field="installmentAmountToPay" header="Kwota">
                    <template #body="{ data, field }">
                      <span class="">
                        {{ UtilsService.formatCurrency(data[field]) }}
                      </span>
                    </template>
                  </Column>
                  <Column field="paymentDate" header="Data płatności">
                    <template #body="{ data, field }">
                      <div class="" style="text-align: center">
                        {{ data[field] }}
                      </div>
                    </template>
                  </Column>
                  <Column field="installmentAmountPaid" header="Kwota zapł.">
                    <template #body="{ data, field }">
                      <div class="" style="text-align: center">
                        {{ UtilsService.formatCurrency(data[field]) }}
                      </div>
                    </template>
                  </Column>
                </DataTable>
              </Fieldset>
            </div>
          </div>
        </div>
      </template>
    </DataTable>
  </Panel>

  <Toolbar class="sticky-toolbar mx-2">
    <template #start>
      <OfficeIconButton
        title="Odświerz listę opłat"
        :icon="feeStore.loadingFees ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
        class="mr-2"
        @click="feeStore.refreshFees()"
      />
    </template>

    <template #center>
      <OfficeIconButton
        title="Wyświetl niespłacone"
        :icon="feeStore.loadingFees ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
        class="mr-2"
        :active="filter === 'TO_PAY'"
        @click="setFilter('TO_PAY')"
      />
      <OfficeIconButton
        title="Wyświetl spłacone"
        :icon="feeStore.loadingFees ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
        class="mr-2"
        :active="filter === 'PAID'"
        @click="setFilter('PAID')"
      />
      <OfficeIconButton
        title="Wyświetl wszystkie"
        :icon="feeStore.loadingFees ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
        class="mr-2"
        :active="filter === 'ALL'"
        @click="setFilter('ALL')"
      />
    </template>

    <template #end>
      <div class="flex flex-col gap-2">
        <p class="">
          <span class="">Przefiltrowane:</span>
          <span class="ml-3">{{ UtilsService.formatCurrency(filteredFeeAmount) }}</span>
        </p>
        <p class="">
          <span class="">Wybrane:</span>
          <span class="ml-3">{{ UtilsService.formatCurrency(selectedFeesAmount) }}</span>
        </p>
        <p class="">
          <span class="">DO SPŁATY RAZEM:</span>
          <span class="ml-3">{{ UtilsService.formatCurrency(feeStore.feesSumToPay) }}</span>
        </p>
      </div>
    </template>
  </Toolbar>
</template>

<style scoped>
  .p-datatable .p-datatable-tbody > tr > td {
    text-align: center !important;
  }
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
</style>
