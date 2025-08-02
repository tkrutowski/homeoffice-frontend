<script setup lang="ts">
import TheMenuFinance from '@/components/finance/TheMenuFinance.vue'
import PurchaseCurrentItemGroup from '@/components/finance/PurchaseCurrentItemGroup.vue'
import {UtilsService} from '@/service/UtilsService'
import {usePurchasesStore} from '@/stores/purchases'
import {computed, onMounted, ref} from 'vue'
import {PaymentStatus} from '@/types/Payment'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import {useToast} from 'primevue/usetoast'
import type {Purchase} from "@/types/Purchase.ts";
import router from "@/router";
import type {User} from "@/types/User.ts";
import {useUsersStore} from "@/stores/users.ts";
const purchasesStore = usePurchasesStore()
const toast = useToast()
const userStore = useUsersStore()

UtilsService.getTypesForFinance()
onMounted(() => {
  purchasesStore.clearPurchasesToPay()
  if(userStore.users.length <= 0) userStore.getUsersFromDb()
})
const selectedUser = ref<User | null>(userStore.getLoggedUser)
const purchases = ref<Map<string, Purchase[]>>(new Map<string, Purchase[]>())
//--------------------------------------GET PURCHASE
async function getCurrentPurchaseByUser() {
  purchases.value.clear()
  if(selectedUser.value) {
    purchases.value = await purchasesStore.getPurchaseCurrentFromDb(selectedUser.value?.username)
  }
}

//
//----------------------------------------PAY SELECTED-------------------------------------------
//
const showStatusChangeConfirmationDialog = ref<boolean>(false)
const changeStatusConfirmationMessage = computed(() => {
  const purchasesToPay = purchasesStore.purchasesToPay
  const amountAll = purchasesToPay
      .reduce((acc: number, curr: Purchase) => acc + Number(curr.amount), 0)
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
  let newStatus: PaymentStatus = PaymentStatus.PAID
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
  <Toolbar class="m-6">
    <template #start>
      <p>
        RAZEM:
        {{ UtilsService.formatCurrency(purchasesStore.totalAmount) }}
      </p>
    </template>

    <template #center>
      <Select
          id="input-customer"
          v-model="selectedUser"
          :options="userStore.getUserByPrivileges"
          :option-label="(user) => user.firstName + ' ' + user.lastName"
          :loading="userStore.loadingUsers"
          @change="() => purchases.clear()"
          required
      />
    </template>

    <template #end>
      <Button
          outlined
          class="font-bold uppercase tracking-wider"
          label="WYSZUKAJ"
          :disabled="purchasesStore.loadingPurchases || selectedUser === null"
          :loading="purchasesStore.loadingPurchases"
          @click="getCurrentPurchaseByUser"
      />
    </template>
  </Toolbar>
  <div v-for="[key] in purchasesStore.purchasesCurrent" :key="key">
    <PurchaseCurrentItemGroup :deadline-date="key"/>
  </div>
  <h1 v-if="purchasesStore.purchasesCurrent.size === 0" class="flex justify-center mt-5 mb-5">
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
              params: { isEdit: 'false', purchaseId: 0 }
            })
          }
        "
      />
      <Button
          title="Odświerz listę zakupów"
          :icon="purchasesStore.loadingPurchases ? 'pi  pi-spin pi-spinner' : 'pi pi-refresh'"
          class="mr-2"
          :disabled="selectedUser === null"
          @click="purchasesStore.getPurchaseCurrentFromDb(selectedUser?.username!)"
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
