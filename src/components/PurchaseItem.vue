<script setup lang="ts">
import { computed, ref, PropType } from "vue";
import { Purchase } from "@/assets/types/Purchase";
import IconButton from "@/components/IconButton.vue";
import { UtilsService } from "@/service/UtilsService";
import { useFirmsStore } from "@/stores/firms";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import { PaymentStatus } from "@/assets/types/PaymentStatus";
import { useToast } from "primevue/usetoast";
const firmStore = useFirmsStore();
import { usePurchasesStore } from "@/stores/purchases";
const purchaseStore = usePurchasesStore();
const toast = useToast();
const props = defineProps({
  purchase: {
    type: Object as PropType<Purchase>,
    required: true,
  },
  id: {
    type: Number,
    require: true,
    default: 0,
  },
});
const tempPurchase = ref<Purchase | undefined>(
  purchaseStore.getPurchaseById(props.id)
);
// console.log("PROPS", props.purchase, props.id);
// const localCopyOfPurchase = ref(props.purchase);
// console.log("PROPS COPY", localCopyOfPurchase);

// const tempPurchase = ref<Purchase>();
// watch(props.purchase, (purchase: Purchase) => {
//   tempPurchase.value = purchase;
//   console.log("WATCH");
// });
// onMounted(() => {
//   if (props.id === 2613) {
//     // tempPurchase.value = purchaseStore.getPurchaseById(props.id);
//     console.log("MOUNTED: 2613", tempPurchase.value);
//   }
// });
// onMounted(() => {
//   // tempPurchase.value = purchaseStore.getPurchaseById(props.id);
//   console.log("MOUNTED: ", props.purchase);
//   console.log("MOUNTED: ", props.id);
// });
function isPaid() {
  // console.log("IS_PAID: ", props.purchase.paymentStatus);
  // return props.purchase.paymentStatus.name === "PAID";
  if (tempPurchase.value) {
    // console.log("IS_PAID: ", tempPurchase.value.paymentStatus);
    return tempPurchase.value.paymentStatus.name === "PAID";
  }
}

const getFirmName = () => {
  let result = firmStore.getFirm(props.purchase?.idFirm);
  return result !== undefined ? result.name : "Brak firmy";
};

//
//---------------------------------------------STATUS CHANGE--------------------------------------------------
//
const newStatus = ref<PaymentStatus | undefined>();
const showStatusChangeConfirmationDialog = ref<boolean>(false);
const confirmStatusChange = (status: PaymentStatus) => {
  // newStatus.value?.name = status;
  showStatusChangeConfirmationDialog.value = true;
};
const changeStatusConfirmationMessage = computed(() => {
  // if (props.purchase)
  if (tempPurchase.value)
    return `Czy chcesz zmienić status zakupu: <b>${
      tempPurchase.value.name
    }</b> na <b>${
      tempPurchase.value.paymentStatus.name === "PAID"
        ? "Do spłaty"
        : "Spłacony"
    }</b>?`;
  return "No message";
});
const submitChangeStatus = async () => {
  console.log("submitChangeStatus()");
  if (tempPurchase.value) {
    let newStatus: PaymentStatus = {
      name:
        tempPurchase.value.paymentStatus.name === "PAID" ? "TO_PAY" : "PAID",
      viewName:
        tempPurchase.value.paymentStatus.name !== "PAID"
          ? "Spłacony"
          : "Do spłaty",
    };
    const result = await purchaseStore.updatePurchaseStatusDb(
      props.purchase.id,
      newStatus
    );
    if (result && tempPurchase.value) {
      console.log("PRZED ", tempPurchase.value);

      tempPurchase.value.paymentStatus = newStatus;
      console.log("PO ", tempPurchase.value);
      toast.add({
        severity: "success",
        summary: "Potwierdzenie",
        detail: "Zmieniono status zakupu: " + props.purchase.name,
        life: 3000,
      });
    }
  }
  showStatusChangeConfirmationDialog.value = false;
};
const checked = ref(false);
</script>

<template>
  <ConfirmationDialog
    v-model:visible="showStatusChangeConfirmationDialog"
    :msg="changeStatusConfirmationMessage"
    @save="submitChangeStatus"
    @cancel="showStatusChangeConfirmationDialog = false"
  />
  <Card class="text-office-orange mb-3 p-card">
    <template #header>
      <div
        class="purchase-header"
        :class="isPaid() ? 'bg-office-paid03' : 'bg-office-dark1'"
      >
        <h6 class="mb-0 ml-3">{{ props.purchase.purchaseDate }}</h6>
        {{ isPaid() }}
        <div class="flex">
          <!-- Enabled -->
          <IconButton
            v-if="props.purchase?.paymentStatus.name === 'PAID'"
            v-tooltip.left="{
              value: 'Oznacz zakup jako nieopłacony',
              showDelay: 500,
              hideDelay: 300,
            }"
            icon="pi pi-check-square"
            color="green"
            @click="
              confirmStatusChange({ name: 'TO_PAY', viewName: 'Do zapłaty' })
            "
          >
          </IconButton>
          <IconButton
            v-if="props.purchase?.paymentStatus.name === 'TO_PAY'"
            v-tooltip.left="{
              value: 'Oznacz zakup jako opłacony',
              showDelay: 500,
              hideDelay: 300,
            }"
            icon="pi pi-stop"
            color="red"
            @click="
              confirmStatusChange({ name: 'PAID', viewName: 'Zapłacony' })
            "
          >
          </IconButton>
        </div>
      </div>
    </template>
    <template #content>
      <div class="purchase-item-row mb-2">
        <div class="purchase-item">
          <span class="firm" title="Nazwa firmy">{{ getFirmName() }}</span>
          <span class="name" title="Co kupiono">{{ props.purchase.name }}</span>
          <span class="mb-2 other" title="Dodatkowe informacje"
            >Info: {{ props.purchase.otherInfo }}</span
          >
        </div>
        <div>
          <h3>
            {{ UtilsService.formatCurrency(props.purchase.amount) }}
          </h3>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.image-card {
  max-height: 70px;
}

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
.p-card {
  background-color: rgba(7, 63, 1, 0.1) !important;
  color: #495057;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  border-radius: 6px;
}
</style>
