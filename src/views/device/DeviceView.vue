<script setup lang="ts">
import {useRoute} from 'vue-router'
import {useDevicesStore} from '../../stores/devices'
import {useFirmsStore} from '../../stores/firms'
import {computed, onMounted, ref} from 'vue'
import OfficeButton from '../../components/OfficeButton.vue'
import router from '../../router'
import IconButton from '../../components/OfficeIconButton.vue'
import OfficeIconButton from '../../components/OfficeIconButton.vue'
import {useToast} from 'primevue/usetoast'
import AddDialog from '../../components/AddDialog.vue'
import type {Device} from '../../types/Devices'
import type {Firm} from '../../types/Firm'
import TheMenuDevice from '../../components/device/TheMenuDevice.vue'
import moment from 'moment/moment'
import {UtilsService} from '../../service/UtilsService'
import type {AxiosError} from "axios";
import type {DataTableRowReorderEvent} from "primevue";
import ConfirmationDialog from "../../components/ConfirmationDialog.vue";

const deviceStore = useDevicesStore()
const firmStore = useFirmsStore()
const route = useRoute()

const toast = useToast()

//
//AUTO COMPLETE FIRM
//
const filteredFirms = ref<Firm[]>([])
const searchFirm = (event: { query: string }) => {
  filteredFirms.value = firmStore.firms.filter((firm: Firm) => {
    return firm.name.toLowerCase().includes(event.query.toLowerCase())
  })
}
const warrantyDateLeft = computed(() => {
  if (device.value.warrantyEndDate) {
    const today = moment() // dzisiejsza data
    const futureDate = moment(device.value.warrantyEndDate) // odległa data (w formacie 'YYYY-MM-DD')
    const yearsRemaining = futureDate.diff(today, 'years')
    const futureDateWithoutYears = today.add(yearsRemaining, 'years')
    const daysRemaining = futureDate.diff(futureDateWithoutYears, 'days')
    if (yearsRemaining < 0 || daysRemaining < 0) {
      return 'Gwarancja się skończyła.'
    }
    if (yearsRemaining === 0) {
      return `${daysRemaining} dni.`
    }
    return `${yearsRemaining} lat(a) i ${daysRemaining} dni.`
  }
  return 'Brak gwarancji.'
})
// INSURANCE DATE
const insuranceDateLeft = computed(() => {
  const today = moment() // dzisiejsza data
  if (device.value.insuranceEndDate) {
    const futureDate = moment(device.value.insuranceEndDate)
    const yearsRemaining = futureDate.diff(today, 'years')
    const futureDateWithoutYears = today.add(yearsRemaining, 'years')
    const daysRemaining = futureDate.diff(futureDateWithoutYears, 'days')
    if (yearsRemaining < 0 || daysRemaining < 0) {
      return 'Ubezpieczenie się skończyło.'
    }
    if (yearsRemaining === 0) {
      return `${daysRemaining} dni.`
    }
    return `${yearsRemaining} lat(a) i ${daysRemaining} dni.`
  }
  return 'Brak ubezpieczenia.'
})

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
  imageUrl:'',
  details: new Map<string, string>()
})

const btnShowBusy = ref<boolean>(false)
const btnSaveDisabled = ref<boolean>(false)

const isSaveBtnDisabled = computed(() => {
  return (
      deviceStore.loadingDevices ||
      deviceStore.loadingDeviceTypes ||
      firmStore.loadingFirms ||
      btnSaveDisabled.value
  )
})

//
//SAVE
//
function saveDevice() {
  submitted.value = true
  if (isEdit.value) {
    editDevice()
  } else {
    newDevice()
  }
}

//
//---------------------------------------------------------NEW DEVICE----------------------------------------------
//
async function newDevice() {
  console.log('newDevice()')
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    btnShowBusy.value = true
    deviceStore
        .addDeviceDb(device.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zapisano urządzenie: ' + device.value?.name,
            life: 3000,
          })
          btnShowBusy.value = false
          setTimeout(() => {
            resetForm()
          }, 1000)
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason.message,
            detail: 'Błąd podczas dodawania urządzenia.',
            life: 3000,
          })
        })

    btnSaveDisabled.value = false
    btnShowBusy.value = false
    submitted.value = false
  }
}

//
//-----------------------------------------------------EDIT DEVICE------------------------------------------------
//
const isEdit = ref<boolean>(false)

