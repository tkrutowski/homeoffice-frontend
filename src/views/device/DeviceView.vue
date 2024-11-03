<script setup lang="ts">
import {useRoute} from "vue-router";
import {useDevicesStore} from "@/stores/devices.ts";
import { useFirmsStore } from "@/stores/firms.ts";
import {computed, onMounted, ref, watch} from "vue";
import OfficeButton from "@/components/OfficeButton.vue";
import router from "@/router";
import IconButton from "@/components/OfficeIconButton.vue";
import {useToast} from "primevue/usetoast";
import AddDialog from "@/components/AddDialog.vue";
import OfficeIconButton from "@/components/OfficeIconButton.vue";
import {Device, DeviceType} from "@/types/Devices.ts";
import {Firm} from "@/types/Firm.ts";
import TheMenuDevice from "@/components/device/TheMenuDevice.vue";
import moment from "moment/moment";
import {UtilsService} from "@/service/UtilsService.ts";

const deviceStore = useDevicesStore();
const firmStore = useFirmsStore();
const route = useRoute();

const toast = useToast();
const selectedFirm = ref<Firm | undefined>();
const selectedDeviceType = ref<DeviceType | undefined>();

//
//AUTO COMPLETE FIRM
//
const filteredFirms = ref<Firm[]>([]);
const searchFirm = (event: { query: string }) => {
  filteredFirms.value = firmStore.firms.filter((firm) => {
    return firm.name.toLowerCase().includes(event.query.toLowerCase());
  });
};
watch(selectedFirm, (newFirm: Firm | undefined) => {
  device.value.firm = newFirm;
});

// PURCHASE DATE
const purchaseDateTemp = ref<string>("");
watch(purchaseDateTemp, (newDate: string) => {
  device.value.purchaseDate = moment(new Date(newDate)).format("YYYY-MM-DD");
});

// SELL DATE
const sellDateTemp = ref<string>("");
watch(sellDateTemp, (newDate: string) => {
  device.value.sellDate = moment(new Date(newDate)).format("YYYY-MM-DD");
});

// WARRANTY DATE
const warrantyDateTemp = ref<string>("");
const warrantyDateLeft = computed(() => {
  if (warrantyDateTemp.value === "") {
    return"Brak gwarancji.";
  }
  const today = moment(); // dzisiejsza data
  const futureDate = moment(device.value.warrantyEndDate); // odległa data (w formacie 'YYYY-MM-DD')
  const yearsRemaining = futureDate.diff(today, 'years');
  const futureDateWithoutYears = today.add(yearsRemaining, 'years');
  const daysRemaining = futureDate.diff(futureDateWithoutYears, 'days');
  if (yearsRemaining < 0 || daysRemaining < 0) {
    return ("Gwarancja się skończyła.");
  }
  if (yearsRemaining === 0){
    return (`${daysRemaining} dni.`);
  }
  return (`${yearsRemaining} lat(a) i ${daysRemaining} dni.`);

})
watch(warrantyDateTemp, (newDate: string) => {
  device.value.warrantyEndDate = moment(new Date(newDate)).format("YYYY-MM-DD");
});

// INSURANCE DATE
const insuranceDateTemp = ref<string>("");
const insuranceDateLeft = computed(() => {
  if (insuranceDateTemp.value === "") {
    return"Brak ubezpieczenia.";
  }
  const today = moment(); // dzisiejsza data
  const futureDate = moment(device.value.insuranceEndDate);
  const yearsRemaining = futureDate.diff(today, 'years');
  const futureDateWithoutYears = today.add(yearsRemaining, 'years');
  const daysRemaining = futureDate.diff(futureDateWithoutYears, 'days');
  if (yearsRemaining < 0 || daysRemaining < 0) {
    return ("Ubezpieczenie się skończyło.");
  }
  if (yearsRemaining === 0){
    return (`${daysRemaining} dni.`);
  }
  return (`${yearsRemaining} lat(a) i ${daysRemaining} dni.`);

})
watch(insuranceDateTemp, (newDate: string) => {
  device.value.insuranceEndDate = moment(new Date(newDate)).format("YYYY-MM-DD");
});

