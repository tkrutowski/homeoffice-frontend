<script setup lang="ts">
  defineProps<{
    title: string;
    icon?: string;
    loading?: boolean;
    badge?: string;
    panelClass?: string;
  }>();
</script>

<template>
  <section
    class="flex flex-col overflow-hidden rounded-2xl border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-700 dark:bg-surface-950"
    :class="panelClass"
  >
    <header
      class="flex shrink-0 flex-wrap items-center gap-2 border-b border-surface-200 px-4 py-3 dark:border-surface-700 md:px-5"
    >
      <i
        v-if="icon"
        :class="[icon, 'text-primary']"
        class="text-lg"
        aria-hidden="true"
      />
      <h2 class="min-w-0 flex-1 text-base font-semibold text-surface-900 dark:text-surface-0">
        {{ title }}
      </h2>
      <span
        v-if="badge"
        class="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600 dark:bg-surface-800 dark:text-surface-400"
      >
        {{ badge }}
      </span>
      <slot name="header-end" />
    </header>

    <div class="min-h-0 flex-1 p-4 md:p-5">
      <div v-if="loading" class="flex flex-col gap-3">
        <Skeleton v-for="n in 4" :key="n" height="2.5rem" border-radius="0.5rem" />
      </div>
      <slot v-else />
    </div>
  </section>
</template>
