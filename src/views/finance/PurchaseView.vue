<script setup lang="ts">
import OfficeButton from '../../components/OfficeButton.vue'
import type {User} from '../../types/User'
import {computed, onMounted, ref, watch} from 'vue'
import moment from 'moment'
import router from '../../router'
import {useToast} from 'primevue/usetoast'
import type {Firm} from '../../types/Firm'
import TheMenuFinance from '../../components/finance/TheMenuFinance.vue'
import type {Purchase} from '../..//types/Purchase'
import type {Card} from '../../types/Bank'
import OfficeIconButton from '../../components/OfficeIconButton.vue'
import {UtilsService} from '../../service/UtilsService'
import type {AxiosError} from "axios";

import {useUsersStore} from '../../stores/users'
import {useRoute} from 'vue-router'
import {useFirmsStore} from '../../stores/firms'
import {usePurchasesStore} from '../../stores/purchases'
import {useCardsStore} from '../../stores/cards'

const userStore = useUsersStore()
const purchaseStore = usePurchasesStore()
const firmStore = useFirmsStore()
const route = useRoute()
const cardStore = useCardsStore()


const toast = useToast()
const selectedUser = ref<User | null>()
const selectedFirm = ref<Firm | null>(null)
const selectedCard = ref<Card | null>(null)
const optionCard = ref<Card[]>()

const purchase = ref<Purchase>({
  id: 0,
  idCard: 0,
  idFirm: 0,
  idUser: 0,
  name: '',
  purchaseDate: null,
  amount: 0,
  paymentDeadline: null,
  paymentDate: null,
  paymentStatus: {name: 'TO_PAY', viewName: 'Do spłaty'},
  isInstallment: false,
  otherInfo: '',
})

const btnShowError = ref<boolean>(false)
const btnShowBusy = ref<boolean>(false)
const btnShowOk = ref<boolean>(false)
const btnSaveDisabled = ref<boolean>(false)

const isSaveBtnDisabled = computed(() => {
  return (
      cardStore.loadingCards ||
      userStore.loadingUsers ||
      firmStore.loadingFirms ||
      btnSaveDisabled.value
  )
})
// const purchaseDateTemp = ref<string>('')
// watch(purchaseDateTemp, (newDate: string) => {
//   purchase.value.purchaseDate = moment(new Date(newDate)).format('YYYY-MM-DD')
// })
// const deadlineDateTemp = ref<string>('')
// watch(deadlineDateTemp, (newDate: string) => {
//   purchase.value.paymentDeadline = moment(new Date(newDate)).format('YYYY-MM-DD')
// })
//
//AUTO COMPLETE
//
const filteredFirms = ref<Firm[]>([])
const searchFirm = (event: { query: string }) => {
  filteredFirms.value = firmStore.firms.filter((firm: Firm) => {
    return firm.name.toLowerCase().includes(event.query.toLowerCase())
  })
}
watch(selectedFirm, (newFirm: Firm | null) => {
  if (newFirm) purchase.value.idFirm = newFirm.id
  else purchase.value.idFirm = 0
})

//
//CARD
//
watch(selectedUser, () => {
  console.log('WATCH user, ', selectedUser.value)
  if (selectedUser.value && selectedUser.value?.id > 0) {
    if (isEdit.value)
      (optionCard.value = cardStore.getCardByUser(selectedUser.value?.id))
    else
      (optionCard.value = cardStore.getCardByUserAndStatus(selectedUser.value?.id, 'ACTIVE'))
  }
})

watch([selectedCard, selectedUser, purchase.value.purchaseDate], () => {
  if (
      selectedUser.value &&
      selectedUser.value?.id > 0 &&
      selectedCard.value &&
      selectedCard.value?.id > 0 &&
      purchase.value.purchaseDate
  ) {
    calculateDeadline(selectedCard.value, purchase.value.purchaseDate)
  }
})

