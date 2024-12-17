<script setup lang="ts">
import {useRoute} from 'vue-router'
import {onMounted, ref} from 'vue'
import {useCardsStore} from '../../stores/cards'
import {useBanksStore} from '../../stores/banks'
import {useUsersStore} from '../../stores/users'
import {useToast} from 'primevue/usetoast'
import OfficeButton from '../../components/OfficeButton.vue'
import router from '../../router'
import IconButton from '../../components/OfficeIconButton.vue'
import type {User} from '../../types/User'
import type {Bank, Card} from '../../types/Bank'
import TheMenuFinance from '../../components/finance/TheMenuFinance.vue'
import {UtilsService} from '../../service/UtilsService'
import type {AxiosError} from "axios";

const route = useRoute()
const cardStore = useCardsStore()
const bankStore = useBanksStore()
const userStore = useUsersStore()
const toast = useToast()

// const card = ref<Card>();
const card = ref<Card>({
  id: 0,
  idBank: 0,
  idUser: 0,
  name: '',
  activationDate: null,
  limit: 0,
  repaymentDay: 1,
  expirationDate: null,
  otherInfo: '',
  activeStatus: 'ACTIVE',
  cardNumber: '',
  closingDay: 1,
  imageUrl: '',
})

const btnShowBusy = ref<boolean>(false)
const btnSaveDisabled = ref<boolean>(false)


// const isSaveBtnDisabled = computed(() => {
//   return (
//       bookStore.loadingBooks ||
//       bookStore.loadingSeries ||
//       bookStore.loadingAuthors ||
//       btnSaveDisabled.value
//   );
// });

// const activationDate = ref<Date | Date[] | (Date | null)[] | null | undefined>(null)
// watch(activationDate, (newDate: Date | null) => {
//   if (card.value) card.value.activationDate = newDate
// })
// const expirationDate = ref<Date | Date[] | (Date | null)[] | null | undefined>(null)
// watch(expirationDate, (newDate: Date | null) => {
//   if (card.value) card.value.expirationDate = newDate
// })

const selectedUser = ref<User | null>(null)

function onUserChange() {
  if (selectedUser.value) {
    card.value.idUser = selectedUser.value?.id
  }
}

const selectedBank = ref<Bank | null>(null)

function onBankChange() {
  if (selectedBank.value) {
    card.value.idBank = selectedBank.value?.id
  }
}

//
//SAVE
//
function saveCard() {
  submitted.value = true
  if (isEdit.value) {
    editCard()
  } else {
    newCard()
  }
}

//
//---------------------------------------------------------NEW BOOK----------------------------------------------
//
async function newCard() {
  console.log('newCard()')
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    btnShowBusy.value = true
    cardStore
        .addCardDb(card.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Dodano kartę: ' + card.value?.name,
            life: 3000,
          })
          btnShowBusy.value = false
          setTimeout(() => {
            resetForm()
          }, 1000)
        })
        .catch((reason: AxiosError) => {
          console.log('reason', reason)
          if (reason.response?.status === 409) {
            toast.add({
              severity: 'warn',
              summary: 'Info',
              detail: 'Karta o tej nazwię już istnieje w bazie danych.',
              life: 3000,
            })
          } else {
            toast.add({
              severity: 'error',
              summary: 'Błąd',
              detail: 'Błąd podczas dodawania książki.',
              life: 3000,
            })
          }
        })

    btnSaveDisabled.value = false
    btnShowBusy.value = false
    submitted.value = false
  }
}

//
//-----------------------------------------------------EDIT BOOK------------------------------------------------
//
const isEdit = ref<boolean>(false)

