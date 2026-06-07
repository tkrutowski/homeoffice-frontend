<script setup lang="ts">
  import { computed, ref } from 'vue';
  import Popover from 'primevue/popover';
  import { TRANSACTION_CATEGORY_COLORS, TRANSACTION_CATEGORY_DEFAULT_COLOR } from '@/config/transactionCategoryColors';
  import { UtilsService } from '@/service/UtilsService';

  const props = defineProps<{
    invalid?: boolean;
    disabled?: boolean;
  }>();

  const model = defineModel<string>({ default: '' });

  const popoverRef = ref<InstanceType<typeof Popover> | null>(null);

  const displayColor = computed(
    () => UtilsService.normalizeHexColor(model.value) ?? TRANSACTION_CATEGORY_DEFAULT_COLOR
  );

  function toggle(event: Event) {
    if (props.disabled) return;
    popoverRef.value?.toggle(event);
  }

  function select(color: string) {
    model.value = color;
    popoverRef.value?.hide();
  }
</script>

<template>
  <div class="flex flex-col gap-1">
    <button
      type="button"
      class="flex h-[2.75rem] w-full min-w-[4.5rem] items-center justify-between gap-2 rounded-lg border px-3 transition-colors enabled:hover:border-surface-400 disabled:cursor-not-allowed disabled:opacity-60 dark:enabled:hover:border-surface-500"
      :class="
        invalid
          ? 'border-red-500 bg-surface-0 dark:border-red-400 dark:bg-surface-950'
          : 'border-surface-300 bg-surface-0 dark:border-surface-600 dark:bg-surface-950'
      "
      :disabled="disabled"
      @click="toggle"
    >
      <span class="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
        <span
          class="inline-flex h-7 w-7 items-center justify-center rounded-full"
          :style="{ backgroundColor: displayColor }"
        >
          <span class="h-2 w-2 rounded-full bg-white/90" />
        </span>
      </span>
      <i class="pi pi-chevron-down text-xs text-surface-500 dark:text-surface-400" aria-hidden="true" />
    </button>

    <Popover
      ref="popoverRef"
      class="border border-surface-200 bg-surface-0 dark:border-surface-700 dark:bg-surface-950"
      :pt="{ content: { class: 'p-2' } }"
    >
      <div class="grid max-h-56 w-56 grid-cols-3 gap-2 overflow-y-auto">
        <button
          v-for="color in TRANSACTION_CATEGORY_COLORS"
          :key="color"
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105"
          :class="
            displayColor === color
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-0 dark:ring-offset-surface-950'
              : ''
          "
          :style="{ backgroundColor: color }"
          :title="color"
          @click="select(color)"
        >
          <span class="h-2.5 w-2.5 rounded-full bg-white/90" />
        </button>
      </div>
    </Popover>
  </div>
</template>
