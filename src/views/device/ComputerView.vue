<script setup lang="ts">
import {useBooksStore} from '../../stores/books'
import {useRoute} from 'vue-router'
import {computed, onMounted, ref} from 'vue'
import OfficeButton from '../../components/OfficeButton.vue'
import router from '../../router'
import IconButton from '../../components/OfficeIconButton.vue'
import {useToast} from 'primevue/usetoast'
import TheMenuLibrary from '../../components/library/TheMenuLibrary.vue'
import type {AxiosError} from "axios";
import type {Component, Computer} from "@/types/Computer.ts";
import {useComputerStore} from "@/stores/computers.ts";
import {useDevicesStore} from "@/stores/devices.ts";
import AddAutoComplete from "@/components/AddAutoCompleteDialog.vue";
import type {Device} from "@/types/Devices.ts";
import OfficeIconButton from "@/components/OfficeIconButton.vue";

const bookStore = useBooksStore()
const route = useRoute()

const deviceStore = useDevicesStore()
const computerStore = useComputerStore()
const toast = useToast()

const computer = ref<Computer>({
  name: '',
  activeStatus: 'ACTIVE',
  case: -1,
  cooling: [],
  power: -1,
  disk: [],
  monitor: [],
  id: -1,
  keyboard: -1,
  motherboard: -1,
  mouse: -1,
  ram: [],
  otherInfo: '',
  processor: -1,
  soundCard: -1,
  graphicCard: [],
  usb: []
})

const btnShowBusy = ref<boolean>(false)
const btnSaveDisabled = ref<boolean>(false)

const isSaveBtnDisabled = computed(() => {
  return (
      deviceStore.loadingDevices ||
      deviceStore.loadingDeviceTypes ||
      btnSaveDisabled.value
  )
})

//
//SAVE
//
function save() {
  submitted.value = true
  if (isEdit.value) {
    editComputer()
  } else {
    newComputer()
  }
}

//
//---------------------------------------------------------NEW COMPUTER----------------------------------------------
//
async function newComputer() {
  console.log('newComputer()')
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    computerStore
        .addComputerDb(computer.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano nowy komputer: ' + computer.value?.name,
            life: 3000,
          })
        })
        .catch((reason: AxiosError) => {
          console.log('reason', reason)
          if (reason.response?.status === 409) {
            toast.add({
              severity: 'warn',
              summary: 'Info',
              detail: 'Komputer już istnieje w bazie danych.',
              life: 3000,
            })
          } else {
            toast.add({
              severity: 'error',
              summary: reason?.message,
              detail: 'Błąd podczas dodawania komputera.',
              life: 3000,
            })
          }
        })

    btnSaveDisabled.value = false
    submitted.value = false
  }
}

//
//-----------------------------------------------------EDIT COMPUTER------------------------------------------------
//
const isEdit = ref<boolean>(false)

