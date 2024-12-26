<script setup lang="ts">
import {computed, ref} from "vue";

const props = defineProps({
  category: {
    type: String,
    required: true,
  },
  deviceIds: {
    type: Array,
    required: true,
  },
  maxAmount: {
    type: Number,
    required: false,
    default: 1,
  },

})
const emit = defineEmits<{
  (e: 'add'): void
  (e: 'addView', category: string, deviceIds: number[]): void
  (e: 'removeView', category: string): void
}>()

const selected = ref<boolean>(false)

const calculateAmount = computed(() => {
  return props.deviceIds?.filter((id: number) => id > 0).length
})

const add = (event: Event) => {
  console.log("ADD")
  event.stopPropagation()
  emit('add')
}
const view = () => {
  if (selected.value) {
    selected.value = false
    emit('removeView', props.category)
  } else {
    selected.value = true
    emit('addView', props.category, props.deviceIds)
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
      Kategoria: <span class="text-xl font-semibold pl-2">{{ props.category }}</span>
    </p>
    <p class="pb-2">
      Ilość: <span class="font-semibold pl-2">{{ calculateAmount }}</span>
    </p>
    <Button
        title="Dodaj nową część"
        icon="pi pi-plus"
        size="small"
        class="mr-2"
        :disabled="calculateAmount === props.maxAmount"
        @click="add"
    />
  </div>
</template>
