<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import router from '../../router'
import {UtilsService} from '../../service/UtilsService'
import type {Loan, LoanInstallment} from '../../types/Loan'
import PayPaymentDialog from '../../components/finance/PayPaymentDialog.vue'
import ConfirmationDialog from '../../components/ConfirmationDialog.vue'
import OfficeButton from '../../components/OfficeButton.vue'
import TheMenuFinance from '../../components/finance/TheMenuFinance.vue'

import {useLoansStore} from '../../stores/loans'
import {usePaymentStore} from '../../stores/payments'
import {useToast} from 'primevue/usetoast'
import OfficeIconButton from '../../components/OfficeIconButton.vue'

const loansStore = useLoansStore()
const paymentStore = usePaymentStore()
const toast = useToast()

const loan = ref<Loan | null>(null)
const installments = ref<LoanInstallment[]>([])
const isBusy = ref<boolean>(false)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const getOtherInfo = computed(() => {
  if (loan.value) {
    return loan.value.otherInfo
  }
  return ''
})

const countDeadLine = computed(() => {
  return loan.value?.installmentList[loan.value?.installmentList.length - 1].paymentDeadline
})
const plannedInterest = computed(() => {
  if (loan.value)
    return (
        (loan.value?.amount - loan.value?.numberOfInstallments * loan.value?.installmentAmount) * -1
    )
  return 0
})
const realInterest = computed(() => {
  if (loan.value)
    return loan.value.installmentList
        .filter((l: LoanInstallment) => l.paymentStatus.name === 'PAID')
        .map((installment: LoanInstallment) => installment.installmentAmountPaid - installment.installmentAmountToPay)
        .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0)
  return 0
})
const calculateCost = computed(() => {
  if (loan.value)
    return (
        (loan.value.amount -
            loan.value.loanCost -
            loan.value.numberOfInstallments * loan.value.installmentAmount) *
        -1
    )
  return 0
})
const calculatePaid = computed(() => {
  if (loan.value)
    return loan.value.installmentList.filter(
        (installment: LoanInstallment) => installment.paymentStatus.name === 'PAID',
    ).length
  return 0
})
const getAmount = computed(() => {
  return installment.value?.installmentAmountPaid
      ? installment.value.installmentAmountPaid
      : installment.value?.installmentAmountToPay
})
const getDate = computed(() => {
  if (!installment.value?.paymentDate) return new Date()
  return installment.value?.paymentDate
})
const calculateProgressBar = computed(() => {
  if (loan.value)
    return (
        (loan.value.installmentList.filter((i: LoanInstallment) => i.paymentStatus.name === 'PAID').length /
            loan.value.numberOfInstallments) *
        100
    )
  return 0
})
// ---------------------------------------------EDIT PAYMENT--------------------------------
const showPaymentModal = ref(false)
const installment = ref<LoanInstallment>()

function openPaymentModal(i: LoanInstallment) {
  installment.value = i
  showPaymentModal.value = true
}

async function savePayment(date: Date, amount: number) {
  isBusy.value = true
  if (installment.value) {
    installment.value.paymentDate = date
    installment.value.installmentAmountPaid = amount
    installment.value.paymentStatus = {name: 'PAID', viewName: 'Spłacony'}
    showPaymentModal.value = false

    const savedLoan = await loansStore.updateLoanInstallmentDb(installment.value)

    //update views
    if (savedLoan) {
      installments.value = savedLoan.installmentList
      paymentStore.updatePayment(savedLoan, 'LOAN')
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Zaktualizowano płatność.',
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Potwierdzenie',
        detail: 'Błąd podczas płatność.',
        life: 3000,
      })
    }
  }
  isBusy.value = false
  refresh()
}

//----------------------------------------------DELETE PAYMENT----------------------------
const showDeleteConfirmationDialog = ref<boolean>(false)

const confirmDeletePayment = (i: LoanInstallment) => {
  installment.value = i
  showDeleteConfirmationDialog.value = true
}

