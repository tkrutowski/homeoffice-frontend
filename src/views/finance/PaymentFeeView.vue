<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import type {Fee, FeeInstallment} from '../../types/Fee'
import {UtilsService} from '../../service/UtilsService'
import router from '../../router'
import PayPaymentDialog from '../../components/finance/PayPaymentDialog.vue'
import ConfirmationDialog from '../../components/ConfirmationDialog.vue'
import TheMenuFinance from '../../components/finance/TheMenuFinance.vue'
import OfficeButton from '../../components/OfficeButton.vue'

import {useFeeStore} from '../../stores/fee'
import {usePaymentStore} from '../../stores/payments'
import {useToast} from 'primevue/usetoast'
import OfficeIconButton from '../../components/OfficeIconButton.vue'

const feeStore = useFeeStore()
const paymentStore = usePaymentStore()
const toast = useToast()

const isBusy = ref<boolean>(false)

const fee = ref<Fee | null>(null)
const installments = ref<FeeInstallment[]>([])

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const getOtherInfo = computed(() => {
  if (fee.value) {
    return fee.value.otherInfo
  }
  return ''
})

const countDeadLine = computed(() => {
  return fee.value?.installmentList[fee.value?.installmentList.length - 1].paymentDeadline
})
const plannedInterest = computed(() => {
  if (fee.value)
    return fee.value?.installmentList
        .map((installment: FeeInstallment) => installment.installmentAmountToPay)
        .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0)
  return 0
})
const currentInterest = computed(() => {
  if (fee.value)
    return fee.value.installmentList
        .filter((l: FeeInstallment) => l.paymentStatus.name === 'PAID')
        .map((installment: FeeInstallment) => installment.installmentAmountPaid - installment.installmentAmountToPay)
        .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0)
  return 0
})
const realInterest = computed(() => {
  if (fee.value) {
    let length = fee.value.installmentList.filter(
        (installment: FeeInstallment) => installment.installmentAmountPaid !== 0,
    ).length
    if (length === fee.value.numberOfPayments)
      return fee.value?.installmentList
          .map((installment: FeeInstallment) => installment.installmentAmountPaid)
          .reduce((accumulator: number, currentValue: number) => accumulator + currentValue, 0)
  }
  return 0
})
// ---------------------------------------------EDIT PAYMENT---------------------------------
const showPaymentModal = ref(false)
const installment = ref<FeeInstallment>()

function openPaymentModal(i: FeeInstallment) {
  installment.value = {...i}
  showPaymentModal.value = true
}

