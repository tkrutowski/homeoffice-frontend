<script setup lang="ts">
import type {ButtonType} from '@/types/ButtonType'

defineProps({
  btnType: {
    //dodanie typu
    type: String as () => ButtonType,
    required: true,
  },
  text: {
    type: String,
    required: false,
  },
  btnDisabled: {
    type: Boolean,
    required: false,
  },
  loading: {
    type: Boolean,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
  iconPos: {
    type: String as () => 'right' | 'left' | 'top' | 'bottom',
    required: false,
    default: 'right'
  }
})
</script>
<template>
  <Button
      type="button"
      class="disabled:bg-surface-500 hover:disabled:!bg-surface-500 px-4 py-2"
      :class="{
      'font-bold uppercase tracking-widest border bg-primary hover:!bg-primary-700 border-primary-900 hover:!border-primary-900':
        btnType === 'office-regular',
      'font-bold uppercase tracking-widest border bg-red-600 hover:!bg-red-800 border-red-900 hover:!border-red-900':
        btnType === 'office-save',
    }"
      :disabled="btnDisabled"
      :loading="loading"
      :icon="icon"
      :icon-pos="iconPos"
      :label="text"
  >
  </Button>
</template>
<style scoped>
:deep(.p-button-label) {
  text-transform: uppercase;
}
</style>
