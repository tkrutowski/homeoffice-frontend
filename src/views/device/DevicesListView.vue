<script setup lang="ts">
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { computed, type DefineComponent, onMounted, ref } from 'vue';
  import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
  import router from '@/router';
  import { useToast } from 'primevue/usetoast';
  import { useDevicesStore } from '@/stores/devices';
  import { UtilsService } from '@/service/UtilsService';
  import type { Device } from '@/types/Devices';
  import TheMenuDevice from '@/components/device/TheMenuDevice.vue';
  import type { ActiveStatus } from '@/types/Bank';
  import StatusButton from '@/components/StatusButton.vue';
  import type { AxiosError } from 'axios';
  import type { DataTablePageEvent } from 'primevue/datatable';

  const deviceStore = useDevicesStore();
  const toast = useToast();

  onMounted(() => {
    if (deviceStore.devices.length <= 1) {
      deviceStore.refreshDevices();
    }
  });
  //filter
  const filters = ref();
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      deviceType: { value: null, matchMode: FilterMatchMode.CONTAINS },
      'firm.name': { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      purchaseDate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      purchaseAmount: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      sellDate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      sellAmount: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      warrantyEndDate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      insuranceEndDate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    };
  };
  initFilters();
  const clearFilter = () => {
    initFilters();
  };

  const deviceTypeFilter = computed(() => {
    return [
      ...new Set(
        deviceStore.devices.filter((dev: Device) => dev.deviceType).map((dev: Device) => dev.deviceType?.name ?? '')
      ),
    ].sort((a: string, b: string) => (a ?? '').localeCompare(b ?? ''));
  });

  const firmFilter = computed(() => {
    return [
      ...new Set(deviceStore.devices.filter((dev: Device) => dev.firm).map((dev: Device) => dev.firm?.name ?? '')),
    ].sort((a: string, b: string) => (a ?? '').localeCompare(b ?? ''));
  });

  const expandedRows = ref([]);
  const deviceTemp = ref<Device>();

  const dataTableRef = ref<DefineComponent | null>(null);
  const selectedBooks = computed(() => {
    const processedData = dataTableRef.value?.processedData;
    if (processedData) {
      return processedData.length;
    }
    return 0;
  });

  //
  //-------------------------------------------------DELETE -------------------------------------------------
  //
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const confirmDelete = (device: Device) => {
    deviceTemp.value = device;
    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (deviceTemp.value) return `Czy chcesz usunąc urządzenie: <b>${deviceTemp.value?.name}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    console.log('submitDelete()');
    showDeleteConfirmationDialog.value = false;
    if (deviceTemp.value) {
      deviceStore
        .deleteDeviceDb(deviceTemp.value.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Usunięto urządzenie: ' + deviceTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          if (reason.request.status === 403) {
            toast.add({
              severity: 'warn',
              summary: 'Błąd',
              detail: 'Nie masz uprawnień do usuwania urządzeń.',
              life: 3000,
            });
          } else
            toast.add({
              severity: 'error',
              summary: 'Błąd',
              detail: 'Nie usunięto urządzenia: ' + deviceTemp.value?.name,
              life: 3000,
            });
        });
    }
  };

  //
  //-------------------------------------------------EDIT -------------------------------------------------
  //
  const editItem = (item: Device) => {
    const deviceItem: Device = JSON.parse(JSON.stringify(item));
    router.push({
      name: 'Device',
      params: { isEdit: 'true', deviceId: deviceItem.id },
    });
  };

  //
  //--------------------------------DISPLAY FILTER
  //
  const filter = ref<ActiveStatus>('ALL');
  const setFilter = (selectedFilter: ActiveStatus) => {
    filter.value = selectedFilter;
    localStorage.setItem('selectedFilterDevices', selectedFilter);
  };
  const savedFilter = localStorage.getItem('selectedFilterDevices');
  if (savedFilter) {
    filter.value = savedFilter as ActiveStatus;
  }
  const filteredData = computed(() => {
    switch (filter.value) {
      case 'ACTIVE':
        return deviceStore.devices.filter((item: Device) => item.activeStatus === 'ACTIVE');
      case 'INACTIVE':
        return deviceStore.devices.filter((item: Device) => item.activeStatus === 'INACTIVE');
      case 'ALL':
      default:
        return deviceStore.devices;
    }
  });

  //
  //---------------------------------------------STATUS CHANGE--------------------------------------------------
  //
  const showStatusChangeConfirmationDialog = ref<boolean>(false);
  const confirmStatusChange = (deviceDto: Device) => {
    deviceTemp.value = deviceDto;
    showStatusChangeConfirmationDialog.value = true;
  };
  const changeStatusConfirmationMessage = computed(() => {
    if (deviceTemp.value)
      return `Czy chcesz zmienić status urządzenia: <b>${deviceTemp.value?.name}</b> na <b>${
        deviceTemp.value?.activeStatus === 'ACTIVE' ? 'Nie aktywny' : 'Aktywny'
      }</b>?`;
    return 'No message';
  });
  const submitChangeStatus = async () => {
    console.log('submitChangeStatus()');
    if (deviceTemp.value) {
      let newStatus: ActiveStatus = deviceTemp.value.activeStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      deviceStore
        .updateStatusDb(deviceTemp.value.id, newStatus)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zmieniono status urządzenia: ' + deviceTemp.value?.name,
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason.message,
            detail: 'Nie zmieniono statusu urządzenia: ' + deviceTemp.value?.name,
            life: 3000,
          });
        });
    }
    showStatusChangeConfirmationDialog.value = false;
  };

  const handleRowsPerPageChange = (event: DataTablePageEvent) => {
    localStorage.setItem('rowsPerPageDevicesList', event.rows.toString());
  };
</script>

<template>
  <TheMenuDevice />
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />
  <ConfirmationDialog
    v-model:visible="showStatusChangeConfirmationDialog"
    :msg="changeStatusConfirmationMessage"
    @save="submitChangeStatus"
    @cancel="showStatusChangeConfirmationDialog = false"
  />

  <Panel class="my-3 mx-2">
    <DataTable
      ref="dataTableRef"
      v-model:expanded-rows="expandedRows"
      v-model:filters="filters"
      :value="filteredData"
      :loading="deviceStore.loadingDevices"
      striped-rows
      removable-sort
      paginator
      :rows="deviceStore.rowsPerPageList"
      :rows-per-page-options="[5, 10, 20, 50]"
      table-style="min-width: 50rem"
      filter-display="menu"
      :global-filter-fields="['name', 'firm.name']"
      sort-field="date"
      :sort-order="-1"
      row-hover
      @page="handleRowsPerPageChange"
    >
      <template #header>
        <div class="flex justify-between">
          <router-link :to="{ name: 'Device', params: { isEdit: 'false', deviceId: 0 } }" style="text-decoration: none">
            <Button outlined label="Dodaj" icon="pi pi-plus" title="Dodaj nowe urządzenie" />
          </router-link>
          <div v-if="deviceStore.loadingDevices">
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
        <h4 v-if="!deviceStore.loadingDevices" class="color-red">Nie znaleziono urządzeń...</h4>
      </template>

      <Column expander style="width: 5rem" />
      <!--      DEVICE TYPE        -->
      <Column
        field="deviceType"
        header="Rodzaj urządzenia"
        style="max-width: 220px"
        filter-field="deviceType"
        :sortable="true"
        :show-filter-match-modes="false"
      >
        <template #body="slotProps">
          {{ slotProps.data[slotProps.field] }}
        </template>
        <template #filter="{ filterModel }">
          <MultiSelect
            v-model="filterModel.value"
            :options="deviceTypeFilter"
            placeholder="Wybierz..."
            class="p-column-filter"
            :max-selected-labels="2"
          />
        </template>
      </Column>

      <!--      NAME     -->
      <Column field="name" header="Nazwa" sortable>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Wpisz tutaj..." />
        </template>
      </Column>

      <!--      FIRM        -->
      <Column
        field="firm"
        header="Gdzie kupiono"
        style="max-width: 220px"
        filter-field="firm"
        :sortable="true"
        :show-filter-match-modes="false"
      >
        <template #body="slotProps">
          {{ slotProps.data[slotProps.field] }}
        </template>
        <template #filter="{ filterModel }">
          <MultiSelect
            v-model="filterModel.value"
            :options="firmFilter"
            placeholder="Wybierz..."
            class="p-column-filter"
            :max-selected-labels="2"
          />
        </template>
      </Column>

      <!--PURCHASE DATA-->
      <Column field="purchaseDate" header="Data zakupu" :sortable="true" data-type="date" filter-field="purchaseDate">
        <template #body="{ data }">
          <!--          {{ formatDate(data.purchaseDate) }}-->
          {{ UtilsService.formatDateToString(data.purchaseDate) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" date-format="yy-mm-dd" placeholder="yyyy-dd-mm" />
        </template>
      </Column>

      <!-- PURCHSAE AMOUNT-->
      <Column
        field="purchaseAmount"
        header="Kwota zakupu"
        style="min-width: 120px"
        data-type="numeric"
        filter-field="purchaseAmount"
      >
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(slotProps.data[slotProps.field]) }}
        </template>
        <template #filter="{ filterModel }">
          <InputNumber v-model="filterModel.value" mode="currency" currency="PLN" locale="pl-PL" />
        </template>
      </Column>

      <!-- WARRANTY END DATE-->
      <Column
        field="warrantyEndDate"
        header="Data gwarancji"
        :sortable="true"
        data-type="date"
        filter-field="warrantyEndDate"
      >
        <template #body="{ data }">
          {{ UtilsService.formatDateToString(data.warrantyEndDate) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" date-format="yy-mm-dd" placeholder="yyyy-dd-mm" />
        </template>
      </Column>

      <!-- INSURRANCE END DATE-->
      <Column
        field="insuranceEndDate"
        header="Data ubezpieczenia"
        :sortable="true"
        data-type="date"
        filter-field="insuranceEndDate"
      >
        <template #body="{ data }">
          {{ UtilsService.formatDateToString(data.insuranceEndDate) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" date-format="yy-mm-dd" placeholder="yyyy-dd-mm" />
        </template>
      </Column>

      <!-- SELL DATA-->
      <Column field="sellDate" header="Data sprzedaży" :sortable="true" data-type="date">
        <template #body="{ data }">
          {{ UtilsService.formatDateToString(data.sellDate) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" date-format="yy-mm-dd" placeholder="yyyy-dd-mm" />
        </template>
      </Column>

      <!-- SELL AMOUNT-->
      <Column
        field="sellAmount"
        header="Kwota sprzedaży"
        style="min-width: 120px"
        data-type="numeric"
        filter-field="sellAmount"
      >
        <template #body="slotProps">
          {{ UtilsService.formatCurrency(slotProps.data[slotProps.field]) }}
        </template>
        <template #filter="{ filterModel }">
          <InputNumber v-model="filterModel.value" mode="currency" currency="PLN" locale="pl-PL" />
        </template>
      </Column>

      <!-- ACTIVE STATUS     -->
      <Column field="activeStatus" header="Status" style="width: 100px">
        <template #body="{ data, field }">
          <StatusButton
            title="Zmień status urządzenia na (Aktywny/Nieaktywny)"
            :btn-type="data[field]"
            :color-icon="data[field] === 'ACTIVE' ? '#2da687' : '#dc3545'"
            @click="confirmStatusChange(data)"
          />
        </template>
      </Column>

      <!--                EDIT, DELETE-->
      <Column header="Akcja" :exportable="false" style="max-width: 70px">
        <template #body="slotProps">
          <div class="flex flex-row gap-1 justify-start mt-2 mb-2">
            <OfficeIconButton title="Edytuj urządzenie" icon="pi pi-file-edit" @click="editItem(slotProps.data)" />
            <OfficeIconButton
              title="Usuń urządzenie"
              icon="pi pi-trash"
              severity="danger"
              class=""
              @click="confirmDelete(slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="flex">
          <div class="flex flex-col p-3 col-9 w-full">
            <label class="text-left">Opis:</label>
            <Textarea v-model="slotProps.data.otherInfo" rows="7" auto-resize fluid readonly />
          </div>
        </div>
      </template>
    </DataTable>
  </Panel>

  <Toolbar class="sticky-toolbar mx-2">
    <template #start>
      <OfficeIconButton
        title="Odświerz listę książek"
        :icon="deviceStore.loadingDevices ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
        class="mr-2"
        @click="deviceStore.refreshDevices()"
      />
    </template>
    <template #center>
      <OfficeIconButton
        title="Wyświetl aktywne"
        :icon="deviceStore.loadingDevices ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
        class="mr-2"
        :active="filter === 'ACTIVE'"
        @click="setFilter('ACTIVE')"
      />
      <OfficeIconButton
        title="Wyświetl nieaktywne"
        :icon="deviceStore.loadingDevices ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
        class="mr-2"
        :active="filter === 'INACTIVE'"
        @click="setFilter('INACTIVE')"
      />
      <OfficeIconButton
        title="Wyświetl wszystkie"
        :icon="deviceStore.loadingDevices ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
        class="mr-2"
        :active="filter === 'ALL'"
        @click="setFilter('ALL')"
      />
    </template>
    <template #end>
      <div class="flex flex-col">
        <p class="">
          <span class="">Przefiltrowane:</span>
          <span class="ml-3">{{ selectedBooks }}</span>
        </p>
        <p class="">
          <span class="">RAZEM:</span>
          <span class="ml-3">{{ deviceStore.devices.length }} urządzeń</span>
        </p>
      </div>
    </template>
  </Toolbar>
</template>

<style scoped>
  .p-datatable >>> .p-datatable-tbody > tr > td {
    padding: 0 !important;
  }
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
</style>
