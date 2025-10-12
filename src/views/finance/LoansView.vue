<script setup lang="ts">
  import { FilterMatchMode } from '@primevue/core/api';
  import { computed, type DefineComponent, ref } from 'vue';
  import router from '@/router';
  import { UtilsService } from '@/service/UtilsService';
  import StatusButton from '@/components/StatusButton.vue';
  import type { Loan, LoanInstallment } from '@/types/Loan';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';

  import { useToast } from 'primevue/usetoast';
  import { useLoansStore } from '@/stores/loans';
  import { usePaymentStore } from '@/stores/payments';
  import { useBanksStore } from '@/stores/banks';

  import type { StatusType } from '@/types/StatusType';
  import type { DataTablePageEvent } from 'primevue/datatable';
  import type { AxiosError } from 'axios';
  import { PaymentStatus } from '@/types/Payment.ts';

  const toast = useToast();
  const loansStore = useLoansStore();
  const paymentStore = usePaymentStore();
  const bankStore = useBanksStore();

  //filter
  const filters = ref();
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      idBank: { value: null, matchMode: FilterMatchMode.EQUALS },
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
    await loansStore.filterLoans(filters.value);
  };
  const bankFilter = computed(() => {
    return bankStore.banks.sort((a, b) => a.name.localeCompare(b.name));
  });

  const expandedRows = ref([]);
  const loanTemp = ref<Loan | null>(null);

  const calculateInstallmentToPayAmount = (installments: LoanInstallment[]): number => {
    return installments
      .filter(value => value.paymentStatus === PaymentStatus.TO_PAY)
      .map(value => value.installmentAmountToPay)
      .reduce((acc, currentValue) => acc + currentValue, 0);
  };
  const getCompletePaymentDate = (installments: LoanInstallment[]): Date | null => {
    return installments[installments.length - 1].paymentDeadline;
  };
  const calculatePlannedInterest = (loan: Loan): number => {
    return (loan.amount - loan.numberOfInstallments * loan.installmentAmount) * -1;
  };
  const calculateActualInterest = (loan: Loan): number => {
    return loan.installmentList
      .filter((installment: LoanInstallment) => installment.paymentStatus === PaymentStatus.PAID)
      .map((installment: LoanInstallment) => installment.installmentAmountPaid - installment.installmentAmountToPay)
      .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0);
  };
  const calculateTotalCost = (loan: Loan): number => {
    return (loan.amount - loan.loanCost - loan.numberOfInstallments * loan.installmentAmount) * -1;
  };
  const calculateInstallmentPaid = (loan: Loan): number => {
    return loan.installmentList.filter(
      (installment: LoanInstallment) => installment.paymentStatus === PaymentStatus.PAID
    ).length;
  };
  const calculateInstallmentToPayNumber = (installments: LoanInstallment[]): number => {
    return installments.filter((value: LoanInstallment) => value.paymentStatus === PaymentStatus.TO_PAY).length;
  };
  //
  //--------------------------------DISPLAY FILTER
  //
  // Initialize filter from localStorage or default to 'ALL'
  const savedFilter = localStorage.getItem('selectedFilterLoans') as StatusType | null;
  const filter = ref<StatusType>(savedFilter || 'ALL');

  // Apply saved filter to filters object on initialization
  if (savedFilter && (savedFilter === 'TO_PAY' || savedFilter === 'PAID')) {
    filters.value.loanStatus = { value: savedFilter, matchMode: FilterMatchMode.EQUALS };
  }

  const setFilter = async (selectedFilter: StatusType) => {
    filter.value = selectedFilter;
    localStorage.setItem('selectedFilterLoans', selectedFilter);

    // Add status filter to filters
    if (selectedFilter === 'TO_PAY' || selectedFilter === 'PAID') {
      filters.value.loanStatus = { value: selectedFilter, matchMode: FilterMatchMode.EQUALS };
    } else {
      delete filters.value.loanStatus;
    }

    await loansStore.filterLoans(filters.value);
  };

  // Load initial data
  if (loansStore.loans.length === 0 && !loansStore.loadingLoans) {
    loansStore.filterLoans(filters.value);
  }
  loansStore.getLoansSumToPayFromDb();
  bankStore.getBanksFromDb();
  const dataTableRef = ref<DefineComponent | null>(null);
  const filteredLoanAmount = computed(() => {
    let sum = 0;
    loansStore.loans.forEach((loan: Loan) => {
      if (loan.loanStatus === PaymentStatus.TO_PAY) {
        const installmentSum = loan.installmentList
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
  const confirmStatusChange = (loan: Loan) => {
    loanTemp.value = loan;
    showStatusChangeConfirmationDialog.value = true;
  };
  const changeStatusConfirmationMessage = computed(() => {
    console.log('temp', loanTemp.value);

    if (loanTemp.value)
      return `Czy chcesz zmienić status kredytu: <b>${loanTemp.value?.name}</b> na <b>${
        loanTemp.value?.loanStatus === PaymentStatus.PAID ? 'Do spłaty' : 'Spłacony'
      }</b>?`;
    return 'No message';
  });
  const submitChangeStatus = async () => {
    console.log('submitChangeStatus()');
    if (loanTemp.value) {
      const newStatus: PaymentStatus =
        loanTemp.value.loanStatus === PaymentStatus.PAID ? PaymentStatus.TO_PAY : PaymentStatus.PAID;
      await loansStore
        .updateLoanStatusDb(loanTemp.value.id, newStatus)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zmieniono status kredytu: ' + loanTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas zmiany statusu: ' + loanTemp.value?.name,
            life: 3000,
          });
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
    if (loanTemp.value) return `Czy chcesz usunąc kredyt: <b>${loanTemp.value?.name}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    if (loanTemp.value) {
      await loansStore
        .deleteLoanDb(loanTemp.value.id)
        .then(() => {
          //update payment
          if (loanTemp.value) {
            paymentStore.deletePayment(loanTemp.value, 'FEE');
          }
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto kredyt: ' + loanTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas usuwania kredytu: ' + loanTemp.value?.name,
            life: 5000,
          });
        });
    }
    showDeleteConfirmationDialog.value = false;
  };

  //
  //-------------------------------------------------EDIT LOAN-------------------------------------------------
  //
  const editItem = (item: Loan) => {
    const loanItem: Loan = JSON.parse(JSON.stringify(item));
    console.log('EDIT: ', loanItem);
    router.push({
      name: 'Loan',
      params: { isEdit: 'true', loanId: loanItem.id },
    });
  };

  const handlePageChange = async (event: DataTablePageEvent) => {
    console.log('handlePageChange()', event);
    loansStore.updateRowsPerPage(event.rows);
    await loansStore.getLoansFromDb(event.page, event.rows);
  };

  const handleSort = async (event: any) => {
    console.log('handleSort()', event);
    await loansStore.sortLoans(event.sortField, event.sortOrder);
  };

  const handleFilter = async () => {
    console.log('handleFilter()', filters.value);
    await loansStore.filterLoans(filters.value);
  };

  //
  //-------------SELECTED LOANS
  //
  const selectedLoans = ref<Loan[]>([]);
  const selectedLoanAmount = computed(() => {
    let sum = 0;
    selectedLoans.value.forEach((loan: { installmentList: LoanInstallment[] }) => {
      const installmentSum = loan.installmentList
        .filter(value => value.paymentStatus === PaymentStatus.TO_PAY)
        .map(value => value.installmentAmountToPay)
        .reduce((acc, currentValue) => acc + currentValue, 0);
      sum += installmentSum;
    });
    return sum;
  });

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
          await loansStore.filterLoans(filters.value);
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
      v-model:expanded-rows="expandedRows"
      v-model:filters="filters"
      :value="loansStore.loans"
      v-model:selection="selectedLoans"
      selectionMode="multiple"
      metaKeySelection
      removable-sort
      paginator
      lazy
      :sort-mode="'single'"
      :rows="loansStore.rowsPerPage"
      :total-records="loansStore.totalLoans"
      :rows-per-page-options="[5, 10, 20, 50]"
      table-style="min-width: 50rem"
      filter-display="menu"
      :global-filter-fields="['name', 'bank.name', 'date']"
      row-hover
      size="small"
      @page="handlePageChange"
      @sort="handleSort"
      @filter="handleFilter"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      current-page-report-template="Od {first} do {last} (Wszystkich kredytów: {totalRecords})"
    >
      <template #header>
        <div class="flex justify-between">
          <router-link :to="{ name: 'Loan', params: { isEdit: 'false', loanId: 0 } }" style="text-decoration: none">
            <Button outlined label="Dodaj" icon="pi pi-plus" title="Dodaj nowy kredyt" />
          </router-link>
          <div v-if="loansStore.loadingLoans">
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
        <h4 class="text-red-500" v-if="!loansStore.loadingLoans">Nie znaleziono kredytów...</h4>
      </template>

      <Column expander style="width: 5rem" />

      <!--  NAME  -->
      <Column field="name" header="Nazwa" sortable>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>

      <!--  BANK-->
      <Column
        field="bank.name"
        header="Nazwa banku"
        :sortable="true"
        filter-field="idBank"
        :show-filter-match-modes="false"
      >
        <template #body="{ data }">
          {{ data.bank.name }}
        </template>
        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            :options="bankFilter"
            option-label="name"
            option-value="id"
            placeholder="Wybierz..."
            class="p-column-filter"
          />
        </template>
      </Column>

      <!--DATA-->
      <Column field="date" header="Data" :sortable="true" data-type="date" :show-filter-match-modes="true">
        <template #body="{ data }">
          {{ UtilsService.formatDateToString(data.date) }}
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

      <!--NUMBER OF INSTALLMENTS-->
      <Column field="numberOfInstallments" header="Ilość rat" sortable />

      <!--INSTALLMENT AMOUNT-->
      <Column field="installmentAmount" header="Kwota raty" style="min-width: 120px">
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(slotProps.data[slotProps.field]) }}
        </template>
      </Column>

      <!--  REMAINS   -->
      <Column header="Pozostało" sortable style="min-width: 80px">
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(calculateInstallmentToPayAmount(slotProps.data.installmentList)) }}
          ({{ calculateInstallmentToPayNumber(slotProps.data.installmentList) }})
        </template>
      </Column>

      <Column field="loanStatus" header="Status" style="width: 100px">
        <template #body="{ data, field }">
          <StatusButton
            title="Zmień status kredytu"
            :btn-type="data[field]"
            :color-icon="data[field] === 'PAID' ? '#2da687' : '#dc3545'"
            @click="confirmStatusChange(data)"
          />
        </template>
      </Column>
      <!--                EDIT, DELETE-->
      <Column header="Akcja" :exportable="false" style="width: 8rem">
        <template #body="slotProps">
          <div class="flex flex-row gap-1 justify-start">
            <OfficeIconButton title="Edytuj kredyt" icon="pi pi-file-edit" @click="editItem(slotProps.data)" />
            <OfficeIconButton
              title="Usuń kredyt"
              icon="pi pi-trash"
              severity="danger"
              @click="confirmDeleteLoan(slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-3 justify-center">
          <p class="mb-3 text-center text-xl font-bold">Szczególy kredytu {{ slotProps.data.name }}</p>
          <hr />
          <div class="flex flex-col md:flex-row gap-4">
            <div class="basis-1/2">
              <Fieldset legend="Ogólne informacje" class="">
                <p class="mb-1 mt-3 text-left"><small>Nazwa kredytu:</small> {{ slotProps.data.name }}</p>
                <p class="text-left mb-1"><small>Nazwa banku:</small> {{ slotProps.data.bank.name }}</p>
                <p class="mb-1 text-left"><small>Nr kredytu:</small> {{ slotProps.data.loanNumber }}</p>
                <p class="mb-1 text-left"><small>Z dnia:</small> {{ slotProps.data.date }}</p>
                <p class="mb-1 text-left">
                  <small>Data pierwszej raty:</small>
                  {{ slotProps.data.firstPaymentDate }}
                </p>
                <p class="mb-1 text-left">
                  <small>Termin całkowitej spłaty:</small>
                  {{ getCompletePaymentDate(slotProps.data.installmentList) }}
                </p>
                <p class="mb-5 text-left"><small>Nr konta:</small> {{ slotProps.data.accountNumber }}</p>

                <p class="mb-1 text-left">
                  <small>Kwota kredytu:</small>
                  {{ UtilsService.formatCurrency(slotProps.data.amount) }}
                </p>
                <p class="mb-1 text-left">
                  <small>Koszt kredytu: </small>
                  <span class="text-red-500 ml-1"> {{ UtilsService.formatCurrency(slotProps.data.loanCost) }}</span>
                </p>
                <p class="mb-1 text-left">
                  <small>Ilość rat:</small>
                  {{ slotProps.data.numberOfInstallments }}
                </p>
                <p class="mb-1 text-left">
                  <small>Kwota raty:</small>
                  {{ UtilsService.formatCurrency(slotProps.data.installmentAmount) }}
                </p>
                <p class="mb-1 text-left">
                  <small>Odsetki planowane:</small>
                  <span class="text-red-500 ml-1">
                    {{ UtilsService.formatCurrency(calculatePlannedInterest(slotProps.data)) }}
                  </span>
                </p>
                <p class="mb-3 text-left">
                  <small>Odsetki rzeczywiste:</small>
                  <span class="text-red-500 ml-2">
                    {{ UtilsService.formatCurrency(calculateActualInterest(slotProps.data)) }}
                  </span>
                </p>

                <p class="mb-4 text-left">
                  <small>Całkowity koszt kredytu:</small>
                  <span class="text-red-500 ml-2">
                    {{ UtilsService.formatCurrency(calculateTotalCost(slotProps.data)) }}
                  </span>
                </p>

                <p class="mb-1 text-left">
                  <small class="mr-2">Spłacono:</small>
                  {{ calculateInstallmentPaid(slotProps.data) }}
                  z {{ slotProps.data.numberOfInstallments }}
                </p>

                <ProgressBar
                  :value="(calculateInstallmentPaid(slotProps.data) / slotProps.data.numberOfInstallments) * 100"
                >
                  {{
                    ((calculateInstallmentPaid(slotProps.data) / slotProps.data.numberOfInstallments) * 100).toFixed(0)
                  }}%
                </ProgressBar>
              </Fieldset>
              <Fieldset legend="Dodatkowe informacje">
                <Textarea id="description" v-model="slotProps.data.otherInfo" fluid rows="5" cols="30" />
              </Fieldset>
            </div>

            <div class="basis-1/2">
              <Fieldset legend="Szczegóły wpłat">
                <DataTable :value="slotProps.data.installmentList" size="small">
                  <Column header="Nr raty" field="installmentNumber" style="width: 100px">
                    <template #body="{ data, field }">
                      <div class="ml-2" style="text-align: left">
                        {{ data[field] }}
                      </div>
                    </template>
                  </Column>
                  <Column header=" Termin płatności" field="paymentDeadline">
                    <template #body="{ data, field }">
                      <div>
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
                      <div>
                        {{ data[field] }}
                      </div>
                    </template>
                  </Column>
                  <Column field="installmentAmountPaid" header="Kwota zapł.">
                    <template #body="{ data, field }">
                      <div>
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
        title="Odświerz listę kredytów"
        :icon="loansStore.loadingLoans ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
        class="mr-2"
        @click="loansStore.refreshLoans()"
      />
    </template>

    <template #center>
      <OfficeIconButton
        title="Wyświetl niespłacone"
        :icon="loansStore.loadingLoans ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
        class="mr-2"
        :active="filter === 'TO_PAY'"
        @click="setFilter('TO_PAY')"
      />
      <OfficeIconButton
        title="Wyświetl spłacone"
        :icon="loansStore.loadingLoans ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
        class="mr-2"
        :active="filter === 'PAID'"
        @click="setFilter('PAID')"
      />
      <OfficeIconButton
        title="Wyświetl wszystkie"
        :icon="loansStore.loadingLoans ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
        class="mr-2"
        :active="filter === 'ALL'"
        @click="setFilter('ALL')"
      />
    </template>

    <template #end>
      <div class="flex flex-col gap-2">
        <p class="">
          <span class="">Przefiltrowane:</span>
          <span class="ml-3">{{ UtilsService.formatCurrency(filteredLoanAmount) }}</span>
        </p>
        <p class="">
          <span class="">Wybrane:</span>
          <span class="ml-3">{{ UtilsService.formatCurrency(selectedLoanAmount) }}</span>
        </p>
        <p class="">
          <span class="">DO SPŁATY RAZEM:</span>
          <span class="ml-3">{{ UtilsService.formatCurrency(loansStore.loansSumToPay) }}</span>
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
