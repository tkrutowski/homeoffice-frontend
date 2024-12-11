<script setup lang="ts">
import { ref, watch } from 'vue'
import moment from 'moment'

const props = defineProps<{
  modelValue: Date | Date[] | (Date | null)[] | null | undefined
}>()

const emit = defineEmits(['update:model-value'])

const formatDate = (date: Date | null | undefined): string | null => {
  if (!date) return null
  return moment(date).format('YYYY-MM-DD')
}

const localValue = ref<Date | Date[] | (Date | null)[] | null | undefined>(
  formatDate(props.modelValue as Date) === '0001-01-01' ? null : props.modelValue,
)

watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = formatDate(newValue as Date) === '0001-01-01' ? null : newValue
  },
)

watch(localValue, (newValue) => {
  emit('update:model-value', newValue)
})
</script>

<template>
  <DatePicker v-model="localValue" v-bind="$attrs" />
</template>

<style scoped></style>