const device = ref<Device>({
  id: 0,
  series: undefined,
  deviceType: undefined,
  firm: undefined,
  name: "",
  purchaseDate: undefined,
  purchaseAmount: 0,
  sellDate: undefined,
  sellAmount: 0,
  warrantyEndDate: undefined,
  insuranceEndDate: undefined,
  otherInfo: "",
  activeStatus: "ACTIVE",
});

const btnShowError = ref<boolean>(false);
const btnShowBusy = ref<boolean>(false);
const btnShowOk = ref<boolean>(false);
const btnSaveDisabled = ref<boolean>(false);

const isSaveBtnDisabled = computed(() => {
  return (
      deviceStore.loadingDevices ||
      deviceStore.loadingDeviceTypes ||
      firmStore.loadingFirms ||
      btnSaveDisabled.value
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
  console.log("newDevice()");
  if (isNotValid()) {
    showError("Uzupełnij brakujące elementy");
    btnShowError.value = true;
    setTimeout(() => (btnShowError.value = false), 5000);
  } else {
    btnSaveDisabled.value = true;
    btnShowBusy.value = true;
    device.value.firm = selectedFirm.value;
    device.value.deviceType = selectedDeviceType.value;
    deviceStore.addDeviceDb(device.value).then(() => {
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zapisano urządzenie: " + device.value?.name,
        life: 3000,
      });
      btnShowBusy.value = false;
      btnShowOk.value = true;
      setTimeout(() => {
        resetForm();
      }, 1000);
    }).catch(reason => {
      console.log("reason", reason);
        toast.add({
          severity: "error",
          summary: "Błąd",
          detail: "Błąd podczas dodawania urządzenia.",
          life: 3000,
        });
        btnShowError.value = true;
    });

    btnSaveDisabled.value = false;
    btnShowBusy.value = false;
    submitted.value = false;
    setTimeout(() => {
      btnShowError.value = false;
      btnShowOk.value = false;
    }, 5000);
  }
}

//
//-----------------------------------------------------EDIT DEVICE------------------------------------------------
//
const isEdit = ref<boolean>(false);

async function editDevice() {
  if (isNotValid()) {
    showError("Uzupełnij brakujące elementy");
    btnShowError.value = true;
    setTimeout(() => (btnShowError.value = false), 5000);
  } else {
    btnSaveDisabled.value = true;
    console.log("editDevice()");
    device.value.firm = selectedFirm.value;
    device.value.deviceType = selectedDeviceType.value;
    await deviceStore.updateDeviceDb(device.value)
        .then(() => {
          toast.add({
            severity: "success",
            summary: "Potwierdzenie",
            detail: "Zaaktualizowano urządzenie: " + device.value?.name,
            life: 3000,
          });
          btnShowOk.value = true;
          setTimeout(() => {
            router.push({name: "Devices"});
          }, 3000);
        })
        .catch(() => {
          toast.add({
            severity: "error",
            summary: "Błąd",
            detail: "Błąd podczas edycji urządzenia.",
            life: 3000,
          });
          btnShowError.value = true;
          btnSaveDisabled.value = false;
          setTimeout(() => {
                btnShowError.value = false;
                btnShowOk.value = false;
                btnShowError.value = false;
              },
              5000);
        })
  }
}

//---------------------------------------------MOUNTED--------------------------------------------
onMounted(async () => {
  console.log("onMounted GET");
  btnSaveDisabled.value = true;
  if (firmStore.firms.length === 0) await firmStore.getFirmsFromDb();
  if (deviceStore.devicesTypes.length === 0) await deviceStore.getDeviceTypesFromDb();
  btnSaveDisabled.value = false;
});

