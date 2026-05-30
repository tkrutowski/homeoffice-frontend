<script setup lang="ts">
  export interface LibraryPillOption {
    value: string;
    label: string;
    icon: string;
  }

  defineProps<{
    options: LibraryPillOption[];
    invalid?: boolean;
  }>();

  const model = defineModel<string>({ required: true });

  function select(value: string) {
    model.value = value;
  }
</script>

<template>
  <div
    role="radiogroup"
    class="flex w-full gap-2"
    :class="{ 'rounded-lg p-1 ring-1 ring-red-500 dark:ring-red-400': invalid }"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="model === option.value"
      class="inline-flex min-w-0 flex-1 basis-0 items-center justify-between gap-2 rounded-full border px-3 py-2.5 text-sm font-medium transition-colors"
      :class="
        model === option.value
          ? 'border-primary bg-primary text-primary-contrast'
          : 'border-surface-300 bg-transparent text-surface-700 hover:border-surface-400 dark:border-surface-600 dark:text-surface-300 dark:hover:border-surface-500'
      "
      @click="select(option.value)"
    >
      <span>{{ option.label }}</span>
      <i :class="[option.icon, 'text-base shrink-0']" aria-hidden="true" />
    </button>
  </div>
</template>
