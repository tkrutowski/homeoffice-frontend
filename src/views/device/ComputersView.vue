<script setup lang="ts">
import {useDevicesStore} from '@/stores/devices.ts'
import {computed, onMounted, ref, watch} from 'vue'
import OfficeButton from '@/components/OfficeButton.vue'
import {useToast} from 'primevue/usetoast'
import type {Device} from '@/types/Devices.ts'
import TheMenuDevice from '@/components/device/TheMenuDevice.vue'
import {UtilsService} from '@/service/UtilsService'
import {useComputerStore} from "@/stores/computers.ts";
import type {ComponentType, Computer} from "@/types/Computer.ts";
import ComponentCategory from "@/components/device/ComponentCategory.vue";
import DeviceDetails from "@/components/device/DeviceDetails.vue";
import AddAutoComplete from "@/components/AddAutoCompleteDialog.vue";
import type {SelectChangeEvent} from "primevue/select";
import type {AxiosError} from "axios";
import AddDialog from "@/components/AddDialog.vue";

const deviceStore = useDevicesStore()
const computerStore = useComputerStore()

const toast = useToast()

onMounted(async () => {
  console.log('onMounted GET')
  if (deviceStore.devices.length === 0) await deviceStore.getDevices()
  if (computerStore.computers.length === 0) await computerStore.getComputers()
})

const deviceDetailsMap = ref<Map<ComponentType, Device[]>>(new Map<ComponentType, Device[]>())
const selectedComputer = ref<Computer | null>(null)
const hasChange = ref<boolean>(false)
const updating = ref<boolean>(false)

const panelHeight = ref<number>(0);
const devDetailsRef = ref<HTMLElement[]>([]);
watch(devDetailsRef.value, refs => {
  console.log('REFS', devDetailsRef.value)
  let height = 0
  refs.forEach((el: HTMLElement) => {
    if (el) {
      height += el.offsetHeight
    }
  });
  panelHeight.value = height
})


//refresh view
const refreshKey = ref<boolean>(false)

function selectedComputerChanged(event: SelectChangeEvent) {
  console.log("selectedComputerChanged", event)
  refreshKey.value = false
  hasChange.value = false;
  deviceDetailsMap.value = new Map<ComponentType, Device[]>()
  setTimeout(() => {
    refreshKey.value = true
  }, 300)

}


//
//---------------------------------------------------------NEW COMPUTER----------------------------------------------
//
const showAddComputerModal = ref<boolean>(false)

async function newComputer(name: string) {
  console.log('newComputer()', name)
  showAddComputerModal.value = false
  const computer: Computer = {
    name: name,
    activeStatus: 'ACTIVE',
    computerCase: 105,
    cooling: [],
    power: -1,
    disk: [],
    display: [],
    id: 1,
    keyboard: -1,
    motherboard: -1,
    mouse: -1,
    ram: [],
    info: '',
    processor: -1,
    soundCard: -1,
    graphicCard: [],
    usb: []
  }

  hasChange.value = false
  updating.value = true
  computerStore
      .addComputerDb(computer)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: 'Potwierdzenie',
          detail: 'Dodano nowy komputer: ' + computer.name,
          life: 3000,
        })
      })
      .catch((reason: AxiosError) => {
        console.log('reason', reason)
        if (reason.response?.status === 409) {
          toast.add({
            severity: 'warn',
            summary: 'Info',
            detail: 'Komputer o podanej nazwie już istnieje w bazie danych.',
            life: 3000,
          })
        } else {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas dodawania komputera.',
            life: 3000,
          })
          hasChange.value = true
        }
      })
      .finally(() => updating.value = false)
}

//
//-----------------------------------------------------EDIT COMPUTER------------------------------------------------
//
async function updateComputer() {
  console.log('updateComputer()')
  if (selectedComputer.value != null) {
    hasChange.value = false
    updating.value = true
    await computerStore
        .updateComputerDb(selectedComputer.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano komputer: ' + selectedComputer.value?.name,
            life: 3000,
          })
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas edycji komputera.',
            life: 3000,
          })
          hasChange.value = true
        })
        .finally(() => updating.value = false)
  }
}

//
//CATEGORY
//
const addToDisplayMap = async (componentType: ComponentType) => {
  if (selectedComputer.value != null) {
    const idOrIds = selectedComputer.value[componentType.column];
    let devices: Device[] = []
    if (Array.isArray(idOrIds)) {
      const devicesOrNull = await Promise.all(idOrIds.filter((id: number) => id > 0)
          .map((id: number) => deviceStore.getDevice(id)))
      devices = devicesOrNull.filter((dev: Device | null) => dev != null)
    } else if (typeof idOrIds === "number" && idOrIds > 0) {
      const newDevice: Device | null = await deviceStore.getDevice(idOrIds)
      if (newDevice !== null) devices.push(newDevice);
    }
    deviceDetailsMap.value.set(componentType, devices)
  }
}

const removeFromDisplayMap = async (componentType: ComponentType) => {
  deviceDetailsMap.value.delete(componentType)
}

//
//DISPLAY
//
const selectedDevicesCost = computed(() => {
  return Array.from(deviceDetailsMap.value.values())
      .flat()
      .map((device: Device) => device.purchaseAmount)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
})


const showAddModal = ref<boolean>(false)
const message = ref<string>("")
const componentType = ref<ComponentType | null>(null)

