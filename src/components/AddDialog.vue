<script setup lang="ts">
  import OfficeButton from '@/components/OfficeButton.vue';
  import FormSectionCard from '@/components/FormSectionCard.vue';
  import { ptFieldInputText } from '@/config/formFieldPt';
  import { PencilSquareIcon } from '@heroicons/vue/24/outline';
  import { ref, watch } from 'vue';

  const visible = defineModel<boolean>('visible', { default: false });

  const props = defineProps({
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
    value1: {
      type: String,
      required: false,
      default: '',
    },
    value2: {
      type: String,
      required: false,
      default: '',
    },
  });
  const emit = defineEmits<{
    (e: 'save', in1: string, in2: string): void;
    (e: 'cancel'): void;
  }>();

  const input1 = ref<string>(props.value1);
  const input2 = ref<string>(props.value2);

  watch(
    () => props.value1,
    newValue => {
      input1.value = newValue;
    },
    { immediate: true }
  );
  watch(
    () => props.value2,
    newValue => {
      input2.value = newValue;
    },
    { immediate: true }
  );

  const save = () => {
    emit('save', input1.value, input2.value);
    input1.value = '';
    input2.value = '';
  };

  const cancel = () => {
    emit('cancel');
  };
</script>

<template>
  <Dialog v-model:visible="visible" :style="{ width: 'min(95vw, 32rem)' }" :modal="true">
    <template #header>
      <p class="text-xl font-medium text-surface-900 dark:text-surface-0">{{ msg }}</p>
    </template>
    <FormSectionCard title="Dane" :icon="PencilSquareIcon">
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="add-dialog-input1">{{ label1 }}</label>
          <InputText id="add-dialog-input1" v-model="input1" :pt="ptFieldInputText" autofocus />
        </div>
        <div v-if="label2 !== 'label2'" class="flex flex-col gap-2">
          <label class="text-sm text-surface-600 dark:text-surface-400" for="add-dialog-input2">{{ label2 }}</label>
          <InputText id="add-dialog-input2" v-model="input2" :pt="ptFieldInputText" />
        </div>
      </div>
    </FormSectionCard>
    <template #footer>
      <div class="flex flex-row gap-4">
        <OfficeButton text="Anuluj" btn-type="office-regular" @click="cancel" @abort="cancel" />
        <OfficeButton text="zapisz" btn-type="office-save" @click="save" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped></style>
