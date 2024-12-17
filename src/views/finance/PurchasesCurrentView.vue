<script setup lang="ts">
import TheMenuFinance from '../../components/finance/TheMenuFinance.vue'
import PurchaseCurrentItemGroup from '../../components/finance/PurchaseCurrentItemGroup.vue'
import {UtilsService} from '../../service/UtilsService'
import {usePurchasesStore} from '../../stores/purchases'
import {computed, onMounted, ref} from 'vue'
import type {PaymentStatus} from '../../types/PaymentStatus'
import ConfirmationDialog from '../../components/ConfirmationDialog.vue'
import {useToast} from 'primevue/usetoast'
import router from '../../router'
import type {Purchase} from "../../types/Purchase.ts";

const purchasesStore = usePurchasesStore()
const toast = useToast()

UtilsService.getTypesForFinance()
purchasesStore.getPurchaseCurrentFromDb()
onMounted(() => {
  purchasesStore.clearPurchasesToPay()
})

//
//----------------------------------------PAY SELECTED-------------------------------------------
//
const showStatusChangeConfirmationDialog = ref<boolean>(false)
const changeStatusConfirmationMessage = computed(() => {
  const purchasesToPay = purchasesStore.purchasesToPay
  const amountAll = purchasesToPay
      // .map((value) => parseFloat(value.amount))
      .reduce((acc: number, curr: Purchase) => acc + curr.amount, 0)
  console.log('amountAll', amountAll)
  if (purchasesToPay && purchasesToPay.length > 0) {
    const purchaseNamesListHtml = `
      <ul style="padding-left: 20px; list-style-type: none;">
        ${purchasesToPay
        .map(
            (purchase) =>
                `<li style="text-indent: -20px; margin-left: 50px;">- ${purchase.name}: ${UtilsService.formatCurrency(purchase.amount)} zł</li>`,
        )
        .join('')}
        </BR>
        <li style="text-indent: -30px; margin-left: 50px;">RAZEM: ${amountAll} zł</li>
      </ul>
    `

    return `Czy chcesz oznaczyć poniższe zakupy jako <b>spłacone</b>?${purchaseNamesListHtml}`
  }
  return 'No message'
})
const submitMultiChangeStatus = async () => {
  console.log('START - submitMultiChangeStatus()')
  let newStatus: PaymentStatus = {
    name: 'PAID',
    viewName: 'Spłacony',
  }
  const purchasesToPay: Purchase[] = Array.of(...purchasesStore.purchasesToPay)

  const results: Awaited<true | false>[] = await Promise.all(
      purchasesToPay.map((purchase: Purchase) => purchasesStore.payForPurchaseDb(purchase.id, newStatus)),
  )

  console.log('RESULTS:', results)
  results.forEach((result: boolean, index: number) => {
    const purchase = purchasesToPay[index]
    if (result) {
      purchasesStore.delPurchaseToPay(purchase)
      toast.add({
        severity: 'success',
        summary: 'Potwierdzenie',
        detail: 'Oznaczono jako spłacony zakup: ' + purchase.name,
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Niepowodzenie',
        detail: 'NIE oznaczono jako spłacony zakup: ' + purchase.name,
        life: 3000,
      })
    }
  })
  showStatusChangeConfirmationDialog.value = false
  console.log('END - submitMultiChangeStatus()')
}
</script>

<template>
  <TheMenuFinance/>
  <ConfirmationDialog
      v-model:visible="showStatusChangeConfirmationDialog"
      :msg="changeStatusConfirmationMessage"
      @save="submitMultiChangeStatus"
      @cancel="showStatusChangeConfirmationDialog = false"
  />
  <div v-for="[key] in purchasesStore.purchases" :key="key">
    <PurchaseCurrentItemGroup :deadline-date="key"/>
  </div>
  <h1 v-if="purchasesStore.purchases.size === 0" class="flex justify-center mt-5 mb-5">
    Wszystko spłacone
  </h1>
  <Toolbar class="sticky-toolbar">
    <template #start>
      <Button
          class="mr-2"
          title="Dodaj nowy zakup."
          severity="warn"
          icon="pi pi-plus"
          @click="
          () => {
            router.push({
              name: 'Purchase',
              params: { isEdit: 'false', purchaseId: 0 },
            })
          }
        "
      />
      <Button
          title="Odświerz listę zakupów"
          :icon="purchasesStore.loadingPurchases ? 'pi  pi-spin pi-spinner' : 'pi pi-refresh'"
          class="mr-2"
          @click="purchasesStore.getPurchaseCurrentFromDb()"
      />
      <Button
          title="Oznacz wybrane zakupy jako opłacone."
          icon="pi pi-save"
          severity="danger"
          :disabled="purchasesStore.purchasesToPay.length == 0"
          @click="showStatusChangeConfirmationDialog = true"
      />
    </template>

    <template #end>
      <div class="flex flex-col">
        <p class="mb-1">
          <small>Zaznaczone:</small>
          {{ UtilsService.formatCurrency(purchasesStore.totalAmountToPay) }}
        </p>
        <p class="mb-1">
          RAZEM:
          {{ UtilsService.formatCurrency(purchasesStore.totalAmount) }}
        </p>
      </div>
    </template>
  </Toolbar>
</template>

<style scoped>
.sticky-toolbar {
  position: sticky;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}
</style>
