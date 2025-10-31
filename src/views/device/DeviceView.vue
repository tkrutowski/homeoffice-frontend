<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { useDevicesStore } from '@/stores/devices';
  import { useFirmsStore } from '@/stores/firms';
  import { useFilesStore } from '@/stores/files';
  import { computed, onMounted, ref } from 'vue';
  import OfficeButton from '@/components/OfficeButton.vue';
  import router from '@/router';
  import IconButton from '@/components/OfficeIconButton.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { useToast } from 'primevue/usetoast';
  import AddDialog from '@/components/AddDialog.vue';
  import type { Device } from '@/types/Devices';
  import type { Firm } from '@/types/Firm';
  import TheMenuDevice from '@/components/device/TheMenuDevice.vue';
  import moment from 'moment/moment';
  import { UtilsService } from '@/service/UtilsService';
  import type { AxiosError } from 'axios';
  import type { DataTableRowReorderEvent } from 'primevue';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import AddMultipleDialog from '@/components/AddMultipleDialog.vue';
  import { FileService } from '@/service/FileService.ts';
  import type { FileInfo } from '@/types/FileInfo.ts';
  import ButtonOutlined from '@/components/ButtonOutlined.vue';

  const deviceStore = useDevicesStore();
  const firmStore = useFirmsStore();
  const filesStore = useFilesStore();
  const route = useRoute();

  const toast = useToast();

  //
  //AUTO COMPLETE FIRM
  //
  const filteredFirms = ref<Firm[]>([]);
  const searchFirm = (event: { query: string }) => {
    filteredFirms.value = firmStore.firms.filter((firm: Firm) => {
      return firm.name.toLowerCase().includes(event.query.toLowerCase());
    });
  };
  const warrantyDateLeft = computed(() => {
    if (device.value.warrantyEndDate) {
      const today = moment(); // dzisiejsza data
      const futureDate = moment(device.value.warrantyEndDate); // odległa data (w formacie 'YYYY-MM-DD')
      const yearsRemaining = futureDate.diff(today, 'years');
      const futureDateWithoutYears = today.add(yearsRemaining, 'years');
      const daysRemaining = futureDate.diff(futureDateWithoutYears, 'days');
      if (yearsRemaining < 0 || daysRemaining < 0) {
        return 'Gwarancja się skończyła.';
      }
      if (yearsRemaining === 0) {
        return `${daysRemaining} dni.`;
      }
      return `${yearsRemaining} lat(a) i ${daysRemaining} dni.`;
    }
    return 'Brak gwarancji.';
  });
  // INSURANCE DATE
  const insuranceDateLeft = computed(() => {
    const today = moment(); // dzisiejsza data
    if (device.value.insuranceEndDate) {
      const futureDate = moment(device.value.insuranceEndDate);
      const yearsRemaining = futureDate.diff(today, 'years');
      const futureDateWithoutYears = today.add(yearsRemaining, 'years');
      const daysRemaining = futureDate.diff(futureDateWithoutYears, 'days');
      if (yearsRemaining < 0 || daysRemaining < 0) {
        return 'Ubezpieczenie się skończyło.';
      }
      if (yearsRemaining === 0) {
        return `${daysRemaining} dni.`;
      }
      return `${yearsRemaining} lat(a) i ${daysRemaining} dni.`;
    }
    return 'Brak ubezpieczenia.';
  });

  const device = ref<Device>({
    id: 0,
    deviceType: null,
    firm: null,
    name: '',
    purchaseDate: null,
    purchaseAmount: 0,
    sellDate: null,
    sellAmount: 0,
    warrantyEndDate: null,
    insuranceEndDate: null,
    otherInfo: '',
    activeStatus: 'ACTIVE',
    imageUrl: '',
    details: new Map<string, string>(),
    files: [],
  });

  const btnShowBusy = ref<boolean>(false);
  const btnSaveDisabled = ref<boolean>(false);

  const isSaveBtnDisabled = computed(() => {
    return (
      deviceStore.loadingDevices || deviceStore.loadingDeviceTypes || firmStore.loadingFirms || btnSaveDisabled.value
    );
  });

  //
  //SAVE
  //
  function saveDevice() {
    submitted.value = true;
    if (isEdit.value) {
      editDevice();
    } else {
      newDevice();
    }
  }

  //
  //---------------------------------------------------------NEW DEVICE----------------------------------------------
  //
  async function newDevice() {
    console.log('newDevice()');
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      btnShowBusy.value = true;
      deviceStore
        .addDeviceDb(device.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zapisano urządzenie: ' + device.value?.name,
            life: 3000,
          });
          btnShowBusy.value = false;
          setTimeout(() => {
            resetForm();
          }, 1000);
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason.message,
            detail: 'Błąd podczas dodawania urządzenia.',
            life: 3000,
          });
        })
        .finally(() => {
          btnSaveDisabled.value = false;
          btnShowBusy.value = false;
          submitted.value = false;
        });
    }
  }

  //
  //-----------------------------------------------------EDIT DEVICE------------------------------------------------
  //
  const isEdit = ref<boolean>(false);

  async function editDevice() {
    if (isNotValid()) {
      showError('Uzupełnij brakujące elementy');
    } else {
      btnSaveDisabled.value = true;
      console.log('editDevice()');
      await deviceStore
        .updateDeviceDb(device.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano urządzenie: ' + device.value?.name,
            life: 3000,
          });
          setTimeout(() => {
            router.go(-1);
          }, 3000);
        })
        .catch((err) => {
          console.log(err)
          toast.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Błąd podczas edycji urządzenia.',
            life: 3000,
          });
        })
        .finally(() => {
          btnSaveDisabled.value = false;
          btnShowBusy.value = false;
          submitted.value = false;
        });
    }
  }

  //---------------------------------------------MOUNTED--------------------------------------------
  onMounted(async () => {
    console.log('onMounted GET');
    btnSaveDisabled.value = true;
    if (firmStore.firms.length === 0) await firmStore.getFirmsFromDb();
    if (deviceStore.devicesTypes.length === 0) await deviceStore.getDeviceTypesFromDb();
    isEdit.value = route.params.isEdit === 'true';
    const deviceId = Number(route.params.deviceId as string);
    if (!isEdit.value && deviceId === 0) {
      console.log('onMounted NEW DEVICE');
    } else {
      console.log('onMounted EDIT DEVICE');
      deviceStore
        .getDeviceFromDb(deviceId)
        .then((data: Device | null) => {
          if (data) {
            device.value = {
              ...data,
              details: new Map(Object.entries(data.details))
            };
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania urządzenia:', error);
        });
    }
    btnSaveDisabled.value = false;
  });

  //
  //--------------------------------------------------DEVICE TYPE
  //
  const showAddDeviceTypeModal = ref(false);

  async function saveDeviceType(name: string) {
    console.log('in1: ', name);
    showAddDeviceTypeModal.value = false;
    if (name.length === 0) {
      showError('Uzupełnij brakujące elementy');
    } else {
      deviceStore
        .addDeviceTypeDb({ id: 0, name: name })
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano rodzaj urządzenia: ' + name,
            life: 5000,
          });
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason.message,
            detail: 'Nie dodano rodzaju urządzenia: ' + name,
            life: 5000,
          });
        });
    }
  }

  //
  //------------------------------------------------ERROR----------------------------------------------------------
  //
  const submitted = ref(false);

  const showError = (msg: string) => {
    toast.add({
      severity: 'error',
      summary: 'Błąd',
      detail: msg,
      life: 5000,
    });
  };
  const isNotValid = () => {
    return (
      showErrorName() ||
      showErrorPurchaseDate() ||
      showErrorPurchaseAmount() ||
      showErrorDeviceType() ||
      showErrorFirm()
    );
  };
  const showErrorName = () => {
    return submitted.value && device.value.name.length === 0;
  };
  const showErrorFirm = () => {
    return submitted.value && (!device.value.firm || device.value.firm.id === 0);
  };
  const showErrorPurchaseDate = () => {
    return submitted.value && !device.value.purchaseDate;
  };
  const showErrorPurchaseAmount = () => {
    return submitted.value && device.value.purchaseAmount <= 0;
  };
  const showErrorDeviceType = () => {
    return submitted.value && !device.value.deviceType;
  };

  function resetForm() {
    device.value = {
      id: 0,
      deviceType: null,
      firm: null,
      name: '',
      purchaseDate: null,
      purchaseAmount: 0,
      sellDate: null,
      sellAmount: 0,
      warrantyEndDate: null,
      insuranceEndDate: null,
      otherInfo: '',
      activeStatus: 'ACTIVE',
      details: new Map<string, string>(),
      imageUrl: '',
      files: [],
    };
    submitted.value = false;
    btnSaveDisabled.value = false;
  }

  //
  //--------------------------------------------------DETAILS
  //
  const showAddDetailsModal = ref<boolean>(false);
  const showAddMultipleDetailsModal = ref<boolean>(false);

  const onRowReorder = (event: DataTableRowReorderEvent) => {
    console.log('onRowReorder', event);
    device.value.details = new Map<string, string>([...event.value]);
  };

  //DELETE
  const showDeleteConfirmationDialog = ref<boolean>(false);
  const tempDetail = ref<string[]>([]);
  const confirmDelete = (entry: string[]) => {
    tempDetail.value = entry;

    showDeleteConfirmationDialog.value = true;
  };
  const deleteConfirmationMessage = computed(() => {
    if (tempDetail.value) return `Czy chcesz usunąc wpis: <b>${tempDetail.value[0]} : ${tempDetail.value[1]}</b>?`;
    return 'No message';
  });
  const submitDelete = async () => {
    if (tempDetail.value) {
      device.value.details.delete(tempDetail.value[0]);
    }
    showDeleteConfirmationDialog.value = false;
  };
  // ADD
  const openNew = () => {
    tempDetail.value = [];
    showAddMultipleDetailsModal.value = true;
  };

  async function saveMultipleDetails(keyToAdd: string, valueToAdd: string, close: boolean) {
    // console.log("keyToAdd, valueToAdd, close", keyToAdd, valueToAdd, close)
    if (device.value.details.has(keyToAdd)) {
      toast.add({
        severity: 'warn',
        summary: 'Ostrzeżenie',
        detail: 'Podana watość klucza już istnieje: ' + keyToAdd,
        life: 6000,
      });
    } else {
      if (close) showAddMultipleDetailsModal.value = false;
      device.value.details.set(keyToAdd, valueToAdd);
    }
  }

  //EDIT
  const editIndex = ref<number>(-1);
  const editDetails = (detail: string[], index: number) => {
    tempDetail.value = detail;
    editIndex.value = index;
    showAddDetailsModal.value = true;
  };

  async function saveDetails(keyToAdd: string, valueToAdd: string) {
    // console.log("keyToAdd, valueToAdd", keyToAdd, valueToAdd)
    showAddDetailsModal.value = false;
    if (keyToAdd.length === 0 || valueToAdd.length === 0) {
      showError('Klucz i wartość nie mogą być puste');
    } else {
      if (keyToAdd === tempDetail.value[0] || (keyToAdd !== tempDetail.value[0] && editIndex.value === -1)) {
        device.value.details.set(keyToAdd, valueToAdd);
      } else {
        const newMap = new Map<string, string>();
        let index = 0;
        device.value.details.delete(tempDetail.value[0]);
        device.value.details.forEach((value, key) => {
          if (index === editIndex.value) {
            newMap.set(keyToAdd, valueToAdd);
          }
          newMap.set(key, value);
          index++;
        });
        device.value.details = newMap;
        editIndex.value = -1;
      }
    }
  }

  /////////////////-------------------------------UPLOAD FILE---------------------
  const showDeleteFileDialog = ref<boolean>(false);
  const fileToDelete = ref<FileInfo | null>(null);
  const deleteFileMessage = computed(() => {
    return fileToDelete.value ? `Czy na pewno chcesz usunąć plik "${fileToDelete.value.name}"?` : '';
  });
  const confirmDeleteFile = (file: FileInfo) => {
    fileToDelete.value = file;
    showDeleteFileDialog.value = true;
  };
  const deleteFile = async () => {
    if (fileToDelete.value != null && device.value.files && device.value.files.length > 0) {
      device.value.files = device.value.files.filter(f => f.id !== fileToDelete.value?.id);
      showDeleteFileDialog.value = false;
      fileToDelete.value = null;
    }
  };

  const downloadFile = async (file: FileInfo) => {
    try {
      const blob = await filesStore.downloadFileDb('DEVICE_FILES', file.name);
      const url = window.URL.createObjectURL(blob);

      // Check if file can be displayed in browser
      const displayableTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/html',
      ];

      if (displayableTypes.includes(file.type)) {
        // Open in new window for displayable types
        window.open(url, '_blank');
      } else {
        // Trigger download for other file types
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się pobrać pliku.',
        life: 3000,
      });
    }
  };
