<script setup lang="ts">
  import { computed } from 'vue';
  import { ReadingStatus } from '@/types/Book.ts';

  const STEPS = [
    {
      value: ReadingStatus.NOT_READ,
      title: 'Planuję',
      subtitle: '(Nie przeczytana)',
    },
    {
      value: ReadingStatus.READ_NOW,
      title: 'W trakcie',
      subtitle: '(Czytana)',
    },
    {
      value: ReadingStatus.READ,
      title: 'Ukończona',
      subtitle: '(Przeczytana)',
    },
  ] as const;

  defineProps<{
    invalid?: boolean;
  }>();

  const model = defineModel<ReadingStatus>({ required: true });

  const activeIndex = computed(() => STEPS.findIndex(step => step.value === model.value));

  function select(value: ReadingStatus) {
    model.value = value;
  }

  function segmentClass(segmentIndex: number) {
    const idx = activeIndex.value >= 0 ? activeIndex.value : 0;
    return idx > segmentIndex
      ? 'h-1 w-full min-w-[1rem] rounded-full bg-primary'
      : 'h-0.5 w-full min-w-[1rem] rounded-full bg-primary/30 dark:bg-primary/20';
  }
</script>

<template>
  <div
    role="radiogroup"
    aria-label="Stan czytania"
    class="flex w-full items-center py-2"
    :class="{ 'rounded-lg p-1 ring-1 ring-red-500 dark:ring-red-400': invalid }"
  >
    <template v-for="(step, index) in STEPS" :key="step.value">
      <div class="flex min-w-0 flex-1 flex-col items-center justify-center">
        <button
          type="button"
          role="radio"
          :aria-checked="model === step.value"
          class="flex max-w-full flex-col items-center justify-center rounded-full border-2 border-primary text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0 dark:focus-visible:ring-offset-surface-950"
          :class="
            model === step.value
              ? 'z-10 aspect-square w-[min(100%,7rem)] border-primary bg-primary text-primary-contrast shadow-lg shadow-primary/40'
              : 'aspect-square w-[min(100%,5.5rem)] border-primary bg-transparent text-surface-700 dark:text-surface-200'
          "
          @click="select(step.value)"
        >
          <span class="px-1 text-xs font-semibold leading-tight sm:text-sm">{{ step.title }}</span>
          <span class="mt-0.5 px-0.5 text-[9px] leading-tight opacity-90 sm:text-[10px]">{{ step.subtitle }}</span>
        </button>
      </div>
      <div
        v-if="index < STEPS.length - 1"
        class="flex w-[14%] max-w-16 min-w-6 shrink-0 items-center self-center px-1"
        aria-hidden="true"
      >
        <div :class="segmentClass(index)" />
      </div>
    </template>
  </div>
</template>
