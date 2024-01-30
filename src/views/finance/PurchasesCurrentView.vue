<script setup lang="ts">
import TheMenuFinance from "@/components/TheMenuFinance.vue";
import PurchaseCurrentItemGroup from "@/components/PurchaseCurrentItemGroup.vue";
import { UtilsService } from "@/service/UtilsService";
import { usePurchasesStore } from "@/stores/purchases";
import { useFirmsStore } from "@/stores/firms";
import { computed, onMounted, ref } from "vue";
import { PaymentStatus } from "@/assets/types/PaymentStatus";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import { useToast } from "primevue/usetoast";
import router from "@/router";
const firmStore = useFirmsStore();
const purchasesStore = usePurchasesStore();
const toast = useToast();

firmStore.getFirmsFromDb();
purchasesStore.getPurchaseCurrentFromDb();
onMounted(() => {
  purchasesStore.clearPurchasesToPay();
});

//
//----------------------------------------PAY SELECTED-------------------------------------------
//
const showStatusChangeConfirmationDialog = ref<boolean>(false);
const changeStatusConfirmationMessage = computed(() => {
  const purchasesToPay = purchasesStore.purchasesToPay;
  if (purchasesToPay && purchasesToPay.length > 0) {
    const purchaseNamesListHtml = `
      <ul style="padding-left: 20px; list-style-type: none;">
        ${purchasesToPay
          .map(
            (purchase) =>
              `<li style="text-indent: -20px; margin-left: 50px;">- ${purchase.name}</li>`
          )
          .join("")}
      </ul>
    `;

    return `Czy chcesz oznaczyć poniższe zakupy jako <b>spłacone</b>?${purchaseNamesListHtml}`;
  }
  return "No message";
});
// const submitMultiChangeStatus = async () => {
//   console.log("submitMultiChangeStatus()");
//   let newStatus: PaymentStatus = {
//     name: "PAID",
//     viewName: "Spłacony",
//   };
//   const purchasesToPay = purchasesStore.purchasesToPay;
//   console.log(
//     "submitMultiChangeStatus() LIST pinia: ",
//     purchasesStore.purchasesToPay,
//     purchasesStore.purchasesToPay.length
//   );
//   console.log(
//     "submitMultiChangeStatus() LIST: ",
//     purchasesToPay,
//     purchasesToPay.length
//   );
//   for (const purchase of purchasesToPay) {
//     console.log("submitMultiChangeStatus(): ", purchase);
//     const result = await purchasesStore.payForPurchaseDb(
//       purchase.id,
//       newStatus
//     );
//     console.log("submitMultiChangeStatus() RESULT: ", result);
//     if (result) {
//       purchasesStore.delPurchaseToPay(purchase);
//       toast.add({
//         severity: "success",
//         summary: "Potwierdzenie",
//         detail: "Oznaczono jako spłacony zakup: " + purchase.name,
//         life: 3000,
//       });
//     } else {
//       toast.add({
//         severity: "error",
//         summary: "Niepowodzenie",
//         detail: "NIE oznaczono jako spłacony zakup: " + purchase.name,
//         life: 3000,
//       });
//     }
//   }
//   showStatusChangeConfirmationDialog.value = false;
// };
const submitMultiChangeStatus = async () => {
  console.log("submitMultiChangeStatus()");
  let newStatus: PaymentStatus = {
    name: "PAID",
    viewName: "Spłacony",
  };
  const purchasesToPay = Array.of(...purchasesStore.purchasesToPay);

  const results = await Promise.all(
    purchasesToPay.map((purchase) =>
      purchasesStore.payForPurchaseDb(purchase.id, newStatus)
    )
  );

  console.log("RESULTS:", results);
  results.forEach((result, index) => {
    const purchase = purchasesToPay[index];
    if (result) {
      purchasesStore.delPurchaseToPay(purchase);
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Oznaczono jako spłacony zakup: " + purchase.name,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Niepowodzenie",
        detail: "NIE oznaczono jako spłacony zakup: " + purchase.name,
        life: 3000,
      });
    }
  });
  showStatusChangeConfirmationDialog.value = false;
};
</script>

<template>
  <TheMenuFinance />
  <ConfirmationDialog
    v-model:visible="showStatusChangeConfirmationDialog"
    :msg="changeStatusConfirmationMessage"
    @save="submitMultiChangeStatus"
    @cancel="showStatusChangeConfirmationDialog = false"
  />
  <div v-for="[key] in purchasesStore.purchases" :key="key">
    <PurchaseCurrentItemGroup :deadline-date="key" />
  </div>
  <h1
    v-if="purchasesStore.purchases.size === 0"
    class="flex justify-content-center mt-5 mb-5 color-orange"
  >
    Wszystko spłacone
  </h1>
  <Toolbar class="sticky-toolbar">
    <template #start>
      <Button
        v-tooltip.right="{
          value: 'Dodaj nowy zakup.',
          showDelay: 500,
          hideDelay: 300,
        }"
        class="mr-2"
        icon="pi pi-plus"
        @click="
          () => {
            router.push({
              name: 'Purchase',
              params: { isEdit: 'false', purchaseId: 0 },
            });
          }
        "
      />
      <Button
        v-tooltip.right="{
          value: 'Odświerz listę zakupów',
          showDelay: 500,
          hideDelay: 300,
        }"
        :icon="
          purchasesStore.loadingPurchases
            ? 'pi  pi-spin pi-spinner'
            : 'pi pi-refresh'
        "
        class="mr-2"
        @click="purchasesStore.getPurchaseCurrentFromDb()"
      />
      <Button
        v-tooltip.right="{
          value: 'Oznacz wybrane zakupy jako opłacone.',
          showDelay: 500,
          hideDelay: 300,
        }"
        icon="pi pi-save"
        :disabled="purchasesStore.purchasesToPay.length == 0"
        @click="showStatusChangeConfirmationDialog = true"
      />
    </template>

    <template #end>
      <div class="flex flex-column">
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
  bottom: 0;
  z-index: 1000;
}
</style>
