<script setup lang="ts">
import {computed, type PropType, ref} from "vue";
import type {ComponentType, Computer} from "@/types/Computer.ts";

const props = defineProps({
  componentType: {
    type: Object as PropType<ComponentType>,
    required: true,
  },
  computer: {
    type: Object as PropType<Computer>,
    required: true
  }
})
const emit = defineEmits<{
  (e: 'addView', componentType: ComponentType): void
  (e: 'removeView', componentType: ComponentType): void
}>()

const selected = ref<boolean>(false)

const calculateQuantity = computed(() => {
  if (props.computer  && props.componentType) {
    const component= props.computer[props.componentType.column];
    if (Array.isArray(component)) {
      return component.filter((id: number) => id > 0).length;
    } else {
      return component > 0 ? 1 : 0;
    }
  }
  return 0;
})

const view = () => {
  if (selected.value) {
    selected.value = false
    emit('removeView', props.componentType)
  } else {
    selected.value = true
    emit('addView', props.componentType)
  }
}
</script>

<template>
  <div
      class="hover:bg-surface-100 hover:dark:bg-surface-800 border border-primary rounded-lg p-4 mb-4 cursor-pointer"
      :class="{
        'dark:bg-surface-700 bg-surface-200': selected,
      }"
      @click="view"
  >
    <p class="pb-2">
      Kategoria: <span class="text-xl font-semibold pl-2">{{ props.componentType.viewName }}</span>
    </p>
    <p class="pb-2">
      Ilość: <span class="font-semibold pl-2">{{ calculateQuantity }}</span>
    </p>
  </div>
</template>
