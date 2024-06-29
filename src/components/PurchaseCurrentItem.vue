<script setup lang="ts">
import { computed, ref, PropType, watch } from "vue";
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
//----------------------------------------PAY-------------------------------------------
//
const showStatusChangeConfirmationDialog = ref<boolean>(false);
const changeStatusConfirmationMessage = computed(() => {
  if (tempPurchase.value)
    return `Czy chcesz oznaczyć zakup: <b>${tempPurchase.value.name}</b> jako <b>Spłacony</b>?`;
  return "No message";
});
const submitChangeStatus = async () => {
  console.log("submitChangeStatus()");
  let newStatus: PaymentStatus = {
    name: "PAID",
    viewName: "Spłacony",
  };
  const result = await purchaseStore.payForPurchaseDb(
    props.purchase.id,
    newStatus
  );
  console.log("RESRUR", result);
  if (result) {
    toast.add({
      severity: "success",
      summary: "Potwierdzenie",
      detail: "Oznaczono jako spłacony zakup: " + props.purchase.name,
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Niepowodzenie",
      detail: "NIE oznaczono jako spłacony zakup: " + props.purchase.name,
      life: 3000,
    });
  }
  showStatusChangeConfirmationDialog.value = false;
};

const readyToPayCheckBox = ref(false);
watch(
  () => readyToPayCheckBox.value,
  (newValue) => {
    if (newValue && tempPurchase.value) {
      purchaseStore.addPurchaseToPay(tempPurchase.value);
    } else if (!newValue && tempPurchase.value) {
      purchaseStore.delPurchaseToPay(tempPurchase.value);
    }
  }
);
</script>
<template>
  <ConfirmationDialog
    v-model:visible="showStatusChangeConfirmationDialog"
    :msg="changeStatusConfirmationMessage"
    @save="submitChangeStatus"
    @cancel="showStatusChangeConfirmationDialog = false"
  />
  <Card class="text-color mb-3 p-card">
    <template #header>
      <div class="purchase-header">
        <Checkbox
          v-model="readyToPayCheckBox"
          class="custom-checkbox mt-2 ml-2"
          :binary="true"
        />
        <h4 class="mb-2 mt-2 ml-3">{{ props.purchase.purchaseDate }}</h4>
        <div class="flex">
          <!-- Enabled -->
          <IconButton
            v-if="props.purchase?.paymentStatus.name === 'TO_PAY'"
            v-tooltip.left="{
              value: 'Oznacz zakup jako opłacony',
              showDelay: 500,
              hideDelay: 300,
            }"
            class="mr-3"
            icon="pi pi-check-circle"
            color="red"
            @click="showStatusChangeConfirmationDialog = true"
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