onMounted(async () => {
  btnSaveDisabled.value = true;
  isEdit.value = route.params.isEdit === "true";
  const deviceId = Number(route.params.deviceId as string);
  if (!isEdit.value && deviceId === 0) {
    console.log("onMounted NEW DEVICE");
  } else {
    console.log("onMounted EDIT DEVICE");
    deviceStore
        .getDeviceFromDb(deviceId)
        .then((data) => {
          if (data) {
            device.value = data;
            selectedFirm.value = device.value.firm;
            selectedDeviceType.value = device.value.deviceType;
            sellDateTemp.value = UtilsService.formatDateToString(device.value.sellDate);
            insuranceDateTemp.value = UtilsService.formatDateToString(device.value.insuranceEndDate);
            purchaseDateTemp.value = device.value.purchaseDate;
            warrantyDateTemp.value = UtilsService.formatDateToString(device.value.warrantyEndDate);
          }
        })
        .catch((error) => {
          console.error("Błąd podczas pobierania urządzenia:", error);
        });
  }
  btnSaveDisabled.value = false;
});


//
//--------------------------------------------------DEVICE TYPE
//
const showAddDeviceTypeModal = ref(false);

async function saveDeviceType(name: string) {
  console.log("in1: ", name);
  showAddDeviceTypeModal.value = false;
  if (name.length === 0) {
    showError("Uzupełnij brakujące elementy");
  } else {
    deviceStore.addDeviceTypeDb({id: 0, name: name})
        .then(() => {
          toast.add({
            severity: "success",
            summary: "Potwierdzenie",
            detail: "Dodano rodzaj urządzenia: " + name,
            life: 3000,
          });

        })
        .catch(() => {
          toast.add({
            severity: "error",
            summary: "Błąd",
            detail: "Nie dodano rodzaju urządzenia: " + name,
            life: 3000,
          });

        })
  }
}

//
//------------------------------------------------ERROR----------------------------------------------------------
//
const submitted = ref(false);

