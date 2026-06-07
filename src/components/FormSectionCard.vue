<script setup lang="ts">
  import type { Component } from 'vue';

  defineProps<{
    title: string;
    icon: Component;
    description?: string;
  }>();
</script>

<template>
  <div
    class="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900 sm:p-5"
  >
    <div v-if="$slots['header-actions']" class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 class="flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
        <component :is="icon" class="h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
        <span>{{ title }}</span>
      </h2>
      <slot name="header-actions" />
    </div>
    <h2 v-else class="mb-4 flex items-center gap-2 text-lg font-medium text-surface-900 dark:text-surface-0">
      <component :is="icon" class="h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
      <span>{{ title }}</span>
    </h2>
    <p v-if="description" class="mb-4 text-sm text-surface-600 dark:text-surface-400">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