function calculateDeadline(card: Card, date: Date) {
  console.log('Calculate deadline...')
  const purchaseDate = moment(date)

  // Ustawienie początkowej daty płatności na następny miesiąc
  let deadlineDate = purchaseDate.add(1, 'months')

  // Jeśli dzień zakupu jest większy niż dzień zamknięcia karty, przesuń o kolejny miesiąc
  if (purchaseDate.date() > card.closingDay) {
    deadlineDate = deadlineDate.add(1, 'months')
  }

  // Ustawienie dnia płatności karty
  deadlineDate = deadlineDate.date(card.repaymentDay)

  // Jeśli przekroczyliśmy koniec roku, ustawienie odpowiedniego roku
  if (deadlineDate.month() === 0 && purchaseDate.month() === 11) {
    deadlineDate = deadlineDate.add(1, 'year')
  }

  // Formatowanie i zapisywanie daty płatności
  purchase.value.paymentDeadline = deadlineDate.toDate()
}

//
//SAVE
//
function savePurchase() {
  submitted.value = true
  if (isEdit.value) {
    editPurchase()
  } else {
    newPurchase()
  }
}

//
//---------------------------------------------------------NEW PURCHASE----------------------------------------------
//
async function newPurchase() {
  console.log('newPurchase()')
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
    btnShowError.value = true
    setTimeout(() => (btnShowError.value = false), 5000)
  } else {
    // btnSaveDisabled.value = true;
    btnShowBusy.value = true
    const result = await purchaseStore.addPurchaseDb(purchase.value)

    if (result) {
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Zapisano zakup: ' + purchase.value?.name,
        life: 3000,
      })
      btnShowBusy.value = false
      btnShowOk.value = true
      setTimeout(() => {
        router.push({name: 'PurchasesCurrent'})
      }, 3000)
    } else btnShowError.value = true

    setTimeout(() => {
      btnShowError.value = false
      btnShowOk.value = false
    }, 5000)
  }
}

//
//-----------------------------------------------------EDIT PURCHASE------------------------------------------------
//
const isEdit = ref<boolean>(false)

async function editPurchase() {
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
    btnShowError.value = true
    setTimeout(() => (btnShowError.value = false), 5000)
  } else {
    btnSaveDisabled.value = true
    console.log('editPurchase()')
    setTimeout(() => {
      btnShowError.value = false
      btnShowOk.value = false
      btnShowError.value = false
    }, 5000)
  }
}

//---------------------------------------------MOUNTED--------------------------------------------
onMounted(() => {
  console.log('onMounted GET')
  btnSaveDisabled.value = true
  if (userStore.users.length === 0) userStore.getUsersFromDb()
  if (firmStore.firms.length === 0) firmStore.getFirmsFromDb()
  cardStore.getCardsFromDb('ALL')
  btnSaveDisabled.value = false
  if (purchaseStore.purchases.size === 0) purchaseStore.getPurchaseCurrentFromDb()
})

onMounted(async () => {
  // console.log("onMounted EDIT", route.params);
  btnSaveDisabled.value = true
  // if (userStore.users.length === 0) await userStore.getUsersFromDb();
  // if (firmStore.banks.length === 0) await firmStore.getFirmsFromDb();
  isEdit.value = route.params.isEdit === 'true'
  if (isEdit.value === false) {
    console.log('onMounted NEW PURCHASE')
  } else {
    console.log('onMounted EDIT PURCHASE')
    const purchaseId = Number(route.params.feeId as string)
    purchaseStore
        .getPurchaseFromDb(purchaseId)
        .then((data: Purchase | null) => {
          if (data) {
            purchase.value = data
            console.log('onMounted PURCHSE', purchase.value)
            selectedFirm.value = firmStore.getFirm(purchase.value.idFirm)
            selectedCard.value = cardStore.getCard(purchase.value.idCard)
            selectedUser.value = userStore.getUser(purchase.value.idUser)
            // purchaseDateTemp.value = purchase.value.purchaseDate
            // deadlineDateTemp.value = purchase.value.paymentDeadline
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania opłaty:', error)
        })
  }
  btnSaveDisabled.value = false
})

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
      showErrorUser() ||
      showErrorFirm() ||
      showErrorCard() ||
      showErrorAmount() ||
      showErrorDeadline() ||
      showErrorDate()
  )
}
const showErrorName = () => {
  return submitted.value && purchase.value.name.length === 0
}
const showErrorUser = () => {
  return submitted.value && purchase.value.idUser === 0
}
const showErrorCard = () => {
  return submitted.value && purchase.value.idCard === 0
}
const showErrorFirm = () => {
  return submitted.value && purchase.value.idFirm === 0
}
const showErrorAmount = () => {
  return submitted.value && purchase.value.amount <= 0
}
const showErrorDate = () => {
  return submitted.value && !purchase.value.purchaseDate
}
const showErrorDeadline = () => {
  return submitted.value && !purchase.value.paymentDeadline
}
</script>