const showError = (msg: string) => {
  toast.add({
    severity: "error",
    summary: "Error Message",
    detail: msg,
    life: 3000,
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
  return submitted.value &&  (!device.value.firm || device.value.firm.id === 0);
};
const showErrorPurchaseDate = () => {
  return submitted.value && purchaseDateTemp.value.length === 0;
};
const showErrorPurchaseAmount = () => {
  return submitted.value && device.value.purchaseAmount <= 0;
};
const showErrorDeviceType = () => {
  return submitted.value &&  !selectedDeviceType.value;
};

function resetForm() {
  device.value = {
    id: 0,
    series: undefined,
    deviceType: undefined,
    firm: undefined,
    name: "",
    purchaseDate: undefined,
    purchaseAmount: 0,
    sellDate: undefined,
    sellAmount: 0,
    warrantyEndDate: undefined,
    insuranceEndDate: undefined,
    otherInfo: "",
    activeStatus: "ACTIVE",
  };
  selectedDeviceType.value = undefined;
  selectedFirm.value = undefined;
  submitted.value = false;
  btnSaveDisabled.value = false;
}
</script>

<template>
  <Toast/>
<TheMenuDevice/>
  <AddDialog
      v-model:visible="showAddDeviceTypeModal"
      msg="Dodaj rodzaj urządzenia"
      label1="Nazwa:"
      @save="saveDeviceType"
      @cancel="showAddDeviceTypeModal = false"
  />
  <div class="m-4 max-w-6xl mx-auto">
    <form @submit.stop.prevent="saveDevice">
      <Panel>
        <template #header>
          <IconButton
              title="Powrót do listy urządzeń"
              icon="pi pi-fw pi-list"
              @click="() => router.push({ name: 'Devices' })"
          />
          <div class="w-full flex justify-center">
            <h2>
              {{ isEdit ? `Edycja urzadzenia: ${device?.name.length > 30 ? device?.name.substring(0, 30) + '...' : device?.name}` : "Nowe urzadzenie" }}
            </h2>

          </div>
        </template>

        <!--  --------------------------------------------------------DEVICE---------------------------------      -->
        <Fieldset class="w-full " legend="Zakup">
          <div class="grid grid-cols-6 gap-4">
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
                    showErrorName() ? "Pole jest wymagane." : "&nbsp;"
                  }}</small>
              </div>

              <!-- ROW-2  DEVICE TYPE  -->
              <div class="flex gap-2">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="deviceType">Rodzaj urządzenia:</label>
                  <Select
                      id="deviceType"
                      v-model="selectedDeviceType"
                      :options="deviceStore.devicesTypes"
                      option-label="name"
                      :invalid="showErrorDeviceType()"
                  />
                  <small class="p-error">
                    {{ showErrorDeviceType() ? "Pole jest wymagane." : "&nbsp;" }}
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
                  <label class="ml-1 mb-1" for="input-customer"
                  >Wybierz firmę:</label
                  >
                  <AutoComplete
                      id="input-customer"
                      v-model="selectedFirm"
                      dropdown
                      force-selection
                      :invalid="showErrorFirm()"
                      :suggestions="filteredFirms"
                      option-label="name"
                      @complete="searchFirm"
                  />
                  <small class="p-error">
                    {{ showErrorFirm() ? "Pole jest wymagane." : "&nbsp;" }}
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
                  <label class="ml-1 mb-1" for="purchase-date"
                  >Data zakupu:</label
                  >
                  <DatePicker
                      id="purchase-date"
                      v-model="purchaseDateTemp"
                      show-icon
                      :invalid="showErrorPurchaseDate()"
                      date-format="yy-mm-dd"
                  />
                  <small class="p-error">{{
                      showErrorPurchaseDate() ? "Pole jest wymagane." : "&nbsp;"
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
                      mode="currency" currency="PLN" locale="pl-PL"
                      :invalid="showErrorPurchaseAmount()"
                      @focus="UtilsService.selectText"
                  />
                  <small class="p-error">{{
                      showErrorPurchaseAmount()
                          ? "Pole jest wymagane."
                          : "&nbsp;"
                    }}</small>
                </div>
              </div>

              <!-- ROW-5  WARRANTY DATE  -->
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="warranty-date"
                  >Gwarancja do::</label
                  >
                  <DatePicker
                      id="warranty-date"
                      v-model="warrantyDateTemp"
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
                          'overdue': warrantyDateLeft === 'Gwarancja się skończyła.',
                          'valid':  warrantyDateLeft !== 'Gwarancja się skończyła.' &&  warrantyDateLeft !== 'Brak gwarancji.',
                       }"
                      :disabled="!warrantyDateTemp || warrantyDateTemp.length===0"
                      readonly
                      @focus="UtilsService.selectText"
                  />
                </div>
              </div>

              <!-- ROW-6  INSURANCE DATE  -->
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="warranty-date"
                  >Ubezpieczenie do::</label
                  >
                  <DatePicker
                      id="warranty-date"
                      v-model="insuranceDateTemp"
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
                          'overdue': insuranceDateLeft === 'Ubezpieczenie się skończyło.',
                          'valid':  insuranceDateLeft !== 'Ubezpieczenie się skończyło.' &&  insuranceDateLeft !== 'Brak ubezpieczenia.',
                       }"
                      :disabled="!insuranceDateTemp || insuranceDateTemp.length===0"
                      readonly
                      @focus="UtilsService.selectText"
                  />
                </div>
              </div>


            </div>
          </div>
        </Fieldset>

        <Fieldset class="w-full " legend="Sprzedaż">
          <div class="grid grid-cols-6 gap-4">
            <div class="col-start-1 col-span-4">

              <!-- ROW-4  PURCHASE DATE / AMOUNT  -->
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label class="ml-1 mb-1" for="sell-date"
                  >Data sprzedaży:</label
                  >
                  <DatePicker
                      id="sell-date"
                      v-model="sellDateTemp"
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
                      mode="currency" currency="PLN" locale="pl-PL"
                      @focus="UtilsService.selectText"
                  />
                </div>
              </div>
            </div>
          </div>
        </Fieldset>

        <!-- ROW-7  OTHER INFO  -->
        <Fieldset legend="Dodatkowe informacje">
          <Textarea
              id="description"
              v-model="device.otherInfo"
              fluid
              rows="5"
              cols="30"
          />
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
              :is-busy-icon="btnShowBusy"
              :is-error-icon="btnShowError"
              :is-ok-icon="btnShowOk"
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
