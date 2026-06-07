<script setup lang="ts">
  import { computed, ref } from 'vue';
  import Popover from 'primevue/popover';
  import { TRANSACTION_CATEGORY_ICON_OPTIONS } from '@/config/transactionCategoryIconOptions';
  import { TRANSACTION_CATEGORY_DEFAULT_COLOR } from '@/config/transactionCategoryColors';
  import { UtilsService } from '@/service/UtilsService';

  const props = defineProps<{
    invalid?: boolean;
    disabled?: boolean;
  }>();

  const model = defineModel<string>({ default: '' });

  const popoverRef = ref<InstanceType<typeof Popover> | null>(null);

  const selectedIconClass = computed(() => UtilsService.toPrimeIconClass(model.value));

  function toggle(event: Event) {
    if (props.disabled) return;
    popoverRef.value?.toggle(event);
  }

  function select(slug: string) {
    model.value = slug;
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
      <span
        class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm text-white"
        :class="selectedIconClass ? '' : 'border border-dashed border-surface-400 dark:border-surface-500'"
        :style="selectedIconClass ? { backgroundColor: TRANSACTION_CATEGORY_DEFAULT_COLOR } : undefined"
      >
        <i v-if="selectedIconClass" :class="selectedIconClass" aria-hidden="true" />
        <i v-else class="pi pi-circle text-surface-400 dark:text-surface-500" aria-hidden="true" />
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
          v-for="option in TRANSACTION_CATEGORY_ICON_OPTIONS"
          :key="option.slug"
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm text-white transition-transform hover:scale-105"
          :class="model === option.slug ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-0 dark:ring-offset-surface-950' : ''"
          :style="{ backgroundColor: TRANSACTION_CATEGORY_DEFAULT_COLOR }"
          :title="option.slug"
          @click="select(option.slug)"
        >
          <i :class="UtilsService.toPrimeIconClass(option.slug)" aria-hidden="true" />
        </button>
      </div>
    </Popover>
  </div>
</template>