<template>
  <Toast/>
  <TheMenuFinance/>

  <div class="m-4 max-w-4xl mx-auto">
    <form @submit.stop.prevent="savePurchase">
      <Panel>
        <template #header>
          <OfficeIconButton
              v-tooltip.right="{
              value: 'Powrót do listy zakupów',
              showDelay: 500,
              hideDelay: 300,
            }"
              icon="pi pi-fw pi-list"
              @click="() => router.push({ name: 'PurchasesCurrent' })"
          />
          <div class="w-full flex justify-center">
            <h2>
              {{ isEdit ? `Edycja zakupu: ${purchase?.name}` : 'Nowy zakup' }}
            </h2>
          </div>
        </template>
        <div class="flex flex-col">
          <!-- ROW-1   NAME -->
          <div class="flex flex-col">
            <label for="name">Nazwa</label>
            <InputText
                id="name"
                v-model="purchase.name"
                maxlength="50"
                :class="{ 'p-invalid': showErrorName() }"
            />
            <small class="p-error">{{ showErrorName() ? 'Pole jest wymagane.' : '&nbsp;' }}</small>
          </div>

          <!-- ROW-2   USER -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="input-customer">Wybierz użytkownika:</label>
              <Select
                  id="input-customer"
                  v-model="selectedUser"
                  :class="{ 'p-invalid': showErrorUser() }"
                  :options="userStore.getUserByPrivileges"
                  :option-label="(user) => user.firstName + ' ' + user.lastName"
                  @change="purchase.idUser = selectedUser ? selectedUser.id : 0"
                  required
              />
              <small class="p-error">{{
                  showErrorUser() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
            <div v-if="userStore.loadingUsers" class="content-center">
              <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 30px; height: 30px"
                  stroke-width="5"
              />
            </div>
          </div>

          <!-- ROW-3   CARD -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="input-customer">Wybierz kartę:</label>
              <Select
                  id="input-customer"
                  v-model="selectedCard"
                  :class="{ 'p-invalid': showErrorCard() }"
                  :options="optionCard"
                  option-label="name"
                  @change="purchase.idCard = selectedCard ? selectedCard.id : 0"
              />
              <small class="p-error">{{
                  showErrorUser() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
            <div v-if="cardStore.loadingCards" class="content-center">
              <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 30px; height: 30px"
                  stroke-width="5"
              />
            </div>
          </div>

          <!-- ROW-4   FIRM -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="input-customer">Wybierz firmę:</label>
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
              <!--                  @input="fee.firm = selectedFirm ? selectedFirm : undefined"-->
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

          <!-- ROW-4  DATE  -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="date">Data zakupu:</label>
              <DatePicker
                  id="date"
                  v-model="purchase.purchaseDate"
                  show-icon
                  date-format="yy-mm-dd"
                  :invalid="showErrorDate()"
              />
              <small class="p-error">{{
                  showErrorDate() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-6  AMOUNT  -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="amount">Kwota:</label>
              <InputNumber
                  id="amount"
                  v-model="purchase.amount"
                  :invalid="showErrorAmount()"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  :disabled="isEdit"
                  mode="currency"
                  currency="PLN"
                  locale="pl-PL"
                  @focus="UtilsService.selectText"
              />
              <small class="p-error">{{
                  showErrorAmount() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-7  DEADLINE  -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="date">Termin spłaty:</label>
              <DatePicker
                  id="date"
                  v-model="purchase.paymentDeadline"
                  show-icon
                  date-format="yy-mm-dd"
                  :invalid="showErrorDeadline()"
              />
              <small class="p-error">{{
                  showErrorDate() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-8  OTHER INFO  -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="input">Dodatkowe informacje:</label>
              <Textarea v-model="purchase.otherInfo" rows="5" cols="30"/>
            </div>
          </div>
        </div>

        <!-- ROW-6  BTN SAVE -->
        <div class="flex mt-5 justify-end">
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

<style scoped></style>
