<script setup lang="ts">
  import { FilterMatchMode } from '@primevue/core/api';
  import { computed, type DefineComponent, ref } from 'vue';
  import router from '@/router';
  import { UtilsService } from '@/service/UtilsService';
  import StatusButton from '@/components/StatusButton.vue';
  import type { Purchase } from '@/types/Purchase';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import TheMenuFinance from '@/components/finance/TheMenuFinance.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';

  import { useToast } from 'primevue/usetoast';
  import { usePurchasesStore } from '@/stores/purchases';

  import type { StatusType } from '@/types/StatusType';
  import type { DataTablePageEvent } from 'primevue/datatable';
  import type { AxiosError } from 'axios';
  import { PaymentStatus } from '@/types/Payment.ts';
  import { useCardsStore } from '@/stores/cards';
  import { useFirmsStore } from '@/stores/firms';
  import { useUsersStore } from '@/stores/users';

  const toast = useToast();
  const purchasesStore = usePurchasesStore();
  const cardsStore = useCardsStore();
  const firmsStore = useFirmsStore();
  const usersStore = useUsersStore();

  //filter
  const filters = ref();
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      idUser: { value: null, matchMode: FilterMatchMode.EQUALS },
      name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      idFirm: { value: null, matchMode: FilterMatchMode.EQUALS },
      idCard: { value: null, matchMode: FilterMatchMode.EQUALS },
      purchaseDate: {
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    };
  };
  initFilters();
  const clearFilter = () => {
    initFilters();
  };
  const firmFilter = computed(() => {
    return firmsStore.firms.sort((a, b) => a.name.localeCompare(b.name));
  });

  const userFilter = computed(() => {
    return usersStore.users.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`;
      const nameB = `${b.firstName} ${b.lastName}`;
      return nameA.localeCompare(nameB);
    });
  });

  const cardFilter = computed(() => {
    return cardsStore.cards.sort((a, b) => a.name.localeCompare(b.name));
  });

  const expandedRows = ref([]);
  const purchaseTemp = ref<Purchase | null>(null);

  //
  //--------------------------------DISPLAY FILTER
  //
  // Initialize filter from localStorage or default to 'ALL'
  const savedFilter = localStorage.getItem('selectedFilterPurchases') as StatusType | null;
  const filter = ref<StatusType>(savedFilter || 'ALL');

  // Apply saved filter to filters object on initialization
  if (savedFilter && (savedFilter === 'TO_PAY' || savedFilter === 'PAID')) {
    filters.value.paymentStatus = { value: savedFilter, matchMode: FilterMatchMode.EQUALS };
  }

  const setFilter = async (selectedFilter: StatusType) => {
    filter.value = selectedFilter;
    localStorage.setItem('selectedFilterPurchases', selectedFilter);

    // Add status filter to filters
    if (selectedFilter === 'TO_PAY' || selectedFilter === 'PAID') {
      filters.value.paymentStatus = { value: selectedFilter, matchMode: FilterMatchMode.EQUALS };
    } else {
      delete filters.value.paymentStatus;
    }

    await purchasesStore.filterPurchases(filters.value);
  };

  // Load initial data
  if (purchasesStore.purchases.length === 0 && !purchasesStore.loadingPurchases) {
    purchasesStore.filterPurchases(filters.value);
  }
  purchasesStore.getPurchasesSumToPayFromDb();
  cardsStore.getCardsFromDb('ALL');
  firmsStore.getFirmsFromDb();
  if (usersStore.users.length === 0) {
    usersStore.getUsersFromDb();
  }

  const getUserFullName = (idUser: number): string => {
    return usersStore.getUserFullName(idUser);
  };

  const getFirmName = (idFirm: number): string => {
    const firm = firmsStore.getFirm(idFirm);
    return firm?.name || '';
  };

  const getCardName = (idCard: number): string => {
    const card = cardsStore.getCard(idCard);
    return card?.name || '';
  };

  const dataTableRef = ref<DefineComponent | null>(null);
  const filteredPurchaseAmount = computed(() => {
    let sum = 0;
    purchasesStore.purchases.forEach((purchase: Purchase) => {
      if (purchase.paymentStatus === PaymentStatus.TO_PAY) {
        sum += Number(purchase.amount);
      }
    });
    return sum;
  });

  //
  //---------------------------------------------STATUS CHANGE--------------------------------------------------
  //
  const showStatusChangeConfirmationDialog = ref<boolean>(false);
  const confirmStatusChange = (purchase: Purchase) => {
    purchaseTemp.value = purchase;
    showStatusChangeConfirmationDialog.value = true;
  };
  const changeStatusConfirmationMessage = computed(() => {
    if (purchaseTemp.value)
      return `Czy chcesz zmienić status zakupu: <b>${purchaseTemp.value?.name}</b> na <b>${
        purchaseTemp.value?.paymentStatus === PaymentStatus.PAID ? 'Do spłaty' : 'Spłacony'
      }</b>?`;
    return 'No message';
  });
  const submitChangeStatus = async () => {
    console.log('submitChangeStatus()');
    if (purchaseTemp.value) {
      const newStatus: PaymentStatus =
        purchaseTemp.value.paymentStatus === PaymentStatus.PAID ? PaymentStatus.TO_PAY : PaymentStatus.PAID;
      await purchasesStore
        .updatePurchaseStatusDb(purchaseTemp.value.id, newStatus)
        .then(async () => {
          await purchasesStore.getPurchasesSumToPayFromDb();
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zmieniono status zakupu: ' + purchaseTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas zmiany statusu: ' + purchaseTemp.value?.name,
            life: 3000,
          });
        });
    }
    showStatusChangeConfirmationDialog.value = false;
  };

  //
  //-------------------------------------------------DELETE PURCHASE-------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const confirmDeletePurchase = (purchase: Purchase) => {
    purchaseTemp.value = purchase;
    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (purchaseTemp.value) return `Czy chcesz usunąc zakup: <b>${purchaseTemp.value?.name}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    if (purchaseTemp.value) {
      await purchasesStore
        .deletePurchaseDb(purchaseTemp.value.id)
        .then(async () => {
          await purchasesStore.getPurchasesSumToPayFromDb();
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto zakup: ' + purchaseTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas usuwania zakupu: ' + purchaseTemp.value?.name,
            life: 5000,
          });
        });
    }
    showDeleteConfirmationDialog.value = false;
  };

  //
  //-------------------------------------------------EDIT PURCHASE-------------------------------------------------
  //
  const editItem = (item: Purchase) => {
    const purchaseItem: Purchase = JSON.parse(JSON.stringify(item));
    console.log('EDIT: ', purchaseItem);
    router.push({
      name: 'Purchase',
      params: { isEdit: 'true', purchaseId: purchaseItem.id },
    });
  };

  const handlePageChange = async (event: DataTablePageEvent) => {
    console.log('handlePageChange()', event);
    await purchasesStore.loadPage(event.page, event.rows);
  };

  const handleSort = async (event: any) => {
    console.log('handleSort()', event);
    await purchasesStore.sortPurchases(event.sortField, event.sortOrder);
  };

  const handleFilter = async () => {
    console.log('handleFilter()', filters.value);
    await purchasesStore.filterPurchases(filters.value);
  };

  //
  //-------------SELECTED PURCHASES
  //
  const selectedPurchases = ref<Purchase[]>([]);
  const selectedPurchaseAmount = computed(() => {
    let sum = 0;
    selectedPurchases.value.forEach((purchase: Purchase) => {
      if (purchase.paymentStatus === PaymentStatus.TO_PAY) {
        sum += Number(purchase.amount);
      }
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
          await purchasesStore.filterPurchases(filters.value);
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
      :value="purchasesStore.purchases"
      v-model:selection="selectedPurchases"
      selectionMode="multiple"
      metaKeySelection
      removable-sort
      paginator
      lazy
      :sort-mode="'single'"
      :rows="purchasesStore.rowsPerPage"
      :total-records="purchasesStore.totalPurchases"
      :rows-per-page-options="[5, 10, 20, 50]"
      table-style="min-width: 50rem"
      filter-display="menu"
      :global-filter-fields="['name', 'firm.name', 'purchaseDate']"
      row-hover
      size="small"
      @page="handlePageChange"
      @sort="handleSort"
      @filter="handleFilter"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
      current-page-report-template="Od {first} do {last} (Wszystkich zakupów: {totalRecords})"
    >
      <template #header>
        <div class="flex justify-between">
          <router-link
            :to="{ name: 'Purchase', params: { isEdit: 'false', purchaseId: 0 } }"
            style="text-decoration: none"
          >
            <Button outlined label="Dodaj" icon="pi pi-plus" title="Dodaj nowy zakup" />
          </router-link>
          <div v-if="purchasesStore.loadingPurchases">
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
        <h4 class="text-red-500" v-if="!purchasesStore.loadingPurchases">Nie znaleziono zakupów...</h4>
      </template>

      <Column expander style="width: 5rem" />

      <!--  USER  -->
      <Column
        field="idUser"
        header="Użytkownik"
        :sortable="true"
        filter-field="idUser"
        :show-filter-match-modes="false"
        style="max-width: 150px"
      >
        <template #body="{ data }">
          {{ getUserFullName(data.idUser) }}
        </template>
        <template #filter="{ filterModel }">
          <Select v-model="filterModel.value" :options="userFilter" placeholder="Wybierz..." class="p-column-filter">
            <template #value="slotProps">
              <span v-if="slotProps.value">{{ slotProps.value.firstName }} {{ slotProps.value.lastName }}</span>
              <span v-else>{{ slotProps.placeholder }}</span>
            </template>
            <template #option="slotProps"> {{ slotProps.option.firstName }} {{ slotProps.option.lastName }} </template>
          </Select>
        </template>
      </Column>

      <!--  NAME  -->
      <Column field="name" header="Nazwa" sortable>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>

      <!--  FIRM-->
      <Column
        field="idFirm"
        header="Nazwa firmy"
        :sortable="true"
        filter-field="idFirm"
        :show-filter-match-modes="false"
      >
        <template #body="{ data }">
          {{ getFirmName(data.idFirm) }}
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

      <!--  CARD-->
      <Column field="idCard" header="Karta" :sortable="true" filter-field="idCard" :show-filter-match-modes="false">
        <template #body="{ data }">
          {{ getCardName(data.idCard) }}
        </template>
        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            :options="cardFilter"
            option-label="name"
            option-value="id"
            placeholder="Wybierz..."
            class="p-column-filter"
          />
        </template>
      </Column>

      <!--DATA ZAKUPU-->
      <Column
        field="purchaseDate"
        header="Data zakupu"
        :sortable="true"
        data-type="date"
        filter-field="purchaseDate"
        :show-filter-match-modes="true"
      >
        <template #body="{ data }">
          {{ UtilsService.formatDateToString(data.purchaseDate) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" date-format="yy-mm-dd" placeholder="yyyy-dd-mm" />
        </template>
      </Column>

      <!--TERMIN PŁATNOŚCI-->
      <Column field="paymentDeadline" header="Termin płatności" :sortable="true" data-type="date">
        <template #body="{ data }">
          {{ UtilsService.formatDateToString(data.paymentDeadline) }}
        </template>
      </Column>

      <!--AMOUNT-->
      <Column field="amount" header="Kwota" style="min-width: 120px">
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(slotProps.data[slotProps.field]) }}
        </template>
      </Column>

      <Column field="paymentStatus" header="Status" style="width: 100px">
        <template #body="{ data, field }">
          <StatusButton
            title="Zmień status zakupu"
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
            <OfficeIconButton title="Edytuj zakup" icon="pi pi-file-edit" @click="editItem(slotProps.data)" />
            <OfficeIconButton
              title="Usuń zakup"
              icon="pi pi-trash"
              severity="danger"
              @click="confirmDeletePurchase(slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-3 justify-center">
          <p class="mb-3 text-center text-xl font-bold">Szczególy zakupu {{ slotProps.data.name }}</p>
          <hr />
          <div class="flex flex-col md:flex-row gap-4">
            <div class="basis-1/2">
              <Fieldset legend="Ogólne informacje" class="">
                <p class="mb-1 mt-3 text-left">
                  <small>Użytkownik:</small> {{ getUserFullName(slotProps.data.idUser) }}
                </p>
                <p class="mb-1 text-left"><small>Nazwa zakupu:</small> {{ slotProps.data.name }}</p>
                <p class="text-left mb-1"><small>Nazwa firmy:</small> {{ getFirmName(slotProps.data.idFirm) }}</p>
                <p class="mb-1 text-left"><small>Karta:</small> {{ getCardName(slotProps.data.idCard) }}</p>
                <p class="mb-1 text-left">
                  <small>Data zakupu:</small>
                  {{ UtilsService.formatDateToString(slotProps.data.purchaseDate) }}
                </p>
                <p class="mb-1 text-left">
                  <small>Termin płatności:</small>
                  {{ UtilsService.formatDateToString(slotProps.data.paymentDeadline) }}
                </p>
                <p class="mb-5 text-left">
                  <small>Data płatności:</small>
                  {{ UtilsService.formatDateToString(slotProps.data.paymentDate) }}
                </p>

                <p class="mb-1 text-left">
                  <small>Kwota zakupu:</small>
                  {{ UtilsService.formatCurrency(slotProps.data.amount) }}
                </p>
                <p class="mb-1 text-left">
                  <small>Raty: </small>
                  <span :class="slotProps.data.installment ? 'text-green-500' : 'text-red-500'">
                    {{ slotProps.data.installment ? 'TAK' : 'NIE' }}
                  </span>
                </p>
              </Fieldset>
              <Fieldset legend="Dodatkowe informacje">
                <Textarea id="description" v-model="slotProps.data.otherInfo" fluid rows="5" cols="30" readonly />
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
        title="Odświerz listę zakupów"
        :icon="purchasesStore.loadingPurchases ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
        class="mr-2"
        @click="purchasesStore.refreshPurchases()"
      />
    </template>

    <template #center>
      <OfficeIconButton
        title="Wyświetl niespłacone"
        :icon="purchasesStore.loadingPurchases ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
        class="mr-2"
        :active="filter === 'TO_PAY'"
        @click="setFilter('TO_PAY')"
      />
      <OfficeIconButton
        title="Wyświetl spłacone"
        :icon="purchasesStore.loadingPurchases ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
        class="mr-2"
        :active="filter === 'PAID'"
        @click="setFilter('PAID')"
      />
      <OfficeIconButton
        title="Wyświetl wszystkie"
        :icon="purchasesStore.loadingPurchases ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
        class="mr-2"
        :active="filter === 'ALL'"
        @click="setFilter('ALL')"
      />
    </template>

    <template #end>
      <div class="flex flex-col gap-2">
        <p class="">
          <span class="">Przefiltrowane:</span>
          <span class="ml-3">{{ UtilsService.formatCurrency(filteredPurchaseAmount) }}</span>
        </p>
        <p class="">
          <span class="">Wybrane:</span>
          <span class="ml-3">{{ UtilsService.formatCurrency(selectedPurchaseAmount) }}</span>
        </p>
        <p class="">
          <span class="">DO SPŁATY RAZEM:</span>
          <span class="ml-3">{{ UtilsService.formatCurrency(purchasesStore.sumToPay) }}</span>
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
