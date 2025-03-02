<script setup lang="ts">
import {useLoansStore} from '@/stores/loans'
import {useBanksStore} from '@/stores/banks'
import {useUsersStore} from '@/stores/users'
import {useRoute} from 'vue-router'
import {computed, onMounted, ref} from 'vue'
import type {Loan} from '@/types/Loan'
import OfficeButton from '@/components/OfficeButton.vue'
import {useToast} from 'primevue/usetoast'
import router from '@/router'
import type {Bank} from '@/types/Bank'
import type {User} from '@/types/User'
import TheMenuFinance from '@/components/finance/TheMenuFinance.vue'
import OfficeIconButton from '@/components/OfficeIconButton.vue'
import {UtilsService} from '@/service/UtilsService'
import type {AxiosError} from "axios";
import {PaymentStatus} from "@/types/Payment.ts";

const userStore = useUsersStore()
const loanStore = useLoansStore()
const bankStore = useBanksStore()
const route = useRoute()

const toast = useToast()
const selectedUser = ref<User | null>()
const selectedBank = ref<Bank | null>()

const loan = ref<Loan>({
  id: 0,
  bank: null,
  idUser: 0,
  name: '',
  amount: 0,
  date: null,
  loanNumber: '',
  accountNumber: '',
  firstPaymentDate: null,
  numberOfInstallments: 1,
  installmentAmount: 0,
  loanStatus: PaymentStatus.TO_PAY,
  loanCost: 0,
  otherInfo: '',
  installmentList: [],
})

const btnShowBusy = ref<boolean>(false)
const btnSaveDisabled = ref<boolean>(false)

const isSaveBtnDisabled = computed(() => {
  return (
      loanStore.loadingPaymentType ||
      loanStore.loadingLoans ||
      userStore.loadingUsers ||
      bankStore.loadingBanks ||
      btnSaveDisabled.value
  )
})
// const loanDateTemp = ref<string>('')
// watch(loanDateTemp, (newDate: string) => {
//   loan.value.date = moment(new Date(newDate)).format('YYYY-MM-DD')
// })
// const firstPaymentDateTemp = ref<string>('')
// watch(firstPaymentDateTemp, (newDate: string) => {
//   loan.value.firstPaymentDate = moment(new Date(newDate)).format('YYYY-MM-DD')
// })
//
//------------------------------------------------------SAVE-----------------------------------------
//
function saveLoan() {
  submitted.value = true
  if (isEdit.value) {
    editLoan()
  } else {
    newLoan()
  }
}

//
//---------------------------------------------------------NEW LOAN----------------------------------------------
//
async function newLoan() {
  console.log('newLoan()')
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    btnShowBusy.value = true
    loanStore.addLoanDb(loan.value).then(() => {
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Zapisano kredyt: ' + loan.value?.name,
        life: 3000,
      })
      setTimeout(() => {
        router.push({name: 'Loans'})
      }, 3000)

    }).catch(() => {
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Błąd podczas zapisywania kredytu',
        life: 3000,
      })

    }).finally(() => {
      btnSaveDisabled.value = false
      btnShowBusy.value = false;
    })
  }
}

//
//-----------------------------------------------------EDIT LOAN------------------------------------------------
//
const isEdit = ref<boolean>(false)

function editLoan() {
  if (isNotValid()) {
    showError('Uzupełnij brakujące elementy')
  } else {
    btnSaveDisabled.value = true
    btnShowBusy.value = true
    console.log('editLoan()')
    loanStore.updateLoanDb(loan.value).then(() => {
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Zaaktualizowano kredyt: ' + loan.value?.name,
        life: 3000,
      })
      setTimeout(() => {
        router.push({name: 'Loans'})
      }, 3000)
    }).catch((reason: AxiosError) => {
      toast.add({
        severity: 'error',
        summary: reason?.message,
        detail: 'Błąd podczas aktualizacji kredytu: ' + loan.value?.name,
        life: 3000,
      })
    }).finally(() => {
      btnSaveDisabled.value = false
      btnShowBusy.value = false;
    })
  }
}