function openAddComponentDialog(compType: ComponentType) {
  console.log("openAddComponentDialog", compType)
  message.value = compType.viewName
  componentType.value = compType
  showAddModal.value = true
}

async function addComponent(id: number) {
  console.log('addComponent', id)
  showAddModal.value = false
  if (selectedComputer.value !== null && componentType.value !== null) {
    let columnValue = selectedComputer.value[componentType.value.column];
    if (componentType.value.max === 1 && columnValue instanceof Number) {
      columnValue = id
    }
    if (Array.isArray(columnValue)) {
      columnValue.push(id)
    }
    if (deviceDetailsMap.value.has(componentType.value)) {
      // Jeśli klucz istnieje, aktualizujemy istniejącą listę
      const existingDevices: Device[] = deviceDetailsMap.value.get(componentType.value) || [];
      const newDevice: Device | null = await deviceStore.getDevice(id)
      if (newDevice !== null) existingDevices.push(newDevice);
      deviceDetailsMap.value.set(componentType.value, existingDevices);
    } else {
      // Jeśli klucz nie istnieje, tworzymy nową listę
      const newDevice: Device | null = await deviceStore.getDevice(id)
      if (newDevice !== null)
        deviceDetailsMap.value.set(componentType.value, [newDevice]);
      else
        deviceDetailsMap.value.set(componentType.value, []);
    }
    hasChange.value = true;
  }
}

function removeComponent(part: ComponentType, device: Device) {
  console.log("removeComponent", part, device)
  //remove from selectedComputer
  if (selectedComputer.value !== null) {
    let columnValue = selectedComputer.value[part.column];
    if (part.max === 1) {
      columnValue = -1
    }
    if (Array.isArray(columnValue)) {
      const index = columnValue.findIndex((id: number) => id === device.id);
      if (index !== -1) {
        columnValue.splice(index, 1);
      }
    }
    //remove from displayMap
    if (deviceDetailsMap.value.has(part)) {
      const existingDevices = deviceDetailsMap.value.get(part) || [];
      const index = existingDevices.findIndex((dev: Device) => dev.id === device.id);
      if (index !== -1) {
        existingDevices.splice(index, 1);
        deviceDetailsMap.value.set(part, existingDevices);
      }
    }
    hasChange.value = true;
  }
}

const devices = computed(() => {
  return deviceStore.devices
      .filter((dev: Device) => dev.activeStatus === "ACTIVE")
      .map((dev: Device) => {
        return {
          id: dev.id,
          name: dev.name
        }
      })
})
</script>

<template>
  <TheMenuDevice/>
  <AddAutoComplete v-model:visible="showAddModal" :msg="message" :object-list="devices"
                   @cancel="() => showAddModal = false" @save="addComponent"/>
  <AddDialog
      v-model:visible="showAddComputerModal"
      msg="Dodaj komputer"
      label1="Nazwa komputera:"
      @save="newComputer"
      @cancel="showAddComputerModal = false"
  />
  <Toolbar class="m-6">
    <template #start>
      <OfficeButton btn-type="office-regular" text="Nowy" icon-pos="left" icon="pi pi-plus" size="small"
                    @click="showAddComputerModal=true" btn-disabled/>
    </template>

    <template #center>
      <Select v-model="selectedComputer" :options="computerStore.computers" optionLabel="name"
              placeholder="Wybierz komputer" @change="selectedComputerChanged"/>
      <div v-if="computerStore.loadingComputers">
        <ProgressSpinner style="width: 35px; height: 35px" stroke-width="5"/>
      </div>
    </template>

    <template #end>
      <OfficeButton btn-type="office-save" text="zapisz" :btn-disabled="!hasChange" icon="pi pi-save" size="small"
                    class="mr-2"
                    :loading="updating" @click="updateComputer"/>
    </template>
  </Toolbar>
  <div v-if="selectedComputer" class="flex gap-4 m-6">
    <Card class="flex-1 min-w-96 min-h-[calc(100vh-440px)]">
      <template #title>
        <div class="flex justify-center">
          <span class="font-bold text-2xl">Kategorie</span>
        </div>
      </template>
      <template #content>
        <ScrollPanel class=" overflow-y-auto min-h-[calc(100vh-440px)]"
                     :style="{maxHeight: panelHeight + 'px'}">
          <p v-if="refreshKey"> refreshkey</p>
          <p v-else> !refreshkey</p>
          <div v-if="refreshKey">

            <div v-for="type in computerStore.componentTypes" :key="type.name">
              <ComponentCategory :componentType="type" :computer="selectedComputer"
                                 @addView="addToDisplayMap" @removeView="removeFromDisplayMap"/>
            </div>
          </div>
        </ScrollPanel>
      </template>
    </Card>

    <Panel class="w-full" ref="panelRef">
      <template #header>
        <div class="w-full flex justify-center gap-4">
          <span class="font-bold text-3xl ml-2 text-color">Wybrane kategorie: {{
              UtilsService.formatCurrency(selectedDevicesCost)
            }}</span>
          <div v-if="deviceStore.loadingDevices || computerStore.loadingComputers">
            <ProgressSpinner style="width: 35px; height: 35px" stroke-width="5"/>
          </div>
        </div>
      </template>
      <div v-for="[category, devices] in deviceDetailsMap" :key="category.name" ref="devDetailsRef">
        <DeviceDetails :component-type="category" :devices="devices" @add="openAddComponentDialog"
                       @remove="removeComponent" class="mb-5"/>
      </div>
    </Panel>
  </div>
</template>