async function editDevice() {
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    console.log('editDevice()')
    await deviceStore
        .updateDeviceDb(device.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano urządzenie: ' + device.value?.name,
            life: 3000,
          })
          setTimeout(() => {
            router.go(-1)
          }, 3000)
        })
        .catch(() => {
          toast.add({
            severity: 'error',
            summary: 'Błąd',
            detail: 'Błąd podczas edycji urządzenia.',
            life: 3000,
          })
          btnSaveDisabled.value = false
        })
  }
}

//---------------------------------------------MOUNTED--------------------------------------------
onMounted(async () => {
  console.log('onMounted GET')
  btnSaveDisabled.value = true
  if (firmStore.firms.length === 0) await firmStore.getFirmsFromDb()
  if (deviceStore.devicesTypes.length === 0) await deviceStore.getDeviceTypesFromDb()
  isEdit.value = route.params.isEdit === 'true'
  const deviceId = Number(route.params.deviceId as string)
  if (!isEdit.value && deviceId === 0) {
    console.log('onMounted NEW DEVICE')
  } else {
    console.log('onMounted EDIT DEVICE')
    deviceStore
        .getDeviceFromDb(deviceId)
        .then((data: Device | null) => {
          if (data) {
            device.value = data
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania urządzenia:', error)
        })
  }
  btnSaveDisabled.value = false
})

//
//--------------------------------------------------DEVICE TYPE
//
const showAddDeviceTypeModal = ref(false)

async function saveDeviceType(name: string) {
  console.log('in1: ', name)
  showAddDeviceTypeModal.value = false
  if (name.length === 0) {
    showError('Uzupełnij brakujące elementy')
  } else {
    deviceStore
        .addDeviceTypeDb({id: 0, name: name})
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano rodzaj urządzenia: ' + name,
            life: 3000,
          })
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason.message,
            detail: 'Nie dodano rodzaju urządzenia: ' + name,
            life: 3000,
          })
        })
  }
}

//
//------------------------------------------------ERROR----------------------------------------------------------
//
const submitted = ref(false)

const showError = (msg: string) => {
  toast.add({
    severity: 'error',
    summary: 'Błąd',
    detail: msg,
    life: 3000,
  })
}
const isNotValid = () => {
  return (
      showErrorName() ||
      showErrorPurchaseDate() ||
      showErrorPurchaseAmount() ||
      showErrorDeviceType() ||
      showErrorFirm()
  )
}
const showErrorName = () => {
  return submitted.value && device.value.name.length === 0
}
const showErrorFirm = () => {
  return submitted.value && (!device.value.firm || device.value.firm.id === 0)
}
const showErrorPurchaseDate = () => {
  return submitted.value && !device.value.purchaseDate
}
const showErrorPurchaseAmount = () => {
  return submitted.value && device.value.purchaseAmount <= 0
}
const showErrorDeviceType = () => {
  return submitted.value && !device.value.deviceType
}

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
    imageUrl: ''
  }
  submitted.value = false
  btnSaveDisabled.value = false
}

//
//--------------------------------------------------DETAILS
//
const showAddDetailsModal = ref<boolean>(false)

const onRowReorder = (event: DataTableRowReorderEvent) => {
  console.log('onRowReorder', event)
  device.value.details = new Map<string, string>(
      [...event.value]
  )
};

//DELETE
const showDeleteConfirmationDialog = ref<boolean>(false)
const tempDetail = ref<string[]>([]);
const confirmDelete = (entry: string[]) => {
  tempDetail.value = entry

  showDeleteConfirmationDialog.value = true
}
const deleteConfirmationMessage = computed(() => {
  if (tempDetail.value) return `Czy chcesz usunąc wpis: <b>${tempDetail.value[0]} : ${tempDetail.value[1]}</b>?`
  return 'No message'
})
const submitDelete = async () => {
  if (tempDetail.value) {
    device.value.details.delete(tempDetail.value[0])
  }
  showDeleteConfirmationDialog.value = false
}
// ADD
const openNew = () => {
  tempDetail.value = [];
  showAddDetailsModal.value = true;
};
//EDIT
const editIndex = ref<number>(-1)
const editDetails = (detail: string[], index: number) => {
  tempDetail.value = detail
  editIndex.value = index
  showAddDetailsModal.value = true;
};