</script>

<template>
  <TheMenuDevice />
  <AddDialog
    v-model:visible="showAddDeviceTypeModal"
    msg="Dodaj rodzaj urządzenia"
    label1="Nazwa:"
    @save="saveDeviceType"
    @cancel="showAddDeviceTypeModal = false"
  />
  <AddDialog
    v-model:visible="showAddDetailsModal"
    msg="Dodaj szczegóły produktu"
    label1="Klucz:"
    label2="Wartość:"
    :value1="tempDetail.at(0)"
    :value2="tempDetail.length > 0 ? tempDetail[1] : ''"
    @save="saveDetails"
    @cancel="showAddDetailsModal = false"
  />
  <AddMultipleDialog
    v-model:visible="showAddMultipleDetailsModal"
    msg="Dodaj szczegóły produktu"
    label1="Klucz:"
    label2="Wartość:"
    @save="saveMultipleDetails"
    @cancel="showAddMultipleDetailsModal = false"
  />
  <ConfirmationDialog
    v-model:visible="showDeleteConfirmationDialog"
    :msg="deleteConfirmationMessage"
    label="Usuń"
    @save="submitDelete"
    @cancel="showDeleteConfirmationDialog = false"
  />
  <ConfirmationDialog
    v-model:visible="showDeleteFileDialog"
    :msg="deleteFileMessage"
    label="Usuń"
    @save="deleteFile"
    @cancel="showDeleteFileDialog = false"
  />
  <div class="m-4 max-w-5xl mx-auto">
    <form @submit.stop.prevent="saveDevice">
      <Panel>
        <template #header>
          <IconButton
            title="Powrót do listy urządzeń"
            icon="pi pi-fw pi-bars"
            @click="() => router.push({ name: 'DevicesList' })"
          />
          <IconButton
            title="Powrót do listy urządzeń"
            icon="pi pi-fw pi-th-large"
            @click="() => router.push({ name: 'DevicesGrid' })"
          />
          <div class="w-full flex justify-center">
            <span class="m-0 text-2xl" :title="device?.name">
              {{
                isEdit
                  ? `Edycja: ${device?.name.length > 50 ? device?.name.substring(0, 50) + '...' : device?.name}`
                  : 'Nowe urzadzenie'
              }}
            </span>
          </div>
        </template>

        <!--  --------------------------------------------------------DEVICE---------------------------------      -->
        <Fieldset class="w-full" legend="Zakup">
          <div class="grid gap-4">
            <div class="col-start-1 col-span-4">
              <!-- ROW-1   NAME -->
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="title">Nazwa:</label>
                <InputText id="title" v-model="device.name" maxlength="200" :invalid="showErrorName()" />
                <small class="p-error">{{ showErrorName() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
              </div>

              <!-- ROW-2  DEVICE TYPE  -->
              <div class="flex gap-2">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="deviceType">Rodzaj urządzenia:</label>
                  <Select
                    id="deviceType"
                    v-model="device.deviceType"
                    :options="deviceStore.devicesTypes"
                    option-label="name"
                    :invalid="showErrorDeviceType()"
                    :loading="deviceStore.loadingDeviceTypes"
                  />
                  <small class="p-error">
                    {{ showErrorDeviceType() ? 'Pole jest wymagane.' : '&nbsp;' }}
                  </small>
                </div>
                <OfficeIconButton
                  title="Dodaj rodzaj urządzenia"
                  :icon="deviceStore.loadingDeviceTypes ? 'pi pi-spin pi-spinner' : 'pi pi-plus'"
                  style="height: 35px; width: 35px; padding: 0"
                  class="mt-3 self-center"
                  @click="showAddDeviceTypeModal = true"
                />
              </div>

              <!-- ROW-3   FIRM -->
              <div class="flex flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="input-customer">Wybierz firmę:</label>
                  <AutoComplete
                    id="input-customer"
                    v-model="device.firm"
                    dropdown
                    force-selection
                    :invalid="showErrorFirm()"
                    :suggestions="filteredFirms"
                    :loading="firmStore.loadingFirms"
                    option-label="name"
                    @complete="searchFirm"
                  />
                  <small class="p-error">
                    {{ showErrorFirm() ? 'Pole jest wymagane.' : '&nbsp;' }}
                  </small>
                </div>
              </div>

              <!-- ROW-4  PURCHASE DATE / AMOUNT  -->
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="purchase-date">Data zakupu:</label>
                  <DatePicker
                    id="purchase-date"
                    v-model="device.purchaseDate"
                    show-icon
                    :invalid="showErrorPurchaseDate()"
                    date-format="yy-mm-dd"
                  />
                  <small class="p-error">{{ showErrorPurchaseDate() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
                </div>
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="purchase-amount">Kwota zakupu:</label>
                  <InputNumber
                    id="purchase-amount"
                    v-model="device.purchaseAmount"
                    :class="{ 'p-invalid': showErrorPurchaseAmount() }"
                    :min-fraction-digits="2"
                    :max-fraction-digits="2"
                    mode="currency"
                    currency="PLN"
                    locale="pl-PL"
                    :invalid="showErrorPurchaseAmount()"
                    @focus="UtilsService.selectText"
                  />
                  <small class="p-error">{{ showErrorPurchaseAmount() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
                </div>
              </div>

              <!-- ROW-5  WARRANTY DATE  -->
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="warranty-date">Gwarancja do::</label>
                  <DatePicker
                    id="warranty-date"
                    v-model="device.warrantyEndDate"
                    show-icon
                    date-format="yy-mm-dd"
                    show-button-bar
                  />
                </div>
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="warranty-left">Pozostało...</label>
                  <InputText
                    id="warranty-left"
                    v-model="warrantyDateLeft"
                    :class="{
                      overdue: warrantyDateLeft === 'Gwarancja się skończyła.',
                      valid: warrantyDateLeft !== 'Gwarancja się skończyła.' && warrantyDateLeft !== 'Brak gwarancji.',
                    }"
                    :disabled="!device.warrantyEndDate"
                    readonly
                    @focus="UtilsService.selectText"
                  />
                </div>
              </div>

              <!-- ROW-6  INSURANCE DATE  -->
              <div class="flex flex-col md:flex-row gap-4 mt-5">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="warranty-date">Ubezpieczenie do::</label>
                  <DatePicker
                    id="warranty-date"
                    v-model="device.insuranceEndDate"
                    show-icon
                    date-format="yy-mm-dd"
                    show-button-bar
                  />
                </div>
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="insurance-left">Pozostało...</label>
                  <InputText
                    id="insurance-left"
                    v-model="insuranceDateLeft"
                    :class="{
                      overdue: insuranceDateLeft === 'Ubezpieczenie się skończyło.',
                      valid:
                        insuranceDateLeft !== 'Ubezpieczenie się skończyło.' &&
                        insuranceDateLeft !== 'Brak ubezpieczenia.',
                    }"
                    :disabled="!device.insuranceEndDate"
                    readonly
                    @focus="UtilsService.selectText"
                  />
                </div>
              </div>

              <!-- ROW-7   IMAGE URL -->
              <div class="flex flex-col mt-5">
                <label class="ml-2 mb-1" for="image">URL obrazka:</label>
                <InputText id="image" v-model="device.imageUrl" maxlength="2000" />
              </div>
            </div>
          </div>
        </Fieldset>

        <Fieldset v-if="device.files" class="w-full" legend="Pliki" :toggleable="true">
          <DataTable
            v-if="device.files.length > 0"
            :value="device.files"
            class="mt-4"
            :rows="10"
            :paginator="true"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            responsiveLayout="scroll"
          >
            <Column field="name" header="Nazwa pliku" :sortable="true">
              <template #body="slotProps">
                <div class="flex items-center">
                  <i :class="FileService.getFileIcon(slotProps.data.type)" class="mr-2"></i>
                  <a :href="slotProps.data.url" target="_blank" class="text-blue-600 hover:text-blue-800">
                    {{ slotProps.data.name }}
                  </a>
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
                <InputText v-model="slotProps.data.description" placeholder="Dodaj opis..." />
              </template>
            </Column>
            <Column header="Akcje" style="width: 100px">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <OfficeIconButton icon="pi pi-download" @click="downloadFile(slotProps.data)" />
                  <OfficeIconButton icon="pi pi-trash" severity="danger" @click="confirmDeleteFile(slotProps.data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </Fieldset>

        <Fieldset class="w-full" legend="Szczegóły" :toggleable="true">
          <Toolbar class="mb-6">
            <template #start>
              <ButtonOutlined text="Nowy" icon="pi pi-plus" icon-pos="left" class="mr-2" @click="openNew" />
            </template>
          </Toolbar>
          <DataTable
            :value="Array.from(device.details)"
            :reorderableColumns="true"
            @rowReorder="onRowReorder"
            tableStyle="min-width: 50rem"
            size="small"
          >
            <Column rowReorder headerStyle="width: 3rem" :reorderableColumn="false" />
            <Column field="0" header="Klucz" style="width: 40%"></Column>
            <Column field="1" header="Wartość" style="width: 40%"></Column>
            <Column header="Akcje">
              <template #body="slotProps">
                <OfficeIconButton
                  icon="pi pi-pencil"
                  class="mr-2"
                  @click="editDetails(slotProps.data, slotProps.index)"
                />
                <OfficeIconButton icon="pi pi-trash" severity="danger" @click="confirmDelete(slotProps.data)" />
              </template>
            </Column>
          </DataTable>
          <div class="flex flex-col gap-4"></div>
        </Fieldset>

        <Fieldset class="w-full" legend="Sprzedaż">
          <div class="grid gap-4">
            <div class="col-start-1 col-span-4">
              <!-- ROW-4  PURCHASE DATE / AMOUNT  -->
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="sell-date">Data sprzedaży:</label>
                  <DatePicker id="sell-date" v-model="device.sellDate" show-icon date-format="yy-mm-dd" />
                </div>
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="sell-amount">Kwota sprzedaży:</label>
                  <InputNumber
                    id="sell-amount"
                    v-model="device.sellAmount"
                    :min-fraction-digits="2"
                    :max-fraction-digits="2"
                    mode="currency"
                    currency="PLN"
                    locale="pl-PL"
                    @focus="UtilsService.selectText"
                  />
                </div>
              </div>
            </div>
          </div>
        </Fieldset>

        <!-- ROW-7  OTHER INFO  -->
        <Fieldset legend="Dodatkowe informacje">
          <Textarea id="description" v-model="device.otherInfo" fluid rows="5" cols="30" />
        </Fieldset>

        <!-- ROW-8  BTN SAVE -->
        <div class="flex flex-row justify-end gap-2 mt-6">
          <OfficeButton v-if="!isEdit" text="Reset" type="button" btn-type="office-regular" @click="resetForm()" />
          <OfficeButton
            text="zapisz"
            btn-type="office-save"
            type="submit"
            :loading="btnShowBusy"
            :btn-disabled="isSaveBtnDisabled"
          />
        </div>
      </Panel>
    </form>
  </div>
</template>

<style scoped>
  .overdue {
    border: 1px solid red;
  }

  .valid {
    border: 1px solid green;
  }
</style>
