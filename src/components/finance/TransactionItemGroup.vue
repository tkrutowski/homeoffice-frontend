<script setup lang="ts">
  import TransactionItem from '@/components/finance/TransactionItem.vue';
  import { computed } from 'vue';
  import { UtilsService } from '@/service/UtilsService';
  import { useBankTransactionsStore } from '@/stores/bankTransactions';
  import type { BankTransaction, TransactionCategoryType } from '@/types/BankTransaction';
  import {
    transactionGroupFrameClasses,
    transactionGroupHeaderClasses,
    transactionGroupHeaderDateClass,
    transactionGroupHeaderCaptionClass,
    transactionGroupHeaderAmountClass,
  } from '@/config/financeCardTone';

  const props = defineProps<{
    transactionDate: string;
    transactions: BankTransaction[];
  }>();

  const emit = defineEmits<{
    edit: [transaction: BankTransaction];
  }>();

  const bankStore = useBankTransactionsStore();

  function getFlowType(t: BankTransaction): TransactionCategoryType | null {
    const category = bankStore.resolveTransactionCategory(t.transactionCategory);
    return category?.type ?? UtilsService.inferCategoryTypeFromTransactionType(t.transactionType);
  }

  const dayTotal = computed(() =>
    props.transactions.reduce((sum, t) => {
      const amount = Math.abs(Number(t.amount));
      const flowType = getFlowType(t);
      return sum + (flowType === 'INCOME' ? amount : -amount);
    }, 0)
  );

  const formattedTotal = computed(() => UtilsService.formatCurrency(dayTotal.value));
</script>

<template>
  <section
    class="item-group flex w-full max-w-[min(700px,calc(100%-1.5rem))] flex-col md:max-w-5xl xl:max-w-[min(92rem,calc(100%-1.5rem))]"
    :class="transactionGroupFrameClasses"
    :aria-label="`Grupa transakcji, ${transactionDate}`"
  >
    <div
      class="flex shrink-0 w-full items-center justify-between gap-2 px-5 py-4 sm:gap-4"
      :class="transactionGroupHeaderClasses"
    >
      <span class="min-w-0 truncate text-left" :class="transactionGroupHeaderDateClass" :title="transactionDate">
        {{ transactionDate }}
      </span>

      <div class="shrink-0">
        <div class="flex flex-col items-end text-right">
          <span class="whitespace-nowrap text-sm font-medium" :class="transactionGroupHeaderCaptionClass">
            Razem:
          </span>
          <span class="whitespace-nowrap" :class="transactionGroupHeaderAmountClass">{{ formattedTotal }}</span>
        </div>
      </div>
    </div>

    <div class="group-card-body flex flex-col gap-2 bg-transparent p-5">
      <div class="transaction-items-grid">
        <div v-for="tx in transactions" :key="tx.id" class="transaction-item-cell min-w-0">
          <TransactionItem :transaction="tx" @edit="emit('edit', $event)" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
  .item-group {
    margin: 50px auto;
  }

  .transaction-items-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .transaction-items-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
    }
  }

  @media (min-width: 1280px) {
    .transaction-items-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 26.5rem), 1fr));
    }
  }

  .transaction-item-cell :deep(div.mb-3.flex.flex-row) {
    margin-bottom: 0;
  }
</style>