async function editCard() {
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    console.log('editCard()')
    await cardStore
        .updateCardDb(card.value)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: 'Potwierdzenie',
            detail: 'Zaaktualizowano kartę: ' + card.value?.name,
            life: 3000,
          })
          setTimeout(() => {
            router.push({name: 'Cards'})
          }, 3000)
        })
        .catch((reason:AxiosError) => {
          toast.add({
            severity: 'error',
            summary: reason.message,
            detail: 'Błąd podczas edycji karty.',
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
  if (userStore.users.length === 0) await userStore.getUsersFromDb()
  if (bankStore.banks.length === 0) await bankStore.getBanksFromDb()
  isEdit.value = route.params.isEdit === 'true'
  const cardId = Number(route.params.cardId as string)
  if (!isEdit.value && cardId === 0) {
    console.log('onMounted NEW CARD')
  } else {
    console.log('onMounted EDIT CARD')
    cardStore
        .getCardFromDb(cardId)
        .then((data: Card | null) => {
          if (data) {
            card.value = data
            selectedUser.value = userStore.getUser(card.value.idUser)
            selectedBank.value = bankStore.getBank(card.value.idBank)
            // activationDate.value = card.value.activationDate
            // expirationDate.value = card.value.expirationDate
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania kart:', error)
        })
  }
  btnSaveDisabled.value = false
})

function resetForm() {
  card.value = {
    id: 0,
    idBank: 0,
    idUser: 0,
    name: '',
    activationDate: null,
    limit: 0,
    repaymentDay: 1,
    expirationDate: null,
    otherInfo: '',
    activeStatus: 'ACTIVE',
    cardNumber: '',
    closingDay: 1,
    imageUrl: '',
  }
  selectedBank.value = null
  selectedUser.value = null
  submitted.value = false
  btnSaveDisabled.value = false
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
  return (
      showErrorName() ||
      showErrorNumber() ||
      showErrorLimit() ||
      showErrorUser() ||
      showErrorBank() ||
      showErrorExpirationDate() ||
      showErrorActivationDate()
  )
}
const showErrorName = () => {
  return submitted.value && card.value.name.length === 0
}
const showErrorNumber = () => {
  return submitted.value && card.value.cardNumber.length === 0
}
const showErrorLimit = () => {
  return submitted.value && card.value.limit == 0
}
const showErrorUser = () => {
  return submitted.value && card.value.idUser <= 0
}
const showErrorBank = () => {
  return submitted.value && card.value.idBank <= 0
}
const showErrorExpirationDate = () => {
  return submitted.value && !card.value.expirationDate
}
const showErrorActivationDate = () => {
  return submitted.value && !card.value.activationDate
}
</script>

<template>
  <Toast/>
  <TheMenuFinance/>

  <div class="m-4 max-w-4xl mx-auto">
    <form @submit.stop.prevent="saveCard">
      <Panel>
        <template #header>
          <IconButton
              v-tooltip.right="{
              value: 'Powrót do listy kart',
              showDelay: 500,
              hideDelay: 300,
            }"
              icon="pi pi-fw pi-list"
              @click="() => router.push({ name: 'Cards' })"
          />
          <div class="w-full flex justify-center">
            <h2>
              {{ isEdit ? `Edycja karty: ${card?.name}` : 'Nowa karta' }}
            </h2>
          </div>
        </template>

        <!--  --------------------------------------------------------CARD---------------------------------      -->
        <Fieldset class="w-full" legend="Karta">
          <div class="grid grid-cols-6 gap-4">
            <!-- IMAGE -->
            <div class="col-start-1 col-span-2 mt-4 ml-2">
              <img
                  v-if="card.imageUrl.length > 0"
                  :src="card.imageUrl"
                  height="90"
                  width="140"
                  alt="Karta"
              />
              <img v-else src="@/assets/images/no-card.jpg" height="100" width="200" alt="Karta"/>
            </div>

            <div class="col-start-3 col-span-4">
              <!-- ROW-1   NAME -->
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="name">Nazwa:</label>
                <InputText
                    id="name"
                    v-model="card.name"
                    maxlength="200"
                    :class="{ 'p-invalid': showErrorName() }"
                />
                <small class="p-error">{{
                    showErrorName() ? 'Pole jest wymagane.' : '&nbsp;'
                  }}</small>
              </div>

              <!-- ROW-2   NUMBER -->
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="number">Nr karty:</label>
                <InputText
                    id="number"
                    v-model="card.cardNumber"
                    maxlength="20"
                    :class="{ 'p-invalid': showErrorNumber() }"
                />
                <small class="p-error">{{
                    showErrorNumber() ? 'Pole jest wymagane.' : '&nbsp;'
                  }}</small>
              </div>
            </div>

            <!-- ROW-3   LIMIT URL -->
            <div class="col-start-1 col-span-2">
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="name">Limit na karcie:</label>
                <InputNumber
                    id="name"
                    v-model="card.limit"
                    mode="currency"
                    currency="PLN"
                    locale="pl-PL"
                    fluid
                    @focus="UtilsService.selectText"
                    :invalid="showErrorLimit()"
                />
                <small class="p-error">{{
                    showErrorLimit() ? 'Pole jest wymagane.' : '&nbsp;'
                  }}</small>
              </div>
            </div>
            <div class="col-start-3 col-span-4">
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="cover">URL zdjęcia:</label>
                <InputText id="cover" v-model="card.imageUrl"/>
              </div>
            </div>

            <!-- ROW-3   DAYS -->
            <div class="col-start-1 col-span-3">
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="name">Dzień zamknięcia:</label>
                <InputNumber
                    id="name"
                    v-model="card.closingDay"
                    mode="decimal"
                    show-buttons
                    :min="1"
                    :max="28"
                    fluid
                />
              </div>
            </div>
            <div class="col-start-4 col-span-3 mb-4">
              <div class="flex flex-col">
                <label class="ml-2 mb-1" for="name">Dzień spłaty:</label>
                <InputNumber
                    id="name"
                    v-model="card.repaymentDay"
                    mode="decimal"
                    show-buttons
                    :min="1"
                    :max="28"
                    fluid
                />
              </div>
            </div>

            <!-- ROW-4   USER BANK-->
            <div class="col-start-1 col-span-3">
              <div class="flex flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label for="input-user">Wybierz użytkownika:</label>
                  <Select
                      id="input-user"
                      v-model="selectedUser"
                      :class="{ 'p-invalid': showErrorUser() }"
                      :options="userStore.getUsers"
                      :option-label="(data) => data.firstName + ' ' + data.lastName"
                      @change="onUserChange"
                  />
                  <small class="p-error">{{
                      showErrorUser() ? 'Pole jest wymagane.' : '&nbsp;'
                    }}</small>
                </div>
                <div v-if="userStore.loadingUsers" class="mt-3 content-center">
                  <ProgressSpinner
                      class="ml-2 mt-1"
                      style="width: 30px; height: 30px"
                      stroke-width="5"
                  />
                </div>
              </div>
            </div>

            <div class="col-start-4 col-span-3">
              <div class="flex flex-row gap-4">
                <div class="flex flex-col w-full">
                  <label for="input-bank">Wybierz bank:</label>
                  <Select
                      id="input-bank"
                      v-model="selectedBank"
                      :class="{ 'p-invalid': showErrorBank() }"
                      :options="bankStore.getSortedBanks"
                      option-label="name"
                      @change="onBankChange"
                  />
                  <small class="p-error">{{
                      showErrorBank() ? 'Pole jest wymagane.' : '&nbsp;'
                    }}</small>
                </div>
                <div v-if="bankStore.loadingBanks" class="mt-3 content-center">
                  <ProgressSpinner
                      class="ml-2 mt-1"
                      style="width: 30px; height: 30px"
                      stroke-width="5"
                  />
                </div>
              </div>
            </div>

            <!-- ROW-5  DATES  -->
            <div class="col-start-1 col-span-3">
              <div class="flex flex-col w-full">
                <label class="ml-2 mb-1" for="activationDate">Data aktywacji:</label>
                <DatePicker
                    id="activationDate"
                    v-model="card.activationDate"
                    show-icon
                    date-format="yy-mm-dd"
                    :invalid="showErrorActivationDate()"
                />
                <small class="p-error">{{
                    showErrorActivationDate() ? 'Pole jest wymagane.' : '&nbsp;'
                  }}</small>
              </div>
            </div>

            <div class="col-start-4 col-span-3">
              <div class="flex flex-col w-full">
                <label class="ml-2 mb-1" for="expirationDate">Data ważności:</label>
                <DatePicker
                    id="expirationDate"
                    v-model="card.expirationDate"
                    show-icon
                    date-format="yy-mm-dd"
                    :invalid="showErrorExpirationDate()"
                />
                <small class="p-error">{{
                    showErrorExpirationDate() ? 'Pole jest wymagane.' : '&nbsp;'
                  }}</small>
              </div>
            </div>
          </div>
        </Fieldset>

        <!-- ROW-6  OTHER INFO  -->
        <Fieldset legend="Dodatkowe informacje">
          <Textarea id="description" v-model="card.otherInfo" fluid rows="5" cols="30"/>
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
          />
        </div>
      </Panel>
    </form>
  </div>
</template>

<style scoped></style>
