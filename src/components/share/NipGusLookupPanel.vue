<script setup lang="ts">
  import OfficeButton from '@/components/OfficeButton.vue';
  import { useCompanyLookupStore } from '@/stores/companyLookup';
  import type { CompanyLookupResult } from '@/types/CompanyLookup';
  import { parsePolishNipInput } from '@/utils/applyCompanyLookupToParty';
  import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
  import { useToast } from 'primevue/usetoast';
  import type { AxiosError } from 'axios';
  import { ref } from 'vue';

  defineProps({
    title: {
      type: String,
      required: false,
      default: 'Dane z rejestru (GUS)',
    },
  });

  const emit = defineEmits<{
    filled: [payload: CompanyLookupResult];
  }>();

  const lookupStore = useCompanyLookupStore();
  const toast = useToast();

  const nipInput = ref('');

  const ptFieldInputText = {
    root: {
      class:
        'w-full rounded-lg border border-surface-300 bg-surface-0 text-surface-900 placeholder:text-surface-500 ' +
        'enabled:focus:border-primary enabled:focus:shadow-none enabled:focus:ring-0 ' +
        'dark:border-surface-600 dark:bg-surface-950 dark:text-surface-0 dark:placeholder:text-surface-400',
    },
  };

  async function searchByNip() {
    const nip = parsePolishNipInput(nipInput.value);
    if (!nip) {
      toast.add({
        severity: 'warn',
        summary: 'NIP',
        detail: 'Podaj poprawny NIP (10 cyfr).',
        life: 4000,
      });
      return;
    }
    try {
      const result = await lookupStore.lookupByNip(nip);
      emit('filled', result);
      toast.add({
        severity: 'success',
        summary: 'Rejestr',
        detail: 'Wypełniono dane z wyszukiwania.',
        life: 3000,
      });
    } catch (reason) {
      const err = reason as AxiosError<{ message?: string }>;
      const detail =
        err.response?.data?.message ??
        (err.code === 'ERR_NETWORK' ? 'Brak połączenia z serwerem.' : 'Nie udało się pobrać danych.');
      toast.add({
        severity: 'error',
        summary: 'Błąd wyszukiwania',
        detail,
        life: 5000,
      });
    }
  }
</script>

<template>
  <div
    class="mb-6 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5"
  >
    <h2 class="mb-1 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
      <MagnifyingGlassIcon class="h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
      <span>{{ title }}</span>
    </h2>
    <p class="mb-4 text-sm text-surface-600 dark:text-surface-400">
      Wpisz NIP i wybierz Szukaj, aby uzupełnić nazwę i adres z rejestru.
    </p>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div class="min-w-0 flex flex-1 flex-col gap-2">
        <label class="text-sm text-surface-600 dark:text-surface-400" for="nip-gus-lookup-input">NIP</label>
        <InputText
          id="nip-gus-lookup-input"
          v-model="nipInput"
          maxlength="13"
          placeholder="np. 1234567890"
          autocomplete="off"
          :pt="ptFieldInputText"
          class="w-full"
          @keyup.enter="searchByNip"
        />
      </div>
      <div class="flex shrink-0 justify-end sm:justify-start">
        <OfficeButton
          text="szukaj"
          btn-type="office-regular"
          type="button"
          :btn-disabled="lookupStore.loadingLookup"
          :loading="lookupStore.loadingLookup"
          @click="searchByNip"
        />
      </div>
    </div>
  </div>
</template>
