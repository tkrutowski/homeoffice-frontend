<script setup lang="ts">
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { computed, onMounted, ref, watch } from 'vue';
  import router from '@/router';
  import { useToast } from 'primevue/usetoast';
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useDevicesStore } from '@/stores/devices';
  import { UtilsService } from '@/service/UtilsService';
  import type { Device } from '@/types/Devices';
  import TheMenuDevice from '@/components/device/TheMenuDevice.vue';
  import type { ActiveStatus } from '@/types/Bank';
  import type { AxiosError } from 'axios';
  import type { SelectChangeEvent } from 'primevue/select';
  import type { DataViewPageEvent } from 'primevue';
  import FileUploadDialog from '@/components/FileUploadDialog.vue';
  import type { FileInfo } from '@/types/FileInfo.ts';
  import ButtonOutlined from '@/components/ButtonOutlined.vue';
  import DeviceDetailsDialog from '@/components/device/DeviceDetailsDialog.vue';

  const deviceStore = useDevicesStore();
  const toast = useToast();

  onMounted(() => {
    if (deviceStore.devices.length <= 1) {
      deviceStore.refreshDevices();
    }
  });

  const deviceTemp = ref<Device>();

  // Zmienne dla dialogu wgrywania plików
  const showUploadDialog = ref<boolean>(false);
  const selectedDevice = ref<Device | null>(null);

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
    console.log('fileredData - START');
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

  const searchQuery = ref<string>('');
  const filteredDevices = ref<Device[]>(filteredData.value);
  watch(filteredData, newFilteredData => {
    filteredDevices.value = newFilteredData; // Dynamicznie przypisuje dane po ich załadowaniu
  });
  const filterDevices = () => {
    if (searchQuery.value.length >= 3) {
      filteredDevices.value = filteredDevices.value.filter(
        (device: Device) =>
          device.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          device.firm?.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          device.purchaseDate?.toString().includes(searchQuery.value)
      );
    } else {
      filteredDevices.value = filteredData.value; // Resetuje listę, jeśli długość zapytania jest < 3
    }
  };
  const clearFilter = () => {
    searchQuery.value = '';
    filterDevices();
  };
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

  const handleRowsPerPageChange = (event: DataViewPageEvent) => {
    localStorage.setItem('rowsPerPageDevicesGrid', event.rows.toString());
  };

  // Funkcja do wyświetlania dialogu do wgrywania plików
  const showUploadFilesDialog = (device: Device) => {
    selectedDevice.value = device;
    showUploadDialog.value = true;
  };

  const saveFiles = (files: FileInfo[]) => {
    console.log('saveFiles()', files);
    if (selectedDevice.value && files.length > 0) {
      deviceStore
        .addFileDb(selectedDevice.value.id, files)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zapisano pliki',
            life: 3000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason.message,
            detail: 'Nie zapisano plików',
            life: 5000,
          });
        });
    }
  };

  const layout = ref<'list' | 'grid' | undefined>('list');
  const options = ref<string[]>(['list', 'grid']);

  const getSeverity = (item: Device) => {
    if (item.activeStatus === 'ACTIVE') {
      return 'success';
    }
    return 'danger';
  };
  const getStatus = (item: Device) => {
    if (item.sellDate) {
      return 'SPRZEDANE';
    }
    if (item.activeStatus === 'ACTIVE') {
      return 'AKTYWNE';
    }
    return 'NIEAKTYWNE';
  };

  const sortKey = ref<object>({
    label: 'Data: od najnowszych',
    value: '!purchaseDate',
  });
  const sortOrder = ref<number>(-1);
  const sortField = ref<string>('purchaseDate');
  const sortOptions = ref([
    {
      label: 'Cena: od najdroższych',
      value: '!purchaseAmount',
      icon: 'pi-sort-amount-down',
    },
    {
      label: 'Cena: od najtańszych',
      value: 'purchaseAmount',
      icon: 'pi-sort-amount-up',
    },
    {
      label: 'Alfabetycznie: Z-A',
      value: '!name',
      icon: 'pi-sort-alpha-down-alt',
    },
    { label: 'Alfabetycznie: A-Z', value: 'name', icon: 'pi-sort-alpha-up' },
    {
      label: 'Data: od najnowszych',
      value: '!purchaseDate',
      icon: 'pi-sort-numeric-down',
    },
    {
      label: 'Data: od najstarszych',
      value: 'purchaseDate',
      icon: 'pi-sort-numeric-up-alt',
    },
  ]);
  const onSortChange = (event: SelectChangeEvent) => {
    console.log('onSortChange', event);
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
      sortOrder.value = -1;
      sortField.value = value.substring(1, value.length);
      sortKey.value = sortValue;
    } else {
      sortOrder.value = 1;
      sortField.value = value;
      sortKey.value = sortValue;
    }
  };

  const showDetailsDialog = ref<boolean>(false);
  const selectedDeviceForDetails = ref<Device | null>(null);

  const displayDetails = (device: Device) => {
    console.log("DETAILS",device)
    selectedDeviceForDetails.value = device;
    showDetailsDialog.value = true;
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

  <DeviceDetailsDialog v-model:visible="showDetailsDialog" :device="selectedDeviceForDetails" />

  <FileUploadDialog
    v-model:visible="showUploadDialog"
    :module="'DEVICE_FILES'"
    header="Wgraj pliki"
    :closable="true"
    :closeOnEscape="true"
    @save="saveFiles"
  />
  <Panel class="mt-5 ml-2 mr-2">
    <DataView
      :value="filteredDevices"
      data-key="id"
      :layout="layout"
      v-if="!deviceStore.loadingDevices"
      paginator
      :rows="deviceStore.rowsPerPageGrid"
      :rows-per-page-options="[5, 10, 20, 30, 50]"
      :sortOrder="sortOrder"
      :sortField="sortField"
      @page="handleRowsPerPageChange"
    >
      <template #header>
        <div class="flex justify-between gap-3">
          <div class="">
            <router-link
              :to="{ name: 'Device', params: { isEdit: 'false', deviceId: 0 } }"
              style="text-decoration: none"
            >
              <OfficeButton icon="pi pi-plus" btn-type="office-regular" title="Dodaj nowe urządzenie" />
            </router-link>
            <Select
              v-model="sortKey"
              :options="sortOptions"
              optionLabel="label"
              placeholder="Sortuj:"
              class="ml-3"
              @change="onSortChange"
            >
              <template #option="slotProps">
                <i :class="['pi', slotProps.option.icon]" />
                <span class="ml-2">{{ slotProps.option.label }}</span>
              </template>
              <template #value="slotProps">
                <i v-if="slotProps.value" :class="['pi', slotProps.value.icon]" />
                <span class="ml-2">{{ slotProps.value ? slotProps.value.label : 'Sortuj:' }}</span>
              </template>
            </Select>
          </div>
          <div class="flex gap-4">
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="searchQuery" placeholder="wpisz tutaj..." @input="filterDevices" />
            </IconField>
            <Button type="button" icon="pi pi-filter-slash" outlined title="Wyczyść filtry" @click="clearFilter()" />
          </div>
        </div>
        <div class="flex justify-end mt-2">
          <SelectButton v-model="layout" :options="options" :allowEmpty="false">
            <template #option="{ option }">
              <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
            </template>
          </SelectButton>
        </div>
      </template>

      <template #list="slotProps">
        <div class="flex flex-col">
          <div v-for="(item, index) in slotProps.items" :key="index">
            <div
              class="flex flex-col sm:flex-row sm:items-center p-6 gap-4"
              :class="{
                'border-t border-surface-200 dark:border-surface-700': index !== 0,
              }"
            >
              <div class="md:w-40 relative">
                <img
                  v-if="item.imageUrl && item.imageUrl.length > 0"
                  class="block xl:block mx-auto rounded w-full"
                  :src="item.imageUrl"
                  :alt="item.imageUrl"
                  style="max-width: 90px"
                />
                <img
                  v-else
                  class="block xl:block mx-auto rounded w-full"
                  src="../../assets/images/no_image.png"
                  alt="no image"
                  style="max-width: 90px"
                />
                <div class="absolute bg-black/70 rounded-border" style="left: 4px; top: 4px">
                  <Tag :value="getStatus(item)" :severity="getSeverity(item)"></Tag>
                </div>
              </div>
              <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                <div class="flex flex-row md:flex-col justify-between items-start gap-2 w-1/3">
                  <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.deviceType.name }}</span>
                  <div class="text-lg font-medium mt-2">{{ item.name }}</div>
                  <div class="text-sm font-medium mt-2">
                    {{ item.otherInfo }}
                  </div>
                </div>
                <div class="flex flex-row md:flex-col justify-between items-start gap-2 w-1/3">
                  <div>
                    <span class="font-medium text-surface-500 dark:text-surface-400 text-lg">{{ item.firm.name }}</span>
                    <div class="text-sm font-medium mt-2">
                      {{ UtilsService.formatDateToString(item.purchaseDate) }}
                    </div>
                  </div>
                </div>
                <div class="flex flex-col md:items-end gap-8 w-1/3">
                  <span class="text-xl font-semibold text-surface-500 dark:text-surface-400">{{
                    UtilsService.formatCurrency(item.purchaseAmount)
                  }}</span>
                  <div class="flex flex-row-reverse md:flex-row gap-2">
                    <OfficeIconButton
                      v-if="item.activeStatus == 'INACTIVE'"
                      title="Zmień status na AKTYWNY"
                      icon="pi pi-times-circle"
                      :rounded="false"
                      severity="danger"
                      @click="confirmStatusChange(item)"
                    />
                    <OfficeIconButton
                      v-else
                      title="Zmień status na NIEAKTYWNY"
                      icon="pi pi-check-circle"
                      :rounded="false"
                      severity="success"
                      @click="confirmStatusChange(item)"
                    />
                    <OfficeIconButton
                      icon="pi pi-file-edit"
                      title=""
                      :rounded="false"
                      severity="primary"
                      @click="editItem(item)"
                    />
                    <OfficeIconButton
                      icon="pi pi-cloud-upload"
                      :title="`Wgraj pliki dla urządzenia: ${item.name}`"
                      :rounded="false"
                      severity="info"
                      @click="showUploadFilesDialog(item)"
                    />
                    <OfficeIconButton
                      icon="pi pi-trash"
                      :title="`Usuń urządzenie: ${item.name}`"
                      :rounded="false"
                      severity="danger"
                      @click="confirmDelete(item)"
                    />
                    <ButtonOutlined
                      icon="pi pi-info"
                      title="Wyświetl szczegóły."
                      class="flex-auto md:flex-initial whitespace-nowrap"
                      text=""
                      @click="displayDetails(item)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #grid="">
        <p class="text-2xl text-primary text-center">W trakcie realizacji...</p>
      </template>
    </DataView>
  </Panel>

  <Toolbar class="sticky-toolbar p-2 m-2">
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
          <span class="ml-3">{{ filteredDevices.length }}</span>
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
  :deep(.p-panel-header) {
    padding: 0.25rem !important;
  }
</style>