const deleteConfirmationMessage = computed(() => {
  if (installment.value)
    return `Czy chcesz usunąc płatność z dnia: <b>${installment.value?.paymentDate}</b> </br>&emsp;&emsp;&emsp; na kwotę <b>${installment.value?.installmentAmountPaid} zł</b>?`
  return 'No message'
})
const submitDelete = async () => {
  console.log('submitDelete()')
  isBusy.value = true
  if (installment.value) {
    installment.value.paymentStatus = {
      name: 'TO_PAY',
      viewName: 'Do zapłaty',
    }
    installment.value.paymentDate = null
    installment.value.installmentAmountPaid = 0
    showDeleteConfirmationDialog.value = false
    console.log('przed del, ', installment.value)
    const savedLoan = await loansStore.updateLoanInstallmentDb(installment.value)
    console.log('po del, ', savedLoan)
    //update views
    if (savedLoan) {
      installments.value = savedLoan.installmentList
      paymentStore.updatePayment(savedLoan, 'LOAN')
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Usunięto płatność.',
        life: 3000,
      })
    }
  }
  await refresh()
  isBusy.value = false
}

//------------------------------------MOUNTED------------------------------
onMounted(async () => {
  console.log('onMounted GET')
  loansStore.getLoans('ALL')
  refresh()
})
const refresh = async () => {
  loan.value = await loansStore.getLoanFromDb(+props.id)
  installments.value = loan.value ? loan.value?.installmentList : []
}
</script>