//---------------------------------------MOUNTED------------------------------------------------
onMounted(() => {
  console.log('onMounted GET')
  btnSaveDisabled.value = true
  if (userStore.users.length === 0) userStore.getUsersFromDb()
  if (bankStore.banks.length === 0) bankStore.getBanksFromDb()
  btnSaveDisabled.value = false
  console.log('loanStore.loans.length', loanStore.loans.length)
  loanStore.getLoans('ALL')
})

onMounted(async () => {
  // console.log("onMounted EDIT", route.params);
  btnSaveDisabled.value = true
  isEdit.value = route.params.isEdit === 'true'
  if (isEdit.value === false) {
    console.log('onMounted NEW LOAN')
    // invoiceDateTemp.value = loan.value.invoiceDate;
    // sellDateTemp.value = loan.value.sellDate;
  } else {
    console.log('onMounted EDIT LOAN')
    const loanId = Number(route.params.loanId as string)
    loanStore
        .getLoanFromDb(loanId)
        .then((data: Loan | null) => {
          if (data) {
            loan.value = data
            selectedBank.value = loan.value.bank
            selectedUser.value = userStore.getUser(loan.value.idUser)
            // loanDateTemp.value = loan.value.date
            // firstPaymentDateTemp.value = loan.value.firstPaymentDate
          }
        })
        .catch((error: AxiosError) => {
          console.error('Błąd podczas pobierania kredytu:', error)
        })
  }
  btnSaveDisabled.value = false
})

//
//------------------------------------------ERROR
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
      showErrorBank() ||
      showErrorNumber() ||
      showErrorAmount() ||
      showErrorAccountNumber() ||
      showErrorInstallmentAmount() ||
      showErrorFirstDate() ||
      showErrorDate()
  )
}
const showErrorName = () => {
  return submitted.value && loan.value.name.length === 0
}
const showErrorUser = () => {
  return submitted.value && loan.value.idUser === 0
}
const showErrorBank = () => {
  return submitted.value && !loan.value.bank
}
const showErrorNumber = () => {
  return submitted.value && loan.value.loanNumber.length === 0
}
const showErrorAmount = () => {
  return submitted.value && loan.value.amount <= 0
}
const showErrorInstallmentAmount = () => {
  return submitted.value && loan.value.installmentAmount <= 0
}
const showErrorAccountNumber = () => {
  //todo zrobić regex
  return submitted.value && loan.value.accountNumber.length === 0
}
const showErrorDate = () => {
  return submitted.value && !loan.value.date
}
const showErrorFirstDate = () => {
  return submitted.value && !loan.value.firstPaymentDate
}
</script>

