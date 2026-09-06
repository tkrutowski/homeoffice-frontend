<script setup lang="ts">
  import AddFirmDialog from '@/components/share/AddFirmDialog.vue';
  import AddTransactionCategoryDialog from '@/features/finance/transactions/AddTransactionCategoryDialog.vue';
  import AddDialog from '@/components/AddDialog.vue';
  import type { Firm } from '@/types/Firm';
  import type { TransactionCategoryCreatePayload } from '@/features/finance/transactions/types';

  // Grupuje trzy dialogi "szybkiego dodawania" (firma/kategoria/etykieta) wywoływane
  // przyciskiem "+" przy odpowiednich polach — wspólne dla AddEditTransactionDialog
  // i BankCsvImportControl, żeby nie powtarzać tego samego znacznika w obu miejscach.
  const showFirm = defineModel<boolean>('showFirm', { default: false });
  const showCategory = defineModel<boolean>('showCategory', { default: false });
  const showLabel = defineModel<boolean>('showLabel', { default: false });

  const emit = defineEmits<{
    'save-firm': [firm: Firm];
    'save-category': [payload: TransactionCategoryCreatePayload];
    'save-label': [name: string];
  }>();
</script>

<template>
  <AddFirmDialog v-model:visible="showFirm" @save="emit('save-firm', $event)" @cancel="showFirm = false" />

  <AddTransactionCategoryDialog
    v-model:visible="showCategory"
    @save="emit('save-category', $event)"
    @cancel="showCategory = false"
  />

  <AddDialog
    v-model:visible="showLabel"
    msg="Nowa etykieta"
    label1="Nazwa etykiety"
    @save="emit('save-label', $event)"
    @cancel="showLabel = false"
  />
</template>
