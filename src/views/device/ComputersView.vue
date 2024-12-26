<script setup lang="ts">
import {useDevicesStore} from '../../stores/devices'
import {computed, onMounted, ref, watch} from 'vue'
import OfficeButton from '../../components/OfficeButton.vue'
import {useToast} from 'primevue/usetoast'
import type {Device} from '../../types/Devices'
import TheMenuDevice from '../../components/device/TheMenuDevice.vue'
import {UtilsService} from '../../service/UtilsService'
import {useComputerStore} from "@/stores/computers.ts";
import type {Computer} from "@/types/Computer.ts";
import ComputerPart from "@/components/device/ComputerPart.vue";
import DeviceDetails from "@/components/device/DeviceDetails.vue";

const deviceStore = useDevicesStore()
const computerStore = useComputerStore()

const toast = useToast()

onMounted(async () => {
  console.log('onMounted GET')
  if (deviceStore.devices.length === 0) await deviceStore.getDevices()
  if (computerStore.computers.length === 0) await computerStore.getComputers()
})

const deviceDetailsMap = ref<Map<string, Device[]>>(new Map<string, Device[]>())
const selectedComputer = ref<Computer | null>(null)
const hasChange = ref<boolean>(false)

const addView = async (category: string, deviceIds: number[]) => {
  const devices = await Promise.all(deviceIds.filter((id: number) => id > 0)
      .map((id: number) => deviceStore.getDevice(id)))
  deviceDetailsMap.value.set(category, devices)
}
const removeView = async (category: string) => {
  deviceDetailsMap.value.delete(category)
}

const selectedDevicesCost = computed(() => {
  return Array.from(deviceDetailsMap.value.values())
      .flat()
      .map((device: Device) => device.purchaseAmount)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
})
const panelHeight = ref<number>(0);
const devDetailsRef = ref([]);
watch(devDetailsRef.value, refs => {
  let height = 0
  refs.forEach((el) => {
    if (el) {
      height += el.offsetHeight
    }
  });
  panelHeight.value = height
})
</script>

<template>
  <TheMenuDevice/>
  <Toolbar class="m-6">
    <template #start>
      <OfficeButton btn-type="office-regular" text="Nowy" icon-pos="left" icon="pi pi-plus" class="mr-2"
                    @click="openNew"/>
    </template>

    <template #center>
      <Select v-model="selectedComputer" :options="computerStore.computers" optionLabel="name"
              placeholder="Wybierz komputer"/>
    </template>

    <template #end>
      <OfficeButton btn-type="office-save" text="zapisz" :btn-disabled="!hasChange" icon="pi pi-save" class="mr-2"
                    @click="openNew"/>
    </template>
  </Toolbar>
  <div class="flex gap-4 m-6">
    <Card class="flex-1 min-w-96 min-h-[calc(100vh-440px)]">
      <template #title>
        <div class="flex justify-center">
          <span class="font-bold text-2xl">Kategorie</span>
        </div>
      </template>
      <template #content>
        <ScrollPanel v-if="selectedComputer" class=" overflow-y-auto min-h-[calc(100vh-440px)]"
                     :style="{maxHeight: panelHeight + 'px'}">
          <ComputerPart category="Obudowa" :deviceIds="[selectedComputer.case]" :max-amount="1" @addView="addView"
                        @removeView="removeView"/>
          <ComputerPart category="Płyta główna" :deviceIds="[selectedComputer.mainBoard]" :max-amount="1"
                        @addView="addView" @removeView="removeView"/>
          <ComputerPart category="Procesor" :deviceIds="[selectedComputer.processor]" :max-amount="1" @addView="addView"
                        @removeView="removeView"/>
          <ComputerPart category="RAM" :deviceIds="selectedComputer.ram" :max-amount="4" @addView="addView"
                        @removeView="removeView"/>
          <ComputerPart category="Karta graficzna" :deviceIds="selectedComputer.graphicCard" :max-amount="2"
                        @addView="addView" @removeView="removeView"/>
          <ComputerPart category="Dysk" :deviceIds="selectedComputer.disk" :max-amount="10" @addView="addView"
                        @removeView="removeView"/>
          <ComputerPart category="Zasilacz" :deviceIds="[selectedComputer.power]" :max-amount="1" @addView="addView"
                        @removeView="removeView"/>
          <ComputerPart category="Chłodzenie" :deviceIds="selectedComputer.cooling" :max-amount="10" @addView="addView"
                        @removeView="removeView"/>
          <ComputerPart category="Monitor" :deviceIds="selectedComputer.monitor" :max-amount="3" @addView="addView"
                        @removeView="removeView"/>
          <ComputerPart category="Klawiatura" :deviceIds="[selectedComputer.keyboard]" :max-amount="1"
                        @addView="addView" @removeView="removeView"/>
          <ComputerPart category="Mysz" :deviceIds="[selectedComputer.mouse]" :max-amount="1" @addView="addView"
                        @removeView="removeView"/>
          <ComputerPart category="Karta dzwiękowa" :deviceIds="[selectedComputer.soundCard]" :max-amount="1"
                        @addView="addView" @removeView="removeView"/>
          <ComputerPart category="USB" :deviceIds="selectedComputer.usb" :max-amount="10" @addView="addView"
                        @removeView="removeView"/>

        </ScrollPanel>
      </template>
    </Card>

    <Panel class="w-full" ref="panelRef">
      <template #header>
        <div class="w-full flex justify-center gap-4">
          <span class="font-bold text-3xl ml-2 text-color">Wybrane kategorie: {{
              UtilsService.formatCurrency(selectedDevicesCost)
            }}</span>
          <div v-if="deviceStore.loadingDevices || computerStore.loadingComputers">
            <ProgressSpinner style="width: 35px; height: 35px" stroke-width="5"/>
          </div>
        </div>
      </template>
      <div v-for="[category, devices] in deviceDetailsMap" :key="category" ref="devDetailsRef">
        <DeviceDetails :category="category" :devices="devices" class="mb-5"/>
      </div>
    </Panel>
  </div>
</template>