async function saveDetails(keyToAdd: string, valueToAdd: string) {
  console.log("keyToAdd, value", keyToAdd, valueToAdd)
  showAddDetailsModal.value = false
  if (keyToAdd.length === 0 || valueToAdd.length === 0) {
    showError('Klucz i wartość nie mogą być puste')
  } else {
    if (keyToAdd === tempDetail.value[0] || (keyToAdd !== tempDetail.value[0] && editIndex.value === -1)) {
      device.value.details.set(keyToAdd, valueToAdd)
    } else {
      const newMap = new Map<string, string>()
      let index = 0;
      device.value.details.delete(tempDetail.value[0])
      device.value.details.forEach((key, value) => {
        if (index === editIndex.value) {
          newMap.set(keyToAdd, valueToAdd)
        }
        newMap.set(key, value)
        index++
      })
      device.value.details = newMap
      editIndex.value = -1
    }
  }
}
</script>

<template>
  <TheMenuDevice/>
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


  <ConfirmationDialog
      v-model:visible="showDeleteConfirmationDialog"
      :msg="deleteConfirmationMessage"
      label="Usuń"
      @save="submitDelete"
      @cancel="showDeleteConfirmationDialog = false"
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
          <div class="grid  gap-4">
            <div class="col-start-1 col-span-4">
              <!-- ROW-1   NAME -->
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="title">Nazwa:</label>
                <InputText
                    id="title"
                    v-model="device.name"
                    maxlength="200"
                    :invalid="showErrorName()"
                />
                <small class="p-error">{{
                    showErrorName() ? 'Pole jest wymagane.' : '&nbsp;'
                  }}</small>
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
                <div v-if="deviceStore.loadingDeviceTypes" class="mt-4">
                  <ProgressSpinner
                      class="ml-2 mt-1"
                      style="width: 40px; height: 40px"
                      stroke-width="5"
                  />
                </div>
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
                      option-label="name"
                      @complete="searchFirm"
                  />
                  <small class="p-error">
                    {{ showErrorFirm() ? 'Pole jest wymagane.' : '&nbsp;' }}
                  </small>
                </div>
                <div v-if="firmStore.loadingFirms" class="content-center">
                  <ProgressSpinner
                      class="ml-2 mt-1"
                      style="width: 30px; height: 30px"
                      stroke-width="5"
                  />
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
                  <small class="p-error">{{
                      showErrorPurchaseDate() ? 'Pole jest wymagane.' : '&nbsp;'
                    }}</small>
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
                  <small class="p-error">{{
                      showErrorPurchaseAmount() ? 'Pole jest wymagane.' : '&nbsp;'
                    }}</small>
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
                      valid:
                        warrantyDateLeft !== 'Gwarancja się skończyła.' &&
                        warrantyDateLeft !== 'Brak gwarancji.',
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
                <InputText
                    id="image"
                    v-model="device.imageUrl"
                    maxlength="2000"
                />
              </div>
            </div>
          </div>
        </Fieldset>

        <Fieldset class="w-full" legend="Szczegóły" :toggleable="true">
          <Toolbar class="mb-6">
            <template #start>
              <OfficeButton btn-type="office-regular" text="Nowy" icon-pos="left" icon="pi pi-plus" class="mr-2" size="small" @click="openNew"/>
            </template>
          </Toolbar>
          <DataTable :value="Array.from(device.details)" :reorderableColumns="true" @rowReorder="onRowReorder"
                     tableStyle="min-width: 50rem" size="small">
            <Column rowReorder headerStyle="width: 3rem" :reorderableColumn="false"/>
            <Column field="0" header="Klucz" style="width: 40%;"></Column>
            <Column field="1" header="Wartość" style="width:40%;"></Column>
            <Column header="Akcje">
              <template #body="slotProps">
                <OfficeIconButton icon="pi pi-pencil" class="mr-2"
                        @click="editDetails(slotProps.data, slotProps.index)"/>
                <OfficeIconButton icon="pi pi-trash"  severity="danger" @click="confirmDelete(slotProps.data)"/>
              </template>
            </Column>
          </DataTable>
          <div class="flex flex-col gap-4">
          </div>
        </Fieldset>

        <Fieldset class="w-full" legend="Sprzedaż">
          <div class="grid gap-4">
            <div class="col-start-1 col-span-4">
              <!-- ROW-4  PURCHASE DATE / AMOUNT  -->
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="sell-date">Data sprzedaży:</label>
                  <DatePicker
                      id="sell-date"
                      v-model="device.sellDate"
                      show-icon
                      date-format="yy-mm-dd"
                  />
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
          <Textarea id="description" v-model="device.otherInfo" fluid rows="5" cols="30"/>
        </Fieldset>

        <!-- ROW-8  BTN SAVE -->
        <div class="flex flex-row justify-end gap-2 mt-6">
          <OfficeButton
              v-if="!isEdit"
              text="Reset"
              type="button"
              btn-type="office-regular"
              @click="resetForm()"
          />
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
