<script setup lang="ts">
  import { computed, type PropType } from 'vue';
  import type { Device } from '@/types/Devices.ts';
  import { UtilsService } from '@/service/UtilsService.ts';
  import type { ComponentType } from '@/types/Computer.ts';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';

  const props = defineProps({
    devices: {
      type: Array as PropType<Device[]>,
      required: true,
    },
    componentType: {
      type: Object as PropType<ComponentType>,
      required: true,
    },
  });
  const emit = defineEmits<{
    (e: 'add', category: ComponentType): void;
    (e: 'remove', category: ComponentType, device: Device): void;
  }>();

  const purchaseAmounts = computed(() => {
    return props.devices
      .map((dev: Device) => dev.purchaseAmount)
      .reduce((acc: number, currentValue: number) => acc + currentValue, 0);
  });

  const btnDisabled = computed(() => {
    return props.devices?.length >= props.componentType?.max;
  });

  const add = () => {
    emit('add', props.componentType);
  };

  const remove = (device: Device) => {
    emit('remove', props.componentType, device);
  };
</script>

<template>
  <Card class="border dark:border-surface-700 border-surface-200 rounded-t-2xl">
    <template #header>
      <div class="flex justify-between items-center dark:bg-surface-700 bg-surface-200 rounded-t-2xl px-2">
        <div class="flex gap-4">
          <span class="text-3xl" title="Kategoria">{{ props.componentType?.viewName }} </span>
          <Button
            title="Dodaj nową część"
            icon="pi pi-plus"
            size="small"
            class="mr-2"
            :disabled="btnDisabled"
            @click="add"
          />
        </div>
        <div class="flex flex-col">
          <span class="item-title">Razem:</span>
          <span class="text-2xl font-bold">{{ UtilsService.formatCurrency(purchaseAmounts) }}</span>
        </div>
      </div>
    </template>
    <template #content>
      <p v-if="props.devices?.length === 0" class="text-lg text-red-500">Brak elementów</p>
      <div v-for="(dev, index) in props.devices" :key="dev.id" class="mb-5">
        <Card>
          <template #title
            ><span class="text-2xl">{{ dev.name }}</span>
            <OfficeIconButton title="Usuń urządzenie" icon="pi pi-trash" severity="danger" @click="remove(dev)" />
          </template>
          <template #content>
            <div class="flex flex-row w-full">
              <img
                :src="dev.imageUrl?.length > 0 ? dev.imageUrl : '../../assets/images/no_image.png'"
                alt="Image"
                style="max-width: 300px"
              />
              <div class="ml-10">
                <div v-for="[key, value] in dev.details" :key="key">
                  <p>
                    {{ key }}:<span class="font-bold ml-2">{{ value }}</span>
                  </p>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="flex justify-end">
              <p class="text-xl">
                Cena zakupu:
                <span class="font-bold text-xl">{{ UtilsService.formatCurrency(dev.purchaseAmount) }}</span>
              </p>
            </div>
          </template>
        </Card>
        <Divider v-if="index !== props.devices.length - 1" />
      </div>
    </template>
  </Card>
</template>