async function editComputer() {
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    console.log('editComputer()')
    await computerStore
        .updateComputerDb(computer.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano komputer: ' + computer.value?.name,
            life: 3000,
          })
          setTimeout(() => {
            router.push({name: 'ComputersView'})
          }, 3000)
        })
        .catch((reason: AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason?.message,
            detail: 'Błąd podczas edycji komputera.',
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
  if (deviceStore.devices.length === 0) deviceStore.getDevices()
  btnSaveDisabled.value = false
  isEdit.value = route.params.isEdit === 'true'
  const compId = Number(route.params.compId as string)
  if (!isEdit.value && compId === 0) {
  } else {
    computerStore
        .getComputerFromDb(compId)
        .then((data: Computer | null) => {
          if (data) {
            computer.value = data
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania komputera:', error)
        })
  }
  btnSaveDisabled.value = false
})


const showAddModal = ref<boolean>(false)
const message = ref<string>("")
const component = ref<Component>('NONE')
const devices = computed(() => {
  return deviceStore.devices.map((dev: Device) => {
    return {
      id: dev.id,
      name: dev.name
    }
  })
})

function openAddComponentDialog(msg: string, part: Component) {
  message.value = msg
  component.value = part
  showAddModal.value = true
}

function addComponent(id: number) {
  showAddModal.value = false
  switch (component.value) {
    case 'PROCESSOR':
      computer.value.processor = id
      break;
    case 'MOTHERBOARD':
      computer.value.motherboard = id
      break;
  }
  component.value='NONE'
}


//
//------------------------------------------------ERROR----------------------------------------------------------
//
const submitted = ref(false)

const showError = (msg: string) => {
  toast.add({
    severity: 'error',
    summary: 'Error Message',
    detail: msg,
    life: 3000,
  })
}
const isNotValid = () => {
  return showErrorName()
}
const showErrorName = () => {
  return submitted.value && computer.value.name.length === 0
}
</script>

<template>
  <Toast/>
  <TheMenuLibrary/>
  <AddAutoComplete v-model:visible="showAddModal" :msg="message" :object-list="devices"
                   @cancel="() => showAddModal = false" @save="addComponent"/>

  <div class="m-4 max-w-6xl mx-auto">
    <form @submit.stop.prevent="save">
      <Panel>
        <template #header>
          <IconButton
              title="Powrót do listy komputerów"
              icon="pi pi-fw pi-list"
              @click="() => router.push({ name: 'Computers' })"
          />
          <div class="w-full flex justify-center">
            <p class="text-2xl">
              {{ isEdit ? `Edycja komputera: ${computer?.title}` : 'Nowy komputer' }}
            </p>
          </div>
        </template>
        <template #footer>
          <div class="flex flex-row justify-end gap-2 mt-6">
            <OfficeButton
                text="zapisz"
                btn-type="office-save"
                type="submit"
                :loading="btnShowBusy"
                :btn-disabled="isSaveBtnDisabled"
            />
          </div>
        </template>
        <!--    NAME    -->
        <div class="flex flex-col">
          <label for="name">Nazwa</label>
          <InputText id="name" v-model="computer.name" maxlength="50" :invalid="showErrorName()"/>
          <small class="text-red-500">{{
              showErrorName() ? 'Pole jest wymagane.' : '&nbsp;'
            }}</small>
        </div>

        <!--    PROCESSOR    -->
        <Panel toggleable collapsed class="mb-5">
          <template #header>
            <div class="flex items-center gap-2">
              <span class="font-bold">Procesor</span>
            </div>
          </template>

          <template #icons>
            <Button icon="pi pi-plus" severity="secondary" rounded text @click="openAddComponentDialog('Wybierz procesor:', 'PROCESSOR')"
                    :disabled="computer.processor > 0"/>
          </template>
          <div v-if="computer.processor > 0" class="flex items-center gap-2">
            {{ deviceStore.devices.find((dev: Device) => dev.id === computer.processor)?.name }}
            <OfficeIconButton
                title="Usuń procesor"
                icon="pi pi-trash"
                severity="danger"
                @click="()=>computer.processor = -1"
            />
          </div>
        </Panel>

        <!--    MOTHERBOARD    -->
        <Panel toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <span class="font-bold">Płyta główna</span>
            </div>
          </template>

          <template #icons>
            <Button icon="pi pi-plus" severity="secondary" rounded text @click="openAddComponentDialog('Wybierz płytę główną:', 'MOTHERBOARD')"
                    :disabled="computer.motherboard > 0"/>
          </template>
          <div v-if="computer.motherboard > 0" class="flex items-center gap-2">
            {{ deviceStore.devices.find((dev: Device) => dev.id === computer.motherboard)?.name }}
            <OfficeIconButton
                title="Usuń płytę główną"
                icon="pi pi-trash"
                severity="danger"
                @click="()=>computer.motherboard = -1"
            />
          </div>
        </Panel>


      </Panel>
    </form>
  </div>
</template>

<style scoped></style>
