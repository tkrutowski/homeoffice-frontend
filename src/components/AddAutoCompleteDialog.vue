<script setup lang="ts">
import OfficeButton from '@/components/OfficeButton.vue'
import {ref, watch} from 'vue'
type  T = {
  id: number
  name: string
}
const props = defineProps<{
  msg: string,
  objectList: T[],
  visible: boolean,
}>()
const emit = defineEmits<{
  (e: 'save', id: number): void
  (e: 'cancel'): void
  (e: 'update:visible', value: boolean): void
}>()

const selected = ref<T | null>(null)
const filtered = ref<T[]>([])
const inputRef = ref(null);

watch(() => props.visible, (newValue) => {
  if (newValue) {
    selected.value = null;
    filtered.value = [];
  }
})

const search = (event: { query: string }) => {
  filtered.value = props.objectList.filter((item: T) => {
    return item.name.toLowerCase().includes(event.query.toLowerCase())
  })
}

const save = () => {
  emit('save', selected.value?.id || 0)
}

const cancel = () => {
  emit('cancel')
}
</script>

<template>
  <Dialog :style="{ width: '550px' }" :modal="true" :visible="visible" @update:visible="$emit('update:visible', $event)" @hide="cancel">
    <template #header>
      <p class="text-2xl">Wybierz</p>
    </template>
    <div class="flex flex-col w-full">
      <label for="input-customer">{{msg}}</label>
      <AutoComplete
          ref="inputRef"
          id="input-customer"
          v-model="selected"
          dropdown
          force-selection
          :suggestions="filtered"
          option-label="name"
          @complete="search"

      />
    </div>
    <template #footer>
      <div class="flex flex-row gap-4">
        <OfficeButton
            text="Anuluj"
            btn-type="office-regular"
            @click="cancel"
            @abort="cancel"
        ></OfficeButton>
        <OfficeButton text="zapisz" btn-type="office-save" @click="save" :btn-disabled="selected === null"></OfficeButton>
      </div>
    </template>
  </Dialog>
</template>
