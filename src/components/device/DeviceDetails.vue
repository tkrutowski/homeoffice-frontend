<script setup lang="ts">

import {computed} from "vue";
import type {Device} from "@/types/Devices.ts";
import {UtilsService} from "@/service/UtilsService.ts";


const props = defineProps({
  devices: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
})

const purchaseAmounts = computed(() => {
  const amount = props.devices.map((dev: Device) => dev.purchaseAmount)
      .reduce((acc: number, currentValue: number) => acc + currentValue, 0)
  console.log('amount', amount)
  return UtilsService.formatCurrency(amount)
})

</script>

<template>
  <Card class="border dark:border-surface-700 border-surface-200 rounded-t-2xl">
    <template #header>
      <div class="flex justify-between items-center dark:bg-surface-700 bg-surface-200 rounded-t-2xl px-2">
        <span class="text-4xl" title="Kategoria">{{ props.category }} </span>
        <div class="flex flex-col">
          <span class="item-title">Razem:</span>
          <span class="text-2xl color-red font-bold">{{ purchaseAmounts }}</span>
        </div>
      </div>
    </template>
    <template #content>
      <div v-for="(dev, index) in props.devices" :key="dev.id" class="mb-5">
        <Card>
          <template #title><span class="text-2xl">{{ dev.name }}</span></template>
          <template #content>
            <div class="flex flex-row">
              <img :src="dev.imageUrl?.length > 0 ? dev.imageUrl :'../../assets/images/no_image.png'" alt="Image" width="300"/>
              <div class="ml-10">
                <div v-for="[key, value] in dev.details" :key="key" >
                  <p>{{ key }}:<span class="font-bold ml-2">{{ value }}</span></p>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="flex justify-end">
            <p class="text-xl">Cena zakupu: <span class="font-bold text-xl">{{UtilsService.formatCurrency(dev.purchaseAmount)  }}</span></p>
            </div>
          </template>
        </Card>
        <Divider v-if="index !== props.devices.length - 1"/>
      </div>
    </template>
  </Card>
</template>