async function savePayment(date: Date, amount: number) {
  if (installment.value) {
    isBusy.value = true
    installment.value.paymentDate = new Date(date)
    installment.value.installmentAmountPaid = amount
    installment.value.paymentStatus = {name: 'PAID', viewName: 'Spłacony'}
    showPaymentModal.value = false
    const savedFee = await feeStore.updateFeeInstallmentDb(installment.value)
    //update views
    if (savedFee) {
      installments.value = savedFee.installmentList
      paymentStore.updatePayment(savedFee, 'FEE')
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
}

//---------------------------------------------DELETE PAYMENT-----------------------------
const showDeleteConfirmationDialog = ref<boolean>(false)

const confirmDeletePayment = (i: FeeInstallment) => {
  installment.value = {...i}
  showDeleteConfirmationDialog.value = true
}

const deleteConfirmationMessage = computed(() => {
  if (installment.value)
    return `Czy chcesz usunąc płatność z dnia: <b>${installment.value?.paymentDate}</b> </br>&emsp;&emsp;&emsp; na kwotę <b>${installment.value?.installmentAmountPaid} zł</b>?`
  return 'No message'
})
const submitDelete = async () => {
  console.log('submitDelete()', installment.value)
  isBusy.value = true
  if (installment.value) {
    installment.value.paymentStatus = {
      name: 'TO_PAY',
      viewName: 'Do zapłaty',
    }
    installment.value.paymentDate = null
    installment.value.installmentAmountPaid = 0
    showDeleteConfirmationDialog.value = false
    const savedFee = await feeStore.updateFeeInstallmentDb(installment.value)
    //update views
    if (savedFee) {
      installments.value = savedFee.installmentList
      paymentStore.updatePayment(savedFee, 'FEE')
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

const getAmount = computed(() => {
  return installment.value?.installmentAmountPaid
      ? installment.value.installmentAmountPaid
      : installment.value?.installmentAmountToPay
})
const getDate = computed(() => {
  if (installment.value?.paymentDate)
    return installment.value?.paymentDate
  return new Date()
})
const isEdit = computed(() => {
  let isEdit = false
  if (installment.value) isEdit = installment.value.installmentAmountPaid > 0
  return isEdit
})

//-----------------------------------------------------MOUNTED------------------------------------------
onMounted(async () => {
  console.log('onMounted GET')
  feeStore.getFees('ALL')
  refresh()
})
const refresh = async () => {
  fee.value = await feeStore.getFeeFromDb(+props.id)
  installments.value = fee.value ? fee.value?.installmentList : []
}
</script>

<template>
  <TheMenuFinance/>
  <PayPaymentDialog
      v-model:visible="showPaymentModal"
      :amount="getAmount"
      :date="getDate"
      :is-edit="isEdit"
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
  <Panel id="fee-panel" class="mt-3 m-auto">
    <template #header>
      <OfficeIconButton
          v-tooltip.right="{
          value: 'Powrót do listy',
          showDelay: 500,
          hideDelay: 300,
        }"
          icon="pi pi-fw pi-list"
          @click="() => router.push({ name: 'Fees' })"
      />
      <div class="w-full flex justify-center gap-4">
        <h3>
          {{ `Szczegóły opłaty: ${fee?.name}` }}
        </h3>
        <div v-if="feeStore.loadingFees">
          <ProgressSpinner class="ml-3" style="width: 30px; height: 30px" stroke-width="5"/>
        </div>
      </div>
    </template>
    <div class="grid grid-cols-1 md:grid-cols-8 gap-4 h-full">
      <!--   LEFT   -->
      <div class="col-span-1 md:col-span-3">
        <Fieldset class="" legend="Ogólne informacje">
          <p class="mb-1"><small>Nazwa firmy:</small> {{ fee?.firm?.name }}</p>
          <p class="mb-1"><small>Nr umowy:</small> {{ fee?.feeNumber }}</p>
          <p class="mb-1"><small>Z dnia:</small> {{ fee?.date }}</p>
          <p class="mb-1"><small>Data pierwszej opłaty:</small> {{ fee?.firstPaymentDate }}</p>
          <p class="mb-1"><small>Termin całkowitej spłaty:</small> {{ countDeadLine }}</p>
          <p class="mb-5"><small>Nr konta:</small> {{ fee?.accountNumber }}</p>

          <p class="mb-1"><small>Kwota opłaty:</small> {{ fee?.amount }} zł</p>
          <p class="mb-1">
            <small>Częstotliwość opłat:</small>
            {{ fee?.feeFrequency?.viewName }}
          </p>

          <p class="mb-1"><small>Ilość opłat:</small> {{ fee?.numberOfPayments }}</p>
          <p class="mb-1">
            <small>Koszt planowany:</small>
            <span class="color-red ml-1"> {{ UtilsService.formatCurrency(plannedInterest) }}</span>
          </p>

          <p class="mb-1">
            <small>Obecna różnica:</small>
            <span class="color-red ml-1">{{ UtilsService.formatCurrency(currentInterest) }} </span>
          </p>

          <p class="mb-3 color-orange">
            <small>Koszt rzeczywisty:</small>
            <span class="color-red ml-1">{{ UtilsService.formatCurrency(realInterest) }} </span>
          </p>
        </Fieldset>
        <Fieldset legend="Dodatkowe informacje">
          <Textarea id="description" v-model="getOtherInfo" fluid rows="5" cols="30"/>
        </Fieldset>
      </div>

      <!--      RIGHT TABLE -->
      <div class="col-span-md:col-span-5">
        <Fieldset legend="Szczegóły wpłat">
          <DataTable :value="installments" size="small">
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
                      v-tooltip.top="{
                      value: 'Edytuj wpłatę',
                      showDelay: 1000,
                      hideDelay: 300,
                    }"
                      icon="pi pi-file-edit"
                      @click="openPaymentModal(slotProps.data)"
                  />
                  <OfficeIconButton
                      v-tooltip.top="{
                      value: 'Usuń wpłatę',
                      showDelay: 1000,
                      hideDelay: 300,
                    }"
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
#fee-panel {
  max-width: 1000px;
}

.p-datatable >>> .p-datatable-column-header-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-red {
  color: #dc3545;
}

.p-datatable >>> .p-datatable-tbody > tr > td {
  text-align: center;
  //border: 1px solid black;
  //border-width: 0 1px 1px 0;
  //padding: 0;
}
</style>
