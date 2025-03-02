<script setup lang="ts">
import OfficeButton from '@/components/OfficeButton.vue'
import {ref} from 'vue'

defineProps({
  msg: {
    type: String,
    required: true,
    default: 'NO MESSAGE',
  },
  label1: {
    type: String,
    required: false,
    default: 'label1',
  },
  label2: {
    type: String,
    required: false,
    default: 'label2',
  },
})
const emit = defineEmits<{
  (e: 'save', input1: string, input2: string, close: boolean): void
  (e: 'cancel'): void
}>()

const input1 = ref<string>("")
const input2 = ref<string>("")

const saveAndClose = () => {
  if (input1.value.length > 0 && input2.value.length > 0) {
    emit('save', input1.value, input2.value, true)
    input1.value = ''
    input2.value = ''
  }
}

const save = () => {
  if (input1.value.length > 0 && input2.value.length > 0) {
    emit('save', input1.value, input2.value, false)
    input1.value = ''
    input2.value = ''
  }
}

const cancel = () => {
  emit('cancel')
}
</script>

<template>
  <Dialog :style="{ width: '550px' }" :modal="true">
    <template #header>
      <h4>{{ msg }}</h4>
    </template>
    <div class="flex flex-col mb-3">
      <label for="label1" class="mb-1">{{ label1 }}</label>
      <InputText id="label1" v-model="input1" class="flex-auto" autofocus/>
    </div>
    <div v-if="label2 !== 'label2'" class="flex flex-col">
      <label for="label2" class="mb-1">{{ label2 }}</label>
      <Textarea id="label2" v-model="input2" rows="5" class="flex-auto"/>
    </div>
    <template #footer>
      <div class="flex flex-row gap-4">
        <OfficeButton
            text="Anuluj"
            btn-type="office-regular"
            @click="cancel"
            @abort="cancel"
        ></OfficeButton>
        <OfficeButton text="Dodaj" btn-type="office-save" @click="save"
                      :btn-disabled="input1.length===0 || input2.length===0"></OfficeButton>
        <OfficeButton text="zapisz i zamknij" btn-type="office-save" @click="saveAndClose"
                      :btn-disabled="input1.length===0 || input2.length===0"></OfficeButton>
      </div>
    </template>
  </Dialog>
</template>