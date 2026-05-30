<script setup lang="ts">
  import OfficeIconButton from '@/components/OfficeIconButton.vue';
  import FormSectionCard from '@/components/FormSectionCard.vue';
  import { ptFieldInputTextInField } from '@/config/formFieldPt';
  import { LinkIcon } from '@heroicons/vue/24/outline';

  const searchUrl = defineModel<string>('searchUrl', { default: '' });

  defineProps<{
    showErrorUrl: boolean;
    loading: boolean;
    btnDisabled: boolean;
  }>();

  const emit = defineEmits<{
    search: [];
    searchAi: [];
  }>();
</script>

<template>
  <FormSectionCard
    title="Import z URL"
    :icon="LinkIcon"
    description="Wpisz adres URL książki i wybierz ikonę wyszukiwania, aby uzupełnić metadane i okładkę."
    class="mb-6"
  >
    <div class="flex flex-col gap-2">
      <label class="text-sm text-surface-600 dark:text-surface-400" for="book-url-lookup-input">URL</label>
      <div class="flex items-center gap-2">
        <div
          class="min-w-0 flex-1 overflow-hidden rounded-lg border border-surface-300 bg-surface-0 transition-colors focus-within:border-primary dark:border-surface-600 dark:bg-surface-950"
          :class="{ 'border-red-500 dark:border-red-400': showErrorUrl }"
        >
          <InputText
            id="book-url-lookup-input"
            v-model="searchUrl"
            placeholder="https://..."
            autocomplete="off"
            :pt="ptFieldInputTextInField"
            class="w-full"
            @keyup.enter="emit('search')"
          />
        </div>
        <OfficeIconButton
          title="Wyszukaj"
          icon="pi pi-search"
          class="h-11 w-11 shrink-0 p-0 text-primary"
          :loading="loading"
          :btn-disabled="btnDisabled"
          @click="emit('search')"
        />
        <OfficeIconButton
          title="Wyszukaj z AI"
          icon="pi pi-microchip-ai"
          class="h-11 w-11 shrink-0 p-0 text-primary"
          :loading="loading"
          :btn-disabled="btnDisabled"
          @click="emit('searchAi')"
        />
      </div>
      <small v-if="showErrorUrl" class="text-sm text-red-600 dark:text-red-400">
        Pole jest wymagane.
      </small>
    </div>
  </FormSectionCard>
</template>
