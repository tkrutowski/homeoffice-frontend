2
<script setup lang="ts">
import PurchaseCurrentItem from "@/components/PurchaseCurrentItem.vue";
import moment from "moment";
import { computed, ref, watch } from "vue";
import { UtilsService } from "@/service/UtilsService";
import { useCardsStore } from "@/stores/cards";
import { usePurchasesStore } from "@/stores/purchases";

const cardStore = useCardsStore();
const purchasesStore = usePurchasesStore();
const paid = ref<number>(0);
const toPay = ref<number>(0);
const idCard = ref<number>(0);
const props = defineProps({
  deadlineDate: {
    type: String,
    required: true,
  },
});
const deadlineDate = ref(props.deadlineDate);
const purchases = computed(() => {
  return purchasesStore.getPurchasesByDate(deadlineDate.value);
});

// Watch to handle changes in purchases
watch(
  purchases,
  (newPurchases) => {
    if (newPurchases && newPurchases.length > 0) {
      idCard.value = newPurchases[0].idCard;
    }
  },
  { immediate: true }
);

const calculateToPay = computed(() => {
  return UtilsService.formatCurrency(toPay.value);
});

const isExpired = () => {
  return moment(props.deadlineDate).isBefore(moment());
};

function calculate() {
  if (purchases.value && purchases.value.length > 0) {
    paid.value = 0;
    toPay.value = 0;
    purchases.value.forEach((p) => {
      if (p.paymentStatus.name === "PAID") paid.value += Number(p.amount);
      else toPay.value += Number(p.amount);
      // console.log("PurchaseItemGroup - MOUNTED: ", toPay.value);
    });
    // console.log("ERROR idCasrd: ", purchases.value);
    idCard.value = purchases.value[0].idCard;
  }
}
watch(
  () => purchasesStore.purchases,
  () => {
    calculate();
  },
  { deep: true }
);
const getCardLogo = computed(() => {
  console.log("getCardLogo", idCard.value);
  return cardStore.getCardLogo(idCard.value);
});
</script>

<template>
  <Card
    class="item-group"
    :class="isExpired() ? 'bg-office-expired01' : 'bg-office-dark1'"
  >
    <template #header>
      <div
        class="purchase-header mb-3"
        :class="isExpired() ? 'bg-office-expired03' : 'bg-office-paid03'"
      >
        <img :src="getCardLogo" alt="Card logo" class="image-card ml-4 p-1" />
        <h2
          v-tooltip.top="{
            value: 'Termin spłaty',
            showDelay: 1000,
            hideDelay: 300,
          }"
        >
          {{ props.deadlineDate }}
        </h2>

        <div class="purchase-header-item mr-5">
          <div>
            <span class="item-title">Do zapłaty:</span>
            <span class="pl-2 color-red">{{ calculateToPay }}</span>
          </div>
        </div>
      </div>
    </template>
    <template #content>
      <PurchaseCurrentItem
        v-for="purchase in purchases"
        :key="purchase.id"
        :purchase="purchase"
        :id="purchase.id"
      />
      <br />
    </template>
    <!--    <template #footer> </template>-->
  </Card>
</template>

<style scoped>
.item-group {
  margin: 50px auto;
  max-width: 700px;
  color: #ee7f00;
}
.image-card {
  max-height: 70px;
}

.purchase-header {
  display: flex;
  align-content: center;
  justify-content: space-between;
  align-items: center;
}

.purchase-header-item {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  flex-direction: column;
}
.item-title {
  font-size: 0.8rem;
}
.bg-office-expired03 {
  background-color: rgba(137, 6, 6, 0.3) !important;
}
.bg-office-expired01 {
  background-color: rgba(137, 6, 6, 0.1) !important;
}
.bg-office-paid03 {
  background-color: rgba(7, 63, 1, 0.3) !important;
}
.bg-office-dark1 {
  background-color: #1e2122 !important;
}
</style>
