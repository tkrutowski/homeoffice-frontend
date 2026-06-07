<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed, ref } from 'vue';
  import type { BankTransaction } from '@/types/BankTransaction';
  import { UtilsService } from '@/service/UtilsService';
  import { useFirmsStore } from '@/stores/firms';
  import { useBankTransactionsStore } from '@/stores/bankTransactions';
  import {
    getCategoryDisplay,
    getCategoryInitial,
  } from '@/config/transactionCategoryIcons';
  import {
    transactionItemCardClasses,
    transactionItemTitleClass,
    transactionItemSubtitleClass,
    transactionItemOtherInfoClass,
    transactionFirmAvatarClass,
  } from '@/config/financeCardTone';
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import { useToast } from 'primevue/usetoast';

  const firmStore = useFirmsStore();
  const bankStore = useBankTransactionsStore();
  const toast = useToast();

  const props = defineProps({
    transaction: {
      type: Object as PropType<BankTransaction>,
      required: true,
    },
  });

  const emit = defineEmits<{
    edit: [transaction: BankTransaction];
  }>();

  const row = computed(() => bankStore.getTransactionById(props.transaction.id) ?? props.transaction);

  const firmName = computed(() => {
    const firm = firmStore.getFirm(row.value.idFirm);
    return firm?.name ?? 'Brak firmy';
  });

  const firmInitial = computed(() => {
    const c = firmName.value.trim().charAt(0);
    return c ? c.toUpperCase() : '?';
  });

  const resolvedCategory = computed(() =>
    bankStore.resolveTransactionCategory(row.value.transactionCategory)
  );

  const categoryName = computed(() => resolvedCategory.value?.name ?? '—');
  const categoryDisplay = computed(() => getCategoryDisplay(resolvedCategory.value));

  const isIncome = computed(() => {
    const categoryType = resolvedCategory.value?.type;
    if (categoryType) return categoryType === 'INCOME';
    return UtilsService.inferCategoryTypeFromTransactionType(row.value.transactionType) === 'INCOME';
  });

  const amountTextClass = computed(() =>
    isIncome.value
      ? 'text-emerald-700 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'
  );

  const displayLabels = computed(() =>
    (row.value.transactionLabel ?? [])
      .map(label => ({
        id: label.id,
        name: bankStore.resolveTransactionLabelName(label),
      }))
      .filter(label => label.name)
  );

  const showDeleteDialog = ref(false);
  const deleteMessage = computed(
    () => `Czy na pewno usunąć transakcję: <b>${row.value.description || firmName.value}</b>?`
  );

  async function confirmDelete() {
    try {
      await bankStore.deleteTransactionDb(row.value.id);
      toast.add({
        severity: 'success',
        summary: 'Usunięto',
        detail: 'Transakcja została usunięta.',
        life: 3000,
      });
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Błąd',
        detail: 'Nie udało się usunąć transakcji.',
        life: 3000,
      });
    }
    showDeleteDialog.value = false;
  }
</script>

<template>
  <ConfirmationDialog
    v-model:visible="showDeleteDialog"
    :msg="deleteMessage"
    @save="confirmDelete"
    @cancel="showDeleteDialog = false"
  />

  <div
    class="mb-3 flex flex-row justify-between gap-4 rounded-2xl border p-5 transition-[box-shadow,transform,filter] duration-150"
    :class="transactionItemCardClasses"
  >
    <div class="flex min-w-0 flex-1 flex-col justify-between gap-4">
      <div class="flex min-w-0 items-start gap-3">
        <div :class="transactionFirmAvatarClass" aria-hidden="true">
          {{ firmInitial }}
        </div>
        <div class="min-w-0 flex-1 flex-col">
          <span class="block truncate text-lg font-bold leading-tight" :class="transactionItemTitleClass" :title="firmName">
            {{ firmName }}
          </span>
          <span class="mt-0.5 flex items-center gap-2 text-sm" :class="transactionItemSubtitleClass">
            <span
              v-if="categoryDisplay"
              class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white"
              :style="{ backgroundColor: categoryDisplay.backgroundColor }"
            >
              <i v-if="categoryDisplay.iconClass" :class="categoryDisplay.iconClass" aria-hidden="true" />
              <span v-else class="text-[0.6rem] font-bold">{{ categoryDisplay.initial ?? getCategoryInitial(categoryName) }}</span>
            </span>
            <span
              v-else
              class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-500 text-xs font-bold text-white dark:bg-surface-600"
            >
              {{ getCategoryInitial(categoryName) }}
            </span>
            <span class="truncate">{{ categoryName }}</span>
          </span>
          <span
            v-if="row.description"
            class="mt-1 block truncate text-sm"
            :class="transactionItemOtherInfoClass"
            :title="row.description"
          >
            {{ row.description }}
          </span>
          <div v-if="displayLabels.length" class="mt-2 flex flex-wrap gap-1">
            <Tag
              v-for="label in displayLabels"
              :key="label.id"
              severity="contrast"
              rounded
            >
              {{ label.name }}
            </Tag>
          </div>
        </div>
      </div>
    </div>

    <div class="flex shrink-0 flex-col items-end justify-between gap-3 self-stretch">
      <span class="text-right text-2xl font-bold tabular-nums tracking-tight" :class="amountTextClass">
        {{ UtilsService.formatCurrency(row.amount) }}
      </span>
      <div class="flex flex-row gap-1">
        <OfficeIconButton
          title="Edytuj transakcję"
          icon="pi pi-file-edit"
          class="text-orange-500"
          @click="emit('edit', row)"
        />
        <OfficeIconButton
          title="Usuń transakcję"
          icon="pi pi-trash"
          class="text-red-500"
          @click="showDeleteDialog = true"
        />
      </div>
    </div>
  </div>
</template>
