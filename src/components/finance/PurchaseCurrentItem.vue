<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { Purchase } from '../../types/Purchase'
import { UtilsService } from '../../service/UtilsService'
import { useFirmsStore } from '../../stores/firms'
import ConfirmationDialog from '../../components/ConfirmationDialog.vue'
import type { PaymentStatus } from '../../types/PaymentStatus'
import { useToast } from 'primevue/usetoast'

const firmStore = useFirmsStore()
import { usePurchasesStore } from '../../stores/purchases'

const purchaseStore = usePurchasesStore()
const toast = useToast()
const props = defineProps({
  purchase: {
    type: Object as PropType<Purchase>,
    required: true,
  },
})
const tempPurchase = ref<Purchase | null>(purchaseStore.getPurchaseById(props.purchase.id))
const getFirmName = () => {
  const result = firmStore.getFirm(props.purchase?.idFirm)
  return result !== null ? result.name : 'Brak firmy'
}

//
//----------------------------------------PAY-------------------------------------------
//
const showStatusChangeConfirmationDialog = ref<boolean>(false)
const changeStatusConfirmationMessage = computed(() => {
  if (tempPurchase.value)
    return `Czy chcesz oznaczyć zakup: <b>${tempPurchase.value.name}</b> jako <b>Spłacony</b>?`
  return 'No message'
})
const submitChangeStatus = async () => {
  console.log('submitChangeStatus()')
  const newStatus: PaymentStatus = {
    name: 'PAID',
    viewName: 'Spłacony',
  }
  purchaseStore
    .payForPurchaseDb(props.purchase.id, newStatus)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Oznaczono jako spłacony zakup: ' + props.purchase.name,
        life: 3000,
      })
    })
    .catch(() => {
      toast.add({
        severity: 'error',
        summary: 'Niepowodzenie',
        detail: 'NIE oznaczono jako spłacony zakup: ' + props.purchase.name,
        life: 3000,
      })
    })
  showStatusChangeConfirmationDialog.value = false
}

const readyToPayCheckBox = ref<boolean>(false)
watch(
  () => readyToPayCheckBox.value,
  (newValue) => {
    if (newValue && tempPurchase.value) {
      purchaseStore.addPurchaseToPay(tempPurchase.value)
    } else if (!newValue && tempPurchase.value) {
      purchaseStore.delPurchaseToPay(tempPurchase.value)
    }
  },
)
</script>
<template>
  <ConfirmationDialog
    v-model:visible="showStatusChangeConfirmationDialog"
    :msg="changeStatusConfirmationMessage"
    @save="submitChangeStatus"
    @cancel="showStatusChangeConfirmationDialog = false"
  />
  <Card
    class="mb-3"
    :class="{
      paid: tempPurchase?.paymentStatus.name === 'PAID',
      'to-pay': tempPurchase?.paymentStatus.name === 'TO_PAY',
    }"
  >
    <template #header>
      <div class="purchase-header">
        <Checkbox
          v-model="readyToPayCheckBox"
          class="custom-checkbox ml-5"
          :binary="true"
          title="Oznacz do zapłaty"
        />
        <h4 class="mb-2 mt-2 ml-3" title="Data zakupu">{{ props.purchase.purchaseDate }}</h4>
        <div class="pt-2">
          <Button
            size="small"
            title="Zmień status zakupu"
            icon="pi pi-arrow-right-arrow-left"
            class="mr-5"
            @click="showStatusChangeConfirmationDialog = true"
          />
        </div>
      </div>
    </template>
    <template #content>
      <div class="purchase-item-row ml-5 mr-5">
        <div class="purchase-item">
          <span class="firm" title="Nazwa firmy">{{ getFirmName() }}</span>
          <span class="name" title="Co kupiono">{{ props.purchase.name }}</span>
          <span class="mb-2 other" title="Dodatkowe informacje"
            >Info: {{ props.purchase.otherInfo }}</span
          >
        </div>
        <div>
          <h3>{{ UtilsService.formatCurrency(props.purchase.amount) }} zł</h3>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.purchase-header {
  display: flex;
  align-content: center;
  justify-content: space-between;
  align-items: center;
}

.purchase-item {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  flex-direction: column;
}

.purchase-item-row {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
}

.firm {
  font-size: 1.5rem;
}

.name {
  font-size: 1rem;
}

.other {
  font-size: 0.75rem;
}

.p-card .to-pay {
  background-color: rgba(137, 6, 6, 0.2) !important;
}

.p-card .paid {
  background-color: rgba(7, 63, 1, 0.3) !important;
}

.p-card {
  box-shadow:
    0 2px 1px -1px rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  border-radius: 6px;
}

.p-card >>> .p-card-body {
  padding: 0 !important;
}
</style>
