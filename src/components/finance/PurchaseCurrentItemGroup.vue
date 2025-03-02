2
<script setup lang="ts">
import PurchaseCurrentItem from '@/components/finance/PurchaseCurrentItem.vue'
import moment from 'moment'
import {computed, ref, watch} from 'vue'
import {UtilsService} from '@/service/UtilsService.ts'
import {useCardsStore} from '@/stores/cards.ts'
import {usePurchasesStore} from '@/stores/purchases.ts'
import type {Purchase} from "@/types/Purchase.ts";
import {PaymentStatus} from "@/types/Payment.ts";

const cardStore = useCardsStore()
const purchasesStore = usePurchasesStore()
const paid = ref<number>(0)
const toPay = ref<number>(0)
const props = defineProps({
  deadlineDate: {
    type: String,
    required: true,
  },
})
const deadlineDate = ref(props.deadlineDate)
const cardLogo = ref<string | undefined>('')
const purchases = computed(() => {
  return purchasesStore.getPurchasesByDate(deadlineDate.value)
})

// Watch to handle changes in purchases
watch(
  purchases,
  (newPurchases) => {
    if (newPurchases && newPurchases.length > 0) {
      calculate()
    }
  },
  { immediate: true },
)

const calculateToPay = computed(() => {
  return UtilsService.formatCurrency(toPay.value)
})

const isExpired = () => {
  return moment(props.deadlineDate).isBefore(moment())
}

function calculate() {
  console.log('calculate START')
  if (purchases.value && purchases.value.length > 0) {
    paid.value = 0
    toPay.value = 0
    purchases.value.forEach((p:Purchase) => {
      if (p.paymentStatus === PaymentStatus.PAID) paid.value += Number(p.amount)
      else toPay.value += Number(p.amount)
      // console.log("PurchaseItemGroup - MOUNTED: ", toPay.value);
    })
    console.log('calculate paid: ', paid.value)
    console.log('calculate topay: ', toPay.value)
    cardLogo.value = cardStore.getCardLogo(purchases.value[0].idCard)
  }
}
watch(
  () => purchasesStore.purchases,
  () => {
    calculate()
  },
  { deep: true },
)
</script>

<template>
  <Card class="item-group" :class="isExpired() ? 'expired' : 'paid'">
    <template #header>
      <div class="purchase-header mb-3" :class="isExpired() ? 'expired' : 'paid'">
        <img :src="cardLogo" alt="Card logo" class="image-card ml-4 p-1" />
        <span class="text-4xl" title="Termin spłaty">{{ props.deadlineDate }} </span>

        <div class="purchase-header-item mr-5">
          <div class="flex flex-col">
            <span class="item-title">Do spłaty:</span>
            <span class="text-2xl color-red font-bold">{{ calculateToPay }}</span>
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

.purchase-header-item {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  flex-direction: column;
}
.item-title {
  font-size: 0.8rem;
}
.expired {
  background-color: rgba(137, 6, 6, 0.3) !important;
}
.paid {
  background-color: rgba(7, 63, 1, 0.3) !important;
}
.bg-office-dark1 {
  background-color: #1e2122 !important;
}
</style>
