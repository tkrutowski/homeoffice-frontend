<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import Popover from 'primevue/popover';
  import type { TransactionCategoryDto, TransactionCategoryType } from '@/types/BankTransaction';
  import { getCategoryDisplay } from '@/config/transactionCategoryIcons';
  import { TRANSACTION_CATEGORY_DEFAULT_COLOR } from '@/config/transactionCategoryColors';
  import { UtilsService } from '@/service/UtilsService';

  const props = defineProps<{
    categories: TransactionCategoryDto[];
    loading?: boolean;
    invalid?: boolean;
  }>();

  const model = defineModel<TransactionCategoryDto | null>({ default: null });

  const popoverRef = ref<InstanceType<typeof Popover> | null>(null);
  const activeTab = ref<TransactionCategoryType>('EXPENSE');

  const selectedDisplay = computed(() => getCategoryDisplay(model.value));

  const filteredCategories = computed(() => props.categories.filter(c => (c.type ?? 'EXPENSE') === activeTab.value));

  watch(model, category => {
    if (category?.type) activeTab.value = category.type;
  });

  function toggle(event: Event) {
    if (props.loading) return;
    popoverRef.value?.toggle(event);
  }

  function selectCategory(category: TransactionCategoryDto) {
    model.value = category;
    popoverRef.value?.hide();
  }

  function setTab(tab: TransactionCategoryType) {
    activeTab.value = tab;
  }
</script>

<template>
  <div class="relative h-full min-w-0 flex-1">
    <button
      type="button"
      class="flex h-full w-full min-w-0 items-center gap-2 px-3 text-left transition-colors disabled:cursor-wait disabled:opacity-70"
      :disabled="loading"
      @click="toggle"
    >
      <span
        v-if="selectedDisplay"
        class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-white"
        :style="{ backgroundColor: selectedDisplay.backgroundColor }"
      >
        <i v-if="selectedDisplay.iconClass" :class="selectedDisplay.iconClass" aria-hidden="true" />
        <span v-else class="text-[0.65rem] font-bold">{{ selectedDisplay.initial }}</span>
      </span>
      <span
        v-else
        class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
      >
        <i class="pi pi-plus text-xs" aria-hidden="true" />
      </span>

      <span
        class="min-w-0 flex-1 truncate text-sm"
        :class="model ? 'text-surface-900 dark:text-surface-0' : 'text-surface-500 dark:text-surface-400'"
      >
        {{ model?.name ?? 'Wybierz kategorię…' }}
      </span>

      <i
        v-if="loading"
        class="pi pi-spin pi-spinner shrink-0 text-surface-500 dark:text-surface-400"
        aria-hidden="true"
      />
      <i v-else class="pi pi-chevron-down shrink-0 text-xs text-surface-500 dark:text-surface-400" aria-hidden="true" />
    </button>

    <Popover
      ref="popoverRef"
      class="w-[min(20rem,calc(100vw-2rem))] border border-surface-200 bg-surface-0 dark:border-surface-700 dark:bg-surface-950"
      :pt="{ content: { class: 'p-0' } }"
    >
      <div class="flex flex-col">
        <div class="flex gap-1 border-b border-surface-200 p-2 dark:border-surface-700">
          <button
            type="button"
            class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            :class="
              activeTab === 'EXPENSE'
                ? 'bg-red-500 text-white dark:bg-red-600'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
            "
            @click="setTab('EXPENSE')"
          >
            {{ UtilsService.formatTransactionCategoryType('EXPENSE') }}
          </button>
          <button
            type="button"
            class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            :class="
              activeTab === 'INCOME'
                ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
            "
            @click="setTab('INCOME')"
          >
            {{ UtilsService.formatTransactionCategoryType('INCOME') }}
          </button>
        </div>

        <ul class="max-h-64 overflow-y-auto py-1">
          <li v-if="filteredCategories.length === 0" class="px-4 py-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Brak kategorii tego typu
          </li>
          <li v-for="category in filteredCategories" :key="category.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
              :class="model?.id === category.id ? 'bg-surface-100 dark:bg-surface-800' : ''"
              @click="selectCategory(category)"
            >
              <span
                class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-white"
                :style="{
                  backgroundColor: UtilsService.normalizeHexColor(category.color) ?? TRANSACTION_CATEGORY_DEFAULT_COLOR,
                }"
              >
                <i
                  v-if="UtilsService.toPrimeIconClass(category.icon)"
                  :class="UtilsService.toPrimeIconClass(category.icon)"
                  aria-hidden="true"
                />
              </span>
              <span class="truncate text-surface-900 dark:text-surface-0">{{ category.name }}</span>
            </button>
          </li>
        </ul>
      </div>
    </Popover>

    <span v-if="invalid" class="sr-only">Pole wymagane</span>
  </div>
</template>
