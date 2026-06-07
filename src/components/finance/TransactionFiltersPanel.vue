<script setup lang="ts">
  import type { TransactionCategoryDto } from '@/types/BankTransaction';
  import type { User } from '@/types/User';
  import { ptFieldInputText, ptSelectInField } from '@/config/formFieldPt';
  import { getCategoryDisplay } from '@/config/transactionCategoryIcons';
  import { TRANSACTION_CATEGORY_DEFAULT_COLOR } from '@/config/transactionCategoryColors';
  import { computed } from 'vue';

  const props = defineProps<{
    categories: TransactionCategoryDto[];
    selectedCategoryIds: number[];
    peopleOptions: User[];
    selectedUsers: User[];
    isAdmin: boolean;
    noteFilter: string;
    amountRange: [number, number];
    amountMin: number;
    amountMax: number;
    loadingCategories?: boolean;
    loadingUsers?: boolean;
  }>();

  const emit = defineEmits<{
    'update:selectedCategoryIds': [value: number[]];
    'update:selectedUsers': [value: User[]];
    'update:noteFilter': [value: string];
    'update:amountRange': [value: [number, number]];
    reset: [];
  }>();

  const selectedCategories = computed({
    get: () => props.categories.filter(c => props.selectedCategoryIds.includes(c.id)),
    set: (val: TransactionCategoryDto[]) => emit('update:selectedCategoryIds', val.map(c => c.id)),
  });

  const selectedPeople = computed({
    get: () => props.selectedUsers,
    set: (val: User[]) => emit('update:selectedUsers', val),
  });

  const note = computed({
    get: () => props.noteFilter,
    set: (v: string) => emit('update:noteFilter', v),
  });

  const range = computed({
    get: () => props.amountRange,
    set: (v: [number, number]) => emit('update:amountRange', v),
  });

  function userLabel(u: User) {
    return `${u.firstName} ${u.lastName}`;
  }
</script>

<template>
  <div
    class="shrink-0 border-b border-surface-200 bg-surface-50 px-6 py-4 dark:border-surface-700 dark:bg-surface-900"
  >
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm font-semibold text-surface-700 dark:text-surface-200">Filtry</span>
      <button
        type="button"
        class="text-sm text-primary hover:underline dark:text-orange-400"
        @click="emit('reset')"
      >
        Resetuj filtry
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Kategoria</label>
        <MultiSelect
          v-model="selectedCategories"
          :options="categories"
          option-label="name"
          placeholder="Wszystkie kategorie"
          :loading="loadingCategories"
          :max-selected-labels="0"
          class="w-full"
          :pt="{ label: { class: 'flex items-center gap-2' } }"
        >
          <template #value="{ value }">
            <span
              v-if="value?.length"
              class="mr-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-500 text-xs font-semibold text-white dark:bg-surface-400 dark:text-surface-950"
            >
              {{ value.length }}
            </span>
            <span>Wszystkie kategorie</span>
          </template>
          <template #option="{ option }">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.6rem] text-white"
                :style="{
                  backgroundColor:
                    getCategoryDisplay(option)?.backgroundColor ?? TRANSACTION_CATEGORY_DEFAULT_COLOR,
                }"
              >
                <i
                  v-if="getCategoryDisplay(option)?.iconClass"
                  :class="getCategoryDisplay(option)?.iconClass"
                  aria-hidden="true"
                />
                <span v-else class="font-bold">{{ option.name.charAt(0).toUpperCase() }}</span>
              </span>
              <span>{{ option.name }}</span>
            </div>
          </template>
        </MultiSelect>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Osoby</label>
        <MultiSelect
          v-model="selectedPeople"
          :options="peopleOptions"
          :option-label="userLabel"
          placeholder="Wszystkie osoby"
          :disabled="!isAdmin"
          :loading="loadingUsers"
          :max-selected-labels="1"
          class="w-full"
          :pt="ptSelectInField"
        >
          <template #value="{ value }">
            <div v-if="value?.length" class="flex items-center gap-2">
              <i class="pi pi-user text-surface-500 dark:text-surface-400" aria-hidden="true" />
              <span>{{ value.map(userLabel).join(', ') }}</span>
            </div>
            <span v-else>Wszystkie osoby</span>
          </template>
          <template #option="{ option }">
            <div class="flex items-center gap-2">
              <i class="pi pi-user text-surface-500" aria-hidden="true" />
              <span>{{ userLabel(option) }}</span>
            </div>
          </template>
        </MultiSelect>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Notatka</label>
        <InputText
          v-model="note"
          placeholder="Filtruj po słowie kluczowym"
          class="w-full"
          :pt="ptFieldInputText"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-surface-600 dark:text-surface-400">Kwota</label>
        <Slider v-model="range" range :min="amountMin" :max="amountMax" class="mt-2 w-full" />
        <div class="mt-2 flex justify-between text-xs tabular-nums text-surface-600 dark:text-surface-400">
          <span>{{ range[0] }}</span>
          <span>{{ range[1] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
