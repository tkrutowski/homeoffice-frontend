<script setup lang="ts">
  import { FilterMatchMode } from '@primevue/core/api';
  import { computed, ref, watch } from 'vue';
  import router from '@/router';
  import { UtilsService } from '@/service/UtilsService';
  import StatusButton from '@/components/StatusButton.vue';
  import type { Loan, LoanInstallment } from '@/features/finance/loans/types';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import TheMenuFinance from '@/features/finance/_shared/TheMenuFinance.vue';
  import MainPageShell from '@/components/layout/MainPageShell.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';

  import { useToast } from 'primevue/usetoast';
  import { useLoansPageQuery } from '@/features/finance/loans/queries/useLoansQueries';
  import {
    useDeleteLoanMutation,
    useUpdateLoanStatusMutation,
  } from '@/features/finance/loans/queries/useLoansMutations';
  import { useBanksListQuery } from '@/features/finance/banks/queries/useBanksQueries';
  import type { LoanPageParams } from '@/features/finance/_shared/queryKeys';

  import type { StatusType } from '@/types/StatusType';
  import type { DataTablePageEvent } from 'primevue/datatable';
  import type { AxiosError } from 'axios';
  import { PaymentStatus } from '@/features/finance/payments/types';

  const toast = useToast();
  const banksQuery = useBanksListQuery();
  const deleteLoanMutation = useDeleteLoanMutation();
  const updateLoanStatusMutation = useUpdateLoanStatusMutation();

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
  const clearFilter = () => {
    initFilters();
    currentPage.value = 0;
  };
  const bankFilter = computed(() => {
    return [...(banksQuery.data.value ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  });

  //
  //-----------------------------------------------PAGE PARAMS (query)---------------------------------------------
  //
  const rowsPerPage = ref<number>(parseInt(localStorage.getItem('rowsPerPageLoans') || '20', 10));
  const currentPage = ref<number>(0);
  const sortField = ref<string>('date');
  const sortOrder = ref<number>(-1); // 1 = ASC, -1 = DESC

  const dateComparisonTypeFromMatchMode = (matchMode: string): string => {
    if (matchMode === 'dateBefore') return 'BEFORE';
    if (matchMode === 'dateAfter') return 'AFTER';
    return 'EQUALS';
  };
  const amountComparisonTypeFromMatchMode = (matchMode: string): string => {
    if (matchMode === 'lt') return 'LESS_THAN';
    if (matchMode === 'lte') return 'LESS_THAN_OR_EQUAL';
    if (matchMode === 'gt') return 'GREATER_THAN';
    if (matchMode === 'gte') return 'GREATER_THAN_OR_EQUAL';
    return 'EQUALS';
  };

  const loanPageParams = computed<LoanPageParams>(() => {
    const params: LoanPageParams = {
      page: currentPage.value,
      size: rowsPerPage.value,
      sort: sortField.value,
      direction: sortOrder.value > 0 ? 'ASC' : 'DESC',
    };
    const f = filters.value;
    if (f?.global?.value) params.globalFilter = f.global.value;
    if (f?.name?.value) params.name = f.name.value;
    if (f?.idBank?.value) params.idBank = f.idBank.value;
    const dateConstraint = f?.date?.constraints?.[0];
    if (dateConstraint?.value) {
      const date = new Date(dateConstraint.value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      params.date = `${year}-${month}-${day}`;
      params.dateComparisonType = dateComparisonTypeFromMatchMode(dateConstraint.matchMode);
    }
    const amountConstraint = f?.amount?.constraints?.[0];
    if (amountConstraint?.value) {
      params.amount = amountConstraint.value;
      params.amountComparisonType = amountComparisonTypeFromMatchMode(amountConstraint.matchMode);
    }
    if (f?.loanStatus?.value) params.status = f.loanStatus.value;
    return params;
  });

  const loansQuery = useLoansPageQuery(loanPageParams);
  const loans = computed(() => loansQuery.data.value?.content ?? []);
  const totalLoans = computed(() => loansQuery.data.value?.totalElements ?? 0);
  const loadingLoans = computed(() => loansQuery.isFetching.value);
  const loansSumToPay = computed(() => {
    const toPayLoans = loans.value.filter((loan: Loan) => loan.loanStatus === PaymentStatus.TO_PAY);
    let sum = 0;
    toPayLoans.forEach((loan: Loan) => {
      sum += loan.installmentList
        .filter((value: LoanInstallment) => value.paymentStatus === PaymentStatus.TO_PAY)
        .map((value: LoanInstallment) => value.installmentAmountToPay)
        .reduce((acc: number, currentValue: number) => acc + currentValue, 0);
    });
    return sum;
  });

  const expandedRows = ref([]);
  const loanTemp = ref<Loan | null>(null);

  const calculateInstallmentToPayAmount = (installments: LoanInstallment[]): number => {
    return installments
      .filter(value => value.paymentStatus === PaymentStatus.TO_PAY)
      .map(value => value.installmentAmountToPay)
      .reduce((acc, currentValue) => acc + currentValue, 0);
  };
  const getCompletePaymentDate = (installments: LoanInstallment[]): string => {
    if (installments.length === 0) return '';
    const deadline = installments[installments.length - 1].paymentDeadline;
    return UtilsService.formatDateToString(deadline || undefined);
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

  const setFilter = (selectedFilter: StatusType) => {
    filter.value = selectedFilter;
    localStorage.setItem('selectedFilterLoans', selectedFilter);

    // Add status filter to filters
    if (selectedFilter === 'TO_PAY' || selectedFilter === 'PAID') {
      filters.value.loanStatus = { value: selectedFilter, matchMode: FilterMatchMode.EQUALS };
    } else {
      delete filters.value.loanStatus;
    }
    currentPage.value = 0;
  };

  const filteredLoanAmount = computed(() => {
    let sum = 0;
    loans.value.forEach((loan: Loan) => {
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
      await updateLoanStatusMutation
        .mutateAsync({ loanId: loanTemp.value.id, status: newStatus })
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
      await deleteLoanMutation
        .mutateAsync(loanTemp.value.id)
        .then(() => {
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

  const handlePageChange = (event: DataTablePageEvent) => {
    console.log('handlePageChange()', event);
    rowsPerPage.value = event.rows;
    localStorage.setItem('rowsPerPageLoans', event.rows.toString());
    currentPage.value = event.page;
  };

  const handleSort = (event: any) => {
    console.log('handleSort()', event);
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    currentPage.value = 0;
  };

  const handleFilter = () => {
    console.log('handleFilter()', filters.value);
    currentPage.value = 0;
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
  let searchTimeout: NodeJS.Timeout | null = null;

  watch(
    () => filters.value.global.value,
    newValue => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Search when value has more than 3 letters or is empty
      if (!newValue || newValue.length >= 3) {
        searchTimeout = setTimeout(() => {
          console.log('Global search:', newValue);
          currentPage.value = 0;
        }, 500); // 500ms debounce
      }
    }
  );
</script>
<template>
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

  <MainPageShell>
    <template #top>
      <TheMenuFinance />
    </template>

    <Panel class="my-3 mx-2">
      <DataTable
        ref="dataTableRef"
        v-model:expanded-rows="expandedRows"
        v-model:filters="filters"
        :value="loans"
        v-model:selection="selectedLoans"
        selectionMode="multiple"
        metaKeySelection
        removable-sort
        paginator
        lazy
        :sort-mode="'single'"
        :rows="rowsPerPage"
        :total-records="totalLoans"
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
          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex flex-wrap items-center gap-2">
                <OfficeIconButton
                  class="text-amber-500"
                  title="Dodaj nowy kredyt"
                  icon="pi pi-plus"
                  @click="router.push({ name: 'Loan', params: { isEdit: 'false', loanId: 0 } })"
                />
                <div
                  class="h-9 w-px shrink-0 bg-surface-300 dark:bg-surface-600"
                  role="presentation"
                  aria-hidden="true"
                />
                <div class="flex flex-wrap items-center gap-2">
                  <OfficeIconButton
                    title="Wyświetl niespłacone"
                    :icon="loadingLoans ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
                    class="text-red-500"
                    :active="filter === 'TO_PAY'"
                    @click="setFilter('TO_PAY')"
                  />
                  <OfficeIconButton
                    title="Wyświetl spłacone"
                    :icon="loadingLoans ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
                    class="text-green-500"
                    :active="filter === 'PAID'"
                    @click="setFilter('PAID')"
                  />
                  <OfficeIconButton
                    title="Wyświetl wszystkie"
                    :icon="loadingLoans ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
                    class="text-orange-500"
                    :active="filter === 'ALL'"
                    @click="setFilter('ALL')"
                  />
                  <div
                    class="h-9 w-px shrink-0 bg-surface-300 dark:bg-surface-600"
                    role="presentation"
                    aria-hidden="true"
                  />
                  <OfficeIconButton
                    title="Odświerz listę kredytów"
                    class="text-orange-500"
                    :icon="loadingLoans ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
                    @click="loansQuery.refetch()"
                  />
                </div>
              </div>
              <div class="flex justify-end flex-wrap gap-4">
                <div v-if="loadingLoans" class="flex items-center">
                  <ProgressSpinner class="shrink-0" style="width: 35px; height: 35px" stroke-width="5" />
                </div>
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
            <div
              class="flex flex-col gap-1 border-t border-surface-200 pt-3 text-sm dark:border-surface-700 md:flex-row md:flex-wrap md:items-baseline md:justify-end md:gap-x-6 md:gap-y-1"
            >
              <p>
                <span>Przefiltrowane:</span>
                <span class="ml-2 font-medium tabular-nums">{{ UtilsService.formatCurrency(filteredLoanAmount) }}</span>
              </p>
              <p>
                <span>Wybrane:</span>
                <span class="ml-2 font-medium tabular-nums">{{ UtilsService.formatCurrency(selectedLoanAmount) }}</span>
              </p>
              <p>
                <span>DO SPŁATY RAZEM:</span>
                <span class="ml-2 font-medium tabular-nums">{{ UtilsService.formatCurrency(loansSumToPay) }}</span>
              </p>
            </div>
          </div>
        </template>

        <template #empty>
          <h4 class="text-red-500" v-if="!loadingLoans">Nie znaleziono kredytów...</h4>
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
              <OfficeIconButton
                class="text-orange-500"
                title="Edytuj kredyt"
                icon="pi pi-file-edit"
                @click="editItem(slotProps.data)"
              />
              <OfficeIconButton
                title="Usuń kredyt"
                icon="pi pi-trash"
                class="text-red-500"
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
                  <p class="mb-1 text-left">
                    <small>Z dnia:</small> {{ UtilsService.formatDateToString(slotProps.data.date) }}
                  </p>
                  <p class="mb-1 text-left">
                    <small>Data pierwszej raty:</small>
                    {{ UtilsService.formatDateToString(slotProps.data.firstPaymentDate) }}
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
                      ((calculateInstallmentPaid(slotProps.data) / slotProps.data.numberOfInstallments) * 100).toFixed(
                        0
                      )
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
                          {{ UtilsService.formatDateToString(data[field]) }}
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
                          {{ UtilsService.formatDateToString(data[field]) }}
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
  </MainPageShell>
</template>

<style scoped>
  .p-datatable .p-datatable-tbody > tr > td {
    text-align: center !important;
  }
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
</style>
