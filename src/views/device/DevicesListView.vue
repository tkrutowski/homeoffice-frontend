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
  import type { FileInfo } from '@/types/FileInfo';
  import type { DataTableRowClickEvent } from 'primevue';
  import { FileService } from '@/service/FileService';
  import FileUrlsPreviewDialog from '@/components/FileUrlsPreviewDialog.vue';
  import TheMenuDevice from '@/components/device/TheMenuDevice.vue';
  import DataTablePageShell from '@/components/layout/DataTablePageShell.vue';
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
      'deviceType.name': { value: null, matchMode: FilterMatchMode.IN },
      'firm.name': { value: null, matchMode: FilterMatchMode.IN },
      name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      purchaseDate: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      purchaseAmount: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      sellAmount: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      warrantyEndDate: {
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

  const expandedRows = ref<Device[]>([]);
  /** Pełne dane z GET /devices/:id (lista często nie ma `details` ani `files`). */
  const expansionDetails = ref<Record<number, Device>>({});
  const expansionLoading = ref<Record<number, boolean>>({});

  const filePreviewVisible = ref(false);
  const filePreviewStartIndex = ref(0);
  const filePreviewDevice = ref<Device | null>(null);

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

  /** Wiersze z datami jako `Date` — filtr DATE_IS w PrimeVue wymaga `.toDateString()` na wartości z API (często string). */
  const devicesForDataTable = computed((): Device[] =>
    filteredData.value.map(d => ({
      ...d,
      purchaseDate: d.purchaseDate != null ? (UtilsService.formatDate(d.purchaseDate) ?? null) : null,
      warrantyEndDate: d.warrantyEndDate != null ? (UtilsService.formatDate(d.warrantyEndDate) ?? null) : null,
    }))
  );

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

  /** `details` z API może być `Map` lub zwykłym obiektem po deserializacji JSON. */
  const getExpansionDevice = (row: Device): Device => expansionDetails.value[row.id] ?? row;

  const onRowExpand = async (event: { data: Device }) => {
    const id = event.data.id;
    if (expansionDetails.value[id]) return;
    expansionLoading.value = { ...expansionLoading.value, [id]: true };
    try {
      const full = await deviceStore.fetchDeviceById(id);
      if (full) {
        expansionDetails.value = { ...expansionDetails.value, [id]: full };
      }
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się wczytać szczegółów urządzenia.',
        life: 4000,
      });
    } finally {
      const next = { ...expansionLoading.value };
      delete next[id];
      expansionLoading.value = next;
    }
  };

  const refreshDevicesList = async () => {
    expansionDetails.value = {};
    expansionLoading.value = {};
    await deviceStore.refreshDevices();
  };

  function onFilesRowClick(event: DataTableRowClickEvent, device: Device) {
    const file = event.data as FileInfo;
    if (!device.files?.length) return;
    const idx = device.files.findIndex(f => f.id === file.id);
    filePreviewStartIndex.value = idx >= 0 ? idx : 0;
    filePreviewDevice.value = device;
    filePreviewVisible.value = true;
  }

  function openFileUrlInNewTab(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const getDetailPairs = (device: Device): { key: string; value: string }[] => {
    const raw = device.details as unknown;
    if (raw == null) return [];
    if (raw instanceof Map) {
      return Array.from(raw.entries()).map(([key, value]) => ({ key, value: String(value) }));
    }
    if (typeof raw === 'object') {
      return Object.entries(raw as Record<string, string>).map(([key, value]) => ({
        key,
        value: String(value ?? ''),
      }));
    }
    return [];
  };
</script>

<template>
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

  <DataTablePageShell>
    <template #top>
      <TheMenuDevice />
    </template>

    <Panel class="my-3 mx-2">
      <DataTable
        ref="dataTableRef"
        v-model:expanded-rows="expandedRows"
        v-model:filters="filters"
        :value="devicesForDataTable"
        :loading="deviceStore.loadingDevices"
        striped-rows
        removable-sort
        paginator
        :rows="deviceStore.rowsPerPageList"
        :rows-per-page-options="[5, 10, 20, 50]"
        table-style="min-width: 45rem"
        filter-display="menu"
        :global-filter-fields="['name', 'firm.name']"
        sort-field="purchaseDate"
        :sort-order="-1"
        row-hover
        @page="handleRowsPerPageChange"
        @row-expand="onRowExpand"
      >
        <template #header>
          <div class="grid grid-cols-3 gap-4 items-center">
            <div class="flex">
              <router-link
                :to="{ name: 'Device', params: { isEdit: 'false', deviceId: 0 } }"
                style="text-decoration: none"
              >
                <Button outlined label="Dodaj" icon="pi pi-plus" title="Dodaj nowe urządzenie" />
              </router-link>
            </div>
            <div class="flex justify-center gap-2">
              <OfficeIconButton
                title="Wyświetl nieaktywne"
                :icon="deviceStore.loadingDevices ? 'pi pi-spin pi-spinner' : 'pi pi-times-circle'"
                class="text-red-500"
                :active="filter === 'INACTIVE'"
                @click="setFilter('INACTIVE')"
              />
              <OfficeIconButton
                title="Wyświetl aktywne"
                :icon="deviceStore.loadingDevices ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
                class="text-green-500"
                :active="filter === 'ACTIVE'"
                @click="setFilter('ACTIVE')"
              />
              <OfficeIconButton
                title="Wyświetl wszystkie"
                :icon="deviceStore.loadingDevices ? 'pi pi-spin pi-spinner' : 'pi pi-list'"
                class="text-orange-500"
                :active="filter === 'ALL'"
                @click="setFilter('ALL')"
              />
            </div>
            <div class="flex justify-end gap-4">
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
          filter-field="deviceType.name"
          :sortable="true"
          :show-filter-match-modes="false"
        >
          <template #body="{ data }">
            {{ data.deviceType?.name ?? '' }}
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
          filter-field="firm.name"
          :sortable="true"
          :show-filter-match-modes="false"
        >
          <template #body="{ data }">
            {{ data.firm?.name ?? '' }}
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
        <Column field="activeStatus" header="Status" style="width: 80px">
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
              <OfficeIconButton
                title="Edytuj urządzenie"
                icon="pi pi-file-edit"
                class="text-orange-500"
                @click="editItem(slotProps.data)"
              />
              <OfficeIconButton
                title="Usuń urządzenie"
                icon="pi pi-trash"
                class="text-red-500"
                @click="confirmDelete(slotProps.data)"
              />
            </div>
          </template>
        </Column>

        <template #expansion="{ data }">
          <div
            class="flex flex-col gap-6 border-t border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900/50"
          >
            <div v-if="expansionLoading[data.id] && !expansionDetails[data.id]" class="flex justify-center py-6">
              <ProgressSpinner style="width: 42px; height: 42px" stroke-width="4" />
            </div>
            <template v-else>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium text-surface-500 dark:text-surface-400">ID</span>
                  <span class="text-surface-900 dark:text-surface-0">{{ getExpansionDevice(data).id }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium text-surface-500 dark:text-surface-400">Data ubezpieczenia</span>
                  <span class="text-surface-900 dark:text-surface-0">{{
                    UtilsService.formatDateToString(getExpansionDevice(data).insuranceEndDate ?? undefined)
                  }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium text-surface-500 dark:text-surface-400">Data sprzedaży</span>
                  <span class="text-surface-900 dark:text-surface-0">{{
                    UtilsService.formatDateToString(getExpansionDevice(data).sellDate ?? undefined)
                  }}</span>
                </div>
              </div>

              <div v-if="getExpansionDevice(data).imageUrl" class="flex flex-col gap-2">
                <span class="text-sm font-medium text-surface-500 dark:text-surface-400">Obraz</span>
                <a
                  :href="getExpansionDevice(data).imageUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="break-all text-sm text-primary hover:underline"
                  >{{ getExpansionDevice(data).imageUrl }}</a
                >
                <img
                  :src="getExpansionDevice(data).imageUrl"
                  :alt="getExpansionDevice(data).name"
                  class="max-h-48 max-w-full rounded-md border border-surface-200 object-contain dark:border-surface-600"
                />
              </div>

              <Fieldset class="w-full" legend="Szczegóły" :toggleable="true">
                <div v-if="getDetailPairs(getExpansionDevice(data)).length > 0" class="mt-2 flex flex-col gap-2">
                  <div
                    v-for="pair in getDetailPairs(getExpansionDevice(data))"
                    :key="pair.key"
                    class="flex flex-col gap-0.5 border-b border-surface-100 pb-2 last:border-0 dark:border-surface-700 sm:flex-row sm:gap-4"
                  >
                    <span class="shrink-0 text-sm font-medium text-surface-600 dark:text-surface-300 sm:w-40">{{
                      pair.key
                    }}</span>
                    <span class="break-words text-sm text-surface-900 dark:text-surface-0">{{ pair.value }}</span>
                  </div>
                </div>
                <p v-else class="mt-2 text-sm text-surface-600 dark:text-surface-400">Brak zapisanych szczegółów.</p>
              </Fieldset>

              <div class="flex flex-col gap-2">
                <Fieldset
                  v-if="getExpansionDevice(data).files?.length"
                  class="w-full"
                  legend="Pliki"
                  :toggleable="true"
                >
                  <DataTable
                    :value="getExpansionDevice(data).files"
                    class="mt-2"
                    :rows="10"
                    :paginator="true"
                    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    :rows-per-page-options="[5, 10, 20, 50]"
                    responsive-layout="scroll"
                    @row-click="e => onFilesRowClick(e, getExpansionDevice(data))"
                  >
                    <Column field="name" header="Nazwa pliku" :sortable="true">
                      <template #body="slotProps">
                        <div class="flex min-w-0 items-center gap-2">
                          <i :class="FileService.getFileIcon(slotProps.data.type)" class="mr-2 shrink-0"></i>
                          <span class="cursor-pointer truncate text-primary-600 dark:text-primary-400">
                            {{ slotProps.data.name }}
                          </span>
                          <OfficeIconButton
                            icon="pi pi-external-link"
                            class="shrink-0 text-blue-500"
                            title="Otwórz w nowej karcie"
                            @click.stop="openFileUrlInNewTab(slotProps.data.url)"
                          />
                        </div>
                      </template>
                    </Column>
                    <Column field="type" header="Typ" :sortable="true" style="width: 150px">
                      <template #body="slotProps">
                        <Tag
                          :value="FileService.getFileTypeLabel(slotProps.data.type)"
                          :severity="FileService.getFileTypeSeverity(slotProps.data.type)"
                        />
                      </template>
                    </Column>
                    <Column field="size" header="Rozmiar" :sortable="true" style="width: 150px">
                      <template #body="slotProps">
                        {{ FileService.formatFileSize(slotProps.data.size) }}
                      </template>
                    </Column>
                    <Column field="uploadDate" header="Data dodania" :sortable="true" style="width: 200px">
                      <template #body="slotProps">
                        {{ FileService.formatDate(slotProps.data.uploadDate) }}
                      </template>
                    </Column>
                    <Column field="description" header="Opis" style="width: 200px">
                      <template #body="slotProps">
                        {{ slotProps.data.description }}
                      </template>
                    </Column>
                  </DataTable>
                </Fieldset>
                <p v-else class="text-sm text-surface-600 dark:text-surface-400">Brak załączonych plików.</p>
              </div>

              <div class="flex flex-col gap-2">
                <span class="text-left text-sm font-medium text-surface-500 dark:text-surface-400">Opis</span>
                <Textarea
                  :model-value="getExpansionDevice(data).otherInfo"
                  rows="7"
                  auto-resize
                  fluid
                  readonly
                  class="w-full"
                />
              </div>
            </template>
          </div>
        </template>
      </DataTable>
    </Panel>

    <template #bottom>
      <Toolbar class="mx-2 border-t border-surface-200 bg-surface-0 pt-2 dark:border-surface-700 dark:bg-surface-950">
        <template #start>
          <OfficeIconButton
            title="Odświerz listę książek"
            :icon="deviceStore.loadingDevices ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
            class="mr-2"
            @click="refreshDevicesList()"
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
  </DataTablePageShell>

  <FileUrlsPreviewDialog
    v-model:visible="filePreviewVisible"
    :items="filePreviewDevice?.files ?? []"
    :initial-index="filePreviewStartIndex"
  />
</template>

<style scoped>
  .p-datatable >>> .p-datatable-tbody > tr > td {
    padding: 0 !important;
  }
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
  /* Domyślny wrapper PrimeVue ma overflow-x: auto — przy szerokiej tabeli pojawiał się poziomy pasek. */
  :deep(.p-datatable-wrapper) {
    overflow-x: hidden;
  }
</style>
