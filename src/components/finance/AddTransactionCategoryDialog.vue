<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { TagIcon } from '@heroicons/vue/24/outline';
  import OfficeButton from '@/components/OfficeButton.vue';
  import FormSectionCard from '@/components/FormSectionCard.vue';
  import IconGridPicker from '@/components/share/IconGridPicker.vue';
  import ColorGridPicker from '@/components/share/ColorGridPicker.vue';
  import { ptFieldInputText } from '@/config/formFieldPt';
  import { TRANSACTION_CATEGORY_DEFAULT_COLOR } from '@/config/transactionCategoryColors';
  import { UtilsService } from '@/service/UtilsService';
  import type { TransactionCategoryCreatePayload, TransactionCategoryType } from '@/types/BankTransaction';

  const visible = defineModel<boolean>('visible', { default: false });

  const emit = defineEmits<{
    save: [payload: TransactionCategoryCreatePayload];
    cancel: [];
  }>();

  const name = ref('');
  const icon = ref('');
  const color = ref(TRANSACTION_CATEGORY_DEFAULT_COLOR);
  const type = ref<TransactionCategoryType>('EXPENSE');
  const submitted = ref(false);

  const typeOptions = [
    { label: UtilsService.formatTransactionCategoryType('EXPENSE'), value: 'EXPENSE' as const },
    { label: UtilsService.formatTransactionCategoryType('INCOME'), value: 'INCOME' as const },
  ];

  function resetForm() {
    name.value = '';
    icon.value = '';
    color.value = TRANSACTION_CATEGORY_DEFAULT_COLOR;
    type.value = 'EXPENSE';
    submitted.value = false;
  }

  watch(visible, v => {
    if (!v) resetForm();
  });

  function isValid() {
    return name.value.trim().length > 0 && icon.value.length > 0 && !!UtilsService.normalizeHexColor(color.value);
  }

  function save() {
    submitted.value = true;
    if (!isValid()) return;

    emit('save', {
      name: name.value.trim(),
      type: type.value,
      icon: icon.value,
      color: UtilsService.normalizeHexColor(color.value)!,
    });
    resetForm();
  }

  function cancel() {
    emit('cancel');
    resetForm();
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :style="{ width: 'min(95vw, 64rem)' }"
    :modal="true"
    :pt="{
      root: { class: 'border border-surface-200 dark:border-surface-700' },
      header: { class: 'bg-surface-0 dark:bg-surface-950 border-b border-surface-200 dark:border-surface-700' },
      content: { class: 'bg-surface-0 dark:bg-surface-950 p-5' },
      footer: { class: 'bg-surface-0 dark:bg-surface-950 border-t border-surface-200 dark:border-surface-700 pt-5' },
    }"
  >
    <template #header>
      <p class="mx-auto text-center text-xl text-surface-900 dark:text-surface-0">Nowa kategoria</p>
    </template>

    <FormSectionCard title="Utwórz nową kategorię" :icon="TagIcon">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-600 dark:text-surface-400">Ikona</label>
          <IconGridPicker v-model="icon" :invalid="submitted && !icon" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-600 dark:text-surface-400">Kolor</label>
          <ColorGridPicker v-model="color" :invalid="submitted && !UtilsService.normalizeHexColor(color)" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-600 dark:text-surface-400" for="new-category-name">Nazwa</label>
          <InputText
            id="new-category-name"
            v-model="name"
            placeholder="Nazwa nowej kategorii"
            :invalid="submitted && !name.trim()"
            class="w-full"
            :pt="ptFieldInputText"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-600 dark:text-surface-400">Typ</label>
          <Select
            v-model="type"
            :options="typeOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            :pt="ptFieldInputText"
          />
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
