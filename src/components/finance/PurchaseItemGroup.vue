<script setup lang="ts">
import type {Purchase} from '@/types/Purchase.ts'
import {computed, onMounted, ref, watch} from 'vue'
import {UtilsService} from '@/service/UtilsService.ts'
import moment from 'moment'
import {useCardsStore} from '@/stores/cards.ts'
import {usePurchasesStore} from '@/stores/purchases.ts'
import PurchaseCurrentItem from '@/components/finance/PurchaseCurrentItem.vue'
import {PaymentStatus} from "@/types/Payment.ts";

const cardStore = useCardsStore()
const purchasesStore = usePurchasesStore()
const paid = ref<number>(0)
const toPay = ref<number>(0)
const idCard = ref<number>(0)
const props = defineProps({
  deadlineDate: {
    type: String,
    required: true,
  },
})
const purchases = ref<Purchase[] | undefined>(purchasesStore.getPurchasesByDate(props.deadlineDate))

const calculateTotal = computed(() => {
  return UtilsService.formatCurrency(paid.value + toPay.value)
})
const calculatePaid = computed(() => {
  return UtilsService.formatCurrency(paid.value)
})
const calculateToPay = computed(() => {
  return UtilsService.formatCurrency(toPay.value)
})

const isExpired = () => {
  return moment(props.deadlineDate).isBefore(moment())
}

function calculate() {
  if (purchases.value) {
    paid.value = 0
    toPay.value = 0
    purchases.value.forEach((p:Purchase) => {
      if (p.paymentStatus === PaymentStatus.PAID) paid.value += Number(p.amount)
      else toPay.value += Number(p.amount)
      // console.log("PurchaseItemGroup - MOUNTED: ", toPay.value);
    })
    idCard.value = purchases.value[0].idCard
  }
}
onMounted(async () => {
  // console.log("PurchaseItemGroup - MOUNTED");
  // purchases.value = purchasesStore.getPurchasesByDate(props.deadlineDate);
  calculate()
})
watch(
  () => purchasesStore.purchasesCurrent,
  () => {
    calculate()
  },
  { deep: true },
)
</script>

<template>
  <Card class="item-group" :class="isExpired() ? 'bg-office-expired01' : 'bg-office-dark1'">
    <template #header>
      <div class="purchase-header mb-3" :class="isExpired() ? 'bg-office-expired03' : null">
        <img
          :src="cardStore.getCardLogo(idCard)"
          alt="Card logo"
          class="image-card ml-4 mt-3 mb-2"
        />
        <h4
          title="Termin spłaty"
          class="mb-0"
        >
          {{ props.deadlineDate }}
        </h4>

        <div class="purchase-header-item mr-5">
          <div>
            <span class="item-title" title="Nazwa firmy">Zapłacono:</span>
            <span class="pl-2 color-green" title="Nazwa firmy">{{ calculatePaid }}</span>
          </div>
          <div>
            <span class="item-title" title="Nazwa firmy">Do zapłaty:</span>
            <span class="pl-2 color-red" title="Nazwa firmy">{{ calculateToPay }}</span>
          </div>
          <div>
            <span class="item-title" title="Nazwa firmy">RAZEM:</span>
            <span class="pl-2" title="Nazwa firmy">{{ calculateTotal }}</span>
          </div>
        </div>
      </div>
    </template>
    <template #content>
      <PurchaseCurrentItem v-for="purchase in purchases" :key="purchase.id" :purchase="purchase" />
      <br />
    </template>
  </Card>
</template>

<style scoped>
.item-group {
  margin: 50px auto;
  max-width: 700px;
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
.expired {
  background-color: rgba(137, 6, 6, 0.4) !important;
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
</style>