<template>
  <TheMenuFinance/>
  <PayPaymentDialog
      v-model:visible="showPaymentModal"
      :amount="getAmount"
      :date="getDate"
      @save="savePayment"
      @cancel="showPaymentModal = false"
  />
  <ConfirmationDialog
      v-model:visible="showDeleteConfirmationDialog"
      :msg="deleteConfirmationMessage"
      label="Usuń"
      @save="submitDelete"
      @cancel="showDeleteConfirmationDialog = false"
  />

  <Panel id="loan-panel" class="mt-3 m-auto">
    <template #header>
      <OfficeIconButton
          v-tooltip.right="{
          value: 'Powrót do listy',
          showDelay: 500,
          hideDelay: 300,
        }"
          icon="pi pi-fw pi-list"
          @click="() => router.push({ name: 'Loans' })"
      />
      <div class="w-full flex justify-center gap-4">
        <h3 class="m-0">
          {{ `Szczegóły kredytu: ${loan?.name}` }}
        </h3>
        <div v-if="loansStore.loadingLoans">
          <ProgressSpinner class="ml-3" style="width: 30px; height: 30px" stroke-width="5"/>
        </div>
      </div>
    </template>
    <div class="grid grid-cols-1 md:grid-cols-8 gap-4 h-full">
      <!--      LEFT-->
      <div class="col-span-1 md:col-span-3">
        <Fieldset class="" legend="Ogólne informacje">
          <p class="mb-1"><small>Nazwa banku:</small> {{ loan?.bank?.name }}</p>
          <p class="mb-1"><small>Nr kredytu:</small> {{ loan?.loanNumber }}</p>
          <p class="mb-1"><small>Z dnia:</small> {{ loan?.date }}</p>
          <p class="mb-1"><small>Data pierwszej raty:</small> {{ loan?.firstPaymentDate }}</p>
          <p class="mb-1"><small>Termin całkowitej spłaty:</small> {{ countDeadLine }}</p>
          <p class="mb-5"><small>Nr konta:</small> {{ loan?.accountNumber }}</p>
          <p class="mb-1">
            <small>Kwota kredytu:</small>
            {{ UtilsService.formatCurrency(loan?.amount) }}
          </p>
          <p class="mb-1">
            <small>Koszt kredytu:</small>
            <span class="color-red ml-1"> {{ UtilsService.formatCurrency(loan?.loanCost) }}</span>
          </p>
          <p class="mb-1"><small>Ilość rat:</small> {{ loan?.numberOfInstallments }}</p>
          <p class="mb-1">
            <small>Kwota raty:</small>
            {{ UtilsService.formatCurrency(loan?.installmentAmount) }}
          </p>
          <p class="mb-1">
            <small>Odsetki planowane:</small>
            <span class="color-red ml-1">
              {{ UtilsService.formatCurrency(plannedInterest) }}
            </span>
          </p>

          <p class="mb-3">
            <small>Odsetki rzeczywiste:</small>
            <span class="color-red ml-1">
              {{ UtilsService.formatCurrency(realInterest) }}
            </span>
          </p>

          <p class="mb-4">
            <small>Całkowity koszt kredytu:</small>
            <span class="color-red h4 ml-2">
              {{ UtilsService.formatCurrency(calculateCost) }}
            </span>
          </p>

          <p class="mb-1">
            <small>Spłacono:</small> {{ calculatePaid }} z
            {{ loan?.numberOfInstallments }}
          </p>

          <ProgressBar :value="calculateProgressBar">
            {{ calculateProgressBar.toFixed(0) }}%
          </ProgressBar>
        </Fieldset>
        <Fieldset legend="Dodatkowe informacje">
          <Textarea id="description" v-model="getOtherInfo" fluid rows="5" cols="30"/>
        </Fieldset>
      </div>
      <!--      RIGHT TABLE-->
      <div class="col-span-md:col-span-5">
        <Fieldset legend="Szczegóły wpłat">
          <DataTable
              v-if="!loansStore.loadingLoans"
              scroll-height="70vh"
              :value="installments"
              size="small"
          >
            <Column field="installmentNumber">
              <template #header>
                <div class="w-full" style="text-align: left">Nr raty</div>
              </template>
              <template #body="{ data, field }">
                <div class="ml-3" style="text-align: left">
                  {{ data[field] }}
                </div>
              </template>
            </Column>
            <Column
                field="paymentDeadline"
                header="Termin płatności"
                header-style="min-width:120px"
            >
              <template #body="{ data, field }">
                <div style="text-align: center">
                  {{ data[field] }}
                </div>
              </template>
            </Column>
            <Column field="installmentAmountToPay" header="Kwota">
              <template #body="{ data, field }">
                <div>
                  {{ UtilsService.formatCurrency(data[field]) }}
                </div>
              </template>
            </Column>
            <Column field="paymentDate" header="Data płatności" header-style="min-width:120px">
              <template #body="{ data, field }">
                <div style="text-align: center">
                  {{ data[field].startsWith('+') ? '' : data[field] }}
                </div>
              </template>
            </Column>
            <Column field="installmentAmountPaid" header="Kwota">
              <template #body="{ data, field }">
                <div>
                  {{ data[field] !== 0 ? UtilsService.formatCurrency(data[field]) : '' }}
                </div>
              </template>
            </Column>
            <!--                EDIT, DELETE-->
            <Column header="Akcja" :exportable="false" style="min-width: 8rem">
              <template #body="slotProps">
                <div class="flex flex-row gap-2 justify-center">
                  <OfficeIconButton
                      title="Edytuj wpłatę"
                      icon="pi pi-file-edit"
                      @click="openPaymentModal(slotProps.data)"
                  />
                  <OfficeIconButton
                      title="Usuń wpłatę"
                      icon="pi pi-trash"
                      severity="danger"
                      :disabled="slotProps.data.installmentAmountPaid === 0"
                      @click="confirmDeletePayment(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </Fieldset>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-center">
        <OfficeButton
            text="zamknij"
            btn-type="office-regular"
            :btn-disabled="isBusy"
            :is-busy-icon="isBusy"
            @click="() => router.back()"
        />
      </div>
    </template>
  </Panel>
</template>

<style scoped>
.color-red {
  color: #dc3545;
}

#loan-panel {
  max-width: 1200px;
}

.p-datatable >>> .p-datatable-column-header-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.p-datatable >>> .p-datatable-tbody > tr > td {
  text-align: center;
  //border: 1px solid black;
  //border-width: 0 1px 1px 0;
  //padding: 0;
}
</style>