<template>
  <TheMenuFinance/>

  <div class="m-4 max-w-4xl mx-auto">
    <form @submit.stop.prevent="saveLoan" class="w-full">
      <Panel class="w-full">
        <template #header>
          <OfficeIconButton
              title="Powrót do listy kredytów"
              icon="pi pi-fw pi-list"
              @click="() => router.push({ name: 'Loans' })"
          />
          <div class="w-full flex justify-center">
            <span class="text-3xl">
              {{ isEdit ? `Edycja kredytu: ${loan?.name}` : 'Nowy kredyt' }}
            </span>
          </div>
        </template>
        <div class="flex flex-col">
          <!-- ROW-1   NAME -->
          <div class="flex flex-col">
            <label for="name">Nazwa</label>
            <InputText id="name" v-model="loan.name" maxlength="50" :invalid="showErrorName()"/>
            <small class="text-red-500">{{
                showErrorName() ? 'Pole jest wymagane.' : '&nbsp;'
              }}</small>
          </div>

          <!-- ROW-2   USER -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="input-customer">Wybierz użytkownika:</label>
              <Select
                  id="input-customer"
                  v-model="selectedUser"
                  :class="{ 'p-invalid': showErrorUser() }"
                  :options="userStore.users"
                  :option-label="(user) => user.firstName + ' ' + user.lastName"
                  @change="loan.idUser = selectedUser ? selectedUser.id : 0"
              />
              <small class="text-red-500">{{
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

          <!-- ROW-3   BANK -->
          <div class="flex flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="input-customer">Wybierz bank:</label>
              <Select
                  id="input-customer"
                  v-model="selectedBank"
                  :invalid="showErrorBank()"
                  :options="bankStore.banks"
                  option-label="name"
                  :onchange="(loan.bank = selectedBank ? selectedBank : null)"
              />
              <small class="text-red-500">{{
                  showErrorBank() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
            <div v-if="bankStore.loadingBanks" class="content-center">
              <ProgressSpinner
                  class="ml-2 mt-1"
                  style="width: 30px; height: 30px"
                  stroke-width="5"
              />
            </div>
          </div>

          <!-- ROW-4  NUMBER / DATE  -->
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="number">Numer kredytu</label>
              <InputText
                  id="number"
                  v-model="loan.loanNumber"
                  :invalid="showErrorNumber()"
                  maxlength="50"
              />
              <small class="text-red-500">{{
                  showErrorNumber() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
            <div class="flex flex-col w-full">
              <label for="date">Z dnia:</label>
              <DatePicker
                  id="date"
                  v-model="loan.date"
                  show-icon
                  date-format="yy-mm-dd"
                  :invalid="showErrorDate()"
              />
              <small class="text-red-500">{{
                  showErrorDate() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-5  AMOUNT / COST  -->
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="amount">Kwota kredytu</label>
              <InputNumber
                  id="amount"
                  v-model="loan.amount"
                  :invalid="showErrorAmount()"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  mode="currency"
                  currency="PLN"
                  locale="pl-PL"
                  @focus="UtilsService.selectText"
              />
              <small class="text-red-500">{{
                  showErrorAmount() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
            <div class="flex flex-col w-full">
              <label for="cost">Koszt kredytu:</label>
              <InputNumber
                  id="cost"
                  v-model="loan.loanCost"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  mode="currency"
                  currency="PLN"
                  locale="pl-PL"
                  @focus="UtilsService.selectText"
              />
            </div>
          </div>

          <!-- ROW-6  INSTALLMENT NR / INSTALLMENT AMOUNT  -->
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="amount">Ilość rat:</label>
              <InputNumber
                  id="amount"
                  v-model="loan.numberOfInstallments"
                  mode="decimal"
                  show-buttons
                  :min="1"
                  :max="84"
                  :disabled="isEdit"
              />
            </div>
            <div class="flex flex-col w-full">
              <label for="installmentAmount">Kwota raty:</label>
              <InputNumber
                  id="installmentAmount"
                  v-model="loan.installmentAmount"
                  :invalid="showErrorInstallmentAmount()"
                  :min-fraction-digits="2"
                  :max-fraction-digits="2"
                  :disabled="isEdit"
                  mode="currency"
                  currency="PLN"
                  locale="pl-PL"
              />
              <small class="text-red-500">{{
                  showErrorInstallmentAmount() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-7  ACCOUNT NR / FIRST PAYMENT DATE  -->
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex flex-col w-full">
              <label for="accountNo">Nr konta:</label>
              <InputMask
                  id="accountNo"
                  v-model="loan.accountNumber"
                  :invalid="showErrorAccountNumber()"
                  mask="99 9999 9999 9999 9999 9999 9999"
              />
              <small class="text-red-500">{{
                  showErrorAccountNumber() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
            <div class="flex flex-col w-full">
              <label for="first">Data pierwszej raty:</label>
              <DatePicker
                  id="first"
                  v-model="loan.firstPaymentDate"
                  :invalid="showErrorFirstDate()"
                  show-icon
                  date-format="yy-mm-dd"
                  :disabled="isEdit"
              />
              <small class="text-red-500">{{
                  showErrorFirstDate() ? 'Pole jest wymagane.' : '&nbsp;'
                }}</small>
            </div>
          </div>

          <!-- ROW-7  OTHER INFO  -->
          <div class="flex flex-col w-full">
            <label for="input">Dodatkowe informacje:</label>
            <Textarea v-model="loan.otherInfo" rows="5" cols="30"/>
          </div>
        </div>

        <!-- ROW-6  BTN SAVE -->
        <div class="flex mt-5 justify-end">
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

<style scoped></style>
